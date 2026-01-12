
// RoRo-only ship gallery modal + reveal (safe)
(function () {
  const modal = document.getElementById("shipModal");
  if (!modal) return; // Not RoRo page

  const imgEl = document.getElementById("shipModalImg");
  const titleEl = document.getElementById("shipModalTitle");
  const subEl = document.getElementById("shipModalSubtitle");
  const detailsEl = document.getElementById("shipModalDetails");
  const thumbsEl = document.getElementById("shipModalThumbs");

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
      btn.innerHTML = `<img src="${src}" alt="thumb">`;
      btn.addEventListener("click", ()=>{
        imgEl.src = src;
        setActiveThumb(idx);
      });
      thumbsEl.appendChild(btn);
    });

    imgEl.src = safeImages[0] || "";
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal(){
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    imgEl.src = "";
    thumbsEl.innerHTML = "";
  }

  document.addEventListener("click", (e)=>{
    const card = e.target.closest(".ship-card[data-images]");
    if (card) openModal(card);

    if (e.target.closest("[data-close='1']")) closeModal();
  });

  document.addEventListener("keydown", (e)=>{
    if (e.key === "Escape") closeModal();
  });

  // Simple reveal (only if global reveal isn't present)
  if (!document.querySelector("[data-reveal]")) return;
})();

