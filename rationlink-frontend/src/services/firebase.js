import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration using environment variables with fallback dummy values for local development.
// Firebase Spark (free tier) plan does not require billing and works perfectly with these configurations.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForLocalDev12345678",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "rationlink-free.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "rationlink-free",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "rationlink-free.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcd1234efgh5678"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
