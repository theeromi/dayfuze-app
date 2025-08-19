// Push notification utilities
export interface NotificationData {
  taskId: string;
  title: string;
  body: string;
  dueTime: string;
}

export class NotificationManager {
  private static instance: NotificationManager;
  private registration: ServiceWorkerRegistration | null = null;

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      // Register service worker
      if ('serviceWorker' in navigator) {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('SW registered: ', this.registration);
      }

      // Request notification permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }

      return false;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  }

  async scheduleTaskReminder(task: NotificationData): Promise<void> {
    if (!this.registration || typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
      console.warn('Notifications not available or permission denied');
      return;
    }

    try {
      // Calculate delay until notification time
      const now = new Date();
      const [hours, minutes] = task.dueTime.split(':').map(Number);
      const notificationTime = new Date();
      notificationTime.setHours(hours, minutes, 0, 0);

      // If time has passed today, schedule for tomorrow
      if (notificationTime <= now) {
        notificationTime.setDate(notificationTime.getDate() + 1);
      }

      const delay = notificationTime.getTime() - now.getTime();

      // For demonstration purposes, also show immediate notification if time is very close (within 1 minute)
      const oneMinute = 60 * 1000;
      if (delay <= oneMinute && delay > 0) {
        console.log('Task due very soon, showing immediate notification');
        await this.showNotification(task);
        return;
      }

      // Store scheduled notifications in localStorage for persistence across page reloads
      const scheduledNotifications = JSON.parse(localStorage.getItem('scheduledNotifications') || '[]');
      const notificationData = {
        taskId: task.taskId,
        title: task.title,
        body: task.body,
        dueTime: task.dueTime,
        scheduledFor: notificationTime.getTime()
      };
      
      // Remove existing notification for this task
      const filteredNotifications = scheduledNotifications.filter((n: any) => n.taskId !== task.taskId);
      filteredNotifications.push(notificationData);
      localStorage.setItem('scheduledNotifications', JSON.stringify(filteredNotifications));

      // Schedule notification using setTimeout (will work while app is active)
      setTimeout(() => {
        this.showNotification(task);
        // Remove from localStorage after showing
        const current = JSON.parse(localStorage.getItem('scheduledNotifications') || '[]');
        const updated = current.filter((n: any) => n.taskId !== task.taskId);
        localStorage.setItem('scheduledNotifications', JSON.stringify(updated));
      }, delay);

      console.log(`Scheduled notification for ${task.title} at ${task.dueTime} (in ${Math.round(delay / 1000 / 60)} minutes)`);
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  }

  async showNotification(task: NotificationData): Promise<void> {
    if (!this.registration) return;

    const options: any = {
      body: `Time to work on: ${task.title}`,
      icon: '/icon-192x192.svg',
      badge: '/icon-72x72.svg',
      data: {
        taskId: task.taskId,
        dateOfArrival: Date.now()
      },
      actions: [
        {
          action: 'complete',
          title: 'Mark Complete'
        },
        {
          action: 'snooze',
          title: 'Snooze 10min'
        }
      ],
      requireInteraction: true,
      tag: `task-${task.taskId}`
    };

    await this.registration.showNotification(
      `DayFuse: ${task.title}`,
      options
    );
  }

  async cancelTaskReminder(taskId: string): Promise<void> {
    if (!this.registration) return;

    // Cancel active notifications
    const notifications = await this.registration.getNotifications({
      tag: `task-${taskId}`
    });
    notifications.forEach(notification => notification.close());

    // Remove from scheduled notifications in localStorage
    const scheduledNotifications = JSON.parse(localStorage.getItem('scheduledNotifications') || '[]');
    const filteredNotifications = scheduledNotifications.filter((n: any) => n.taskId !== taskId);
    localStorage.setItem('scheduledNotifications', JSON.stringify(filteredNotifications));
  }

  // Show immediate notification for testing
  async showTestNotification(): Promise<void> {
    if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    // Use service worker registration if available, otherwise fallback to direct Notification
    if (this.registration) {
      await this.registration.showNotification('DayFuse Test', {
        body: 'Push notifications are working!',
        icon: '/icon-192x192.svg',
        badge: '/icon-72x72.svg',
        tag: 'test-notification'
      });
    } else {
      // Fallback to direct notification (for environments without service worker)
      try {
        new Notification('DayFuse Test', {
          body: 'Push notifications are working!',
          icon: '/icon-192x192.svg'
        });
      } catch (error) {
        console.warn('Direct notification failed, service worker registration may be required:', error);
      }
    }
  }

  // Check for pending notifications on app start
  checkPendingNotifications(): void {
    if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const scheduledNotifications = JSON.parse(localStorage.getItem('scheduledNotifications') || '[]');
    const now = Date.now();
    
    scheduledNotifications.forEach((notification: any) => {
      const timeUntilDue = notification.scheduledFor - now;
      
      if (timeUntilDue <= 0) {
        // Overdue notification, show immediately
        this.showNotification({
          taskId: notification.taskId,
          title: notification.title,
          body: notification.body,
          dueTime: notification.dueTime
        });
      } else if (timeUntilDue <= 24 * 60 * 60 * 1000) { // Within 24 hours
        // Reschedule the notification
        setTimeout(() => {
          this.showNotification({
            taskId: notification.taskId,
            title: notification.title,
            body: notification.body,
            dueTime: notification.dueTime
          });
        }, timeUntilDue);
        console.log(`Rescheduled notification for ${notification.title} in ${Math.round(timeUntilDue / 1000 / 60)} minutes`);
      }
    });

    // Clean up old notifications (older than 24 hours)
    const validNotifications = scheduledNotifications.filter((n: any) => n.scheduledFor - now > -24 * 60 * 60 * 1000);
    localStorage.setItem('scheduledNotifications', JSON.stringify(validNotifications));
  }
}

export default NotificationManager.getInstance();