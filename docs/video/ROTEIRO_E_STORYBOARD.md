# ERASÓ · Vídeo de demonstração — Roteiro visual e Storyboard (Etapa 2)

> **Status: para aprovação.** Nenhuma animação foi produzida. Veja as miniaturas em [storyboard.html](storyboard.html) (abra no navegador).

Formato: 1920×1080 · 30 fps · **62 s** · 27 Motion Frames em 8 cenas · mudo, com legendas em português.

## 1. Auditoria dos fluxos reais

| Fluxo | O que a interface real mostra | Capturas |
|---|---|---|
| Descoberta de aparelhos | pulso e chegada dos cartões na grade | D01, D02 |
| Adicionar arquivos | overlay de soltar e bandeja com 3 itens (132,9 MB) | D03, D04 |
| Escolher destino | aba “Meus aparelhos”, cartão Arara Atenta, hover | D05, D06 |
| Envio | painel com trilha origem→destino; aguardando; aceitou | D07, D08 |
| Recebimento (celular) | tela inicial, folha de pedido, Aceitar | P01, P02 |
| Progresso | dock “Enviando/Recebendo” com barra e percentual | D09, D10, P03, P04 |
| Conclusão | dock “Tudo certo”, aviso “Recebido … salvo em Downloads” | D11, D12, P05 |

Capturas em `docs/video/capturas/` (17 estados) e geometria em `geometria.json`. Script: `docs/video/tools/capturar-estados.mjs`. O app não foi alterado.

## 2. Roteiro visual (cenas)

| Cena | Tempo | Objetivo |
|---|---|---|
| S0 · Abertura | 0–6 s | Apresentar a identidade ERASÓ: a trilha (origem laranja → destino verde), a logo oficial e a assinatura “De uma ponta à outra.” |
| S1 · Entrando no app | 6–12 s | A logo pousa no app; o ERASÓ procura e encontra aparelhos por perto. |
| S2 · Selecionando arquivos | 12–20 s | Soltar três arquivos na janela e ver a bandeja “3 itens · 132,9 MB”. |
| S3 · Escolhendo o destino | 20–27 s | Abrir “Meus aparelhos”, passar o cursor em Arara Atenta e clicar. |
| S4 · Envio e pedido | 27–35 s | O envio aguarda; no celular chega o pedido; o toque em Aceitar libera a transferência. |
| S5 · Transferência | 35–45 s | Os dois aparelhos mostram o progresso ao mesmo tempo. |
| S6 · Conclusão | 45–55 s | “Tudo certo” no notebook; “Recebido … salvo em Downloads” no celular. |
| S7 · Fecho | 55–62 s | O app recua, a logo e a assinatura voltam; aviso de protótipo e placeholder institucional. |

## 3. Storyboard — Motion Frames

### S0 · Abertura (0–6 s)

| MF | Início · duração | Estado real | Câmera (zoom · centro) | Movimento | Curva | Legenda |
|---|---|---|---|---|---|---|
| **MF-01** Origem | 00:00.0 · 1.2 s | — (composição de marca) | 1.00× · 960, 540 | Fundo areia vazio. Um ponto laranja (origem da trilha) nasce em escala 0 → 1. | settle · cubic-bezier(.34,1.3,.64,1) | — |
| **MF-02** A trilha se desenha | 00:01.2 · 1.2 s | — (composição de marca) | 1.00× · 960, 540 | A linha verde-floresta avança da origem laranja até o destino verde; o nó de destino acende ao chegar. | enter · cubic-bezier(.16,1,.3,1) | — |
| **MF-03** A logo se revela | 00:02.4 · 1.6 s | — (composição de marca) | 1.00× · 960, 540 | A logo oficial (PNG) é revelada por uma máscara que percorre o caminho da trilha, da esquerda para a direita; a trilha esmaece para 25%. | enter · 700 ms | — |
| **MF-04** Assinatura | 00:04.0 · 1.2 s | — (composição de marca) | 1.00× · 960, 540 | A assinatura “De uma ponta à outra.” — que já faz parte da logo oficial — é revelada por uma segunda máscara, com a linha laranja→verde crescendo. Segura 0,8 s de respiro. | enter · 450 ms | — |
| **MF-05** A logo viaja para o app | 00:05.2 · 0.8 s | D01 | 1.15× · 720, 589 | Elemento compartilhado: a logo encolhe e voa até o lugar exato da marca na barra lateral enquanto a janela do app sobe 28 px e ganha opacidade. | standard · cubic-bezier(.2,0,0,1) · 800 ms | — |

### S1 · Entrando no app (6–12 s)

| MF | Início · duração | Estado real | Câmera (zoom · centro) | Movimento | Curva | Legenda |
|---|---|---|---|---|---|---|
| **MF-06** Procurando aparelhos | 00:06.0 · 2.0 s | D01 | 1.15× · 720, 589 | Plano geral da janela. A interface real anima sozinha: pulso de descoberta e cartões chegando. | câmera parada · UI em tempo real | “Procurando aparelhos por perto” |
| **MF-07** Aparelhos encontrados | 00:08.0 · 4.0 s | D02 | 1.32× · 711, 617 | Câmera avança 1,0 s (zoom suave) da janela inteira para “Este aparelho” + grade de aparelhos; segura. | enter · 1000 ms | “Aparelhos por perto aparecem na tela” |

### S2 · Selecionando arquivos (12–20 s)

| MF | Início · duração | Estado real | Câmera (zoom · centro) | Movimento | Curva | Legenda |
|---|---|---|---|---|---|---|
| **MF-08** Soltar arquivos | 00:12.0 · 2.0 s | D03 | 1.57× · 850, 381 | Cursor entra com três arquivos; a área real mostra “Solte para adicionar”. | cursor: arco bezier 900 ms · enter | “Arraste os arquivos para a janela” |
| **MF-09** Bandeja com 3 itens | 00:14.0 · 2.5 s | D04 | 1.48× · 850, 489 | Os itens entram em cascata (animação real do app). Câmera aproxima da bandeja. | enter · 900 ms | “3 itens · 132,9 MB prontos para enviar” |
| **MF-10** Para onde enviar? | 00:16.5 · 3.5 s | D04 | 1.60× · 850, 828 | Câmera desce da bandeja para o cabeçalho de destino e a grade, sem corte. | standard · 1100 ms | “Escolha para onde enviar” |

### S3 · Escolhendo o destino (20–27 s)

| MF | Início · duração | Estado real | Câmera (zoom · centro) | Movimento | Curva | Legenda |
|---|---|---|---|---|---|---|
| **MF-11** Meus aparelhos | 00:20.0 · 2.0 s | D05 | 1.57× · 850, 758 | Cursor clica na aba “Meus aparelhos”; a grade troca (animação real). | cursor: 700 ms · UI real | “Meus aparelhos” |
| **MF-12** Passar o cursor | 00:22.0 · 2.0 s | D06 | 2.20× · 464, 787 | Câmera aproxima do cartão de Arara Atenta; o estado de hover é o do app real. | enter · 900 ms | “Selecione Arara Atenta” |
| **MF-13** Clique | 00:24.0 · 3.0 s | D06 | 2.20× · 464, 787 | Anel laranja de clique (0 → 56 px, some em 450 ms). O app responde abrindo o painel de envio. | anel: standard · 450 ms | — |

### S4 · Envio e pedido (27–35 s)

| MF | Início · duração | Estado real | Câmera (zoom · centro) | Movimento | Curva | Legenda |
|---|---|---|---|---|---|---|
| **MF-14** Aguardando aceitar | 00:27.0 · 2.5 s | D07 | 1.63× · 850, 513 | Painel de envio real com a trilha: origem (laranja) → destino (verde) e o texto “Aguardando Arara Atenta aceitar…”. | câmera: enter 1000 ms | “Aguardando o aparelho aceitar” |
| **MF-15** Do outro lado | 00:29.5 · 1.5 s | D07 + P01 | 1.01× · 954, 667 | Câmera recua para o plano geral; o celular desliza da direita (70 px → 0) com a tela inicial real (P01). | enter · 800 ms | “No celular…” |
| **MF-16** Pedido de recebimento | 00:31.0 · 2.0 s | D07 + P02 | 1.69× · 1650, 829 | A folha de pedido sobe (animação real): “Ipê Sereno · Local · Meu aparelho · Verificado — quer te enviar 3 arquivos · 132,9 MB”. | enter · 700 ms | “Arara Atenta recebe o pedido” |
| **MF-17** Toque em Aceitar | 00:33.0 · 1.0 s | D07 + P02 | 1.69× · 1650, 829 | Anel de toque (branco com contorno, para contrastar com o botão laranja) sobre “Aceitar”; some em 450 ms. | anel: standard · 450 ms | “Aceitar com um toque” |
| **MF-18** Arara aceitou | 00:34.0 · 1.0 s | D08 + P03 | 1.01× · 954, 667 | Câmera volta ao plano geral; no notebook, “Arara Atenta aceitou”; o celular já mostra “Recebendo”. | standard · 900 ms | “Arara Atenta aceitou” |

### S5 · Transferência (35–45 s)

| MF | Início · duração | Estado real | Câmera (zoom · centro) | Movimento | Curva | Legenda |
|---|---|---|---|---|---|---|
| **MF-19** Os dois lados | 00:35.0 · 3.5 s | D09 + P03 | 1.01× · 954, 667 | Plano geral: dock “Enviando 1” (≈26%) à esquerda e “Recebendo 1” (≈25%) à direita, em paralelo. | câmera parada · UI em tempo real | “Enviando e recebendo ao mesmo tempo” |
| **MF-20** Progresso no notebook | 00:38.5 · 2.5 s | D10 + P04 | 2.20× · 1172, 802 | Câmera aproxima do dock de transferências do notebook; a barra avança (animação real). | enter · 900 ms | “Acompanhe o progresso” |
| **MF-21** Progresso no celular | 00:41.0 · 4.0 s | D10 + P04 | 2.00× · 1650, 951 | Câmera atravessa para o dock do celular (≈67%); segura até o fim da barra. | standard · 1100 ms | “Recebendo no celular” |

### S6 · Conclusão (45–55 s)

| MF | Início · duração | Estado real | Câmera (zoom · centro) | Movimento | Curva | Legenda |
|---|---|---|---|---|---|---|
| **MF-22** Tudo certo no notebook | 00:45.0 · 2.0 s | D11 + P05 | 2.20× · 1172, 814 | Dock real muda para “Tudo certo · Concluído 132,9 MB”; a marca na lateral volta ao estado “Pronto”. | standard · 900 ms | “Tudo certo” |
| **MF-23** Recebido no celular | 00:47.0 · 2.5 s | D11 + P05 | 2.00× · 1650, 920 | Câmera pousa no aviso real: “Recebido de Ipê Sereno · salvo em Downloads”. | enter · 900 ms | “Recebido · salvo em Downloads” |
| **MF-24** Concluído | 00:49.5 · 5.5 s | D12 + P05 | 1.01× · 954, 667 | Plano geral em repouso: os dois aparelhos concluídos. Respiro de 2 s antes do fecho. | enter · 1100 ms | “Concluído · 132,9 MB” |

### S7 · Fecho (55–62 s)

| MF | Início · duração | Estado real | Câmera (zoom · centro) | Movimento | Curva | Legenda |
|---|---|---|---|---|---|---|
| **MF-25** O app recua | 00:55.0 · 2.0 s | D12 + P05 | 0.80× · 960, 540 | Câmera recua para zoom 0,8 enquanto as camadas do app esmaecem para 0% e o fundo areia volta. | standard · 1000 ms | — |
| **MF-26** Logo e assinatura | 00:57.0 · 2.5 s | — (composição de marca) | 1.00× · 960, 540 | A logo oficial reaparece (com a assinatura que já faz parte dela) e a trilha se desenha embaixo. A trilha fecha em verde (destino alcançado). | enter · 700 ms | — |
| **MF-27** Aviso do protótipo | 00:59.5 · 2.5 s | — (composição de marca) | 1.00× · 960, 540 | Surge, discreta, a linha “Demonstração do protótipo · dados simulados”. Fecho só com a logo do ERASÓ (sem créditos institucionais nem ODS). Fade final para areia. | enter · 450 ms + fade 500 ms | — |

## 4. Direção de movimento

### Câmera

- Palco 1920×1080 a 30 fps. “Mundo” fixo: janela do notebook (1344×756) à esquerda, celular (400×866) à direita. A câmera só faz pan + zoom (sem rotação nem perspectiva 3D).
- Zoom entre 1,0× e 2,2× durante o app; 0,8× só no fecho. Os enquadramentos são calculados a partir da geometria medida em cada captura (capturas/geometria.json) — nenhum recorte feito “no olho”. O alvo fica ~70 px acima do centro para a legenda nunca cobrir o foco.
- Cada movimento dura 0,8–1,1 s e termina em repouso de pelo menos 1,2 s antes do próximo.

### Transições

- Dentro do app não há corte: a câmera é contínua e é a própria interface real que muda de estado.
- Dissolve de 300 ms apenas nas duas fronteiras marca ↔ app (S0→S1 e S6→S7).
- Elemento compartilhado: a logo da abertura voa até o lugar exato da marca na barra lateral (MF-05), no mesmo gesto do estado “abrindo” da especificação de movimento.

### Ritmo

- 62 s no total: uma ideia por cena de 5–8 s; o pico de movimento fica no envio e na aceitação (S4); respiros deliberados em MF-04 (0,8 s) e MF-24 (2 s).
- Marcação do tempo de cada quadro na tabela e na linha do tempo (tempo de início + duração).

### Microinterações

- Da interface real (reproduzidas, não recriadas): pulso de descoberta, entrada dos cartões, overlay “Solte para adicionar”, itens da bandeja em cascata, hover do cartão, trilha origem→destino, barra de progresso, mudança do dock para “Tudo certo”, aviso (toast) e o estado da marca na lateral.
- Adicionadas na composição (sempre discretas): cursor (seta grafite com contorno claro; arco curvo de 700–900 ms), anel de clique laranja e anel de toque branco com contorno grafite (para contrastar com o botão laranja Aceitar); 0→56 px, some em 450 ms, legendas.
- Tokens de easing do próprio design system: enter (.16,1,.3,1), standard (.2,0,0,1), settle (.34,1.3,.64,1). Sem bounce exagerado, sem partículas, sem glow.

### Legendas e marca

- Legendas em português, pílula areia, Lexend 34 px, cor verde-floresta; 1 linha; entram em 280 ms (fade + 8 px) e saem em 200 ms; mínimo de 1,6 s na tela.
- Chip permanente “Protótipo · dados simulados” nas cenas do app, para não sugerir que a transferência já funciona em rede.
- Identidade: fundo areia, trilha laranja→verde, logo oficial em PNG (não há SVG oficial; ver riscos).

### Áudio

- Sem narração. Por padrão, vídeo mudo com legendas (assiste-se sem som). Trilha sonora é decisão sua (abaixo).

## 5. Como será produzido (somente após a aprovação)

1. **Gravar as camadas reais** — Node + Chrome DevTools Protocol controlando duas instâncias do protótipo (notebook e celular), só com entradas reais (mouse, toque) e o mesmo preparo de cena já usado nas capturas; relógio virtual em passos de 1/30 s → sequência de PNG por camada.
2. **Compor** — página 1920×1080 que aplica câmera (keyframes + easings dos tokens), cursor, anéis, legendas e a marca; renderizada quadro a quadro com tempo determinístico.
3. **Exportar** — MP4 H.264, yuv420p, 1080p30 (ffmpeg).
4. **Revisar fidelidade** — quadro-chave × captura real (diferença de pixels na região da interface), ordem dos estados, legibilidade das legendas, relatório.

## 6. Riscos e limites

| Item | Situação |
|---|---|
| ffmpeg ausente | Não está instalado nesta máquina (winget está disponível). Depende da decisão acima. |
| Captura determinística | Teste feito: o relógio virtual do navegador avançou 184 quadros seguidos em passos de 33,3 ms e a interface real animou normalmente; a captura travou no quadro 184 (≈6 s de vídeo). Causa ainda não identificada. Se não resolver, gravo em tempo real e ajusto o tempo na composição. |
| Logo animada com PNG | Só existe a logo oficial em PNG. A revelação usa máscara sobre o PNG (sem vetor). O SVG oficial (pendência D11) permitiria animar o símbolo com mais precisão. |
| Dois aparelhos, duas instâncias | O protótipo não tem rede: notebook e celular são duas instâncias independentes. O sincronismo é roteirizado e declarado no aviso “Demonstração do protótipo · dados simulados”. Os percentuais das capturas (ex.: 42% × 67%) diferem; na produção rodam em sincronia. |
| Escopo | Ficam de fora, de propósito: rota remota, Caixa, histórico, link, pareamento e tema escuro. Não inventei telas nem funcionalidades; só o fluxo pedido. |
| App intocado | O app não é modificado. A cena é preparada pelo console (como o botão “Simular” do próprio app) e por cliques reais. |

## 7. Decisões que dependem de você

| Tema | Decisão |
|---|---|
| Storyboard | Aprovar os 27 Motion Frames e os 62 s, ou indicar quais cortar/mudar (versão curta de ~45 s é possível removendo MF-10, MF-15 e MF-21). |
| Codificação | Autorizar a instalação do ffmpeg via winget (pacote Gyan.FFmpeg) para exportar MP4 H.264. Sem ele, só consigo WebM, com menos controle. |
| Áudio | Sem som (recomendado) ou você fornece uma trilha livre de direitos. |
| Legendas | Legendas em português queimadas no vídeo (recomendado) ou vídeo sem texto. |
| Dados de exemplo | Aprovar os nomes simulados (Ipê Sereno, Arara Atenta) e os três arquivos de exemplo (apresentacao-extensao.pdf, fotos-oficina.zip, cartaz-evento.png — escolhidos por mim para a demonstração). |
| Tema | Apenas tema claro (recomendado) ou também uma versão escura. |
| Fecho | Decidido: o fecho mostra só a logo do ERASÓ, sem créditos institucionais nem ODS (a linha de protótipo permanece). |
