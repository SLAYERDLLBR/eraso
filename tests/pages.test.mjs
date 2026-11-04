// Testa o build do GitHub Pages (scripts/build-pages.mjs): serve o resultado sob um subcaminho (/eraso/), como em
// usuario.github.io/eraso/, e confere que toda página, imagem, folha de estilo e script carrega e que nenhum link
// aponta para fora do site. Uso:  node tests/pages.test.mjs   (não precisa de navegador)

import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const SAIDA = '_site-teste';
const PASTA = join(RAIZ, SAIDA);
const BASE = '/eraso';
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain' };

let ok = 0; const falhas = [];
async function teste(nome, fn) { try { await fn(); ok++; console.log(`  ✓ ${nome}`); } catch (e) { falhas.push([nome, e.message]); console.log(`  ✗ ${nome}\n      ${e.message}`); } }
const igual = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${m}: esperado ${JSON.stringify(b)}, obtido ${JSON.stringify(a)}`); };
const verdade = (c, m) => { if (!c) throw new Error(m); };

function montar(env) {
  const r = spawnSync(process.execPath, [join(RAIZ, 'scripts', 'build-pages.mjs'), SAIDA], { env: { ...process.env, SITE_URL: '', ERASO_APP_URL: '', ...env }, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`build falhou: ${r.stderr || r.stdout}`);
  return r.stdout;
}

/** Serve PASTA sob BASE e responde 404.html, como o GitHub Pages. */
function servir() {
  const srv = createServer((req, res) => {
    const url = new URL(req.url, 'http://x'); let caminho = decodeURIComponent(url.pathname);
    let arquivo = null;
    if (caminho === BASE || caminho === BASE + '/') caminho = BASE + '/index.html';
    if (caminho.startsWith(BASE + '/')) { const a = normalize(join(PASTA, caminho.slice(BASE.length + 1))); if (a.startsWith(PASTA + sep) && existsSync(a) && statSync(a).isFile()) arquivo = a; }
    if (arquivo) { res.writeHead(200, { 'content-type': MIME[extname(arquivo)] || 'application/octet-stream' }); return res.end(readFileSync(arquivo)); }
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' }); res.end(readFileSync(join(PASTA, '404.html')));
  });
  return new Promise((r) => srv.listen(0, '127.0.0.1', () => r(srv)));
}

async function rastrear(origem) {
  const paginas = [...readdirSync(PASTA).filter((f) => f.endsWith('.html') && f !== '404.html'), 'app/index.html'];
  const problemas = []; let verificados = 0;
  for (const p of paginas) {
    const html = readFileSync(join(PASTA, p), 'utf8').replace(/<!--[\s\S]*?-->/g, '').replace(/<script>[\s\S]*?<\/script>/g, '');
    for (const m of html.matchAll(/(?<![\w-])(?:href|src|poster)="([^"]+)"/g)) {
      const u = m[1]; if (/^(https?:|mailto:|data:|#)/.test(u)) continue;
      verificados++;
      const r = await fetch(new URL(u, `${origem}${BASE}/${p}`)); if (r.status !== 200) problemas.push(`${p}: ${u} → ${r.status}`);
    }
  }
  return { paginas: paginas.length, verificados, problemas };
}

console.log('\nBuild do GitHub Pages');
try {
  await teste('o build sem servidor aponta os botões para o app publicado junto (app/) e não deixa links para fora do site', async () => {
    const saida = montar({ SITE_URL: `https://exemplo.github.io${BASE}` });
    verdade(/páginas \+ 404\.html/.test(saida), 'resumo do build ausente');
    const index = readFileSync(join(PASTA, 'index.html'), 'utf8');
    verdade(!/\.\.\/app\//.test(index), 'sobrou link para ../app/'); verdade(/href="app\/index\.html"/.test(index), 'botão não aponta para app/index.html'); verdade(existsSync(join(PASTA, 'app', 'index.html')) && existsSync(join(PASTA, 'app', 'vendor', 'jsQR.js')), 'app/ não foi incluído');
    for (const f of readdirSync(PASTA).filter((x) => x.endsWith('.html'))) verdade(!/(?:href|src)="\.\.\//.test(readFileSync(join(PASTA, f), 'utf8')), `${f} tem link para fora do site`);
    const app = readFileSync(join(PASTA, 'app', 'index.html'), 'utf8'); verdade(/http-equiv="Content-Security-Policy"/.test(app) && !/unsafe-eval/.test(app), 'o app deveria ter política de conteúdo em <meta>');
    verdade(!existsSync(join(PASTA, 'tools')), 'a pasta tools/ não deveria ser publicada'); verdade(existsSync(join(PASTA, '.nojekyll')), '.nojekyll ausente');
  });
  const srv = await servir(); const origem = `http://127.0.0.1:${srv.address().port}`;
  await teste('todas as páginas, imagens, estilos e scripts carregam sob o subcaminho /eraso/', async () => {
    const r = await rastrear(origem); verdade(r.paginas >= 11, `poucas páginas: ${r.paginas}`); verdade(r.verificados > 300, `poucos recursos verificados: ${r.verificados}`);
    igual(r.problemas, [], `recursos com problema (de ${r.verificados})`);
  });
  await teste('acesso direto às páginas internas funciona e endereço inexistente mostra a 404 com links que funcionam', async () => {
    for (const p of ['como-funciona.html', 'seguranca.html', 'aplicativo.html', 'app/index.html']) igual((await fetch(`${origem}${BASE}/${p}`)).status, 200, p);
    const r = await fetch(`${origem}${BASE}/nao/existe/mesmo`); igual(r.status, 404, 'status da 404'); const t = await r.text();
    verdade(/Página não encontrada/.test(t), 'texto da 404'); verdade(new RegExp(`href="${BASE}/index\\.html"`).test(t), 'a 404 deveria apontar para o início com caminho absoluto');
    for (const [, u] of t.matchAll(/(?:href|src)="(\/eraso\/[^"]+)"/g)) igual((await fetch(origem + u)).status, 200, `recurso da 404: ${u}`);
  });
  await teste('metadados de compartilhamento usam o endereço público e há sitemap e robots', async () => {
    const index = readFileSync(join(PASTA, 'index.html'), 'utf8');
    verdade(index.includes(`<link rel="canonical" href="https://exemplo.github.io${BASE}/">`), 'canonical'); verdade(index.includes(`og:image" content="https://exemplo.github.io${BASE}/assets/app/app-desktop-claro.png"`), 'og:image');
    verdade(/summary_large_image/.test(index) && !/content="summary"/.test(index), 'twitter:card');
    verdade(readFileSync(join(PASTA, 'sitemap.xml'), 'utf8').includes(`https://exemplo.github.io${BASE}/como-funciona.html`) && readFileSync(join(PASTA, 'sitemap.xml'), 'utf8').includes(`${BASE}/app/index.html`), 'sitemap'); verdade(/Sitemap: https:\/\/exemplo\.github\.io\/eraso\/sitemap\.xml/.test(readFileSync(join(PASTA, 'robots.txt'), 'utf8')), 'robots');
    verdade(!/rel="canonical"/.test(readFileSync(join(PASTA, '404.html'), 'utf8')), '404 não deve ter canonical');
  });
  srv.close();
  await teste('com o endereço do aplicativo definido, os botões apontam para ele (mantendo âncora) e exigem HTTPS', async () => {
    montar({ SITE_URL: `https://exemplo.github.io${BASE}`, ERASO_APP_URL: 'https://app.exemplo.test/app/index.html' });
    const doc = readFileSync(join(PASTA, 'contato.html'), 'utf8'); verdade(/href="https:\/\/app\.exemplo\.test\/app\/index\.html\?sem-intro#diagnostico"/.test(doc), 'link com âncora do diagnóstico');
    verdade(!/href="app\/index\.html"/.test(readFileSync(join(PASTA, 'index.html'), 'utf8')), 'ainda aponta para o app local');
    const r = spawnSync(process.execPath, [join(RAIZ, 'scripts', 'build-pages.mjs'), SAIDA], { env: { ...process.env, ERASO_APP_URL: 'http://inseguro.test' }, encoding: 'utf8' }); verdade(r.status !== 0, 'deveria recusar endereço sem HTTPS');
  });
} finally { rmSync(PASTA, { recursive: true, force: true }); }

console.log(`\n${ok} testes passaram, ${falhas.length} falharam.`);
process.exit(falhas.length ? 1 : 0);
