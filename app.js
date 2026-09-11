(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header state
  const header = $('.site-header');
  const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const toggle = $('.menu-toggle');
  const mobileNav = $('#mobileNav');
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    if (open) mobileNav.hidden = true;
    else mobileNav.hidden = false;
  });
  $$('#mobileNav a').forEach(a => a.addEventListener('click', () => {
    toggle?.setAttribute('aria-expanded', 'false');
    if (mobileNav) mobileNav.hidden = true;
  }));

  // Smooth internal links with a subtle snap
  $$('a[href^="#"]').forEach(link => link.addEventListener('click', e => {
    const id = link.getAttribute('href');
    const target = id && $(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }));

  // Reveal engine
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    $$('.reveal').forEach(el => io.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('in-view'));
  }

  // Magnetic buttons + custom cursor on fine pointers
  const finePointer = window.matchMedia('(pointer:fine)').matches;
  if (finePointer && !reduced) {
    const dot = document.createElement('div'); dot.className = 'cursor-dot';
    const ring = document.createElement('div'); ring.className = 'cursor-ring';
    document.body.append(dot, ring);

    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; dot.style.left = `${mx}px`; dot.style.top = `${my}px`; });
    const tick = () => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.left = `${rx}px`; ring.style.top = `${ry}px`;
      requestAnimationFrame(tick);
    };
    tick();

    $$('.btn, .filter, .desktop-nav a, .text-link, .brand').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('active'));
      el.addEventListener('mouseleave', () => ring.classList.remove('active'));
    });

    $$('.btn').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${x * 0.08}px, ${y * 0.12}px)`;
      });
      btn.addEventListener('pointerleave', () => btn.style.transform = '');
    });
  }

  // Image/card pointer tilt
  if (!reduced && finePointer) {
    $$('.product-card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `translateY(-8px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
      });
      card.addEventListener('pointerleave', () => card.style.transform = '');
    });
  }

  // Hero/image parallax
  if (!reduced) {
    const targets = [
      ...$$('.hero-shape'),
      ...$$('.feature-media')
    ];
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      targets.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > innerHeight + 100) return;
        const factor = i === 0 ? -0.05 : i === 1 ? 0.04 : -0.025;
        const offset = (innerHeight / 2 - (r.top + r.height / 2)) * factor;
        el.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  // Menu filters with animated grid state
  const cards = $$('.product-card');
  $$('.filter').forEach(button => {
    button.addEventListener('click', () => {
      $$('.filter').forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      const filter = button.dataset.filter;
      cards.forEach((card, index) => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.style.transitionDelay = `${index * 45}ms`;
        if (show) {
          card.style.position = '';
          requestAnimationFrame(() => { card.classList.remove('is-hidden'); });
        } else {
          card.classList.add('is-hidden');
          setTimeout(() => {
            if (card.classList.contains('is-hidden')) card.style.position = 'absolute';
          }, 360);
        }
      });
    });
  });

  // Form micro-interaction; real sites can swap this for an API call.
  $('.reserve-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const btn = $('button[type="submit"]', e.currentTarget);
    if (!btn) return;
    const original = btn.innerHTML;
    btn.innerHTML = 'Talep Alındı ✓';
    btn.disabled = true;
    setTimeout(() => { btn.innerHTML = original; btn.disabled = false; }, 2200);
  });
})();
