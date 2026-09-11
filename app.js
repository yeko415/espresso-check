(() => {
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('#mobileNav');
  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!open));
    mobileNav.hidden = open;
  });
  mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menuToggle?.setAttribute('aria-expanded', 'false');
    mobileNav.hidden = true;
  }));

  const filters = document.querySelectorAll('.filter');
  const cards = document.querySelectorAll('.product-card');
  filters.forEach(filter => filter.addEventListener('click', () => {
    filters.forEach(f => f.classList.remove('active'));
    filter.classList.add('active');
    const value = filter.dataset.filter;
    cards.forEach(card => card.classList.toggle('is-hidden', value !== 'all' && card.dataset.category !== value));
  }));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  document.querySelector('.reserve-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const button = e.currentTarget.querySelector('button');
    const original = button.innerHTML;
    button.innerHTML = 'Talep Alındı ✓';
    button.disabled = true;
    setTimeout(() => { button.innerHTML = original; button.disabled = false; e.currentTarget.reset(); }, 2400);
  });
})();
