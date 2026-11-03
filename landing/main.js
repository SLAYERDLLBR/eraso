// Interações da landing: tema, idioma, menu do celular, animações de "Como funciona" e demonstração.
// Todas as páginas do site usam este arquivo; cada bloco só age se o elemento existir na página.
(() => {
  const $ = (s) => document.querySelector(s);
  const root = document.documentElement;

  // Cabeçalho: marca o estado de rolagem (mesmo limite da referência: 20 px)
  const navbar = $('#navbar');
  if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', scrollY > 20);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  // Tema claro/escuro
  const themeBtn = $('#theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', () => {
    const dark = root.classList.toggle('dark');
    try { localStorage.setItem('eraso-landing-theme', dark ? 'dark' : 'light'); } catch (e) {}
  });

  // Seletor de idioma (por enquanto, só português)
  const langBtn = $('#lang-btn'), langDrop = $('#lang-dropdown'), langSearch = $('#lang-search');
  const setLang = (open) => {
    if (!langBtn || !langDrop) return;
    langDrop.hidden = !open; langBtn.setAttribute('aria-expanded', String(open));
    if (open && langSearch) setTimeout(() => langSearch.focus(), 50);
  };
  if (langBtn && langDrop) {
    langBtn.addEventListener('click', (e) => { e.stopPropagation(); setLang(langDrop.hidden); });
    langDrop.addEventListener('click', (e) => { e.stopPropagation(); if (e.target.closest('.lang-item')) { setLang(false); langBtn.focus(); } });
    if (langSearch) langSearch.addEventListener('input', () => {
      const q = langSearch.value.trim().toLowerCase(); let any = false;
      langDrop.querySelectorAll('.lang-item').forEach((it) => { const ok = it.dataset.langName.toLowerCase().includes(q); it.hidden = !ok; any = any || ok; });
      const empty = $('#lang-empty'); if (empty) empty.hidden = any;
    });
    document.addEventListener('click', () => setLang(false));
  }

  // Menu do celular
  const menuBtn = $('#menu-btn'), menu = $('#mobile-menu');
  const setMenu = (open) => {
    if (!menuBtn || !menu) return;
    menu.hidden = !open; menuBtn.setAttribute('aria-expanded', String(open)); menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => setMenu(menu.hidden));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    addEventListener('resize', () => { if (innerWidth > 768) setMenu(false); });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (langDrop && !langDrop.hidden) { setLang(false); langBtn.focus(); }
    if (menu && !menu.hidden) { setMenu(false); menuBtn.focus(); }
  });

  // "Como funciona" (só na página inicial): a animação de arrastar começa quando 20% da seção aparece (como na referência)
  const steps = $('#steps'), how = $('#how-it-works');
  if (steps && how) {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => entries.forEach((en) => {
        if (en.isIntersecting) { steps.classList.add('animate-drag'); io.unobserve(en.target); }
      }), { threshold: 0.2 });
      io.observe(how);
    } else steps.classList.add('animate-drag');
  }

  // Demonstração (só na página inicial): vídeo do protótipo. Toca sozinho, mudo, enquanto está à vista;
  // não toca sozinho se a pessoa prefere menos movimento. Os controles nativos ficam sempre disponíveis.
  const demoVideo = $('#demo-video');
  if (demoVideo) {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let tocouPorMim = false, pausadoPelaPessoa = false;
    demoVideo.addEventListener('pause', () => { if (!tocouPorMim && !demoVideo.ended) pausadoPelaPessoa = true; });
    demoVideo.addEventListener('play', () => { if (!tocouPorMim) pausadoPelaPessoa = false; });
    if (!reduce && 'IntersectionObserver' in window) {
      new IntersectionObserver((entries) => entries.forEach((en) => {
        if (en.isIntersecting && en.intersectionRatio >= 0.5) {
          if (!pausadoPelaPessoa && demoVideo.paused && !demoVideo.ended) { tocouPorMim = true; demoVideo.play().catch(() => {}).finally(() => { tocouPorMim = false; }); }
        } else if (!demoVideo.paused) { tocouPorMim = true; demoVideo.pause(); setTimeout(() => { tocouPorMim = false; }, 0); }
      }), { threshold: [0, 0.5] }).observe(demoVideo);
    }
  }
})();
