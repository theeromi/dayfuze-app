import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTask } from '@/contexts/TaskContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useLocation } from 'wouter';
import Header from '@/components/ui/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, CheckSquare, Clock, Bell, BellOff } from 'lucide-react';

export default function Profile() {
  const { currentUser, loading: authLoading, handleLogout } = useAuth();
  const { tasks, loading: tasksLoading } = useTask();
  const { notificationsEnabled, requestPermission, scheduledNotifications } = useNotification();
  const [, navigate] = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, authLoading, navigate]);

  const handleLogoutClick = async () => {
    setLoggingOut(true);
    try {
      await handleLogout();
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to logout. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  const handleNotificationToggle = async () => {
    if (!notificationsEnabled) {
      const granted = await requestPermission();
      if (granted) {
        alert('Notifications enabled! You\'ll now receive task reminders.');
      } else {
        alert('Please allow notifications in your browser settings to receive task reminders.');
      }
    }
  };

  if (authLoading || tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-day-blue mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  const displayName = currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = tasks.filter(task => !task.completed).length;
  const upcomingTasks = tasks.filter(task => {
    const today = new Date();
    const taskDate = task.dueDate.toDate();
    return taskDate >= today && !task.completed;
  }).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Profile</h1>
          <Button
            onClick={handleLogoutClick}
            disabled={loggingOut}
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
            data-testid="button-logout"
          >
            {loggingOut ? 'Signing Out...' : 'Sign Out'}
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-day-blue rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold" data-testid="text-display-name">
                    {displayName}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {currentUser.email}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {notificationsEnabled ? (
                    <Bell className="h-4 w-4 text-accent-green" />
                  ) : (
                    <BellOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">Notifications</span>
                </div>
                <Badge
                  variant={notificationsEnabled ? "default" : "outline"}
                  className={notificationsEnabled ? "bg-accent-green" : ""}
                >
                  {notificationsEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              
              {!notificationsEnabled && (
                <Button
                  onClick={handleNotificationToggle}
                  size="sm"
                  className="w-full bg-fuse-orange hover:bg-fuse-orange/90"
                  data-testid="button-enable-notifications"
                >
                  Enable Notifications
                </Button>
              )}
              
              {scheduledNotifications.size > 0 && (
                <div className="text-sm text-muted-foreground">
                  {scheduledNotifications.size} reminder{scheduledNotifications.size !== 1 ? 's' : ''} scheduled
                </div>
              )}
            </CardContent>
          </Card>

          {/* Task Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Task Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-accent-green/10 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <CheckSquare className="h-6 w-6 text-accent-green" />
                  </div>
                  <div className="text-2xl font-bold text-accent-green" data-testid="text-completed-count">
                    {completedTasks}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                
                <div className="text-center p-4 bg-accent-red/10 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-6 w-6 text-accent-red" />
                  </div>
                  <div className="text-2xl font-bold text-accent-red" data-testid="text-pending-count">
                    {pendingTasks}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
                
                <div className="text-center p-4 bg-day-blue/10 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="h-6 w-6 text-day-blue" />
                  </div>
                  <div className="text-2xl font-bold text-day-blue" data-testid="text-total-count">
                    {tasks.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Tasks</div>
                </div>
                
                <div className="text-center p-4 bg-fuse-orange/10 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-6 w-6 text-fuse-orange" />
                  </div>
                  <div className="text-2xl font-bold text-fuse-orange" data-testid="text-upcoming-count">
                    {upcomingTasks}
                  </div>
                  <div className="text-sm text-muted-foreground">Upcoming</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-base" data-testid="text-email">{currentUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                <p className="text-base">
                  {currentUser.metadata.creationTime 
                    ? new Date(currentUser.metadata.creationTime).toLocaleDateString()
                    : 'Unknown'
                  }
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Sign In</label>
                <p className="text-base">
                  {currentUser.metadata.lastSignInTime 
                    ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString()
                    : 'Unknown'
                  }
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">User ID</label>
                <p className="text-base font-mono text-sm break-all">{currentUser.uid}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex gap-4 justify-center pt-4">
          <Button
            onClick={() => navigate('/tasks')}
            className="bg-day-blue hover:bg-day-blue/90"
            data-testid="button-manage-tasks"
          >
            Manage Tasks
          </Button>
          <Button
            onClick={() => navigate('/timeline')}
            variant="outline"
            data-testid="button-view-timeline"
          >
            View Timeline
          </Button>
        </div>
      </main>
    </div>
  );
}