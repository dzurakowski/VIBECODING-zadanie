import test from 'node:test';
import assert from 'node:assert/strict';
import { showInvalidSetPasswordView, showValidSetPasswordView } from '../public/shared/setPasswordView.js';

const createClassList = () => {
  const classes = new Set();
  return {
    classes,
    add: (name) => classes.add(name),
    remove: (name) => classes.delete(name)
  };
};

test('pokazuje formularz ustawiania hasła przy poprawnym linku', () => {
  const form = { classList: createClassList() };
  const notice = { textContent: 'stary komunikat', className: 'notice error' };

  showValidSetPasswordView({ form, notice });

  assert.equal(form.classList.classes.has('hidden'), false);
  assert.equal(notice.textContent, '');
  assert.equal(notice.className, 'notice hidden');
});

test('regresja: ukrywa formularz ustawiania hasła przy błędnym linku', () => {
  const form = { classList: createClassList() };
  const notice = { textContent: '', className: 'notice hidden' };

  showInvalidSetPasswordView({
    form,
    notice,
    message: 'Link jest nieprawidłowy lub wygasł. Poproś o nowy link.'
  });

  assert.equal(form.classList.classes.has('hidden'), true);
  assert.equal(notice.textContent, 'Link jest nieprawidłowy lub wygasł. Poproś o nowy link.');
  assert.equal(notice.className, 'notice error');
});

