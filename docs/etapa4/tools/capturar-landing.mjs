// Gera as quatro imagens do aplicativo usadas na landing (landing/assets/app/) a partir do app REAL:
// servidor real, dois navegadores reais (Edge) que se encontram pela presença e transferem de verdade.
// Uso:  node docs/etapa4/tools/capturar-landing.mjs <pasta-de-saida>
// Os arquivos de exemplo são gerados na hora (conteúdo aleatório); nada vem de dados simulados do aplicativo.

import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { iniciar } from '../../../server/servidor.mjs';

const SAIDA = process.argv[2]; if (!SAIDA) { console.error('Informe a pasta de saída.'); process.exit(1); }
mkdirSync(SAIDA, { recursive: true });
const EDGE = process.env.EDGE || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const srv = await iniciar(0); const APP = `http://127.0.0.1:${srv.address().port}/app/index.html?sem-intro`;
const procs = [];

async function navegador(w, h, mobile) {
  const porta = 9500 + Math.floor(Math.random() * 400);
  const proc = spawn(EDGE, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${porta}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'edge-l-'))}`, 'about:blank'], { stdio: 'ignore' }); procs.push(proc);
  let t; for (let i = 0; i < 60; i++) { try { t = await (await fetch(`http://127.0.0.1:${porta}/json`)).json(); break; } catch { await dormir(200); } }
  const ws = new WebSocket(t.find((x) => x.type === 'page').webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let id = 0; const P = new Map();
  ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && P.has(m.id)) { P.get(m.id)(m); P.delete(m.id); } });
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; P.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile });
  return {
    ev: async (e) => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); if (r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || 'erro'); return r.result.result.value; },
    abrir: async () => { await send('Page.navigate', { url: APP }); await dormir(1500); },
    foto: async (nome) => { await dormir(700); const s = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(SAIDA, nome + '.png'), Buffer.from(s.result.data, 'base64')); console.log('✓', nome); },
    fechar: () => { ws.close(); proc.kill(); } };
}
async function ate(fn, ms, msg) { const t0 = Date.now(); for (;;) { let v = false; try { v = await fn(); } catch { /* tenta de novo */ } if (v) return v; if (Date.now() - t0 > ms) throw new Error('Tempo esgotado: ' + msg); await dormir(100); } }

const ARQUIVOS = `addItems([['Relatório final.pdf',4800000],['Apresentação do projeto.pptx',12400000],['Foto da turma.jpg',3100000]].map(([n,t])=>({name:n,size:t,kind:kindOf(n),file:new File([new Uint8Array(t)],n)})));1`;

const A = await navegador(1440, 900, false), B = await navegador(375, 812, true);
try {
  await A.abrir(); await B.abrir();
  await ate(async () => (await A.ev('DEVICES.length')) === 1 && (await B.ev('DEVICES.length')) === 1, 12000, 'os dois aparelhos se encontrarem');

  // Claro: seleção no computador e pedido no celular
  await A.ev(`setTheme('light');1`); await B.ev(`setTheme('light');1`);
  await A.ev(ARQUIVOS); await dormir(600); await A.foto('app-desktop-claro');
  await A.ev(`document.querySelector('.card[data-dev]').click();1`);
  await ate(() => B.ev(`!document.querySelector('[data-req-scrim]').hidden`), 15000, 'pedido em B'); await B.foto('app-celular-claro');
  await B.ev(`document.querySelector('[data-req-decline]').click();1`); await dormir(800);

  // Escuro: transferência em andamento no computador e pedido no celular
  await A.ev(`(()=>{const b=document.querySelector('[data-send-cancel]');if(S.sending&&b)b.click();return 1})()`); await ate(async () => (await A.ev('S.sending')) === false, 8000, 'painel de envio fechar');
  await A.ev(`setTheme('dark');1`); await B.ev(`setTheme('dark');1`);
  await A.ev(`(()=>{const b=document.querySelector('[data-tray-clear]');if(S.selection.length&&b)b.click();addItems([{name:'Gravação da aula.mp4',size:700*1024*1024,kind:'video',file:new File([new Uint8Array(700*1024*1024)],'Gravação da aula.mp4')}]);document.querySelector('.card[data-dev]').click();return 1})()`);
  await ate(() => B.ev(`!document.querySelector('[data-req-scrim]').hidden`), 15000, 'pedido grande em B');
  await B.ev(`document.querySelector('[data-req-accept]').click();1`);
  await ate(async () => { const t = JSON.parse(await A.ev('JSON.stringify(S.transfers.map(t=>[t.done,t.total]))'))[0]; return t && t[0] / t[1] > 0.3; }, 90000, 'progresso acima de 30%');
  await A.foto('app-desktop-escuro');
  await A.ev(`(()=>{const b=document.querySelector('[data-send-cancel]');if(b)b.click();return 1})()`); await ate(async () => (await A.ev('S.sending')) === false, 15000, 'envio grande cancelado'); await dormir(800);
  await A.ev(`(()=>{const b=document.querySelector('[data-tray-clear]');if(S.selection.length&&b)b.click();return 1})()`);
  await A.ev(ARQUIVOS); await A.ev(`document.querySelector('.card[data-dev]').click();1`);
  await ate(() => B.ev(`!document.querySelector('[data-req-scrim]').hidden`), 15000, 'pedido escuro em B'); await B.foto('app-celular-escuro');
} finally { A.fechar(); B.fechar(); srv.close(); }
process.exit(0);
