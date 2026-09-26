// Simple SPA Router
// Hash-based routing for Capacitor compatibility

class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.currentParams = {};
    this.beforeEach = null;
    this.onRouteChange = null;

    window.addEventListener('hashchange', () => this.handleRoute());
  }

  /**
   * Register a route
   * @param {string} path - Route pattern (e.g., '/property/:id')
   * @param {Function} handler - Async function that returns HTML string
   */
  on(path, handler) {
    this.routes.set(path, handler);
    return this;
  }

  /**
   * Navigate to a route
   */
  navigate(path) {
    window.location.hash = path;
  }

  /**
   * Go back
   */
  back() {
    window.history.back();
  }

  /**
   * Get current path
   */
  getPath() {
    return window.location.hash.slice(1) || '/';
  }

  /**
   * Handle route change
   */
  async handleRoute() {
    const path = this.getPath();
    const content = document.getElementById('app-content');

    // Find matching route
    let handler = null;
    let params = {};

    for (const [pattern, h] of this.routes) {
      const match = this.matchRoute(pattern, path);
      if (match) {
        handler = h;
        params = match;
        break;
      }
    }

    if (!handler) {
      // Default to dashboard
      handler = this.routes.get('/') || this.routes.get('/dashboard');
      params = {};
    }

    if (handler) {
      this.currentRoute = path;
      this.currentParams = params;

      if (this.beforeEach) {
        this.beforeEach(path, params);
      }

      try {
        content.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><span class="loading-text">Loading...</span></div>';
        const html = await handler(params);
        content.innerHTML = `<div class="page-enter">${html}</div>`;

        if (this.onRouteChange) {
          this.onRouteChange(path, params);
        }
      } catch (error) {
        console.error('Route error:', error);
        content.innerHTML = `
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
            <h3 class="empty-state-title">Something went wrong</h3>
            <p class="empty-state-text">${error.message}</p>
            <button class="btn btn-primary" onclick="location.hash='/'">Go to Dashboard</button>
          </div>
        `;
      }
    }
  }

  /**
   * Match a route pattern against a path
   */
  matchRoute(pattern, path) {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');

    if (patternParts.length !== pathParts.length) return null;

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }

    return params;
  }

  /**
   * Start the router
   */
  start() {
    this.handleRoute();
  }
}

const router = new Router();
export default router;
