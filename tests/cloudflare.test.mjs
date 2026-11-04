// Testa a lógica do serviço da Cloudflare (cloudflare/sala.mjs) em Node, com peças falsas no lugar do Durable Object,
// dos WebSockets e do Worker. Não toca na internet nem precisa de navegador. Uso: node tests/cloudflare.test.mjs

import { chaveDeRede, nomeDaSala, origemPermitida, listaDeOrigens, tratar, criarClasseSala, LIMITES } from '../cloudflare/sala.mjs';

let ok = 0; const falhas = [];
async function teste(nome, fn) { try { await fn(); ok++; console.log(`  ✓ ${nome}`); } catch (e) { falhas.push([nome, e.message]); console.log(`  ✗ ${nome}\n      ${e.message}`); } }
const igual = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${m}: esperado ${JSON.stringify(b)}, obtido ${JSON.stringify(a)}`); };
const verdade = (c, m) => { if (!c) throw new Error(m); };

// ---------- peças falsas ----------
class WsFalso {
  constructor() { this.anexo = null; this.recebidas = []; this.readyState = 1; this.fechado = null; }
  serializeAttachment(v) { this.anexo = structuredClone(v); } deserializeAttachment() { return this.anexo ? structuredClone(this.anexo) : null; }
  send(t) { this.recebidas.push(JSON.parse(t)); } close(c, r) { this.readyState = 3; this.fechado = [c, r]; }
  eventos(nome) { return this.recebidas.filter((e) => e.ev === nome); } ultimo(nome) { return this.eventos(nome).at(-1)?.dados; }
}
class ParFalso { constructor() { this[0] = new WsFalso(); this[1] = new WsFalso(); } }
class BaseFalsa { constructor(ctx, env) { this.ctx = ctx; this.env = env; } }
const Sala = criarClasseSala(BaseFalsa, ParFalso, (cliente) => ({ status: 101, webSocket: cliente }));
const novaSala = () => { const ctx = { sockets: [], getWebSockets() { return this.sockets; }, acceptWebSocket(ws) { this.sockets.push(ws); } }; return new Sala(ctx, {}); };
const hexId = () => Array.from({ length: 12 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
async function entrar(sala, { id = hexId(), nome = 'Teste', visivel = '1', rede = '0', tipo = 'laptop' } = {}) {
  const q = new URLSearchParams({ id, nome, tipo, so: 'Teste', visivel });
  const r = await sala.fetch(new Request(`https://x/api/ws?${q}`, { headers: { upgrade: 'websocket', 'x-eraso-rede': rede } }));
  if (r.status !== 101) return { r, status: r.status };
  const ws = r.webSocket; return { r, ws: sala.ctx.sockets.find((s) => s === sala.ctx.sockets[sala.ctx.sockets.length - 1]), id, token: sala.ctx.sockets.at(-1).anexo?.token, cliente: ws };
}
const post = (sala, rota, corpo) => sala.fetch(new Request(`https://x${rota}`, { method: 'POST', body: typeof corpo === 'string' ? corpo : JSON.stringify(corpo) }));

console.log('\nChave e nome da sala');
await teste('chave de rede: IPv4 inteiro; IPv6 pelo prefixo /64; IPv4 mapeado em IPv6 vira IPv4', () => {
  igual(chaveDeRede('203.0.113.7'), 'v4:203.0.113.7', 'ipv4'); igual(chaveDeRede('::ffff:203.0.113.7'), 'v4:203.0.113.7', 'mapeado');
  igual(chaveDeRede('2001:db8:aaaa:bbbb:1:2:3:4'), chaveDeRede('2001:DB8:aaaa:bbbb:ffff::9'), 'dois aparelhos do mesmo /64');
  verdade(chaveDeRede('2001:db8:aaaa:bbbb::1') !== chaveDeRede('2001:db8:aaaa:cccc::1'), '/64 diferentes devem ser redes diferentes');
  igual(chaveDeRede('2001:db8::1'), 'v6:2001:0db8:0000:0000', 'forma comprimida');
  for (const ruim of ['', 'abc', '999.1', 'zzzz::1', null, undefined]) igual(chaveDeRede(ruim), '', `inválido: ${ruim}`);
});
await teste('nome da sala: código válido, inválido, e sala da rede por hash (sem expor o endereço)', async () => {
  igual((await nomeDaSala('ABC123', '')).nome, 'sala:abc123', 'código em minúsculas'); igual(await nomeDaSala('abc', '1.2.3.4'), null, 'curto demais');
  igual(await nomeDaSala('abc 123!', '1.2.3.4'), null, 'símbolos'); igual(await nomeDaSala('x'.repeat(40), '1.2.3.4'), null, 'longo demais');
  const a = await nomeDaSala('', '203.0.113.7'), b = await nomeDaSala('', '203.0.113.7'), c = await nomeDaSala('', '203.0.113.8');
  igual(a.nome, b.nome, 'mesmo IP, mesma sala'); verdade(a.nome !== c.nome, 'IPs diferentes, salas diferentes'); verdade(a.rede && !a.nome.includes('203.0.113.7') && !a.nome.includes('v4'), 'o nome não pode conter o endereço'); verdade(/^rede:[0-9a-f]{32}$/.test(a.nome), 'formato: ' + a.nome);
  igual(await nomeDaSala('', ''), null, 'sem IP e sem código');
});
await teste('origens permitidas: igualdade exata e porta coringa, sem truques de prefixo', () => {
  const l = listaDeOrigens('https://slayerdllbr.github.io, http://127.0.0.1:*');
  verdade(origemPermitida('https://slayerdllbr.github.io', l), 'o site'); verdade(origemPermitida('HTTPS://SlayerDLLBR.github.io', l), 'sem diferenciar maiúsculas'); verdade(origemPermitida('http://127.0.0.1:8787', l), 'porta coringa');
  for (const ruim of ['https://slayerdllbr.github.io.evil.com', 'https://evil.com', 'http://127.0.0.1:80@evil.com', 'http://127.0.0.1:abc', 'http://127.0.0.1', 'http://slayerdllbr.github.io', '', null, 'null']) verdade(!origemPermitida(ruim, l), `não deveria permitir: ${ruim}`);
});

console.log('\nPorta de entrada do Worker');
const chamadas = [];
const env = { ALLOWED_ORIGINS: 'https://slayerdllbr.github.io', SALA: { idFromName: (n) => n, get: (n) => ({ fetch: async (req) => { chamadas.push({ n, rede: req.headers.get('x-eraso-rede') }); return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } }); } }) } };
const SITE = 'https://slayerdllbr.github.io';
await teste('configuração só para o site permitido, com STUN padrão e CORS; TURN só se configurado', async () => {
  const r = await tratar(new Request('https://w/api/config', { headers: { origin: SITE } }), env); igual(r.status, 200, 'status'); igual(r.headers.get('access-control-allow-origin'), SITE, 'CORS');
  const c = await r.json(); igual(c.modo, 'nuvem', 'modo'); igual(c.transporte, 'ws', 'transporte'); igual(c.iceServers[0].urls, ['stun:stun.cloudflare.com:3478'], 'STUN'); igual(c.iceServers.length, 1, 'sem TURN por padrão');
  const t = await (await tratar(new Request('https://w/api/config', { headers: { origin: SITE } }), { ...env, TURN_URL: 'turn:t.example:3478', TURN_USER: 'u', TURN_CRED: 'c' })).json(); igual(t.iceServers[1].username, 'u', 'TURN configurado');
  igual((await tratar(new Request('https://w/api/config', { headers: { origin: 'https://evil.example' } }), env)).status, 403, 'origem estranha'); igual((await tratar(new Request('https://w/api/config'), env)).status, 403, 'sem origem');
});
await teste('pré-verificação CORS, saúde e rotas inexistentes', async () => {
  const o = await tratar(new Request('https://w/api/sinal', { method: 'OPTIONS', headers: { origin: SITE } }), env); igual(o.status, 204, 'OPTIONS'); verdade(/content-type/.test(o.headers.get('access-control-allow-headers')), 'headers permitidos');
  igual((await tratar(new Request('https://w/api/sinal', { method: 'OPTIONS', headers: { origin: 'https://evil.example' } }), env)).status, 403, 'OPTIONS de origem estranha');
  igual((await tratar(new Request('https://w/saude'), env)).status, 200, 'saúde'); igual((await tratar(new Request('https://w/api/outra', { headers: { origin: SITE } }), env)).status, 404, 'rota inexistente');
  igual((await tratar(new Request('https://w/saude'), env)).headers.get('access-control-allow-origin'), null, 'saúde não precisa de CORS');
});
await teste('rotas da API exigem origem permitida e sala válida; a sala certa é escolhida pelo código ou pelo IP', async () => {
  chamadas.length = 0;
  igual((await tratar(new Request('https://w/api/aparelhos?sala=abc123', { headers: { origin: 'https://evil.example' } }), env)).status, 403, 'origem estranha');
  igual((await tratar(new Request('https://w/api/aparelhos?sala=abc', { headers: { origin: SITE } }), env)).status, 400, 'código curto');
  igual((await tratar(new Request('https://w/api/aparelhos', { headers: { origin: SITE } }), env)).status, 400, 'sem código e sem IP');
  const r1 = await tratar(new Request('https://w/api/aparelhos?sala=ABC123', { headers: { origin: SITE } }), env); igual(r1.status, 200, 'com código'); igual(r1.headers.get('access-control-allow-origin'), SITE, 'CORS na resposta');
  await tratar(new Request('https://w/api/aparelhos', { headers: { origin: SITE, 'cf-connecting-ip': '203.0.113.7' } }), env); await tratar(new Request('https://w/api/aparelhos', { headers: { origin: SITE, 'cf-connecting-ip': '203.0.113.7' } }), env);
  igual(chamadas[0], { n: 'sala:abc123', rede: '0' }, 'sala com código'); verdade(chamadas[1].n.startsWith('rede:') && chamadas[1].rede === '1', 'sala da rede'); igual(chamadas[1].n, chamadas[2].n, 'mesma rede, mesma sala');
});

console.log('\nSala (Durable Object)');
await teste('entrar: cada aparelho recebe o seu token e a lista; ocultos não aparecem para os outros', async () => {
  const s = novaSala(); const a = await entrar(s, { nome: 'A' }), b = await entrar(s, { nome: 'B' }), c = await entrar(s, { nome: 'C', visivel: '0' });
  verdade(/^[0-9a-f]{32}$/.test(a.token), 'token de A'); verdade(a.token !== b.token, 'tokens diferentes'); igual(a.ws.ultimo('ola').token, a.token, 'A recebe o próprio token');
  igual(a.ws.ultimo('aparelhos').map((x) => x.nome).sort(), ['A', 'B'], 'lista vista por A'); igual(c.ws.ultimo('aparelhos').map((x) => x.nome).sort(), ['A', 'B'], 'C oculto vê os outros e não aparece'); verdade(!JSON.stringify(a.ws.recebidas).includes('"C"'), 'C não pode aparecer para A');
  verdade(!JSON.stringify(a.ws.recebidas).includes(b.token), 'token de B nunca vai para A');
});
await teste('sinalização e presença exigem o token; com ele, a mensagem chega só ao destino', async () => {
  const s = novaSala(); const a = await entrar(s, { nome: 'A' }), b = await entrar(s, { nome: 'B' }), c = await entrar(s, { nome: 'C' });
  igual((await post(s, '/api/sinal', { de: a.id, para: b.id, kind: 'oferta', sessao: 's1', dados: {} })).status, 404, 'sem token');
  igual((await post(s, '/api/sinal', { de: a.id, token: b.token, para: b.id, kind: 'oferta', sessao: 's1', dados: {} })).status, 404, 'token de outro');
  igual((await post(s, '/api/sinal', { de: a.id, token: a.token, para: b.id, kind: 'oferta', sessao: 's1', dados: { x: 1 } })).status, 200, 'token certo');
  igual(b.ws.ultimo('sinal').dados, { x: 1 }, 'B recebeu'); igual(b.ws.ultimo('sinal').de, a.id, 'remetente'); igual(c.ws.eventos('sinal').length, 0, 'C não recebe');
  igual((await post(s, '/api/sinal', { de: a.id, token: a.token, para: 'ffffffffffff', kind: 'oferta', sessao: 's', dados: {} })).status, 404, 'destino que não está na sala');
  igual((await post(s, '/api/presenca', { id: a.id, nome: 'Invasor' })).status, 404, 'presença sem token'); igual(b.ws.ultimo('aparelhos').find((x) => x.id === a.id).nome, 'A', 'nome não mudou');
  igual((await post(s, '/api/presenca', { id: a.id, token: a.token, nome: 'Novo', visivel: false })).status, 200, 'presença com token'); igual(b.ws.ultimo('aparelhos').some((x) => x.id === a.id), false, 'A ficou oculto');
});
await teste('salas diferentes não se enxergam nem trocam sinais', async () => {
  const s1 = novaSala(), s2 = novaSala(); const a = await entrar(s1, { nome: 'A' }), c = await entrar(s2, { nome: 'C' });
  igual(c.ws.ultimo('aparelhos').map((x) => x.nome), ['C'], 'C só vê a própria sala'); igual((await post(s1, '/api/sinal', { de: a.id, token: a.token, para: c.id, kind: 'oferta', sessao: 's', dados: {} })).status, 404, 'sinal para outra sala');
  igual(c.ws.eventos('sinal').length, 0, 'nada chegou a C');
});
await teste('mesmo identificador: o aparelho antigo é avisado e desconectado', async () => {
  const s = novaSala(); const id = hexId(); const a1 = await entrar(s, { id, nome: 'A1' }); const a2 = await entrar(s, { id, nome: 'A2' });
  verdade(a1.ws.eventos('substituido').length === 1 && a1.ws.fechado, 'o antigo deveria receber "substituido" e fechar'); igual(a2.ws.ultimo('aparelhos').map((x) => x.nome), ['A2'], 'só o novo na lista');
});
await teste('limites: sala com código aceita 20 aparelhos; sala da rede também 20, avisando "rede grande"', async () => {
  for (const [rede, motivo] of [['0', 'sala-cheia'], ['1', 'rede-grande']]) {
    const s = novaSala(); for (let i = 0; i < LIMITES.sala; i++) await entrar(s, { rede });
    const extra = await entrar(s, { rede }); igual(extra.ws.ultimo('erro').motivo, motivo, 'motivo'); verdade(extra.ws.fechado, 'deveria fechar'); igual(s.visiveis().length, LIMITES.sala, 'a lista não cresce');
  }
});
await teste('sair remove o aparelho e avisa os outros; entradas inválidas são recusadas', async () => {
  const s = novaSala(); const a = await entrar(s, { nome: 'A' }), b = await entrar(s, { nome: 'B' });
  await s.webSocketClose(b.ws); igual(a.ws.ultimo('aparelhos').map((x) => x.nome), ['A'], 'B saiu da lista');
  igual((await entrar(s, { id: 'xyz' })).status, 400, 'identificador inválido'); igual((await s.fetch(new Request('https://x/api/ws?id=' + hexId()))).status, 426, 'sem upgrade');
  igual((await post(s, '/api/sinal', '{quebrado')).status, 400, 'JSON inválido'); igual((await post(s, '/api/sinal', 'x'.repeat(LIMITES.corpo + 10))).status, 413, 'corpo grande');
  igual((await s.fetch(new Request('https://x/api/inexistente'))).status, 404, 'rota inexistente');
});
await teste('nomes e tipos são higienizados', async () => {
  const s = novaSala(); const a = await entrar(s, { nome: '<img src=x onerror=1>Ana\u0007', tipo: 'geladeira' }); const lista = a.ws.ultimo('aparelhos'); igual(lista[0].nome, 'img src=x onerror=1Ana', 'sem < > nem controle'); igual(lista[0].tipo, 'laptop', 'tipo desconhecido vira laptop');
});

console.log(`\n${ok} testes passaram, ${falhas.length} falharam.`);
process.exit(falhas.length ? 1 : 0);
