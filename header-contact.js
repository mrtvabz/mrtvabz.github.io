(() => {
  const init = () => {
    const actions = document.querySelector('#header .mw-header-actions');
    const oldLink = actions?.querySelector('.mw-header-cta');
    const languageLink = actions?.querySelector('.mw-lang');
    if (!actions || !oldLink || !languageLink) return;

    const english = document.documentElement.lang.toLowerCase().startsWith('en');
    const copy = english ? {
      open: 'Show manager phone numbers',
      close: 'Close manager phone numbers',
      heading: 'Speak to the right person',
      all: 'All contacts',
      people: [
        { name: 'Abdulaziz', role: 'RoRo manager', work: 'Cars, pricing and paperwork', phone: '+82 10 5694 6990', href: 'tel:+821056946990' },
        { name: 'Abdulaziz', role: 'Container manager', work: 'Shipments, pricing and paperwork', phone: '+82 10 8036 0700', href: 'tel:+821080360700' },
        { name: 'Javohir', role: 'Project manager', work: 'Shipment and voyage updates', phone: '+82 10 8181 8303', href: 'tel:+821081818303' }
      ]
    } : {
      open: 'Показать телефоны менеджеров',
      close: 'Закрыть телефоны менеджеров',
      heading: 'Связь с менеджером',
      all: 'Все контакты',
      people: [
        { name: 'Абдулазиз', role: 'Менеджер по RoRo', work: 'Автомобили, расчёты и документы', phone: '+82 10 5694 6990', href: 'tel:+821056946990' },
        { name: 'Абдулазиз', role: 'Менеджер по контейнерам', work: 'Отправки, расчёты и документы', phone: '+82 10 8036 0700', href: 'tel:+821080360700' },
        { name: 'Жавохир', role: 'Менеджер по проектам', work: 'Отправки и связь по рейсам', phone: '+82 10 8181 8303', href: 'tel:+821081818303' }
      ]
    };

    const picker = document.createElement('div');
    picker.className = 'mw-contact-picker';
    const trigger = document.createElement('button');
    trigger.className = 'mw-contact-trigger';
    trigger.type = 'button';
    trigger.setAttribute('aria-label', copy.open);
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', 'mw-contact-panel');
    trigger.title = copy.open;
    trigger.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6.6 3.5h2.2L10 7.1 8.1 8.6a13 13 0 0 0 7.3 7.3l1.5-1.9 3.6 1.2v2.2a2 2 0 0 1-2.1 2A16.8 16.8 0 0 1 3.6 5.6a2 2 0 0 1 2-2.1Z"/></svg>';

    const panel = document.createElement('div');
    panel.className = 'mw-contact-panel';
    panel.id = 'mw-contact-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'group');
    panel.setAttribute('aria-label', copy.heading);
    const title = document.createElement('p');
    title.className = 'mw-contact-panel-title';
    title.textContent = copy.heading;
    panel.append(title);
    const list = document.createElement('ul');
    list.className = 'mw-contact-list';
    copy.people.forEach(person => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.className = 'mw-contact-person';
      link.href = person.href;
      const top = document.createElement('span');
      top.className = 'mw-contact-person-top';
      const name = document.createElement('strong');
      name.textContent = person.name;
      const phone = document.createElement('span');
      phone.className = 'mw-contact-person-phone';
      phone.textContent = person.phone;
      top.append(name, phone);
      const role = document.createElement('span');
      role.className = 'mw-contact-person-role';
      role.textContent = person.role;
      const work = document.createElement('span');
      work.className = 'mw-contact-person-work';
      work.textContent = person.work;
      link.append(top, role, work);
      item.append(link);
      list.append(item);
    });
    panel.append(list);
    const all = document.createElement('a');
    all.className = 'mw-contact-all';
    all.href = 'contacts.html';
    all.textContent = `${copy.all} ↗`;
    panel.append(all);
    picker.append(trigger, panel);
    actions.insertBefore(picker, languageLink);
    oldLink.remove();

    const setOpen = open => {
      panel.hidden = !open;
      trigger.setAttribute('aria-expanded', String(open));
      trigger.setAttribute('aria-label', open ? copy.close : copy.open);
      trigger.title = open ? copy.close : copy.open;
      picker.classList.toggle('is-open', open);
    };
    trigger.addEventListener('click', () => setOpen(panel.hidden));
    trigger.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setOpen(true);
        list.querySelector('a')?.focus();
      }
    });
    actions.querySelector('.mw-nav-toggle')?.addEventListener('click', () => setOpen(false));
    document.addEventListener('click', event => {
      if (!picker.contains(event.target)) setOpen(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !panel.hidden) {
        setOpen(false);
        trigger.focus();
      }
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
