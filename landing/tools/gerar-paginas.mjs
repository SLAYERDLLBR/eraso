// Gera as páginas institucionais do ERASÓ a partir de tools/paginas/*.html
// e mantém cabeçalho e rodapé idênticos em TODAS as páginas (inclusive index.html).
//
// Uso (na pasta landing):  node tools/gerar-paginas.mjs
// Sem dependências: só Node.js 18+. Os .html gerados são versionados; este script é opcional
// e existe para que mudar o menu ou o rodapé exija editar um único lugar (a lista abaixo).
//
// Cada arquivo em tools/paginas/ começa com um comentário de metadados em JSON:
//   <!--meta {"file":"sobre.html","nav":"sobre","title":"...","lead":"...","desc":"..."} -->
// e o resto é o corpo da página (use <h2 id="..."> para entrar no índice automático).

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, '..');
const PAGES = join(HERE, 'paginas');

const APP = '../app/index.html';

// ---- Navegação principal (cabeçalho) ----------------------------------------
const NAV = [
  ['Sobre', 'sobre.html', 'sobre'],
  ['Como funciona', 'como-funciona.html', 'como-funciona'],
  ['Documentação', 'documentacao.html', 'documentacao'],
  ['Contato', 'contato.html', 'contato'],
];

// ---- Rodapé (colunas) -------------------------------------------------------
const FOOTER_COLS = [
  ['Produto', [
    ['Acessar o ERASÓ', APP],
    ['Como funciona', 'como-funciona.html'],
    ['Recursos', 'index.html#features'],
    ['Perguntas frequentes', 'index.html#faq'],
  ]],
  ['Projeto', [
    ['Sobre o ERASÓ', 'sobre.html'],
    ['Projeto acadêmico', 'projeto-academico.html'],
    ['ODS e impacto', 'ods.html'],
    ['Contato', 'contato.html'],
  ]],
  ['Legal e segurança', [
    ['Privacidade e LGPD', 'privacidade.html'],
    ['Termos de uso', 'termos.html'],
    ['Segurança', 'seguranca.html'],
  ]],
  ['Para desenvolvedores', [
    ['Documentação e guia', 'documentacao.html'],
    ['Código-fonte e GitHub', 'codigo-fonte.html'],
    ['Documentos técnicos', 'codigo-fonte.html#documentos'],
  ]],
];

// Trechos reutilizáveis (diagramas) em tools/parciais/NOME.html. No modelo, escreva <!--parcial:NOME-->;
// o gerador insere o conteúdo entre marcadores e, nas próximas execuções, atualiza o que está entre eles.
const PARCIAIS = join(HERE, 'parciais');
const parciais = (html) => html.replace(/<!--parcial:(\w+)-->(?:[\s\S]*?<!--\/parcial-->)?/g, (_, nome) => `<!--parcial:${nome}-->
${readFileSync(join(PARCIAIS, nome + '.html'), 'utf8').trim()}
<!--/parcial-->`);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const index = readFileSync(join(SITE, 'index.html'), 'utf8');
const SPRITE = index.match(/<svg width="0" height="0"[\s\S]*?<\/svg>/)[0];

function header(active, home) {
  const brand = home ? '#topo' : 'index.html';
  const links = NAV.map(([t, h, k]) => `<li><a href="${h}"${k === active ? ' aria-current="page"' : ''}>${t}</a></li>`).join('\n      ');
  const mobile = NAV.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join('\n      ');
  return `<header class="navbar" id="navbar">
  <nav class="container" aria-label="Principal">
    <a href="${brand}" class="logo" aria-label="ERASÓ — início">
      <svg class="symbol" viewBox="0 0 134 108" aria-hidden="true"><use href="#eraso-symbol"/></svg>
      <img class="wordmark wordmark-light" src="assets/letreiro.png" alt="ERASÓ">
      <img class="wordmark wordmark-dark" src="assets/letreiro-invertido.png" alt="ERASÓ">
    </a>
    <ul class="nav-links">
      ${links}
    </ul>
    <div class="nav-actions">
      <button class="theme-toggle" id="theme-toggle" aria-label="Alternar entre tema claro e escuro">
        <svg class="icon moon" aria-hidden="true"><use href="#i-moon"/></svg>
        <svg class="icon sun" aria-hidden="true"><use href="#i-sun"/></svg>
      </button>
      <div class="lang-switcher" id="lang">
        <button class="nav-action-btn" id="lang-btn" aria-label="Idioma: Português (Brasil)" aria-haspopup="listbox" aria-expanded="false" aria-controls="lang-dropdown">
          <span class="lang-label-long">Português (Brasil)</span><span class="lang-label-short">Português</span>
          <svg class="icon" aria-hidden="true"><use href="#i-chevron"/></svg>
        </button>
        <div class="lang-dropdown" id="lang-dropdown" hidden>
          <label class="lang-search"><svg class="icon" aria-hidden="true"><use href="#i-search"/></svg><span class="sr-only">Buscar idioma</span><input type="text" id="lang-search" placeholder="Buscar idioma…" autocomplete="off"></label>
          <div class="lang-list" role="listbox" aria-label="Idioma">
            <button class="lang-item" role="option" aria-selected="true" data-lang-name="Português (Brasil) Portuguese (Brazil)"><span><span class="lang-name">Português (Brasil)</span><span class="lang-en">Portuguese (Brazil)</span></span><svg class="icon" aria-hidden="true"><use href="#i-check"/></svg></button>
          </div>
          <p class="lang-empty" id="lang-empty" hidden>Nenhum idioma encontrado.</p>
        </div>
      </div>
      <a href="${APP}" class="btn btn-primary btn-sm hide-mobile">Acessar o app</a>
      <button class="mobile-toggle" id="menu-btn" aria-label="Abrir menu" aria-expanded="false" aria-controls="mobile-menu">
        <svg class="icon open" aria-hidden="true"><use href="#i-menu"/></svg>
        <svg class="icon close" aria-hidden="true"><use href="#i-close"/></svg>
      </button>
    </div>
  </nav>
  <div class="mobile-menu" id="mobile-menu" hidden>
    <ul class="mobile-nav-links">
      ${mobile}
    </ul>
    <a href="${APP}" class="btn btn-primary btn-block">Acessar o app</a>
  </div>
</header>`;
}

function footer(home) {
  const brand = home ? '#topo' : 'index.html';
  const cols = FOOTER_COLS.map(([h, items]) => `        <div class="footer-col">
          <h4>${h}</h4>
          <ul>
${items.map(([t, u]) => `            <li><a href="${u}">${t}</a></li>`).join('\n')}
          </ul>
        </div>`).join('\n');
  return `<footer class="footer section">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="${brand}" class="logo" aria-label="ERASÓ — voltar ao topo">
          <svg class="symbol" viewBox="0 0 134 108" aria-hidden="true"><use href="#eraso-symbol"/></svg>
          <img class="wordmark wordmark-light" src="assets/letreiro.png" alt="ERASÓ">
          <img class="wordmark wordmark-dark" src="assets/letreiro-invertido.png" alt="ERASÓ">
        </a>
        <p>Compartilhamento de arquivos, textos e links entre aparelhos. Projeto de extensão universitária em fase de protótipo funcional.</p>
      </div>
      <div class="footer-links">
${cols}
      </div>
    </div>
    <div class="footer-bottom">
      <div class="copyright">&copy; 2026 ERASÓ · Projeto de extensão universitária, Cruzeiro do Sul Virtual <span class="placeholder">[vínculo a confirmar]</span>.</div>
      <div class="attribution">Estrutura inspirada no <a href="https://github.com/localsend/website" target="_blank" rel="noopener">site do LocalSend</a>, sob <a href="https://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noopener" class="license-link">Apache License 2.0</a>.</div>
    </div>
  </div>
</footer>`;
}

function head(title, desc) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · ERASÓ</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="ERASÓ">
<meta property="og:locale" content="pt_BR">
<meta property="og:title" content="${esc(title)} · ERASÓ">
<meta property="og:description" content="${esc(desc)}">
<meta name="twitter:card" content="summary">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<script>
  // Tema antes da pintura (preferência salva ou do sistema)
  try {
    const t = localStorage.getItem('eraso-landing-theme');
    if (t === 'dark' || (!t && matchMedia('(prefers-color-scheme: dark)').matches)) document.documentElement.classList.add('dark');
  } catch (e) {}
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Lexend:wght@600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
</head>`;
}

function buildPage(meta, body) {
  const h2s = [...body.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g)].map((m) => [m[1], strip(m[2])]);
  const toc = meta.toc === false || h2s.length < 3 ? '' : `
      <nav class="toc" aria-labelledby="toc-title">
        <h2 id="toc-title">Nesta página</h2>
        <ol>
${h2s.map(([id, t]) => `          <li><a href="#${id}">${esc(t)}</a></li>`).join('\n')}
        </ol>
      </nav>`;
  const notice = meta.notice ? `
      <aside class="notice-box" aria-label="${esc(meta.notice.label)}">
        <strong class="label">${meta.notice.label}</strong>
        ${meta.notice.html}
      </aside>` : '';
  const badge = meta.badge ? `<p><span class="badge">${meta.badge}</span></p>` : '';
  return `${head(meta.title, meta.desc || meta.lead)}
<body>
${SPRITE}

<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>

${header(meta.nav, false)}

<main id="conteudo">
  <section class="page-header">
    <div class="container text-center">
      <nav class="breadcrumb" aria-label="Você está em">
        <ol><li><a href="index.html">Início</a></li><li aria-current="page">${esc(meta.title)}</li></ol>
      </nav>
      ${badge}
      <h1>${meta.h1 || esc(meta.title)}</h1>
      <p class="subtitle">${meta.lead}</p>
    </div>
  </section>
  <div class="page-body">
    <article class="container legal-content">${notice}${toc}
${parciais(body.trim())}
    </article>
  </div>
</main>

${footer(false)}

<script src="main.js"></script>
</body>
</html>
`;
}

// ---- Gera as páginas ---------------------------------------------------------
const out = [];
for (const f of readdirSync(PAGES).filter((x) => x.endsWith('.html')).sort()) {
  const raw = readFileSync(join(PAGES, f), 'utf8');
  const m = raw.match(/^<!--meta\s*([\s\S]*?)-->\s*/);
  if (!m) throw new Error(`${f}: faltam metadados (<!--meta {...} -->)`);
  const meta = JSON.parse(m[1]);
  writeFileSync(join(SITE, meta.file), buildPage(meta, raw.slice(m[0].length)), 'utf8');
  out.push(meta.file);
}

// ---- Atualiza cabeçalho e rodapé da página inicial -----------------------------
let home = readFileSync(join(SITE, 'index.html'), 'utf8');
const swap = (re, html, nome) => {
  if (!re.test(home)) throw new Error(`index.html: bloco "${nome}" não encontrado`);
  home = home.replace(re, () => html);
};
home = parciais(home);
swap(/<header class="navbar"[\s\S]*?<\/header>/, header(null, true), 'cabeçalho');
swap(/<footer class="footer section">[\s\S]*?<\/footer>/, footer(true), 'rodapé');
writeFileSync(join(SITE, 'index.html'), home, 'utf8');

console.log(`Geradas ${out.length} páginas: ${out.join(', ')} + cabeçalho/rodapé de index.html`);
