import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthService } from '../src/services/authService.js';

test('odświeża sesję i zwraca nowy zestaw tokenów oraz profil', async () => {
  let refreshInput;
  const service = createAuthService({
    auth: {
      refreshSession: async (input) => {
        refreshInput = input;
        return {
          data: {
            session: {
              access_token: 'new-access',
              refresh_token: 'new-refresh'
            },
            user: {
              id: 'user-1'
            }
          },
          error: null
        };
      }
    }
  }, {}, {
    find: async (id) => ({
      id,
      email: 'user@example.test',
      full_name: 'Jan Kowalski',
      role: 'user'
    })
  }, {
    registrationStatus: async () => true
  }, 'http://localhost:3000');

  const result = await service.refresh({ refreshToken: 'old-refresh' });

  assert.deepEqual(refreshInput, { refresh_token: 'old-refresh' });
  assert.deepEqual(result, {
    user: {
      id: 'user-1',
      email: 'user@example.test',
      fullName: 'Jan Kowalski',
      role: 'user'
    },
    accessToken: 'new-access',
    refreshToken: 'new-refresh'
  });
});

