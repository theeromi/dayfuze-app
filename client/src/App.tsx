import { Route, Switch } from 'wouter';
import { AuthProvider } from './contexts/AuthContext';
import { TaskProvider } from './contexts/TaskContext';
import { CelebrationProvider } from './contexts/CelebrationContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Login from './pages/Login';
import Profile from './pages/Profile';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CelebrationProvider>
          <TaskProvider>
            <Switch>
              <Route path="/login" component={Login} />
              <Route path="/tasks" component={Tasks} />
              <Route path="/profile" component={Profile} />
              <Route path="/" component={Dashboard} />
            </Switch>
          </TaskProvider>
        </CelebrationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}