// Grava o vídeo quadro a quadro: o app REAL roda dentro do compositor (iframes), com o relógio virtual do
// navegador avançando em passos de 1/30 s. Nenhum código do app é alterado; a cena é preparada pelo
// console (como o botão "Simular" do app) e as interações são mouse/toque reais via CDP.
//
// Uso:  node gravar.mjs <pastaQuadros> <urlBase> [--medir] [--de N] [--ate N]
//   --medir  roda sem capturar imagens e imprime os instantes reais (aceite, fim das transferências)

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as R from './roteiro-final.mjs';

const OUT = process.argv[2]; const BASE = process.argv[3];
const MEDIR = process.argv.includes('--medir');
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? Number(process.argv[i + 1]) : d; };
const DE = arg('--de', 0), ATE = arg('--ate', Math.round(R.DURACAO * R.FPS));
mkdirSync(OUT, { recursive: true });
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const port = 9400 + Math.floor(Math.random() * 400);
const proc = spawn(EDGE, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--lang=pt-BR', '--force-color-profile=srgb', '--disable-threaded-animation', '--run-all-compositor-stages-before-draw', '--disable-new-content-rendering-timeout', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'edge-gv-'))}`, 'about:blank'], { stdio: 'ignore' });
let tg; for (let i = 0; i < 60; i++) { try { tg = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(200); } }
const ws = new WebSocket(tg.find((x) => x.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0; const P = new Map(); const waiters = [];
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && P.has(m.id)) { P.get(m.id)(m); P.delete(m.id); } else if (m.method) for (const w of [...waiters]) if (w.m === m.method) { waiters.splice(waiters.indexOf(w), 1); w.r(m); } });
let fase = '';
const send = (method, params = {}, ms = 20000) => new Promise((r, rej) => { const i = ++id; P.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); setTimeout(() => { if (P.has(i)) { P.delete(i); rej(new Error(`travou: ${method} (${fase})`)); } }, ms); });
const once = (m) => new Promise((r) => waiters.push({ m, r }));
const ev = async (expression) => { const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text); return r.result.result.value; };
await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
await send('Page.navigate', { url: BASE + '/docs/video/producao/compositor.html' }); await sleep(1800);
if (!(await ev('window.__ok'))) throw new Error('compositor não carregou');

// Relógio virtual: avança `ms` de tempo do app e espera o navegador sinalizar.
const avancar = async (ms) => { const fim = once('Emulation.virtualTimeBudgetExpired'); await send('Emulation.setVirtualTimePolicy', { policy: 'pauseIfNetworkFetchesPending', budget: ms }); await Promise.race([fim, sleep(8000)]); };
await send('Emulation.setVirtualTimePolicy', { policy: 'pause' });

const entrada = async (m, p) => { let fim = false; const pr = send(m, p, 30000).then(() => { fim = true; }, () => { fim = true; }); for (let i = 0; i < 60 && !fim; i++) { await sleep(15); if (fim) break; await avancar(1); } await pr; };
const STEP = 1000 / R.FPS;
const fator = (t) => (t >= R.LENTO.ini && t < R.LENTO.fim ? R.LENTO.fator : 1);
const acoes = [...R.ACOES].sort((a, b) => a[0] - b[0]); let ia = 0;
const clique = async (p) => { await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: p.x, y: p.y }); await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: p.x, y: p.y, button: 'left', clickCount: 1 }); await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: p.x, y: p.y, button: 'left', clickCount: 1 }); };
const marcos = {}; const marca = (k, t) => { if (marcos[k] == null) { marcos[k] = +t.toFixed(2); console.log(`  · ${k} em ${t.toFixed(2)} s`); } };
let info = null, ultimoMouse = '', visto = {};

for (let f = 0; f <= ATE; f++) {
  const t = f / R.FPS; fase = `quadro ${f}`;
  if (f > 0) await avancar(STEP * fator(t) - 1);
  while (ia < acoes.length && acoes[ia][0] <= t + 1e-6) {
    const [, nome] = acoes[ia++]; fase = 'ação ' + nome;
    if (nome === 'carregar') {
      await ev('carregar()'); for (let i = 0; i < 40; i++) { await avancar(100); if (await ev(`(()=>{try{return typeof fd.contentWindow.setTheme==='function'&&typeof fp.contentWindow.setTheme==='function'}catch(e){return false}})()`).catch(() => false)) break; }
      await avancar(250); await ev('preparar()'); console.log('  · app carregado e preparado');
    } else if (nome === 'clicar-aba') { if (info?.aba) await clique(info.aba); }
    else if (nome === 'clicar-arara') { if (info?.arara) await clique(info.arara); }
    else if (nome === 'aceitar-celular') { if (info?.acceptPage) await clique(info.acceptPage); }
    else await ev(`acao(${JSON.stringify(nome)})`);
  }
  info = await ev(`render(${t})`);
  if (info?.cursorPage) { const k = `${Math.round(info.cursorPage.x)},${Math.round(info.cursorPage.y)}`; if (k !== ultimoMouse) { ultimoMouse = k; await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: info.cursorPage.x, y: info.cursorPage.y }); } }
  await avancar(1); // 1 ms para o navegador produzir o quadro novo (sem isso a captura trava)
  if (MEDIR && f % 30 === 0 && t > 11) console.log(t.toFixed(1), JSON.stringify(await ev('estado()').catch((e) => String(e).slice(0, 120))), info && JSON.stringify({ a: info.arara, c: info.cursorPage }));
  if (process.argv.includes('--anim') && f % 20 === 0 && t > 24.5) console.log(t.toFixed(2), await ev(`(()=>{const w=fp.contentWindow;return JSON.stringify({pn:Math.round(w.performance.now()),tl:Math.round(w.document.timeline.currentTime),anims:w.document.getAnimations().slice(0,6).map(a=>[a.animationName||a.constructor.name,Math.round(a.currentTime),a.playState])})})()`));
  if (process.argv.includes('--probe2') && f === 800) console.log(await ev(`(()=>{const w=fp.contentWindow,d=w.document;const q=(x,y)=>{const e=d.elementFromPoint(x,y);return e?e.tagName+'.'+e.className+'#'+e.id:null};const dlg=d.querySelector('[data-req]');return JSON.stringify({name:q(190,470),acc:q(270,764),dlgTag:dlg.tagName,dlgOpen:dlg.open,dlgCls:dlg.className,html:dlg.innerHTML.slice(0,600),anim:dlg.getAnimations({subtree:true}).map(a=>[a.animationName,a.playState,a.effect.target.className])})})()`));
  if (process.argv.includes('--probe') && f === 800) console.log(await ev(`(()=>{const w=fp.contentWindow,d=w.document;const o={};for(const [k,sel] of Object.entries({dlg:'[data-req]',name:'#req-name',acc:'[data-req-accept]',dec:'[data-req-decline]',prev:'.previews'})){const e=d.querySelector(sel);if(!e){o[k]=null;continue}const cs=w.getComputedStyle(e),b=e.getBoundingClientRect();o[k]=[Math.round(b.left),Math.round(b.top),Math.round(b.width),Math.round(b.height),cs.opacity,cs.visibility,cs.transform.slice(0,30),cs.color]}return JSON.stringify(o)})()`));
  if (process.argv.includes('--var') && f === 796) await ev(`fp.contentWindow.eval(${JSON.stringify(process.argv[process.argv.indexOf('--var') + 1])})`);
  if (f % 15 === 0) {
    const st = await ev('estado()').catch(() => null);
    if (st?.desk) { if (st.desk[0] === 'active') marca('desktop transferindo', t); if (st.desk[0] === 'ok') marca('desktop concluído', t); }
    if (st?.ph) { if (st.ph[0] === 'active') marca('celular recebendo', t); if (st.ph[0] === 'ok') marca('celular concluído', t); }
  }
  if (!MEDIR && f >= DE && !existsSync(join(OUT, `f${String(f).padStart(5, '0')}.png`))) {
    fase = `captura ${f}`; let s = null;
    for (let k = 0; k < 3; k++) { await ev('nudge()'); await avancar(1); await sleep(45); } // dá tempo ao navegador de rasterizar o quadro novo
    for (let tent = 0; tent < 12 && !s; tent++) {
      await ev('nudge()');
      const p = send('Page.captureScreenshot', { format: 'png' }, 30000).catch(() => null);
      s = await Promise.race([p, sleep(1500).then(() => null)]);
      if (!s) { if (tent > 0) console.log('  ! tentativa', tent, 'no quadro', f); await ev(`render(${t})`); await avancar(1); }
    }
    if (!s) throw new Error('captura falhou no quadro ' + f);
    writeFileSync(join(OUT, `f${String(f).padStart(5, '0')}.png`), Buffer.from(s.result.data, 'base64'));
  }
  if (f % 150 === 0) console.log(`quadro ${f}/${ATE} (${t.toFixed(1)} s)`);
}
console.log('marcos', JSON.stringify(marcos));
ws.close(); proc.kill(); process.exit(0);



