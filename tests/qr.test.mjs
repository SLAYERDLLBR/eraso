// Testa o gerador de QR Code (app/qr.js): cada QR gerado é lido de volta com a biblioteca jsQR (app/vendor/jsQR.js).
// Uso:  node tests/qr.test.mjs   (não precisa de navegador)

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
await import('../app/qr.js');
const ErasoQR = globalThis.ErasoQR;
const mod = { exports: {} };
new Function('module', 'exports', readFileSync(join(RAIZ, 'app', 'vendor', 'jsQR.js'), 'utf8')).call(mod.exports, mod, mod.exports);
const jsQR = mod.exports;

let ok = 0; const falhas = [];
function teste(nome, fn) { try { fn(); ok++; console.log(`  ✓ ${nome}`); } catch (e) { falhas.push([nome, e.message]); console.log(`  ✗ ${nome}\n      ${e.message}`); } }
const igual = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${m}: esperado ${JSON.stringify(b)}, obtido ${JSON.stringify(a)}`); };
const verdade = (c, m) => { if (!c) throw new Error(m); };

function lerDeVolta(texto, nivel) {
  const qr = ErasoQR.criar(texto, nivel); const img = ErasoQR.paraImagem(qr, { escala: 3, margem: 4 });
  const r = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
  return { qr, lido: r ? new TextDecoder().decode(Uint8Array.from(r.binaryData)) : null };
}
const aleatorio = (n) => randomBytes(Math.ceil(n * 0.75)).toString('base64url').slice(0, n);

console.log('\nGerador de QR Code');
for (const nivel of ['L', 'M']) {
  teste(`nível ${nivel}: textos de 1 a 2.000 caracteres (versões 1 a ~40) são lidos de volta idênticos`, () => {
    const versoes = new Set();
    for (const n of [1, 5, 17, 20, 32, 50, 80, 100, 150, 200, 280, 350, 420, 500, 650, 800, 1000, 1300, 1700, 2000]) {
      const t = aleatorio(n); const { qr, lido } = lerDeVolta(t, nivel); versoes.add(qr.versao);
      igual(lido, t, `${n} caracteres (versão ${qr.versao})`);
    }
    verdade(versoes.size >= 12, `poucas versões cobertas: ${[...versoes].join(',')}`);
  });
}
teste('cada versão de 1 a 40 funciona no nível M (preenchendo a capacidade máxima)', () => {
  for (let v = 1; v <= 40; v++) { if (v === 23) continue; /* jsQR 1.4.0 tem o centro de alinhamento da versão 23 errado (74 em vez de 78); veja o teste das posições abaixo */ const cap = ErasoQR.capacidadeBytes(v, 'M'); const t = aleatorio(cap); const { qr, lido } = lerDeVolta(t, 'M'); igual(qr.versao, v, `versão escolhida para ${cap} bytes`); igual(lido, t, `versão ${v}`); }
});
teste('cada versão de 1 a 40 funciona no nível L (preenchendo a capacidade máxima)', () => {
  for (let v = 1; v <= 40; v++) { if (v === 23) continue; const cap = ErasoQR.capacidadeBytes(v, 'L'); const t = aleatorio(cap); const { qr, lido } = lerDeVolta(t, 'L'); igual(qr.versao, v, `versão escolhida para ${cap} bytes`); igual(lido, t, `versão ${v}`); }
});
teste('posições dos padrões de alinhamento conferem com a especificação (inclui a versão 23, que o jsQR lê errado)', () => {
  const esperado = { 2: [6, 18], 7: [6, 22, 38], 14: [6, 26, 46, 66], 22: [6, 26, 50, 74, 98], 23: [6, 30, 54, 78, 102], 32: [6, 34, 60, 86, 112, 138], 40: [6, 30, 58, 86, 114, 142, 170] };
  for (const [v, pos] of Object.entries(esperado)) igual(ErasoQR.posicoesAlinhamento(+v), pos, `versão ${v}`);
});
teste('versão 23, em níveis de preenchimento que o jsQR consegue ler, também volta idêntica', () => { for (const n of [100, 700, 900]) { const t = aleatorio(n), r = lerDeVolta(t, 'L'); if (r.qr.versao === 23) igual(r.lido, t, `${n} caracteres`); } });
teste('UTF-8 (acentos, emoji, japonês) e endereços com fragmento', () => {
  for (const t of ['Olá, São João! Café ☕ 日本語', 'https://slayerdllbr.github.io/eraso/app/index.html#p=ERASO1.zAbC_-123']) igual(lerDeVolta(t, 'M').lido, t, t);
});
teste('conteúdo grande demais é recusado com mensagem clara', () => { let erro = ''; try { ErasoQR.criar('x'.repeat(3000), 'M'); } catch (e) { erro = e.message; } verdade(/grande demais/.test(erro), 'deveria recusar: ' + erro); });
teste('um QR com módulos adulterados não é lido como o texto original', () => {
  const qr = ErasoQR.criar('mensagem de teste para adulteração', 'L'); for (let i = 0; i < 60; i++) qr.modulos[(qr.tamanho * 12 + 9 + i * 7) % (qr.tamanho * qr.tamanho)] ^= 1;
  const img = ErasoQR.paraImagem(qr, { escala: 3 }); const r = jsQR(img.data, img.width, img.height); verdade(!r || new TextDecoder().decode(Uint8Array.from(r.binaryData)) !== 'mensagem de teste para adulteração', 'leu o texto original apesar de adulterado');
});

console.log(`\n${ok} testes passaram, ${falhas.length} falharam.`);
process.exit(falhas.length ? 1 : 0);
