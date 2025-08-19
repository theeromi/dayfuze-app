import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
// import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { TaskProvider } from "@/contexts/TaskContext";
import { CelebrationProvider } from "@/contexts/CelebrationContext";
// import { ThemeProvider } from "@/contexts/ThemeContext";
import Dashboard from "@/pages/Dashboard";
import Tasks from "@/pages/Tasks";
import Timeline from "@/pages/Timeline";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import NotificationManager from "@/lib/notifications";
import { MilestoneCelebration } from "@/components/MilestoneCelebration";

function AppRoutes() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-day-blue">Day</span>
            <span className="text-2xl font-bold text-fuse-orange">Fuse</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  return (
    <CelebrationProvider>
      <TaskProvider>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/timeline" component={Timeline} />
          <Route path="/profile" component={Profile} />
          <Route component={NotFound} />
        </Switch>
        <MilestoneCelebration />
      </TaskProvider>
    </CelebrationProvider>
  );
}

function App() {
  // Initialize notification checking when app starts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      NotificationManager.checkPendingNotifications();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
