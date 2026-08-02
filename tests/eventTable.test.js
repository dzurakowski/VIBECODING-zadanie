import test from 'node:test';
import assert from 'node:assert/strict';
import { filterAndSortEvents, sortEvents } from '../public/shared/eventTable.js';

const events = [
  {
    name: 'Konferencja',
    description: 'Spotkanie branżowe',
    eventDatetime: '2026-08-10T10:00:00.000Z',
    eventDatetimeDisplay: '10 sie 2026, 12:00',
    capacity: 20,
    registeredCount: 12,
    remainingSeats: 8,
    status: 'current',
    participantsText: 'Anna Kowalska <anna@example.com>'
  },
  {
    name: 'Warsztat',
    description: 'Praktyka i ćwiczenia',
    eventDatetime: '2026-08-08T10:00:00.000Z',
    eventDatetimeDisplay: '08 sie 2026, 12:00',
    capacity: 10,
    registeredCount: 10,
    remainingSeats: 0,
    status: 'archived',
    participantsText: 'Jan Nowak <jan@example.com>'
  },
  {
    name: 'Szkolenie',
    description: 'Wprowadzenie do systemu',
    eventDatetime: '2026-08-09T10:00:00.000Z',
    eventDatetimeDisplay: '09 sie 2026, 12:00',
    capacity: 15,
    registeredCount: 3,
    remainingSeats: 12,
    status: 'current',
    participantsText: 'Beata Zając <beata@example.com>'
  }
];

test('filtruje wydarzenia po wszystkich kolumnach danych', () => {
  const filtered = filterAndSortEvents(events, {
    sortBy: 'eventDatetime',
    sortDirection: 'asc',
    filters: {
      name: 'szko',
      description: 'wprowadzenie',
      eventDatetime: '09 sie',
      capacity: '15',
      registeredCount: '3',
      remainingSeats: '12',
      status: 'current',
      participants: 'beata@'
    }
  });

  assert.deepEqual(filtered, [events[2]]);
});

test('sortuje wydarzenia po dacie i pojemności', () => {
  assert.deepEqual(sortEvents(events, 'eventDatetime', 'asc').map((event) => event.name), [
    'Warsztat',
    'Szkolenie',
    'Konferencja'
  ]);

  assert.deepEqual(sortEvents(events, 'capacity', 'desc').map((event) => event.capacity), [20, 15, 10]);
});

test('sortuje status tak, aby bieżące były pierwsze przy sortowaniu rosnącym', () => {
  assert.deepEqual(sortEvents(events, 'status', 'asc').map((event) => event.name), [
    'Konferencja',
    'Szkolenie',
    'Warsztat'
  ]);
});
