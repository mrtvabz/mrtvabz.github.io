
// RoRo-only ship gallery modal + reveal (safe)
(function () {
  const modal = document.getElementById("shipModal");
  if (!modal) return; // Not RoRo page

  const imgEl = document.getElementById("shipModalImg");
  const titleEl = document.getElementById("shipModalTitle");
  const subEl = document.getElementById("shipModalSubtitle");
  const detailsEl = document.getElementById("shipModalDetails");
  const thumbsEl = document.getElementById("shipModalThumbs");
  const imageFallback = document.createElement('span');
  imageFallback.className = 'ship-modal-fallback';
  imageFallback.hidden = true;
  imgEl.after(imageFallback);
  imgEl.addEventListener('error', () => {
    imgEl.hidden = true;
    imageFallback.hidden = false;
    imageFallback.textContent = `A photo of ${titleEl.textContent} will appear when this file is added: ${imgEl.getAttribute('src')}.`;
  });
  imgEl.addEventListener('load', () => {
    imgEl.hidden = false;
    imageFallback.hidden = true;
  });
  // Contacts modal (RoRo CTA button)
  const contactsModal = document.getElementById("contactsModal");
  const contactsBtn = document.getElementById("openContacts");
  document.querySelectorAll('.ship-card[data-images]').forEach(card => {
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Open photos of the ship ${card.dataset.title || ''}`);
  });

  function updateScrollLock(){
    const shipOpen = modal.classList.contains("is-open");
    const contactsOpen = contactsModal ? contactsModal.classList.contains("is-open") : false;
    document.body.style.overflow = (shipOpen || contactsOpen) ? "hidden" : "";
  }


  function setActiveThumb(idx){
    thumbsEl.querySelectorAll(".ship-thumb").forEach((t,i)=>{
      t.classList.toggle("is-active", i===idx);
    });
  }

  function openModal(card){
    const title = card.dataset.title || "SHIP";
    const sub = card.dataset.subtitle || "";
    const details = card.dataset.details || "";
    const images = (card.dataset.images || "").split(",").map(s=>s.trim()).filter(Boolean);

    titleEl.textContent = title;
    subEl.textContent = sub;
    detailsEl.textContent = details;

    // Build thumbs
    thumbsEl.innerHTML = "";
    const safeImages = images.length ? images : [card.querySelector("img")?.getAttribute("src") || ""].filter(Boolean);

    safeImages.forEach((src, idx)=>{
      const btn = document.createElement("button");
      btn.type="button";
      btn.className="ship-thumb" + (idx===0 ? " is-active" : "");
      const thumbnail = document.createElement('img');
      thumbnail.src = src;
      thumbnail.alt = `Photo of ${title} ${idx + 1}`;
      thumbnail.addEventListener('error', () => {
        thumbnail.hidden = true;
        btn.textContent = String(idx + 1);
      });
      btn.appendChild(thumbnail);
      btn.addEventListener("click", ()=>{
        imgEl.src = src;
        setActiveThumb(idx);
      });
      thumbsEl.appendChild(btn);
    });

    imgEl.src = safeImages[0] || "";
    imgEl.alt = `Photo of the ship ${title}`;
    imgEl.hidden = false;
    imageFallback.hidden = true;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    updateScrollLock();
  }

  function closeModal(){
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    updateScrollLock();
    imgEl.src = "";
    thumbsEl.innerHTML = "";
  }

  document.addEventListener("click", (e)=>{
    const card = e.target.closest(".ship-card[data-images]");
    if (card) openModal(card);

    if (e.target.closest("[data-close='1']")) closeModal();
  });

  document.addEventListener("keydown", (e)=>{
    const card = e.target.closest?.('.ship-card[data-images]');
    if (card && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      openModal(card);
      return;
    }
    if (e.key === "Escape") closeModal();
  });

  // Open CTA contacts modal (without leaving RoRo page)
  if (contactsBtn && contactsModal){
    const openContacts = (e) => {
      e.preventDefault();
      contactsModal.classList.add("is-open");
      contactsModal.setAttribute("aria-hidden", "false");
      updateScrollLock();
    };

    const closeContacts = () => {
      contactsModal.classList.remove("is-open");
      contactsModal.setAttribute("aria-hidden", "true");
      updateScrollLock();
    };

    contactsBtn.addEventListener("click", openContacts);

    // close when clicking overlay or X (data-close="1")
    contactsModal.addEventListener("click", (e) => {
      if (e.target.closest("[data-close='1']")) closeContacts();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && contactsModal.classList.contains("is-open")) closeContacts();
    });
  }

  const reveals = document.querySelectorAll('[data-reveal]');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } });
    }, {threshold: .12});
    reveals.forEach(el => observer.observe(el));
  }
})();
