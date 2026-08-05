export const sessionStorageKey = 'events_session';

const parseStoredValue = (value) => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object') {
      const accessToken = typeof parsed.accessToken === 'string' ? parsed.accessToken : '';
      const refreshToken = typeof parsed.refreshToken === 'string' ? parsed.refreshToken : '';
      if (accessToken) return { accessToken, refreshToken };
    }
  } catch {}
  if (typeof value === 'string' && value.trim()) {
    return { accessToken: value.trim(), refreshToken: '' };
  }
  return null;
};

export const parseSessionTokensFromHash = (hash) => {
  const source = typeof hash === 'string' ? hash : '';
  const query = source.startsWith('#') ? source.slice(1) : source;
  const params = new URLSearchParams(query);
  const accessToken = params.get('access_token') ?? '';
  if (!accessToken) return null;
  return {
    accessToken,
    refreshToken: params.get('refresh_token') ?? ''
  };
};

export const readSessionTokens = (storage = localStorage) => parseStoredValue(storage.getItem(sessionStorageKey));

export const writeSessionTokens = (tokens, storage = localStorage) => {
  if (!tokens?.accessToken) return;
  storage.setItem(sessionStorageKey, JSON.stringify({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken ?? ''
  }));
};

export const clearSessionTokens = (storage = localStorage) => {
  storage.removeItem(sessionStorageKey);
};

