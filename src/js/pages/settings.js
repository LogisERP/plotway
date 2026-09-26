// Settings Page Module — Theme, Profile & Data Management
import { getStoredTheme, setTheme, showToast, showConfirm } from '../utils.js';
import { getProperties, getBuyers, getLeads, getSiteVisits, addProperty, addBuyer, addLead, addSiteVisit } from '../services/firestore.js';

export async function renderSettings() {
  const isDark = getStoredTheme() === 'dark';
  const profile = JSON.parse(localStorage.getItem('plotway_broker_profile') || '{}');

  return `
    <div class="page-padding">
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 22px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">Settings</h2>
        <p style="font-size: 13px; color: var(--text-secondary);">Manage app theme, broker profile & data backups</p>
      </div>

      <!-- Appearance / Theme Section -->
      <div class="card" style="margin-bottom: 20px;">
        <div class="card-header">
          <h3 style="font-size: 15px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
            <ion-icon name="color-palette-outline" style="color: var(--primary); font-size: 20px;"></ion-icon>
            Appearance
          </h3>
        </div>
        <div style="padding: 12px 16px;">
          <ion-item lines="full">
            <ion-icon name="moon-outline" slot="start" style="color: var(--text-secondary);"></ion-icon>
            <ion-label>
              <h2 style="font-weight: 600;">Dark Mode</h2>
              <p style="font-size: 12px; color: var(--text-secondary);">Switch to sleek dark glassmorphic theme</p>
            </ion-label>
            <ion-toggle id="settings-dark-toggle" slot="end" ${isDark ? 'checked' : ''}></ion-toggle>
          </ion-item>
        </div>
      </div>

      <!-- Broker Profile Section -->
      <div class="card" style="margin-bottom: 20px;">
        <div class="card-header">
          <h3 style="font-size: 15px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
            <ion-icon name="person-outline" style="color: var(--primary); font-size: 20px;"></ion-icon>
            Broker Profile
          </h3>
        </div>
        <div class="card-body">
          <form id="settings-profile-form">
            <div class="form-group">
              <ion-input id="settings-broker-name" label="Broker Name" label-placement="stacked" fill="outline" placeholder="Enter your full name" value="${profile.name || ''}"></ion-input>
            </div>
            <div class="form-group">
              <ion-input id="settings-agency-name" label="Agency / Business Name" label-placement="stacked" fill="outline" placeholder="e.g. Royal Real Estate" value="${profile.agency || ''}"></ion-input>
            </div>
            <div class="form-row">
              <div class="form-group">
                <ion-input id="settings-phone" label="Phone Number" label-placement="stacked" fill="outline" placeholder="+91 9876543210" value="${profile.phone || ''}"></ion-input>
              </div>
              <div class="form-group">
                <ion-input id="settings-rera" label="RERA Reg. No" label-placement="stacked" fill="outline" placeholder="RERA12345" value="${profile.rera || ''}"></ion-input>
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Save Profile Details</button>
          </form>
        </div>
      </div>

      <!-- Data Backup & Sync -->
      <div class="card" style="margin-bottom: 20px;">
        <div class="card-header">
          <h3 style="font-size: 15px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
            <ion-icon name="cloud-download-outline" style="color: var(--primary); font-size: 20px;"></ion-icon>
            Data Backup & Restore
          </h3>
        </div>
        <div class="card-body">
          <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">
            Export all property inventory, buyers, leads, and site visit logs as a JSON backup.
          </p>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <button id="settings-export-btn" class="btn btn-outline" style="flex: 1;">
              <ion-icon name="download-outline"></ion-icon> Export Backup
            </button>
            <button id="settings-import-btn" class="btn btn-outline" style="flex: 1;">
              <ion-icon name="cloud-upload-outline"></ion-icon> Import Backup
            </button>
            <input type="file" id="settings-import-input" accept=".json" style="display: none;">
          </div>
        </div>
      </div>

      <!-- About & System Info -->
      <div class="card" style="margin-bottom: 30px;">
        <div class="card-header">
          <h3 style="font-size: 15px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
            <ion-icon name="information-circle-outline" style="color: var(--primary); font-size: 20px;"></ion-icon>
            App Information
          </h3>
        </div>
        <div class="card-body">
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Application</span>
              <span style="font-weight: 600;">Plotway Inventory</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Version</span>
              <span style="font-weight: 600;">1.0.0</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">UI Framework</span>
              <span style="font-weight: 600; color: var(--primary);">Ionic Framework v8</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Database Engine</span>
              <span style="font-weight: 600;">Firebase Firestore</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Mobile Runtime</span>
              <span style="font-weight: 600;">Capacitor 8 Android</span>
            </div>
          </div>
        </div>
      </div>

      <div style="height: 80px;"></div>
    </div>
  `;
}

export function initSettings() {
  // Theme Toggle Listener
  const darkToggle = document.getElementById('settings-dark-toggle');
  if (darkToggle) {
    darkToggle.addEventListener('ionChange', (e) => {
      const isChecked = e.detail.checked;
      setTheme(isChecked ? 'dark' : 'light');
      showToast(isChecked ? 'Dark mode enabled' : 'Light mode enabled', 'info');
    });
  }

  // Profile Form Handler
  const profileForm = document.getElementById('settings-profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const profileData = {
        name: document.getElementById('settings-broker-name')?.value || '',
        agency: document.getElementById('settings-agency-name')?.value || '',
        phone: document.getElementById('settings-phone')?.value || '',
        rera: document.getElementById('settings-rera')?.value || ''
      };
      localStorage.setItem('plotway_broker_profile', JSON.stringify(profileData));
      showToast('Profile saved successfully!', 'success');
    });
  }

  // Export Data Handler
  const exportBtn = document.getElementById('settings-export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      try {
        const [properties, buyers, leads, siteVisits] = await Promise.all([
          getProperties({}, 'createdAt', 'desc', 1000),
          getBuyers(),
          getLeads(),
          getSiteVisits()
        ]);

        const backupData = {
          app: 'Plotway',
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          data: { properties, buyers, leads, siteVisits }
        };

        const jsonStr = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `plotway_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('Backup downloaded successfully!', 'success');
      } catch (err) {
        showToast('Failed to export data: ' + err.message, 'danger');
      }
    });
  }

  // Import Data Handler
  const importBtn = document.getElementById('settings-import-btn');
  const importInput = document.getElementById('settings-import-input');
  if (importBtn && importInput) {
    importBtn.addEventListener('click', () => importInput.click());

    importInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const confirmed = await showConfirm(
        'Restore Backup',
        'Are you sure you want to import data from this backup file? New records will be added to your inventory.',
        'Import Data'
      );

      if (!confirmed) return;

      try {
        const text = await file.text();
        const json = JSON.parse(text);

        if (!json.data) throw new Error('Invalid backup file format');

        let restoredCount = 0;
        const { properties = [], buyers = [], leads = [], siteVisits = [] } = json.data;

        for (const p of properties) {
          const { id, ...data } = p;
          await addProperty(data);
          restoredCount++;
        }
        for (const b of buyers) {
          const { id, ...data } = b;
          await addBuyer(data);
          restoredCount++;
        }
        for (const l of leads) {
          const { id, ...data } = l;
          await addLead(data);
          restoredCount++;
        }
        for (const v of siteVisits) {
          const { id, ...data } = v;
          await addSiteVisit(data);
          restoredCount++;
        }

        showToast(`Successfully restored ${restoredCount} items!`, 'success');
      } catch (err) {
        showToast('Import failed: ' + err.message, 'danger');
      }
    });
  }
}
