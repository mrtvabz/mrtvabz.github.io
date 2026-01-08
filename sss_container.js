/* Container page JS (does not affect other pages) */
(function () {
  const body = document.body;
  if (!body || !body.classList.contains("page-container")) return;

  const items = Array.from(document.querySelectorAll("[data-reveal]"));
  if (items.length === 0) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach(el => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  items.forEach(el => io.observe(el));
})();
