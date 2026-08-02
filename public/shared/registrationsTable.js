const collator = new Intl.Collator('pl', { sensitivity: 'base', numeric: true });

const normalizeText = (value) => String(value ?? '').trim().toLocaleLowerCase('pl-PL');

const sortValue = (registration, sortBy) => {
  if (sortBy === 'eventDatetime') return Date.parse(registration.eventDatetime ?? '') || 0;
  if (sortBy === 'status') return registration.status === 'current' ? 0 : 1;
  if (sortBy === 'canCancel') return registration.canCancel ? 0 : 1;
  return registration.eventName ?? '';
};

export const defaultRegistrationsTableState = Object.freeze({
  sortBy: 'eventDatetime',
  sortDirection: 'asc',
  filters: {
    eventName: '',
    eventDatetime: '',
    status: '',
    canCancel: ''
  }
});

export const filterRegistrations = (registrations, filters = defaultRegistrationsTableState.filters) => registrations.filter((registration) => {
  if (filters.eventName && !normalizeText(registration.eventName).includes(normalizeText(filters.eventName))) return false;
  if (filters.eventDatetime && !normalizeText(registration.eventDatetimeDisplay ?? registration.eventDatetime).includes(normalizeText(filters.eventDatetime))) return false;
  if (filters.status && registration.status !== filters.status) return false;
  if (filters.canCancel === 'yes' && !registration.canCancel) return false;
  if (filters.canCancel === 'no' && registration.canCancel) return false;
  return true;
});

export const sortRegistrations = (registrations, sortBy = defaultRegistrationsTableState.sortBy, sortDirection = defaultRegistrationsTableState.sortDirection) => {
  const direction = sortDirection === 'desc' ? -1 : 1;
  return [...registrations].sort((left, right) => {
    const a = sortValue(left, sortBy);
    const b = sortValue(right, sortBy);
    const comparison = typeof a === 'number' && typeof b === 'number'
      ? a - b
      : collator.compare(String(a), String(b));
    if (comparison !== 0) return comparison * direction;
    return collator.compare(left.eventName ?? '', right.eventName ?? '');
  });
};

export const filterAndSortRegistrations = (registrations, state = defaultRegistrationsTableState) => sortRegistrations(
  filterRegistrations(registrations, state.filters),
  state.sortBy,
  state.sortDirection
);
