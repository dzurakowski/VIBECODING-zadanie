import { defaultEventTableState, filterAndSortEvents, getEventStatusLabel } from './shared/eventTable.js';
import { defaultUserTableState, filterAndSortUsers, getUserStatusLabel } from './shared/userTable.js';
import { createSessionBarMarkup } from './shared/sessionBar.js';

const key = 'events_access_token';
const notice = document.querySelector('#notice');
const session = document.querySelector('#session');
const eventsTable = document.querySelector('#events');
const eventsFiltersForm = document.querySelector('#events-filters');
const eventsFiltersReset = document.querySelector('#events-filters-reset');
const registrationToggle = document.querySelector('#registration-toggle');
const usersFiltersForm = document.querySelector('#users-filters');
const usersFiltersReset = document.querySelector('#users-filters-reset');
const usersTable = document.querySelector('#users');
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;'
}[character]));
const formatDate = (value) => new Intl.DateTimeFormat('pl-PL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
const formatParticipants = (registrations) => registrations.length
  ? registrations.map((registration) => `${registration.profiles.full_name} <${registration.profiles.email}>`).join(' | ')
  : '';
const eventFiltersState = {
  sortBy: defaultEventTableState.sortBy,
  sortDirection: defaultEventTableState.sortDirection,
  filters: { ...defaultEventTableState.filters }
};
const usersState = {
  sortBy: defaultUserTableState.sortBy,
  sortDirection: defaultUserTableState.sortDirection,
  filters: { ...defaultUserTableState.filters }
};
let allUsers = [];
let allEvents = [];

const callbackToken = new URLSearchParams(window.location.hash.slice(1)).get('access_token');
if (callbackToken) {
  localStorage.setItem(key, callbackToken);
  history.replaceState(null, '', window.location.pathname);
}

const api = async (path, options = {}) => {
  const response = await fetch(path, {
    ...options,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${localStorage.getItem(key)}`,
      ...(options.headers ?? {})
    }
  });
  const data = await response.json();
  if (!response.ok) {
    const error = Error(data.message);
    error.status = response.status;
    throw error;
  }
  return data;
};

const message = (text, error = false) => {
  notice.textContent = text;
  notice.className = `notice ${error ? 'error' : ''}`;
  notice.classList.remove('hidden');
};

const clearError = () => {
  if (notice.classList.contains('error')) {
    notice.textContent = '';
    notice.className = 'notice hidden';
  }
};

const renderEventSummary = (event, registrations) => ({
  ...event,
  eventDatetimeDisplay: formatDate(event.eventDatetime),
  registeredCount: registrations.length,
  remainingSeats: Math.max(0, event.capacity - registrations.length),
  participantsText: formatParticipants(registrations),
  participants: registrations
});
const sortIndicator = (field) => {
  if (usersState.sortBy !== field) return '↕';
  return usersState.sortDirection === 'asc' ? '↑' : '↓';
};
const eventSortIndicator = (field) => {
  if (eventFiltersState.sortBy !== field) return '↕';
  return eventFiltersState.sortDirection === 'asc' ? '↑' : '↓';
};
const toggleSort = (field) => {
  if (usersState.sortBy === field) {
    usersState.sortDirection = usersState.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    usersState.sortBy = field;
    usersState.sortDirection = 'asc';
  }
};
const toggleEventSort = (field) => {
  if (eventFiltersState.sortBy === field) {
    eventFiltersState.sortDirection = eventFiltersState.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    eventFiltersState.sortBy = field;
    eventFiltersState.sortDirection = 'asc';
  }
};
const readFilters = () => Object.fromEntries(new FormData(usersFiltersForm));
const readEventFilters = () => Object.fromEntries(new FormData(eventsFiltersForm));
const syncFilters = () => {
  usersState.filters = readFilters();
  renderUsers();
};
const syncEventFilters = () => {
  eventFiltersState.filters = readEventFilters();
  renderEvents();
};
const renderUsers = () => {
  const users = filterAndSortUsers(allUsers, usersState);
  usersTable.innerHTML = `<table>
    <tr>
      <th><button class="table-sort ${usersState.sortBy === 'full_name' ? 'active' : ''}" type="button" data-user-sort="full_name">Imię i nazwisko <span class="sort-indicator">${sortIndicator('full_name')}</span></button></th>
      <th><button class="table-sort ${usersState.sortBy === 'email' ? 'active' : ''}" type="button" data-user-sort="email">E-mail <span class="sort-indicator">${sortIndicator('email')}</span></button></th>
      <th><button class="table-sort ${usersState.sortBy === 'role' ? 'active' : ''}" type="button" data-user-sort="role">Rola <span class="sort-indicator">${sortIndicator('role')}</span></button></th>
      <th><button class="table-sort ${usersState.sortBy === 'is_active' ? 'active' : ''}" type="button" data-user-sort="is_active">Status <span class="sort-indicator">${sortIndicator('is_active')}</span></button></th>
      <th>Akcje</th>
    </tr>
    ${users.map((userRow) => `<tr><td>${userRow.full_name}</td><td>${userRow.email}</td><td>${userRow.role}</td><td>${getUserStatusLabel(userRow.is_active)}</td><td><div class="actions"><button class="secondary" data-user-action="${userRow.is_active ? 'deactivate' : 'restore'}" data-id="${userRow.id}">${userRow.is_active ? 'Dezaktywuj' : 'Przywróć'}</button><button class="danger" data-user-action="delete" data-id="${userRow.id}">Usuń trwale</button></div></td></tr>`).join('')}
  </table>`;

  document.querySelectorAll('[data-user-sort]').forEach((button) => {
    button.onclick = () => {
      toggleSort(button.dataset.userSort);
      renderUsers();
    };
  });
};

const renderEvents = () => {
  const events = filterAndSortEvents(allEvents, eventFiltersState);
  eventsTable.innerHTML = events.length ? `<table>
    <tr>
      <th><button class="table-sort ${eventFiltersState.sortBy === 'name' ? 'active' : ''}" type="button" data-event-sort="name">Nazwa <span class="sort-indicator">${eventSortIndicator('name')}</span></button></th>
      <th><button class="table-sort ${eventFiltersState.sortBy === 'description' ? 'active' : ''}" type="button" data-event-sort="description">Opis <span class="sort-indicator">${eventSortIndicator('description')}</span></button></th>
      <th><button class="table-sort ${eventFiltersState.sortBy === 'eventDatetime' ? 'active' : ''}" type="button" data-event-sort="eventDatetime">Termin <span class="sort-indicator">${eventSortIndicator('eventDatetime')}</span></button></th>
      <th><button class="table-sort ${eventFiltersState.sortBy === 'capacity' ? 'active' : ''}" type="button" data-event-sort="capacity">Pojemność <span class="sort-indicator">${eventSortIndicator('capacity')}</span></button></th>
      <th><button class="table-sort ${eventFiltersState.sortBy === 'registeredCount' ? 'active' : ''}" type="button" data-event-sort="registeredCount">Zajęte <span class="sort-indicator">${eventSortIndicator('registeredCount')}</span></button></th>
      <th><button class="table-sort ${eventFiltersState.sortBy === 'remainingSeats' ? 'active' : ''}" type="button" data-event-sort="remainingSeats">Wolne <span class="sort-indicator">${eventSortIndicator('remainingSeats')}</span></button></th>
      <th><button class="table-sort ${eventFiltersState.sortBy === 'status' ? 'active' : ''}" type="button" data-event-sort="status">Status <span class="sort-indicator">${eventSortIndicator('status')}</span></button></th>
      <th><button class="table-sort ${eventFiltersState.sortBy === 'participants' ? 'active' : ''}" type="button" data-event-sort="participants">Uczestnicy <span class="sort-indicator">${eventSortIndicator('participants')}</span></button></th>
      <th>Akcja</th>
    </tr>
    ${events.map((event) => `<tr>
      <td>${escapeHtml(event.name)}</td>
      <td>${escapeHtml(event.description ?? '—')}</td>
      <td>${escapeHtml(event.eventDatetimeDisplay)}</td>
      <td>${escapeHtml(event.capacity)}</td>
      <td>${escapeHtml(event.registeredCount)}</td>
      <td>${escapeHtml(event.remainingSeats)}</td>
      <td>${escapeHtml(getEventStatusLabel(event.status))}</td>
      <td>${event.participants.length ? `<details class="event-participants"><summary>${event.participants.length} os.</summary><ul class="participants">${event.participants.map((registration) => `<li>${escapeHtml(registration.profiles.full_name)} <span>${escapeHtml(registration.profiles.email)}</span></li>`).join('')}</ul></details>` : '<span class="meta">Brak zapisanych użytkowników.</span>'}</td>
      <td><div class="actions">
        <button data-action="status" data-id="${event.id}" data-status="${event.status}">${event.status === 'current' ? 'Archiwizuj' : 'Przywróć'}</button>
        <button class="danger" data-action="reset" data-id="${event.id}">Reset zapisów</button>
        ${event.status === 'archived' && !event.participants.length ? `<button class="danger" data-action="delete" data-id="${event.id}">Usuń trwale</button>` : ''}
      </div></td>
    </tr>`).join('')}
  </table>` : '<p>Brak wydarzeń.</p>';
};

usersTable.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-user-action]');
  if (!button) return;
  try {
    const action = button.dataset.userAction;
    if (action === 'delete') {
      if (!confirm('Trwale usunąć konto i powiązane zapisy?')) return;
      await api(`/api/admin/users/${button.dataset.id}`, { method: 'DELETE' });
    } else {
      await api(`/api/admin/users/${button.dataset.id}/${action}`, { method: 'POST' });
    }
    message('Zapisano zmianę.');
    refresh();
  } catch (error) {
    if ([401, 403].includes(error.status)) resetAdminView();
    message(error.message, true);
  }
});

eventsTable.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-action]');
  const sortButton = event.target.closest('[data-event-sort]');
  if (sortButton) {
    toggleEventSort(sortButton.dataset.eventSort);
    renderEvents();
    return;
  }
  if (!button) return;
  try {
    if (button.dataset.action === 'status') {
      await api(`/api/admin/events/${button.dataset.id}/${button.dataset.status === 'current' ? 'archive' : 'restore'}`, { method: 'POST' });
    }
    if (button.dataset.action === 'reset') {
      if (!confirm('Usunąć wszystkie zapisy?')) return;
      await api(`/api/admin/events/${button.dataset.id}/reset`, { method: 'POST' });
    }
    if (button.dataset.action === 'delete') {
      if (!confirm('Trwale usunąć to wydarzenie?')) return;
      await api(`/api/admin/events/${button.dataset.id}`, { method: 'DELETE' });
    }
    message('Zapisano zmianę.');
    refresh();
  } catch (error) {
    if ([401, 403].includes(error.status)) resetAdminView();
    message(error.message, true);
  }
});

usersFiltersForm.addEventListener('submit', (event) => {
  event.preventDefault();
});

const resetAdminView = () => {
  localStorage.removeItem(key);
  session.textContent = '';
  document.querySelector('#dashboard').classList.add('hidden');
  document.querySelector('#login').classList.remove('hidden');
  document.querySelector('#events').textContent = '';
  document.querySelector('#users').textContent = '';
  eventsFiltersForm.reset();
  usersFiltersForm.reset();
  eventFiltersState.sortBy = defaultEventTableState.sortBy;
  eventFiltersState.sortDirection = defaultEventTableState.sortDirection;
  eventFiltersState.filters = { ...defaultEventTableState.filters };
  usersState.sortBy = defaultUserTableState.sortBy;
  usersState.sortDirection = defaultUserTableState.sortDirection;
  usersState.filters = { ...defaultUserTableState.filters };
  allEvents = [];
  allUsers = [];
  registrationToggle.checked = false;
  registrationToggle.disabled = true;
};

const switchTab = (name) => {
  document.querySelectorAll('[data-tab]').forEach((button) => button.classList.toggle('active', button.dataset.tab === name));
  document.querySelectorAll('.tab-panel').forEach((panel) => panel.classList.toggle('active', panel.id === `${name}-tab`));
};

document.querySelectorAll('[data-tab]').forEach((button) => {
  button.onclick = () => switchTab(button.dataset.tab);
});

registrationToggle.onchange = async () => {
  try {
    const { enabled } = await api('/api/admin/registration-settings', {
      method: 'PATCH',
      body: JSON.stringify({ enabled: registrationToggle.checked })
    });
    registrationToggle.checked = Boolean(enabled);
    message('Zapisano zmianę.');
  } catch (error) {
    if ([401, 403].includes(error.status)) resetAdminView();
    message(error.message, true);
  }
};

async function refresh() {
  try {
    const { user } = await api('/api/auth/me');
    if (user.role !== 'admin') throw Error('Konto nie ma roli administratora.');

    clearError();
    document.querySelector('#login').classList.add('hidden');
    document.querySelector('#dashboard').classList.remove('hidden');
    session.innerHTML = createSessionBarMarkup(user.fullName, { showSwitchLink: true });
    document.querySelector('#logout').onclick = () => {
      localStorage.removeItem(key);
      location.reload();
    };

    const [{ events }, { users }, { enabled }] = await Promise.all([
      api('/api/admin/events'),
      api('/api/admin/users'),
      api('/api/admin/registration-settings')
    ]);
    registrationToggle.checked = Boolean(enabled);
    registrationToggle.disabled = false;
    allUsers = users;
    renderUsers();

    const enriched = await Promise.all(events.map(async (event) => ({
      event,
      registrations: (await api(`/api/admin/events/${event.id}/registrations`)).registrations
    })));
    allEvents = enriched.map(({ event, registrations }) => renderEventSummary(event, registrations));
    renderEvents();

  } catch (error) {
    resetAdminView();
    message(error.message, true);
  }
}

usersFiltersForm.addEventListener('input', syncFilters);
usersFiltersForm.addEventListener('change', syncFilters);
usersFiltersForm.addEventListener('reset', () => {
  queueMicrotask(() => {
    usersState.sortBy = defaultUserTableState.sortBy;
    usersState.sortDirection = defaultUserTableState.sortDirection;
    usersState.filters = { ...defaultUserTableState.filters };
    renderUsers();
  });
});

eventsFiltersForm.addEventListener('input', syncEventFilters);
eventsFiltersForm.addEventListener('change', syncEventFilters);
eventsFiltersForm.addEventListener('reset', () => {
  queueMicrotask(() => {
    eventFiltersState.sortBy = defaultEventTableState.sortBy;
    eventFiltersState.sortDirection = defaultEventTableState.sortDirection;
    eventFiltersState.filters = { ...defaultEventTableState.filters };
    renderEvents();
  });
});

document.querySelector('#login-form').onsubmit = async (event) => {
  event.preventDefault();
  try {
    const data = await api('/api/auth/login', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.target))) });
    localStorage.setItem(key, data.accessToken);
    refresh();
  } catch (error) {
    message(error.message, true);
  }
};

document.querySelector('#magic').onclick = async () => {
  try {
    const email = new FormData(document.querySelector('#login-form')).get('email');
    await api('/api/auth/magic-link', { method: 'POST', body: JSON.stringify({ email }) });
    message('Link logowania został wysłany.');
  } catch (error) {
    message(error.message, true);
  }
};

document.querySelector('#reset').onclick = async () => {
  try {
    const email = new FormData(document.querySelector('#login-form')).get('email');
    await api('/api/auth/password-reset', { method: 'POST', body: JSON.stringify({ email }) });
    message('Jeżeli konto istnieje, wysłaliśmy link do ustawienia nowego hasła.');
  } catch (error) {
    message(error.message, true);
  }
};

document.querySelector('#event-form').onsubmit = async (event) => {
  event.preventDefault();
  try {
    const data = Object.fromEntries(new FormData(event.target));
    data.capacity = Number(data.capacity);
    data.eventDatetime = new Date(data.eventDatetime).toISOString();
    await api('/api/admin/events', { method: 'POST', body: JSON.stringify(data) });
    event.target.reset();
    message('Utworzono wydarzenie.');
    refresh();
  } catch (error) {
    if ([401, 403].includes(error.status)) resetAdminView();
    message(error.message, true);
  }
};

document.querySelector('#user-form').onsubmit = async (event) => {
  event.preventDefault();
  try {
    await api('/api/admin/users', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.target))) });
    event.target.reset();
    message('Wysłano zaproszenie.');
    refresh();
  } catch (error) {
    if ([401, 403].includes(error.status)) resetAdminView();
    message(error.message, true);
  }
};

document.querySelector('#password-form').onsubmit = async (event) => {
  event.preventDefault();
  try {
    await api('/api/auth/change-password', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.target))) });
    event.target.reset();
    message('Hasło zostało zmienione.');
  } catch (error) {
    if ([401, 403].includes(error.status)) resetAdminView();
    message(error.message, true);
  }
};

if (localStorage.getItem(key)) refresh();
