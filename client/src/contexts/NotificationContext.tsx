import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface NotificationData {
  title: string;
  body: string;
  scheduledTime: Date;
}

interface NotificationContextType {
  notificationsEnabled: boolean;
  requestPermission: () => Promise<boolean>;
  scheduleNotification: (id: string, notification: NotificationData) => void;
  cancelNotification: (id: string) => void;
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

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [scheduledNotifications, setScheduledNotifications] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    // Check if notifications are supported and permission is granted
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }

    // Register service worker for notifications
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    setNotificationsEnabled(granted);
    return granted;
  };

  const scheduleNotification = (id: string, notification: NotificationData) => {
    if (!notificationsEnabled) return;

    const now = new Date();
    const delay = notification.scheduledTime.getTime() - now.getTime();

    if (delay <= 0) {
      // If the time has already passed, show notification immediately
      showNotification(notification.title, notification.body);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      showNotification(notification.title, notification.body);
      setScheduledNotifications(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
    }, delay);

    setScheduledNotifications(prev => {
      const newMap = new Map(prev);
      newMap.set(id, timeoutId);
      return newMap;
    });
  };

  const cancelNotification = (id: string) => {
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

  const showNotification = (title: string, body: string) => {
    if (notificationsEnabled && typeof window !== 'undefined' && 'Notification' in window) {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'dayfuse-task-reminder',
      });
    }
  };

  const value: NotificationContextType = {
    notificationsEnabled,
    requestPermission,
    scheduleNotification,
    cancelNotification,
    scheduledNotifications,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};