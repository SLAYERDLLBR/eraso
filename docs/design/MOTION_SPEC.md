# MOTION_SPEC — Erasó

> **Status:** especificação (revisão 2 — sincronizada com a logo oficial). Nada foi implementado.
> Tokens de movimento em [DESIGN_TOKENS §9](DESIGN_TOKENS.md#9-movimento). Componentes citados em [COMPONENT_INVENTORY.md](COMPONENT_INVENTORY.md). Logo em [DESIGN_SYSTEM §4.2](DESIGN_SYSTEM.md#42-logo-oficial).
> Marcadores: **[O]** observado · **[I]** inferido · **[P]** proposto.

---

## 1. Princípios de movimento

1. **Orientar, não decorar.** Toda animação responde a uma de três perguntas: *de onde isso veio?*, *para onde foi?*, *o que mudou?*. Se não responde, não existe.
2. **De uma ponta à outra.** O movimento "de marca" é o mesmo da logo: algo sai do **nó laranja** e chega ao **nó verde** pelo caminho. Ele aparece apenas quando algo está de fato em trânsito, aguardando o outro lado ou sincronizando.
3. **Rápido na entrada da mão, calmo no resto.** Retorno a toque/clique em ≤ 90 ms; mudanças estruturais em 200–280 ms; nada de interface acima de 400 ms (exceto os laços ambientes previstos).
4. **Saída mais curta que a entrada** (≈ 70% da duração), para o usuário nunca esperar algo sumir.
5. **Sem laços infinitos na área principal**, exceto: pulso de descoberta, brasa na trilha enquanto aguarda e sincronização da logo. Todos pausam quando a janela não está visível e desaparecem com movimento reduzido. **No máximo um laço visível por vez.**
6. **Movimento reduzido é cidadão de primeira classe**, não um "desligar tudo" (ver §11).

---

## 2. Evidências das referências

| Referência | Observado | Leitura |
|---|---|---|
| **LocalSend** | *Fade* inicial de 300 ms com atrasos de 200 ms e 500 ms na aba Receber; 300–400 ms com atraso de 400 ms na página de envio; deslizamento com `Curves.easeOutCubic`; `AnimatedOpacity`/`AnimatedCrossFade` de 200 ms; **logotipo girando 15 s por volta** enquanto o servidor está ativo; ícone de busca girando 2 s por volta; ícone do Dock com estado de erro/sucesso (macOS, 1.16.0); interruptor "Animações" (1.11.0); respeita a preferência do sistema na primeira execução em Android/iOS/macOS (1.18.0); correções de uso de GPU na animação de giro (1.12.0) e quando oculto na bandeja (1.11.0) **[O]** | O LocalSend já usa a logo como indicador de "estou ativo" — validamos a ideia, mas **sem giro contínuo** (custo de GPU e ruído visual): a logo Erasó só se move enquanto há atividade real. |
| **Linear** | `--speed-quickTransition: .1s`, `--speed-regularTransition: .25s`, destaque some em `.15s` e aparece em `0s`; família completa de curvas *ease-in/out* **[O]** | Duas velocidades principais; realce aparece instantâneo e some suave. |
| **Raycast** | Curva de mola definida com `linear()` (`--spring-1`) **[O]** | Mola leve para "chegadas". |
| **Dropbox** | Ícones de estado de sincronização por item (setas = em andamento, marca = concluído) **[O]** | O estado muda **no mesmo lugar**, sem deslocar o item. |

---

## 3. Durações e curvas

| Token | Valor | Uso |
|---|---|---|
| `fast` | 90 ms | *hover*, *press*, cor de fundo, opacidade de ícones de ação |
| `quick` | 140 ms | *tooltip*, troca de ícone, *checkbox*, saída de menus |
| `base` | 200 ms | entrada de menus, chips, cartões, indicador do segmentado, *toast* |
| `moderate` | 280 ms | diálogos, folhas, inspetor, doca expandindo |
| `slow` | 400 ms | coreografias: trilha se desenhando, varredura de conclusão, pareamento concluído |
| `trail-loop` | 1600 ms | ciclo da brasa na trilha enquanto aguarda resposta |
| `ambient` | 2400 ms | ciclo do pulso de descoberta |
| `logo-sync` | 3200 ms | ciclo da sincronização da logo |

| Curva | Valor | Quando |
|---|---|---|
| `standard` | `cubic-bezier(.2, 0, 0, 1)` | mudança de estado no lugar |
| `enter` | `cubic-bezier(.16, 1, .3, 1)` | elementos entrando |
| `exit` | `cubic-bezier(.4, 0, 1, 1)` | elementos saindo |
| `sway` | `cubic-bezier(.45, 0, .55, 1)` | vai-e-vem dos arcos da logo |
| `settle` | `cubic-bezier(.34, 1.3, .64, 1)` | chegada de cartão, nó verde na conclusão, favorito marcado — **máximo 1 por tela ao mesmo tempo** |
| `linear` | `linear` | progresso, pulso, brasa na trilha |

**Regras:** animar apenas `transform` e `opacity` (e `stroke-dashoffset`/`offset-distance` para trilha e logo); nunca `width/height/top/left`; *stagger* de 30 ms limitado aos 8 primeiros itens.

---

## 4. Transições estruturais

| Elemento | Entrada | Saída | Notas |
|---|---|---|---|
| Troca de tela (navegação principal) | conteúdo: opacidade 0→1 + translateY 4 px→0, `base`, `enter` | opacidade 1→0, 90 ms | A navegação e a logo ficam fixas. |
| Inspetor (desktop) | translateX 16 px→0 + opacidade, `moderate`, `enter` | 200 ms, `exit` | Sem reflow perceptível do conteúdo principal. |
| Diálogo | sobreposição: opacidade 0→1, `base`; diálogo: escala 0,96→1 + opacidade + translateY 8 px, `moderate`, `enter` | escala 1→0,98 + opacidade, 200 ms, `exit` | — |
| Folha (celular) | translateY 100%→0, `moderate`, `enter`; segue o dedo ao arrastar | 200 ms, `exit` | A velocidade do gesto pode encurtar a saída. |
| Paleta de comandos | escala 0,98→1 + opacidade, `base` | 140 ms | Resultados aparecem sem animação ao digitar. |
| Menu / *popover* | opacidade + translateY 4 px a partir da âncora, `base` | `quick` | — |
| *Tooltip* | opacidade, `quick`, atraso 500 ms (0 no foco por teclado) | 90 ms | — |
| *Toast* | translateY 8 px→0 + opacidade, `base`, `enter` | opacidade + translateY 4 px, `quick` | — |
| Sobreposição de soltura | opacidade 0→1, `fast` | `fast` | Ao arrastar sobre um cartão, ele sobe 2 px e ganha borda laranja (`fast`). |
| Troca de tema | logo faz *cross-fade* entre versão colorida e invertida, `base` | — | Nunca exibir a versão colorida sobre o fundo escuro, nem por um quadro. |

---

## 5. Descoberta de dispositivos

Substitui o ícone de busca girando do LocalSend **[O]** por um sinal calmo, derivado das **órbitas** da logo **[P]**:

1. **Pulso de busca** — no cabeçalho "Por perto", dois arcos finos (laranja em cima, verde embaixo, como as órbitas da logo) se afastam do ícone de rede: escala 1→1,6, opacidade 0,4→0, ciclo `ambient` (2,4 s), `linear`. Acompanha sempre o texto "Procurando…".
2. **Chegada de aparelho** — o cartão entra com opacidade 0→1, escala 0,96→1 e translateY 6 px→0 em `base`/`settle`; vários aparelhos de uma vez usam *stagger* de 30 ms.
3. **Ordem estável** — aparelhos novos entram no fim do grupo (ou na posição alfabética) sem empurrar o cartão sob o cursor; reordenações usam FLIP em `moderate`/`standard`.
4. **Atualização** — mudança de rota ou presença troca ícone/rótulo com *cross-fade* `quick`, sem mover o cartão.
5. **Saída** — em *Meus aparelhos* e *Favoritos*, o cartão fica com opacidade 0,6 e "Offline · visto agora"; em *Por perto*, sai com opacidade `quick` e os vizinhos se reorganizam com FLIP `base`.
6. **Fim da busca** — o pulso termina o ciclo atual e para (não corta no meio).
7. **Nenhum resultado** — após o *timeout*, o cartão fantasma faz *cross-fade* para o **EmptyState** (`base`).

---

## 6. Sincronização da logo

A logo é o **indicador de estado global** do app — sutil, no cabeçalho da barra lateral (desktop), na barra superior (celular) e na tela de abertura. Ela "sincroniza" com o que está acontecendo, reaproveitando as próprias partes do símbolo. Depende do SVG com camadas nomeadas (`no-partida`, `caminho-laranja`, `caminho-verde`, `no-chegada`, `orbita-laranja`, `orbita-verde`) — ver [DESIGN_SYSTEM §4.2](DESIGN_SYSTEM.md#42-logo-oficial).

### 6.1 Estados

| Estado global | Animação da logo | Duração / curva | Laço? |
|---|---|---|---|
| **Repouso** (nada acontecendo) | Totalmente estática | — | não |
| **Abertura do app / ficando visível** | Os dois caminhos se desenham do nó laranja até o nó verde (`stroke-dashoffset`); depois as órbitas aparecem com opacidade | 400 ms + 200 ms, `standard` | não (uma vez) |
| **Sincronizando** (buscando aparelhos, conectando rota remota, sincronizando a Caixa) | As duas **órbitas oscilam** em sentidos opostos — laranja +8°, verde −8° — e voltam, como se "afinassem" uma com a outra | `logo-sync` 3,2 s, `sway` | sim, enquanto durar |
| **Transferindo** | Um **ponto claro** (brasa) percorre o caminho do nó laranja ao nó verde (`offset-path` sobre o caminho); órbitas paradas | `trail-loop` 1,6 s, `linear` | sim, enquanto durar |
| **Concluído** | O nó verde faz um único "pouso": escala 1→1,12→1; o caminho recebe o gradiente laranja→verde por 1 s e volta ao normal | 280 ms `settle` + 1 s | não |
| **Atenção / erro** | O nó laranja reduz a opacidade 1→0,5→1 **uma vez**; um *badge* de alerta aparece ao lado da logo (o estado é dado pelo *badge*, não pela animação) | 400 ms `standard` | não |
| **Pedido de recebimento chegando** | O nó verde pulsa uma vez (escala 1→1,1→1) em sincronia com a abertura do diálogo | 280 ms `settle` | não |

### 6.2 Regras

- **Amplitude máxima:** ±8° nas órbitas, deslocamento zero do letreiro, escala máxima 1,12 nos nós. A logo **nunca gira inteira** (diferença deliberada em relação ao LocalSend).
- **Somente o símbolo se move**; o letreiro "ERASÓ" e a assinatura ficam sempre estáticos.
- **Prioridade quando há vários estados:** erro > transferindo > sincronizando > repouso.
- **Laço só enquanto a condição for verdadeira**; ao terminar, o ciclo atual é concluído e a logo volta ao repouso (sem corte brusco).
- **Pausar** quando a janela está oculta, minimizada ou na bandeja (`visibilitychange`).
- **Ícone da bandeja / barra de tarefas:** sem animação contínua. Usar 3 quadros estáticos do símbolo simplificado — repouso, transferindo (ponto no meio do caminho) e erro (*badge*) — e o progresso nativo da barra de tarefas onde existir (o LocalSend mostra progresso na barra de tarefas no desktop **[O]**).
- **Tamanho mínimo para animar:** 24 px de símbolo. Abaixo disso, apenas os quadros estáticos.
- **Acessibilidade:** a logo animada é decorativa (`aria-hidden="true"`); o estado global é anunciado por texto ("Sincronizando…", "Enviando 2 arquivos") numa região `aria-live="polite"` próxima.

---

## 7. Envio e recebimento

A **trilha** da interface é o caminho da logo em escala de interface: nó laranja na origem, nó verde no destino, traço com pontas arredondadas.

### 7.1 Envio (modo Um destino)

| t (ms) | Evento | Animação |
|---|---|---|
| 0 | Clique/toque no cartão | *press*: escala 0,98, `fast`; retorno `standard` |
| 0–90 | Feedback imediato | Cartão entra no estado "aguardando" (borda laranja) |
| 90–490 | Painel de envio aparece no lugar da bandeja | Altura do compositor via FLIP (`moderate`); **trilha se desenha** do nó laranja (Este aparelho) ao nó verde (destino) (`stroke-dashoffset`, `slow`, `standard`) |
| 490 → resposta | Aguardando | **Brasa** percorre a trilha em laço (`trail-loop`, `linear`); texto "Aguardando Ipê Sereno aceitar…"; a logo entra no estado *transferindo* |
| aceita | Transição para progresso | A brasa chega ao nó verde, que "pousa" (escala 1→1,12→1, `settle`, 280 ms); o painel encolhe em direção à doca (FLIP `moderate`) e a linha aparece na doca com `base` |
| recusada | Estado final | Trilha passa para `text.tertiary` e se desfaz do destino para a origem (`slow`, `exit`); texto em `danger` |
| ocupado / PIN | Estado intermediário | Brasa para no meio da trilha; texto/campo de PIN entra com `base` |

### 7.2 Envio (modo Vários)
Cada cartão selecionado mostra seu próprio progresso embutido; não há painel central. Seleção: ✓ entra com escala 0,6→1 (`base`, `settle`); borda laranja `fast`.

### 7.3 Pedido de recebimento
1. Sobreposição: opacidade 0→1, `base`. A logo faz o pulso do nó verde (§6.1).
2. Diálogo: escala 0,96→1 + translateY 12 px→0, `moderate`, `enter` (celular: folha sobe).
3. Conteúdo interno: ícone do remetente → nome → frase → pré-visualizações com *stagger* 30 ms (total ≤ 400 ms). Os botões **não** animam com atraso — disponíveis desde o primeiro quadro.
4. **Aceitar:** o diálogo encolhe em direção à doca (FLIP, `moderate`, `standard`). **Recusar:** sai com `exit` 200 ms. **Cancelado pelo remetente:** *cross-fade* para a mensagem de cancelamento (`base`).
5. Fila de pedidos: o próximo desliza da direita 16 px com `base`; o indicador "1 de 2" atualiza com *cross-fade*.

### 7.4 Pareamento
Os dois aparelhos aparecem nas pontas da trilha (laranja = este aparelho, verde = o outro); enquanto aguarda, brasa em laço; ao confirmar a verificação, a trilha se completa com o **gradiente de marca** e engrossa de 1,5 para 2 px (`slow`, `settle`), seguida de ✓ verde (desenho do traço, 280 ms).

---

## 8. Progresso das transferências

- **Barra determinada:** laranja enquanto transfere; largura via `transform: scaleX()`; atualizações a no máximo **10 Hz**, interpoladas com `linear` em 200 ms. Nunca anima para trás.
- **Indeterminado** (calculando *checksum*, preparando): faixa de 30% desliza em 1200 ms, `standard`, laço; em movimento reduzido vira texto "Preparando (3/12)".
- **Números** (porcentagem, velocidade, tempo restante): algarismos tabulares; velocidade e tempo atualizam no máximo **2 vezes por segundo**, suavizados (média móvel de ~3 s). Sem animação de contagem.
- **Doca recolhida:** anel de progresso 20 px (`stroke-dashoffset`, mesmas regras).
- **Leitores de tela:** anúncio a cada 25% e na conclusão.

---

## 9. Conclusão, falhas e cancelamento

| Evento | Animação | Duração |
|---|---|---|
| Arquivo concluído | **Varredura de conclusão:** o preenchimento passa pelo gradiente laranja→verde da esquerda para a direita e assenta em verde (`status.success`); status faz *cross-fade* para "Concluído" | 400 ms `standard` |
| Transferência concluída | ✓ verde desenhado no ícone da linha/doca + logo no estado *concluído* (§6.1) | 280 ms |
| Doca após conclusão total | Resumo "Tudo certo" por 5 s, depois recolhe (`moderate`, `exit`) | — |
| Falha de arquivo | Fundo da linha vai a `status.danger` translúcido 0→12%→6% **uma vez** (sem tremer); ícone ⚠ e botão "Tentar de novo" entram com `base` | 400 ms |
| Falha total / conexão perdida | Doca permanece expandida; cabeçalho muda para `danger`; *toast* persistente com ação; logo no estado *atenção* | 200 ms |
| Cancelado | Barra para no ponto atual e desbota para `text.tertiary`; status "Cancelado" | 200 ms |
| Reenvio | Linha volta a "Na fila" com *cross-fade*; barra reinicia sem animação de retorno | 140 ms |

**Proibido:** sacudir (*shake*) elementos, confetes, sons sem consentimento, piscar mais de 3 vezes por segundo (WCAG 2.3.1), gradiente de marca em mais de um elemento ao mesmo tempo.

---

## 10. Microinterações

| Interação | Comportamento |
|---|---|
| *Hover* em item/cartão | fundo `bg.hover`, `fast`; ações secundárias aparecem com opacidade `fast` |
| *Press* | escala 0,98 em cartões/blocos grandes; botões só escurecem (`fast`) |
| Foco por teclado | anel aparece **sem** animação (instantâneo) |
| Copiar | ícone troca por ✓ (`quick`), volta após 1,2 s; *toast* "Copiado" |
| Favoritar | coração preenche com escala 1→1,15→1 (`base`, `settle`) |
| Interruptor | polegar desliza `base`, `standard`; trilho muda de cor `base` |
| Controle segmentado | indicador desliza entre opções `base`, `standard` |
| Chip de filtro | fundo + ✓ entram `fast`; lista filtrada faz *cross-fade* `base` |
| Arrastar sobre cartão de aparelho | cartão sobe 2 px + borda laranja + rótulo "Soltar para enviar" (`fast`) |
| Soltar arquivos | miniaturas "caem" na bandeja: escala 0,9→1 + opacidade, `base`, *stagger* 30 ms |
| Remover da bandeja | miniatura sai com escala 1→0,9 + opacidade (`quick`); vizinhas reposicionam com FLIP `base` |
| Atalho exibido | ao pressionar o atalho, o botão correspondente mostra *press* por 90 ms |
| Este aparelho mudando visibilidade | ponto de presença faz *cross-fade* de cor `base`; texto troca com *cross-fade* |
| Aparelho verificado | escudo verde preenche (`quick`) |
| Novo item na Caixa (vindo de outro aparelho) | entra no topo com translateY −8 px→0 + opacidade (`base`, `enter`) e realce de fundo verde 8% que some em 1,5 s ("chegou") |

---

## 11. Movimento reduzido

Ativado quando `prefers-reduced-motion: reduce` **ou** quando o usuário escolhe em *Configurações › Geral › Animações*: **Sistema (padrão) · Completas · Reduzidas**. (O LocalSend oferece liga/desliga e lê a preferência do sistema só na primeira execução **[O]**; aqui o padrão segue o sistema continuamente **[P]**.)

| Animação padrão | Alternativa reduzida |
|---|---|
| Translações, escalas, FLIP | Somente opacidade (≤ 140 ms) ou mudança instantânea |
| **Sincronização da logo** (órbitas oscilando, brasa no caminho) | **Logo estática**; o estado aparece só no texto/*badge* ao lado |
| Logo desenhando-se na abertura | Logo aparece completa (opacidade 140 ms) |
| Pulso de descoberta (laço) | Removido; texto "Procurando…" com reticências **estáticas** |
| Brasa percorrendo a trilha (laço) | Trilha estática; ponto fixo no meio + texto de estado |
| Trilha se desenhando | Trilha aparece completa (opacidade 140 ms) |
| Varredura de conclusão com gradiente | Troca direta de laranja para verde |
| Barra indeterminada deslizante | Barra estática a 30% com texto "Preparando…" |
| Barra determinada interpolada | Atualiza sem interpolação, no máximo 4 Hz |
| ✓ desenhado / pouso do nó verde | Aparecem prontos |
| Piscar de falha | Fundo fixo `danger` 6% + ícone ⚠ |
| *Stagger* | Desligado |
| Folhas arrastáveis | Continuam seguindo o dedo (movimento iniciado pelo usuário), sem inércia extra |

O conteúdo comunicado **nunca** depende da animação: todo estado tem texto equivalente.

---

## 12. Desempenho

- Pausar laços (pulso, trilha, logo) quando a janela/aba não está visível ou o app está na bandeja — o LocalSend precisou corrigir uso de GPU exatamente nesses casos **[O]**.
- No máximo **1 laço ambiente** visível por vez (se a doca já mostra a brasa na trilha, a logo usa o mesmo estado sem duplicar laços na mesma área).
- Animação da logo em SVG com `transform` em grupos — sem filtros, sombras ou máscaras animadas; a versão animada usa o **símbolo plano** (sem o sombreamento do arquivo *raster*).
- Listas longas (Atividade, Caixa) com virtualização: itens que entram por rolagem **não** animam.
- Orçamento: 60 fps em máquinas de laboratório; se o tempo de quadro passar de 32 ms repetidamente, cair para o perfil "Reduzidas" na sessão **[P — a validar]**.

---

## 13. Checklist de validação (para a etapa de implementação)

- [ ] Toda animação tem gatilho, propósito (§1) e duração dentro da escala.
- [ ] Logo: estática em repouso; nunca gira inteira; letreiro nunca se move; troca para versão invertida no escuro sem "piscar".
- [ ] Nenhuma animação de interface acima de 400 ms; laços só os três previstos, um por vez.
- [ ] Saídas mais curtas que entradas.
- [ ] Testado com `prefers-reduced-motion: reduce` em todas as telas.
- [ ] Nenhuma informação transmitida só por movimento.
- [ ] Laços pausam com a janela oculta.
- [ ] Progresso não "treme" (números suavizados, 2 Hz).
- [ ] Gravação de tela das coreografias de envio, pedido, pareamento e estados da logo revisada quadro a quadro.
