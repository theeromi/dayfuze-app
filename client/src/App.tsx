
import { Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { TaskProvider } from '@/contexts/TaskContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Pages
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Tasks from '@/pages/Tasks';
import Timeline from '@/pages/Timeline';
import Profile from '@/pages/Profile';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <TaskProvider>
              <div className="min-h-screen bg-background text-foreground">
                <Switch>
                  <Route path="/login" component={Login} />
                  <Route path="/tasks" component={Tasks} />
                  <Route path="/timeline" component={Timeline} />
                  <Route path="/profile" component={Profile} />
                  <Route path="/privacy" component={Privacy} />
                  <Route path="/terms" component={Terms} />
                  <Route path="/contact" component={Profile} />
                  <Route path="/" component={Dashboard} />
                </Switch>
              </div>
            </TaskProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}