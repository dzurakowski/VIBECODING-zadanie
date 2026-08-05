import test from 'node:test';
import assert from 'node:assert/strict';
import { clearSessionTokens, parseSessionTokensFromHash, readSessionTokens, sessionStorageKey, writeSessionTokens } from '../public/shared/sessionTokens.js';

test('parsuje access i refresh token z hasha', () => {
  const tokens = parseSessionTokensFromHash('#access_token=abc123&refresh_token=def456');
  assert.deepEqual(tokens, { accessToken: 'abc123', refreshToken: 'def456' });
});

test('zapisuje i odczytuje tokeny sesji w localStorage', () => {
  const storage = new Map();
  storage.getItem = storage.get.bind(storage);
  storage.setItem = storage.set.bind(storage);
  storage.removeItem = storage.delete.bind(storage);

  writeSessionTokens({ accessToken: 'abc123', refreshToken: 'def456' }, storage);

  assert.equal(storage.getItem(sessionStorageKey), JSON.stringify({ accessToken: 'abc123', refreshToken: 'def456' }));
  assert.deepEqual(readSessionTokens(storage), { accessToken: 'abc123', refreshToken: 'def456' });

  clearSessionTokens(storage);
  assert.equal(storage.getItem(sessionStorageKey), undefined);
});

