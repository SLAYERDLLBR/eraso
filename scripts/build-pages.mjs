// Monta o site estático (landing/) em uma pasta de saída para publicar no GitHub Pages.
//
// Uso:  node scripts/build-pages.mjs [pasta-de-saida]        (padrão: _site)
//
// Variáveis de ambiente (todas opcionais):
//   SITE_URL      endereço público do site, sem barra final (ex.: https://usuario.github.io/eraso). Com ele, as páginas
//                 ganham <link rel="canonical">, og:url e og:image, e o build gera sitemap.xml e robots.txt.
//   ERASO_APP_URL endereço público do aplicativo (servidor do ERASÓ). Os botões "Acessar o ERASÓ" passam a apontar para ele.
//                 Sem ele, apontam para a página aplicativo.html, que explica por que o aplicativo não roda em hospedagem
//                 estática e como executá-lo.
//
// O site usa apenas links relativos, então funciona em qualquer subcaminho (usuario.github.io/eraso/) sem "base path".
// Não há roteamento no navegador: cada página é um arquivo .html real, e 404.html cobre endereços inexistentes.

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGEM = join(RAIZ, 'landing');
const SAIDA = join(RAIZ, process.argv[2] || '_site');
const SITE_URL = (process.env.SITE_URL || '').replace(/\/+$/, '');
const APP_URL = (process.env.ERASO_APP_URL || '').trim();
const BASE = SITE_URL ? new URL(SITE_URL).pathname.replace(/\/+$/, '') : '';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

if (APP_URL && !/^https:\/\//.test(APP_URL)) throw new Error('ERASO_APP_URL precisa começar com https://');

rmSync(SAIDA, { recursive: true, force: true });
mkdirSync(SAIDA, { recursive: true });
// tools/ é código de geração do site; não é publicado
cpSync(ORIGEM, SAIDA, { recursive: true, filter: (origem) => !/[\\/]tools([\\/]|$)/.test(origem) });
writeFileSync(join(SAIDA, '.nojekyll'), '');

const paginas = readdirSync(SAIDA).filter((f) => f.endsWith('.html')).sort();
let linksReescritos = 0;

/** Os botões do site apontam para ../app/index.html (válido quando o servidor do ERASÓ serve o site). Aqui não existe /app/. */
function reescreverLinksDoApp(html) {
  return html.replace(/href="\.\.\/app\/index\.html([^"]*)"/g, (_, sufixo) => {
    linksReescritos++;
    if (!APP_URL) return 'href="aplicativo.html"';
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
  const urls = paginas.map((f) => `${SITE_URL}/${f === 'index.html' ? '' : f}`);
  writeFileSync(join(SAIDA, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${esc(u)}</loc></url>`).join('\n')}\n</urlset>\n`);
  writeFileSync(join(SAIDA, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
}

const restantes = paginas.filter((f) => /(?:href|src)="\.\.\//.test(readFileSync(join(SAIDA, f), 'utf8')));
if (restantes.length) throw new Error(`Links para fora do site em: ${restantes.join(', ')}`);
if (!existsSync(join(SAIDA, 'index.html'))) throw new Error('index.html não foi gerado');

console.log(`Site montado em ${SAIDA}: ${paginas.length} páginas + 404.html, ${linksReescritos} links do aplicativo reescritos (${APP_URL ? 'para ' + APP_URL : 'para aplicativo.html'})${SITE_URL ? `, base ${BASE || '/'}` : ''}.`);
