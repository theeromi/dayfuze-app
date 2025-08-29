import { addToCalendar, CalendarEvent } from './calendarUtils';

// Notification Manager - Singleton for handling push notifications
class NotificationManager {
  private static instance: NotificationManager;
  private permission: NotificationPermission = 'default';
  private scheduledNotifications: Map<string, number> = new Map();

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

  async scheduleTaskReminder(task: { id: string; title: string; dueTime: Date; description?: string }): Promise<void> {
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

    // Cancel any existing notification for this task
    this.cancelNotification(task.id);

    // Schedule native push notification (works on Android APK)
    const timeoutId = window.setTimeout(() => {
      this.showNativePushNotification(task);
    }, delay);

    this.scheduledNotifications.set(task.id, timeoutId);

    console.log(`Scheduled notification for task "${task.title}" in ${Math.round(delay / 1000 / 60)} minutes`);
  }

  private async showNativePushNotification(task: { id: string; title: string; description?: string }): Promise<void> {
    // Use service worker for native Android notifications
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      
      // Send push event to service worker
      if (registration.active) {
        registration.active.postMessage({
          type: 'SHOW_NOTIFICATION',
          payload: {
            title: `📋 ${task.title}`,
            body: task.description || 'Task is due now',
            taskId: task.id,
            url: `/dashboard?task=${task.id}`
          }
        });
      }
    } else {
      // Fallback to regular notification API
      this.showTaskNotification(task.title, task.id, task.description);
    }

    // Try to add to calendar for enhanced notifications
    try {
      const calendarEvent: CalendarEvent = {
        title: task.title,
        description: task.description || '',
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 60 * 1000) // 1 hour duration
      };
      
      await addToCalendar(calendarEvent);
      console.log('Task added to calendar for enhanced notifications');
    } catch (error) {
      console.warn('Calendar integration failed, but browser notifications will still work:', error);
    }
  }

  private showTaskNotification(taskTitle: string, taskId: string, taskDescription?: string): void {
    if (typeof window === 'undefined' || this.permission !== 'granted') return;

    try {
      const notification = new Notification('🚀 DayFuse Task Reminder', {
        body: `Time to work on: ${taskTitle}${taskDescription ? `\n${taskDescription}` : ''}`,
        icon: '/icon-192x192.svg',
        badge: '/icon-72x72.svg',
        tag: `task-${taskId}`,
        requireInteraction: true,
        actions: [
          {
            action: 'complete',
            title: '✅ Mark Complete',
            icon: '/icon-72x72.svg'
          },
          {
            action: 'snooze',
            title: '⏰ Snooze 10min',
            icon: '/icon-72x72.svg'
          }
        ]
      } as NotificationOptions & { vibrate?: number[] });

      notification.onclick = () => {
        if (typeof window !== 'undefined') {
          window.focus();
          // Navigate to tasks page to show the specific task
          window.location.hash = '#/tasks';
        }
        notification.close();
      };

      // Handle notification actions
      if ('actions' in notification) {
        notification.addEventListener?.('notificationclick', (event: any) => {
          if (event.action === 'complete') {
            // Send message to main thread to mark task as complete
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                type: 'COMPLETE_TASK',
                taskId: taskId
              });
            }
          } else if (event.action === 'snooze') {
            // Reschedule for 10 minutes later
            this.scheduleTaskReminder({
              id: taskId,
              title: taskTitle,
              dueTime: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
              description: taskDescription
            });
          }
          notification.close();
        });
      }

      // Auto-close after 15 seconds if not interacted with
      setTimeout(() => {
        notification.close();
      }, 15000);

      // Remove from scheduled notifications since it has fired
      this.scheduledNotifications.delete(taskId);
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

  cancelNotification(taskId: string): void {
    const timeoutId = this.scheduledNotifications.get(taskId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledNotifications.delete(taskId);
      console.log(`Cancelled notification for task: ${taskId}`);
    }
  }

  clearAllNotifications(): void {
    this.scheduledNotifications.forEach((timeoutId, taskId) => {
      clearTimeout(timeoutId);
      console.log(`Cleared notification for task: ${taskId}`);
    });
    this.scheduledNotifications.clear();
  }

  getScheduledNotifications(): string[] {
    return Array.from(this.scheduledNotifications.keys());
  }
}

export const notificationManager = NotificationManager.getInstance();