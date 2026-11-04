// Teste de ponta a ponta do aplicativo SEM SERVIDOR, como no GitHub Pages: o site montado por scripts/build-pages.mjs é
// servido sob /eraso/ por um servidor de arquivos comum (sem /api), e dois navegadores reais se pareiam por código.
// O QR Code mostrado em cada tela é lido de volta com jsQR, a transferência é conferida byte a byte.
// Uso:  node tests/manual.test.mjs
//       ERASO_URL=https://usuario.github.io/eraso/app/index.html node tests/manual.test.mjs   (testa o site JÁ PUBLICADO, sem montar nem servir nada)

import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, extname, join, normalize, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const EDGE = process.env.EDGE || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const matarArvore = (p) => { try { if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(p.pid), '/T', '/F'], { stdio: 'ignore' }); else p.kill(); } catch { /* já encerrado */ } };
const SAIDA = '_site-manual', PASTA = join(RAIZ, SAIDA), BASE = '/eraso';
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };

const PUBLICADO = process.env.ERASO_URL ? new URL(process.env.ERASO_URL) : null;
if (!PUBLICADO) {
  const b = spawnSync(process.execPath, [join(RAIZ, 'scripts', 'build-pages.mjs'), SAIDA], { env: { ...process.env, SITE_URL: '', ERASO_APP_URL: '' }, encoding: 'utf8' });
  if (b.status !== 0) { console.error(b.stderr || b.stdout); process.exit(1); }
}
const srv = createServer((req, res) => {   // servidor de arquivos estáticos puro: não existe /api, como no GitHub Pages
  const caminho = decodeURIComponent(new URL(req.url, 'http://x').pathname); let arq = null;
  if (caminho.startsWith(BASE + '/')) { const a = normalize(join(PASTA, caminho.slice(BASE.length + 1))); if (a.startsWith(PASTA + sep) && existsSync(a) && statSync(a).isFile()) arq = a; }
  if (arq) { res.writeHead(200, { 'content-type': MIME[extname(arq)] || 'application/octet-stream' }); return res.end(readFileSync(arq)); }
  res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' }); res.end(readFileSync(join(PASTA, '404.html')));
});
if (!PUBLICADO) await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const ORIGEM = PUBLICADO ? PUBLICADO.origin : `http://127.0.0.1:${srv.address().port}`;
const BASE_SITE = PUBLICADO ? PUBLICADO.pathname.replace(/\/app\/index\.html$/, '').replace(/\/$/, '') : BASE;
const APP = PUBLICADO ? `${PUBLICADO.origin}${PUBLICADO.pathname}?sem-intro` : `${ORIGEM}${BASE}/app/index.html?sem-intro`;
const procs = [];

async function navegador(rotulo) {
  const porta = 9500 + Math.floor(Math.random() * 400), dados = mkdtempSync(join(tmpdir(), 'edge-man-')), downloads = mkdtempSync(join(tmpdir(), 'dl-man-'));
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
    async abrir(url = APP) { await send('Page.navigate', { url }); await dormir(1400); },
    fechar() { try { send('Page.close'); } catch { /* ok */ } setTimeout(() => { ws.close(); matarArvore(proc); }, 300); } };
}
async function ate(fn, ms = 15000, msg = 'condição') { const t0 = Date.now(); for (;;) { let v; try { v = await fn(); } catch (e) { v = false; if (Date.now() - t0 > ms) throw e; } if (v) return v; if (Date.now() - t0 > ms) throw new Error(`Tempo esgotado: ${msg}`); await dormir(100); } }
let ok = 0; const falhas = [];
async function teste(nome, fn) { const t0 = Date.now(); try { await fn(); ok++; console.log(`  ✓ ${nome} (${Date.now() - t0} ms)`); } catch (e) { falhas.push([nome, e.message]); console.log(`  ✗ ${nome}\n      ${e.message}`); } }
const igual = (a, b2, m) => { if (JSON.stringify(a) !== JSON.stringify(b2)) throw new Error(`${m}: esperado ${JSON.stringify(b2)}, obtido ${JSON.stringify(a)}`); };
const verdade = (c, m) => { if (!c) throw new Error(m); };
const clicar = (n, sel) => n.ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)throw new Error('não achei ${sel.replace(/'/g, '')}');e.click();return 1})()`);
const texto = (n, sel) => n.ev(`document.querySelector(${JSON.stringify(sel)})?.innerText||''`);
/** Lê o QR Code desenhado na tela do diálogo, com a mesma biblioteca que a câmera usa. */
const lerQr = (n) => n.ev(`(async()=>{ if(!window.jsQR) await new Promise((r,e)=>{const s=document.createElement('script');s.src='vendor/jsQR.js';s.onload=r;s.onerror=e;document.head.appendChild(s)});
  const c=document.querySelector('[data-modal] [data-pair-qr]'); if(!c) return null; const x=c.getContext('2d').getImageData(0,0,c.width,c.height); const r=window.jsQR(x.data,c.width,c.height); return r?r.data:null })()`);
const sha = (buf) => createHash('sha256').update(buf).digest('hex');

const A = await navegador('A'), B = await navegador('B');
console.log(`\nSite sem servidor em ${ORIGEM}${BASE_SITE}/${PUBLICADO ? ' (publicado)' : ''}\n`);
try {
  await teste('sem /api, o app abre em "modo sem servidor" e oferece o pareamento (nenhum aparelho fictício)', async () => {
    await A.abrir(); await ate(async () => (await A.ev('S.net')) === 'manual', 8000, 'modo manual');
    verdade(/Pareie o primeiro aparelho/.test(await texto(A, '[data-grid]')), 'tela inicial do pareamento ausente'); igual(await A.ev(`document.querySelectorAll('.card[data-dev]').length`), 0, 'cartões');
    verdade(await A.ev(`!document.querySelector('.dest-head [data-pair-open]').hidden && document.querySelector('.dest-head [data-scan]').hidden`), 'botão Parear deveria aparecer no lugar de Buscar novamente');
    verdade(await A.ev(`document.querySelector('[data-sala-row]').hidden`), 'a linha de sala não existe sem servidor'); igual(await A.ev('REDE.base'), BASE_SITE, 'base do site');
  });
  let convite = '', resposta = '';
  await teste('A gera o convite: QR Code legível, com link do app e código válido', async () => {
    await clicar(A, '[data-pair-open]'); await ate(async () => /Parear aparelho/.test(await texto(A, '[data-modal]')), 5000, 'diálogo de pareamento');
    await clicar(A, '[data-pair-gerar]'); await ate(() => A.ev(`!!document.querySelector('[data-modal] [data-pair-resp]')`), 20000, 'convite gerado');
    convite = await ate(() => lerQr(A), 8000, 'ler o QR'); verdade(new RegExp(`^${(ORIGEM + BASE_SITE).replace(/[.]/g, '\\.')}/app/index\\.html#p=E1\\.[zp][A-Za-z0-9_-]+$`).test(convite), 'conteúdo do QR: ' + convite.slice(0, 120));
    verdade(convite.length < 1100, `convite grande demais para um QR confortável: ${convite.length} caracteres`);
  });
  await teste('B abre o link do QR: o código é aplicado, sai da barra de endereço e a resposta aparece em QR', async () => {
    await B.abrir(convite);
    try { await ate(() => B.ev(`/Mostre a resposta/.test(document.querySelector('[data-modal]')?.innerText||'')`), 30000, 'diálogo de resposta'); } catch (e) { throw new Error(`${e.message} | modal: ${(await texto(B, '[data-modal]')).slice(0, 300)} | net: ${await B.ev('S.net')} | erros: ${JSON.stringify(B.erros)}`); }
    igual(await B.ev('location.hash'), '', 'o código deveria sair da barra de endereço'); verdade(/Aparelho encontrado/.test(await texto(B, '[data-modal]')), 'B deveria nomear o aparelho de A');
    resposta = await ate(() => lerQr(B), 8000, 'ler o QR da resposta'); verdade(/^E1\.[zp][A-Za-z0-9_-]+$/.test(resposta), 'resposta: ' + resposta.slice(0, 100));
  });
  await teste('entradas inválidas mostram mensagem clara e não quebram: lixo, código adulterado e o próprio código', async () => {
    const tenta = async (valor) => { await A.ev(`(()=>{const t=document.querySelector('[data-pair-resp]');t.value=${JSON.stringify(valor)};document.querySelector('[data-pair-aplicar]').click();return 1})()`); await ate(async () => (await texto(A, '[data-pair-msg]')).length > 0 && !/Aplicando/.test(await texto(A, '[data-pair-msg]')), 5000, 'mensagem'); return texto(A, '[data-pair-msg]'); };
    verdade(/não parece um código/i.test(await tenta('qualquer coisa que não é código')), 'lixo');
    verdade(/incompleto ou foi alterado|inválid/i.test(await tenta(resposta.slice(0, resposta.length - 25) + 'AAAAAAAAAAAAAAAAAAAAAAAAA')), 'código adulterado');
    verdade(/de outro tipo|inválido/i.test(await tenta(convite)), 'colar o próprio convite no lugar da resposta');
  });
  await teste('A aplica a resposta: os dois ficam ligados, sem servidor, e se veem pelo nome real', async () => {
    await A.ev(`(()=>{const t=document.querySelector('[data-pair-resp]');t.value=${JSON.stringify(resposta)};document.querySelector('[data-pair-aplicar]').click();return 1})()`);
    await ate(async () => (await A.ev('DEVICES.length')) === 1 && (await B.ev('DEVICES.length')) === 1, 25000, 'ligação');
    igual(await A.ev('DEVICES[0].name'), await B.ev('ME.name'), 'A vê B'); igual(await B.ev('DEVICES[0].name'), await A.ev('ME.name'), 'B vê A');
    verdade(await A.ev(`document.querySelector('[data-modal-scrim]').hidden`) && await B.ev(`document.querySelector('[data-modal-scrim]').hidden`), 'o diálogo deveria fechar ao parear');
    verdade(/pareado/.test(await texto(A, '[data-scan-text]')), 'texto de status: ' + await texto(A, '[data-scan-text]')); igual(await A.ev('REDE._convites.size'), 0, 'convites pendentes em A');
  });
  await teste('transferência real sem servidor: arquivo de 3 MB de A chega idêntico em B', async () => {
    await A.ev(`(async()=>{const b=new Uint8Array(3*1024*1024);for(let o=0;o<b.length;o+=65536)crypto.getRandomValues(b.subarray(o,o+65536));window.__sha=[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('');addItems([{name:'sem-servidor.bin',size:b.length,kind:'file',file:new File([b],'sem-servidor.bin')}]);document.querySelector('.card[data-dev]').click();return 1})()`);
    await ate(() => B.ev(`!document.querySelector('[data-req-scrim]').hidden`), 20000, 'pedido em B'); await clicar(B, '[data-req-accept]');
    await ate(() => readdirSync(B.downloads).filter((f) => !f.endsWith('.crdownload')).length === 1, 40000, 'arquivo salvo em B');
    const arq = readdirSync(B.downloads).find((f) => !f.endsWith('.crdownload')); igual(sha(readFileSync(join(B.downloads, arq))), await A.ev('window.__sha'), 'SHA-256'); igual(arq, 'sem-servidor.bin', 'nome');
  });
  await teste('B envia de volta pela mesma ligação (outro canal): texto com acentos chega a A', async () => {
    await dormir(500);
    await B.ev(`addItems([textItem('Olá pelo pareamento: São João ☕')]);document.querySelector('.card[data-dev]').click();1`);
    await ate(() => A.ev(`!document.querySelector('[data-req-scrim]').hidden`), 20000, 'pedido em A'); verdade(/Olá pelo pareamento/.test(await texto(A, '[data-req]')), 'texto não aparece em A');
    await clicar(A, '[data-req-save]'); await ate(async () => /Olá pelo pareamento: São João ☕/.test(await A.ev('JSON.stringify(S.inbox.map(i=>i.body))')), 8000, 'texto salvo na Caixa de A');
  });
  await teste('mudar o nome em B chega a A pela ligação, e o diagnóstico mostra a latência da conexão direta', async () => {
    await B.ev(`ME.name='Notebook da Bia';salvarPrefs();REDE.atualizarPerfil({nome:ME.name});1`); await ate(async () => (await A.ev('DEVICES[0]?.name')) === 'Notebook da Bia', 8000, 'nome novo em A');
    const ms = await A.ev(`REDE.testarConexao({id:DEVICES[0].id,nome:DEVICES[0].name})`); verdade(Number.isFinite(ms) && ms >= 0 && ms < 5000, 'latência: ' + ms);
  });
  await teste('desfazer o pareamento remove o aparelho dos dois lados e envios novos falham com mensagem clara', async () => {
    const id = await A.ev('DEVICES[0].id'); await A.ev(`REDE.desligar(${JSON.stringify(id)});1`);
    await ate(async () => (await A.ev('DEVICES.length')) === 0 && (await B.ev('DEVICES.length')) === 0, 10000, 'lista vazia nos dois lados');
    const msg = await A.ev(`new Promise((r)=>{const e=REDE.enviar({id:${JSON.stringify(id)},nome:'Notebook da Bia'},[{kind:'text',name:'x',size:1,body:'x'}]);e.onstatus=(s,m)=>{if(s==='falhou')r(m)}})`); verdade(/não está mais ligado/.test(msg), 'mensagem: ' + msg);
    verdade(/Pareie o primeiro aparelho/.test(await texto(A, '[data-grid]')), 'A deveria voltar à tela de pareamento');
  });
  await teste('o leitor de câmera falha com mensagem clara quando não há câmera, e nenhum erro de JavaScript nem violação de política de conteúdo ocorreu', async () => {
    await clicar(A, '[data-pair-open]'); await clicar(A, '[data-pair-tenho]'); await clicar(A, '[data-pair-camera]');
    await ate(async () => (await texto(A, '[data-pair-msg]')).length > 5 && !/Abrindo a câmera/.test(await texto(A, '[data-pair-msg]')), 10000, 'mensagem da câmera'); const m = await texto(A, '[data-pair-msg]');
    verdade(/câmera|HTTPS|bloquead/i.test(m) && !/Requested device/.test(m), 'mensagem da câmera: ' + m);
    igual(A.erros, [], 'erros em A'); igual(B.erros, [], 'erros em B');
  });
} finally { A.fechar(); B.fechar(); await dormir(500); if (!PUBLICADO) { srv.close(); rmSync(PASTA, { recursive: true, force: true }); } procs.forEach(matarArvore); }

console.log(`\n${ok} testes passaram, ${falhas.length} falharam.`);
process.exit(falhas.length ? 1 : 0);
