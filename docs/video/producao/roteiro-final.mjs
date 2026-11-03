// Linha do tempo FINAL da produção (Etapa 2). Os 27 Motion Frames aprovados são mantidos;
// os tempos a partir do envio seguem a velocidade REAL do protótipo (aceite automático em 1,9 s,
// transferência de ~6,7 s para 252,9 MB), com câmera em câmera lenta de 0,55× só durante o aceite.
// Usado pelo compositor (navegador) e pelo gravador (Node).

export const FPS = 30;
export const DURACAO = 48.7;
export const CV = 24.7; // instante do clique de envio (vídeo)
export const LENTO = { ini: CV, fim: CV + 4.55, fator: 0.55 }; // relógio do app mais lento durante o aceite

// Dados de exemplo (simulados; tamanho total 252,9 MB → transferência de ~6,7 s no protótipo)
export const AMOSTRA = [
  { name: 'apresentacao-extensao.pdf', size: 4800000, kind: 'file' },
  { name: 'fotos-oficina.zip', size: 246000000, kind: 'file' },
  { name: 'cartaz-evento.png', size: 2100000, kind: 'image' },
];

// ── Mundo ──
export const DESK = { x: 48, y: 150, s: 1.05 };
export const PH = { x: 1450, y: 170, s: 400 / 375 };

// ── Câmeras (derivadas da geometria medida; ver storyboard-dados.mjs) ──
const C = {
  FULL: { cx: 960, cy: 540, z: 1 }, WIDE: { cx: 720, cy: 589, z: 1.15 }, M07: { cx: 711, cy: 617, z: 1.32 }, M08: { cx: 850, cy: 381, z: 1.57 },
  M09: { cx: 850, cy: 489, z: 1.48 }, M10: { cx: 850, cy: 828, z: 1.6 }, M11: { cx: 850, cy: 758, z: 1.57 }, M12: { cx: 464, cy: 787, z: 2.2 },
  M14: { cx: 850, cy: 513, z: 1.63 }, BOTH: { cx: 954, cy: 667, z: 1.01 }, M16: { cx: 1650, cy: 829, z: 1.69 }, M20: { cx: 1172, cy: 802, z: 2.2 },
  M21: { cx: 1650, cy: 951, z: 2 }, M22: { cx: 1172, cy: 814, z: 2.2 }, M23: { cx: 1650, cy: 920, z: 2 }, OUT: { cx: 960, cy: 540, z: 0.8 },
};
const ENTER = [0.16, 1, 0.3, 1], STD = [0.2, 0, 0, 1];
// [instante de início, câmera, duração, curva] — a câmera sai da posição anterior
export const CAMERA = [
  [0, C.FULL, 0, STD],
  [4.9, C.WIDE, 0.01, STD],
  [8.0, C.M07, 1.0, ENTER], [12.0, C.M08, 1.0, ENTER], [14.0, C.M09, 0.9, ENTER], [16.5, C.M10, 1.1, STD],
  [20.0, C.M11, 0.9, ENTER], [22.0, C.M12, 0.9, ENTER],
  [CV, C.M14, 0.6, ENTER], [CV + 1.0, C.BOTH, 0.7, STD], [CV + 1.6, C.M16, 0.7, ENTER], [CV + 3.2, C.BOTH, 0.9, STD],
  [31.0, C.M20, 0.9, ENTER], [33.2, C.M21, 1.0, STD], [35.1, C.M23, 0.7, ENTER], [36.4, C.M22, 0.9, STD], [38.2, C.BOTH, 1.1, ENTER],
  [41.7, C.OUT, 1.0, STD], [43.5, C.FULL, 0.01, STD],
];

// ── Legendas (pt-BR): [início, fim, texto] ──
export const LEGENDAS = [
  [6.3, 8.0, 'Procurando aparelhos por perto'], [8.3, 11.8, 'Aparelhos por perto aparecem na tela'],
  [12.3, 13.9, 'Arraste os arquivos para a janela'], [14.2, 16.4, '3 itens · 252,9 MB prontos para enviar'],
  [16.8, 19.8, 'Escolha para onde enviar'], [20.2, 21.8, 'Meus aparelhos'], [22.2, 24.5, 'Selecione Arara Atenta'],
  [CV + 0.4, CV + 1.2, 'Aguardando o aparelho aceitar'], [CV + 1.3, CV + 1.9, 'No celular…'], [CV + 2.0, CV + 2.9, 'Arara Atenta recebe o pedido'],
  [CV + 3.0, CV + 3.4, 'Aceitar com um toque'], [CV + 3.5, CV + 4.6, 'Arara Atenta aceitou'], [CV + 4.7, 6.3 + 24.7, 'Enviando e recebendo ao mesmo tempo'],
  [31.4, 33.1, 'Acompanhe o progresso'], [33.6, 35.0, 'Recebendo no celular'], [35.3, 36.8, 'Recebido · salvo em Downloads'],
  [36.9, 38.2, 'Tudo certo'], [38.8, 41.2, 'Concluído · 252,9 MB'],
];

// ── Ações no app (executadas pelo gravador): [instante, id] ──
export const ACOES = [
  [4.6, 'carregar'],
  [12.2, 'arrastar'], [13.9, 'soltar'],
  [20.6, 'clicar-aba'],
  [CV, 'clicar-arara'],
  [CV + 0.3, 'pedido-celular'],
  [CV + 3.0, 'aceitar-celular'],
];

// ── Cursor: [instante, alvo, deslocamento em px do mundo, visível] ──
// alvos: 'composer' | 'abaMeus' | 'arara'
export const CURSOR = [
  [12.0, 'composer', [300, 170], 1], [12.9, 'composer', [-30, 60], 1], [13.9, 'composer', [-30, 60], 1], [14.9, 'composer', [330, 230], 1], [15.0, 'composer', [330, 230], 0],
  [20.0, 'abaMeus', [170, 100], 1], [20.6, 'abaMeus', [0, 0], 1], [21.0, 'abaMeus', [0, 0], 1], [22.7, 'arara', [0, 0], 1], [CV + 0.9, 'arara', [0, 0], 1], [CV + 1.2, 'arara', [0, 0], 0],
];
// Anéis: [instante, 'arara' | 'aceitar']
export const ANEIS = [[20.6, 'abaMeus'], [CV, 'arara'], [CV + 3.0, 'aceitar']];
