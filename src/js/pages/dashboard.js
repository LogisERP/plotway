// Dashboard Page
import { getPropertyStats, getRecentProperties, getUpcomingSiteVisits, getBuyerRequirements } from '../services/firestore.js';
import { formatPrice, timeAgo, getStatusBadge } from '../utils.js';
import router from '../router.js';

export async function renderDashboard() {
  const [stats, recent, visits, requirements] = await Promise.all([
    getPropertyStats(),
    getRecentProperties(5),
    getUpcomingSiteVisits(3).catch(() => []),
    getBuyerRequirements().catch(() => [])
  ]);

  const recentReqs = requirements.slice(0, 3);

  return `
    <div class="dashboard-welcome">
      <p class="dashboard-greeting">Welcome back,</p>
      <h2 class="dashboard-title">Plotway Dashboard</h2>
    </div>

    <!-- Stats Grid -->
    <div class="stat-grid">
      <div class="stat-card stat-total" data-action="filter-status" data-status="All">
        <div class="stat-value">${stats.total}</div>
        <div class="stat-label">Total</div>
      </div>
      <div class="stat-card stat-available" data-action="filter-status" data-status="Available">
        <div class="stat-value">${stats.available}</div>
        <div class="stat-label">Available</div>
      </div>
      <div class="stat-card stat-follow-up" data-action="filter-status" data-status="Follow Up">
        <div class="stat-value">${stats.followUp}</div>
        <div class="stat-label">Follow Up</div>
      </div>
      <div class="stat-card stat-negotiation" data-action="filter-status" data-status="Negotiation">
        <div class="stat-value">${stats.negotiation}</div>
        <div class="stat-label">Negotiation</div>
      </div>
      <div class="stat-card stat-reserved" data-action="filter-status" data-status="Reserved">
        <div class="stat-value">${stats.reserved}</div>
        <div class="stat-label">Reserved</div>
      </div>
      <div class="stat-card stat-sold" data-action="filter-status" data-status="Sold">
        <div class="stat-value">${stats.sold}</div>
        <div class="stat-label">Sold</div>
      </div>
    </div>

    <!-- Recently Added -->
    <div class="section">
      <div class="section-header">
        <h3 class="section-title">Recently Added</h3>
        <a class="section-link" href="#/inventory">View All →</a>
      </div>
      ${recent.length > 0 ? `
        <div class="scroll-cards">
          ${recent.map(p => renderRecentCard(p)).join('')}
        </div>
      ` : `
        <div class="empty-state" style="padding: var(--space-2xl) 0;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <h3 class="empty-state-title">No properties yet</h3>
          <p class="empty-state-text">Start by adding your first property to the inventory</p>
          <button class="btn btn-primary" onclick="location.hash='/property/add'">+ Add Property</button>
        </div>
      `}
    </div>

    <!-- Upcoming Site Visits -->
    ${visits.length > 0 ? `
    <div class="section">
      <div class="section-header">
        <h3 class="section-title">Upcoming Site Visits</h3>
        <a class="section-link" href="#/site-visits">View All →</a>
      </div>
      <div style="padding: 0 var(--space-lg);">
        ${visits.map(v => `
          <div class="list-item" onclick="location.hash='/site-visit/${v.id}'">
            <div class="list-item-avatar" style="background: rgba(6,182,212,0.15); color: #22d3ee;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
            </div>
            <div class="list-item-content">
              <div class="list-item-title">${v.buyerName || 'Buyer'} — ${v.propertyCode || 'Property'}</div>
              <div class="list-item-subtitle">${v.date || ''} ${v.time || ''}</div>
            </div>
            <div class="list-item-trailing">
              ${getStatusBadge(v.status)}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <!-- Recent Buyer Requirements -->
    ${recentReqs.length > 0 ? `
    <div class="section">
      <div class="section-header">
        <h3 class="section-title">Buyer Requirements</h3>
        <a class="section-link" href="#/buyers">View All →</a>
      </div>
      <div style="padding: 0 var(--space-lg);">
        ${recentReqs.map(r => `
          <div class="list-item" onclick="location.hash='/buyer-requirement/${r.id}'">
            <div class="list-item-avatar" style="background: rgba(168,85,247,0.15); color: #c084fc;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/></svg>
            </div>
            <div class="list-item-content">
              <div class="list-item-title">${r.buyerName || 'Buyer'}</div>
              <div class="list-item-subtitle">${r.location || ''} • ${r.propertyType || ''} • ${formatPrice(r.maxBudget)}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <!-- Quick Add Button -->
    <div style="padding: var(--space-2xl) var(--space-lg); padding-bottom: var(--space-4xl);">
      <button class="btn btn-primary btn-lg btn-block" onclick="location.hash='/property/add'" id="dashboard-add-property-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
        Add New Property
      </button>
    </div>
  `;
}

function renderRecentCard(property) {
  const photo = property.photos?.[0]?.url;
  const location = property.location;
  const locationStr = [location?.area || location?.village, location?.taluk].filter(Boolean).join(', ') || 'Location not set';

  return `
    <div class="property-card" onclick="location.hash='/property/${property.id}'" style="min-width: 260px;">
      <div class="property-card-image" style="height: 140px;">
        ${photo
          ? `<img src="${photo}" alt="${property.title || property.propertyType || 'Property'}" loading="lazy">`
          : `<div class="no-image">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
              <span style="font-size: 11px;">No Photo</span>
            </div>`
        }
        <div class="property-card-badge">${getStatusBadge(property.status)}</div>
        <div class="property-card-code">${property.propertyCode || ''}</div>
      </div>
      <div class="property-card-body" style="padding: 12px;">
        <div class="property-card-title">${property.landDetails?.landSize || ''} ${property.landDetails?.landUnit || 'Cent'} ${property.propertyType || ''}</div>
        <div class="property-card-location">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${locationStr}
        </div>
        <div class="property-card-price">${formatPrice(property.price?.expectedPrice)}</div>
      </div>
    </div>
  `;
}

export function initDashboard() {
  // Click handlers for stat cards
  document.querySelectorAll('[data-action="filter-status"]').forEach(card => {
    card.addEventListener('click', () => {
      const status = card.dataset.status;
      router.navigate(`/inventory?status=${status}`);
    });
  });
}
