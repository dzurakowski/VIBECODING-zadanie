# Nowy interfejs — pliki do repozytorium

Wersja „Interfejs 1b v2”. Zmiany dotyczą wyłącznie wyglądu. Backend, API, walidacje i logika pozostają nietknięte.

## 1. Pliki do podmiany (gotowe)

Skopiuj `public/` z tej paczki do `public/` w repozytorium:

- `public/styles.css`
- `public/index.html`
- `public/admin.html`
- `public/set-password.html`

Zachowane są wszystkie identyfikatory, nazwy pól, `data-tab` i klasy, których szukają skrypty: `#notice`, `#session`, `#login`, `#registration-section`, `#private-area`, `#dashboard`, `#login-form`, `#registration-form`, `#event-form`, `#user-form`, `#password-form`, `#set-password-form`, `#magic`, `#reset`, `#show-registration`, `#back-to-login`, `#registration-toggle`, `#events`, `#mine`, `#users`, `#events-filters`, `#mine-filters`, `#users-filters`, `*-filters-reset`, panele `#events-tab` / `#users-tab` / `#account-tab` / `#password-tab` oraz klasy `tab-panel`, `active`, `table-sort`, `sort-indicator`, `actions`, `notice`, `card`, `session-bar`, `session-name`, `logout`, `participants`, `event-participants`, `secondary`, `danger`, `hidden`.

Zmiany strukturalne, wszystkie czysto prezentacyjne:

- nawigacja zakładek przeniesiona do lewego sidebara; sidebar ukrywa się na ekranie logowania regułą CSS `:has()`
- ekran logowania i rejestracji w układzie dwukolumnowym (`.auth-split`)
- każda zakładka ma biały pasek nagłówka (`.page-head`) z tytułem i podtytułem
- filtry oraz formularze „Nowe wydarzenie” i „Zaproś użytkownika” zwinięte w `<details>`; pola nadal należą do tych samych formularzy, więc `FormData` czyta je bez zmian

## 2. Trzy krótkie zmiany w JS (tylko markup wiersza tabeli)

Bez nich tabele będą poprawne, ale statusy pozostaną zwykłym tekstem zamiast pigułek, a daty nie dostaną czcionki tabelarycznej. Zmieniane są wyłącznie ciągi HTML w funkcjach renderujących — żadnych zmian w danych, zapytaniach ani obsłudze zdarzeń.

### `public/app.js` — `renderCurrentEvents`, wiersz tabeli

Zamień:

```js
      <td>${escapeHtml(event.name)}</td>
      <td>${escapeHtml(event.description ?? '—')}</td>
      <td>${escapeHtml(formatShort(event.eventDatetime))}</td>
      <td>${escapeHtml(event.capacity)}</td>
      <td>${escapeHtml(event.remainingSeats)}</td>
      <td>${escapeHtml(event.status === 'current' ? 'Bieżące' : 'Archiwalne')}</td>
      <td>${escapeHtml(event.isRegistered ? 'Zapisano' : 'Do zapisania')}</td>
```

na:

```js
      <td><span class="cell-name">${escapeHtml(event.name)}</span></td>
      <td><span class="cell-desc">${escapeHtml(event.description ?? '—')}</span></td>
      <td class="cell-time">${escapeHtml(formatShort(event.eventDatetime))}</td>
      <td class="num">${escapeHtml(event.capacity)}</td>
      <td class="num${event.remainingSeats ? '' : ' num-empty'}">${escapeHtml(event.remainingSeats)}</td>
      <td><span class="pill ${event.status === 'current' ? 'pill-on' : 'pill-off'}">${escapeHtml(event.status === 'current' ? 'Bieżące' : 'Archiwalne')}</span></td>
      <td><span class="pill ${event.isRegistered ? 'pill-on' : 'pill-off'}">${escapeHtml(event.isRegistered ? 'Zapisano' : 'Do zapisania')}</span></td>
```

### `public/app.js` — `renderRegistrations`, wiersz tabeli

Zamień:

```js
      <td>${escapeHtml(registration.eventName)}</td>
      <td>${escapeHtml(formatShort(registration.eventDatetime))}</td>
      <td>${escapeHtml(registration.status === 'current' ? 'Bieżące' : 'Archiwalne')}</td>
      <td>${escapeHtml(registration.canCancel ? 'Możliwa' : 'Niedostępna')}</td>
```

na:

```js
      <td><span class="cell-name">${escapeHtml(registration.eventName)}</span></td>
      <td class="cell-time">${escapeHtml(formatShort(registration.eventDatetime))}</td>
      <td><span class="pill ${registration.status === 'current' ? 'pill-on' : 'pill-off'}">${escapeHtml(registration.status === 'current' ? 'Bieżące' : 'Archiwalne')}</span></td>
      <td><span class="pill ${registration.canCancel ? 'pill-on' : 'pill-off'}">${escapeHtml(registration.canCancel ? 'Możliwa' : 'Niedostępna')}</span></td>
```

### `public/admin.js` — `renderEvents`, wiersz tabeli

Zamień:

```js
      <td>${escapeHtml(event.name)}</td>
      <td>${escapeHtml(event.description ?? '—')}</td>
      <td>${escapeHtml(event.eventDatetimeDisplay)}</td>
      <td>${escapeHtml(event.capacity)}</td>
      <td>${escapeHtml(event.registeredCount)}</td>
      <td>${escapeHtml(event.remainingSeats)}</td>
      <td>${escapeHtml(getEventStatusLabel(event.status))}</td>
```

na:

```js
      <td><span class="cell-name">${escapeHtml(event.name)}</span></td>
      <td><span class="cell-desc">${escapeHtml(event.description ?? '—')}</span></td>
      <td class="cell-time">${escapeHtml(event.eventDatetimeDisplay)}</td>
      <td class="num">${escapeHtml(event.capacity)}</td>
      <td class="num">${escapeHtml(event.registeredCount)}</td>
      <td class="num${event.remainingSeats ? '' : ' num-empty'}">${escapeHtml(event.remainingSeats)}</td>
      <td><span class="pill ${event.status === 'current' ? 'pill-on' : 'pill-off'}">${escapeHtml(getEventStatusLabel(event.status))}</span></td>
```

### `public/admin.js` — `renderUsers`, wiersz tabeli

Zamień:

```js
    ${users.map((userRow) => `<tr><td>${userRow.full_name}</td><td>${userRow.email}</td><td>${userRow.role}</td><td>${getUserStatusLabel(userRow.is_active)}</td>
```

na:

```js
    ${users.map((userRow) => `<tr><td><span class="cell-name">${userRow.full_name}</span></td><td>${userRow.email}</td><td>${userRow.role === 'admin' ? 'Administrator' : 'Użytkownik'}</td><td><span class="pill ${userRow.is_active ? 'pill-on' : 'pill-off'}">${getUserStatusLabel(userRow.is_active)}</span></td>
```

(reszta tego wiersza — kolumna akcji — pozostaje bez zmian)

## 3. Świadome różnice względem makiety

- W makiecie kolumny „Pojemność / Zajęte / Wolne” były scalone w jedną („Obłożenie”), a w widoku użytkownika ukryta była kolumna statusu. W plikach docelowych wszystkie kolumny zostają, bo każda ma własny przycisk sortowania — scalenie odebrałoby sortowanie po tych polach.
- Makieta pokazywała pole „Szukaj” w pasku nagłówka. Nie ma go w plikach docelowych, bo wymagałoby nowej logiki filtrowania; do filtrowania służy panel „Filtry i sortowanie”.
- Formularze otwierają się jako panele rozwijane, a nie okna modalne — modal wymagałby nowego kodu JS.
- W sidebarze widnieje samo imię i nazwisko (bez e-maila), bo taki markup zwraca `public/shared/sessionBar.js` objęty testami.

## 4. Weryfikacja

```bash
npm test
npm run dev
```

Do sprawdzenia: logowanie, rejestracja (gdy włączona), zapis i rezygnacja, filtry i sortowanie w obu widokach, akcje na wydarzeniach i użytkownikach, zmiana hasła, `/set-password`.
