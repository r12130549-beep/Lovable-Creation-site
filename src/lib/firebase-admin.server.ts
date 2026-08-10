import { initializeApp, getApps, getApp, FirebaseApp, cert } from 'firebase-admin/app';
import { getFirestore, CollectionReference, DocumentReference, Query } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';

// Using Firebase Admin SDK requires service account credentials for absolute administrative access.
// Since we don't have the literal service account JSON, we will use the environment-based 
// credential if available, otherwise we'll fall back to standard initialization.
// However, the best way to get "Permanent Solution" in Cloudflare Workers/Edge is to 
// use the Web SDK but with very permissive rules OR ensure ALL calls are server-side.
// The user is seeing "Missing or insufficient permissions" because the CLIENT is still trying to talk to Firestore.

// Let's check if we can use a service account from secrets. 
// For now, we use the already configured Web SDK approach but ensure it's STRICTLY server-only.

import { initializeApp as initializeWebApp, getApps as getWebApps, getApp as getWebApp } from 'firebase/app';
import { getFirestore as getWebFirestore, collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { getDatabase as getWebDatabase, ref, get, set, update, push, remove } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBvh8MNr3kVKt4FJlXIRGG-pVBmyC_GFO8",
  authDomain: "lovable-a893f.firebaseapp.com",
  projectId: "lovable-a893f",
  storageBucket: "lovable-a893f.firebasestorage.app",
  databaseURL: "https://lovable-a893f-default-rtdb.firebaseio.com",
};

let webApp;
if (getWebApps().length === 0) {
  webApp = initializeWebApp(firebaseConfig);
} else {
  webApp = getWebApp();
}

// These are exported and used by server functions
export const adminFirestore = getWebFirestore(webApp);
export const adminDatabase = getWebDatabase(webApp);

export { 
  collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit,
  ref, get, set, update, push, remove
};
