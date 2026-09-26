// Add Property Page — Multi-section form
import { addProperty } from '../services/firestore.js';
import { showToast, PROPERTY_TYPES, PROPERTY_STATUSES, LAND_UNITS, FACING_OPTIONS } from '../utils.js';
import storage from '../services/storage.js';
import router from '../router.js';

let photos = [];

export async function renderPropertyAdd() {
  photos = [];

  return `
    <div class="page-padding">
      <form id="property-form" class="property-form">

        <!-- Basic Information -->
        <div class="collapsible open" id="section-basic">
          <div class="collapsible-header" onclick="window.__plotway_toggleSection('section-basic')">
            <span class="collapsible-title">📋 Basic Information</span>
            <svg class="collapsible-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
          <div class="collapsible-body">
            <div class="form-group">
              <label class="form-label">Property Type *</label>
              <select class="form-select" id="propertyType" required>
                <option value="">Select type</option>
                ${PROPERTY_TYPES.map(t => `<option value="${t}">${t}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Title</label>
              <input type="text" class="form-input" id="title" placeholder="e.g., Corner Plot near Main Road">
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select class="form-select" id="status">
                ${PROPERTY_STATUSES.map(s => `<option value="${s}" ${s === 'Available' ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>

        <!-- Location -->
        <div class="collapsible open" id="section-location">
          <div class="collapsible-header" onclick="window.__plotway_toggleSection('section-location')">
            <span class="collapsible-title">📍 Location</span>
            <svg class="collapsible-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
          <div class="collapsible-body">
            <div class="form-group">
              <label class="form-label">Address</label>
              <textarea class="form-textarea" id="address" rows="2" placeholder="Full address"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Area</label>
                <input type="text" class="form-input" id="area" placeholder="Area name">
              </div>
              <div class="form-group">
                <label class="form-label">Village</label>
                <input type="text" class="form-input" id="village" placeholder="Village">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Taluk</label>
                <input type="text" class="form-input" id="taluk" placeholder="Taluk">
              </div>
              <div class="form-group">
                <label class="form-label">District</label>
                <input type="text" class="form-input" id="district" placeholder="District">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Pincode</label>
              <input type="text" class="form-input" id="pincode" placeholder="Pincode" pattern="[0-9]{6}" maxlength="6">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Latitude</label>
                <input type="number" step="any" class="form-input" id="latitude" placeholder="Lat">
              </div>
              <div class="form-group">
                <label class="form-label">Longitude</label>
                <input type="number" step="any" class="form-input" id="longitude" placeholder="Lng">
              </div>
            </div>
            <button type="button" class="map-pick-btn" id="pick-location-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Pick Current Location
            </button>
          </div>
        </div>

        <!-- Land Details -->
        <div class="collapsible open" id="section-land">
          <div class="collapsible-header" onclick="window.__plotway_toggleSection('section-land')">
            <span class="collapsible-title">📐 Land Details</span>
            <svg class="collapsible-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
          <div class="collapsible-body">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Land Size *</label>
                <input type="number" step="any" class="form-input" id="landSize" placeholder="Size" required>
              </div>
              <div class="form-group">
                <label class="form-label">Unit</label>
                <select class="form-select" id="landUnit">
                  ${LAND_UNITS.map(u => `<option value="${u}">${u}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Road Width (ft)</label>
                <input type="number" class="form-input" id="roadWidth" placeholder="e.g., 30">
              </div>
              <div class="form-group">
                <label class="form-label">Facing</label>
                <select class="form-select" id="facing">
                  <option value="">Select</option>
                  ${FACING_OPTIONS.map(f => `<option value="${f}">${f}</option>`).join('')}
                </select>
              </div>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 16px; margin-top: 8px;">
              <label class="form-checkbox">
                <input type="checkbox" id="cornerProperty">
                <span>Corner Property</span>
              </label>
              <label class="form-checkbox">
                <input type="checkbox" id="roadFacing">
                <span>Road Facing</span>
              </label>
            </div>
            <div class="form-group mt-lg">
              <label class="form-label">Boundary Details</label>
              <textarea class="form-textarea" id="boundaryDetails" rows="2" placeholder="North: Road, South: Plot 123..."></textarea>
            </div>
          </div>
        </div>

        <!-- Price -->
        <div class="collapsible open" id="section-price">
          <div class="collapsible-header" onclick="window.__plotway_toggleSection('section-price')">
            <span class="collapsible-title">💰 Price</span>
            <svg class="collapsible-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
          <div class="collapsible-body">
            <div class="form-group">
              <label class="form-label">Expected Price (₹)</label>
              <input type="number" class="form-input" id="expectedPrice" placeholder="e.g., 3200000">
              <p class="form-hint">Enter total price in Rupees</p>
            </div>
            <div class="form-group">
              <label class="form-label">Price per Unit (₹)</label>
              <input type="number" class="form-input" id="pricePerUnit" placeholder="e.g., 400000">
            </div>
            <label class="form-checkbox mt-md">
              <input type="checkbox" id="negotiable">
              <span>Negotiable</span>
            </label>
          </div>
        </div>

        <!-- Owner -->
        <div class="collapsible open" id="section-owner">
          <div class="collapsible-header" onclick="window.__plotway_toggleSection('section-owner')">
            <span class="collapsible-title">👤 Owner Details</span>
            <svg class="collapsible-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
          <div class="collapsible-body">
            <div class="form-group">
              <label class="form-label">Owner Name</label>
              <input type="text" class="form-input" id="ownerName" placeholder="Full name">
            </div>
            <div class="form-group">
              <label class="form-label">Phone</label>
              <input type="tel" class="form-input" id="ownerPhone" placeholder="Phone number">
            </div>
            <div class="form-group">
              <label class="form-label">Alternate Phone</label>
              <input type="tel" class="form-input" id="ownerAltPhone" placeholder="Alternate phone">
            </div>
            <div class="form-group">
              <label class="form-label">WhatsApp</label>
              <input type="tel" class="form-input" id="ownerWhatsapp" placeholder="WhatsApp number">
            </div>
          </div>
        </div>

        <!-- Documents -->
        <div class="collapsible" id="section-documents">
          <div class="collapsible-header" onclick="window.__plotway_toggleSection('section-documents')">
            <span class="collapsible-title">📄 Documents</span>
            <svg class="collapsible-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
          <div class="collapsible-body">
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${['patta', 'chitta', 'ec', 'saleDeed', 'parentDocuments', 'fmb', 'taxReceipt', 'approval'].map(doc => `
                <label class="form-checkbox">
                  <input type="checkbox" id="doc-${doc}">
                  <span>${formatDocName(doc)}</span>
                </label>
              `).join('')}
            </div>
            <div class="form-group mt-lg">
              <label class="form-label">Other Documents</label>
              <input type="text" class="form-input" id="doc-other" placeholder="Other document details">
            </div>
          </div>
        </div>

        <!-- Photos -->
        <div class="collapsible" id="section-photos">
          <div class="collapsible-header" onclick="window.__plotway_toggleSection('section-photos')">
            <span class="collapsible-title">📸 Photos</span>
            <svg class="collapsible-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
          <div class="collapsible-body">
            <div class="photo-upload-grid" id="photo-grid">
              <div class="photo-upload-add" id="add-photo-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                <span>Add Photo</span>
              </div>
            </div>
            <input type="file" id="photo-input" accept="image/*" multiple hidden>
          </div>
        </div>

        <!-- Notes -->
        <div class="collapsible" id="section-notes">
          <div class="collapsible-header" onclick="window.__plotway_toggleSection('section-notes')">
            <span class="collapsible-title">📝 Notes</span>
            <svg class="collapsible-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
          <div class="collapsible-body">
            <div class="form-group">
              <textarea class="form-textarea" id="notes" rows="4" placeholder="Any additional notes about the property..."></textarea>
            </div>
          </div>
        </div>

        <!-- Submit -->
        <div style="padding: 24px 0 80px;">
          <button type="submit" class="btn btn-primary btn-lg btn-block" id="submit-property-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
            Add to Inventory
          </button>
        </div>
      </form>
    </div>
  `;
}

function formatDocName(key) {
  const names = {
    patta: 'Patta',
    chitta: 'Chitta',
    ec: 'Encumbrance Certificate (EC)',
    saleDeed: 'Sale Deed',
    parentDocuments: 'Parent Documents',
    fmb: 'FMB (Field Measurement Book)',
    taxReceipt: 'Tax Receipt',
    approval: 'Approval'
  };
  return names[key] || key;
}

export function initPropertyAdd() {
  // Toggle collapsible sections
  window.__plotway_toggleSection = (id) => {
    const section = document.getElementById(id);
    if (section) section.classList.toggle('open');
  };

  // Pick location
  const pickBtn = document.getElementById('pick-location-btn');
  if (pickBtn) {
    pickBtn.addEventListener('click', async () => {
      try {
        pickBtn.textContent = 'Getting location...';
        let position;

        // Try Capacitor Geolocation first
        try {
          const { Geolocation } = await import('@capacitor/geolocation');
          position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
          document.getElementById('latitude').value = position.coords.latitude.toFixed(6);
          document.getElementById('longitude').value = position.coords.longitude.toFixed(6);
          showToast('Location captured');
        } catch (e) {
          // Fallback to browser geolocation
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                document.getElementById('latitude').value = pos.coords.latitude.toFixed(6);
                document.getElementById('longitude').value = pos.coords.longitude.toFixed(6);
                showToast('Location captured');
              },
              (err) => {
                showToast('Could not get location: ' + err.message, 'error');
              },
              { enableHighAccuracy: true }
            );
          } else {
            showToast('Geolocation not available', 'error');
          }
        }
      } catch (e) {
        showToast('Location error', 'error');
      } finally {
        pickBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          Pick Current Location
        `;
      }
    });
  }

  // Photo handling
  const addPhotoBtn = document.getElementById('add-photo-btn');
  const photoInput = document.getElementById('photo-input');

  if (addPhotoBtn && photoInput) {
    addPhotoBtn.addEventListener('click', () => photoInput.click());

    photoInput.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files);
      for (const file of files) {
        try {
          const result = await storage.upload(file, `properties/temp/${Date.now()}`);
          photos.push({
            url: result.url,
            path: result.path,
            isPrimary: photos.length === 0
          });
        } catch (err) {
          console.error('Photo upload error:', err);
          showToast('Failed to process photo', 'error');
        }
      }
      updatePhotoGrid();
      photoInput.value = '';
    });
  }

  // Form submission
  const form = document.getElementById('property-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleSubmit();
    });
  }
}

function updatePhotoGrid() {
  const grid = document.getElementById('photo-grid');
  if (!grid) return;

  const photoItems = photos.map((photo, idx) => `
    <div class="photo-upload-item">
      <img src="${photo.url}" alt="Photo ${idx + 1}">
      <button type="button" class="photo-remove" onclick="window.__plotway_removePhoto(${idx})">×</button>
      ${photo.isPrimary ? '<span class="photo-primary">Primary</span>' : ''}
    </div>
  `).join('');

  grid.innerHTML = photoItems + `
    <div class="photo-upload-add" id="add-photo-btn-inner" onclick="document.getElementById('photo-input').click()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
      <span>Add Photo</span>
    </div>
  `;

  window.__plotway_removePhoto = (idx) => {
    const wasPrimary = photos[idx].isPrimary;
    photos.splice(idx, 1);
    if (wasPrimary && photos.length > 0) {
      photos[0].isPrimary = true;
    }
    updatePhotoGrid();
  };
}

async function handleSubmit() {
  const btn = document.getElementById('submit-property-btn');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  try {
    const data = {
      title: document.getElementById('title').value.trim(),
      propertyType: document.getElementById('propertyType').value,
      status: document.getElementById('status').value,
      location: {
        address: document.getElementById('address').value.trim(),
        area: document.getElementById('area').value.trim(),
        village: document.getElementById('village').value.trim(),
        taluk: document.getElementById('taluk').value.trim(),
        district: document.getElementById('district').value.trim(),
        pincode: document.getElementById('pincode').value.trim(),
        latitude: parseFloat(document.getElementById('latitude').value) || null,
        longitude: parseFloat(document.getElementById('longitude').value) || null
      },
      landDetails: {
        landSize: document.getElementById('landSize').value,
        landUnit: document.getElementById('landUnit').value,
        roadWidth: document.getElementById('roadWidth').value,
        facing: document.getElementById('facing').value,
        cornerProperty: document.getElementById('cornerProperty').checked,
        roadFacing: document.getElementById('roadFacing').checked,
        boundaryDetails: document.getElementById('boundaryDetails').value.trim()
      },
      price: {
        expectedPrice: parseFloat(document.getElementById('expectedPrice').value) || null,
        pricePerUnit: parseFloat(document.getElementById('pricePerUnit').value) || null,
        negotiable: document.getElementById('negotiable').checked
      },
      owner: {
        name: document.getElementById('ownerName').value.trim(),
        phone: document.getElementById('ownerPhone').value.trim(),
        alternatePhone: document.getElementById('ownerAltPhone').value.trim(),
        whatsapp: document.getElementById('ownerWhatsapp').value.trim()
      },
      documents: {
        patta: document.getElementById('doc-patta').checked,
        chitta: document.getElementById('doc-chitta').checked,
        ec: document.getElementById('doc-ec').checked,
        saleDeed: document.getElementById('doc-saleDeed').checked,
        parentDocuments: document.getElementById('doc-parentDocuments').checked,
        fmb: document.getElementById('doc-fmb').checked,
        taxReceipt: document.getElementById('doc-taxReceipt').checked,
        approval: document.getElementById('doc-approval').checked,
        other: document.getElementById('doc-other').value.trim()
      },
      photos: photos,
      notes: document.getElementById('notes').value.trim()
    };

    // Validation
    if (!data.propertyType) {
      showToast('Please select property type', 'error');
      btn.disabled = false;
      btn.textContent = 'Add to Inventory';
      return;
    }
    if (!data.landDetails.landSize) {
      showToast('Please enter land size', 'error');
      btn.disabled = false;
      btn.textContent = 'Add to Inventory';
      return;
    }

    const result = await addProperty(data);
    showToast(`Property ${result.propertyCode} added successfully!`);
    router.navigate(`/property/${result.id}`);

  } catch (error) {
    console.error('Error adding property:', error);
    showToast('Failed to add property: ' + error.message, 'error');
    btn.disabled = false;
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
      Add to Inventory
    `;
  }
}
