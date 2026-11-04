/* ERASÓ · configuração do aplicativo.
 *
 * servidor: endereço do serviço de presença e sinalização na nuvem (Cloudflare; veja cloudflare/README.md).
 * Quando o aplicativo é aberto num site estático (GitHub Pages) e esse endereço está preenchido, os aparelhos se encontram
 * sozinhos: na mesma rede (Wi-Fi) ou numa sala com código. Vazio, o aplicativo usa só o pareamento por código.
 * Se o aplicativo for aberto a partir de um servidor do ERASÓ (npm start), o servidor da própria página tem prioridade.
 * O endereço é público por natureza (o navegador precisa dele): não coloque aqui nenhuma chave nem segredo.
 */
window.ERASO_CONFIG = { servidor: 'https://eraso-sinal.eraso.workers.dev' };
