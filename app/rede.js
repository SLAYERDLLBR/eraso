/* ERASÓ · camada de rede do navegador.
 *
 * Presença e sinalização passam pelo servidor local (server/servidor.mjs); os arquivos e textos viajam
 * DIRETAMENTE entre os dois navegadores por um canal de dados WebRTC (criptografado por DTLS). O servidor
 * nunca recebe o conteúdo.
 *
 * Sem servidor (por exemplo, no GitHub Pages) os aparelhos se encontram por PAREAMENTO MANUAL: um aparelho gera um
 * código (texto, link ou QR Code) com os dados da conexão, o outro o aplica e devolve um código de resposta. Depois
 * disso a conexão fica aberta e cada envio usa um canal de dados novo dentro dela.
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

  // ---------- pareamento manual: o que vai no código ----------
  // O código leva só o necessário para a outra ponta reconstruir a descrição da conexão (SDP): credenciais ICE,
  // impressão digital DTLS, candidatos de rede e o perfil do aparelho. Tudo é validado campo a campo antes de montar o SDP.
  const STUN_PADRAO = [{ urls: ['stun:stun.cloudflare.com:3478'] }];
  const LIMITE_CODIGO = 4000;
  const RE = { ufrag: /^[A-Za-z0-9+/]{4,256}$/, pwd: /^[A-Za-z0-9+/]{16,256}$/, fp: /^[0-9a-f]{64}$/, host: /^[A-Za-z0-9.:-]{2,255}$/, fund: /^[A-Za-z0-9+/]{1,32}$/ };

  function extrairSdp(sdp) {
    const g = (re) => { const m = re.exec(sdp); return m ? m[1] : ''; };
    const c = [];
    for (const m of sdp.matchAll(/a=candidate:(\S+) (\d+) (\w+) (\d+) (\S+) (\d+) typ (\w+)/g)) { if (m[2] !== '1' || m[3].toLowerCase() !== 'udp' || m[7] === 'prflx') continue; c.push([m[1], +m[4], m[5], +m[6], m[7][0]]); }
    c.sort((a, b) => (a[4] === 'h' ? 0 : a[4] === 's' ? 1 : 2) - (b[4] === 'h' ? 0 : b[4] === 's' ? 1 : 2));
    return { u: g(/a=ice-ufrag:(\S+)/), w: g(/a=ice-pwd:(\S+)/), f: g(/a=fingerprint:sha-256 (\S+)/).replace(/:/g, '').toLowerCase(), c: c.slice(0, 8) };
  }
  function validarCarga(c, tipo) {
    if (!c || c.v !== 1 || c.t !== tipo) throw new Error('Este código não é válido ou é de outro tipo.');
    if (!RE.ufrag.test(c.u) || !RE.pwd.test(c.w) || !RE.fp.test(c.f)) throw new Error('O código está incompleto ou foi alterado.');
    if (!Array.isArray(c.c) || !c.c.length || c.c.length > 8) throw new Error('O código não traz endereços de rede utilizáveis.');
    for (const x of c.c) if (!Array.isArray(x) || !RE.fund.test(String(x[0])) || !Number.isInteger(x[1]) || x[1] < 0 || !RE.host.test(String(x[2])) || !Number.isInteger(x[3]) || x[3] < 1 || x[3] > 65535 || !'hsr'.includes(x[4])) throw new Error('O código tem um endereço de rede inválido.');
    if (!Array.isArray(c.p) || !/^[a-f0-9]{8,32}$/.test(String(c.p[0])) || !['phone', 'tablet', 'laptop', 'monitor', 'browser'].includes(c.p[2])) throw new Error('O código não identifica o aparelho.');
    const limpo = (v, max) => String(v || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, max);
    return { id: String(c.p[0]), nome: limpo(c.p[1], 60) || 'Aparelho', tipo: c.p[2], so: limpo(c.p[3], 80) };
  }
  function montarSdp(tipo, c) {
    const tp = { h: 'host', s: 'srflx', r: 'relay' };
    return ['v=0', 'o=- ' + Date.now() + ' 2 IN IP4 127.0.0.1', 's=-', 't=0 0', 'a=group:BUNDLE 0', 'a=msid-semantic: WMS', 'm=application 9 UDP/DTLS/SCTP webrtc-datachannel', 'c=IN IP4 0.0.0.0',
      'a=ice-ufrag:' + c.u, 'a=ice-pwd:' + c.w, 'a=fingerprint:sha-256 ' + c.f.toUpperCase().replace(/(..)(?!$)/g, '$1:'), 'a=setup:' + (tipo === 'offer' ? 'actpass' : 'active'), 'a=mid:0', 'a=sctp-port:5000', 'a=max-message-size:262144',
      ...c.c.map((x) => `a=candidate:${x[0]} 1 udp ${x[1]} ${x[2]} ${x[3]} typ ${tp[x[4]]}`), 'a=end-of-candidates'].join('\r\n') + '\r\n';
  }
  const b64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const deB64 = (t) => { const s = atob(t.replace(/-/g, '+').replace(/_/g, '/')); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; };
  async function fluxo(u8, Classe) { const f = new Classe('deflate-raw'), w = f.writable.getWriter(); w.write(u8).catch(() => {}); w.close().catch(() => {}); return new Uint8Array(await new Response(f.readable).arrayBuffer()); }
  /** objeto → texto curto "E1.z…" (comprimido, quando o navegador permite) */
  async function codificar(obj) {
    const u8 = new TextEncoder().encode(JSON.stringify(obj));
    if (typeof CompressionStream !== 'undefined') return 'E1.z' + b64(await fluxo(u8, CompressionStream));
    return 'E1.p' + b64(u8);
  }
  /** aceita o código puro, um link com #p=… ou texto com espaços e quebras de linha no meio */
  async function decodificar(texto) {
    let t = String(texto || '').trim(); const m = /[#?&]p=([A-Za-z0-9._-]+)/.exec(t); if (m) t = m[1];
    t = t.replace(/\s+/g, ''); if (!t) throw new Error('Cole um código ou link primeiro.'); if (t.length > LIMITE_CODIGO) throw new Error('O código é grande demais.');
    const r = /^E1\.([zp])([A-Za-z0-9_-]+)$/.exec(t); if (!r) throw new Error('Isto não parece um código do ERASÓ. Ele começa com "E1.".');
    try {
      let u8 = deB64(r[2]);
      if (r[1] === 'z') { if (typeof DecompressionStream === 'undefined') throw new Error('Este navegador não consegue abrir o código comprimido. Use um navegador atual.'); u8 = await fluxo(u8, DecompressionStream); }
      return JSON.parse(new TextDecoder().decode(u8));
    } catch (e) { if (/navegador não consegue/.test(e.message)) throw e; throw new Error('O código está incompleto ou foi alterado. Copie-o de novo, inteiro.'); }
  }

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
      this._sessoes = new Map(); this._pinErros = new Map(); this._es = null; this._ligacoes = new Map(); this._convites = new Set();
    }

    // ---------- presença ----------
    conectar() {
      if (typeof RTCPeerConnection === 'undefined') { this._estado('sem-webrtc'); return; }
      this.desconectar();
      const geracao = ++this._geracao; this._estado('conectando');
      this._carregarConfig().then(() => {
        if (geracao !== this._geracao) return;
        if (this.config.modo === 'manual') { this._estado('manual'); this._anunciar(); return; }
        if (this.config.salaObrigatoria && !this.sala) { this._estado('sem-sala'); return; }
        this._abrir();
      });
    }
    async _carregarConfig() {
      try {
        const r = await fetch(`${this.base}/api/config`, { cache: 'no-store' });
        let c = null; if (r.ok && /json/.test(r.headers.get('content-type') || '')) { try { c = await r.json(); } catch { c = null; } }
        if (c) { this.config = { modo: c.modo, salaObrigatoria: !!c.salaObrigatoria }; this.iceServers = Array.isArray(c.iceServers) ? c.iceServers : []; }
        else if (r.status === 404 || r.status === 405 || r.ok) { this.config = { modo: 'manual', salaObrigatoria: false }; this.iceServers = STUN_PADRAO; } // este endereço não tem servidor do ERASÓ (ex.: GitHub Pages)
      } catch { /* sem rede ou servidor fora do ar: o EventSource mostra o erro */ }
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
      if (this.estado === 'manual') { for (const l of this._ligacoes.values()) { try { l.ctl.send(JSON.stringify({ t: 'perfil', nome: this.perfil.nome })); } catch { /* ligação fechada */ } } return; }
      if (this.estado !== 'conectado') return;
      await this._post('/api/presenca', { id: this.perfil.id, nome: this.perfil.nome, visivel: this.visivel });
    }
    async buscar() {
      if (this.estado === 'manual') { this._anunciar(); return this.aparelhos; }
      const r = await fetch(`${this.base}/api/aparelhos?sala=${encodeURIComponent(this.sala)}`, { cache: 'no-store' });
      if (!r.ok) throw new Error('O servidor local não respondeu.');
      this.aparelhos = (await r.json()).aparelhos.filter((a) => a.id !== this.perfil.id); this.onAparelhos(this.aparelhos); return this.aparelhos;
    }
    async _post(rota, corpo) {
      let r; try { r = await fetch(this.base + rota, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...corpo, token: this._token }) }); } catch { throw new Error('Sem conexão com o servidor local.'); }
      if (!r.ok) { let m = ''; try { m = (await r.json()).erro; } catch { /* sem corpo */ } throw new Error(m || `Erro ${r.status}`); }
    }
    _sinal(para, kind, sessao, dados) { return this._post('/api/sinal', { de: this.perfil.id, para, kind, sessao, dados }); }

    // ---------- pareamento manual (sem servidor) ----------
    _anunciar() { this.aparelhos = [...this._ligacoes.values()].map((l) => ({ ...l.perfil })); this.onAparelhos(this.aparelhos); }
    _perfilDoCodigo() { const p = this.perfil; return [p.id, p.nome, p.tipo, p.so]; }
    _aguardarCandidatos(pc, ms = 4000) {
      return new Promise((ok) => {
        if (pc.iceGatheringState === 'complete') return ok();
        const fim = () => { clearTimeout(t); clearInterval(iv); pc.removeEventListener('icegatheringstatechange', ch); ok(); };
        const ch = () => { if (pc.iceGatheringState === 'complete') fim(); }; const t = setTimeout(fim, ms); pc.addEventListener('icegatheringstatechange', ch);
        // com o endereço público já descoberto (STUN), não há por que esperar o restante
        const iv = setInterval(() => { if (/ typ srflx /.test((pc.localDescription && pc.localDescription.sdp) || '')) fim(); }, 250);
      });
    }
    /** Lado que começa: devolve o convite (com o código) e espera a resposta do outro aparelho. */
    async criarConvite() {
      if (typeof RTCPeerConnection === 'undefined') throw new Error('Este navegador não permite conexão direta entre aparelhos.');
      const pc = new RTCPeerConnection({ iceServers: this.iceServers }), ctl = pc.createDataChannel('ctl'); const convite = { estado: 'aguardando', perfil: null, onestado: null, codigo: '' };
      const falhar = (msg) => { if (['ligado', 'falhou', 'cancelado'].includes(convite.estado)) return; convite.estado = 'falhou'; convite.erro = msg; this._convites.delete(convite); try { pc.close(); } catch { /* ok */ } convite.onestado && convite.onestado('falhou', msg); };
      convite.cancelar = () => { if (convite.estado === 'ligado') return; convite.estado = 'cancelado'; this._convites.delete(convite); try { pc.close(); } catch { /* ok */ } convite.onestado && convite.onestado('cancelado'); };
      try {
        await pc.setLocalDescription(await pc.createOffer()); await this._aguardarCandidatos(pc);
        const d = extrairSdp(pc.localDescription.sdp); if (!d.c.length) throw new Error('Não foi possível descobrir o endereço de rede deste aparelho. Confira se há conexão com a rede.');
        convite.codigo = await codificar({ v: 1, t: 'o', p: this._perfilDoCodigo(), ...d });
      } catch (e) { try { pc.close(); } catch { /* ok */ } throw e; }
      this._convites.add(convite);
      /** Aplica o código de resposta do outro aparelho. */
      convite.aplicarResposta = async (texto) => {
        if (convite.estado !== 'aguardando') throw new Error('Este convite já foi usado ou cancelado. Crie outro.');
        const c = await decodificar(texto); const perfil = validarCarga(c, 'r');
        if (perfil.id === this.perfil.id) throw new Error('Este código é do próprio aparelho.');
        await pc.setRemoteDescription({ type: 'answer', sdp: montarSdp('answer', c) });
        convite.perfil = perfil; convite.estado = 'conectando'; convite.onestado && convite.onestado('conectando');
        const tempo = setTimeout(() => falhar('Os aparelhos não conseguiram se conectar. Confira se o outro aparelho aplicou o seu código e se a rede permite a conexão direta.'), 30000);
        ctl.onopen = () => { clearTimeout(tempo); this._ligar(pc, ctl, perfil); convite.estado = 'ligado'; this._convites.delete(convite); convite.onestado && convite.onestado('ligado'); };
        pc.onconnectionstatechange = () => { if (pc.connectionState === 'failed') { clearTimeout(tempo); falhar('A conexão direta não abriu. Redes com isolamento de aparelhos, VPN ou firewall podem impedir.'); } };
        return perfil;
      };
      return convite;
    }
    /** Lado que responde: aplica o código do convite e devolve a resposta (com o código a mostrar ao outro aparelho). */
    async responderConvite(texto) {
      if (typeof RTCPeerConnection === 'undefined') throw new Error('Este navegador não permite conexão direta entre aparelhos.');
      const c = await decodificar(texto); const perfil = validarCarga(c, 'o');
      if (perfil.id === this.perfil.id) throw new Error('Este código é do próprio aparelho. Abra-o no outro aparelho.');
      const pc = new RTCPeerConnection({ iceServers: this.iceServers }); const resposta = { estado: 'aguardando', perfil, codigo: '', onestado: null };
      const falhar = (msg) => { if (['ligado', 'falhou', 'cancelado'].includes(resposta.estado)) return; resposta.estado = 'falhou'; resposta.erro = msg; try { pc.close(); } catch { /* ok */ } resposta.onestado && resposta.onestado('falhou', msg); };
      resposta.cancelar = () => { if (resposta.estado === 'ligado') return; resposta.estado = 'cancelado'; try { pc.close(); } catch { /* ok */ } resposta.onestado && resposta.onestado('cancelado'); };
      let tempo = null;
      pc.ondatachannel = (ev) => {
        const dc = ev.channel;
        if (dc.label === 'ctl') { const abrir = () => { clearTimeout(tempo); this._ligar(pc, dc, perfil); resposta.estado = 'ligado'; resposta.onestado && resposta.onestado('ligado'); }; if (dc.readyState === 'open') abrir(); else dc.onopen = abrir; }
      };
      pc.onconnectionstatechange = () => { if (pc.connectionState === 'failed') { clearTimeout(tempo); falhar('A conexão direta não abriu. Redes com isolamento de aparelhos, VPN ou firewall podem impedir.'); } };
      try {
        await pc.setRemoteDescription({ type: 'offer', sdp: montarSdp('offer', c) });
        await pc.setLocalDescription(await pc.createAnswer()); await this._aguardarCandidatos(pc);
        const d = extrairSdp(pc.localDescription.sdp); if (!d.c.length) throw new Error('Não foi possível descobrir o endereço de rede deste aparelho. Confira se há conexão com a rede.');
        resposta.codigo = await codificar({ v: 1, t: 'r', p: this._perfilDoCodigo(), ...d });
      } catch (e) { try { pc.close(); } catch { /* ok */ } throw e; }
      tempo = setTimeout(() => falhar('O outro aparelho não aplicou a sua resposta a tempo. Gere um novo código e tente de novo.'), 120000);
      return resposta;
    }
    /** Registra uma ligação aberta e passa a tratar os canais de envio que chegarem por ela. */
    _ligar(pc, ctl, perfil) {
      const antiga = this._ligacoes.get(perfil.id); if (antiga) { try { antiga.pc.close(); } catch { /* ok */ } }
      const l = { pc, ctl, perfil, vivo: true }; this._ligacoes.set(perfil.id, l);
      const remover = () => { if (!l.vivo) return; l.vivo = false; clearInterval(bat); if (this._ligacoes.get(perfil.id) === l) { this._ligacoes.delete(perfil.id); this.log('info', `Ligação com ${perfil.nome} encerrada`); this._anunciar(); } try { pc.close(); } catch { /* ok */ } };
      const bat = setInterval(() => { try { ctl.send('{"t":"oi"}'); } catch { remover(); } }, 10000);
      ctl.onclose = remover;
      ctl.onmessage = (e) => { try { const m = JSON.parse(e.data); if (m.t === 'perfil' && typeof m.nome === 'string') { l.perfil.nome = m.nome.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 60) || l.perfil.nome; this._anunciar(); } else if (m.t === 'tchau') remover(); } catch { /* ignorar */ } };
      let queda = null;
      pc.onconnectionstatechange = () => { const e = pc.connectionState; clearTimeout(queda); if (e === 'failed' || e === 'closed') remover(); else if (e === 'disconnected') queda = setTimeout(remover, 8000); };
      pc.ondatachannel = (ev) => { const dc = ev.channel; if (dc.label === 'ctl') return; this._canalEntrada(dc.label.replace(/^[a-z]:/, '') || aleatorio(10), dc, perfil); };
      this._anunciar(); this.log('info', `Ligação com ${perfil.nome} aberta`);
    }
    /** Desfaz a ligação com um aparelho pareado. */
    desligar(id) { const l = this._ligacoes.get(id); if (!l) return; try { l.ctl.send('{"t":"tchau"}'); } catch { /* ok */ } setTimeout(() => { try { l.ctl.close(); } catch { /* ok */ } }, 150); }
    _canalEntrada(sessao, dc, parceiro) {
      const s = { id: sessao, pc: null, fila: [], remotoPronto: true, falhar: () => {}, parceiro, rec: null, dc };
      this._sessoes.set(sessao, s); this._ligarCanalEntrada(sessao, s, dc);
    }
    _ligarCanalEntrada(sessao, s, dc) {
      dc.binaryType = 'arraybuffer'; s.dc = dc;
      dc.onmessage = (e) => this._recebimentoMsg(sessao, s, e);
      dc.onclose = () => { if (s.rec) s.rec._canalFechado(); this._sessoes.delete(sessao); };
    }

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
      const lig = this._ligacoes.get(peer.id);
      if (this.estado === 'manual' && !lig) { setTimeout(() => falhar(`${peer.nome} não está mais ligado a este aparelho. Pareie de novo.`), 0); return envio; }
      const pc = envio._pc = lig ? null : this._novoPc(sessao, peer.id, falhar);
      const s = { pc, fila: [], remotoPronto: false, falhar }; this._sessoes.set(sessao, s);
      const dc = envio._dc = (lig ? lig.pc : pc).createDataChannel(lig ? 's:' + sessao : 'eraso', { ordered: true }); dc.binaryType = 'arraybuffer'; dc.bufferedAmountLowThreshold = FILA_BAIXA;
      envio._tempos.push(setTimeout(() => { if (envio.status === 'conectando') falhar('Não foi possível conectar a este aparelho a tempo. Confira se ele está na mesma rede e com o ERASÓ aberto.'); }, TEMPO_CONEXAO));
      dc.onopen = () => { envio._status('aguardando'); try { envio._pedido(opcoes.pin); } catch (e) { falhar('Falha ao enviar o pedido.'); } };
      dc.onclose = () => { if (!['concluido', 'recusado', 'cancelado', 'falhou'].includes(envio.status)) falhar(`A conexão com ${peer.nome} foi interrompida.`); };
      dc.onmessage = (e) => this._envioMsg(envio, e, opcoes);
      if (!lig) (async () => {
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
      pc.ondatachannel = (ev) => this._ligarCanalEntrada(m.sessao, s, ev.channel);
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
      const sessao = aleatorio(10), t0 = performance.now(), lig = this._ligacoes.get(peer.id);
      if (lig) return new Promise((ok, erro) => {
        const dc = lig.pc.createDataChannel('p:' + sessao); let fim = false; const acabar = (f, v) => { if (fim) return; fim = true; clearTimeout(tm); try { dc.close(); } catch { /* ok */ } f(v); };
        const tm = setTimeout(() => acabar(erro, new Error('Sem resposta em 10 segundos.')), 10000);
        dc.onopen = () => dc.send(JSON.stringify({ t: 'ping', ts: performance.now() }));
        dc.onmessage = (e) => { try { if (JSON.parse(e.data).t === 'pong') acabar(ok, Math.round(performance.now() - t0)); } catch { /* ignorar */ } };
      });
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

  window.ErasoRede = { Rede, perfilDoNavegador, detalharPerfil, nomePadrao, aleatorio, codec: { codificar, decodificar, extrairSdp, montarSdp, validarCarga }, crc32, limites: { TAMANHO_MAXIMO, TENTATIVAS_PIN } };
})();
