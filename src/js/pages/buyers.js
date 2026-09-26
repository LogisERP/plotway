// Buyers Page
import { getBuyers, addBuyer, updateBuyer, deleteBuyer, getBuyerRequirements, addBuyerRequirement, findMatchingProperties } from '../services/firestore.js';
import { formatPrice, formatDate, getStatusBadge, getMatchBadge, showToast, showConfirm, showBottomSheet, hideBottomSheet, callPhone, openWhatsApp, BUYER_STATUSES, PROPERTY_TYPES } from '../utils.js';
import router from '../router.js';

export async function renderBuyers() {
  const [buyers, requirements] = await Promise.all([
    getBuyers(),
    getBuyerRequirements()
  ]);

  return `
    <div class="tab-bar">
      <button class="tab-item active" data-tab="buyers" id="tab-buyers">Buyers</button>
      <button class="tab-item" data-tab="requirements" id="tab-requirements">Requirements</button>
    </div>

    <div id="tab-content-buyers" class="page-padding">
      ${buyers.length > 0 ? buyers.map(b => renderBuyerCard(b)).join('') : `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/></svg>
          <h3 class="empty-state-title">No buyers yet</h3>
          <p class="empty-state-text">Add your first buyer to start tracking</p>
          <button class="btn btn-primary" onclick="window.__plotway_showAddBuyer()">+ Add Buyer</button>
        </div>
      `}
      <div style="height: 80px;"></div>
    </div>

    <div id="tab-content-requirements" class="page-padding hidden">
      ${requirements.length > 0 ? requirements.map(r => renderRequirementCard(r)).join('') : `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l4.58-4.58c.94-.94.94-2.48 0-3.42L9 5z"/><path d="M6 9h.01"/></svg>
          <h3 class="empty-state-title">No requirements yet</h3>
          <p class="empty-state-text">Add buyer requirements to find matching properties</p>
          <button class="btn btn-primary" onclick="window.__plotway_showAddRequirement()">+ Add Requirement</button>
        </div>
      `}
      <div style="height: 80px;"></div>
    </div>
  `;
}

function renderBuyerCard(buyer) {
  return `
    <div class="card" style="margin-bottom: 12px;" onclick="window.__plotway_showBuyerDetail('${buyer.id}')">
      <div class="card-body">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <h3 style="font-size: 15px; font-weight: 600;">${buyer.name || 'Unnamed'}</h3>
          ${getStatusBadge(buyer.status)}
        </div>
        ${buyer.phone ? `<p style="font-size: 13px; color: var(--text-secondary);">📞 ${buyer.phone}</p>` : ''}
        ${buyer.preferredLocation ? `<p style="font-size: 13px; color: var(--text-secondary);">📍 ${buyer.preferredLocation}</p>` : ''}
        ${buyer.budget ? `<p style="font-size: 13px; color: var(--success);">💰 ${formatPrice(buyer.budget)}</p>` : ''}
        ${buyer.requirement ? `<p style="font-size: 12px; color: var(--text-tertiary); margin-top: 4px;">${buyer.requirement}</p>` : ''}
      </div>
      <div class="card-footer">
        ${buyer.phone ? `
          <button class="btn-icon" onclick="event.stopPropagation(); window.__plotway_call('${buyer.phone}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg></button>
          <button class="btn-icon" onclick="event.stopPropagation(); window.__plotway_whatsapp('${buyer.whatsapp || buyer.phone}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#25d366" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg></button>
        ` : ''}
        <span style="flex: 1;"></span>
        <span style="font-size: 11px; color: var(--text-tertiary);">${formatDate(buyer.createdAt)}</span>
      </div>
    </div>
  `;
}

function renderRequirementCard(req) {
  return `
    <div class="card" style="margin-bottom: 12px;">
      <div class="card-body">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <h3 style="font-size: 15px; font-weight: 600;">${req.buyerName || 'Buyer'}</h3>
        </div>
        ${req.location ? `<p style="font-size: 13px; color: var(--text-secondary);">📍 ${req.location}</p>` : ''}
        ${req.propertyType ? `<p style="font-size: 13px; color: var(--text-secondary);">🏠 ${req.propertyType}</p>` : ''}
        ${req.minSize || req.maxSize ? `<p style="font-size: 13px; color: var(--text-secondary);">📐 ${req.minSize || '0'}–${req.maxSize || '∞'} ${req.landUnit || 'Cent'}</p>` : ''}
        ${req.minBudget || req.maxBudget ? `<p style="font-size: 13px; color: var(--success);">💰 ${formatPrice(req.minBudget)} – ${formatPrice(req.maxBudget)}</p>` : ''}
        ${req.roadWidth ? `<p style="font-size: 13px; color: var(--text-secondary);">🛣️ ${req.roadWidth}ft road</p>` : ''}
        ${req.notes ? `<p style="font-size: 12px; color: var(--text-tertiary); margin-top: 4px;">${req.notes}</p>` : ''}
      </div>
      <div class="card-footer">
        <button class="btn btn-sm btn-primary" onclick="window.__plotway_findMatches('${req.id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          Find Matches
        </button>
        <span style="flex: 1;"></span>
        <button class="btn-icon" onclick="window.__plotway_deleteRequirement('${req.id}')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg>
        </button>
      </div>
    </div>
  `;
}

export function initBuyers() {
  // Tab switching
  document.querySelectorAll('.tab-item').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tabName = tab.dataset.tab;
      document.getElementById('tab-content-buyers').classList.toggle('hidden', tabName !== 'buyers');
      document.getElementById('tab-content-requirements').classList.toggle('hidden', tabName !== 'requirements');
    });
  });

  window.__plotway_call = callPhone;
  window.__plotway_whatsapp = (phone) => openWhatsApp(phone);

  window.__plotway_showAddBuyer = () => {
    showBottomSheet(`
      <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 16px;">Add Buyer</h3>
      <form id="add-buyer-form">
        <div class="form-group"><label class="form-label">Name *</label><input type="text" class="form-input" id="buyer-name" required></div>
        <div class="form-group"><label class="form-label">Phone *</label><input type="tel" class="form-input" id="buyer-phone" required></div>
        <div class="form-group"><label class="form-label">WhatsApp</label><input type="tel" class="form-input" id="buyer-whatsapp"></div>
        <div class="form-group"><label class="form-label">Preferred Location</label><input type="text" class="form-input" id="buyer-location"></div>
        <div class="form-group"><label class="form-label">Budget (₹)</label><input type="number" class="form-input" id="buyer-budget"></div>
        <div class="form-group"><label class="form-label">Requirement</label><textarea class="form-textarea" id="buyer-requirement" rows="2"></textarea></div>
        <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" id="buyer-notes" rows="2"></textarea></div>
        <div class="form-group"><label class="form-label">Status</label><select class="form-select" id="buyer-status">${BUYER_STATUSES.map(s => `<option value="${s}">${s}</option>`).join('')}</select></div>
        <button type="submit" class="btn btn-primary btn-block mt-lg">Add Buyer</button>
      </form>
    `);

    document.getElementById('add-buyer-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await addBuyer({
          name: document.getElementById('buyer-name').value.trim(),
          phone: document.getElementById('buyer-phone').value.trim(),
          whatsapp: document.getElementById('buyer-whatsapp').value.trim(),
          preferredLocation: document.getElementById('buyer-location').value.trim(),
          budget: parseFloat(document.getElementById('buyer-budget').value) || null,
          requirement: document.getElementById('buyer-requirement').value.trim(),
          notes: document.getElementById('buyer-notes').value.trim(),
          status: document.getElementById('buyer-status').value
        });
        hideBottomSheet();
        showToast('Buyer added');
        router.navigate('/buyers');
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      }
    });
  };

  window.__plotway_showBuyerDetail = async (id) => {
    const { getBuyer } = await import('../services/firestore.js');
    const buyer = await getBuyer(id);
    if (!buyer) return;

    showBottomSheet(`
      <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">${buyer.name}</h3>
      <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">${getStatusBadge(buyer.status)}</p>
      <div class="action-menu">
        ${buyer.phone ? `
          <button class="action-menu-item" onclick="window.__plotway_call('${buyer.phone}'); document.getElementById('bottom-sheet-overlay').classList.add('hidden');">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72"/></svg>
            Call ${buyer.name}
          </button>
          <button class="action-menu-item" onclick="window.__plotway_whatsapp('${buyer.whatsapp || buyer.phone}'); document.getElementById('bottom-sheet-overlay').classList.add('hidden');">
            <svg viewBox="0 0 24 24" fill="none" stroke="#25d366" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7"/></svg>
            WhatsApp ${buyer.name}
          </button>
        ` : ''}
        <button class="action-menu-item" onclick="window.__plotway_showAddRequirementFor('${buyer.id}', '${buyer.name}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          Add Requirement
        </button>
        <button class="action-menu-item danger" onclick="window.__plotway_deleteBuyer('${buyer.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg>
          Delete Buyer
        </button>
      </div>
    `);
  };

  window.__plotway_showAddRequirement = () => showAddRequirementForm();
  window.__plotway_showAddRequirementFor = (buyerId, buyerName) => showAddRequirementForm(buyerId, buyerName);

  window.__plotway_deleteBuyer = async (id) => {
    hideBottomSheet();
    const confirmed = await showConfirm('Delete Buyer', 'Are you sure?', 'Delete', true);
    if (confirmed) {
      await deleteBuyer(id);
      showToast('Buyer deleted');
      router.navigate('/buyers');
    }
  };

  window.__plotway_deleteRequirement = async (id) => {
    const { deleteBuyerRequirement } = await import('../services/firestore.js');
    const confirmed = await showConfirm('Delete Requirement', 'Are you sure?', 'Delete', true);
    if (confirmed) {
      await deleteBuyerRequirement(id);
      showToast('Requirement deleted');
      router.navigate('/buyers');
    }
  };

  // Find matching properties
  window.__plotway_findMatches = async (reqId) => {
    const { getBuyerRequirement } = await import('../services/firestore.js');
    const req = await getBuyerRequirement(reqId);
    if (!req) return;

    showBottomSheet(`<div class="loading-spinner"><div class="spinner"></div><span class="loading-text">Finding matches...</span></div>`);

    const matches = await findMatchingProperties(req);

    if (matches.length === 0) {
      showBottomSheet(`
        <div class="empty-state" style="padding: 24px 0;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <h3 class="empty-state-title">No matches found</h3>
          <p class="empty-state-text">No available properties match this requirement</p>
        </div>
      `);
      return;
    }

    showBottomSheet(`
      <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">Matching Properties</h3>
      <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">${matches.length} match${matches.length > 1 ? 'es' : ''} found</p>
      <div style="max-height: 60vh; overflow-y: auto;">
        ${matches.map(m => `
          <div class="card" style="margin-bottom: 12px;" onclick="location.hash='/property/${m.id}'; document.getElementById('bottom-sheet-overlay').classList.add('hidden');">
            <div class="card-body">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-size: 12px; color: var(--text-tertiary); font-weight: 600;">${m.propertyCode}</span>
                ${getMatchBadge(m.matchScore.level)}
              </div>
              <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">
                ${m.landDetails?.landSize || ''} ${m.landDetails?.landUnit || 'Cent'} ${m.propertyType || ''}
              </h4>
              <p style="font-size: 12px; color: var(--text-secondary);">📍 ${[m.location?.area || m.location?.village, m.location?.taluk].filter(Boolean).join(', ') || 'Unknown'}</p>
              <p style="font-size: 14px; font-weight: 700; color: var(--success); margin-top: 4px;">${formatPrice(m.price?.expectedPrice)}</p>
              <div class="match-reasons" style="margin-top: 8px;">
                ${m.matchScore.factors.map(f => `
                  <span class="match-reason ${f.matched ? '' : 'miss'}">
                    ${f.matched ? '✓' : '✗'} ${f.factor}
                  </span>
                `).join('')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `);
  };
}

function showAddRequirementForm(buyerId = '', buyerName = '') {
  hideBottomSheet();
  setTimeout(() => {
    showBottomSheet(`
      <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 16px;">Add Buyer Requirement</h3>
      <form id="add-req-form">
        <div class="form-group"><label class="form-label">Buyer Name *</label><input type="text" class="form-input" id="req-buyerName" value="${buyerName}" required></div>
        <input type="hidden" id="req-buyerId" value="${buyerId}">
        <div class="form-group"><label class="form-label">Location</label><input type="text" class="form-input" id="req-location" placeholder="e.g., Thirumangalam"></div>
        <div class="form-group"><label class="form-label">Property Type</label><select class="form-select" id="req-propertyType"><option value="">Any</option>${PROPERTY_TYPES.map(t => `<option value="${t}">${t}</option>`).join('')}</select></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Min Size</label><input type="number" step="any" class="form-input" id="req-minSize"></div>
          <div class="form-group"><label class="form-label">Max Size</label><input type="number" step="any" class="form-input" id="req-maxSize"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Min Budget (₹)</label><input type="number" class="form-input" id="req-minBudget"></div>
          <div class="form-group"><label class="form-label">Max Budget (₹)</label><input type="number" class="form-input" id="req-maxBudget"></div>
        </div>
        <div class="form-group"><label class="form-label">Road Width (ft)</label><input type="number" class="form-input" id="req-roadWidth"></div>
        <div style="display: flex; flex-wrap: wrap; gap: 16px;">
          <label class="form-checkbox"><input type="checkbox" id="req-corner"><span>Corner Required</span></label>
          <label class="form-checkbox"><input type="checkbox" id="req-roadFacing"><span>Road Facing</span></label>
        </div>
        <div class="form-group mt-lg"><label class="form-label">Notes</label><textarea class="form-textarea" id="req-notes" rows="2"></textarea></div>
        <button type="submit" class="btn btn-primary btn-block mt-lg">Save Requirement</button>
      </form>
    `);

    document.getElementById('add-req-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await addBuyerRequirement({
          buyerId: document.getElementById('req-buyerId').value,
          buyerName: document.getElementById('req-buyerName').value.trim(),
          location: document.getElementById('req-location').value.trim(),
          propertyType: document.getElementById('req-propertyType').value,
          minSize: parseFloat(document.getElementById('req-minSize').value) || null,
          maxSize: parseFloat(document.getElementById('req-maxSize').value) || null,
          minBudget: parseFloat(document.getElementById('req-minBudget').value) || null,
          maxBudget: parseFloat(document.getElementById('req-maxBudget').value) || null,
          roadWidth: parseFloat(document.getElementById('req-roadWidth').value) || null,
          cornerRequired: document.getElementById('req-corner').checked,
          roadFacingRequired: document.getElementById('req-roadFacing').checked,
          notes: document.getElementById('req-notes').value.trim()
        });
        hideBottomSheet();
        showToast('Requirement saved');
        router.navigate('/buyers');
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      }
    });
  }, 300);
}
