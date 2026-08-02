import { defaultPrivateTab, isPrivateTab, normalizePrivateTab } from './shared/privateTabs.js';
import { defaultCurrentEventsState, filterAndSortCurrentEvents } from './shared/currentEventsTable.js';
import { defaultRegistrationsTableState, filterAndSortRegistrations } from './shared/registrationsTable.js';
import { createSessionBarMarkup } from './shared/sessionBar.js';

const tokenKey = 'events_access_token';
const notice = document.querySelector('#notice');
const session = document.querySelector('#session');
const loginSection = document.querySelector('#login');
const registrationSection = document.querySelector('#registration-section');
const privateArea = document.querySelector('#private-area');
const showRegistrationButton = document.querySelector('#show-registration');
const backToLoginButton = document.querySelector('#back-to-login');
const tabButtons = document.querySelectorAll('[data-tab]');
const tabPanels = document.querySelectorAll('.tab-panel');
const registrationForm = document.querySelector('#registration-form');
const eventsTable = document.querySelector('#events');
const eventsFiltersForm = document.querySelector('#events-filters');
const eventsFiltersReset = document.querySelector('#events-filters-reset');
const mineTable = document.querySelector('#mine');
const mineFiltersForm = document.querySelector('#mine-filters');
const mineFiltersReset = document.querySelector('#mine-filters-reset');
let registrationEnabled = false;
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;'
}[character]));
const format = (date) => new Intl.DateTimeFormat('pl-PL', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(date));
const formatShort = (date) => new Intl.DateTimeFormat('pl-PL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));
const currentEventsState = {
  sortBy: defaultCurrentEventsState.sortBy,
  sortDirection: defaultCurrentEventsState.sortDirection,
  filters: { ...defaultCurrentEventsState.filters }
};
const registrationsState = {
  sortBy: defaultRegistrationsTableState.sortBy,
  sortDirection: defaultRegistrationsTableState.sortDirection,
  filters: { ...defaultRegistrationsTableState.filters }
};
let allEvents = [];
let allRegistrations = [];

const callbackToken = new URLSearchParams(window.location.hash.slice(1)).get('access_token');
if (callbackToken) {
  localStorage.setItem(tokenKey, callbackToken);
  history.replaceState(null, '', window.location.pathname);
}

const token = () => localStorage.getItem(tokenKey);

const api = async (path, options = {}) => {
  const response = await fetch(path, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(token() ? { authorization: `Bearer ${token()}` } : {}),
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
  notice.className = `notice${error ? ' error' : ''}`;
  notice.classList.remove('hidden');
};

const eventSortIndicator = (field) => {
  if (currentEventsState.sortBy !== field) return '↕';
  return currentEventsState.sortDirection === 'asc' ? '↑' : '↓';
};

const registrationSortIndicator = (field) => {
  if (registrationsState.sortBy !== field) return '↕';
  return registrationsState.sortDirection === 'asc' ? '↑' : '↓';
};

const toggleCurrentEventsSort = (field) => {
  if (currentEventsState.sortBy === field) {
    currentEventsState.sortDirection = currentEventsState.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    currentEventsState.sortBy = field;
    currentEventsState.sortDirection = 'asc';
  }
};

const toggleRegistrationsSort = (field) => {
  if (registrationsState.sortBy === field) {
    registrationsState.sortDirection = registrationsState.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    registrationsState.sortBy = field;
    registrationsState.sortDirection = 'asc';
  }
};

const readCurrentEventsFilters = () => Object.fromEntries(new FormData(eventsFiltersForm));
const readRegistrationsFilters = () => Object.fromEntries(new FormData(mineFiltersForm));
const syncCurrentEventsFilters = () => {
  currentEventsState.filters = readCurrentEventsFilters();
  renderCurrentEvents();
};
const syncRegistrationsFilters = () => {
  registrationsState.filters = readRegistrationsFilters();
  renderRegistrations();
};

const renderCurrentEvents = () => {
  const events = filterAndSortCurrentEvents(allEvents, currentEventsState);
  eventsTable.innerHTML = events.length ? `<table>
    <tr>
      <th><button class="table-sort ${currentEventsState.sortBy === 'name' ? 'active' : ''}" type="button" data-current-event-sort="name">Nazwa <span class="sort-indicator">${eventSortIndicator('name')}</span></button></th>
      <th><button class="table-sort ${currentEventsState.sortBy === 'description' ? 'active' : ''}" type="button" data-current-event-sort="description">Opis <span class="sort-indicator">${eventSortIndicator('description')}</span></button></th>
      <th><button class="table-sort ${currentEventsState.sortBy === 'eventDatetime' ? 'active' : ''}" type="button" data-current-event-sort="eventDatetime">Termin <span class="sort-indicator">${eventSortIndicator('eventDatetime')}</span></button></th>
      <th><button class="table-sort ${currentEventsState.sortBy === 'capacity' ? 'active' : ''}" type="button" data-current-event-sort="capacity">Pojemność <span class="sort-indicator">${eventSortIndicator('capacity')}</span></button></th>
      <th><button class="table-sort ${currentEventsState.sortBy === 'remainingSeats' ? 'active' : ''}" type="button" data-current-event-sort="remainingSeats">Wolne <span class="sort-indicator">${eventSortIndicator('remainingSeats')}</span></button></th>
      <th><button class="table-sort ${currentEventsState.sortBy === 'status' ? 'active' : ''}" type="button" data-current-event-sort="status">Status <span class="sort-indicator">${eventSortIndicator('status')}</span></button></th>
      <th><button class="table-sort ${currentEventsState.sortBy === 'isRegistered' ? 'active' : ''}" type="button" data-current-event-sort="isRegistered">Zapis <span class="sort-indicator">${eventSortIndicator('isRegistered')}</span></button></th>
      <th>Akcja</th>
    </tr>
    ${events.map((event) => `<tr>
      <td>${escapeHtml(event.name)}</td>
      <td>${escapeHtml(event.description ?? '—')}</td>
      <td>${escapeHtml(formatShort(event.eventDatetime))}</td>
      <td>${escapeHtml(event.capacity)}</td>
      <td>${escapeHtml(event.remainingSeats)}</td>
      <td>${escapeHtml(event.status === 'current' ? 'Bieżące' : 'Archiwalne')}</td>
      <td>${escapeHtml(event.isRegistered ? 'Zapisano' : 'Do zapisania')}</td>
      <td><div class="actions">
        <button data-register-id="${event.id}" ${event.isRegistered || !event.remainingSeats ? 'disabled' : ''}>${event.isRegistered ? 'Już zapisano' : event.remainingSeats ? 'Zapisz się' : 'Brak miejsc'}</button>
      </div></td>
    </tr>`).join('')}
  </table>` : '<p>Brak bieżących wydarzeń.</p>';
};

const renderRegistrations = () => {
  const registrations = filterAndSortRegistrations(allRegistrations, registrationsState);
  mineTable.innerHTML = registrations.length ? `<table>
    <tr>
      <th><button class="table-sort ${registrationsState.sortBy === 'eventName' ? 'active' : ''}" type="button" data-registration-sort="eventName">Wydarzenie <span class="sort-indicator">${registrationSortIndicator('eventName')}</span></button></th>
      <th><button class="table-sort ${registrationsState.sortBy === 'eventDatetime' ? 'active' : ''}" type="button" data-registration-sort="eventDatetime">Termin <span class="sort-indicator">${registrationSortIndicator('eventDatetime')}</span></button></th>
      <th><button class="table-sort ${registrationsState.sortBy === 'status' ? 'active' : ''}" type="button" data-registration-sort="status">Status <span class="sort-indicator">${registrationSortIndicator('status')}</span></button></th>
      <th><button class="table-sort ${registrationsState.sortBy === 'canCancel' ? 'active' : ''}" type="button" data-registration-sort="canCancel">Rezygnacja <span class="sort-indicator">${registrationSortIndicator('canCancel')}</span></button></th>
      <th>Akcja</th>
    </tr>
    ${registrations.map((registration) => `<tr>
      <td>${escapeHtml(registration.eventName)}</td>
      <td>${escapeHtml(formatShort(registration.eventDatetime))}</td>
      <td>${escapeHtml(registration.status === 'current' ? 'Bieżące' : 'Archiwalne')}</td>
      <td>${escapeHtml(registration.canCancel ? 'Możliwa' : 'Niedostępna')}</td>
      <td><div class="actions">${registration.canCancel ? `<button class="secondary" data-cancel-id="${registration.eventId}">Rezygnuj</button>` : '<button class="secondary" disabled>Brak możliwości</button>'}</div></td>
    </tr>`).join('')}
  </table>` : '<p>Nie masz jeszcze zapisów.</p>';
};

const renderTabs = (activeTab) => {
  const normalizedTab = normalizePrivateTab(activeTab);
  tabButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === normalizedTab);
    button.setAttribute('aria-selected', String(button.dataset.tab === normalizedTab));
  });
  tabPanels.forEach((panel) => {
    panel.classList.toggle('active', panel.id === `${normalizedTab}-tab`);
  });
};

const renderPrivateDashboard = () => {
  loginSection.classList.add('hidden');
  registrationSection.classList.add('hidden');
  privateArea.classList.remove('hidden');
  renderTabs(defaultPrivateTab);
};

const showLoginView = () => {
  loginSection.classList.remove('hidden');
  registrationSection.classList.add('hidden');
};

const showRegistrationView = () => {
  loginSection.classList.add('hidden');
  registrationSection.classList.remove('hidden');
};

const updateRegistrationAvailability = (enabled) => {
  registrationEnabled = enabled;
  showRegistrationButton.classList.toggle('hidden', !enabled);
  if (!enabled) showLoginView();
};

const resetPrivateView = () => {
  localStorage.removeItem(tokenKey);
  session.textContent = '';
  showLoginView();
  privateArea.classList.add('hidden');
  renderTabs(defaultPrivateTab);
  document.querySelector('#events').textContent = '';
  document.querySelector('#mine').textContent = '';
  eventsFiltersForm?.reset();
  mineFiltersForm?.reset();
  currentEventsState.sortBy = defaultCurrentEventsState.sortBy;
  currentEventsState.sortDirection = defaultCurrentEventsState.sortDirection;
  currentEventsState.filters = { ...defaultCurrentEventsState.filters };
  registrationsState.sortBy = defaultRegistrationsTableState.sortBy;
  registrationsState.sortDirection = defaultRegistrationsTableState.sortDirection;
  registrationsState.filters = { ...defaultRegistrationsTableState.filters };
  allEvents = [];
  allRegistrations = [];
};

async function refreshRegistrationAvailability() {
  try {
    const { enabled } = await api('/api/auth/registration-status');
    updateRegistrationAvailability(Boolean(enabled));
  } catch {
    updateRegistrationAvailability(false);
  }
}

async function refresh() {
  try {
    if (!token()) {
      resetPrivateView();
      return;
    }

    const { user } = await api('/api/auth/me');

    session.innerHTML = createSessionBarMarkup(user.fullName);
    document.querySelector('#logout').onclick = () => {
      localStorage.removeItem(tokenKey);
      location.reload();
    };

    renderPrivateDashboard();

    const [{ events }, { registrations }] = await Promise.all([
      api('/api/events/current'),
      api('/api/me/registrations')
    ]);
    allEvents = events.map((event) => ({
      ...event,
      eventDatetimeDisplay: formatShort(event.eventDatetime)
    }));
    allRegistrations = registrations.map((registration) => ({
      ...registration,
      eventDatetimeDisplay: formatShort(registration.eventDatetime)
    }));
    renderCurrentEvents();
    renderRegistrations();
  } catch (error) {
    if (token()) resetPrivateView();
    message(error.message, true);
  }
}

showRegistrationButton.onclick = () => {
  if (registrationEnabled) showRegistrationView();
};

backToLoginButton.onclick = () => {
  showLoginView();
};

document.querySelectorAll('[data-tab]').forEach((button) => {
  button.onclick = () => {
    if (!isPrivateTab(button.dataset.tab)) return;
    renderTabs(button.dataset.tab);
  };
});

eventsTable.addEventListener('click', async (event) => {
  const sortButton = event.target.closest('[data-current-event-sort]');
  const registerButton = event.target.closest('[data-register-id]');
  if (sortButton) {
    toggleCurrentEventsSort(sortButton.dataset.currentEventSort);
    renderCurrentEvents();
    return;
  }
  if (!registerButton || registerButton.disabled) return;
  try {
    await api(`/api/events/${registerButton.dataset.registerId}/register`, { method: 'POST' });
    message('Zapisano na wydarzenie.');
    refresh();
  } catch (error) {
    if ([401, 403].includes(error.status)) resetPrivateView();
    message(error.message, true);
  }
});

mineTable.addEventListener('click', async (event) => {
  const sortButton = event.target.closest('[data-registration-sort]');
  const cancelButton = event.target.closest('[data-cancel-id]');
  if (sortButton) {
    toggleRegistrationsSort(sortButton.dataset.registrationSort);
    renderRegistrations();
    return;
  }
  if (!cancelButton || cancelButton.disabled) return;
  try {
    await api(`/api/me/registrations/${cancelButton.dataset.cancelId}`, { method: 'DELETE' });
    message('Rezygnacja została zapisana.');
    refresh();
  } catch (error) {
    if ([401, 403].includes(error.status)) resetPrivateView();
    message(error.message, true);
  }
});

document.querySelector('#login-form').onsubmit = async (event) => {
  event.preventDefault();
  try {
    const data = await api('/api/auth/login', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.target))) });
    localStorage.setItem(tokenKey, data.accessToken);
    message(data.message);
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

registrationForm.onsubmit = async (event) => {
  event.preventDefault();
  try {
    const data = Object.fromEntries(new FormData(event.target));
    await api('/api/auth/register', { method: 'POST', body: JSON.stringify(data) });
    event.target.reset();
    showLoginView();
    message('Rejestracja zakończona. Sprawdź e-mail, aby ustawić hasło.');
  } catch (error) {
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
    if ([401, 403].includes(error.status)) resetPrivateView();
    message(error.message, true);
  }
};

eventsFiltersForm.addEventListener('input', syncCurrentEventsFilters);
eventsFiltersForm.addEventListener('change', syncCurrentEventsFilters);
eventsFiltersForm.addEventListener('reset', () => {
  queueMicrotask(() => {
    currentEventsState.sortBy = defaultCurrentEventsState.sortBy;
    currentEventsState.sortDirection = defaultCurrentEventsState.sortDirection;
    currentEventsState.filters = { ...defaultCurrentEventsState.filters };
    renderCurrentEvents();
  });
});

mineFiltersForm.addEventListener('input', syncRegistrationsFilters);
mineFiltersForm.addEventListener('change', syncRegistrationsFilters);
mineFiltersForm.addEventListener('reset', () => {
  queueMicrotask(() => {
    registrationsState.sortBy = defaultRegistrationsTableState.sortBy;
    registrationsState.sortDirection = defaultRegistrationsTableState.sortDirection;
    registrationsState.filters = { ...defaultRegistrationsTableState.filters };
    renderRegistrations();
  });
});

await refreshRegistrationAvailability();
refresh();
