import test from 'node:test';
import assert from 'node:assert/strict';
import { filterAndSortRegistrations, sortRegistrations } from '../public/shared/registrationsTable.js';

const registrations = [
  {
    eventName: 'Konferencja',
    eventDatetime: '2026-08-10T10:00:00.000Z',
    status: 'current',
    canCancel: true
  },
  {
    eventName: 'Warsztat',
    eventDatetime: '2026-08-08T10:00:00.000Z',
    status: 'archived',
    canCancel: false
  },
  {
    eventName: 'Szkolenie',
    eventDatetime: '2026-08-09T10:00:00.000Z',
    status: 'current',
    canCancel: false
  }
];

test('filtruje moje zapisy po wszystkich kolumnach danych', () => {
  const filtered = filterAndSortRegistrations(registrations, {
    sortBy: 'eventDatetime',
    sortDirection: 'asc',
    filters: {
      eventName: 'konf',
      eventDatetime: '2026-08-10',
      status: 'current',
      canCancel: 'yes'
    }
  });

  assert.deepEqual(filtered, [registrations[0]]);
});

test('sortuje moje zapisy po dacie i możliwości rezygnacji', () => {
  assert.deepEqual(sortRegistrations(registrations, 'eventDatetime', 'asc').map((registration) => registration.eventName), [
    'Warsztat',
    'Szkolenie',
    'Konferencja'
  ]);

  assert.deepEqual(sortRegistrations(registrations, 'canCancel', 'asc').map((registration) => registration.eventName), [
    'Konferencja',
    'Szkolenie',
    'Warsztat'
  ]);
});
