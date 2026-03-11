/* ========================
   DARK MODE
======================== */
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

const getStoredTheme = () => localStorage.getItem('theme');
const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const applyTheme = (theme) => {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
};

// Init: stored preference → system preference
applyTheme(getStoredTheme() || getSystemTheme());

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// Sync if system preference changes and user hasn't overridden
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!getStoredTheme()) applyTheme(e.matches ? 'dark' : 'light');
});

/* ========================
   SCROLL REVEAL
======================== */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach((el) => {
  revealObserver.observe(el);
});

/* ========================
   NAV — SCROLL STATE
   (rAF-throttled — no layout thrash on every scroll tick)
======================== */
const nav = document.getElementById('nav');
let navRafPending = false;

const handleNavScroll = () => {
  if (navRafPending) return;
  navRafPending = true;
  requestAnimationFrame(() => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
    navRafPending = false;
  });
};

window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll();

/* ========================
   NAV — ACTIVE LINK
======================== */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__link');

const activeLinkObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          link.classList.toggle(
            'is-active',
            link.getAttribute('href') === `#${id}`
          );
        });
      }
    });
  },
  { threshold: 0.4 }
);

sections.forEach((section) => activeLinkObserver.observe(section));

/* ========================
   SMOOTH ANCHOR SCROLL
======================== */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ========================
   MOCKUP SLIDESHOWS
======================== */
function startSlideshow(frameEl, images, intervalMs) {
  if (!frameEl || images.length < 2) return;
  const slides = frameEl.querySelectorAll('.mockup-slide');
  if (slides.length < 2) return;

  let imgIndex = 0;
  let activeSlot = 0;

  slides[0].src = images[0];
  slides[0].classList.add('active');
  slides[1].src = images[1 % images.length];

  setInterval(() => {
    imgIndex = (imgIndex + 1) % images.length;
    const nextIndex = (imgIndex + 1) % images.length;

    slides[activeSlot].classList.remove('active');
    activeSlot = activeSlot === 0 ? 1 : 0;
    slides[activeSlot].classList.add('active');
    slides[activeSlot === 0 ? 1 : 0].src = images[nextIndex];
  }, intervalMs);
}

const rightImages = [
  'images/Mobile1.webp',  'images/Mobile2.webp',  'images/Mobile3.webp',
  'images/Mobile4.webp',  'images/Mobile5.webp',  'images/Mobile6.webp',
  'images/Mobile7.webp',  'images/Mobile8.webp',  'images/Mobile9.webp',
  'images/Mobile10.webp', 'images/Mobile11.webp', 'images/Mobile12.webp',
  'images/Mobile13.webp',
];

const leftImages = [
  // Bayse (16 screens)
  'images/bayse-new-5.webp',  'images/bayse-new-6.webp',  'images/bayse-new-7.webp',
  'images/bayse-new-8.webp',  'images/bayse-new-9.webp',  'images/bayse-new-10.webp',
  'images/bayse-new-12.webp', 'images/bayse-new-13.webp', 'images/bayse-new-14.webp',
  'images/bayse-new-15.webp', 'images/bayse-new-16.webp', 'images/bayse-new-17.webp',
  'images/bayse-new-18.webp', 'images/bayse-new-19.webp', 'images/bayse-new-20.webp',
  'images/bayse-new-21.webp',
  // Lumino (11 screens — no .MOV, no cover)
  'images/Smarthome1.webp',  'images/Smarthome2.webp',  'images/Smarthome3.webp',
  'images/Smarthome4.webp',  'images/Smarthome5.webp',  'images/Smarthome6.webp',
  'images/Smarthome7.webp',  'images/Smarthome8.webp',  'images/Smarthome9.webp',
  'images/Smarthome10.webp', 'images/smarthome11.webp',
];

// Fisher-Yates shuffle
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

startSlideshow(document.getElementById('mockupRight'), rightImages, 2000);
setTimeout(() => {
  startSlideshow(document.getElementById('mockupLeft'), shuffle(leftImages), 2000);
}, 1000);

/* ========================
   HERO PARALLAX
   (rAF-throttled + only runs while hero is in view)
======================== */
const heroContent = document.querySelector('.hero__content');

if (heroContent) {
  let heroRafPending = false;
  let heroVisible = true;

  const heroObserver = new IntersectionObserver(
    ([entry]) => { heroVisible = entry.isIntersecting; },
    { threshold: 0 }
  );
  heroObserver.observe(heroContent.closest('.hero') || heroContent);

  window.addEventListener('scroll', () => {
    if (!heroVisible || heroRafPending) return;
    heroRafPending = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        heroContent.style.transform = `translateY(${y * 0.08}px)`;
        heroContent.style.opacity = 1 - y / (window.innerHeight * 0.7);
      }
      heroRafPending = false;
    });
  }, { passive: true });
}
