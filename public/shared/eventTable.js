const collator = new Intl.Collator('pl', { sensitivity: 'base', numeric: true });

const normalizeText = (value) => String(value ?? '').trim().toLocaleLowerCase('pl-PL');
const normalizeNumberText = (value) => String(value ?? '').trim();
const matchesNumberFilter = (value, filter) => normalizeNumberText(value) === normalizeNumberText(filter);

const statusLabel = (status) => (status === 'archived' ? 'Archiwalne' : 'Bieżące');

const participantsText = (event) => event.participantsText ?? '';

const sortValue = (event, sortBy) => {
  if (sortBy === 'eventDatetime') return Date.parse(event.eventDatetime ?? '') || 0;
  if (sortBy === 'capacity') return Number(event.capacity ?? 0);
  if (sortBy === 'registeredCount') return Number(event.registeredCount ?? 0);
  if (sortBy === 'remainingSeats') return Number(event.remainingSeats ?? 0);
  if (sortBy === 'status') return event.status === 'current' ? 0 : 1;
  if (sortBy === 'participants') return participantsText(event);
  if (sortBy === 'description') return event.description ?? '';
  return event.name ?? '';
};

export const defaultEventTableState = Object.freeze({
  sortBy: 'eventDatetime',
  sortDirection: 'asc',
  filters: {
    name: '',
    description: '',
    eventDatetime: '',
    capacity: '',
    registeredCount: '',
    remainingSeats: '',
    status: '',
    participants: ''
  }
});

export const filterEvents = (events, filters = defaultEventTableState.filters) => events.filter((event) => {
  if (filters.name && !normalizeText(event.name).includes(normalizeText(filters.name))) return false;
  if (filters.description && !normalizeText(event.description).includes(normalizeText(filters.description))) return false;
  if (filters.eventDatetime && !normalizeText(event.eventDatetimeDisplay ?? event.eventDatetime).includes(normalizeText(filters.eventDatetime))) return false;
  if (filters.capacity && !matchesNumberFilter(event.capacity, filters.capacity)) return false;
  if (filters.registeredCount && !matchesNumberFilter(event.registeredCount, filters.registeredCount)) return false;
  if (filters.remainingSeats && !matchesNumberFilter(event.remainingSeats, filters.remainingSeats)) return false;
  if (filters.status && event.status !== filters.status) return false;
  if (filters.participants && !normalizeText(participantsText(event)).includes(normalizeText(filters.participants))) return false;
  return true;
});

export const sortEvents = (events, sortBy = defaultEventTableState.sortBy, sortDirection = defaultEventTableState.sortDirection) => {
  const direction = sortDirection === 'desc' ? -1 : 1;
  return [...events].sort((left, right) => {
    const a = sortValue(left, sortBy);
    const b = sortValue(right, sortBy);
    const comparison = typeof a === 'number' && typeof b === 'number'
      ? a - b
      : collator.compare(String(a), String(b));
    if (comparison !== 0) return comparison * direction;
    return collator.compare(left.name ?? '', right.name ?? '');
  });
};

export const filterAndSortEvents = (events, state = defaultEventTableState) => sortEvents(
  filterEvents(events, state.filters),
  state.sortBy,
  state.sortDirection
);

export const getEventStatusLabel = statusLabel;
