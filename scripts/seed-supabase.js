import 'dotenv/config';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { serviceSupabase } from '../src/infrastructure/supabaseClient.js';
import {
  KEEP_ADMIN,
  buildResetPlan,
  createSeedEventRows,
  createSeedEventBlueprints,
  createSeedRegistrationRows,
  createSeedUsers
} from './seed-data.js';

const cleanupMode = process.argv.includes('--cleanup') || process.argv.includes('--reset');
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

const listAllAuthUsers = async () => {
  const users = [];
  let page = 1;
  while (true) {
    const { data, error } = await serviceSupabase.auth.admin.listUsers({ page, perPage: 1000 });
    check({ error }, 'Nie udało się pobrać listy kont Auth');
    users.push(...data.users);
    if (!data.nextPage) break;
    page = data.nextPage;
  }
  return users;
};

const seed = async () => {
  const users = createSeedUsers();
  const events = createSeedEventBlueprints();
  const registrationCount = events.reduce((sum, event) => sum + event.registrantEmails.length, 0);
  console.log(`Plan: ${users.filter((user) => user.role === 'admin').length} administratorów, ${users.filter((user) => user.role === 'user').length} użytkowników, ${events.length} wydarzeń i ${registrationCount} zapisów.`);
  await confirm('SEED');
  const insertedUsers = [];
  for (const testUser of users) {
    const { data, error } = await serviceSupabase.auth.admin.createUser({
      email: testUser.email,
      password: process.env.SEED_TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { seed: true, full_name: testUser.fullName, role: testUser.role }
    });
    check({ error }, `Nie udało się utworzyć konta ${testUser.email}`);
    const user = { ...testUser, id: data.user.id };
    insertedUsers.push(user);
    const result = await serviceSupabase.from('profiles').insert({ id: user.id, email: user.email, full_name: user.fullName, role: user.role, is_active: user.isActive });
    check(result, `Nie udało się utworzyć profilu ${testUser.email}`);
    if (!user.isActive) {
      const { error: banError } = await serviceSupabase.auth.admin.updateUserById(user.id, { ban_duration: '876000h' });
      check({ error: banError }, `Nie udało się zablokować konta ${testUser.email}`);
    }
  }

  const usersByEmail = new Map(insertedUsers.map((user) => [user.email, user]));
  const eventRows = createSeedEventRows(usersByEmail);
  const { data: insertedEvents, error: eventsError } = await serviceSupabase.from('events').insert(eventRows).select('id, name');
  check({ error: eventsError }, 'Nie udało się utworzyć wydarzeń testowych');
  const eventsByName = new Map(insertedEvents.map((event) => [event.name, event]));
  const registrations = createSeedRegistrationRows(usersByEmail, eventsByName);
  if (registrations.length) {
    check(await serviceSupabase.from('registrations').insert(registrations), 'Nie udało się utworzyć zapisów testowych');
  }
  console.log(`Seedowanie zakończone: utworzono ${insertedUsers.length} kont Auth/profili, ${insertedEvents.length} wydarzeń i ${registrations.length} zapisów.`);
};

const cleanup = async () => {
  console.log(`Plan: usunięcie wszystkich wydarzeń i wszystkich kont poza ${KEEP_ADMIN.fullName} <${KEEP_ADMIN.email}>.`);
  await confirm('RESET');
  const { data: profiles, error: profilesError } = await serviceSupabase.from('profiles').select('id, email, full_name');
  check({ error: profilesError }, 'Nie udało się pobrać profili');
  const { data: events, error: eventsError } = await serviceSupabase.from('events').select('id');
  check({ error: eventsError }, 'Nie udało się pobrać wydarzeń');
  const authUsers = await listAllAuthUsers();
  const plan = buildResetPlan({ authUsers, profiles, events, keepAdmin: KEEP_ADMIN });

  if (events.length) check(await serviceSupabase.from('registrations').delete(), 'Nie udało się usunąć zapisów');
  if (events.length) check(await serviceSupabase.from('events').delete(), 'Nie udało się usunąć wydarzeń');
  if (plan.profileIdsToDelete.length) check(await serviceSupabase.from('profiles').delete().in('id', plan.profileIdsToDelete), 'Nie udało się usunąć profili');
  for (const userId of plan.authUserIdsToDelete) {
    check(await serviceSupabase.auth.admin.deleteUser(userId), `Nie udało się usunąć konta Auth ${userId}`);
  }

  console.log(`Czyszczenie zakończone: zachowano ${KEEP_ADMIN.fullName}, usunięto ${plan.profileIdsToDelete.length} profili, ${plan.authUserIdsToDelete.length} kont Auth i ${events.length} wydarzeń.`);
};

try {
  assertSafeEnvironment();
  await (cleanupMode ? cleanup() : seed());
} catch (error) {
  console.error(`Błąd: ${error.message}`);
  process.exitCode = 1;
}
