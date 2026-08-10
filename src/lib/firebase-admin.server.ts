import admin from 'firebase-admin';

// The Web SDK (firebase/app) in a server function environment (Cloudflare Workers / workerd)
// still respects security rules because it's essentially a client-side SDK running on a server.
// To bypass rules, we need the Admin SDK, which uses Service Account credentials.
// If we don't have a service account key, we must ensure Firestore Rules are fully open (allow read, write: if true;).

const projectId = "lovable-a893f";

if (admin.apps.length === 0) {
  // We initialize with a minimal config if no service account is available.
  // Note: Without a real service account key, even the Admin SDK might fail
  // if it can't find credentials in the environment.
  admin.initializeApp({
    projectId: projectId,
  });
}

export const adminFirestore = admin.firestore();
export const adminDatabase = admin.database();

// Re-export firestore methods from the admin SDK
export const collection = (db: any, path: string) => db.collection(path);
export const doc = (db: any, path: string, ...segments: string[]) => {
  if (segments.length > 0) {
    return db.collection(path).doc(segments.join('/'));
  }
  // Handle doc(collectionRef) case
  if (typeof path === 'string') return db.doc(path);
  return path;
};

// Simple wrappers for common operations to match the Web SDK signature used in the app
export const getDocs = async (query: any) => {
  const snapshot = await query.get();
  return {
    docs: snapshot.docs.map((d: any) => ({
      id: d.id,
      data: () => d.data(),
    }))
  };
};

export const getDoc = async (docRef: any) => {
  const snapshot = await docRef.get();
  return {
    exists: () => snapshot.exists,
    data: () => snapshot.data(),
    id: snapshot.id
  };
};

export const setDoc = async (docRef: any, data: any) => await docRef.set(data);
export const updateDoc = async (docRef: any, data: any) => await docRef.update(data);
export const deleteDoc = async (docRef: any) => await docRef.delete();

export const query = (colRef: any, ...constraints: any[]) => {
  let q = colRef;
  for (const constraint of constraints) {
    if (constraint.type === 'where') q = q.where(constraint.field, constraint.op, constraint.val);
    if (constraint.type === 'orderBy') q = q.orderBy(constraint.field, constraint.dir);
    if (constraint.type === 'limit') q = q.limit(constraint.val);
  }
  return q;
};

export const where = (field: string, op: string, val: any) => ({ type: 'where', field, op, val });
export const orderBy = (field: string, dir: string = 'asc') => ({ type: 'orderBy', field, dir });
export const limit = (val: number) => ({ type: 'limit', val });

// Realtime Database wrappers
export const ref = (db: any, path: string) => db.ref(path);
export const get = async (nodeRef: any) => await nodeRef.once('value');
export const set = async (nodeRef: any, val: any) => await nodeRef.set(val);
export const update = async (nodeRef: any, val: any) => await nodeRef.update(val);
export const remove = async (nodeRef: any) => await nodeRef.remove();
export const push = (nodeRef: any) => nodeRef.push();
