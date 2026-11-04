// Teste de ponta a ponta do aplicativo com o serviço da Cloudflare: o site é montado como no GitHub Pages, o serviço roda no
// Wrangler (o mesmo motor da Cloudflare: Durable Objects e WebSocket), e dois navegadores reais se encontram sozinhos,
// trocam arquivo e usam salas. Não faz parte do `npm test` porque o Wrangler precisa ser baixado (npx).
//
// Uso:  npm run test:nuvem
//       ERASO_WORKER_URL=http://127.0.0.1:8787 npm run test:nuvem   (usa um `wrangler dev` que já esteja rodando)
//
// O servidor de arquivos do teste troca config.js (endereço do serviço) e libera o endereço do serviço na política de conteúdo,
// porque no build real isso vem de https://… ; o restante do aplicativo é o mesmo que vai para o GitHub Pages.

import { spawn, spawnSync } from 'node:child_process';
import { createServer, request as pedir } from 'node:http';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, extname, join, normalize, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const EDGE = process.env.EDGE || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const matarArvore = (p) => { try { if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(p.pid), '/T', '/F'], { stdio: 'ignore' }); else p.kill(); } catch { /* já encerrado */ } };
const SAIDA = '_site-nuvem', PASTA = join(RAIZ, SAIDA), BASE = '/eraso';
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml' };
const procs = [];

// ---------- serviço (Wrangler) ----------
let WORKER = process.env.ERASO_WORKER_URL || '', wrangler = null, criouVars = false; const dir = join(RAIZ, 'cloudflare'), vars = join(dir, '.dev.vars');
if (!WORKER) {
  if (!existsSync(vars)) { writeFileSync(vars, 'ALLOWED_ORIGINS="http://127.0.0.1:*,http://localhost:*"\n'); criouVars = true; }
  const porta = 8800 + Math.floor(Math.random() * 100); WORKER = `http://127.0.0.1:${porta}`;
  wrangler = spawn('npx', ['--yes', 'wrangler@latest', 'dev', '--port', String(porta), '--ip', '127.0.0.1', '--local'], { cwd: dir, shell: true, stdio: 'ignore' });
  for (let i = 0; i < 150; i++) { try { if ((await fetch(`${WORKER}/saude`)).ok) break; } catch { /* ainda subindo */ } await dormir(500); }
}
try { igualOuSai((await fetch(`${WORKER}/saude`)).status, 200, 'o serviço não subiu'); } catch (e) { console.error('Não foi possível iniciar o serviço (wrangler dev):', e.message); fim(1); }
function igualOuSai(a, b, m) { if (a !== b) throw new Error(m); }
function fim(codigo) { if (wrangler) matarArvore(wrangler); if (criouVars) rmSync(vars, { force: true }); rmSync(PASTA, { recursive: true, force: true }); procs.forEach(matarArvore); process.exit(codigo); }

// ---------- site montado como no Pages, servido com o endereço do serviço ----------
const b = spawnSync(process.execPath, [join(RAIZ, 'scripts', 'build-pages.mjs'), SAIDA], { env: { ...process.env, SITE_URL: '', ERASO_APP_URL: '', ERASO_SERVIDOR_URL: '' }, encoding: 'utf8' });
if (b.status !== 0) { console.error(b.stderr || b.stdout); fim(1); }
const estatico = (servidorNoConfig) => createServer((req, res) => {
  const caminho = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (caminho === `${BASE}/app/config.js`) { res.writeHead(200, { 'content-type': MIME['.js'] }); return res.end(`window.ERASO_CONFIG = { servidor: '${servidorNoConfig}' };`); }
  let arq = null; if (caminho.startsWith(BASE + '/')) { const a = normalize(join(PASTA, caminho.slice(BASE.length + 1))); if (a.startsWith(PASTA + sep) && existsSync(a) && statSync(a).isFile()) arq = a; }
  if (!arq) { res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' }); return res.end(readFileSync(join(PASTA, '404.html'))); }
  let corpo = readFileSync(arq);
  if (arq.endsWith(join('app', 'index.html'))) corpo = Buffer.from(corpo.toString('utf8').replace("connect-src 'self'", `connect-src 'self' ${servidorNoConfig} ${servidorNoConfig.replace(/^http/, 'ws')}`));
  res.writeHead(200, { 'content-type': MIME[extname(arq)] || 'application/octet-stream' }); res.end(corpo);
});
const srvOk = estatico(WORKER), srvSemServico = estatico('http://127.0.0.1:9'); // o segundo aponta para uma porta fechada
await Promise.all([srvOk, srvSemServico].map((s) => new Promise((r) => s.listen(0, '127.0.0.1', r))));
const APP = `http://127.0.0.1:${srvOk.address().port}${BASE}/app/index.html?sem-intro`, APP_SEM = `http://127.0.0.1:${srvSemServico.address().port}${BASE}/app/index.html?sem-intro`;

async function navegador(rotulo) {
  const porta = 9500 + Math.floor(Math.random() * 400), dados = mkdtempSync(join(tmpdir(), 'edge-nuv-')), downloads = mkdtempSync(join(tmpdir(), 'dl-nuv-'));
  const proc = spawn(EDGE, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${porta}`, `--user-data-dir=${dados}`, 'about:blank'], { stdio: 'ignore' }); procs.push(proc);
  let t; for (let i = 0; i < 60; i++) { try { t = await (await fetch(`http://127.0.0.1:${porta}/json`)).json(); break; } catch { await dormir(200); } }
  const ws = new WebSocket(t.find((x) => x.type === 'page').webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let id = 0; const P = new Map(); const erros = [];
  ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && P.has(m.id)) { P.get(m.id)(m); P.delete(m.id); } else if (m.method === 'Runtime.exceptionThrown') erros.push(m.params.exceptionDetails.exception?.description?.split('\n')[0]); else if (m.method === 'Log.entryAdded' && /Content Security Policy|Refused to/i.test(m.params.entry.text || '')) erros.push('CSP: ' + m.params.entry.text.slice(0, 160)); });
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; P.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1100, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads });
  return { rotulo, erros, downloads,
    async ev(expr) { const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.result.exceptionDetails) throw new Error(`[${rotulo}] erro na página: ` + (r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text)); return r.result.result.value; },
    async abrir(url = APP) { await send('Page.navigate', { url }); await dormir(1500); },
    fechar() { try { send('Page.close'); } catch { /* ok */ } setTimeout(() => { ws.close(); matarArvore(proc); }, 300); } };
}
async function ate(fn, ms = 15000, msg = 'condição') { const t0 = Date.now(); for (;;) { let v; try { v = await fn(); } catch (e) { v = false; if (Date.now() - t0 > ms) throw e; } if (v) return v; if (Date.now() - t0 > ms) throw new Error(`Tempo esgotado: ${msg}`); await dormir(100); } }
let ok = 0; const falhas = [];
async function teste(nome, fn) { const t0 = Date.now(); try { await fn(); ok++; console.log(`  ✓ ${nome} (${Date.now() - t0} ms)`); } catch (e) { falhas.push([nome, e.message]); console.log(`  ✗ ${nome}\n      ${e.message}`); } }
const igual = (a, b2, m) => { if (JSON.stringify(a) !== JSON.stringify(b2)) throw new Error(`${m}: esperado ${JSON.stringify(b2)}, obtido ${JSON.stringify(a)}`); };
const verdade = (c, m) => { if (!c) throw new Error(m); };
const clicar = (n, sel) => n.ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)throw new Error('não achei ${sel.replace(/'/g, '')}');e.click();return 1})()`);
const nomes = (n) => n.ev('DEVICES.map(d=>d.name).sort()');
const sha = (buf) => createHash('sha256').update(buf).digest('hex');
/** GET com cabeçalho Origin arbitrário (o fetch do Node não deixa definir esse cabeçalho). */
const comOrigem = (url, origem) => new Promise((ok2, erro) => { const u = new URL(url); const r = pedir({ hostname: u.hostname, port: u.port, path: u.pathname + u.search, headers: { origin: origem } }, (res) => { res.resume(); ok2(res.statusCode); }); r.on('error', erro); r.end(); });

const A = await navegador('A'), B = await navegador('B');
console.log(`\nServiço ${WORKER} · aplicativo ${APP.replace(/\?.*/, '')}\n`);
try {
  await teste('o serviço só aceita o site permitido e responde sem sala a partir do endereço de rede', async () => {
    igual(await comOrigem(`${WORKER}/api/config`, 'https://evil.example'), 403, 'config de origem estranha'); igual(await comOrigem(`${WORKER}/api/aparelhos?sala=abc123`, 'https://evil.example'), 403, 'API de origem estranha');
    igual(await comOrigem(`${WORKER}/api/config`, 'http://127.0.0.1:1234'), 200, 'origem permitida');
  });
  await teste('no mesmo Wi-Fi os aparelhos se encontram sozinhos, sem código, sem QR e sem passo nenhum', async () => {
    await A.abrir(); await B.abrir();
    await ate(async () => (await A.ev('S.net')) === 'conectado' && (await B.ev('S.net')) === 'conectado', 15000, 'conectar ao serviço'); igual(await A.ev('REDE.config.modo'), 'nuvem', 'modo');
    await ate(async () => (await A.ev('DEVICES.length')) === 1 && (await B.ev('DEVICES.length')) === 1, 15000, 'descoberta automática');
    igual((await nomes(A))[0], await B.ev('ME.name'), 'A vê B'); igual((await nomes(B))[0], await A.ev('ME.name'), 'B vê A');
    verdade(/nesta rede/.test(await A.ev(`document.querySelector('[data-scan-text]').innerText`)), 'texto de status deveria dizer "nesta rede"');
    verdade(await A.ev(`!document.querySelector('.dest-head [data-pair-open]').hidden`), 'o pareamento por QR continua disponível como alternativa');
  });
  await teste('transferência real pela nuvem: arquivo de 3 MB de A chega idêntico em B (o serviço só intermedia o início)', async () => {
    await A.ev(`(async()=>{const b=new Uint8Array(3*1024*1024);for(let o=0;o<b.length;o+=65536)crypto.getRandomValues(b.subarray(o,o+65536));window.__sha=[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('');addItems([{name:'pela-nuvem.bin',size:b.length,kind:'file',file:new File([b],'pela-nuvem.bin')}]);document.querySelector('.card[data-dev]').click();return 1})()`);
    await ate(() => B.ev(`!document.querySelector('[data-req-scrim]').hidden`), 20000, 'pedido em B'); await clicar(B, '[data-req-accept]');
    await ate(() => readdirSync(B.downloads).filter((f) => !f.endsWith('.crdownload')).length === 1, 40000, 'arquivo salvo em B');
    const arq = readdirSync(B.downloads).find((f) => !f.endsWith('.crdownload')); igual(sha(readFileSync(join(B.downloads, arq))), await A.ev('window.__sha'), 'SHA-256'); igual(arq, 'pela-nuvem.bin', 'nome');
  });
  await teste('nome novo chega ao outro aparelho e fechar a página tira o aparelho da lista', async () => {
    await B.ev(`ME.name='Celular da Bia';salvarPrefs();REDE.atualizarPerfil({nome:ME.name});1`); await ate(async () => (await A.ev('DEVICES[0]?.name')) === 'Celular da Bia', 8000, 'nome novo em A');
  });
  await teste('salas com código curto: separam, reúnem, e o código tem 6 letras fáceis de digitar', async () => {
    const codigo = await A.ev(`(()=>{const c=novaSala();return c})()`); verdade(/^[a-z2-9]{6}$/.test(codigo), 'código gerado: ' + codigo);
    await A.ev(`entrarNaSala(${JSON.stringify(codigo)})`); await ate(async () => (await A.ev('DEVICES.length')) === 0 && (await B.ev('DEVICES.length')) === 0, 10000, 'separação');
    await ate(async () => new RegExp(`nesta sala ${codigo.toUpperCase()}`).test(await A.ev(`document.querySelector('[data-scan-text]').innerText`)), 10000, 'o código aparece no status');
    await B.ev(`entrarNaSala(${JSON.stringify(codigo)})`); await ate(async () => (await A.ev('DEVICES.length')) === 1 && (await B.ev('DEVICES.length')) === 1, 10000, 'reencontro na sala');
    igual(await A.ev(`entrarNaSala('abc')`), false, 'código curto demais é recusado'); await A.ev(`entrarNaSala('')`); await B.ev(`entrarNaSala('')`);
    await ate(async () => (await A.ev('DEVICES.length')) === 1 && (await B.ev('DEVICES.length')) === 1, 10000, 'de volta à rede');
  });
  await teste('se a conexão com o serviço cai, o aplicativo reconecta sozinho e os aparelhos voltam', async () => {
    await A.ev('REDE._ws.close()'); await ate(async () => (await A.ev('S.net')) === 'reconectando', 5000, 'estado reconectando');
    await ate(async () => (await A.ev('S.net')) === 'conectado' && (await A.ev('DEVICES.length')) === 1, 15000, 'reconectar');
  });
  await teste('se o serviço estiver fora do ar, o aplicativo cai no pareamento por QR Code (nada quebra)', async () => {
    const C = await navegador('C'); try { await C.abrir(APP_SEM); await ate(async () => (await C.ev('S.net')) === 'manual', 15000, 'modo manual'); igual(await C.ev('REDE.config.modo'), 'manual', 'modo'); verdade(/Pareie o primeiro aparelho/.test(await C.ev(`document.querySelector('[data-grid]').innerText`)), 'tela de pareamento'); igual(C.erros.filter((e) => !/fetch|network|Failed/i.test(e)), [], 'erros em C'); } finally { C.fechar(); }
  });
  await teste('fechar a página tira o aparelho da lista dos outros; sem erro de JavaScript nem violação de política de conteúdo', async () => {
    B.fechar(); await ate(async () => (await A.ev('DEVICES.length')) === 0, 15000, 'B sair da lista de A');
    igual(A.erros, [], 'erros em A'); igual(B.erros, [], 'erros em B');
  });
} finally { A.fechar(); await dormir(500); }
console.log(`\n${ok} testes passaram, ${falhas.length} falharam.`);
fim(falhas.length ? 1 : 0);
