import { useState, useEffect } from "react";
import { Bell, BellOff, Check, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import NotificationManager from "@/lib/notifications";

export function NotificationSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check if Notification API is available
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
      setNotificationsEnabled(Notification.permission === 'granted');
    } else {
      setPermission('denied');
      setNotificationsEnabled(false);
    }
  }, []);

  const handleEnableNotifications = async () => {
    // Check if Notification API is available
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      // Ensure service worker is registered even if permission is already granted
      await NotificationManager.initialize();
      setNotificationsEnabled(true);
      await NotificationManager.showTestNotification();
      return;
    }

    const granted = await NotificationManager.initialize();
    setNotificationsEnabled(granted);
    setPermission(granted ? 'granted' : 'denied');

    if (granted) {
      await NotificationManager.showTestNotification();
    }
  };

  const handleDisableNotifications = () => {
    setNotificationsEnabled(false);
  };

  return (
    <Card data-testid="notification-settings-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get reminded about your tasks at the scheduled time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications-enabled">Enable Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive push notifications for task reminders
            </p>
          </div>
          <Switch
            id="notifications-enabled"
            checked={notificationsEnabled}
            onCheckedChange={(checked) => {
              if (checked) {
                handleEnableNotifications();
              } else {
                handleDisableNotifications();
              }
            }}
            data-testid="switch-notifications"
          />
        </div>

        {permission === 'denied' && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <BellOff className="w-4 h-4" />
              <span className="text-sm">
                Notifications are blocked. Please enable them in your browser settings.
              </span>
            </div>
          </div>
        )}

        {permission === 'granted' && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <Check className="w-4 h-4" />
              <span className="text-sm">
                Notifications are enabled and working!
              </span>
            </div>
          </div>
        )}

        <Button
          onClick={async () => await NotificationManager.showTestNotification()}
          variant="outline"
          size="sm"
          disabled={permission !== 'granted'}
          data-testid="button-test-notification"
        >
          <Bell className="w-4 h-4 mr-2" />
          Test Notification
        </Button>
      </CardContent>
    </Card>
  );
}