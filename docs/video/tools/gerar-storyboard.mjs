// Gera docs/video/storyboard.html e docs/video/ROTEIRO_E_STORYBOARD.md a partir de storyboard-dados.mjs.
// Uso:  node gerar-storyboard.mjs        (de dentro de docs/video/tools)
// Cada quadro é desenhado com as capturas REAIS (capturas/*.png) no palco 1920×1080, aplicando a câmera
// (pan + zoom) do Motion Frame. Nada aqui é tela inventada: só posicionamento, cursor, anel e legenda.

import { writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCENES, FRAMES, STAGE, DESK, PH, d2w, p2w, GEO } from './storyboard-dados.mjs';

const VID = join(dirname(fileURLToPath(import.meta.url)), '..');
const TOTAL = SCENES.at(-1).fim;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const LOGO = '../design/assets/eras%C3%B3-logo-horizontal.png';
const mmss = (t) => `${String(Math.floor(t / 60)).padStart(2, '0')}:${(t % 60).toFixed(1).padStart(4, '0')}`;
const sc = (id) => SCENES.find((s) => s.id === id);

// ───────────── Texto compartilhado (HTML e MD) ─────────────
const DIRECAO = [
  { t: 'Câmera', i: [
    'Palco 1920×1080 a 30 fps. “Mundo” fixo: janela do notebook (1344×756) à esquerda, celular (400×866) à direita. A câmera só faz pan + zoom (sem rotação nem perspectiva 3D).',
    'Zoom entre 1,0× e 2,2× durante o app; 0,8× só no fecho. Os enquadramentos são calculados a partir da geometria medida em cada captura (capturas/geometria.json) — nenhum recorte feito “no olho”. O alvo fica ~70 px acima do centro para a legenda nunca cobrir o foco.',
    'Cada movimento dura 0,8–1,1 s e termina em repouso de pelo menos 1,2 s antes do próximo.',
  ] },
  { t: 'Transições', i: [
    'Dentro do app não há corte: a câmera é contínua e é a própria interface real que muda de estado.',
    'Dissolve de 300 ms apenas nas duas fronteiras marca ↔ app (S0→S1 e S6→S7).',
    'Elemento compartilhado: a logo da abertura voa até o lugar exato da marca na barra lateral (MF-05), no mesmo gesto do estado “abrindo” da especificação de movimento.',
  ] },
  { t: 'Ritmo', i: [
    '62 s no total: uma ideia por cena de 5–8 s; o pico de movimento fica no envio e na aceitação (S4); respiros deliberados em MF-04 (0,8 s) e MF-24 (2 s).',
    'Marcação do tempo de cada quadro na tabela e na linha do tempo (tempo de início + duração).',
  ] },
  { t: 'Microinterações', i: [
    'Da interface real (reproduzidas, não recriadas): pulso de descoberta, entrada dos cartões, overlay “Solte para adicionar”, itens da bandeja em cascata, hover do cartão, trilha origem→destino, barra de progresso, mudança do dock para “Tudo certo”, aviso (toast) e o estado da marca na lateral.',
    'Adicionadas na composição (sempre discretas): cursor (seta grafite com contorno claro; arco curvo de 700–900 ms), anel de clique laranja e anel de toque branco com contorno grafite (para contrastar com o botão laranja Aceitar); 0→56 px, some em 450 ms, legendas.',
    'Tokens de easing do próprio design system: enter (.16,1,.3,1), standard (.2,0,0,1), settle (.34,1.3,.64,1). Sem bounce exagerado, sem partículas, sem glow.',
  ] },
  { t: 'Legendas e marca', i: [
    'Legendas em português, pílula areia, Lexend 34 px, cor verde-floresta; 1 linha; entram em 280 ms (fade + 8 px) e saem em 200 ms; mínimo de 1,6 s na tela.',
    'Chip permanente “Protótipo · dados simulados” nas cenas do app, para não sugerir que a transferência já funciona em rede.',
    'Identidade: fundo areia, trilha laranja→verde, logo oficial em PNG (não há SVG oficial; ver riscos).',
  ] },
  { t: 'Áudio', i: ['Sem narração. Por padrão, vídeo mudo com legendas (assiste-se sem som). Trilha sonora é decisão sua (abaixo).'] },
];

const FLUXOS = [
  ['Descoberta de aparelhos', 'pulso e chegada dos cartões na grade', 'D01, D02'],
  ['Adicionar arquivos', 'overlay de soltar e bandeja com 3 itens (132,9 MB)', 'D03, D04'],
  ['Escolher destino', 'aba “Meus aparelhos”, cartão Arara Atenta, hover', 'D05, D06'],
  ['Envio', 'painel com trilha origem→destino; aguardando; aceitou', 'D07, D08'],
  ['Recebimento (celular)', 'tela inicial, folha de pedido, Aceitar', 'P01, P02'],
  ['Progresso', 'dock “Enviando/Recebendo” com barra e percentual', 'D09, D10, P03, P04'],
  ['Conclusão', 'dock “Tudo certo”, aviso “Recebido … salvo em Downloads”', 'D11, D12, P05'],
];

const DECISOES = [
  ['Storyboard', 'Aprovar os 27 Motion Frames e os 62 s, ou indicar quais cortar/mudar (versão curta de ~45 s é possível removendo MF-10, MF-15 e MF-21).'],
  ['Codificação', 'Autorizar a instalação do ffmpeg via winget (pacote Gyan.FFmpeg) para exportar MP4 H.264. Sem ele, só consigo WebM, com menos controle.'],
  ['Áudio', 'Sem som (recomendado) ou você fornece uma trilha livre de direitos.'],
  ['Legendas', 'Legendas em português queimadas no vídeo (recomendado) ou vídeo sem texto.'],
  ['Dados de exemplo', 'Aprovar os nomes simulados (Ipê Sereno, Arara Atenta) e os três arquivos de exemplo (apresentacao-extensao.pdf, fotos-oficina.zip, cartaz-evento.png — escolhidos por mim para a demonstração).'],
  ['Tema', 'Apenas tema claro (recomendado) ou também uma versão escura.'],
  ['Fecho', 'Decidido: o fecho mostra só a logo do ERASÓ, sem créditos institucionais nem ODS (a linha de protótipo permanece).'],
];

const RISCOS = [
  ['ffmpeg ausente', 'Não está instalado nesta máquina (winget está disponível). Depende da decisão acima.'],
  ['Captura determinística', 'Teste feito: o relógio virtual do navegador avançou 184 quadros seguidos em passos de 33,3 ms e a interface real animou normalmente; a captura travou no quadro 184 (≈6 s de vídeo). Causa ainda não identificada. Se não resolver, gravo em tempo real e ajusto o tempo na composição.'],
  ['Logo animada com PNG', 'Só existe a logo oficial em PNG. A revelação usa máscara sobre o PNG (sem vetor). O SVG oficial (pendência D11) permitiria animar o símbolo com mais precisão.'],
  ['Dois aparelhos, duas instâncias', 'O protótipo não tem rede: notebook e celular são duas instâncias independentes. O sincronismo é roteirizado e declarado no aviso “Demonstração do protótipo · dados simulados”. Os percentuais das capturas (ex.: 42% × 67%) diferem; na produção rodam em sincronia.'],
  ['Escopo', 'Ficam de fora, de propósito: rota remota, Caixa, histórico, link, pareamento e tema escuro. Não inventei telas nem funcionalidades; só o fluxo pedido.'],
  ['App intocado', 'O app não é modificado. A cena é preparada pelo console (como o botão “Simular” do próprio app) e por cliques reais.'],
];

// ───────────── Palco de um quadro ─────────────
function stageHTML(f) {
  const cam = f.cam;
  const tx = 960 - cam.cx * cam.z, ty = 540 - cam.cy * cam.z;
  let world = '';
  if (f.desk) {
    world += `<div class="win" style="left:${DESK.x}px;top:${DESK.y + (f.deskDy || 0)}px;width:1344px;height:756px;opacity:${f.deskO ?? 1}"><img src="capturas/${f.desk}.png" alt=""></div>`;
  }
  if (f.ph) {
    const fx = f.phFx || {};
    world += `<div class="ph" style="left:${PH.x + (fx.dx || 0)}px;top:${PH.y}px;width:400px;height:866px;opacity:${fx.o ?? 1}"><img src="capturas/${f.ph}.png" alt=""></div>`;
  }
  for (const o of f.ov || []) {
    const [x, y] = o.at, k = 1 / cam.z;
    if (o.k === 'cursor') {
      world += `<svg class="cur" style="left:${x}px;top:${y}px;transform:scale(${(1.35 * k).toFixed(3)})" width="30" height="30" viewBox="0 0 30 30"><path d="M3 2v21l5.6-5 3.6 8.4 4-1.7-3.6-8.2H21z" fill="#111311" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
      if (o.files) world += `<div class="chips" style="left:${x + 20 * k}px;top:${y + 26 * k}px;transform:scale(${(k * 1.2).toFixed(3)})"><i></i><i></i><i></i></div>`;
    }
    if (o.k === 'ring' || o.k === 'tap') {
      const r = 28 * k;
      world += `<div class="ring ${o.k}" style="left:${x - r}px;top:${y - r}px;width:${2 * r}px;height:${2 * r}px;border-width:${3 * k}px"></div>`;
    }
  }
  if (f.brand?.k === 'fly') {
    const [bx, by] = d2w(14, 20);
    world += `<img class="flylogo" src="${LOGO}" alt="" style="left:${bx}px;top:${by + (f.deskDy || 0)}px;width:${219 * DESK.s}px">`;
  }
  let brand = '';
  const b = f.brand;
  if (b?.k === 'dot') brand += `<div class="node o" style="left:700px;top:540px"></div>`;
  if (b?.k === 'trail') {
    const x2 = 700 + 520 * b.p;
    brand += `<div class="line" style="left:700px;top:538px;width:${x2 - 700}px"></div><div class="node o" style="left:700px;top:540px"></div><div class="node g ghost" style="left:1220px;top:540px"></div>`;
  }
  if (b?.k === 'logo') {
    if (b.trail) brand += `<div class="line ${b.trail === 2 ? 'solid' : 'faint'}" style="left:560px;top:757px;width:800px"></div><div class="node o ${b.trail === 2 ? '' : 'faint'}" style="left:560px;top:760px"></div><div class="node g ${b.trail === 2 ? '' : 'faint'}" style="left:1360px;top:760px"></div>`;
    brand += `<img class="biglogo" src="${LOGO}" alt="" style="left:${960 - 380}px;top:330px;width:760px">`;
    if (b.foot) brand += `<div class="foot"><span>Demonstração do protótipo · dados simulados</span></div>`;
  }
  const chip = (f.desk || f.ph) && f.brand?.k !== 'none' && f.sc !== 'S7' && f.sc !== 'S0' ? `<div class="schip">Protótipo · dados simulados</div>` : '';
  const cap = f.cap ? `<div class="cap">${esc(f.cap)}</div>` : '';
  return `<div class="stage"><div class="world" style="transform:translate(${tx.toFixed(1)}px,${ty.toFixed(1)}px) scale(${cam.z})">${world}</div>${brand}${chip}${cap}</div>`;
}

// ───────────── HTML ─────────────
function cardHTML(f) {
  const caps = [f.desk && f.desk.slice(0, 3), f.ph && f.ph.slice(0, 3)].filter(Boolean);
  const z = f.cam.z;
  return `<article class="mf" id="${f.id}">
  <div class="thumb"><div class="scale">${stageHTML(f)}</div><span class="tc">${mmss(f.t)} · ${f.d.toFixed(1)} s</span></div>
  <div class="meta">
    <h4><b>${f.id}</b> ${esc(f.titulo)}</h4>
    <p class="chips2"><span class="tp ${f.tipo.replace('+', '')}">${f.tipo === 'marca' ? 'composição de marca' : f.tipo === 'real' ? 'interface real' : 'interface real + cursor'}</span>${caps.map((c) => `<span class="cap-id">${c}</span>`).join('')}<span class="cam">câmera ${z.toFixed(2)}× · ${f.cam.cx}, ${f.cam.cy}</span></p>
    <p>${esc(f.mov)}</p>
    <p class="ease">Curva: ${esc(f.ease)}</p>
    ${f.cap ? `<p class="legenda">Legenda: “${esc(f.cap)}”</p>` : ''}
  </div></article>`;
}

function html() {
  const strip = SCENES.map((s) => `<a href="#${s.id}" class="seg" style="flex:${s.fim - s.ini};background:${s.cor}"><b>${s.id}</b><span>${esc(s.nome)}</span><em>${s.ini}–${s.fim} s</em></a>`).join('');
  const ticks = FRAMES.map((f) => `<a href="#${f.id}" class="tick" style="left:${(f.t / TOTAL) * 100}%" title="${f.id} · ${mmss(f.t)}"><i></i><span>${f.id.slice(3)}</span></a>`).join('');
  const sections = SCENES.map((s) => `<section id="${s.id}"><header class="sh"><span class="dot" style="background:${s.cor}"></span><h3>${s.id} · ${esc(s.nome)} <small>${s.ini}–${s.fim} s</small></h3><p>${esc(s.obj)}</p></header><div class="grid">${FRAMES.filter((f) => f.sc === s.id).map(cardHTML).join('')}</div></section>`).join('');
  const shots = readdirSync(join(VID, 'capturas')).filter((n) => /^[DP]\d\d.*\.png$/.test(n)).sort();
  const sheet = shots.map((n) => `<figure class="${n[0] === 'P' ? 'p' : 'd'}"><img src="capturas/${n}" loading="lazy" alt=""><figcaption>${n.replace('.png', '')}</figcaption></figure>`).join('');
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ERASÓ · Storyboard do vídeo</title>
<style>
:root{--sand:#F7F2E8;--sand2:#EFE7D7;--ink:#022C17;--fl:#004F29;--gr:#0C884A;--br:#F76100;--mut:#4d5b52;--line:#d9d0bd;--card:#fffdf8}
*{box-sizing:border-box}body{margin:0;background:var(--sand);color:var(--ink);font:16px/1.5 "Instrument Sans",system-ui,-apple-system,"Segoe UI",sans-serif}
.wrap{max-width:1240px;margin:0 auto;padding:0 20px}
header.top{padding:40px 0 18px}h1{font:700 clamp(26px,4vw,40px)/1.1 Lexend,system-ui,sans-serif;margin:0 0 8px;letter-spacing:-.01em}
.lead{max-width:70ch;color:var(--mut);margin:0 0 14px}.badge{display:inline-block;background:var(--br);color:#fff;font-weight:600;font-size:13px;padding:3px 10px;border-radius:99px;margin-right:8px}
h2{font:600 24px/1.2 Lexend,system-ui,sans-serif;margin:44px 0 12px}
.strip{display:flex;border-radius:12px;overflow:hidden;gap:2px;margin:8px 0 0}.seg{color:#fff;text-decoration:none;padding:10px 12px;min-width:0;display:flex;flex-direction:column;gap:0}.seg b{font-size:13px}.seg span{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.seg em{font-size:12px;font-style:normal;opacity:.85}
.ticks{position:relative;height:34px;margin:2px 0 0}.tick{position:absolute;top:0;transform:translateX(-50%);text-decoration:none;color:var(--ink);font-size:11px;display:flex;flex-direction:column;align-items:center;font-variant-numeric:tabular-nums}.tick i{width:2px;height:10px;background:var(--ink);opacity:.5}.tick span{margin-top:1px}
section{margin-top:28px}.sh{display:grid;grid-template-columns:14px 1fr;column-gap:10px;align-items:center;margin-bottom:12px}.sh .dot{width:14px;height:14px;border-radius:50%}.sh h3{font:600 20px/1.2 Lexend,system-ui,sans-serif;margin:0}.sh h3 small{font:500 14px "Instrument Sans",system-ui;color:var(--mut);margin-left:6px}.sh p{grid-column:2;margin:2px 0 0;color:var(--mut);font-size:15px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:18px}
.mf{background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden;scroll-margin-top:12px}
.thumb{position:relative;aspect-ratio:16/9;background:var(--sand);overflow:hidden;border-bottom:1px solid var(--line);container-type:inline-size}
.scale{position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:0 0;transform:scale(calc(100cqw / 1920px))}
.tc{position:absolute;left:8px;top:8px;background:rgba(2,44,23,.88);color:#fff;font:600 12px/1 ui-monospace,Consolas,monospace;padding:4px 7px;border-radius:6px}
.meta{padding:12px 14px 14px}.meta h4{margin:0 0 6px;font:600 16px/1.3 Lexend,system-ui,sans-serif}.meta h4 b{color:var(--br);margin-right:4px}.meta p{margin:6px 0 0;font-size:14px;color:#25382d}
.chips2{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 4px!important}.tp,.cap-id,.cam{font-size:12px;padding:2px 8px;border-radius:99px;border:1px solid var(--line);background:#fff;color:var(--ink)}
.tp.real{background:#e4f3ea;border-color:#b4dcc4}.tp.realov{background:#e4f3ea;border-color:#b4dcc4}.tp.marca{background:#fbe9dc;border-color:#f2c4a4}.cap-id{font-family:ui-monospace,Consolas,monospace}.cam{color:var(--mut);font-variant-numeric:tabular-nums}
.ease{color:var(--mut)!important;font-size:13px!important}.legenda{font-weight:600;color:var(--fl)!important}
/* palco */
.stage{position:absolute;inset:0;width:1920px;height:1080px;overflow:hidden;background:radial-gradient(120% 90% at 50% 40%,#F9F5EC 0%,#F2EBDB 100%)}
.world{position:absolute;left:0;top:0;transform-origin:0 0}
.win{position:absolute;border-radius:14px;overflow:hidden;box-shadow:0 0 0 1px rgba(2,44,23,.12),0 30px 80px rgba(2,44,23,.18)}.win img,.ph img{display:block;width:100%;height:100%}
.ph{position:absolute;border-radius:34px;overflow:hidden;box-shadow:0 0 0 10px #111311,0 30px 80px rgba(2,44,23,.28)}
.cur{position:absolute;transform-origin:3px 2px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.28))}.chips{position:absolute;display:flex;gap:4px;transform-origin:0 0}.chips i{width:34px;height:42px;border-radius:5px;background:#fff;border:2px solid var(--fl);box-shadow:0 2px 6px rgba(0,0,0,.2)}
.ring{position:absolute;border:solid var(--br);border-radius:50%;background:rgba(247,97,0,.14)}.ring.tap{border-color:#fff;background:rgba(255,255,255,.28);box-shadow:0 0 0 3px rgba(17,19,17,.55)}
.flylogo{position:absolute;display:block}
.node{position:absolute;width:32px;height:32px;margin:-16px 0 0 -16px;border-radius:50%}.node.o{background:var(--br)}.node.g{background:var(--gr)}.node.ghost{background:transparent;border:4px solid var(--gr);opacity:.4}.node.faint{opacity:.25}
.line{position:absolute;height:6px;border-radius:3px;background:var(--ink)}.line.faint{opacity:.25}.line.solid{background:var(--gr)}
.biglogo{position:absolute;display:block}.tagline{position:absolute;left:0;right:0;text-align:center;font:600 46px/1.2 Lexend,system-ui,sans-serif;color:var(--fl)}
.foot{position:absolute;left:0;right:0;bottom:90px;display:flex;flex-direction:column;align-items:center;gap:6px;font:500 26px/1.3 "Instrument Sans",system-ui,sans-serif;color:var(--mut)}.foot .ph{position:static;box-shadow:none;border-radius:0;font:500 24px ui-monospace,Consolas,monospace;color:var(--br);width:auto;height:auto}
.cap{position:absolute;left:50%;bottom:64px;transform:translateX(-50%);background:var(--sand);border:1px solid var(--line);color:var(--ink);font:600 34px/1.2 Lexend,system-ui,sans-serif;padding:14px 30px;border-radius:99px;box-shadow:0 8px 28px rgba(2,44,23,.16);white-space:nowrap}
.schip{position:absolute;left:36px;bottom:36px;font:600 20px "Instrument Sans",system-ui,sans-serif;color:var(--mut);background:rgba(247,242,232,.9);border:1px solid var(--line);padding:6px 14px;border-radius:99px}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}.box{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 18px}.box h3{margin:0 0 8px;font:600 17px Lexend,system-ui,sans-serif}.box ul{margin:0;padding-left:18px}.box li{margin:6px 0;font-size:15px}
table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden;font-size:14px}th,td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--line);vertical-align:top}th{background:var(--sand2);font-weight:600}tr:last-child td{border-bottom:0}td:first-child{font-weight:600;white-space:nowrap}
.sheet{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}.sheet figure{margin:0;background:#fff;border:1px solid var(--line);border-radius:10px;padding:8px}.sheet img{display:block;width:100%;height:150px;object-fit:contain;background:#eee;border-radius:6px}.sheet figcaption{font:12px ui-monospace,Consolas,monospace;margin-top:6px;color:var(--mut)}
.note{background:#fff7ef;border:1px solid #f2c4a4;border-radius:12px;padding:12px 16px;margin:14px 0;font-size:15px}
footer{padding:36px 0 60px;color:var(--mut);font-size:14px}
@media (max-width:520px){.grid{grid-template-columns:1fr}}
</style></head><body><div class="wrap">
<header class="top"><span class="badge">Para aprovação</span><span class="badge" style="background:var(--fl)">Etapa 2 · Vídeo</span>
<h1>Storyboard e Motion Frames — vídeo de demonstração do ERASÓ</h1>
<p class="lead">27 Motion Frames em 8 cenas, 62 s, 1920×1080 a 30 fps. Cada miniatura usa os pixels <b>reais</b> do protótipo capturado (nenhuma tela foi redesenhada) e mostra exatamente o que a câmera enquadra. <b>Nenhuma animação foi produzida ainda</b> — aguardo sua aprovação.</p>
<div class="strip">${strip}</div><div class="ticks">${ticks}</div></header>

<h2>Auditoria: fluxos reais usados</h2>
<table><thead><tr><th>Fluxo</th><th>O que a interface real mostra</th><th>Capturas</th></tr></thead><tbody>${FLUXOS.map((r) => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('')}</tbody></table>
<p class="lead" style="margin-top:10px">17 estados capturados do protótipo real (notebook 1280×720 @2x e celular 375×812 @3x), com mouse e cliques de verdade e a geometria de cada elemento medida. Os dados (nomes de aparelhos e arquivos) são simulados pelo próprio protótipo. Na produção, os tempos a partir do envio seguem a velocidade real do protótipo (ver PRODUCAO_RELATORIO.md).</p>

<h2>Motion Frames por cena</h2>
${sections}

<h2>Direção de movimento</h2>
<div class="cols">${DIRECAO.map((d) => `<div class="box"><h3>${d.t}</h3><ul>${d.i.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}</div>

<h2>Riscos e limites (ditos com franqueza)</h2>
<table><tbody>${RISCOS.map((r) => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table>

<h2>Decisões que dependem de você</h2>
<table><tbody>${DECISOES.map((r) => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table>
<div class="note"><b>Depois da aprovação:</b> gravar as camadas reais → compor câmera, legendas e marca → exportar MP4 → revisar a fidelidade quadro a quadro contra as capturas.</div>

<h2>Capturas reais (matéria-prima)</h2>
<div class="sheet">${sheet}</div>
<footer>Gerado por <code>docs/video/tools/gerar-storyboard.mjs</code> a partir de <code>storyboard-dados.mjs</code> e <code>capturas/geometria.json</code>.</footer>
</div></body></html>`;
}

// ───────────── Markdown ─────────────
function md() {
  const L = [];
  L.push('# ERASÓ · Vídeo de demonstração — Roteiro visual e Storyboard (Etapa 2)', '');
  L.push('> **Status: para aprovação.** Nenhuma animação foi produzida. Veja as miniaturas em [storyboard.html](storyboard.html) (abra no navegador).', '');
  L.push(`Formato: 1920×1080 · 30 fps · **${TOTAL} s** · ${FRAMES.length} Motion Frames em ${SCENES.length} cenas · mudo, com legendas em português.`, '');
  L.push('## 1. Auditoria dos fluxos reais', '', '| Fluxo | O que a interface real mostra | Capturas |', '|---|---|---|');
  FLUXOS.forEach((r) => L.push(`| ${r.join(' | ')} |`));
  L.push('', 'Capturas em `docs/video/capturas/` (17 estados) e geometria em `geometria.json`. Script: `docs/video/tools/capturar-estados.mjs`. O app não foi alterado.', '');
  L.push('## 2. Roteiro visual (cenas)', '', '| Cena | Tempo | Objetivo |', '|---|---|---|');
  SCENES.forEach((s) => L.push(`| ${s.id} · ${s.nome} | ${s.ini}–${s.fim} s | ${s.obj} |`));
  L.push('', '## 3. Storyboard — Motion Frames', '');
  for (const s of SCENES) {
    L.push(`### ${s.id} · ${s.nome} (${s.ini}–${s.fim} s)`, '', '| MF | Início · duração | Estado real | Câmera (zoom · centro) | Movimento | Curva | Legenda |', '|---|---|---|---|---|---|---|');
    FRAMES.filter((f) => f.sc === s.id).forEach((f) => {
      const est = [f.desk && f.desk.slice(0, 3), f.ph && f.ph.slice(0, 3)].filter(Boolean).join(' + ') || '— (composição de marca)';
      L.push(`| **${f.id}** ${f.titulo} | ${mmss(f.t)} · ${f.d.toFixed(1)} s | ${est} | ${f.cam.z.toFixed(2)}× · ${f.cam.cx}, ${f.cam.cy} | ${f.mov} | ${f.ease} | ${f.cap ? `“${f.cap}”` : '—'} |`);
    });
    L.push('');
  }
  L.push('## 4. Direção de movimento', '');
  DIRECAO.forEach((d) => { L.push(`### ${d.t}`, ''); d.i.forEach((x) => L.push(`- ${x}`)); L.push(''); });
  L.push('## 5. Como será produzido (somente após a aprovação)', '',
    '1. **Gravar as camadas reais** — Node + Chrome DevTools Protocol controlando duas instâncias do protótipo (notebook e celular), só com entradas reais (mouse, toque) e o mesmo preparo de cena já usado nas capturas; relógio virtual em passos de 1/30 s → sequência de PNG por camada.',
    '2. **Compor** — página 1920×1080 que aplica câmera (keyframes + easings dos tokens), cursor, anéis, legendas e a marca; renderizada quadro a quadro com tempo determinístico.',
    '3. **Exportar** — MP4 H.264, yuv420p, 1080p30 (ffmpeg).',
    '4. **Revisar fidelidade** — quadro-chave × captura real (diferença de pixels na região da interface), ordem dos estados, legibilidade das legendas, relatório.', '');
  L.push('## 6. Riscos e limites', '', '| Item | Situação |', '|---|---|');
  RISCOS.forEach((r) => L.push(`| ${r[0]} | ${r[1]} |`));
  L.push('', '## 7. Decisões que dependem de você', '', '| Tema | Decisão |', '|---|---|');
  DECISOES.forEach((r) => L.push(`| ${r[0]} | ${r[1]} |`));
  L.push('');
  return L.join('\n');
}

writeFileSync(join(VID, 'storyboard.html'), html());
writeFileSync(join(VID, 'ROTEIRO_E_STORYBOARD.md'), md());
console.log(`storyboard.html e ROTEIRO_E_STORYBOARD.md gerados (${FRAMES.length} quadros, ${TOTAL} s)`);
