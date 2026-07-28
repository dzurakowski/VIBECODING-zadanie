# VIBECODING-zadanie

Aplikacja do zapisów na wydarzenia, z rolami użytkownika i administratora.

## Uruchomienie

1. Skopiuj `.env.example` do `.env` i uzupełnij dane projektu Supabase.
2. Uruchom [supabase/schema.sql](supabase/schema.sql) w SQL Editorze Supabase.
3. Zainstaluj zależności: `npm install`.
4. Uruchom aplikację: `npm run dev`.

Strona użytkownika jest pod `http://localhost:3000`, a panel administracyjny pod `http://localhost:3000/admin`.

Pierwszego administratora utwórz w Supabase Auth, a następnie dodaj dla niego rekord w `profiles` z rolą `admin`.
