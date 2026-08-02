export const createSettingsRepository = (db) => ({
  async getRegistrationEnabled() {
    const { data, error } = await db.from('app_settings').select('registration_enabled').eq('id', 1).maybeSingle();
    if (error) throw error;
    return data?.registration_enabled ?? true;
  },
  async setRegistrationEnabled(enabled) {
    const { data, error } = await db.from('app_settings').upsert({ id: 1, registration_enabled: enabled }, { onConflict: 'id' }).select('registration_enabled').maybeSingle();
    if (error) throw error;
    return data?.registration_enabled ?? enabled;
  }
});
