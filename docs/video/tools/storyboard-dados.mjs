// Dados do roteiro e do storyboard (Etapa 2). Fonte única: gerar-storyboard.mjs lê este arquivo
// e produz storyboard.html e ROTEIRO_E_STORYBOARD.md, para que os dois nunca divirjam.
// As câmeras são DERIVADAS da geometria real medida nas capturas (capturas/geometria.json).

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const GEO = JSON.parse(readFileSync(join(HERE, '..', 'capturas', 'geometria.json'), 'utf8'));

// ── Mundo (px do palco 1920×1080 com a câmera em zoom 1) ──
export const STAGE = { w: 1920, h: 1080 };
export const DESK = { x: 48, y: 150, s: 1.05 }; // janela do app: 1280×720 css → 1344×756
export const PH = { x: 1450, y: 170, s: 400 / 375 }; // celular: 375×812 css → 400×866
export const d2w = (x, y) => [DESK.x + x * DESK.s, DESK.y + y * DESK.s];
export const p2w = (x, y) => [PH.x + x * PH.s, PH.y + y * PH.s];
const rd = (st, k) => { const [x, y, w, h] = GEO[st].rects[k]; return [DESK.x + x * DESK.s, DESK.y + y * DESK.s, w * DESK.s, h * DESK.s]; };
const rp = (st, k) => { const [x, y, w, h] = GEO[st].rects[k]; return [PH.x + x * PH.s, PH.y + y * PH.s, w * PH.s, h * PH.s]; };
const union = (...rs) => { const x0 = Math.min(...rs.map((r) => r[0])), y0 = Math.min(...rs.map((r) => r[1])), x1 = Math.max(...rs.map((r) => r[0] + r[2])), y1 = Math.max(...rs.map((r) => r[1] + r[3])); return [x0, y0, x1 - x0, y1 - y0]; };
const mid = (r) => [r[0] + r[2] / 2, r[1] + r[3] / 2];

// Enquadra um retângulo do mundo; o centro do alvo fica um pouco acima do meio, para a legenda não cobrir.
function focus(r, { pad = 0.12, min = 1, max = 2.6, lift = 70 } = {}) {
  const z = Math.max(min, Math.min(max, STAGE.w / (r[2] * (1 + 2 * pad)), (STAGE.h - 2 * lift) / (r[3] * (1 + 2 * pad))));
  const [cx, cy] = mid(r);
  return { cx: +cx.toFixed(0), cy: +(cy + lift / z).toFixed(0), z: +z.toFixed(2) };
}
const FULL = { cx: 960, cy: 540, z: 1 };
const DESK_WIDE = focus([DESK.x, DESK.y, 1344, 756], { pad: 0.04, max: 1.3 });
const BOTH = focus(union([DESK.x, DESK.y, 1344, 756], [PH.x - 10, PH.y - 10, 420, 886]), { pad: 0.02, max: 1.05 });

export const SCENES = [
  { id: 'S0', nome: 'Abertura', ini: 0, fim: 6, cor: '#F76100', obj: 'Apresentar a identidade ERASÓ: a trilha (origem laranja → destino verde), a logo oficial e a assinatura “De uma ponta à outra.”' },
  { id: 'S1', nome: 'Entrando no app', ini: 6, fim: 12, cor: '#0C884A', obj: 'A logo pousa no app; o ERASÓ procura e encontra aparelhos por perto.' },
  { id: 'S2', nome: 'Selecionando arquivos', ini: 12, fim: 20, cor: '#004F29', obj: 'Soltar três arquivos na janela e ver a bandeja “3 itens · 132,9 MB”.' },
  { id: 'S3', nome: 'Escolhendo o destino', ini: 20, fim: 27, cor: '#0C884A', obj: 'Abrir “Meus aparelhos”, passar o cursor em Arara Atenta e clicar.' },
  { id: 'S4', nome: 'Envio e pedido', ini: 27, fim: 35, cor: '#F76100', obj: 'O envio aguarda; no celular chega o pedido; o toque em Aceitar libera a transferência.' },
  { id: 'S5', nome: 'Transferência', ini: 35, fim: 45, cor: '#004F29', obj: 'Os dois aparelhos mostram o progresso ao mesmo tempo.' },
  { id: 'S6', nome: 'Conclusão', ini: 45, fim: 55, cor: '#0C884A', obj: '“Tudo certo” no notebook; “Recebido … salvo em Downloads” no celular.' },
  { id: 'S7', nome: 'Fecho', ini: 55, fim: 62, cor: '#022C17', obj: 'O app recua, a logo e a assinatura voltam; aviso de protótipo e placeholder institucional.' },
];

// Cada Motion Frame: estado real (desk/ph = captura usada), câmera, camadas, overlays e movimento.
//  tipo: 'real' = pixels da interface real; 'real+ov' = real com cursor/anel sobrepostos; 'marca' = composição de identidade.
const dock = (st) => rd(st, 'dock');
const arara6 = mid(rd('D06-hover-destino', 'cardArara'));
const accept = mid(rp('P02-celular-pedido', 'accept'));
const compC = mid(rd('D03-soltar-arquivos', 'composer'));
const phoneFocus = focus(rp('P02-celular-pedido', 'dialog'), { pad: 0.06, max: 1.9 });

export const FRAMES = [
  // ── S0 Abertura ──
  { id: 'MF-01', sc: 'S0', t: 0.0, d: 1.2, titulo: 'Origem', tipo: 'marca', brand: { k: 'dot' }, cam: FULL,
    mov: 'Fundo areia vazio. Um ponto laranja (origem da trilha) nasce em escala 0 → 1.', ease: 'settle · cubic-bezier(.34,1.3,.64,1)', cap: '' },
  { id: 'MF-02', sc: 'S0', t: 1.2, d: 1.2, titulo: 'A trilha se desenha', tipo: 'marca', brand: { k: 'trail', p: 0.62 }, cam: FULL,
    mov: 'A linha verde-floresta avança da origem laranja até o destino verde; o nó de destino acende ao chegar.', ease: 'enter · cubic-bezier(.16,1,.3,1)', cap: '' },
  { id: 'MF-03', sc: 'S0', t: 2.4, d: 1.6, titulo: 'A logo se revela', tipo: 'marca', brand: { k: 'logo', trail: 1, tag: 0 }, cam: FULL,
    mov: 'A logo oficial (PNG) é revelada por uma máscara que percorre o caminho da trilha, da esquerda para a direita; a trilha esmaece para 25%.', ease: 'enter · 700 ms', cap: '' },
  { id: 'MF-04', sc: 'S0', t: 4.0, d: 1.2, titulo: 'Assinatura', tipo: 'marca', brand: { k: 'logo', trail: 1, tag: 1 }, cam: FULL,
    mov: 'A assinatura “De uma ponta à outra.” — que já faz parte da logo oficial — é revelada por uma segunda máscara, com a linha laranja→verde crescendo. Segura 0,8 s de respiro.', ease: 'enter · 450 ms', cap: '' },
  { id: 'MF-05', sc: 'S0', t: 5.2, d: 0.8, titulo: 'A logo viaja para o app', tipo: 'marca', brand: { k: 'fly' }, desk: 'D01-descoberta-buscando', deskO: 0.55, deskDy: 28, cam: DESK_WIDE,
    mov: 'Elemento compartilhado: a logo encolhe e voa até o lugar exato da marca na barra lateral enquanto a janela do app sobe 28 px e ganha opacidade.', ease: 'standard · cubic-bezier(.2,0,0,1) · 800 ms', cap: '' },

  // ── S1 Entrando no app ──
  { id: 'MF-06', sc: 'S1', t: 6.0, d: 2.0, titulo: 'Procurando aparelhos', tipo: 'real', desk: 'D01-descoberta-buscando', cam: DESK_WIDE,
    mov: 'Plano geral da janela. A interface real anima sozinha: pulso de descoberta e cartões chegando.', ease: 'câmera parada · UI em tempo real', cap: 'Procurando aparelhos por perto' },
  { id: 'MF-07', sc: 'S1', t: 8.0, d: 4.0, titulo: 'Aparelhos encontrados', tipo: 'real', desk: 'D02-descoberta-concluida', cam: focus(union(rd('D02-descoberta-concluida', 'thisDevice'), rd('D02-descoberta-concluida', 'grid')), { pad: 0.06, max: 1.4 }),
    mov: 'Câmera avança 1,0 s (zoom suave) da janela inteira para “Este aparelho” + grade de aparelhos; segura.', ease: 'enter · 1000 ms', cap: 'Aparelhos por perto aparecem na tela' },

  // ── S2 Selecionando arquivos ──
  { id: 'MF-08', sc: 'S2', t: 12.0, d: 2.0, titulo: 'Soltar arquivos', tipo: 'real+ov', desk: 'D03-soltar-arquivos', cam: focus(rd('D03-soltar-arquivos', 'composer'), { pad: 0.1, max: 1.7 }),
    ov: [{ k: 'cursor', at: [compC[0] - 30, compC[1] + 60], files: 3 }], mov: 'Cursor entra com três arquivos; a área real mostra “Solte para adicionar”.', ease: 'cursor: arco bezier 900 ms · enter', cap: 'Arraste os arquivos para a janela' },
  { id: 'MF-09', sc: 'S2', t: 14.0, d: 2.5, titulo: 'Bandeja com 3 itens', tipo: 'real', desk: 'D04-selecao-3-itens', cam: focus(rd('D04-selecao-3-itens', 'tray'), { pad: 0.16, max: 1.9 }),
    mov: 'Os itens entram em cascata (animação real do app). Câmera aproxima da bandeja.', ease: 'enter · 900 ms', cap: '3 itens · 132,9 MB prontos para enviar' },
  { id: 'MF-10', sc: 'S2', t: 16.5, d: 3.5, titulo: 'Para onde enviar?', tipo: 'real', desk: 'D04-selecao-3-itens', cam: focus(union(rd('D04-selecao-3-itens', 'destHead'), rd('D04-selecao-3-itens', 'grid')), { pad: 0.08, max: 1.6 }),
    mov: 'Câmera desce da bandeja para o cabeçalho de destino e a grade, sem corte.', ease: 'standard · 1100 ms', cap: 'Escolha para onde enviar' },

  // ── S3 Escolhendo o destino ──
  { id: 'MF-11', sc: 'S3', t: 20.0, d: 2.0, titulo: 'Meus aparelhos', tipo: 'real+ov', desk: 'D05-meus-aparelhos', cam: focus(union(rd('D05-meus-aparelhos', 'tabs'), rd('D05-meus-aparelhos', 'grid')), { pad: 0.1, max: 1.7 }),
    ov: [{ k: 'cursor', at: mid(rd('D05-meus-aparelhos', 'tabMine')) }], mov: 'Cursor clica na aba “Meus aparelhos”; a grade troca (animação real).', ease: 'cursor: 700 ms · UI real', cap: 'Meus aparelhos' },
  { id: 'MF-12', sc: 'S3', t: 22.0, d: 2.0, titulo: 'Passar o cursor', tipo: 'real+ov', desk: 'D06-hover-destino', cam: focus(rd('D06-hover-destino', 'cardArara'), { pad: 0.55, max: 2.2 }),
    ov: [{ k: 'cursor', at: arara6 }], mov: 'Câmera aproxima do cartão de Arara Atenta; o estado de hover é o do app real.', ease: 'enter · 900 ms', cap: 'Selecione Arara Atenta' },
  { id: 'MF-13', sc: 'S3', t: 24.0, d: 3.0, titulo: 'Clique', tipo: 'real+ov', desk: 'D06-hover-destino', cam: focus(rd('D06-hover-destino', 'cardArara'), { pad: 0.55, max: 2.2 }),
    ov: [{ k: 'cursor', at: arara6 }, { k: 'ring', at: arara6 }], mov: 'Anel laranja de clique (0 → 56 px, some em 450 ms). O app responde abrindo o painel de envio.', ease: 'anel: standard · 450 ms', cap: '' },

  // ── S4 Envio e pedido ──
  { id: 'MF-14', sc: 'S4', t: 27.0, d: 2.5, titulo: 'Aguardando aceitar', tipo: 'real', desk: 'D07-envio-aguardando', cam: focus(rd('D07-envio-aguardando', 'sendPanel'), { pad: 0.1, max: 1.7 }),
    mov: 'Painel de envio real com a trilha: origem (laranja) → destino (verde) e o texto “Aguardando Arara Atenta aceitar…”.', ease: 'câmera: enter 1000 ms', cap: 'Aguardando o aparelho aceitar' },
  { id: 'MF-15', sc: 'S4', t: 29.5, d: 1.5, titulo: 'Do outro lado', tipo: 'real', desk: 'D07-envio-aguardando', ph: 'P01-celular-inicio', phFx: { dx: 70, o: 0.75 }, cam: BOTH,
    mov: 'Câmera recua para o plano geral; o celular desliza da direita (70 px → 0) com a tela inicial real (P01).', ease: 'enter · 800 ms', cap: 'No celular…' },
  { id: 'MF-16', sc: 'S4', t: 31.0, d: 2.0, titulo: 'Pedido de recebimento', tipo: 'real', desk: 'D07-envio-aguardando', deskO: 0.9, ph: 'P02-celular-pedido', cam: phoneFocus,
    mov: 'A folha de pedido sobe (animação real): “Ipê Sereno · Local · Meu aparelho · Verificado — quer te enviar 3 arquivos · 132,9 MB”.', ease: 'enter · 700 ms', cap: 'Arara Atenta recebe o pedido' },
  { id: 'MF-17', sc: 'S4', t: 33.0, d: 1.0, titulo: 'Toque em Aceitar', tipo: 'real+ov', desk: 'D07-envio-aguardando', deskO: 0.9, ph: 'P02-celular-pedido', cam: phoneFocus,
    ov: [{ k: 'tap', at: accept }], mov: 'Anel de toque (branco com contorno, para contrastar com o botão laranja) sobre “Aceitar”; some em 450 ms.', ease: 'anel: standard · 450 ms', cap: 'Aceitar com um toque' },
  { id: 'MF-18', sc: 'S4', t: 34.0, d: 1.0, titulo: 'Arara aceitou', tipo: 'real', desk: 'D08-envio-aceito', ph: 'P03-celular-recebendo-a', cam: BOTH,
    mov: 'Câmera volta ao plano geral; no notebook, “Arara Atenta aceitou”; o celular já mostra “Recebendo”.', ease: 'standard · 900 ms', cap: 'Arara Atenta aceitou' },

  // ── S5 Transferência ──
  { id: 'MF-19', sc: 'S5', t: 35.0, d: 3.5, titulo: 'Os dois lados', tipo: 'real', desk: 'D09-progresso-a', ph: 'P03-celular-recebendo-a', cam: BOTH,
    mov: 'Plano geral: dock “Enviando 1” (≈26%) à esquerda e “Recebendo 1” (≈25%) à direita, em paralelo.', ease: 'câmera parada · UI em tempo real', cap: 'Enviando e recebendo ao mesmo tempo' },
  { id: 'MF-20', sc: 'S5', t: 38.5, d: 2.5, titulo: 'Progresso no notebook', tipo: 'real', desk: 'D10-progresso-b', ph: 'P04-celular-recebendo-b', cam: focus(dock('D10-progresso-b'), { pad: 0.28, max: 2.2 }),
    mov: 'Câmera aproxima do dock de transferências do notebook; a barra avança (animação real).', ease: 'enter · 900 ms', cap: 'Acompanhe o progresso' },
  { id: 'MF-21', sc: 'S5', t: 41.0, d: 4.0, titulo: 'Progresso no celular', tipo: 'real', desk: 'D10-progresso-b', ph: 'P04-celular-recebendo-b', cam: focus(rp('P04-celular-recebendo-b', 'dock'), { pad: 0.5, max: 2.0 }),
    mov: 'Câmera atravessa para o dock do celular (≈67%); segura até o fim da barra.', ease: 'standard · 1100 ms', cap: 'Recebendo no celular' },

  // ── S6 Conclusão ──
  { id: 'MF-22', sc: 'S6', t: 45.0, d: 2.0, titulo: 'Tudo certo no notebook', tipo: 'real', desk: 'D11-concluido', ph: 'P05-celular-concluido', cam: focus(dock('D11-concluido'), { pad: 0.28, max: 2.2 }),
    mov: 'Dock real muda para “Tudo certo · Concluído 132,9 MB”; a marca na lateral volta ao estado “Pronto”.', ease: 'standard · 900 ms', cap: 'Tudo certo' },
  { id: 'MF-23', sc: 'S6', t: 47.0, d: 2.5, titulo: 'Recebido no celular', tipo: 'real', desk: 'D11-concluido', ph: 'P05-celular-concluido', cam: focus(union(rp('P05-celular-concluido', 'toast'), rp('P05-celular-concluido', 'dock')), { pad: 0.5, max: 2.0 }),
    mov: 'Câmera pousa no aviso real: “Recebido de Ipê Sereno · salvo em Downloads”.', ease: 'enter · 900 ms', cap: 'Recebido · salvo em Downloads' },
  { id: 'MF-24', sc: 'S6', t: 49.5, d: 5.5, titulo: 'Concluído', tipo: 'real', desk: 'D12-concluido-repouso', ph: 'P05-celular-concluido', cam: BOTH,
    mov: 'Plano geral em repouso: os dois aparelhos concluídos. Respiro de 2 s antes do fecho.', ease: 'enter · 1100 ms', cap: 'Concluído · 132,9 MB' },

  // ── S7 Fecho ──
  { id: 'MF-25', sc: 'S7', t: 55.0, d: 2.0, titulo: 'O app recua', tipo: 'marca', desk: 'D12-concluido-repouso', deskO: 0.28, ph: 'P05-celular-concluido', phFx: { o: 0.28 }, cam: { cx: 960, cy: 540, z: 0.8 }, brand: { k: 'none' },
    mov: 'Câmera recua para zoom 0,8 enquanto as camadas do app esmaecem para 0% e o fundo areia volta.', ease: 'standard · 1000 ms', cap: '' },
  { id: 'MF-26', sc: 'S7', t: 57.0, d: 2.5, titulo: 'Logo e assinatura', tipo: 'marca', brand: { k: 'logo', trail: 2, tag: 1 }, cam: FULL,
    mov: 'A logo oficial reaparece (com a assinatura que já faz parte dela) e a trilha se desenha embaixo. A trilha fecha em verde (destino alcançado).', ease: 'enter · 700 ms', cap: '' },
  { id: 'MF-27', sc: 'S7', t: 59.5, d: 2.5, titulo: 'Aviso do protótipo', tipo: 'marca', brand: { k: 'logo', trail: 2, tag: 1, foot: 1 }, cam: FULL,
    mov: 'Surge, discreta, a linha “Demonstração do protótipo · dados simulados”. Fecho só com a logo do ERASÓ (sem créditos institucionais nem ODS). Fade final para areia.', ease: 'enter · 450 ms + fade 500 ms', cap: '' },
];
