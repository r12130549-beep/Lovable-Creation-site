import { getApps, getApp, FirebaseApp, initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { getDatabase, ref, get, set, update, push, remove } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBvh8MNr3kVKt4FJlXIRGG-pVBmyC_GFO8",
  authDomain: "lovable-a893f.firebaseapp.com",
  projectId: "lovable-a893f",
  storageBucket: "lovable-a893f.firebasestorage.app",
  databaseURL: "https://lovable-a893f-default-rtdb.firebaseio.com",
  messagingSenderId: "755506465353",
  appId: "1:755506465353:web:68e9ce259f56a913154d98",
  measurementId: "G-D9RZXBYKX3"
};

let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const adminFirestore = getFirestore(app);
export const adminDatabase = getDatabase(app);

export { 
  collection, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, doc,
  ref, get, set, update, push, remove
};
