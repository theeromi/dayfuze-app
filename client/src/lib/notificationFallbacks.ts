// Enhanced notification system with iOS fallbacks
import { notificationManager } from './notifications';

export interface NotificationOptions {
  title: string;
  body: string;
  taskId: string;
  dueTime: Date;
  userId: string;
}

export interface DeviceCapabilities {
  supportsPush: boolean;
  isIOS: boolean;
  iosVersion: number | null;
  isPWAInstalled: boolean;
  browserName: string;
}

class EnhancedNotificationManager {
  private deviceCapabilities: DeviceCapabilities;

  constructor() {
    this.deviceCapabilities = this.detectDeviceCapabilities();
  }

  private detectDeviceCapabilities(): DeviceCapabilities {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isPWAInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                           (window.navigator as any).standalone === true;
    
    let iosVersion = null;
    if (isIOS) {
      const match = userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
      if (match) {
        iosVersion = parseInt(match[1], 10);
      }
    }

    const supportsPush = 'Notification' in window && 
                        'serviceWorker' in navigator &&
                        (!isIOS || (iosVersion !== null && iosVersion >= 16 && isPWAInstalled));

    let browserName = 'Unknown';
    if (userAgent.includes('Chrome')) browserName = 'Chrome';
    else if (userAgent.includes('Firefox')) browserName = 'Firefox';
    else if (userAgent.includes('Safari')) browserName = 'Safari';
    else if (userAgent.includes('Edge')) browserName = 'Edge';

    return {
      supportsPush,
      isIOS,
      iosVersion,
      isPWAInstalled,
      browserName
    };
  }

  async scheduleNotification(options: NotificationOptions): Promise<boolean> {
    const { supportsPush, isIOS, iosVersion, isPWAInstalled } = this.deviceCapabilities;

    // Try web push notifications first
    if (supportsPush) {
      try {
        await notificationManager.scheduleTaskReminder({
          id: options.taskId,
          title: options.title,
          dueTime: options.dueTime
        });
        return true;
      } catch (error) {
        console.warn('Web push failed, trying fallback methods:', error);
      }
    }

    // iOS fallback strategies
    if (isIOS) {
      return await this.handleIOSFallbacks(options);
    }

    // General fallback for other devices
    return await this.handleGeneralFallbacks(options);
  }

  private async handleIOSFallbacks(options: NotificationOptions): Promise<boolean> {
    const { iosVersion, isPWAInstalled } = this.deviceCapabilities;

    // Show helpful message for iOS users
    if (!isPWAInstalled) {
      this.showIOSInstallInstructions();
    } else if (iosVersion && iosVersion < 16) {
      this.showIOSVersionWarning();
    }

    // Generate calendar event as fallback
    try {
      this.generateCalendarEvent(options);
      this.showCalendarFallbackMessage();
      return true;
    } catch (error) {
      console.error('Calendar fallback failed:', error);
      return false;
    }
  }

  private async handleGeneralFallbacks(options: NotificationOptions): Promise<boolean> {
    // Generate calendar event
    this.generateCalendarEvent(options);
    
    // Show browser notification if possible
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const delay = options.dueTime.getTime() - new Date().getTime();
        if (delay > 0) {
          setTimeout(() => {
            new Notification(options.title, {
              body: options.body,
              icon: '/icon-192x192.svg'
            });
          }, delay);
        }
      } catch (error) {
        console.error('Browser notification failed:', error);
      }
    }

    return true;
  }

  private generateCalendarEvent(options: NotificationOptions): void {
    const { title, body, dueTime } = options;
    
    // Create .ics calendar file
    const startTime = new Date(dueTime);
    const endTime = new Date(dueTime.getTime() + 30 * 60 * 1000); // 30 min duration
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//DayFuse//DayFuse Task Reminder//EN
BEGIN:VEVENT
UID:${options.taskId}@dayfuse.com
DTSTAMP:${this.formatICSDate(new Date())}
DTSTART:${this.formatICSDate(startTime)}
DTEND:${this.formatICSDate(endTime)}
SUMMARY:${title}
DESCRIPTION:${body}
BEGIN:VALARM
TRIGGER:-PT0M
DESCRIPTION:Task Reminder
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`;

    // Create download link
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    
    // Store for potential download  
    if (typeof window !== 'undefined') {
      (window as any).taskCalendarEvent = {
        url,
        filename: `dayfuse-task-${options.taskId}.ics`,
        title: options.title
      };
    }
  }

  private formatICSDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }

  private showIOSInstallInstructions(): void {
    const message = `For notifications to work on iPhone:
1. Tap the Share button (square with arrow)
2. Select "Add to Home Screen"  
3. Open DayFuse from your home screen
4. Enable notifications when prompted

This gives you native app-like notifications!`;
    
    this.showUserMessage(message, 'info');
  }

  private showIOSVersionWarning(): void {
    const message = `Your iOS version has limited notification support. 
For the best experience, consider:
• Updating to iOS 16.4 or later
• Adding tasks to your iPhone Calendar
• Using email reminders as backup`;
    
    this.showUserMessage(message, 'warning');
  }

  private showCalendarFallbackMessage(): void {
    const message = `Task reminder added to your calendar as backup! 
You can also download the calendar event to add it to your iPhone Calendar app.`;
    
    this.showUserMessage(message, 'success');
  }

  private showUserMessage(message: string, type: 'info' | 'warning' | 'success' | 'error'): void {
    // You can customize this to use your app's notification/toast system
    console.log(`${type.toUpperCase()}: ${message}`);
    
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm ${
      type === 'error' ? 'bg-red-100 text-red-800 border border-red-300' :
      type === 'warning' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
      type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' :
      'bg-blue-100 text-blue-800 border border-blue-300'
    }`;
    
    toast.innerHTML = `
      <div class="flex justify-between items-start">
        <div class="text-sm whitespace-pre-line">${message}</div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-gray-500 hover:text-gray-700">
          ×
        </button>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 10000);
  }

  getCapabilities(): DeviceCapabilities {
    return this.deviceCapabilities;
  }

  async requestOptimalNotifications(): Promise<boolean> {
    const { supportsPush, isIOS } = this.deviceCapabilities;

    if (supportsPush) {
      // Request standard web push permissions
      return await notificationManager.requestPermission();
    }

    if (isIOS) {
      // Show iOS-specific instructions
      this.showIOSInstallInstructions();
      return false;
    }

    // For other limited browsers, show calendar alternative
    this.showUserMessage(
      'Browser notifications are limited. We\'ll add task reminders to your calendar instead!',
      'info'
    );
    return false;
  }
}

export const enhancedNotificationManager = new EnhancedNotificationManager();