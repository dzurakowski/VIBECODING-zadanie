# Plan implementacji

Dokument opisuje kolejność prac przy budowie docelowego rozwiązania aplikacji zapisów na wydarzenia.

Źródła wymagań:

- [SPECYFIKACJA.md](SPECYFIKACJA.md)
- [SPECYFIKACJA_IMPLEMENTACYJNA.md](SPECYFIKACJA_IMPLEMENTACYJNA.md)

## 1. Cel planu

Plan ma zapewnić:

- prawidłową kolejność prac,
- minimalizację ryzyka błędów architektonicznych,
- szybkie uzyskanie działającego rdzenia aplikacji,
- późniejsze dopracowanie UI i testów.

## 2. Kolejność prac

### Etap 1. Inicjalizacja projektu

Zakres:

- przejrzenie aktualnego repozytorium,
- ustalenie docelowej struktury katalogów,
- przygotowanie lub aktualizacja `package.json`,
- dodanie `.gitignore`,
- dodanie `.env.example`,
- dodanie podstawowego `README` lub aktualizacja istniejącego opisu uruchomienia.

Efekt:

- repo ma uporządkowaną bazę do dalszej pracy.

### Etap 2. Konfiguracja Supabase

Zakres:

- utworzenie projektu Supabase,
- zdefiniowanie tabel:
  - `profiles`,
  - `events`,
  - `registrations`,
- dodanie indeksów i ograniczeń,
- przygotowanie polityk RLS,
- przygotowanie ewentualnych triggerów lub funkcji pomocniczych,
- sprawdzenie przepływu Auth.

Efekt:

- baza i autoryzacja są gotowe do integracji z backendem.

### Etap 3. Warstwa infrastruktury backendu

Zakres:

- konfiguracja klienta Supabase,
- moduł pobierania konfiguracji z env,
- helpery do autoryzacji sesji i roli,
- wspólne narzędzia HTTP,
- wspólna walidacja wejścia.

Efekt:

- backend ma fundament do pracy z API i bezpieczeństwem.

### Etap 4. Repository layer

Zakres:

- repozytorium wydarzeń,
- repozytorium zapisów,
- repozytorium profili/użytkowników,
- operacje odczytu i zapisu do Supabase,
- przygotowanie zapytań pod listy, filtry i agregaty.

Efekt:

- logika dostępu do danych jest odseparowana od serwisów.

### Etap 5. Service layer

Zakres:

- serwis auth,
- serwis wydarzeń,
- serwis zapisów,
- serwis użytkowników,
- implementacja reguł biznesowych:
  - brak publicznej rejestracji,
  - role user/admin,
  - duplikat zapisów,
  - limit miejsc per wydarzenie,
  - blokada wydarzeń archiwalnych.

Efekt:

- cała logika domenowa działa niezależnie od HTTP.

### Etap 6. API backendu

Zakres:

- endpointy auth,
- endpointy użytkownika,
- endpointy administratora,
- obsługa statusów HTTP,
- spójne błędy JSON,
- autoryzacja per endpoint.

Efekt:

- backend ma kompletny kontrakt API.

### Etap 7. Frontend użytkownika

Zakres:

- ekran logowania,
- ekran główny z listą bieżących wydarzeń,
- akcja zapisu,
- sekcja własnych zapisów,
- komunikaty sukcesu i błędu,
- stany loading/empty/error.

Efekt:

- użytkownik może korzystać z aplikacji zgodnie ze specyfikacją.

### Etap 8. Frontend administratora

Zakres:

- strona `../admin`,
- logowanie admina,
- dashboard wszystkich wydarzeń,
- formularz tworzenia wydarzenia,
- edycja wydarzenia,
- archiwizacja i przywracanie,
- lista zapisów,
- lista użytkowników,
- ręczne dodawanie użytkowników,
- reset zapisów.

Efekt:

- panel administracyjny obsługuje wymagane operacje.

### Etap 9. Testy

Zakres:

- testy serwisów,
- testy API,
- testy blokady duplikatów,
- testy limitu miejsc,
- testy archiwizacji,
- testy autoryzacji ról,
- testy resetu zapisów.

Efekt:

- kluczowe reguły biznesowe są zabezpieczone.

### Etap 10. Dopracowanie UX i stabilizacja

Zakres:

- porządkowanie komunikatów,
- poprawa czytelności UI,
- sprawdzenie responsywności,
- poprawa stanów pustych i błędów,
- refaktor drobnych niespójności,
- końcowa weryfikacja spójności API i frontendów.

Efekt:

- aplikacja jest gotowa do użycia i utrzymania.

## 3. Zależności między etapami

- Etap 1 jest wymagany przed wszystkimi pozostałymi.
- Etap 2 musi zostać wykonany przed integracją backendu z Supabase.
- Etapy 3, 4 i 5 są zależne od modelu danych.
- Etap 6 wymaga zakończonych serwisów.
- Etap 7 i 8 powinny korzystać z ustalonego API.
- Etap 9 ma sens po stabilizacji głównych ścieżek.
- Etap 10 zamyka pracę po przejściu testów.

## 4. Priorytety wykonawcze

### Priorytet wysoki

- model danych,
- auth,
- role,
- zapis na wydarzenie,
- blokady biznesowe,
- bezpieczeństwo endpointów.

### Priorytet średni

- panel admina,
- formularze i listy,
- widoki wydarzeń,
- komunikaty użytkownika.

### Priorytet niski

- dopieszczanie stylów,
- kosmetyka layoutu,
- drobne optymalizacje UX.

## 5. Zalecany podział na iteracje

### Iteracja 1

- repozytorium,
- konfiguracja,
- Supabase schema,
- podstawowy backend skeleton.

### Iteracja 2

- auth,
- role,
- event service,
- registration service,
- podstawowe API.

### Iteracja 3

- frontend user,
- frontend admin,
- integracja z API.

### Iteracja 4

- testy,
- edge cases,
- poprawki UX,
- stabilizacja.

## 6. Definition of Done

Etap lub całość projektu uznajemy za zakończone, jeśli:

- działa logowanie przez Supabase,
- działa podział na user/admin,
- użytkownik widzi tylko bieżące wydarzenia,
- użytkownik zapisuje się tylko raz na wydarzenie,
- limit miejsc działa per wydarzenie,
- archiwalne wydarzenia są ukryte dla usera,
- admin zarządza wydarzeniami i użytkownikami,
- API zwraca przewidywalne odpowiedzi,
- istnieją testy kluczowych reguł,
- pliki `.env`, `.env.example`, `.gitignore` są obecne,
- kod jest spójny z dokumentacją.

## 7. Instrukcja dla CODEX

Podczas implementacji:

- realizuj etapy w tej kolejności,
- po każdym etapie weryfikuj zgodność z wymaganiami,
- nie przechodź do UI przed ustaleniem modelu danych i API,
- nie pomijaj testów krytycznych reguł,
- nie rozszerzaj zakresu bez potrzeby,
- jeżeli pojawi się niejednoznaczność, wybierz wariant najprostszy do utrzymania i opisz go w raporcie.
