import { HttpError } from '../utils/http.js';
import { assertEmail, assertText } from '../utils/validation.js';

export const createAuthService = (client, users) => ({
  async login(input) { const email = assertEmail(input.email); const password = assertText(input.password, 'Hasło'); const { data, error } = await client.auth.signInWithPassword({ email, password }); if (error) throw new HttpError(401, 'Nieprawidłowy e-mail lub hasło.'); const profile = await users.find(data.user.id); return { user: { id: profile.id, email: profile.email, fullName: profile.full_name, role: profile.role }, accessToken: data.session.access_token, refreshToken: data.session.refresh_token }; },
  async magicLink(input) { const email = assertEmail(input.email); const { error } = await client.auth.signInWithOtp({ email }); if (error) throw new HttpError(400, 'Nie udało się wysłać linku logowania.'); },
  async logout(token) { if (token) await client.auth.signOut({ scope: 'local' }); },
  async me(profile) { return { id: profile.id, email: profile.email, fullName: profile.full_name, role: profile.role }; }
});
