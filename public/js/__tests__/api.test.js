'use strict';

/**
 * Unit tests for public/js/api.js
 * Requirements: 4.1, 7.2
 */

let fetchResources;

beforeEach(() => {
  jest.resetModules();
  // Mock global fetch
  global.fetch = jest.fn();
  ({ fetchResources } = require('../api'));
});

afterEach(() => {
  jest.restoreAllMocks();
});

function mockFetch(data, status = 200) {
  global.fetch.mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  });
}

describe('fetchResources', () => {
  test('no params → calls /api/sheet with no query string', async () => {
    mockFetch([]);
    await fetchResources();
    expect(global.fetch).toHaveBeenCalledWith('/api/sheet');
  });

  test('{ category: "Finance" } → URL contains category=Finance', async () => {
    mockFetch([]);
    await fetchResources({ category: 'Finance' });
    const url = global.fetch.mock.calls[0][0];
    expect(url).toContain('category=Finance');
  });

  test('{ free: true } → URL contains free=true', async () => {
    mockFetch([]);
    await fetchResources({ free: true });
    const url = global.fetch.mock.calls[0][0];
    expect(url).toContain('free=true');
  });

  test('{ id: 5 } → URL contains id=5', async () => {
    mockFetch([]);
    await fetchResources({ id: 5 });
    const url = global.fetch.mock.calls[0][0];
    expect(url).toContain('id=5');
  });

  test('null/undefined params are excluded from query string', async () => {
    mockFetch([]);
    await fetchResources({ category: null, free: undefined, id: 3 });
    const url = global.fetch.mock.calls[0][0];
    expect(url).not.toContain('category');
    expect(url).not.toContain('free');
    expect(url).toContain('id=3');
  });

  test('returns parsed JSON array on success', async () => {
    const data = [{ id: 1, 'title-en': 'Test' }];
    mockFetch(data);
    const result = await fetchResources();
    expect(result).toEqual(data);
  });

  test('throws an error on non-2xx response', async () => {
    mockFetch(null, 500);
    await expect(fetchResources()).rejects.toThrow('HTTP error 500');
  });

  test('throws an error on 404 response', async () => {
    mockFetch(null, 404);
    await expect(fetchResources()).rejects.toThrow('HTTP error 404');
  });

  test('multiple params → all appear in query string', async () => {
    mockFetch([]);
    await fetchResources({ category: 'Tech', free: false });
    const url = global.fetch.mock.calls[0][0];
    expect(url).toContain('category=Tech');
    expect(url).toContain('free=false');
  });
});
