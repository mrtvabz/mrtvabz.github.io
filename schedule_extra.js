(function () {
  const body = document.body;
  if (!body || !body.classList.contains('page-schedule')) return;

  const tbody = document.getElementById('scheduleFleetBody');
  const updatedEl = document.getElementById('scheduleUpdatedLabel');

  const modal = document.getElementById('scheduleDetailModal');
  const modalBody = document.getElementById('scheduleDetailModalBody');

  let currentRows = [];

  const parseTripDate = (value) => {
    const match = String(value || '').match(/^(\d{4})[-.](\d{2})[-.](\d{2})$/);
    if (!match) return null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return date.getFullYear() === Number(match[1]) && date.getMonth() === Number(match[2]) - 1 && date.getDate() === Number(match[3]) ? date : null;
  };

  const fmtDate = (value, options) => {
    if (!value) return '';
    const d = parseTripDate(value);
    if (!d) return value;
    return d.toLocaleDateString('ru-RU', options || undefined);
  };

  const fmtShort = (value) => {
    if (!value) return '—';
    const d = parseTripDate(value);
    if (!d) return value;
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  };

  const fmtMonth = (value) => {
    if (!value) return '—';
    const d = parseTripDate(value);
    if (!d) return '—';
    return d.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '').toUpperCase();
  };

  const fmtDay = (value) => {
    if (!value) return '—';
    const d = parseTripDate(value);
    if (!d) return '—';
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

  const priceLabel = (row) => Number.isFinite(row.price_usd) ? `$${row.price_usd}` : 'По запросу';

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
              ${row.status ? statusBadge(row.status) : ''}
            </div>
          </div>
        </div>

        <div class="sch-detail-grid">
          <div class="sch-detail-item">
            <span>Порт отправки</span>
            <strong>${escapeHtml(row.departure_port || 'Уточняется')}</strong>
            <small>Терминал отправления</small>
          </div>

          <div class="sch-detail-item">
            <span>ETD · отправление</span>
            <strong>${escapeHtml(row.loading_date ? fmtDate(row.loading_date) : 'Уточняется')}</strong>
            <small>Плановая дата выхода судна</small>
          </div>

          <div class="sch-detail-item">
            <span>Документы до</span>
            <strong>${escapeHtml(row.docs_deadline ? fmtDate(row.docs_deadline) : 'Уточняется')}</strong>
            <small>Лучше отправить заранее</small>
          </div>

          <div class="sch-detail-item">
            <span>Порт прибытия</span>
            <strong>${escapeHtml(row.arrival_port || 'Уточняется')}</strong>
            <small>Пункт назначения</small>
          </div>

          <div class="sch-detail-item">
            <span>Время в пути</span>
            <strong>${escapeHtml(row.transit_time || 'Уточняется')}</strong>
            <small>Ориентировочный срок перевозки</small>
          </div>

          <div class="sch-detail-item">
            <span>Цена</span>
            <strong>${escapeHtml(priceLabel(row))}</strong>
            <small>Подтвердите тариф перед бронированием</small>
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    currentRows = Array.isArray(items) ? items.filter(row => {
      const date = parseTripDate(row.loading_date);
      return date && date >= today;
    }) : [];

    if (!currentRows.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="sch-empty">Подтверждённых ближайших рейсов пока нет. <a href="contacts.html">Свяжитесь с нами</a>, чтобы уточнить отправку.</td></tr>`;
      return;
    }

    tbody.innerHTML = currentRows.map((row, index) => `
      <tr class="sch-trip-row">
        <td data-label="Судно">
          <button type="button" class="sch-vessel-btn" data-row-index="${index}">
            <span class="sch-vessel-name">${escapeHtml(row.vessel || '—')}</span>
            <span class="sch-vessel-meta">Открыть детали рейса</span>
          </button>
        </td>
        <td data-label="ETD">${datePill(row.loading_date, false)}</td>
        <td data-label="Порт отправки">${escapeHtml(row.departure_port || '—')}</td>
        <td data-label="Порт прибытия">${escapeHtml(row.arrival_port || '—')}</td>
        <td data-label="В пути">${escapeHtml(row.transit_time || '—')}</td>
        <td data-label="Цена"><span class="sch-voyage">${escapeHtml(priceLabel(row))}</span></td>
        <td data-label="Документы до">${datePill(row.docs_deadline, true)}</td>
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
      data = { updated: '', items: [] };
    }

    if (updatedEl) {
      updatedEl.textContent = parseTripDate(data.updated) ? fmtDate(data.updated) : 'по запросу';
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
