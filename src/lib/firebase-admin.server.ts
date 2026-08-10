import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { getDatabase, ref, get, set, update, push, remove } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBvh8MNr3kVKt4FJlXIRGG-pVBmyC_GFO8",
  authDomain: "lovable-a893f.firebaseapp.com",
  projectId: "lovable-a893f",
  storageBucket: "lovable-a893f.firebasestorage.app",
  databaseURL: "https://lovable-a893f-default-rtdb.firebaseio.com",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const adminFirestore = getFirestore(app);
export const adminDatabase = getDatabase(app);

export { 
  collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit,
  ref, get, set, update, push, remove
};
