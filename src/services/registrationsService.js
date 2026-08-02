import { HttpError } from '../utils/http.js';

const errors = { EVENT_NOT_FOUND: [404, 'Wydarzenie nie istnieje.'], EVENT_ARCHIVED: [409, 'Nie można zapisać się na wydarzenie archiwalne.'], EVENT_PAST: [409, 'Nie można zapisać się na wydarzenie, które już się odbyło.'], ALREADY_REGISTERED: [409, 'Jesteś już zapisany na to wydarzenie.'], EVENT_FULL: [409, 'Brak wolnych miejsc.'] };
const now = () => new Date();
const isPast = (eventDatetime, currentTime = now()) => new Date(eventDatetime) <= currentTime;

export const createRegistrationsService = (repository, currentTime = now) => ({
  async mine(userId) {
    return (await repository.mine(userId)).map((r) => ({
      registrationId: r.id,
      eventId: r.event_id,
      eventName: r.events.name,
      eventDatetime: r.events.event_datetime,
      status: r.events.status,
      canCancel: !isPast(r.events.event_datetime, currentTime())
    }));
  },
  async register(eventId, userId) {
    try { const data = await repository.register(eventId, userId); const registration = Array.isArray(data) ? data[0] : data; return { id: registration.id, eventId: registration.event_id, userId: registration.user_id }; }
    catch (error) { const known = Object.entries(errors).find(([code]) => error.message?.includes(code)); if (known) throw new HttpError(...known[1]); throw error; }
  },
  async cancel(eventId, userId) {
    const registration = (await repository.mine(userId)).find((r) => r.event_id === eventId);
    if (!registration) throw new HttpError(404, 'Nie znaleziono zapisu.');
    if (isPast(registration.events.event_datetime, currentTime())) throw new HttpError(409, 'Nie można zrezygnować z wydarzenia, które już się odbyło.');
    const removed = await repository.removeOwn(eventId, userId);
    if (!removed) throw new HttpError(404, 'Nie znaleziono zapisu.');
  },
  async remove(id) { const registration = await repository.remove(id); if (!registration) throw new HttpError(404, 'Nie znaleziono zapisu.'); }
});
