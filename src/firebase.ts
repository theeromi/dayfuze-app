import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - dayfuse-web project
const firebaseConfig = {
  apiKey: "AIzaSyBL2d_IwH6JkK4sZMJypA_Vf-S3RlxvmGc",
  authDomain: "dayfuse-web.firebaseapp.com",
  projectId: "dayfuse-web",
  storageBucket: "dayfuse-web.firebasestorage.app",
  messagingSenderId: "593450445384",
  appId: "1:593450445384:web:b7ce3b6b34124c97f9c67d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;