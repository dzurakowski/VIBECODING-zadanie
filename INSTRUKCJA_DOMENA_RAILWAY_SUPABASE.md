# Instrukcja: własna domena w Railway, DNS, HTTPS i maile Supabase

Poniżej jest prosta instrukcja krok po kroku.

## 1. Podpięcie własnej domeny w Railway

Najlepiej użyć subdomeny, na przykład `app.twojadomena.pl`.

1. Wejdź do Railway i otwórz swój projekt.
2. Kliknij usługę z aplikacją.
3. Wejdź w `Settings`.
4. Odszukaj sekcję `Public Networking`.
5. Kliknij `+ Custom Domain`.
6. Wpisz swoją domenę, na przykład `app.twojadomena.pl`.
7. Railway pokaże rekordy DNS, które trzeba dodać u operatora domeny.

W praktyce Railway zwykle wymaga rekordów:

- `CNAME`
- `TXT` do weryfikacji własności domeny

Źródła:

- [Railway: Working with Domains](https://docs.railway.com/networking/domains/working-with-domains)
- [Railway: Public Networking](https://docs.railway.com/public-networking)

## 2. Skonfigurowanie DNS domeny

To robisz w panelu firmy, u której kupiłeś domenę, na przykład OVH, Cloudflare albo Namecheap.

1. Zaloguj się do panelu domeny.
2. Otwórz ustawienia DNS.
3. Dodaj rekordy, które pokazało Railway.
4. Zapisz zmiany.
5. Poczekaj na propagację DNS.

Najczęściej wygląda to tak:

- `CNAME` dla subdomeny, na przykład `app.twojadomena.pl`
- `TXT` do potwierdzenia, że domena należy do Ciebie

Jeśli chcesz podpiąć domenę główną, czyli `twojadomena.pl`, sprawdź, czy operator DNS obsługuje:

- `ALIAS`
- `ANAME`
- albo `CNAME flattening`

Zwykły `CNAME` często nie działa na domenie głównej.

Źródła:

- [Railway: Working with Domains](https://docs.railway.com/networking/domains/working-with-domains)
- [Railway API: Manage Domains](https://docs.railway.com/integrations/api/manage-domains)

## 3. Jak zrobić HTTPS

W Railway HTTPS zazwyczaj włącza się automatycznie po poprawnym podpięciu domeny.

1. Dodaj domenę w Railway.
2. Ustaw rekordy DNS u operatora domeny.
3. Poczekaj, aż Railway zweryfikuje domenę.
4. Wejdź na stronę przez `https://twojadomena.pl` albo `https://app.twojadomena.pl`.

Po poprawnej konfiguracji przeglądarka powinna pokazywać kłódkę, a połączenie będzie szyfrowane.

Źródła:

- [Railway: Working with Domains](https://docs.railway.com/networking/domains/working-with-domains)
- [Railway: Public Networking](https://docs.railway.com/public-networking)

## 4. Jak spersonalizować maile logowania w Supabase

W Supabase trzeba ustawić kilka rzeczy.

### 4.1. Ustaw właściwy adres strony

1. Wejdź do Supabase.
2. Otwórz ustawienia Auth.
3. Ustaw `Site URL` na swoją produkcyjną domenę, na przykład `https://app.twojadomena.pl`.

### 4.2. Dodaj poprawne redirect URLs

Dodaj do dozwolonych przekierowań:

- `https://app.twojadomena.pl`
- `https://app.twojadomena.pl/set-password`

Jeśli tego nie zrobisz, linki z maili mogą nie działać poprawnie.

### 4.3. Zmień szablony maili

1. W Supabase wejdź w `Auth`.
2. Otwórz `Email Templates`.
3. Zmień treść maili dla:
   - magic link,
   - resetu hasła,
   - zaproszenia użytkownika,
   - potwierdzenia rejestracji.

Możesz dodać:

- nazwę projektu,
- imię użytkownika,
- własny temat maila,
- przycisk prowadzący do strony logowania albo ustawiania hasła.

### 4.4. Opcjonalnie podłącz własny SMTP

Jeśli chcesz, żeby maile wyglądały bardziej profesjonalnie i lepiej dochodziły, warto ustawić własny SMTP.

1. Wejdź w ustawienia Auth w Supabase.
2. Odszukaj sekcję SMTP.
3. Wpisz dane swojego serwera pocztowego.
4. Zapisz ustawienia.

Źródła:

- [Supabase: Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Supabase: Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase: Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)

## 5. Jak to ustawić dla tego projektu

Najprostszy poprawny układ to:

1. Podpiąć subdomenę do Railway, na przykład `app.twojadomena.pl`.
2. Ustawić `APP_URL=https://app.twojadomena.pl` w zmiennych środowiskowych Railway.
3. W Supabase ustawić `Site URL` na `https://app.twojadomena.pl`.
4. Dodać `https://app.twojadomena.pl/set-password` do redirect URLs.
5. Zmienić treść maili w Supabase.
6. Opcjonalnie podłączyć własny SMTP.
7. Sprawdzić, czy magic link i reset hasła prowadzą już na nową domenę.

## 6. Najkrótsza wersja

- W Railway dodajesz własną domenę w `Settings -> Public Networking`.
- W DNS u operatora domeny dodajesz rekordy `CNAME` i `TXT`.
- Railway samo wystawia HTTPS po weryfikacji domeny.
- W Supabase ustawiasz `Site URL`, redirecty i szablony maili.
- Jeśli chcesz lepsze maile, podłączasz własny SMTP.
