import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBvh8MNr3kVKt4FJlXIRGG-pVBmyC_GFO8", // Hardcoded per user request, normally use VITE_GOOGLE_API_KEY
  authDomain: "do-you-know-fe718.firebaseapp.com",
  databaseURL: "https://do-you-know-fe718-default-rtdb.firebaseio.com",
  projectId: "do-you-know-fe718",
  storageBucket: "do-you-know-fe718.firebasestorage.app",
  messagingSenderId: "386831264788",
  appId: "1:386831264788:web:1d4089af3eafaa18f68b01",
  measurementId: "G-E7VW0KV2T3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const firestore = getFirestore(app);
export default app;