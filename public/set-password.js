const token = new URLSearchParams(window.location.hash.slice(1)).get('access_token');
const notice = document.querySelector('#notice');
const message = (text, error = false) => { notice.textContent = text; notice.className = `notice ${error ? 'error' : ''}`; };
if (!token) { message('Link jest nieprawidłowy lub wygasł. Poproś o nowy link.', true); document.querySelector('#set-password-form').classList.add('hidden'); }
document.querySelector('#set-password-form').onsubmit = async (event) => { event.preventDefault(); try { const response = await fetch('/api/auth/set-password', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify(Object.fromEntries(new FormData(event.target))) }); const data = await response.json(); if (!response.ok) throw Error(data.message); message(data.message); setTimeout(() => window.location.assign('/'), 1200); } catch (error) { message(error.message, true); } };
