import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  User, 
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  handleAuth: (email: string, password: string, isLogin: boolean, name?: string) => Promise<void>;
  handleLogout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (currentPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const handleAuth = async (email: string, password: string, isLogin: boolean, name?: string) => {
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name && userCredential.user) {
          await updateProfile(userCredential.user, {
            displayName: name
          });
          
          // Store user profile with first login time
          const userDocRef = doc(db, 'users', userCredential.user.uid);
          await setDoc(userDocRef, {
            firstLoginTime: serverTimestamp(),
            displayName: name,
            email: email,
            createdAt: serverTimestamp()
          });
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!currentUser || !currentUser.email) {
      throw new Error('No user is currently logged in');
    }

    try {
      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      
      // Update password
      await updatePassword(currentUser, newPassword);
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  };

  const deleteAccount = async (currentPassword: string) => {
    if (!currentUser || !currentUser.email) {
      throw new Error('No user is currently logged in');
    }

    try {
      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      
      // Delete user account
      await deleteUser(currentUser);
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    handleAuth,
    handleLogout,
    sendPasswordReset,
    changePassword,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}