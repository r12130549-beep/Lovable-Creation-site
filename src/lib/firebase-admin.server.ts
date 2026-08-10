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
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Firestore with long polling to avoid gRPC issues in serverless
export const adminFirestore = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
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
