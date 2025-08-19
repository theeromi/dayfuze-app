import { Route, Switch } from 'wouter';
import { AuthProvider } from './contexts/AuthContext';
import { TaskProvider } from './contexts/TaskContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Timeline from './pages/Timeline';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <TaskProvider>
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/tasks" component={Tasks} />
            <Route path="/timeline" component={Timeline} />
            <Route path="/profile" component={Profile} />
            <Route path="/" component={Dashboard} />
          </Switch>
        </TaskProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}