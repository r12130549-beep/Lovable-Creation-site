import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';
import { firebaseConfig } from './firebase';

/**
 * Initialize Firebase Admin SDK using the credentials if available.
 */
let app;
if (getApps().length === 0) {
  try {
    app = initializeApp({
      projectId: firebaseConfig.projectId,
      databaseURL: firebaseConfig.databaseURL
    });
  } catch (error) {
    console.warn("Firebase Admin init warning:", error);
    app = initializeApp();
  }
} else {
  app = getApp();
}

export const adminFirestore = getFirestore(app);
export const adminDatabase = getDatabase(app);

// Re-export methods and types from firestore directly where needed
// Note: In firebase-admin, these are slightly different from the Web SDK
export { FieldValue, Timestamp };

// Helper to bridge the gap if any code expects these Web SDK style helpers
export const collection = (db: any, path: string) => db.collection(path);
export const doc = (dbOrColl: any, path?: string, ...rest: string[]) => {
  if (path && rest.length > 0) {
    return dbOrColl.doc(`${path}/${rest.join('/')}`);
  }
  return path ? dbOrColl.doc(path) : dbOrColl.doc();
};
export const getDocs = (query: any) => query.get();
export const getDoc = (ref: any) => ref.get();
export const setDoc = (ref: any, data: any, options?: any) => ref.set(data, options);
export const updateDoc = (ref: any, data: any) => ref.update(data);
export const deleteDoc = (ref: any) => ref.delete();
export const query = (coll: any, ...constraints: any[]) => {
  let q = coll;
  // This is a simplified shim for the server-side Admin SDK
  // which uses chaining instead of the query() helper
  return q;
};
export const where = (field: string, op: any, value: any) => ({ type: 'where', field, op, value });
export const orderBy = (field: string, dir: any) => ({ type: 'orderBy', field, dir });
export const limit = (n: number) => ({ type: 'limit', n });

export const resetFirestore = async () => {
  // terminate() is not available on adminFirestore
  return Promise.resolve();
};

export const ref = (db: any, path: string) => db.ref(path);
export const get = (ref: any) => ref.get();
export const set = (ref: any, value: any) => ref.set(value);
export const update = (ref: any, value: any) => ref.update(value);
export const remove = (ref: any) => ref.remove();
export const push = (ref: any) => ref.push();
export const writeBatch = (db: any) => db.batch();
