const key = 'events_access_token';
const notice = document.querySelector('#notice');

const api = async (path, options = {}) => {
  const response = await fetch(path, { ...options, headers: { 'content-type': 'application/json', authorization: `Bearer ${localStorage.getItem(key)}` } });
  const data = await response.json();
  if (!response.ok) throw Error(data.message);
  return data;
};
const message = (text, isError = false) => { notice.textContent = text; notice.className = `notice ${isError ? 'error' : ''}`; };
const clearError = () => { if (notice.classList.contains('error')) { notice.textContent = ''; notice.className = 'notice hidden'; } };
const formatDate = (date) => new Date(date).toLocaleString('pl-PL');

async function refresh() {
  try {
    const { user } = await api('/api/auth/me');
    if (user.role !== 'admin') throw Error('Konto nie ma roli administratora.');
    clearError();
    document.querySelector('#login').classList.add('hidden');
    document.querySelector('#dashboard').classList.remove('hidden');
    const [{ events }, { users }] = await Promise.all([api('/api/admin/events'), api('/api/admin/users')]);
    const eventsWithRegistrations = await Promise.all(events.map(async (event) => ({ event, registrations: (await api(`/api/admin/events/${event.id}/registrations`)).registrations })));
    document.querySelector('#events').innerHTML = eventsWithRegistrations.map(({ event, registrations }) => `
      <article class="card"><h3>${event.name}</h3>
      <p class="meta">${formatDate(event.eventDatetime)} · ${event.registeredCount}/${event.capacity} miejsc · ${event.status}</p>
      <h4>Uczestnicy (${registrations.length})</h4>
      ${registrations.length ? `<ul class="participants">${registrations.map((registration) => `<li>${registration.profiles.full_name} <span>${registration.profiles.email}</span></li>`).join('')}</ul>` : '<p class="meta">Brak zapisanych użytkowników.</p>'}
      <div class="actions"><button data-action="status" data-id="${event.id}" data-status="${event.status}">${event.status === 'current' ? 'Archiwizuj' : 'Przywróć'}</button><button class="danger" data-action="reset" data-id="${event.id}">Reset zapisów</button></div></article>`).join('') || '<p>Brak wydarzeń.</p>';
    document.querySelector('#users').innerHTML = `<table><tr><th>Imię i nazwisko</th><th>E-mail</th><th>Rola</th></tr>${users.map((userRow) => `<tr><td>${userRow.full_name}</td><td>${userRow.email}</td><td>${userRow.role}</td></tr>`).join('')}</table>`;
    document.querySelectorAll('#events button').forEach((button) => { button.onclick = async () => { try {
      if (button.dataset.action === 'status') await api(`/api/admin/events/${button.dataset.id}/${button.dataset.status === 'current' ? 'archive' : 'restore'}`, { method: 'POST' });
      if (button.dataset.action === 'reset') { if (!confirm('Usunąć wszystkie zapisy?')) return; await api(`/api/admin/events/${button.dataset.id}/reset`, { method: 'POST' }); }
      message('Zapisano zmianę.'); refresh();
    } catch (error) { message(error.message, true); } }; });
  } catch (error) { message(error.message, true); }
}

document.querySelector('#login-form').onsubmit = async (event) => { event.preventDefault(); try { const data = await api('/api/auth/login', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.target))) }); localStorage.setItem(key, data.accessToken); refresh(); } catch (error) { message(error.message, true); } };
document.querySelector('#event-form').onsubmit = async (event) => { event.preventDefault(); try { const data = Object.fromEntries(new FormData(event.target)); data.capacity = Number(data.capacity); data.eventDatetime = new Date(data.eventDatetime).toISOString(); await api('/api/admin/events', { method: 'POST', body: JSON.stringify(data) }); event.target.reset(); message('Utworzono wydarzenie.'); refresh(); } catch (error) { message(error.message, true); } };
document.querySelector('#user-form').onsubmit = async (event) => { event.preventDefault(); try { await api('/api/admin/users', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.target))) }); event.target.reset(); message('Utworzono użytkownika.'); refresh(); } catch (error) { message(error.message, true); } };
if (localStorage.getItem(key)) refresh();
