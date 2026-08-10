import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

// The firebaseConfig is exported to be used by the server-side as well
export const firebaseConfig = {
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

export const auth = getAuth(app);
export const db = getDatabase(app);
export const firestore = getFirestore(app);
export default app;
