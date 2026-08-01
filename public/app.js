import { defaultPrivateTab, isPrivateTab, normalizePrivateTab } from './shared/privateTabs.js';

const tokenKey = 'events_access_token';
const notice = document.querySelector('#notice');
const session = document.querySelector('#session');
const loginSection = document.querySelector('#login');
const privateArea = document.querySelector('#private-area');
const tabButtons = document.querySelectorAll('[data-tab]');
const tabPanels = document.querySelectorAll('.tab-panel');

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

const format = (date) => new Intl.DateTimeFormat('pl-PL', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(date));

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
  privateArea.classList.remove('hidden');
  renderTabs(defaultPrivateTab);
};

const resetPrivateView = () => {
  localStorage.removeItem(tokenKey);
  session.textContent = '';
  loginSection.classList.remove('hidden');
  privateArea.classList.add('hidden');
  renderTabs(defaultPrivateTab);
  document.querySelector('#events').textContent = '';
  document.querySelector('#mine').textContent = '';
};

async function refresh() {
  try {
    if (!token()) {
      resetPrivateView();
      return;
    }

    const { user } = await api('/api/auth/me');
    if (user.role === 'admin') {
      window.location.replace('/admin');
      return;
    }

    session.innerHTML = `${user.fullName} <button class="secondary" id="logout">Wyloguj</button>`;
    document.querySelector('#logout').onclick = () => {
      localStorage.removeItem(tokenKey);
      location.reload();
    };

    renderPrivateDashboard();

    const { events } = await api('/api/events/current');
    document.querySelector('#events').innerHTML = events.length
      ? events.map((event) => `<article class="card"><h3>${event.name}</h3><p>${event.description ?? ''}</p><p class="meta">${format(event.eventDatetime)} · ${event.remainingSeats} wolnych z ${event.capacity}</p><button data-id="${event.id}" ${event.isRegistered || !event.remainingSeats ? 'disabled' : ''}>${event.isRegistered ? 'Już zapisano' : event.remainingSeats ? 'Zapisz się' : 'Brak miejsc'}</button></article>`).join('')
      : '<p>Brak bieżących wydarzeń.</p>';

    document.querySelectorAll('#events button').forEach((button) => {
      button.onclick = async () => {
        try {
          await api(`/api/events/${button.dataset.id}/register`, { method: 'POST' });
          message('Zapisano na wydarzenie.');
          refresh();
        } catch (error) {
          if ([401, 403].includes(error.status)) resetPrivateView();
          message(error.message, true);
        }
      };
    });

    const { registrations } = await api('/api/me/registrations');
    document.querySelector('#mine').innerHTML = registrations.length
      ? registrations.map((registration) => `<article class="card"><h3>${registration.eventName}</h3><p class="meta">${format(registration.eventDatetime)}</p></article>`).join('')
      : '<p>Nie masz jeszcze zapisów.</p>';
  } catch (error) {
    if (token()) resetPrivateView();
    message(error.message, true);
  }
}

document.querySelectorAll('[data-tab]').forEach((button) => {
  button.onclick = () => {
    if (!isPrivateTab(button.dataset.tab)) return;
    renderTabs(button.dataset.tab);
  };
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

refresh();
