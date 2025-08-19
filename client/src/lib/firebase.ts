import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dayfuse-web.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dayfuse-web",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dayfuse-web.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id"
};

console.log('Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? '✓ Set' : '✗ Missing',
  projectId: firebaseConfig.projectId,
  appId: firebaseConfig.appId ? '✓ Set' : '✗ Missing'
});

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);