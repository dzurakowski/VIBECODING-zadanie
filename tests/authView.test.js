import test from 'node:test';
import assert from 'node:assert/strict';
import { showLoggedInDashboardView, showLoggedInPrivateView, showLoggedOutAuthView, showRegistrationAuthView } from '../public/shared/authView.js';

const createClassList = () => {
  const classes = new Set();
  return {
    classes,
    add: (name) => classes.add(name),
    remove: (name) => classes.delete(name)
  };
};

test('ukrywa cały auth shell i czyści notice po zalogowaniu', () => {
  const authSplit = { classList: createClassList() };
  const loginSection = { classList: createClassList() };
  const registrationSection = { classList: createClassList() };
  const privateArea = { classList: createClassList() };
  let cleared = false;
  let renderedTab = null;

  showLoggedInPrivateView({
    authSplit,
    clearNotice: () => { cleared = true; },
    loginSection,
    registrationSection,
    privateArea,
    renderTabs: (tab) => { renderedTab = tab; },
    defaultTab: 'events'
  });

  assert.equal(authSplit.classList.classes.has('hidden'), true);
  assert.equal(loginSection.classList.classes.has('hidden'), true);
  assert.equal(registrationSection.classList.classes.has('hidden'), true);
  assert.equal(privateArea.classList.classes.has('hidden'), false);
  assert.equal(cleared, true);
  assert.equal(renderedTab, 'events');
});

test('przywraca widok logowania i rejestracji bez ukrytego auth shell', () => {
  const authSplit = { classList: createClassList() };
  const loginSection = { classList: createClassList() };
  const registrationSection = { classList: createClassList() };

  showLoggedOutAuthView({ authSplit, loginSection, registrationSection });
  assert.equal(authSplit.classList.classes.has('hidden'), false);
  assert.equal(loginSection.classList.classes.has('hidden'), false);
  assert.equal(registrationSection.classList.classes.has('hidden'), true);

  showRegistrationAuthView({ authSplit, loginSection, registrationSection });
  assert.equal(authSplit.classList.classes.has('hidden'), false);
  assert.equal(loginSection.classList.classes.has('hidden'), true);
  assert.equal(registrationSection.classList.classes.has('hidden'), false);
});

test('ukrywa auth shell po zalogowaniu administratora', () => {
  const authSplit = { classList: createClassList() };
  const loginSection = { classList: createClassList() };
  const dashboard = { classList: createClassList() };
  let cleared = false;

  showLoggedInDashboardView({
    authSplit,
    clearNotice: () => { cleared = true; },
    loginSection,
    dashboard
  });

  assert.equal(authSplit.classList.classes.has('hidden'), true);
  assert.equal(loginSection.classList.classes.has('hidden'), true);
  assert.equal(dashboard.classList.classes.has('hidden'), false);
  assert.equal(cleared, true);
});

test('regresja: panel administratora nie zostawia auth shell ani komunikatu po loginie', () => {
  const authSplit = { classList: createClassList() };
  const loginSection = { classList: createClassList() };
  const dashboard = { classList: createClassList() };
  let notice = 'Zalogowano.';

  showLoggedInDashboardView({
    authSplit,
    clearNotice: () => { notice = ''; },
    loginSection,
    dashboard
  });

  assert.equal(authSplit.classList.classes.has('hidden'), true);
  assert.equal(loginSection.classList.classes.has('hidden'), true);
  assert.equal(dashboard.classList.classes.has('hidden'), false);
  assert.equal(notice, '');
});
