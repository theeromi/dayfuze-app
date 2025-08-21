import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface TaskNotification {
  id: string;
  title: string;
  body: string;
  scheduledTime: Date;
  taskId: string;
  notificationId?: string;
}

class NotificationService {
  private expoPushToken: string | null = null;

  async registerForPushNotificationsAsync(): Promise<string | null> {
    let token = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'DayFuse Tasks',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#5B7FFF',
        sound: true,
        enableVibrate: true,
      });

      // Create high priority channel for urgent tasks
      await Notifications.setNotificationChannelAsync('urgent', {
        name: 'Urgent Tasks',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#FF4444',
        sound: true,
        enableVibrate: true,
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return null;
      }
      
      // Get push token for push notifications
      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        this.expoPushToken = token;
        
        // Store token for server-side notifications
        await AsyncStorage.setItem('expoPushToken', token);
        console.log('Push token:', token);
      } catch (e) {
        console.error('Error getting push token:', e);
      }
    } else {
      console.warn('Must use physical device for Push Notifications');
    }

    return token;
  }

  // Schedule local notification for task
  async scheduleTaskNotification(notification: TaskNotification): Promise<string | null> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `📋 ${notification.title}`,
          body: notification.body,
          data: { 
            taskId: notification.taskId,
            type: 'task_reminder'
          },
          categoryIdentifier: 'task_actions',
          sound: true,
        },
        trigger: {
          date: notification.scheduledTime,
        },
      });

      // Store notification ID for cancellation
      const storedNotifications = await this.getStoredNotifications();
      storedNotifications[notification.taskId] = {
        ...notification,
        notificationId
      };
      await AsyncStorage.setItem('scheduledNotifications', JSON.stringify(storedNotifications));

      console.log(`Scheduled notification ${notificationId} for task ${notification.taskId}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  // Cancel task notification
  async cancelTaskNotification(taskId: string): Promise<void> {
    try {
      const storedNotifications = await this.getStoredNotifications();
      const notification = storedNotifications[taskId];
      
      if (notification?.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notification.notificationId);
        delete storedNotifications[taskId];
        await AsyncStorage.setItem('scheduledNotifications', JSON.stringify(storedNotifications));
        console.log(`Cancelled notification for task ${taskId}`);
      }
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  // Update task notification
  async updateTaskNotification(notification: TaskNotification): Promise<void> {
    await this.cancelTaskNotification(notification.taskId);
    await this.scheduleTaskNotification(notification);
  }

  // Get stored notifications
  private async getStoredNotifications(): Promise<Record<string, TaskNotification>> {
    try {
      const stored = await AsyncStorage.getItem('scheduledNotifications');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  // Send immediate notification
  async sendImmediateNotification(title: string, body: string, data?: any): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending immediate notification:', error);
    }
  }

  // Setup notification action categories
  async setupNotificationCategories(): Promise<void> {
    try {
      await Notifications.setNotificationCategoryAsync('task_actions', [
        {
          identifier: 'mark_complete',
          buttonTitle: 'Mark Complete',
          options: { isDestructive: false, isAuthenticationRequired: false },
        },
        {
          identifier: 'snooze',
          buttonTitle: 'Snooze 10min',
          options: { isDestructive: false, isAuthenticationRequired: false },
        },
        {
          identifier: 'view_task',
          buttonTitle: 'View Task',
          options: { isDestructive: false, isAuthenticationRequired: false },
        }
      ]);
    } catch (error) {
      console.error('Error setting up notification categories:', error);
    }
  }

  // Get push token
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  // Clean up expired notifications
  async cleanupExpiredNotifications(): Promise<void> {
    try {
      const storedNotifications = await this.getStoredNotifications();
      const now = new Date();
      const activeNotifications: Record<string, TaskNotification> = {};

      for (const [taskId, notification] of Object.entries(storedNotifications)) {
        if (new Date(notification.scheduledTime) > now) {
          activeNotifications[taskId] = notification;
        } else {
          // Cancel expired notification
          if (notification.notificationId) {
            await Notifications.cancelScheduledNotificationAsync(notification.notificationId);
          }
        }
      }

      await AsyncStorage.setItem('scheduledNotifications', JSON.stringify(activeNotifications));
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
    }
  }
}

// Singleton instance
const notificationService = new NotificationService();

// Export convenience functions
export const registerForPushNotificationsAsync = () => 
  notificationService.registerForPushNotificationsAsync();

export const scheduleTaskNotification = (notification: TaskNotification) =>
  notificationService.scheduleTaskNotification(notification);

export const cancelTaskNotification = (taskId: string) =>
  notificationService.cancelTaskNotification(taskId);

export const updateTaskNotification = (notification: TaskNotification) =>
  notificationService.updateTaskNotification(notification);

export const sendImmediateNotification = (title: string, body: string, data?: any) =>
  notificationService.sendImmediateNotification(title, body, data);

export const setupNotificationHandlers = () => {
  // Setup notification categories
  notificationService.setupNotificationCategories();

  // Handle notification responses (when user taps notification)
  Notifications.addNotificationResponseReceivedListener(response => {
    const { notification, actionIdentifier } = response;
    const { taskId, type } = notification.request.content.data;

    console.log('Notification response:', { taskId, actionIdentifier, type });

    // Handle different actions
    switch (actionIdentifier) {
      case 'mark_complete':
        // Handle mark complete action
        break;
      case 'snooze':
        // Handle snooze action (reschedule for 10 minutes)
        if (taskId) {
          const snoozeTime = new Date(Date.now() + 10 * 60 * 1000);
          scheduleTaskNotification({
            id: `${taskId}_snooze`,
            title: 'Snoozed Task Reminder',
            body: 'Your snoozed task is ready!',
            scheduledTime: snoozeTime,
            taskId: taskId
          });
        }
        break;
      case 'view_task':
        // Navigate to task details
        break;
    }
  });

  // Handle foreground notifications
  Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received in foreground:', notification);
  });

  // Cleanup expired notifications on app start
  notificationService.cleanupExpiredNotifications();
};

export default notificationService;