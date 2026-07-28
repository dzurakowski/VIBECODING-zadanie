export const createEventsRepository = (db) => ({
  async list({ includeArchived = false, userId } = {}) {
    let query = db.from('events').select('*, registrations(id, user_id)').order('event_datetime');
    if (!includeArchived) query = query.eq('status', 'current');
    const { data, error } = await query;
    if (error) throw error;
    return data.map((event) => ({ ...event, registrations: event.registrations ?? [], isRegistered: Boolean(userId && event.registrations?.some((r) => r.user_id === userId)) }));
  },
  async find(id) { const { data, error } = await db.from('events').select('*').eq('id', id).maybeSingle(); if (error) throw error; return data; },
  async create(values) { const { data, error } = await db.from('events').insert(values).select().single(); if (error) throw error; return data; },
  async update(id, values) { const { data, error } = await db.from('events').update(values).eq('id', id).select().maybeSingle(); if (error) throw error; return data; },
  async registrations(eventId) {
    const { data, error } = await db.from('registrations').select('id, created_at, profiles!registrations_user_id_fkey(id, email, full_name)').eq('event_id', eventId).order('created_at');
    if (error) throw error; return data;
  },
  async reset(eventId) { const { error } = await db.from('registrations').delete().eq('event_id', eventId); if (error) throw error; }
});
