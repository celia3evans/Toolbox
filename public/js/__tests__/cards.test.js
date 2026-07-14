'use strict';

/**
 * Unit tests for public/js/cards.js
 * Requirements: 4.2, 8.2, 8.3, 8.4
 */

let getSavedIds, persistSavedIds, saveResource, unsaveResource,
    deriveCategories, applyFilters, savedFilter, renderCard;

const makeResource = (overrides = {}) => ({
  id: 1,
  'title-en': 'Test Resource',
  'titre-fr': 'Ressource de test',
  'link-en': 'https://example.com',
  'lien-fr': 'https://example.fr',
  'description-en': 'A short description.',
  'description-fr': 'Une courte description.',
  categories: 'Finance,Career',
  free: true,
  ...overrides,
});

beforeEach(() => {
  jest.resetModules();
  localStorage.clear();
  ({
    getSavedIds, persistSavedIds, saveResource, unsaveResource,
    deriveCategories, applyFilters, savedFilter, renderCard,
  } = require('../cards'));
});

// ---------------------------------------------------------------------------
// Save / Unsave Logic
// ---------------------------------------------------------------------------

describe('saveResource / unsaveResource / getSavedIds', () => {
  test('saveResource(id) → getSavedIds().has(id) is true', () => {
    saveResource(42);
    expect(getSavedIds().has(42)).toBe(true);
  });

  test('unsaveResource(id) after save → getSavedIds().has(id) is false', () => {
    saveResource(42);
    unsaveResource(42);
    expect(getSavedIds().has(42)).toBe(false);
  });

  test('getSavedIds returns empty Set when localStorage is empty', () => {
    expect(getSavedIds().size).toBe(0);
  });

  test('getSavedIds returns empty Set when localStorage contains invalid JSON', () => {
    localStorage.setItem('cfes-saved', 'not-valid-json{{{');
    expect(getSavedIds().size).toBe(0);
  });

  test('multiple saves accumulate in Set', () => {
    saveResource(1);
    saveResource(2);
    saveResource(3);
    const ids = getSavedIds();
    expect(ids.has(1)).toBe(true);
    expect(ids.has(2)).toBe(true);
    expect(ids.has(3)).toBe(true);
  });

  test('unsaveResource only removes the specified id', () => {
    saveResource(1);
    saveResource(2);
    unsaveResource(1);
    const ids = getSavedIds();
    expect(ids.has(1)).toBe(false);
    expect(ids.has(2)).toBe(true);
  });
});

describe('persistSavedIds', () => {
  test('persists a Set to localStorage and getSavedIds reads it back', () => {
    persistSavedIds(new Set([10, 20, 30]));
    const ids = getSavedIds();
    expect(ids.has(10)).toBe(true);
    expect(ids.has(20)).toBe(true);
    expect(ids.has(30)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// renderCard — language selection
// ---------------------------------------------------------------------------

describe('renderCard — language selection', () => {
  test('renders English title and description when lang is "en"', () => {
    const card = renderCard(makeResource(), 'en');
    expect(card.querySelector('.card-title a').textContent).toBe('Test Resource');
    expect(card.querySelector('.card-desc').textContent).toBe('A short description.');
  });

  test('renders French title and description when lang is "fr"', () => {
    const card = renderCard(makeResource(), 'fr');
    expect(card.querySelector('.card-title a').textContent).toBe('Ressource de test');
    expect(card.querySelector('.card-desc').textContent).toBe('Une courte description.');
  });

  test('renders English link when lang is "en"', () => {
    const card = renderCard(makeResource(), 'en');
    expect(card.querySelector('.card-title a').href).toBe('https://example.com/');
  });
});

// ---------------------------------------------------------------------------
// renderCard — description truncation
// ---------------------------------------------------------------------------

describe('renderCard — description truncation', () => {
  test('description of exactly 150 chars is not truncated', () => {
    const desc = 'a'.repeat(150);
    const card = renderCard(makeResource({ 'description-en': desc }), 'en');
    const text = card.querySelector('.card-desc').textContent;
    expect(text).toBe(desc);
    expect(text.endsWith('\u2026')).toBe(false);
  });

  test('description of 151 chars is truncated to 150 + ellipsis', () => {
    const desc = 'a'.repeat(151);
    const card = renderCard(makeResource({ 'description-en': desc }), 'en');
    const text = card.querySelector('.card-desc').textContent;
    expect(text.length).toBe(151); // 150 chars + '…'
    expect(text).toBe('a'.repeat(150) + '\u2026');
  });

  test('description of 200 chars is truncated to 150 + ellipsis', () => {
    const desc = 'b'.repeat(200);
    const card = renderCard(makeResource({ 'description-en': desc }), 'en');
    const text = card.querySelector('.card-desc').textContent;
    expect(text.length).toBe(151);
    expect(text.endsWith('\u2026')).toBe(true);
  });

  test('empty description renders empty card-desc', () => {
    const card = renderCard(makeResource({ 'description-en': '' }), 'en');
    expect(card.querySelector('.card-desc').textContent).toBe('');
  });
});

// ---------------------------------------------------------------------------
// renderCard — free/paid badge
// ---------------------------------------------------------------------------

describe('renderCard — free/paid badge', () => {
  test('free resource shows badge-free with text "Free"', () => {
    const card = renderCard(makeResource({ free: true }), 'en');
    const badge = card.querySelector('.badge-free');
    expect(badge).not.toBeNull();
    expect(badge.textContent).toBe('Free');
    expect(card.querySelector('.badge-paid')).toBeNull();
  });

  test('paid resource shows badge-paid with text "Paid"', () => {
    const card = renderCard(makeResource({ free: false }), 'en');
    const badge = card.querySelector('.badge-paid');
    expect(badge).not.toBeNull();
    expect(badge.textContent).toBe('Paid');
    expect(card.querySelector('.badge-free')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// renderCard — data-saved attribute
// ---------------------------------------------------------------------------

describe('renderCard — data-saved attribute', () => {
  test('data-saved is "false" when resource id is not in saved set', () => {
    localStorage.clear();
    const card = renderCard(makeResource({ id: 99 }), 'en');
    expect(card.querySelector('.btn-save').dataset.saved).toBe('false');
  });

  test('data-saved is "true" when resource id is in saved set', () => {
    saveResource(99);
    const card = renderCard(makeResource({ id: 99 }), 'en');
    expect(card.querySelector('.btn-save').dataset.saved).toBe('true');
  });
});

// ---------------------------------------------------------------------------
// renderCard — category badges
// ---------------------------------------------------------------------------

describe('renderCard — category badges', () => {
  test('renders one badge per category', () => {
    const card = renderCard(makeResource({ categories: 'Finance,Career,Tech' }), 'en');
    const badges = card.querySelectorAll('.badge-category');
    expect(badges.length).toBe(3);
    expect(badges[0].textContent).toBe('Finance');
    expect(badges[1].textContent).toBe('Career');
    expect(badges[2].textContent).toBe('Tech');
  });

  test('renders no category badges when categories is empty string', () => {
    const card = renderCard(makeResource({ categories: '' }), 'en');
    expect(card.querySelectorAll('.badge-category').length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// deriveCategories
// ---------------------------------------------------------------------------

describe('deriveCategories', () => {
  test('extracts distinct sorted categories from resources', () => {
    const resources = [
      makeResource({ categories: 'Finance,Career' }),
      makeResource({ categories: 'Career,Tech' }),
      makeResource({ categories: 'Finance' }),
    ];
    expect(deriveCategories(resources)).toEqual(['Career', 'Finance', 'Tech']);
  });

  test('trims whitespace from category labels', () => {
    const resources = [makeResource({ categories: ' Finance , Career ' })];
    expect(deriveCategories(resources)).toEqual(['Career', 'Finance']);
  });

  test('ignores empty-string labels', () => {
    const resources = [makeResource({ categories: ',,' })];
    expect(deriveCategories(resources)).toEqual([]);
  });

  test('returns empty array for empty resource list', () => {
    expect(deriveCategories([])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// applyFilters
// ---------------------------------------------------------------------------

describe('applyFilters', () => {
  const resources = [
    makeResource({ id: 1, 'title-en': 'Alpha',   categories: 'Finance', free: true  }),
    makeResource({ id: 2, 'title-en': 'Beta',    categories: 'Career',  free: false }),
    makeResource({ id: 3, 'title-en': 'Gamma',   categories: 'Finance', free: false }),
    makeResource({ id: 4, 'description-en': 'alpha in description', categories: 'Tech', free: true }),
  ];

  test('empty query matches all resources', () => {
    const result = applyFilters(resources, { query: '', categories: new Set(), freeOnly: false }, 'en');
    expect(result.length).toBe(4);
  });

  test('query filters by title (case-insensitive)', () => {
    const result = applyFilters(resources, { query: 'alpha', categories: new Set(), freeOnly: false }, 'en');
    // Should match resource 1 (title "Alpha") and resource 4 (desc contains "alpha")
    expect(result.map(r => r.id).sort()).toEqual([1, 4]);
  });

  test('query filters by description (case-insensitive)', () => {
    const result = applyFilters(resources, { query: 'alpha in desc', categories: new Set(), freeOnly: false }, 'en');
    expect(result.map(r => r.id)).toEqual([4]);
  });

  test('category filter: selected categories filter correctly', () => {
    const result = applyFilters(resources, { query: '', categories: new Set(['Finance']), freeOnly: false }, 'en');
    expect(result.map(r => r.id).sort()).toEqual([1, 3]);
  });

  test('category filter: empty Set passes all resources', () => {
    const result = applyFilters(resources, { query: '', categories: new Set(), freeOnly: false }, 'en');
    expect(result.length).toBe(4);
  });

  test('freeOnly filter shows only free resources', () => {
    const result = applyFilters(resources, { query: '', categories: new Set(), freeOnly: true }, 'en');
    expect(result.map(r => r.id).sort()).toEqual([1, 4]);
  });

  test('conjunctive: query + category + freeOnly all applied simultaneously', () => {
    const result = applyFilters(resources, { query: 'alpha', categories: new Set(['Finance']), freeOnly: true }, 'en');
    // Only resource 1: title matches "alpha", category is Finance, free is true
    expect(result.map(r => r.id)).toEqual([1]);
  });
});

// ---------------------------------------------------------------------------
// savedFilter
// ---------------------------------------------------------------------------

describe('savedFilter', () => {
  const resources = [
    makeResource({ id: 1 }),
    makeResource({ id: 2 }),
    makeResource({ id: 3 }),
  ];

  test('returns only resources whose id is in savedSet', () => {
    const result = savedFilter(resources, new Set([1, 3]));
    expect(result.map(r => r.id)).toEqual([1, 3]);
  });

  test('returns empty array when savedSet is empty', () => {
    expect(savedFilter(resources, new Set())).toEqual([]);
  });

  test('returns empty array when no resource id matches', () => {
    expect(savedFilter(resources, new Set([99, 100]))).toEqual([]);
  });

  test('returns all resources when all ids are in savedSet', () => {
    expect(savedFilter(resources, new Set([1, 2, 3])).length).toBe(3);
  });
});
