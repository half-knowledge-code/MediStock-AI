import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB4yTPdL1owwwSNacCPoM2Jn8agkS7sny4",
  authDomain: "medstockai.firebaseapp.com",
  projectId: "medstockai",
  storageBucket: "medstockai.firebasestorage.app",
  messagingSenderId: "414690444711",
  appId: "1:414690444711:web:ebe101a5f58d9bdf35e282"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);   // ⭐ ye line add karo