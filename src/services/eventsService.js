import { HttpError } from '../utils/http.js';
import { assertCapacity, assertDate, assertStatus, assertText } from '../utils/validation.js';

const present = (event) => ({ id: event.id, name: event.name, description: event.description, eventDatetime: event.event_datetime, status: event.status, capacity: event.capacity, registeredCount: event.registrations?.length ?? event.registered_count ?? 0, remainingSeats: Math.max(0, event.capacity - (event.registrations?.length ?? event.registered_count ?? 0)), isRegistered: event.isRegistered ?? false });
const eventValues = (input, partial = false) => {
  const result = {};
  if (!partial || 'name' in input) result.name = assertText(input.name, 'Nazwa wydarzenia');
  if (!partial || 'eventDatetime' in input) result.event_datetime = assertDate(input.eventDatetime);
  if (!partial || 'capacity' in input) result.capacity = assertCapacity(input.capacity);
  if ('description' in input) result.description = input.description?.trim() || null;
  if ('status' in input) result.status = assertStatus(input.status);
  return result;
};

export const createEventsService = (repository, defaultCapacity) => ({
  async current(userId) { return (await repository.list({ userId })).map(present); },
  async all() { return (await repository.list({ includeArchived: true })).map(present); },
  async create(input, adminId) { return present(await repository.create({ ...eventValues({ ...input, capacity: input.capacity ?? defaultCapacity }), created_by: adminId })); },
  async update(id, input) { const event = await repository.update(id, eventValues(input, true)); if (!event) throw new HttpError(404, 'Wydarzenie nie istnieje.'); return present(event); },
  async changeStatus(id, status) { return this.update(id, { status }); },
  async registrations(id) { if (!await repository.find(id)) throw new HttpError(404, 'Wydarzenie nie istnieje.'); return repository.registrations(id); },
  async reset(id) { if (!await repository.find(id)) throw new HttpError(404, 'Wydarzenie nie istnieje.'); await repository.reset(id); }
});
