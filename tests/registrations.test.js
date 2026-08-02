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

test('pozwala zrezygnować z przyszłego wydarzenia', async () => {
  let removed = false;
  const service = createRegistrationsService({
    mine: async () => ([{ id: 'reg', event_id: 'event', events: { event_datetime: '2026-08-03T10:00:00.000Z' } }]),
    removeOwn: async () => { removed = true; return { id: 'reg' }; }
  }, () => new Date('2026-08-02T10:00:00.000Z'));

  await service.cancel('event', 'user');

  assert.equal(removed, true);
});

test('blokuje rezygnację z przeszłego wydarzenia', async () => {
  let removed = false;
  const service = createRegistrationsService({
    mine: async () => ([{ id: 'reg', event_id: 'event', events: { event_datetime: '2026-08-01T10:00:00.000Z' } }]),
    removeOwn: async () => { removed = true; return { id: 'reg' }; }
  }, () => new Date('2026-08-02T10:00:00.000Z'));

  await assert.rejects(() => service.cancel('event', 'user'), (error) => error instanceof HttpError && error.status === 409 && error.message.includes('już się odbyło'));
  assert.equal(removed, false);
});
