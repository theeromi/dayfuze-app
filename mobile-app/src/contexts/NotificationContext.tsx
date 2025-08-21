import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, scheduleTaskNotification, cancelTaskNotification, TaskNotification } from '../services/notificationService';

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  scheduleTaskReminder: (taskId: string, title: string, body: string, scheduledTime: Date) => Promise<void>;
  cancelTaskReminder: (taskId: string) => Promise<void>;
  isNotificationEnabled: boolean;
  requestNotificationPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);

  useEffect(() => {
    // Register for notifications and get token
    registerForPushNotifications();

    // Listen for incoming notifications
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Listen for notification responses
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const registerForPushNotifications = async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setExpoPushToken(token);
        setIsNotificationEnabled(true);
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const enabled = status === 'granted';
      setIsNotificationEnabled(enabled);
      
      if (enabled && !expoPushToken) {
        await registerForPushNotifications();
      }
      
      return enabled;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const scheduleTaskReminder = async (
    taskId: string,
    title: string,
    body: string,
    scheduledTime: Date
  ): Promise<void> => {
    if (!isNotificationEnabled) {
      const permitted = await requestNotificationPermission();
      if (!permitted) {
        throw new Error('Notification permission not granted');
      }
    }

    const taskNotification: TaskNotification = {
      id: `task_${taskId}_${Date.now()}`,
      title,
      body,
      scheduledTime,
      taskId,
    };

    await scheduleTaskNotification(taskNotification);
  };

  const cancelTaskReminder = async (taskId: string): Promise<void> => {
    await cancelTaskNotification(taskId);
  };

  const contextValue: NotificationContextType = {
    expoPushToken,
    notification,
    scheduleTaskReminder,
    cancelTaskReminder,
    isNotificationEnabled,
    requestNotificationPermission,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};