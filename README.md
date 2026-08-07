# STREFA WYDARZEŃ

STREFA WYDARZEŃ to aplikacja webowa do zarządzania wydarzeniami i zapisami
uczestników. Użytkownicy mogą przeglądać wydarzenia i dokonywać zapisów,
a administratorzy zarządzają wydarzeniami, użytkownikami oraz limitami miejsc.

## Funkcje

- logowanie e-mailem i hasłem;
- logowanie przez magic link;
- odzyskiwanie i ustawianie hasła;
- opcjonalna rejestracja nowych użytkowników;
- przeglądanie bieżących wydarzeń;
- zapisy na wydarzenia i rezygnacja z przyszłych wydarzeń;
- blokada zapisów na wydarzenia przeszłe, archiwalne i całkowicie zajęte;
- panel administratora;
- tworzenie, edycja, archiwizacja, przywracanie i usuwanie wydarzeń;
- zarządzanie użytkownikami, rolami i aktywnością kont;
- filtrowanie i sortowanie tabel;
- backendowa ochrona reguł biznesowych, limitów miejsc i uprawnień.

## Technologie

- Node.js;
- Vanilla JavaScript;
- HTML5 i CSS3;
- Supabase Auth;
- Supabase PostgreSQL;
- Railway jako platforma wdrożeniowa.

## Wymagania

- Node.js w aktualnej wersji LTS;
- projekt Supabase;
- dostęp do Supabase SQL Editor;
- skonfigurowany lokalny plik `.env`.

## Uruchomienie lokalne

```bash
git clone <adres-repozytorium>
cd VIBECODING-zadanie
npm install
cp .env.example .env
npm run dev
```

Aplikacja będzie dostępna pod:

- użytkownik: `http://localhost:3000`;
- administrator: `http://localhost:3000/admin`;
- ustawianie hasła: `http://localhost:3000/set-password`.

Tryb developerski uruchamia `npm run dev`. Do uruchomienia aplikacji bez trybu
watch użyj:

```bash
npm start
```

## Konfiguracja Supabase

1. Utwórz projekt Supabase.
2. Uruchom `supabase/schema.sql` w SQL Editorze.
3. Uruchom wszystkie migracje z katalogu `supabase/migrations/`.
4. Włącz logowanie e-mailem oraz magic linkiem.
5. Ustaw `Site URL` zgodny z wartością `APP_URL`.
6. Dodaj dozwolone adresy przekierowań dla strony głównej oraz `/set-password`.
7. W środowisku produkcyjnym skonfiguruj własny SMTP dla wiadomości e-mail.

Jeśli korzystasz z istniejącej bazy, upewnij się, że schema i wszystkie migracje
zostały zastosowane w odpowiedniej kolejności.

## Konfiguracja środowiska

Skopiuj `.env.example` do `.env` i uzupełnij wartości:

| Zmienna | Wymagana | Opis |
| --- | :---: | --- |
| `PORT` | nie | Port serwera, domyślnie `3000` |
| `APP_URL` | tak | Publiczny adres aplikacji używany w redirectach |
| `ADMIN_PATH` | nie | Ścieżka panelu administratora, domyślnie `/admin` |
| `SUPABASE_URL` | tak | Adres projektu Supabase |
| `SUPABASE_PUBLISHABLE_KEY` | tak | Klucz publishable używany przez aplikację |
| `SUPABASE_SECRET_KEY` | tak | Sekretny klucz używany wyłącznie po stronie backendu |
| `EVENT_CAPACITY` | nie | Domyślna liczba miejsc na wydarzenie, domyślnie `12` |
| `NODE_ENV` | nie | Środowisko uruchomieniowe, np. `development` lub `production` |

Do lokalnego seedowania wymagane są dodatkowo:

| Zmienna | Opis |
| --- | --- |
| `ALLOW_SEED` | Musi mieć wartość `true`, aby odblokować seedowanie |
| `SEED_TEST_PASSWORD` | Hasło tworzone dla syntetycznych kont testowych |

Nie commituj pliku `.env`. Klucz `SUPABASE_SECRET_KEY` nie może trafić do kodu
frontendowego ani do publicznie dostępnych zasobów.

## Struktura projektu

```text
src/       backend, API i logika biznesowa
public/    frontend aplikacji
tests/     testy automatyczne
supabase/  schema bazy i migracje
scripts/   skrypty pomocnicze i seedujące
docs/      aktualna dokumentacja projektu
```

## API

Główne grupy endpointów:

- `/api/auth` — logowanie, rejestracja, reset hasła i zarządzanie sesją;
- `/api/events` — bieżące wydarzenia i zapisy użytkowników;
- `/api/me` — dane i zapisy zalogowanego użytkownika;
- `/api/admin` — operacje dostępne dla administratora.

Pełna lista endpointów i reguł działania znajduje się w
[specyfikacji rozwiązania](docs/SPECYFIKACJA.md).

## Testy

Uruchomienie pełnego zestawu testów:

```bash
npm test
```

Testy obejmują między innymi uwierzytelnianie, sesje, walidację, reguły zapisów,
zarządzanie użytkownikami, ustawienia rejestracji oraz filtrowanie i sortowanie
tabel.

Projekt nie posiada obecnie osobnego lintowania ani testów end-to-end.

## Seedowanie danych testowych

Skrypty seedujące tworzą syntetyczne konta, wydarzenia i zapisy. Przed użyciem
ustaw w lokalnym `.env` `ALLOW_SEED=true` oraz `SEED_TEST_PASSWORD`.

```bash
npm run seed
```

Do wyczyszczenia danych testowych z zachowaniem konta administratora użyj:

```bash
npm run seed:cleanup
```

Alternatywnie `npm run seed:reset` wykonuje operację resetu.

> Seedowanie i czyszczenie modyfikują dane w bazie. Nie uruchamiaj tych poleceń
> na środowisku produkcyjnym.

## Bezpieczeństwo

- Nie commituj pliku `.env` ani żadnych kluczy API.
- `SUPABASE_SECRET_KEY` jest używany wyłącznie po stronie serwera.
- Operacje administratora są weryfikowane backendowo.
- Reguły zapisów i limity miejsc są chronione również po stronie bazy danych.
- Do testów używaj wyłącznie syntetycznych danych.
- Nie uruchamiaj seedowania na produkcyjnej bazie.

## Wdrożenie

Aplikację można wdrożyć na Railway. W środowisku produkcyjnym należy ustawić:

- `APP_URL` na publiczną domenę aplikacji;
- zmienne Supabase zgodnie z sekcją konfiguracji;
- `NODE_ENV=production`;
- poprawne adresy redirect w Supabase Auth;
- konfigurację SMTP dla wiadomości e-mail.

Szczegółowa instrukcja znajduje się w
[dokumentacji wdrożenia i hostingu](docs/HOSTING.md).

## Status projektu

Projekt jest gotowy do przeglądu i dalszego rozwoju. Aktualna wersja aplikacji
ma numer `1.0.0`.

## Licencja

Projekt prywatny, bez udzielonej licencji open source.

## Dodatkowa dokumentacja

- [Specyfikacja rozwiązania](docs/SPECYFIKACJA.md);
- [Wdrożenie i hosting](docs/HOSTING.md);
- [Instrukcja domeny, DNS, HTTPS i poczty Supabase](INSTRUKCJA_DOMENA_RAILWAY_SUPABASE.md).
