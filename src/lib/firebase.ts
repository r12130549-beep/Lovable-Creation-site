import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBvh8MNr3kVKt4FJlXIRGG-pVBmyC_GFO8",
  authDomain: "shark-extension.firebaseapp.com",
  projectId: "shark-extension",
  storageBucket: "shark-extension.firebasestorage.app",
  messagingSenderId: "968318734474",
  appId: "1:968318734474:web:fb11f1bcf0d2dec3b6dd73",
  measurementId: "G-GCKEGMX7WF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const firestore = getFirestore(app);
export default app;