# Specyfikacja implementacyjna dla CODEX

## 0. Rola dokumentu

Ten dokument jest wersją wykonawczą. Ma prowadzić bezpośrednio do implementacji.

Źródłem wymagań biznesowych pozostają:

- [SPECYFIKACJA.md](SPECYFIKACJA.md)

Ten dokument doprecyzowuje:

- architekturę,
- model danych,
- kontrakty API,
- autoryzację,
- strukturę katalogów,
- flow UI,
- konfigurację,
- testy,
- kolejność implementacji.

## 1. Cel techniczny

Zbudować aplikację do zapisów na wiele wydarzeń w architekturze:

- frontend,
- backend Node.js,
- Supabase Postgres + Supabase Auth.

Aplikacja ma obsługiwać:

- użytkownika końcowego,
- administratora.

Brak publicznej rejestracji.
Użytkownicy i administratorzy są zakładani ręcznie przez administratora.

## 2. Zakres funkcjonalny

### 2.1 Użytkownik

- logowanie przez Supabase Auth,
- logowanie przez `email + hasło`,
- logowanie przez `magic link`,
- podgląd bieżących wydarzeń,
- zapis na wybrane wydarzenie,
- podgląd własnych zapisów,
- komunikat sukcesu lub błędu po operacji,
- brak dostępu do wydarzeń archiwalnych,
- brak dostępu do danych innych użytkowników.

### 2.2 Administrator

- logowanie przez Supabase Auth,
- dostęp do `../admin`,
- tworzenie wydarzeń,
- edycja wydarzeń,
- archiwizacja i przywracanie wydarzeń,
- przegląd wszystkich wydarzeń,
- przegląd uczestników danego wydarzenia,
- ręczne dodawanie użytkowników,
- edycja roli użytkownika,
- usuwanie zapisów,
- reset zapisów dla wydarzenia.

## 3. Stos technologiczny

### 3.1 Backend

Wymagania:

- Node.js,
- REST API,
- bez ciężkiego frameworka HTTP, jeśli nie jest konieczny,
- logika biznesowa oddzielona od handlerów HTTP,
- integracja z Supabase przez oficjalne SDK,
- walidacja wejścia po stronie backendu.

### 3.2 Frontend

Wymagania:

- prosty, nowoczesny interfejs,
- osobna strona użytkownika i administratora,
- brak przeładowania UI,
- responsywność mobile-first,
- czytelne stany: loading, empty, success, error.

### 3.3 Baza

- Supabase Postgres,
- Supabase Auth,
- opcjonalnie Supabase Storage nie jest wymagany,
- RLS ma być użyte tam, gdzie to ma sens i nie komplikuje nadmiernie wdrożenia.

## 4. Konfiguracja środowiskowa

### 4.1 Pliki

W repo muszą znaleźć się:

- `.env`,
- `.env.example`,
- `.gitignore`.

### 4.2 Zmienne środowiskowe

Minimalny zestaw:

- `PORT`
- `APP_URL`
- `ADMIN_PATH`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `EVENT_CAPACITY`

Opcjonalnie, jeśli potrzebne:

- `SUPABASE_JWT_SECRET`
- `NODE_ENV`

### 4.3 Zasady

- `.env` nie może być commitowany,
- `.env.example` ma zawierać wszystkie wymagane klucze,
- `EVENT_CAPACITY` ma domyślnie wynosić `12`,
- limit miejsc dotyczy pojedynczego wydarzenia.

## 5. Model danych

## 5.1 `profiles`

Rozszerzenie użytkownika względem Supabase Auth.

Pola:

- `id uuid primary key` - zgodny z `auth.users.id`,
- `email text not null unique`,
- `full_name text not null`,
- `role text not null check role in ('user','admin')`,
- `created_at timestamptz not null default now()`,
- `updated_at timestamptz not null default now()`.

Zasady:

- rekord tworzy admin lub trigger po utworzeniu konta w Auth,
- użytkownik nie rejestruje się samodzielnie,
- rola `admin` odblokowuje panel administracyjny.

## 5.2 `events`

Pola:

- `id uuid primary key default gen_random_uuid()`,
- `name text not null`,
- `description text null`,
- `event_datetime timestamptz not null`,
- `status text not null check status in ('current','archived')`,
- `capacity integer not null check capacity > 0`,
- `created_by uuid null references profiles(id)`,
- `created_at timestamptz not null default now()`,
- `updated_at timestamptz not null default now()`.

Zasady:

- `current` = widoczne dla użytkownika,
- `archived` = tylko do przeglądu admina,
- archiwizacja nie usuwa danych.

## 5.3 `registrations`

Pola:

- `id uuid primary key default gen_random_uuid()`,
- `event_id uuid not null references events(id) on delete cascade`,
- `user_id uuid not null references profiles(id) on delete cascade`,
- `created_at timestamptz not null default now()`.

Indeksy i ograniczenia:

- unique `(event_id, user_id)`,
- index na `event_id`,
- index na `user_id`.

Zasady:

- jeden użytkownik może zapisać się raz na dane wydarzenie,
- zapisy do archiwalnych wydarzeń są zabronione,
- limit jest liczony per wydarzenie,
- przy równoległych zapisach nie może dojść do przekroczenia limitu.

## 6. Supabase Auth i role

### 6.1 Model uwierzytelnienia

Użytkownik loguje się przez Supabase Auth:

- email + hasło,
- magic link.

Nie implementujemy publicznej rejestracji.

### 6.2 Model autoryzacji

Autoryzacja opiera się o:

- sesję Supabase po stronie klienta,
- weryfikację sesji w backendzie,
- pole `role` w `profiles`.

### 6.3 Przepływ logowania

1. Frontend wywołuje logowanie Supabase.
2. Supabase zwraca sesję.
3. Frontend pobiera profil użytkownika.
4. Backend weryfikuje użytkownika na podstawie tokenu sesji.
5. Backend sprawdza rolę przy endpointach admina.

### 6.4 Wymagania bezpieczeństwa

- endpointy admina nie mogą być dostępne bez roli `admin`,
- zapis na wydarzenie musi być potwierdzony po stronie backendu,
- frontend nie może być jedyną warstwą ochrony.

## 7. RLS i polityki

Jeżeli zespół zdecyduje się użyć RLS, minimalne reguły są następujące:

### 7.1 `profiles`

- użytkownik może odczytać własny profil,
- administrator może odczytać wszystkie profile,
- tylko administrator może tworzyć lub aktualizować role innych użytkowników.

### 7.2 `events`

- użytkownik może odczytać tylko `current`,
- administrator może odczytać wszystkie,
- tylko administrator może tworzyć, edytować i archiwizować.

### 7.3 `registrations`

- użytkownik może odczytać własne zapisy,
- administrator może odczytać wszystkie,
- użytkownik może utworzyć zapis tylko dla siebie i tylko dla `current`,
- tylko administrator może usuwać wpisy masowo lub resetować wydarzenie.

Jeżeli implementacja backendowa ma pełną kontrolę nad SQL i sesją, RLS nadal powinno być włączone jako dodatkowa warstwa ochrony, o ile nie blokuje prostoty.

## 8. Backend: architektura warstwowa

### 8.1 Warstwy

Backend ma mieć co najmniej:

- `http` - route handlers / controllers,
- `service` - logika biznesowa,
- `repository` - dostęp do bazy,
- `infrastructure` - klient Supabase, auth helpers, config.

### 8.2 Zasady

- handler HTTP nie zawiera logiki biznesowej,
- serwis nie zna szczegółów transportu HTTP,
- repository nie zawiera reguł biznesowych,
- walidacja wejścia może być częściowo w handlerze, ale reguły biznesowe muszą być w serwisie.

## 9. API

### 9.1 Konwencje

- format JSON,
- błędy mają pole `message`,
- odpowiedzi sukcesu mają czytelne, stabilne kształty,
- endpointy admina zwracają `403` przy braku roli,
- endpointy wymagające loginu zwracają `401` przy braku sesji.

### 9.2 Auth API

#### `POST /api/auth/login`

Input:

```json
{
  "email": "user@example.com",
  "password": "secret"
}
```

Output `200`:

```json
{
  "message": "Zalogowano.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Jan Kowalski",
    "role": "user"
  }
}
```

#### `POST /api/auth/magic-link`

Input:

```json
{
  "email": "user@example.com"
}
```

Output `200`:

```json
{
  "message": "Link logowania został wysłany."
}
```

#### `POST /api/auth/logout`

Output `200`:

```json
{
  "message": "Wylogowano."
}
```

#### `GET /api/auth/me`

Output `200`:

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Jan Kowalski",
    "role": "admin"
  }
}
```

### 9.3 User API

#### `GET /api/events/current`

Zwraca tylko wydarzenia bieżące.

Output `200`:

```json
{
  "events": [
    {
      "id": "uuid",
      "name": "Warsztat A",
      "description": "Opis",
      "eventDatetime": "2026-08-01T10:00:00.000Z",
      "capacity": 12,
      "registeredCount": 4,
      "remainingSeats": 8,
      "status": "current",
      "isRegistered": false
    }
  ]
}
```

#### `GET /api/me/registrations`

Output `200`:

```json
{
  "registrations": [
    {
      "registrationId": "uuid",
      "eventId": "uuid",
      "eventName": "Warsztat A",
      "eventDatetime": "2026-08-01T10:00:00.000Z",
      "status": "current"
    }
  ]
}
```

#### `POST /api/events/:eventId/register`

Reguły:

- wymaga loginu,
- event musi istnieć,
- event musi mieć status `current`,
- event nie może być pełny,
- zapis nie może być duplikatem,
- zapis dotyczy zalogowanego użytkownika.

Output `201`:

```json
{
  "message": "Zapisano na wydarzenie.",
  "registration": {
    "id": "uuid",
    "eventId": "uuid",
    "userId": "uuid"
  }
}
```

Output `409`:

```json
{
  "message": "Brak wolnych miejsc."
}
```

lub

```json
{
  "message": "Jesteś już zapisany na to wydarzenie."
}
```

#### `DELETE /api/me/registrations/:eventId`

Opcjonalny endpoint do rezygnacji użytkownika z własnego zapisu.

Jeżeli zostanie zaimplementowany:

- usuwa tylko własny zapis,
- nie działa dla archiwalnych jako wyjątek od reguł biznesowych,
- zwraca `200` po sukcesie.

### 9.4 Admin API

#### `GET /api/admin/events`

Zwraca wszystkie wydarzenia.

#### `POST /api/admin/events`

Tworzy wydarzenie.

Input:

```json
{
  "name": "Warsztat B",
  "description": "Opis",
  "eventDatetime": "2026-08-03T10:00:00.000Z",
  "capacity": 12,
  "status": "current"
}
```

#### `PATCH /api/admin/events/:eventId`

Aktualizuje wydarzenie.

Dozwolone pola:

- `name`,
- `description`,
- `eventDatetime`,
- `capacity`,
- `status`.

#### `POST /api/admin/events/:eventId/archive`

Ustawia status `archived`.

#### `POST /api/admin/events/:eventId/restore`

Ustawia status `current`.

#### `GET /api/admin/events/:eventId/registrations`

Zwraca listę zapisanych osób dla wydarzenia.

#### `POST /api/admin/events/:eventId/reset`

Usuwa wszystkie zapisy dla wskazanego wydarzenia.

#### `GET /api/admin/users`

Zwraca listę użytkowników.

#### `POST /api/admin/users`

Dodaje użytkownika ręcznie.

Input:

```json
{
  "email": "user@example.com",
  "fullName": "Jan Kowalski",
  "role": "user",
  "password": "optional-temp-password"
}
```

Uwaga:

- jeżeli hasło nie będzie ustawiane w tym miejscu, backend musi mieć ustalony alternatywny flow tworzenia konta,
- brak publicznej rejestracji nadal obowiązuje.

#### `PATCH /api/admin/users/:userId`

Aktualizuje profil użytkownika i rolę.

#### `DELETE /api/admin/registrations/:registrationId`

Usuwa pojedynczy zapis.

### 9.5 Kody odpowiedzi

Wymagane statusy:

- `200` - sukces,
- `201` - utworzenie,
- `400` - błąd danych wejściowych,
- `401` - brak autoryzacji,
- `403` - brak uprawnień,
- `404` - brak zasobu,
- `409` - konflikt biznesowy,
- `500` - błąd nieobsłużony.

## 10. Logika biznesowa

### 10.1 Reguły zapisu

Przy zapisie na wydarzenie backend musi wykonać kolejno:

1. sprawdzenie sesji,
2. sprawdzenie roli i tożsamości,
3. pobranie wydarzenia,
4. sprawdzenie statusu `current`,
5. sprawdzenie duplikatu `event_id + user_id`,
6. sprawdzenie liczby zapisów względem `capacity`,
7. utworzenie zapisu,
8. zwrot odpowiedzi.

### 10.2 Zabezpieczenie przed race condition

Jeżeli możliwe, zapisy powinny być wykonywane:

- w transakcji,
- z wykorzystaniem unikalnego indeksu,
- z dodatkowym sprawdzeniem limitu po stronie SQL.

Minimalny wymóg:

- brak możliwości przekroczenia capacity przy równoczesnych żądaniach.

### 10.3 Archiwizacja

Archiwizacja:

- nie usuwa zapisów,
- blokuje nowe zapisy,
- usuwa wydarzenie z widoku użytkownika.

## 11. Frontend

## 11.1 Strona użytkownika

Widoki:

- ekran logowania,
- ekran listy bieżących wydarzeń,
- sekcja moich zapisów,
- komunikaty systemowe.

Elementy UI:

- karta wydarzenia,
- status liczby miejsc,
- przycisk zapisu,
- stan `disabled` dla pełnych albo już zapisanych wydarzeń.

### 11.2 Strona administratora

Widoki:

- ekran logowania,
- dashboard wydarzeń,
- formularz tworzenia wydarzenia,
- formularz edycji wydarzenia,
- lista zapisów,
- lista użytkowników,
- akcje archiwizuj / przywróć / resetuj.

### 11.3 UX

Założenia:

- prosta hierarchia,
- mało dekoracji,
- szybkie odczytanie stanu wydarzenia,
- jasne komunikaty po akcji,
- dobry kontrast,
- responsywność.

## 12. Struktura projektu

Rekomendowana struktura:

```text
.
├── public/
│   ├── index.html
│   ├── admin.html
│   ├── app.js
│   ├── admin.js
│   └── styles.css
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config.js
│   ├── infrastructure/
│   │   ├── supabaseClient.js
│   │   └── auth.js
│   ├── repositories/
│   │   ├── eventsRepository.js
│   │   ├── registrationsRepository.js
│   │   └── usersRepository.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── eventsService.js
│   │   ├── registrationsService.js
│   │   └── usersService.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── eventsController.js
│   │   ├── adminController.js
│   │   └── usersController.js
│   └── utils/
│       ├── http.js
│       └── validation.js
├── tests/
│   ├── auth.test.js
│   ├── events.test.js
│   ├── registrations.test.js
│   └── admin.test.js
├── .env
├── .env.example
├── .gitignore
└── package.json
```

Jeżeli zespół wybierze inny układ, musi zachować te same odpowiedzialności warstw.

## 13. Kontrakt odpowiedzi

### 13.1 Standard odpowiedzi sukcesu

```json
{
  "message": "Tekst komunikatu",
  "data": {}
}
```

Możliwe są też odpowiedzi specjalizowane, jeśli są opisane w API.

### 13.2 Standard odpowiedzi błędu

```json
{
  "message": "Opis błędu"
}
```

### 13.3 Zasady

- komunikaty mają być po polsku,
- odpowiedzi muszą być przewidywalne,
- frontend nie powinien zgadywać struktury danych.

## 14. Walidacja

### 14.1 Wymagana walidacja wejścia

- `email` musi być poprawny,
- `fullName` nie może być pusty,
- `name` wydarzenia nie może być pusty,
- `eventDatetime` musi być poprawną datą,
- `capacity` musi być liczbą całkowitą > 0,
- `status` musi mieć jedną z dozwolonych wartości,
- `eventId`, `userId`, `registrationId` muszą być poprawnymi UUID.

### 14.2 Zachowanie przy błędach

- błędne dane wejściowe -> `400`,
- brak zasobu -> `404`,
- konflikt biznesowy -> `409`,
- brak uprawnień -> `403`.

## 15. Testy

### 15.1 Zakres minimalny

- logowanie,
- autoryzacja roli admin,
- pobieranie bieżących wydarzeń,
- zapis na wydarzenie,
- blokada duplikatu,
- blokada pełnego wydarzenia,
- blokada archiwalnego wydarzenia,
- CRUD wydarzeń admina,
- ręczne dodawanie użytkowników,
- reset zapisów.

### 15.2 Typ testów

- unit dla serwisów,
- integracyjne dla API,
- opcjonalnie testy RLS, jeśli łatwe do utrzymania.

## 16. Kolejność implementacji

1. Ustalić strukturę projektu i konfigurację.
2. Skonfigurować Supabase.
3. Zdefiniować tabele, indeksy i polityki.
4. Zbudować warstwę infrastructure.
5. Zbudować repository.
6. Zbudować service.
7. Zbudować API.
8. Zbudować frontend użytkownika.
9. Zbudować frontend administratora.
10. Dodać testy.
11. Dopracować UX i komunikaty.

## 17. Kryteria gotowości

Projekt uznajemy za gotowy, jeśli:

- logowanie działa przez Supabase,
- admin i user mają różne uprawnienia,
- użytkownik widzi tylko bieżące wydarzenia,
- zapis na każde wydarzenie działa tylko raz per user,
- limit 12 miejsc działa per wydarzenie,
- archiwizacja ukrywa wydarzenie przed userem i blokuje zapisy,
- administrator zarządza wydarzeniami i użytkownikami,
- API jest spójne z frontendem,
- są pliki `.env`, `.env.example`, `.gitignore`,
- istnieją testy kluczowych reguł biznesowych.

## 18. Instrukcja dla CODEX

Przy implementacji:

- nie twórz nowej specyfikacji,
- trzymaj się tego dokumentu i [SPECYFIKACJA.md](SPECYFIKACJA.md),
- nie zostawiaj funkcji opisanych tylko częściowo,
- jeśli trzeba uprościć szczegół, wybierz najprostszy wariant zgodny z wymaganiami,
- nie dodawaj publicznej rejestracji,
- nie pomijaj zabezpieczeń serwera,
- na końcu raportuj zgodność z punktami kryteriów gotowości.
