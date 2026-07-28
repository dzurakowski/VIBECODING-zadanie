# Specyfikacja docelowego rozwiązania

## 1. Cel projektu

Zbudować docelową wersję aplikacji do zapisów na wydarzenia, od zera, w architekturze produkcyjnej:

- frontend,
- backend w Node.js,
- baza danych Supabase.

Aplikacja ma obsługiwać dwóch typów użytkowników:

- `user` lub `użytkownik`,
- `administrator`.

Użytkownicy zwykli logują się do aplikacji i zapisują na bieżące wydarzenia.
Administrator zarządza wydarzeniami, użytkownikami i zapisami.

## 2. Zakres funkcjonalny

### 2.1 Funkcje użytkownika

- użytkownik wchodzi na główny adres aplikacji,
- widzi tylko bieżące wydarzenia,
- może zapisać się na dowolne bieżące wydarzenie,
- może zapisać się na każde dostępne wydarzenie tylko raz,
- widzi komunikat o powodzeniu lub błędzie zapisu,
- nie widzi wydarzeń archiwalnych,
- nie widzi danych innych użytkowników,
- musi być zalogowany, aby wykonać zapis.

### 2.2 Funkcje administratora

- administrator loguje się do podstrony `../admin`,
- widzi listę wydarzeń bieżących i archiwalnych,
- może tworzyć, edytować, archiwizować i przywracać wydarzenia,
- może przeglądać listę zapisanych użytkowników dla każdego wydarzenia,
- może zarządzać użytkownikami aplikacji,
- może dodawać użytkowników ręcznie do bazy,
- nie ma publicznej rejestracji użytkowników,
- może resetować zapisy dla wybranego wydarzenia lub, jeśli zostanie to przewidziane w UI, dla wielu wydarzeń,
- widzi dane archiwalne do przeglądu, ale archiwalne wydarzenia nie są dostępne do zapisów dla użytkownika.

## 3. Logowanie i autoryzacja

### 3.1 Supabase Auth

Logowanie ma być zbudowane w oparciu o mechanizmy Supabase.

Wymagania:

- obsługa logowania przez `email + hasło`,
- obsługa logowania przez `magic link`,
- brak publicznej rejestracji,
- konta użytkowników i administratorów są zakładane ręcznie przez administratora,
- role są rozróżniane po stronie aplikacji na podstawie danych profilu/roli w bazie.

### 3.2 Role

System musi wspierać role:

- `user`,
- `admin`.

Rekomendowane rozwiązanie:

- Supabase Auth odpowiada za uwierzytelnienie,
- w tabeli profili przechowywana jest rola,
- backend i frontend sprawdzają rolę przed pokazaniem funkcji administracyjnych.

### 3.3 Autoryzacja

- endpointy administracyjne wymagają roli `admin`,
- endpointy użytkownika wymagają zalogowania,
- odczyt listy bieżących wydarzeń może być publiczny lub wymagać logowania, ale zapis zawsze wymaga zalogowanego użytkownika,
- endpointy zapisów muszą uniemożliwiać zapis anonimowy.

## 4. Model działania wydarzeń

### 4.1 Wydarzenia

Administrator definiuje listę wydarzeń.

Każde wydarzenie ma:

- nazwę,
- datę i godzinę,
- status:
  - `current` - wydarzenie bieżące,
  - `archived` - wydarzenie archiwalne,
- opcjonalny opis,
- informację o liczbie miejsc zajętych i wolnych.

### 4.2 Zasady widoczności

- użytkownik widzi wyłącznie wydarzenia bieżące,
- wydarzenia archiwalne pozostają w bazie do przeglądu administratora,
- archiwizacja nie usuwa zapisów,
- po archiwizacji wydarzenie nie przyjmuje nowych zapisów.

### 4.3 Limity miejsc

- wszystkie wydarzenia mają ten sam limit miejsc,
- limit jest konfigurowalny w pliku konfiguracyjnym / `env`,
- domyślna długość listy miejsc: `12`,
- pojemność dotyczy pojedynczego wydarzenia, nie całego systemu,
- po osiągnięciu limitu kolejne zapisy na dane wydarzenie są blokowane.

## 5. Zasady zapisu

- użytkownik może zapisać się na wiele bieżących wydarzeń,
- użytkownik może zapisać się na każde wydarzenie tylko raz,
- duplikat oznacza próbę ponownego zapisu tego samego użytkownika na to samo wydarzenie,
- zapis na wydarzenie archiwalne jest zabroniony,
- zapis na wydarzenie pełne jest zabroniony,
- zapis wymaga zalogowania,
- aplikacja musi zwracać czytelny komunikat po sukcesie i po każdym błędzie biznesowym.

## 6. Architektura

Wymagana jest architektura 3-warstwowa:

1. Frontend
2. Backend Node.js
3. Baza Supabase

### 6.1 Frontend

- nowoczesny, ale prosty i przejrzysty UI/UX,
- osobny widok dla użytkownika i administratora,
- ekran logowania,
- responsywność dla desktop i mobile,
- komunikaty o stanie aplikacji, błędach i sukcesach,
- czytelna lista wydarzeń i stanów zapisów.

### 6.2 Backend

- Node.js,
- backend jako warstwa API,
- logika biznesowa odseparowana od warstwy HTTP,
- backend ma współpracować z Supabase,
- backend ma być źródłem reguł biznesowych i walidacji.

### 6.3 Baza danych

- Supabase Postgres,
- tabele i widoki powinny wspierać:
  - profile użytkowników,
  - wydarzenia,
  - zapisy,
  - opcjonalne mapowanie ról,
  - audyt podstawowych zmian, jeśli będzie to proste do wdrożenia.

## 7. Model danych

Minimalny docelowy model:

### 7.1 `profiles`

Przechowuje dane użytkownika rozszerzające Supabase Auth.

Pola:

- `id` - identyfikator, zgodny z Auth user id,
- `email`,
- `full_name`,
- `role` - `user` albo `admin`,
- `created_at`,
- `updated_at`.

### 7.2 `events`

Pola:

- `id`,
- `name`,
- `description`,
- `event_datetime`,
- `status` - `current` albo `archived`,
- `capacity`,
- `created_by`,
- `created_at`,
- `updated_at`.

### 7.3 `registrations`

Pola:

- `id`,
- `event_id`,
- `user_id`,
- `created_at`.

Zasady:

- unikalność `user_id + event_id`,
- zapis tylko do wydarzeń `current`,
- liczba zapisów nie może przekroczyć `capacity` danego wydarzenia.

### 7.4 Uwagi wdrożeniowe

Jeżeli zespół uzna to za prostsze, dopuszczalne jest użycie:

- widoków Supabase,
- funkcji SQL lub triggerów,
- RLS.

Kluczowe jest zachowanie reguł biznesowych nawet przy równoczesnych zapisach.

## 8. UI/UX

### 8.1 Strona użytkownika

Na stronie głównej użytkownik widzi:

- nazwę aplikacji,
- swój status logowania,
- listę bieżących wydarzeń,
- przycisk zapisu przy każdym wydarzeniu,
- informację o liczbie wolnych miejsc,
- komunikat sukcesu lub błędu po operacji,
- sekcję z wydarzeniami, na które już jest zapisany.

### 8.2 Strona administratora

Na `../admin` administrator widzi:

- panel logowania,
- listę wszystkich wydarzeń,
- podział na bieżące i archiwalne,
- funkcje tworzenia i edycji wydarzeń,
- funkcje archiwizacji i przywracania,
- listę zapisanych osób dla wybranego wydarzenia,
- funkcje zarządzania użytkownikami.

### 8.3 Zasady wizualne

- prosty, nowoczesny layout,
- wyraźna hierarchia informacji,
- bez nadmiernych ozdobników,
- czytelne formularze,
- czytelne stany pusty / ładowanie / błąd / sukces,
- użycie współczesnej typografii i przestrzeni,
- brak przeładowania elementami.

## 9. Specyfikacja API

Backend ma udostępniać REST API.

### 9.1 Zasady ogólne

- format danych: JSON,
- wszystkie odpowiedzi błędów zwracają pole `message`,
- statusy HTTP muszą odzwierciedlać wynik operacji,
- endpointy wymagające autoryzacji muszą sprawdzać token Supabase lub sesję zgodnie z wybranym przepływem,
- endpointy administracyjne muszą sprawdzać rolę `admin`.

### 9.2 Endpointy auth

#### `POST /api/auth/login`

Przeznaczenie:

- logowanie `email + hasło`.

Request:

```json
{
  "email": "user@example.com",
  "password": "secret"
}
```

Response `200`:

```json
{
  "message": "Zalogowano.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user"
  }
}
```

#### `POST /api/auth/magic-link`

Przeznaczenie:

- wysłanie magic linka na e-mail.

Request:

```json
{
  "email": "user@example.com"
}
```

Response `200`:

```json
{
  "message": "Link logowania został wysłany."
}
```

#### `POST /api/auth/logout`

Przeznaczenie:

- wylogowanie bieżącej sesji.

Response `200`:

```json
{
  "message": "Wylogowano."
}
```

#### `GET /api/auth/me`

Przeznaczenie:

- zwraca bieżącego użytkownika i jego rolę.

Response `200`:

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

### 9.3 Endpointy użytkownika

#### `GET /api/events/current`

Przeznaczenie:

- zwraca listę wydarzeń bieżących dostępnych dla użytkownika.

Response `200`:

```json
{
  "events": [
    {
      "id": "uuid",
      "name": "Nazwa wydarzenia",
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

Przeznaczenie:

- zwraca wydarzenia, na które zalogowany użytkownik jest już zapisany.

Response `200`:

```json
{
  "registrations": [
    {
      "eventId": "uuid",
      "eventName": "Nazwa wydarzenia",
      "eventDatetime": "2026-08-01T10:00:00.000Z"
    }
  ]
}
```

#### `POST /api/events/:eventId/register`

Przeznaczenie:

- zapis bieżącego użytkownika na wybrane wydarzenie.

Warunki:

- użytkownik musi być zalogowany,
- wydarzenie musi istnieć,
- wydarzenie musi być `current`,
- nie może być pełne,
- użytkownik nie może być już zapisany.

Response `201`:

```json
{
  "message": "Zapisano na wydarzenie.",
  "registration": {
    "eventId": "uuid",
    "userId": "uuid"
  }
}
```

Błędy biznesowe:

- `400` - nieprawidłowe dane,
- `401` - brak logowania,
- `403` - brak uprawnień,
- `404` - wydarzenie nie istnieje,
- `409` - duplikat lub brak miejsc,
- `410` - wydarzenie archiwalne, jeżeli chce się użyć takiego kodu zamiast `409`.

#### `DELETE /api/me/registrations/:eventId`

Przeznaczenie:

- opcjonalna funkcja rezygnacji użytkownika z zapisu.

Jeśli zostanie zaimplementowana, musi być zgodna z regułami wydarzenia i autoryzacji.

Jeżeli zespół uzna to za zbędne, endpoint można pominąć. Nie jest to wymaganie obowiązkowe.

### 9.4 Endpointy administratora

#### `GET /api/admin/events`

Przeznaczenie:

- zwraca wszystkie wydarzenia, bieżące i archiwalne.

Response `200`:

```json
{
  "events": [
    {
      "id": "uuid",
      "name": "Nazwa wydarzenia",
      "eventDatetime": "2026-08-01T10:00:00.000Z",
      "status": "current",
      "capacity": 12,
      "registeredCount": 4,
      "remainingSeats": 8
    }
  ]
}
```

#### `POST /api/admin/events`

Przeznaczenie:

- tworzenie wydarzenia.

#### `PATCH /api/admin/events/:eventId`

Przeznaczenie:

- edycja wydarzenia, w tym nazwy, daty, opisu, pojemności i statusu.

#### `POST /api/admin/events/:eventId/archive`

Przeznaczenie:

- archiwizacja wydarzenia.

#### `POST /api/admin/events/:eventId/restore`

Przeznaczenie:

- przywrócenie wydarzenia do statusu bieżącego.

#### `GET /api/admin/events/:eventId/registrations`

Przeznaczenie:

- lista zapisów dla wybranego wydarzenia.

#### `GET /api/admin/users`

Przeznaczenie:

- lista użytkowników aplikacji.

#### `POST /api/admin/users`

Przeznaczenie:

- ręczne dodanie użytkownika przez administratora.

Uwaga:

- brak publicznej rejestracji,
- użytkownik może być dodany do aplikacji przez admina bez zaproszenia.

#### `PATCH /api/admin/users/:userId`

Przeznaczenie:

- edycja danych użytkownika i roli.

#### `DELETE /api/admin/registrations/:registrationId`

Przeznaczenie:

- usunięcie zapisu przez administratora.

#### `POST /api/admin/events/:eventId/reset`

Przeznaczenie:

- wyczyszczenie zapisów dla danego wydarzenia.

### 9.5 Wymagania dla odpowiedzi API

W odpowiedziach dla list wydarzeń dobrze jest zwracać:

- `capacity`,
- `registeredCount`,
- `remainingSeats`,
- `status`,
- `isRegistered` dla użytkownika.

To upraszcza frontend i zmniejsza liczbę wywołań.

## 10. Konfiguracja i pliki środowiskowe

Projekt musi zawierać:

- `.env`,
- `.env.example`,
- `.gitignore`.

### 10.1 `.env`

Zawiera rzeczywiste wartości środowiskowe, których nie wolno commitować.

Przykładowe zmienne:

- `PORT`,
- `SUPABASE_URL`,
- `SUPABASE_ANON_KEY`,
- `SUPABASE_SERVICE_ROLE_KEY`,
- `EVENT_CAPACITY`,
- `APP_URL`,
- `ADMIN_PATH`.

### 10.2 `.env.example`

Zawiera przykładowe wartości bez sekretów.

### 10.3 `.gitignore`

Powinien ignorować co najmniej:

- `.env`,
- `.env.local`,
- logi,
- `node_modules`,
- build output,
- pliki tymczasowe.

## 11. Wymagania niefunkcjonalne

- czytelna struktura kodu,
- rozdzielenie warstw i odpowiedzialności,
- walidacja danych wejściowych,
- obsługa błędów użytkownika i serwera,
- brak hardcode dla kluczowych wartości biznesowych,
- zgodność z zasadą najmniejszego uprzywilejowania,
- przygotowanie pod testy jednostkowe i integracyjne,
- prosta rozbudowa o kolejne wydarzenia i role.

## 12. Testy

Minimalny zakres testów:

- logika zapisu na wydarzenie,
- blokada duplikatów,
- blokada pełnego wydarzenia,
- blokada archiwalnego wydarzenia,
- filtrowanie bieżących i archiwalnych wydarzeń,
- autoryzacja ról,
- poprawność komunikatów i statusów API.

## 13. Kryteria akceptacji

Rozwiązanie uznajemy za gotowe, jeśli:

- użytkownik loguje się przez Supabase,
- administrator loguje się przez Supabase,
- nie ma publicznej rejestracji użytkowników,
- użytkownik widzi tylko bieżące wydarzenia,
- użytkownik może zapisać się na wiele wydarzeń, ale na każde tylko raz,
- limit miejsc jest egzekwowany per wydarzenie,
- archiwalne wydarzenia nie przyjmują zapisów i są widoczne tylko dla admina,
- administrator może tworzyć, edytować, archiwizować i przeglądać wydarzenia,
- administrator może przeglądać i zarządzać użytkownikami,
- istnieją pliki `.env`, `.env.example` i `.gitignore`,
- API jest opisane i spójne z frontendem,
- UI jest prosty, nowoczesny i czytelny.

## 14. Zalecenia implementacyjne dla CODEX

- budować projekt od zera,
- użyć tej specyfikacji jako jedynego źródła prawdy,
- najpierw przygotować model danych i kontrakt API,
- później backend,
- potem frontend,
- na końcu testy i dopracowanie UX,
- nie wprowadzać dodatkowych funkcji poza zakresem bez uzasadnienia,
- jeśli coś jest niejednoznaczne, przyjąć najprostsze rozwiązanie zgodne z tą specyfikacją i opisać je w podsumowaniu.
