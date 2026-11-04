# Migração para a Cloudflare (site, aplicativo e serviço)

> **Estado em 4 de novembro de 2026:** os passos 3.1 a 3.3 já foram feitos e a Cloudflare Pages (https://eraso.pages.dev/) foi definida como o endereço **oficial**. O GitHub Pages continua publicado como **espelho** (as páginas apontam o endereço oficial em `canonical`), e o serviço aceita os dois. Faltam, se você quiser: domínio próprio (3.4) e desligar o espelho (3.6).

## 1. Onde cada parte está hoje

| Parte | Código | Hospedagem hoje | Endereço |
|---|---|---|---|
| Site institucional | `landing/` | GitHub Pages | https://slayerdllbr.github.io/eraso/ |
| Aplicativo | `app/` | GitHub Pages (junto com o site) | https://slayerdllbr.github.io/eraso/app/index.html |
| Serviço de apresentação | `cloudflare/` | Cloudflare Workers (plano gratuito) | https://eraso-sinal.eraso.workers.dev |
| Publicação | `.github/workflows/pages.yml` | GitHub Actions: monta o site (`scripts/build-pages.mjs`) e publica a cada commit em `main` | — |

Todo o código-fonte, os testes e a documentação ficam neste repositório. O serviço é publicado à mão (`cd cloudflare && npx wrangler deploy`).

## 2. O que já está pronto para a Cloudflare

- `npm run build:cloudflare` monta o mesmo site em `_site/` e acrescenta um arquivo **`_headers`**, que a Cloudflare Pages aplica. Isso dá à Cloudflare o que o GitHub Pages não permite: política de conteúdo (CSP) por cabeçalho HTTP, `nosniff`, HSTS, restrição de quem pode embutir o site e câmera permitida só para o próprio site. A política do aplicativo libera apenas o endereço do serviço (`app/config.js`).
- O site usa só links relativos e o aplicativo descobre sozinho o prefixo do endereço, então funciona na raiz de um domínio (`https://nome.pages.dev/`) tanto quanto em `/eraso/`.
- O serviço da Cloudflare só aceita origens listadas em `ALLOWED_ORIGINS` (`cloudflare/wrangler.toml`).

## 3. Passo a passo da migração

### 3.1 Criar o projeto na Cloudflare Pages
1. No [painel da Cloudflare](https://dash.cloudflare.com): **Workers e Pages › Criar › Pages › Conectar ao Git**.
2. Autorize a Cloudflare a ler o repositório `SLAYERDLLBR/eraso` (um aplicativo do GitHub pede a sua aprovação; escolha só este repositório).
3. Configure a compilação:
   - **Ramo de produção:** `main`
   - **Comando de compilação:** `npm run build:cloudflare`
   - **Diretório de saída:** `_site`
   - **Variáveis de ambiente:** `NODE_VERSION` = `22` e `SITE_URL` = o endereço final do site, sem barra no fim (por exemplo, `https://eraso.pages.dev`). O `SITE_URL` alimenta `canonical`, `og:url`, `sitemap.xml` e `robots.txt`.
4. Salve e implante. A Cloudflare publica a cada commit em `main`, como o GitHub faz hoje.

> Os nomes `*.pages.dev` são globais: se `eraso` já existir, escolha outro (por exemplo, `eraso-app`). Escolha um nome neutro: ele fica público.

### 3.2 Liberar o novo endereço no serviço
Sem este passo, o novo site recebe 403 do serviço e o aplicativo cai no pareamento por QR Code.

1. Em `cloudflare/wrangler.toml`, acrescente o novo endereço a `ALLOWED_ORIGINS` (lista separada por vírgulas; mantenha o do GitHub enquanto os dois sites existirem) e atualize `APP_URL`:
   ```toml
   ALLOWED_ORIGINS = "https://slayerdllbr.github.io,https://SEU-NOME.pages.dev"
   APP_URL = "https://SEU-NOME.pages.dev/app/"
   ```
2. Publique: `cd cloudflare && npx wrangler deploy`.

### 3.3 Conferir
```bash
ERASO_URL=https://SEU-NOME.pages.dev/app/ npm run test:nuvem
```
O teste abre dois navegadores no site novo, confere que os aparelhos se encontram sozinhos, transfere um arquivo e verifica o SHA-256. Confira também no navegador: o endereço sem `.html` (a Cloudflare redireciona `pagina.html` para `pagina`) e `https://SEU-NOME.pages.dev/pagina-que-nao-existe` (deve mostrar a página 404 do ERASÓ).

### 3.4 Domínio próprio (opcional)
1. **Pages › seu projeto › Domínios personalizados › Configurar um domínio.** Se o domínio já está na Cloudflare, o DNS é criado sozinho; se não, crie o `CNAME` indicado no seu provedor.
2. Inclua o domínio em `ALLOWED_ORIGINS` (passo 3.2) e em `SITE_URL`.
3. Opcional: dar um nome próprio ao serviço (por exemplo, `sinal.seudominio.com`) com uma rota no `wrangler.toml`; nesse caso, atualize `servidor` em `app/config.js`.

### 3.5 Atualizar os textos
- **Privacidade** (`landing/tools/paginas/privacidade.html`): o provedor de hospedagem do site e do aplicativo passa de GitHub (GitHub Pages) para a Cloudflare. Depois, `npm run gerar-site`.
- **README** (seção "Links oficiais") e `cloudflare/wrangler.toml`: novos endereços.
- **Página do projeto no GitHub:** atualize o campo "Website" em *Sobre*.

### 3.6 Desligar o GitHub Pages (quando tudo estiver verificado)
Opções: manter como espelho; ou, em **Settings › Pages**, remover a publicação. Para avisar quem tem o endereço antigo, publique antes uma página mínima com um redirecionamento (`<meta http-equiv="refresh" content="0; url=https://SEU-NOME.pages.dev/">`) e só depois desligue. Se desligar, apague também `.github/workflows/pages.yml`.

## 4. O que muda para o usuário
- Endereço novo do aplicativo e do site. O código de sala, as preferências e o histórico ficam no navegador **por endereço**: no endereço novo, os aparelhos começam do zero (nome e favoritos precisam ser refeitos).
- Cabeçalhos de segurança reais. Os links `.html` passam a abrir sem a extensão.

## 5. Voltar atrás
Nada da migração apaga o que existe: o GitHub Pages continua publicado até você desligá-lo. Para voltar, basta manter ou reativar o GitHub Pages e remover o novo endereço de `ALLOWED_ORIGINS`.

## 6. Limites e custos
O plano gratuito da Cloudflare Pages e do Workers tem limites de uso (builds, requisições, tempo de execução). Confira os valores atuais na documentação da Cloudflare antes de divulgar o endereço para muita gente. Domínio próprio é pago à parte, no registrador escolhido.
