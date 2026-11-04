// Testes do servidor no modo PÚBLICO (salas, autenticação, limites, cabeçalhos e pastas servidas).
// Uso:  node tests/servidor.test.mjs
// Sobe o servidor como processo separado (o modo é lido das variáveis de ambiente na partida), sem navegador.

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const PORTA = 9300 + Math.floor(Math.random() * 500), BASE = `http://127.0.0.1:${PORTA}`;
const filho = spawn(process.execPath, [join(RAIZ, 'server', 'servidor.mjs')], {
  env: { ...process.env, PORT: String(PORTA), ERASO_PUBLICO: '1', ERASO_TURN_URL: 'turn:turn.exemplo.test:3478', ERASO_TURN_USER: 'usuario-de-teste', ERASO_TURN_CRED: 'credencial-de-teste' }, stdio: 'ignore' });
for (let i = 0; i < 50; i++) { try { await fetch(`${BASE}/saude`); break; } catch { await dormir(100); } }

let ok = 0; const falhas = [];
async function teste(nome, fn) { const t0 = Date.now(); try { await fn(); ok++; console.log(`  ✓ ${nome} (${Date.now() - t0} ms)`); } catch (e) { falhas.push([nome, e.message]); console.log(`  ✗ ${nome}\n      ${e.message}`); } }
const igual = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${m}: esperado ${JSON.stringify(b)}, obtido ${JSON.stringify(a)}`); };
const verdade = (c, m) => { if (!c) throw new Error(m); };

let n = 0;
const ipFalso = () => `203.0.113.${++n % 250 + 1}`;         // cada teste usa "um IP" diferente (o servidor confia no X-Forwarded-For)
const hexId = () => Array.from({ length: 12 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
const sala = () => Array.from({ length: 10 }, () => 'abcdefghjkmnpqrstuvwxyz23456789'[Math.floor(Math.random() * 31)]).join('');

/** Cliente SSE mínimo: guarda os eventos recebidos. */
async function conectar(id, salaCodigo, { ip = ipFalso(), nome = 'Teste', visivel = '1' } = {}) {
  const ctl = new AbortController(), eventos = [];
  const q = new URLSearchParams({ id, nome, tipo: 'laptop', so: 'Teste', visivel, ...(salaCodigo ? { sala: salaCodigo } : {}) });
  const r = await fetch(`${BASE}/api/eventos?${q}`, { headers: { 'x-forwarded-for': ip }, signal: ctl.signal });
  const cli = { r, ctl, eventos, ip, id, token: '', fechar: () => ctl.abort() };
  if (r.status !== 200) { await r.text().catch(() => {}); return cli; }
  (async () => {
    const leitor = r.body.getReader(), dec = new TextDecoder(); let buf = '';
    try { for (;;) { const { value, done } = await leitor.read(); if (done) break; buf += dec.decode(value, { stream: true }); let i;
      while ((i = buf.indexOf('\n\n')) >= 0) { const bloco = buf.slice(0, i); buf = buf.slice(i + 2); const ev = /event: (\w+)/.exec(bloco), d = /data: (.*)/.exec(bloco); if (ev && d) { const dados = JSON.parse(d[1]); eventos.push({ ev: ev[1], dados }); if (ev[1] === 'ola') cli.token = dados.token; } } } } catch { /* encerrado */ }
  })();
  for (let i = 0; i < 40 && !cli.token; i++) await dormir(25);
  return cli;
}
const ultimaLista = (c) => [...c.eventos].reverse().find((e) => e.ev === 'aparelhos')?.dados || [];
const post = (rota, corpo, ip = ipFalso(), extra = {}) => fetch(BASE + rota, { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': ip, ...extra }, body: typeof corpo === 'string' ? corpo : JSON.stringify(corpo) });
const abertos = [];
const abrir = async (...a) => { const c = await conectar(...a); abertos.push(c); return c; };

console.log('\nSalas e identidade');
await teste('sem código de sala, o servidor público recusa a conexão', async () => {
  const c = await conectar(hexId(), ''); igual(c.r.status, 400, 'status');
  const lista = await fetch(`${BASE}/api/aparelhos`, { headers: { 'x-forwarded-for': ipFalso() } }); igual(lista.status, 400, 'lista sem sala');
});
await teste('código de sala inválido (curto, maiúsculo fora do padrão, símbolos) é recusado', async () => {
  for (const ruim of ['abc', 'abcde', 'ABCD#EFGH', 'x'.repeat(40)]) igual((await conectar(hexId(), ruim)).r.status, 400, `sala "${ruim}"`);
});
await teste('só se veem aparelhos da mesma sala', async () => {
  const s1 = sala(), s2 = sala(); const a = await abrir(hexId(), s1, { nome: 'A' }), b = await abrir(hexId(), s1, { nome: 'B' }), c = await abrir(hexId(), s2, { nome: 'C' });
  await dormir(200);
  igual(ultimaLista(a).map((x) => x.nome).sort(), ['A', 'B'], 'sala 1 vista por A'); igual(ultimaLista(c).map((x) => x.nome), ['C'], 'sala 2 vista por C');
  const consulta = await (await fetch(`${BASE}/api/aparelhos?sala=${s1}`, { headers: { 'x-forwarded-for': ipFalso() } })).json(); igual(consulta.aparelhos.length, 2, 'consulta direta');
  const outra = await (await fetch(`${BASE}/api/aparelhos?sala=${sala()}`, { headers: { 'x-forwarded-for': ipFalso() } })).json(); igual(outra.aparelhos.length, 0, 'sala desconhecida está vazia');
});
await teste('aparelho oculto não aparece para os outros da sala', async () => {
  const s = sala(); const a = await abrir(hexId(), s, { nome: 'Visível' }), b = await abrir(hexId(), s, { nome: 'Oculto', visivel: '0' }); await dormir(200);
  igual(ultimaLista(a).map((x) => x.nome), ['Visível'], 'lista de A');
});

console.log('\nSinalização autenticada');
await teste('a sinalização exige o token do remetente', async () => {
  const s = sala(); const a = await abrir(hexId(), s), b = await abrir(hexId(), s);
  igual((await post('/api/sinal', { de: a.id, para: b.id, kind: 'oferta', sessao: 's1', dados: {} })).status, 404, 'sem token');
  igual((await post('/api/sinal', { de: a.id, token: b.token, para: b.id, kind: 'oferta', sessao: 's1', dados: {} })).status, 404, 'token de outro aparelho');
  igual((await post('/api/sinal', { de: a.id, token: a.token, para: b.id, kind: 'oferta', sessao: 's1', dados: { x: 1 } })).status, 200, 'token certo'); await dormir(150);
  const recebido = b.eventos.find((e) => e.ev === 'sinal'); verdade(recebido && recebido.dados.de === a.id && recebido.dados.dados.x === 1, 'B não recebeu o sinal de A');
});
await teste('não dá para sinalizar para um aparelho de outra sala', async () => {
  const a = await abrir(hexId(), sala()), c = await abrir(hexId(), sala());
  igual((await post('/api/sinal', { de: a.id, token: a.token, para: c.id, kind: 'oferta', sessao: 's', dados: {} })).status, 404, 'status');
  await dormir(100); verdade(!c.eventos.some((e) => e.ev === 'sinal'), 'C recebeu um sinal de outra sala');
});
await teste('presença: sem o token certo não dá para renomear nem ocultar o aparelho dos outros', async () => {
  const s = sala(); const a = await abrir(hexId(), s, { nome: 'Original' }), b = await abrir(hexId(), s);
  igual((await post('/api/presenca', { id: a.id, nome: 'Invasor' })).status, 404, 'sem token'); await dormir(100);
  igual(ultimaLista(b).find((x) => x.id === a.id).nome, 'Original', 'nome mudou sem autorização');
  igual((await post('/api/presenca', { id: a.id, token: a.token, nome: 'Novo' })).status, 200, 'com token'); await dormir(150);
  igual(ultimaLista(b).find((x) => x.id === a.id).nome, 'Novo', 'nome não mudou com autorização');
});
await teste('corpo grande demais e JSON inválido são recusados', async () => {
  igual((await post('/api/sinal', 'x'.repeat(300 * 1024))).status, 413, 'corpo grande'); igual((await post('/api/sinal', '{quebrado')).status, 400, 'json inválido');
});
await teste('origem diferente é recusada nas rotas da API', async () => {
  igual((await post('/api/sinal', {}, ipFalso(), { origin: 'https://site-malicioso.example' })).status, 403, 'origem estranha');
});

console.log('\nLimites');
await teste('uma sala aceita no máximo 30 aparelhos', async () => {
  const s = sala(); for (let i = 0; i < 30; i++) await abrir(hexId(), s, { ip: ipFalso() });
  igual((await conectar(hexId(), s, { ip: ipFalso() })).r.status, 429, 'o 31º');
});
await teste('um mesmo IP não abre mais de 12 conexões', async () => {
  const ip = ipFalso(); for (let i = 0; i < 12; i++) await abrir(hexId(), sala(), { ip });
  igual((await conectar(hexId(), sala(), { ip })).r.status, 429, 'a 13ª');
});
await teste('excesso de requisições por minuto vira 429', async () => {
  const ip = ipFalso(); let ultimo = 200;
  for (let i = 0; i < 640; i++) { ultimo = (await fetch(`${BASE}/saude`, { headers: { 'x-forwarded-for': ip } })).status; if (ultimo === 429) break; }
  igual(ultimo, 429, 'limite não aplicado');
});

console.log('\nO que o servidor publica');
await teste('o site e o aplicativo são servidos', async () => {
  for (const c of ['/landing/index.html', '/app/index.html', '/app/app.js', '/app/rede.js']) igual((await fetch(BASE + c, { headers: { 'x-forwarded-for': ipFalso() } })).status, 200, c);
  const raiz = await fetch(BASE + '/', { redirect: 'manual', headers: { 'x-forwarded-for': ipFalso() } }); igual(raiz.status, 302, '/ redireciona');
});
await teste('código do servidor, testes, documentos, .git, .claude e package.json não são servidos', async () => {
  for (const c of ['/server/servidor.mjs', '/tests/app.test.mjs', '/docs/etapa3/RELATORIO.md', '/docs/design/DESIGN_SYSTEM.md', '/.git/config', '/.claude/launch.json', '/package.json', '/.env', '/node_modules/x', '/landing/../server/servidor.mjs', '/landing/%2e%2e/server/servidor.mjs', '/%2e%2e/%2e%2e/windows/win.ini', '/landing/..%5cserver%5cservidor.mjs', '/app/%00.html'])
    verdade([400, 403, 404].includes((await fetch(BASE + c, { headers: { 'x-forwarded-for': ipFalso() } })).status), `${c} foi servido`);
});
await teste('as respostas trazem os cabeçalhos de segurança', async () => {
  const r = await fetch(`${BASE}/app/index.html`, { headers: { 'x-forwarded-for': ipFalso() } }); const h = (k) => r.headers.get(k) || '';
  igual(h('x-content-type-options'), 'nosniff', 'nosniff'); verdade(/default-src 'self'/.test(h('content-security-policy')), 'CSP ausente'); verdade(!/unsafe-eval/.test(h('content-security-policy')), 'CSP permite eval');
  verdade(/frame-ancestors 'self'/.test(h('content-security-policy')), 'frame-ancestors'); igual(h('referrer-policy'), 'no-referrer', 'referrer'); verdade(/max-age/.test(h('strict-transport-security')), 'HSTS');
});
await teste('a configuração entrega STUN e TURN, e nada além disso', async () => {
  const c = await (await fetch(`${BASE}/api/config`, { headers: { 'x-forwarded-for': ipFalso() } })).json();
  igual(c.modo, 'publico', 'modo'); igual(c.salaObrigatoria, true, 'sala obrigatória'); verdade(c.iceServers.some((s) => [].concat(s.urls).some((u) => u.startsWith('stun:'))), 'sem STUN');
  verdade(c.iceServers.some((s) => s.username === 'usuario-de-teste'), 'sem TURN'); igual(Object.keys(c).sort(), ['iceServers', 'modo', 'salaObrigatoria'], 'campos da configuração');
});
await teste('verificação de saúde não vaza dados dos aparelhos', async () => {
  const t = await (await fetch(`${BASE}/saude`, { headers: { 'x-forwarded-for': ipFalso() } })).text(); verdade(/"ok":true/.test(t) && !/nome|token|sala/.test(t), `resposta: ${t}`);
});

for (const c of abertos) c.fechar();
filho.kill();
console.log(`\n${ok} testes passaram, ${falhas.length} falharam.`);
process.exit(falhas.length ? 1 : 0);
