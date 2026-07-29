import { HttpError } from '../utils/http.js';
import { assertEmail, assertText } from '../utils/validation.js';

export const createAuthService = (client, adminClient, users, appUrl) => ({
  async login(input) { const email = assertEmail(input.email); const password = assertText(input.password, 'Hasło'); const { data, error } = await client.auth.signInWithPassword({ email, password }); if (error) throw new HttpError(401, 'Nieprawidłowy e-mail lub hasło.'); const profile = await users.find(data.user.id); return { user: { id: profile.id, email: profile.email, fullName: profile.full_name, role: profile.role }, accessToken: data.session.access_token, refreshToken: data.session.refresh_token }; },
  async magicLink(input) { const email = assertEmail(input.email); const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: appUrl } }); if (error) throw new HttpError(400, 'Nie udało się wysłać linku logowania.'); },
  async requestPasswordReset(input) { const email = assertEmail(input.email); await client.auth.resetPasswordForEmail(email, { redirectTo: `${appUrl}/set-password` }); },
  async changePassword(profile, input, requireCurrentPassword) {
    const password = assertText(input.password, 'Nowe hasło');
    if (password.length < 10) throw new HttpError(400, 'Hasło musi mieć co najmniej 10 znaków.');
    if (password !== input.passwordConfirmation) throw new HttpError(400, 'Wpisane hasła nie są takie same.');
    if (requireCurrentPassword) {
      const currentPassword = assertText(input.currentPassword, 'Obecne hasło');
      const { error } = await client.auth.signInWithPassword({ email: profile.email, password: currentPassword });
      if (error) throw new HttpError(401, 'Obecne hasło jest nieprawidłowe.');
    }
    const { error } = await adminClient.auth.admin.updateUserById(profile.id, { password });
    if (error) throw new HttpError(400, 'Nie udało się zmienić hasła.');
  },
  async logout(token) { if (token) await client.auth.signOut({ scope: 'local' }); },
  async me(profile) { return { id: profile.id, email: profile.email, fullName: profile.full_name, role: profile.role }; }
});
