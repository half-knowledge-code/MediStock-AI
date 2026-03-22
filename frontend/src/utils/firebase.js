import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBiMDF0AB8k2gW-2bdyJxQLQezQ-O68D5o",
  authDomain: "medistock-ai-f43ca.firebaseapp.com",
  projectId: "medistock-ai-f43ca",
  storageBucket: "medistock-ai-f43ca.firebasestorage.app",
  messagingSenderId: "932623824617",
  appId: "1:932623824617:web:d871beeeed07d03ce92278"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);