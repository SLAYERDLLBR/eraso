// Testes funcionais do aplicativo web do ERASÓ, com dois navegadores reais (Edge), o servidor local real e a interface real.
// Uso:  node tests/app.test.mjs        (defina EDGE=caminho para outro navegador Chromium)
// Arquivos de teste são criados em disco, escolhidos pelo seletor de arquivos da própria página, enviados por WebRTC,
// salvos pelo navegador na pasta de downloads e conferidos byte a byte.

import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash, randomBytes } from 'node:crypto';
import { iniciar } from '../server/servidor.mjs';

const EDGE = process.env.EDGE || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const matarArvore = (p) => { try { if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(p.pid), '/T', '/F'], { stdio: 'ignore' }); else p.kill(); } catch { /* já encerrado */ } };
const srv = await iniciar(0); const PORTA = srv.address().port; const BASE = `http://127.0.0.1:${PORTA}`; const APP = `${BASE}/app/index.html?sem-intro`;
const procs = [];
const sha = (b) => createHash('sha256').update(b).digest('hex');
const pasta = mkdtempSync(join(tmpdir(), 'eraso-teste-'));
const arquivo = (nome, tam) => { const p = join(pasta, nome); const b = randomBytes(tam); writeFileSync(p, b); return { caminho: p, sha: sha(b), tam, nome }; };

async function navegador(rotulo) {
  const porta = 9500 + Math.floor(Math.random() * 400), dados = mkdtempSync(join(tmpdir(), 'edge-app-')), downloads = mkdtempSync(join(tmpdir(), 'dl-'));
  const proc = spawn(EDGE, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${porta}`, `--user-data-dir=${dados}`, 'about:blank'], { stdio: 'ignore' }); procs.push(proc);
  let t; for (let i = 0; i < 60; i++) { try { t = await (await fetch(`http://127.0.0.1:${porta}/json`)).json(); break; } catch { await dormir(200); } }
  const ws = new WebSocket(t.find((x) => x.type === 'page').webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let id = 0; const P = new Map(); const erros = [];
  ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && P.has(m.id)) { P.get(m.id)(m); P.delete(m.id); } else if (m.method === 'Runtime.exceptionThrown') erros.push(m.params.exceptionDetails.exception?.description?.split('\n')[0] || m.params.exceptionDetails.text); else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') erros.push('console.error: ' + m.params.args.map((a) => a.value || a.description).join(' ')); });
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; P.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Page.enable'); await send('Runtime.enable'); await send('DOM.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads });
  const nav = { rotulo, erros, downloads,
    async ev(expr) { const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.result.exceptionDetails) throw new Error(`[${rotulo}] erro na página: ` + (r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text).split('\n')[0]); return r.result.result.value; },
    async abrir(url = APP) { await send('Page.navigate', { url }); await dormir(1200); },
    async escolherArquivos(seletor, caminhos) { const { result: { root } } = await send('DOM.getDocument'); const { result: { nodeId } } = await send('DOM.querySelector', { nodeId: root.nodeId, selector: seletor }); await send('DOM.setFileInputFiles', { nodeId, files: caminhos }); },
    fechar() { try { send('Page.close'); } catch { /* ok */ } setTimeout(() => { ws.close(); matarArvore(proc); }, 300); } };
  return nav;
}
async function ate(fn, ms = 15000, msg = 'condição') { const t0 = Date.now(); for (;;) { let v; try { v = await fn(); } catch (e) { v = false; if (Date.now() - t0 > ms) throw e; } if (v) return v; if (Date.now() - t0 > ms) throw new Error(`Tempo esgotado esperando: ${msg}`); await dormir(120); } }
let ok = 0; const falhas = [];
async function teste(nome, fn) { const t0 = Date.now(); try { await fn(); ok++; console.log(`  ✓ ${nome} (${Date.now() - t0} ms)`); } catch (e) { falhas.push([nome, e.message]); console.log(`  ✗ ${nome}\n      ${e.message}`); } }
const igual = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${m}: esperado ${JSON.stringify(b)}, obtido ${JSON.stringify(a)}`); };
const verdade = (c, m) => { if (!c) throw new Error(m); };
const ir = (n, v) => n.ev(`location.hash='${v}';1`);
const clicar = (n, sel) => n.ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)throw new Error('não achei ${sel.replace(/'/g, '')}');e.click();return 1})()`);
const limpar = (n) => n.ev(`(()=>{const b=document.querySelector('[data-tray-clear]');if(S.selection.length&&b)b.click();return S.selection.length})()`);
const textoDe = (n, sel) => n.ev(`document.querySelector(${JSON.stringify(sel)})?.textContent.trim()||''`);

const A = await navegador('A'), B = await navegador('B');
console.log(`\nServidor ${BASE}\n`);

console.log('Sozinho na rede: nada fictício');
await A.abrir();
await teste('nenhum aparelho, nenhum item e nenhum botão de simulação', async () => {
  igual(await A.ev(`DEVICES.length`), 0, 'DEVICES');
  igual(await A.ev(`document.querySelectorAll('.card[data-dev]').length`), 0, 'cartões de aparelho');
  igual(await A.ev(`!!document.querySelector('.sim,[data-sim],[data-sim-toggle]')`), false, 'elementos de simulação');
  igual(await A.ev(`/simula/i.test(document.body.innerText)`), false, 'texto "simular" visível');
  igual(await A.ev(`S.activity.length+S.inbox.length+S.transfers.length`), 0, 'atividade, caixa e transferências pré-carregadas');
  verdade(/Nenhum aparelho encontrado/.test(await textoDe(A, '[data-grid]')), 'estado vazio da descoberta ausente: ' + await textoDe(A, '[data-grid]'));
});
await teste('nenhum erro de console ao percorrer todas as telas', async () => {
  for (const v of ['caixa', 'atividade', 'dispositivos', 'configuracoes', 'diagnostico', 'compartilhar']) { await ir(A, v); await dormir(250); }
  igual(A.erros, [], 'erros');
});
await teste('o app não oferece pareamento, link, endereço nem rota remota', async () => {
  const txt = await A.ev(`document.body.innerText + [...document.querySelectorAll('[aria-label],[title]')].map(e=>(e.getAttribute('aria-label')||'')+' '+(e.title||'')).join(' ')`);
  for (const proibido of [/Parear/i, /pareamento/i, /Receber via link/i, /Adicionar por endereço/i, /rota remota/i, /Meus aparelhos/i]) verdade(!proibido.test(txt), `texto indevido na interface: ${proibido}`);
});

console.log('\nDois aparelhos reais');
await B.abrir();
await teste('cada um vê o outro, com o nome e o sistema reais', async () => {
  await ate(async () => (await A.ev(`DEVICES.length`)) === 1 && (await B.ev(`DEVICES.length`)) === 1, 10000, 'descoberta');
  const nomeB = await B.ev('ME.name'), nomeA = await A.ev('ME.name');
  igual(await A.ev(`DEVICES[0].name`), nomeB, 'A vê B'); igual(await B.ev(`DEVICES[0].name`), nomeA, 'B vê A');
  verdade(/Windows|Linux|macOS/.test(await A.ev('DEVICES[0].meta')), 'sistema do outro aparelho não informado');
  igual(await A.ev(`document.querySelectorAll('.card[data-dev]').length`), 1, 'cartões');
});

console.log('\nNome e ID reais do aparelho; busca');
await teste('o nome de fábrica é o do próprio aparelho (sistema, navegador e ID), nunca um nome sorteado', async () => {
  for (const X of [A, B]) {
    const nome = await X.ev('ME.name'), id = await X.ev('ME.id');
    verdade(/^(Windows|Linux|macOS|Android|iOS|ChromeOS) · (Edge|Chrome|Firefox|Safari|Opera|Navegador) · [0-9A-F]{4}$/.test(nome), `nome inesperado: ${nome}`);
    igual(nome.slice(-4), id.slice(0, 4).toUpperCase(), 'o final do nome deve ser o começo do ID');
  }
  verdade((await textoDe(A, '.card[data-dev]')).includes((await B.ev('ME.id')).slice(0, 4).toUpperCase()), 'o cartão do aparelho deveria mostrar o ID');
});
await teste('nomes sorteados salvos por versões anteriores são trocados pelo nome real', async () => {
  await A.ev(`(()=>{const p=Object.assign({id:ME.id},JSON.parse(localStorage.getItem('eraso-prefs')||'{}'));p.name='Ipê Sereno';localStorage.setItem('eraso-prefs',JSON.stringify(p));return 1})()`);
  await A.abrir(); const nome = await A.ev('ME.name'); verdade(/ · [0-9A-F]{4}$/.test(nome) && !/Ipê/.test(nome), `nome não migrado: ${nome}`);
  await ate(async () => (await B.ev('DEVICES[0]?.name')) === nome, 8000, 'B ver o nome novo de A');
});
await teste('busca de aparelhos: por nome, por ID, por sistema e sem resultado', async () => {
  const idB = await B.ev('ME.id'), nomeB = await B.ev('ME.name');
  const digitar = async (q) => { await A.ev(`(()=>{const i=document.querySelector('[data-dev-q]');i.value=${JSON.stringify(q)};i.dispatchEvent(new Event('input',{bubbles:true}));return 1})()`); await dormir(150); return A.ev(`document.querySelectorAll('.card[data-dev]').length`); };
  igual(await digitar(''), 1, 'sem filtro');
  igual(await digitar(idB.slice(0, 4)), 1, 'pelo ID curto'); igual(await digitar(idB), 1, 'pelo ID completo'); igual(await digitar('#' + idB.slice(0, 4).toLowerCase()), 1, 'pelo ID com #');
  igual(await digitar(nomeB.split(' · ')[0].toLowerCase()), 1, 'pelo sistema'); igual(await digitar(nomeB), 1, 'pelo nome inteiro');
  igual(await digitar('zzzz-inexistente'), 0, 'termo que não existe'); verdade(/Nenhum aparelho corresponde/.test(await textoDe(A, '[data-grid]')), 'mensagem de sem resultado ausente');
  await A.ev(`document.querySelector('[data-dev-clear]').click();1`); await dormir(150);
  igual(await A.ev(`document.querySelectorAll('.card[data-dev]').length`), 1, 'depois de limpar'); igual(await A.ev(`document.querySelector('[data-dev-q]').value`), '', 'campo limpo');
});

console.log('\nSalas (código compartilhado)');
await teste('entrar numa sala separa os aparelhos; o mesmo código os reúne; sair volta à rede toda', async () => {
  await A.ev(`entrarNaSala('abcdefgh23')`);
  await ate(async () => (await A.ev('DEVICES.length')) === 0 && (await B.ev('DEVICES.length')) === 0, 8000, 'separação');
  igual(await A.ev('REDE.sala'), 'abcdefgh23', 'sala em uso'); verdade(/Nenhum aparelho encontrado nesta sala/.test(await textoDe(A, '[data-scan-text]')), 'texto deveria dizer "nesta sala"');
  await B.ev(`entrarNaSala('abcdefgh23')`);
  await ate(async () => (await A.ev('DEVICES.length')) === 1 && (await B.ev('DEVICES.length')) === 1, 10000, 'reencontro na mesma sala');
  verdade(/\?sala=abcdefgh23$/.test(await A.ev('conviteDaSala()')), 'link de convite incorreto');
  await A.ev(`entrarNaSala('')`); await ate(async () => (await A.ev('DEVICES.length')) === 0, 8000, 'A fora da sala deixa de ver B');
  await B.ev(`entrarNaSala('')`); await ate(async () => (await A.ev('DEVICES.length')) === 1 && (await B.ev('DEVICES.length')) === 1, 10000, 'rede toda de novo');
});
await teste('código inválido é recusado com aviso e a sala muda só com código válido', async () => {
  igual(await A.ev(`entrarNaSala('curto')`), false, 'aceitou código curto'); igual(await A.ev('REDE.sala'), '', 'sala não deveria mudar');
  igual(await A.ev(`entrarNaSala('MAIÚSCULA!!')`), false, 'aceitou símbolos');
  igual(await A.ev(`salaDoTexto('https://exemplo.test/app/index.html?sala=ABCDEFGH23&x=1')`), 'abcdefgh23', 'extrair sala do link de convite');
});
await teste('link de convite: abre já dentro da sala, guarda o código e tira o código da barra de endereço', async () => {
  await B.abrir(`${BASE}/app/index.html?sem-intro&sala=convite2026`); await dormir(500);
  igual(await B.ev('SALA'), 'convite2026', 'sala do convite'); igual(await B.ev('JSON.parse(localStorage.getItem("eraso-prefs")).sala'), 'convite2026', 'não foi guardada');
  verdade(!/sala=/.test(await B.ev('location.search')) && /sem-intro/.test(await B.ev('location.search')), 'barra de endereço: ' + await B.ev('location.search'));
  await B.abrir(); igual(await B.ev('SALA'), 'convite2026', 'a sala deve persistir ao recarregar');
  await B.ev(`entrarNaSala('')`); await B.abrir(); igual(await B.ev('SALA'), '', 'sair da sala deve persistir');
  await ate(async () => (await A.ev('DEVICES.length')) === 1 && (await B.ev('DEVICES.length')) === 1, 10000, 'rede toda restaurada');
});
await teste('os controles de sala em Configurações funcionam pela interface', async () => {
  await ir(A, 'configuracoes'); await dormir(300);
  await A.ev(`(()=>{const i=document.querySelector('[data-settings] [data-sala-input]');i.value='interface2026';document.querySelector('[data-settings] [data-sala-entrar]').click();return 1})()`);
  await ate(async () => (await A.ev('REDE.sala')) === 'interface2026', 4000, 'entrar pelo botão');
  verdade(await A.ev(`!document.querySelector('[data-sala-copiar]').hidden && !document.querySelector('[data-sala-sair]').hidden`), 'copiar/sair deveriam aparecer dentro de uma sala');
  await clicar(A, '[data-sala-sair]'); await ate(async () => (await A.ev('REDE.sala')) === '', 4000, 'sair pelo botão');
  verdade(await A.ev(`document.querySelector('[data-sala-sair]').hidden`), 'sair deveria sumir fora de sala');
  await ate(async () => (await A.ev('DEVICES.length')) === 1, 10000, 'de volta à rede toda'); await ir(A, 'compartilhar');
});

console.log('\nConfigurações: salvar, persistir e aplicar');
await teste('nome: salvar em Configurações muda para o outro aparelho e persiste após recarregar', async () => {
  await ir(B, 'configuracoes'); await B.ev(`document.querySelector('[data-set-name]').value='Notebook da Ana'; document.querySelector('[data-name-save]').click(); 1`);
  await ate(async () => (await A.ev('DEVICES[0]?.name')) === 'Notebook da Ana', 8000, 'A ver o novo nome');
  await B.abrir(); igual(await B.ev('ME.name'), 'Notebook da Ana', 'nome após recarregar');
  await ate(async () => (await A.ev('DEVICES[0]?.name')) === 'Notebook da Ana', 8000, 'A ainda vê');
});
await teste('interruptores, seletor, PIN e retenção persistem após recarregar e têm efeito', async () => {
  await ir(B, 'configuracoes'); await dormir(300);
  await B.ev(`(()=>{document.querySelector('[data-set-switch="history"]').click();document.querySelector('[data-set-switch="verifyIn"]').click();document.querySelector('[data-set-switch="autofinish"]').click();document.querySelector('[data-set-switch="verifyOut"]').click();
    const a=document.querySelector('[data-auto-select]');a.value='fav';a.dispatchEvent(new Event('change',{bubbles:true}));
    const r=document.querySelector('[data-retention]');r.value='30';r.dispatchEvent(new Event('change',{bubbles:true}));
    document.querySelector('[data-pin-switch]').click();return 1})()`);
  const pin = await B.ev(`S.pinCode`); verdade(/^\d{4}$/.test(pin), 'PIN não gerado');
  igual(await B.ev(`REDE.pin`), pin, 'PIN aplicado na rede');
  await B.abrir(); await ir(B, 'configuracoes'); await dormir(400);
  const e = JSON.parse(await B.ev(`JSON.stringify({h:S.settings.history,vi:S.settings.verifyIn,af:S.settings.autofinish,vo:S.settings.verifyOut,auto:S.auto,ret:S.retention,pin:S.pin,code:S.pinCode,tela:{h:document.querySelector('[data-set-switch=history]').getAttribute('aria-checked'),ret:document.querySelector('[data-retention]').value,pin:document.querySelector('[data-pin-switch]').getAttribute('aria-checked'),cod:document.querySelector('[data-pin-code]').value},rede:{pin:REDE.pin,vi:REDE.verificarRecebimento,vo:REDE.verificarEnvio}})`));
  igual([e.h, e.vi, e.af, e.vo], [false, false, false, false], 'interruptores'); igual(e.auto, 'fav', 'receber automaticamente'); igual(e.ret, 30, 'retenção'); igual([e.pin, e.code], [true, pin], 'PIN');
  igual([e.tela.h, e.tela.ret, e.tela.pin, e.tela.cod], ['false', '30', 'true', pin], 'a tela reflete o que foi salvo'); igual([e.rede.pin, e.rede.vi, e.rede.vo], [pin, false, false], 'rede aplicou as preferências');
});
await teste('restaurar o padrão para os próximos testes', async () => {
  await B.ev(`(()=>{S.settings.history=true;S.settings.verifyIn=true;S.settings.verifyOut=true;S.auto='off';S.pin=false;salvarPrefs();aplicarRede();return 1})()`);
  await B.abrir(); await A.abrir(); await ate(async () => (await A.ev(`DEVICES.length`)) === 1, 8000, 'redescoberta');
});

console.log('\nEnvio e recebimento pela interface');
const arq1 = arquivo('relatorio.bin', 2 * 1024 * 1024 + 123);
await teste('arquivo escolhido no seletor da página: A envia, B aceita, e o arquivo salvo é idêntico', async () => {
  await ir(A, 'compartilhar'); await A.escolherArquivos('[data-file-input]', [arq1.caminho]);
  await ate(async () => (await A.ev('S.selection.length')) === 1, 5000, 'item na bandeja');
  await clicar(A, '.card[data-dev]');
  await ate(async () => (await B.ev(`!document.querySelector('[data-req-scrim]').hidden`)), 15000, 'diálogo de pedido em B');
  verdade(/relatorio\.bin/.test(await textoDe(B, '[data-req]')), 'nome do arquivo não aparece no pedido');
  verdade(/Aguardando/.test(await textoDe(A, '[data-send-status]')), 'A deveria estar aguardando a resposta');
  await clicar(B, '[data-req-accept]');
  await ate(async () => /Concluído/.test(await textoDe(A, '[data-dock-list]')), 20000, 'A concluir'); await ate(async () => /Concluído/.test(await textoDe(B, '[data-dock-list]')), 10000, 'B concluir');
  await ate(() => readdirSync(B.downloads).filter((f) => !f.endsWith('.crdownload')).length >= 1, 10000, 'arquivo salvo');
  const salvo = readdirSync(B.downloads).find((f) => !f.endsWith('.crdownload')); const bytes = readFileSync(join(B.downloads, salvo));
  igual(sha(bytes), arq1.sha, 'SHA-256 do arquivo salvo'); igual(salvo, 'relatorio.bin', 'nome salvo');
  igual(await A.ev('S.selection.length'), 0, 'seleção limpa após enviar');
});
await teste('a atividade registra o envio e o recebimento reais e sobrevive ao recarregar', async () => {
  await A.abrir(); await B.abrir(); await ir(A, 'atividade'); await ir(B, 'atividade'); await dormir(300);
  const a = JSON.parse(await A.ev(`JSON.stringify(S.activity.map(x=>({d:x.dir,t:x.title,s:x.status,p:x.peer,z:x.size})))`)), b = JSON.parse(await B.ev(`JSON.stringify(S.activity.map(x=>({d:x.dir,t:x.title,s:x.status,z:x.size})))`));
  igual(a.length, 1, 'registros em A'); igual([a[0].d, a[0].t, a[0].s, a[0].z], ['out', 'relatorio.bin', 'ok', arq1.tam], 'registro de A'); igual([b[0].d, b[0].t, b[0].s, b[0].z], ['in', 'relatorio.bin', 'ok', arq1.tam], 'registro de B');
  verdade(/relatorio\.bin/.test(await textoDe(A, '[data-activity]')), 'A não mostra o item');
});
await teste('recusar: A é avisado, nada é salvo e o histórico registra "Recusado"', async () => {
  const antes = readdirSync(B.downloads).length; const arq = arquivo('nao-quero.bin', 50000);
  await ir(A, 'compartilhar'); await limpar(A); await A.escolherArquivos('[data-file-input]', [arq.caminho]); await ate(async () => (await A.ev('S.selection.length')) === 1, 5000, 'bandeja');
  await clicar(A, '.card[data-dev]'); await ate(async () => (await B.ev(`!document.querySelector('[data-req-scrim]').hidden`)), 15000, 'pedido');
  await clicar(B, '[data-req-decline]');
  await ate(async () => /recusou/.test(await textoDe(A, '[data-send-status]')), 8000, 'A saber da recusa');
  igual(readdirSync(B.downloads).length, antes, 'arquivos salvos'); verdade(await A.ev(`S.activity[0].status==='declined'`), 'A não registrou a recusa');
  await clicar(A, '[data-send-cancel]'); await ate(async () => (await A.ev('S.sending')) === false, 5000, 'painel fechar pelo botão Fechar');
});
await teste('cancelar durante o envio de um arquivo grande: ambos cancelam e nada é salvo', async () => {
  const antes = readdirSync(B.downloads).length; const arq = arquivo('enorme.bin', 120 * 1024 * 1024);
  await B.ev(`S.auto='all';salvarPrefs();renderThisDevice();1`);
  await ir(A, 'compartilhar'); await limpar(A); await A.escolherArquivos('[data-file-input]', [arq.caminho]); await ate(async () => (await A.ev('S.selection.length')) === 1, 8000, 'bandeja');
  await clicar(A, '.card[data-dev]');
  try { await ate(async () => (await A.ev(`S.transfers[0]?.done||0`)) > 2 * 1024 * 1024, 20000, 'começar a transferir'); } catch (e) { console.log('   [diag A]', await A.ev(`JSON.stringify({sending:S.sending,sel:S.selection.length,tr:S.transfers.map(t=>[t.status,t.done,t.total,t.erro]),painel:document.querySelector('[data-send-status]')?.textContent,net:S.net,dev:DEVICES.length})`)); console.log('   [diag B]', await B.ev(`JSON.stringify({auto:S.auto,pin:S.pin,req:!document.querySelector('[data-req-scrim]').hidden,tr:S.transfers.map(t=>[t.status,t.done,t.total,t.erro]),net:S.net,dev:DEVICES.length,log:TECHLOG.slice(-4)})`)); throw e; }
  await clicar(A, '[data-cancel]');
  await ate(async () => (await A.ev(`S.transfers[0]?.status`)) === 'canceled', 5000, 'A cancelado'); await ate(async () => (await B.ev(`S.transfers[0]?.status`)) === 'canceled', 8000, 'B cancelado');
  await dormir(800); igual(readdirSync(B.downloads).filter((f) => !f.endsWith('.crdownload')).length, antes, 'arquivos salvos apesar do cancelamento');
  await B.ev(`S.auto='off';salvarPrefs();renderThisDevice();1`); try { rmSync(arq.caminho); } catch { /* ok */ }
});
await teste('PIN: pela interface, PIN errado é barrado e o certo envia', async () => {
  await B.ev(`S.pin=true;S.pinCode='2468';salvarPrefs();aplicarRede();1`);
  const arq = arquivo('com-pin.bin', 30000); const antes = readdirSync(B.downloads).length;
  await ir(A, 'compartilhar'); await limpar(A); await A.escolherArquivos('[data-file-input]', [arq.caminho]); await ate(async () => (await A.ev('S.selection.length')) === 1, 5000, 'bandeja');
  await clicar(A, '.card[data-dev]'); await ate(async () => (await A.ev(`!!document.querySelector('[data-pin-box]')`)), 10000, 'caixa de PIN');
  const digitar = (n, pin) => n.ev(`(()=>{const ins=[...document.querySelectorAll('[data-pin-box] [data-pin]')];[...${JSON.stringify(pin)}].forEach((c,i)=>{ins[i].value=c;ins[i].dispatchEvent(new Event('input',{bubbles:true}))});return 1})()`);
  await digitar(A, '1111');
  await ate(async () => /PIN incorreto/.test(await textoDe(A, '[data-pin-box]')), 8000, 'aviso de PIN incorreto');
  igual(await B.ev(`document.querySelector('[data-req-scrim]').hidden`), true, 'B não deveria ver pedido com PIN errado');
  await digitar(A, '2468'); await ate(async () => (await B.ev(`!document.querySelector('[data-req-scrim]').hidden`)), 10000, 'pedido em B');
  await clicar(B, '[data-req-accept]'); await ate(() => readdirSync(B.downloads).length > antes, 15000, 'arquivo salvo');
  await B.ev(`S.pin=false;salvarPrefs();aplicarRede();1`);
});
await teste('texto enviado: aparece no destino, pode ser salvo na Caixa e fica guardado após recarregar', async () => {
  await ir(A, 'compartilhar'); await limpar(A); await A.ev(`addItems([textItem('Reunião às 14h na sala 204')]);1`);
  await clicar(A, '.card[data-dev]'); await ate(async () => (await B.ev(`!document.querySelector('[data-req-scrim]').hidden`)), 15000, 'texto em B');
  verdade(/Reunião às 14h/.test(await textoDe(B, '[data-req]')), 'texto não aparece em B');
  await clicar(B, '[data-req-save]'); await B.abrir(); await ir(B, 'caixa'); await dormir(500);
  verdade(/Reunião às 14h/.test(await textoDe(B, '[data-inbox]')), 'o texto não ficou na Caixa após recarregar');
});

console.log('\nTipos de conteúdo e arquivos grandes');
await teste('pedido misto: imagem real, link e texto com acentos e emoji chegam corretos', async () => {
  const png = join(process.cwd(), 'landing', 'assets', 'letreiro.png'), pngBytes = readFileSync(png);
  await ir(A, 'compartilhar'); await limpar(A); await A.escolherArquivos('[data-file-input]', [png]);
  await A.ev(`addItems([textItem('https://exemplo.test/pagina?x=1&y=2#topo'),textItem('Olá, São João! Café ☕ 日本語')]);1`);
  await ate(async () => (await A.ev('S.selection.length')) === 3, 5000, 'três itens na bandeja');
  await clicar(A, '.card[data-dev]'); await ate(async () => (await B.ev(`!document.querySelector('[data-req-scrim]').hidden`)), 15000, 'pedido em B');
  const pedido = await textoDe(B, '[data-req]'); verdade(/letreiro\.png/.test(pedido) && /exemplo\.test/.test(pedido) && /São João/.test(pedido), 'pedido não lista os três itens: ' + pedido.slice(0, 200));
  await clicar(B, '[data-req-accept]'); await ate(async () => /Concluído/.test(await textoDe(A, '[data-dock-list]')), 20000, 'A concluir');
  await ate(() => readdirSync(B.downloads).includes('letreiro.png'), 10000, 'imagem salva');
  igual(sha(readFileSync(join(B.downloads, 'letreiro.png'))), sha(pngBytes), 'SHA-256 da imagem');
  const guardado = await B.ev(`JSON.stringify([S.inbox.map(i=>i.body),S.activity.map(a=>a.body||a.title)])`); verdade(/exemplo\.test\/pagina\?x=1&y=2#topo/.test(guardado) && /Olá, São João! Café ☕ 日本語/.test(guardado), 'link e texto não chegaram íntegros: ' + guardado.slice(0, 300));
});
await teste('arquivo grande (300 MB): chega idêntico e a memória do navegador aguenta', async () => {
  const grande = arquivo('grande-300mb.bin', 300 * 1024 * 1024);
  await ir(A, 'compartilhar'); await limpar(A); await A.escolherArquivos('[data-file-input]', [grande.caminho]);
  await ate(async () => (await A.ev('S.selection.length')) === 1, 8000, 'item na bandeja'); await clicar(A, '.card[data-dev]');
  await ate(async () => (await B.ev(`!document.querySelector('[data-req-scrim]').hidden`)), 15000, 'pedido em B'); await clicar(B, '[data-req-accept]');
  await ate(async () => /Concluído/.test(await textoDe(A, '[data-dock-list]')), 180000, 'A concluir'); await ate(async () => /Concluído/.test(await textoDe(B, '[data-dock-list]')), 60000, 'B concluir');
  await ate(() => readdirSync(B.downloads).includes('grande-300mb.bin'), 60000, 'arquivo salvo');
  await ate(async () => { try { return readFileSync(join(B.downloads, 'grande-300mb.bin')).length === grande.tam; } catch { return false; } }, 60000, 'arquivo completo em disco');
  igual(sha(readFileSync(join(B.downloads, 'grande-300mb.bin'))), grande.sha, 'SHA-256 do arquivo grande');
});

console.log('\nSegurança: conteúdo hostil vindo de outro aparelho');
await teste('nomes, textos e arquivos com HTML/JS hostil não executam nada nem criam elementos', async () => {
  const hostil = '"><img src=x onerror="window.__xss=1"><b id=xss-b>', nomeArq = '"><img src=x onerror=window.__xss=1>.txt';
  await ir(B, 'configuracoes'); await B.ev(`document.querySelector('[data-set-name]').value=${JSON.stringify(hostil)};document.querySelector('[data-name-save]').click();1`);
  await ate(async () => (await A.ev('DEVICES[0]?.name')) !== undefined && /xss|img/i.test(await A.ev('DEVICES[0]?.name')), 8000, 'A receber o nome hostil');
  await ir(A, 'compartilhar'); await limpar(A);
  await A.ev(`addItems([textItem('<img src=x onerror="window.__xss=1"><script>window.__xss=1<\/script>'),{name:${JSON.stringify(nomeArq)},size:5,kind:'file',file:new File(['abcde'],${JSON.stringify(nomeArq)})}]);1`);
  await clicar(A, '.card[data-dev]'); await ate(async () => (await B.ev(`!document.querySelector('[data-req-scrim]').hidden`)), 15000, 'pedido hostil em B'); await dormir(300);
  for (const N of [A, B]) { igual(await N.ev('window.__xss||0'), 0, `JS executado em ${N.rotulo}`); igual(await N.ev(`document.querySelectorAll('#xss-b, img[src="x"], [onerror]').length`), 0, `elemento injetado em ${N.rotulo}`); }
  await clicar(B, '[data-req-decline]'); await dormir(500);
  await ir(B, 'atividade'); await ir(A, 'atividade'); await dormir(400);
  for (const N of [A, B]) { igual(await N.ev('window.__xss||0'), 0, `JS executado em ${N.rotulo} (atividade)`); igual(await N.ev(`document.querySelectorAll('#xss-b, img[src="x"], [onerror]').length`), 0, `injeção na atividade de ${N.rotulo}`); }
  await ir(B, 'configuracoes'); await B.ev(`document.querySelector('[data-set-name]').value='Teste B';document.querySelector('[data-name-save]').click();1`);
  await ate(async () => (await A.ev('DEVICES[0]?.name')) === 'Teste B', 8000, 'nome restaurado'); await ir(A, 'compartilhar'); await limpar(A);
});

console.log('\nCaixa, favoritos e diagnóstico');
await teste('Caixa: guardar, fixar, excluir e expirar pelo prazo configurado', async () => {
  await ir(A, 'caixa'); await A.ev(`document.querySelector('[data-capture]').value='Nota de teste';document.querySelector('[data-capture-save]').click();1`);
  verdade(/Nota de teste/.test(await textoDe(A, '[data-inbox]')), 'item não aparece'); await A.abrir(); await ir(A, 'caixa'); await dormir(500);
  verdade(/Nota de teste/.test(await textoDe(A, '[data-inbox]')), 'item não persistiu');
  await A.ev(`(async()=>{const it=S.inbox[0];it.ts=Date.now()-9*864e5;await IDB.gravar({...it,thumb:undefined});return 1})()`); await A.abrir(); await ir(A, 'caixa'); await dormir(500);
  igual(await A.ev('S.inbox.length'), 0, 'item vencido (9 dias, prazo de 7) deveria ter sido apagado');
});
await teste('favoritos: persistem, e o favorito offline continua na lista marcado como offline', async () => {
  await A.abrir(); await ate(async () => (await A.ev('DEVICES.length')) === 1, 8000, 'ver B');
  await A.ev(`alternarFavorito(DEVICES[0].id,false);1`); await A.abrir(); await ate(async () => (await A.ev('DEVICES.length')) === 1, 8000, 'ver B de novo');
  igual(await A.ev('DEVICES[0].fav'), true, 'favorito perdido ao recarregar');
  B.fechar(); await ate(async () => (await A.ev(`DEVICES.length===1&&DEVICES[0].online===false`)), 10000, 'B ficar offline');
  await A.ev(`S.tab='fav';renderGrid();1`); verdade(/Offline/.test(await textoDe(A, '[data-grid]')), 'favorito offline não aparece como offline');
});
await teste('diagnóstico: as verificações usam o estado real', async () => {
  await ir(A, 'diagnostico'); await clicar(A, '[data-run-checks]'); await ate(async () => (await A.ev(`Object.keys(DIAG.results).length===CHECKS.length&&!DIAG.running`)), 20000, 'verificações');
  const r = JSON.parse(await A.ev('JSON.stringify(DIAG.results)')); igual(r.srv.s, 'ok', 'servidor'); igual(r.nav.s, 'ok', 'navegador'); igual(r.par.s, 'warn', 'sem outros aparelhos agora (B saiu)');
});

A.fechar(); srv.close(); procs.forEach(matarArvore);
try { rmSync(pasta, { recursive: true, force: true }); } catch { /* ok */ }
console.log(`\n${ok} testes passaram, ${falhas.length} falharam.`);
if (falhas.length) { falhas.forEach(([n, m]) => console.log(` - ${n}: ${m}`)); process.exit(1); }
process.exit(0);
