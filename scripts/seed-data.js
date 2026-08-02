export const TEST_PREFIX = '[TEST]';
export const KEEP_ADMIN = Object.freeze({
  email: 'dariusz@example.test',
  fullName: 'Dariusz Administrator'
});

const seedReferenceDate = new Date('2026-08-02T12:00:00.000Z');
const POLISH_TRANSLITERATION = new Map([
  ['ą', 'a'],
  ['ć', 'c'],
  ['ę', 'e'],
  ['ł', 'l'],
  ['ń', 'n'],
  ['ó', 'o'],
  ['ś', 's'],
  ['ż', 'z'],
  ['ź', 'z'],
  ['Ą', 'a'],
  ['Ć', 'c'],
  ['Ę', 'e'],
  ['Ł', 'l'],
  ['Ń', 'n'],
  ['Ó', 'o'],
  ['Ś', 's'],
  ['Ż', 'z'],
  ['Ź', 'z']
]);

const toAscii = (value) => String(value)
  .split('')
  .map((character) => POLISH_TRANSLITERATION.get(character) ?? character)
  .join('')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

const toEmailLocalPart = (firstName, lastName) => `${toAscii(firstName)}.${toAscii(lastName)}`
  .replace(/[^a-z0-9.]+/g, '.')
  .replace(/\.+/g, '.')
  .replace(/^\./, '')
  .replace(/\.$/, '');

const isoAt = (days, hours = 10, minutes = 0) => new Date(seedReferenceDate.getTime() + (days * 24 * 60 * 60 * 1000) + (hours * 60 * 60 * 1000) + (minutes * 60 * 1000)).toISOString();
const currentTestName = (label) => `${TEST_PREFIX} ${label}`;

const userBlueprints = [
  { firstName: 'Dariusz', lastName: 'Administrator', email: KEEP_ADMIN.email, fullName: KEEP_ADMIN.fullName, role: 'admin', isActive: true },
  { firstName: 'Anna', lastName: 'Nowak', role: 'admin', isActive: true },
  { firstName: 'Bartosz', lastName: 'Zielinski', role: 'admin', isActive: true },
  { firstName: 'Celina', lastName: 'Krol', role: 'admin', isActive: false },
  { firstName: 'Damian', lastName: 'Lukasik', role: 'admin', isActive: true },
  { firstName: 'Agnieszka', lastName: 'Kowalska', role: 'user', isActive: true },
  { firstName: 'Beata', lastName: 'Wojcik', role: 'user', isActive: true },
  { firstName: 'Cezary', lastName: 'Pawlak', role: 'user', isActive: true },
  { firstName: 'Dorota', lastName: 'Maj', role: 'user', isActive: true },
  { firstName: 'Emil', lastName: 'Kaczmarek', role: 'user', isActive: false },
  { firstName: 'Filip', lastName: 'Sikora', role: 'user', isActive: true },
  { firstName: 'Gabriela', lastName: 'Lewandowska', role: 'user', isActive: true },
  { firstName: 'Hubert', lastName: 'Baran', role: 'user', isActive: true },
  { firstName: 'Iga', lastName: 'Dabrowska', role: 'user', isActive: true },
  { firstName: 'Jakub', lastName: 'Biel', role: 'user', isActive: true },
  { firstName: 'Karolina', lastName: 'Milewska', role: 'user', isActive: true },
  { firstName: 'Lukasz', lastName: 'Czarnecki', role: 'user', isActive: true },
  { firstName: 'Maria', lastName: 'Sadowska', role: 'user', isActive: true },
  { firstName: 'Natalia', lastName: 'Jankowska', role: 'user', isActive: true },
  { firstName: 'Oskar', lastName: 'Witkowski', role: 'user', isActive: true },
  { firstName: 'Patrycja', lastName: 'Zaremba', role: 'user', isActive: true },
  { firstName: 'Rafal', lastName: 'Grabowski', role: 'user', isActive: true },
  { firstName: 'Sandra', lastName: 'Krawczyk', role: 'user', isActive: true },
  { firstName: 'Tomasz', lastName: 'Mazurek', role: 'user', isActive: true },
  { firstName: 'Urszula', lastName: 'Bednarek', role: 'user', isActive: true },
  { firstName: 'Wiktor', lastName: 'Lis', role: 'user', isActive: true },
  { firstName: 'Weronika', lastName: 'Chmiel', role: 'user', isActive: false },
  { firstName: 'Zofia', lastName: 'Sobczak', role: 'user', isActive: true },
  { firstName: 'Monika', lastName: 'Wilk', role: 'user', isActive: true },
  { firstName: 'Norbert', lastName: 'Pietrzak', role: 'user', isActive: true }
];

const eventBlueprints = [
  {
    name: currentTestName('Warsztat Frontend: CSS Grid'),
    description: 'Praktyczny warsztat o układach CSS i responsywnych komponentach.',
    eventDatetime: isoAt(10, 9),
    status: 'current',
    capacity: 2,
    createdByEmail: 'anna.nowak@example.test',
    registrantEmails: ['dariusz@example.test', 'anna.nowak@example.test']
  },
  {
    name: currentTestName('Warsztat Backend: Node Streams'),
    description: 'Zajęcia o strumieniach, buforowaniu i przetwarzaniu danych po stronie serwera.',
    eventDatetime: isoAt(11, 11),
    status: 'current',
    capacity: 3,
    createdByEmail: 'bartosz.zielinski@example.test',
    registrantEmails: ['bartosz.zielinski@example.test']
  },
  {
    name: currentTestName('Panel: UX dla produktów B2B'),
    description: null,
    eventDatetime: isoAt(12, 14, 30),
    status: 'current',
    capacity: 6,
    createdByEmail: 'dariusz@example.test',
    registrantEmails: []
  },
  {
    name: currentTestName('Demo Day: startup pitch'),
    description: 'Prezentacje projektów z krótkim feedbackiem od prowadzących i uczestników.',
    eventDatetime: isoAt(13, 10),
    status: 'current',
    capacity: 4,
    createdByEmail: 'damian.lukasik@example.test',
    registrantEmails: ['anna.nowak@example.test', 'damian.lukasik@example.test', 'agnieszka.kowalska@example.test', 'beata.wojcik@example.test']
  },
  {
    name: currentTestName('Spotkanie społeczności: Q&A'),
    description: 'Otwarta sesja pytań i odpowiedzi, bez slajdów i bez ograniczeń tematycznych.',
    eventDatetime: isoAt(14, 18),
    status: 'current',
    capacity: 8,
    createdByEmail: 'celina.krol@example.test',
    registrantEmails: ['celina.krol@example.test']
  },
  {
    name: currentTestName('Szkolenie: bezpieczeństwo API'),
    description: 'Warsztat o autoryzacji, rate limitach i praktykach ochrony endpointów.',
    eventDatetime: isoAt(15, 8, 15),
    status: 'current',
    capacity: 1,
    createdByEmail: 'anna.nowak@example.test',
    registrantEmails: ['hubert.baran@example.test']
  },
  {
    name: currentTestName('Retrospektywa projektu'),
    description: 'Spotkanie podsumowujące sprint, z miejscem na wnioski i usprawnienia.',
    eventDatetime: isoAt(-1, 16),
    status: 'current',
    capacity: 3,
    createdByEmail: 'dariusz@example.test',
    registrantEmails: ['gabriela.lewandowska@example.test', 'hubert.baran@example.test']
  },
  {
    name: currentTestName('Warsztat archiwalny: testy e2e'),
    description: 'Zamknięty warsztat sprzed kilku dni, z pełną listą uczestników.',
    eventDatetime: isoAt(-3, 9),
    status: 'current',
    capacity: 5,
    createdByEmail: 'bartosz.zielinski@example.test',
    registrantEmails: ['iga.dabrowska@example.test']
  },
  {
    name: currentTestName('Prezentacja wdrożenia'),
    description: 'Wydarzenie z krótką prezentacją produkcyjnego wdrożenia i pytaniami technicznymi.',
    eventDatetime: isoAt(-7, 13, 30),
    status: 'current',
    capacity: 4,
    createdByEmail: 'damian.lukasik@example.test',
    registrantEmails: ['jakub.biel@example.test']
  },
  {
    name: currentTestName('Spotkanie kryzysowe'),
    description: null,
    eventDatetime: isoAt(-10, 17),
    status: 'current',
    capacity: 2,
    createdByEmail: 'anna.nowak@example.test',
    registrantEmails: []
  },
  {
    name: currentTestName('Archiwum: onboarding'),
    description: 'Archiwalny onboarding z materiałami dla nowych uczestników.',
    eventDatetime: isoAt(-15, 10),
    status: 'archived',
    capacity: 4,
    createdByEmail: 'celina.krol@example.test',
    registrantEmails: ['karolina.milewska@example.test', 'lukasz.czarnecki@example.test']
  },
  {
    name: currentTestName('Archiwum: migracja danych'),
    description: 'Opis migracji danych z jednego systemu do drugiego, z listą odtworzonych kroków.',
    eventDatetime: isoAt(-20, 15),
    status: 'archived',
    capacity: 2,
    createdByEmail: 'dariusz@example.test',
    registrantEmails: ['maria.sadowska@example.test', 'natalia.jankowska@example.test']
  },
  {
    name: currentTestName('Archiwum: sprint plan'),
    description: 'Planowanie sprintu w formie archiwalnej, używane do weryfikacji widoku administratora.',
    eventDatetime: isoAt(-30, 9, 30),
    status: 'archived',
    capacity: 6,
    createdByEmail: 'anna.nowak@example.test',
    registrantEmails: []
  },
  {
    name: currentTestName('Archiwum: szkolenie bezpieczeństwo'),
    description: 'Starsze szkolenie z zakresu bezpieczeństwa, odporności i obsługi błędów.',
    eventDatetime: isoAt(-45, 12),
    status: 'archived',
    capacity: 3,
    createdByEmail: 'bartosz.zielinski@example.test',
    registrantEmails: ['oskar.witkowski@example.test']
  },
  {
    name: currentTestName('Archiwum: panel produktywność'),
    description: 'Panel o organizacji pracy zespołu, planowaniu i priorytetyzacji.',
    eventDatetime: isoAt(-60, 16, 30),
    status: 'archived',
    capacity: 5,
    createdByEmail: 'damian.lukasik@example.test',
    registrantEmails: ['patrycja.zaremba@example.test', 'rafal.grabowski@example.test', 'sandra.krawczyk@example.test']
  },
  {
    name: currentTestName('Archiwum: warsztat nocny'),
    description: 'Nocny warsztat techniczny z ćwiczeniami i zadaniami praktycznymi.',
    eventDatetime: isoAt(-90, 22),
    status: 'archived',
    capacity: 2,
    createdByEmail: 'celina.krol@example.test',
    registrantEmails: ['tomasz.mazurek@example.test', 'urszula.bednarek@example.test']
  },
  {
    name: currentTestName('Archiwum: demo UI'),
    description: null,
    eventDatetime: isoAt(5, 9, 30),
    status: 'archived',
    capacity: 4,
    createdByEmail: 'anna.nowak@example.test',
    registrantEmails: []
  },
  {
    name: currentTestName('Archiwum: forum liderów'),
    description: 'Forum z udziałem liderów zespołów, z zachowaniem pełnej historii zapisów.',
    eventDatetime: isoAt(12, 17),
    status: 'archived',
    capacity: 3,
    createdByEmail: 'dariusz@example.test',
    registrantEmails: ['wiktor.lis@example.test']
  },
  {
    name: currentTestName('Archiwum: spotkanie partnerów'),
    description: 'Spotkanie z partnerami, które powinno pozostać widoczne w panelu administratora.',
    eventDatetime: isoAt(18, 11),
    status: 'archived',
    capacity: 5,
    createdByEmail: 'bartosz.zielinski@example.test',
    registrantEmails: ['weronika.chmiel@example.test', 'zofia.sobczak@example.test']
  },
  {
    name: currentTestName('Archiwum: klasyfikacja tematów'),
    description: 'Wydarzenie z krótką klasyfikacją tematów i porządkowaniem materiałów.',
    eventDatetime: isoAt(25, 15, 15),
    status: 'archived',
    capacity: 2,
    createdByEmail: 'damian.lukasik@example.test',
    registrantEmails: ['monika.wilk@example.test']
  }
];

export const createSeedUsers = () => userBlueprints.map((user) => ({
  email: user.email ?? `${toEmailLocalPart(user.firstName, user.lastName)}@example.test`,
  fullName: user.fullName ?? `${user.firstName} ${user.lastName}`,
  role: user.role,
  isActive: user.isActive
}));

export const createSeedEventBlueprints = () => eventBlueprints.map((event) => ({ ...event }));

export const createSeedEventRows = (usersByEmail) => createSeedEventBlueprints().map((event) => ({
  name: event.name,
  description: event.description,
  event_datetime: event.eventDatetime,
  status: event.status,
  capacity: event.capacity,
  created_by: usersByEmail.get(event.createdByEmail)?.id ?? null
}));

export const createSeedRegistrationRows = (usersByEmail, eventsByName) => createSeedEventBlueprints().flatMap((event) => {
  const eventId = eventsByName.get(event.name)?.id;
  if (!eventId) return [];
  return event.registrantEmails.map((email) => {
    const userId = usersByEmail.get(email)?.id;
    if (!userId) {
      throw new Error(`Brakuje użytkownika dla e-maila ${email}.`);
    }
    return { event_id: eventId, user_id: userId };
  });
});

export const buildResetPlan = ({ authUsers, profiles, events, keepAdmin = KEEP_ADMIN }) => {
  const preservedProfile = profiles.find((profile) => profile.email === keepAdmin.email || profile.full_name === keepAdmin.fullName);
  if (!preservedProfile) {
    throw new Error(`Nie znaleziono profilu administratora do zachowania: ${keepAdmin.fullName} <${keepAdmin.email}>.`);
  }

  const preservedAuthUser = authUsers.find((user) => user.id === preservedProfile.id || user.email === keepAdmin.email || user.user_metadata?.full_name === keepAdmin.fullName);
  if (!preservedAuthUser) {
    throw new Error(`Nie znaleziono konta Auth administratora do zachowania: ${keepAdmin.fullName} <${keepAdmin.email}>.`);
  }

  return {
    preservedUserId: preservedProfile.id,
    profileIdsToDelete: profiles.filter((profile) => profile.id !== preservedProfile.id).map((profile) => profile.id),
    authUserIdsToDelete: authUsers.filter((user) => user.id !== preservedProfile.id).map((user) => user.id),
    eventIdsToDelete: events.map((event) => event.id)
  };
};
