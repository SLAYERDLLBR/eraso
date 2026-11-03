# Como contribuir com o ERASÓ

Obrigado pelo interesse. O ERASÓ é um projeto acadêmico de extensão e ainda está em evolução; contribuições são bem-vindas. Ao contribuir, você concorda que sua contribuição seja licenciada sob a [Apache License 2.0](LICENSE) do projeto (veja o [README](README.md#licença)).

## Antes de começar

1. Leia o [README](README.md) e a seção de [limitações](README.md#limitações).
2. Abra uma *issue* descrevendo o problema ou a ideia antes de uma mudança grande.
3. Mudanças que afetem **privacidade, segurança ou o que o aplicativo diz que faz** precisam de discussão prévia. O aplicativo só pode apresentar como real o que realmente acontece.

## Ambiente

Node.js 18 ou superior. Não há dependências para instalar.

```bash
npm start        # servidor local em http://localhost:8780/app/index.html
npm test         # as quatro suítes (exigem o Microsoft Edge)
```

## Princípios do código

- **Sem dependências.** HTML, CSS e JavaScript puros; servidor com módulos nativos do Node. Uma dependência nova só entra com justificativa clara.
- **Nada simulado.** Não adicione aparelhos, transferências, estados ou números fictícios, nem como exemplo. Se algo depende de infraestrutura que não existe, a interface não o oferece.
- **Mensagens honestas.** Erros mostram a causa real, em português claro.
- **Mesmo estilo do entorno.** Siga a nomenclatura e a densidade de comentários do arquivo que você está editando; o código e os textos da interface estão em português.
- **Design system.** Cores, tipografia e componentes seguem [docs/design](docs/design). Não altere a identidade visual sem discussão.
- **Acessibilidade.** Todo controle novo precisa funcionar pelo teclado, ter nome acessível e respeitar o tema de alto contraste e o movimento reduzido.

## Enviando uma mudança

1. Crie um ramo a partir de `main`.
2. Faça mudanças pequenas e focadas, com mensagem de *commit* no imperativo e em português (por exemplo, "Corrige cancelamento durante o envio").
3. Rode `npm test`. Se você corrigiu um defeito, inclua um teste que o reproduz.
4. Se mudou o site em `landing/`, edite os modelos em `landing/tools/paginas/` e rode `node landing/tools/gerar-paginas.mjs` e `npm run verificar-site`.
5. Abra o *pull request* explicando **o quê** e **por quê**, e o que foi testado (incluindo em quais aparelhos e navegadores).

## Segredos

Nunca faça *commit* de chaves, tokens, senhas ou arquivos `.env`. Use [.env.example](.env.example) como modelo. Para reportar uma vulnerabilidade, siga o [SECURITY.md](SECURITY.md), sem abrir *issue* pública.
