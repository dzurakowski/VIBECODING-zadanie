import 'dotenv/config';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { serviceSupabase } from '../src/infrastructure/supabaseClient.js';

const TEST_PREFIX = '[TEST]';
const cleanupMode = process.argv.includes('--cleanup');
const required = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'ALLOW_SEED', 'SEED_TEST_PASSWORD'];

const fail = (message) => { throw new Error(message); };
const assertSafeEnvironment = () => {
  if (process.env.NODE_ENV === 'production') fail('Seedowanie jest zablokowane dla NODE_ENV=production.');
  if (process.env.ALLOW_SEED !== 'true') fail('Ustaw ALLOW_SEED=true w lokalnym .env, aby odblokować seedowanie.');
  if (required.some((key) => !process.env[key]?.trim())) fail('Brakuje wymaganej konfiguracji seedowania w lokalnym .env.');
  if (process.env.SEED_TEST_PASSWORD.length < 10) fail('SEED_TEST_PASSWORD musi mieć co najmniej 10 znaków.');
};
const check = ({ error }, message) => { if (error) fail(`${message}: ${error.message}`); };
const confirm = async (word) => {
  const terminal = createInterface({ input: stdin, output: stdout });
  const answer = await terminal.question(`Wpisz ${word}, aby potwierdzić operację: `);
  terminal.close();
  if (answer !== word) fail('Operacja anulowana — nie podano wymaganego potwierdzenia.');
};

const testUsers = [
  { email: 'test-admin@example.test', fullName: `${TEST_PREFIX} Administrator`, role: 'admin' },
  { email: 'test-user-01@example.test', fullName: `${TEST_PREFIX} Użytkownik 01`, role: 'user' },
  { email: 'test-user-02@example.test', fullName: `${TEST_PREFIX} Użytkownik 02`, role: 'user' },
  { email: 'test-user-03@example.test', fullName: `${TEST_PREFIX} Użytkownik 03`, role: 'user' },
  { email: 'test-user-04@example.test', fullName: `${TEST_PREFIX} Użytkownik 04`, role: 'user' },
  { email: 'test-user-05@example.test', fullName: `${TEST_PREFIX} Użytkownik 05`, role: 'user' }
];

const seed = async () => {
  console.log('Plan: 1 administrator, 5 użytkowników, 3 bieżące wydarzenia, 1 archiwalne wydarzenie oraz 3 zapisy.');
  await confirm('SEED');
  const users = [];
  for (const testUser of testUsers) {
    const { data, error } = await serviceSupabase.auth.admin.createUser({
      email: testUser.email,
      password: process.env.SEED_TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { seed: true, full_name: testUser.fullName }
    });
    check({ error }, `Nie udało się utworzyć konta ${testUser.email}`);
    const user = { ...testUser, id: data.user.id };
    users.push(user);
    const result = await serviceSupabase.from('profiles').insert({ id: user.id, email: user.email, full_name: user.fullName, role: user.role, is_active: true });
    check(result, `Nie udało się utworzyć profilu ${testUser.email}`);
  }

  const admin = users.find((user) => user.role === 'admin');
  const eventRows = [
    { name: `${TEST_PREFIX} Wydarzenie pełne`, description: 'Syntetyczne wydarzenie o pełnej liście miejsc.', event_datetime: '2026-12-10T10:00:00.000Z', status: 'current', capacity: 2, created_by: admin.id },
    { name: `${TEST_PREFIX} Wydarzenie z jednym zapisem`, description: 'Syntetyczne wydarzenie z jednym uczestnikiem.', event_datetime: '2026-12-11T10:00:00.000Z', status: 'current', capacity: 3, created_by: admin.id },
    { name: `${TEST_PREFIX} Wydarzenie z wolnymi miejscami`, description: 'Syntetyczne wydarzenie bez zapisów.', event_datetime: '2026-12-12T10:00:00.000Z', status: 'current', capacity: 4, created_by: admin.id },
    { name: `${TEST_PREFIX} Wydarzenie archiwalne`, description: 'Syntetyczne wydarzenie archiwalne bez zapisów.', event_datetime: '2026-11-01T10:00:00.000Z', status: 'archived', capacity: 2, created_by: admin.id }
  ];
  const { data: events, error: eventsError } = await serviceSupabase.from('events').insert(eventRows).select('id, name');
  check({ error: eventsError }, 'Nie udało się utworzyć wydarzeń testowych');
  const eventByName = new Map(events.map((event) => [event.name, event.id]));
  const registrations = [
    { event_id: eventByName.get(`${TEST_PREFIX} Wydarzenie pełne`), user_id: users[1].id },
    { event_id: eventByName.get(`${TEST_PREFIX} Wydarzenie pełne`), user_id: users[2].id },
    { event_id: eventByName.get(`${TEST_PREFIX} Wydarzenie z jednym zapisem`), user_id: users[3].id }
  ];
  check(await serviceSupabase.from('registrations').insert(registrations), 'Nie udało się utworzyć zapisów testowych');
  console.log('Seedowanie zakończone: utworzono 6 kont Auth/profili, 4 wydarzenia i 3 zapisy.');
};

const cleanup = async () => {
  console.log('Plan: usunięcie wyłącznie rekordów oznaczonych prefiksem [TEST] oraz odpowiadających im kont Auth.');
  await confirm('CLEANUP');
  const { data: profiles, error: profilesError } = await serviceSupabase.from('profiles').select('id').like('full_name', `${TEST_PREFIX}%`);
  check({ error: profilesError }, 'Nie udało się pobrać profili testowych');
  const userIds = profiles.map((profile) => profile.id);
  const { data: events, error: eventsError } = await serviceSupabase.from('events').select('id').like('name', `${TEST_PREFIX}%`);
  check({ error: eventsError }, 'Nie udało się pobrać wydarzeń testowych');
  const eventIds = events.map((event) => event.id);
  if (userIds.length) check(await serviceSupabase.from('registrations').delete().in('user_id', userIds), 'Nie udało się usunąć zapisów użytkowników testowych');
  if (eventIds.length) check(await serviceSupabase.from('registrations').delete().in('event_id', eventIds), 'Nie udało się usunąć zapisów wydarzeń testowych');
  if (eventIds.length) check(await serviceSupabase.from('events').delete().in('id', eventIds), 'Nie udało się usunąć wydarzeń testowych');
  if (userIds.length) check(await serviceSupabase.from('profiles').delete().in('id', userIds), 'Nie udało się usunąć profili testowych');
  for (const userId of userIds) check(await serviceSupabase.auth.admin.deleteUser(userId), `Nie udało się usunąć konta Auth ${userId}`);
  console.log(`Czyszczenie zakończone: usunięto ${userIds.length} kont testowych i ${eventIds.length} wydarzeń testowych.`);
};

try {
  assertSafeEnvironment();
  await (cleanupMode ? cleanup() : seed());
} catch (error) {
  console.error(`Błąd: ${error.message}`);
  process.exitCode = 1;
}
