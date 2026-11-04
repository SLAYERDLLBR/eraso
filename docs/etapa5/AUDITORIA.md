# Auditoria técnica para publicação no GitHub e no GitHub Pages

> Data: 03/11/2026 · Versão auditada: 0.3.0 · Resultado: **o site pode ser publicado no GitHub Pages; o aplicativo, não**, porque depende de um servidor.

## 1. Estrutura

| Pasta | Papel |
|---|---|
| `app/` | Aplicativo web (frontend): `index.html`, `app.js`, `rede.js`, imagens |
| `server/` | Backend: presença, sinalização e entrega de arquivos estáticos |
| `landing/` | Site institucional (11 páginas), gerado por `landing/tools/` a partir de modelos |
| `scripts/` | Build do site para o GitHub Pages |
| `tests/` | Testes automatizados (servidor, build do Pages, rede, interface, ponta a ponta) |
| `docs/` | Design system, relatórios, guia de hospedagem |

O site e o aplicativo **estão separados**: pastas, arquivos, responsabilidades e formas de publicação diferentes.

## 2. Frontend, backend, banco de dados e serviços externos

| Item | Situação |
|---|---|
| Frontend | HTML, CSS e JavaScript puros, sem framework, sem compilação e sem dependências |
| Backend | Um servidor Node.js (`server/servidor.mjs`), só módulos nativos |
| Banco de dados | **Não há.** O estado do servidor (quem está online) fica em memória |
| Armazenamento do usuário | `localStorage` e IndexedDB, no navegador |
| Serviços externos | Google Fonts (fontes); STUN público da Cloudflare (padrão, modo público); TURN opcional, **ainda não definido** |
| Dependências npm | **Nenhuma** (nem de produção, nem de desenvolvimento) |

## 3. Como executa hoje

`npm start` (rede local) ou `npm run start:publico` (internet, com salas). Requer Node.js 18+. Testes: `npm test` (exige Microsoft Edge para as suítes com navegador).

## 4. Rotas, caminhos e recursos estáticos

- O site usa **somente links relativos**; funciona em qualquer subcaminho, inclusive `usuario.github.io/eraso/`. Não há roteamento no navegador (SPA): cada página é um arquivo `.html`.
- Os botões do site apontavam para `../app/index.html`, caminho que só existe quando o servidor do ERASÓ serve os dois. O build do Pages os reescreve (para `aplicativo.html` ou para o endereço público do aplicativo, quando existir).
- O aplicativo chama `/api/...` na mesma origem. Isso **não funciona** em hospedagem estática.

## 5. Compatibilidade com o GitHub Pages

| Parte | Compatível? | Motivo |
|---|---|---|
| Site institucional (`landing/`) | **Sim** | Arquivos estáticos, links relativos, sem dependência de servidor |
| Aplicativo (`app/`) com **descoberta automática** | **Não** | Precisa do servidor (`/api/eventos`, `/api/sinal`, `/api/config`) para os aparelhos se encontrarem |
| Aplicativo (`app/`) com **pareamento por código** | **Sim** | Os dois navegadores trocam o código de conexão (WebRTC sem sinalização por servidor); só usa STUN público |

Decisão (3 de novembro, a pedido do projeto): o aplicativo **funciona no GitHub Pages sem servidor**, por pareamento manual com QR Code, link ou texto. O servidor Node.js continua existindo como **modo opcional** de descoberta automática, que depende de hospedagem própria (guia em `docs/etapa4/HOSPEDAGEM.md`). Nada foi simulado nem removido: o aplicativo detecta que `/api/config` não existe e muda de modo. Limitações do modo sem servidor: o pareamento não sobrevive ao fechar a página; não há lista automática de aparelhos.

## 6. Funcionalidades que dependem de infraestrutura externa

- **Servidor de presença e sinalização** (Node.js, HTTPS no modo público): hospedagem a definir.
- **STUN/TURN**: STUN público gratuito já configurado; **TURN** a definir, necessário em redes restritas.
- **Google Fonts**: dependência de terceiros declarada na página de Privacidade.

## 7. Dados de demonstração, dispositivos fictícios e simulações

Nenhum no código servido. Foi removido na etapa 3 e conferido por teste (nenhum aparelho, item ou botão de simulação ao abrir sozinho). Os arquivos de exemplo das capturas de tela são gerados na hora por `docs/etapa4/tools/capturar-landing.mjs`, com dois navegadores reais. Os documentos de design e relatórios antigos mencionam o protótipo simulado, com aviso em `docs/design/LEIA-ME.md`. O vídeo antigo (que mostrava telas simuladas) foi retirado do site e ficou fora do repositório.

## 8. Segurança e histórico

- Varredura de todo o conteúdo versionado: **sem** chaves, tokens, senhas, `.env`, caminhos pessoais, dumps ou e-mails pessoais.
- `.gitignore` cobre `.env*`, `.claude/`, `node_modules/`, saídas de build e material de trabalho de terceiros.
- Repositório novo: **não existia** repositório do ERASÓ na conta (7 repositórios públicos, nenhum relacionado). Não há histórico a preservar nem risco de segredo em commits anteriores.
- O identificador de e-mail dos commits é o endereço `noreply` do GitHub.
- Achado corrigido nesta auditoria: o PIN do aplicativo era gerado com `Math.random()`; passou a usar `crypto.getRandomValues`.

## 9. Impedimentos para a publicação

| # | Impedimento | Situação |
|---|---|---|
| 1 | Servidor opcional de descoberta automática sem hospedagem | Pendente; não impede o uso (pareamento por código) |
| 2 | Dados institucionais (curso, orientação, equipe, período, ODS, contato, encarregado) | Pendentes, dependem da equipe; aparecem como "[a definir]" |
| 3 | Titular dos direitos autorais e titularidade da marca | Pendentes |
| 4 | Habilitar o GitHub Pages com origem "GitHub Actions" | Ação única do dono do repositório, nas configurações |
| 5 | Teste em aparelhos físicos diferentes e em redes diferentes | Pendente; roteiro em `docs/etapa4/RELATORIO_TESTES.md` |
