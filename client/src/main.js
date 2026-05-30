
import router from './router.js';
import { renderSidebar, initSidebar } from './components/sidebar.js';
import { renderDashboard, initDashboard } from './pages/dashboard.js';
import { renderReviews, initReviews } from './pages/reviews.js';
import { renderReviewDetail } from './pages/review-detail.js';
import { renderSettings, initSettings } from './pages/settings.js';
import { renderAuth, initAuth } from './pages/auth.js';

const app = document.getElementById('app');


function isAuthenticated() {
  return localStorage.getItem('cr_authenticated') === 'true';
}

function setAuthenticated(value) {
  if (value) {
    localStorage.setItem('cr_authenticated', 'true');
  } else {
    localStorage.removeItem('cr_authenticated');
  }
}



router.add('/login', async () => {
  return await renderAuth();
});

router.add('/', async () => {
  if (!isAuthenticated()) { window.location.hash = '/login'; return ''; }
  return await renderDashboard();
});

router.add('/reviews', async () => {
  if (!isAuthenticated()) { window.location.hash = '/login'; return ''; }
  return await renderReviews();
});

router.add('/reviews/:id', async (params) => {
  if (!isAuthenticated()) { window.location.hash = '/login'; return ''; }
  return await renderReviewDetail(params);
});

router.add('/settings', async () => {
  if (!isAuthenticated()) { window.location.hash = '/login'; return ''; }
  return await renderSettings();
});



router.onNavigate = (path) => {
  const isAuthPage = path === '/login';

  
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mainContent = document.getElementById('main-content');

  if (sidebar) sidebar.style.display = isAuthPage ? 'none' : '';
  if (overlay) overlay.style.display = isAuthPage ? 'none' : '';
  if (menuBtn) menuBtn.style.display = isAuthPage ? 'none' : '';
  if (mainContent) mainContent.style.marginLeft = isAuthPage ? '0' : '';

  if (!isAuthPage) {
    
    document.querySelectorAll('.sidebar-link').forEach((link) => {
      const linkPath = link.dataset.path;
      const isActive = linkPath === '/'
        ? path === '/'
        : path.startsWith(linkPath);
      link.classList.toggle('active', isActive);
    });

    
    sidebar?.classList.remove('open');
    overlay?.classList.remove('open');
  }

  
  requestAnimationFrame(() => {
    if (path === '/login') {
      initAuth();
      
      patchAuthForm();
    }
    if (path === '/') initDashboard();
    if (path === '/reviews') initReviews();
    if (path === '/settings') initSettings();
  });
};


function patchAuthForm() {
  const form = document.getElementById('signin-form');
  if (!form) return;

  
  form.addEventListener('submit', (e) => {
    
    
    
  });

  
  const origHash = window.location.hash;
  const observer = new MutationObserver(() => {
    
    const card = document.getElementById('auth-card');
    if (card?.classList.contains('auth-success')) {
      setAuthenticated(true);
    }
  });

  const card = document.getElementById('auth-card');
  if (card) {
    observer.observe(card, { attributes: true, attributeFilter: ['class'] });
  }

  
  document.querySelectorAll('.auth-social-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      setTimeout(() => setAuthenticated(true), 200);
    });
  });
}



function buildLayout() {
  const sidebarHtml = renderSidebar();
  const mainContent = document.createElement('main');
  mainContent.className = 'main-content';
  mainContent.id = 'main-content';

  app.innerHTML = sidebarHtml;
  app.appendChild(mainContent);

  
  initSidebar();

  
  addLogoutButton();

  
  router.mount(mainContent);

  
  if (!isAuthenticated() && window.location.hash !== '#/login') {
    window.location.hash = '/login';
  }
}

function addLogoutButton() {
  const sidebarFooter = document.querySelector('.sidebar-footer');
  if (!sidebarFooter) return;

  const logoutBtn = document.createElement('button');
  logoutBtn.className = 'sidebar-link';
  logoutBtn.style.marginTop = '12px';
  logoutBtn.style.width = '100%';
  logoutBtn.style.padding = '8px 16px';
  logoutBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
    <span style="font-size:13px;">Sign Out</span>`;
  logoutBtn.addEventListener('click', () => {
    setAuthenticated(false);
    window.location.hash = '/login';
  });

  sidebarFooter.appendChild(logoutBtn);
}


buildLayout();
