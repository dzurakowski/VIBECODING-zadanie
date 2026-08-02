# Specyfikacja rozwiązania

## Cel

Zbudować aplikację do zapisów na wydarzenia z podziałem na dwie role:

- `user`,
- `admin`.

Aplikacja ma działać jako prosty, produkcyjny serwis z:

- frontendem w `public/`,
- backendem Node.js w `src/`,
- Supabase Auth i Supabase Postgres jako warstwą danych.

## Zakres funkcjonalny

### Użytkownik

- loguje się e-mailem i hasłem albo przez magic link,
- widzi wyłącznie bieżące wydarzenia,
- może zapisać się na wydarzenie tylko raz,
- może anulować własny zapis tylko dla przyszłego wydarzenia,
- widzi sekcję własnych zapisów,
- widzi komunikaty sukcesu i błędu.

### Administrator

- loguje się na `/admin`,
- widzi wszystkie wydarzenia,
- tworzy, edytuje, archiwizuje, przywraca i usuwa wydarzenia,
- przegląda zapisanych użytkowników,
- zarządza użytkownikami i ich rolami,
- włącza lub wyłącza możliwość rejestracji nowych kont,
- może zaprosić użytkownika e-mailem.

## Model danych

### `profiles`

- `id`
- `email`
- `full_name`
- `role`
- `is_active`
- `created_at`
- `updated_at`

### `events`

- `id`
- `name`
- `description`
- `event_datetime`
- `status`
- `capacity`
- `created_by`
- `created_at`
- `updated_at`

### `registrations`

- `id`
- `event_id`
- `user_id`
- `created_at`

### `app_settings`

- `id`
- `registration_enabled`
- `created_at`
- `updated_at`

## Reguły biznesowe

- rejestracja na wydarzenie wymaga zalogowania,
- zapis na to samo wydarzenie jest możliwy tylko raz,
- zapis na wydarzenie archiwalne jest blokowany,
- limit miejsc jest liczony per wydarzenie,
- anulowanie zapisu działa tylko dla przyszłych wydarzeń,
- ostatni aktywny administrator nie może zostać zdegradowany, dezaktywowany ani usunięty,
- widoczne akcje w UI muszą być potwierdzone przez backend.

## Uwierzytelnianie i sesja

System korzysta z Supabase Auth:

- email + hasło,
- magic link,
- reset hasła,
- ustawienie hasła po zaproszeniu lub odzyskiwaniu.

Sesja jest przekazywana jako Bearer token w żądaniach API. Backend pobiera profil z tabeli `profiles` i sprawdza rolę oraz aktywność konta.

## API

### Auth

- `POST /api/auth/login`
- `POST /api/auth/magic-link`
- `POST /api/auth/password-reset`
- `GET /api/auth/registration-status`
- `POST /api/auth/register`
- `POST /api/auth/change-password`
- `POST /api/auth/set-password`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Użytkownik

- `GET /api/events/current`
- `POST /api/events/:id/register`
- `GET /api/me/registrations`
- `DELETE /api/me/registrations/:eventId`

### Administrator

- `GET /api/admin/events`
- `POST /api/admin/events`
- `PATCH /api/admin/events/:id`
- `POST /api/admin/events/:id/archive`
- `POST /api/admin/events/:id/restore`
- `GET /api/admin/events/:id/registrations`
- `POST /api/admin/events/:id/reset`
- `DELETE /api/admin/events/:id`
- `GET /api/admin/users`
- `POST /api/admin/users`
- `PATCH /api/admin/users/:id`
- `POST /api/admin/users/:id/deactivate`
- `POST /api/admin/users/:id/restore`
- `DELETE /api/admin/users/:id`
- `GET /api/admin/registration-settings`
- `PATCH /api/admin/registration-settings`
- `DELETE /api/admin/registrations/:id`

## Walidacja i bezpieczeństwo

- backend waliduje wejście,
- endpointy admina wymagają roli `admin`,
- endpointy użytkownika wymagają zalogowania,
- UI nie jest traktowane jako granica bezpieczeństwa,
- atomowy zapis na wydarzenie jest realizowany po stronie bazy przez funkcję RPC.

## Interfejs użytkownika

### Widok użytkownika

- tabela bieżących wydarzeń z filtrowaniem i sortowaniem,
- tabela własnych zapisów z filtrowaniem i sortowaniem,
- przycisk zapisu przy wydarzeniu,
- przycisk rezygnacji tylko tam, gdzie backend pozwala anulować zapis,
- formularz zmiany hasła.

### Widok administratora

- tabela wydarzeń z akcjami w ostatniej kolumnie,
- tabela użytkowników z akcjami w ostatniej kolumnie,
- formularz dodawania wydarzenia,
- formularz zaproszenia użytkownika,
- przełącznik rejestracji nowych kont,
- formularz zmiany hasła administratora.

