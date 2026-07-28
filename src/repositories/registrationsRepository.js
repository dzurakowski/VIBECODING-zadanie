export const createRegistrationsRepository = (db) => ({
  async mine(userId) {
    const { data, error } = await db.from('registrations').select('id, event_id, created_at, events!registrations_event_id_fkey(name, event_datetime, status)').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error; return data;
  },
  async register(eventId, userId) { const { data, error } = await db.rpc('register_for_event', { p_event_id: eventId, p_user_id: userId }); if (error) throw error; return data; },
  async removeOwn(eventId, userId) { const { data, error } = await db.from('registrations').delete().eq('event_id', eventId).eq('user_id', userId).select('id').maybeSingle(); if (error) throw error; return data; },
  async remove(id) { const { data, error } = await db.from('registrations').delete().eq('id', id).select('id').maybeSingle(); if (error) throw error; return data; }
});
