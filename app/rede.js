/* ERASÓ · camada de rede do navegador.
 *
 * Presença e sinalização passam pelo servidor local (server/servidor.mjs); os arquivos e textos viajam
 * DIRETAMENTE entre os dois navegadores por um canal de dados WebRTC (criptografado por DTLS). O servidor
 * nunca recebe o conteúdo.
 *
 * Nada aqui é simulado: se não houver servidor, aparelho ou conexão, o erro real é devolvido ao aplicativo.
 */
(function () {
  'use strict';

  const BLOCO = 16 * 1024;            // tamanho de cada pedaço enviado no canal
  const FILA_ALTA = 1024 * 1024;      // pausa o envio quando há mais que isso aguardando
  const FILA_BAIXA = 256 * 1024;
  const TAMANHO_MAXIMO = 2 * 1024 * 1024 * 1024; // o recebimento guarda o arquivo em memória até terminar
  const TEMPO_CONEXAO = 20000;
  const TEMPO_RESPOSTA = 120000;
  const TEMPO_CONFIRMACAO = 30000;
  const TENTATIVAS_PIN = 3;
  const BLOQUEIO_PIN = 60000;

  const tabela = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = (anterior, u8) => { let c = ~anterior >>> 0; for (let i = 0; i < u8.length; i++) c = tabela[(c ^ u8[i]) & 255] ^ (c >>> 8); return ~c >>> 0; };
  const aleatorio = (n = 12) => Array.from(crypto.getRandomValues(new Uint8Array(n / 2)), (b) => b.toString(16).padStart(2, '0')).join('');
  const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

  function perfilDoNavegador(ua = navigator.userAgent) {
    const so = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Mac OS X|Macintosh/.test(ua) ? 'macOS' : /CrOS/.test(ua) ? 'ChromeOS' : /Linux/.test(ua) ? 'Linux' : 'Sistema desconhecido';
    const nav = /Edg\//.test(ua) ? 'Edge' : /OPR\/|Opera/.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Navegador';
    const tipo = /iPad|Tablet/.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua)) ? 'tablet' : /Mobile|iPhone|Android/.test(ua) ? 'phone' : 'laptop';
    return { so, navegador: nav, tipo, modelo: '', meta: `${so} · ${nav}` };
  }

  /** Acrescenta o modelo do aparelho quando o navegador o informa (Chrome/Edge no Android). Os demais não expõem modelo nem nome da máquina. */
  async function detalharPerfil(p) {
    let m = '';
    try { const h = await (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues ? navigator.userAgentData.getHighEntropyValues(['model']) : null); m = ((h && h.model) || '').trim(); } catch { /* sem modelo */ }
    if (!m && p.so === 'Android') { const x = /Android[^;)]*;\s*([^;)]+)/.exec(navigator.userAgent); if (x) m = x[1].replace(/\s*Build\/.*$/, '').trim(); }
    if (m && m !== 'K' && m.toLowerCase() !== 'android') { p.modelo = m; p.meta = `${m} · ${p.so} · ${p.navegador}`; }
    return p;
  }

  /** Nome de fábrica: o que o aparelho realmente é (modelo ou sistema, navegador) e o fim do seu identificador. */
  const nomePadrao = (p, id) => `${p.modelo || p.so} · ${p.navegador} · ${String(id).slice(0, 4).toUpperCase()}`;

  /** Fecha o canal só depois de enviar o que está na fila (senão a mensagem de cancelamento/confirmação se perde). */
  function fecharCanal(dc, pc, fim) {
    const t0 = Date.now();
    const tentar = () => {
      const cheio = dc && dc.readyState === 'open' && dc.bufferedAmount > 0 && Date.now() - t0 < 8000;
      if (cheio) return setTimeout(tentar, 60);
      setTimeout(() => { try { dc && dc.close(); } catch { /* ok */ } try { pc && pc.close(); } catch { /* ok */ } fim && fim(); }, 300);
    };
    tentar();
  }

  /** Envio em andamento (lado de quem envia). */
  class Envio {
    constructor(rede, peer, itens) {
      this.rede = rede; this.id = aleatorio(8); this.peer = peer; this.itens = itens;
      this.total = itens.reduce((a, i) => a + (i.size || 0), 0); this.enviados = 0;
      this.status = 'conectando'; this.erro = ''; this.iniciado = Date.now();
      this.onstatus = null; this.onprogresso = null; this.onpin = null;
      this._cancelado = false; this._dc = null; this._pc = null; this._pular = new Set(); this._nomes = []; this._tempos = [];
    }
    _status(s, erro = '') { if (this.status === s || ['concluido', 'recusado', 'cancelado', 'falhou'].includes(this.status)) return; this.status = s; this.erro = erro; this.onstatus && this.onstatus(s, erro); }
    cancelar() {
      if (['concluido', 'recusado', 'cancelado', 'falhou'].includes(this.status)) return;
      this._cancelado = true;
      try { if (this._dc && this._dc.readyState === 'open') this._dc.send(JSON.stringify({ t: 'cancelar' })); } catch { /* canal já fechado */ }
      this._status('cancelado'); this._fechar();
    }
    enviarPin(pin) { this._pedido(pin); this._status('aguardando'); }
    _fechar() { this._tempos.forEach(clearTimeout); fecharCanal(this._dc, this._pc, () => this.rede._sessoes.delete(this._sessao)); }
    _pedido(pin) {
      const lista = this.itens.map((it, i) => ({ i, kind: it.kind, name: it.name, size: it.size || 0, body: it.body }));
      this._dc.send(JSON.stringify({ t: 'pedido', itens: lista, total: this.total, pin: pin || '' }));
      this._tempos.push(setTimeout(() => this._status('falhou', `${this.peer.nome} não respondeu ao pedido.`), TEMPO_RESPOSTA));
    }
  }

  class Rede {
    /**
     * @param {{base?:string, perfil:{id:string,nome:string,tipo:string,so:string}, visivel?:boolean,
     *   onStatus?:Function, onAparelhos?:Function, onPedido?:Function, log?:Function}} o
     */
    constructor(o) {
      this.base = o.base || ''; this.perfil = { ...o.perfil }; this.visivel = o.visivel !== false; this.sala = o.sala || ''; this.iceServers = []; this.config = { modo: 'local', salaObrigatoria: false }; this._token = ''; this._geracao = 0;
      this.onStatus = o.onStatus || (() => {}); this.onAparelhos = o.onAparelhos || (() => {}); this.onPedido = o.onPedido || (() => {}); this.log = o.log || (() => {});
      this.aparelhos = []; this.estado = 'desconectado'; this.pin = ''; this.verificarEnvio = true; this.verificarRecebimento = true;
      this._sessoes = new Map(); this._pinErros = new Map(); this._es = null;
    }

    // ---------- presença ----------
    conectar() {
      if (typeof RTCPeerConnection === 'undefined') { this._estado('sem-webrtc'); return; }
      this.desconectar();
      const geracao = ++this._geracao; this._estado('conectando');
      this._carregarConfig().then(() => {
        if (geracao !== this._geracao) return;
        if (this.config.salaObrigatoria && !this.sala) { this._estado('sem-sala'); return; }
        this._abrir();
      });
    }
    async _carregarConfig() {
      try { const r = await fetch(`${this.base}/api/config`, { cache: 'no-store' }); if (r.ok) { const c = await r.json(); this.config = { modo: c.modo, salaObrigatoria: !!c.salaObrigatoria }; this.iceServers = Array.isArray(c.iceServers) ? c.iceServers : []; } } catch { /* sem servidor: o EventSource mostra o erro */ }
    }
    _abrir() {
      const p = this.perfil, q = new URLSearchParams({ id: p.id, nome: p.nome, tipo: p.tipo, so: p.so, visivel: this.visivel ? '1' : '0', sala: this.sala });
      const es = new EventSource(`${this.base}/api/eventos?${q}`); this._es = es;
      es.onopen = () => this._estado('conectado');
      es.onerror = () => { if (es.readyState === 2) this._estado('desconectado'); else this._estado('reconectando'); };
      es.addEventListener('ola', (e) => { try { this._token = JSON.parse(e.data).token || ''; } catch { /* sem token */ } this._estado('conectado'); });
      es.addEventListener('substituido', () => { es.close(); this._es = null; this._estado('outra-aba'); });
      es.addEventListener('aparelhos', (e) => { this.aparelhos = JSON.parse(e.data).filter((a) => a.id !== p.id); this.onAparelhos(this.aparelhos); });
      es.addEventListener('sinal', (e) => this._sinalRecebido(JSON.parse(e.data)));
    }
    /** Entra numa sala (ou sai, com ''). Reconecta já na sala nova. */
    entrarNaSala(sala) { this.sala = sala || ''; this.aparelhos = []; this.onAparelhos([]); this.conectar(); }
    desconectar() { this._geracao++; if (this._es) { this._es.close(); this._es = null; } this._estado('desconectado'); }
    _estado(s) { if (this.estado === s) return; this.estado = s; this.log('info', `Conexão com o servidor: ${s}`); this.onStatus(s); }
    async atualizarPerfil(parcial) {
      Object.assign(this.perfil, parcial.nome !== undefined ? { nome: parcial.nome } : {}); if (parcial.visivel !== undefined) this.visivel = parcial.visivel;
      if (this.estado !== 'conectado') return;
      await this._post('/api/presenca', { id: this.perfil.id, nome: this.perfil.nome, visivel: this.visivel });
    }
    async buscar() {
      const r = await fetch(`${this.base}/api/aparelhos?sala=${encodeURIComponent(this.sala)}`, { cache: 'no-store' });
      if (!r.ok) throw new Error('O servidor local não respondeu.');
      this.aparelhos = (await r.json()).aparelhos.filter((a) => a.id !== this.perfil.id); this.onAparelhos(this.aparelhos); return this.aparelhos;
    }
    async _post(rota, corpo) {
      let r; try { r = await fetch(this.base + rota, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...corpo, token: this._token }) }); } catch { throw new Error('Sem conexão com o servidor local.'); }
      if (!r.ok) { let m = ''; try { m = (await r.json()).erro; } catch { /* sem corpo */ } throw new Error(m || `Erro ${r.status}`); }
    }
    _sinal(para, kind, sessao, dados) { return this._post('/api/sinal', { de: this.perfil.id, para, kind, sessao, dados }); }

    // ---------- conexão WebRTC ----------
    _novoPc(sessao, parceiro, aoFalhar) {
      const pc = new RTCPeerConnection({ iceServers: this.iceServers });
      pc.onicecandidate = (e) => { if (e.candidate) this._sinal(parceiro, 'ice', sessao, e.candidate).catch(() => {}); };
      pc.onconnectionstatechange = () => { if (pc.connectionState === 'failed') aoFalhar('Não foi possível abrir uma conexão direta. Confira se os dois aparelhos estão na mesma rede e se o roteador não isola os aparelhos entre si.'); };
      return pc;
    }
    async _sinalRecebido(m) {
      if (m.kind === 'oferta') return this._aceitarOferta(m);
      const s = this._sessoes.get(m.sessao); if (!s) return;
      if (m.kind === 'resposta' && s.pc) { try { await s.pc.setRemoteDescription(m.dados); s.remotoPronto = true; for (const c of s.fila) await s.pc.addIceCandidate(c).catch(() => {}); s.fila = []; } catch (e) { s.falhar && s.falhar('Resposta de conexão inválida.'); } }
      if (m.kind === 'ice' && s.pc) { if (s.remotoPronto) await s.pc.addIceCandidate(m.dados).catch(() => {}); else s.fila.push(m.dados); }
    }

    // ---------- enviar ----------
    /** @param {{id:string,nome:string,tipo:string}} peer  @param {{kind:string,name:string,size:number,file?:File,body?:string}[]} itens */
    enviar(peer, itens, opcoes = {}) {
      const envio = new Envio(this, peer, itens); const sessao = envio._sessao = aleatorio(10);
      const falhar = (msg) => { if (['concluido', 'recusado', 'cancelado', 'falhou'].includes(envio.status)) return; envio._status('falhou', msg); envio._fechar(); };
      const pc = envio._pc = this._novoPc(sessao, peer.id, falhar);
      const s = { pc, fila: [], remotoPronto: false, falhar }; this._sessoes.set(sessao, s);
      const dc = envio._dc = pc.createDataChannel('eraso', { ordered: true }); dc.binaryType = 'arraybuffer'; dc.bufferedAmountLowThreshold = FILA_BAIXA;
      envio._tempos.push(setTimeout(() => { if (envio.status === 'conectando') falhar('Não foi possível conectar a este aparelho a tempo. Confira se ele está na mesma rede e com o ERASÓ aberto.'); }, TEMPO_CONEXAO));
      dc.onopen = () => { envio._status('aguardando'); try { envio._pedido(opcoes.pin); } catch (e) { falhar('Falha ao enviar o pedido.'); } };
      dc.onclose = () => { if (!['concluido', 'recusado', 'cancelado', 'falhou'].includes(envio.status)) falhar(`A conexão com ${peer.nome} foi interrompida.`); };
      dc.onmessage = (e) => this._envioMsg(envio, e, opcoes);
      (async () => {
        try {
          const oferta = await pc.createOffer(); await pc.setLocalDescription(oferta);
          await this._sinal(peer.id, 'oferta', sessao, pc.localDescription);
        } catch (e) { falhar(e.message || 'Não foi possível iniciar a conexão.'); }
      })();
      return envio;
    }
    _envioMsg(envio, e, opcoes) {
      if (typeof e.data !== 'string') return;
      let m; try { m = JSON.parse(e.data); } catch { return; }
      envio._tempos.forEach(clearTimeout); envio._tempos = [];
      if (m.t === 'resposta') {
        if (m.ok) { envio._pular = new Set(m.pular || []); envio._nomes = m.nomes || []; envio._status('transferindo'); this._transmitir(envio, opcoes).catch((err) => { if (!envio._cancelado) { envio._status('falhou', err.message || 'Falha durante o envio.'); envio._fechar(); } }); }
        else if (m.motivo === 'pin') { envio._status('pin', ''); envio.restam = m.restam; envio.onpin && envio.onpin(m.restam); }
        else if (m.motivo === 'bloqueado') { envio._status('falhou', `${envio.peer.nome} bloqueou novas tentativas de PIN por 1 minuto.`); envio._fechar(); }
        else if (m.motivo === 'grande') { envio._status('falhou', `${envio.peer.nome} não aceita arquivos deste tamanho (limite de ${Math.round(TAMANHO_MAXIMO / 1e9)} GB).`); envio._fechar(); }
        else if (m.motivo === 'oculto') { envio._status('falhou', `${envio.peer.nome} está oculto e não recebe pedidos agora.`); envio._fechar(); }
        else { envio._status('recusado'); envio._fechar(); }
      } else if (m.t === 'cancelar') { envio._status('cancelado'); envio._fechar(); }
      else if (m.t === 'confirmado') { envio.enviados = envio.total; envio.onprogresso && envio.onprogresso(envio.enviados, envio.total); envio._status('concluido'); envio._fechar(); }
      else if (m.t === 'erro') { envio._status('falhou', m.mensagem || 'O destino informou um erro.'); envio._fechar(); }
    }
    async _transmitir(envio, opcoes) {
      const dc = envio._dc;
      const esperar = () => dc.bufferedAmount > FILA_ALTA ? new Promise((r) => { dc.onbufferedamountlow = () => { dc.onbufferedamountlow = null; r(); }; }) : null;
      for (let i = 0; i < envio.itens.length; i++) {
        if (envio._cancelado) return;
        const it = envio.itens[i]; if (envio._pular.has(i) || it.kind === 'text' || it.kind === 'link') continue;
        dc.send(JSON.stringify({ t: 'arquivo', i, nome: envio._nomes[i] || it.name, tam: it.file.size }));
        let desloc = 0, crc = 0; const verificar = this.verificarEnvio;
        while (desloc < it.file.size) {
          if (envio._cancelado || dc.readyState !== 'open') return;
          const bloco = new Uint8Array(await it.file.slice(desloc, desloc + BLOCO * 16).arrayBuffer());
          if (verificar) crc = crc32(crc, bloco);
          for (let o = 0; o < bloco.length; o += BLOCO) {
            const espera = esperar(); if (espera) await espera;
            if (envio._cancelado || dc.readyState !== 'open') return;
            const parte = bloco.subarray(o, o + BLOCO); dc.send(parte);
            envio.enviados += parte.length;
          }
          desloc += bloco.length; envio.onprogresso && envio.onprogresso(Math.max(0, envio.enviados - dc.bufferedAmount), envio.total);
        }
        dc.send(JSON.stringify({ t: 'fim', i, crc: verificar ? crc : null }));
      }
      dc.send(JSON.stringify({ t: 'pronto' }));
      envio._tempos.push(setTimeout(() => { if (envio.status === 'transferindo') { envio._status('falhou', `${envio.peer.nome} não confirmou o recebimento.`); envio._fechar(); } }, TEMPO_CONFIRMACAO + envio.total / 1e6 * 200));
    }

    // ---------- receber ----------
    async _aceitarOferta(m) {
      if (this._sessoes.has(m.sessao)) return;
      const parceiro = { id: m.de, nome: m.nome, tipo: m.tipo, so: m.so };
      const falhar = (msg) => { const s = this._sessoes.get(m.sessao); s && s.rec && s.rec._falhou(msg); try { pc.close(); } catch { /* ok */ } };
      const pc = this._novoPc(m.sessao, m.de, falhar);
      const s = { id: m.sessao, pc, fila: [], remotoPronto: false, falhar, parceiro, rec: null }; this._sessoes.set(m.sessao, s);
      pc.ondatachannel = (ev) => { const dc = ev.channel; dc.binaryType = 'arraybuffer'; s.dc = dc; dc.onmessage = (e) => this._recebimentoMsg(m.sessao, s, e); dc.onclose = () => { if (s.rec) s.rec._canalFechado(); this._sessoes.delete(m.sessao); }; };
      try {
        await pc.setRemoteDescription(m.dados); s.remotoPronto = true;
        for (const c of s.fila) await pc.addIceCandidate(c).catch(() => {}); s.fila = [];
        const resp = await pc.createAnswer(); await pc.setLocalDescription(resp);
        await this._sinal(m.de, 'resposta', m.sessao, pc.localDescription);
      } catch (e) { this.log('error', `Falha ao responder à conexão de ${parceiro.nome}: ${e.message}`); try { pc.close(); } catch { /* ok */ } this._sessoes.delete(m.sessao); }
    }
    _recebimentoMsg(sessao, s, e) {
      if (typeof e.data !== 'string') { if (s.rec) s.rec._bytes(new Uint8Array(e.data)); return; }
      let m; try { m = JSON.parse(e.data); } catch { return; }
      if (m.t === 'ping') { s.dc.send(JSON.stringify({ t: 'pong', ts: m.ts })); return; }
      if (m.t === 'pedido') return this._pedido(sessao, s, m);
      if (!s.rec) return;
      if (m.t === 'cancelar') s.rec._cancelado();
      else if (m.t === 'arquivo') s.rec._arquivo(m);
      else if (m.t === 'fim') s.rec._fim(m);
      else if (m.t === 'pronto') s.rec._pronto();
    }
    _pedido(sessao, s, m) {
      const resp = (o) => s.dc.send(JSON.stringify({ t: 'resposta', ...o }));
      const id = s.parceiro.id, agora = Date.now(), reg = this._pinErros.get(id) || { n: 0, ate: 0 };
      if (!this.visivel) return resp({ ok: false, motivo: 'oculto' });
      if (m.total > TAMANHO_MAXIMO) return resp({ ok: false, motivo: 'grande' });
      if (this.pin) {
        if (reg.ate > agora) return resp({ ok: false, motivo: 'bloqueado' });
        if (m.pin !== this.pin) { reg.n++; if (reg.n >= TENTATIVAS_PIN) { reg.n = 0; reg.ate = agora + BLOQUEIO_PIN; this._pinErros.set(id, reg); this.log('warn', `PIN incorreto de ${s.parceiro.nome}: bloqueado por 1 minuto`); return resp({ ok: false, motivo: 'bloqueado' }); } this._pinErros.set(id, reg); this.log('warn', `PIN incorreto de ${s.parceiro.nome}`); return resp({ ok: false, motivo: 'pin', restam: TENTATIVAS_PIN - reg.n }); }
        this._pinErros.delete(id);
      }
      const rec = s.rec = new Recebimento(this, s, m);
      this.onPedido(rec);
    }

    // ---------- teste de conexão (diagnóstico) ----------
    async testarConexao(peer) {
      const sessao = aleatorio(10), t0 = performance.now();
      return new Promise((ok, erro) => {
        let fim = false; const acabar = (f, v) => { if (fim) return; fim = true; clearTimeout(tm); try { dc.close(); pc.close(); } catch { /* ok */ } this._sessoes.delete(sessao); f(v); };
        const pc = this._novoPc(sessao, peer.id, (msg) => acabar(erro, new Error(msg)));
        this._sessoes.set(sessao, { pc, fila: [], remotoPronto: false, falhar: (msg) => acabar(erro, new Error(msg)) });
        const dc = pc.createDataChannel('eraso'); const tm = setTimeout(() => acabar(erro, new Error('Sem resposta em 10 segundos.')), 10000);
        dc.onopen = () => dc.send(JSON.stringify({ t: 'ping', ts: performance.now() }));
        dc.onmessage = (e) => { try { if (JSON.parse(e.data).t === 'pong') acabar(ok, Math.round(performance.now() - t0)); } catch { /* ignorar */ } };
        pc.createOffer().then((o) => pc.setLocalDescription(o)).then(() => this._sinal(peer.id, 'oferta', sessao, pc.localDescription)).catch((e) => acabar(erro, e));
      });
    }
  }

  /** Pedido recebido (lado de quem recebe). O aplicativo decide: aceitar() ou recusar(). */
  class Recebimento {
    constructor(rede, sessao, m) {
      this.rede = rede; this._s = sessao; this.id = aleatorio(8); this.peer = sessao.parceiro; this.itens = m.itens; this.total = m.total;
      this.status = 'pendente'; this.recebidos = 0; this.erro = '';
      this.onstatus = null; this.onprogresso = null; this.onarquivo = null; this.ontexto = null;
      this._pular = new Set(); this._nomes = []; this._atual = null; this._pendentes = 0;
    }
    _status(s, erro = '') { if (this.status === s || ['concluido', 'recusado', 'cancelado', 'falhou'].includes(this.status)) return; this.status = s; this.erro = erro; this.onstatus && this.onstatus(s, erro); }
    recusar() { this._s.dc.send(JSON.stringify({ t: 'resposta', ok: false, motivo: 'recusado' })); this._status('recusado'); this._fechar(); }
    /** @param {{pular?:Set<number>|number[], nomes?:string[]}} o */
    aceitar(o = {}) {
      this._pular = new Set(o.pular || []); this._nomes = o.nomes || [];
      const aceitos = this.itens.filter((it) => !this._pular.has(it.i)); this.totalAceito = aceitos.reduce((a, i) => a + (i.size || 0), 0);
      this._status('transferindo');
      this._s.dc.send(JSON.stringify({ t: 'resposta', ok: true, pular: [...this._pular], nomes: this._nomes }));
      for (const it of aceitos) if ((it.kind === 'text' || it.kind === 'link') && this.ontexto) this.ontexto(it);
      if (!aceitos.some((it) => it.kind !== 'text' && it.kind !== 'link')) this._pronto();
    }
    cancelar() { if (['concluido', 'recusado', 'cancelado', 'falhou'].includes(this.status)) return; try { this._s.dc.send(JSON.stringify({ t: 'cancelar' })); } catch { /* ok */ } this._status('cancelado'); this._fechar(); }
    _fechar() { fecharCanal(this._s.dc, this._s.pc, () => this.rede._sessoes.delete(this._s.id)); }
    _falhou(msg) { this._status('falhou', msg); }
    _canalFechado() { if (!['concluido', 'recusado', 'cancelado', 'falhou'].includes(this.status)) this._status('falhou', `A conexão com ${this.peer.nome} foi interrompida.`); }
    _cancelado() { this._atual = null; this._status('cancelado'); this._fechar(); }
    _arquivo(m) { this._atual = { i: m.i, nome: this._nomes[m.i] || m.nome, tam: m.tam, partes: [], n: 0, crc: 0 }; }
    _bytes(u8) {
      const a = this._atual; if (!a) return;
      a.partes.push(u8); a.n += u8.length; this.recebidos += u8.length; if (this.rede.verificarRecebimento) a.crc = crc32(a.crc, u8);
      this.onprogresso && this.onprogresso(this.recebidos, this.totalAceito);
    }
    _fim(m) {
      const a = this._atual; this._atual = null; if (!a) return;
      if (a.n !== a.tam) return this._erro(`O arquivo "${a.nome}" chegou incompleto (${a.n} de ${a.tam} bytes).`);
      if (this.rede.verificarRecebimento && m.crc != null && m.crc !== a.crc) return this._erro(`O arquivo "${a.nome}" chegou com defeito (a verificação de integridade falhou).`);
      const blob = new Blob(a.partes); a.partes = [];
      const verificado = !!(this.rede.verificarRecebimento && m.crc != null); // só vale se os dois lados ligaram a conferência
      this.onarquivo && this.onarquivo({ i: a.i, nome: a.nome, tamanho: a.tam, blob, verificado });
    }
    _erro(msg) { try { this._s.dc.send(JSON.stringify({ t: 'erro', mensagem: msg })); } catch { /* ok */ } this._status('falhou', msg); this._fechar(); }
    _pronto() { this.onprogresso && this.onprogresso(this.totalAceito, this.totalAceito); try { this._s.dc.send(JSON.stringify({ t: 'confirmado' })); } catch { /* ok */ } this._status('concluido'); this._fechar(); }
  }

  window.ErasoRede = { Rede, perfilDoNavegador, detalharPerfil, nomePadrao, aleatorio, crc32, limites: { TAMANHO_MAXIMO, TENTATIVAS_PIN } };
})();
