import test from 'node:test';
import assert from 'node:assert/strict';
import { filterAndSortUsers, renderUserRow, sortUsers } from '../public/shared/userTable.js';

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

test('escapuje imię, e-mail i rolę w wierszu użytkownika (ochrona przed stored XSS)', () => {
  const markup = renderUserRow({
    id: 'user-1',
    full_name: '<img src=x onerror=alert(1)>',
    email: '"><script>alert(1)</script>@evil.example',
    role: 'user',
    is_active: true
  });

  assert.doesNotMatch(markup, /<img/);
  assert.doesNotMatch(markup, /<script>/);
  assert.match(markup, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(markup, /&quot;&gt;&lt;script&gt;alert\(1\)&lt;\/script&gt;@evil\.example/);
});

test('renderuje status i akcje na podstawie is_active', () => {
  const active = renderUserRow({ id: 'a', full_name: 'Jan', email: 'jan@example.com', role: 'user', is_active: true });
  const inactive = renderUserRow({ id: 'b', full_name: 'Ala', email: 'ala@example.com', role: 'admin', is_active: false });

  assert.match(active, /Aktywne/);
  assert.match(active, /data-user-action="deactivate" data-id="a"/);
  assert.match(inactive, /Nieaktywne/);
  assert.match(inactive, /data-user-action="restore" data-id="b"/);
});
