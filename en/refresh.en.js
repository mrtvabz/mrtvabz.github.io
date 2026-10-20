document.documentElement.classList.add('mw-js');
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.mw-year').forEach(year => { year.textContent = String(new Date().getFullYear()); });
  const nav = document.querySelector('.mw-nav');
  const toggle = document.querySelector('.mw-nav-toggle');
  if (nav && toggle) {
    const closeMenu = () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    };
    toggle.addEventListener('click', () => {
      const opened = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(opened));
    });
    nav.addEventListener('click', event => {
      if (event.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
    document.addEventListener('click', event => {
      if (!nav.contains(event.target) && !toggle.contains(event.target)) closeMenu();
    });
  }

  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.mw-nav a').forEach(link => {
    if (link.getAttribute('href') === currentPage) link.setAttribute('aria-current', 'page');
  });

  document.querySelectorAll('.mw-media img').forEach(img => {
    const showFallback = () => { img.hidden = true; };
    img.addEventListener('error', showFallback, { once: true });
    if (img.complete && img.naturalWidth === 0) showFallback();
  });

  document.querySelectorAll('.staff-photo img, .ct-img img, .ct-media img, .ship-img img, .ct-modal__photo img').forEach(img => {
    const fallback = document.createElement('span');
    fallback.className = 'mw-photo-fallback';
    fallback.setAttribute('aria-hidden', 'true');
    fallback.textContent = img.closest('.staff-card')?.querySelector('.staff-name')?.textContent.trim()
      || img.closest('.ship-card')?.dataset.title
      || img.closest('.ct-media')?.querySelector('.cap')?.textContent.trim()
      || img.closest('.ct-modal__card')?.querySelector('.ct-modal__name, .ct-modal__cardTitle')?.textContent.trim()
      || (img.closest('.ct-img') ? 'Car search' : '')
      || img.alt || 'Photo';
    img.after(fallback);
    const showFallback = () => { img.hidden = true; };
    img.addEventListener('error', showFallback, { once: true });
    if (img.complete && img.naturalWidth === 0) showFallback();
  });

  document.querySelectorAll('.contact-photo').forEach(img => {
    const hideBrokenImage = () => { img.hidden = true; };
    img.addEventListener('error', hideBrokenImage, { once: true });
    if (img.complete && img.naturalWidth === 0) hideBrokenImage();
  });

  const revealItems = document.querySelectorAll('.mw-reveal, .route-track');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    revealItems.forEach(item => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    revealItems.forEach(item => observer.observe(item));
  }

  const stops = document.querySelectorAll('.route-stop[data-detail]');
  const stopDescription = document.getElementById('route-stop-description');
  if (stops.length && stopDescription) {
    stops.forEach(stop => stop.addEventListener('click', () => {
      stops.forEach(item => item.setAttribute('aria-pressed', String(item === stop)));
      stopDescription.textContent = stop.dataset.detail;
    }));
  }

  document.querySelectorAll('.mw-faq').forEach(group => {
    group.addEventListener('toggle', event => {
      const opened = event.target;
      if (!(opened instanceof HTMLDetailsElement) || !opened.open) return;
      group.querySelectorAll('details').forEach(item => {
        if (item !== opened) item.open = false;
      });
    }, true);
  });

  document.querySelectorAll('[data-mw-checklist]').forEach(group => {
    const items = Array.from(group.querySelectorAll('input[type="checkbox"]'));
    const status = group.querySelector('.mw-checklist-status');
    const progress = group.querySelector('progress');
    const update = () => {
      const ready = items.filter(item => item.checked).length;
      if (status) status.textContent = `Ready: ${ready} of ${items.length}`;
      if (progress) {
        progress.max = items.length;
        progress.value = ready;
      }
    };
    group.addEventListener('change', update);
    update();
  });
});

/* Homepage components keep their content readable when JavaScript is unavailable. */
document.addEventListener('DOMContentLoaded', () => {
  const chooser = document.querySelector('[data-mw-service-chooser]');
  if (chooser) {
    const tablist = chooser.querySelector('.mw-service-tabs');
    const tabs = Array.from(chooser.querySelectorAll('[data-mw-service-tab]'));
    const panels = Array.from(chooser.querySelectorAll('[data-mw-service-panel]'));
    tablist.setAttribute('role', 'tablist');
    tabs.forEach(tab => tab.setAttribute('role', 'tab'));
    panels.forEach(panel => panel.setAttribute('role', 'tabpanel'));

    const activate = (activeTab, focus = false) => {
      tabs.forEach(tab => {
        const selected = tab === activeTab;
        tab.classList.toggle('is-active', selected);
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      panels.forEach(panel => {
        const selected = panel.dataset.mwServicePanel === activeTab.dataset.mwServiceTab;
        panel.hidden = !selected;
        panel.classList.toggle('is-active', selected);
      });
      if (focus) activeTab.focus();
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab));
      tab.addEventListener('keydown', event => {
        let next = index;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        activate(tabs[next], true);
      });
    });
    activate(tabs[0]);
  }

  const process = document.querySelector('.home .mw-process-list');
  if (process) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      process.classList.add('is-visible');
    } else {
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          process.classList.add('is-visible');
          observer.disconnect();
        }
      }, { threshold: .2 });
      observer.observe(process);
    }
  }
});
