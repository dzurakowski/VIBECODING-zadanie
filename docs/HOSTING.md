# Wdrożenie i hosting

## Wymagania

- Node.js w aktualnej wersji LTS,
- projekt Supabase z włączonym Auth,
- własny adres aplikacji ustawiony w `APP_URL`,
- skonfigurowany SMTP w Supabase dla środowiska produkcyjnego.

## Zmienne środowiskowe

Minimalny zestaw:

```env
PORT=3000
APP_URL=https://twoja-domena.pl
ADMIN_PATH=/admin
SUPABASE_URL=https://twoj-projekt.supabase.co
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
EVENT_CAPACITY=12
NODE_ENV=production
```

## Baza danych

1. Wykonaj `supabase/schema.sql`.
2. Dla istniejących baz uruchom migracje z `supabase/migrations/`.
3. Upewnij się, że tabela `app_settings` istnieje i ma wiersz `id = 1`.

## Supabase Auth

W panelu Supabase:

- włącz e-mail i magic link,
- ustaw poprawny `APP_URL`,
- skonfiguruj redirect dla `/set-password`,
- użyj własnego SMTP w produkcji.

## Uruchomienie aplikacji

```bash
npm install
npm run start
```

## Weryfikacja wdrożenia

- strona główna działa pod `/`,
- panel administratora działa pod `/admin`,
- ustawianie hasła działa pod `/set-password`,
- logowanie zwraca poprawną sesję Supabase,
- bieżące wydarzenia są widoczne bez archiwalnych rekordów,
- zapis na pełne lub archiwalne wydarzenie kończy się błędem biznesowym,
- ostatni aktywny administrator nie może zostać usunięty ani zdegradowany.

## Notatki operacyjne

- Plik `.env` nie powinien być commitowany.
- `EVENT_CAPACITY` jest limitem pojedynczego wydarzenia.
- Rejestracja nowych kont jest sterowana z aplikacji, nie z UI Supabase.

