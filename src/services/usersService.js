import { HttpError } from '../utils/http.js';
import { assertEmail, assertRole, assertText } from '../utils/validation.js';

export const createUsersService = (repository) => ({
  list: () => repository.list(),
  async create(input) { const email = assertEmail(input.email); const fullName = assertText(input.fullName, 'Imię i nazwisko'); const role = assertRole(input.role ?? 'user'); if (input.password && input.password.length < 8) throw new HttpError(400, 'Hasło musi mieć co najmniej 8 znaków.'); return repository.createAuthUser({ email, fullName, role, password: input.password }); },
  async update(id, input) { const values = {}; if ('email' in input) values.email = assertEmail(input.email); if ('fullName' in input) values.full_name = assertText(input.fullName, 'Imię i nazwisko'); if ('role' in input) values.role = assertRole(input.role); const user = await repository.update(id, values); if (!user) throw new HttpError(404, 'Użytkownik nie istnieje.'); return user; }
});
