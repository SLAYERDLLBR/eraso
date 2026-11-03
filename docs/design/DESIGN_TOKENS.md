# DESIGN_TOKENS — Erasó

> **Status:** proposta aprovada na direção (01/11/2026), revisada para **sincronizar com a logo oficial** ([assets/erasó-logo-horizontal.png](assets/erasó-logo-horizontal.png)). Nada foi implementado.
> Formato agnóstico: nomes em notação de pontos (`color.text.primary`) que viram CSS *custom properties* (`--color-text-primary`) ou JSON no formato *Design Tokens Community Group*. A pilha final ainda não foi definida.
> Contrastes citados foram **calculados** (fórmula WCAG 2.x), não estimados. Cores marcadas **[logo]** foram **amostradas por pixel** do arquivo da logo.

---

## 1. Arquitetura de tokens

```
primitivos  →  semânticos  →  componentes
(paletas)      (papéis, por tema)   (ex.: button.primary.bg)
```

- **Primitivos** não são usados diretamente nos componentes.
- **Semânticos** mudam por tema (claro/escuro/alto contraste).
- **Componentes** só são criados quando um componente precisa divergir do semântico (evitar proliferação).

---

## 2. Cores — primitivos

### 2.1 Cores amostradas da logo

| Elemento da logo | Amostra | Vira o token |
|---|---|---|
| Nó laranja (origem), arco superior, início do traço da assinatura | `#F76100`, `#F86400`, brilho máx. `#FF6B05` | `ember.500`, `ember.400` |
| Sombra do nó laranja | `#A63802` | `ember.700` |
| Letreiro "ERASÓ" e acento | `#022C17` (variação `#012B16`–`#022E18`) | `forest.900` |
| Caminho verde (parte escura) | `#023E21` | `forest.800` |
| Nó verde (destino) | `#004F29` | `forest.700` |
| Caminho verde (meio-tom) | `#066436` | `forest.600` |
| Brilho do nó verde, fim do traço da assinatura | `#0C884A` | `forest.500` |
| Meio do traço da assinatura (transição) | `#BB6B09` | — (resulta naturalmente do gradiente) |

> A logo é **laranja → verde**: o nó laranja é a ponta de partida e o nó verde, a ponta de chegada ("De uma ponta à outra."). O sistema usa exatamente essa leitura: **laranja = em trânsito / ação**, **verde = chegou / concluído**.

### 2.2 Brasa (laranja da logo — acento de ação)

| Token | Hex | Origem |
|---|---|---|
| `ember.50` | `#FEEFE4` | derivado |
| `ember.100` | `#FDDCC4` | derivado |
| `ember.200` | `#FBB98A` | derivado |
| `ember.300` | `#FF8A3D` | derivado (texto no escuro) |
| `ember.400` | `#FF6B05` | **[logo]** brilho máximo |
| `ember.500` | `#F76100` | **[logo]** laranja principal |
| `ember.600` | `#D85400` | derivado (hover no claro) |
| `ember.700` | `#A63802` | **[logo]** sombra do nó |
| `ember.800` | `#6E2603` | derivado |
| `ember.900` | `#2B1608` | derivado (fundo sutil no escuro) |
| `ember.ink` | `#1A1105` | texto sobre brasa |

### 2.3 Floresta (verde da logo — marca e conclusão)

| Token | Hex | Origem |
|---|---|---|
| `forest.50` | `#E8F5EC` | derivado |
| `forest.100` | `#CBEBD6` | derivado |
| `forest.200` | `#9ADBB4` | derivado |
| `forest.300` | `#5CD08F` | derivado (verde da logo no tema escuro) |
| `forest.400` | `#3DBE78` | derivado (sucesso no escuro) |
| `forest.500` | `#0C884A` | **[logo]** brilho do nó verde |
| `forest.600` | `#066436` | **[logo]** meio-tom (sucesso no claro) |
| `forest.700` | `#004F29` | **[logo]** nó verde |
| `forest.800` | `#023E21` | **[logo]** caminho |
| `forest.900` | `#022C17` | **[logo]** letreiro |
| `forest.950` | `#011A0D` | derivado |

### 2.4 Neutros "grafite-mata" (sincronização sutil)

Os neutros receberam um **leve viés verde** (croma muito baixo) para conversar com o letreiro `#022C17`, sem virar "tema verde". O texto primário claro é um grafite esverdeado — parente distante do letreiro.

| Token | Hex | Notas |
|---|---|---|
| `gray.0` | `#FFFFFF` | |
| `gray.25` | `#F6F7F4` | canvas claro ("papel") |
| `gray.50` | `#EDEFEA` | superfície afundada clara |
| `gray.100` | `#E1E4DE` | borda sutil clara |
| `gray.200` | `#CFD3CC` | borda padrão clara |
| `gray.300` | `#B0B5AD` | |
| `gray.400` | `#8A9088` | borda forte clara (3,27 : 1 sobre branco) |
| `gray.500` | `#666C64` | texto terciário claro |
| `gray.600` | `#525850` | texto secundário claro |
| `gray.700` | `#363B35` | |
| `gray.750` | `#2A2E29` | borda padrão escura |
| `gray.800` | `#1F2320` | superfície elevada escura |
| `gray.850` | `#181B18` | superfície escura |
| `gray.900` | `#111311` | canvas escuro |
| `gray.950` | `#0B0D0B` | afundado escuro |
| `gray.ink` | `#12201A` | texto primário claro (grafite-mata) |
| `gray.paper` | `#ECEFEA` | texto primário escuro |

### 2.5 Rotas e estados

| Família | Claro (texto/ícone) | Escuro (texto/ícone) | Fundo translúcido claro | Fundo translúcido escuro |
|---|---|---|---|---|
| `route.local` (petróleo) | `#0A6F80` | `#4CC3D6` | `#0A6F801A` | `#4CC3D61F` |
| `route.remote` (violeta) | `#5A3FE0` | `#A594FF` | `#5A3FE01A` | `#A594FF1F` |
| `status.success` (= floresta) | `forest.600` `#066436` | `forest.400` `#3DBE78` | `#0664361A` | `#3DBE781F` |
| `status.warning` | `#8F5B00` | `#F2B33D` | `#E59A0024` | `#F2B33D1F` |
| `status.danger` | `#C4262E` | `#FF6B70` | `#C4262E1A` | `#FF6B701F` |
| `status.info` | `#2563D9` | `#6FA3FF` | `#2563D91A` | `#6FA3FF1F` |

> **Mudança em relação à versão anterior:** a rota local deixou de ser "jade" (ficaria próxima demais do verde da marca) e passou a **petróleo**; o **sucesso passou a ser o verde da logo**. Rota sempre aparece com ícone + rótulo ("Local", "Remoto"); estado sempre com ícone + texto — cor nunca é o único sinal.

### 2.6 Gradiente de marca

| Token | Valor | Uso permitido |
|---|---|---|
| `gradient.brand` | `linear-gradient(90deg, #F76100 0%, #0C884A 100%)` | Reproduz o traço sob "De uma ponta à outra." Usado **somente** em: trilha de transferência concluída, varredura de conclusão da barra de progresso, sublinhado do título no primeiro uso e em "Sobre o projeto". |
| `gradient.brand-dark` | `linear-gradient(90deg, #FF6B05 0%, #3DBE78 100%)` | Equivalente no tema escuro. |

**Proibido:** gradiente atrás de texto, em botões, em fundos de tela ou em mais de um elemento visível ao mesmo tempo.

---

## 3. Cores — semânticos por tema

| Token semântico | Claro | Escuro | Alto contraste (P2) |
|---|---|---|---|
| `color.bg.canvas` | `gray.25` | `gray.900` | `#FFFFFF` / `#000000` |
| `color.bg.surface` | `gray.0` | `gray.850` | igual canvas |
| `color.bg.raised` | `gray.0` + `shadow.2` | `gray.800` | canvas + borda 2 px |
| `color.bg.sunken` | `gray.50` | `gray.950` | canvas |
| `color.bg.hover` | `#12201A0A` (4%) | `#ECEFEA0D` (5%) | sublinhado + borda |
| `color.bg.pressed` | `#12201A14` (8%) | `#ECEFEA14` (8%) | |
| `color.bg.selected` | `ember.50` | `#FF6B051A` | borda brasa 2 px |
| `color.bg.overlay` | `#11131166` | `#000000A3` | `#000000CC` |
| `color.text.primary` | `gray.ink` | `gray.paper` | `#000` / `#FFF` |
| `color.text.secondary` | `gray.600` | `#B2B8B0` | primário |
| `color.text.tertiary` | `gray.500` | `#878D85` | primário |
| `color.text.disabled` | `gray.300` | `#575D56` | `gray.500` |
| `color.text.on-accent` | `ember.ink` | `ember.ink` | `ember.ink` |
| `color.text.accent` | `ember.700` | `ember.300` | `ember.800` / `ember.200` |
| `color.text.brand` | `forest.900` | `forest.300` | `forest.950` / `forest.200` |
| `color.border.subtle` | `gray.100` | `#ECEFEA0F` | `gray.700` |
| `color.border.default` | `gray.200` | `gray.750` | `gray.900` |
| `color.border.strong` | `gray.400` | `#6C726A` | `#000` / `#FFF` |
| `color.accent.fill` | `ember.500` | `ember.400` | `ember.700` |
| `color.accent.fill-hover` | `ember.600` | `ember.300` | |
| `color.accent.fill-pressed` | `ember.700` | `ember.500` | |
| `color.accent.subtle` | `ember.50` | `ember.900` | |
| `color.brand.fill` | `forest.700` (texto branco) | `forest.400` (texto `gray.950`) | |
| `color.brand.subtle` | `forest.50` | `#3DBE781A` | |
| `color.focus.ring` | `ember.700` | `ember.400` | `#0000EE` / `#FFFF00` |
| `color.danger.fill` | `status.danger` claro (texto branco, 5,73 : 1) | `status.danger` escuro (texto `ember.ink`, 6,74 : 1) | |

> **Papel do verde da marca na interface:** identidade (logo, cabeçalho da barra lateral, títulos de "Sobre o projeto"), **conclusão** (sucesso, item recebido, aparelho pareado) e "Meus aparelhos" verificados. O verde **não** é cor de ação — a ação continua sendo laranja. Isso mantém um único "botão óbvio" por região.

### 3.1 Contrastes verificados

| Par | Claro | Escuro |
|---|---|---|
| texto primário / canvas · superfície | 15,66 · 16,84 | 16,09 · 14,97 |
| texto primário / afundado · elevado | 14,54 | 13,72 (elevado) |
| texto secundário / canvas · superfície · afundado | 6,80 · 7,32 · 6,32 | 9,22 · 8,58 · — |
| texto terciário / canvas · superfície · afundado | 5,02 · 5,39 · 4,66 | 5,49 · 5,11 · 4,68 (elevado) |
| on-accent / accent.fill | 5,92 | 6,53 |
| text.accent / superfície · canvas | 6,59 · 6,13 | 7,41 |
| text.accent / accent.subtle | 5,86 | 7,33 |
| text.brand (letreiro) / canvas | 14,20 | — |
| success / superfície | 7,28 | 7,31 |
| branco / brand.fill (`forest.700`) | 9,77 | — |
| texto escuro / brand.fill escuro (`forest.400`) | — | 8,21 |
| route.local · route.remote / superfície | 5,84 · 6,52 | 8,34 · 6,85 |
| warning · danger · info / superfície | 5,73 · 5,73 · 5,43 | 9,34 · 6,28 · 6,91 |
| focus.ring / canvas | 6,13 | 6,54 |
| border.strong / superfície (componente ≥ 3) | 3,27 | 3,52 |
| laranja da logo `#F76100` / branco (objeto gráfico ≥ 3) | 3,15 | 5,92 (sobre canvas escuro) |
| **letreiro da logo `#022C17` / canvas escuro** | — | **1,22 ✖** |
| **nó verde da logo `#004F29` / canvas escuro** | — | **1,91 ✖** |

> As duas últimas linhas justificam a **versão invertida da logo** para o tema escuro (ver [DESIGN_SYSTEM §4.2](DESIGN_SYSTEM.md#42-logo-oficial)). `border.default` e `border.subtle` ficam abaixo de 3 : 1 **de propósito**: são divisores decorativos; bordas que delimitam controles usam `border.strong`.

---

## 4. Tipografia

### 4.1 Famílias

| Token | Valor | Uso |
|---|---|---|
| `font.family.display` | `"Lexend", "Instrument Sans", system-ui, sans-serif` | **Somente** `type.display` e `type.title-lg` — ecoa a geometria larga e arredondada do letreiro "ERASÓ" sem imitá-lo |
| `font.family.sans` | `"Instrument Sans", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` | Interface e textos |
| `font.family.mono` | `"IBM Plex Mono", ui-monospace, "Cascadia Mono", "Segoe UI Mono", Menlo, monospace` | Dados técnicos |
| `font.weight.regular` | 400 | |
| `font.weight.medium` | 500 | |
| `font.weight.semibold` | 600 | |
| `font.weight.bold` | 700 | |

> O letreiro da logo é **arte**, não fonte: nunca recriar "ERASÓ" digitando em Lexend ou outra fonte. Lexend (SIL OFL) foi escolhida por ser geométrica e larga como o letreiro e por ter sido desenhada com foco em legibilidade — coerente com o público estudantil. *A validar com a equipe; alternativa sem nova família: usar Instrument Sans também no display.*

### 4.2 Escala

| Token | Tamanho / altura de linha | Peso | *Tracking* | Família | Uso |
|---|---|---|---|---|---|
| `type.display` | 32 / 38 (celular 28 / 34) | 600 | −0,01 em | display | Nome do aparelho no pedido/pareamento; títulos do primeiro uso |
| `type.title-lg` | 24 / 30 | 600 | −0,01 em | display | Título de tela |
| `type.title-md` | 20 / 26 | 600 | −0,01 em | sans | Título de diálogo/folha |
| `type.title-sm` | 17 / 24 | 600 | 0 | sans | Seções |
| `type.body-lg` | 16 / 24 | 400 | 0 | sans | Corpo no celular; texto da Caixa |
| `type.body` | 15 / 22 | 400 | 0 | sans | Corpo no desktop |
| `type.label` | 14 / 20 | 500 | 0 | sans | Botões, abas, rótulos de campo |
| `type.small` | 13 / 18 | 400 | 0 | sans | Metadados |
| `type.caption` | 12 / 16 | 500 | +0,01 em | sans | Rótulos de grupo, *badges* |
| `type.tagline` | 14 / 20 | 400 | +0,08 em | display | Assinatura "De uma ponta à outra." fora da logo (primeiro uso, Sobre) — espaçamento largo como na logo |
| `type.mono-sm` | 13 / 18 | 450 | 0 | mono | Tamanho, velocidade, IP, código |
| `type.mono-lg` | 20 / 28 | 500 | +0,04 em | mono | Código de pareamento / PIN |
| `type.numeric` | — | — | — | — | `font-variant-numeric: tabular-nums` (progresso e horários) |

---

## 5. Espaçamento

Base **4 px** (Raycast e Dropbox usam 4/8 px **[O]**; LocalSend usa múltiplos de 5 px **[O]** — padronizamos em 4).

| Token | Valor | Uso típico |
|---|---|---|
| `space.0` | 0 | |
| `space.0-5` | 2 px | ajuste óptico ícone/texto |
| `space.1` | 4 px | entre ícone e rótulo pequeno |
| `space.1-5` | 6 px | *padding* de *badge* |
| `space.2` | 8 px | entre ícone e rótulo; itens de lista densa |
| `space.3` | 12 px | *padding* de campo; gap de chips |
| `space.4` | 16 px | *padding* de cartão; margem de página no celular |
| `space.5` | 20 px | |
| `space.6` | 24 px | entre grupos; margem de página no tablet |
| `space.8` | 32 px | entre seções; margem de página no desktop |
| `space.10` | 40 px | |
| `space.12` | 48 px | |
| `space.16` | 64 px | estados vazios |
| `space.20` | 80 px | |

---

## 6. Dimensões e grade

| Token | Valor | Nota |
|---|---|---|
| `size.control.sm` | 32 px | botões em barras densas (desktop) |
| `size.control.md` | 40 px | padrão desktop |
| `size.control.lg` | 48 px | padrão celular; ações primárias |
| `size.touch.min` | 44 px | área de toque mínima (Linear usa 44 px **[O]**) |
| `size.icon.xs / sm / md / lg / xl / 2xl` | 16 / 20 / 24 / 32 / 40 / 56 px | |
| `size.avatar.device` | 40 px (lista) · 56 px (cartão grande) · 72 px (pedido) | |
| `size.thumb.sm / md / lg` | 40 / 64 / 160 px | linha · seleção · grade |
| `size.logo.symbol.min` | 16 px (versão simplificada) · 32 px (versão completa) | ver DESIGN_SYSTEM §4.2 |
| `size.logo.horizontal.min` | 120 px de largura (sem assinatura) · 240 px (com assinatura) | |
| `size.logo.sidebar` | 28 px de altura (símbolo + letreiro, sem assinatura) | |
| `size.sidebar` | 240 px (recolhida 64 px) | |
| `size.inspector` | 360 px | |
| `size.dock` | 380 × até 420 px | doca de transferências (desktop) |
| `size.dialog.sm / md / lg` | 400 / 560 / 720 px | |
| `size.content.read` | 720 px | máx. para texto/configurações |
| `size.content.max` | 1200 px | máx. para grades |
| `grid.columns` | 4 (celular) · 8 (tablet) · 12 (desktop) | |
| `grid.gutter` | 12 · 16 · 24 px | |
| `grid.card-min` | 220 px | coluna mínima de cartão de destino |
| `window.min` | 360 × 560 px | janela mínima do desktop |

### 6.1 *Breakpoints*

| Token | Faixa | Comportamento |
|---|---|---|
| `bp.sm` | 0–599 px | barra inferior; folhas; 1 coluna |
| `bp.md` | 600–959 px | rail de ícones com rótulos curtos; 2 colunas |
| `bp.lg` | 960–1279 px | barra lateral 240 px; sem inspetor fixo |
| `bp.xl` | ≥ 1280 px | barra lateral + inspetor 360 px |

(O LocalSend usa 700/800 px **[O]**; ajustamos para acomodar a barra lateral e o inspetor.)

---

## 7. Bordas e raios

| Token | Valor | Uso |
|---|---|---|
| `border.width.hairline` | 1 px | divisores, cartões |
| `border.width.strong` | 1,5 px | campos em foco, cartão selecionado (claro) |
| `border.width.focus` | 2 px | anel de foco |
| `border.width.trail` | 2 px (ativa) · 1,5 px (repouso) | trilha de transferência — espessura proporcional ao caminho da logo em tamanho de interface |
| `focus.offset` | 2 px | |
| `radius.xs` | 4 px | *badges*, teclas `kbd` |
| `radius.sm` | 6 px | chips pequenos, *tooltips* |
| `radius.md` | 10 px | botões, campos, itens de lista |
| `radius.lg` | 14 px | cartões, compositor, doca |
| `radius.xl` | 20 px | diálogos, folhas (cantos superiores no celular) |
| `radius.full` | 9999 px | avatares, indicador de presença, interruptores, **nós da trilha** |

> Escala própria (4/6/10/14/20), diferente da 4/6/8/12/16 do Linear e da 5/10 do LocalSend. Os cantos arredondados do letreiro e as pontas redondas do caminho da logo justificam terminais arredondados (`stroke-linecap: round`) em ícones e na trilha.

---

## 8. Sombras e elevação

### 8.1 Sombras (tema claro)

| Token | Valor |
|---|---|
| `shadow.0` | `none` |
| `shadow.1` | `0 1px 2px rgba(18,32,26,.06), 0 0 0 1px rgba(18,32,26,.04)` |
| `shadow.2` | `0 4px 12px -2px rgba(18,32,26,.10), 0 0 0 1px rgba(18,32,26,.05)` |
| `shadow.3` | `0 12px 32px -6px rgba(18,32,26,.18), 0 0 0 1px rgba(18,32,26,.06)` |
| `shadow.focus-glow` | `0 0 0 4px rgba(247,97,0,.18)` (complemento do anel, nunca substituto) |

> As sombras usam o tom `gray.ink` (esverdeado) em vez de preto puro — sincronização sutil com o letreiro.

### 8.2 Tema escuro

No escuro, a elevação é expressa por **luminosidade da superfície + borda superior sutil** (princípio do Linear **[O]**); a sombra só separa sobreposições do fundo:

| Nível | Superfície | Borda | Sombra |
|---|---|---|---|
| 0 canvas | `gray.900` | — | — |
| 1 superfície | `gray.850` | `#ECEFEA0F` | — |
| 2 elevado (menus, doca) | `gray.800` | `#ECEFEA14` + *inset* superior `#FFFFFF0A` | `0 8px 24px rgba(0,0,0,.45)` |
| 3 diálogo / paleta | `gray.800` | `#ECEFEA1A` | `0 24px 64px rgba(0,0,0,.6)` |

### 8.3 Camadas (`z-index`)

| Token | Valor |
|---|---|
| `z.base` | 0 |
| `z.sticky` | 100 |
| `z.dock` | 300 |
| `z.drop-overlay` | 400 |
| `z.popover` | 600 |
| `z.command` | 650 |
| `z.dialog` | 700 |
| `z.request` | 750 (pedido de recebimento fica acima de diálogos comuns) |
| `z.toast` | 800 |
| `z.tooltip` | 1100 |

---

## 9. Movimento

Detalhes de uso em [MOTION_SPEC.md](MOTION_SPEC.md).

| Token | Valor | Uso |
|---|---|---|
| `motion.duration.instant` | 0 ms | movimento reduzido; mudanças de cor de texto |
| `motion.duration.fast` | 90 ms | *hover*, *press*, cor de fundo |
| `motion.duration.quick` | 140 ms | *tooltip*, troca de ícone, *checkbox* |
| `motion.duration.base` | 200 ms | menus, chips, entrada de cartão |
| `motion.duration.moderate` | 280 ms | diálogos, folhas, inspetor |
| `motion.duration.slow` | 400 ms | coreografias (trilha, pareamento concluído, varredura de conclusão) |
| `motion.duration.trail-loop` | 1600 ms | brasa percorrendo a trilha enquanto aguarda |
| `motion.duration.logo-sync` | 3200 ms | ciclo da animação de sincronização da logo (ver MOTION_SPEC §6) |
| `motion.duration.ambient` | 2400 ms | pulso de descoberta (laço) |
| `motion.easing.standard` | `cubic-bezier(.2, 0, 0, 1)` | mudanças de estado no lugar |
| `motion.easing.enter` | `cubic-bezier(.16, 1, .3, 1)` | elementos entrando |
| `motion.easing.exit` | `cubic-bezier(.4, 0, 1, 1)` | elementos saindo (mais curto que a entrada) |
| `motion.easing.sway` | `cubic-bezier(.45, 0, .55, 1)` | vai-e-vem suave dos arcos da logo |
| `motion.easing.linear` | `linear` | barras de progresso, pulso, brasa na trilha |
| `motion.easing.settle` | `cubic-bezier(.34, 1.3, .64, 1)` | "chegada" de aparelho/item, nó verde na conclusão (uso raro) |
| `motion.distance.xs / sm / md` | 4 / 8 / 16 px | deslocamentos de entrada |
| `motion.rotate.logo-arc` | ±8° | amplitude máxima dos arcos da logo |
| `motion.stagger` | 30 ms (máx. 8 itens; depois, sem atraso) | listas e grades |
| `motion.scale.press` | 0,98 | *press* em cartões e botões grandes |

---

## 10. Tokens de componentes (somente onde divergem)

| Token | Claro | Escuro |
|---|---|---|
| `button.primary.bg` | `color.accent.fill` | `color.accent.fill` |
| `button.primary.fg` | `color.text.on-accent` | `color.text.on-accent` |
| `button.secondary.bg` | `color.bg.surface` + `border.default` | `gray.800` |
| `button.ghost.bg-hover` | `color.bg.hover` | `color.bg.hover` |
| `device-card.bg` | `color.bg.surface` | `color.bg.surface` |
| `device-card.bg-selected` | `color.bg.selected` + borda `color.accent.fill` 1,5 px | idem |
| `device-card.verified` | escudo `color.text.brand` | idem |
| `device-card.presence.online` | `status.success` | `status.success` |
| `device-card.presence.away` | `gray.400` | `#6C726A` |
| `trail.origin-node` | `ember.500` | `ember.400` |
| `trail.destination-node` | `forest.700` | `forest.300` |
| `trail.stroke.pending` | `gray.300` tracejado | `gray.700` tracejado |
| `trail.stroke.active` | `ember.500` | `ember.400` |
| `trail.stroke.done` | `gradient.brand` | `gradient.brand-dark` |
| `progress.track` | `gray.100` | `gray.750` |
| `progress.fill.active` | `color.accent.fill` | `color.accent.fill` |
| `progress.fill.done` | `status.success` (após varredura com `gradient.brand`) | idem |
| `progress.fill.error` | `status.danger` | `status.danger` |
| `progress.height` | 6 px (linha) · 8 px (total) | |
| `kbd.bg / border / fg` | `gray.50` / `gray.200` / `text.secondary` | `#ECEFEA0A` / `#ECEFEA26` / `text.secondary` |
| `drop-overlay.bg` | `#F7610014` + borda tracejada `ember.500` 2 px | `#FF6B051A` + borda `ember.400` |
| `logo.variant` | `colorida` (original) | `invertida` (letreiro `gray.paper`, verdes → `forest.300`, laranjas mantidos) |

---

## 11. Exemplo de saída (CSS *custom properties*)

```css
:root {
  --color-bg-canvas: #F6F7F4;
  --color-bg-surface: #FFFFFF;
  --color-text-primary: #12201A;
  --color-text-secondary: #525850;
  --color-text-tertiary: #666C64;
  --color-text-brand: #022C17;
  --color-accent-fill: #F76100;
  --color-text-on-accent: #1A1105;
  --color-success: #066436;
  --color-focus-ring: #A63802;
  --gradient-brand: linear-gradient(90deg, #F76100 0%, #0C884A 100%);
  --radius-md: 10px;
  --space-4: 16px;
  --motion-duration-base: 200ms;
  --motion-easing-enter: cubic-bezier(.16, 1, .3, 1);
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-bg-canvas: #111311;
    --color-bg-surface: #181B18;
    --color-text-primary: #ECEFEA;
    --color-text-secondary: #B2B8B0;
    --color-text-tertiary: #878D85;
    --color-text-brand: #5CD08F;
    --color-accent-fill: #FF6B05;
    --color-success: #3DBE78;
    --color-focus-ring: #FF6B05;
    --gradient-brand: linear-gradient(90deg, #FF6B05 0%, #3DBE78 100%);
  }
}
:root[data-theme="dark"] { /* mesmos valores do bloco escuro */ }
@media (prefers-reduced-motion: reduce) {
  :root { --motion-duration-base: 0ms; --motion-duration-moderate: 0ms; }
}
```

> Exemplo ilustrativo de formato — **não** é código a ser criado nesta etapa.
