const collator = new Intl.Collator('pl', { sensitivity: 'base', numeric: true });

const normalizeText = (value) => String(value ?? '').trim().toLocaleLowerCase('pl-PL');

const sortValue = (event, sortBy) => {
  if (sortBy === 'eventDatetime') return Date.parse(event.eventDatetime ?? '') || 0;
  if (sortBy === 'capacity') return Number(event.capacity ?? 0);
  if (sortBy === 'remainingSeats') return Number(event.remainingSeats ?? 0);
  if (sortBy === 'status') return event.status === 'current' ? 0 : 1;
  if (sortBy === 'isRegistered') return event.isRegistered ? 0 : 1;
  if (sortBy === 'description') return event.description ?? '';
  return event.name ?? '';
};

export const defaultCurrentEventsState = Object.freeze({
  sortBy: 'eventDatetime',
  sortDirection: 'asc',
  filters: {
    name: '',
    description: '',
    eventDatetime: '',
    capacity: '',
    remainingSeats: '',
    status: '',
    isRegistered: ''
  }
});

export const filterCurrentEvents = (events, filters = defaultCurrentEventsState.filters) => events.filter((event) => {
  if (filters.name && !normalizeText(event.name).includes(normalizeText(filters.name))) return false;
  if (filters.description && !normalizeText(event.description).includes(normalizeText(filters.description))) return false;
  if (filters.eventDatetime && !normalizeText(event.eventDatetimeDisplay ?? event.eventDatetime).includes(normalizeText(filters.eventDatetime))) return false;
  if (filters.capacity && !normalizeText(event.capacity).includes(normalizeText(filters.capacity))) return false;
  if (filters.remainingSeats && !normalizeText(event.remainingSeats).includes(normalizeText(filters.remainingSeats))) return false;
  if (filters.status && event.status !== filters.status) return false;
  if (filters.isRegistered === 'yes' && !event.isRegistered) return false;
  if (filters.isRegistered === 'no' && event.isRegistered) return false;
  return true;
});

export const sortCurrentEvents = (events, sortBy = defaultCurrentEventsState.sortBy, sortDirection = defaultCurrentEventsState.sortDirection) => {
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

export const filterAndSortCurrentEvents = (events, state = defaultCurrentEventsState) => sortCurrentEvents(
  filterCurrentEvents(events, state.filters),
  state.sortBy,
  state.sortDirection
);
