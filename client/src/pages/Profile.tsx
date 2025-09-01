import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTask } from '@/contexts/TaskContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useTutorial } from '@/contexts/TutorialContext';
import { useLocation } from 'wouter';
import Header from '../components/ui/Header';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { User, Mail, Calendar, CheckSquare, Clock, Bell, BellOff, MessageCircle, Phone, Send, X, Lock, Trash2, AlertTriangle, HelpCircle, Play } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { ThemeToggle } from '../components/ThemeToggle';
import { NotificationSettings } from '../components/NotificationSettings';
import Footer from '../components/ui/Footer';

export default function Profile() {
  const { currentUser, loading: authLoading, handleLogout, changePassword, deleteAccount } = useAuth();
  const { tasks, loading: tasksLoading } = useTask();
  const { notificationsEnabled, requestPermission, scheduledNotifications } = useNotification();
  const { startTutorial, resetTutorial, tutorialState } = useTutorial();
  const [, navigate] = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [contactSending, setContactSending] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  
  // Password management states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordChanging, setPasswordChanging] = useState(false);
  
  // Account deletion states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login');
    }
    
    // Check notification permission on component mount
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, [currentUser, authLoading, navigate]);

  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        // Show success message
        const { notificationManager } = await import('@/lib/notifications');
        setTimeout(() => {
          notificationManager.showTestNotification();
        }, 500);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      alert('Failed to request notification permission');
    }
  };

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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setPasswordChanging(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      alert('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordDialogOpen(false);
    } catch (error: any) {
      console.error('Password change error:', error);
      if (error.code === 'auth/wrong-password') {
        alert('Current password is incorrect');
      } else if (error.code === 'auth/weak-password') {
        alert('Password is too weak');
      } else {
        alert('Failed to change password. Please try again.');
      }
    } finally {
      setPasswordChanging(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      alert('Please enter your password to confirm account deletion');
      return;
    }

    const confirmed = confirm('Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently delete all your tasks and data.');
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteAccount(deletePassword);
      alert('Account deleted successfully');
      // User will be automatically logged out
    } catch (error: any) {
      console.error('Account deletion error:', error);
      if (error.code === 'auth/wrong-password') {
        alert('Password is incorrect');
      } else {
        alert('Failed to delete account. Please try again.');
      }
    } finally {
      setDeleting(false);
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

  // Initialize form with user data
  useEffect(() => {
    const userDisplayName = currentUser?.displayName || '';
    const userEmail = currentUser?.email || '';
    
    setFeedbackForm(prev => ({
      ...prev,
      name: userDisplayName,
      email: userEmail
    }));
    
    setContactForm(prev => ({
      ...prev,
      name: userDisplayName,
      email: userEmail
    }));
  }, [currentUser]);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSending(true);
    
    try {
      const subject = `DayFuse Feedback: ${feedbackForm.subject}`;
      const body = `From: ${feedbackForm.name} (${feedbackForm.email})\n\nMessage:\n${feedbackForm.message}`;
      const mailtoLink = `mailto:romaintomlinson@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      window.open(mailtoLink, '_blank');
      
      // Reset form and close dialog
      setFeedbackForm({
        name: currentUser?.displayName || '',
        email: currentUser?.email || '',
        subject: '',
        message: ''
      });
      setFeedbackOpen(false);
    } catch (error) {
      console.error('Error sending feedback:', error);
      alert('Failed to open email client. Please try again.');
    } finally {
      setFeedbackSending(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSending(true);
    
    try {
      const subject = `DayFuse Contact: ${contactForm.subject}`;
      const body = `From: ${contactForm.name} (${contactForm.email})\n\nMessage:\n${contactForm.message}`;
      const mailtoLink = `mailto:contact@romaintomlinson.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      window.open(mailtoLink, '_blank');
      
      // Reset form and close dialog
      setContactForm({
        name: currentUser?.displayName || '',
        email: currentUser?.email || '',
        subject: '',
        message: ''
      });
      setContactOpen(false);
    } catch (error) {
      console.error('Error sending contact email:', error);
      alert('Failed to open email client. Please try again.');
    } finally {
      setContactSending(false);
    }
  };

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
              <NotificationSettings />
              
              {scheduledNotifications.size > 0 && (
                <div className="text-sm text-muted-foreground mt-4">
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

        {/* Account Information & Security */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information & Security</CardTitle>
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

            {/* Password Change Section */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Password</h3>
                  <p className="text-sm text-muted-foreground">Change your account password</p>
                </div>
                <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" data-testid="button-change-password">
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Enter your current password and choose a new one.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          required
                          data-testid="input-current-password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          required
                          minLength={6}
                          data-testid="input-new-password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          required
                          minLength={6}
                          data-testid="input-confirm-password"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setPasswordDialogOpen(false)}
                          data-testid="button-cancel-password"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={passwordChanging}
                          data-testid="button-save-password"
                        >
                          {passwordChanging ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                              Changing...
                            </>
                          ) : (
                            <>
                              <Lock className="h-4 w-4 mr-2" />
                              Change Password
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Account Deletion Section */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-red-600 dark:text-red-400">Delete Account</h3>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                </div>
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm" data-testid="button-delete-account">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Delete Account
                      </DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove all your tasks, data, and settings.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                          Warning: This will permanently delete:
                        </p>
                        <ul className="text-sm text-red-600 dark:text-red-400 mt-2 ml-4 list-disc">
                          <li>All your tasks and recurring reminders</li>
                          <li>Your account settings and preferences</li>
                          <li>All notification schedules</li>
                          <li>Your profile information</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deletePassword">Enter your password to confirm</Label>
                        <Input
                          id="deletePassword"
                          type="password"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                          data-testid="input-delete-password"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setDeleteDialogOpen(false);
                            setDeletePassword('');
                          }}
                          data-testid="button-cancel-delete"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          disabled={deleting || !deletePassword}
                          data-testid="button-confirm-delete"
                        >
                          {deleting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Account
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Section */}
        {/* Theme Settings */}
        <Card data-section="app-settings">
          <CardHeader>
            <CardTitle>App Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">Theme Preference</p>
                  <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
                </div>
                <div className="ml-4">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help & Tutorial */}
        <Card>
          <CardHeader>
            <CardTitle>Help & Tutorial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Button
                onClick={startTutorial}
                variant="outline"
                className="w-full flex items-center gap-2 h-12"
                data-testid="button-start-tutorial-profile"
              >
                <Play className="h-4 w-4" />
                Start Tutorial
              </Button>
              
              <Button
                onClick={resetTutorial}
                variant="outline"
                className="w-full flex items-center gap-2 h-12"
                data-testid="button-reset-tutorial"
              >
                <HelpCircle className="h-4 w-4" />
                Reset Tutorial
              </Button>
            </div>
            
            {tutorialState.completed && (
              <div className="mt-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✓ Tutorial completed! You can restart it anytime to refresh your memory.
                </p>
              </div>
            )}
            
            {tutorialState.skipped && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Tutorial was skipped. Start it now to learn about DayFuse features.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Support & Feedback */}
        <Card>
          <CardHeader>
            <CardTitle>Support & Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Feedback Dialog */}
              <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2 h-12"
                    data-testid="button-feedback"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Send Feedback
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Send Feedback</DialogTitle>
                    <DialogDescription>
                      Help us improve DayFuse by sharing your thoughts and suggestions.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="feedback-name">Name</Label>
                      <Input
                        id="feedback-name"
                        value={feedbackForm.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          setFeedbackForm(prev => ({ ...prev, name: e.target.value }))
                        }
                        required
                        data-testid="input-feedback-name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="feedback-email">Email</Label>
                      <Input
                        id="feedback-email"
                        type="email"
                        value={feedbackForm.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          setFeedbackForm(prev => ({ ...prev, email: e.target.value }))
                        }
                        required
                        data-testid="input-feedback-email"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="feedback-subject">Subject</Label>
                      <Input
                        id="feedback-subject"
                        value={feedbackForm.subject}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          setFeedbackForm(prev => ({ ...prev, subject: e.target.value }))
                        }
                        placeholder="Brief summary of your feedback"
                        required
                        data-testid="input-feedback-subject"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="feedback-message">Message</Label>
                      <Textarea
                        id="feedback-message"
                        value={feedbackForm.message}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                          setFeedbackForm(prev => ({ ...prev, message: e.target.value }))
                        }
                        placeholder="Tell us what you think..."
                        rows={4}
                        required
                        data-testid="textarea-feedback-message"
                      />
                    </div>
                    <div className="flex gap-3 pt-6 border-t border-border mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFeedbackOpen(false)}
                        className="flex-1 px-6 py-3 text-base font-medium border-2 hover:bg-muted/50"
                        data-testid="button-cancel-feedback"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={feedbackSending}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl"
                        data-testid="button-send-feedback"
                      >
                        {feedbackSending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Feedback
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Contact Dialog */}
              <Dialog open={contactOpen} onOpenChange={setContactOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2 h-12"
                    data-testid="button-contact"
                  >
                    <Phone className="h-4 w-4" />
                    Contact Support
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Contact Support</DialogTitle>
                    <DialogDescription>
                      Need help? Reach out to our support team for assistance.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="contact-name">Name</Label>
                      <Input
                        id="contact-name"
                        value={contactForm.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          setContactForm(prev => ({ ...prev, name: e.target.value }))
                        }
                        required
                        data-testid="input-contact-name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="contact-email">Email</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={contactForm.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          setContactForm(prev => ({ ...prev, email: e.target.value }))
                        }
                        required
                        data-testid="input-contact-email"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="contact-subject">Subject</Label>
                      <Input
                        id="contact-subject"
                        value={contactForm.subject}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          setContactForm(prev => ({ ...prev, subject: e.target.value }))
                        }
                        placeholder="What do you need help with?"
                        required
                        data-testid="input-contact-subject"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="contact-message">Message</Label>
                      <Textarea
                        id="contact-message"
                        value={contactForm.message}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                          setContactForm(prev => ({ ...prev, message: e.target.value }))
                        }
                        placeholder="Describe your issue or question..."
                        rows={4}
                        required
                        data-testid="textarea-contact-message"
                      />
                    </div>
                    <div className="flex gap-3 pt-6 border-t border-border mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setContactOpen(false)}
                        className="flex-1 px-6 py-3 text-base font-medium border-2 hover:bg-muted/50"
                        data-testid="button-cancel-contact"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={contactSending}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl"
                        data-testid="button-send-contact"
                      >
                        {contactSending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
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
      
      <Footer />
    </div>
  );
}