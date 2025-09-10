import { useState } from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';

export function NotificationTest() {
  const [status, setStatus] = useState<string>('Ready to test');
  const [isLoading, setIsLoading] = useState(false);
  const { 
    notificationsEnabled, 
    requestPermission, 
    sendTestNotification, 
    initializePushNotifications,
    isLoading: contextLoading 
  } = useNotification();

  const handleRequestPermission = async () => {
    setIsLoading(true);
    setStatus('Requesting permission...');
    
    try {
      const granted = await requestPermission();
      if (granted) {
        setStatus('Permission granted! You can now receive notifications.');
      } else {
        setStatus('Permission denied. Please enable notifications in your browser settings.');
      }
    } catch (error) {
      setStatus(`Error requesting permission: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitializePush = async () => {
    setIsLoading(true);
    setStatus('Initializing push notifications...');
    
    try {
      // Use a test user ID
      const testUserId = 'test-user-123';
      const initialized = await initializePushNotifications(testUserId);
      
      if (initialized) {
        setStatus('Push notifications initialized successfully! You can now receive notifications even when the app is closed.');
      } else {
        setStatus('Failed to initialize push notifications. Please check console for errors.');
      }
    } catch (error) {
      setStatus(`Error initializing push: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setIsLoading(true);
    setStatus('Sending test notification...');
    
    try {
      const sent = await sendTestNotification();
      
      if (sent) {
        setStatus('Test notification sent! You should see it appear even if the app is closed.');
      } else {
        setStatus('Failed to send test notification. Please check console for errors.');
      }
    } catch (error) {
      setStatus(`Error sending test notification: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4" data-testid="notification-test-container">
      <h2 className="text-2xl font-bold">Push Notification Test</h2>
      
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Status: <span className="font-medium">{status}</span>
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          Notifications Enabled: <span className="font-medium">{notificationsEnabled ? 'Yes' : 'No'}</span>
        </p>
      </div>

      <div className="space-y-3">
        <Button 
          onClick={handleRequestPermission}
          disabled={isLoading || contextLoading || notificationsEnabled}
          className="w-full"
          data-testid="button-request-permission"
        >
          {notificationsEnabled ? 'Permission Already Granted' : 'Request Notification Permission'}
        </Button>

        <Button 
          onClick={handleInitializePush}
          disabled={isLoading || contextLoading || !notificationsEnabled}
          className="w-full"
          data-testid="button-initialize-push"
        >
          Initialize Push Notifications
        </Button>

        <Button 
          onClick={handleTestNotification}
          disabled={isLoading || contextLoading || !notificationsEnabled}
          className="w-full"
          data-testid="button-test-notification"
        >
          Send Test Notification
        </Button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200">How to Test:</h3>
        <ol className="list-decimal list-inside text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
          <li>Click "Request Notification Permission" and allow notifications</li>
          <li>Click "Initialize Push Notifications" to register with server</li>
          <li>Click "Send Test Notification" to receive a notification</li>
          <li>On Android: Close the app completely and the notification should still appear</li>
        </ol>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Troubleshooting:</h3>
        <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
          <li>If permission is denied, check your browser's notification settings</li>
          <li>On Android, notifications work best when the site is "installed" as a PWA</li>
          <li>Some browsers require user interaction before showing notifications</li>
          <li>Check the browser console for detailed error messages</li>
        </ul>
      </div>
    </div>
  );
}