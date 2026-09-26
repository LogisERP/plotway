// Site Visits Page
import { getSiteVisits, addSiteVisit, updateSiteVisit, deleteSiteVisit, getBuyers, getProperties } from '../services/firestore.js';
import { formatDate, getStatusBadge, showToast, showConfirm, showBottomSheet, hideBottomSheet, SITE_VISIT_STATUSES } from '../utils.js';
import router from '../router.js';

export async function renderSiteVisits() {
  const visits = await getSiteVisits();

  return `
    <div class="page-padding">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h2 style="font-size: 18px; font-weight: 700;">Site Visits</h2>
        <button class="btn btn-sm btn-primary" onclick="window.__plotway_showAddVisit()">+ Add Visit</button>
      </div>

      ${visits.length > 0 ? visits.map(v => `
        <div class="card" style="margin-bottom: 12px;" onclick="window.__plotway_showVisitDetail('${v.id}')">
          <div class="card-body">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <h3 style="font-size: 15px; font-weight: 600;">${v.buyerName || 'Buyer'}</h3>
              ${getStatusBadge(v.status)}
            </div>
            <p style="font-size: 13px; color: var(--text-secondary);">🏠 ${v.propertyCode || v.propertyId || 'Property'}</p>
            <p style="font-size: 13px; color: var(--text-secondary);">📅 ${v.date || '—'} ${v.time ? '⏰ ' + v.time : ''}</p>
            ${v.notes ? `<p style="font-size: 12px; color: var(--text-tertiary); margin-top: 4px;">${v.notes}</p>` : ''}
          </div>
        </div>
      `).join('') : `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
          <h3 class="empty-state-title">No site visits</h3>
          <p class="empty-state-text">Schedule visits when sharing properties with buyers</p>
        </div>
      `}
      <div style="height: 80px;"></div>
    </div>
  `;
}

export function initSiteVisits() {
  window.__plotway_showAddVisit = () => {
    showBottomSheet(`
      <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 16px;">Schedule Site Visit</h3>
      <form id="add-visit-form">
        <div class="form-group"><label class="form-label">Buyer Name *</label><input type="text" class="form-input" id="visit-buyer" required></div>
        <div class="form-group"><label class="form-label">Property Code</label><input type="text" class="form-input" id="visit-property" placeholder="e.g., PROP-0001"></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Date *</label><input type="date" class="form-input" id="visit-date" required></div>
          <div class="form-group"><label class="form-label">Time</label><input type="time" class="form-input" id="visit-time"></div>
        </div>
        <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" id="visit-notes" rows="2"></textarea></div>
        <button type="submit" class="btn btn-primary btn-block mt-lg">Schedule Visit</button>
      </form>
    `);

    document.getElementById('add-visit-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await addSiteVisit({
          buyerName: document.getElementById('visit-buyer').value.trim(),
          propertyCode: document.getElementById('visit-property').value.trim(),
          date: document.getElementById('visit-date').value,
          time: document.getElementById('visit-time').value,
          notes: document.getElementById('visit-notes').value.trim()
        });
        hideBottomSheet();
        showToast('Visit scheduled');
        router.navigate('/site-visits');
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      }
    });
  };

  window.__plotway_showVisitDetail = async (id) => {
    const visit = await (await import('../services/firestore.js')).getSiteVisit(id);
    if (!visit) return;

    showBottomSheet(`
      <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 16px;">${visit.buyerName} — ${visit.propertyCode || 'Property'}</h3>
      <p style="margin-bottom: 16px;">📅 ${visit.date} ${visit.time ? '⏰ ' + visit.time : ''}<br>${getStatusBadge(visit.status)}</p>
      <div class="action-menu">
        ${SITE_VISIT_STATUSES.map(s => `
          <button class="action-menu-item" onclick="window.__plotway_setVisitStatus('${id}', '${s}')">
            ${getStatusBadge(s)} <span>${s}</span>
          </button>
        `).join('')}
        <div class="divider"></div>
        <button class="action-menu-item danger" onclick="window.__plotway_deleteVisit('${id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg>
          Delete Visit
        </button>
      </div>
    `);
  };

  window.__plotway_setVisitStatus = async (id, status) => {
    await updateSiteVisit(id, { status });
    hideBottomSheet();
    showToast('Visit status updated');
    router.navigate('/site-visits');
  };

  window.__plotway_deleteVisit = async (id) => {
    hideBottomSheet();
    const ok = await showConfirm('Delete Visit', 'Are you sure?', 'Delete', true);
    if (ok) {
      await deleteSiteVisit(id);
      showToast('Visit deleted');
      router.navigate('/site-visits');
    }
  };
}
