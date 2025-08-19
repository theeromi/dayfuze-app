import React, { createContext, useContext, useState, useEffect } from 'react';

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector for element to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'input' | 'scroll' | 'wait';
  optional?: boolean;
}

interface TutorialState {
  isActive: boolean;
  currentStep: number;
  steps: TutorialStep[];
  completed: boolean;
  skipped: boolean;
}

interface TutorialContextType {
  tutorialState: TutorialState;
  startTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  resetTutorial: () => void;
  markStepComplete: (stepId: string) => void;
}

const defaultSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to DayFuse!',
    content: 'Let\'s take a quick tour to help you get started with managing your tasks efficiently.',
    target: 'body',
    position: 'center'
  },
  {
    id: 'add-task-fab',
    title: 'Add Your First Task',
    content: 'Click this button to create a new task. This is your primary way to add tasks quickly.',
    target: '[data-testid="fab-add-task"]',
    position: 'left',
    action: 'click'
  },
  {
    id: 'task-form',
    title: 'Task Details',
    content: 'Fill in your task title, set a due date, choose priority, and add any notes. All fields except title are optional.',
    target: '[data-testid="modal-add-task"]',
    position: 'right',
    action: 'input'
  },
  {
    id: 'dashboard-overview',
    title: 'Your Dashboard',
    content: 'This is your dashboard where you can see task summaries, today\'s tasks, and quick stats about your productivity.',
    target: '[data-testid="page-dashboard"]',
    position: 'center'
  },
  {
    id: 'navigation',
    title: 'Easy Navigation',
    content: 'Use these tabs to navigate between your dashboard, all tasks, timeline view, and profile settings.',
    target: '[data-testid="nav-header"]',
    position: 'bottom'
  },
  {
    id: 'task-list',
    title: 'Manage Your Tasks',
    content: 'View all your tasks here. You can filter by category, search, and mark tasks as complete by clicking the checkbox.',
    target: '[data-testid="page-tasks"]',
    position: 'center'
  },
  {
    id: 'timeline',
    title: 'Timeline View',
    content: 'See your tasks organized chronologically. This helps you plan your day and track your progress over time.',
    target: '[data-testid="page-timeline"]',
    position: 'center'
  },
  {
    id: 'profile',
    title: 'Your Profile',
    content: 'Manage your account, enable notifications, change themes, and access settings from your profile page.',
    target: '[data-testid="page-profile"]',
    position: 'center'
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    content: 'Great job! You now know how to use DayFuse effectively. Start adding your tasks and boost your productivity!',
    target: 'body',
    position: 'center'
  }
];

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [tutorialState, setTutorialState] = useState<TutorialState>(() => {
    const saved = localStorage.getItem('dayfuse-tutorial-state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.warn('Failed to parse tutorial state:', error);
      }
    }
    
    return {
      isActive: false,
      currentStep: 0,
      steps: defaultSteps,
      completed: false,
      skipped: false
    };
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('dayfuse-tutorial-state', JSON.stringify(tutorialState));
  }, [tutorialState]);

  const startTutorial = () => {
    setTutorialState(prev => ({
      ...prev,
      isActive: true,
      currentStep: 0,
      completed: false,
      skipped: false
    }));
  };

  const nextStep = () => {
    setTutorialState(prev => {
      const nextStepIndex = prev.currentStep + 1;
      if (nextStepIndex >= prev.steps.length) {
        return {
          ...prev,
          isActive: false,
          completed: true,
          currentStep: prev.steps.length - 1
        };
      }
      return {
        ...prev,
        currentStep: nextStepIndex
      };
    });
  };

  const prevStep = () => {
    setTutorialState(prev => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1)
    }));
  };

  const skipTutorial = () => {
    setTutorialState(prev => ({
      ...prev,
      isActive: false,
      skipped: true
    }));
  };

  const completeTutorial = () => {
    setTutorialState(prev => ({
      ...prev,
      isActive: false,
      completed: true
    }));
  };

  const resetTutorial = () => {
    setTutorialState({
      isActive: false,
      currentStep: 0,
      steps: defaultSteps,
      completed: false,
      skipped: false
    });
  };

  const markStepComplete = (stepId: string) => {
    // Optional: track individual step completion
    console.log(`Tutorial step completed: ${stepId}`);
  };

  return (
    <TutorialContext.Provider 
      value={{
        tutorialState,
        startTutorial,
        nextStep,
        prevStep,
        skipTutorial,
        completeTutorial,
        resetTutorial,
        markStepComplete
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}