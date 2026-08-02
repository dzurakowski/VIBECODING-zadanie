# Scenariusze testów manualnych

Testy należy wykonywać na danych demonstracyjnych, nie na kontach ani wydarzeniach rzeczywistych.

## Przygotowanie

Przed testami przygotuj:

- konto `admin`,
- dwa konta `user`,
- jedno wydarzenie bieżące z pojemnością `1`,
- jedno wydarzenie bieżące z pojemnością `2`,
- jedno wydarzenie archiwalne.

Do testów e-maili potrzebne są działające wiadomości Supabase oraz poprawne adresy `http://localhost:3000` i `http://localhost:3000/set-password` w konfiguracji Auth.

## Użytkownik

| ID | Scenariusz | Kroki | Oczekiwany wynik |
|---|---|---|---|
| U-01 | Logowanie hasłem | Zaloguj się poprawnym e-mailem i hasłem usera. | Widoczna lista bieżących wydarzeń, „Moje zapisy” i formularz zmiany hasła. |
| U-02 | Błędne hasło | Podaj poprawny e-mail i błędne hasło. | Komunikat o błędnych danych; brak dostępu do wydarzeń i zapisów. |
| U-03 | Magic link | Podaj e-mail usera, wybierz magic link, otwórz wiadomość. | Powrót do aplikacji jako zalogowany user. |
| U-04 | Zapis na wydarzenie | Zaloguj się i wybierz wolne wydarzenie. | Komunikat sukcesu, wydarzenie pojawia się w „Moje zapisy”, przycisk zapisu jest nieaktywny. |
| U-05 | Duplikat zapisu | Spróbuj ponownie zapisać się na to samo wydarzenie. | Brak drugiego zapisu; komunikat o duplikacie albo nieaktywny przycisk. |
| U-06 | Pełne wydarzenie | Zapisz usera 1 na wydarzenie o pojemności 1, następnie usera 2. | User 2 otrzymuje komunikat „Brak wolnych miejsc”; limit nie jest przekroczony. |
| U-07 | Archiwalne wydarzenie | Sprawdź widok usera po archiwizacji wydarzenia przez admina. | Wydarzenie nie jest widoczne; nie można się na nie zapisać. |
| U-08 | Zmiana hasła | Będąc zalogowanym podaj złe obecne hasło, potem poprawne i nowe hasło o długości ≥10 znaków. | Złe hasło jest odrzucone; poprawne zmienia hasło; logowanie nowym hasłem działa. |
| U-09 | Odzyskanie hasła | Wybierz „Nie pamiętam hasła”, otwórz link i ustaw nowe hasło. | Link prowadzi do `/set-password`; nowe hasło umożliwia logowanie. |
| U-10 | Wygasła sesja | Usuń `events_access_token` z Local Storage w DevTools i odśwież stronę albo poczekaj na wygaśnięcie JWT. | Widoczny tylko formularz logowania; brak listy wydarzeń, zapisów i danych poprzedniej sesji. |
| U-11 | Dostęp do admina | Jako user otwórz `/admin`. | Komunikat o braku roli administratora; panel admina i dane pozostają ukryte. |

## Administrator

| ID | Scenariusz | Kroki | Oczekiwany wynik |
|---|---|---|---|
| A-01 | Logowanie hasłem | Zaloguj się kontem admina pod `/admin`. | Otwiera się panel z zakładkami Wydarzenia, Użytkownicy i Moje konto. |
| A-02 | Magic link admina | Podaj e-mail admina i wybierz magic link. | Po kliknięciu linku następuje automatyczne przejście do `/admin`. |
| A-03 | Tworzenie wydarzenia | Utwórz wydarzenie z poprawną nazwą, terminem i pojemnością. | Wydarzenie pojawia się na liście jako `current` i jest dostępne dla usera. |
| A-04 | Walidacja wydarzenia | Spróbuj utworzyć wydarzenie bez nazwy, bez daty lub z pojemnością 0. | Formularz/API odrzuca dane z czytelnym błędem. |
| A-05 | Lista uczestników | Zapisz usera na wydarzenie, odśwież zakładkę Wydarzenia. | Pod kartą wydarzenia widoczna jest nazwa i e-mail uczestnika oraz licznik. |
| A-06 | Archiwizacja | Zarchiwizuj wydarzenie z zapisami. | Wydarzenie pozostaje widoczne dla admina z zapisami; znika z widoku usera; nowe zapisy są zablokowane. |
| A-07 | Przywrócenie | Przywróć wydarzenie archiwalne. | Status wraca do `current`; wydarzenie jest znów dostępne userom, o ile ma wolne miejsca. |
| A-08 | Reset zapisów | Wybierz reset zapisów dla wydarzenia i potwierdź. | Lista uczestników jest pusta, liczba zajętych miejsc wynosi 0. |
| A-09 | Usunięcie wydarzenia — blokada | Spróbuj usunąć wydarzenie bieżące lub archiwalne z zapisami. | Usunięcie jest niedostępne w UI albo API zwraca błąd. |
| A-10 | Usunięcie wydarzenia — sukces | Zarchiwizuj wydarzenie, wyczyść zapisy, potem usuń je trwale. | Wydarzenie znika z panelu i bazy. |
| A-11 | Zaproszenie użytkownika | W zakładce Użytkownicy zaproś nowy adres e-mail. | Supabase wysyła zaproszenie; użytkownik sam ustawia pierwsze hasło. |
| A-12 | Dezaktywacja | Dezaktywuj konto usera, następnie spróbuj się nim zalogować. | Logowanie/dostęp API zostają zablokowane; historia zapisów pozostaje. |
| A-13 | Przywrócenie konta | Przywróć zdezaktywowane konto i zaloguj się nim. | Konto odzyskuje dostęp. |
| A-14 | Usunięcie użytkownika | Usuń testowe konto usera i potwierdź. | Konto, profil oraz powiązane zapisy zostają trwale usunięte. |
| A-15 | Ochrona administratora | Spróbuj usunąć lub zdezaktywować własne konto. | Operacja zostaje odrzucona. |
| A-16 | Ostatni admin | Jeśli istnieje tylko jeden aktywny admin, spróbuj go usunąć/dezaktywować. | Operacja zostaje odrzucona. |
| A-17 | Wygasła sesja | Usuń token z Local Storage i odśwież `/admin`. | Panel i tabele znikają; widoczny jest wyłącznie formularz logowania. |

## Testy bezpieczeństwa i integralności

- Otwórz endpoint admina jako user, np. `GET /api/admin/events` z tokenem usera. Oczekiwany rezultat: `403`.
- Otwórz endpoint zapisu bez tokenu. Oczekiwany rezultat: `401`.
- Wyślij dwa równoczesne żądania zapisu na ostatnie wolne miejsce. Oczekiwany rezultat: dokładnie jedno `201`, drugie `409`; limit nie jest przekroczony.
- Spróbuj zapisać usera na wydarzenie archiwalne przez bezpośrednie wywołanie API. Oczekiwany rezultat: konflikt biznesowy.
- W formularzu odzyskania hasła wpisz istniejący i nieistniejący e-mail. Oczekiwany rezultat: ten sam neutralny komunikat interfejsu.

## Zidentyfikowane braki do uzupełnienia

W obecnym UI nie ma jeszcze formularza edycji wydarzenia ani edycji danych lub roli użytkownika, mimo że specyfikacja i częściowo API przewidują `PATCH`. Tych funkcji nie da się obecnie rzetelnie przetestować manualnie w panelu — należy je dopisać albo oznaczyć jako niewdrożone w prezentacji projektu.
