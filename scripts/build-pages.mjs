// Monta o site estático (landing/) em uma pasta de saída para publicar no GitHub Pages.
//
// Uso:  node scripts/build-pages.mjs [pasta-de-saida]        (padrão: _site)
//
// Variáveis de ambiente (todas opcionais):
//   SITE_URL      endereço público do site, sem barra final (ex.: https://usuario.github.io/eraso). Com ele, as páginas
//                 ganham <link rel="canonical">, og:url e og:image, e o build gera sitemap.xml e robots.txt.
//   HOSPEDAGEM=cloudflare (ou a opção --cloudflare)  Para a Cloudflare Pages. Neste modo, o build também escreve o arquivo _headers (a Cloudflare Pages aplica
//                 cabeçalhos HTTP; o GitHub Pages não): política de conteúdo, nosniff, HSTS etc., como no servidor próprio. O site em si é o mesmo.
//   ERASO_SERVIDOR_URL  endereço do serviço de presença e sinalização na nuvem (Cloudflare, veja cloudflare/README.md). Sem ele, vale
//                 o que estiver em app/config.js. Com ele, o aplicativo encontra aparelhos sozinho (mesmo Wi-Fi ou sala).
//   ERASO_APP_URL endereço público de um servidor do ERASÓ (opcional). Os botões "Acessar o ERASÓ" passam a apontar para ele.
//                 Sem ele, apontam para o aplicativo publicado junto com o site (app/), que funciona sem servidor: os aparelhos
//                 se encontram por pareamento com código (QR Code, link ou texto).
//
// O site usa apenas links relativos, então funciona em qualquer subcaminho (usuario.github.io/eraso/) sem "base path".
// Não há roteamento no navegador: cada página é um arquivo .html real, e 404.html cobre endereços inexistentes.
// O aplicativo (app/) vai junto, sem alterações, e detecta sozinho que não há servidor (a rota /api/config responde 404).

import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGEM = join(RAIZ, 'landing');
const CLOUDFLARE = process.env.HOSPEDAGEM === 'cloudflare' || process.argv.includes('--cloudflare');
const SAIDA = join(RAIZ, process.argv.slice(2).find((a) => !a.startsWith('--')) || '_site');
const SITE_URL = (process.env.SITE_URL || '').replace(/\/+$/, '');
const APP_URL = (process.env.ERASO_APP_URL || '').trim();
const BASE = SITE_URL ? new URL(SITE_URL).pathname.replace(/\/+$/, '') : '';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

if (APP_URL && !/^https:\/\//.test(APP_URL)) throw new Error('ERASO_APP_URL precisa começar com https://');
const configApp = readFileSync(join(RAIZ, 'app', 'config.js'), 'utf8');
const SERVIDOR = (process.env.ERASO_SERVIDOR_URL || (/servidor:\s*'([^']*)'/.exec(configApp) || [])[1] || '').trim().replace(/\/+$/, '');
if (SERVIDOR && !/^https:\/\/[a-z0-9.-]+(:\d+)?$/i.test(SERVIDOR)) throw new Error('ERASO_SERVIDOR_URL precisa ser um endereço https:// sem caminho (ex.: https://eraso-sinal.exemplo.workers.dev)');

rmSync(SAIDA, { recursive: true, force: true });
mkdirSync(SAIDA, { recursive: true });
// tools/ é código de geração do site; não é publicado
cpSync(ORIGEM, SAIDA, { recursive: true, filter: (origem) => !/[\\/]tools([\\/]|$)/.test(origem) });
cpSync(join(RAIZ, 'app'), join(SAIDA, 'app'), { recursive: true });
writeFileSync(join(SAIDA, '.nojekyll'), '');

const paginas = readdirSync(SAIDA).filter((f) => f.endsWith('.html')).sort();

/** O Pages não permite definir cabeçalhos; a política de conteúdo do aplicativo vai em <meta>. Espelha a do servidor (server/servidor.mjs). */
const CONECTAR = SERVIDOR ? `'self' ${SERVIDOR} ${SERVIDOR.replace(/^https/, 'wss')}` : "'self'";
const CSP_APP = `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob:; media-src 'self' blob:; connect-src ${CONECTAR}; base-uri 'none'; form-action 'self'; object-src 'none'`;
if (process.env.ERASO_SERVIDOR_URL) writeFileSync(join(SAIDA, 'app', 'config.js'), configApp.replace(/servidor:\s*'[^']*'/, `servidor: '${SERVIDOR}'`), 'utf8');
const appIndex = join(SAIDA, 'app', 'index.html');
writeFileSync(appIndex, readFileSync(appIndex, 'utf8').replace('<head>', `<head>\n<meta http-equiv="Content-Security-Policy" content="${CSP_APP}">`), 'utf8');
let linksReescritos = 0;

/** Os botões do site apontam para ../app/index.html (válido quando o servidor do ERASÓ serve o site). Aqui não existe /app/. */
function reescreverLinksDoApp(html) {
  return html.replace(/href="\.\.\/app\/index\.html([^"]*)"/g, (_, sufixo) => {
    linksReescritos++;
    if (!APP_URL) return `href="app/index.html${sufixo}"`;
    const u = new URL(APP_URL);
    const q = sufixo.match(/^(\?[^#]*)?(#.*)?$/) || [];
    if (q[1] && !u.search) u.search = q[1];
    if (q[2]) u.hash = q[2];
    return `href="${esc(u.toString())}"`;
  });
}

function acrescentarMetadados(html, arquivo) {
  if (!SITE_URL) return html;
  const url = `${SITE_URL}/${arquivo === 'index.html' ? '' : arquivo}`;
  const imagem = `${SITE_URL}/assets/app/app-desktop-claro.png`;
  const tags = `<link rel="canonical" href="${esc(url)}">\n<meta property="og:url" content="${esc(url)}">\n<meta property="og:image" content="${esc(imagem)}">\n<meta property="og:image:alt" content="Aplicativo do ERASÓ no computador: tela Compartilhar">\n<meta name="twitter:card" content="summary_large_image">\n`;
  return html.replace('<meta name="twitter:card" content="summary">\n', '').replace('</head>', `${tags}</head>`);
}

for (const arquivo of paginas) {
  const caminho = join(SAIDA, arquivo);
  writeFileSync(caminho, acrescentarMetadados(reescreverLinksDoApp(readFileSync(caminho, 'utf8')), arquivo), 'utf8');
}

// 404.html: o Pages o serve para qualquer endereço inexistente, em qualquer profundidade. Por isso usa caminhos absolutos a partir da base.
const modelo = readFileSync(join(SAIDA, 'index.html'), 'utf8');
const topo = modelo.slice(0, modelo.indexOf('<main'));
const rodape = modelo.slice(modelo.indexOf('<footer'));
const abs = (h) => h.replace(/(href|src)="(?!https?:|#|mailto:|\/)([^"]+)"/g, (_, a, v) => `${a}="${BASE}/${v}"`);
const naoEncontrada = `<main id="conteudo"><section class="section"><div class="container text-center">
<h1>Página não encontrada</h1>
<p class="subtitle">O endereço não existe neste site. Ele pode ter mudado ou ter sido digitado de forma incompleta.</p>
<div class="hero-ctas"><a href="${BASE}/index.html" class="btn btn-primary btn-lg">Ir para o início</a><a href="${BASE}/como-funciona.html" class="btn btn-secondary btn-lg">Ver como funciona</a></div>
</div></section></main>\n`;
const quatroZeroQuatro = abs(topo).replace(/<title>[^<]*<\/title>/, '<title>Página não encontrada · ERASÓ</title>').replace(/<link rel="canonical"[^>]*>\n?/, '').replace(/<meta property="og:url"[^>]*>\n?/, '') + naoEncontrada + abs(rodape);
writeFileSync(join(SAIDA, '404.html'), quatroZeroQuatro.replace('</head>', '<meta name="robots" content="noindex">\n</head>'), 'utf8');

if (SITE_URL) {
  const urls = [...paginas.map((f) => `${SITE_URL}/${f === 'index.html' ? '' : f}`), `${SITE_URL}/app/index.html`];
  writeFileSync(join(SAIDA, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${esc(u)}</loc></url>`).join('\n')}\n</urlset>\n`);
  writeFileSync(join(SAIDA, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
}

if (CLOUDFLARE) {
  const comum = ['X-Content-Type-Options: nosniff', 'Referrer-Policy: no-referrer', 'X-Frame-Options: SAMEORIGIN', 'Permissions-Policy: camera=(self), microphone=(), geolocation=()', 'Strict-Transport-Security: max-age=15552000'];
  // Scripts embutidos das páginas entram por hash (como em server/servidor.mjs); o aplicativo só aceita scripts do próprio endereço.
  const hashes = new Set();
  for (const f of paginas) for (const m of readFileSync(join(SAIDA, f), 'utf8').matchAll(/<script>([\s\S]*?)<\/script>/g)) hashes.add(`'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`);
  const cspSite = ["default-src 'self'", `script-src 'self' ${[...hashes].join(' ')}`.trim(), "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", 'font-src https://fonts.gstatic.com', "img-src 'self' data:", "media-src 'self'", "connect-src 'self'", "frame-ancestors 'self'", "base-uri 'none'", "form-action 'self'", "object-src 'none'"].join('; ');
  const cspApp = CSP_APP + "; frame-ancestors 'self'";
  const bloco = (caminho, extra = []) => `${caminho}\n${(caminho === '/*' ? [...comum, ...extra] : extra).map((l) => '  ' + l).join('\n')}\n`;
  // As regras se somam em caminhos que casam mais de uma vez; por isso a política do site não usa "/*" (ela bloquearia o aplicativo, que fala com o serviço na nuvem).
  const regras = [bloco('/*'), bloco('/app/*', [`Content-Security-Policy: ${cspApp}`]), bloco('/', [`Content-Security-Policy: ${cspSite}`])];
  for (const f of paginas.filter((x) => x !== 'index.html')) { regras.push(bloco('/' + f, [`Content-Security-Policy: ${cspSite}`])); regras.push(bloco('/' + f.replace(/\.html$/, ''), [`Content-Security-Policy: ${cspSite}`])); }
  regras.push(bloco('/index.html', [`Content-Security-Policy: ${cspSite}`]));
  writeFileSync(join(SAIDA, '_headers'), `# Gerado por scripts/build-pages.mjs (HOSPEDAGEM=cloudflare). Não edite à mão.\n${regras.join('\n')}`, 'utf8');
}

const restantes = paginas.filter((f) => /(?:href|src)="\.\.\//.test(readFileSync(join(SAIDA, f), 'utf8')));
if (restantes.length) throw new Error(`Links para fora do site em: ${restantes.join(', ')}`);
if (!existsSync(join(SAIDA, 'index.html'))) throw new Error('index.html não foi gerado');

console.log(`Site montado em ${SAIDA}: ${paginas.length} páginas + 404.html, ${linksReescritos} links do aplicativo reescritos (${APP_URL ? 'para ' + APP_URL : 'para app/index.html'}), app/ incluído${CLOUDFLARE ? ', _headers da Cloudflare' : ''}, ${SERVIDOR ? 'serviço na nuvem: ' + SERVIDOR : 'sem serviço na nuvem (só pareamento por código)'}${SITE_URL ? `, base ${BASE || '/'}` : ''}.`);
