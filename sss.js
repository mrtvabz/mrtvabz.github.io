const toggle = document.querySelector("#header .toggle-button");
const collapses = document.querySelectorAll("#header .collapse");

if (!toggle) {
  console.warn("Toggle button not found. Check your selector.");
} else {
  toggle.addEventListener("click", () => {
    collapses.forEach(col => col.classList.toggle("collapse-toggle"));
  });
}

/* Close mobile menu after clicking any nav link */
document.querySelectorAll("#header a.nav-link, #header a.nav-brand").forEach((link) => {
  link.addEventListener("click", () => {
    collapses.forEach(col => col.classList.remove("collapse-toggle"));
  });
});


// ===== RoRo ship popup (runs only on RoRo page) =====
(function () {
  const modal = document.getElementById("shipModal");
  if (!modal) return; // not RoRo page

  const mainImg = document.getElementById("shipModalMain");
  const thumbsWrap = document.getElementById("shipModalThumbs");
  const titleEl = document.getElementById("shipModalTitle");
  const routeEl = document.getElementById("shipModalRoute");
  const noteEl = document.getElementById("shipModalNote");

  function setMain(src, btnToActivate) {
    mainImg.src = src;
    // active state
    thumbsWrap.querySelectorAll("button").forEach(b => b.classList.remove("is-active"));
    if (btnToActivate) btnToActivate.classList.add("is-active");
  }

  function openModal(card) {
    const title = card.dataset.title || "SHIP";
    const route = card.dataset.route || "";
    const note = card.dataset.note || "";
    const images = (card.dataset.images || card.querySelector("img")?.getAttribute("src") || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    titleEl.textContent = title;
    routeEl.textContent = route;
    noteEl.textContent = note;

    // Build thumbnails
    thumbsWrap.innerHTML = "";
    images.forEach((src, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-label", `Photo ${idx + 1}`);
      const img = document.createElement("img");
      img.src = src;
      img.alt = `${title} photo ${idx + 1}`;
      btn.appendChild(img);
      btn.addEventListener("click", () => setMain(src, btn));
      thumbsWrap.appendChild(btn);
    });

    // default main image
    if (images.length) {
      setMain(images[0], thumbsWrap.querySelector("button"));
    } else {
      mainImg.src = "";
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    mainImg.src = "";
    thumbsWrap.innerHTML = "";
  }

  // open by click
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".page-roro .ship-open");
    if (card) openModal(card);

    if (e.target.closest("[data-close='1']")) closeModal();
  });

  // open by keyboard (Enter/Space)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();

    const focused = document.activeElement;
    if (!focused || !focused.classList || !focused.classList.contains("ship-open")) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openModal(focused);
    }
  });
})();


// ===== Reveal on scroll (safe) =====
(function () {
  const els = document.querySelectorAll("[data-reveal]");
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => obs.observe(el));
})();

