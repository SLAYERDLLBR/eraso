/* ERASÓ · tela de pareamento (modo sem servidor).
 *
 * Um aparelho gera um convite (QR Code, link e texto), o outro o aplica e mostra um código de resposta, que o primeiro lê
 * pela câmera ou cola. Os dados da conexão ficam no código; nada passa por servidor. A lógica da conexão está em rede.js
 * (Rede.criarConvite, Rede.responderConvite); aqui só há interface.
 *
 * Uso: const p = ErasoPareamento.criar({ REDE, openModal, closeModal, svgI, esc, toast, copiar, linkBase, aoLigar });
 *      p.abrir();  p.abrirComCodigo(codigo);
 */
(function () {
  'use strict';

  const URL_JSQR = new URL('vendor/jsQR.js', (document.currentScript && document.currentScript.src) || location.href).href;
  let carregando = null;
  function carregarJsQR() {
    if (window.jsQR) return Promise.resolve();
    if (!carregando) carregando = new Promise((ok, erro) => { const s = document.createElement('script'); s.src = URL_JSQR; s.onload = () => ok(); s.onerror = () => { carregando = null; erro(new Error('Não foi possível carregar o leitor de QR Code.')); }; document.head.appendChild(s); });
    return carregando;
  }

  function criar(d) {
    let atual = null;      // convite ou resposta em andamento
    let camera = null;     // { parar() }
    const raiz = () => document.querySelector('[data-modal]');
    const q = (sel) => raiz().querySelector(sel);
    const linkDe = (codigo) => `${d.linkBase()}#p=${codigo}`;

    function pararCamera() { if (camera) { camera.parar(); camera = null; } const a = raiz() && q('[data-pair-cam]'); if (a) a.innerHTML = ''; }
    function limparEstado() { pararCamera(); if (atual && atual.cancelar && !['ligado', 'falhou', 'cancelado'].includes(atual.estado)) atual.cancelar(); atual = null; }
    const msg = (texto, tipo = '') => { const m = raiz() && q('[data-pair-msg]'); if (m) { m.textContent = texto; m.dataset.tipo = tipo; } };

    function qrHTML(texto, legenda) {
      try { ErasoQR.criar(texto, 'L'); } catch (e) { return `<p class="pair-erro">Não foi possível gerar o QR Code (${d.esc(e.message)}). Use o link ou o código abaixo.</p>`; }
      return `<div class="pair-qr"><canvas data-pair-qr class="pair-qr-canvas" role="img" aria-label="${d.esc(legenda)}"></canvas></div>`;
    }
    function pintarQr(texto) { const c = raiz().querySelector('[data-pair-qr]'); if (c) { try { ErasoQR.desenhar(c, ErasoQR.criar(texto, 'L'), { escala: 5, margem: 4 }); } catch { /* o aviso já foi mostrado */ } } }

    function cabecalho(titulo) { return `<div class="dlg-head"><h2 id="m-title">${titulo}</h2><button class="icon-btn" data-modal-close aria-label="Fechar">${d.svgI('x')}</button></div>`; }
    function camBotao() { return `<button class="btn btn-secondary btn-sm" data-pair-camera>${d.svgI('qr', 's16')}Ler com a câmera</button>`; }

    function telaEscolha() {
      d.openModal(`${cabecalho('Parear aparelho')}
        <p>Este endereço não tem servidor, então os aparelhos se encontram por um <strong>código</strong>. Faça isso uma vez para cada aparelho. Os arquivos continuam indo direto de um aparelho ao outro.</p>
        <div class="pair-choices">
          <button class="btn btn-primary" data-pair-gerar autofocus>Gerar o meu código</button>
          <button class="btn btn-secondary" data-pair-tenho>Tenho um código ou link</button>
        </div>
        <p class="hint">O pareamento dura enquanto os dois aparelhos mantiverem o ERASÓ aberto. Ao fechar a página, é preciso parear de novo. Não há conta nem lista de aparelhos guardada.</p>`,
      { label: 'Parear aparelho', onClose: limparEstado, onClick: tratarClique });
    }

    async function gerar() {
      d.openModal(`${cabecalho('Parear: passo 1 de 2')}<p role="status" data-pair-msg>Gerando o código… isso leva alguns segundos, enquanto o aparelho descobre o próprio endereço de rede.</p><div data-pair-cam></div>`, { label: 'Gerar código de pareamento', onClose: limparEstado, onClick: tratarClique });
      let convite;
      try { convite = await d.REDE.criarConvite(); } catch (e) { msg(e.message, 'erro'); return; }
      if (document.querySelector('[data-modal-scrim]').hidden) { convite.cancelar(); return; } // o usuário fechou a tela enquanto o código era gerado
      atual = convite; const link = linkDe(convite.codigo);
      convite.onestado = (estado, erro) => { if (!raiz() || atual !== convite) return; if (estado === 'conectando') msg('Resposta aplicada. Conectando com ' + (convite.perfil ? convite.perfil.nome : 'o aparelho') + '…', 'info'); else if (estado === 'falhou') { msg(erro, 'erro'); const b = q('[data-pair-aplicar]'); if (b) b.disabled = true; } else if (estado === 'ligado') d.aoLigar(convite.perfil); };
      d.openModal(`${cabecalho('Parear: passo 1 de 2')}
        <p><strong>Mostre este código ao outro aparelho.</strong> Nele, aponte a câmera para o QR Code (abre o ERASÓ já com o código) ou abra o link.</p>
        ${qrHTML(link, 'QR Code do convite de pareamento')}
        <div class="pair-actions"><button class="btn btn-secondary btn-sm" data-pair-copiar-link>${d.svgI('copy', 's16')}Copiar link</button><button class="btn btn-ghost btn-sm" data-pair-copiar-codigo>Copiar só o código</button></div>
        <h3 class="pair-h">Passo 2 de 2: leia a resposta</h3>
        <p>O outro aparelho vai mostrar um código de resposta. Leia-o com a câmera ou cole aqui.</p>
        <textarea class="pair-texto" data-pair-resp rows="3" placeholder="Código de resposta (começa com E1.)" aria-label="Código de resposta do outro aparelho" spellcheck="false" autocapitalize="off" autocomplete="off"></textarea>
        <div data-pair-cam></div>
        <div class="pair-actions">${camBotao()}<button class="btn btn-primary btn-sm" data-pair-aplicar>Conectar</button></div>
        <p role="status" data-pair-msg class="pair-msg"></p>`, { label: 'Parear aparelho: passo 1 de 2', onClose: limparEstado, onClick: tratarClique });
      pintarQr(link); q('[data-pair-resp]').focus();
    }

    function telaTenho(codigoInicial = '') {
      d.openModal(`${cabecalho('Tenho um código')}
        <p>Cole o <strong>link</strong> ou o <strong>código</strong> do outro aparelho, ou leia o QR Code dele com a câmera.</p>
        <textarea class="pair-texto" data-pair-entrada rows="3" placeholder="Link ou código (começa com E1.)" aria-label="Link ou código do outro aparelho" spellcheck="false" autocapitalize="off" autocomplete="off"></textarea>
        <div data-pair-cam></div>
        <div class="pair-actions">${camBotao()}<button class="btn btn-primary btn-sm" data-pair-continuar>Continuar</button></div>
        <p role="status" data-pair-msg class="pair-msg"></p>`, { label: 'Tenho um código de pareamento', onClose: limparEstado, onClick: tratarClique });
      if (codigoInicial) { q('[data-pair-entrada]').value = codigoInicial; continuar(); } else q('[data-pair-entrada]').focus();
    }

    async function continuar() {
      const campo = q('[data-pair-entrada]'), texto = campo.value; const b = q('[data-pair-continuar]'); if (b) b.disabled = true;
      pararCamera(); msg('Aplicando o código… isso leva alguns segundos.', 'info');
      try {
        const resp = await d.REDE.responderConvite(texto); atual = resp;
        resp.onestado = (estado, erro) => { if (!raiz() || atual !== resp) return; if (estado === 'falhou') msg(erro, 'erro'); else if (estado === 'ligado') d.aoLigar(resp.perfil); };
        d.openModal(`${cabecalho('Mostre a resposta')}
          <p>Aparelho encontrado: <strong>${d.esc(resp.perfil.nome)}</strong>. Agora, <strong>no aparelho dele</strong>, escolha <em>Ler com a câmera</em> e aponte para este QR Code, ou cole o código de resposta.</p>
          ${qrHTML(resp.codigo, 'QR Code da resposta de pareamento')}
          <div class="pair-actions"><button class="btn btn-secondary btn-sm" data-pair-copiar-codigo>${d.svgI('copy', 's16')}Copiar código de resposta</button></div>
          <p role="status" data-pair-msg class="pair-msg" data-tipo="info">Aguardando o outro aparelho aplicar este código…</p>`, { label: 'Resposta de pareamento', onClose: limparEstado, onClick: tratarClique });
        pintarQr(resp.codigo);
      } catch (e) { msg(e.message, 'erro'); if (b) b.disabled = false; }
    }

    async function aplicar() {
      const campo = q('[data-pair-resp]'), b = q('[data-pair-aplicar]'); if (!atual || !atual.aplicarResposta) return;
      b.disabled = true; pararCamera(); msg('Aplicando a resposta…', 'info');
      try { await atual.aplicarResposta(campo.value); } catch (e) { msg(e.message, 'erro'); b.disabled = false; }
    }

    async function lerCamera(destino, enviar) {
      const area = q('[data-pair-cam]'); if (camera) { pararCamera(); return; }
      try {
        if (!window.isSecureContext) throw new Error('A câmera só funciona em endereço seguro (HTTPS). Use o link ou o código.');
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('Este navegador não permite usar a câmera aqui. Use o link ou o código.');
        msg('Abrindo a câmera…', 'info'); await carregarJsQR();
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
        const video = document.createElement('video'); video.className = 'pair-video'; video.setAttribute('playsinline', ''); video.muted = true; video.srcObject = stream; video.setAttribute('aria-label', 'Imagem da câmera');
        const parar = document.createElement('button'); parar.className = 'btn btn-ghost btn-sm'; parar.textContent = 'Fechar a câmera'; parar.dataset.pairPararCamera = '';
        area.innerHTML = ''; area.appendChild(video); area.appendChild(parar); await video.play();
        const tela = document.createElement('canvas'), ctx = tela.getContext('2d', { willReadFrequently: true }); let vivo = true, tempo = null;
        const olhar = () => {
          if (!vivo) return;
          if (video.readyState >= 2 && video.videoWidth) {
            const w = Math.min(640, video.videoWidth), h = Math.round(w * video.videoHeight / video.videoWidth); tela.width = w; tela.height = h; ctx.drawImage(video, 0, 0, w, h);
            const r = window.jsQR(ctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: 'dontInvert' });
            if (r && r.data) { camera.parar(); camera = null; area.innerHTML = ''; destino.value = r.data; msg('QR Code lido.', 'info'); enviar(); return; }
          }
          tempo = setTimeout(olhar, 160);
        };
        camera = { parar() { vivo = false; clearTimeout(tempo); stream.getTracks().forEach((t) => t.stop()); } };
        msg('Aponte a câmera para o QR Code do outro aparelho.', 'info'); olhar();
      } catch (e) { pararCamera(); msg(e.name === 'NotAllowedError' ? 'A câmera foi bloqueada. Permita o acesso nas configurações do navegador ou use o link ou o código.' : e.name === 'NotFoundError' ? 'Nenhuma câmera foi encontrada neste aparelho. Use o link ou o código.' : e.name === 'NotReadableError' ? 'A câmera está em uso por outro aplicativo. Feche-o ou use o link ou o código.' : e.message, 'erro'); }
    }

    function tratarClique(e) {
      const t = e.target;
      if (t.closest('[data-pair-gerar]')) return gerar();
      if (t.closest('[data-pair-tenho]')) return telaTenho();
      if (t.closest('[data-pair-continuar]')) return continuar();
      if (t.closest('[data-pair-aplicar]')) return aplicar();
      if (t.closest('[data-pair-pararcamera]') || t.closest('[data-pair-parar-camera]')) { pararCamera(); msg(''); return; }
      if (t.closest('[data-pair-camera]')) { const alvo = q('[data-pair-resp]') || q('[data-pair-entrada]'); return lerCamera(alvo, q('[data-pair-resp]') ? aplicar : continuar); }
      if (t.closest('[data-pair-copiar-link]')) return d.copiar(linkDe(atual.codigo), 'Link copiado');
      if (t.closest('[data-pair-copiar-codigo]')) return d.copiar(atual.codigo, 'Código copiado');
    }

    return { abrir: telaEscolha, abrirComCodigo: (codigo) => telaTenho(codigo) };
  }

  window.ErasoPareamento = { criar };
})();
