import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration (same as web version)
const firebaseConfig = {
  apiKey: "AIzaSyBGK8R5fxLYDfb_iA8BNlXDY2gR8Lxf_v4",
  authDomain: "dayfuse-web.firebaseapp.com",
  projectId: "dayfuse-web",
  storageBucket: "dayfuse-web.firebasestorage.app",
  messagingSenderId: "472463629920",
  appId: "1:472463629920:web:3e4d4f4f4f4f4f4f4f4f4f",
  measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      
      // Store user info for offline access
      if (firebaseUser) {
        await AsyncStorage.setItem('user', JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        }));
      } else {
        await AsyncStorage.removeItem('user');
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const signUp = async (email: string, password: string): Promise<void> => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create account');
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      await AsyncStorage.clear(); // Clear all stored data
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};