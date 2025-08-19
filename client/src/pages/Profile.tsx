import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTask } from '@/contexts/TaskContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useLocation } from 'wouter';
import Header from '../components/ui/Header';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { User, Mail, Calendar, CheckSquare, Clock, Bell, BellOff, MessageCircle, Phone, Send, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { ThemeToggle } from '../components/ThemeToggle';
import Footer from '../components/ui/Footer';

export default function Profile() {
  const { currentUser, loading: authLoading, handleLogout } = useAuth();
  const { tasks, loading: tasksLoading } = useTask();
  const { notificationsEnabled, requestPermission, scheduledNotifications } = useNotification();
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
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Notification Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          {notificationsEnabled ? (
                            <Bell className="h-4 w-4 text-accent-green" />
                          ) : (
                            <BellOff className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="font-medium">Task Reminders</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Get notified when tasks are due</p>
                      </div>
                      <Button
                        onClick={requestNotificationPermission}
                        disabled={notificationPermission === 'granted'}
                        variant={notificationPermission === 'granted' ? 'default' : 'outline'}
                        size="sm"
                        data-testid="button-enable-notifications"
                      >
                        {notificationPermission === 'granted' ? 'Enabled' : 'Enable'}
                      </Button>
                    </div>
                    
                    {notificationPermission === 'granted' && (
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                        <div>
                          <p className="font-medium text-green-800 dark:text-green-200">Test Notifications</p>
                          <p className="text-sm text-green-600 dark:text-green-300">Send a test notification to verify it's working</p>
                        </div>
                        <Button
                          onClick={async () => {
                            const { notificationManager } = await import('@/lib/notifications');
                            await notificationManager.showTestNotification();
                          }}
                          variant="outline"
                          size="sm"
                          className="border-green-300 dark:border-green-600 hover:bg-green-100 dark:hover:bg-green-900"
                          data-testid="button-test-notification"
                        >
                          <Bell className="h-4 w-4 mr-2" />
                          Test Now
                        </Button>
                      </div>
                    )}
                    
                    {/* iOS-specific notification help */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-blue-800 dark:text-blue-200 mb-2">📱 iPhone/iOS Users</p>
                          <p className="text-sm text-blue-600 dark:text-blue-300 mb-2">
                            For the best notification experience on iPhone:
                          </p>
                          <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1 ml-4">
                            <li>• Tap Share → "Add to Home Screen"</li>
                            <li>• Open DayFuse from your home screen</li>
                            <li>• Tasks will also be added to your Calendar as backup</li>
                          </ul>
                        </div>
                        <Button
                          onClick={async () => {
                            const { enhancedNotificationManager } = await import('@/lib/notificationFallbacks');
                            const capabilities = enhancedNotificationManager.getCapabilities();
                            alert(`Device Info:\n• iOS: ${capabilities.isIOS ? 'Yes' : 'No'}\n• iOS Version: ${capabilities.iosVersion || 'N/A'}\n• PWA Installed: ${capabilities.isPWAInstalled ? 'Yes' : 'No'}\n• Push Support: ${capabilities.supportsPush ? 'Yes' : 'No'}\n• Browser: ${capabilities.browserName}`);
                          }}
                          variant="outline"
                          size="sm"
                          className="border-blue-300 dark:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 text-xs px-2 py-1 h-auto ml-2"
                          data-testid="button-device-info"
                        >
                          Check Device
                        </Button>
                      </div>
                    </div>
                    
                    {notificationPermission === 'denied' && (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-1">Notifications Blocked</p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-300">
                          To enable: Click the lock/info icon in your browser's address bar and allow notifications, then refresh the page.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
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

        {/* Support Section */}
        {/* Theme Settings */}
        <Card>
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