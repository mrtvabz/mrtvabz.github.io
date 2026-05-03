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
    return d.toLocaleDateString('en-GB', options || undefined);
  };

  const fmtShort = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
  };

  const fmtMonth = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
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
    const raw = (status || 'On Request').toLowerCase();
    let cls = 'sch-status';
    if (raw.includes('open')) cls += ' sch-status--open';
    else if (raw.includes('closing')) cls += ' sch-status--closing';
    else if (raw.includes('closed')) cls += ' sch-status--closed';
    return `<span class="${cls}">${escapeHtml(status || 'On Request')}</span>`;
  };

  const datePill = (value, isWarn) => {
    if (!value) return `<span class="sch-date-pill sch-date-pill--empty">—</span>`;
    return `<span class="sch-date-pill${isWarn ? ' sch-date-pill--warn' : ''}">${escapeHtml(fmtShort(value))}</span>`;
  };

  const trackLink = (row) => {
    if (row.tracking) {
      return `<a class="sch-track-link" href="${escapeHtml(row.tracking)}" target="_blank" rel="noopener">Track</a>`;
    }
    return `<span class="sch-track-link--muted">On Request</span>`;
  };

  const calendarTile = (value) => {
    if (!value) {
      return `
        <div class="sch-cal-tile sch-cal-tile--empty">
          <div class="sch-cal-tile__top">Loading</div>
          <div class="sch-cal-tile__day">—</div>
          <div class="sch-cal-tile__bottom">Date pending</div>
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
            <div class="sch-detail-overline">Voyage Details</div>
            <div class="sch-detail-head">${escapeHtml(row.vessel || '—')}</div>
            <div class="sch-detail-sub">${escapeHtml(row.route || 'Route pending')}</div>
            <div class="sch-detail-badges">
              ${statusBadge(row.status)}
            </div>
          </div>
        </div>

        <div class="sch-detail-grid">
          <div class="sch-detail-item">
            <span>Voyage No.</span>
            <strong>${escapeHtml(row.voyage || '—')}</strong>
            <small>Voyage / slot number</small>
          </div>

          <div class="sch-detail-item">
            <span>Busan Loading</span>
            <strong>${escapeHtml(row.loading_date ? fmtDate(row.loading_date) : 'Pending')}</strong>
            <small>Planned loading date</small>
          </div>

          <div class="sch-detail-item">
            <span>Docs Deadline</span>
            <strong>${escapeHtml(row.docs_deadline ? fmtDate(row.docs_deadline) : 'Pending')}</strong>
            <small>Better to send early</small>
          </div>

          <div class="sch-detail-item">
            <span>ETA Vladivostok</span>
            <strong>${escapeHtml(row.eta ? fmtDate(row.eta) : 'Pending')}</strong>
            <small>Estimated arrival</small>
          </div>

          <div class="sch-detail-item">
            <span>Status</span>
            <strong>${escapeHtml(row.status || 'On Request')}</strong>
            <small>Final confirmation comes from the manager</small>
          </div>

          <div class="sch-detail-item">
            <span>Tracking</span>
            <strong>${row.tracking ? 'Available' : 'On Request'}</strong>
            <small>${row.tracking ? `<a class="sch-detail-link" href="${escapeHtml(row.tracking)}" target="_blank" rel="noopener">Open tracking</a>` : 'Tracking link is added manually'}</small>
          </div>

          <div class="sch-detail-item">
            <span>Comment</span>
            <strong>${escapeHtml(row.note || 'No comment')}</strong>
            <small>Additional voyage info</small>
          </div>

          <div class="sch-detail-item">
            <span>Route</span>
            <strong>${escapeHtml(row.route || '—')}</strong>
            <small>Main shipping direction</small>
          </div>
        </div>
      </div>
    `;
  };

  const renderRows = (items) => {
    if (!tbody) return;
    currentRows = Array.isArray(items) ? items : [];

    if (!currentRows.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="sch-empty">No schedule data yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = currentRows.map((row, index) => `
      <tr>
        <td>
          <button type="button" class="sch-vessel-btn" data-row-index="${index}">
            <span class="sch-vessel-name">${escapeHtml(row.vessel || '—')}</span>
            <span class="sch-vessel-meta">Click for voyage details</span>
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
      const res = await fetch('schedule_en.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('schedule_en.json not found');
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
            status: 'Open',
            tracking: '',
            note: 'Planned loading is confirmed by the manager'
          }
        ]
      };
    }

    if (updatedEl) {
      updatedEl.textContent = data.updated ? fmtDate(data.updated) : 'manually';
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