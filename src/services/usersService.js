import { HttpError } from '../utils/http.js';
import { assertEmail, assertRole, assertText } from '../utils/validation.js';

// Ochrona aplikacyjna (countAdmins) daje szybki, czytelny błąd w zwykłym przypadku.
// Trigger `guard_last_admin` w bazie jest ostateczną, atomową barierą na wypadek
// równoczesnych żądań (np. dwóch adminów degradujących się nawzajem naraz) —
// gdy zadziała, poniższy błąd LAST_ADMIN jest mapowany na ten sam komunikat 409.
const guardLastAdmin = async (operation, message) => {
  try { return await operation(); }
  catch (error) { if (String(error.message ?? '').includes('LAST_ADMIN')) throw new HttpError(409, message); throw error; }
};

export const createUsersService = (repository, appUrl) => ({
  list: () => repository.list(),
  async create(input) { const email = assertEmail(input.email); const fullName = assertText(input.fullName, 'Imię i nazwisko'); const role = assertRole(input.role ?? 'user'); return repository.inviteUser({ email, fullName, role, redirectTo: `${appUrl}/set-password` }); },
  async update(id, input) {
    const target = await repository.find(id);
    if (!target) throw new HttpError(404, 'Użytkownik nie istnieje.');
    const values = {};
    if ('email' in input) values.email = assertEmail(input.email);
    if ('fullName' in input) values.full_name = assertText(input.fullName, 'Imię i nazwisko');
    if ('role' in input) {
      const nextRole = assertRole(input.role);
      if (target.role === 'admin' && nextRole !== 'admin' && await repository.countAdmins() <= 1) {
        throw new HttpError(409, 'Nie można zdegradować ostatniego aktywnego administratora.');
      }
      values.role = nextRole;
    }
    const user = await guardLastAdmin(() => repository.update(id, values), 'Nie można zdegradować ostatniego aktywnego administratora.');
    if (!user) throw new HttpError(404, 'Użytkownik nie istnieje.');
    return user;
  },
  async setActive(id, active, requesterId) { const target = await repository.find(id); if (!target) throw new HttpError(404, 'Użytkownik nie istnieje.'); if (target.id === requesterId) throw new HttpError(409, 'Nie możesz dezaktywować własnego konta.'); if (!active && target.role === 'admin' && await repository.countAdmins() <= 1) throw new HttpError(409, 'Nie można dezaktywować ostatniego aktywnego administratora.'); return guardLastAdmin(() => repository.setActive(id, active), 'Nie można dezaktywować ostatniego aktywnego administratora.'); },
  async remove(id, requesterId) { const target = await repository.find(id); if (!target) throw new HttpError(404, 'Użytkownik nie istnieje.'); if (target.id === requesterId) throw new HttpError(409, 'Nie możesz usunąć własnego konta.'); if (target.role === 'admin' && await repository.countAdmins() <= 1) throw new HttpError(409, 'Nie można usunąć ostatniego aktywnego administratora.'); await guardLastAdmin(() => repository.deleteAuthUser(id), 'Nie można usunąć ostatniego aktywnego administratora.'); }
});
