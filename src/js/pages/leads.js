// Leads Page
import { getLeads, addLead, updateLead, deleteLead } from '../services/firestore.js';
import { formatPrice, formatDate, getStatusBadge, showToast, showConfirm, showBottomSheet, hideBottomSheet, callPhone, openWhatsApp, LEAD_SOURCES, BUYER_STATUSES } from '../utils.js';
import router from '../router.js';

const LEAD_STATUSES = ['New', 'Contacted', 'Follow Up', 'Interested', 'Not Interested', 'Converted', 'Lost'];

export async function renderLeads() {
  const leads = await getLeads();

  return `
    <div class="page-padding">
      ${leads.length > 0 ? leads.map(l => renderLeadCard(l)).join('') : `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72"/></svg>
          <h3 class="empty-state-title">No leads yet</h3>
          <p class="empty-state-text">Start adding leads to track potential buyers</p>
          <button class="btn btn-primary" onclick="window.__plotway_showAddLead()">+ Add Lead</button>
        </div>
      `}
      <div style="height: 80px;"></div>
    </div>
  `;
}

function renderLeadCard(lead) {
  return `
    <div class="card" style="margin-bottom: 12px;" onclick="window.__plotway_showLeadDetail('${lead.id}')">
      <div class="card-body">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <h3 style="font-size: 15px; font-weight: 600;">${lead.name || 'Unnamed Lead'}</h3>
          ${getStatusBadge(lead.status)}
        </div>
        ${lead.phone ? `<p style="font-size: 13px; color: var(--text-secondary);">📞 ${lead.phone}</p>` : ''}
        ${lead.source ? `<p style="font-size: 12px; color: var(--text-tertiary);">Source: ${lead.source}</p>` : ''}
        ${lead.requirement ? `<p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">${lead.requirement}</p>` : ''}
        ${lead.budget ? `<p style="font-size: 13px; color: var(--success);">💰 ${formatPrice(lead.budget)}</p>` : ''}
        ${lead.location ? `<p style="font-size: 12px; color: var(--text-tertiary);">📍 ${lead.location}</p>` : ''}
        ${lead.followUpDate ? `<p style="font-size: 12px; color: var(--warning);">📅 Follow-up: ${lead.followUpDate}</p>` : ''}
      </div>
      <div class="card-footer">
        ${lead.phone ? `
          <button class="btn-icon" onclick="event.stopPropagation(); window.__plotway_call('${lead.phone}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3"/></svg>
          </button>
          <button class="btn-icon" onclick="event.stopPropagation(); window.__plotway_whatsapp('${lead.phone}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#25d366" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7"/></svg>
          </button>
        ` : ''}
        <span style="flex: 1;"></span>
        <span style="font-size: 11px; color: var(--text-tertiary);">${formatDate(lead.createdAt)}</span>
      </div>
    </div>
  `;
}

export function initLeads() {
  window.__plotway_call = callPhone;
  window.__plotway_whatsapp = (phone) => openWhatsApp(phone);

  window.__plotway_showAddLead = () => {
    showBottomSheet(`
      <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 16px;">Add Lead</h3>
      <form id="add-lead-form">
        <div class="form-group"><label class="form-label">Name *</label><input type="text" class="form-input" id="lead-name" required></div>
        <div class="form-group"><label class="form-label">Phone *</label><input type="tel" class="form-input" id="lead-phone" required></div>
        <div class="form-group"><label class="form-label">Source</label><select class="form-select" id="lead-source"><option value="">Select</option>${LEAD_SOURCES.map(s => `<option value="${s}">${s}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">Requirement</label><textarea class="form-textarea" id="lead-requirement" rows="2"></textarea></div>
        <div class="form-group"><label class="form-label">Budget (₹)</label><input type="number" class="form-input" id="lead-budget"></div>
        <div class="form-group"><label class="form-label">Location</label><input type="text" class="form-input" id="lead-location"></div>
        <div class="form-group"><label class="form-label">Follow-up Date</label><input type="date" class="form-input" id="lead-followup"></div>
        <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" id="lead-notes" rows="2"></textarea></div>
        <button type="submit" class="btn btn-primary btn-block mt-lg">Add Lead</button>
      </form>
    `);

    document.getElementById('add-lead-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await addLead({
          name: document.getElementById('lead-name').value.trim(),
          phone: document.getElementById('lead-phone').value.trim(),
          source: document.getElementById('lead-source').value,
          requirement: document.getElementById('lead-requirement').value.trim(),
          budget: parseFloat(document.getElementById('lead-budget').value) || null,
          location: document.getElementById('lead-location').value.trim(),
          followUpDate: document.getElementById('lead-followup').value,
          notes: document.getElementById('lead-notes').value.trim()
        });
        hideBottomSheet();
        showToast('Lead added');
        router.navigate('/leads');
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      }
    });
  };

  window.__plotway_showLeadDetail = async (id) => {
    const lead = await (await import('../services/firestore.js')).getLead(id);
    if (!lead) return;

    showBottomSheet(`
      <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">${lead.name}</h3>
      <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">${getStatusBadge(lead.status)}</p>
      <div class="action-menu">
        ${lead.phone ? `
          <button class="action-menu-item" onclick="window.__plotway_call('${lead.phone}'); document.getElementById('bottom-sheet-overlay').classList.add('hidden');">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07"/></svg>
            Call
          </button>
          <button class="action-menu-item" onclick="window.__plotway_whatsapp('${lead.phone}'); document.getElementById('bottom-sheet-overlay').classList.add('hidden');">
            <svg viewBox="0 0 24 24" fill="none" stroke="#25d366" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8"/></svg>
            WhatsApp
          </button>
        ` : ''}
        <button class="action-menu-item" onclick="window.__plotway_changeLeadStatus('${lead.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          Change Status
        </button>
        <button class="action-menu-item danger" onclick="window.__plotway_deleteLead('${lead.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg>
          Delete
        </button>
      </div>
    `);
  };

  window.__plotway_changeLeadStatus = (id) => {
    hideBottomSheet();
    setTimeout(() => {
      showBottomSheet(`
        <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 16px;">Change Status</h3>
        <div class="action-menu">
          ${LEAD_STATUSES.map(s => `
            <button class="action-menu-item" onclick="window.__plotway_setLeadStatus('${id}', '${s}')">
              ${getStatusBadge(s)} <span>${s}</span>
            </button>
          `).join('')}
        </div>
      `);
    }, 300);
  };

  window.__plotway_setLeadStatus = async (id, status) => {
    await updateLead(id, { status });
    hideBottomSheet();
    showToast('Status updated');
    router.navigate('/leads');
  };

  window.__plotway_deleteLead = async (id) => {
    hideBottomSheet();
    const ok = await showConfirm('Delete Lead', 'Are you sure?', 'Delete', true);
    if (ok) {
      await deleteLead(id);
      showToast('Lead deleted');
      router.navigate('/leads');
    }
  };
}
