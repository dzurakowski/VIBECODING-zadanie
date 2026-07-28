# Prompt dla CODEX

Masz zbudować od zera docelowe rozwiązanie aplikacji zapisów na wydarzenia.

Najpierw przeczytaj i traktuj jako źródło prawdy plik:

- [SPECYFIKACJA.md](SPECYFIKACJA.md)

## Zadanie

Zaimplementuj kompletną aplikację zgodnie ze specyfikacją.

### Zakres

- architektura 3-warstwowa: frontend, backend Node.js, Supabase,
- logowanie użytkowników i administratorów przez Supabase,
- brak publicznej rejestracji,
- ręczne dodawanie użytkowników przez administratora,
- podział na role `user` i `admin`,
- strona użytkownika na głównym adresie aplikacji,
- panel administratora pod `../admin`,
- wiele wydarzeń, z podziałem na bieżące i archiwalne,
- zapis użytkownika na wiele wydarzeń, ale tylko raz na każde wydarzenie,
- limit miejsc per wydarzenie, konfigurowalny w pliku konfiguracyjnym i przez env,
- nowoczesny, prosty i przejrzysty UI/UX,
- pliki `.env`, `.env.example` i `.gitignore`,
- kompletna specyfikacja API i jej implementacja,
- testy kluczowej logiki.

## Wymagania wykonawcze

1. Zacznij od zaprojektowania modelu danych i kontraktów API.
2. Następnie zaimplementuj backend w Node.js.
3. Potem zaimplementuj frontend dla użytkownika i administratora.
4. Dodaj autoryzację i obsługę ról.
5. Dodaj obsługę wydarzeń bieżących i archiwalnych.
6. Dodaj ograniczenia biznesowe:
   - blokada duplikatów,
   - blokada pełnych wydarzeń,
   - blokada zapisów do wydarzeń archiwalnych.
7. Dodaj konfigurację środowiskową.
8. Dodaj testy.

## Zasady

- nie zmieniaj zakresu bez uzasadnienia,
- nie dodawaj publicznej rejestracji użytkowników,
- nie ukrywaj istotnych błędów za ogólnym komunikatem,
- dbaj o czytelny podział warstw,
- preferuj proste rozwiązania zgodne ze specyfikacją,
- jeśli pojawi się niejednoznaczność, wybierz najprostszy wariant i opisz go w podsumowaniu,
- zachowaj spójność nazw w API, UI i bazie.

## Oczekiwany rezultat

- działająca aplikacja,
- czytelna struktura katalogów,
- kompletna implementacja zgodna ze specyfikacją,
- sensowne testy,
- aktualne pliki konfiguracyjne,
- brak śmieciowych plików i zbędnego kodu.

## Uwaga końcowa

Jeżeli pojawi się potrzeba podjęcia decyzji architektonicznej, kieruj się:

- prostotą,
- bezpieczeństwem,
- czytelnością,
- zgodnością ze specyfikacją.
