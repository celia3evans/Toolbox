'use strict';

/**
 * Unit tests for public/js/i18n.js
 * Requirements: 1.2, 1.3, 1.4
 */

// jsdom provides localStorage and document — loaded via testEnvironment: jsdom in package.json.

// i18n.js uses `window.*` and `document` — load it in the jsdom environment.
// We require it fresh each test via jest.resetModules() in beforeEach.

let getLang, setLang, initLang, getString;

beforeEach(() => {
  jest.resetModules();
  localStorage.clear();
  document.documentElement.lang = '';
  // translations.js must be loaded before i18n.js (mirrors browser load order)
  require('../translations');
  ({ getLang, setLang, initLang, getString } = require('../i18n'));
});

// ---------------------------------------------------------------------------
// getLang
// ---------------------------------------------------------------------------

describe('getLang', () => {
  test('returns "en" when localStorage is empty', () => {
    expect(getLang()).toBe('en');
  });

  test('returns "fr" when cfes-lang is "fr"', () => {
    localStorage.setItem('cfes-lang', 'fr');
    expect(getLang()).toBe('fr');
  });

  test('returns "en" when cfes-lang is an invalid value', () => {
    localStorage.setItem('cfes-lang', 'de');
    expect(getLang()).toBe('en');
  });
});

// ---------------------------------------------------------------------------
// setLang
// ---------------------------------------------------------------------------

describe('setLang', () => {
  test('setLang("fr") → getLang() returns "fr"', () => {
    setLang('fr');
    expect(getLang()).toBe('fr');
  });

  test('setLang("en") → getLang() returns "en"', () => {
    setLang('fr'); // set to fr first
    setLang('en');
    expect(getLang()).toBe('en');
  });

  test('setLang persists to localStorage', () => {
    setLang('fr');
    expect(localStorage.getItem('cfes-lang')).toBe('fr');
  });

  test('setLang updates document.documentElement.lang', () => {
    setLang('fr');
    expect(document.documentElement.lang).toBe('fr');

    setLang('en');
    expect(document.documentElement.lang).toBe('en');
  });

  test('setLang re-renders [data-i18n] elements', () => {
    document.body.innerHTML = `
      <p data-i18n="nav.home">Home</p>
    `;
    setLang('fr');
    expect(document.querySelector('p').textContent).toBe('Accueil');

    setLang('en');
    expect(document.querySelector('p').textContent).toBe('Home');
  });

  test('setLang with invalid value falls back to "en"', () => {
    setLang('zh');
    expect(getLang()).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });
});

// ---------------------------------------------------------------------------
// initLang
// ---------------------------------------------------------------------------

describe('initLang', () => {
  test('initLang() defaults to "en" when localStorage is empty', () => {
    initLang();
    expect(getLang()).toBe('en');
  });

  test('initLang() restores "fr" when cfes-lang=fr is stored', () => {
    localStorage.setItem('cfes-lang', 'fr');
    initLang();
    expect(getLang()).toBe('fr');
  });

  test('initLang() restores "en" when cfes-lang=en is stored', () => {
    localStorage.setItem('cfes-lang', 'en');
    initLang();
    expect(getLang()).toBe('en');
  });

  test('after setLang("fr"), calling initLang() restores "fr"', () => {
    setLang('fr');
    // Simulate fresh page load: re-require module
    jest.resetModules();
    ({ getLang, setLang, initLang } = require('../i18n'));
    initLang();
    expect(getLang()).toBe('fr');
  });
});

// ---------------------------------------------------------------------------
// getString
// ---------------------------------------------------------------------------

describe('getString', () => {
  test('returns English string for known key in EN', () => {
    setLang('en');
    expect(getString('error.load')).toBe('Failed to load resources.');
  });

  test('returns French string for known key in FR', () => {
    setLang('fr');
    expect(getString('error.load')).toBe('Impossible de charger les ressources.');
  });

  test('returns the key itself for unknown keys', () => {
    expect(getString('unknown.key')).toBe('unknown.key');
  });
});