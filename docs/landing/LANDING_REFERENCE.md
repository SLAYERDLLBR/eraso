# LANDING_REFERENCE — Landing page do Erasó a partir do site do LocalSend

> Implementação: [landing/](../../landing/index.html) · Composição no Claude Design: https://claude.ai/artifact/6s4LT21v9Vtn37zZZaN9Fo (privado).
> Evidências: [referencia/](referencia/) (capturas do LocalSend) · [comparacao/](comparacao/) (lado a lado: referência à esquerda, Erasó à direita).

## 1. Fontes investigadas
| Fonte | O que foi usado |
|---|---|
| localsend.org/pt-BR (publicado, 01/11/2026) | Capturas de página inteira 1440 px (claro e escuro) e 375 px; medidas de cada seção via JS; confirmação de que o publicado = código |
| github.com/localsend/website (commit `9377b82`, Nuxt 4 + Tailwind, **Apache 2.0**) | `pages/index.vue` (ordem das seções), `components/section/*.vue`, `Navigation.vue`, `LanguageSwitcher.vue`, `AppFooter.vue`, `assets/css/style.css` (tokens, medidas, animações, pontos de quebra) |
| github.com/localsend/localsend | Só para entender funcionalidades (ver ADAPTATION_PLAN) |

Os arquivos do LocalSend não foram copiados: HTML, CSS e JS foram reescritos. Mas os **valores** de medidas, pontos de quebra e animações (por exemplo, os quadros-chave) foram mantidos da referência, que é Apache License 2.0; por isso há atribuição no rodapé, no início de `styles.css` e em `landing/THIRD_PARTY_NOTICES.md` (com a cópia da licença).

## 2. Estrutura da referência → Erasó
| Seção (arquivo) | Altura 1440 px ref → Erasó | Decisão |
|---|---|---|
| Navegação (`Navigation.vue`) fixa 80 px, blur 10 px | igual | Links → âncoras da página; "Baixar" → "Abrir o app" (Web App) |
| Hero (`Hero.vue`) | 1303 → **1303** | Capturas reais do Web App (claro/escuro) no lugar das do LocalSend |
| Números (`Stats.vue`) | 252 → **252** | Sem estatísticas inventadas: fatos do produto (2 rotas, 3 modos, 4 temas, 0 cabos) |
| Recursos (`Features.vue`) | 705 → **705** | 4 cartões com recursos reais do protótipo |
| Como funciona (`HowItWorks.vue`) | 763 → **763** | Mesmas 3 animações; arquivo sai laranja e chega verde (logo) |
| Patrocinadores, Comunidade, Imprensa | — | **Removidas a pedido** (2.874 px) |
| Vídeo + FAQ (`Faq.vue`) | 2028 → **2028** | Vídeo do YouTube → **demonstração do próprio Web App** (carrega em iframe ao clicar) |
| Contato (`cta.vue`) | 706 → **706** | "Experimente" + e-mail [a definir] |
| Rodapé (`AppFooter.vue`) | 508 → **508** | Produto · Documentação · Projeto; crédito Apache 2.0 |
| **Página inteira** | 9138 − 2874 = **6264** → **6264** | idêntica |

Celular 375 px: hero, números, perguntas e contato idênticos; Recursos −40 px e Como funciona −24 px (Instrument Sans é mais estreita que Inter e quebra menos linhas); total 7594 vs 7663 (−0,9%).

## 3. Medidas e tokens reproduzidos (de `style.css`)
Container 1100 px · seções 150 px 20 px (80 px ≤768) · cartões raio 20, padding 30 · botões pílula 14×28 (lg 16×36, sm 8×20) · h1 4rem/−1px (3rem ≤1024; clamp ≤768/≤480) · títulos de seção 2.5rem · stats 2.5rem/800 · feature 56 px ícone 36 · steps 180 px · FAQ 800 px, gap 15 · rodapé 1fr/2fr · pontos de quebra 1024/768/480 · hover cartão −5 px, botão −2 px · fadeIn 0.8 s · animações cursorMove/appDrag/folderPulse/showSuccess 3 s, fileStack 3 s, transfer 2.5 s · IntersectionObserver 0.2.
Identidade: areia `#F7F2E8`/`#EFE7D7`, floresta `#0B5E34`, terracota `#A8410F`, laranja `#F76100` (texto `#1A1105`); todos os pares ≥ 4,5:1 (claro e escuro). Fontes Lexend (títulos) + Instrument Sans.

## 4. Desvios documentados
1. **Cabeçalho 769–1024 px:** a referência transborda (rolagem horizontal em 769 px). Aqui o menu compacta e o botão do cabeçalho some ≤1023 px.
2. Movimento reduzido respeitado; `text-wrap: balance` no hero; `scroll-margin` nas âncoras; link "pular para o conteúdo".
3. Seletor de idioma: só Português (Brasil), com busca funcional.

## 5. Ferramenta: Claude Design × Figma
- **Figma:** conta com assento *View* no plano *Starter* → documentação oficial: até **20 chamadas MCP/mês**; edição por MCP não confirmada para esse assento. Inviável para iterar e comparar seção por seção.
- **Claude Design:** pranchetas em HTML/CSS reais (medidas exatas, fontes, responsivo, animações) → **escolhido**. A composição foi registrada no canvas (Desktop 1440 e Celular 375, usando o mesmo `styles.css`); a implementação está em `landing/`.

## 6. Validação feita
Capturas via Edge headless (CDP) em 1440/820/375 px e tema escuro; sem rolagem horizontal de 320 a 1440 px; links e imagens 200; tema, idioma, menu do celular, animações e demonstração testados sem erros de JS. O canvas do Claude Design **não** foi conferido visualmente (só publicado).

## 7. Mudanças da Etapa 1 (páginas institucionais)
A tabela de alturas da seção 2 vale para a primeira entrega. Na Etapa 1 mudaram, na página inicial: selo "Protótipo em desenvolvimento" acima do título; rodapé de 4 colunas (lista completa de páginas); rótulos do menu (Sobre, Como funciona, Documentação, Contato) com espaçamento do menu reduzido para os rótulos não quebrarem; nome padronizado como "ERASÓ". Detalhes em [ETAPA1_RELATORIO.md](ETAPA1_RELATORIO.md).
