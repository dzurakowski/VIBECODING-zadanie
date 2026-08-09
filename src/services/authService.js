import { HttpError } from '../utils/http.js';
import { assertEmail, assertText } from '../utils/validation.js';

const isEmailRateLimitError = (error) => error?.code === 'over_email_send_rate_limit'
  || error?.status === 429 && String(error?.message ?? '').toLowerCase().includes('email rate limit');

const emailRateLimitError = () => new HttpError(429, 'Przekroczono limit wysyłania wiadomości e-mail. Spróbuj ponownie później.');

export const createAuthService = (client, adminClient, users, settings, appUrl) => ({
  async login(input) { const email = assertEmail(input.email); const password = assertText(input.password, 'Hasło'); const { data, error } = await client.auth.signInWithPassword({ email, password }); if (error) throw new HttpError(401, 'Nieprawidłowy e-mail lub hasło.'); const profile = await users.find(data.user.id); return { user: { id: profile.id, email: profile.email, fullName: profile.full_name, role: profile.role }, accessToken: data.session.access_token, refreshToken: data.session.refresh_token }; },
  async refresh(input) {
    const refreshToken = assertText(input.refreshToken, 'Token odświeżania sesji');
    const { data, error } = await client.auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data.session || !data.user) throw new HttpError(401, 'Sesja wygasła lub jest nieprawidłowa.');
    const profile = await users.find(data.user.id);
    if (!profile) throw new HttpError(403, 'Konto nie ma skonfigurowanego profilu.');
    return { user: { id: profile.id, email: profile.email, fullName: profile.full_name, role: profile.role }, accessToken: data.session.access_token, refreshToken: data.session.refresh_token };
  },
  async magicLink(input) {
    const email = assertEmail(input.email);
    const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: appUrl } });
    if (error) {
      if (isEmailRateLimitError(error)) throw emailRateLimitError();
      console.error('Nie udało się wysłać magic linku', error);
      const detail = typeof error.message === 'string' && error.message.trim() ? `: ${error.message.trim()}` : '.';
      throw new HttpError(400, `Nie udało się wysłać linku logowania${detail}`);
    }
  },
  async requestPasswordReset(input) { const email = assertEmail(input.email); await client.auth.resetPasswordForEmail(email, { redirectTo: `${appUrl}/set-password` }); },
  async registrationStatus() { return { enabled: await settings.registrationStatus() }; },
  async register(input) {
    if (!await settings.registrationStatus()) throw new HttpError(403, 'Rejestracja nowych kont jest wyłączona.');
    const email = assertEmail(input.email);
    const fullName = assertText(input.fullName, 'Imię i nazwisko');
    try {
      await users.inviteUser({ email, fullName, role: 'user', redirectTo: `${appUrl}/set-password` });
    } catch (error) {
      if (isEmailRateLimitError(error)) throw emailRateLimitError();
      if (error?.code === 'email_exists' || String(error?.message ?? '').toLowerCase().includes('already')) {
        throw new HttpError(409, 'Konto z takim adresem e-mail już istnieje.');
      }
      throw error;
    }
    return { email };
  },
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
