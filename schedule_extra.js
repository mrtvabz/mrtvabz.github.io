(function () {
  const body = document.body;
  if (!body || !body.classList.contains('page-schedule')) return;

  const tbody = document.getElementById('scheduleFleetBody');
  const updatedEl = document.getElementById('scheduleUpdatedLabel');

  const modal = document.getElementById('scheduleDetailModal');
  const modalBody = document.getElementById('scheduleDetailModalBody');

  let currentRows = [];

  const fmtDate = (value, options) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('ru-RU', options || undefined);
  };

  const fmtShort = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  };

  const fmtMonth = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '').toUpperCase();
  };

  const fmtDay = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return String(d.getDate()).padStart(2, '0');
  };

  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const statusBadge = (status) => {
    const raw = (status || 'По запросу').toLowerCase();
    let cls = 'sch-status';
    if (raw.includes('откры')) cls += ' sch-status--open';
    else if (raw.includes('скоро') || raw.includes('послед')) cls += ' sch-status--closing';
    else if (raw.includes('закры')) cls += ' sch-status--closed';
    return `<span class="${cls}">${escapeHtml(status || 'По запросу')}</span>`;
  };

  const datePill = (value, isWarn) => {
    if (!value) return `<span class="sch-date-pill sch-date-pill--empty">—</span>`;
    return `<span class="sch-date-pill${isWarn ? ' sch-date-pill--warn' : ''}">${escapeHtml(fmtShort(value))}</span>`;
  };

  const trackLink = (row) => {
    if (row.tracking) {
      return `<a class="sch-track-link" href="${escapeHtml(row.tracking)}" target="_blank" rel="noopener">Track</a>`;
    }
    return `<span class="sch-track-link--muted">По запросу</span>`;
  };

  const calendarTile = (value) => {
    if (!value) {
      return `
        <div class="sch-cal-tile sch-cal-tile--empty">
          <div class="sch-cal-tile__top">Погрузка</div>
          <div class="sch-cal-tile__day">—</div>
          <div class="sch-cal-tile__bottom">Дата уточняется</div>
        </div>
      `;
    }

    return `
      <div class="sch-cal-tile">
        <div class="sch-cal-tile__top">${escapeHtml(fmtMonth(value))}</div>
        <div class="sch-cal-tile__day">${escapeHtml(fmtDay(value))}</div>
        <div class="sch-cal-tile__bottom">${escapeHtml(fmtDate(value, { weekday: 'long' }))}</div>
      </div>
    `;
  };

  const detailCard = (row) => {
    return `
      <div class="sch-detail-card">
        <div class="sch-detail-hero">
          ${calendarTile(row.loading_date)}

          <div class="sch-detail-hero-copy">
            <div class="sch-detail-overline">Детали рейса</div>
            <div class="sch-detail-head">${escapeHtml(row.vessel || '—')}</div>
            <div class="sch-detail-sub">${escapeHtml(row.route || 'Маршрут уточняется')}</div>
            <div class="sch-detail-badges">
              ${statusBadge(row.status)}
            </div>
          </div>
        </div>

        <div class="sch-detail-grid">
          <div class="sch-detail-item">
            <span>№ рейса</span>
            <strong>${escapeHtml(row.voyage || '—')}</strong>
            <small>Номер рейса / слота</small>
          </div>

          <div class="sch-detail-item">
            <span>Погрузка Busan</span>
            <strong>${escapeHtml(row.loading_date ? fmtDate(row.loading_date) : 'Уточняется')}</strong>
            <small>Плановая дата погрузки</small>
          </div>

          <div class="sch-detail-item">
            <span>Документы до</span>
            <strong>${escapeHtml(row.docs_deadline ? fmtDate(row.docs_deadline) : 'Уточняется')}</strong>
            <small>Лучше отправить заранее</small>
          </div>

          <div class="sch-detail-item">
            <span>ETA Владивосток</span>
            <strong>${escapeHtml(row.eta ? fmtDate(row.eta) : 'Уточняется')}</strong>
            <small>Ориентировочное прибытие</small>
          </div>

          <div class="sch-detail-item">
            <span>Статус</span>
            <strong>${escapeHtml(row.status || 'По запросу')}</strong>
            <small>Актуальность подтверждается менеджером</small>
          </div>

          <div class="sch-detail-item">
            <span>Трекинг</span>
            <strong>${row.tracking ? 'Доступен' : 'По запросу'}</strong>
            <small>${row.tracking ? `<a class="sch-detail-link" href="${escapeHtml(row.tracking)}" target="_blank" rel="noopener">Открыть трекинг</a>` : 'Ссылка добавляется вручную'}</small>
          </div>

          <div class="sch-detail-item">
            <span>Комментарий</span>
            <strong>${escapeHtml(row.note || 'Без комментария')}</strong>
            <small>Дополнительная информация по рейсу</small>
          </div>

          <div class="sch-detail-item">
            <span>Маршрут</span>
            <strong>${escapeHtml(row.route || '—')}</strong>
            <small>Основное направление отправки</small>
          </div>
        </div>
      </div>
    `;
  };

  const renderRows = (items) => {
    if (!tbody) return;
    currentRows = Array.isArray(items) ? items : [];

    if (!currentRows.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="sch-empty">Пока нет данных для расписания.</td></tr>`;
      return;
    }

    tbody.innerHTML = currentRows.map((row, index) => `
      <tr>
        <td>
          <button type="button" class="sch-vessel-btn" data-row-index="${index}">
            <span class="sch-vessel-name">${escapeHtml(row.vessel || '—')}</span>
            <span class="sch-vessel-meta">Нажмите для деталей рейса</span>
          </button>
        </td>
        <td><span class="sch-voyage">${escapeHtml(row.voyage || '—')}</span></td>
        <td>${datePill(row.loading_date, false)}</td>
        <td>${datePill(row.eta, false)}</td>
        <td>${datePill(row.docs_deadline, true)}</td>
        <td>${statusBadge(row.status)}</td>
        <td>${trackLink(row)}</td>
      </tr>
    `).join('');
  };

  const openModal = (html) => {
    if (!modal || !modalBody) return;
    modalBody.innerHTML = html;
    modal.setAttribute('aria-hidden', 'false');
    body.classList.add('sch-modal-open');
  };

  const closeModal = () => {
    if (!modal || !modalBody) return;
    modal.setAttribute('aria-hidden', 'true');
    modalBody.innerHTML = '';
    body.classList.remove('sch-modal-open');
  };

  const bindTable = () => {
    if (!tbody || tbody.dataset.bound === 'true') return;

    tbody.addEventListener('click', (e) => {
      const btn = e.target.closest('.sch-vessel-btn');
      if (!btn) return;

      const index = Number(btn.getAttribute('data-row-index'));
      const row = currentRows[index];
      if (!row) return;

      openModal(detailCard(row));
    });

    tbody.dataset.bound = 'true';
  };

  const bindModal = () => {
    if (!modal || modal.dataset.bound === 'true') return;

    modal.addEventListener('click', (e) => {
      if (e.target.closest('[data-sch-modal-close="1"]')) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
        closeModal();
      }
    });

    modal.dataset.bound = 'true';
  };

  const load = async () => {
    let data = { updated: '', items: [] };

    try {
      const res = await fetch('schedule.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('schedule.json not found');
      data = await res.json();
    } catch (err) {
      console.warn('Schedule load failed:', err);
      data = {
        updated: '',
        items: [
          {
            vessel: 'Hiroyuki',
            voyage: '11',
            route: 'Busan → Vladivostok',
            loading_date: '2026-05-08',
            docs_deadline: '2026-05-07',
            eta: '2026-05-11',
            status: 'Открыто',
            tracking: '',
            note: 'Плановая погрузка подтверждается менеджером'
          }
        ]
      };
    }

    if (updatedEl) {
      updatedEl.textContent = data.updated ? fmtDate(data.updated) : 'вручную';
    }

    renderRows(data.items);
    bindTable();
    bindModal();
  };

  document.addEventListener('DOMContentLoaded', load);
})();

(function () {
  const body = document.body;
  if (!body || !body.classList.contains('page-schedule')) return;

  document.addEventListener('DOMContentLoaded', () => {
    const marineForm = document.getElementById('marineTrafficForm');
    const marineInput = document.getElementById('marineTrafficInput');
    const marineButtons = document.querySelectorAll('[data-mt-vessel]');

    const carrierForm = document.getElementById('carrierTrackingForm');
    const carrierSelect = document.getElementById('carrierSelect');
    const carrierInput = document.getElementById('carrierTrackingInput');

    const openMarineTraffic = (name) => {
      const value = String(name || '').trim();
      if (!value) return;
      const url = `https://www.marinetraffic.com/en/ais/home/search?term=${encodeURIComponent(value)}`;
      window.open(url, '_blank', 'noopener');
    };

    const carrierNames = {
      maersk: 'Maersk tracking',
      msc: 'MSC tracking',
      cma: 'CMA CGM tracking',
      one: 'ONE tracking',
      hapag: 'Hapag-Lloyd tracking',
      hmm: 'HMM tracking',
      evergreen: 'Evergreen tracking',
      generic: 'container tracking'
    };

    const openCarrierTracking = (carrier, number) => {
      const value = String(number || '').trim();
      if (!value) return;

      const key = String(carrier || 'generic').trim().toLowerCase();
      const label = carrierNames[key] || carrierNames.generic;
      const query = `${label} ${value}`;
      const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      window.open(url, '_blank', 'noopener');
    };

    if (marineForm && marineInput) {
      marineForm.addEventListener('submit', (e) => {
        e.preventDefault();
        openMarineTraffic(marineInput.value);
      });
    }

    if (marineButtons.length) {
      marineButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          openMarineTraffic(btn.getAttribute('data-mt-vessel'));
        });
      });
    }

    if (carrierForm && carrierSelect && carrierInput) {
      carrierForm.addEventListener('submit', (e) => {
        e.preventDefault();
        openCarrierTracking(carrierSelect.value, carrierInput.value);
      });
    }
  });
})();