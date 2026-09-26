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
  const snap = await getDocs(collection(db, COLLECTIONS.PROPERTIES));
  let nextNum = 1;
  if (!snap.empty) {
    const properties = snap.docs.map(d => d.data());
    properties.sort((a, b) => {
      let tA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      let tB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return tB - tA;
    });
    const lastCode = properties[0]?.propertyCode || 'PROP-0000';
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
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.PROPERTIES));
    let properties = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Apply JS filters
    if (filters.status && filters.status !== 'All') {
      properties = properties.filter(p => p.status === filters.status);
    }
    if (filters.propertyType) {
      properties = properties.filter(p => p.propertyType === filters.propertyType);
    }
    if (filters.district) {
      properties = properties.filter(p => p.location?.district === filters.district);
    }
    if (filters.taluk) {
      properties = properties.filter(p => p.location?.taluk === filters.taluk);
    }
    if (filters.village) {
      properties = properties.filter(p => p.location?.village === filters.village);
    }
    if (filters.minSize) {
      properties = properties.filter(p => (parseFloat(p.landDetails?.landSize) || 0) >= parseFloat(filters.minSize));
    }
    if (filters.maxSize) {
      properties = properties.filter(p => (parseFloat(p.landDetails?.landSize) || 0) <= parseFloat(filters.maxSize));
    }
    if (filters.minBudget) {
      properties = properties.filter(p => (parseFloat(p.price?.expectedPrice) || 0) >= parseFloat(filters.minBudget));
    }
    if (filters.maxBudget) {
      properties = properties.filter(p => (parseFloat(p.price?.expectedPrice) || 0) <= parseFloat(filters.maxBudget));
    }

    // Apply JS sorting
    properties.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (valA && typeof valA.toDate === 'function') valA = valA.toDate().getTime();
      if (valB && typeof valB.toDate === 'function') valB = valB.toDate().getTime();

      if (valA == null) valA = 0;
      if (valB == null) valB = 0;

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return properties.slice(0, pageSize);
  } catch (err) {
    console.error('getProperties error:', err);
    return [];
  }
}

export function subscribeProperties(callback, filters = {}) {
  const q = collection(db, COLLECTIONS.PROPERTIES);
  return onSnapshot(q, (snap) => {
    let properties = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (filters.status && filters.status !== 'All') {
      properties = properties.filter(p => p.status === filters.status);
    }
    if (filters.propertyType) {
      properties = properties.filter(p => p.propertyType === filters.propertyType);
    }

    properties.sort((a, b) => {
      let tA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      let tB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return tB - tA;
    });

    callback(properties.slice(0, 100));
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
  const snap = await getDocs(collection(db, COLLECTIONS.PROPERTIES));
  const properties = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  properties.sort((a, b) => {
    let tA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
    let tB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
    return tB - tA;
  });
  return properties.slice(0, count);
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
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.BUYERS));
    const buyers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    buyers.sort((a, b) => {
      let tA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      let tB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return tB - tA;
    });
    return buyers;
  } catch (err) {
    console.error('getBuyers error:', err);
    return [];
  }
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
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.BUYER_REQUIREMENTS));
    let reqs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (buyerId) {
      reqs = reqs.filter(r => r.buyerId === buyerId);
    }
    reqs.sort((a, b) => {
      let tA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      let tB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return tB - tA;
    });
    return reqs;
  } catch (err) {
    console.error('getBuyerRequirements error:', err);
    return [];
  }
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
  try {
    // Get all available properties
    const snap = await getDocs(collection(db, COLLECTIONS.PROPERTIES));
    const properties = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(p => p.status === 'Available' || !p.status);

    // Score each property
    const matches = properties.map(prop => {
      const score = calculateMatchScore(requirement, prop);
      return { ...prop, matchScore: score };
    });

    // Filter and sort by score
    return matches
      .filter(m => m.matchScore.total > 0)
      .sort((a, b) => b.matchScore.total - a.matchScore.total);
  } catch (err) {
    console.error('findMatchingProperties error:', err);
    return [];
  }
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
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.LEADS));
    const leads = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    leads.sort((a, b) => {
      let tA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      let tB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return tB - tA;
    });
    return leads;
  } catch (err) {
    console.error('getLeads error:', err);
    return [];
  }
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
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.SITE_VISITS));
    const visits = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    visits.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return visits;
  } catch (err) {
    console.error('getSiteVisits error:', err);
    return [];
  }
}

export async function getUpcomingSiteVisits(count = 5) {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.SITE_VISITS));
    let visits = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    visits = visits.filter(v => v.status === 'Scheduled');
    visits.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    return visits.slice(0, count);
  } catch (err) {
    console.error('getUpcomingSiteVisits error:', err);
    return [];
  }
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

