// Page-only script for pogruzka.html
(function () {
  const filters = document.getElementById("pgFilters");
  const cards = Array.from(document.querySelectorAll(".pg-card"));

  const modal = document.getElementById("pgModal");
  const modalVideo = document.getElementById("pgModalVideo");
  const modalTitle = document.getElementById("pgModalTitle");

  function openModal(src, title) {
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; // prevent background scroll
    modalTitle.textContent = title || "Видео";

    modalVideo.pause();
    modalVideo.removeAttribute("src");
    modalVideo.load();

    modalVideo.src = src;
    modalVideo.load();
    modalVideo.play().catch(() => {});
  }

  function closeModal() {
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = ""; // restore scroll
    modalVideo.pause();
    modalVideo.removeAttribute("src");
    modalVideo.load();
  }

  // Filter pills
  if (filters) {
    filters.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-filter]");
      if (!btn) return;

      filters.querySelectorAll(".pg-pill").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      const f = btn.getAttribute("data-filter");
      cards.forEach(card => {
        const c = card.getAttribute("data-country");
        const show = (f === "all") || (c === f);
        card.style.display = show ? "" : "none";
      });
    });
  }

  // Click card -> open modal
  cards.forEach(card => {
    const handler = () => {
      const src = card.getAttribute("data-video");
      const title = card.getAttribute("data-title") || card.getAttribute("data-date") || "Видео";
      if (!src) return;
      openModal(src, title);
    };

    card.addEventListener("click", handler);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handler();
      }
    });
  });

  // Close modal
  modal.addEventListener("click", (e) => {
    if (e.target.matches("[data-close]")) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") closeModal();
  });
})();

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".toggle-button");
  const collapse = document.querySelector("header .collapse");
  if (!toggle || !collapse) return;

  toggle.addEventListener("click", () => {
    collapse.classList.toggle("active");
  });
});
