import React, { useState, useEffect } from 'react';
import { Bell, BellOff, TestTube } from 'lucide-react';
import { notificationManager } from '../lib/notifications';

export function NotificationSettings() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPermission(notificationManager.getPermissionStatus());
  }, []);

  const handleRequestPermission = async () => {
    setLoading(true);
    try {
      const granted = await notificationManager.requestPermission();
      setPermission(granted ? 'granted' : 'denied');
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await notificationManager.showTestNotification();
    } catch (error) {
      console.error('Error showing test notification:', error);
    }
  };

  const getStatusColor = () => {
    switch (permission) {
      case 'granted':
        return 'text-green-600';
      case 'denied':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getStatusText = () => {
    switch (permission) {
      case 'granted':
        return 'Enabled';
      case 'denied':
        return 'Blocked';
      default:
        return 'Not set';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Notification Settings
      </h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {permission === 'granted' ? (
              <Bell className="text-green-600" size={20} />
            ) : (
              <BellOff className="text-gray-400" size={20} />
            )}
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-gray-600">
                Get reminders for your tasks
              </p>
            </div>
          </div>
          <span className={`font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        {permission === 'default' && (
          <button
            onClick={handleRequestPermission}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            data-testid="enable-notifications"
          >
            {loading ? 'Requesting...' : 'Enable Notifications'}
          </button>
        )}

        {permission === 'denied' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-sm text-yellow-800">
              Notifications are blocked. To enable them:
            </p>
            <ol className="text-sm text-yellow-800 mt-2 ml-4 list-decimal">
              <li>Click the lock icon in your browser's address bar</li>
              <li>Change notifications from "Block" to "Allow"</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        )}

        {permission === 'granted' && (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-sm text-green-800">
                ✓ Notifications are enabled! You'll receive reminders for tasks with due times.
              </p>
            </div>
            
            <button
              onClick={handleTestNotification}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200"
              data-testid="test-notification"
            >
              <TestTube size={16} />
              Test Notification
            </button>
          </div>
        )}

        <div className="text-sm text-gray-500 pt-4 border-t">
          <p className="font-medium mb-2">How task reminders work:</p>
          <ul className="space-y-1 ml-4 list-disc">
            <li>Set a due date and time when creating or editing a task</li>
            <li>You'll get a notification at the scheduled time</li>
            <li>Notifications include quick actions to mark complete or snooze</li>
            <li>Only works when notifications are enabled in your browser</li>
          </ul>
        </div>
      </div>
    </div>
  );
}