import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultPrivateTab, isPrivateTab, normalizePrivateTab } from '../public/shared/privateTabs.js';

test('ustawia zakładkę bieżących wydarzeń jako domyślną', () => {
  assert.equal(defaultPrivateTab, 'events');
  assert.equal(normalizePrivateTab(undefined), 'events');
  assert.equal(normalizePrivateTab('unknown'), 'events');
});

test('rozpoznaje dostępne zakładki użytkownika', () => {
  assert.equal(isPrivateTab('events'), true);
  assert.equal(isPrivateTab('password'), true);
  assert.equal(isPrivateTab('admin'), false);
});
