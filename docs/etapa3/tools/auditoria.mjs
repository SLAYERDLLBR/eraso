// Auditoria funcional do protótipo (somente leitura do app): persistência das configurações, erros de console por tela,
// e levantamento de tudo o que é simulado.
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const APP = process.argv[2];
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const port = 9900 + Math.floor(Math.random() * 90);
const proc = spawn(EDGE, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'edge-au-'))}`, 'about:blank'], { stdio: 'ignore' });
let t; for (let i = 0; i < 60; i++) { try { t = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(200); } }
const ws = new WebSocket(t.find((x) => x.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0; const P = new Map(); const errs = [];
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && P.has(m.id)) { P.get(m.id)(m); P.delete(m.id); } else if (m.method === 'Runtime.exceptionThrown') errs.push(m.params.exceptionDetails.exception?.description?.split('\n')[0] || m.params.exceptionDetails.text); else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errs.push('console.error: ' + m.params.args.map((a) => a.value || a.description).join(' ')); });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; P.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (e) => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); if (r.result.exceptionDetails) return 'ERRO: ' + (r.result.exceptionDetails.exception?.description || '').split('\n')[0]; return r.result.result.value; };
await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
const load = async () => { await send('Page.navigate', { url: APP + '?sem-intro' }); await sleep(1800); };
await load();

console.log('== 1. Erros ao navegar por todas as telas');
for (const v of ['compartilhar', 'caixa', 'atividade', 'dispositivos', 'configuracoes']) { await ev(`go('${v}')`); await sleep(300); }
console.log(errs.length ? errs : 'nenhum erro de console');

console.log('== 2. Dispositivos fictícios acessíveis ao usuário');
console.log(await ev(`JSON.stringify(DEVICES.map(d=>d.name+' ['+d.route+']'))`));
console.log('pool de pareamento:', await ev(`JSON.stringify(PAIR_POOL.map(p=>p.name))`));
console.log('itens de histórico/caixa pré-carregados:', await ev(`S.activity.length+' atividades, '+S.inbox.length+' itens na Caixa'`));
console.log('botão Simular visível:', await ev(`!!document.querySelector('[data-sim-toggle]') && getComputedStyle(document.querySelector('.sim')).display!=='none'`));
console.log('comando "Protótipo" na paleta:', await ev(`commands().filter(c=>c.g==='Protótipo').map(c=>c.t).join(' | ')`));

console.log('== 3. Persistência das preferências (alterar → recarregar)');
const before = await ev(`JSON.stringify({visible:S.visible,auto:S.auto,pin:S.pin,destFolder:S.destFolder,settings:S.settings,name:ME.name,retention:document.querySelector('[data-retention]')?.value,theme:document.documentElement.dataset.theme,motion:document.documentElement.dataset.motion||'system'})`);
await ev(`(()=>{S.visible=false;S.auto='all';S.pin=true;S.destFolder='Documentos/Projeto';for(const k in S.settings)S.settings[k]=!S.settings[k];ME.name='Teste Nome';const r=document.querySelector('[data-retention]');if(r){r.selectedIndex=r.options.length-1;r.dispatchEvent(new Event('change',{bubbles:true}))}setTheme('dark');setMotion('reduced');return 1})()`);
const changed = await ev(`JSON.stringify({visible:S.visible,auto:S.auto,pin:S.pin,destFolder:S.destFolder,settings:S.settings,name:ME.name,retention:document.querySelector('[data-retention]')?.value,theme:document.documentElement.dataset.theme,motion:document.documentElement.dataset.motion||'system'})`);
await load();
const after = await ev(`JSON.stringify({visible:S.visible,auto:S.auto,pin:S.pin,destFolder:S.destFolder,settings:S.settings,name:ME.name,retention:document.querySelector('[data-retention]')?.value,theme:document.documentElement.dataset.theme,motion:document.documentElement.dataset.motion||'system'})`);
const B = JSON.parse(before), C = JSON.parse(changed), A = JSON.parse(after);
const flat = (o, p = '') => Object.entries(o).flatMap(([k, v]) => typeof v === 'object' && v ? flat(v, p + k + '.') : [[p + k, v]]);
const fa = Object.fromEntries(flat(A)), fc = Object.fromEntries(flat(C)), fb = Object.fromEntries(flat(B));
for (const k of Object.keys(fc)) console.log(`${fc[k] !== fb[k] ? (fa[k] === fc[k] ? 'PERSISTE ' : 'PERDE    ') : 'sem mudança'.padEnd(9)} ${k.padEnd(18)} alterado=${fc[k]} após recarregar=${fa[k]}`);

console.log('== 4. Configurações lidas pelo código (efeito real)');
const src = await (await fetch(APP)).text();
for (const k of ['startup', 'tray', 'autofinish', 'history', 'verifyIn', 'autolink', 'verifyOut']) {
  const uses = (src.match(new RegExp(`settings\\.${k}\\b|settings\\[['"]${k}['"]\\]`, 'g')) || []).length;
  const sw = (src.match(new RegExp(`data-set-switch="${k}"`, 'g')) || []).length;
  console.log(`${k.padEnd(11)} leituras no código: ${uses}  · interruptores na tela: ${sw}`);
}
console.log('chamadas de rede no app (fetch/XHR/WebSocket/RTCPeerConnection):', (src.match(/\bfetch\(|XMLHttpRequest|new WebSocket|RTCPeerConnection|EventSource|sendBeacon/g) || []).length);
console.log('setTimeout/setInterval que encenam eventos:', (src.match(/setTimeout|setInterval/g) || []).length);
console.log('Math.random (dados/progresso fictícios):', (src.match(/Math\.random/g) || []).length);
console.log('PIN fixo "4821":', (src.match(/4821/g) || []).length, 'ocorrências · IPs/portas fixos 192.168.*:', (src.match(/192\.168\.\d+\.\d+/g) || []).length);
ws.close(); proc.kill(); process.exit(0);
