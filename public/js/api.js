/**
 * API Client Module
 * Thin wrapper around fetch for the /api/sheet endpoint.
 */

/**
 * Fetches resources from the API, optionally filtered.
 *
 * @param {Object} params - Optional filter parameters
 * @param {number} [params.id] - Filter by resource ID
 * @param {string} [params.category] - Filter by category
 * @param {boolean} [params.free] - Filter by free flag
 * @returns {Promise<Resource[]>} Array of resource objects
 * @throws {Error} On non-2xx HTTP responses or network failures
 */
async function fetchResources(params = {}) {
  // Build query string from non-null, non-undefined entries
  const entries = Object.entries(params).filter(
    ([, value]) => value !== null && value !== undefined
  );

  let url = '/api/sheet';
  if (entries.length > 0) {
    const qs = new URLSearchParams(entries.map(([k, v]) => [k, String(v)]));
    url += '?' + qs.toString();
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  return response.json();
}

if (typeof window !== 'undefined') {
  window.fetchResources = fetchResources;
}

if (typeof module !== 'undefined') {
  module.exports = { fetchResources };
}
