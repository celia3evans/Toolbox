// public/js/__tests__/arbitraries.js
// Shared fast-check arbitraries for the resource-hub property tests.
const fc = require('fast-check');

/**
 * Arbitrary that generates a valid Resource object matching the sheet schema.
 */
const resourceArb = fc.record({
  id:               fc.integer({ min: 1, max: 10000 }),
  'title-en':       fc.string({ minLength: 1, maxLength: 100 }),
  'titre-fr':       fc.string({ minLength: 1, maxLength: 100 }),
  'link-en':        fc.constant('https://example.com'),
  'lien-fr':        fc.constant('https://example.com'),
  'description-en': fc.string({ minLength: 0, maxLength: 300 }),
  'description-fr': fc.string({ minLength: 0, maxLength: 300 }),
  categories:       fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 0, maxLength: 5 })
                      .map(arr => arr.join(',')),
  free:             fc.boolean(),
});

module.exports = { resourceArb };
