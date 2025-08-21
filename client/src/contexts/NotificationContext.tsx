import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

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

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [scheduledNotifications, setScheduledNotifications] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    // Check if notifications are supported and permission is granted
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }

    // Register service worker for notifications (only in production)
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
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
    const now = new Date();
    const delay = notification.scheduledTime.getTime() - now.getTime();

    if (delay <= 0) {
      // If the time has already passed, show notification immediately
      showNotification(notification.title, notification.body);
      return;
    }

    // Always create calendar entry for mobile backup
    createMobileCalendarBackup(id, notification);

    if (!notificationsEnabled) {
      // Show mobile setup instructions
      showMobileNotificationSetup(notification);
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

  const createMobileCalendarBackup = (id: string, notification: NotificationData) => {
    // Create calendar event for mobile devices
    const startDate = new Date(notification.scheduledTime);
    const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

    const formatICSDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//DayFuse//Task Reminder//EN
BEGIN:VEVENT
UID:${id}@dayfuse.app
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:DayFuse: ${notification.title}
DESCRIPTION:${notification.body}
BEGIN:VALARM
TRIGGER:-PT0M
ACTION:DISPLAY
DESCRIPTION:Task Reminder
END:VALARM
END:VEVENT
END:VCALENDAR`;

    // Store calendar data for potential download
    localStorage.setItem(`calendar-backup-${id}`, icsContent);
  };

  const showMobileNotificationSetup = (notification: NotificationData) => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const message = isIOS ? 
      'For reliable notifications on iPhone, add this task to your Calendar app. Would you like to download the calendar event?' :
      'For reliable notifications, add this task to your device calendar. Download the calendar event?';
    
    console.log('Mobile notification setup:', message);
  };

  const showNotification = (title: string, body: string) => {
    if (notificationsEnabled && typeof window !== 'undefined' && 'Notification' in window) {
      const notification = new Notification(title, {
        body,
        icon: '/icon-72x72.svg',
        badge: '/icon-72x72.svg',
        tag: 'dayfuse-task-reminder',
        requireInteraction: true,  // Keep notification visible
      });

      // Add mobile vibration if supported
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
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
}