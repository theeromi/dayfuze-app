
import React, { useEffect } from 'react';
import { Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UpdatePrompt from '@/components/UpdatePrompt';
import TutorialOverlay from '@/components/TutorialOverlay';
import FirstTimeUserDetector from '@/components/FirstTimeUserDetector';
import { AuthProvider } from '@/contexts/AuthContext';
import { TaskProvider } from '@/contexts/TaskContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { TutorialProvider } from '@/contexts/TutorialContext';

// Pages
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Tasks from '@/pages/Tasks';
import Timeline from '@/pages/Timeline';
import Profile from '@/pages/Profile';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import Contact from '@/pages/Contact';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  // Ensure page starts at top on fresh loads
  useEffect(() => {
    // Only scroll to top on fresh page loads, not on navigation
    if (!sessionStorage.getItem('tutorial-scroll-y')) {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <TutorialProvider>
              <TaskProvider>
              <div className="min-h-screen bg-background text-foreground">
                <UpdatePrompt />
                <TutorialOverlay />
                <FirstTimeUserDetector />
                <Switch>
                  <Route path="/login" component={Login} />
                  <Route path="/tasks" component={Tasks} />
                  <Route path="/timeline" component={Timeline} />
                  <Route path="/profile" component={Profile} />
                  <Route path="/privacy" component={Privacy} />
                  <Route path="/terms" component={Terms} />
                  <Route path="/contact" component={Contact} />
                  <Route path="/" component={Dashboard} />
                </Switch>
              </div>
              </TaskProvider>
            </TutorialProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}