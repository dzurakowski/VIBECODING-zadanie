const collator = new Intl.Collator('pl', { sensitivity: 'base', numeric: true });

const normalizeText = (value) => String(value ?? '').trim().toLocaleLowerCase('pl-PL');

const statusLabel = (isActive) => (isActive ? 'Aktywne' : 'Nieaktywne');

const sortValue = (user, sortBy) => {
  if (sortBy === 'is_active') return user.is_active ? 0 : 1;
  if (sortBy === 'role') return user.role ?? '';
  if (sortBy === 'email') return user.email ?? '';
  return user.full_name ?? '';
};

export const defaultUserTableState = Object.freeze({
  sortBy: 'full_name',
  sortDirection: 'asc',
  filters: {
    fullName: '',
    email: '',
    role: '',
    status: ''
  }
});

export const filterUsers = (users, filters = defaultUserTableState.filters) => users.filter((user) => {
  if (filters.fullName && !normalizeText(user.full_name).includes(normalizeText(filters.fullName))) return false;
  if (filters.email && !normalizeText(user.email).includes(normalizeText(filters.email))) return false;
  if (filters.role && user.role !== filters.role) return false;
  if (filters.status === 'active' && !user.is_active) return false;
  if (filters.status === 'inactive' && user.is_active) return false;
  return true;
});

export const sortUsers = (users, sortBy = defaultUserTableState.sortBy, sortDirection = defaultUserTableState.sortDirection) => {
  const direction = sortDirection === 'desc' ? -1 : 1;
  return [...users].sort((left, right) => {
    const a = sortValue(left, sortBy);
    const b = sortValue(right, sortBy);
    const comparison = typeof a === 'number' && typeof b === 'number'
      ? a - b
      : collator.compare(String(a), String(b));
    if (comparison !== 0) return comparison * direction;
    return collator.compare(left.full_name ?? '', right.full_name ?? '');
  });
};

export const filterAndSortUsers = (users, state = defaultUserTableState) => sortUsers(
  filterUsers(users, state.filters),
  state.sortBy,
  state.sortDirection
);

export const getUserStatusLabel = statusLabel;
