// Captura os estados REAIS da interface do protótipo para o vídeo (Etapa 2).
// Não altera o código do app: abre a página, prepara o cenário pelo console (como o botão "Simular"
// do próprio app faz) e usa cliques e movimentos de mouse de verdade.
//
// Uso:  node capturar-estados.mjs <pastaSaida> <urlBase>
//   ex.: node capturar-estados.mjs ../capturas http://127.0.0.1:8770/app/index.html
//
// Saídas: PNGs em <pastaSaida> e geometria.json (retângulos dos elementos em cada estado, em px CSS).

import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const OUT = process.argv[2];
const APP = process.argv[3] + '?sem-intro';
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(OUT, { recursive: true });
const geo = {};

async function session({ width, height, dsf, mobile }) {
  const port = 9100 + Math.floor(Math.random() * 600);
  const proc = spawn(EDGE, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--lang=pt-BR', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'edge-vid-'))}`, 'about:blank'], { stdio: 'ignore' });
  let t; for (let i = 0; i < 60; i++) { try { t = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(200); } }
  const ws = new WebSocket(t.find((x) => x.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let id = 0; const P = new Map();
  ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && P.has(m.id)) { P.get(m.id)(m); P.delete(m.id); } });
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; P.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dsf, mobile });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  const ev = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || 'erro em evaluate');
    return r.result.result.value;
  };
  const rects = (sels) => ev(`(()=>{const o={};for(const [k,s] of Object.entries(${JSON.stringify(sels)})){const e=document.querySelector(s);if(!e){o[k]=null;continue}const b=e.getBoundingClientRect();o[k]=[+b.left.toFixed(1),+b.top.toFixed(1),+b.width.toFixed(1),+b.height.toFixed(1)]}return o})()`);
  const center = async (sel) => ev(`(()=>{const b=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]})()`);
  const move = async (x, y) => send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  const click = async (sel) => { const [x, y] = await center(sel); await move(x, y); await sleep(120); await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 }); await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 }); return [x, y]; };
  const shot = async (name, sels, extra = {}) => {
    const r = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(join(OUT, `${name}.png`), Buffer.from(r.result.data, 'base64'));
    geo[name] = { viewport: [width, height], dsf, ...(sels ? { rects: await rects(sels) } : {}), ...extra };
    console.log('  ✓', name);
  };
  return { send, ev, move, click, center, shot, rects, sleep, nav: async (u) => { await send('Page.navigate', { url: u }); await sleep(900); }, close: () => { ws.close(); proc.kill(); } };
}

const SAMPLE = [
  { name: 'apresentacao-extensao.pdf', size: 4800000, kind: 'file' },
  { name: 'fotos-oficina.zip', size: 126000000, kind: 'file' },
  { name: 'cartaz-evento.png', size: 2100000, kind: 'image' },
];
const SETUP = `(()=>{setTheme('light');document.querySelector('.sim').style.display='none';
  const a=DEVICES.find(d=>d.id==='arara');a.route='local';
  REQ_FILES.length=0;REQ_FILES.push(...${JSON.stringify(SAMPLE)});return 'ok'})()`;
const DESK = { sidebar: '.sidebar', brand: '.sidebar .brand', brandStatus: '[data-brand-status]', thisDevice: '.sidebar [data-this-device]', nav: '[data-nav]', header: '.page-header', modes: '[data-mode]', composer: '[data-composer]', sources: '.sources', tray: '[data-tray]', sendPanel: '[data-send-panel]', destHead: '.dest-head', tabs: '[data-tabs]', grid: '[data-grid]', cardArara: '.card[data-dev="arara"]', dock: '[data-dock]', dockRow: '[data-dock] .trow', toast: '.toast', drop: '[data-drop] > div', tabMine: '[data-tab="mine"]', endpointOrigin: '.endpoint.origin', endpointDest: '.endpoint.dest', trail: '.send-panel .trail' };

// ───────────────────────── Desktop (notebook "Ipê Sereno") ─────────────────────────
console.log('Desktop 1280×720 @2x');
{
  const s = await session({ width: 1280, height: 720, dsf: 2, mobile: false });
  await s.nav(APP);
  await s.sleep(1900);
  await s.ev(SETUP);
  await s.shot('D01-descoberta-buscando', DESK);
  await s.sleep(2600);
  await s.shot('D02-descoberta-concluida', DESK);

  await s.ev(`document.querySelector('[data-drop]').hidden=false;1`); await s.sleep(250);
  await s.shot('D03-soltar-arquivos', DESK);
  await s.ev(`document.querySelector('[data-drop]').hidden=true;addItems(${JSON.stringify(SAMPLE)});1`); await s.sleep(700);
  await s.shot('D04-selecao-3-itens', DESK);

  await s.click('[data-tab="mine"]'); await s.sleep(500);
  await s.shot('D05-meus-aparelhos', DESK);
  const [cx, cy] = await s.center('.card[data-dev="arara"]');
  await s.move(cx - 60, cy - 8); await s.sleep(120); await s.move(cx, cy); await s.sleep(450);
  await s.shot('D06-hover-destino', DESK, { cursor: [cx, cy] });

  await s.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: cx, y: cy, button: 'left', clickCount: 1 });
  await s.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: cx, y: cy, button: 'left', clickCount: 1 });
  await s.sleep(850);
  await s.shot('D07-envio-aguardando', DESK, { cursor: [cx, cy] });
  await s.sleep(1250);
  await s.shot('D08-envio-aceito', DESK);
  // progresso: espera o painel de transferências aparecer e captura em pontos distintos
  const pct = () => s.ev(`(()=>{const t=S.transfers[0];return t?Math.round(t.done/t.total*100):-1})()`);
  let done = false;
  for (const [name, target] of [['D09-progresso-a', 25], ['D10-progresso-b', 65]]) {
    for (let i = 0; i < 60; i++) { const p = await pct(); if (p >= target) break; await s.sleep(60); }
    const p = await pct();
    await s.shot(name, DESK, { percent: p });
  }
  for (let i = 0; i < 150; i++) { const st = await s.ev(`S.transfers[0]?S.transfers[0].status:'-'`); if (st === 'ok') { done = true; break; } await s.sleep(60); }
  await s.sleep(450);
  await s.shot('D11-concluido', DESK, { concluded: done });
  await s.sleep(1900);
  await s.shot('D12-concluido-repouso', DESK);
  await s.close();
}

// ───────────────────────── Celular ("Arara Atenta") ─────────────────────────
console.log('Celular 375×812 @3x');
{
  const s = await session({ width: 375, height: 812, dsf: 3, mobile: true });
  await s.nav(APP);
  await s.sleep(1900);
  await s.ev(SETUP);
  await s.ev(`(()=>{ME.name='Arara Atenta';ME.type='phone';ME.os='Android 14';S.auto='off';
    const p=DEVICES.find(d=>d.id==='pequi');Object.assign(p,{name:'Ipê Sereno',type:'laptop',meta:'Windows 11 · Notebook',mine:true,verified:true,fav:false,route:'local',online:true});
    renderThisDevice();renderGrid();document.querySelector('.sim').style.display='none';return 'ok'})()`);
  await s.sleep(2400);
  const PH = { topbar: '.topbar', thisDevice: '.this-device-inline .this-device', header: '.page-header', composer: '[data-composer]', bottomnav: '[data-bottomnav]', dialog: '[data-req]', dialogName: '#req-name', previews: '.previews', accept: '[data-req-accept]', decline: '[data-req-decline]', dock: '[data-dock]', dockRow: '[data-dock] .trow', toast: '.toast' };
  await s.shot('P01-celular-inicio', PH);
  await s.ev(`openRequest('files');1`); await s.sleep(900);
  await s.shot('P02-celular-pedido', PH);
  const acc = await s.center('[data-req-accept]');
  await s.ev(`document.querySelector('[data-req-accept]').click();1`);
  const pct = () => s.ev(`(()=>{const t=S.transfers[0];return t?Math.round(t.done/t.total*100):-1})()`);
  for (const [name, target] of [['P03-celular-recebendo-a', 25], ['P04-celular-recebendo-b', 65]]) {
    for (let i = 0; i < 80; i++) { const p = await pct(); if (p >= target) break; await s.sleep(60); }
    await s.shot(name, PH, { percent: await pct(), accept: acc });
  }
  for (let i = 0; i < 150; i++) { const st = await s.ev(`S.transfers[0]?S.transfers[0].status:'-'`); if (st === 'ok') break; await s.sleep(60); }
  await s.sleep(450);
  await s.shot('P05-celular-concluido', PH);
  await s.close();
}

writeFileSync(join(OUT, 'geometria.json'), JSON.stringify(geo, null, 1));
console.log('Geometria salva em geometria.json');
process.exit(0);
