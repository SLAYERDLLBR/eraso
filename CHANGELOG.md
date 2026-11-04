# Histórico de mudanças

Segue o formato do [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o versionamento semântico, adaptado à fase de protótipo (versões 0.x podem mudar sem aviso).

## [0.5.0] — 2026-11-04

Os aparelhos passam a se encontrar **sozinhos**, sem códigos e sem QR Code.

### Adicionado
- **Serviço de apresentação na Cloudflare** (`cloudflare/`): Worker com Durable Object e WebSocket com hibernação, no plano gratuito. No mesmo Wi-Fi os aparelhos aparecem sozinhos (a sala é escolhida pelo hash do endereço de saída, que não é mostrado nem guardado); salas com código de 6 letras reúnem aparelhos de qualquer rede. Token por aparelho, origem permitida, limite de 20 aparelhos por sala (a rede grande recebe aviso e a sugestão de criar uma sala).
- O aplicativo usa o serviço quando o endereço está em `app/config.js`; se o serviço não responder, cai no pareamento por QR Code. O pareamento por QR continua disponível como alternativa.
- Testes: lógica do serviço em Node (13), ponta a ponta com o Wrangler local e dois navegadores (8, `npm run test:nuvem`), build do Pages com a política de conteúdo liberando só o endereço do serviço.

### Alterado
- Códigos de sala passam a ter de 6 a 32 caracteres (o aplicativo gera 6 na nuvem e 10 em servidores próprios).
- O servidor Node passa a ser opcional também para quem quer rodar o próprio serviço na rede local.

## [0.4.0] — 2026-11-03

O aplicativo passa a funcionar **sem servidor**, direto no GitHub Pages.

### Adicionado
- **Pareamento por código**: um aparelho gera um convite (QR Code, link e texto), o outro o aplica e devolve uma resposta; depois a ligação fica aberta e cada envio usa um canal novo dentro dela. Sem servidor, sem conta e sem instalação.
- Gerador de **QR Code** próprio (`app/qr.js`, versões 1 a 40) e leitura pela câmera com a biblioteca jsQR 1.4.0 (Apache-2.0, incluída em `app/vendor/`, carregada só quando necessário).
- O aplicativo é publicado no GitHub Pages junto com o site (`/app/`), com política de conteúdo em `<meta>`; o aplicativo detecta sozinho que não há servidor.
- Tela de pareamento, "Desfazer pareamento", modo "sem servidor" no diagnóstico e nos textos de estado.
- Testes: gerador de QR (jsQR lê de volta cada QR; versões 1 a 40, níveis L e M), ponta a ponta sem servidor com dois navegadores (QR lido da tela, transferência com SHA-256, nome e latência, desfazer pareamento, câmera ausente) e build do Pages com o aplicativo.

### Alterado
- O servidor passa a permitir a câmera (`Permissions-Policy: camera=(self)`) para o leitor de QR Code.
- Site, Privacidade, Segurança e README descrevem os dois modos (sem servidor e com servidor).
- Os testes fecham a página (`Page.close`) antes de encerrar o navegador, o que corrige uma falha intermitente na detecção de saída de aparelho.

## [0.3.0] — 2026-11-02

Preparação para publicação.

### Adicionado
- **Salas com código** e link de convite: no servidor público, só aparelhos com o mesmo código se veem. Tela "Entre numa sala" e controles em Configurações.
- **STUN** padrão e **TURN** opcional (variáveis de ambiente), entregues pelo servidor em `/api/config`.
- **Token por aparelho** para sinalizar e alterar a presença.
- **Limites** por IP, por sala e de tamanho; verificação de `Origin`; rota `/saude`.
- **Cabeçalhos de segurança**: política de segurança de conteúdo, `nosniff`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy` e HSTS no modo público.
- Busca de aparelhos por nome, ID e sistema; nome de fábrica do aparelho com o modelo ou sistema, navegador e ID.
- Testes: servidor no modo público (17), ponta a ponta no modo público (5), arquivo de 300 MB, imagem, links e texto Unicode, conteúdo hostil.
- Documentação: README, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, guia de hospedagem, relatórios de testes. `Dockerfile` e `render.yaml`.
- Licença **Apache-2.0** (`LICENSE` e `NOTICE`).
- Publicação do site no **GitHub Pages**: `scripts/build-pages.mjs`, workflow, página `aplicativo.html`, `404.html`, `sitemap.xml` e `robots.txt`; teste do build sob subcaminho.
- Diagramas do site (arquitetura e fluxo de envio), com versão para celular e legendas.
- Integração contínua, modelos de issue e de pull request, Código de Conduta.

### Alterado
- O PIN passou a ser gerado com `crypto.getRandomValues` (antes, `Math.random`).
- O aplicativo passou de `docs/design/prototype/` para `app/`.
- O servidor só publica `landing/` e `app/` (antes servia o repositório inteiro).
- Site reescrito para descrever o que o produto faz hoje; capturas regeneradas a partir do aplicativo real; Privacidade e Termos na versão 0.2 (rascunho).

### Removido
- Vídeo de demonstração do site, por mostrar telas e aparelhos que não existem.

## [0.2.0] — 2026-11-02

O aplicativo deixou de ser uma simulação.

### Adicionado
- Servidor de presença e sinalização e camada de rede WebRTC: descoberta real e transferência direta, criptografada, entre navegadores, com progresso, cancelamento, PIN e conferência de integridade (CRC32).
- Persistência real das configurações, da Atividade e da Caixa (IndexedDB).
- Diagnóstico com teste de conexão direta e latência.
- Testes automatizados com navegadores reais.

### Corrigido
- 13 de 15 preferências não persistiam; 8 controles não tinham efeito; PIN fixo no código; mensagens de erro inventadas; cancelamento que perdia a mensagem; botão Fechar do painel de envio.

### Removido
- Aparelhos, pedidos, histórico e transferências fictícios; menu "Simular"; pareamento, rota remota, envio por link, adição por endereço e verificação por símbolos (dependem de infraestrutura que não existe).

## [0.1.0] — protótipo

### Adicionado
- Design system "Revezamento", protótipo navegável com dados simulados, landing page e páginas institucionais.
