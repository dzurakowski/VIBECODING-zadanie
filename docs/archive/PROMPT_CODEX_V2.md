# Prompt dla CODEX - wersja 2

Masz zbudować od zera docelowe rozwiązanie aplikacji zapisów na wydarzenia.

Traktuj poniższe pliki jako źródła prawdy:

- [SPECYFIKACJA.md](SPECYFIKACJA.md)
- [SPECYFIKACJA_IMPLEMENTACYJNA.md](SPECYFIKACJA_IMPLEMENTACYJNA.md)
- [PLAN_IMPLEMENTACJI.md](PLAN_IMPLEMENTACJI.md)

## Zadanie

Zaimplementuj kompletną aplikację zgodnie ze specyfikacją, implementacyjną specyfikacją i planem prac.

## Zakres

- architektura 3-warstwowa: frontend, backend Node.js, Supabase,
- logowanie użytkowników i administratorów przez Supabase,
- brak publicznej rejestracji,
- ręczne dodawanie użytkowników przez administratora,
- role `user` i `admin`,
- strona użytkownika na głównym adresie aplikacji,
- panel administratora pod `../admin`,
- wiele wydarzeń, bieżące i archiwalne,
- zapis użytkownika na wiele wydarzeń, ale tylko raz na każde wydarzenie,
- limit miejsc per wydarzenie, konfigurowalny i domyślnie `12`,
- nowoczesny, prosty i przejrzysty UI/UX,
- pliki `.env`, `.env.example` i `.gitignore`,
- kompletna specyfikacja API i implementacja,
- testy kluczowej logiki.

## Kolejność pracy

Realizuj projekt zgodnie z planem:

1. inicjalizacja projektu,
2. konfiguracja Supabase,
3. warstwa infrastruktury backendu,
4. repository layer,
5. service layer,
6. API backendu,
7. frontend użytkownika,
8. frontend administratora,
9. testy,
10. dopracowanie UX i stabilizacja.

## Wymagania wykonawcze

1. Najpierw ustal i zaimplementuj model danych oraz kontrakty API.
2. Następnie zbuduj backend w Node.js z wyraźnym podziałem warstw.
3. Potem zbuduj frontend użytkownika i administratora.
4. Dodaj autoryzację Supabase i obsługę ról.
5. Dodaj reguły biznesowe:
   - brak publicznej rejestracji,
   - blokada duplikatów,
   - blokada pełnych wydarzeń,
   - blokada wydarzeń archiwalnych.
6. Dodaj testy dla najważniejszych scenariuszy.
7. Dodaj konfigurację środowiskową i pliki pomocnicze.
8. Doprowadź UI do stanu prostego, nowoczesnego i czytelnego.

## Zasady pracy

- nie zmieniaj zakresu bez wyraźnej potrzeby,
- nie dodawaj publicznej rejestracji,
- nie polegaj wyłącznie na frontendzie w kwestii bezpieczeństwa,
- nie pomijaj roli `admin` w ochronie endpointów,
- nie twórz niepotrzebnych abstrakcji, jeśli prostsze rozwiązanie spełnia wymagania,
- zachowaj spójne nazwy w API, UI i modelu danych,
- jeśli pojawi się niejednoznaczność, wybierz najprostszy wariant zgodny ze specyfikacją i opisz go w podsumowaniu.

## Oczekiwany rezultat

- działająca aplikacja,
- spójna struktura katalogów,
- kompletna implementacja zgodna z dokumentami,
- sensowne testy,
- poprawna konfiguracja środowiskowa,
- brak śmieciowego kodu,
- czytelny kod z rozdzieleniem odpowiedzialności.

## Uwaga końcowa

Jeżeli w trakcie pracy pojawi się potrzeba decyzji architektonicznej, kieruj się:

- prostotą,
- bezpieczeństwem,
- czytelnością,
- zgodnością ze specyfikacją i planem implementacji.
