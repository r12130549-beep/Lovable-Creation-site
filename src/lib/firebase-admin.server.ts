import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, 
  query, where, orderBy, limit, writeBatch, FieldValue, Timestamp,
  initializeFirestore, terminate
} from 'firebase/firestore';
import { getDatabase, ref, get, set, update, remove, push } from 'firebase/database';
import { firebaseConfig } from './firebase';

/**
 * Initialize Firebase Web SDK on the server with settings optimized for 
 * serverless/worker environments (disabling gRPC which can be unstable).
 */
function getAdminApp() {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

const app = getAdminApp();

// Initialize Firestore with long polling to avoid gRPC issues in serverless
// Use getFirestore() if it exists to avoid "already initialized" errors
let db;
try {
  db = getFirestore(app);
} catch (e) {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
}

export const adminFirestore = db;
export const adminDatabase = getDatabase(app);

// Helper to force a fresh connection if needed
export const resetFirestore = async () => {
  try {
    await terminate(adminFirestore);
  } catch (e) {
    console.error("Error terminating firestore:", e);
  }
};

// Re-export methods
export { 
  collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, 
  query, where, orderBy, limit, ref, get, set, update, remove, push,
  writeBatch, FieldValue, Timestamp
};
