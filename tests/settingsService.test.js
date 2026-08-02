import test from 'node:test';
import assert from 'node:assert/strict';
import { createSettingsService } from '../src/services/settingsService.js';
import { HttpError } from '../src/utils/http.js';

test('czyta i zapisuje ustawienie rejestracji', async () => {
  let stored = true;
  const service = createSettingsService({
    getRegistrationEnabled: async () => stored,
    setRegistrationEnabled: async (enabled) => {
      stored = enabled;
      return stored;
    }
  });

  assert.equal(await service.registrationStatus(), true);
  assert.equal(await service.setRegistrationEnabled(false), false);
  assert.equal(stored, false);
});

test('odrzuca nieprawidłową wartość przełącznika', async () => {
  const service = createSettingsService({
    getRegistrationEnabled: async () => true,
    setRegistrationEnabled: async () => true
  });

  await assert.rejects(() => service.setRegistrationEnabled('yes'), (error) => error instanceof HttpError && error.status === 400);
});
