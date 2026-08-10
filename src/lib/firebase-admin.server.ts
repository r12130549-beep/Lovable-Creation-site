import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, terminate, writeBatch, FieldValue, Timestamp, connectFirestoreEmulator } from 'firebase/firestore';
import { getDatabase, ref, get, set, update, remove, push } from 'firebase/database';
import { firebaseConfig } from './firebase';

/**
 * Initialize Firebase Web SDK on the server.
 * 
 * IMPORTANT: To resolve 'Missing or insufficient permissions' (PERMISSION_DENIED)
 * when using the Web SDK on the server, we must ensure the Firestore rules are permissive
 * AND the SDK is correctly handling connections in a serverless environment.
 */
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const adminFirestore = getFirestore(app);
export const adminDatabase = getDatabase(app);

// Helper to force a fresh connection if needed (debugging)
export const resetFirestore = async () => {
  try {
    await terminate(adminFirestore);
  } catch (e) {
    console.error("Error terminating firestore:", e);
  }
};

// --- Re-exporting Web SDK methods as "Admin" aliases for compatibility ---
export { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  ref,
  get,
  set,
  update,
  remove,
  push,
  writeBatch,
  FieldValue,
  Timestamp
};
