# ETAPA 3 — Diagnóstico (auditoria antes de qualquer correção)

> Data: 02/11/2026 · Diagnóstico feito antes das correções. **Correções concluídas: veja [RELATORIO.md](RELATORIO.md).**
> Script de auditoria reproduzível: [`tools/auditoria.mjs`](tools/auditoria.mjs) (`node auditoria.mjs <url do app>`).

## 1. Conclusão principal

O Web App **não é um produto com partes simuladas: é uma simulação inteira**. Um arquivo HTML de 2.041 linhas, sem servidor, sem nenhuma chamada de rede (`fetch`, `WebSocket`, `RTCPeerConnection`, `EventSource`: **0**), com **35 usos de `setTimeout`/`setInterval`** encenando eventos e **9 `Math.random`** gerando jitter de velocidade. Não existe nenhum aparelho real, nenhuma transferência real e nenhum envio de bytes.

Por isso o critério de aprovação ("nenhuma simulação permanece e tudo que é apresentado como real corresponde ao comportamento efetivo") **não pode ser atingido apenas removendo código**: se eu tirar o que é simulado, sobra um app sem descoberta, sem envio e sem recebimento. Para esses fluxos serem reais é preciso **construir infraestrutura** (seção 6). Essa é a decisão que preciso de você antes de corrigir.

## 2. Configurações

Teste automatizado: alterei cada preferência, recarreguei a página e comparei.

| Preferência | Persiste? | Tem efeito real? | Problema |
|---|---|---|---|
| Tema (claro/escuro/sistema/alto contraste) | **Sim** (`eraso-theme`) | Sim | — |
| Animações (sistema/reduzidas/completas) | **Sim** (`eraso-motion`) | Sim | — |
| Nome do aparelho | **Não** | Parcial (só no cabeçalho) | Volta a "Ipê Sereno" ao recarregar; o nome é fixo no código |
| Visível na rede | **Não** | Só muda um texto | Não há rede; volta a "visível" |
| Receber automaticamente de | **Não** | Só afeta pedidos simulados | Volta a "meus aparelhos" |
| Exigir PIN | **Não** | Só afeta pedidos simulados | PIN fixo **4821** em 5 pontos do código |
| Pasta de destino | **Não** | **Nenhum** | Alterna entre três nomes fictícios e avisa "Protótipo: no app, abriria o seletor". Navegador não grava em pasta arbitrária |
| Guardar itens da Caixa por (1/7/30 dias) | **Não** | **Nenhum** | Só mostra um aviso; nada expira |
| Idioma | n/a | **Nenhum** | Mostra aviso e volta a português |
| Iniciar com o sistema | **Não** | **Nenhum** (0 leituras no código) | Recurso de app de computador; no navegador não existe |
| Continuar na bandeja | **Não** | **Nenhum** (0 leituras) | Idem |
| Fechar ao concluir (`autofinish`) | **Não** | **Nenhum** (0 leituras) | Interruptor sem função |
| Guardar histórico (`history`) | **Não** | **Nenhum** (0 leituras) | Desligar não impede o registro na Atividade |
| Verificar integridade ao receber (`verifyIn`) | **Não** | **Nenhum** (0 leituras) | Interruptor sem função |
| Gerar verificação de integridade (`verifyOut`) | **Não** | **Nenhum** (0 leituras) | Idem |
| Aceitar pedidos do link automaticamente | **Não** | Só no link simulado | — |

**Resumo:** 13 de 15 preferências **não persistem**; 8 são **interruptores ou seletores sem nenhum efeito**. Nenhum erro de console ao navegar pelas cinco telas.

Textos que hoje **afirmam o que não existe**: "Criptografia: toda transferência é criptografada… Sempre ativada" (não há transferência); "HTTPS com certificado próprio" e "Erasó v1 · WebRTC" no Inspetor (dados fixos); "Aparelhos verificados: N pareados" (contagem de aparelhos fictícios).

## 3. Dispositivos, dados e simulações acessíveis ao usuário

| Item | Onde | Situação |
|---|---|---|
| 7 aparelhos fictícios (Arara Atenta, Buriti Ágil, Tucano Leve, Pequi Firme, Jabuti Calmo, Sabiá Gentil, Tamanduá Sério) | `DEVICES` | Aparecem em "Meus aparelhos", "Por perto", Dispositivos, paleta de comandos e Inspetor |
| 3 aparelhos de pareamento (Seriema Ágil, Lobo-guará Sereno, Capivara Tranquila) | `PAIR_POOL` | "Pareados" ao concluir qualquer código válido |
| Comportamentos encenados por aparelho | `busy`, `declines`, `requiresPin:'4821'`, `route`, `online` | Respostas de envio escolhidas de antemão |
| Menu **Simular** (12 ações) e comando "Simular pedido de arquivos" na paleta | `.sim`, `toggleSim`, `commands()` | Botão flutuante visível em todas as telas |
| Pedidos de recebimento falsos | `openRequest`, `REQ_FILES`, `WEB_FILES` | Arquivos fictícios (Relatorio-ODS-4.pdf etc.) |
| Descoberta | `scan()` | Mostra aparelhos de uma lista fixa em tempos fixos |
| Envio e aceite | `sendTo()` | Aguarda 1,9 s e "aceita" sozinho |
| Transferência e progresso | `startTransfer`/`step` | Velocidade calculada (`total/38e6`), jitter aleatório, 100% garantido |
| Cancelar, falha e "tentar de novo" | `finish`, `retry` | Falha pré-programada para vídeo > 300 MB; "tentar de novo" troca a rota por mágica |
| Histórico (Atividade) | `S.activity` | 3 entradas pré-carregadas + as simuladas; não persiste |
| Caixa | `S.inbox` | 3 itens pré-carregados; some ao recarregar; "expira em 6 dias" é texto fixo |
| Link de compartilhamento | `LINK_URL='https://192.168.0.14:48230'`, `linkArrive` | URL, QR Code e "visitantes" falsos |
| Pareamento | `PAIR`, `drawQR` | QR e código ilustrativos; "AAAAAA" força erro |
| Adicionar por endereço | `CODE_MAP`, `ADDR` | Códigos `#37`, `#21`… ligados a aparelhos fictícios |
| Diagnóstico | `CHECKS`, `DIAG`, `wait()` | Seis verificações com resultado programado; "corrigir firewall" não corrige nada |
| Inspetor / rede | `NET`, 22 IPs `192.168.*` fixos | Endereços, portas, protocolos e "visto agora" inventados |
| Registros técnicos | `techlog` | Mensagens de eventos que não aconteceram |

## 4. O que já é real e deve ser preservado

Tema e preferência de movimento (persistidos); escolher arquivos/pastas pelo sistema (nome, tamanho, tipo e miniatura são lidos de verdade); arrastar e soltar; colar texto/arquivos; copiar para a área de transferência; paleta de comandos, atalhos, acessibilidade, layout responsivo, identidade visual e animações.

## 5. Testes

- **Automatizados no projeto: nenhum** (não há `package.json`, nem arquivos de teste).
- Executados: a auditoria acima (`auditoria.mjs`) e, nas etapas anteriores, verificações de layout e links do site.
- Na correção, vou criar uma suíte de testes funcionais com navegador real (dois navegadores conversando) que cubra descoberta, envio, recebimento, cancelamento, histórico e persistência.

## 6. O que depende de infraestrutura que ainda não existe

| Funcionalidade | Precisa de |
|---|---|
| Descobrir aparelhos reais | Um ponto de encontro: navegador não varre a rede sozinho. Mínimo: servidor leve na rede local (ou na internet) onde os aparelhos se registram |
| Enviar/receber de verdade | Canal entre os aparelhos: WebRTC (direto, servidor só para sinalização) ou repasse pelo servidor |
| Rota remota (entre redes diferentes) | Servidor acessível pela internet (sinalização e, em muitos casos, retransmissão TURN) |
| Pareamento por código/QR entre redes | O mesmo servidor, mais identidade de aparelho |
| Caixa sincronizada entre aparelhos | Armazenamento no servidor (definir prazo e criptografia) |
| Compartilhar por link | Servidor que entregue o arquivo a quem abrir o endereço |
| Pasta de destino, iniciar com o sistema, bandeja | App de computador (Electron ou similar); **não existem no navegador** |
| Verificação de identidade real | Chaves por aparelho (par de chaves) e troca autenticada |

## 7. Proposta de correção (para sua aprovação)

**Fase 1 (sem infraestrutura nova):** persistir todas as preferências (localStorage), remover interruptores que não têm efeito possível no navegador ou ligá-los ao comportamento real, remover o menu Simular e todo código `REQ_FILES`/`WEB_FILES`/`openRequest` encenado, remover os 7+3 aparelhos fictícios, dados pré-carregados, PIN fixo, IPs fixos e afirmações falsas; Caixa e histórico passam a ser **do próprio aparelho** (IndexedDB/localStorage), vazios no início; estados vazios honestos ("Nenhum aparelho encontrado") com mensagens de erro reais.

**Fase 2 (infraestrutura mínima real):** um **servidor local em Node.js, sem dependências**, que serve o app e faz presença e sinalização na rede local. Aparelhos reais (navegadores abertos no endereço do servidor) aparecem em "Por perto" e trocam arquivos de verdade, com progresso, cancelamento e histórico reais, aceite pelo destinatário e PIN opcional real.

**Fora do alcance sem servidor na internet:** rota remota, pareamento entre redes, Caixa sincronizada. Eu removeria essas telas da interface até existir infraestrutura (e as documentaria como "planejado"), em vez de mantê-las simuladas.

## 8. Decisões necessárias

1. **Arquitetura da transferência** (Fase 2): direto entre aparelhos (WebRTC) ou repasse pelo servidor local.
2. **Recursos sem infraestrutura:** remover da interface ou manter visíveis marcados como indisponíveis.
3. **Escopo agora:** só a Fase 1, ou Fase 1 e 2 no mesmo ciclo.
