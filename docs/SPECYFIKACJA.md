# Specyfikacja STREFY WYDARZEŃ

## 1. Metadane dokumentu

- status: aktualna specyfikacja rozwiązania;
- wersja dokumentu: `1.0`;
- data weryfikacji: `2026-08-08`;
- wersja aplikacji: `1.0.0`;
- źródło prawdy: działający kod aplikacji, schema bazy i migracje w repozytorium.

Dokument opisuje stan faktycznie zaimplementowany w repozytorium. Funkcje
planowane, ale nieobecne w kodzie, nie są traktowane jako część systemu.

## 2. Cel i zakres

### 2.1. Cel

STREFA WYDARZEŃ jest aplikacją webową do zarządzania wydarzeniami i zapisami
uczestników. Użytkownicy mogą przeglądać bieżące wydarzenia i zarządzać
własnymi zapisami, a administratorzy zarządzają wydarzeniami, kontami,
rolami i ustawieniem rejestracji nowych użytkowników.

### 2.2. Zakres

System obejmuje:

- frontend serwowany statycznie przez Node.js;
- backend Node.js udostępniający API HTTP;
- Supabase Auth do uwierzytelniania;
- Supabase PostgreSQL do przechowywania danych;
- dwa główne widoki: użytkownika i administratora;
- lokalne skrypty do przygotowania syntetycznych danych testowych.

### 2.3. Poza zakresem

System obecnie nie obejmuje:

- płatności i fakturowania;
- list rezerwowych;
- powiadomień SMS lub push;
- importu i eksportu wydarzeń;
- wielojęzyczności;
- osobnego panelu obsługi zgłoszeń;
- formalnych testów end-to-end;
- osobnego endpointu health-check;
- automatycznego systemu migracji uruchamianego przez aplikację.

## 3. Role i uprawnienia

| Rola | Uprawnienia |
| --- | --- |
| `user` | przeglądanie bieżących wydarzeń, zapisy, rezygnacja z przyszłych zapisów, zmiana hasła |
| `admin` | wszystkie operacje użytkownika oraz zarządzanie wydarzeniami, zapisami, użytkownikami, rolami i ustawieniem rejestracji |

Konto musi mieć aktywny profil w tabeli `profiles`. Konto nieaktywne nie może
korzystać z chronionych operacji.

## 4. Architektura rozwiązania

```text
przeglądarka
    │
    ├── public/       statyczny frontend
    │
    └── HTTP/JSON ─── src/app.js
                         │
                         ├── services/       reguły biznesowe
                         ├── repositories/   dostęp do danych
                         ├── infrastructure/ Supabase Auth i klienci DB
                         └── utils/           walidacja i obsługa HTTP
                                      │
                                      └── Supabase Auth + PostgreSQL
```

Serwer z `src/server.js` obsługuje pliki statyczne z katalogu `public/` oraz
endpointy API. Frontend komunikuje się z backendem przez żądania JSON w tym
samym źródle pochodzenia.

## 5. Wymagania funkcjonalne

### 5.1. Uwierzytelnianie

#### FR-AUTH-001 — Logowanie hasłem

Użytkownik może zalogować się adresem e-mail i hasłem. Przy sukcesie system
zwraca profil oraz access token i refresh token.

#### FR-AUTH-002 — Magic link

Użytkownik może poprosić o jednorazowy link logowania wysłany na poprawny
adres e-mail. Link przekierowuje na `APP_URL`.

#### FR-AUTH-003 — Reset hasła

Użytkownik może poprosić o wiadomość resetującą hasło. Link resetu kieruje na
`${APP_URL}/set-password`.

#### FR-AUTH-004 — Rejestracja użytkownika

Jeżeli administrator włączył rejestrację, osoba podaje imię, nazwisko i e-mail.
Backend wysyła zaproszenie i tworzy profil z rolą `user`. Hasło jest ustawiane
z linku na `/set-password`.

#### FR-AUTH-005 — Zmiana i ustawienie hasła

Zalogowany użytkownik może zmienić hasło po podaniu obecnego hasła. Użytkownik
wchodzący z zaproszenia lub resetu może ustawić nowe hasło bez podawania
obecnego hasła. Hasło musi mieć co najmniej 10 znaków, a oba pola hasła muszą
być identyczne.

#### FR-AUTH-006 — Sesja

Frontend przechowuje access token i refresh token w `localStorage`, przekazuje
access token jako `Authorization: Bearer <token>` i próbuje odświeżyć sesję po
otrzymaniu HTTP 401. Po nieudanym odświeżeniu sesja jest usuwana.

### 5.2. Funkcje użytkownika

#### FR-USER-001 — Lista wydarzeń

Użytkownik może pobrać bieżące wydarzenia. Lista zawiera nazwę, opis, termin,
status, pojemność, liczbę wolnych miejsc i informację o własnym zapisie.

#### FR-USER-002 — Zapis na wydarzenie

Zalogowany użytkownik może zapisać się na wydarzenie, jeśli nie jest ono
archiwalne, nie minęło, nie jest pełne i użytkownik nie ma już zapisu.

#### FR-USER-003 — Własne zapisy

Zalogowany użytkownik może pobrać własne zapisy i ich status. Rezygnacja jest
dostępna wyłącznie dla wydarzeń, które jeszcze się nie rozpoczęły.

#### FR-USER-004 — Filtrowanie i sortowanie

Widok użytkownika umożliwia filtrowanie i sortowanie listy wydarzeń oraz
własnych zapisów po dostępnych kolumnach.

### 5.3. Funkcje administratora

#### FR-ADMIN-001 — Wydarzenia

Administrator może tworzyć, edytować, archiwizować, przywracać i usuwać
wydarzenia. Usunięcie wymaga wcześniejszej archiwizacji i wyczyszczenia
zapisów wydarzenia.

#### FR-ADMIN-002 — Zapisy wydarzenia

Administrator może wyświetlić listę uczestników wydarzenia, usunąć pojedynczy
zapis oraz wyczyścić wszystkie zapisy wydarzenia.

#### FR-ADMIN-003 — Użytkownicy

Administrator może zaprosić użytkownika, zmienić jego dane i rolę,
dezaktywować lub przywrócić konto oraz trwale je usunąć.

#### FR-ADMIN-004 — Ochrona ostatniego administratora

System nie pozwala doprowadzić do braku aktywnych administratorów przez
degradację, dezaktywację lub usunięcie ostatniego aktywnego administratora.

#### FR-ADMIN-005 — Rejestracja nowych kont

Administrator może włączyć lub wyłączyć publiczną rejestrację nowych kont.

#### FR-ADMIN-006 — Filtrowanie i sortowanie

Panel administratora umożliwia filtrowanie i sortowanie tabel wydarzeń oraz
użytkowników.

## 6. Reguły biznesowe

- adres e-mail jest normalizowany do małych liter i walidowany po stronie backendu;
- wymagane teksty nie mogą być puste po usunięciu białych znaków;
- identyfikatory zasobów muszą być poprawnymi UUID;
- pojemność wydarzenia musi być dodatnią liczbą całkowitą;
- data wydarzenia musi być poprawną datą;
- status wydarzenia może mieć wartość `current` albo `archived`;
- rejestracja na wydarzenie wymaga zalogowanego, aktywnego konta;
- na to samo wydarzenie można zapisać użytkownika tylko raz;
- zapis na wydarzenie archiwalne lub przeszłe jest blokowany;
- liczba zapisów nie może przekroczyć pojemności wydarzenia;
- anulowanie zapisu działa tylko przed terminem wydarzenia;
- wydarzenie można usunąć wyłącznie po archiwizacji i usunięciu jego zapisów;
- administrator nie może usunąć ani dezaktywować własnego konta;
- ostatni aktywny administrator nie może zostać zdegradowany, dezaktywowany ani usunięty;
- rejestracja nowych kont jest blokowana, gdy `registration_enabled=false`;
- wszystkie widoczne akcje administracyjne są ponownie weryfikowane przez backend;
- atomowy zapis na wydarzenie wykorzystuje blokadę wiersza w funkcji RPC bazy danych;
- baza dodatkowo chroni regułę ostatniego administratora przez trigger i blokadę transakcyjną.

## 7. Model danych

### 7.1. `profiles`

| Pole | Typ / ograniczenia | Znaczenie |
| --- | --- | --- |
| `id` | UUID, PK, FK do `auth.users`, `ON DELETE CASCADE` | identyfikator konta Auth |
| `email` | tekst, `NOT NULL`, unikalny | adres e-mail |
| `full_name` | tekst, `NOT NULL` | imię i nazwisko |
| `role` | `user` lub `admin` | rola aplikacyjna |
| `is_active` | boolean, domyślnie `true` | aktywność konta |
| `created_at` | timestamptz | data utworzenia |
| `updated_at` | timestamptz | data ostatniej aktualizacji |

### 7.2. `events`

| Pole | Typ / ograniczenia | Znaczenie |
| --- | --- | --- |
| `id` | UUID, PK | identyfikator wydarzenia |
| `name` | tekst, `NOT NULL` | nazwa |
| `description` | tekst, opcjonalne | opis |
| `event_datetime` | timestamptz, `NOT NULL` | termin |
| `status` | `current` lub `archived` | status widoczności |
| `capacity` | integer `> 0` | limit miejsc |
| `created_by` | UUID, FK do `profiles`, `ON DELETE SET NULL` | administrator tworzący wydarzenie |
| `created_at` | timestamptz | data utworzenia |
| `updated_at` | timestamptz | data ostatniej aktualizacji |

### 7.3. `registrations`

| Pole | Typ / ograniczenia | Znaczenie |
| --- | --- | --- |
| `id` | UUID, PK | identyfikator zapisu |
| `event_id` | UUID, FK do `events`, `ON DELETE CASCADE` | wydarzenie |
| `user_id` | UUID, FK do `profiles`, `ON DELETE CASCADE` | użytkownik |
| `created_at` | timestamptz | data zapisu |

Na parze `event_id` i `user_id` istnieje ograniczenie unikalności. Tabela ma
indeksy po `event_id` i `user_id`.

### 7.4. `app_settings`

| Pole | Typ / ograniczenia | Znaczenie |
| --- | --- | --- |
| `id` | integer, zawsze `1` | identyfikator jedynego rekordu ustawień |
| `registration_enabled` | boolean, domyślnie `true` | stan rejestracji nowych kont |
| `created_at` | timestamptz | data utworzenia |
| `updated_at` | timestamptz | data ostatniej aktualizacji |

## 8. Uwierzytelnianie i sesja

System korzysta z Supabase Auth i dwóch klientów Supabase:

- klient publiczny służy do operacji związanych z sesją użytkownika;
- klient z kluczem sekretnym służy backendowi do operacji administracyjnych i dostępu do danych.

Backend:

- wymaga nagłówka `Authorization: Bearer <token>` dla operacji chronionych;
- weryfikuje token przez Supabase Auth;
- pobiera profil z `profiles`;
- odrzuca brak profilu oraz konto nieaktywne;
- dodatkowo sprawdza rolę `admin` dla ścieżek `/api/admin/*`.

Frontend zapisuje tokeny w `localStorage` pod kluczem `events_session`. Po
wygaśnięciu access tokena wykonuje jednokrotną próbę odświeżenia sesji.

## 9. API

### 9.1. Konwencje

- format żądań i odpowiedzi: JSON;
- żądania `POST` i `PATCH` z danymi mają `Content-Type: application/json`;
- identyfikatory w ścieżkach są UUID;
- odpowiedzi sukcesu zawierają zwykle pole `message` oraz dane zasobu;
- odpowiedzi błędów mają format `{ "message": "Opis błędu." }`;
- nieznany endpoint API zwraca HTTP 404;
- nieobsłużony błąd serwera zwraca HTTP 500 z komunikatem ogólnym.

### 9.2. Auth

#### `POST /api/auth/login`

Body:

```json
{ "email": "user@example.test", "password": "haslo" }
```

Sukces: HTTP 200, `message`, `user`, `accessToken`, `refreshToken`.
Błędne dane logowania: HTTP 401.

#### `POST /api/auth/refresh`

Body: `{ "refreshToken": "..." }`.

Sukces: HTTP 200 z nowymi tokenami i profilem. Nieprawidłowa sesja: HTTP 401.

#### `POST /api/auth/magic-link`

Body: `{ "email": "user@example.test" }`.

Sukces: HTTP 200 i komunikat `Link logowania został wysłany.`. Niepoprawny
adres lub błąd wysyłki: HTTP 400.

#### `POST /api/auth/password-reset`

Body: `{ "email": "user@example.test" }`.

Sukces: HTTP 200 z komunikatem niewskazującym, czy konto istnieje.

#### `GET /api/auth/registration-status`

Publiczny odczyt stanu rejestracji. Zwraca `{ "enabled": true|false }`.

#### `POST /api/auth/register`

Body: `{ "email": "user@example.test", "fullName": "Jan Kowalski" }`.

Sukces: HTTP 201. Rejestracja wyłączona: HTTP 403. Istniejące konto: HTTP 409.

#### `POST /api/auth/change-password`

Wymaga zalogowania. Body zawiera `currentPassword`, `password` i
`passwordConfirmation`. Sukces: HTTP 200. Nieprawidłowe obecne hasło: HTTP 401.
Błąd walidacji: HTTP 400.

#### `POST /api/auth/set-password`

Wymaga zalogowania przez token z zaproszenia lub resetu. Body zawiera `password`
i `passwordConfirmation`. Sukces: HTTP 200.

#### `GET /api/auth/me`

Wymaga zalogowania. Zwraca profil w polu `user`.

#### `POST /api/auth/logout`

Wylogowanie bieżącej sesji. Sukces: HTTP 200.

### 9.3. Użytkownik

#### `GET /api/events/current`

Publiczny odczyt bieżących wydarzeń. Jeżeli żądanie zawiera poprawną sesję,
odpowiedź zawiera również informację `isRegistered` dla bieżącego użytkownika.

#### `POST /api/events/:id/register`

Wymaga zalogowania. Sukces: HTTP 201. Możliwe błędy: HTTP 400 dla niepoprawnego
UUID, HTTP 401 dla braku sesji, HTTP 404 dla braku wydarzenia oraz HTTP 409 dla
wydarzenia archiwalnego, przeszłego, pełnego lub duplikatu zapisu.

#### `GET /api/me/registrations`

Wymaga zalogowania. Zwraca tablicę własnych zapisów.

#### `DELETE /api/me/registrations/:eventId`

Wymaga zalogowania. Usuwa własny zapis tylko dla przyszłego wydarzenia.

### 9.4. Administrator

Wszystkie endpointy `/api/admin/*` wymagają aktywnego konta z rolą `admin`.

#### Wydarzenia

- `GET /api/admin/events` — lista wszystkich wydarzeń, także archiwalnych;
- `POST /api/admin/events` — tworzenie wydarzenia;
- `PATCH /api/admin/events/:id` — częściowa aktualizacja wydarzenia;
- `POST /api/admin/events/:id/archive` — archiwizacja;
- `POST /api/admin/events/:id/restore` — przywrócenie;
- `GET /api/admin/events/:id/registrations` — lista uczestników;
- `POST /api/admin/events/:id/reset` — usunięcie wszystkich zapisów;
- `DELETE /api/admin/events/:id` — trwałe usunięcie po spełnieniu warunków.

Body tworzenia i aktualizacji może zawierać:

```json
{
  "name": "Nazwa wydarzenia",
  "description": "Opis",
  "eventDatetime": "2030-01-01T18:00:00.000Z",
  "capacity": 12,
  "status": "current"
}
```

Podczas tworzenia `capacity` może zostać pominięte — wtedy używana jest wartość
`EVENT_CAPACITY`.

#### Użytkownicy

- `GET /api/admin/users` — lista profili;
- `POST /api/admin/users` — zaproszenie użytkownika;
- `PATCH /api/admin/users/:id` — zmiana e-maila, imienia lub roli;
- `POST /api/admin/users/:id/deactivate` — dezaktywacja;
- `POST /api/admin/users/:id/restore` — przywrócenie;
- `DELETE /api/admin/users/:id` — trwałe usunięcie konta.

Body zaproszenia:

```json
{
  "email": "user@example.test",
  "fullName": "Jan Kowalski",
  "role": "user"
}
```

#### Ustawienia i zapisy

- `GET /api/admin/registration-settings` — odczyt ustawienia rejestracji;
- `PATCH /api/admin/registration-settings` — body `{ "enabled": true|false }`;
- `DELETE /api/admin/registrations/:id` — usunięcie dowolnego zapisu przez administratora.

## 10. Walidacja i obsługa błędów

Backend zwraca własne komunikaty dla błędów walidacji i reguł biznesowych.

| HTTP | Znaczenie |
| ---: | --- |
| `200` | poprawne odczytanie lub wykonanie operacji |
| `201` | utworzenie zasobu |
| `400` | niepoprawne dane wejściowe lub niepoprawny UUID |
| `401` | brak, wygaśnięcie lub niepoprawność sesji |
| `403` | brak uprawnienia, nieaktywne konto lub wyłączona rejestracja |
| `404` | brak endpointu albo zasobu |
| `409` | konflikt reguły biznesowej |
| `500` | nieoczekiwany błąd serwera |

Nieobsłużone błędy są logowane po stronie serwera, a klient otrzymuje ogólny
komunikat bez szczegółów implementacyjnych.

## 11. Interfejs użytkownika

### 11.1. Widok użytkownika

- ekran logowania, magic linku, resetu hasła i rejestracji;
- lewy panel nawigacyjny z zakładkami wydarzeń i zmiany hasła;
- tabela bieżących wydarzeń z filtrowaniem i sortowaniem;
- tabela własnych zapisów z filtrowaniem i sortowaniem;
- akcja zapisu zależna od stanu wydarzenia;
- akcja rezygnacji wyłącznie dla przyszłych wydarzeń;
- komunikaty sukcesu i błędów;
- widok ustawiania hasła pod `/set-password`.

### 11.2. Widok administratora

- logowanie administratora pod `/admin`;
- tabela wszystkich wydarzeń z akcjami;
- tabela użytkowników z akcjami;
- formularz tworzenia wydarzenia;
- panel uczestników wydarzenia;
- formularz zaproszenia użytkownika;
- przełącznik rejestracji nowych kont;
- formularz zmiany hasła administratora;
- filtrowanie i sortowanie tabel.

Interfejs nie jest granicą bezpieczeństwa. Ukrycie przycisku w UI nie zastępuje
kontroli backendowej.

## 12. Wymagania niefunkcjonalne

### NFR-001 — Bezpieczeństwo

Operacje chronione wymagają Bearer tokena, a operacje administratora dodatkowo
aktywnego profilu z rolą `admin`. Klucz sekretny Supabase nie może być używany
w frontendzie.

### NFR-002 — Spójność zapisów

Równoczesne zapisy na to samo wydarzenie nie mogą przekroczyć limitu miejsc.
Gwarantuje to blokada wiersza w funkcji `register_for_event` oraz ograniczenie
unikalności zapisu.

### NFR-003 — Spójność administratorów

Równoczesne operacje na profilach nie mogą doprowadzić do braku aktywnego
administratora. Oprócz kontroli aplikacyjnej działa trigger `guard_last_admin`.

### NFR-004 — Walidacja wejścia

Dane wejściowe są walidowane po stronie backendu. Maksymalny rozmiar JSON
odczytywanego przez serwer wynosi 1 MB.

### NFR-005 — Obsługa środowisk

Konfiguracja jest dostarczana przez zmienne środowiskowe. Plik `.env` nie jest
częścią repozytorium.

### NFR-006 — Responsywność i dostępność

Interfejs zawiera responsywny układ dla widoków użytkownika i administratora.
Projekt nie deklaruje obecnie formalnej zgodności z konkretnym poziomem WCAG.

## 13. Testowanie

Testy uruchamia się poleceniem:

```bash
npm test
```

Aktualny zestaw obejmuje:

- uwierzytelnianie, odświeżanie sesji i tokeny;
- widoki logowania i ustawiania hasła;
- rejestrację oraz magic link;
- walidację danych;
- zapisy i rezygnację z wydarzeń;
- reguły ostatniego administratora;
- repozytoria użytkowników;
- ustawienia rejestracji;
- filtrowanie i sortowanie tabel;
- generowanie danych seedujących.

Projekt nie posiada obecnie osobnego lintowania, testów end-to-end ani testów
obciążeniowych. Testy automatyczne nie wymagają połączenia z produkcyjnym
Supabase i wykorzystują dane zastępcze lub mocki.

## 14. Kryteria akceptacji

### AC-001 — Logowanie

Przy poprawnych danych użytkownik otrzymuje sesję i widok właściwy dla swojej
roli. Przy błędnych danych otrzymuje HTTP 401 i komunikat o nieprawidłowym
logowaniu.

### AC-002 — Zapis na wydarzenie

Przy próbie zapisu na pełne, archiwalne, przeszłe lub już zapisane wydarzenie
system nie tworzy rekordu i zwraca HTTP 409 z komunikatem biznesowym.

### AC-003 — Limit miejsc

Równoczesne próby zapisu nie mogą doprowadzić do liczby zapisów większej niż
`capacity` wydarzenia.

### AC-004 — Rezygnacja

Użytkownik może usunąć tylko własny zapis dotyczący przyszłego wydarzenia.
Rezygnacja z wydarzenia przeszłego kończy się HTTP 409.

### AC-005 — Administrator

Operacja pod `/api/admin/*` bez aktywnej sesji administratora kończy się HTTP
401 lub HTTP 403 i nie modyfikuje danych.

### AC-006 — Ostatni administrator

System blokuje degradację, dezaktywację i usunięcie ostatniego aktywnego
administratora, także przy równoczesnych żądaniach.

### AC-007 — Rejestracja kont

Gdy `registration_enabled=false`, publiczna rejestracja kończy się HTTP 403 i
nie tworzy konta ani profilu.

### AC-008 — Usuwanie wydarzenia

Wydarzenie bieżące lub zawierające zapisy nie może zostać trwale usunięte.
Administrator musi najpierw je zarchiwizować i wyczyścić zapisy.

## 15. Założenia i ograniczenia

- Supabase Auth i PostgreSQL są wymagane do działania środowiska aplikacji;
- konfiguracja wiadomości e-mail, SMTP i redirect URL odbywa się w Supabase;
- operacje na bazie wykonuje backend z użyciem klucza sekretniego;
- aplikacja działa jako serwer same-origin i nie definiuje publicznego API CORS;
- seedowanie jest przeznaczone wyłącznie dla kontrolowanego środowiska lokalnego;
- migracje bazy są uruchamiane ręcznie przez administratora projektu Supabase;
- testy automatyczne nie zastępują testów manualnych środowiska produkcyjnego;
- brak osobnego monitoringu, health-checka i mechanizmu audytu operacji administracyjnych.

## 16. Wdrożenie i konfiguracja produkcyjna

Aplikację można uruchomić na Railway lub innym środowisku obsługującym Node.js.
W produkcji należy ustawić:

- `APP_URL` na publiczną domenę;
- zmienne Supabase zgodnie z sekcją konfiguracji;
- `NODE_ENV=production`;
- poprawne redirect URL w Supabase Auth;
- SMTP dla wiadomości systemowych.

Szczegóły znajdują się w [dokumentacji hostingu](HOSTING.md) oraz w instrukcji
konfiguracji domeny i poczty
([INSTRUKCJA_DOMENA_RAILWAY_SUPABASE.md](../INSTRUKCJA_DOMENA_RAILWAY_SUPABASE.md)).

## 17. Kryterium gotowości funkcji

Funkcję można uznać za gotową, gdy:

- wymaganie jest zaimplementowane w kodzie;
- reguły biznesowe są chronione po stronie backendu;
- obsłużone są scenariusze błędne;
- istnieją lub zostały zaktualizowane odpowiednie testy;
- dokumentacja opisuje aktualne zachowanie;
- pełny zestaw testów przechodzi;
- funkcja została sprawdzona w interfejsie, jeśli dotyczy UI.

## 18. Historia zmian specyfikacji

| Wersja | Data | Zmiana |
| --- | --- | --- |
| `1.0` | `2026-08-08` | Weryfikacja specyfikacji względem kodu, bazy i testów oraz uzupełnienie kontraktów i kryteriów akceptacji |
