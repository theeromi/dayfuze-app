import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { pushNotificationManager } from '@/lib/pushNotificationManager';

interface NotificationData {
  title: string;
  body: string;
  scheduledTime: Date;
}

interface TaskData {
  id: string;
  title: string;
  description?: string;
  dueTime: Date;
}

interface NotificationContextType {
  notificationsEnabled: boolean;
  isLoading: boolean;
  requestPermission: () => Promise<boolean>;
  scheduleNotification: (id: string, notification: NotificationData) => Promise<void>;
  scheduleTaskNotification: (task: TaskData) => Promise<boolean>;
  cancelNotification: (id: string) => void;
  sendTestNotification: () => Promise<boolean>;
  initializePushNotifications: (userId: string) => Promise<boolean>;
  scheduledNotifications: Map<string, number>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scheduledNotifications, setScheduledNotifications] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    // Check if notifications are supported and permission is granted
    checkNotificationSupport();

    // Register service worker for notifications
    registerServiceWorker();
  }, []);

  const checkNotificationSupport = () => {
    try {
      if (pushNotificationManager.isPushSupported()) {
        const permission = pushNotificationManager.getPermissionStatus();
        setNotificationsEnabled(permission === 'granted');
        console.log('Notification permission status:', permission);
      } else {
        console.warn('Push notifications not supported in this browser');
        setNotificationsEnabled(false);
      }
    } catch (error) {
      console.error('Error checking notification support:', error);
      setNotificationsEnabled(false);
    }
  };

  const registerServiceWorker = async () => {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!pushNotificationManager.isPushSupported()) {
      console.log('Push notifications are not supported in this browser');
      return false;
    }

    setIsLoading(true);
    try {
      const granted = await pushNotificationManager.requestPermission();
      setNotificationsEnabled(granted);
      console.log('Notification permission granted:', granted);
      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const initializePushNotifications = async (userId: string): Promise<boolean> => {
    if (!pushNotificationManager.isPushSupported()) {
      console.warn('Push notifications not supported');
      return false;
    }

    setIsLoading(true);
    try {
      const initialized = await pushNotificationManager.initialize(userId);
      if (initialized) {
        setNotificationsEnabled(true);
        console.log('Push notifications initialized for user:', userId);
      }
      return initialized;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleTaskNotification = async (task: TaskData): Promise<boolean> => {
    try {
      return await pushNotificationManager.scheduleTaskNotification(task);
    } catch (error) {
      console.error('Failed to schedule task notification:', error);
      return false;
    }
  };

  const sendTestNotification = async (): Promise<boolean> => {
    if (!notificationsEnabled) {
      console.warn('Notifications not enabled, cannot send test notification');
      return false;
    }

    try {
      return await pushNotificationManager.sendTestNotification();
    } catch (error) {
      console.error('Failed to send test notification:', error);
      return false;
    }
  };

  // Legacy fallback for client-side scheduling (for backward compatibility)
  const scheduleNotification = async (id: string, notification: NotificationData): Promise<void> => {
    console.warn('Using legacy client-side scheduling. Consider using scheduleTaskNotification for server-side scheduling.');
    
    const task: TaskData = {
      id,
      title: notification.title,
      description: notification.body,
      dueTime: notification.scheduledTime,
    };

    await scheduleTaskNotification(task);
  };

  const cancelNotification = (id: string) => {
    // For legacy compatibility - this would need to be implemented on server side
    console.warn('Cancel notification called for id:', id);
    
    const timeoutId = scheduledNotifications.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      setScheduledNotifications(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
    }
  };

  const value: NotificationContextType = {
    notificationsEnabled,
    isLoading,
    requestPermission,
    scheduleNotification,
    scheduleTaskNotification,
    cancelNotification,
    sendTestNotification,
    initializePushNotifications,
    scheduledNotifications,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}