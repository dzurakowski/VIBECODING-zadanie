# TESTY SMOKE 2

Data wykonania: 2026-08-02

## Cel

Krótki audyt produkcji pod kątem możliwych regresji UI i API na podstawie odpowiedzi serwera.

## Sprawdzone elementy UI

Pobrano HTML dla:

- strony głównej `/`
- panelu administratora `/admin`
- strony ustawiania hasła `/set-password`

### Strona główna

Potwierdzone elementy:

- tytuł strony: `Zapisy na wydarzenia`
- formularz logowania
- sekcja rejestracji ukrywana warunkowo
- sekcja obszaru prywatnego
- skrypt startowy `/app.js`

### Panel administratora

Potwierdzone elementy:

- tytuł strony: `Panel administratora`
- formularz logowania administratora
- dashboard z zakładkami `Wydarzenia`, `Użytkownicy`, `Moje konto`
- formularze do tworzenia wydarzeń, zapraszania użytkowników i zmiany hasła
- skrypt startowy `/admin.js`

### Strona ustawiania hasła

Potwierdzone elementy:

- tytuł strony: `Ustaw hasło`
- formularz ustawienia nowego hasła
- skrypt startowy `/set-password.js`

## Sprawdzone elementy API

- `GET /api/auth/registration-status` zwrócił `200` i JSON `{"enabled":false}`.
- `GET /api/events/current` zwrócił `200` i listę wydarzeń w poprawnym formacie JSON.
- Kontrolny request do nieistniejącej ścieżki zwrócił `404` z typem `text/plain; charset=utf-8`.

## Obserwacje oparte na odpowiedziach serwera

- Publiczne trasy UI zwracają poprawny kod i HTML bez widocznych błędów serwera.
- Statyczne strony mają oczekiwane punkty wejścia do odpowiednich skryptów frontendowych.
- API zwraca poprawne kody odpowiedzi dla ścieżek istniejących i nieistniejących.
- W danych `GET /api/events/current` widać wydarzenia testowe, a pola takie jak `registeredCount`, `remainingSeats` i `canRegister` są obecne.

## Wniosek

Nie wykryto oczywistych regresji na poziomie dostępności UI i podstawowych odpowiedzi API. Produkcja wygląda spójnie z oczekiwanym stanem aplikacji.
