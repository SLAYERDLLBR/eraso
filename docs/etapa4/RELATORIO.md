# Etapa 4: relatório de preparação para publicação

> Data: 02/11/2026 · **Nada foi publicado.** Não foi criado repositório remoto, conta, serviço de hospedagem nem domínio. Tudo abaixo está pronto no computador, aguardando as aprovações da seção 6.

## 1. Resumo

| Subetapa | Situação | Entrega |
|---|---|---|
| 4.1 Testes antes da publicação | **Concluída**, com validação em aparelhos reais pendente | [RELATORIO_TESTES.md](RELATORIO_TESTES.md): 63 testes automatizados passando, bugs, roteiro de teste em aparelhos reais |
| 4.2 Repositório no GitHub | **Preparada**; licença Apache-2.0 aplicada; falta a identidade dos *commits* | README, CONTRIBUTING, SECURITY, `.gitignore`, `.env.example`, `git init` feito, **sem commits** |
| 4.3 Primeira hospedagem | **Preparada** (código, configuração e guia); publicação depende de você | Servidor público com salas, [HOSPEDAGEM.md](HOSPEDAGEM.md), `Dockerfile`, `render.yaml` |
| 4.4 Acabamento da landing | **Concluída no que depende só do código**; dados institucionais pendentes | Site reescrito para refletir o produto real, capturas reais, metadados, links verificados |

## 2. O que mudou no produto

Para que o ERASÓ funcione **fora da rede local** sem expor ninguém, o servidor ganhou:

- **Salas com código** (8 a 32 letras minúsculas e números; o app gera 10 aleatórios) e link de convite. No modo público, a sala é obrigatória e isola os aparelhos.
- **Token por aparelho** para sinalizar e alterar presença.
- **STUN** padrão e **TURN** opcional por variável de ambiente, entregues em `/api/config`.
- **Limites** por IP, por sala e de tamanho; verificação de `Origin`; CSP e demais cabeçalhos; `/saude`.
- **Pastas públicas restritas** a `landing/` e `app/`.
- Aplicativo: tela "Entre numa sala", controles de sala em Configurações, convite por link.

O modo local (padrão, `npm start`) continua igual: rede local, sala opcional.

## 3. Organização do repositório (4.2)

- O aplicativo passou de `docs/design/prototype/` para **`app/`**, e o servidor passou a servir `/app/` (os links do site e os testes foram atualizados).
- Criados: `README.md` (português, com arquitetura, instalação, execução, testes, limitações), `CONTRIBUTING.md`, `SECURITY.md`, `.gitignore`, `.env.example`, `Dockerfile`, `render.yaml`, `docs/design/LEIA-ME.md` (avisa quais trechos dos documentos de design descrevem recursos não construídos).
- **Fora do repositório** (`.gitignore`): capturas de referência do LocalSend e comparações, capturas intermediárias do site, vídeo-fonte duplicado e a versão antiga do vídeo. O repositório fica com poucos megabytes (menos de 10 MB).
- Verificação de segredos: nenhum encontrado.
- `git init` feito no ramo `main`. **Não há commits**: veja o item 2 da seção 6.

## 4. Landing page (4.4)

**Conteúdo.** O site inteiro descrevia o protótipo simulado (pareamento, rota remota, envio por link, Caixa sincronizada, "dados simulados"). Foram reescritos, conforme o que existe: página inicial, Como funciona, Documentação, Privacidade (v0.2, com o fluxo real de dados do servidor, STUN e sinalização), Segurança, Sobre, Código-fonte, Projeto acadêmico, Termos (v0.2), ODS e Contato. Cada recurso inexistente aparece como "Não existe", não como promessa.

**Mídia.** As quatro capturas do site foram **regeneradas a partir do aplicativo real** (dois navegadores reais, servidor real, transferência real em andamento) por `docs/etapa4/tools/capturar-landing.mjs`. O **vídeo de demonstração foi retirado do site**: ele mostrava aparelhos e telas fictícios (pareamento, rota remota) que não existem. Precisa ser regravado com o aplicativo real, se você quiser vídeo (o arquivo antigo está em `docs/video/versao-landing-antiga/`, fora do repositório).

**Revisão técnica.** Títulos e descrições únicos por página, metadados Open Graph/Twitter, um `h1` por página, links verificados (430 recursos internos servidos pelo servidor público), 55 combinações de página e largura sem rolagem horizontal e sem erro de console, CSP sem violações.

**Não alterado:** identidade visual, tipografia, espaçamento e componentes do site. A revisão visual fina (hierarquia, espaçamento) não encontrou o que corrigir além do conteúdo.

**Pendências do site (dependem de você ou da instituição):**

- Dados institucionais: curso, orientação docente, equipe, período, ODS e metas, encarregado de dados, canais de contato, controlador. Seguem como **[a definir]** visível. Nenhum foi inventado.
- Autorização para usar o nome e o logotipo da Cruzeiro do Sul Virtual.
- Endereço do repositório e licença do código.
- Domínio: `canonical`, `og:url`, `og:image` (exigem endereço absoluto), `sitemap.xml` e `robots.txt` só fazem sentido com o endereço final.
- Fontes: hoje vêm do Google Fonts (revela o IP ao Google; está declarado na Privacidade). Hospedá-las junto com o site elimina isso, mas exige baixar os arquivos das fontes.
- Acessibilidade: meta WCAG 2.2 AA **não auditada** com leitor de tela.
- Revisão jurídica da Privacidade e dos Termos.

## 5. Problemas conhecidos

- Sem TURN, redes restritas e parte dos dados móveis não conectam. O quanto isso afeta só se descobre testando em redes reais.
- Testes automáticos só em Chromium.
- Plano gratuito de hospedagem hiberna; as salas se perdem ao hibernar.
- O servidor guarda presença em memória: uma única instância.
- Os documentos em `docs/design/` e os relatórios das etapas 1 a 3 mantêm o texto original, com um aviso em `docs/design/LEIA-ME.md`.

## 6. Aprovações e decisões que preciso de você

1. ~~Licença do código~~ **Decidida: Apache-2.0** (arquivos `LICENSE` e `NOTICE`). Ainda falta definir o **titular dos direitos autorais** e a titularidade da **marca** (nome e logotipo ficam fora da licença).
2. **Identidade dos *commits*.** Preciso do nome e do e-mail que aparecerão no histórico público. Sugestão: o e-mail "noreply" do GitHub, para não expor o seu e-mail pessoal (o histórico é permanente). Com isso, faço um histórico limpo em poucos *commits* temáticos.
3. **Repositório.** Não há conector do GitHub neste ambiente, nem a ferramenta `gh`. Você cria o repositório vazio (público ou privado) e me passa o endereço; ou instalamos a `gh` e você autoriza o acesso. Só envio o código depois do seu "sim" explícito, porque tornar público é irreversível na prática.
4. **Hospedagem.** Render (gratuito, via `render.yaml`) ou Railway (existe conector MCP, que você precisaria conectar). Quem cria a conta é você.
5. **TURN:** decidir depois do teste entre redes diferentes (item 9 do roteiro).
6. **Vídeo:** regravar com o aplicativo real, ou publicar o site sem vídeo.

## 7. Próximos passos sugeridos

1. Você faz o roteiro da seção 5 do relatório de testes (celular e computador).
2. Decisões 1 a 3 acima, e eu faço o histórico limpo do repositório.
3. Publicação de teste (privada ou com aviso de teste), validação entre redes diferentes com seu irmão e, conforme o resultado, TURN.
4. Preencher os "[a definir]" do site e só então divulgar publicamente.
