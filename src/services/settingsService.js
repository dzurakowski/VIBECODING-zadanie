import { assertBoolean } from '../utils/validation.js';

export const createSettingsService = (repository) => ({
  registrationStatus: () => repository.getRegistrationEnabled(),
  async setRegistrationEnabled(enabled) { return repository.setRegistrationEnabled(assertBoolean(enabled, 'Flaga rejestracji')); }
});
