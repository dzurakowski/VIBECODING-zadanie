import test from 'node:test';
import assert from 'node:assert/strict';
import { createSessionBarMarkup } from '../public/shared/sessionBar.js';

test('renderuje pasek sesji z wylogowaniem', () => {
  const markup = createSessionBarMarkup('Anna Kowalska');
  assert.match(markup, /<div class="session-bar">/);
  assert.match(markup, /Anna Kowalska/);
  assert.match(markup, /Wyloguj/);
  assert.doesNotMatch(markup, /Widok użytkownika/);
});

test('renderuje pasek sesji admina z linkiem do widoku użytkownika i escapuje dane', () => {
  const markup = createSessionBarMarkup('Ala <Admin>', { showSwitchLink: true, switchHref: '/?x=1&y=2', switchLabel: 'Widok użytkownika' });
  assert.match(markup, /Ala &lt;Admin&gt;/);
  assert.match(markup, /Widok użytkownika/);
  assert.match(markup, /href="\/\?x=1&amp;y=2"/);
  assert.ok(markup.indexOf('Widok użytkownika') < markup.indexOf('Ala &lt;Admin&gt;'));
  assert.ok(markup.indexOf('Ala &lt;Admin&gt;') < markup.indexOf('Wyloguj'));
});
