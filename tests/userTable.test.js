import test from 'node:test';
import assert from 'node:assert/strict';
import { filterAndSortUsers, sortUsers } from '../public/shared/userTable.js';

const users = [
  { full_name: 'Jan Kowalski', email: 'jan@example.com', role: 'user', is_active: true },
  { full_name: 'Anna Nowak', email: 'anna@example.com', role: 'admin', is_active: false },
  { full_name: 'Beata Zając', email: 'beata@example.com', role: 'user', is_active: true }
];

test('filtruje po wszystkich kolumnach danych', () => {
  assert.deepEqual(filterAndSortUsers(users, {
    sortBy: 'full_name',
    sortDirection: 'asc',
    filters: {
      fullName: 'now',
      email: 'anna@',
      role: 'admin',
      status: 'inactive'
    }
  }), [users[1]]);
});

test('sortuje po wybranej kolumnie', () => {
  assert.deepEqual(sortUsers(users, 'email', 'asc').map((user) => user.email), [
    'anna@example.com',
    'beata@example.com',
    'jan@example.com'
  ]);
});

test('sortuje status tak, aby aktywni byli pierwsi przy sortowaniu rosnącym', () => {
  assert.deepEqual(sortUsers(users, 'is_active', 'asc').map((user) => user.full_name), [
    'Beata Zając',
    'Jan Kowalski',
    'Anna Nowak'
  ]);
});
