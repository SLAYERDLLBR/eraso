# ETAPA 1 — Documentação e estrutura institucional · Relatório

> Data: 02/11/2026 · Status: **concluída, aguardando sua aprovação** · A Etapa 2 (vídeo) **não foi iniciada**.
> Aplicação web, backend, autenticação e funcionalidades: **não foram alterados** (verificado: nenhum arquivo fora de `landing/` e `docs/landing/` foi modificado nesta etapa).

## 1. O que foi criado

Onze páginas navegáveis, com o mesmo cabeçalho, rodapé, tema claro/escuro e identidade visual da landing:

| # | Requisito | Página | Observação |
|---|---|---|---|
| 1 | Sobre o ERASÓ | [sobre.html](../../landing/sobre.html) | O que é, princípios, estágio do projeto, relação com o LocalSend |
| 2 | Como funciona | [como-funciona.html](../../landing/como-funciona.html) | Projetado × existente no protótipo |
| 3 | Projeto acadêmico e Cruzeiro do Sul Virtual | [projeto-academico.html](../../landing/projeto-academico.html) | Ficha com campos pendentes |
| 4 | ODS e impacto | [ods.html](../../landing/ods.html) | **Sem nenhum ODS declarado** (pendente) |
| 5 | Política de privacidade e LGPD | [privacidade.html](../../landing/privacidade.html) | Rascunho v0.1, baseado na auditoria |
| 6 | Termos de uso | [termos.html](../../landing/termos.html) | Rascunho v0.1 |
| 7 | Segurança | [seguranca.html](../../landing/seguranca.html) | Implementado × projetado × não decidido |
| 8 | Documentação e guia de utilização | [documentacao.html](../../landing/documentacao.html) | Guia completo do protótipo, atalhos, glossário, índice dos documentos |
| 9 | GitHub e código-fonte | [codigo-fonte.html](../../landing/codigo-fonte.html) | **Sem URL de repositório** (pendente) |
| 10 | Contato | [contato.html](../../landing/contato.html) | **Sem canais** (pendentes); sem formulário |
| 11 | Rodapé completo e organizado | em todas as páginas | 4 colunas: Produto · Projeto · Legal e segurança · Para desenvolvedores |

## 2. Auditoria da arquitetura real (base dos textos jurídicos)

Arquivos analisados: `app/index.html` (app) e `landing/*.html`, `landing/main.js`, `landing/styles.css` (site).

| Verificação | Resultado |
|---|---|
| Requisições de dados (`fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`, `EventSource`, `RTCPeerConnection`) | **Nenhuma** no app e no site |
| Cookies (`document.cookie`) e análise (`gtag`, `analytics`, `googletagmanager`) | **Nenhum** |
| Armazenamento local | `eraso-theme`, `eraso-motion`, `eraso-onboarded` (app) e `eraso-landing-theme` (site) |
| Arquivos escolhidos pelo usuário | Só `URL.createObjectURL` (miniatura local); **não são enviados** |
| Área de transferência | Lida/escrita só por ação do usuário |
| Câmera, microfone, localização, notificações, service worker | **Não usados** (a "câmera" do pareamento é simulação visual) |
| Scripts de terceiros | **Nenhum** |
| Tráfego externo | **Google Fonts** (`fonts.googleapis.com`, `fonts.gstatic.com`) — recebe IP e dados técnicos |
| Backend, banco, autenticação | **Não existem** |

Consequência: as páginas de privacidade e segurança afirmam apenas isso e separam, em tabelas, o que é **implementado**, o que é **só interface (simulada)** e o que é **decisão em aberto**.

## 3. Arquivos

**Criados** (em `landing/`): `sobre.html`, `como-funciona.html`, `projeto-academico.html`, `ods.html`, `privacidade.html`, `termos.html`, `seguranca.html`, `documentacao.html`, `codigo-fonte.html`, `contato.html`; `THIRD_PARTY_NOTICES.md`; `LICENSE-Apache-2.0-localsend-website.txt`; `assets/favicon.svg`; `tools/gerar-paginas.mjs`, `tools/verificar-links.mjs`, `tools/paginas/*.html` (conteúdo das 10 páginas).
**Criados** (em `docs/landing/`): este relatório; `etapa1/` (capturas de conferência).
**Modificados:** `landing/index.html` (cabeçalho e rodapé gerados; selo de protótipo; FAQ e contato com links; nome "ERASÓ"; favicon), `landing/styles.css` (estilos das páginas institucionais, rodapé de 4 colunas, ajustes do menu), `landing/main.js` (proteção para páginas sem demo), `docs/landing/LANDING_REFERENCE.md` (correção de uma frase e seção 7).
**Não modificados:** `docs/design/**` (app e documentos de design) e `.claude/**` (desta etapa).

Para alterar menu ou rodapé em todas as páginas: editar as listas no topo de `tools/gerar-paginas.mjs` e rodar `node tools/gerar-paginas.mjs`.

## 4. Validação executada

| Verificação | Resultado |
|---|---|
| 627 links e recursos internos (arquivo e âncora) em 11 páginas | Todos válidos |
| 9 links externos (ONU Brasil, sdgs.un.org, GitHub do LocalSend ×2, Apache, ANPD, Planalto/LGPD, Google, Google Fonts) | Todos responderam 200 |
| Estrutura | 1 `h1` por página; todas as imagens com `alt`; `lang="pt-BR"`; sem ids duplicados (achou e corrigi 2); `aria-controls` válidos |
| Layout: 11 páginas × 9 larguras (320–1440 px), com e sem emulação de celular | Sem rolagem horizontal (achou e corrigi 1: endereço longo em `<code>`) |
| Cabeçalho em 18 larguras (320–1920 px) | Nenhum item quebra de linha; sem transbordo (achou e corrigi: rótulos quebravam; trilha de navegação mostrava "1."/"2.") |
| Conferência visual | Capturas de sobre, segurança (escuro), privacidade (celular), início (topo e rodapé) |

**Não verificado:** leitura por leitor de tela real; contraste das cores novas só foi calculado (≥ 4,98:1 em todos os pares), não auditado por ferramenta; navegadores além do Edge; as páginas escuras além de Segurança.

## 5. O que depende de informações ou validação

**Informações que só vocês têm (marcadas "[a definir]" nas páginas):**
1. Cruzeiro do Sul Virtual: curso, disciplina/programa de extensão, orientação docente, equipe, período — e **autorização para usar nome e logotipo**.
2. **ODS e metas** do projeto (a página não lista nenhum até a equipe validar).
3. **Controlador dos dados, encarregado (DPO) e canais**: e-mail de contato, privacidade, segurança e parcerias.
4. **URL do repositório no GitHub**, visibilidade, **licença do código**, titularidade da marca e do logotipo, regras de contribuição.
5. **Hospedagem** do site (logs de acesso) e **foro/legislação** dos termos.
6. Confirmar que o ERASÓ é independente do LocalSend (afirmado em "Sobre").

**Validações necessárias antes de publicar:**
- **Revisão jurídica e institucional** da Política de privacidade e dos Termos (são rascunhos v0.1 e dizem isso no topo). Bases legais, prazo de retenção, limitação de responsabilidade e foro **não foram inventados**.
- Aprovar o compromisso "atualizar a política antes de qualquer funcionalidade que colete dados" (seção Funcionalidades futuras).
- Aprovar o critério da página de ODS (só declarar com evidência).

## 6. Decisões que tomei e que você pode reverter

- **Selo "Protótipo em desenvolvimento"** no topo da página inicial, para não sugerir que a transferência já funciona (a página ganhou ~56 px de altura).
- **Sem formulário de contato:** exigiria servidor e coleta de dados que o projeto ainda não tem.
- **Menu:** "Sobre · Como funciona · Documentação · Contato" (no lugar de "Recursos · Como funciona · Perguntas · Contato"); recursos e perguntas continuam na página inicial e no rodapé.
- **Grafia "ERASÓ"** em todo o site (como você escreve). **O app ainda usa "Erasó"** em alguns textos, por eu ter mantido a aplicação intacta — dá para harmonizar com sua aprovação.
- **O app não ganhou links para as páginas institucionais** (ex.: em "Sobre o projeto") pelo mesmo motivo; hoje a ligação é só da landing para o app.
- **Fontes continuam no Google Fonts** (disclosed na privacidade); empacotá-las localmente eliminaria a única requisição a terceiros.
- O símbolo da logo segue **provisório** (recriado do PNG); o SVG oficial continua pendente (D11).

## 7. Próximo passo

**Aguardando sua aprovação da Etapa 1.** Depois disso, a Etapa 2 começa pela auditoria dos fluxos reais do app e termina, antes de qualquer animação, na apresentação do **roteiro, do storyboard e dos Motion Frames** para você aprovar.
