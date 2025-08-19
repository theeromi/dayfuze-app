import { createContext, useContext, useState, ReactNode } from "react";

interface CelebrationContextType {
  showStreakCelebration: (streakCount: number) => void;
  showMilestoneCelebration: (milestone: number) => void;
  currentCelebration: CelebrationType | null;
  closeCelebration: () => void;
}

export interface CelebrationType {
  type: 'streak' | 'milestone';
  message: string;
  count: number;
}

const CelebrationContext = createContext<CelebrationContextType | undefined>(undefined);

export function useCelebration() {
  const context = useContext(CelebrationContext);
  if (context === undefined) {
    throw new Error("useCelebration must be used within a CelebrationProvider");
  }
  return context;
}

interface CelebrationProviderProps {
  children: ReactNode;
}

export function CelebrationProvider({ children }: CelebrationProviderProps) {
  const [currentCelebration, setCurrentCelebration] = useState<CelebrationType | null>(null);

  const showStreakCelebration = (streakCount: number) => {
    setCurrentCelebration({
      type: 'streak',
      message: `${streakCount} tasks completed in a row!`,
      count: streakCount
    });
  };

  const showMilestoneCelebration = (milestone: number) => {
    const messages = {
      5: "First 5 tasks completed! 🎉",
      10: "10 tasks down! You're on fire! 🔥",
      25: "25 tasks completed! Productivity master! 🏆",
      50: "50 tasks done! Absolutely amazing! 🌟",
      100: "100 tasks completed! Legendary! 👑"
    };

    setCurrentCelebration({
      type: 'milestone',
      message: messages[milestone as keyof typeof messages] || `${milestone} tasks completed!`,
      count: milestone
    });
  };

  const closeCelebration = () => {
    setCurrentCelebration(null);
  };

  return (
    <CelebrationContext.Provider value={{
      showStreakCelebration,
      showMilestoneCelebration,
      currentCelebration,
      closeCelebration
    }}>
      {children}
    </CelebrationContext.Provider>
  );
}