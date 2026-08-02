# TESTY SMOKE 1

Data wykonania: 2026-08-02

## Zakres

Uproszczone smoke testy produkcji pod adresem:

- `https://vibecoding-zadanie-production.up.railway.app/`

Sprawdzone ścieżki:

- `/`
- `/admin`
- `/set-password`
- `/api/auth/registration-status`
- `/api/events/current`

## Wyniki

- Strona główna zwróciła `HTTP/2 200`.
- Panel administratora zwrócił `HTTP/2 200`.
- Strona ustawiania hasła zwróciła `HTTP/2 200`.
- Endpoint statusu rejestracji zwrócił poprawny JSON: `{"enabled":false}`.
- Publiczny endpoint bieżących wydarzeń zwrócił poprawny JSON z listą wydarzeń.

## Obserwacje

- Aplikacja odpowiadała na żądania HTTP bez błędów po stronie serwera.
- Rejestracja nowych kont jest obecnie wyłączona na produkcji.
- Publiczny endpoint wydarzeń działa dla niezalogowanego klienta i zwraca strukturę zgodną z oczekiwaniami.

## Wniosek

Uproszczony smoke test wypadł pozytywnie. Produkcja jest dostępna, a podstawowe ścieżki UI i API odpowiadają poprawnie.
