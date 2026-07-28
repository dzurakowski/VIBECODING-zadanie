export const createUsersRepository = (db) => ({
  async find(id) { const { data, error } = await db.from('profiles').select('*').eq('id', id).maybeSingle(); if (error) throw error; return data; },
  async list() { const { data, error } = await db.from('profiles').select('*').order('full_name'); if (error) throw error; return data; },
  async update(id, values) { const { data, error } = await db.from('profiles').update(values).eq('id', id).select().maybeSingle(); if (error) throw error; return data; },
  async createAuthUser({ email, fullName, role, password }) {
    const options = { data: { full_name: fullName } };
    if (password) options.password = password; else options.email_confirm = true;
    const { data, error } = await db.auth.admin.createUser({ email, ...options });
    if (error) throw error;
    const { error: profileError } = await db.from('profiles').insert({ id: data.user.id, email, full_name: fullName, role });
    if (profileError) throw profileError;
    return data.user;
  }
});
