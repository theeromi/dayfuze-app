// Enhanced Push Notification Manager for server-side scheduling
export class PushNotificationManager {
  private static instance: PushNotificationManager;
  private vapidPublicKey: string | null = null;
  private subscription: PushSubscription | null = null;
  private userId: string | null = null;

  private constructor() {}

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager();
    }
    return PushNotificationManager.instance;
  }

  /**
   * Initialize push notifications with user ID
   */
  async initialize(userId: string): Promise<boolean> {
    this.userId = userId;

    // Check if browser supports push notifications
    if (!this.isPushSupported()) {
      console.warn('Push notifications are not supported in this browser');
      return false;
    }

    try {
      // Get VAPID public key from server
      await this.fetchVapidPublicKey();
      
      // Request permission
      const permissionGranted = await this.requestPermission();
      if (!permissionGranted) {
        console.warn('Push notification permission denied');
        return false;
      }

      // Register push subscription
      await this.registerPushSubscription();
      
      console.log('Push notifications initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  /**
   * Check if push notifications are supported
   */
  isPushSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  /**
   * Check current permission status
   */
  getPermissionStatus(): NotificationPermission {
    try {
      if (typeof window === 'undefined' || !('Notification' in window)) {
        return 'denied';
      }
      return Notification.permission;
    } catch (error) {
      console.warn('Error accessing Notification.permission:', error);
      return 'denied';
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isPushSupported()) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Fetch VAPID public key from server
   */
  private async fetchVapidPublicKey(): Promise<void> {
    try {
      const response = await fetch('/api/push/vapid-public-key');
      const data = await response.json();
      this.vapidPublicKey = data.publicKey;
      console.log('VAPID public key fetched successfully');
    } catch (error) {
      console.error('Failed to fetch VAPID public key:', error);
      throw error;
    }
  }

  /**
   * Register push subscription with the server
   */
  private async registerPushSubscription(): Promise<void> {
    if (!this.vapidPublicKey || !this.userId) {
      throw new Error('VAPID public key or user ID not available');
    }

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.ready;
      
      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
      });

      this.subscription = subscription;

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
          endpoint: subscription.endpoint,
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to register subscription: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Push subscription registered:', result.subscriptionId);
    } catch (error) {
      console.error('Failed to register push subscription:', error);
      throw error;
    }
  }

  /**
   * Schedule a task notification via server
   */
  async scheduleTaskNotification(task: {
    id: string;
    title: string;
    description?: string;
    dueTime: Date;
  }): Promise<boolean> {
    if (!this.userId) {
      console.warn('User ID not set, cannot schedule notification');
      return false;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
          title: task.title,
          description: task.description,
          dueTime: task.dueTime.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create task: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Task created with notification scheduled:', result.task.id);
      return true;
    } catch (error) {
      console.error('Failed to schedule task notification:', error);
      return false;
    }
  }

  /**
   * Send test notification
   */
  async sendTestNotification(): Promise<boolean> {
    if (!this.userId) {
      console.warn('User ID not set, cannot send test notification');
      return false;
    }

    try {
      const response = await fetch(`/api/push/test/${this.userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'DayFuse Test Notification',
          body: 'Your push notifications are working perfectly! This notification was sent from the server and works even when the app is closed.',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send test notification: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Test notification sent:', result.message);
      return true;
    } catch (error) {
      console.error('Failed to send test notification:', error);
      return false;
    }
  }

  /**
   * Get tasks for user
   */
  async getUserTasks(): Promise<any[]> {
    if (!this.userId) {
      return [];
    }

    try {
      const response = await fetch(`/api/tasks/${this.userId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.statusText}`);
      }

      const result = await response.json();
      return result.tasks || [];
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      return [];
    }
  }

  /**
   * Update task (e.g., mark as completed)
   */
  async updateTask(taskId: string, updates: any): Promise<boolean> {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Task updated:', result.task.id);
      return true;
    } catch (error) {
      console.error('Failed to update task:', error);
      return false;
    }
  }

  /**
   * Delete task
   */
  async deleteTask(taskId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.statusText}`);
      }

      console.log('Task deleted successfully');
      return true;
    } catch (error) {
      console.error('Failed to delete task:', error);
      return false;
    }
  }

  /**
   * Convert VAPID public key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    try {
      if (this.subscription) {
        await this.subscription.unsubscribe();
        this.subscription = null;
      }
      
      console.log('Unsubscribed from push notifications');
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  /**
   * Get current subscription status
   */
  isSubscribed(): boolean {
    return this.subscription !== null;
  }

  /**
   * Set current user ID
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Get current user ID
   */
  getUserId(): string | null {
    return this.userId;
  }
}

export const pushNotificationManager = PushNotificationManager.getInstance();