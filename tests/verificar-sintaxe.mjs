// Confere a sintaxe de todo o JavaScript do projeto (servidor, aplicativo, site e testes) sem executar nada.
// Uso:  node tests/verificar-sintaxe.mjs

import { readdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const PASTAS = ['server', 'app', 'cloudflare', 'scripts', 'landing', 'tests', 'docs'];
const IGNORAR = new Set(['node_modules', '.git']);

function arquivos(pasta) {
  const lista = [];
  for (const nome of readdirSync(pasta)) {
    if (IGNORAR.has(nome)) continue;
    const caminho = join(pasta, nome);
    if (statSync(caminho).isDirectory()) lista.push(...arquivos(caminho));
    else if (/\.(m?js)$/.test(nome)) lista.push(caminho);
  }
  return lista;
}

let total = 0; const falhas = [];
for (const pasta of PASTAS) {
  let lista; try { lista = arquivos(join(RAIZ, pasta)); } catch { continue; }
  for (const arq of lista) { total++; const r = spawnSync(process.execPath, ['--check', arq], { encoding: 'utf8' }); if (r.status !== 0) falhas.push(`${arq}\n${r.stderr}`); }
}
console.log(`${total - falhas.length} de ${total} arquivos JavaScript com sintaxe válida.`);
if (falhas.length) { console.error(falhas.join('\n')); process.exit(1); }
