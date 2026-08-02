const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;'
}[character]));

export const createSessionBarMarkup = (fullName, { showSwitchLink = false, switchHref = '/', switchLabel = 'Widok użytkownika' } = {}) => {
  const link = showSwitchLink ? `<a href="${escapeHtml(switchHref)}" style="color:white">${escapeHtml(switchLabel)}</a>` : '';
  return `<div class="session-bar">${link}<span class="session-name">${escapeHtml(fullName)}</span><button class="secondary logout" id="logout">Wyloguj</button></div>`;
};
