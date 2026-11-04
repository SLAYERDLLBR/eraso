// Testes funcionais da camada de rede do ERASÓ, com dois navegadores reais (Edge) e o servidor local real.
// Uso:  node tests/rede.test.mjs        (Windows, Edge instalado; defina EDGE=caminho para outro navegador Chromium)
// Nada é simulado: os arquivos são gerados aleatoriamente, enviados por WebRTC e conferidos por CRC32 no destino.

import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { iniciar } from '../server/servidor.mjs';

const EDGE = process.env.EDGE || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const matarArvore = (p) => { try { if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(p.pid), '/T', '/F'], { stdio: 'ignore' }); else p.kill(); } catch { /* já encerrado */ } };
const srv = await iniciar(0, { extras: ['tests'] }); const PORTA = srv.address().port; const URL_ = `http://127.0.0.1:${PORTA}`;
const processos = [];

async function navegador() {
  const porta = 9500 + Math.floor(Math.random() * 400);
  const proc = spawn(EDGE, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${porta}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'edge-rt-'))}`, 'about:blank'], { stdio: 'ignore' }); processos.push(proc);
  let t; for (let i = 0; i < 60; i++) { try { t = await (await fetch(`http://127.0.0.1:${porta}/json`)).json(); break; } catch { await dormir(200); } }
  const ws = new WebSocket(t.find((x) => x.type === 'page').webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let id = 0; const P = new Map(); ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && P.has(m.id)) { P.get(m.id)(m); P.delete(m.id); } });
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; P.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Page.enable'); await send('Runtime.enable'); await send('Page.navigate', { url: `${URL_}/tests/pagina-teste.html` }); await dormir(700);
  return {
    async ev(expr) { const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.result.exceptionDetails) throw new Error('Erro na página: ' + (r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text)); return r.result.result.value; },
    fechar() { try { send('Page.close'); } catch { /* ok */ } setTimeout(() => { ws.close(); matarArvore(proc); }, 300); },
  };
}
async function ate(fn, ms = 15000, msg = 'condição') { const t0 = Date.now(); for (;;) { const v = await fn(); if (v) return v; if (Date.now() - t0 > ms) throw new Error(`Tempo esgotado esperando: ${msg}`); await dormir(100); } }

let ok = 0, falhas = [];
async function teste(nome, fn) { const t0 = Date.now(); try { await fn(); ok++; console.log(`  ✓ ${nome} (${Date.now() - t0} ms)`); } catch (e) { falhas.push([nome, e.message]); console.log(`  ✗ ${nome}\n      ${e.message}`); } }
const igual = (a, b, msg) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${msg}: esperado ${JSON.stringify(b)}, obtido ${JSON.stringify(a)}`); };
const verdade = (c, msg) => { if (!c) throw new Error(msg); };

const A = await navegador(), B = await navegador();
const idA = await A.ev(`criar('Aparelho A', {politica:'manual'}); rede.conectar(); rede.perfil.id`);
const idB = await B.ev(`criar('Aparelho B', {politica:'manual'}); rede.conectar(); rede.perfil.id`);
console.log(`\nServidor na porta ${PORTA}. Aparelho A = ${idA}, B = ${idB}\n`);

console.log('Presença e descoberta');
await teste('cada aparelho vê o outro, e só o outro', async () => {
  await ate(async () => (await A.ev('registro.aparelhos.length')) === 1 && (await B.ev('registro.aparelhos.length')) === 1, 8000, 'descoberta mútua');
  igual(await A.ev('registro.aparelhos.map(a=>a.nome)'), ['Aparelho B'], 'A vê');
  igual(await B.ev('registro.aparelhos.map(a=>a.nome)'), ['Aparelho A'], 'B vê');
});
await teste('não existe nenhum aparelho além dos reais (nenhum fictício)', async () => {
  const lista = await (await fetch(`${URL_}/api/aparelhos`)).json(); igual(lista.aparelhos.length, 2, 'aparelhos no servidor');
});
await teste('ficar oculto remove da lista dos outros; voltar a ficar visível traz de volta', async () => {
  await B.ev('rede.atualizarPerfil({visivel:false})'); await ate(async () => (await A.ev('registro.aparelhos.length')) === 0, 5000, 'B sumir');
  await B.ev('rede.atualizarPerfil({visivel:true})'); await ate(async () => (await A.ev('registro.aparelhos.length')) === 1, 5000, 'B voltar');
});
await teste('renomear atualiza o nome para os outros', async () => {
  await B.ev(`rede.atualizarPerfil({nome:'B renomeado'})`); await ate(async () => (await A.ev('registro.aparelhos[0]?.nome')) === 'B renomeado', 5000, 'nome novo');
  await B.ev(`rede.atualizarPerfil({nome:'Aparelho B'})`); await ate(async () => (await A.ev('registro.aparelhos[0]?.nome')) === 'Aparelho B', 5000, 'nome original');
});
await teste('testar conexão direta devolve a latência real', async () => { const ms = await A.ev(`rede.testarConexao(rede.aparelhos[0])`); verdade(Number.isFinite(ms) && ms >= 0, 'latência inválida: ' + ms); });

console.log('\nEnvio e recebimento');
await teste('arquivo de 3 MB: chega idêntico (CRC32), com progresso crescente e status concluído nos dois lados', async () => {
  await B.ev(`window.politica='aceitar'`);
  const k = await A.ev(`enviar(${JSON.stringify(idB)}, [{nome:'dados.bin', tam: 3*1024*1024}])`);
  await ate(async () => (await A.ev(`envios[${k}].status.includes('concluido')`)), 20000, 'envio concluído');
  const crcEnviado = await A.ev(`envios[${k}].itens[0].crc`);
  await ate(async () => (await B.ev('registro.pedidos[0]?.arquivos.length')) === 1, 5000, 'arquivo no destino');
  const rec = await B.ev('JSON.stringify({a:registro.pedidos[0].arquivos[0], st:registro.pedidos[0].status})'); const r = JSON.parse(rec);
  igual(r.a.crc, crcEnviado, 'CRC32 do arquivo'); igual(r.a.verificado, true, 'integridade conferida pelo destino'); igual(r.a.tamanho, 3 * 1024 * 1024, 'tamanho'); igual(r.a.nome, 'dados.bin', 'nome');
  verdade(r.st.includes('concluido'), 'destino não concluiu: ' + r.st);
  const prog = await A.ev(`envios[${k}].progresso`); verdade(prog.length > 3 && prog.every((v, i) => i === 0 || v >= prog[i - 1]), 'progresso não é crescente');
  igual(await A.ev(`envios[${k}].envio.enviados`), 3 * 1024 * 1024, 'bytes enviados');
});
await teste('vários itens: texto, link e dois arquivos; um é pulado e outro renomeado', async () => {
  await B.ev(`window.politica='manual'; registro.pedidos.length=0; registro.textos.length=0`);
  const k = await A.ev(`enviar(${JSON.stringify(idB)}, [{corpo:'Olá, tudo bem?'},{corpo:'https://exemplo.org/pagina', tipo:'link'},{nome:'a.bin', tam:300000},{nome:'b.bin', tam:200000}])`);
  await ate(async () => (await B.ev('registro.pedidos.length')) === 1, 15000, 'pedido chegar');
  igual(await B.ev('registro.pedidos[0].itens.map(i=>i.kind)'), ['text', 'link', 'file', 'file'], 'tipos no pedido');
  await B.ev(`registro.pedidos[0].rec.aceitar({pular:[2], nomes:[,,,'renomeado.bin']})`);
  await ate(async () => (await A.ev(`envios[${k}].status.includes('concluido')`)), 20000, 'concluir');
  const r = JSON.parse(await B.ev('JSON.stringify({arq:registro.pedidos[0].arquivos, txt:registro.textos})'));
  igual(r.arq.map((a) => a.nome), ['renomeado.bin'], 'arquivos recebidos'); igual(r.arq[0].tamanho, 200000, 'tamanho de b'); igual(r.txt.map((t) => t.corpo), ['Olá, tudo bem?', 'https://exemplo.org/pagina'], 'textos');
});
await teste('recusar: o remetente fica com status "recusado" e nada é recebido', async () => {
  await B.ev(`registro.pedidos.length=0`);
  const k = await A.ev(`enviar(${JSON.stringify(idB)}, [{nome:'x.bin', tam:100000}])`);
  await ate(async () => (await B.ev('registro.pedidos.length')) === 1, 15000, 'pedido');
  await B.ev('registro.pedidos[0].rec.recusar()');
  await ate(async () => (await A.ev(`envios[${k}].status.includes('recusado')`)), 8000, 'recusado');
  igual(await B.ev('registro.pedidos[0].arquivos.length'), 0, 'arquivos recebidos');
});
await teste('cancelar no meio do envio: ambos ficam "cancelado" e o arquivo não é entregue', async () => {
  await B.ev(`window.politica='aceitar'; registro.pedidos.length=0`);
  const k = await A.ev(`enviar(${JSON.stringify(idB)}, [{nome:'grande.bin', tam: 60*1024*1024}])`);
  await ate(async () => (await A.ev(`envios[${k}].envio.enviados`)) > 1024 * 1024, 20000, 'começar a enviar');
  await A.ev(`envios[${k}].envio.cancelar()`);
  await ate(async () => (await B.ev('registro.pedidos[0]?.status.includes("cancelado")')), 8000, 'destino cancelado');
  igual(await B.ev('registro.pedidos[0].arquivos.length'), 0, 'arquivo entregue apesar do cancelamento');
  verdade((await A.ev(`envios[${k}].envio.enviados`)) < 60 * 1024 * 1024, 'enviou tudo apesar de cancelar');
});
await teste('o destino cancela no meio: o remetente fica "cancelado"', async () => {
  await B.ev(`window.politica='aceitar'; registro.pedidos.length=0`);
  const k = await A.ev(`enviar(${JSON.stringify(idB)}, [{nome:'grande2.bin', tam: 60*1024*1024}])`);
  await ate(async () => (await B.ev('registro.pedidos[0]?.rec.recebidos')) > 512 * 1024, 20000, 'começar a receber');
  await B.ev('registro.pedidos[0].rec.cancelar()');
  await ate(async () => (await A.ev(`envios[${k}].status.includes('cancelado')`)), 8000, 'remetente cancelado');
});

console.log('\nPIN, ocultação e erros');
await teste('PIN: sem PIN e com PIN errado são barrados; PIN certo envia', async () => {
  await B.ev(`window.politica='aceitar'; rede.pin='4321'; registro.pedidos.length=0`);
  const k = await A.ev(`enviar(${JSON.stringify(idB)}, [{nome:'p.bin', tam:50000}])`);
  await ate(async () => (await A.ev(`envios[${k}].status.some(s=>s.startsWith('pedePin'))`)), 8000, 'pedir PIN');
  igual(await B.ev('registro.pedidos.length'), 0, 'pedido não deveria ter chegado sem PIN');
  await A.ev(`envios[${k}].envio.enviarPin('0000')`);
  await ate(async () => (await A.ev(`envios[${k}].status.filter(s=>s.startsWith('pedePin')).length`)) === 2, 8000, 'segunda tentativa');
  await A.ev(`envios[${k}].envio.enviarPin('4321')`);
  await ate(async () => (await A.ev(`envios[${k}].status.includes('concluido')`)), 15000, 'concluir com PIN certo');
  igual(await B.ev('registro.pedidos[0].arquivos.length'), 1, 'arquivo');
});
await teste('PIN: três erros bloqueiam novas tentativas', async () => {
  await B.ev(`registro.pedidos.length=0`);
  const k = await A.ev(`enviar(${JSON.stringify(idB)}, [{nome:'q.bin', tam:1000}], {pin:'1111'})`);
  for (let n = 2; n <= 3; n++) { await ate(async () => (await A.ev(`envios[${k}].status.filter(s=>s.startsWith('pedePin')).length`)) === n - 1, 8000, 'pedir PIN'); await A.ev(`envios[${k}].envio.enviarPin('2222')`); }
  await ate(async () => (await A.ev(`envios[${k}].status.some(s=>s.startsWith('falhou') && s.includes('bloqueou'))`)), 8000, 'bloqueio');
  await B.ev(`rede.pin=''`);
});
await teste('aparelho oculto não recebe pedidos, mesmo conhecendo o identificador', async () => {
  await B.ev(`rede.atualizarPerfil({visivel:false}); registro.pedidos.length=0`); await dormir(400);
  const k = await A.ev(`enviar(${JSON.stringify(idB)}, [{nome:'o.bin', tam:1000}])`);
  await ate(async () => (await A.ev(`envios[${k}].status.some(s=>s.startsWith('falhou') && s.includes('oculto'))`)), 8000, 'falha por oculto');
  await B.ev('rede.atualizarPerfil({visivel:true})');
});
await teste('enviar para aparelho que saiu da rede: erro claro, sem travar', async () => {
  const k = await A.ev(`enviar('abcdef123456', [{nome:'z.bin', tam:1000}])`);
  await ate(async () => (await A.ev(`envios[${k}].status.some(s=>s.startsWith('falhou'))`)), 8000, 'falha');
  const msg = await A.ev(`envios[${k}].status.find(s=>s.startsWith('falhou'))`); verdade(/não está conectado/.test(msg), 'mensagem inesperada: ' + msg);
});
await teste('fechar o navegador de destino remove-o da lista dos outros', async () => {
  B.fechar(); await ate(async () => (await A.ev('registro.aparelhos.length')) === 0, 10000, 'B sair');
});

A.fechar(); srv.close(); processos.forEach(matarArvore);
console.log(`\n${ok} testes passaram, ${falhas.length} falharam.`);
if (falhas.length) { falhas.forEach(([n, m]) => console.log(` - ${n}: ${m}`)); process.exit(1); }
process.exit(0);
