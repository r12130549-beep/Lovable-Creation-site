import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { getDatabase, ref, get, set, update, remove, push } from 'firebase/database';
import { firebaseConfig } from './firebase';

/**
 * Initialize Firebase Web SDK on the server.
 * Note: To bypass client-side RLS (Row Level Security) when running on the server 
 * in an environment where the Admin SDK is problematic, we use the Web SDK.
 * 
 * IMPORTANT: Because this is a Web SDK instance, it still respects Firestore Security Rules.
 * You MUST ensure your firestore.rules allow "read, write: if true" (Public) 
 * for this specific backend project if you want the server functions to bypass auth checks.
 */
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const adminFirestore = getFirestore(app);
export const adminDatabase = getDatabase(app);

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
  push
};
