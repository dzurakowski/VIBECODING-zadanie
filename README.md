# Zapisy na wydarzenia

Aplikacja do zapisów na wydarzenia z panelem użytkownika i panelem administratora. Projekt działa w modelu:

- frontend statyczny serwowany przez Node.js,
- backend Node.js jako warstwa API,
- Supabase jako baza danych i warstwa uwierzytelniania.

## Najważniejsze funkcje

- logowanie e-mailem i hasłem,
- logowanie przez magic link,
- odzyskiwanie i ustawianie hasła na `/set-password`,
- opcjonalna rejestracja użytkowników sterowana przełącznikiem administratora,
- lista bieżących wydarzeń dla użytkownika,
- lista własnych zapisów z możliwością rezygnacji tylko dla przyszłych wydarzeń,
- zapis na wydarzenie, którego data już minęła, jest blokowany,
- panel administratora pod `/admin`,
- tworzenie, edycja, archiwizacja, przywracanie i usuwanie wydarzeń,
- zarządzanie użytkownikami, rolami i aktywnością kont,
- filtrowanie i sortowanie tabel w widoku użytkownika i administratora,
- ochrona backendowa reguł biznesowych, w tym limitów miejsc i ról.

## Start lokalny

1. Skopiuj `.env.example` do `.env` i uzupełnij dane Supabase.
2. Wykonaj `supabase/schema.sql` w SQL Editorze Supabase.
3. Jeśli używasz istniejącej bazy, uruchom też migracje z `supabase/migrations/`.
4. Zainstaluj zależności:

```bash
npm install
```

5. Uruchom aplikację:

```bash
npm run dev
```

Adresy lokalne:

- użytkownik: `http://localhost:3000`
- administrator: `http://localhost:3000/admin`
- ustawianie hasła: `http://localhost:3000/set-password`

## Testy

```bash
npm test
```

## Seedowanie danych

Do lokalnych testów możesz przygotować syntetyczne dane:

```bash
npm run seed
```

Skrypt tworzy konta testowe, wydarzenia i zapisy. Do pełnego wyczyszczenia bazy z pozostawieniem wyłącznie konta `Dariusz Administrator <dariusz@example.test>` użyj:

```bash
npm run seed:cleanup
```

Obie operacje wymagają lokalnego `.env` z `ALLOW_SEED=true` oraz `SEED_TEST_PASSWORD`.

## Konfiguracja środowiska

W `.env` używane są:

- `PORT`
- `APP_URL`
- `ADMIN_PATH`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `EVENT_CAPACITY`
- `NODE_ENV`

Plik `.env.example` zawiera aktualny zestaw wymaganych zmiennych.

## Dokumentacja

- [Specyfikacja rozwiązania](docs/SPECYFIKACJA.md)
- [Wdrożenie i hosting](docs/HOSTING.md)
- [Archiwum dokumentów](docs/ARCHIVE.md)
