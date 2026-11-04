// Servidor do ERASÓ (Node.js 18+, sem dependências).
//
// O que faz:
//   1. Serve o site (/landing/) e o aplicativo (/app/). Nada além dessas duas pastas é público.
//   2. Presença: cada navegador com o ERASÓ aberto se registra aqui e o servidor informa quem está disponível
//      na MESMA SALA. É isso que torna a descoberta real: navegadores não varrem a rede sozinhos.
//   3. Sinalização: repassa mensagens WebRTC (oferta, resposta, candidatos) entre dois aparelhos da mesma sala.
//
// O que NÃO faz: não recebe, não guarda e não vê arquivos nem textos enviados. A transferência é direta
// entre os navegadores (canal de dados WebRTC, criptografado). O servidor só conhece nome, tipo e sistema de
// cada aparelho e guarda isso apenas na memória, enquanto o aparelho está conectado.
//
// Dois modos:
//   local   (padrão)  só aceita rede local; a sala é opcional (sem sala = todos da rede se veem).
//   público           ERASO_PUBLICO=1 ou --publico: aceita a internet; a sala (código secreto) é obrigatória,
//                     com limites por IP e por sala. Use atrás de HTTPS (Render, Railway, Fly etc.).
//
// Variáveis de ambiente (veja .env.example):
//   PORT, ERASO_PUBLICO, ERASO_PROXY (confiar em X-Forwarded-For; padrão ligado no modo público),
//   ERASO_STUN (lista separada por vírgulas), ERASO_TURN_URL, ERASO_TURN_USER, ERASO_TURN_CRED.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { networkInterfaces } from 'node:os';
import { dirname, extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLICAS = ['landing', 'app'];                         // únicas pastas servidas
const PORTA = Number(process.env.PORT || 8780);
const PUBLICO = process.env.ERASO_PUBLICO === '1' || process.argv.includes('--publico') || process.argv.includes('--aberto');
const PROXY = process.env.ERASO_PROXY ? process.env.ERASO_PROXY === '1' : PUBLICO;
const lista = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean);
const STUN = lista(process.env.ERASO_STUN || (PUBLICO ? 'stun:stun.cloudflare.com:3478' : ''));
const TURN = lista(process.env.ERASO_TURN_URL);

const LIMITES = { salaMax: 30, totalMax: 1000, sseIp: 12, reqPorMinuto: 600, corpo: 256 * 1024 };

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8' };

/** @type {Map<string, {id:string,sala:string,token:string,ip:string,nome:string,tipo:string,so:string,visivel:boolean,res:import('node:http').ServerResponse,desde:number}>} */
const aparelhos = new Map();

// ---------- rede, limites e segurança ----------
function redeLocal(ip = '') {
  ip = ip.replace(/^::ffff:/, '');
  if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('fe80:') || /^f[cd][0-9a-f]{2}:/i.test(ip)) return true;
  const m = ip.match(/^(\d+)\.(\d+)\./);
  if (!m) return false;
  const a = +m[1], b = +m[2];
  return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254);
}
/** IP do cliente. Atrás de proxy confiável, vale a última entrada de X-Forwarded-For (a que o proxy acrescentou). */
function ipDe(req) {
  if (PROXY) { const xf = String(req.headers['x-forwarded-for'] || '').split(',').map((s) => s.trim()).filter(Boolean); if (xf.length) return xf[xf.length - 1]; }
  return (req.socket.remoteAddress || '').replace(/^::ffff:/, '');
}
const janelas = new Map();
function dentroDoLimite(ip) {
  const agora = Date.now(); let j = janelas.get(ip);
  if (!j || agora - j.inicio > 60000) { j = { inicio: agora, n: 0 }; janelas.set(ip, j); }
  return ++j.n <= LIMITES.reqPorMinuto;
}
setInterval(() => { const corte = Date.now() - 120000; for (const [ip, j] of janelas) if (j.inicio < corte) janelas.delete(ip); }, 60000).unref();

const iguais = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && timingSafeEqual(x, y); };

/** CSP: scripts só do próprio site; os blocos de script embutidos das páginas entram por hash, calculado na partida. */
function montarCsp() {
  const hashes = new Set();
  try {
    for (const f of readdirSync(join(RAIZ, 'landing')).filter((n) => n.endsWith('.html')))
      for (const m of readFileSync(join(RAIZ, 'landing', f), 'utf8').matchAll(/<script>([\s\S]*?)<\/script>/g)) hashes.add(`'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`);
  } catch { /* sem site: sem hashes */ }
  return ["default-src 'self'", `script-src 'self' ${[...hashes].join(' ')}`.trim(), "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", 'font-src https://fonts.gstatic.com',
    "img-src 'self' data: blob:", "media-src 'self' blob:", "connect-src 'self'", "frame-ancestors 'self'", "base-uri 'none'", "form-action 'self'", "object-src 'none'"].join('; ');
}
const CSP = montarCsp();
function cabecalhos(res, comCsp = true) {
  res.setHeader('x-content-type-options', 'nosniff'); res.setHeader('referrer-policy', 'no-referrer'); res.setHeader('x-frame-options', 'SAMEORIGIN');
  if (comCsp) res.setHeader('content-security-policy', CSP);
  res.setHeader('permissions-policy', 'camera=(self), microphone=(), geolocation=()');
  if (PUBLICO) res.setHeader('strict-transport-security', 'max-age=15552000');
}

// ---------- presença ----------
const SALA_OK = /^[a-z0-9]{6,32}$/;
const ID_OK = /^[a-f0-9]{8,32}$/;
const limpo = (v, max = 60) => String(v ?? '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, max);
const publico = (a) => ({ id: a.id, nome: a.nome, tipo: a.tipo, so: a.so });
const daSala = (sala) => [...aparelhos.values()].filter((a) => a.sala === sala);
const listaVisivel = (sala) => daSala(sala).filter((a) => a.visivel).map(publico);
const enviarEvento = (a, evento, dados) => { try { a.res.write(`event: ${evento}\ndata: ${JSON.stringify(dados)}\n\n`); } catch { /* conexão encerrada: o 'close' remove o aparelho */ } };
const difundirLista = (sala) => { const l = listaVisivel(sala); for (const a of daSala(sala)) enviarEvento(a, 'aparelhos', l); };

/** Sala informada pelo cliente. No modo público é obrigatória; no local, vazia = rede toda. */
function salaDe(valor) {
  const s = String(valor || '').toLowerCase();
  if (!s) return PUBLICO ? null : '';
  return SALA_OK.test(s) ? s : null;
}

async function corpoJson(req) {
  let tam = 0; const partes = [];
  for await (const p of req) { tam += p.length; if (tam > LIMITES.corpo) throw Object.assign(new Error('grande demais'), { status: 413 }); partes.push(p); }
  try { return JSON.parse(Buffer.concat(partes).toString('utf8') || '{}'); } catch { throw Object.assign(new Error('JSON inválido'), { status: 400 }); }
}
const json = (res, status, obj) => { res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }); res.end(JSON.stringify(obj)); };

function autenticar(d) {
  const a = aparelhos.get(String(d.id ?? d.de));
  return a && iguais(a.token, d.token ?? '') ? a : null;
}

async function api(req, res, url) {
  const rota = url.pathname, ip = ipDe(req);
  if (req.method === 'GET' && rota === '/api/config') {
    const iceServers = [];
    if (STUN.length) iceServers.push({ urls: STUN });
    if (TURN.length) iceServers.push({ urls: TURN, username: process.env.ERASO_TURN_USER || '', credential: process.env.ERASO_TURN_CRED || '' });
    return json(res, 200, { modo: PUBLICO ? 'publico' : 'local', salaObrigatoria: PUBLICO, iceServers });
  }
  if (req.method === 'GET' && rota === '/api/eventos') {
    const q = url.searchParams, id = q.get('id') || '', sala = salaDe(q.get('sala'));
    if (!ID_OK.test(id)) return json(res, 400, { erro: 'identificador inválido' });
    if (sala === null) return json(res, 400, { erro: PUBLICO && !q.get('sala') ? 'informe o código da sala' : 'código de sala inválido (6 a 32 letras minúsculas e números)' });
    const antigo = aparelhos.get(id);
    if (!antigo) {
      if (aparelhos.size >= LIMITES.totalMax) return json(res, 503, { erro: 'servidor cheio, tente mais tarde' });
      if (PUBLICO && daSala(sala).length >= LIMITES.salaMax) return json(res, 429, { erro: 'sala cheia' });
    }
    if (PUBLICO && [...aparelhos.values()].filter((a) => a.ip === ip && a.id !== id).length >= LIMITES.sseIp) return json(res, 429, { erro: 'conexões demais a partir deste endereço' });
    if (antigo) { const salaAntiga = antigo.sala; enviarEvento(antigo, 'substituido', {}); try { antigo.res.end(); } catch { /* já encerrado */ } aparelhos.delete(id); if (salaAntiga !== sala) difundirLista(salaAntiga); }
    res.writeHead(200, { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-store', connection: 'keep-alive', 'x-accel-buffering': 'no' });
    const a = { id, sala, ip, token: randomBytes(16).toString('hex'), nome: limpo(q.get('nome')) || 'Aparelho', tipo: ['phone', 'tablet', 'laptop', 'monitor', 'browser'].includes(q.get('tipo')) ? q.get('tipo') : 'laptop', so: limpo(q.get('so'), 80), visivel: q.get('visivel') !== '0', res, desde: Date.now() };
    aparelhos.set(id, a);
    res.write('retry: 2000\n\n');
    enviarEvento(a, 'ola', { id, token: a.token, servidor: 'ERASÓ' });
    difundirLista(sala);
    const bat = setInterval(() => { try { res.write(': vivo\n\n'); } catch { /* ignorado */ } }, 15000);
    req.on('close', () => { clearInterval(bat); if (aparelhos.get(id)?.res === res) { aparelhos.delete(id); difundirLista(sala); } });
    return;
  }
  if (req.method === 'GET' && rota === '/api/aparelhos') {
    const sala = salaDe(url.searchParams.get('sala'));
    if (sala === null) return json(res, 400, { erro: 'informe o código da sala' });
    return json(res, 200, { aparelhos: listaVisivel(sala) });
  }
  if (req.method === 'POST' && rota === '/api/presenca') {
    const d = await corpoJson(req), a = autenticar(d);
    if (!a) return json(res, 404, { erro: 'aparelho não conectado' });
    if (d.nome !== undefined) a.nome = limpo(d.nome) || a.nome;
    if (d.visivel !== undefined) a.visivel = !!d.visivel;
    difundirLista(a.sala);
    return json(res, 200, { ok: true });
  }
  if (req.method === 'POST' && rota === '/api/sinal') {
    const d = await corpoJson(req), de = autenticar(d);
    if (!de) return json(res, 404, { erro: 'remetente não conectado' });
    const para = aparelhos.get(String(d.para));
    if (!para || para.sala !== de.sala) return json(res, 404, { erro: 'aparelho de destino não está conectado' });
    enviarEvento(para, 'sinal', { de: de.id, nome: de.nome, tipo: de.tipo, so: de.so, kind: limpo(d.kind, 20), sessao: limpo(d.sessao, 40), dados: d.dados ?? null });
    return json(res, 200, { ok: true });
  }
  json(res, 404, { erro: 'rota inexistente' });
}

// ---------- arquivos estáticos ----------
async function estatico(req, res, url, pastas) {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { allow: 'GET, HEAD' }); return res.end(); }
  let caminho; try { caminho = decodeURIComponent(url.pathname); } catch { res.writeHead(400); return res.end(); }
  if (caminho.includes('\0')) { res.writeHead(400); return res.end(); }
  if (caminho === '/') { res.writeHead(302, { location: '/landing/index.html' }); return res.end(); }
  if (caminho === '/saude') return json(res, 200, { ok: true, modo: PUBLICO ? 'publico' : 'local', aparelhos: aparelhos.size });
  const alvo = normalize(join(RAIZ, caminho));
  const partes = alvo.slice(RAIZ.length + 1).split(sep);
  if ((alvo !== RAIZ && !alvo.startsWith(RAIZ + sep)) || !pastas.includes(partes[0])) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); return res.end('Não encontrado'); }
  try {
    let st = await stat(alvo), arq = alvo;
    if (st.isDirectory()) { arq = join(alvo, 'index.html'); st = await stat(arq); }
    const dados = await readFile(arq);
    res.writeHead(200, { 'content-type': MIME[extname(arq).toLowerCase()] || 'application/octet-stream', 'content-length': dados.length, 'cache-control': 'no-cache' });
    res.end(req.method === 'HEAD' ? undefined : dados);
  } catch { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); res.end('Não encontrado'); }
}

/** @param {{extras?: string[]}} [opcoes] extras: pastas adicionais servidas (só os testes usam). */
export function iniciar(porta = PORTA, opcoes = {}) {
  const pastas = [...PUBLICAS, ...(opcoes.extras || [])];
  const srv = createServer(async (req, res) => {
    try {
      cabecalhos(res, !opcoes.extras?.length); // páginas extras (só nos testes) têm script embutido
      const ip = ipDe(req);
      if (!PUBLICO && !redeLocal(req.socket.remoteAddress)) { res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' }); return res.end('Acesso permitido apenas na rede local.'); }
      if (PUBLICO && !dentroDoLimite(ip)) { res.writeHead(429, { 'content-type': 'text/plain; charset=utf-8', 'retry-after': '60' }); return res.end('Muitas requisições. Aguarde um minuto.'); }
      const url = new URL(req.url, 'http://x');
      if (url.pathname.startsWith('/api/')) {
        const origem = req.headers.origin;
        if (origem && PUBLICO) { try { if (new URL(origem).host !== req.headers.host) { res.writeHead(403); return res.end(); } } catch { res.writeHead(403); return res.end(); } }
        return await api(req, res, url);
      }
      await estatico(req, res, url, pastas);
    } catch (e) { if (!res.headersSent) json(res, e.status || 500, { erro: e.status ? e.message : 'erro interno' }); else res.end(); }
  });
  srv.keepAliveTimeout = 0; srv.headersTimeout = 20000; srv.requestTimeout = 0;
  return new Promise((ok) => srv.listen(porta, '0.0.0.0', () => ok(srv)));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const srv = await iniciar();
  const porta = srv.address().port;
  console.log(`\nERASÓ · servidor em execução (porta ${porta}) · modo ${PUBLICO ? 'PÚBLICO' : 'local'}\n`);
  if (PUBLICO) {
    console.log('Modo público: o código da sala é obrigatório e os limites por IP estão ativos. Use atrás de HTTPS.');
    console.log(TURN.length ? 'Servidor TURN configurado.' : 'Sem servidor TURN: redes mais restritivas podem não conectar (veja a documentação).');
  } else {
    console.log('Abra o aplicativo em cada aparelho, na mesma rede Wi-Fi:');
    for (const l of Object.values(networkInterfaces())) for (const i of l || []) if (i.family === 'IPv4' && !i.internal) console.log(`  http://${i.address}:${porta}/app/index.html`);
    console.log(`  http://localhost:${porta}/app/index.html  (este computador)\n`);
    console.log('Aceita apenas conexões da rede local. Ctrl+C para encerrar.');
  }
}
