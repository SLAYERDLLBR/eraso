/* ERASÓ · gerador de QR Code (modo byte, níveis de correção L e M, versões 1 a 40).
 *
 * Escrito para o projeto, sem dependências, a partir da especificação ISO/IEC 18004. A correção é conferida nos testes
 * (tests/qr.test.mjs), que leem de volta cada QR gerado com a biblioteca jsQR.
 *
 * Uso:  const qr = ErasoQR.criar('texto', 'M');   // { versao, tamanho, modulos: Uint8Array(tamanho*tamanho), nivel }
 *       ErasoQR.desenhar(canvas, qr, { escala: 6, margem: 4 });
 */
(function (raiz) {
  'use strict';

  // Codewords de correção por bloco e número de blocos, por versão (índice 0 não é usado) — tabelas da especificação.
  const ECC_POR_BLOCO = {
    L: [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    M: [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  };
  const BLOCOS = {
    L: [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    M: [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  };
  const BITS_NIVEL = { L: 1, M: 0 }; // bits de formato

  // ---------- aritmética em GF(256) e Reed-Solomon ----------
  const EXP = new Uint8Array(512), LOG = new Uint8Array(256);
  for (let i = 0, x = 1; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11d; }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  const mul = (a, b) => (a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]]);

  function divisorRS(grau) {
    let r = [1];
    for (let i = 0; i < grau; i++) { const n = new Array(r.length + 1).fill(0); for (let j = 0; j < r.length; j++) { n[j] ^= r[j]; n[j + 1] ^= mul(r[j], EXP[i]); } r = n; }
    return r.slice(1); // sem o coeficiente líder (1)
  }
  function restoRS(dados, divisor) {
    const r = new Array(divisor.length).fill(0);
    for (const b of dados) { const f = b ^ r.shift(); r.push(0); if (f !== 0) for (let i = 0; i < divisor.length; i++) r[i] ^= mul(divisor[i], f); }
    return r;
  }

  // ---------- geometria ----------
  const tamanhoDa = (v) => v * 4 + 17;
  function posicoesAlinhamento(v) {
    if (v === 1) return [];
    const n = Math.floor(v / 7) + 2, passo = v === 32 ? 26 : Math.ceil((v * 4 + 4) / (n * 2 - 2)) * 2;
    const r = [6]; for (let pos = tamanhoDa(v) - 7; r.length < n; pos -= passo) r.splice(1, 0, pos); return r;
  }
  function modulosDeDados(v) {
    let r = (16 * v + 128) * v + 64;
    if (v >= 2) { const n = Math.floor(v / 7) + 2; r -= (25 * n - 10) * n - 55; if (v >= 7) r -= 36; }
    return r;
  }
  const capacidadeBytes = (v, nivel) => { const total = Math.floor(modulosDeDados(v) / 8) - ECC_POR_BLOCO[nivel][v] * BLOCOS[nivel][v]; const bitsContagem = v <= 9 ? 8 : 16; return Math.floor((total * 8 - 4 - bitsContagem) / 8); };

  // ---------- codificação ----------
  function codewords(bytes, v, nivel) {
    const bits = []; const poe = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
    poe(4, 4); poe(bytes.length, v <= 9 ? 8 : 16); for (const b of bytes) poe(b, 8);
    const totalDados = Math.floor(modulosDeDados(v) / 8) - ECC_POR_BLOCO[nivel][v] * BLOCOS[nivel][v];
    poe(0, Math.min(4, totalDados * 8 - bits.length)); while (bits.length % 8) bits.push(0);
    const cw = []; for (let i = 0; i < bits.length; i += 8) { let x = 0; for (let j = 0; j < 8; j++) x = (x << 1) | bits[i + j]; cw.push(x); }
    for (let pad = 0xec; cw.length < totalDados; pad ^= 0xec ^ 0x11) cw.push(pad);
    return cw;
  }
  function entrelacar(dados, v, nivel) {
    const nBlocos = BLOCOS[nivel][v], ecc = ECC_POR_BLOCO[nivel][v], bruto = Math.floor(modulosDeDados(v) / 8);
    const curtos = nBlocos - (bruto % nBlocos), tamCurto = Math.floor(bruto / nBlocos);
    const blocos = [], div = divisorRS(ecc);
    for (let i = 0, k = 0; i < nBlocos; i++) { const dat = dados.slice(k, k + tamCurto - ecc + (i < curtos ? 0 : 1)); k += dat.length; const e = restoRS(dat, div); if (i < curtos) dat.push(0); blocos.push(dat.concat(e)); }
    const saida = [];
    for (let i = 0; i < blocos[0].length; i++) blocos.forEach((b, j) => { if (i !== tamCurto - ecc || j >= curtos) saida.push(b[i]); });
    return saida;
  }

  // ---------- matriz ----------
  function montar(v, nivel, cw) {
    const n = tamanhoDa(v), m = new Uint8Array(n * n), fn = new Uint8Array(n * n);
    const poe = (x, y, preto, funcao = true) => { if (x < 0 || y < 0 || x >= n || y >= n) return; m[y * n + x] = preto ? 1 : 0; if (funcao) fn[y * n + x] = 1; };
    // temporização
    for (let i = 0; i < n; i++) { poe(6, i, i % 2 === 0); poe(i, 6, i % 2 === 0); }
    // localizadores com separadores
    const loc = (cx, cy) => { for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const d = Math.max(Math.abs(dx), Math.abs(dy)); poe(cx + dx, cy + dy, d !== 2 && d !== 4); } };
    loc(3, 3); loc(n - 4, 3); loc(3, n - 4);
    // alinhamento
    const al = posicoesAlinhamento(v);
    for (let i = 0; i < al.length; i++) for (let j = 0; j < al.length; j++) { if ((i === 0 && j === 0) || (i === 0 && j === al.length - 1) || (i === al.length - 1 && j === 0)) continue; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) poe(al[i] + dx, al[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1); }
    // reservar formato e versão
    const formato = (mascara) => {
      const dados = (BITS_NIVEL[nivel] << 3) | mascara; let r = dados; for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537); const bits = ((dados << 10) | r) ^ 0x5412;
      const b = (i) => ((bits >>> i) & 1) !== 0;
      for (let i = 0; i <= 5; i++) poe(8, i, b(i)); poe(8, 7, b(6)); poe(8, 8, b(7)); poe(7, 8, b(8)); for (let i = 9; i < 15; i++) poe(14 - i, 8, b(i));
      for (let i = 0; i < 8; i++) poe(n - 1 - i, 8, b(i)); for (let i = 8; i < 15; i++) poe(8, n - 15 + i, b(i)); poe(8, n - 8, true);
    };
    formato(0);
    if (v >= 7) { let r = v; for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1f25); const bits = (v << 12) | r; for (let i = 0; i < 18; i++) { const bit = ((bits >>> i) & 1) !== 0, a = n - 11 + (i % 3), b = Math.floor(i / 3); poe(a, b, bit); poe(b, a, bit); } }
    // dados em zigue-zague
    let i = 0;
    for (let direita = n - 1; direita >= 1; direita -= 2) {
      if (direita === 6) direita = 5;
      for (let vert = 0; vert < n; vert++) for (let j = 0; j < 2; j++) {
        const x = direita - j, cima = ((direita + 1) & 2) === 0, y = cima ? n - 1 - vert : vert;
        if (!fn[y * n + x] && i < cw.length * 8) { m[y * n + x] = (cw[i >>> 3] >>> (7 - (i & 7))) & 1; i++; }
      }
    }
    return { n, m, fn, formato };
  }
  const MASCARAS = [(x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, (x, y) => x % 3 === 0, (x, y) => (x + y) % 3 === 0, (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0, (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0, (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0];
  function aplicar(mat, mascara) { const { n, m, fn } = mat; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!fn[y * n + x] && MASCARAS[mascara](x, y)) m[y * n + x] ^= 1; }
  function penalidade(mat) {
    const { n, m } = mat; let p = 0;
    const linha = (get) => { for (let a = 0; a < n; a++) { let corrida = 1; for (let b = 1; b < n; b++) { if (get(a, b) === get(a, b - 1)) { corrida++; if (corrida === 5) p += 3; else if (corrida > 5) p++; } else corrida = 1; } } };
    linha((a, b) => m[a * n + b]); linha((a, b) => m[b * n + a]);
    for (let y = 0; y < n - 1; y++) for (let x = 0; x < n - 1; x++) { const c = m[y * n + x]; if (c === m[y * n + x + 1] && c === m[(y + 1) * n + x] && c === m[(y + 1) * n + x + 1]) p += 3; }
    const padrao = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0], inverso = padrao.slice().reverse();
    const acha = (get) => { for (let a = 0; a < n; a++) for (let b = 0; b + 11 <= n; b++) { let ok1 = true, ok2 = true; for (let k = 0; k < 11; k++) { const val = get(a, b + k); if (val !== padrao[k]) ok1 = false; if (val !== inverso[k]) ok2 = false; } if (ok1) p += 40; if (ok2) p += 40; } };
    acha((a, b) => m[a * n + b]); acha((a, b) => m[b * n + a]);
    let pretos = 0; for (let i = 0; i < n * n; i++) pretos += m[i]; p += Math.floor(Math.abs(pretos * 20 - n * n * 10) / (n * n)) * 10;
    return p;
  }

  /** @param {string|Uint8Array} dados  @param {'L'|'M'} nivel */
  function criar(dados, nivel = 'M') {
    if (!ECC_POR_BLOCO[nivel]) throw new Error('Nível de correção não suportado: ' + nivel);
    const bytes = typeof dados === 'string' ? new TextEncoder().encode(dados) : dados;
    let v = 1; while (v <= 40 && capacidadeBytes(v, nivel) < bytes.length) v++;
    if (v > 40) throw new Error('Conteúdo grande demais para um QR Code.');
    const cw = entrelacar(codewords(Array.from(bytes), v, nivel), v, nivel);
    let melhor = null;
    for (let mascara = 0; mascara < 8; mascara++) {
      const mat = montar(v, nivel, cw); aplicar(mat, mascara); mat.formato(mascara);
      const p = penalidade(mat); if (!melhor || p < melhor.p) melhor = { p, mat, mascara };
    }
    return { versao: v, nivel, mascara: melhor.mascara, tamanho: melhor.mat.n, modulos: melhor.mat.m };
  }

  /** Desenha o QR em um canvas (preto sobre branco, com margem de silêncio). */
  function desenhar(canvas, qr, { escala = 6, margem = 4 } = {}) {
    const lado = (qr.tamanho + margem * 2) * escala; canvas.width = canvas.height = lado;
    const c = canvas.getContext('2d'); c.fillStyle = '#fff'; c.fillRect(0, 0, lado, lado); c.fillStyle = '#000';
    for (let y = 0; y < qr.tamanho; y++) for (let x = 0; x < qr.tamanho; x++) if (qr.modulos[y * qr.tamanho + x]) c.fillRect((x + margem) * escala, (y + margem) * escala, escala, escala);
    return canvas;
  }

  /** Imagem RGBA (para testes e leitura): mesma aparência do canvas. */
  function paraImagem(qr, { escala = 4, margem = 4 } = {}) {
    const lado = (qr.tamanho + margem * 2) * escala, dados = new Uint8ClampedArray(lado * lado * 4).fill(255);
    for (let y = 0; y < qr.tamanho; y++) for (let x = 0; x < qr.tamanho; x++) if (qr.modulos[y * qr.tamanho + x])
      for (let dy = 0; dy < escala; dy++) for (let dx = 0; dx < escala; dx++) { const o = (((y + margem) * escala + dy) * lado + (x + margem) * escala + dx) * 4; dados[o] = dados[o + 1] = dados[o + 2] = 0; }
    return { data: dados, width: lado, height: lado };
  }

  const api = { criar, desenhar, paraImagem, capacidadeBytes, posicoesAlinhamento };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else raiz.ErasoQR = api;
})(typeof window !== 'undefined' ? window : globalThis);
