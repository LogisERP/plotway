// Plotway — Main Application Entry Point
import '@ionic/core/css/ionic.bundle.css';
import { defineCustomElements } from '@ionic/core/loader';
import { addIcons } from 'ionicons';
import * as icons from 'ionicons/icons';

// Initialize Ionic custom elements and IonIcons
defineCustomElements(window);
addIcons(icons);

import { initAuth } from './firebase.js';
import router from './router.js';
import { renderDashboard, initDashboard } from './pages/dashboard.js';
import { renderInventory, initInventory, setInventoryFilters } from './pages/inventory.js';
import { renderPropertyAdd, initPropertyAdd } from './pages/property-add.js';
import { renderPropertyDetail, initPropertyDetail } from './pages/property-detail.js';
import { renderPropertyEdit, initPropertyEdit } from './pages/property-edit.js';
import { renderBuyers, initBuyers } from './pages/buyers.js';
import { renderLeads, initLeads } from './pages/leads.js';
import { renderSiteVisits, initSiteVisits } from './pages/site-visits.js';
import { renderMore, initMore } from './pages/more.js';
import { searchProperties, getBuyers } from './services/firestore.js';
import { debounce, formatPrice, getStatusBadge } from './utils.js';
import { PROPERTY_TYPES, PROPERTY_STATUSES, LAND_UNITS } from './utils.js';


// ── App Initialization ──
async function initApp() {
  // Show loading state
  const content = document.getElementById('app-content');
  content.innerHTML = `
    <div class="loading-spinner" style="min-height: 60vh;">
      <div class="spinner"></div>
      <span class="loading-text">Initializing Plotway...</span>
    </div>
  `;

  // Initialize Firebase Auth
  try {
    await initAuth();
  } catch (e) {
    console.error('Auth init error:', e);
  }

  // Register routes
  setupRoutes();

  // Setup UI handlers
  setupNavigation();
  setupSearch();
  setupFilters();
  setupNetworkState();

  // Start router
  if (!window.location.hash || window.location.hash === '#') {
    window.location.hash = '/';
  }
  router.start();
}

// ── Route Registration ──
function setupRoutes() {
  router
    .on('/', async () => {
      const html = await renderDashboard();
      return html;
    })
    .on('/dashboard', async () => {
      const html = await renderDashboard();
      return html;
    })
    .on('/inventory', async (params) => {
      const html = await renderInventory(params);
      return html;
    })
    .on('/property/add', async () => {
      const html = await renderPropertyAdd();
      return html;
    })
    .on('/property/:id', async (params) => {
      const html = await renderPropertyDetail(params);
      return html;
    })
    .on('/property/edit/:id', async (params) => {
      const html = await renderPropertyEdit(params);
      return html;
    })
    .on('/buyers', async () => {
      const html = await renderBuyers();
      return html;
    })
    .on('/leads', async () => {
      const html = await renderLeads();
      return html;
    })
    .on('/site-visits', async () => {
      const html = await renderSiteVisits();
      return html;
    })
    .on('/more', async () => {
      const html = await renderMore();
      return html;
    });

  // Route lifecycle
  router.beforeEach = (path) => {
    updateHeader(path);
    updateFAB(path);
  };

  router.onRouteChange = (path, params) => {
    updateActiveNav(path);
    initPageHandlers(path, params);
  };
}

// ── Page Init Handlers ──
function initPageHandlers(path, params) {
  // Small delay to ensure DOM is ready
  requestAnimationFrame(() => {
    if (path === '/' || path === '/dashboard') {
      initDashboard();
    } else if (path === '/inventory') {
      initInventory();
    } else if (path === '/property/add') {
      initPropertyAdd();
    } else if (path.startsWith('/property/edit/')) {
      initPropertyEdit(params);
    } else if (path.startsWith('/property/')) {
      initPropertyDetail(params);
    } else if (path === '/buyers') {
      initBuyers();
    } else if (path === '/leads') {
      initLeads();
    } else if (path === '/site-visits') {
      initSiteVisits();
    } else if (path === '/more') {
      initMore();
    }
  });
}

// ── Header Updates ──
function updateHeader(path) {
  const title = document.getElementById('header-title');
  const backBtn = document.getElementById('header-back-btn');
  const searchBtn = document.getElementById('header-search-btn');
  const filterBtn = document.getElementById('header-filter-btn');

  const titles = {
    '/': 'Plotway',
    '/dashboard': 'Plotway',
    '/inventory': 'Inventory',
    '/property/add': 'Add Property',
    '/buyers': 'Buyers',
    '/leads': 'Leads',
    '/site-visits': 'Site Visits',
    '/more': 'More'
  };

  // Handle detail/edit pages
  let pageTitle = titles[path];
  if (!pageTitle) {
    if (path.startsWith('/property/edit/')) pageTitle = 'Edit Property';
    else if (path.startsWith('/property/')) pageTitle = 'Property Details';
    else pageTitle = 'Plotway';
  }

  title.textContent = pageTitle;

  // Back button visibility
  const mainPages = ['/', '/dashboard', '/inventory', '/buyers', '/leads', '/more'];
  if (mainPages.includes(path)) {
    backBtn.classList.add('hidden');
  } else {
    backBtn.classList.remove('hidden');
  }

  // Filter button visibility
  if (path === '/inventory') {
    filterBtn.classList.remove('hidden');
  } else {
    filterBtn.classList.add('hidden');
  }
}

// ── FAB Updates ──
function updateFAB(path) {
  const fab = document.getElementById('fab');
  const showOn = ['/dashboard', '/', '/inventory'];

  if (showOn.includes(path)) {
    fab.classList.remove('hidden');
    fab.onclick = () => router.navigate('/property/add');
  } else if (path === '/buyers') {
    fab.classList.remove('hidden');
    fab.onclick = () => {
      if (window.__plotway_showAddBuyer) window.__plotway_showAddBuyer();
    };
  } else if (path === '/leads') {
    fab.classList.remove('hidden');
    fab.onclick = () => {
      if (window.__plotway_showAddLead) window.__plotway_showAddLead();
    };
  } else {
    fab.classList.add('hidden');
  }
}

// ── Navigation ──
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      const routeMap = {
        'dashboard': '/',
        'inventory': '/inventory',
        'buyers': '/buyers',
        'leads': '/leads',
        'more': '/more'
      };
      router.navigate(routeMap[page] || '/');
    });
  });

  // Back button
  document.getElementById('header-back-btn').addEventListener('click', () => {
    router.back();
  });
}

function updateActiveNav(path) {
  const navMap = {
    '/': 'dashboard',
    '/dashboard': 'dashboard',
    '/inventory': 'inventory',
    '/property/add': 'inventory',
    '/buyers': 'buyers',
    '/leads': 'leads',
    '/site-visits': 'more',
    '/more': 'more'
  };

  let activePage = navMap[path];
  if (!activePage) {
    if (path.startsWith('/property/')) activePage = 'inventory';
    else if (path.startsWith('/buyer')) activePage = 'buyers';
    else activePage = 'dashboard';
  }

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === activePage);
  });
}

// ── Search ──
function setupSearch() {
  const searchBtn = document.getElementById('header-search-btn');
  const searchOverlay = document.getElementById('search-overlay');
  const searchBack = document.getElementById('search-back-btn');
  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear-btn');
  const searchResults = document.getElementById('search-results');

  searchBtn.addEventListener('click', () => {
    searchOverlay.classList.remove('hidden');
    searchInput.focus();
  });

  searchBack.addEventListener('click', () => {
    searchOverlay.classList.add('hidden');
    searchInput.value = '';
    searchResults.innerHTML = '';
    searchClear.classList.add('hidden');
  });

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchResults.innerHTML = '';
    searchClear.classList.add('hidden');
    searchInput.focus();
  });

  const doSearch = debounce(async (term) => {
    if (term.length < 2) {
      searchResults.innerHTML = '<p class="text-center text-muted" style="padding: 32px;">Type at least 2 characters</p>';
      return;
    }

    searchResults.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

    try {
      const [properties, buyers] = await Promise.all([
        searchProperties(term),
        getBuyers().then(b => b.filter(buyer => {
          const fields = [buyer.name, buyer.phone, buyer.preferredLocation, buyer.requirement].filter(Boolean).join(' ').toLowerCase();
          return fields.includes(term.toLowerCase());
        }))
      ]);

      let html = '';

      if (properties.length > 0) {
        html += `<p style="font-size: 12px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.04em;">Properties (${properties.length})</p>`;
        properties.forEach(p => {
          const loc = [p.location?.area || p.location?.village, p.location?.taluk].filter(Boolean).join(', ');
          html += `
            <div class="list-item" onclick="location.hash='/property/${p.id}'; document.getElementById('search-overlay').classList.add('hidden');">
              <div class="list-item-avatar" style="background: rgba(59,130,246,0.15); color: #60a5fa;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
              </div>
              <div class="list-item-content">
                <div class="list-item-title">${p.propertyCode} — ${p.landDetails?.landSize || ''} ${p.landDetails?.landUnit || 'Cent'} ${p.propertyType || ''}</div>
                <div class="list-item-subtitle">${loc || 'Unknown'} • ${formatPrice(p.price?.expectedPrice)}</div>
              </div>
              <div class="list-item-trailing">${getStatusBadge(p.status)}</div>
            </div>
          `;
        });
      }

      if (buyers.length > 0) {
        html += `<p style="font-size: 12px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase; margin: 16px 0 8px; letter-spacing: 0.04em;">Buyers (${buyers.length})</p>`;
        buyers.forEach(b => {
          html += `
            <div class="list-item" onclick="location.hash='/buyers'; document.getElementById('search-overlay').classList.add('hidden');">
              <div class="list-item-avatar" style="background: rgba(168,85,247,0.15); color: #c084fc;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/></svg>
              </div>
              <div class="list-item-content">
                <div class="list-item-title">${b.name}</div>
                <div class="list-item-subtitle">${b.phone || ''} • ${b.preferredLocation || ''}</div>
              </div>
              <div class="list-item-trailing">${getStatusBadge(b.status)}</div>
            </div>
          `;
        });
      }

      if (!html) {
        html = `
          <div class="empty-state" style="padding: 32px 0;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <h3 class="empty-state-title">No results</h3>
            <p class="empty-state-text">Try a different search term</p>
          </div>
        `;
      }

      searchResults.innerHTML = html;
    } catch (err) {
      searchResults.innerHTML = `<p class="text-center text-danger" style="padding: 32px;">Search failed: ${err.message}</p>`;
    }
  }, 300);

  searchInput.addEventListener('input', () => {
    const val = searchInput.value.trim();
    searchClear.classList.toggle('hidden', !val);
    doSearch(val);
  });
}

// ── Filters ──
function setupFilters() {
  const filterBtn = document.getElementById('header-filter-btn');
  const filterOverlay = document.getElementById('filter-overlay');
  const filterClose = document.getElementById('filter-close-btn');
  const filterBody = document.getElementById('filter-body');
  const filterReset = document.getElementById('filter-reset-btn');
  const filterApply = document.getElementById('filter-apply-btn');

  filterBtn.addEventListener('click', () => {
    renderFilterContent(filterBody);
    filterOverlay.classList.remove('hidden');
  });

  filterClose.addEventListener('click', () => {
    filterOverlay.classList.add('hidden');
  });

  filterOverlay.addEventListener('click', (e) => {
    if (e.target === filterOverlay) {
      filterOverlay.classList.add('hidden');
    }
  });

  filterReset.addEventListener('click', () => {
    setInventoryFilters({});
    filterOverlay.classList.add('hidden');
    router.navigate('/inventory');
  });

  filterApply.addEventListener('click', () => {
    const filters = {};

    // Property type
    const activeType = filterBody.querySelector('[data-filter="type"].active');
    if (activeType) filters.propertyType = activeType.dataset.value;

    // Status
    const activeStatus = filterBody.querySelector('[data-filter="status"].active');
    if (activeStatus) filters.status = activeStatus.dataset.value;

    setInventoryFilters(filters);
    filterOverlay.classList.add('hidden');
    router.navigate('/inventory');
  });
}

function renderFilterContent(container) {
  container.innerHTML = `
    <div class="filter-section">
      <h3 class="filter-section-title">Property Type</h3>
      <div class="filter-chips">
        ${PROPERTY_TYPES.map(t => `<button class="chip" data-filter="type" data-value="${t}">${t}</button>`).join('')}
      </div>
    </div>

    <div class="filter-section">
      <h3 class="filter-section-title">Status</h3>
      <div class="filter-chips">
        ${PROPERTY_STATUSES.map(s => `<button class="chip" data-filter="status" data-value="${s}">${s}</button>`).join('')}
      </div>
    </div>

    <div class="filter-section">
      <h3 class="filter-section-title">Land Size</h3>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Min</label>
          <input type="number" class="form-input" id="filter-min-size" placeholder="Min">
        </div>
        <div class="form-group">
          <label class="form-label">Max</label>
          <input type="number" class="form-input" id="filter-max-size" placeholder="Max">
        </div>
      </div>
    </div>

    <div class="filter-section">
      <h3 class="filter-section-title">Budget (₹)</h3>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Min</label>
          <input type="number" class="form-input" id="filter-min-budget" placeholder="Min">
        </div>
        <div class="form-group">
          <label class="form-label">Max</label>
          <input type="number" class="form-input" id="filter-max-budget" placeholder="Max">
        </div>
      </div>
    </div>

    <div class="filter-section">
      <h3 class="filter-section-title">Features</h3>
      <div class="filter-chips">
        <button class="chip" data-filter="feature" data-value="corner">Corner</button>
        <button class="chip" data-filter="feature" data-value="roadFacing">Road Facing</button>
        <button class="chip" data-filter="feature" data-value="negotiable">Negotiable</button>
      </div>
    </div>
  `;

  // Chip toggle
  container.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      // For type and status, only one active
      const filterGroup = chip.dataset.filter;
      if (filterGroup === 'type' || filterGroup === 'status') {
        container.querySelectorAll(`[data-filter="${filterGroup}"]`).forEach(c => c.classList.remove('active'));
      }
      chip.classList.toggle('active');
    });
  });
}

// ── Network State ──
function setupNetworkState() {
  const bar = document.getElementById('connection-bar');
  const text = document.getElementById('connection-text');

  function updateOnlineStatus() {
    if (navigator.onLine) {
      bar.classList.add('hidden');
    } else {
      bar.className = 'connection-bar offline';
      text.textContent = 'You are offline — changes will sync when connected';
    }
  }

  window.addEventListener('online', () => {
    bar.className = 'connection-bar online';
    text.textContent = 'Back online';
    setTimeout(() => bar.classList.add('hidden'), 2000);
  });

  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();
}

// ── Start App ──
document.addEventListener('DOMContentLoaded', initApp);
