// Verifica as páginas do site: links internos (arquivo e âncora), links externos,
// imagens sem alt, h1 duplicado, ids repetidos e alvos de aria-controls.
//
// Uso (na pasta landing):  node tools/verificar-links.mjs [--sem-externos]
// Sem dependências: só Node.js 18+.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname, resolve, extname, sep } from 'node:path';

const SITE = join(dirname(fileURLToPath(import.meta.url)), '..');
const semExternos = process.argv.includes('--sem-externos');
const pages = readdirSync(SITE).filter((f) => f.endsWith('.html')).sort();

const idsOf = (html) => [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const problems = [];
const externals = new Map();
let internalChecked = 0;

for (const page of pages) {
  const html = readFileSync(join(SITE, page), 'utf8');
  const body = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<!--[\s\S]*?-->/g, '');
  const ids = idsOf(body);

  // ids repetidos
  const seen = new Set();
  for (const id of ids) { if (seen.has(id)) problems.push(`${page}: id duplicado "${id}"`); seen.add(id); }
  // h1
  const h1 = (body.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) problems.push(`${page}: ${h1} elementos <h1> (esperado 1)`);
  // imagens sem alt
  for (const m of body.matchAll(/<img\b[^>]*>/g)) if (!/\salt=/.test(m[0])) problems.push(`${page}: <img> sem alt → ${m[0].slice(0, 70)}`);
  // aria-controls
  for (const m of body.matchAll(/aria-controls="([^"]+)"/g)) if (!seen.has(m[1])) problems.push(`${page}: aria-controls aponta para id inexistente "${m[1]}"`);
  // idioma e título
  if (!/<html lang="pt-BR">/.test(html)) problems.push(`${page}: falta lang="pt-BR"`);
  if (!/<title>[^<]+<\/title>/.test(html)) problems.push(`${page}: falta <title>`);

  // links e recursos
  for (const m of body.matchAll(/\s(?:href|src)="([^"]*)"/g)) {
    const url = m[1];
    if (!url || url.startsWith('mailto:') || url.startsWith('data:') || url.startsWith('javascript:')) continue;
    if (/^https:\/\/fonts\.(googleapis|gstatic)\.com$/.test(url)) continue; // preconnect: não é link de navegação
    if (/^https?:\/\//.test(url)) { (externals.get(url) ?? externals.set(url, []).get(url)).push(page); continue; }
    internalChecked++;
    const [pathAndQuery, frag] = url.split('#');
    const path = pathAndQuery.split('?')[0];
    const target = path === '' ? join(SITE, page) : resolve(SITE, path);
    if (!existsSync(target) || statSync(target).isDirectory()) { problems.push(`${page}: arquivo não encontrado → ${url}`); continue; }
    if (frag && extname(target) === '.html' && !target.split(sep).includes('app')) {
      const tIds = idsOf(readFileSync(target, 'utf8'));
      if (!tIds.includes(frag)) problems.push(`${page}: âncora inexistente → ${url}`);
    }
  }
}

// Âncora do protótipo (rotas por hash) — só conferimos que o arquivo existe; as rotas são tratadas em JS.
const extResults = [];
if (!semExternos) {
  for (const [url, from] of externals) {
    let status = 'falha de rede';
    try {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 15000);
      const r = await fetch(url, { method: 'GET', redirect: 'follow', signal: ctl.signal, headers: { 'user-agent': 'Mozilla/5.0 (verificador de links ERASÓ)' } });
      clearTimeout(t); status = String(r.status);
    } catch (e) { status = 'falha de rede'; }
    extResults.push([status, url, [...new Set(from)].join(', ')]);
  }
}

console.log(`Páginas verificadas: ${pages.length} (${pages.join(', ')})`);
console.log(`Links/recursos internos conferidos: ${internalChecked}`);
console.log(`Links externos distintos: ${externals.size}${semExternos ? ' (não verificados)' : ''}`);
for (const [s, u, f] of extResults) console.log(`  ${s.padEnd(13)} ${u}   [${f}]`);
console.log(problems.length ? `\nPROBLEMAS (${problems.length}):\n- ${problems.join('\n- ')}` : '\nNenhum problema encontrado nas verificações internas.');
process.exit(problems.length ? 1 : 0);
