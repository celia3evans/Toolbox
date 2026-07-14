'use strict';

/**
 * i18n.js — Language Toggle Module
 *
 * Reads TRANSLATIONS from translations.js (must be loaded first).
 * HTML elements declare data-i18n="key" and their textContent is set
 * to the matching translation on every setLang() call.
 *
 * localStorage key: cfes-lang
 */

/**
 * Returns the current active language: 'en' | 'fr'.
 * @returns {'en'|'fr'}
 */
function getLang() {
  const stored = localStorage.getItem('cfes-lang');
  return stored === 'fr' ? 'fr' : 'en';
}

/**
 * Sets the active language, persists it, updates <html lang>, and
 * re-renders all [data-i18n] elements using TRANSLATIONS.
 * @param {'en'|'fr'} lang
 */
function setLang(lang) {
  const validLang = lang === 'fr' ? 'fr' : 'en';

  localStorage.setItem('cfes-lang', validLang);
  document.documentElement.lang = validLang;

  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    const key   = el.getAttribute('data-i18n');
    const entry = TRANSLATIONS[key];
    if (!entry) return;
    const text = entry[validLang] || entry['en'];
    if (text !== undefined) {
      // For input placeholders use the placeholder attribute, otherwise textContent.
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = text;
      } else {
        el.textContent = text;
      }
    }
  });
}

/**
 * Reads cfes-lang from localStorage and calls setLang().
 * Defaults to 'en' when absent.
 */
function initLang() {
  const stored = localStorage.getItem('cfes-lang');
  setLang(stored === 'fr' ? 'fr' : 'en');
}

/**
 * Returns the active-language string for a given translation key.
 * Falls back to English, then the raw key if not found.
 * @param {string} key
 * @returns {string}
 */
function getString(key) {
  const lang  = getLang();
  const entry = TRANSLATIONS[key];
  if (!entry) return key;
  return entry[lang] || entry['en'] || key;
}

if (typeof window !== 'undefined') {
  window.getLang   = getLang;
  window.setLang   = setLang;
  window.initLang  = initLang;
  window.getString = getString;
}

if (typeof module !== 'undefined') {
  module.exports = { getLang, setLang, initLang, getString };
}
