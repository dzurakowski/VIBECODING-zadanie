import test from 'node:test';
import assert from 'node:assert/strict';
import { HttpError } from '../src/utils/http.js';
import { assertCapacity, assertEmail, assertStatus, assertUuid } from '../src/utils/validation.js';

test('waliduje dane wejściowe wydarzenia', () => {
  assert.equal(assertCapacity(12), 12);
  assert.equal(assertEmail(' USER@example.com '), 'user@example.com');
  assert.equal(assertStatus('current'), 'current');
  assert.throws(() => assertCapacity(0), HttpError);
  assert.throws(() => assertUuid('not-a-uuid'), HttpError);
});
