# Implementation Plan: Resource Hub

## Overview

Build the CFES Toolbox Resource Hub — a bilingual, six-page static web application served by the existing bare Node.js HTTP server. Tasks proceed from infrastructure setup through shared modules, page-by-page HTML, and finally test suite setup with unit and property-based tests. Each task builds directly on the previous step; all code is wired together in the final integration tasks.

## Tasks

- [x] 1. Update server MIME types for CSS and JS
  - In `server.js`, extend the `mime` object to include `'.css': 'text/css'` and `'.js': 'application/javascript'`
  - Verify the existing `.html` and `.ttf` entries are preserved
  - _Requirements: 13.2_

- [x] 2. Create public asset directory structure and static config
  - Create `public/css/` and `public/js/` directories (add a `.gitkeep` or the first real file to each)
  - Create `public/js/config.js` containing the `CONFIG` object with a `googleClientId` placeholder string
  - _Requirements: 13.1, 13.2, 10.8_

- [x] 3. Implement `public/js/translations.js` and `public/js/i18n.js` — language modules
  - Create `translations.js` as the single source of truth for all UI strings in EN and FR, keyed by dot-namespaced IDs
  - Implement `getLang()`, `setLang(lang)`, `initLang()`, and `getString(key)` in `i18n.js`
  - `setLang` must look up `data-i18n="key"` elements in the DOM and set their `textContent` (or `placeholder` for inputs) from `TRANSLATIONS`
  - Persist Active Language to `localStorage` key `cfes-lang`; default to `'en'` when key is absent
  - `setLang` must update `document.documentElement.lang`
  - `translations.js` must be loaded before `i18n.js`
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 12.6_

- [x] 4. Implement `public/js/api.js` — API client module
  - Implement `fetchResources(params = {})` that builds `URLSearchParams` from non-null entries in `params` and calls `GET /api/sheet`
  - Throw on non-2xx HTTP responses
  - Export `fetchResources` so page scripts can import it
  - _Requirements: 4.1, 5.3, 7.2_

- [x] 5. Implement `public/js/cards.js` — resource card renderer and save logic
  - Implement `getSavedIds()`, `saveResource(id)`, `unsaveResource(id)`, `toggleSave(id, buttonEl)`, and `renderCard(resource, lang)`
  - `renderCard` must build the `<article class="resource-card">` HTML structure from the design, including localized title/description/link, category badges, free/paid badge, and bookmark button with correct `data-saved` state
  - Truncate `card-desc` to 150 characters with `…` when description exceeds 150 characters
  - Read/write `cfes-saved` in `localStorage` as a JSON number array
  - `getSavedIds()` must return an empty `Set` when `localStorage` contains invalid JSON
  - _Requirements: 4.2, 8.1, 8.2, 8.3, 8.4_

- [x] 6. Implement `public/js/nav.js` — navigation menu module
  - Implement `initNav()` that attaches click handlers to `.hamburger`, `.nav-close`, and `.nav-overlay`
  - Toggle `aria-expanded` on the hamburger button and `aria-hidden` on `.nav-menu` and `.nav-overlay`
  - _Requirements: 2.1, 2.2, 2.4, 2.5_

- [x] 7. Create `public/css/style.css` — global design system
  - Define CSS custom properties: `--color-bg: #0d1b2a`, `--color-surface`, `--color-text`, `--color-accent`, and spacing/radius tokens
  - Implement reset/base styles, `.site-header`, `.nav-menu`, `.nav-overlay`, `.lang-toggle`, `.hamburger` layout
  - Implement `.resource-card`, `.card-header`, `.card-title`, `.card-desc`, `.card-meta`, `.badge`, `.badge-category`, `.badge-free`, `.badge-paid` styles
  - Implement `.category-bubble`, `.bubble-grid` (3-column CSS Grid), focus indicator styles for all interactive elements
  - _Requirements: 3.3, 4.2, 12.1, 12.2, 12.3, 12.5_

- [x] 8. Build `index.html` — Landing Page
  - Add the shared `<header>`, `<nav class="nav-menu">`, and overlay markup
  - Add `<main>` with hero section: heading "Toolbox" and bilingual tagline using `data-i18n` keys
  - Add a static `<nav class="bubble-grid">` with four `<a class="category-bubble">` links: All Resources, Saved, Profile, About — no API call needed
  - All bubble labels use `data-i18n` keys from `translations.js`
  - Load `translations.js` and `i18n.js` (no `api.js` or `cards.js` needed on this page)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 9. Build `resources.html` — All Resources Page
  - Add shared header/nav markup, `<main>` with a Search Bar `<input>` and Filter Panel `<aside>` (category checkboxes + free-only toggle)
  - Add `<section id="resource-list">` for rendered cards
  - Add inline `<script>` that on `DOMContentLoaded`: calls `initLang()` and `initNav()`, fetches all resources, derives category checkboxes for the Filter Panel, renders all cards, and wires the search input and filter checkboxes/toggle to a client-side `applyFilters(resources, filterState)` function that re-renders cards
  - `applyFilters` must implement conjunctive AND logic across query, category set, and freeOnly flag
  - Show loading indicator while fetching, error state with retry on failure, and "no results" message when filtered list is empty
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 10. Build `category.html` — Category Page
  - Add shared header/nav markup and `<main>` with a dynamic page heading, Search Bar, and `<section id="resource-list">`
  - Add inline `<script>` that reads `new URLSearchParams(location.search).get('cat')` on `DOMContentLoaded`; if absent, shows localized error and link to `/`; otherwise fetches `GET /api/sheet?category=<cat>`, renders cards, and wires the search input to client-side filtering
  - Show loading indicator while fetching and error state with retry on failure
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 11. Build `saved.html` — Saved Resources Page
  - Add shared header/nav markup and `<main>` with `<section id="saved-list">`
  - Add inline `<script>` that on `DOMContentLoaded`: calls `initLang()` and `initNav()`, reads `getSavedIds()`, fetches all resources, filters to saved IDs only, and renders cards
  - When the saved set is empty, display the localized `empty.saved` message with a link to `resources.html`
  - When a card's bookmark is toggled to unsaved, remove that card from the DOM immediately
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 12. Build `profile.html` — User Profile Page
  - Add shared header/nav markup and `<main>` with a signed-out view (Google Sign-In button) and a signed-in view (avatar, display name, sign-out button); toggle between them based on `sessionStorage`
  - Load the Google Identity Services library from `https://accounts.google.com/gsi/client`
  - Add inline `<script>` that calls `google.accounts.id.initialize({ client_id: CONFIG.googleClientId, callback })` on load; in the callback, decode the JWT with `parseJwt`, store `cfes-user-name`, `cfes-user-picture`, `cfes-user-email` in `sessionStorage`, and render the signed-in view
  - Sign-out clears all three `sessionStorage` keys and re-renders the signed-out view
  - Render all labels in the Active Language using `data-i18n-en` / `data-i18n-fr`
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9_

- [x] 13. Build `about.html` — About Page
  - Add shared header/nav markup and `<main>` with static bilingual content: CFES mission statement, organization name, and a link to the official CFES website
  - All text must use `data-i18n-en` / `data-i18n-fr` attributes so it re-renders on language toggle
  - _Requirements: 11.1, 11.2, 11.3_

- [x] 14. Checkpoint — smoke-test static serving
  - Ensure all six HTML files are present and the server starts without errors
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Set up Jest + jsdom + fast-check test framework
  - Install `jest@29`, `jest-environment-jsdom@29`, and `fast-check@3` as dev dependencies in `package.json`
  - Add Jest config to `package.json`: `"jest": { "testEnvironment": "jsdom" }` and update the `"test"` script to `"jest"`
  - Create `public/js/__tests__/` directory with a `.gitkeep` placeholder
  - _Requirements: (enables all test tasks below)_

- [x] 16. Write unit tests for `i18n.js`
  - [x] 16.1 Implement unit tests for `getLang`, `setLang`, `initLang`
    - Test `setLang('fr')` → `getLang()` returns `'fr'`
    - Test `setLang('en')` → `getLang()` returns `'en'`
    - Test `initLang()` when `localStorage` is empty → defaults to `'en'`
    - Test `initLang()` when `localStorage` has `cfes-lang=fr` → restores `'fr'`
    - _Requirements: 1.2, 1.3, 1.4_

  - [ ]* 16.2 Write property test for language toggle round-trip (Property 1)
    - **Property 1: Language toggle and rendering round-trip**
    - For any `lang` in `{'en', 'fr'}` and any Resource, `setLang(lang)` → `getLang() === lang` and `renderCard(r, lang)` displays the correct language fields
    - Use `fc.constantFrom('en', 'fr')` and a `resourceArb` arbitrary; run ≥ 100 iterations
    - Tag: `// Feature: resource-hub, Property 1: Language toggle and rendering round-trip`
    - **Validates: Requirements 1.2, 1.5**

  - [ ]* 16.3 Write property test for language persistence (Property 2)
    - **Property 2: Language persistence across sessions**
    - For any `lang` in `{'en', 'fr'}`, `setLang(lang)` then `initLang()` → `getLang() === lang`; empty storage → `'en'`
    - Use `fc.constantFrom('en', 'fr')`; run ≥ 100 iterations
    - Tag: `// Feature: resource-hub, Property 2: Language persistence across sessions`
    - **Validates: Requirements 1.3, 1.4**

- [x] 17. Write unit tests for `cards.js`
  - [x] 17.1 Implement unit tests for save logic and `renderCard`
    - Test `saveResource(id)` → `getSavedIds().has(id)` is `true`
    - Test `unsaveResource(id)` after save → `getSavedIds().has(id)` is `false`
    - Test `getSavedIds()` when `localStorage` contains invalid JSON → returns empty `Set`
    - Test `renderCard` title/description language selection for both `'en'` and `'fr'`
    - Test `renderCard` description exactly 150 chars → no truncation
    - Test `renderCard` description 151 chars → truncated to 150 + `…`
    - Test `renderCard` `data-saved` attribute: `"true"` when id is in saved set, `"false"` otherwise
    - _Requirements: 4.2, 8.2, 8.3, 8.4_

  - [ ]* 17.2 Write property test for save/unsave round-trip (Property 5)
    - **Property 5: Save/unsave round-trip**
    - For any integer id ≥ 1: `saveResource(id)` → `getSavedIds().has(id)` is `true`; then `unsaveResource(id)` → `getSavedIds().has(id)` is `false`
    - Use `fc.integer({ min: 1 })`; run ≥ 100 iterations
    - Tag: `// Feature: resource-hub, Property 5: Save/unsave round-trip`
    - **Validates: Requirements 8.2, 8.3**

  - [ ]* 17.3 Write property test for save state consistency on render (Property 6)
    - **Property 6: Save state consistency on render**
    - For any array of ids and any resource, `persistSavedIds(new Set(ids))` then `renderCard(r, 'en')` → `card.dataset.saved === String(ids.includes(r.id))`
    - Use `fc.array(fc.integer({ min: 1 }))` and `resourceArb`; run ≥ 100 iterations
    - Tag: `// Feature: resource-hub, Property 6: Save state consistency on render`
    - **Validates: Requirements 8.4**

  - [ ]* 17.4 Write property test for description truncation invariant (Property 8)
    - **Property 8: Description truncation invariant**
    - For any resource and any `lang`, the `.card-desc` text length is ≤ 151 characters; if original description ≤ 150 chars it is unchanged; if > 150 chars it ends with `…`
    - Use `resourceArb` and `fc.constantFrom('en', 'fr')`; run ≥ 100 iterations
    - Tag: `// Feature: resource-hub, Property 8: Description truncation invariant`
    - **Validates: Requirements 4.2**

- [x] 18. Write unit tests for `api.js`
  - [x] 18.1 Implement unit tests for `fetchResources`
    - Test with mocked `fetch`: no params → calls `/api/sheet` with no query string
    - Test with `{ category: 'Finance' }` → query string contains `category=Finance`
    - Test with `{ free: true }` → query string contains `free=true`
    - Test non-2xx response → throws an error
    - _Requirements: 4.1, 7.2_

- [x] 19. Write unit and property tests for filter and category logic
  - [x] 19.1 Implement unit tests for `deriveCategories` and `applyFilters`
    - Test `deriveCategories` with comma-separated categories: deduplication, trimming, no empty-string labels
    - Test `applyFilters` with all three filter axes individually and combined
    - Test `applyFilters` with empty query → matches all resources
    - _Requirements: 3.2, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 19.2 Write property test for search filter case-insensitive containment (Property 3)
    - **Property 3: Search filter — case-insensitive containment**
    - For any resource list and any query string, every resource in the filtered result contains the query (case-insensitive) in its localized title or description; an empty query matches all
    - Use `fc.array(resourceArb)` and `fc.string()`; run ≥ 100 iterations
    - Tag: `// Feature: resource-hub, Property 3: Search filter — case-insensitive containment`
    - **Validates: Requirements 5.2, 5.4, 7.3**

  - [ ]* 19.3 Write property test for conjunctive filter correctness (Property 4)
    - **Property 4: Conjunctive filter correctness**
    - For any resource list and filter state (query, category set, freeOnly), every resource in `applyFilters(resources, filterState)` satisfies all three conditions simultaneously
    - Use `fc.array(resourceArb)` and a `filterStateArb` arbitrary; run ≥ 100 iterations
    - Tag: `// Feature: resource-hub, Property 4: Conjunctive filter correctness`
    - **Validates: Requirements 6.2, 6.3, 6.4, 6.5, 6.6**

  - [ ]* 19.4 Write property test for saved page filter correctness (Property 7)
    - **Property 7: Saved page filter correctness**
    - For any resource list and any set of saved IDs, `savedFilter(resources, savedSet)` returns exactly those resources whose `id` is in the set — no more, no fewer
    - Use `fc.array(resourceArb)` and `fc.array(fc.integer({ min: 1 }))`; run ≥ 100 iterations
    - Tag: `// Feature: resource-hub, Property 7: Saved page filter correctness`
    - **Validates: Requirements 9.2**

  - [ ]* 19.5 Write property test for category derivation completeness (Property 9)
    - **Property 9: Category derivation completeness**
    - For any resource list, `deriveCategories(resources)` contains every distinct non-empty category label that appears in the data and no label that does not appear
    - Use `fc.array(resourceArb)`; run ≥ 100 iterations
    - Tag: `// Feature: resource-hub, Property 9: Category derivation completeness`
    - **Validates: Requirements 3.2, 6.1**

- [x] 20. Final checkpoint — Ensure all tests pass
  - Run the full test suite (`npm test`) and confirm all unit and property tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- All property tests must run ≥ 100 iterations (fast-check default is 100)
- Tag each property test with `// Feature: resource-hub, Property N: <title>` for traceability
- `applyFilters` and `savedFilter` should be pure, exported functions in their respective modules so they are directly testable without DOM setup
- `deriveCategories` should be exported from `cards.js` or a shared utility so it is importable in tests
- The `resourceArb` fast-check arbitrary used across test files should be defined once in a shared `__tests__/arbitraries.js` file
- All UI strings live in `public/js/translations.js`; HTML elements reference them via `data-i18n="key"`; JS code uses `getString('key')`
- `translations.js` must be loaded before `i18n.js` in every HTML page's script tags
