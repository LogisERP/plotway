// More Page — Settings & Navigation
import router from '../router.js';

export async function renderMore() {
  return `
    <div class="page-padding">
      <div style="text-align: center; padding: 32px 0;">
        <div style="width: 64px; height: 64px; border-radius: 16px; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <h2 style="font-size: 20px; font-weight: 700;">Plotway</h2>
        <p style="font-size: 13px; color: var(--text-tertiary);">Property Inventory Manager</p>
        <p style="font-size: 12px; color: var(--text-tertiary); margin-top: 4px;">Version 1.0.0</p>
      </div>

      <!-- Navigation Items -->
      <div style="margin-top: 8px;">
        <div class="list-item" onclick="location.hash='/settings'" id="nav-settings">
          <div class="list-item-avatar" style="background: rgba(37,99,235,0.15); color: var(--primary);">
            <ion-icon name="settings-outline" style="font-size: 22px;"></ion-icon>
          </div>
          <div class="list-item-content">
            <div class="list-item-title">Settings</div>
            <div class="list-item-subtitle">Theme, profile & backup data</div>
          </div>
          <ion-icon name="chevron-forward-outline" style="color: var(--text-tertiary); font-size: 18px;"></ion-icon>
        </div>

        <div class="list-item" onclick="location.hash='/site-visits'" id="nav-site-visits">
          <div class="list-item-avatar" style="background: rgba(6,182,212,0.15); color: #22d3ee;">
            <ion-icon name="calendar-outline" style="font-size: 22px;"></ion-icon>
          </div>
          <div class="list-item-content">
            <div class="list-item-title">Site Visits</div>
            <div class="list-item-subtitle">Manage property visits</div>
          </div>
          <ion-icon name="chevron-forward-outline" style="color: var(--text-tertiary); font-size: 18px;"></ion-icon>
        </div>


        <div class="list-item" onclick="location.hash='/inventory'" id="nav-all-properties">
          <div class="list-item-avatar" style="background: rgba(59,130,246,0.15); color: #60a5fa;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
          </div>
          <div class="list-item-content">
            <div class="list-item-title">All Properties</div>
            <div class="list-item-subtitle">View entire inventory</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
        </div>

        <div class="list-item" onclick="location.hash='/property/add'" id="nav-add-property">
          <div class="list-item-avatar" style="background: rgba(16,185,129,0.15); color: #34d399;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          </div>
          <div class="list-item-content">
            <div class="list-item-title">Add Property</div>
            <div class="list-item-subtitle">Add new property to inventory</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
        </div>
      </div>

      <div class="divider" style="margin: 24px 0;"></div>

      <div style="padding: 0 16px;">
        <h3 style="font-size: 13px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 12px;">About</h3>
        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
          Plotway is a private land & property inventory management application designed for real-estate brokers.
          Capture properties, match buyer requirements, schedule site visits, and close deals efficiently.
        </p>
      </div>

      <div style="height: 100px;"></div>
    </div>
  `;
}

export function initMore() {
  // No special init needed
}
