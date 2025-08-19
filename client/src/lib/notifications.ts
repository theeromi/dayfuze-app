// Notification Manager - Singleton for handling push notifications
class NotificationManager {
  private static instance: NotificationManager;
  private permission: NotificationPermission = 'default';

  private constructor() {
    this.permission = Notification.permission;
  }

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  async scheduleTaskReminder(task: { id: string; title: string; dueTime: Date }): Promise<void> {
    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    const now = new Date();
    const delay = task.dueTime.getTime() - now.getTime();

    if (delay <= 0) {
      console.warn('Task due time is in the past');
      return;
    }

    setTimeout(() => {
      this.showTaskNotification(task.title, task.id);
    }, delay);
  }

  private showTaskNotification(taskTitle: string, taskId: string): void {
    if (typeof window === 'undefined' || this.permission !== 'granted') return;

    try {
      const notification = new Notification('DayFuse Task Reminder', {
        body: `Time to work on: ${taskTitle}`,
        icon: '/icon-192x192.svg',
        badge: '/icon-72x72.svg',
        tag: `task-${taskId}`,
        requireInteraction: true,
      });

      notification.onclick = () => {
        if (typeof window !== 'undefined') {
          window.focus();
        }
        notification.close();
      };

      // Auto-close after 10 seconds if not interacted with
      setTimeout(() => {
        notification.close();
      }, 10000);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  async showTestNotification(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    try {
      new Notification('DayFuse Test Notification', {
        body: 'Notifications are working correctly!',
        icon: '/icon-192x192.svg',
        tag: 'test-notification'
      });
    } catch (error) {
      console.error('Error showing test notification:', error);
    }
  }

  clearAllNotifications(): void {
    // Clear any pending timeouts if we were tracking them
    // This is a simplified version - in production you'd want to track timeout IDs
    console.log('Clearing all scheduled notifications');
  }
}

export const notificationManager = NotificationManager.getInstance();