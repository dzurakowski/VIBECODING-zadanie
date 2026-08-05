import { parseSessionTokensFromHash, writeSessionTokens } from './shared/sessionTokens.js';
import { showInvalidSetPasswordView, showValidSetPasswordView } from './shared/setPasswordView.js';

const notice = document.querySelector('#notice');
const message = (text, error = false) => { notice.textContent = text; notice.className = `notice ${error ? 'error' : ''}`; };
const form = document.querySelector('#set-password-form');
const tokens = parseSessionTokensFromHash(window.location.hash);
const token = tokens?.accessToken ?? '';
if (tokens) writeSessionTokens(tokens);
if (!token) {
  showInvalidSetPasswordView({
    form,
    notice,
    message: 'Link jest nieprawidłowy lub wygasł. Poproś o nowy link.'
  });
} else {
  showValidSetPasswordView({ form, notice });
}
form.onsubmit = async (event) => { event.preventDefault(); try { const response = await fetch('/api/auth/set-password', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify(Object.fromEntries(new FormData(event.target))) }); const data = await response.json(); if (!response.ok) throw Error(data.message); message(data.message); setTimeout(() => window.location.assign('/'), 1200); } catch (error) { message(error.message, true); } };
