/* Mobile navbar toggle (Pogruzka page only)
   Uses existing CSS: .collapse-toggle to expand .collapse on small screens.
   Implemented with a capture-phase listener to avoid conflicts with other scripts. */
(function () {
  'use strict';
  const isPogruzka = document.body && document.body.classList.contains('page-pogruzka');
  if (!isPogruzka) return;

  document.addEventListener('click', function (e) {
    const btn = e.target.closest && e.target.closest('.toggle-button');
    if (!btn) return;

    // Prevent other handlers from double-toggling
    e.preventDefault();
    e.stopPropagation();

    const collapses = document.querySelectorAll('header .collapse');
    if (!collapses.length) return;

    collapses.forEach((c) => c.classList.toggle('collapse-toggle'));
  }, true);

  // Optional: close menu after clicking a nav link (mobile UX)
  document.addEventListener('click', function (e) {
    const link = e.target.closest && e.target.closest('header .collapse a');
    if (!link) return;

    const collapses = document.querySelectorAll('header .collapse');
    collapses.forEach((c) => c.classList.remove('collapse-toggle'));
  }, true);
})();

/* MaxWin Logistics — pogruzka.js
   - Filters cards by data-country
   - Opens modal and plays YouTube videos inside iframe
   Works with:
     data-yt="NjxoV7eQi3U" (ID)
     data-yt="https://www.youtube.com/shorts/xxxx"
     data-yt="https://www.youtube.com/watch?v=xxxx"
*/

(function () {
  'use strict';

  const filtersWrap = document.getElementById('pgFilters');
  const grid = document.getElementById('pgGrid');
  const cards = Array.from(document.querySelectorAll('.pg-card'));

  const modal = document.getElementById('pgModal');
  const modalTitle = document.getElementById('pgModalTitle');
  const frame = document.getElementById('pgModalFrame');
  const closeTargets = Array.from(document.querySelectorAll('[data-close="1"]'));
  const modalPlayer = document.querySelector('.pg-modal__player');

  function parseYouTubeId(input) {
    if (!input) return null;
    const raw = String(input).trim();

    // If user already provided only the ID
    if (!raw.startsWith('http')) {
      // basic cleanup (remove spaces, extra params)
      const cleaned = raw.split(/[?&#\s]/)[0];
      return cleaned || null;
    }

    try {
      const url = new URL(raw);

      // youtu.be/ID
      if (url.hostname.includes('youtu.be')) {
        const id = url.pathname.replace('/', '').split('/')[0];
        return id || null;
      }

      // youtube.com/watch?v=ID
      const v = url.searchParams.get('v');
      if (v) return v;

      // youtube.com/shorts/ID
      const parts = url.pathname.split('/').filter(Boolean);
      const shortsIndex = parts.indexOf('shorts');
      if (shortsIndex !== -1 && parts[shortsIndex + 1]) return parts[shortsIndex + 1];

      // youtube.com/embed/ID
      const embedIndex = parts.indexOf('embed');
      if (embedIndex !== -1 && parts[embedIndex + 1]) return parts[embedIndex + 1];

      return null;
    } catch (e) {
      return null;
    }
  }

  function isShortsLink(input) {
    if (!input) return false;
    const s = String(input);
    return s.includes('/shorts/');
  }

  function openModalWithYouTube(card) {
    const yt = card.getAttribute('data-yt');
    const title = card.getAttribute('data-title') || 'Видео';

    const id = parseYouTubeId(yt);
    if (!id) {
      console.warn('No valid YouTube video ID found in data-yt:', yt);
      // Fallback: if it looks like a URL, just open it in a new tab
      if (yt && String(yt).trim().startsWith('http')) window.open(String(yt).trim(), '_blank', 'noopener');
      return;
    }

    // Title
    if (modalTitle) modalTitle.textContent = title;

    // Shorts = vertical aspect
    const vertical = isShortsLink(yt) || (card.getAttribute('data-aspect') === 'shorts');
    if (modal) modal.classList.toggle('is-shorts', vertical);

    // Build embed URL
    // Note: mute=1 helps autoplay work on mobile. User can unmute.
    const embed = `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`;

    // Set src
    if (frame) frame.src = embed;

    // Show modal
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('pg-modal-open');
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.classList.remove('is-shorts');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('pg-modal-open');

    // Stop playback
    if (frame) frame.src = '';

    // Reset aspect state
    if (modalPlayer) modalPlayer.classList.remove('is-vertical');
  }

  function applyFilter(filter) {
    const f = (filter || 'all').toLowerCase();
    cards.forEach((card) => {
      const c = (card.getAttribute('data-country') || '').toLowerCase();
      const show = (f === 'all') || (c === f) || (c === 'all');
      card.style.display = show ? '' : 'none';
    });
  }

  // Filters click
  if (filtersWrap) {
    filtersWrap.addEventListener('click', (e) => {
      const btn = e.target.closest('.pg-pill');
      if (!btn) return;

      const filter = btn.getAttribute('data-filter') || 'all';
      filtersWrap.querySelectorAll('.pg-pill').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      applyFilter(filter);
    });
  }

  // Card click + keyboard
  if (grid) {
    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.pg-card');
      if (!card) return;
      openModalWithYouTube(card);
    });

    grid.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const card = e.target.closest('.pg-card');
      if (!card) return;
      e.preventDefault();
      openModalWithYouTube(card);
    });
  }

  // Close handlers
  closeTargets.forEach((el) => {
    el.addEventListener('click', closeModal);
  });

  // ESC closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  // Start
  applyFilter('all');
})();


