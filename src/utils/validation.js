import { HttpError } from './http.js';

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const assertUuid = (value, label = 'Identyfikator') => { if (!UUID_RE.test(value ?? '')) throw new HttpError(400, `${label} musi być poprawnym UUID.`); return value; };
export const assertEmail = (value) => { const email = typeof value === 'string' ? value.trim().toLowerCase() : ''; if (!/^\S+@\S+\.\S+$/.test(email)) throw new HttpError(400, 'Podaj poprawny adres e-mail.'); return email; };
export const assertText = (value, label) => { if (typeof value !== 'string' || !value.trim()) throw new HttpError(400, `${label} nie może być puste.`); return value.trim(); };
export const assertCapacity = (value) => { if (!Number.isInteger(value) || value < 1) throw new HttpError(400, 'Pojemność musi być liczbą całkowitą większą od 0.'); return value; };
export const assertDate = (value) => { if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) throw new HttpError(400, 'Podaj poprawną datę wydarzenia.'); return value; };
export const assertRole = (value) => { if (!['user', 'admin'].includes(value)) throw new HttpError(400, 'Rola musi mieć wartość user lub admin.'); return value; };
export const assertStatus = (value) => { if (!['current', 'archived'].includes(value)) throw new HttpError(400, 'Status musi mieć wartość current lub archived.'); return value; };
