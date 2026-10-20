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
    return d.toLocaleDateString('en-GB', options || undefined);
  };

  const fmtShort = (value) => {
    if (!value) return '—';
    const d = parseTripDate(value);
    if (!d) return value;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
  };

  const fmtMonth = (value) => {
    if (!value) return '—';
    const d = parseTripDate(value);
    if (!d) return '—';
    return d.toLocaleDateString('en-GB', { month: 'short' }).replace('.', '').toUpperCase();
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
    const raw = (status || 'On request').toLowerCase();
    let cls = 'sch-status';
    if (raw.includes('open')) cls += ' sch-status--open';
    else if (raw.includes('soon') || raw.includes('last')) cls += ' sch-status--closing';
    else if (raw.includes('closed')) cls += ' sch-status--closed';
    return `<span class="${cls}">${escapeHtml(status || 'On request')}</span>`;
  };

  const datePill = (value, isWarn) => {
    if (!value) return `<span class="sch-date-pill sch-date-pill--empty">—</span>`;
    return `<span class="sch-date-pill${isWarn ? ' sch-date-pill--warn' : ''}">${escapeHtml(fmtShort(value))}</span>`;
  };

  const priceLabel = (row) => Number.isFinite(row.price_usd) ? `$${row.price_usd}` : 'On request';

  const trackLink = (row) => {
    if (row.tracking) {
      return `<a class="sch-track-link" href="${escapeHtml(row.tracking)}" target="_blank" rel="noopener">Track</a>`;
    }
    return `<span class="sch-track-link--muted">On request</span>`;
  };

  const calendarTile = (value) => {
    if (!value) {
      return `
        <div class="sch-cal-tile sch-cal-tile--empty">
          <div class="sch-cal-tile__top">Loading</div>
          <div class="sch-cal-tile__day">—</div>
          <div class="sch-cal-tile__bottom">Date to be confirmed</div>
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
            <div class="sch-detail-overline">Voyage details</div>
            <div class="sch-detail-head">${escapeHtml(row.vessel || '—')}</div>
            <div class="sch-detail-sub">${escapeHtml(row.route || 'Route to be confirmed')}</div>
            <div class="sch-detail-badges">
              ${row.status ? statusBadge(row.status) : ''}
            </div>
          </div>
        </div>

        <div class="sch-detail-grid">
          <div class="sch-detail-item">
            <span>Departure port</span>
            <strong>${escapeHtml(row.departure_port || 'To be confirmed')}</strong>
            <small>Departure terminal</small>
          </div>

          <div class="sch-detail-item">
            <span>ETD · departure</span>
            <strong>${escapeHtml(row.loading_date ? fmtDate(row.loading_date) : 'To be confirmed')}</strong>
            <small>Planned vessel departure</small>
          </div>

          <div class="sch-detail-item">
            <span>Documents due</span>
            <strong>${escapeHtml(row.docs_deadline ? fmtDate(row.docs_deadline) : 'To be confirmed')}</strong>
            <small>Please send in advance</small>
          </div>

          <div class="sch-detail-item">
            <span>Arrival port</span>
            <strong>${escapeHtml(row.arrival_port || 'To be confirmed')}</strong>
            <small>Destination terminal</small>
          </div>

          <div class="sch-detail-item">
            <span>Time in transit</span>
            <strong>${escapeHtml(row.transit_time || 'To be confirmed')}</strong>
            <small>Estimated sailing time</small>
          </div>

          <div class="sch-detail-item">
            <span>Price</span>
            <strong>${escapeHtml(priceLabel(row))}</strong>
            <small>Confirm the rate before booking</small>
          </div>

          <div class="sch-detail-item">
            <span>Note</span>
            <strong>${escapeHtml(row.note || 'No note')}</strong>
            <small>Additional voyage information</small>
          </div>

          <div class="sch-detail-item">
            <span>Route</span>
            <strong>${escapeHtml(row.route || '—')}</strong>
            <small>Primary shipping route</small>
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
      tbody.innerHTML = `<tr><td colspan="7" class="sch-empty">No upcoming sailings have been confirmed yet. <a href="contacts.html">Contact us</a> to discuss your shipment.</td></tr>`;
      return;
    }

    tbody.innerHTML = currentRows.map((row, index) => `
      <tr class="sch-trip-row">
        <td data-label="Vessel">
          <button type="button" class="sch-vessel-btn" data-row-index="${index}">
            <span class="sch-vessel-name">${escapeHtml(row.vessel || '—')}</span>
            <span class="sch-vessel-meta">View sailing details</span>
          </button>
        </td>
        <td data-label="ETD">${datePill(row.loading_date, false)}</td>
        <td data-label="Departure port">${escapeHtml(row.departure_port || '—')}</td>
        <td data-label="Arrival port">${escapeHtml(row.arrival_port || '—')}</td>
        <td data-label="Transit time">${escapeHtml(row.transit_time || '—')}</td>
        <td data-label="Price"><span class="sch-voyage">${escapeHtml(priceLabel(row))}</span></td>
        <td data-label="Documents due">${datePill(row.docs_deadline, true)}</td>
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
      const res = await fetch('../schedule.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('schedule.json not found');
      data = await res.json();
    } catch (err) {
      console.warn('Schedule load failed:', err);
      data = { updated: '', items: [] };
    }

    if (updatedEl) {
      updatedEl.textContent = parseTripDate(data.updated) ? fmtDate(data.updated) : 'on request';
    }

    // The shared schedule.json is maintained in Russian; translate only its
    // visitor-facing values without changing the source or its field names.
    const rowText = {
      'До субботы': 'By Saturday',
      '2-3 дней': '2–3 days',
      'Открыто': 'Open',
      'Временно закрыто': 'Temporarily closed',
      'Плановая погрузка подтверждается менеджером': 'The scheduled loading date is confirmed by a manager',
      'Дата может корректироваться линией': 'The carrier may adjust the date',
      'Лучше отправить документы заранее': 'Please send documents in advance',
      'Пусан — Камчон 5 → Мортэк': 'Busan–Kamcheon 5 → Mortek',
      'Пусан — Камчон 5': 'Busan–Kamcheon 5',
      'Мортэк': 'Mortek',
      '2–3 дня': '2–3 days',
      'Дата может измениться на 1 день.': 'Dates may change by one day.'
    };
    const translateValue = value => typeof value === 'string' ? (rowText[value] || value) : value;
    const translatedRows = Array.isArray(data.items) ? data.items.map(row => ({
      ...row,
      route: translateValue(row.route),
      departure_port: translateValue(row.departure_port),
      arrival_port: translateValue(row.arrival_port),
      transit_time: translateValue(row.transit_time),
      docs_deadline: translateValue(row.docs_deadline),
      eta: translateValue(row.eta),
      status: translateValue(row.status),
      note: translateValue(row.note)
    })) : [];
    renderRows(translatedRows);
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
