/* ========================
   GALLERY FILTER
======================== */
const filterPills  = document.querySelectorAll('.filter-pill');
const galleryItems = document.querySelectorAll('.gallery-item');
const galleryEmpty = document.getElementById('galleryEmpty');

filterPills.forEach(pill => {
  pill.addEventListener('click', () => {
    const filter = pill.dataset.filter;

    filterPills.forEach(p => p.classList.remove('is-active'));
    pill.classList.add('is-active');

    galleryItems.forEach(item => {
      const match = filter === 'all' || item.dataset.project === filter;
      item.classList.toggle('is-hidden', !match);
    });

    updateVisibleItems();

    const hasVisible = visibleItems.length > 0;
    galleryEmpty.classList.toggle('is-visible', !hasVisible);
  });
});

/* ========================
   LIGHTBOX
======================== */
const lightbox        = document.getElementById('lightbox');
const lightboxImg     = document.getElementById('lightboxImg');
const lightboxVideo   = document.getElementById('lightboxVideo');
const lightboxVideoSrc = document.getElementById('lightboxVideoSrc');
const lightboxProj    = document.getElementById('lightboxProject');
const lightboxCount   = document.getElementById('lightboxCounter');
const lightboxClose   = document.getElementById('lightboxClose');
const lightboxPrev    = document.getElementById('lightboxPrev');
const lightboxNext    = document.getElementById('lightboxNext');
const lightboxBg      = document.getElementById('lightboxBackdrop');

// Add project label here when you add a new category
const PROJECT_LABELS = {
  bayse:     'Bayse',
  lumino:    'Lumino',
  mobile:    'Mobile',
  web:       'Web',
  dashboard: 'Dashboard',
};

let visibleItems = [];
let currentIndex = 0;

function updateVisibleItems() {
  visibleItems = [...galleryItems].filter(item => !item.classList.contains('is-hidden'));
}

function openLightbox(index) {
  updateVisibleItems();
  currentIndex = index;
  showItem(currentIndex);
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  lightboxVideo.pause();
  lightboxVideo.classList.remove('is-active');
  lightboxImg.classList.remove('is-hidden');
}

function showItem(index) {
  const item    = visibleItems[index];
  const type    = item.dataset.type || 'image';
  const project = item.dataset.project;

  lightboxProj.textContent  = PROJECT_LABELS[project] || project;
  lightboxCount.textContent = `${index + 1} / ${visibleItems.length}`;
  lightboxPrev.disabled = index === 0;
  lightboxNext.disabled = index === visibleItems.length - 1;

  if (type === 'video') {
    // Stop any image loading, show video
    lightboxImg.classList.add('is-hidden');
    lightboxVideo.classList.add('is-active');

    const srcEl = item.querySelector('source');
    lightboxVideoSrc.src  = srcEl ? srcEl.src : '';
    lightboxVideoSrc.type = srcEl ? srcEl.type : 'video/mp4';
    lightboxVideo.load();
    lightboxVideo.play().catch(() => {});
  } else {
    // Stop video if was playing, show image
    lightboxVideo.pause();
    lightboxVideo.classList.remove('is-active');
    lightboxImg.classList.remove('is-hidden');

    const img = item.querySelector('img');
    lightboxImg.classList.add('is-loading');
    lightboxImg.src = '';

    const temp = new Image();
    temp.onload = () => {
      lightboxImg.src = temp.src;
      lightboxImg.classList.remove('is-loading');
    };
    temp.src = img.src;
    lightboxImg.alt = img.alt;
  }
}

function navigate(dir) {
  const next = currentIndex + dir;
  if (next < 0 || next >= visibleItems.length) return;
  currentIndex = next;
  showItem(currentIndex);
}

// Open on click
galleryItems.forEach(item => {
  item.addEventListener('click', () => {
    updateVisibleItems();
    const idx = visibleItems.indexOf(item);
    if (idx !== -1) openLightbox(idx);
  });
});

// Close controls
lightboxClose.addEventListener('click', closeLightbox);
lightboxBg.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => navigate(-1));
lightboxNext.addEventListener('click', () => navigate(1));

// Keyboard
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('is-open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  navigate(-1);
  if (e.key === 'ArrowRight') navigate(1);
});

// Touch swipe (mobile)
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });
lightbox.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) navigate(diff > 0 ? 1 : -1);
}, { passive: true });

// Init
updateVisibleItems();
