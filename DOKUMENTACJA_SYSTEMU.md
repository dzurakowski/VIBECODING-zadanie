# Dokumentacja systemu

## Role i dostęp

- `user` widzi bieżące wydarzenia, zapisuje się na nie i zarządza własnym hasłem.
- `admin` zarządza wydarzeniami oraz użytkownikami w panelu `/admin`.
- Każde żądanie administracyjne jest weryfikowane przez backend na podstawie tokenu Supabase i roli z `profiles`.

## Logowanie i hasła

System obsługuje e-mail + hasło oraz magic link dla obu ról. Magic link administratora wraca na stronę główną, która po sprawdzeniu roli automatycznie przekierowuje do `/admin`.

Nowy użytkownik jest zapraszany przez administratora. Otrzymuje e-mail Supabase i sam ustawia pierwsze hasło na `/set-password`.

- Hasło musi mieć co najmniej 10 znaków.
- Zalogowany użytkownik lub administrator zmienia hasło po podaniu obecnego hasła.
- Osoba bez hasła może użyć „Nie pamiętam hasła”; odpowiedź jest celowo neutralna, aby nie ujawniać istnienia konta.
- Link odzyskiwania i zaproszenie prowadzą do `/set-password`.

W środowisku produkcyjnym należy skonfigurować własny SMTP w Supabase. Domyślna poczta Supabase ma limity i służy wyłącznie do testów.

## Panel administratora

Panel ma trzy zakładki:

- **Wydarzenia** — tworzenie wydarzeń, lista uczestników pod kartą, archiwizacja/przywracanie, reset zapisów i trwałe usunięcie.
- **Użytkownicy** — wysyłanie zaproszeń, podgląd ról i statusów, dezaktywacja/przywracanie oraz trwałe usunięcie.
- **Moje konto** — zmiana hasła aktualnego administratora.

Wydarzenie można trwale usunąć wyłącznie, gdy jest zarchiwizowane i nie ma zapisów. Przed usunięciem zapisów administrator używa akcji resetu.

Konto można dezaktywować bez utraty historii. Trwałe usunięcie konta usuwa konto Auth, profil i — na mocy kluczy obcych — powiązane zapisy. Administrator nie może usunąć lub dezaktywować własnego konta ani ostatniego aktywnego administratora.

## Konfiguracja Supabase

1. Wykonaj [supabase/schema.sql](supabase/schema.sql) dla nowej bazy.
2. Dla istniejącej bazy, na której schemat uruchomiono przed dodaniem zarządzania kontami, wykonaj [migrację użytkowników](supabase/migrations/20260728_user_management.sql) w SQL Editorze.
3. Ustaw `APP_URL` na adres aplikacji. Dla pracy lokalnej jest to `http://localhost:3000`.
4. W Supabase Auth włącz e-mail oraz magic link, a publiczne zakładanie kont pozostaw wyłączone.
5. W pliku `.env` przechowuj wyłącznie lokalnie `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` i `SUPABASE_SECRET_KEY`.

## Rozszerzone API

### Auth

- `POST /api/auth/magic-link`
- `POST /api/auth/password-reset`
- `POST /api/auth/change-password` — wymaga aktualnego hasła i sesji.
- `POST /api/auth/set-password` — dla sesji z zaproszenia lub odzyskiwania hasła.

### Administrator

- `POST /api/admin/users` — wysyła zaproszenie zamiast przekazywać hasło administratorowi.
- `POST /api/admin/users/:userId/deactivate`
- `POST /api/admin/users/:userId/restore`
- `DELETE /api/admin/users/:userId`
- `DELETE /api/admin/events/:eventId`
