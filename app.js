(() => {
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];

  // Reveal system
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  qsa('.reveal, .reveal-stagger').forEach(el => revealObserver.observe(el));

  // Mobile navigation
  const menuButton = qs('.menu-button');
  const mobileMenu = qs('#mobile-menu');
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    mobileMenu.hidden = open;
  });
  qsa('#mobile-menu a').forEach(a => a.addEventListener('click', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    mobileMenu.hidden = true;
  }));

  // Organic hero image parallax
  const floats = qsa('.parallax');
  let px = 0, py = 0, raf = 0;
  window.addEventListener('mousemove', e => {
    px = (e.clientX / window.innerWidth - .5) * 2;
    py = (e.clientY / window.innerHeight - .5) * 2;
    if (!raf) raf = requestAnimationFrame(() => {
      floats.forEach((el, i) => {
        const d = Number(el.dataset.depth || 10);
        el.style.transform = `translate3d(${px * d}px, ${py * d}px, 0) rotate(${px * (i % 2 ? -1 : 1) * .9}deg)`;
      });
      raf = 0;
    });
  }, { passive: true });

  // Product tabs + filtered overflow carousel
  const tabs = qsa('.category-tab');
  const cards = qsa('.product-card');
  const track = qs('#carouselTrack');
  const dots = qs('#carouselDots');
  let activeCategory = 'beef';
  let index = 0;

  function visibleCards() { return cards.filter(card => card.dataset.productCategory === activeCategory); }
  function renderDots() {
    dots.innerHTML = '';
    visibleCards().forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Product ${i + 1}`);
      b.className = i === index ? 'active' : '';
      b.addEventListener('click', () => { index = i; updateCarousel(); });
      dots.appendChild(b);
    });
  }
  function updateCarousel() {
    const list = visibleCards();
    cards.forEach(c => c.classList.toggle('is-visible', c.dataset.productCategory === activeCategory));
    const gap = 16;
    const cardWidth = list[0]?.getBoundingClientRect().width || 0;
    track.style.transform = `translateX(-${index * (cardWidth + gap)}px)`;
    qsa('#carouselDots button').forEach((d, i) => d.classList.toggle('active', i === index));
  }
  function activateCategory(cat) {
    activeCategory = cat;
    index = 0;
    tabs.forEach(tab => {
      const active = tab.dataset.category === cat;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    renderDots();
    requestAnimationFrame(updateCarousel);
  }
  tabs.forEach(tab => tab.addEventListener('click', () => activateCategory(tab.dataset.category)));
  qs('#prev')?.addEventListener('click', () => { index = Math.max(0, index - 1); updateCarousel(); });
  qs('#next')?.addEventListener('click', () => { index = Math.min(visibleCards().length - 1, index + 1); updateCarousel(); });
  activateCategory(activeCategory);
  window.addEventListener('resize', () => updateCarousel(), { passive: true });

  // Drag / swipe interaction for carousel
  let dragStart = null;
  track.addEventListener('pointerdown', e => { dragStart = e.clientX; track.setPointerCapture?.(e.pointerId); });
  track.addEventListener('pointerup', e => {
    if (dragStart == null) return;
    const delta = e.clientX - dragStart;
    if (Math.abs(delta) > 45) {
      if (delta < 0) index = Math.min(visibleCards().length - 1, index + 1);
      else index = Math.max(0, index - 1);
      updateCarousel();
    }
    dragStart = null;
  });

  // Lightweight toast / demo interaction
  let toastTimer;
  function toast(text) {
    const node = qs('#toast');
    node.textContent = text;
    node.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove('show'), 1800);
  }
  qsa('[data-toast]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); toast(el.dataset.toast); }));

  // Keep internal anchors smooth and close mobile nav
  qsa('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const target = qs(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }));
})();
