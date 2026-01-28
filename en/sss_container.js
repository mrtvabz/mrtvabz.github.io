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

/* Contacts modal (Container page only) */
(function () {
  const body = document.body;
  if (!body || !body.classList.contains("page-container")) return;

  const modal = document.getElementById("ctContactsModal");
  const openBtns = Array.from(document.querySelectorAll(".js-open-contacts"));
  if (!modal || openBtns.length === 0) return;

  const closeEls = Array.from(modal.querySelectorAll("[data-ct-close='1']"));

  const open = (e) => {
    if (e) e.preventDefault(); // keep href as fallback
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  openBtns.forEach(btn => btn.addEventListener("click", open));
  closeEls.forEach(el => el.addEventListener("click", close));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") close();
  });
})();



