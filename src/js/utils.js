// Utility functions

/**
 * Format price in Indian format (₹)
 */
export function formatPrice(amount) {
  if (!amount && amount !== 0) return '—';
  const num = parseFloat(amount);
  if (isNaN(num)) return '—';

  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} Lakhs`;
  } else if (num >= 1000) {
    return `₹${(num / 1000).toFixed(1)}K`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
}

/**
 * Format date
 */
export function formatDate(timestamp) {
  if (!timestamp) return '—';
  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date(timestamp);
  }

  if (isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Format relative time
 */
export function timeAgo(timestamp) {
  if (!timestamp) return '';
  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else {
    date = new Date(timestamp);
  }

  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) return formatDate(timestamp);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

/**
 * Show toast notification
 */
export function showToast(message, type = 'success', duration = 3000) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Show confirmation modal
 */
export function showConfirm(title, message, confirmText = 'Confirm', danger = false) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');

    content.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
      </div>
      <div class="modal-body">
        <p class="text-muted">${message}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" id="modal-cancel">Cancel</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="modal-confirm">${confirmText}</button>
      </div>
    `;

    overlay.classList.remove('hidden');

    document.getElementById('modal-cancel').onclick = () => {
      overlay.classList.add('hidden');
      resolve(false);
    };

    document.getElementById('modal-confirm').onclick = () => {
      overlay.classList.add('hidden');
      resolve(true);
    };

    overlay.onclick = (e) => {
      if (e.target === overlay) {
        overlay.classList.add('hidden');
        resolve(false);
      }
    };
  });
}

/**
 * Show bottom sheet
 */
export function showBottomSheet(content) {
  const overlay = document.getElementById('bottom-sheet-overlay');
  const sheetContent = document.getElementById('bottom-sheet-content');

  sheetContent.innerHTML = content;
  overlay.classList.remove('hidden');

  overlay.onclick = (e) => {
    if (e.target === overlay) {
      hideBottomSheet();
    }
  };
}

export function hideBottomSheet() {
  const overlay = document.getElementById('bottom-sheet-overlay');
  overlay.classList.add('hidden');
}

/**
 * Get status badge HTML
 */
export function getStatusBadge(status) {
  const classMap = {
    'Available': 'badge-available',
    'Follow Up': 'badge-follow-up',
    'Negotiation': 'badge-negotiation',
    'Reserved': 'badge-reserved',
    'Sold': 'badge-sold',
    'Not Available': 'badge-not-available',
    'New': 'badge-new',
    'Searching': 'badge-searching',
    'Properties Shared': 'badge-shared',
    'Site Visit': 'badge-site-visit',
    'Closed': 'badge-closed',
    'Lost': 'badge-lost',
    'Scheduled': 'badge-available',
    'Completed': 'badge-closed',
    'Cancelled': 'badge-sold',
    'Rescheduled': 'badge-follow-up'
  };

  return `<span class="badge ${classMap[status] || 'badge-not-available'}">${status}</span>`;
}

/**
 * Get match badge HTML
 */
export function getMatchBadge(level) {
  const classMap = {
    'Exact Match': 'badge-exact-match',
    'Good Match': 'badge-good-match',
    'Partial Match': 'badge-partial-match'
  };
  return `<span class="badge ${classMap[level] || 'badge-partial-match'}">${level}</span>`;
}

/**
 * Generate share text for a property
 */
export function generateShareText(property) {
  const lines = ['📍 Plotway Property', ''];

  if (property.propertyType) lines.push(`Property: ${property.propertyType}`);

  const location = property.location;
  if (location) {
    const parts = [location.area, location.village, location.taluk, location.district].filter(Boolean);
    if (parts.length) lines.push(`Location: ${parts.join(', ')}`);
  }

  if (property.landDetails?.landSize) {
    lines.push(`Land: ${property.landDetails.landSize} ${property.landDetails.landUnit || 'Cent'}`);
  }

  if (property.price?.expectedPrice) {
    lines.push(`Price: ${formatPrice(property.price.expectedPrice)}`);
  }

  if (property.landDetails?.roadWidth) {
    lines.push(`Road: ${property.landDetails.roadWidth} Feet`);
  }

  if (property.status) lines.push(`Status: ${property.status}`);

  // Do NOT expose owner information
  return lines.join('\n');
}

/**
 * Open phone dialer
 */
export function callPhone(phone) {
  if (!phone) return;
  window.open(`tel:${phone}`, '_system');
}

/**
 * Open WhatsApp
 */
export function openWhatsApp(phone, message = '') {
  if (!phone) return;
  const cleanPhone = phone.replace(/\D/g, '');
  const fullPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  const url = `https://wa.me/${fullPhone}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
  window.open(url, '_system');
}

/**
 * Open map/navigation
 */
export function openMap(lat, lng) {
  if (!lat || !lng) return;
  window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_system');
}

/**
 * Debounce function
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Property type options
 */
export const PROPERTY_TYPES = [
  'Residential Plot',
  'Agricultural Land',
  'Commercial Land',
  'Industrial Land',
  'House',
  'Apartment',
  'Villa',
  'Other'
];

/**
 * Property status options
 */
export const PROPERTY_STATUSES = [
  'Available',
  'Follow Up',
  'Negotiation',
  'Reserved',
  'Sold',
  'Not Available'
];

/**
 * Buyer status options
 */
export const BUYER_STATUSES = [
  'New',
  'Searching',
  'Properties Shared',
  'Site Visit',
  'Negotiation',
  'Closed',
  'Lost'
];

/**
 * Lead sources
 */
export const LEAD_SOURCES = [
  'WhatsApp',
  'Facebook',
  'Referral',
  'Direct',
  'Website',
  'Other'
];

/**
 * Site visit statuses
 */
export const SITE_VISIT_STATUSES = [
  'Scheduled',
  'Completed',
  'Cancelled',
  'Rescheduled'
];

/**
 * Land units
 */
export const LAND_UNITS = [
  'Cent',
  'Acre',
  'Sq.ft',
  'Sq.m',
  'Ground',
  'Hectare'
];

/**
 * Facing options
 */
export const FACING_OPTIONS = [
  'North',
  'South',
  'East',
  'West',
  'North-East',
  'North-West',
  'South-East',
  'South-West'
];

/**
 * Theme Management (Dark mode default, Light mode optional)
 */
export function getStoredTheme() {
  return localStorage.getItem('plotway_theme') || 'dark';
}

export function setTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    localStorage.setItem('plotway_theme', 'dark');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
    localStorage.setItem('plotway_theme', 'light');
  }
}

export function initTheme() {
  const currentTheme = getStoredTheme();
  setTheme(currentTheme);
}


