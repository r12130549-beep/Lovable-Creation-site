import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBvh8MNr3kVKt4FJlXIRGG-pVBmyC_GFO8", // Using the hardcoded key that was previously successful
  authDomain: "lovable-a893f.firebaseapp.com",
  projectId: "lovable-a893f",
  storageBucket: "lovable-a893f.firebasestorage.app",
  messagingSenderId: "755506465353",
  appId: "1:755506465353:web:68e9ce259f56a913154d98",
  measurementId: "G-D9RZXBYKX3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const firestore = getFirestore(app);
export default app;