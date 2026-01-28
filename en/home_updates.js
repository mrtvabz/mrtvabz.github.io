/* Home-only JS. Safe: it only touches elements that exist on the home page. */

function fmtDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("ru-RU", { year: "numeric", month: "short", day: "2-digit" });
}

function safeText(text) {
  return (text ?? "").toString();
}

function renderNews(data) {
  const list = document.getElementById("newsList");
  const updated = document.getElementById("newsUpdated");
  if (!list || !updated) return;

  updated.textContent = data?.updated ? `Обновлено: ${fmtDate(data.updated)}` : "Обновляется вручную";
  list.innerHTML = "";

  const items = Array.isArray(data?.items) ? data.items : [];
  if (!items.length) {
    list.innerHTML = `<div class="home-empty">Пока нет новостей. Добавьте их в <span class="home-code">news.json</span>.</div>`;
    return;
  }

  for (const item of items) {
    const el = document.createElement("article");
    el.className = "home-item";

    const tag = safeText(item.tag);
    const title = safeText(item.title);
    const summary = safeText(item.summary);
    const date = fmtDate(item.date);
    const url = safeText(item.url);

    el.innerHTML = `
      <div class="home-item__top">
        <div class="home-item__date">${date}</div>
        ${tag ? `<span class="home-tag">${tag}</span>` : ""}
      </div>
      <div class="home-item__title">${title || "(без названия)"}</div>
      ${summary ? `<div class="home-item__summary">${summary}</div>` : ""}
      ${url ? `<a class="home-item__link" href="${url}" target="_blank" rel="noopener noreferrer">Источник →</a>` : ""}
    `;

    list.appendChild(el);
  }
}

function renderSchedule(data) {
  const list = document.getElementById("scheduleList");
  const updated = document.getElementById("scheduleUpdated");
  if (!list || !updated) return;

  updated.textContent = data?.updated ? `Обновлено: ${fmtDate(data.updated)}` : "Обновляется вручную";
  list.innerHTML = "";

  const items = Array.isArray(data?.items) ? data.items : [];
  if (!items.length) {
    list.innerHTML = `<div class="home-empty">Пока нет расписания. Добавьте строки в <span class="home-code">schedule.json</span>.</div>`;
    return;
  }

  for (const row of items) {
    const vessel = safeText(row.vessel);
    const route = safeText(row.route);
    const etd = fmtDate(row.etd);
    const eta = fmtDate(row.eta);
    const status = safeText(row.status);

    const el = document.createElement("div");
    el.className = "home-schedule";
    el.innerHTML = `
      <div>
        <div class="home-schedule__vessel">${vessel || "Vessel"}</div>
        <div class="home-schedule__route">${route || "Маршрут"}</div>
      </div>
      <div class="home-schedule__dates">
        <div>ETD: <b>${etd || "—"}</b></div>
        <div>ETA: <b>${eta || "—"}</b></div>
        ${status ? `<div class="home-schedule__status">${status}</div>` : ""}
      </div>
    `;
    list.appendChild(el);
  }
}

async function loadJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed: ${url}`);
  return await res.json();
}

function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;

  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    els.forEach(el => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  els.forEach(el => io.observe(el));
}

async function initHome() {
  try {
    const [news, schedule] = await Promise.all([
      loadJson("news.json"),
      loadJson("schedule.json")
    ]);
    renderNews(news);
    renderSchedule(schedule);
  } catch (e) {
    // Fallback content if JSON not found (keeps the page usable)
    renderNews({
      updated: null,
      items: [
        {
          date: new Date().toISOString().slice(0, 10),
          tag: "Demo",
          title: "Подключите новости",
          summary: "Добавьте файл news.json рядом с index.html (пример уже готов в проекте).",
          url: ""
        }
      ]
    });

    renderSchedule({
      updated: null,
      items: [
        {
          vessel: "SUN RIO",
          route: "Incheon → Vladivostok",
          etd: new Date().toISOString().slice(0, 10),
          eta: "",
          status: "Demo"
        }
      ]
    });

    console.warn("Home JSON load failed:", e);
  }

  initReveal();
}

document.addEventListener("DOMContentLoaded", initHome);
