# VIBECODING-zadanie

Aplikacja do zapisów na wydarzenia, z rolami użytkownika i administratora.

Szczegóły ról, logowania, odzyskiwania haseł i obsługi panelu opisuje [DOKUMENTACJA_SYSTEMU.md](DOKUMENTACJA_SYSTEMU.md).

## Uruchomienie

1. Skopiuj `.env.example` do `.env` i uzupełnij dane projektu Supabase.
2. Uruchom [supabase/schema.sql](supabase/schema.sql) w SQL Editorze Supabase.
   Dla istniejącej bazy wykonaj także [supabase/migrations/20260728_user_management.sql](supabase/migrations/20260728_user_management.sql).
   Przy zmianach związanych z rejestracją użytkowników uruchom też [supabase/migrations/20260802_registration_settings.sql](supabase/migrations/20260802_registration_settings.sql).
3. Zainstaluj zależności: `npm install`.
4. Uruchom aplikację: `npm run dev`.

Strona użytkownika jest pod `http://localhost:3000`, a panel administracyjny pod `http://localhost:3000/admin`.

Pierwszego administratora utwórz w Supabase Auth, a następnie dodaj dla niego rekord w `profiles` z rolą `admin`.
W panelu administratora na pasku sesji widać imię i nazwisko, przycisk `Wyloguj` oraz link do przejścia na widok użytkownika bez wylogowania.
Przycisk `Usuń trwale` dla wydarzeń pojawia się tylko przy zarchiwizowanych wydarzeniach bez zapisów.
Przycisk `Rezygnuj` w sekcji „Moje zapisy” pojawia się tylko dla przyszłych wydarzeń i jest kontrolowany przez backend.
Lista użytkowników w panelu administratora może być filtrowana i sortowana po imieniu i nazwisku, e-mailu, roli oraz statusie.

## Dane demonstracyjne

Mechanizm seedowania tworzy wyłącznie syntetyczne rekordy oznaczone prefiksem `[TEST]`. Nie uruchamiaj go dla środowiska produkcyjnego.

W lokalnym `.env` ustaw `ALLOW_SEED=true` oraz hasło testowe w `SEED_TEST_PASSWORD` (minimum 10 znaków), a następnie uruchom `npm run seed`. Skrypt pokaże plan i wymaga wpisania `SEED` przed zapisem do bazy.

Usunięcie wyłącznie danych `[TEST]` wykonuje `npm run seed:cleanup`; wymaga ono wpisania `CLEANUP`. Nie dodawaj tych wartości do `.env.example` ani repozytorium.
