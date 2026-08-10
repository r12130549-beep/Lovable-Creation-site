import * as admin from 'firebase-admin';

const projectId = "lovable-a893f";

if (admin.apps.length === 0) {
  admin.initializeApp({
    projectId: projectId,
  });
}

export const adminFirestore = admin.firestore();
export const adminDatabase = admin.database();

export const collection = (db: any, path: string) => db.collection(path);
export const doc = (db: any, path: string, ...segments: string[]) => {
  if (typeof db.collection === 'function') {
    return db.collection(path).doc(segments.join('/'));
  }
  return db.doc(path + (segments.length ? '/' + segments.join('/') : ''));
};

export const getDocs = async (query: any) => {
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
};

export const getDoc = async (docRef: any) => {
  const snapshot = await docRef.get();
  return {
    exists: () => snapshot.exists,
    data: () => snapshot.data(),
    id: snapshot.id
  };
};

export const setDoc = async (docRef: any, data: any, options?: { merge?: boolean }) => {
  if (options?.merge) {
    return await docRef.set(data, { merge: true });
  }
  return await docRef.set(data);
};
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

export const ref = (db: any, path: string) => db.ref(path);
export const get = async (nodeRef: any) => await nodeRef.once('value');
export const set = async (nodeRef: any, val: any) => await nodeRef.set(val);
export const update = async (nodeRef: any, val: any) => await nodeRef.update(val);
export const remove = async (nodeRef: any) => await nodeRef.remove();
export const push = (nodeRef: any) => nodeRef.push();
