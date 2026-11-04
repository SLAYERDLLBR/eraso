# Aplicativo web do ERASÓ

Aplicativo web (HTML/CSS/JS puros, sem dependências) que envia arquivos, textos e links **entre aparelhos reais na mesma rede**. Não existe nenhum aparelho, pedido, histórico ou transferência fictícios: o que aparece na tela é o estado verdadeiro da conexão.

## Como usar

**Sem servidor** (por exemplo, no GitHub Pages): abra o `index.html` nos dois aparelhos e use **Parear aparelho**. Um aparelho gera um código (QR Code, link ou texto), o outro o aplica e devolve uma resposta; depois disso os arquivos vão direto de um para o outro. O aplicativo percebe sozinho que não há servidor (a rota `/api/config` não existe).

**Com servidor** (descoberta automática): veja abaixo.

## Como executar o servidor

O servidor é opcional. Requer Node.js 18 ou superior, na raiz do projeto:

```bash
node server/servidor.mjs
```

Ele escreve no terminal os endereços da rede, por exemplo `http://192.168.0.12:8780/app/index.html`. **Abra o mesmo endereço em cada aparelho**, no mesmo Wi-Fi. Cada navegador aparece na lista "Por perto" dos outros.

- **Salas:** em um servidor público (`npm run start:publico`), cada aparelho entra numa sala com código e só vê os da mesma sala; no servidor local, a sala é opcional. Crie uma sala em Configurações ou na tela inicial e envie o link de convite ao outro aparelho.
- O servidor só apresenta os aparelhos uns aos outros (presença e sinalização). **Arquivos e textos não passam por ele**: vão direto de um navegador ao outro por um canal WebRTC criptografado.
- Por segurança, aceita apenas conexões da rede local. `--aberto` libera conexões de fora (não recomendado).
- Sem o servidor, o aplicativo abre e mostra "Sem conexão com o servidor local".

Para pular a introdução do primeiro uso: `…/index.html?sem-intro`.

## O que funciona

| Área | Comportamento real |
|---|---|
| Descoberta | Lista os navegadores conectados e visíveis; some quando o outro fecha a página ou fica oculto. Cada aparelho é identificado pelo **nome real** (modelo ou sistema, navegador e fim do ID, ex.: `Windows · Edge · B797`; o modelo só aparece onde o navegador o informa, como no Android) e pelo **ID**. O campo de busca filtra por nome, ID, sistema ou tipo |
| Enviar | Arquivos, pastas, mídia, texto e link; modo *Um destino* e *Vários*; arrastar e soltar sobre a janela ou sobre um aparelho; colar com Ctrl/⌘+V |
| Receber | Pedido com quem envia e o que vem; aceitar, recusar, pular ou renomear itens; recebimento automático opcional (favoritos ou qualquer aparelho); os arquivos são salvos pela pasta de downloads do navegador |
| PIN | Opcional; conferido pelo destino; 3 erros bloqueiam por 1 minuto |
| Transferência | Progresso, velocidade e tempo restante medidos; cancelar nos dois lados; falhas com a mensagem real; "Tentar de novo" |
| Integridade | Opcional; CRC32 de cada arquivo conferido no destino |
| Atividade | Registro do que aconteceu neste aparelho, guardado no navegador; busca, filtros e limpeza |
| Caixa | Textos, links e arquivos guardados neste aparelho (IndexedDB); fixar, excluir, expirar (1, 7 ou 30 dias) |
| Favoritos | Guardados no navegador; ficam na lista como "offline" quando o aparelho some |
| Configurações | Tudo é salvo no navegador e aplicado na hora |
| Diagnóstico | Verifica navegador, servidor, visibilidade, aparelhos e conexão direta (com latência) |
| Acessibilidade | Temas claro, escuro e alto contraste, movimento reduzido, teclado e paleta de comandos |

## Limites conhecidos

- O arquivo recebido fica na memória do navegador até terminar; o limite é de 2 GB por pedido.
- A conexão direta depende da rede permitir tráfego entre os aparelhos. Redes com "isolamento de clientes" (comum em Wi-Fi de instituições e redes de convidados) impedem a conexão; o diagnóstico mostra o erro.
- O navegador escolhe a pasta de salvamento; não há seletor de pasta.
- Navegadores não revelam o nome da máquina (ex.: "PC-da-Ana"): o nome de fábrica usa modelo/sistema, navegador e ID, e pode ser trocado em Configurações.
- Uma aba por navegador: abrir o ERASÓ em duas abas do mesmo navegador usa o mesmo aparelho, e a aba antiga é desconectada.
- Chrome, Edge, Firefox e Safari atuais. O endereço usa HTTP; recursos que exigem HTTPS (como ler a área de transferência por botão) podem pedir Ctrl/⌘+V.

## Não existe (depende de infraestrutura que ainda não há)

Rota remota entre redes diferentes, pareamento entre redes, Caixa sincronizada entre aparelhos, compartilhar por link para quem não tem o app, verificação de identidade por símbolos, aplicativo de computador (iniciar com o sistema, bandeja, seletor de pasta). Estas telas foram removidas; veja [docs/etapa3/RELATORIO.md](../docs/etapa3/RELATORIO.md).

## Testes

```bash
npm test                   # servidor, rede, interface e ponta a ponta no modo público
node tests/app.test.mjs    # só a interface completa, 2 navegadores reais
```

Exigem o Microsoft Edge (ou defina `EDGE` com o caminho de outro navegador Chromium).

## Provisórios

- **Símbolo vetorial**: traçado à mão a partir do PNG oficial. Precisa do SVG oficial com camadas (D11).
- **Letreiro invertido** (`assets/letreiro-invertido.png`): recolorido do PNG oficial.
- As fontes vêm do Google Fonts (precisa de internet).
