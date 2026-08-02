import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthService } from '../src/services/authService.js';
import { HttpError } from '../src/utils/http.js';

test('rejestruje użytkownika gdy rejestracja jest włączona', async () => {
  let invited;
  const service = createAuthService({}, {}, {
    inviteUser: async (input) => { invited = input; }
  }, {
    registrationStatus: async () => true
  }, 'http://localhost:3000');

  const result = await service.register({ email: 'USER@example.com', fullName: ' Jan Kowalski ' });

  assert.deepEqual(invited, {
    email: 'user@example.com',
    fullName: 'Jan Kowalski',
    role: 'user',
    redirectTo: 'http://localhost:3000/set-password'
  });
  assert.deepEqual(result, { email: 'user@example.com' });
});

test('blokuje rejestrację gdy opcja jest wyłączona', async () => {
  const service = createAuthService({}, {}, { inviteUser: async () => {} }, {
    registrationStatus: async () => false
  }, 'http://localhost:3000');

  await assert.rejects(() => service.register({ email: 'user@example.com', fullName: 'Jan Kowalski' }), (error) => error instanceof HttpError && error.status === 403);
});
