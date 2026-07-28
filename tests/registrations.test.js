import test from 'node:test';
import assert from 'node:assert/strict';
import { createRegistrationsService } from '../src/services/registrationsService.js';
import { HttpError } from '../src/utils/http.js';

test('mapuje konflikt duplikatu na komunikat biznesowy', async () => {
  const service = createRegistrationsService({ register: async () => { throw new Error('ALREADY_REGISTERED'); } });
  await assert.rejects(() => service.register('event', 'user'), (error) => error instanceof HttpError && error.status === 409 && error.message.includes('już zapisany'));
});

test('zwraca utworzony zapis', async () => {
  const service = createRegistrationsService({ register: async () => ({ id: 'reg', event_id: 'event', user_id: 'user' }) });
  assert.deepEqual(await service.register('event', 'user'), { id: 'reg', eventId: 'event', userId: 'user' });
});
