import webpush from 'web-push';
import { storage } from './storage';

// Define PushSubscription interface manually since web-push types may not export it
interface WebPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// VAPID configuration - in production, these should be environment variables
const VAPID_PUBLIC_KEY = 'BJ7KlXK_eB1HOCpxMk3sDTyhVY8G-Kc0nyK51UtFLgRprfNOcVa-0IBzW29WRY9MOHKMwyhli3WKAHoIh6ncpts';
const VAPID_PRIVATE_KEY = '2-L4pDcO9Ue2TdQ5qxN4ItcV6srey4B686z58pZs_Og';
const VAPID_SUBJECT = 'mailto:contact@dayfuse.app';

// Configure web-push
webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private pendingNotificationChecks: NodeJS.Timeout | null = null;

  private constructor() {
    // Start checking for pending notifications every minute
    this.startPendingNotificationChecker();
  }

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /**
   * Send push notification to specific subscription
   */
  async sendNotification(
    subscription: WebPushSubscription,
    payload: PushNotificationPayload
  ): Promise<boolean> {
    try {
      const result = await webpush.sendNotification(
        subscription,
        JSON.stringify(payload)
      );
      
      console.log('Push notification sent successfully:', result.statusCode);
      return true;
    } catch (error: any) {
      console.error('Failed to send push notification:', error);
      
      // Handle subscription errors (expired, invalid, etc.)
      if (error.statusCode === 410 || error.statusCode === 404) {
        // Subscription is no longer valid, should be removed
        console.log('Subscription expired/invalid, should remove from database');
        return false;
      }
      
      return false;
    }
  }

  /**
   * Send notification to all user's active subscriptions
   */
  async sendNotificationToUser(
    userId: string,
    payload: PushNotificationPayload
  ): Promise<{ sent: number; failed: number }> {
    try {
      const subscriptions = await storage.getPushSubscriptionsByUserId(userId);
      
      if (subscriptions.length === 0) {
        console.log(`No active subscriptions found for user: ${userId}`);
        return { sent: 0, failed: 0 };
      }

      let sent = 0;
      let failed = 0;

      for (const subscription of subscriptions) {
        const webPushSubscription: WebPushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        };

        const success = await this.sendNotification(webPushSubscription, payload);
        
        if (success) {
          sent++;
        } else {
          failed++;
          // Mark subscription as inactive if it failed
          await storage.updatePushSubscriptionStatus(subscription.id, false);
        }
      }

      console.log(`Notification sent to user ${userId}: ${sent} sent, ${failed} failed`);
      return { sent, failed };
    } catch (error) {
      console.error('Error sending notification to user:', error);
      return { sent: 0, failed: 1 };
    }
  }

  /**
   * Schedule a notification to be sent at a specific time
   */
  async scheduleNotification(
    userId: string,
    taskId: string,
    title: string,
    body: string,
    scheduledTime: Date
  ): Promise<void> {
    try {
      await storage.createScheduledNotification({
        taskId,
        userId,
        title,
        body,
        scheduledTime,
      });

      console.log(`Scheduled notification for user ${userId} at ${scheduledTime}`);
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  /**
   * Cancel scheduled notifications for a specific task
   */
  async cancelScheduledNotifications(taskId: string): Promise<void> {
    try {
      const notifications = await storage.getScheduledNotificationsByUserId(''); // We need to get by taskId
      const taskNotifications = notifications.filter(n => n.taskId === taskId && !n.sent);
      
      for (const notification of taskNotifications) {
        await storage.deleteScheduledNotification(notification.id);
      }

      console.log(`Cancelled ${taskNotifications.length} scheduled notifications for task: ${taskId}`);
    } catch (error) {
      console.error('Error cancelling scheduled notifications:', error);
      throw error;
    }
  }

  /**
   * Process pending notifications that are due
   */
  async processPendingNotifications(): Promise<void> {
    try {
      const pendingNotifications = await storage.getPendingNotifications();
      
      if (pendingNotifications.length === 0) {
        return;
      }

      console.log(`Processing ${pendingNotifications.length} pending notifications`);

      for (const notification of pendingNotifications) {
        const payload: PushNotificationPayload = {
          title: notification.title,
          body: notification.body,
          icon: '/dayfuse-logo-192.png',
          badge: '/dayfuse-logo-192.png',
          data: {
            taskId: notification.taskId,
            notificationId: notification.id,
            url: '/dashboard',
          },
          actions: [
            {
              action: 'complete',
              title: '✓ Complete',
            },
            {
              action: 'snooze',
              title: '⏰ Snooze 10min',
            },
            {
              action: 'view',
              title: '👁 View',
            },
          ],
        };

        const result = await this.sendNotificationToUser(notification.userId, payload);
        
        if (result.sent > 0) {
          // Mark notification as sent
          await storage.markNotificationAsSent(notification.id);
          console.log(`Notification sent successfully: ${notification.title}`);
        } else {
          console.log(`Failed to send notification: ${notification.title}`);
        }
      }
    } catch (error) {
      console.error('Error processing pending notifications:', error);
    }
  }

  /**
   * Start background process to check for pending notifications
   */
  private startPendingNotificationChecker(): void {
    // Check every 30 seconds for pending notifications
    this.pendingNotificationChecks = setInterval(async () => {
      await this.processPendingNotifications();
    }, 30000);

    console.log('Push notification service started - checking for pending notifications every 30 seconds');
  }

  /**
   * Stop the background notification checker
   */
  stop(): void {
    if (this.pendingNotificationChecks) {
      clearInterval(this.pendingNotificationChecks);
      this.pendingNotificationChecks = null;
      console.log('Push notification service stopped');
    }
  }

  /**
   * Get VAPID public key for client registration
   */
  getVapidPublicKey(): string {
    return VAPID_PUBLIC_KEY;
  }
}

export const pushNotificationService = PushNotificationService.getInstance();