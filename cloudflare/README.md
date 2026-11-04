# Serviço de presença e sinalização na Cloudflare

Este serviço faz com que os aparelhos se encontrem **sozinhos** quando o aplicativo é aberto no GitHub Pages: no mesmo Wi-Fi, sem nenhum passo, ou em qualquer rede, com um código curto de sala. Ele roda no plano gratuito da Cloudflare (Workers + Durable Objects), sem máquina para manter e sem `npm install` para quem usa o aplicativo.

**Arquivos e textos não passam por aqui.** O serviço só apresenta os aparelhos uns aos outros e repassa as mensagens iniciais da conexão; o conteúdo segue direto de um navegador ao outro, criptografado.

## Como funciona

| Item | Comportamento |
|---|---|
| Sala do mesmo Wi-Fi | Sem código, os aparelhos que saem para a internet pelo mesmo endereço caem na mesma sala. O endereço vira um hash para escolher a sala e **nunca é mostrado nem guardado**. IPv6 usa o prefixo /64. |
| Sala com código | 6 a 32 letras minúsculas e números (o aplicativo gera 6). Só quem usa o mesmo código se vê. |
| Limites | 20 aparelhos por sala. Em salas de rede grandes (por exemplo, a rede de uma instituição), o aplicativo avisa e sugere criar uma sala com código. |
| Autenticação | Cada conexão recebe um token aleatório; sem ele ninguém sinaliza nem altera a presença de outro aparelho. |
| Origens | Só o site listado em `ALLOWED_ORIGINS` (em `wrangler.toml`) pode usar o serviço. Outros sites recebem 403. |
| Conexões | WebSocket com hibernação: conexões ociosas não consomem tempo de execução. |
| Estado | Em memória, enquanto os aparelhos estão conectados. Não há banco de dados nem registro de conteúdo. |

## Publicar (uma vez, cerca de 5 minutos)

Requisitos: conta gratuita na [Cloudflare](https://dash.cloudflare.com/sign-up) (não exige cartão) e [Node.js](https://nodejs.org) 18+ **só nesta etapa**, para a ferramenta de publicação da Cloudflare (`wrangler`).

```bash
cd cloudflare
npx wrangler login        # abre o navegador para você autorizar
npx wrangler deploy       # publica e mostra o endereço, algo como https://eraso-sinal.SEU-SUBDOMINIO.workers.dev
```

Atenção: na primeira publicação, a Cloudflare registra o seu subdomínio `workers.dev` automaticamente **a partir do começo do e-mail da conta**. Como o endereço ficará público no código do app, troque-o antes no painel (**Workers e Pages › Subdomain**) por um nome neutro e só então publique de novo. Depois:

1. Coloque o endereço mostrado em `app/config.js`, no campo `servidor`, e faça o commit. O site é republicado sozinho. (Neste projeto o endereço é `https://eraso-sinal.eraso.workers.dev`.)
2. Confira `https://SEU-ENDERECO/saude`: deve responder `{"ok":true,"servico":"eraso-sinal"}`.

Se os seus sites não forem `https://slayerdllbr.github.io` e `https://eraso.pages.dev`, ajuste `ALLOWED_ORIGINS` e `APP_URL` em `wrangler.toml` antes de publicar.

### TURN (opcional)

Redes muito restritivas só conectam com um servidor de retransmissão. Se você tiver um, defina os segredos (nunca em arquivos do repositório):

```bash
npx wrangler secret put TURN_URL
npx wrangler secret put TURN_USER
npx wrangler secret put TURN_CRED
```

Eles são entregues aos navegadores por `/api/config` (é assim que o TURN funciona): use credenciais exclusivas do ERASÓ, com limite de uso.

## Testar localmente

```bash
cd cloudflare
npx wrangler dev          # serviço em http://127.0.0.1:8787
```

Na raiz do projeto: `npm run test:cloudflare` (lógica, sem rede) e `npm run test:nuvem` (ponta a ponta com dois navegadores e o Wrangler local; baixa o `wrangler` na primeira vez).

## Limites do plano gratuito e privacidade

- O plano gratuito tem limites diários de requisições e de tempo de execução; consulte os valores atuais na documentação da Cloudflare. Para dezenas de aparelhos por dia, sobra folga.
- A Cloudflare, como provedora, vê os endereços IP e o volume de acessos, conforme a política dela. O código do serviço não grava endereços, nomes nem conteúdo.
- O código de sala de 6 letras impede encontros por acaso, mas não é uma senha forte: quem o adivinhar entra na sala e vê o nome dos aparelhos (cada recebimento ainda exige aprovação e, se ativado, PIN). Para mais segurança, use o pareamento por QR Code.
- Rodar este serviço é opcional. Sem ele, o aplicativo continua funcionando com pareamento por QR Code.
