import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTutorial } from '@/contexts/TutorialContext';
import WelcomeModal from './WelcomeModal';

export default function FirstTimeUserDetector() {
  const { currentUser, loading } = useAuth();
  const { tutorialState } = useTutorial();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (loading || !currentUser) return;

    // Check if user has seen welcome or completed tutorial
    const hasSeenWelcome = localStorage.getItem('dayfuse-welcome-seen');
    const hasTutorialData = tutorialState.completed || tutorialState.skipped;

    // Show welcome modal for first-time users
    if (!hasSeenWelcome && !hasTutorialData) {
      // Small delay to let the app load properly
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentUser, loading, tutorialState.completed, tutorialState.skipped]);

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    localStorage.setItem('dayfuse-welcome-seen', 'true');
  };

  return (
    <WelcomeModal 
      isOpen={showWelcome} 
      onClose={handleWelcomeClose}
    />
  );
}