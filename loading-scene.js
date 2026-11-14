(() => {
  const start = () => {
    const video = document.querySelector('.mw-loading-scene-video');
    if (!video) return;
    const toggle = document.querySelector('.mw-loading-scene-toggle');

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches || navigator.connection?.saveData) {
      video.style.display = 'none';
      return;
    }

    const source = video.querySelector('source[data-src]');
    let visible = false;
    let userPaused = false;
    const syncToggle = () => {
      if (!toggle) return;
      toggle.textContent = video.paused ? '▶' : 'Ⅱ';
      toggle.setAttribute('aria-label', video.paused ? toggle.dataset.playLabel : toggle.dataset.pauseLabel);
    };
    if (toggle) {
      toggle.hidden = false;
      syncToggle();
      toggle.addEventListener('click', () => {
        if (video.paused) {
          userPaused = false;
          playWhenVisible();
        } else {
          userPaused = true;
          video.pause();
        }
      });
    }
    const playWhenVisible = () => {
      if (!visible || userPaused || reducedMotion.matches || document.visibilityState === 'hidden') return;
      if (source?.dataset.src) {
        source.src = source.dataset.src;
        delete source.dataset.src;
        video.load();
      }
      video.play().catch(syncToggle);
    };
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) playWhenVisible();
      else video.pause();
    }, { threshold: 0.12 });
    observer.observe(video);

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') video.pause();
      else playWhenVisible();
    });
    reducedMotion.addEventListener?.('change', event => {
      if (event.matches) video.pause();
      else playWhenVisible();
    });
    video.addEventListener('play', syncToggle);
    video.addEventListener('pause', syncToggle);
    video.addEventListener('error', () => {
      video.style.display = 'none';
      if (toggle) toggle.hidden = true;
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
