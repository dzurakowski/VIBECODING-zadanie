import test from 'node:test';
import assert from 'node:assert/strict';
import { filterAndSortCurrentEvents, sortCurrentEvents } from '../public/shared/currentEventsTable.js';

const events = [
  {
    name: 'Konferencja',
    description: 'Spotkanie branżowe',
    eventDatetime: '2026-08-10T10:00:00.000Z',
    capacity: 20,
    remainingSeats: 8,
    status: 'current',
    isRegistered: false
  },
  {
    name: 'Warsztat',
    description: 'Praktyka i ćwiczenia',
    eventDatetime: '2026-08-08T10:00:00.000Z',
    capacity: 10,
    remainingSeats: 0,
    status: 'current',
    isRegistered: true
  },
  {
    name: 'Szkolenie',
    description: 'Wprowadzenie do systemu',
    eventDatetime: '2026-08-09T10:00:00.000Z',
    capacity: 15,
    remainingSeats: 12,
    status: 'archived',
    isRegistered: false
  }
];

test('filtruje bieżące wydarzenia po wszystkich kolumnach danych', () => {
  const filtered = filterAndSortCurrentEvents(events, {
    sortBy: 'eventDatetime',
    sortDirection: 'asc',
    filters: {
      name: 'konf',
      description: 'branż',
      eventDatetime: '2026-08-10',
      capacity: '20',
      remainingSeats: '8',
      status: 'current',
      isRegistered: 'no'
    }
  });

  assert.deepEqual(filtered, [events[0]]);
});

test('sortuje bieżące wydarzenia po dacie i statusie zapisu', () => {
  assert.deepEqual(sortCurrentEvents(events, 'eventDatetime', 'asc').map((event) => event.name), [
    'Warsztat',
    'Szkolenie',
    'Konferencja'
  ]);

  assert.deepEqual(sortCurrentEvents(events, 'isRegistered', 'asc').map((event) => event.name), [
    'Warsztat',
    'Konferencja',
    'Szkolenie'
  ]);
});
