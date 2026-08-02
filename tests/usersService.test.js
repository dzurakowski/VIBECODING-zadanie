import test from 'node:test';
import assert from 'node:assert/strict';
import { createUsersService } from '../src/services/usersService.js';
import { HttpError } from '../src/utils/http.js';

test('blokuje zdegradowanie ostatniego aktywnego administratora', async () => {
  let updated = false;
  const service = createUsersService({
    find: async () => ({ id: 'admin-1', role: 'admin' }),
    countAdmins: async () => 1,
    update: async () => {
      updated = true;
    }
  }, 'http://localhost:3000');

  await assert.rejects(() => service.update('admin-1', { role: 'user' }), (error) => error instanceof HttpError && error.status === 409);
  assert.equal(updated, false);
});

test('blokuje wyłączenie ostatniego aktywnego administratora', async () => {
  let changed = false;
  const service = createUsersService({
    find: async () => ({ id: 'admin-1', role: 'admin' }),
    countAdmins: async () => 1,
    setActive: async () => {
      changed = true;
    }
  }, 'http://localhost:3000');

  await assert.rejects(() => service.setActive('admin-1', false, 'other-admin'), (error) => error instanceof HttpError && error.status === 409);
  assert.equal(changed, false);
});

test('pozwala zmienić rolę admina, jeśli istnieje drugi aktywny administrator', async () => {
  let updatedValues;
  const service = createUsersService({
    find: async () => ({ id: 'admin-1', role: 'admin' }),
    countAdmins: async () => 2,
    update: async (id, values) => {
      updatedValues = { id, values };
      return { id, ...values };
    }
  }, 'http://localhost:3000');

  const result = await service.update('admin-1', { role: 'user' });

  assert.deepEqual(updatedValues, {
    id: 'admin-1',
    values: { role: 'user' }
  });
  assert.deepEqual(result, { id: 'admin-1', role: 'user' });
});
