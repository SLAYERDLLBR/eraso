// Servidor de presença e sinalização do ERASÓ para a Cloudflare (Workers + Durable Objects, sem dependências).
//
// Faz o mesmo que server/servidor.mjs, mas sem máquina para manter: o aplicativo hospedado no GitHub Pages fala com este
// serviço para os aparelhos se encontrarem. Arquivos e textos NÃO passam por aqui: seguem direto entre os navegadores.
//
// Salas:   com código (?sala=abc123), só quem usa o mesmo código se vê;
//          sem código, os aparelhos que saem para a internet pelo mesmo endereço (o mesmo Wi-Fi) se veem sozinhos. O endereço
//          é usado só para escolher a sala (vira um hash) e nunca é mostrado nem guardado.
//
// A lógica está aqui, separada das APIs da Cloudflare, para ser testada em Node (tests/cloudflare.test.mjs):
// criarClasseSala recebe a classe-base e as peças específicas da plataforma.

const ID_OK = /^[a-f0-9]{8,32}$/;
const SALA_OK = /^[a-z0-9]{6,32}$/;
const TIPOS = ['phone', 'tablet', 'laptop', 'monitor', 'browser'];
export const LIMITES = { sala: 20, rede: 20, corpo: 256 * 1024 };

export const limpo = (v, max = 60) => String(v ?? '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, max);
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

/** Chave da rede de um aparelho: o endereço IPv4 inteiro ou o prefixo /64 do IPv6 (a LAN inteira costuma dividir o /64). */
export function chaveDeRede(ip) {
  ip = String(ip || '').trim().toLowerCase();
  const mapeado = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/.exec(ip); if (mapeado) ip = mapeado[1];
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(ip)) return 'v4:' + ip;
  if (ip.includes(':') && /^[0-9a-f:]+$/.test(ip)) {
    const [cabeca, cauda = ''] = ip.split('::'); const a = cabeca ? cabeca.split(':') : [], b = cauda ? cauda.split(':') : [];
    const grupos = ip.includes('::') ? [...a, ...Array(Math.max(0, 8 - a.length - b.length)).fill('0'), ...b] : a;
    if (grupos.length === 8) return 'v6:' + grupos.slice(0, 4).map((g) => g.padStart(4, '0')).join(':');
  }
  return '';
}
/** Nome da sala (e, portanto, do Durable Object). Devolve null se o código for inválido ou não houver como saber a rede. */
export async function nomeDaSala(sala, ip) {
  const s = String(sala || '').toLowerCase();
  if (s) return SALA_OK.test(s) ? { nome: 'sala:' + s, rede: false } : null;
  const chave = chaveDeRede(ip); if (!chave) return null;
  return { nome: 'rede:' + hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(chave))).slice(0, 32), rede: true };
}

/** Origens permitidas: lista separada por vírgulas; "http://localhost:*" vale para qualquer porta. */
export const listaDeOrigens = (texto) => String(texto || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
export function origemPermitida(origem, lista) {
  const o = String(origem || '').toLowerCase(); if (!o) return false;
  return lista.some((p) => (p.endsWith(':*') ? o.startsWith(p.slice(0, -1)) && /^\d+$/.test(o.slice(p.length - 1)) : o === p));
}
const cors = (origem) => ({ 'access-control-allow-origin': origem, 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': 'content-type', 'access-control-max-age': '86400', vary: 'origin' });
const json = (obj, status = 200, extra = {}) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', ...extra } });

/** Porta de entrada do Worker: valida a origem, escolhe a sala e entrega ao Durable Object. */
export async function tratar(request, env) {
  const url = new URL(request.url), permitidas = listaDeOrigens(env.ALLOWED_ORIGINS), origem = request.headers.get('origin');
  const ok = origemPermitida(origem, permitidas), cabecalhos = ok ? cors(origem) : {};
  if (request.method === 'OPTIONS') return ok ? new Response(null, { status: 204, headers: cabecalhos }) : new Response(null, { status: 403 });
  if (url.pathname === '/saude') return json({ ok: true, servico: 'eraso-sinal' });
  if (url.pathname === '/') { // quem abre o endereço do serviço no navegador recebe um aviso e o caminho para o aplicativo
    const app = String(env.APP_URL || '').replace(/[<>"']/g, '');
    return new Response(`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ERASÓ · serviço de apresentação</title><meta name="robots" content="noindex"><body style="font:16px/1.5 system-ui,sans-serif;max-width:34rem;margin:12vh auto;padding:0 20px;color:#13201A;background:#F7F2E8"><h1 style="font-size:1.4rem">ERASÓ</h1><p>Este é o <strong>serviço de apresentação</strong> do ERASÓ: ele só ajuda os aparelhos a se encontrarem e não tem página própria. Os arquivos e textos nunca passam por aqui.</p>${app ? `<p><a href="${app}" style="color:#A8410F">Abrir o aplicativo</a></p>` : ''}</body></html>`, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=3600', 'x-content-type-options': 'nosniff', 'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'" } });
  }
  if (url.pathname === '/api/config') {
    if (!ok) return json({ erro: 'origem não permitida' }, 403);
    const ice = [{ urls: String(env.STUN || 'stun:stun.cloudflare.com:3478').split(',').map((s) => s.trim()).filter(Boolean) }];
    if (env.TURN_URL) ice.push({ urls: String(env.TURN_URL).split(',').map((s) => s.trim()), username: env.TURN_USER || '', credential: env.TURN_CRED || '' });
    return json({ modo: 'nuvem', salaObrigatoria: false, transporte: 'ws', iceServers: ice }, 200, cabecalhos);
  }
  if (!['/api/ws', '/api/presenca', '/api/sinal', '/api/aparelhos'].includes(url.pathname)) return json({ erro: 'rota inexistente' }, 404, cabecalhos);
  if (!ok) return json({ erro: 'origem não permitida' }, 403);
  const sala = await nomeDaSala(url.searchParams.get('sala'), request.headers.get('cf-connecting-ip'));
  if (!sala) return json({ erro: url.searchParams.get('sala') ? 'código de sala inválido (6 a 32 letras minúsculas e números)' : 'não foi possível identificar a rede deste aparelho; use uma sala com código' }, 400, cabecalhos);
  const ponte = new Request(request); ponte.headers.set('x-eraso-rede', sala.rede ? '1' : '0');
  const resp = await env.SALA.get(env.SALA.idFromName(sala.nome)).fetch(ponte);
  if (resp.status === 101) return resp;
  const saida = new Response(resp.body, resp); for (const [k, v] of Object.entries(cabecalhos)) saida.headers.set(k, v); return saida;
}

/**
 * @param {Function} Base  DurableObject (cloudflare:workers); nos testes, uma classe simples
 * @param {Function} ParDeSockets  WebSocketPair
 * @param {(cliente:any)=>Response} resposta101  Response com status 101 e webSocket (não existe em Node)
 */
export function criarClasseSala(Base, ParDeSockets, resposta101) {
  return class Sala extends Base {
    constructor(ctx, env) {
      super(ctx, env);
      // "ping" do cliente é respondido sem acordar o objeto: as conexões abertas não consomem tempo de execução
      if (typeof WebSocketRequestResponsePair !== 'undefined') ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong'));
    }
    membros() { return this.ctx.getWebSockets().filter((ws) => ws.readyState === undefined || ws.readyState === 1).map((ws) => ({ ws, p: ws.deserializeAttachment() })).filter((m) => m.p); }
    visiveis(membros = this.membros()) { return membros.filter((m) => m.p.visivel).map((m) => ({ id: m.p.id, nome: m.p.nome, tipo: m.p.tipo, so: m.p.so })); }
    enviar(ws, ev, dados) { try { ws.send(JSON.stringify({ ev, dados })); } catch { /* conexão encerrada */ } }
    difundir() { const lista = this.visiveis(); for (const m of this.membros()) this.enviar(m.ws, 'aparelhos', lista); }
    autenticar(d) { const m = this.membros().find((x) => x.p.id === String(d.id ?? d.de)); return m && typeof d.token === 'string' && d.token.length === m.p.token.length && d.token === m.p.token ? m : null; }
    async corpo(request) {
      const texto = await request.text(); if (texto.length > LIMITES.corpo) throw Object.assign(new Error('grande demais'), { status: 413 });
      try { return JSON.parse(texto || '{}'); } catch { throw Object.assign(new Error('JSON inválido'), { status: 400 }); }
    }

    async fetch(request) {
      const url = new URL(request.url);
      try {
        if (url.pathname === '/api/ws') return this.abrir(request, url);
        if (request.method === 'GET' && url.pathname === '/api/aparelhos') return json({ aparelhos: this.visiveis() });
        if (request.method === 'POST' && url.pathname === '/api/presenca') {
          const d = await this.corpo(request), m = this.autenticar(d); if (!m) return json({ erro: 'aparelho não conectado' }, 404);
          const novo = { ...m.p }; if (d.nome !== undefined) novo.nome = limpo(d.nome) || m.p.nome; if (d.visivel !== undefined) novo.visivel = !!d.visivel;
          m.ws.serializeAttachment(novo); this.difundir(); return json({ ok: true });
        }
        if (request.method === 'POST' && url.pathname === '/api/sinal') {
          const d = await this.corpo(request), de = this.autenticar(d); if (!de) return json({ erro: 'remetente não conectado' }, 404);
          const para = this.membros().find((x) => x.p.id === String(d.para)); if (!para) return json({ erro: 'aparelho de destino não está conectado' }, 404);
          this.enviar(para.ws, 'sinal', { de: de.p.id, nome: de.p.nome, tipo: de.p.tipo, so: de.p.so, kind: limpo(d.kind, 20), sessao: limpo(d.sessao, 40), dados: d.dados ?? null });
          return json({ ok: true });
        }
        return json({ erro: 'rota inexistente' }, 404);
      } catch (e) { return json({ erro: e.status ? e.message : 'erro interno' }, e.status || 500); }
    }

    abrir(request, url) {
      if (request.headers.get('upgrade') !== 'websocket') return json({ erro: 'esperava uma conexão WebSocket' }, 426);
      const q = url.searchParams, id = q.get('id') || '';
      if (!ID_OK.test(id)) return json({ erro: 'identificador inválido' }, 400);
      const [cliente, servidor] = Object.values(new ParDeSockets());
      this.ctx.acceptWebSocket(servidor);
      const membros = this.membros().filter((m) => m.ws !== servidor), antigo = membros.find((m) => m.p.id === id);
      const teto = request.headers.get('x-eraso-rede') === '1' ? LIMITES.rede : LIMITES.sala;
      if (!antigo && membros.length >= teto) {
        this.enviar(servidor, 'erro', { motivo: request.headers.get('x-eraso-rede') === '1' ? 'rede-grande' : 'sala-cheia' });
        try { servidor.close(1008, 'cheia'); } catch { /* ok */ }
        return resposta101(cliente);
      }
      if (antigo) { this.enviar(antigo.ws, 'substituido', {}); try { antigo.ws.close(1000, 'substituido'); } catch { /* ok */ } }
      const token = [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, '0')).join('');
      servidor.serializeAttachment({ id, token, nome: limpo(q.get('nome')) || 'Aparelho', tipo: TIPOS.includes(q.get('tipo')) ? q.get('tipo') : 'laptop', so: limpo(q.get('so'), 80), visivel: q.get('visivel') !== '0', desde: Date.now() });
      this.enviar(servidor, 'ola', { id, token, servidor: 'ERASÓ' });
      this.difundir();
      return resposta101(cliente);
    }

    webSocketMessage() { /* o cliente só envia "ping", respondido automaticamente; nada a fazer */ }
    webSocketClose(ws) { try { ws.close(1000, 'fim'); } catch { /* ok */ } this.difundir(); }
    webSocketError(ws) { try { ws.close(1011, 'erro'); } catch { /* ok */ } this.difundir(); }
  };
}
