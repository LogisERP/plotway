// Inventory Page — Property Listing
import { getProperties, updateProperty, deleteProperty } from '../services/firestore.js';
import { formatPrice, getStatusBadge, showToast, showConfirm, showBottomSheet, hideBottomSheet, callPhone, openWhatsApp, generateShareText, PROPERTY_TYPES, PROPERTY_STATUSES } from '../utils.js';
import router from '../router.js';

let currentFilters = {};

export async function renderInventory(params = {}) {
  // Parse query params for status filter
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const statusFilter = urlParams.get('status') || params.status || '';

  if (statusFilter && statusFilter !== 'All') {
    currentFilters.status = statusFilter;
  }

  const properties = await getProperties(currentFilters);

  return `
    <div class="page-padding">
      <!-- Filter Chips -->
      <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 12px; scrollbar-width: none;">
        <button class="chip ${!currentFilters.status || currentFilters.status === 'All' ? 'active' : ''}" data-filter-status="All">All</button>
        ${PROPERTY_STATUSES.map(s => `
          <button class="chip ${currentFilters.status === s ? 'active' : ''}" data-filter-status="${s}">${s}</button>
        `).join('')}
      </div>

      <!-- Property Count -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <span class="text-muted" style="font-size: 13px;">${properties.length} ${properties.length === 1 ? 'property' : 'properties'}</span>
      </div>

      <!-- Property List -->
      ${properties.length > 0 ? `
        <div class="property-list-grid" style="display: flex; flex-direction: column; gap: 16px;">
          ${properties.map(p => renderPropertyCard(p)).join('')}
        </div>
      ` : `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <h3 class="empty-state-title">No properties found</h3>
          <p class="empty-state-text">${currentFilters.status ? `No ${currentFilters.status} properties` : 'Start building your inventory'}</p>
          <button class="btn btn-primary" onclick="location.hash='/property/add'">+ Add Property</button>
        </div>
      `}

      <!-- Bottom spacing -->
      <div style="height: 80px;"></div>
    </div>
  `;
}

function renderPropertyCard(property) {
  const photo = property.photos?.[0]?.url;
  const location = property.location || {};
  const locationStr = [location.area || location.village, location.taluk].filter(Boolean).join(', ') || 'Location not set';
  const landDetails = property.landDetails || {};

  return `
    <div class="property-card" id="property-card-${property.id}">
      <div class="property-card-image" onclick="location.hash='/property/${property.id}'">
        ${photo
          ? `<img src="${photo}" alt="${property.propertyType || 'Property'}" loading="lazy">`
          : `<div class="no-image">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
              <span style="font-size: 11px;">No Photo</span>
            </div>`
        }
        <div class="property-card-badge">${getStatusBadge(property.status)}</div>
        <div class="property-card-code">${property.propertyCode || ''}</div>
      </div>
      <div class="property-card-body" onclick="location.hash='/property/${property.id}'">
        <div class="property-card-title">
          ${landDetails.landSize || ''} ${landDetails.landUnit || 'Cent'} ${property.propertyType || ''}
        </div>
        <div class="property-card-location">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${locationStr}
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div class="property-card-price">${formatPrice(property.price?.expectedPrice)}</div>
          ${landDetails.landSize && property.price?.pricePerUnit ? `
            <span style="font-size: 12px; color: var(--text-tertiary);">
              ${formatPrice(property.price.pricePerUnit)}/${landDetails.landUnit || 'Cent'}
            </span>
          ` : ''}
        </div>
      </div>
      <div class="property-card-actions">
        <button class="btn-icon" title="View" onclick="location.hash='/property/${property.id}'">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
        <button class="btn-icon" title="Edit" onclick="location.hash='/property/edit/${property.id}'">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.85 0 114 4L7.5 20.5 2 22l1.5-5.5z"/></svg>
        </button>
        ${property.owner?.phone ? `
          <button class="btn-icon" title="Call" onclick="event.stopPropagation(); window.__plotway_call('${property.owner.phone}')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
          </button>
          <button class="btn-icon" title="WhatsApp" onclick="event.stopPropagation(); window.__plotway_whatsapp('${property.owner.phone}')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#25d366" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
          </button>
        ` : ''}
        <button class="btn-icon" title="Share" onclick="event.stopPropagation(); window.__plotway_share('${property.id}')" style="margin-left: auto;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98"/><path d="M15.41 6.51l-6.82 3.98"/></svg>
        </button>
        <button class="btn-icon" title="More" onclick="event.stopPropagation(); window.__plotway_propertyMenu('${property.id}', '${property.status}')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </button>
      </div>
    </div>
  `;
}

export function initInventory() {
  // Status filter chips
  document.querySelectorAll('[data-filter-status]').forEach(chip => {
    chip.addEventListener('click', () => {
      const status = chip.dataset.filterStatus;
      if (status === 'All') {
        delete currentFilters.status;
      } else {
        currentFilters.status = status;
      }
      router.navigate('/inventory');
    });
  });

  // Global action handlers
  window.__plotway_call = (phone) => callPhone(phone);
  window.__plotway_whatsapp = (phone) => openWhatsApp(phone);

  window.__plotway_share = async (id) => {
    try {
      const { getProperty } = await import('../services/firestore.js');
      const property = await getProperty(id);
      if (!property) return;

      const text = generateShareText(property);

      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        showToast('Property details copied to clipboard');
      }
    } catch (e) {
      console.error('Share error:', e);
    }
  };

  window.__plotway_propertyMenu = (id, currentStatus) => {
    showBottomSheet(`
      <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 16px;">Property Actions</h3>
      <div class="action-menu">
        <button class="action-menu-item" onclick="location.hash='/property/${id}'; document.getElementById('bottom-sheet-overlay').classList.add('hidden')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          View Details
        </button>
        <button class="action-menu-item" onclick="location.hash='/property/edit/${id}'; document.getElementById('bottom-sheet-overlay').classList.add('hidden')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.85 0 114 4L7.5 20.5 2 22l1.5-5.5z"/></svg>
          Edit Property
        </button>
        <button class="action-menu-item" onclick="window.__plotway_changeStatus('${id}', '${currentStatus}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z"/><path d="M12 6v6l4 2"/></svg>
          Change Status
        </button>
        <button class="action-menu-item danger" onclick="window.__plotway_deleteProperty('${id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          Delete Property
        </button>
      </div>
    `);
  };

  window.__plotway_changeStatus = (id, currentStatus) => {
    hideBottomSheet();
    const statuses = PROPERTY_STATUSES.filter(s => s !== currentStatus);
    showBottomSheet(`
      <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 16px;">Change Status</h3>
      <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">Current: ${getStatusBadge(currentStatus)}</p>
      <div class="action-menu">
        ${statuses.map(s => `
          <button class="action-menu-item" onclick="window.__plotway_setStatus('${id}', '${s}')">
            ${getStatusBadge(s)}
            <span>${s}</span>
          </button>
        `).join('')}
      </div>
    `);
  };

  window.__plotway_setStatus = async (id, status) => {
    try {
      await updateProperty(id, { status });
      hideBottomSheet();
      showToast(`Status changed to ${status}`);
      router.navigate('/inventory');
    } catch (e) {
      showToast('Failed to update status', 'error');
    }
  };

  window.__plotway_deleteProperty = async (id) => {
    hideBottomSheet();
    const confirmed = await showConfirm(
      'Delete Property',
      'Are you sure you want to delete this property? This action cannot be undone.',
      'Delete',
      true
    );
    if (confirmed) {
      try {
        await deleteProperty(id);
        showToast('Property deleted');
        router.navigate('/inventory');
      } catch (e) {
        showToast('Failed to delete property', 'error');
      }
    }
  };
}

export function getInventoryFilters() {
  return currentFilters;
}

export function setInventoryFilters(filters) {
  currentFilters = { ...filters };
}
