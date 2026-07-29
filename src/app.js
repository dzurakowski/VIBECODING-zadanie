import { createAuth } from './infrastructure/auth.js';
import { supabase, serviceSupabase } from './infrastructure/supabaseClient.js';
import { createEventsRepository } from './repositories/eventsRepository.js';
import { createRegistrationsRepository } from './repositories/registrationsRepository.js';
import { createUsersRepository } from './repositories/usersRepository.js';
import { createAuthService } from './services/authService.js';
import { createEventsService } from './services/eventsService.js';
import { createRegistrationsService } from './services/registrationsService.js';
import { createUsersService } from './services/usersService.js';
import { config } from './config.js';
import { assertUuid } from './utils/validation.js';
import { handleError, readJson, sendJson } from './utils/http.js';

export const createApp = () => {
  const usersRepo = createUsersRepository(serviceSupabase);
  const events = createEventsService(createEventsRepository(serviceSupabase), config.eventCapacity);
  const registrations = createRegistrationsService(createRegistrationsRepository(serviceSupabase));
  const users = createUsersService(usersRepo, config.appUrl);
  const auth = createAuth({ authClient: supabase, usersRepository: usersRepo });
  const authService = createAuthService(supabase, serviceSupabase, usersRepo, config.appUrl);

  return async (request, response, pathname) => {
    try {
      const body = ['POST', 'PATCH'].includes(request.method) ? await readJson(request) : {};
      const match = (pattern) => pathname.match(pattern);
      let result;
      if (request.method === 'POST' && pathname === '/api/auth/login') { result = await authService.login(body); return sendJson(response, 200, { message: 'Zalogowano.', ...result }); }
      if (request.method === 'POST' && pathname === '/api/auth/magic-link') { await authService.magicLink(body); return sendJson(response, 200, { message: 'Link logowania został wysłany.' }); }
      if (request.method === 'POST' && pathname === '/api/auth/password-reset') { await authService.requestPasswordReset(body); return sendJson(response, 200, { message: 'Jeżeli konto istnieje, wysłaliśmy link do ustawienia nowego hasła.' }); }
      if (request.method === 'POST' && pathname === '/api/auth/logout') { await authService.logout(request.headers.authorization?.slice(7)); return sendJson(response, 200, { message: 'Wylogowano.' }); }
      if (request.method === 'GET' && pathname === '/api/auth/me') { return sendJson(response, 200, { user: await authService.me(await auth.current(request)) }); }
      if (request.method === 'POST' && pathname === '/api/auth/change-password') { const user = await auth.current(request); await authService.changePassword(user, body, true); return sendJson(response, 200, { message: 'Hasło zostało zmienione.' }); }
      if (request.method === 'POST' && pathname === '/api/auth/set-password') { const user = await auth.current(request); await authService.changePassword(user, body, false); return sendJson(response, 200, { message: 'Hasło zostało ustawione.' }); }
      if (request.method === 'GET' && pathname === '/api/events/current') { let userId; try { userId = (await auth.current(request)).id; } catch {} return sendJson(response, 200, { events: await events.current(userId) }); }
      if (request.method === 'GET' && pathname === '/api/me/registrations') { return sendJson(response, 200, { registrations: await registrations.mine((await auth.current(request)).id) }); }
      if (request.method === 'POST' && (result = match(/^\/api\/events\/([^/]+)\/register$/))) { const user = await auth.current(request); const id = assertUuid(result[1], 'Identyfikator wydarzenia'); return sendJson(response, 201, { message: 'Zapisano na wydarzenie.', registration: await registrations.register(id, user.id) }); }
      if (request.method === 'DELETE' && (result = match(/^\/api\/me\/registrations\/([^/]+)$/))) { await registrations.cancel(assertUuid(result[1], 'Identyfikator wydarzenia'), (await auth.current(request)).id); return sendJson(response, 200, { message: 'Zapis został anulowany.' }); }

      if (pathname.startsWith('/api/admin/')) await auth.admin(request); else if (pathname.startsWith('/api/')) return sendJson(response, 404, { message: 'Nie znaleziono endpointu.' });
      if (request.method === 'GET' && pathname === '/api/admin/events') return sendJson(response, 200, { events: await events.all() });
      if (request.method === 'POST' && pathname === '/api/admin/events') return sendJson(response, 201, { message: 'Utworzono wydarzenie.', event: await events.create(body, (await auth.current(request)).id) });
      if (request.method === 'PATCH' && (result = match(/^\/api\/admin\/events\/([^/]+)$/))) return sendJson(response, 200, { message: 'Zaktualizowano wydarzenie.', event: await events.update(assertUuid(result[1], 'Identyfikator wydarzenia'), body) });
      if (request.method === 'POST' && (result = match(/^\/api\/admin\/events\/([^/]+)\/(archive|restore)$/))) return sendJson(response, 200, { message: 'Zmieniono status wydarzenia.', event: await events.changeStatus(assertUuid(result[1], 'Identyfikator wydarzenia'), result[2] === 'archive' ? 'archived' : 'current') });
      if (request.method === 'GET' && (result = match(/^\/api\/admin\/events\/([^/]+)\/registrations$/))) return sendJson(response, 200, { registrations: await events.registrations(assertUuid(result[1], 'Identyfikator wydarzenia')) });
      if (request.method === 'POST' && (result = match(/^\/api\/admin\/events\/([^/]+)\/reset$/))) { await events.reset(assertUuid(result[1], 'Identyfikator wydarzenia')); return sendJson(response, 200, { message: 'Wyczyszczono zapisy.' }); }
      if (request.method === 'DELETE' && (result = match(/^\/api\/admin\/events\/([^/]+)$/))) { await events.remove(assertUuid(result[1], 'Identyfikator wydarzenia')); return sendJson(response, 200, { message: 'Usunięto wydarzenie.' }); }
      if (request.method === 'GET' && pathname === '/api/admin/users') return sendJson(response, 200, { users: await users.list() });
      if (request.method === 'POST' && pathname === '/api/admin/users') return sendJson(response, 201, { message: 'Utworzono użytkownika.', user: await users.create(body) });
      if (request.method === 'PATCH' && (result = match(/^\/api\/admin\/users\/([^/]+)$/))) return sendJson(response, 200, { message: 'Zaktualizowano użytkownika.', user: await users.update(assertUuid(result[1], 'Identyfikator użytkownika'), body) });
      if (request.method === 'POST' && (result = match(/^\/api\/admin\/users\/([^/]+)\/(deactivate|restore)$/))) { await users.setActive(assertUuid(result[1], 'Identyfikator użytkownika'), result[2] === 'restore', (await auth.current(request)).id); return sendJson(response, 200, { message: result[2] === 'restore' ? 'Przywrócono konto.' : 'Dezaktywowano konto.' }); }
      if (request.method === 'DELETE' && (result = match(/^\/api\/admin\/users\/([^/]+)$/))) { await users.remove(assertUuid(result[1], 'Identyfikator użytkownika'), (await auth.current(request)).id); return sendJson(response, 200, { message: 'Usunięto konto.' }); }
      if (request.method === 'DELETE' && (result = match(/^\/api\/admin\/registrations\/([^/]+)$/))) { await registrations.remove(assertUuid(result[1], 'Identyfikator zapisu')); return sendJson(response, 200, { message: 'Usunięto zapis.' }); }
      return sendJson(response, 404, { message: 'Nie znaleziono endpointu.' });
    } catch (error) { handleError(response, error); }
  };
};
