// Edit Property Page
import { getProperty, updateProperty } from '../services/firestore.js';
import { showToast, PROPERTY_TYPES, PROPERTY_STATUSES, LAND_UNITS, FACING_OPTIONS } from '../utils.js';
import storage from '../services/storage.js';
import router from '../router.js';

let photos = [];

export async function renderPropertyEdit(params) {
  const property = await getProperty(params.id);
  if (!property) {
    return `<div class="empty-state"><h3 class="empty-state-title">Property not found</h3><button class="btn btn-primary" onclick="location.hash='/inventory'">Go to Inventory</button></div>`;
  }

  photos = property.photos || [];
  const loc = property.location || {};
  const land = property.landDetails || {};
  const price = property.price || {};
  const owner = property.owner || {};
  const docs = property.documents || {};

  return `
    <div class="page-padding">
      <form id="edit-property-form">
        <!-- Basic -->
        <div class="collapsible open" id="edit-basic">
          <div class="collapsible-header" onclick="window.__plotway_toggleSection('edit-basic')">
            <span class="collapsible-title">📋 Basic Information</span>
            <svg class="collapsible-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
          <div class="collapsible-body">
            <div class="form-group">
              <label class="form-label">Property Code</label>
              <input type="text" class="form-input" value="${property.propertyCode || ''}" disabled style="opacity:0.6;">
            </div>
            <div class="form-group">
              <label class="form-label">Property Type *</label>
              <select class="form-select" id="edit-propertyType" required>
                ${PROPERTY_TYPES.map(t => `<option value="${t}" ${property.propertyType === t ? 'selected' : ''}>${t}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Title</label>
              <input type="text" class="form-input" id="edit-title" value="${property.title || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select class="form-select" id="edit-status">
                ${PROPERTY_STATUSES.map(s => `<option value="${s}" ${property.status === s ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>

        <!-- Location -->
        <div class="collapsible open" id="edit-location">
          <div class="collapsible-header" onclick="window.__plotway_toggleSection('edit-location')">
            <span class="collapsible-title">📍 Location</span>
            <svg class="collapsible-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
          <div class="collapsible-body">
            <div class="form-group">
              <label class="form-label">Address</label>
              <textarea class="form-textarea" id="edit-address" rows="2">${loc.address || ''}</textarea>
            </div>
            <div class="form-row">
              <div class="form-group"><label class="form-label">Area</label><input type="text" class="form-input" id="edit-area" value="${loc.area || ''}"></div>
              <div class="form-group"><label class="form-label">Village</label><input type="text" class="form-input" id="edit-village" value="${loc.village || ''}"></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label class="form-label">Taluk</label><input type="text" class="form-input" id="edit-taluk" value="${loc.taluk || ''}"></div>
              <div class="form-group"><label class="form-label">District</label><input type="text" class="form-input" id="edit-district" value="${loc.district || ''}"></div>
            </div>
            <div class="form-group"><label class="form-label">Pincode</label><input type="text" class="form-input" id="edit-pincode" value="${loc.pincode || ''}" maxlength="6"></div>
            <div class="form-row">
              <div class="form-group"><label class="form-label">Latitude</label><input type="number" step="any" class="form-input" id="edit-latitude" value="${loc.latitude || ''}"></div>
              <div class="form-group"><label class="form-label">Longitude</label><input type="number" step="any" class="form-input" id="edit-longitude" value="${loc.longitude || ''}"></div>
            </div>
            <button type="button" class="map-pick-btn" id="edit-pick-location">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Update Location
            </button>
          </div>
        </div>

        <!-- Land Details -->
        <div class="collapsible open" id="edit-land">
          <div class="collapsible-header" onclick="window.__plotway_toggleSection('edit-land')">
            <span class="collapsible-title">📐 Land Details</span>
            <svg class="collapsible-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
          <div class="collapsible-body">
            <div class="form-row">
              <div class="form-group"><label class="form-label">Land Size *</label><input type="number" step="any" class="form-input" id="edit-landSize" value="${land.landSize || ''}" required></div>
              <div class="form-group"><label class="form-label">Unit</label><select class="form-select" id="edit-landUnit">${LAND_UNITS.map(u => `<option value="${u}" ${land.landUnit === u ? 'selected' : ''}>${u}</option>`).join('')}</select></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label class="form-label">Road Width (ft)</label><input type="number" class="form-input" id="edit-roadWidth" value="${land.roadWidth || ''}"></div>
              <div class="form-group"><label class="form-label">Facing</label><select class="form-select" id="edit-facing"><option value="">Select</option>${FACING_OPTIONS.map(f => `<option value="${f}" ${land.facing === f ? 'selected' : ''}>${f}</option>`).join('')}</select></div>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 16px; margin-top: 8px;">
              <label class="form-checkbox"><input type="checkbox" id="edit-cornerProperty" ${land.cornerProperty ? 'checked' : ''}><span>Corner Property</span></label>
              <label class="form-checkbox"><input type="checkbox" id="edit-roadFacing" ${land.roadFacing ? 'checked' : ''}><span>Road Facing</span></label>
            </div>
            <div class="form-group mt-lg"><label class="form-label">Boundary Details</label><textarea class="form-textarea" id="edit-boundaryDetails" rows="2">${land.boundaryDetails || ''}</textarea></div>
          </div>
        </div>

        <!-- Price -->
        <div class="collapsible open" id="edit-price">
          <div class="collapsible-header" onclick="window.__plotway_toggleSection('edit-price')">
            <span class="collapsible-title">💰 Price</span>
            <svg class="collapsible-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
          <div class="collapsible-body">
            <div class="form-group"><label class="form-label">Expected Price (₹)</label><input type="number" class="form-input" id="edit-expectedPrice" value="${price.expectedPrice || ''}"></div>
            <div class="form-group"><label class="form-label">Price per Unit (₹)</label><input type="number" class="form-input" id="edit-pricePerUnit" value="${price.pricePerUnit || ''}"></div>
            <label class="form-checkbox mt-md"><input type="checkbox" id="edit-negotiable" ${price.negotiable ? 'checked' : ''}><span>Negotiable</span></label>
          </div>
        </div>

        <!-- Owner -->
        <div class="collapsible open" id="edit-owner">
          <div class="collapsible-header" onclick="window.__plotway_toggleSection('edit-owner')">
            <span class="collapsible-title">👤 Owner Details</span>
            <svg class="collapsible-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
          <div class="collapsible-body">
            <div class="form-group"><label class="form-label">Owner Name</label><input type="text" class="form-input" id="edit-ownerName" value="${owner.name || ''}"></div>
            <div class="form-group"><label class="form-label">Phone</label><input type="tel" class="form-input" id="edit-ownerPhone" value="${owner.phone || ''}"></div>
            <div class="form-group"><label class="form-label">Alternate Phone</label><input type="tel" class="form-input" id="edit-ownerAltPhone" value="${owner.alternatePhone || ''}"></div>
            <div class="form-group"><label class="form-label">WhatsApp</label><input type="tel" class="form-input" id="edit-ownerWhatsapp" value="${owner.whatsapp || ''}"></div>
          </div>
        </div>

        <!-- Documents -->
        <div class="collapsible" id="edit-documents">
          <div class="collapsible-header" onclick="window.__plotway_toggleSection('edit-documents')">
            <span class="collapsible-title">📄 Documents</span>
            <svg class="collapsible-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
          <div class="collapsible-body">
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <label class="form-checkbox"><input type="checkbox" id="edit-doc-patta" ${docs.patta ? 'checked' : ''}><span>Patta</span></label>
              <label class="form-checkbox"><input type="checkbox" id="edit-doc-chitta" ${docs.chitta ? 'checked' : ''}><span>Chitta</span></label>
              <label class="form-checkbox"><input type="checkbox" id="edit-doc-ec" ${docs.ec ? 'checked' : ''}><span>EC</span></label>
              <label class="form-checkbox"><input type="checkbox" id="edit-doc-saleDeed" ${docs.saleDeed ? 'checked' : ''}><span>Sale Deed</span></label>
              <label class="form-checkbox"><input type="checkbox" id="edit-doc-parentDocuments" ${docs.parentDocuments ? 'checked' : ''}><span>Parent Documents</span></label>
              <label class="form-checkbox"><input type="checkbox" id="edit-doc-fmb" ${docs.fmb ? 'checked' : ''}><span>FMB</span></label>
              <label class="form-checkbox"><input type="checkbox" id="edit-doc-taxReceipt" ${docs.taxReceipt ? 'checked' : ''}><span>Tax Receipt</span></label>
              <label class="form-checkbox"><input type="checkbox" id="edit-doc-approval" ${docs.approval ? 'checked' : ''}><span>Approval</span></label>
            </div>
            <div class="form-group mt-lg"><label class="form-label">Other</label><input type="text" class="form-input" id="edit-doc-other" value="${docs.other || ''}"></div>
          </div>
        </div>

        <!-- Photos -->
        <div class="collapsible" id="edit-photos">
          <div class="collapsible-header" onclick="window.__plotway_toggleSection('edit-photos')">
            <span class="collapsible-title">📸 Photos (${photos.length})</span>
            <svg class="collapsible-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
          <div class="collapsible-body">
            <div class="photo-upload-grid" id="edit-photo-grid"></div>
            <input type="file" id="edit-photo-input" accept="image/*" multiple hidden>
          </div>
        </div>

        <!-- Notes -->
        <div class="collapsible" id="edit-notes">
          <div class="collapsible-header" onclick="window.__plotway_toggleSection('edit-notes')">
            <span class="collapsible-title">📝 Notes</span>
            <svg class="collapsible-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
          <div class="collapsible-body">
            <textarea class="form-textarea" id="edit-notes-text" rows="4">${property.notes || ''}</textarea>
          </div>
        </div>

        <div style="padding: 24px 0 80px;">
          <button type="submit" class="btn btn-primary btn-lg btn-block" id="update-property-btn">Save Changes</button>
        </div>
      </form>
    </div>
  `;
}

export function initPropertyEdit(params) {
  window.__plotway_toggleSection = (id) => {
    document.getElementById(id)?.classList.toggle('open');
  };

  // Photo grid
  updateEditPhotoGrid();

  const photoInput = document.getElementById('edit-photo-input');
  if (photoInput) {
    photoInput.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files);
      for (const file of files) {
        try {
          const result = await storage.upload(file, `properties/temp/${Date.now()}`);
          photos.push({ url: result.url, path: result.path, isPrimary: photos.length === 0 });
        } catch (err) {
          showToast('Failed to process photo', 'error');
        }
      }
      updateEditPhotoGrid();
      photoInput.value = '';
    });
  }

  // Pick location
  document.getElementById('edit-pick-location')?.addEventListener('click', () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          document.getElementById('edit-latitude').value = pos.coords.latitude.toFixed(6);
          document.getElementById('edit-longitude').value = pos.coords.longitude.toFixed(6);
          showToast('Location updated');
        },
        (err) => showToast('Location error: ' + err.message, 'error'),
        { enableHighAccuracy: true }
      );
    }
  });

  // Submit
  document.getElementById('edit-property-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('update-property-btn');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
      const data = {
        title: document.getElementById('edit-title').value.trim(),
        propertyType: document.getElementById('edit-propertyType').value,
        status: document.getElementById('edit-status').value,
        location: {
          address: document.getElementById('edit-address').value.trim(),
          area: document.getElementById('edit-area').value.trim(),
          village: document.getElementById('edit-village').value.trim(),
          taluk: document.getElementById('edit-taluk').value.trim(),
          district: document.getElementById('edit-district').value.trim(),
          pincode: document.getElementById('edit-pincode').value.trim(),
          latitude: parseFloat(document.getElementById('edit-latitude').value) || null,
          longitude: parseFloat(document.getElementById('edit-longitude').value) || null
        },
        landDetails: {
          landSize: document.getElementById('edit-landSize').value,
          landUnit: document.getElementById('edit-landUnit').value,
          roadWidth: document.getElementById('edit-roadWidth').value,
          facing: document.getElementById('edit-facing').value,
          cornerProperty: document.getElementById('edit-cornerProperty').checked,
          roadFacing: document.getElementById('edit-roadFacing').checked,
          boundaryDetails: document.getElementById('edit-boundaryDetails').value.trim()
        },
        price: {
          expectedPrice: parseFloat(document.getElementById('edit-expectedPrice').value) || null,
          pricePerUnit: parseFloat(document.getElementById('edit-pricePerUnit').value) || null,
          negotiable: document.getElementById('edit-negotiable').checked
        },
        owner: {
          name: document.getElementById('edit-ownerName').value.trim(),
          phone: document.getElementById('edit-ownerPhone').value.trim(),
          alternatePhone: document.getElementById('edit-ownerAltPhone').value.trim(),
          whatsapp: document.getElementById('edit-ownerWhatsapp').value.trim()
        },
        documents: {
          patta: document.getElementById('edit-doc-patta').checked,
          chitta: document.getElementById('edit-doc-chitta').checked,
          ec: document.getElementById('edit-doc-ec').checked,
          saleDeed: document.getElementById('edit-doc-saleDeed').checked,
          parentDocuments: document.getElementById('edit-doc-parentDocuments').checked,
          fmb: document.getElementById('edit-doc-fmb').checked,
          taxReceipt: document.getElementById('edit-doc-taxReceipt').checked,
          approval: document.getElementById('edit-doc-approval').checked,
          other: document.getElementById('edit-doc-other').value.trim()
        },
        photos,
        notes: document.getElementById('edit-notes-text').value.trim()
      };

      await updateProperty(params.id, data);
      showToast('Property updated!');
      router.navigate(`/property/${params.id}`);
    } catch (error) {
      showToast('Error: ' + error.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Save Changes';
    }
  });
}

function updateEditPhotoGrid() {
  const grid = document.getElementById('edit-photo-grid');
  if (!grid) return;

  grid.innerHTML = photos.map((p, i) => `
    <div class="photo-upload-item">
      <img src="${p.url}" alt="Photo ${i + 1}">
      <button type="button" class="photo-remove" onclick="window.__plotway_editRemovePhoto(${i})">×</button>
      ${p.isPrimary ? '<span class="photo-primary">Primary</span>' : ''}
    </div>
  `).join('') + `
    <div class="photo-upload-add" onclick="document.getElementById('edit-photo-input').click()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
      <span>Add</span>
    </div>
  `;

  window.__plotway_editRemovePhoto = (idx) => {
    const wasPrimary = photos[idx].isPrimary;
    photos.splice(idx, 1);
    if (wasPrimary && photos.length > 0) photos[0].isPrimary = true;
    updateEditPhotoGrid();
  };
}
