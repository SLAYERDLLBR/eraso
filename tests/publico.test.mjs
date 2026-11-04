// Teste de ponta a ponta no modo PÚBLICO: dois navegadores reais, servidor em processo separado com ERASO_PUBLICO=1.
// Cobre a tela "Entre numa sala", o convite por link, a descoberta dentro da sala e uma transferência real
// (o arquivo salvo é comparado byte a byte). Uso:  node tests/publico.test.mjs

import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const EDGE = process.env.EDGE || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const matarArvore = (p) => { try { if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(p.pid), '/T', '/F'], { stdio: 'ignore' }); else p.kill(); } catch { /* já encerrado */ } };
const PORTA = 9800 + Math.floor(Math.random() * 150), BASE = `http://127.0.0.1:${PORTA}`, APP = `${BASE}/app/index.html?sem-intro`;
const servidor = spawn(process.execPath, [join(RAIZ, 'server', 'servidor.mjs')], { env: { ...process.env, PORT: String(PORTA), ERASO_PUBLICO: '1' }, stdio: 'ignore' });
for (let i = 0; i < 50; i++) { try { await fetch(`${BASE}/saude`); break; } catch { await dormir(100); } }
const procs = [servidor];

async function navegador(rotulo) {
  const porta = 9500 + Math.floor(Math.random() * 280), dados = mkdtempSync(join(tmpdir(), 'edge-pub-')), downloads = mkdtempSync(join(tmpdir(), 'dl-pub-'));
  const proc = spawn(EDGE, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${porta}`, `--user-data-dir=${dados}`, 'about:blank'], { stdio: 'ignore' }); procs.push(proc);
  let t; for (let i = 0; i < 60; i++) { try { t = await (await fetch(`http://127.0.0.1:${porta}/json`)).json(); break; } catch { await dormir(200); } }
  const ws = new WebSocket(t.find((x) => x.type === 'page').webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let id = 0; const P = new Map(); const erros = [];
  ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && P.has(m.id)) { P.get(m.id)(m); P.delete(m.id); } else if (m.method === 'Runtime.exceptionThrown') erros.push(m.params.exceptionDetails.exception?.description?.split('\n')[0]); else if (m.method === 'Log.entryAdded' && /Content Security Policy/i.test(m.params.entry.text || '')) erros.push('CSP: ' + m.params.entry.text.slice(0, 160)); });
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; P.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads });
  return { rotulo, erros, downloads,
    async ev(expr) { const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.result.exceptionDetails) throw new Error(`[${rotulo}] erro na página: ` + (r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text)); return r.result.result.value; },
    async abrir(url = APP) { await send('Page.navigate', { url }); await dormir(1300); }, fechar() { ws.close(); matarArvore(proc); } };
}
async function ate(fn, ms = 15000, msg = 'condição') { const t0 = Date.now(); for (;;) { let v; try { v = await fn(); } catch (e) { v = false; if (Date.now() - t0 > ms) throw e; } if (v) return v; if (Date.now() - t0 > ms) throw new Error(`Tempo esgotado: ${msg}`); await dormir(100); } }
let ok = 0; const falhas = [];
async function teste(nome, fn) { const t0 = Date.now(); try { await fn(); ok++; console.log(`  ✓ ${nome} (${Date.now() - t0} ms)`); } catch (e) { falhas.push([nome, e.message]); console.log(`  ✗ ${nome}\n      ${e.message}`); } }
const igual = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${m}: esperado ${JSON.stringify(b)}, obtido ${JSON.stringify(a)}`); };
const verdade = (c, m) => { if (!c) throw new Error(m); };

const A = await navegador('A'), B = await navegador('B');
console.log(`\nServidor público de teste ${BASE}\n`);

await teste('sem sala, o app pede o código e não mostra nenhum aparelho', async () => {
  await A.abrir(); await ate(async () => (await A.ev('S.net')) === 'sem-sala', 8000, 'estado sem-sala');
  verdade(/Entre numa sala/.test(await A.ev(`document.querySelector('[data-grid]').innerText`)), 'tela de sala ausente');
  igual(await A.ev(`document.querySelectorAll('.card[data-dev]').length`), 0, 'cartões');
});
await teste('criar sala pela interface conecta o aparelho', async () => {
  await A.ev(`document.querySelector('[data-sala-gerar]').click();1`); await ate(async () => (await A.ev('S.net')) === 'conectado', 8000, 'conectar na sala');
  verdade(/^[a-z0-9]{10}$/.test(await A.ev('SALA')), 'código gerado fora do padrão');
});
await teste('o convite leva o outro aparelho para a mesma sala e os dois se veem', async () => {
  const convite = await A.ev('conviteDaSala()'); verdade(/\/app\/index\.html\?sala=[a-z0-9]{10}$/.test(convite), 'convite: ' + convite);
  await B.abrir(convite + '&sem-intro'); await ate(async () => (await A.ev('DEVICES.length')) === 1 && (await B.ev('DEVICES.length')) === 1, 12000, 'descoberta na sala');
});
await teste('transferência real pelo modo público: arquivo de 2 MB chega idêntico', async () => {
  await A.ev(`(async()=>{const b=new Uint8Array(2*1024*1024);for(let o=0;o<b.length;o+=65536)crypto.getRandomValues(b.subarray(o,o+65536));window.__sha=[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('');addItems([{name:'prova.bin',size:b.length,kind:'file',file:new File([b],'prova.bin')}]);document.querySelector('.card[data-dev]').click();return 1})()`);
  await ate(() => B.ev(`!!document.querySelector('[data-req-accept]')&&!document.querySelector('[data-req-accept]').closest('[hidden]')`), 15000, 'pedido chegar em B');
  await B.ev(`document.querySelector('[data-req-accept]').click();1`);
  await ate(async () => readdirSync(B.downloads).filter((f) => !f.endsWith('.crdownload')).length === 1, 30000, 'arquivo salvo em B');
  const arq = readdirSync(B.downloads).find((f) => !f.endsWith('.crdownload')); const salvo = createHash('sha256').update(readFileSync(join(B.downloads, arq))).digest('hex');
  igual(salvo, await A.ev('window.__sha'), 'SHA-256 do arquivo salvo'); igual(arq, 'prova.bin', 'nome');
});
await teste('nenhuma violação da política de segurança de conteúdo nem erro de JavaScript', async () => {
  igual(A.erros, [], 'erros em A'); igual(B.erros, [], 'erros em B');
});

A.fechar(); B.fechar(); servidor.kill();
console.log(`\n${ok} testes passaram, ${falhas.length} falharam.`);
process.exit(falhas.length ? 1 : 0);
