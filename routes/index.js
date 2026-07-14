const sheetRoutes = require('./sheet');

/**
 * Register all routes with the router.
 * To add a new route group, import it here and call router.use().
 *
 * Example:
 *   const authRoutes = require('./auth');
 *   router.use('/api/auth', authRoutes);
 */

class Router {
  constructor() {
    this.groups = [];
  }

  /**
   * Register a route group under a base path.
   * @param {string} basePath - e.g. '/api/sheet'
   * @param {Function} handler - async (req, res, url) => boolean (return true if handled)
   */
  use(basePath, handler) {
    this.groups.push({ basePath, handler });
  }

  /**
   * Try each registered route group in order.
   * Returns true if a route handled the request, false to fall through to static serving.
   */
  async handle(req, res) {
    for (const { basePath, handler } of this.groups) {
      if (req.url.startsWith(basePath)) {
        const handled = await handler(req, res);
        if (handled) return true;
      }
    }
    return false;
  }
}

const router = new Router();

router.use('/api/sheet', sheetRoutes);

module.exports = router;
