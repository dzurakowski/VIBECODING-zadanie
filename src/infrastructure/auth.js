import { HttpError } from '../utils/http.js';

export const createAuth = ({ authClient, usersRepository }) => ({
  async current(request) {
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw new HttpError(401, 'Zaloguj się, aby wykonać tę operację.');
    const { data, error } = await authClient.auth.getUser(header.slice(7));
    if (error || !data.user) throw new HttpError(401, 'Sesja wygasła lub jest nieprawidłowa.');
    const profile = await usersRepository.find(data.user.id);
    if (!profile) throw new HttpError(403, 'Konto nie ma skonfigurowanego profilu.');
    return profile;
  },
  async admin(request) { const user = await this.current(request); if (user.role !== 'admin') throw new HttpError(403, 'Ta operacja wymaga roli administratora.'); return user; }
});
