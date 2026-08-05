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

test('wysyła magic link na poprawny adres e-mail', async () => {
  let request;
  const service = createAuthService({
    auth: {
      signInWithOtp: async (input) => {
        request = input;
        return { error: null };
      }
    }
  }, {}, { inviteUser: async () => {} }, {
    registrationStatus: async () => true
  }, 'http://localhost:3000');

  await service.magicLink({ email: 'USER@example.com' });

  assert.deepEqual(request, {
    email: 'user@example.com',
    options: {
      emailRedirectTo: 'http://localhost:3000'
    }
  });
});

test('zgłasza błąd gdy nie da się wysłać magic linku', async () => {
  const service = createAuthService({
    auth: {
      signInWithOtp: async () => ({ error: new Error('redirect URL is not allowed') })
    }
  }, {}, { inviteUser: async () => {} }, {
    registrationStatus: async () => true
  }, 'http://localhost:3000');

  await assert.rejects(
    () => service.magicLink({ email: 'user@example.com' }),
    (error) => error instanceof HttpError
      && error.status === 400
      && error.message.includes('redirect URL is not allowed')
  );
});
