

class Router {
  constructor() {
    this.routes = [];
    this.currentRoute = null;
    this.container = null;
    this.onNavigate = null;
  }

  
  add(path, handler) {
    
    const paramNames = [];
    const pattern = path.replace(/:([^/]+)/g, (_match, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });
    this.routes.push({
      path,
      pattern: new RegExp(`^${pattern}$`),
      paramNames,
      handler,
    });
  }

  
  mount(container) {
    this.container = container;
    window.addEventListener('hashchange', () => this.resolve());
    this.resolve();
  }

  
  async resolve() {
    const hash = window.location.hash.slice(1) || '/';
    
    for (const route of this.routes) {
      const match = hash.match(route.pattern);
      if (match) {
        const params = {};
        route.paramNames.forEach((name, i) => {
          params[name] = match[i + 1];
        });

        this.currentRoute = route.path;

        try {
          const html = await route.handler(params);
          this.container.innerHTML = `<div class="page-enter">${html}</div>`;
          
          
          if (route._afterRender) {
            route._afterRender(params);
          }

          if (this.onNavigate) this.onNavigate(route.path, params);
        } catch (error) {
          console.error('Route error:', error);
          this.container.innerHTML = `
            <div class="page-enter">
              <div class="page-header"><h2>Error</h2></div>
              <div class="page-body">
                <div class="empty-state">
                  <h3>Something went wrong</h3>
                  <p>${error.message}</p>
                </div>
              </div>
            </div>`;
        }
        return;
      }
    }

    
    this.container.innerHTML = `
      <div class="page-enter">
        <div class="page-header"><h2>Not Found</h2></div>
        <div class="page-body">
          <div class="empty-state">
            <h3>Page not found</h3>
            <p>The page you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>`;
  }

  
  navigate(path) {
    window.location.hash = path;
  }

  
  getCurrentPath() {
    return window.location.hash.slice(1) || '/';
  }
}

const router = new Router();
export default router;
