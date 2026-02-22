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
======================== */
const nav = document.getElementById('nav');

const handleNavScroll = () => {
  if (window.scrollY > 40) {
    nav.classList.add('is-scrolled');
  } else {
    nav.classList.remove('is-scrolled');
  }
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
   HERO PARALLAX (subtle)
======================== */
const heroContent = document.querySelector('.hero__content');

if (heroContent) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      heroContent.style.transform = `translateY(${y * 0.08}px)`;
      heroContent.style.opacity = 1 - y / (window.innerHeight * 0.7);
    }
  }, { passive: true });
}
