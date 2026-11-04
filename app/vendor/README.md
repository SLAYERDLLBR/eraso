# Biblioteca incluída

| Arquivo | Origem | Versão | Licença |
|---|---|---|---|
| `jsQR.js` | <https://github.com/cozmo/jsQR>, obtida de `https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js` | 1.4.0 | Apache License 2.0 (`jsQR.LICENSE`) |

SHA-256 do arquivo incluído: `bc40c8a15196236b2314db0856f72ca0b49980cd5413b8c852a7349f5fee0859`. O arquivo **não foi alterado**.

**Para que serve:** ler QR Codes pela câmera (`pareamento.js`), porque Edge e Chrome no Windows não têm o leitor nativo (`BarcodeDetector`). Também é usada nos testes para ler de volta cada QR Code gerado por `app/qr.js`.

**Carregamento:** só quando o usuário aciona "Ler com a câmera"; nunca na abertura da página.

**Limitação conhecida:** a versão 1.4.0 tem o centro de alinhamento da versão 23 do QR Code errado (74 em vez de 78) e falha ao ler QR Codes dessa versão quase cheios. Os convites do ERASÓ ficam bem abaixo disso (versões 12 a 17, aproximadamente).

Para atualizar: baixe a nova versão, confira a licença, atualize esta tabela e rode `npm run test:qr`.
