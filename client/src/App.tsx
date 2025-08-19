import { Route, Switch } from 'wouter';
import { AuthProvider } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Profile from './pages/Profile';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/profile" component={Profile} />
          <Route path="/" component={Dashboard} />
        </Switch>
      </AuthProvider>
    </QueryClientProvider>
  );
}