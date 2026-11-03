# Política de segurança

## Como reportar uma vulnerabilidade

Não abra uma *issue* pública. Envie os detalhes de forma privada para **[contato a definir pela equipe]** (ou use o recurso de relato privado de vulnerabilidades do repositório, se estiver habilitado).

Inclua, se possível: o que foi observado, passos para reproduzir, navegador e sistema, e o impacto que você enxerga.

Este é um projeto acadêmico mantido por estudantes: não há prazo contratual de resposta, mas todo relato será lido e respondido assim que possível.

## O que o ERASÓ faz e não faz

- O conteúdo (arquivos e textos) trafega direto entre os navegadores, criptografado por WebRTC (DTLS). O servidor não o recebe nem o guarda.
- O servidor conhece, apenas em memória e enquanto o aparelho está conectado: nome, tipo, sistema e identificador do aparelho, e o código da sala.
- Quem conhece o código de uma sala pode entrar nela e ver os nomes dos aparelhos presentes. Trate o código como segredo e use um código novo para cada grupo.
- Não há contas, senhas nem banco de dados.

## Escopo

Dentro do escopo: o servidor (`server/`), o aplicativo (`app/`) e o site (`landing/`). Fora do escopo: ataques de negação de serviço volumétricos contra a hospedagem, e falhas em navegadores ou serviços de terceiros (STUN, TURN, Google Fonts).
