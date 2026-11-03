# Etapa 4.1: relatório de testes antes da publicação

> Data: 02/11/2026 · Versão testada: 0.3.0 · Executado por: Claude Code, em um computador Windows 11 com Microsoft Edge (Chromium).

## 1. Resultado

**Situação para hospedagem: aprovado para uma publicação de teste/demonstração, com condições.** Não há bug conhecido que impeça o uso. O que falta não é código: é validação em **aparelhos e navegadores reais diferentes** (seção 5), que só a equipe consegue fazer, e decisões institucionais (seção 7 do [guia de hospedagem](HOSPEDAGEM.md)).

| Suíte | Cobertura | Resultado |
|---|---|---|
| `tests/servidor.test.mjs` | Servidor no modo público: salas, tokens, limites, cabeçalhos, pastas servidas | **17 passaram** |
| `tests/rede.test.mjs` | Camada de rede com 2 navegadores reais | **15 passaram** |
| `tests/app.test.mjs` | Interface completa com 2 navegadores reais | **26 passaram** |
| `tests/publico.test.mjs` | Ponta a ponta no modo público (sala, convite, transferência) | **5 passaram** |
| Layout do aplicativo | 6 telas × 7 larguras (320–1920 px) | 42 combinações, **0** rolagens horizontais, **0** erros de JS |
| Layout do site | 11 páginas × 5 larguras (320–1440 px) | 55 combinações, **0** rolagens horizontais, **0** erros de console |
| Links do site | `landing/tools/verificar-links.mjs` + 430 recursos internos servidos pelo servidor público | **0** problemas |

Total: **63 testes automatizados passando** (`npm test`, cerca de 1 minuto).

## 2. O que foi testado, conforme o roteiro da etapa

| Item do roteiro | Como foi testado | Situação |
|---|---|---|
| Envio e recebimento entre dispositivos reais | Dois navegadores reais no mesmo computador, por rede local e pelo modo público. **Aparelhos físicos distintos: não testado** | Parcial |
| Configurações e persistência | Cada opção alterada, recarregada e conferida; efeito aplicado na rede (nome, visibilidade, PIN, integridade, retenção, sala) | Passou |
| Arquivos grandes | **300 MB** com SHA-256 idêntico (cerca de 35 s) e cancelamento de 120 MB | Passou |
| Imagens | PNG real enviado e salvo com SHA-256 idêntico | Passou |
| Textos e links | Link com `?x=1&y=2#topo`, texto com acentos, emoji e japonês, todos íntegros; texto salvo na Caixa | Passou |
| Erros, falhas e cancelamentos | Recusa, cancelamento pelos dois lados, PIN errado/bloqueio, destino oculto/inexistente, saída do aparelho, servidor sem sala, código de sala inválido | Passou |
| Navegadores e dispositivos diferentes | Somente Edge (Chromium) em desktop e em tela de celular emulada | **Parcial**; veja seção 5 |
| Segurança, exposição de dados e variáveis de ambiente | Seção 3 | Passou, com ressalvas |

## 3. Segurança e exposição de dados

**Verificado e coberto por teste:**

- Só `landing/` e `app/` são servidos. `/server/`, `/tests/`, `/docs/`, `/.git/`, `/.claude/`, `/package.json`, `/.env`, `../`, `%2e%2e`, `\` e byte nulo respondem 400/403/404.
- Cabeçalhos em todas as respostas: `Content-Security-Policy` (scripts só do próprio site, sem `eval`), `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`; HSTS no modo público. Nenhuma violação da política no aplicativo nem no site.
- Sinalização exige o **token** do aparelho; sem ele, não dá para sinalizar em nome de outro, renomear nem ocultar.
- Salas isoladas: nenhum aparelho vê outra sala e não há sinalização entre salas.
- Limites: 600 requisições/min e 12 conexões por IP, 30 aparelhos por sala, 1.000 no total, corpo de 256 KB, verificação de `Origin`.
- Conteúdo hostil vindo de outro aparelho (nome, texto e nome de arquivo com HTML/JS) **não executa** e não cria elementos.
- `/saude` e `/api/config` não vazam dados de aparelhos. O projeto **não tem dependências npm** (sem risco de cadeia de suprimentos).
- Varredura do repositório: sem chaves, tokens, senhas, `.env`, caminhos ou e-mails pessoais. `.gitignore` cobre `.env*`.

**Ressalvas (documentadas na página Segurança):**

- Credenciais TURN, se usadas, são entregues ao navegador por `/api/config` (inerente ao TURN): usar conta exclusiva e com limite.
- O PIN fica em `localStorage` sem criptografia (só neste navegador).
- Não há verificação de identidade do outro aparelho (um servidor malicioso poderia intermediar); CRC32 não protege contra adulteração.
- Limitação por IP atrás de proxy confia no último valor de `X-Forwarded-For`; correto nas hospedagens comuns, deve ser conferido na escolhida.
- Não houve auditoria independente nem teste de carga.

## 4. Bugs e problemas encontrados nesta etapa

| # | Problema | Gravidade | Situação |
|---|---|---|---|
| 1 | O servidor servia o **repositório inteiro** (documentos, testes, relatórios) a quem acessasse | Alta para uso público | Corrigido: apenas `landing/` e `app/` |
| 2 | Qualquer aparelho podia sinalizar, renomear ou ocultar **outro** conhecendo só o identificador (visível na lista) | Alta | Corrigido: token por conexão |
| 3 | Sem separação entre usuários: na internet, todos veriam todos | Impeditiva para uso público | Corrigido: salas com código, obrigatórias no modo público |
| 4 | Sem limites contra abuso, sem cabeçalhos de segurança nem política de conteúdo | Média | Corrigido |
| 5 | Conexão entre redes diferentes impossível (`iceServers` vazio) | Impeditiva para uso remoto | Corrigido: STUN por padrão e TURN opcional; falha em redes restritas sem TURN |
| 6 | Site e documentação descreviam recursos que **não existem** (pareamento, rota remota, link, Caixa sincronizada) e mostravam "dados simulados" | Alta (informação enganosa) | Corrigido: textos reescritos; ver [RELATORIO.md](RELATORIO.md) |
| 7 | Capturas e vídeo da landing mostravam aparelhos fictícios | Alta | Capturas regeneradas do aplicativo real; **vídeo retirado** do site |
| 8 | Links do site e do rodapé para `docs/*.md`, que não são publicados | Média | Corrigido |
| 9 | O app lia os dados (nome, ID) sem permitir busca por eles | Baixa | Corrigido (busca por nome, ID e sistema) |

Nenhuma regressão: as suítes das etapas anteriores continuam passando.

## 5. O que **não** foi testado (e como testar)

Estas validações dependem de aparelhos que não estão no ambiente de desenvolvimento. Marque cada uma ao testar:

**Roteiro para a equipe (celular + computador, ~15 minutos)**

1. [ ] No computador: `npm start`. No celular, no mesmo Wi-Fi, abrir o endereço mostrado no terminal. Os dois se veem em "Por perto"?
2. [ ] Enviar do celular para o computador: uma foto, um PDF, um texto, um link. Conferir o conteúdo.
3. [ ] Enviar do computador para o celular. Conferir onde o navegador do celular salvou o arquivo.
4. [ ] Enviar um vídeo grande (>500 MB). Anotar tempo e se o navegador do celular travou ou reiniciou.
5. [ ] Cancelar no meio, dos dois lados. Recusar um pedido. Usar PIN certo e errado.
6. [ ] Desligar o Wi-Fi do celular durante o envio: a mensagem de erro é clara?
7. [ ] Repetir em **Safari (iPhone)**, **Chrome (Android)** e **Firefox (computador)**. Anotar o que muda.
8. [ ] Rede com isolamento de clientes (Wi-Fi da faculdade ou de visitantes): o Diagnóstico explica o problema?
9. [ ] **Redes diferentes** (após hospedar): um aparelho no Wi-Fi e outro nos dados móveis, na mesma sala. Anotar se conectou sem TURN.
10. [ ] Leitor de tela (NVDA ou TalkBack) percorrendo o fluxo de envio e recebimento.

## 6. Como reproduzir

```bash
npm test                       # as quatro suítes
npm run verificar-site         # links do site
node docs/etapa4/tools/capturar-landing.mjs <pasta>   # regenera as capturas do site a partir do app real
```
