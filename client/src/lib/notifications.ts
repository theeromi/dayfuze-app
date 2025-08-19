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

      // Schedule notification
      setTimeout(() => {
        this.showNotification(task);
      }, delay);

      console.log(`Scheduled notification for ${task.title} at ${task.dueTime}`);
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  }

  private async showNotification(task: NotificationData): Promise<void> {
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

    const notifications = await this.registration.getNotifications({
      tag: `task-${taskId}`
    });

    notifications.forEach(notification => notification.close());
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
}

export default NotificationManager.getInstance();