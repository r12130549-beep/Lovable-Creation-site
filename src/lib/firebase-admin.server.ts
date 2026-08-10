import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';

const firebaseConfig = {
  projectId: "lovable-a893f",
  databaseURL: "https://lovable-a893f-default-rtdb.firebaseio.com"
};

/**
 * Initialize Firebase Admin SDK.
 */
if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}

export const adminFirestore = getFirestore();
export const adminDatabase = getDatabase();

// --- Compatibility Helpers for Firestore Admin SDK ---
export const collection = (db: any, path: string) => db.collection(path);
export const doc = (dbOrCol: any, path?: string, ...segments: string[]) => {
  if (typeof dbOrCol.collection === 'function' && path) {
    return dbOrCol.collection(path).doc(segments.join('/'));
  }
  if (typeof dbOrCol.doc === 'function' && !path) {
    return dbOrCol.doc();
  }
  if (path) {
    return dbOrCol.doc(path + (segments.length ? '/' + segments.join('/') : ''));
  }
  return dbOrCol.doc();
};

export const getDocs = async (query: any) => {
  try {
    const snapshot = await query.get();
    return {
      docs: snapshot.docs.map((d: any) => ({
        id: d.id,
        data: () => d.data(),
      })),
      empty: snapshot.empty,
      forEach: (callback: (doc: any) => void) => {
        snapshot.docs.forEach((d: any) => callback({
          id: d.id,
          data: () => d.data(),
        }));
      }
    };
  } catch (error: any) {
    console.warn("Firestore Admin getDocs failed:", error.message);
    return { docs: [], empty: true, forEach: () => {} };
  }
};

export const getDoc = async (docRef: any) => {
  try {
    const snapshot = await docRef.get();
    return {
      exists: () => snapshot.exists,
      data: () => snapshot.data(),
      id: snapshot.id
    };
  } catch (error: any) {
    console.warn("Firestore Admin getDoc failed:", error.message);
    return { exists: () => false, data: () => undefined, id: docRef.id };
  }
};

export const setDoc = async (docRef: any, data: any, options?: { merge?: boolean }) => {
  try {
    if (options?.merge) {
      return await docRef.set(data, { merge: true });
    }
    return await docRef.set(data);
  } catch (error: any) {
    console.error("Firestore Admin setDoc failed:", error.message);
    throw error;
  }
};

export const updateDoc = async (docRef: any, data: any) => {
  try {
    return await docRef.update(data);
  } catch (error: any) {
    console.error("Firestore Admin updateDoc failed:", error.message);
    throw error;
  }
};

export const deleteDoc = async (docRef: any) => {
  try {
    return await docRef.delete();
  } catch (error: any) {
    console.error("Firestore Admin deleteDoc failed:", error.message);
    throw error;
  }
};

export const query = (colRef: any, ...constraints: any[]) => {
  let q = colRef;
  for (const constraint of constraints) {
    if (constraint.type === 'where') q = q.where(constraint.field, constraint.op, constraint.val);
    if (constraint.type === 'orderBy') q = q.orderBy(constraint.field, constraint.dir);
    if (constraint.type === 'limit') q = q.limit(constraint.val);
  }
  return q;
};

export const where = (field: string, op: any, val: any) => ({ type: 'where', field, op, val });
export const orderBy = (field: string, dir: any = 'asc') => ({ type: 'orderBy', field, dir });
export const limit = (val: number) => ({ type: 'limit', val });

// --- Realtime Database Helpers ---
export const ref = (db: any, path: string) => db.ref(path);
export const get = async (nodeRef: any) => {
  try {
    return await nodeRef.once('value');
  } catch (error: any) {
    console.warn("RTDB Admin get failed:", error.message);
    throw error;
  }
};
export const set = async (nodeRef: any, val: any) => await nodeRef.set(val);
export const update = async (nodeRef: any, val: any) => await nodeRef.update(val);
export const remove = async (nodeRef: any) => await nodeRef.remove();
export const push = (nodeRef: any) => nodeRef.push();
