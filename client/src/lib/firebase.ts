import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Log configuration for debugging (remove in production)
console.log('Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? '✓ Set' : '✗ Missing',
  projectId: firebaseConfig.projectId || '✗ Missing',
  appId: firebaseConfig.appId ? '✓ Set' : '✗ Missing'
});

// Initialize Firebase (avoid duplicate apps during hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Only connect to emulators if explicitly enabled
// Disabled for production Firebase connection
// if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS) {
//   try {
//     connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
//     connectFirestoreEmulator(db, "localhost", 8080);
//   } catch (error) {
//     // Emulators may already be connected
//   }
// }

export default app;
