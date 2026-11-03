# COMPONENT_INVENTORY — Erasó

> **Status:** especificação (revisão 2 — sincronizada com a logo oficial). Nenhum componente foi criado.
> Tokens em [DESIGN_TOKENS.md](DESIGN_TOKENS.md) · movimento em [MOTION_SPEC.md](MOTION_SPEC.md).
> **Origem:** **LS** = inspirado no LocalSend (reproduzido conceitualmente) · **RD** = existe no LocalSend e foi redesenhado · **NV** = novo.
> **Estados-padrão** (aplicam-se a todo componente interativo salvo indicação): `padrão · hover · foco-visível · pressionado · desabilitado`. Abaixo, só os estados **adicionais**.

---

## 1. Mapa: componentes do LocalSend → Erasó

Componentes do LocalSend identificados no código (`app/lib/widget`, `app/lib/pages`) **[O]**:

| LocalSend (evidência) | Erasó | Origem | Decisão |
|---|---|---|---|
| `NavigationRail` / `NavigationBar` (3 abas) | Barra lateral · Rail · Barra inferior (5 destinos) | RD | Mais destinos, rótulos sempre visíveis, cartão "Este aparelho" no topo |
| Logotipo girando + apelido 48 px (aba Receber) | **Cartão Este aparelho** | RD | De tela inteira para componente fixo |
| `_InfoBox` (nome, IP, porta) | Seção "Detalhes técnicos" no inspetor de Este aparelho | RD | — |
| `BigButton` (File/Folder/Media/Text/App/Paste) | **Bloco de origem** | LS | Mantém o formato "bloco grande"; ícone de traço |
| Cartão de seleção (contagem, tamanho, miniaturas, Editar/Adicionar/✕) | **Bandeja de seleção** | RD | Miniaturas maiores, remoção por item inline |
| `_SendModeButton` (menu) | **Seletor de modo** (segmentado) | RD | Visível em vez de escondido |
| `_ScanButton` (ícone girando) | Botão "Buscar novamente" + pulso no cabeçalho de "Por perto" | RD | Rótulo + estado textual |
| `DeviceListTile` + `DeviceBadge` (HTTP/WebRTC, modelo) | **Cartão de aparelho** + **Badge de rota** | RD | Presença, rota, favorito/confiável |
| `DevicePlaceholderListTile` | **Cartão fantasma** (estado vazio/carregando) | LS | — |
| `AddressInputDialog` (#id / IP, recentes) | **Diálogo Adicionar por endereço** | LS | + aba "Código de pareamento" |
| `FavoriteDialog` / `FavoriteEditDialog` / `FavoriteDeleteDialog` | Propriedades do aparelho no **inspetor** + filtro "Favoritos" | RD | Sem diálogo modal de lista |
| `QrDialog` / `ZoomDialog` | **Painel Compartilhar via link** (QR + URL ampliável) e **Tela de pareamento** | RD | QR também para parear |
| `PinDialog` | **Campo de PIN** (segmentado) | LS | — |
| `MessageInputDialog` (multilinha) | **Editor de texto rápido** (no compositor e na Caixa) | RD | Inline, não diálogo |
| `AddFileDialog` (desktop) / `CustomBottomSheet` (celular) | Blocos de origem sempre visíveis; menu "Adicionar" na bandeja | RD | — |
| `send_page.dart` (eu ↓ destino, aguardando) | **Painel de envio** (trilha) | RD | — |
| `receive_page.dart` (Aceitar/Recusar/Opções/Verificar) | **Diálogo de pedido de recebimento** | LS | — |
| `receive_options_page.dart` + `QuickActionsDialog` + `FileNameInputDialog` | **Opções do pedido** (pular, renomear, lote, destino) | LS | Painel dentro do pedido |
| `progress_page.dart` + `CustomProgressBar` | **Doca de transferências** + **Linha de transferência** + **Detalhe da transferência** | RD | Não bloqueante |
| `verify_page.dart` (ícones/texto) | **Verificação de impressão digital** | LS | Usada também no pareamento |
| `web_share_page.dart` (links, QR, PIN, pedidos) | **Painel Compartilhar via link** | LS | — |
| `receive_history_page.dart` | **Lista de Atividade** + **Inspetor de item** | RD | Unificada, com filtros |
| `device_details_page.dart` (+ logs) | **Inspetor de aparelho** | RD | — |
| `troubleshoot_page.dart` | **Cartão de sintoma** + **Assistente de diagnóstico** | RD | Com verificações ativas |
| `network_interfaces_page.dart` | **Lista de interfaces** (Diagnóstico › Avançado) | LS | — |
| `settings_tab.dart` (`_SettingsSection`, entradas switch/dropdown/botão) | **Seção de configurações** + **Linha de configuração** | RD | Busca e âncoras |
| Diálogos de erro/permissão/indisponível/arquivo não abre | **Diálogo de erro** + **Alerta inline** | RD | Preferir inline |
| `quick_save_notice` / `encryption_disabled_notice` | **Alerta de risco** | LS | — |
| `OpacitySlideshow` (dicas alternadas) | **Dica contextual** (estática, dispensável) | RD | Sem rotação automática |
| Sobreposição "Place items to share." | **Sobreposição de soltura** | LS | — |
| `snackbar` "Copied to Clipboard" | **Toast** | LS | — |
| `CustomColorDialog`, `LanguagePage` | Linha de configuração (seletor) | RD | — |
| `AboutPage`, `DonationPage`, contribuidores… | — | — | **Descartados** (ver ADAPTATION_PLAN) |
| `LocalSendLogo` girando como indicador de "servidor ativo"; ícone do Dock com estado (macOS) | **Marca animada** (`BrandMark`) com estados de sincronização | RD | Logo Erasó; sem giro contínuo — ver MOTION_SPEC §6 |
| — | **Paleta de comandos**, **Barra de ações**, **Inspetor**, **Chip de filtro**, **Item da Caixa**, **Editor rápido da Caixa**, **Tela de pareamento**, **Trilha**, **Selo ODS**, **Primeiro uso** | NV | — |

---

## 2. Primitivos

### 2.1 Botão `Button` — RD

| Item | Especificação |
|---|---|
| Variantes | `primary` (brasa, texto escuro) · `secondary` (superfície + borda) · `ghost` (sem fundo) · `danger` (vermelho) · `link` |
| Tamanhos | `sm` 32 px · `md` 40 px · `lg` 48 px (padrão no celular) |
| Anatomia | [ícone 20 px opcional] rótulo `type.label` [atalho `kbd` opcional, só desktop, `md`+] |
| Estados extras | `carregando` (rótulo mantido, spinner substitui o ícone, largura fixa) · `sucesso momentâneo` (ícone ✓ por 1,2 s, só em ações de cópia) |
| Comportamento | *press*: escala 0,98 + `bg.pressed`; nunca muda de largura ao trocar estado |
| A11y | `<button>` nativo; `aria-busy` em carregamento; desabilitado mantém foco quando explica o motivo via *tooltip* (`aria-disabled`) |
| Tokens | `button.*`, `radius.md`, `motion.duration.fast` |

### 2.2 Botão de ícone `IconButton` — RD
Quadrado 32/40/44 px; exige `aria-label` e *tooltip*; variante `toggle` (`aria-pressed`) para favorito. Origem: `CustomIconButton` do LocalSend.

### 2.3 Campo `TextField` / `TextArea` — RD
Altura 40 px (48 no celular); rótulo acima, nunca só *placeholder*; borda `border.strong`; foco = borda brasa 1,5 px + anel. Estados extras: `erro` (borda e mensagem `status.danger` com ícone), `válido`, `somente leitura` (com botão copiar). Variante `mono` para IP, porta, PIN.

### 2.4 Controle segmentado `SegmentedControl` — NV
2–4 opções; altura 36 px; indicador desliza (200 ms). Usado no **Seletor de modo**, Verificação (Ícones/Texto), tema. `role="radiogroup"`; setas mudam a opção.

### 2.5 Interruptor `Switch` · Caixa de seleção `Checkbox` · Rádio — LS
Nativos estilizados; alvo 44 px com rótulo clicável. Interruptor sempre com texto do estado na linha de configuração quando o efeito não é óbvio.

### 2.6 Chip de filtro `FilterChip` — NV (Dropbox)
Altura 32 px, `radius.full`; selecionado = `bg.selected` + ícone ✓; conjunto rolável horizontalmente no celular; contagem opcional ("Imagens 12").

### 2.7 *Badge* `Badge` — RD
`radius.xs`, `type.caption`; variantes `neutral`, `accent`, `success`, `warning`, `danger`, `info`. Usado para modelo, versão, "Novo".

### 2.8 Badge de rota `RouteBadge` — NV
| Variante | Ícone | Rótulo | Cor |
|---|---|---|---|
| `local` | rota direta (dois pontos ligados) | "Local" | `route.local` |
| `remote` | rota em arco/nuvem | "Remoto" | `route.remote` |
| `relay` | arco com nó intermediário | "Remoto (retransmitido)" | `route.remote` |
| `offline` | ponto vazio | "Offline · visto há 2 h" | `text.tertiary` |
| `checking` | pulso | "Verificando rota…" | `text.secondary` |
Sempre ícone + texto; compacto (só ícone) permitido apenas dentro de cartões que já exibem o rótulo no *tooltip* e no `aria-label`.

### 2.9 Indicador de presença `PresenceDot` — NV
8 px, `radius.full`; `online` (verde), `ausente` (cinza), `ocupado` (âmbar — "recebendo outro pedido", equivalente ao estado *busy* do LocalSend **[O]**). Nunca isolado: acompanha texto no cartão ou no `aria-label`.

### 2.10 Tecla `Kbd` — NV (Raycast)
`radius.xs`, `type.caption` mono; mostra atalhos adaptados à plataforma (⌘ no macOS, Ctrl no Windows/Linux); oculto em toque.

### 2.11 *Tooltip* — LS
Aparece após 500 ms de *hover* ou imediatamente no foco; some em 140 ms; inclui atalho quando houver.

### 2.12 *Toast* — LS
Canto inferior (acima da doca, à esquerda dela no desktop; acima da barra inferior no celular); máx. 2 empilhados; 4 s (sucesso) ou persistente com ação (erro); `role="status"`. Ações típicas: "Desfazer", "Abrir", "Ver detalhes".

### 2.13 Menu / *Popover* — LS
`radius.md`, elevação 2; itens 36 px; separadores; atalhos à direita; navegação por setas e *type-ahead*.

### 2.14 Diálogo `Dialog` — RD
`radius.xl`, elevação 3; tamanhos 400/560/720 px; título `type.title-md`; ações à direita (primária por último); no celular vira **folha inferior** com alça de arrastar. Fecha com Esc/✕ (exceto pedido de recebimento, que exige decisão explícita ou expira).

### 2.15 Folha `Sheet` — RD
Inferior no celular (altura 50% → 92%), lateral direita no tablet. Origem: `CustomBottomSheet`.

### 2.16 Progresso `ProgressBar` / `ProgressRing` — RD
Barra 6 px (linha) e 8 px (total); laranja enquanto transfere, varredura com o gradiente da logo e verde ao concluir; determinado e indeterminado (faixa deslizante, nunca giro infinito em tela cheia). Anel 16/20 px para espaços pequenos (aba, ícone da doca). `role="progressbar"` com `aria-valuenow` e texto "45% · 12 MB/s · 1 min restante".

### 2.17 *Skeleton* — NV
Para listas da Atividade e Caixa durante carregamento (> 300 ms); sem *shimmer* em movimento reduzido.

### 2.18 Estado vazio `EmptyState` — RD
Anatomia: ilustração em linha (trilha) 64 px · título `title-sm` · 1 frase · 1 ação primária + 1 secundária. Exemplos: "Nenhum aparelho por perto" (Buscar novamente / Diagnosticar); "Sua Caixa está vazia" (Colar algo / Como funciona); "Nada por aqui ainda" (Atividade).

### 2.19 Alerta inline `InlineAlert` — RD
Variantes `info`, `warning`, `danger`, `success`; fundo translúcido + borda esquerda 3 px + ícone; ação opcional. Variante **risco** para ativar "Receber de todos automaticamente" e para porta/multicast fora do padrão (equivalente aos avisos do LocalSend **[O]**).

---

## 3. Navegação e estrutura

### 3.0 Marca `BrandMark` — RD (logo oficial)
| Item | Especificação |
|---|---|
| Fonte | [assets/erasó-logo-horizontal.png](assets/erasó-logo-horizontal.png) (referência *raster*); implementação requer **SVG com camadas nomeadas** (ver [DESIGN_SYSTEM §4.2](DESIGN_SYSTEM.md#42-logo-oficial)) |
| Variantes | `horizontal` (símbolo + letreiro, 28 px de altura, cabeçalho da barra lateral) · `horizontal-tagline` (primeiro uso, Sobre; ≥ 240 px) · `symbol` (barra lateral recolhida, barra superior do celular, abertura; ≥ 32 px) · `symbol-flat` (favicon, bandeja, notificações; 16–24 px) |
| Tema | `colorida` no claro; `invertida` no escuro (letreiro claro, verdes `forest.300`) — troca automática com *cross-fade* |
| Estados (só o símbolo) | `repouso` · `abrindo` · `sincronizando` · `transferindo` · `concluído` · `atenção` · `pedido` — coreografias em [MOTION_SPEC §6](MOTION_SPEC.md#6-sincronização-da-logo) |
| Comportamento | Clique leva para Compartilhar (início); nunca é botão de ação |
| A11y | Logo com `alt="Erasó"` no cabeçalho; animação `aria-hidden`; estado global anunciado por texto em `aria-live="polite"` ao lado (ex.: "Sincronizando…") |
| Responsivo | ≥ 960 px: `horizontal` no topo da barra lateral · 600–959: `symbol` no topo do rail · < 600: `symbol` + título da tela na barra superior |

### 3.0.1 Trilha `Trail` — NV (derivada do caminho da logo)
| Item | Especificação |
|---|---|
| Anatomia | Nó de origem (círculo `trail.origin-node`, laranja) · traço com pontas arredondadas · nó de destino (círculo `trail.destination-node`, verde) · brasa opcional (ponto que percorre o traço) |
| Estados | `pendente` (traço cinza tracejado) · `ativa` (traço laranja + brasa em laço) · `concluída` (traço com `gradient.brand`) · `recusada/erro` (traço `text.tertiary`, nó de destino vazado) |
| Usos | Painel de envio, detalhe da transferência, pareamento, estado vazio de "Por perto" (ilustração estática), primeiro uso |
| Orientação | Vertical no celular (origem em cima), horizontal no desktop (origem à esquerda) — mesma leitura da logo |
| A11y | Decorativa (`aria-hidden`); o estado sempre aparece em texto ao lado |

### 3.1 Barra lateral `Sidebar` — RD
- **Anatomia:** **BrandMark** `horizontal` no topo · Cartão *Este aparelho* (compacto) · lista de destinos (Compartilhar, Caixa, Atividade, Dispositivos, Configurações) com ícone 20 px + rótulo + contador opcional (ex.: Atividade "2" em andamento) · rodapé: Selo ODS + botão recolher.
- **Estados:** expandida (240 px) · recolhida (64 px, rótulos em *tooltip*) · item ativo (`bg.selected`, ícone preenchido, barra brasa 2 px à esquerda).
- **Teclado:** Ctrl/⌘+1…5 navega; `[` recolhe/expande.

### 3.2 Rail `NavRail` (600–959 px) — RD
Ícone 24 px + rótulo curto (12 px) abaixo; 72 px de largura.

### 3.3 Barra inferior `BottomNav` (< 600 px) — RD
5 destinos com rótulo sempre visível; altura 64 px + área segura; item ativo com pílula de fundo atrás do ícone. Indicador numérico na Atividade.

### 3.4 Cartão Este aparelho `ThisDeviceCard` — RD (aba Receber do LocalSend)
| Item | Especificação |
|---|---|
| Anatomia | Ícone do tipo · apelido (`title-sm`) · linha de estado: presença + "Visível na rede" / "Oculto" · seletor *Receber automaticamente*: Desligado / Meus aparelhos e favoritos / Todos |
| Variantes | `compact` (barra lateral) · `full` (topo de Compartilhar no celular; inspetor no desktop com IP, porta, rotas disponíveis, impressão digital) |
| Estados extras | `iniciando` ("Ficando visível…") · `offline` ("Sem rede — só a rota remota está disponível" ou "Sem conexão") · `oculto` · `recebendo` (anel de progresso no ícone) |
| Ações | Renomear (gerar outro nome / usar nome do sistema) · Receber via link · Mostrar QR para parear |
| A11y | Região `aria-label="Este aparelho"`; mudanças de visibilidade anunciadas |

### 3.5 Cabeçalho de página `PageHeader` — NV
Título `title-lg` + subtítulo opcional + busca (quando a tela tem lista) + ações à direita. Fixo ao rolar (com fundo `canvas` e divisor ao sair do topo).

### 3.6 Paleta de comandos `CommandPalette` — NV (Raycast)
| Item | Especificação |
|---|---|
| Abertura | Ctrl/⌘+K em qualquer tela; botão "Buscar ou executar…" no topo da barra lateral |
| Anatomia | Campo de busca · grupos (Ações, Aparelhos, Recentes, Configurações) · item: ícone + título + subtítulo + atalho · **barra de ações** no rodapé (ação primária ↵ · "Mais ações" ⌘/Ctrl+K) |
| Comandos mínimos | Enviar arquivos… · Enviar texto da área de transferência · Enviar para *[aparelho]* · Abrir Caixa · Parear aparelho · Buscar aparelhos · Alternar visibilidade · Receber automaticamente: … · Abrir último recebido · Diagnosticar conexão · Alternar tema |
| Estados | vazio (sugestões recentes) · sem resultados ("Nada encontrado — tente 'enviar'") · carregando aparelhos |
| Responsivo | Centralizado 640 px no desktop; tela cheia no celular (acessível pelo ícone de busca) |
| A11y | `role="dialog"` + `combobox`/`listbox`; seta ↑↓, ↵, Esc; foco preso no diálogo |

### 3.7 Barra de ações `ActionBar` — NV (Raycast)
Rodapé de listas e do inspetor (desktop): contexto à esquerda (ex.: "3 selecionados"), ação primária com `Kbd` ↵ e "Ações" com `Kbd` ⌘/Ctrl+K à direita. No celular, substituída por barra de botões fixa inferior quando há seleção.

### 3.8 Inspetor `Inspector` — NV (Linear/Raycast/Dropbox)
Painel direito 360 px (≥ 1280 px) ou folha/diálogo abaixo disso. Anatomia: cabeçalho (ícone/miniatura + título + ações) · seções recolhíveis · tabela de metadados (rótulo `text.tertiary` / valor `text.primary`, valores técnicos em mono) · barra de ações. Fecha com Esc.

**Decisões validadas no protótipo** (revisão 4):

| Item | Decisão |
|---|---|
| Layout | ≥ 1280 px: terceira coluna fixa de 360 px (a doca se desloca para não cobri-lo). 600–1279 px: painel sobreposto de 400 px à direita, com fundo escurecido. < 600 px: folha inferior até 88% da altura |
| Tipos | **Aparelho** (§9.2), **Item da Atividade** (§7.3) e **Este aparelho** (variante `full` do §3.4: nome editável com "Gerar outro nome" e "Usar nome do sistema", rede, IP, código curto, porta, rotas, sinalização, impressão digital) |
| Como abrir | Ícone ⓘ no cartão do aparelho (visível no *hover*/foco; sempre visível no toque), clique com o botão direito no cartão, botão ⓘ na lista de Dispositivos, clique ou ↵ numa linha da Atividade, clique no nome em *Este aparelho*, paleta ("Detalhes deste aparelho") |
| Ações destrutivas | *Desparear* (meu aparelho) / *Esquecer* (outros) pedem confirmação **dentro da barra de ações**, sem abrir outro diálogo, e oferecem *Desfazer* no *toast* |
| Foco | Vai para o título ao abrir; ↵ no título executa a ação primária; Esc fecha e devolve o foco; trocar para outra tela fecha o inspetor, exceto quando o conteúdo continua relevante (aparelho em Compartilhar/Dispositivos; item na Atividade) |
| Linha ativa | O item aberto na Atividade fica destacado com `bg.selected` |

---

## 4. Compartilhar (envio)

### 4.1 Compositor `Composer` — RD
| Item | Especificação |
|---|---|
| Anatomia | Área de soltura (borda tracejada só durante o arrasto) · **Blocos de origem** · **Bandeja de seleção** · **Seletor de modo** · botão primário contextual |
| Estados | `vazio` (blocos + dica "Arraste arquivos para cá ou cole com Ctrl/⌘+V") · `com seleção` · `arrastando` (sobreposição) · `preparando` (gerando miniaturas/calculando tamanho > 300 ms: *skeleton* na bandeja) · `erro de leitura` (item com ícone de aviso e "Não foi possível ler este arquivo") |
| Botão primário | Modo *Um destino*: não há botão — o toque no cartão do aparelho envia (paridade com LocalSend). Modo *Vários*: "Enviar para 3 aparelhos". Modo *Link*: "Criar link" |
| Responsivo | Celular: blocos em rolagem horizontal (largura indica continuidade, como o LocalSend **[O]**); com seleção, o compositor recolhe para uma barra "4 arquivos · 24,9 MB · Editar" |

### 4.2 Bloco de origem `SourceTile` — LS
96 × 72 px (desktop) / 88 × 72 (celular); ícone 24 + rótulo; `radius.lg`. Itens: Arquivo, Pasta, Mídia (só onde houver galeria), Texto, Link, Colar. Itens indisponíveis na plataforma **não aparecem** (em vez do diálogo "não disponível" do LocalSend).

### 4.3 Bandeja de seleção `SelectionTray` — RD
Resumo ("4 itens · 24,9 MB", números em mono) · miniaturas 64 px com ✕ no *hover/foco* · "Adicionar" · "Limpar" · "Editar" (abre lista detalhada com renomear/remover/editar texto). Duplicados ignorados com *toast* "1 item repetido não foi adicionado". Estado: `texto` (mostra as 2 primeiras linhas do texto), `link` (domínio + título).

### 4.4 Seletor de modo `SendModeSwitch` — RD
Segmentado: **Um destino · Vários · Link**, com ícone de ajuda que abre explicação curta (equivalente ao `SendModeHelpDialog` **[O]**). Comportamentos herdados: *Um destino* limpa a seleção ao concluir; *Vários* mantém **[O]**.

### 4.5 Barra de destinos `DestinationsBar` — RD
Abas-filtro: *Meus aparelhos* · *Por perto* · *Favoritos* (contagem em cada) · ações "Buscar novamente" (ícone + rótulo; estado `buscando` com pulso e texto "Procurando…") e "Adicionar por endereço". Atalho: Ctrl/⌘+R busca.

### 4.6 Cartão de aparelho `DeviceCard` — RD
| Item | Especificação |
|---|---|
| Anatomia | Ícone do tipo 40 px com **PresenceDot** · apelido (nome do favorito tem prioridade) · linha secundária: modelo/SO · **RouteBadge** · ações secundárias (favoritar, mais) no *hover/foco* ou menu "⋯" |
| Variantes | `grid` (220 px mín.) · `list` (linha 56 px) · `compact` (paleta, pedido) |
| Estados extras | `selecionado` (modo Vários: ✓ + borda brasa) · `enviando` (barra de progresso embutida + "45%") · `aguardando resposta` · `recusado` (texto `danger` por 4 s) · `ocupado` · `concluído` (✓ verde por 2 s) · `offline` (opacidade 60%, ação "Enviar quando ficar online" se a Caixa estiver disponível — [?] depende de D4) · `não verificado` (ícone de escudo vazado no remoto) |
| Comportamento | Clique/↵ = enviar (modo Um) ou alternar seleção (modo Vários); clique com botão direito/⋯ = menu (Ver detalhes, Favoritar, Verificar, Copiar endereço); arrastar arquivos **sobre o cartão** = enviar direto para ele |
| A11y | `button` com `aria-label` "Enviar para Ipê Sereno, notebook Windows, rota local, online"; estado anunciado via `aria-live` |
| Tokens | `device-card.*`, `radius.lg`, `shadow.1` (claro) |

### 4.7 Cartão fantasma `DevicePlaceholder` — LS
Mesma silhueta do cartão, contorno tracejado, opacidade 50%; aparece enquanto busca e no estado vazio (com o **EmptyState** abaixo).

### 4.8 Diálogo Adicionar por endereço `AddressDialog` — LS
Abas: *Código curto* (`#NN`, como o "hashtag" do LocalSend **[O]**) · *IP e porta* · *Código de pareamento* (remoto, NV). Lista de "Usados recentemente". Erro mostra a causa exata (paridade com LocalSend 1.16.1 **[O]**).

### 4.9 Painel de envio `SendStatusPanel` — RD
Mostra **Este aparelho (nó laranja) → Trilha → destino (nó verde)**; textos de estado: "Aguardando Ipê Sereno aceitar…", "Ipê Sereno recusou", "Ipê Sereno está recebendo outra coisa agora", "Digite o PIN que aparece em Ipê Sereno", "Preparando verificação (3/12)". Ações: Cancelar · Verificar identidade. Desktop: aparece no lugar da bandeja (não abre página nova); celular: folha.

### 4.10 Painel Compartilhar via link `LinkSharePanel` — LS
QR Code (200 px, fundo branco sempre) · URL em mono com Copiar e "Ampliar" (mostra a URL em `type.mono-lg`) · interruptores: Exigir PIN (mostra o PIN em mono grande), Aceitar automaticamente · lista de **pedidos** (navegador/IP, horário, Aceitar/Recusar) com contador "2 pendentes" · Encerrar. Estados: `iniciando`, `ativo`, `erro ao iniciar`, `encerrando`. Aviso de certificado autoassinado quando aplicável.

### 4.11 Sobreposição de soltura `DropOverlay` — LS
Cobre a janela; borda tracejada brasa 2 px com `radius.xl` a 16 px das bordas; texto "Solte para adicionar" + "Solte sobre um aparelho para enviar direto". Aceita pastas e arquivos misturados.

---

## 5. Receber

### 5.1 Diálogo de pedido `ReceiveRequest` — LS
| Item | Especificação |
|---|---|
| Anatomia | Ícone do remetente 72 px + **RouteBadge** · apelido `type.display` · badges (modelo, "Meu aparelho"/"Favorito"/"Desconhecido") · frase "quer te enviar 3 arquivos (24,9 MB)" · **pré-visualização**: até 6 miniaturas/ícones + "+12" · para texto/link: conteúdo com rolagem · links: Opções, Verificar identidade · ações **Recusar** (secundário/danger) e **Aceitar** (primário) |
| Variantes | `arquivos` · `texto` (ações Copiar / Salvar na Caixa / Fechar) · `link` (Abrir / Copiar / Salvar na Caixa) · `com PIN` (remetente aguarda PIN) |
| Estados extras | `cancelado pelo remetente` (mensagem e Fechar) · `expirado` · `verificado` (escudo cheio) · `desconhecido` (aviso: "Você não conhece este aparelho") |
| Comportamento | Abre por cima de tudo (`z.request`); som/notificação do sistema opcional; atalhos: ↵ Aceitar, Esc **não** recusa (evita recusa acidental) — exige Tab até Recusar ou Ctrl/⌘+Backspace; vários pedidos simultâneos = fila com indicador "1 de 2" |
| Responsivo | Desktop: diálogo 560 px; celular: folha alta com ações fixas no rodapé, botões ≥ 48 px |
| A11y | `role="alertdialog"`; anúncio assertivo "Pedido de Ipê Sereno: 3 arquivos"; foco inicial no conteúdo, não em Aceitar |

### 5.2 Opções do pedido `ReceiveOptions` — LS
Destino (pasta, com "Alterar") · "Salvar fotos e vídeos na galeria" (onde existir; desliga com explicação se houver pastas **[O]**) · lista de arquivos com interruptor incluir/pular e renomear inline · ações em lote: renomear com prefixo + contador (zeros à esquerda, ordem A–Z) ou nomes aleatórios · Desfazer alterações. Status por item: "Sem alteração" / "Renomeado" / "Pulado".

### 5.3 Campo de PIN `PinInput` — LS
4–6 caixas mono 48 px; colar distribui; erro com contagem de tentativas restantes; bloqueio temporário com contador.

### 5.4 Verificação de identidade `FingerprintVerify` — LS
Segmentado *Símbolos · Texto*; grade de 8 símbolos de traço (conjunto próprio) ou código em blocos de 4 caracteres mono; pergunta "É igual ao que aparece no outro aparelho?"; ações "Sim, é igual" (marca como verificado) / "Não, é diferente" (bloqueia e explica). Usado no pedido, no inspetor e no pareamento.

---

## 6. Transferências

### 6.1 Doca de transferências `TransferDock` — NV (Dropbox)
| Item | Especificação |
|---|---|
| Anatomia | Cabeçalho: "Enviando 2 · Recebendo 1" + progresso agregado + recolher/fechar · lista de **Linhas de transferência** · rodapé: "Ver tudo em Atividade" |
| Estados | `oculta` (sem transferências) · `recolhida` (pílula com anel de progresso e contagem) · `expandida` · `concluída` (resumo "Tudo certo · 4 arquivos" por 5 s, depois recolhe) · `com erro` (permanece aberta, destaque `danger`) |
| Responsivo | Desktop: canto inferior direito, 380 px; celular: pílula acima da barra inferior → folha |
| A11y | `region` com `aria-live="polite"` resumido (a cada 25% e na conclusão) |

### 6.2 Linha de transferência `TransferRow` — RD
Miniatura/ícone 40 px · nome (truncado no meio: "relatorio-fin…2026.pdf") · tamanho mono · barra 6 px · status: "Na fila" / "45% · 12 MB/s" / "Concluído" / "Pulado" / "Falhou — Tentar de novo" · RouteBadge compacto · ações: Pausar (se suportado — [?] D7), Cancelar, Abrir, Mostrar na pasta.

### 6.3 Detalhe da transferência `TransferDetail` — RD (página de progresso do LocalSend)
Cabeçalho com origem → trilha → destino · resumo total (arquivos n/N, tamanho, velocidade média, tempo, rota) **sempre visível** (no LocalSend ficava em "Avançado" **[O]**) · lista de linhas · ações: Cancelar tudo, Tentar novamente os que falharam, Abrir pasta. Estados de término: concluído, concluído com erros, cancelado por você, cancelado pelo outro aparelho, conexão perdida (com "Retomar" se suportado ou "Enviar de novo").

---

## 7. Atividade (histórico unificado)

### 7.1 Barra de filtros `ActivityFilters` — NV
Busca (nome, texto, aparelho) · chips: Tudo, Enviados, Recebidos, Caixa · Tipo (Imagens, Vídeos, Documentos, Textos, Links, Pastas) · Aparelho · Rota · Status (Falhas). Filtros ativos resumidos com "Limpar".

### 7.2 Item de atividade `ActivityItem` — RD
Agrupado por dia ("Hoje", "Ontem", "12 de outubro"). Linha: direção (↑ enviado / ↓ recebido) · miniatura/ícone · título (nome ou início do texto) · metadados "PDF · 2,4 MB · de Ipê Sereno · 14:32" · RouteBadge compacto · status. Ações: Abrir, Mostrar na pasta, Copiar (texto/link), **Enviar de novo**, Salvar na Caixa, Informações, Remover do histórico. Estados extras: `arquivo indisponível` (movido/apagado — paridade com LocalSend **[O]**: oferece remover do histórico), `selecionado` (seleção múltipla com Shift/Ctrl).

### 7.3 Inspetor de item `ActivityInspector` — NV
Pré-visualização grande · metadados (nome, tipo, tamanho, caminho, origem, destino, rota, duração, velocidade média, verificação de integridade) · ações.

### 7.4 Diálogo de limpeza `ClearHistoryDialog` — LS
Opções: "Limpar tudo" / "Mais antigos que 30 dias"; explica que arquivos no disco **não** são apagados.

---

## 8. Caixa pessoal — NV

### 8.1 Editor rápido `InboxQuickCapture` — NV
Campo multilinha no topo da Caixa: "Escreva, cole um link ou solte um arquivo…"; Ctrl/⌘+↵ salva; detecta link automaticamente. Destino padrão: "Todos os meus aparelhos".

### 8.2 Item da Caixa `InboxItem` — NV
| Variante | Anatomia |
|---|---|
| `texto` | Até 6 linhas, "Mostrar mais", Copiar como ação primária |
| `link` | Domínio + título (se obtido) + favicon; Abrir / Copiar |
| `imagem` | Miniatura em proporção real (máx. 240 px de altura); Baixar / Abrir |
| `arquivo` | Ícone de tipo + nome + tamanho; Baixar / Abrir |
Metadados comuns: "de Arara Atenta · há 5 min" · RouteBadge · disponibilidade ("Neste aparelho" ✓ / "Disponível para baixar" nuvem / "Expira em 6 dias"). Ações: Fixar, Copiar, Enviar para…, Excluir. Estados: `sincronizando`, `baixando`, `expirado`, `erro`.

### 8.3 Fixados `PinnedStrip` — NV
Faixa horizontal com até 6 itens fixados acima do fluxo.

---

## 9. Dispositivos

### 9.1 Lista de aparelhos `DeviceList` — RD
Seções *Meus aparelhos* (pareados), *Por perto*, *Favoritos* (pode sobrepor). Colunas no desktop: nome, tipo/SO, rota atual, última vez visto, confiança (Verificado / Favorito / Recebimento automático).

### 9.2 Inspetor de aparelho `DeviceInspector` — RD (Detalhes do dispositivo do LocalSend)
Identidade (nome personalizado editável, nome original, tipo, modelo) · Conexão (endereço, porta, versão do protocolo, rotas disponíveis) · Confiança (Verificar identidade, Favorito, Aceitar automaticamente deste aparelho) · Registros (descoberto/atualizado via…, horário) · Remover/Desparear (danger, com confirmação).

### 9.3 Fluxo de pareamento `PairingFlow` — NV
Passo 1: *Mostrar QR* neste aparelho **ou** *Ler QR* / digitar código de 6 caracteres no outro · Passo 2: verificação de identidade (símbolos) nos dois · Passo 3: nomear e escolher confiança ("Aceitar automaticamente o que vier deste aparelho"). Estados: aguardando o outro aparelho (trilha pulsando), código expirado (com novo código), sucesso (trilha se completa). Acessibilidade: código sempre também em texto; leitura de QR nunca é o único caminho.

**Decisões validadas no protótipo** ([prototype/index.html](prototype/index.html), revisão 3):

| Item | Decisão |
|---|---|
| Apresentação | Diálogo 600 px (folha inferior no celular) com indicador de etapas *Conectar · Verificar · Confirmar* e **Trilha** fixa no topo: nó laranja = este aparelho, nó verde tracejado = "Outro aparelho · aguardando…" até ser encontrado |
| Código | 6 caracteres exibidos como `XXX XXX` em `type.mono-lg`, sem caracteres ambíguos (0/O, 1/I/L, 2/Z, 5/S, 8/B) para facilitar ditar e digitar; botão copiar; validade de **2 min** com contagem regressiva (cor de aviso nos últimos 20 s) |
| Ler código | Segmentado *Digitar código · Usar câmera*. Digitação em 6 caixas com avanço automático, colar distribui, Backspace volta, conecta sozinho ao completar; erro inline "Código inválido ou expirado" |
| Verificação | 8 símbolos (ou 8 blocos hexadecimais no modo *Texto*), derivados dos dois aparelhos; ações "Não, é diferente" / "Sim, é igual" |
| Divergência | Estado de alerta "Pareamento interrompido… Nada foi compartilhado" com *Fechar* / *Tentar de novo*; logo vai para *atenção* |
| Confirmação | Campo de nome (pré-preenchido com o apelido) + interruptor "Receber automaticamente o que vier deste aparelho" (ligado por padrão) + explicação de rota local/remota |
| Conclusão | Etapas marcadas, trilha com `gradient.brand` engrossando, ✓ verde; ações *Fechar* / *Enviar algo para [nome]* (abre Compartilhar na aba Meus aparelhos) |
| Entradas | Botão *Parear aparelho* (Dispositivos), cartão tracejado *Parear novo aparelho* no fim de *Meus aparelhos*, paleta (*Parear aparelho*, *Ler código de pareamento*) |
| Logo | *sincronizando* com o texto "Aguardando pareamento…" enquanto o diálogo está aberto; *concluído* ao parear; *atenção* se os símbolos divergirem |
| Teclado | Esc cancela (com aviso "Pareamento cancelado"); foco preso no diálogo; foco inicial no primeiro caractere ao ler código |

---

## 10. Configurações e diagnóstico

### 10.1 Seção / Linha de configuração `SettingsSection` / `SettingRow` — RD
Linha: rótulo + descrição curta + controle (interruptor, seletor, botão, campo) alinhado à direita; variantes `navegação` (abre subpágina) e `avançada` (oculta até "Mostrar opções avançadas", estado persistido como no LocalSend 1.16 **[O]**). Busca no topo filtra linhas e destaca o termo. Seções: Geral · Receber · Enviar · Segurança e privacidade · Diagnóstico · Sobre o projeto.

### 10.2 Cartão de sintoma `SymptomCard` — RD
Sintoma em linguagem simples ("Consigo enviar, mas não recebo") · "Por que acontece" · passos numerados · ação "Corrigir automaticamente" quando a plataforma permitir · "Funcionou?" (Sim / Não → próximo passo).

### 10.3 Assistente de diagnóstico `DiagnosticsRunner` — NV
Lista de verificações executadas com status por linha (rede ativa, visível na rede, firewall/porta, alcance do servidor de sinalização, rota remota): ✓ / aviso / ✕ + explicação + ação. Resultado copiável ("Copiar relatório") para pedir ajuda.

### 10.4 Lista de interfaces de rede `NetworkInterfaceList` — LS
Prévia das interfaces com IP; modo Todas / Somente estas / Todas exceto; aviso "Reinicie a visibilidade para aplicar" com botão.

### 10.5 Registros técnicos `TechLog` — RD
Lista mono rolável, filtros por tipo, copiar/exportar. Só em Diagnóstico › Avançado.

### 10.6 Decisões validadas no protótipo (revisão 4)

| Item | Decisão |
|---|---|
| Lugar | Subpágina **Configurações › Diagnóstico** (a navegação continua marcando Configurações; há o link "‹ Configurações"). Atalhos contextuais: botão *Diagnosticar* no estado vazio de "Por perto", em transferências com falha, no inspetor de *Este aparelho* e na paleta |
| Verificação automática | 6 verificações em sequência, cada uma com ícone + texto de estado (✓ / aviso / ✕): rede, visibilidade, firewall, isolamento entre aparelhos, servidor de sinalização e alcance remoto de Meus aparelhos. Ação ao lado de cada problema (*Ficar visível*, *Corrigir automaticamente*, *Parear aparelho*); corrigir verifica de novo só aquele item. Resumo final com *Copiar relatório*. A logo fica em *sincronizando* ("Verificando conexão…") e termina em *concluído* ou *atenção* |
| Firewall | "Corrigir automaticamente" avisa que **o sistema vai pedir permissão de administrador**; o guia por sintoma cobre o caso de laboratório sem permissão (pedir liberação da porta) |
| Por sintoma | 4 situações em linguagem simples (*Não encontro outros aparelhos*, *Consigo enviar, mas não recebo*, *Nenhum dos dois encontra o outro*, *A transferência para no meio*). Cada uma: "Por que acontece" + passos numerados, um de cada vez, com "Funcionou? Sim / Não, próximo passo"; no fim, convite para copiar o relatório e pedir ajuda |
| Avançado | Recolhido por padrão. Porta (aviso quando diferente do padrão), interfaces de rede com caixa de seleção por interface (destaque para redes virtuais, que costumam atrapalhar), aviso "As mudanças valem depois de reiniciar a visibilidade" + botão, registros técnicos com filtro *Tudo · Informações · Avisos e erros* e *Copiar* |
| Relatório | Texto simples com aparelho, rede, porta, resultado de cada verificação, situação escolhida e os últimos registros — pensado para colar em e-mail ou mensagem |

---

## 11. Institucional e primeiro uso — NV

### 11.1 Selo ODS `OdsBadge`
Logotipo do projeto 20 px + "Projeto de extensão · ODS" `type.caption` `text.tertiary`; link para Sobre o projeto. Nunca na área de trabalho principal.

### 11.2 Sobre o projeto `AboutProject`
Instituição, equipe, objetivo, ODS e metas (ícones oficiais), como o produto contribui, licença/código, contato. Coluna de leitura 720 px.

### 11.3 Primeiro uso `Onboarding`
Abertura com **BrandMark** `horizontal-tagline` ("De uma ponta à outra.") desenhando-se (MOTION_SPEC §6.1, estado *abrindo*) → 3 passos + 1 opcional: nome do aparelho (com gerador) → o que é "visível" e recebimento automático → parear outro aparelho (pular) → cartão do projeto (dispensável). Títulos em `type.display` (Lexend) com sublinhado em `gradient.brand`. Indicador de passo, "Pular" sempre visível, reabrível em Configurações.

---

## 12. Responsividade — resumo por componente

| Componente | < 600 | 600–959 | 960–1279 | ≥ 1280 |
|---|---|---|---|---|
| Logo (`BrandMark`) | Símbolo na barra superior | Símbolo no topo do rail | Horizontal no topo da barra lateral | Horizontal no topo da barra lateral |
| Navegação | Barra inferior | Rail | Barra lateral | Barra lateral |
| Este aparelho | Topo de Compartilhar (full) | Topo de Compartilhar | Barra lateral (compact) | Barra lateral + inspetor |
| Compositor | Recolhe com seleção | Completo | Completo | Completo |
| Destinos | 1 coluna (lista) | 2 colunas | Grade auto (≥ 220 px) | Grade auto |
| Pedido de recebimento | Folha alta | Diálogo | Diálogo | Diálogo |
| Doca | Pílula → folha | Canto | Canto | Canto |
| Inspetor | Folha | Folha lateral | Diálogo/folha | Painel fixo |
| Paleta de comandos | Tela cheia | Diálogo | Diálogo | Diálogo |
| Barra de ações | Botões fixos inferiores | Idem | Rodapé | Rodapé |

---

## 13. Decisões validadas no protótipo — revisão 5 (fechamento do web app)

| Componente | Decisão |
|---|---|
| **Diálogo genérico** | Um único contêiner para diálogos simples (ajuda, endereço, editor da seleção, limpar histórico, atalhos, receber via link, primeiro uso): foco preso, Esc fecha, clique fora fecha (exceto no primeiro uso), foco volta à origem |
| **Primeiro uso** (§11.3) | 5 etapas com indicador em pontos: boas-vindas com logo e assinatura → nome (com "Outro nome") → visibilidade + recebimento automático em 3 opções com explicação de risco → parear (opcional) → projeto de extensão. "Pular introdução" sempre visível; aparece só na primeira abertura; reabrível em Sobre o projeto |
| **Adicionar por endereço** (§4.8) | Segmentado *Código curto · IP e porta · Código de pareamento*; validação de IP (0–255) e porta (1–65535) antes de procurar; erro específico quando ninguém responde; "Usados recentemente" (até 4); sucesso fecha o diálogo, mostra o aparelho em *Por perto* e oferece *Enviar agora* |
| **Ajuda dos modos** (§4.4) | Ícone ⓘ ao lado do segmentado, abre explicação curta de *Um destino*, *Vários* e *Link* |
| **Editor da seleção** (§4.3) | Renomear arquivos (sem alterar o original), editar textos/links, remover itens ou tudo; nomes vazios bloqueiam o salvamento |
| **Compartilhar via link** (§4.10) | Estados *sem seleção → pronto para criar → iniciando → ativo → encerrando*. Ativo: QR, endereço (copiar/ampliar), *Exigir PIN* (mostra o PIN), *Aceitar automaticamente*, pedidos com contador "n pendentes" e progresso por navegador, aviso de certificado, *Encerrar* |
| **Receber via link** | A partir de *Este aparelho*: QR + endereço `/receber`; o pedido do navegador chega como um pedido de recebimento comum, marcado "Sem o app · pelo navegador" |
| **PIN ao enviar** (§4.9/§5.3) | O painel de envio troca a brasa por 4 caixas de PIN; erro com tentativas restantes; 3 erros bloqueiam por 1 minuto; acerto continua o envio normalmente |
| **Destino offline** | Com algo selecionado e destino em *Meus aparelhos*, oferece *Guardar na Caixa* para o aparelho baixar quando voltar (resposta provisória à dúvida D4) |
| **Opções do pedido** (§5.2) | Pasta de destino (*Alterar*), por arquivo: nome editável + status (*Sem alteração · Renomeado · Pulado*) + incluir/pular; *Numerar* em lote com prefixo e *Desfazer*; caracteres inválidos em nomes são removidos com aviso |
| **Fila de pedidos** (§5.1) | Um pedido por vez; os demais aguardam e o diálogo mostra "1 de N pedidos"; ao decidir, o próximo abre sozinho |
| **Atividade** (§7.1/§7.4) | Busca (nome, texto, aparelho, sem acento), filtros de direção, tipo e rota, contador "x de y", *Limpar filtros*, estado "Nenhum resultado"; *Limpar histórico* com opção "mais antigos que 30 dias" ou "tudo" e *Desfazer* |
| **Caixa** (§8) | Itens novos passam por "Enviando para seus aparelhos…"; soltar arquivos na área de captura; *Fixar* cria a seção *Fixados*; *Enviar para…* leva o item para a seleção de Compartilhar; estado vazio explicativo |
| **Dispositivos** (§9.1) | Grupos *Meus aparelhos* e *Por perto*, cada linha com presença, verificação, favorito, "visto agora/há…", recebimento automático e PIN |
| **Configurações** (§10.1) | Busca que filtra linhas e seções; recursos exclusivos do app para computador marcados com etiqueta e aviso ao usar no navegador; *Alto contraste* como quarta opção de tema (fundo branco, texto preto, bordas pretas, laranja escurecido `#A63802` com texto branco, foco azul de 3 px) |
| **Atalhos** | Tecla `?` (fora de campos) e item na paleta e em Configurações |
| **Trilha no celular** | Abaixo de 600 px, origem em cima, trilha vertical, destino embaixo (painel de envio e pareamento) |
