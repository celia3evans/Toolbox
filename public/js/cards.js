/**
 * cards.js — Resource Card Renderer and Save Logic
 *
 * Handles:
 *   - Save/unsave resources via localStorage (key: cfes-saved, JSON number array)
 *   - Category derivation from resource list
 *   - Client-side filter logic (query, categories, freeOnly)
 *   - Saved-page filter
 *   - Resource Card DOM rendering
 */

'use strict';

// ---------------------------------------------------------------------------
// Save / Unsave Logic
// ---------------------------------------------------------------------------

/**
 * Returns a Set<number> of saved resource IDs from localStorage.
 * Returns an empty Set when the stored value is absent or contains invalid JSON.
 * @returns {Set<number>}
 */
function getSavedIds() {
  try {
    const raw = localStorage.getItem('cfes-saved');
    return new Set(JSON.parse(raw || '[]'));
  } catch {
    return new Set();
  }
}

/**
 * Persists a Set of IDs to localStorage as a JSON number array.
 * @param {Set<number>} idSet
 */
function persistSavedIds(idSet) {
  localStorage.setItem('cfes-saved', JSON.stringify([...idSet]));
}

/**
 * Adds the given id to cfes-saved in localStorage.
 * @param {number} id
 */
function saveResource(id) {
  const ids = getSavedIds();
  ids.add(id);
  persistSavedIds(ids);
}

/**
 * Removes the given id from cfes-saved in localStorage.
 * @param {number} id
 */
function unsaveResource(id) {
  const ids = getSavedIds();
  ids.delete(id);
  persistSavedIds(ids);
}

/**
 * Toggles the save state for the given resource id.
 * Updates the button's data-saved attribute and aria-label accordingly.
 * @param {number} id
 * @param {HTMLElement} buttonEl - The .btn-save button element
 */
function toggleSave(id, buttonEl) {
  const ids = getSavedIds();
  const nowSaved = !ids.has(id);

  if (nowSaved) {
    ids.add(id);
  } else {
    ids.delete(id);
  }

  persistSavedIds(ids);

  buttonEl.dataset.saved = String(nowSaved);
  buttonEl.setAttribute('aria-label', nowSaved ? 'Unsave resource' : 'Save resource');
  buttonEl.innerHTML = nowSaved ? SVG_BOOKMARK_FILLED : SVG_BOOKMARK_OUTLINE;
}

// ---------------------------------------------------------------------------
// SVG Bookmark Icons
// ---------------------------------------------------------------------------

const SVG_BOOKMARK_FILLED = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
  <path d="M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2z"/>
</svg>`;

const SVG_BOOKMARK_OUTLINE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
  <path d="M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2z" fill="none" stroke="currentColor" stroke-width="2"/>
</svg>`;

// ---------------------------------------------------------------------------
// Category and Filter Utilities
// ---------------------------------------------------------------------------

/**
 * Derives a sorted array of distinct non-empty category labels from a
 * resources array. Resources have a comma-separated 'categories' field.
 * @param {Resource[]} resources
 * @returns {string[]}
 */
function deriveCategories(resources) {
  const cats = new Set();
  for (const r of resources) {
    if (r.categories) {
      r.categories
        .split(',')
        .map(function (c) { return c.trim(); })
        .filter(Boolean)
        .forEach(function (c) { cats.add(c); });
    }
  }
  return [...cats].sort();
}

/**
 * Pure filter function. Returns resources matching ALL active filter conditions.
 *
 * filterState: { query: string, categories: Set<string>, freeOnly: boolean }
 *   - query: case-insensitive match on localized title + description (empty matches all)
 *   - categories: empty Set = all categories pass
 *   - freeOnly: true = only free resources pass
 *
 * @param {Resource[]} resources
 * @param {{ query: string, categories: Set<string>, freeOnly: boolean }} filterState
 * @param {'en'|'fr'} lang
 * @returns {Resource[]}
 */
function applyFilters(resources, filterState, lang) {
  const { query, categories, freeOnly } = filterState;
  const titleKey = lang === 'fr' ? 'titre-fr' : 'title-en';
  const descKey  = lang === 'fr' ? 'description-fr' : 'description-en';
  const lowerQuery = query ? query.toLowerCase() : '';

  return resources.filter(function (r) {
    // --- Query filter ---
    if (lowerQuery) {
      const title = (r[titleKey] || '').toLowerCase();
      const desc  = (r[descKey]  || '').toLowerCase();
      if (!title.includes(lowerQuery) && !desc.includes(lowerQuery)) {
        return false;
      }
    }

    // --- Category filter ---
    if (categories && categories.size > 0) {
      const resourceCats = (r.categories || '')
        .split(',')
        .map(function (c) { return c.trim(); })
        .filter(Boolean);
      const hasMatch = resourceCats.some(function (c) { return categories.has(c); });
      if (!hasMatch) {
        return false;
      }
    }

    // --- Free-only filter ---
    if (freeOnly && !r.free) {
      return false;
    }

    return true;
  });
}

/**
 * Returns only the resources whose id is in savedSet.
 * @param {Resource[]} resources
 * @param {Set<number>} savedSet
 * @returns {Resource[]}
 */
function savedFilter(resources, savedSet) {
  return resources.filter(function (r) { return savedSet.has(r.id); });
}

// ---------------------------------------------------------------------------
// Resource Card Renderer
// ---------------------------------------------------------------------------

/**
 * Renders a <article class="resource-card"> element for a resource.
 *
 * - Truncates description to 150 chars + '…' if longer.
 * - Sets data-saved attribute on bookmark button based on getSavedIds().
 * - Attaches a click handler on .btn-save that calls toggleSave().
 *
 * @param {Resource} resource
 * @param {'en'|'fr'} lang
 * @returns {HTMLElement}
 */
function renderCard(resource, lang) {
  const titleKey = lang === 'fr' ? 'titre-fr'       : 'title-en';
  const descKey  = lang === 'fr' ? 'description-fr' : 'description-en';
  const linkKey  = lang === 'fr' ? 'lien-fr'        : 'link-en';

  const title = resource[titleKey] || resource['title-en'] || '';
  const link  = resource[linkKey]  || resource['link-en']  || '#';

  const rawDesc = resource[descKey] || resource['description-en'] || '';
  const desc = rawDesc.length > 150 ? rawDesc.slice(0, 150) + '\u2026' : rawDesc;

  const savedIds = getSavedIds();
  const isSaved  = savedIds.has(resource.id);

  // --- Build the article element ---
  const article = document.createElement('article');
  article.className = 'resource-card';
  article.dataset.id = String(resource.id);

  // --- Card header ---
  const cardHeader = document.createElement('div');
  cardHeader.className = 'card-header';

  const h3 = document.createElement('h3');
  h3.className = 'card-title';

  const anchor = document.createElement('a');
  anchor.href = link;
  anchor.target = '_blank';
  anchor.rel = 'noopener';
  anchor.textContent = title;
  h3.appendChild(anchor);

  const btnSave = document.createElement('button');
  btnSave.className = 'btn-save';
  btnSave.setAttribute('aria-label', isSaved ? 'Unsave resource' : 'Save resource');
  btnSave.dataset.saved = String(isSaved);
  btnSave.innerHTML = isSaved ? SVG_BOOKMARK_FILLED : SVG_BOOKMARK_OUTLINE;
  btnSave.addEventListener('click', function () {
    toggleSave(resource.id, btnSave);
  });

  cardHeader.appendChild(h3);
  cardHeader.appendChild(btnSave);

  // --- Description ---
  const p = document.createElement('p');
  p.className = 'card-desc';
  p.textContent = desc;

  // --- Card meta (category badges + free/paid badge) ---
  const cardMeta = document.createElement('div');
  cardMeta.className = 'card-meta';

  const categories = resource.categories
    ? resource.categories.split(',').map(function (c) { return c.trim(); }).filter(Boolean)
    : [];

  categories.forEach(function (cat) {
    const span = document.createElement('span');
    span.className = 'badge badge-category';
    span.textContent = cat;
    cardMeta.appendChild(span);
  });

  const freeBadge = document.createElement('span');
  if (resource.free === true) {
    freeBadge.className = 'badge badge-free';
    freeBadge.textContent = 'Free';
  } else {
    freeBadge.className = 'badge badge-paid';
    freeBadge.textContent = 'Paid';
  }
  cardMeta.appendChild(freeBadge);

  // --- Assemble ---
  article.appendChild(cardHeader);
  article.appendChild(p);
  article.appendChild(cardMeta);

  return article;
}

// Expose on window (for plain <script> tags in HTML pages)
// Guard for non-browser environments (e.g. Jest/Node).
if (typeof window !== 'undefined') {
  window.getSavedIds      = getSavedIds;
  window.persistSavedIds  = persistSavedIds;
  window.saveResource     = saveResource;
  window.unsaveResource   = unsaveResource;
  window.toggleSave       = toggleSave;
  window.deriveCategories = deriveCategories;
  window.applyFilters     = applyFilters;
  window.savedFilter      = savedFilter;
  window.renderCard       = renderCard;
}

// CommonJS exports for Jest tests.
if (typeof module !== 'undefined') {
  module.exports = {
    getSavedIds, persistSavedIds, saveResource, unsaveResource,
    toggleSave, deriveCategories, applyFilters, savedFilter, renderCard,
  };
}
