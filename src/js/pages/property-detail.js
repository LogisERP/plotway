// Property Detail Page
import { getProperty, updateProperty, deleteProperty } from '../services/firestore.js';
import { formatPrice, formatDate, getStatusBadge, showToast, showConfirm, showBottomSheet, hideBottomSheet, callPhone, openWhatsApp, openMap, generateShareText, PROPERTY_STATUSES } from '../utils.js';
import router from '../router.js';

export async function renderPropertyDetail(params) {
  const property = await getProperty(params.id);
  if (!property) {
    return `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
        <h3 class="empty-state-title">Property not found</h3>
        <p class="empty-state-text">This property may have been deleted</p>
        <button class="btn btn-primary" onclick="location.hash='/inventory'">Go to Inventory</button>
      </div>
    `;
  }

  const loc = property.location || {};
  const land = property.landDetails || {};
  const price = property.price || {};
  const owner = property.owner || {};
  const docs = property.documents || {};
  const photoList = property.photos || [];
  const primaryPhoto = photoList.find(p => p.isPrimary) || photoList[0];

  return `
    <!-- Photo Gallery -->
    <div class="photo-gallery" id="property-gallery">
      ${primaryPhoto ? `
        <img src="${primaryPhoto.url}" alt="${property.title || property.propertyType}" id="gallery-image">
      ` : `
        <div class="no-image" style="height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 8px;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
          <span style="color: var(--text-tertiary); font-size: 13px;">No photos</span>
        </div>
      `}
      ${photoList.length > 1 ? `
        <div class="photo-gallery-counter">${photoList.length} photos</div>
        <button class="photo-gallery-nav prev" id="gallery-prev"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg></button>
        <button class="photo-gallery-nav next" id="gallery-next"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg></button>
      ` : ''}
    </div>

    <!-- Property Header -->
    <div class="detail-section">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-size: 13px; color: var(--text-tertiary); font-weight: 600;">${property.propertyCode}</span>
        ${getStatusBadge(property.status)}
      </div>
      <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">
        ${land.landSize || ''} ${land.landUnit || 'Cent'} ${property.propertyType || ''}
      </h2>
      ${property.title ? `<p style="color: var(--text-secondary); font-size: 14px;">${property.title}</p>` : ''}
      <div style="display: flex; align-items: center; gap: 6px; margin-top: 8px; color: var(--text-secondary);">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span style="font-size: 13px;">${[loc.area || loc.village, loc.taluk, loc.district].filter(Boolean).join(', ') || 'Location not set'}</span>
      </div>
      ${price.expectedPrice ? `
        <div style="margin-top: 12px;">
          <span class="price-tag" style="font-size: 22px;">${formatPrice(price.expectedPrice)}</span>
          ${price.pricePerUnit ? `<span style="color: var(--text-tertiary); font-size: 12px; margin-left: 8px;">${formatPrice(price.pricePerUnit)}/${land.landUnit || 'Cent'}</span>` : ''}
          ${price.negotiable ? `<span class="badge badge-follow-up" style="margin-left: 8px;">Negotiable</span>` : ''}
        </div>
      ` : ''}
    </div>

    <!-- Quick Actions -->
    <div class="detail-actions" data-property-id="${property.id}">
      <button class="detail-action-btn action-call" onclick="window.__plotway_callOwner()" id="btn-call-owner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
        Call
      </button>
      <button class="detail-action-btn action-whatsapp" onclick="window.__plotway_whatsappOwner()" id="btn-whatsapp-owner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
        WhatsApp
      </button>
      <button class="detail-action-btn action-share" onclick="window.__plotway_shareProperty()" id="btn-share-property">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98"/><path d="M15.41 6.51l-6.82 3.98"/></svg>
        Share
      </button>
      <button class="detail-action-btn action-map" onclick="window.__plotway_openMap()" id="btn-open-map">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        Map
      </button>
    </div>

    <!-- Location Details -->
    ${loc.address || loc.area || loc.village ? `
    <div class="detail-section">
      <h3 class="detail-section-title">Location</h3>
      ${loc.address ? `<div class="detail-row"><span class="detail-label">Address</span><span class="detail-value">${loc.address}</span></div>` : ''}
      ${loc.area ? `<div class="detail-row"><span class="detail-label">Area</span><span class="detail-value">${loc.area}</span></div>` : ''}
      ${loc.village ? `<div class="detail-row"><span class="detail-label">Village</span><span class="detail-value">${loc.village}</span></div>` : ''}
      ${loc.taluk ? `<div class="detail-row"><span class="detail-label">Taluk</span><span class="detail-value">${loc.taluk}</span></div>` : ''}
      ${loc.district ? `<div class="detail-row"><span class="detail-label">District</span><span class="detail-value">${loc.district}</span></div>` : ''}
      ${loc.pincode ? `<div class="detail-row"><span class="detail-label">Pincode</span><span class="detail-value">${loc.pincode}</span></div>` : ''}
    </div>
    ` : ''}

    <!-- Land Details -->
    <div class="detail-section">
      <h3 class="detail-section-title">Land Details</h3>
      <div class="detail-row"><span class="detail-label">Size</span><span class="detail-value">${land.landSize || '—'} ${land.landUnit || 'Cent'}</span></div>
      ${land.roadWidth ? `<div class="detail-row"><span class="detail-label">Road Width</span><span class="detail-value">${land.roadWidth} Feet</span></div>` : ''}
      ${land.facing ? `<div class="detail-row"><span class="detail-label">Facing</span><span class="detail-value">${land.facing}</span></div>` : ''}
      ${land.cornerProperty ? `<div class="detail-row"><span class="detail-label">Corner</span><span class="detail-value badge badge-available">Yes</span></div>` : ''}
      ${land.roadFacing ? `<div class="detail-row"><span class="detail-label">Road Facing</span><span class="detail-value badge badge-available">Yes</span></div>` : ''}
      ${land.boundaryDetails ? `<div class="detail-row" style="flex-direction: column; gap: 4px;"><span class="detail-label">Boundaries</span><span class="detail-value" style="text-align: left;">${land.boundaryDetails}</span></div>` : ''}
    </div>

    <!-- Owner -->
    ${owner.name || owner.phone ? `
    <div class="detail-section">
      <h3 class="detail-section-title">Owner</h3>
      ${owner.name ? `<div class="detail-row"><span class="detail-label">Name</span><span class="detail-value">${owner.name}</span></div>` : ''}
      ${owner.phone ? `<div class="detail-row"><span class="detail-label">Phone</span><span class="detail-value"><a href="tel:${owner.phone}">${owner.phone}</a></span></div>` : ''}
      ${owner.alternatePhone ? `<div class="detail-row"><span class="detail-label">Alt Phone</span><span class="detail-value"><a href="tel:${owner.alternatePhone}">${owner.alternatePhone}</a></span></div>` : ''}
      ${owner.whatsapp ? `<div class="detail-row"><span class="detail-label">WhatsApp</span><span class="detail-value">${owner.whatsapp}</span></div>` : ''}
    </div>
    ` : ''}

    <!-- Documents -->
    ${Object.entries(docs).some(([k, v]) => v === true) ? `
    <div class="detail-section">
      <h3 class="detail-section-title">Documents</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 8px;">
        ${docs.patta ? '<span class="chip active">Patta</span>' : ''}
        ${docs.chitta ? '<span class="chip active">Chitta</span>' : ''}
        ${docs.ec ? '<span class="chip active">EC</span>' : ''}
        ${docs.saleDeed ? '<span class="chip active">Sale Deed</span>' : ''}
        ${docs.parentDocuments ? '<span class="chip active">Parent Docs</span>' : ''}
        ${docs.fmb ? '<span class="chip active">FMB</span>' : ''}
        ${docs.taxReceipt ? '<span class="chip active">Tax Receipt</span>' : ''}
        ${docs.approval ? '<span class="chip active">Approval</span>' : ''}
      </div>
      ${docs.other ? `<p style="margin-top: 8px; font-size: 13px; color: var(--text-secondary);">${docs.other}</p>` : ''}
    </div>
    ` : ''}

    <!-- Notes -->
    ${property.notes ? `
    <div class="detail-section">
      <h3 class="detail-section-title">Notes</h3>
      <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.6;">${property.notes}</p>
    </div>
    ` : ''}

    <!-- Map -->
    ${loc.latitude && loc.longitude ? `
    <div class="detail-section">
      <h3 class="detail-section-title">Location on Map</h3>
      <div class="map-container" id="property-map"></div>
    </div>
    ` : ''}

    <!-- Meta -->
    <div class="detail-section" style="border-bottom: none;">
      <div class="detail-row"><span class="detail-label">Created</span><span class="detail-value">${formatDate(property.createdAt)}</span></div>
      <div class="detail-row"><span class="detail-label">Updated</span><span class="detail-value">${formatDate(property.updatedAt)}</span></div>
    </div>

    <!-- Bottom Actions -->
    <div style="padding: 16px 24px 100px; display: flex; gap: 12px;">
      <button class="btn btn-primary" style="flex: 1;" onclick="location.hash='/property/edit/${property.id}'" id="btn-edit-property">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.85 0 114 4L7.5 20.5 2 22l1.5-5.5z"/></svg>
        Edit
      </button>
      <button class="btn btn-secondary" onclick="window.__plotway_changeStatusDetail('${property.id}', '${property.status}')" id="btn-change-status">
        Status
      </button>
      <button class="btn btn-danger" onclick="window.__plotway_deletePropertyDetail('${property.id}')" id="btn-delete-property">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg>
      </button>
    </div>
  `;
}

export function initPropertyDetail(params) {
  // Load property data for actions
  getProperty(params.id).then(property => {
    if (!property) return;
    const owner = property.owner || {};
    const loc = property.location || {};

    // Gallery navigation
    const photos = property.photos || [];
    let currentIndex = 0;

    const prevBtn = document.getElementById('gallery-prev');
    const nextBtn = document.getElementById('gallery-next');
    const galleryImg = document.getElementById('gallery-image');

    if (prevBtn && nextBtn && galleryImg && photos.length > 1) {
      prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + photos.length) % photos.length;
        galleryImg.src = photos[currentIndex].url;
      });
      nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % photos.length;
        galleryImg.src = photos[currentIndex].url;
      });
    }

    // Action handlers
    window.__plotway_callOwner = () => {
      callPhone(owner.phone || owner.whatsapp);
    };

    window.__plotway_whatsappOwner = () => {
      openWhatsApp(owner.whatsapp || owner.phone);
    };

    window.__plotway_shareProperty = async () => {
      const text = generateShareText(property);
      try {
        if (navigator.share) {
          await navigator.share({ text });
        } else {
          await navigator.clipboard.writeText(text);
          showToast('Property details copied');
        }
      } catch (e) { /* user cancelled */ }
    };

    window.__plotway_openMap = () => {
      if (loc.latitude && loc.longitude) {
        openMap(loc.latitude, loc.longitude);
      } else {
        showToast('Location not available', 'warning');
      }
    };

    window.__plotway_changeStatusDetail = (id, currentStatus) => {
      const statuses = PROPERTY_STATUSES.filter(s => s !== currentStatus);
      showBottomSheet(`
        <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 16px;">Change Status</h3>
        <div class="action-menu">
          ${statuses.map(s => `
            <button class="action-menu-item" onclick="window.__plotway_setStatusDetail('${id}', '${s}')">
              ${getStatusBadge(s)}
              <span>${s}</span>
            </button>
          `).join('')}
        </div>
      `);
    };

    window.__plotway_setStatusDetail = async (id, status) => {
      try {
        await updateProperty(id, { status });
        hideBottomSheet();
        showToast(`Status changed to ${status}`);
        router.navigate(`/property/${id}`);
      } catch (e) {
        showToast('Failed to update status', 'error');
      }
    };

    window.__plotway_deletePropertyDetail = async (id) => {
      const confirmed = await showConfirm(
        'Delete Property',
        'Are you sure? This action cannot be undone.',
        'Delete',
        true
      );
      if (confirmed) {
        try {
          await deleteProperty(id);
          showToast('Property deleted');
          router.navigate('/inventory');
        } catch (e) {
          showToast('Failed to delete', 'error');
        }
      }
    };

    // Initialize Leaflet map if coordinates exist
    if (loc.latitude && loc.longitude) {
      initMap(loc.latitude, loc.longitude);
    }
  });
}

function initMap(lat, lng) {
  try {
    // Dynamically load Leaflet
    const mapEl = document.getElementById('property-map');
    if (!mapEl || typeof L === 'undefined') return;

    const map = L.map(mapEl).setView([lat, lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19
    }).addTo(map);

    L.marker([lat, lng]).addTo(map);

    // Fix map size after rendering
    setTimeout(() => map.invalidateSize(), 300);
  } catch (e) {
    console.warn('Map init error:', e);
  }
}
