# Hospedagem do ERASÓ

> Guia da etapa 4.3. **O servidor descrito aqui é opcional**: o aplicativo já funciona sem ele no GitHub Pages, por pareamento por código. Hospede o servidor só se quiser descoberta automática de aparelhos (mesma rede ou sala).

## 1. O que precisa ser hospedado

**Um único serviço Node.js** (`server/servidor.mjs`). Ele faz três coisas:

| Função | Observação |
|---|---|
| Serve o site (`/landing/`) e o aplicativo (`/app/`) | Arquivos estáticos; só essas duas pastas são públicas |
| Presença por sala (SSE) | Estado **em memória**; por isso **uma única instância** (não escale horizontalmente) |
| Sinalização WebRTC | Repassa mensagens entre aparelhos da mesma sala |

Não há banco de dados, armazenamento de arquivos nem serviço de e-mail. **Arquivos e textos não passam pelo servidor.**

Serviços externos usados pelo navegador do visitante:

| Serviço | Para quê | Observação |
|---|---|---|
| STUN (padrão: `stun.cloudflare.com`) | Descobrir o endereço público do aparelho | Gratuito; troque em `ERASO_STUN` |
| TURN (opcional) | Retransmitir quando a conexão direta falha (redes restritivas, dados móveis) | Não há padrão: é preciso contratar ou hospedar. Veja a seção 4 |
| Google Fonts | Fontes da interface | Revela o IP do visitante ao Google; veja pendência na seção 7 |

## 2. Variáveis de ambiente

Modelo em [.env.example](../../.env.example). Defina-as no painel da hospedagem, nunca no repositório.

| Variável | Obrigatória | Função |
|---|---|---|
| `PORT` | não | A hospedagem costuma definir sozinha |
| `ERASO_PUBLICO` | **sim** (`1`) | Liga o modo público: sala obrigatória, limites e HSTS. Sem ela, o servidor só aceita rede local |
| `ERASO_PROXY` | não | Padrão ligado no modo público: lê o IP do cliente de `X-Forwarded-For` |
| `ERASO_STUN` | não | Lista de servidores STUN, separada por vírgulas |
| `ERASO_TURN_URL`, `ERASO_TURN_USER`, `ERASO_TURN_CRED` | só com TURN | **Entregues ao navegador** em `/api/config` (é assim que o TURN funciona). Use credenciais exclusivas do ERASÓ, com limite de uso |

## 3. Passo a passo (Render, plano gratuito)

O arquivo [render.yaml](../../render.yaml) já descreve o serviço.

1. Crie o repositório no GitHub e envie o projeto (etapa 4.2).
2. No Render: **New → Blueprint**, escolha o repositório e confirme.
3. Aguarde o *deploy*. O endereço será `https://eraso-xxxx.onrender.com` (HTTPS automático).
4. Abra `https://…/saude`: deve responder `{"ok":true,"modo":"publico",…}`.
5. Abra `https://…/app/index.html` em dois aparelhos, crie uma sala em um e abra o convite no outro.
6. **Domínio próprio (opcional):** *Settings → Custom Domains*, aponte um `CNAME` do seu domínio para o endereço do Render. O HTTPS é emitido automaticamente.

Observações do plano gratuito: o serviço costuma **hibernar** após um tempo sem acessos, e o primeiro acesso depois disso demora para acordar (as salas são perdidas ao hibernar; basta reconectar). Serve para demonstração e testes, não para uso contínuo.

**Alternativas.** O mesmo projeto roda em qualquer hospedagem de Node.js ou de contêiner (há um [Dockerfile](../../Dockerfile)), como Railway ou Fly.io. Consulte os planos e preços vigentes antes de escolher. Exija: HTTPS, suporte a conexões SSE de longa duração e uma instância única.

## 4. Servidor TURN

Sem TURN, a conexão direta funciona na maioria das redes domésticas, mas **falha** em redes restritivas (alguns Wi-Fi corporativos e de instituições, parte dos dados móveis). Opções:

1. **Serviço gerenciado de TURN** (vários oferecem plano gratuito limitado): crie uma conta, gere credenciais exclusivas e preencha as três variáveis `ERASO_TURN_*`.
2. **coturn** em uma VPS própria: mais controle, mais manutenção.

O tráfego retransmitido já está criptografado de ponta a ponta (DTLS): o operador do TURN vê apenas volume e endereços, não o conteúdo.

## 5. Validação depois de publicar

- [ ] `/saude` responde `ok` e `modo: publico`.
- [ ] `/server/servidor.mjs`, `/docs/…`, `/.git/config` e `/package.json` respondem **404**.
- [ ] Cabeçalhos presentes (`curl -I`): `content-security-policy`, `x-content-type-options`, `strict-transport-security`.
- [ ] Dois aparelhos em redes **diferentes** (um no Wi-Fi, outro nos dados móveis) se encontram na mesma sala e transferem um arquivo. Anote se foi preciso TURN.
- [ ] O app mostra "Entre numa sala" ao abrir sem convite; uma sala com código diferente não vê os outros.
- [ ] O site abre, os links entre as páginas e o botão "Acessar o app" funcionam.
- [ ] Nenhuma variável secreta aparece no código-fonte servido (`/app/*.js`, `/landing/*`).

## 6. Reverter

Pelo painel da hospedagem, reimplante o *commit* anterior. Como não há banco de dados nem arquivos guardados, não há migração a desfazer.

## 7. Pendências antes da publicação oficial

- Definir o titular dos direitos autorais e a titularidade da marca (a licença do código, Apache-2.0, já foi escolhida).
- Preencher os dados institucionais marcados como "[a definir]" nas páginas do site (equipe, orientação docente, ODS, contato) ou deixá-los explicitamente como pendentes.
- Decidir se as fontes serão **hospedadas junto com o site** (privacidade melhor, remove a dependência do Google Fonts) ou mantidas no Google Fonts com aviso na página de privacidade.
- Definir o endereço público final (domínio ou subdomínio) e atualizar o rodapé e os metadados.
- Contratar ou descartar o TURN, conforme o resultado do teste entre redes diferentes.
