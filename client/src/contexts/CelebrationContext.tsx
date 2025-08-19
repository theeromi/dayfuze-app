import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CelebrationContextType {
  showCelebration: boolean;
  celebrationType: 'task' | 'milestone' | 'streak' | null;
  triggerCelebration: (type: 'task' | 'milestone' | 'streak') => void;
  hideCelebration: () => void;
}

const CelebrationContext = createContext<CelebrationContextType | undefined>(undefined);

export function useCelebration() {
  const context = useContext(CelebrationContext);
  if (context === undefined) {
    throw new Error('useCelebration must be used within a CelebrationProvider');
  }
  return context;
}

interface CelebrationProviderProps {
  children: ReactNode;
}

export function CelebrationProvider({ children }: CelebrationProviderProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'task' | 'milestone' | 'streak' | null>(null);

  const triggerCelebration = (type: 'task' | 'milestone' | 'streak') => {
    setCelebrationType(type);
    setShowCelebration(true);
    
    // Auto-hide after animation
    setTimeout(() => {
      setShowCelebration(false);
      setCelebrationType(null);
    }, 3000);
  };

  const hideCelebration = () => {
    setShowCelebration(false);
    setCelebrationType(null);
  };

  const value = {
    showCelebration,
    celebrationType,
    triggerCelebration,
    hideCelebration,
  };

  return (
    <CelebrationContext.Provider value={value}>
      {children}
    </CelebrationContext.Provider>
  );
}