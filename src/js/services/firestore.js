// Firestore Data Service
// All database operations are centralized here
import { db } from '../firebase.js';
import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter, Timestamp,
  onSnapshot, serverTimestamp, writeBatch
} from 'firebase/firestore';

// ── Collection References ──
const COLLECTIONS = {
  PROPERTIES: 'properties',
  BUYERS: 'buyers',
  BUYER_REQUIREMENTS: 'buyerRequirements',
  LEADS: 'leads',
  SITE_VISITS: 'siteVisits',
  ACTIVITIES: 'activities',
  SETTINGS: 'settings'
};

// ── Property Code Generator ──
async function generatePropertyCode() {
  const q = query(
    collection(db, COLLECTIONS.PROPERTIES),
    orderBy('createdAt', 'desc'),
    limit(1)
  );
  const snap = await getDocs(q);
  let nextNum = 1;
  if (!snap.empty) {
    const lastCode = snap.docs[0].data().propertyCode || 'PROP-0000';
    const num = parseInt(lastCode.replace('PROP-', ''), 10);
    if (!isNaN(num)) nextNum = num + 1;
  }
  return `PROP-${String(nextNum).padStart(4, '0')}`;
}

// ══════════════════════════════════
// PROPERTIES
// ══════════════════════════════════

export async function addProperty(data) {
  const propertyCode = await generatePropertyCode();
  const propertyData = {
    ...data,
    propertyCode,
    status: data.status || 'Available',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  const ref = await addDoc(collection(db, COLLECTIONS.PROPERTIES), propertyData);
  return { id: ref.id, ...propertyData, propertyCode };
}

export async function getProperty(id) {
  const snap = await getDoc(doc(db, COLLECTIONS.PROPERTIES, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function updateProperty(id, data) {
  await updateDoc(doc(db, COLLECTIONS.PROPERTIES, id), {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function deleteProperty(id) {
  await deleteDoc(doc(db, COLLECTIONS.PROPERTIES, id));
}

export async function getProperties(filters = {}, sortField = 'createdAt', sortDir = 'desc', pageSize = 50) {
  let q = collection(db, COLLECTIONS.PROPERTIES);
  const constraints = [];

  if (filters.status && filters.status !== 'All') {
    constraints.push(where('status', '==', filters.status));
  }
  if (filters.propertyType) {
    constraints.push(where('propertyType', '==', filters.propertyType));
  }
  if (filters.district) {
    constraints.push(where('location.district', '==', filters.district));
  }
  if (filters.taluk) {
    constraints.push(where('location.taluk', '==', filters.taluk));
  }
  if (filters.village) {
    constraints.push(where('location.village', '==', filters.village));
  }

  constraints.push(orderBy(sortField, sortDir));
  constraints.push(limit(pageSize));

  const queryRef = query(q, ...constraints);
  const snap = await getDocs(queryRef);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function subscribeProperties(callback, filters = {}) {
  let constraints = [];

  if (filters.status && filters.status !== 'All') {
    constraints.push(where('status', '==', filters.status));
  }

  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(100));

  const q = query(collection(db, COLLECTIONS.PROPERTIES), ...constraints);
  return onSnapshot(q, (snap) => {
    const properties = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(properties);
  }, (error) => {
    console.error('Properties subscription error:', error);
  });
}

export async function getPropertyStats() {
  const snap = await getDocs(collection(db, COLLECTIONS.PROPERTIES));
  const stats = {
    total: 0,
    available: 0,
    followUp: 0,
    negotiation: 0,
    reserved: 0,
    sold: 0,
    notAvailable: 0
  };

  snap.docs.forEach(d => {
    const data = d.data();
    stats.total++;
    switch (data.status) {
      case 'Available': stats.available++; break;
      case 'Follow Up': stats.followUp++; break;
      case 'Negotiation': stats.negotiation++; break;
      case 'Reserved': stats.reserved++; break;
      case 'Sold': stats.sold++; break;
      case 'Not Available': stats.notAvailable++; break;
    }
  });

  return stats;
}

export async function getRecentProperties(count = 5) {
  const q = query(
    collection(db, COLLECTIONS.PROPERTIES),
    orderBy('createdAt', 'desc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function searchProperties(searchTerm) {
  // Client-side search — Firestore doesn't support full-text search
  // For production, consider Algolia or Typesense
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.PROPERTIES), orderBy('createdAt', 'desc'), limit(200))
  );

  const term = searchTerm.toLowerCase();
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(p => {
      const searchFields = [
        p.propertyCode,
        p.title,
        p.propertyType,
        p.location?.address,
        p.location?.area,
        p.location?.village,
        p.location?.taluk,
        p.location?.district,
        p.owner?.name,
        p.owner?.phone,
        p.notes
      ].filter(Boolean).join(' ').toLowerCase();

      return searchFields.includes(term);
    });
}


// ══════════════════════════════════
// BUYERS
// ══════════════════════════════════

export async function addBuyer(data) {
  const buyerData = {
    ...data,
    status: data.status || 'New',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  const ref = await addDoc(collection(db, COLLECTIONS.BUYERS), buyerData);
  return { id: ref.id, ...buyerData };
}

export async function getBuyer(id) {
  const snap = await getDoc(doc(db, COLLECTIONS.BUYERS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function updateBuyer(id, data) {
  await updateDoc(doc(db, COLLECTIONS.BUYERS, id), {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function deleteBuyer(id) {
  await deleteDoc(doc(db, COLLECTIONS.BUYERS, id));
}

export async function getBuyers() {
  const q = query(collection(db, COLLECTIONS.BUYERS), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}


// ══════════════════════════════════
// BUYER REQUIREMENTS
// ══════════════════════════════════

export async function addBuyerRequirement(data) {
  const reqData = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  const ref = await addDoc(collection(db, COLLECTIONS.BUYER_REQUIREMENTS), reqData);
  return { id: ref.id, ...reqData };
}

export async function getBuyerRequirement(id) {
  const snap = await getDoc(doc(db, COLLECTIONS.BUYER_REQUIREMENTS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getBuyerRequirements(buyerId = null) {
  let q;
  if (buyerId) {
    q = query(
      collection(db, COLLECTIONS.BUYER_REQUIREMENTS),
      where('buyerId', '==', buyerId),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(collection(db, COLLECTIONS.BUYER_REQUIREMENTS), orderBy('createdAt', 'desc'));
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateBuyerRequirement(id, data) {
  await updateDoc(doc(db, COLLECTIONS.BUYER_REQUIREMENTS, id), {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function deleteBuyerRequirement(id) {
  await deleteDoc(doc(db, COLLECTIONS.BUYER_REQUIREMENTS, id));
}


// ══════════════════════════════════
// PROPERTY MATCHING
// ══════════════════════════════════

export async function findMatchingProperties(requirement) {
  // Get all available properties
  const q = query(
    collection(db, COLLECTIONS.PROPERTIES),
    where('status', '==', 'Available'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  const properties = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  // Score each property
  const matches = properties.map(prop => {
    const score = calculateMatchScore(requirement, prop);
    return { ...prop, matchScore: score };
  });

  // Filter and sort by score
  return matches
    .filter(m => m.matchScore.total > 0)
    .sort((a, b) => b.matchScore.total - a.matchScore.total);
}

function calculateMatchScore(requirement, property) {
  const factors = [];
  let total = 0;
  const maxScore = 6;

  // 1. Location match
  const reqLocation = (requirement.location || '').toLowerCase();
  const propLocations = [
    property.location?.village,
    property.location?.area,
    property.location?.taluk,
    property.location?.district
  ].filter(Boolean).map(l => l.toLowerCase());

  if (reqLocation && propLocations.some(l => l.includes(reqLocation) || reqLocation.includes(l))) {
    total++;
    factors.push({ factor: 'Location', matched: true });
  } else if (reqLocation) {
    factors.push({ factor: 'Location', matched: false });
  }

  // 2. Property type match
  if (requirement.propertyType && property.propertyType) {
    if (requirement.propertyType === property.propertyType) {
      total++;
      factors.push({ factor: 'Property Type', matched: true });
    } else {
      factors.push({ factor: 'Property Type', matched: false });
    }
  }

  // 3. Land size match
  const propSize = parseFloat(property.landDetails?.landSize) || 0;
  const minSize = parseFloat(requirement.minSize) || 0;
  const maxSize = parseFloat(requirement.maxSize) || Infinity;

  if (propSize > 0 && (minSize > 0 || maxSize < Infinity)) {
    if (propSize >= minSize && propSize <= maxSize) {
      total++;
      factors.push({ factor: 'Land Size', matched: true });
    } else {
      factors.push({ factor: 'Land Size', matched: false });
    }
  }

  // 4. Budget match
  const propPrice = parseFloat(property.price?.expectedPrice) || 0;
  const minBudget = parseFloat(requirement.minBudget) || 0;
  const maxBudget = parseFloat(requirement.maxBudget) || Infinity;

  if (propPrice > 0 && (minBudget > 0 || maxBudget < Infinity)) {
    if (propPrice >= minBudget && propPrice <= maxBudget) {
      total++;
      factors.push({ factor: 'Budget', matched: true });
    } else {
      factors.push({ factor: 'Budget', matched: false });
    }
  }

  // 5. Road requirement
  const reqRoad = parseFloat(requirement.roadWidth) || 0;
  const propRoad = parseFloat(property.landDetails?.roadWidth) || 0;

  if (reqRoad > 0 && propRoad > 0) {
    if (propRoad >= reqRoad) {
      total++;
      factors.push({ factor: 'Road Width', matched: true });
    } else {
      factors.push({ factor: 'Road Width', matched: false });
    }
  }

  // 6. Features (corner, road facing)
  let featureMatched = false;
  if (requirement.cornerRequired && property.landDetails?.cornerProperty) {
    featureMatched = true;
  }
  if (requirement.roadFacingRequired && property.landDetails?.roadFacing) {
    featureMatched = true;
  }
  if (featureMatched) {
    total++;
    factors.push({ factor: 'Features', matched: true });
  }

  // Determine match level
  const percentage = factors.length > 0 ? (total / factors.length) * 100 : 0;
  let level = 'Partial Match';
  if (percentage >= 90) level = 'Exact Match';
  else if (percentage >= 60) level = 'Good Match';

  return { total, maxScore: factors.length, percentage, level, factors };
}


// ══════════════════════════════════
// LEADS
// ══════════════════════════════════

export async function addLead(data) {
  const leadData = {
    ...data,
    status: data.status || 'New',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  const ref = await addDoc(collection(db, COLLECTIONS.LEADS), leadData);
  return { id: ref.id, ...leadData };
}

export async function getLead(id) {
  const snap = await getDoc(doc(db, COLLECTIONS.LEADS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getLeads() {
  const q = query(collection(db, COLLECTIONS.LEADS), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateLead(id, data) {
  await updateDoc(doc(db, COLLECTIONS.LEADS, id), {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function deleteLead(id) {
  await deleteDoc(doc(db, COLLECTIONS.LEADS, id));
}


// ══════════════════════════════════
// SITE VISITS
// ══════════════════════════════════

export async function addSiteVisit(data) {
  const visitData = {
    ...data,
    status: data.status || 'Scheduled',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  const ref = await addDoc(collection(db, COLLECTIONS.SITE_VISITS), visitData);
  return { id: ref.id, ...visitData };
}

export async function getSiteVisit(id) {
  const snap = await getDoc(doc(db, COLLECTIONS.SITE_VISITS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getSiteVisits() {
  const q = query(collection(db, COLLECTIONS.SITE_VISITS), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getUpcomingSiteVisits(count = 5) {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const q = query(
    collection(db, COLLECTIONS.SITE_VISITS),
    where('status', '==', 'Scheduled'),
    orderBy('date', 'asc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateSiteVisit(id, data) {
  await updateDoc(doc(db, COLLECTIONS.SITE_VISITS, id), {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function deleteSiteVisit(id) {
  await deleteDoc(doc(db, COLLECTIONS.SITE_VISITS, id));
}

export { COLLECTIONS };
