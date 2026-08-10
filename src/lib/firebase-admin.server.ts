import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';

// NOTE: In a real Cloudflare Worker environment with nodejs_compat, 
// we should ideally use the Firebase JS SDK (web) with service account credentials 
// or the REST API if the admin SDK is too heavy or has incompatible dependencies.
// However, since we are in a Lovable environment where we want to "connect to firebase",
// we will provide a pattern for server-side access.

const firebaseConfig = {
  apiKey: "AIzaSyBvh8MNr3kVKt4FJlXIRGG-pVBmyC_GFO8",
  authDomain: "lovable-a893f.firebaseapp.com",
  projectId: "lovable-a893f",
  storageBucket: "lovable-a893f.firebasestorage.app",
  databaseURL: "https://lovable-a893f-default-rtdb.firebaseio.com",
};

// Use the Web SDK on server for better compatibility with Worker runtimes
import { initializeApp as initializeWebApp } from 'firebase/app';
import { getFirestore as getWebFirestore, collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { getDatabase as getWebDatabase, ref, get, set, update, push, remove } from 'firebase/database';

const app = getApps().length === 0 ? initializeWebApp(firebaseConfig) : getApps()[0];

export const adminFirestore = getWebFirestore(app);
export const adminDatabase = getWebDatabase(app);

export { 
  collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit,
  ref, get, set, update, push, remove
};
