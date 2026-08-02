import test from 'node:test';
import assert from 'node:assert/strict';
import { createUsersRepository } from '../src/repositories/usersRepository.js';

test('czyści konto Auth, gdy zapis profilu zakończy się błędem', async () => {
  let deletedUserId;
  const repo = createUsersRepository({
    auth: {
      admin: {
        inviteUserByEmail: async () => ({ data: { user: { id: 'user-1' } }, error: null }),
        deleteUser: async (id) => {
          deletedUserId = id;
          return { error: null };
        }
      }
    },
    from: () => ({
      insert: async () => ({ error: new Error('PROFILE_INSERT_FAILED') })
    })
  });

  await assert.rejects(() => repo.inviteUser({
    email: 'user@example.com',
    fullName: 'Jan Kowalski',
    role: 'user',
    redirectTo: 'http://localhost:3000/set-password'
  }), (error) => error.message === 'PROFILE_INSERT_FAILED');

  assert.equal(deletedUserId, 'user-1');
});
