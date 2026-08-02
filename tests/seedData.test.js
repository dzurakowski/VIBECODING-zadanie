import test from 'node:test';
import assert from 'node:assert/strict';
import {
  KEEP_ADMIN,
  buildResetPlan,
  createSeedEventBlueprints,
  createSeedRegistrationRows,
  createSeedUsers
} from '../scripts/seed-data.js';

const toUsersByEmail = (users) => new Map(users.map((user, index) => [user.email, { id: `user-${index + 1}`, ...user }]));
const toEventsByName = (events) => new Map(events.map((event, index) => [event.name, { id: `event-${index + 1}`, ...event }]));

test('generuje pięciokrotnie większy zestaw użytkowników z zachowaniem ról i konta Dariusza', () => {
  const users = createSeedUsers();
  const admins = users.filter((user) => user.role === 'admin');
  const regularUsers = users.filter((user) => user.role === 'user');

  assert.equal(users.length, 30);
  assert.equal(admins.length, 5);
  assert.equal(regularUsers.length, 25);
  assert.ok(users.some((user) => user.email === KEEP_ADMIN.email));
  assert.ok(users.some((user) => user.fullName === KEEP_ADMIN.fullName));
  assert.ok(users.some((user) => user.isActive === false));
});

test('generuje 20 zróżnicowanych wydarzeń obejmujących wszystkie kluczowe przypadki', () => {
  const events = createSeedEventBlueprints();
  const current = events.filter((event) => event.status === 'current');
  const archived = events.filter((event) => event.status === 'archived');
  const withDescriptions = events.filter((event) => event.description);
  const withoutDescriptions = events.filter((event) => event.description === null);
  const fullEvents = events.filter((event) => event.capacity === event.registrantEmails.length);

  assert.equal(events.length, 20);
  assert.ok(current.length > 0);
  assert.ok(archived.length > 0);
  assert.ok(withDescriptions.length > 0);
  assert.ok(withoutDescriptions.length > 0);
  assert.ok(fullEvents.length > 0);
  assert.ok(events.some((event) => new Date(event.eventDatetime) < new Date('2026-08-02T12:00:00.000Z')));
  assert.ok(events.some((event) => new Date(event.eventDatetime) > new Date('2026-08-02T12:00:00.000Z')));
});

test('buduje zapisane dane zgodne z mapowaniem użytkowników i wydarzeń', () => {
  const users = createSeedUsers();
  const events = createSeedEventBlueprints();
  const usersByEmail = toUsersByEmail(users);
  const eventsByName = toEventsByName(events);
  const registrations = createSeedRegistrationRows(usersByEmail, eventsByName);

  assert.ok(registrations.length > 20);
  assert.ok(registrations.every((registration) => registration.event_id.startsWith('event-')));
  assert.ok(registrations.every((registration) => registration.user_id.startsWith('user-')));
});

test('plan resetu zachowuje wyłącznie konto Dariusza', () => {
  const profiles = [
    { id: 'keep-1', email: KEEP_ADMIN.email, full_name: KEEP_ADMIN.fullName },
    { id: 'remove-1', email: 'anna.nowak@example.test', full_name: 'Anna Nowak' },
    { id: 'remove-2', email: 'bartosz.zielinski@example.test', full_name: 'Bartosz Zielinski' }
  ];
  const authUsers = [
    { id: 'keep-1', email: KEEP_ADMIN.email, user_metadata: { full_name: KEEP_ADMIN.fullName } },
    { id: 'remove-1', email: 'anna.nowak@example.test', user_metadata: { full_name: 'Anna Nowak' } },
    { id: 'remove-2', email: 'bartosz.zielinski@example.test', user_metadata: { full_name: 'Bartosz Zielinski' } }
  ];
  const events = [
    { id: 'event-1' },
    { id: 'event-2' }
  ];

  const plan = buildResetPlan({ authUsers, profiles, events, keepAdmin: KEEP_ADMIN });

  assert.equal(plan.preservedUserId, 'keep-1');
  assert.deepEqual(plan.profileIdsToDelete.sort(), ['remove-1', 'remove-2']);
  assert.deepEqual(plan.authUserIdsToDelete.sort(), ['remove-1', 'remove-2']);
  assert.deepEqual(plan.eventIdsToDelete.sort(), ['event-1', 'event-2']);
});
