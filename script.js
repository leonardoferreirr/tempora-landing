/* TÊMPORA — interações premium */

// Nav glass on scroll
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// Subtle parallax on hero orbs + photo
const hero = document.querySelector('.hero');
const orb1 = document.querySelector('.hero__orb--1');
const orb2 = document.querySelector('.hero__orb--2');
const photo = document.querySelector('.hero__photo');
if (hero && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      if (orb1) orb1.style.transform = `translateY(${y * 0.22}px)`;
      if (orb2) orb2.style.transform = `translateY(${y * -0.14}px)`;
      if (photo) photo.style.transform = `rotate(1.4deg) translateY(${y * 0.05}px)`;
    }
  }, { passive: true });
}

// Mobile menu (lightweight: scroll to sections, toggle a simple overlay)
const burger = document.querySelector('.nav__burger');
const links = document.querySelector('.nav__links');
if (burger) {
  burger.addEventListener('click', () => {
    const open = links.style.display === 'flex';
    links.style.display = open ? '' : 'flex';
    links.style.position = 'absolute';
    links.style.top = '110%';
    links.style.right = '0';
    links.style.flexDirection = 'column';
    links.style.background = 'rgba(22,41,31,.96)';
    links.style.padding = '1.2rem 1.6rem';
    links.style.borderRadius = '18px';
    links.style.gap = '1rem';
  });
  links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => { links.style.display = ''; }));
}

// Depoimentos: ver mais / ver menos
document.querySelectorAll('.depo__toggle').forEach((btn) => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.depo__card');
    const expanded = card.getAttribute('data-expanded') === 'true';
    card.setAttribute('data-expanded', String(!expanded));
    btn.setAttribute('aria-expanded', String(!expanded));
    btn.firstChild.textContent = expanded ? 'Ver mais' : 'Ver menos';
  });
});

// Smooth anchor offset for fixed nav
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (ev) => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      const target = document.querySelector(id);
      if (target) {
        ev.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  });
});

// ========== Carrossel Depoimentos (Netflix-style) ==========
(function(){
  const root = document.getElementById('depoCarousel');
  if (!root) return;
  const track = root.querySelector('.depo__track');
  const cards = [...track.querySelectorAll('.depo__card')];
  const prev = root.querySelector('.depo__nav.prev');
  const next = root.querySelector('.depo__nav.next');
  const dotsWrap = root.querySelector('.depo__dots');
  if (cards.length === 0) return;

  // dots
  cards.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Ir para depoimento ' + (i+1));
    b.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(b);
  });
  const dots = [...dotsWrap.querySelectorAll('button')];

  let idx = 0;
  const layout = () => {
    const card = cards[idx];
    if (!card) return;
    const viewportW = root.querySelector('.depo__viewport').getBoundingClientRect().width;
    const cardW = card.getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    // center the active card within the viewport
    const offset = card.offsetLeft - (viewportW - cardW) / 2;
    track.style.transform = `translateX(${-offset}px)`;
    cards.forEach((c, i) => c.classList.toggle('is-active', i === idx));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
    prev.toggleAttribute('disabled', idx === 0);
    next.toggleAttribute('disabled', idx === cards.length - 1);
  };
  const goTo = (i) => { idx = Math.max(0, Math.min(cards.length - 1, i)); layout(); };

  prev.addEventListener('click', () => goTo(idx - 1));
  next.addEventListener('click', () => goTo(idx + 1));

  // swipe
  let startX = 0, dragging = false;
  track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; dragging = true; }, {passive:true});
  track.addEventListener('touchend', (e) => {
    if (!dragging) return; dragging = false;
    const dx = (e.changedTouches[0].clientX - startX);
    if (Math.abs(dx) > 50) goTo(dx < 0 ? idx + 1 : idx - 1);
  }, {passive:true});

  // keyboard
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(idx + 1); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(idx - 1); }
  });
  root.setAttribute('tabindex', '0');

  // initial + on resize
  requestAnimationFrame(layout);
  let resizeT;
  window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(layout, 80); });
})();
