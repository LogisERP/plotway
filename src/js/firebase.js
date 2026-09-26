// Firebase initialization module
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import firebaseConfig from './config/firebase-config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Enable offline persistence
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore persistence not available in this browser');
    }
  });
} catch (e) {
  console.warn('Firestore persistence setup error:', e);
}

// Authentication state
let currentUser = null;

/**
 * Initialize authentication — uses anonymous auth for the private broker app.
 * Can be upgraded to email/password or phone auth later.
 */
export async function initAuth() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUser = user;
        resolve(user);
      } else {
        try {
          const result = await signInAnonymously(auth);
          currentUser = result.user;
          resolve(result.user);
        } catch (error) {
          console.error('Auth error:', error);
          resolve(null);
        }
      }
    });
  });
}

export function getCurrentUser() {
  return currentUser;
}

export { app, db, auth };
