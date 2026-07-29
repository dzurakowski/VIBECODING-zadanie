export const createUsersRepository = (db) => ({
  async find(id) { const { data, error } = await db.from('profiles').select('*').eq('id', id).maybeSingle(); if (error) throw error; return data; },
  async list() { const { data, error } = await db.from('profiles').select('*').order('full_name'); if (error) throw error; return data; },
  async update(id, values) { const { data, error } = await db.from('profiles').update(values).eq('id', id).select().maybeSingle(); if (error) throw error; return data; },
  async inviteUser({ email, fullName, role, redirectTo }) {
    const { data, error } = await db.auth.admin.inviteUserByEmail(email, { data: { full_name: fullName }, redirectTo });
    if (error) throw error;
    const { error: profileError } = await db.from('profiles').insert({ id: data.user.id, email, full_name: fullName, role, is_active: true });
    if (profileError) throw profileError;
    return data.user;
  },
  async setActive(id, active) {
    const { data, error } = await db.auth.admin.updateUserById(id, { ban_duration: active ? 'none' : '876000h' });
    if (error) throw error;
    const { error: profileError } = await db.from('profiles').update({ is_active: active }).eq('id', id);
    if (profileError) throw profileError;
    return data.user;
  },
  async deleteAuthUser(id) {
    const { error } = await db.auth.admin.deleteUser(id);
    if (error) throw error;
  },
  async countAdmins() {
    const { count, error } = await db.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'admin').eq('is_active', true);
    if (error) throw error;
    return count ?? 0;
  }
});
