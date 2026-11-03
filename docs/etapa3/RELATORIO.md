# ETAPA 3 — Relatório: correção de bugs e remoção de simulações

> Data: 02/11/2026 · Diagnóstico prévio: [DIAGNOSTICO.md](DIAGNOSTICO.md) · Decisões aprovadas: transferência **direta entre aparelhos (WebRTC)**, **remover** da interface o que depende de infraestrutura inexistente, **fases 1 e 2 juntas**.
> A landing page, as páginas institucionais, o vídeo e os documentos de design **não foram alterados**.

## 1. Resultado em uma frase

O aplicativo deixou de ser uma simulação: aparelhos, pedidos, transferências, progresso, cancelamentos, histórico, Caixa e configurações agora refletem operações reais. Para isso foi criado um **servidor local** (presença e sinalização) e uma **camada de rede WebRTC**; o que não pode ser real sem mais infraestrutura foi **removido**, não escondido.

## 2. Bugs encontrados e corrigidos

| # | Bug encontrado | Correção |
|---|---|---|
| 1 | 13 de 15 preferências **não persistiam** ao recarregar (nome, visibilidade, recebimento automático, PIN, pasta, retenção, 7 interruptores) | Todas salvas em `localStorage` (`eraso-prefs`) e reaplicadas ao abrir; testado com recarga |
| 2 | 8 controles **sem nenhum efeito** (iniciar com o sistema, bandeja, fechar ao terminar, histórico, integridade de recebimento e de envio, idioma, pasta de destino) | Implementados de verdade: *esconder painel ao terminar*, *guardar no histórico* (desligar impede o registro), *integridade* (CRC32 nos dois lados). **Removidos** os que só existem em app de computador (iniciar com o sistema, bandeja), o seletor de idioma (só há português) e o seletor de pasta (o navegador decide; a linha agora diz isso) |
| 3 | PIN fixo `4821` em 5 pontos do código | PIN escolhido/gerado pelo usuário, salvo, conferido **pelo destino** (3 erros → bloqueio de 1 min) |
| 4 | "Criptografia: sempre ativada" e "HTTPS com certificado próprio" descreviam um sistema inexistente | Texto passou a descrever o que existe: conexão direta WebRTC/DTLS; o servidor só apresenta os aparelhos |
| 5 | "Integridade: Conferida (checksum)" aparecia em qualquer registro concluído | Só aparece em **recebimentos** em que os dois lados ligaram a conferência e o CRC32 bateu |
| 6 | Botão **Fechar** do painel de envio não fechava depois de recusa/falha | Fecha o painel |
| 7 | Cancelamento podia perder a mensagem ao fechar o canal | O canal só fecha depois de esvaziar a fila (descoberto nos testes) |
| 8 | Seleção demorava a limpar após enviar arquivos pequenos | Limpa no instante em que o destino aceita |
| 9 | Duas abas do mesmo navegador brigavam pela mesma identidade | A aba antiga é desconectada com aviso claro ("aberto em outra aba") |
| 10 | Mensagens de erro inventadas ("a conexão remota caiu aos 43%") | Substituídas pelo erro real: sem servidor, aparelho saiu, conexão direta não abriu, PIN bloqueado, destino oculto, tamanho acima do limite, arquivo incompleto/com defeito |
| 11 | Datas em texto fixo ("Ontem, 18:20") e "Expira em 6 dias" fixo | Carimbos reais; expiração calculada pela retenção configurada e aplicada (itens vencidos são apagados; fixados não expiram) |

## 3. Dispositivos e simulações removidos

- **7 aparelhos fictícios** (Arara Atenta, Buriti Ágil, Tucano Leve, Pequi Firme, Jabuti Calmo, Sabiá Gentil, Tamanduá Sério) e **3 de pareamento** (Seriema Ágil, Lobo-guará Sereno, Capivara Tranquila).
- **Menu "Simular"** (12 ações), o comando "Simular pedido de arquivos" da paleta e todo o código `openRequest`/`REQ_FILES`/`WEB_FILES`.
- **Descoberta, aceite automático em 1,9 s, progresso calculado com `Math.random`, falha pré-programada** (`startTransfer`/`step`/`finish` antigos).
- **Dados pré-carregados**: 3 itens de Atividade, 3 da Caixa, `S.recentAddr`.
- **Telas sem infraestrutura** (removidas, por decisão sua): pareamento (QR/código), adicionar por endereço (`CODE_MAP`), compartilhar/receber por link (`LINK_URL` e visitantes falsos), rota remota, "Meus aparelhos", verificação de identidade por símbolos, inspetor com IPs/portas inventados (22 endereços `192.168.*`), diagnóstico de firewall/interfaces/porta fictícios.
- **Texto institucional da Caixa/Dispositivos** que falava de "todos os seus aparelhos" e "pareados".

Verificação automática: o teste "nenhum aparelho, nenhum item e nenhum botão de simulação" confirma `DEVICES=[]`, 0 cartões, nenhum elemento `.sim`, nenhum texto "simular" e nenhuma atividade/Caixa/transferência pré-carregada; outro teste confirma que a interface não contém "Parear", "Receber via link", "Adicionar por endereço", "rota remota" nem "Meus aparelhos".

## 4. O que é real agora

| Função | Como funciona de fato |
|---|---|
| Descoberta | Navegadores abertos no mesmo endereço do servidor aparecem em "Por perto" (SSE); somem ao fechar a página ou ficar ocultos. Nome e sistema/navegador vêm do próprio aparelho |
| Envio/recebimento | Pedido → aceitar/recusar/pular/renomear → bytes por canal WebRTC com contrapressão → arquivo salvo pelo navegador (download) |
| Progresso | Bytes realmente enviados/recebidos; velocidade e tempo restante calculados da medição |
| Cancelamento | Pelos dois lados, a qualquer momento; nada é entregue |
| Histórico | Registro de cada operação real, persistido; limpeza real |
| Caixa | IndexedDB neste aparelho (textos, links e arquivos), com fixar/excluir/expirar |
| Favoritos | Persistidos; aparecem como "offline" quando o aparelho some |
| Diagnóstico | Navegador, servidor, visibilidade, aparelhos e **teste de conexão direta com latência** por aparelho |

## 5. Arquivos e módulos

**Criados**
- `server/servidor.mjs`: servidor local (Node, sem dependências): arquivos estáticos, presença (SSE), sinalização WebRTC; só aceita rede local; não guarda nem vê conteúdo; bloqueia `/server`, `.git` e travessia de pasta.
- `app/rede.js`: camada de rede (presença, WebRTC, protocolo de pedido/resposta/arquivo/fim/cancelar, PIN, CRC32, teste de conexão).
- `app/app.js`: lógica do aplicativo (antes era um bloco de ~1.000 linhas dentro do HTML), reescrita nas partes simuladas e preservada nas partes de interface.
- `tests/rede.test.mjs`, `tests/app.test.mjs`, `tests/pagina-teste.html`, `package.json` (`npm start`, `npm test`).
- `docs/etapa3/` (este relatório, o diagnóstico e `tools/auditoria.mjs`).

**Modificados**
- `app/index.html`: script externo; removidos simulador, pareamento, link, endereço e linhas de configuração sem função; novos campos de nome e PIN; textos corrigidos. Identidade visual, CSS e componentes **preservados**.
- `app/README.md`: reescrito para o app real.

## 6. Testes executados e resultados

| Suíte | O que cobre | Resultado |
|---|---|---|
| `tests/rede.test.mjs` | 15 testes com 2 navegadores reais: presença, ocultar/voltar, renomear, latência, arquivo de 3 MB idêntico (CRC32) com progresso crescente, vários itens com pular/renomear, recusa, cancelamento pelos dois lados, PIN (errado, certo, bloqueio), destino oculto, destino inexistente, saída do aparelho | **15 passaram** |
| `tests/app.test.mjs` | 16 testes pela **interface real**: nada fictício ao abrir sozinho; sem erro de console em todas as telas; sem recursos removidos; descoberta mútua; nome salvo e visto pelo outro; interruptores/seletor/PIN/retenção persistem após recarregar e são aplicados à rede; arquivo escolhido no seletor da página, enviado, aceito e **salvo idêntico (SHA-256)**; atividade real e persistente; recusa; cancelamento de 120 MB; PIN pela interface; texto salvo na Caixa; Caixa persiste e expira; favoritos persistem e ficam offline; diagnóstico | **19 passaram** (3 execuções seguidas sem falha) |
| Layout | 6 telas × 7 larguras (320–1920 px) | **0** rolagens horizontais, **0** erros de JS |
| Servidor | `/server/…` e `../` negados (404); app e landing servidos | ok |

Falhas encontradas **durante** os testes e corrigidas: perda da mensagem de cancelamento (bug 7), seleção que demorava a limpar (8), botão Fechar (6) e uma corrida do próprio teste.

## 7. Problemas ainda existentes

- **Não testado em celulares e computadores diferentes.** Todos os testes usam dois navegadores na mesma máquina. Conexões WebRTC entre aparelhos reais dependem da rede (isolamento de clientes, VPN) e do navegador; o diagnóstico existe para isso.
- O arquivo recebido fica **na memória** até terminar; limite de **2 GB** por pedido (recusado com mensagem clara).
- O navegador escolhe onde salvar; vários arquivos podem acionar o aviso "permitir vários downloads".
- Endereço **HTTP**: leitura da área de transferência pelo botão "Colar" pode ser bloqueada (o aviso orienta usar Ctrl/⌘+V); Ctrl/⌘+V funciona.
- Uma aba por navegador (a antiga é desconectada).
- Acessibilidade e leitores de tela **não auditados** nesta etapa.
- **Textos fora do escopo que agora estão desatualizados:** a landing e as páginas institucionais ("Protótipo", "dados simulados", "transferência simulada"), a legenda do vídeo (que mostra o protótipo antigo) e os documentos `docs/design/*.md` (pareamento, rota remota, link, Caixa sincronizada). Não foram alterados por restrição da etapa.

## 8. Funcionalidades que dependem de infraestrutura externa (removidas da interface)

| Funcionalidade | Precisa de |
|---|---|
| Rota remota (redes diferentes) | Servidor de sinalização acessível pela internet e, em muitas redes, servidor TURN |
| Pareamento por QR/código entre redes | O mesmo servidor público e identidade de aparelho (chaves) |
| Verificação de identidade por símbolos | Chaves por aparelho ou comparação das impressões DTLS (viável, não implementada) |
| Caixa sincronizada entre aparelhos | Armazenamento no servidor, prazo e criptografia de ponta a ponta |
| Compartilhar por link para quem não tem o app | Servidor que entregue o arquivo (o navegador remetente não pode hospedar) |
| Pasta de destino, iniciar com o sistema, bandeja | Aplicativo de computador (Electron ou similar) |
| Uso fora da rede local sem expor o servidor | Hospedagem com HTTPS e autenticação |

## 9. Como usar agora

```bash
node server/servidor.mjs        # ou: npm start
```

Abrir o endereço que o terminal mostrar (ex.: `http://192.168.0.12:8780/app/index.html`) em **cada** aparelho, no mesmo Wi-Fi.

## 10. Critério de aprovação

- *Nenhuma simulação ou dispositivo fictício acessível:* **atendido** (verificado por teste automatizado e por varredura do código).
- *Funcionalidades apresentadas como reais correspondem ao comportamento efetivo:* **atendido para tudo o que a interface oferece**, validado com dois navegadores reais. A validação em **aparelhos distintos** (celular ↔ computador) é o próximo passo e depende de você.

## 11. Complemento (03/11/2026): nome e ID reais; busca de aparelhos

- **Nomes temáticos removidos.** O app sorteava nomes como "Ipê Sereno" para o próprio aparelho e oferecia "Gerar outro nome". Agora o nome de fábrica é o que o aparelho é de fato: modelo (quando o navegador informa, como no Android) ou sistema, navegador e o fim do ID — ex.: `Windows · Edge · B797`. Os botões viraram "Usar o nome do aparelho". Quem tinha um nome sorteado salvo passa a usar o nome real ao recarregar. O nome continua editável.
- **ID visível.** O cartão do aparelho e a paleta de comandos mostram o ID; o inspetor mostra o ID completo.
- **Busca.** Novo campo em Destinos filtra por nome, ID (curto, completo ou com `#`), sistema e tipo, sem diferenciar acentos; sem resultado, mostra mensagem e "Limpar busca". A paleta (Ctrl K) também encontra aparelhos pelo ID.
- **Limite do navegador.** Páginas web não conseguem ler o nome da máquina (hostname); por isso o nome de fábrica não traz "PC-da-Ana". O usuário pode renomear.
- **Testes:** `tests/app.test.mjs` agora tem 19 testes (3 novos: nome real, migração de nomes antigos, busca); `tests/rede.test.mjs`, 15. Todos passam; layout 42 combinações sem rolagem horizontal nem erro de JS.
- **Aparelhos fictícios vistos em capturas.** As telas com "Buriti Ágil", "Pequi Firme", "Adicionar por endereço" e "Parear novo aparelho" são da versão antiga em cache; o app atual servido em `http://<IP>:8780/app/index.html` não contém nenhuma delas (verificado por teste e por busca no código).

