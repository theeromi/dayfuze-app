import React, { useState, useEffect } from 'react';
import { useTask } from '@/contexts/TaskContext';
import { useNotification } from '@/contexts/NotificationContext';
import { Bell, BellRing, Clock, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, isToday, isTomorrow } from 'date-fns';
import { formatTime12Hour } from '@/lib/timeUtils';

interface NotificationCenterProps {
  className?: string;
}

interface TaskNotification {
  id: string;
  taskId: string;
  title: string;
  message: string;
  dueDate: Date;
  dueTime?: string;
  priority: 'low' | 'medium' | 'high';
  type: 'upcoming' | 'overdue' | 'reminder';
  timestamp: Date;
  read: boolean;
}

export default function NotificationCenter({ className }: NotificationCenterProps) {
  const { tasks } = useTask();
  const { notificationsEnabled } = useNotification();
  const [notifications, setNotifications] = useState<TaskNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Generate notifications from tasks
  useEffect(() => {
    const now = new Date();
    const upcomingNotifications: TaskNotification[] = [];

    tasks
      .filter(task => task.status !== 'done' && task.dueTime)
      .forEach(task => {
        const dueDateTime = new Date(task.dueDate.toDate());
        if (task.dueTime) {
          const [hours, minutes] = task.dueTime.split(':').map(Number);
          dueDateTime.setHours(hours, minutes);
        }

        const timeDiff = dueDateTime.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        // Upcoming tasks (within next 24 hours)
        if (hoursDiff > 0 && hoursDiff <= 24) {
          upcomingNotifications.push({
            id: `upcoming-${task.id}`,
            taskId: task.id,
            title: task.title,
            message: `Due ${isToday(dueDateTime) ? 'today' : isTomorrow(dueDateTime) ? 'tomorrow' : format(dueDateTime, 'MMM dd')} at ${task.dueTime ? formatTime12Hour(task.dueTime) : 'end of day'}`,
            dueDate: dueDateTime,
            dueTime: task.dueTime,
            priority: task.priority,
            type: 'upcoming',
            timestamp: now,
            read: false,
          });
        }

        // Overdue tasks
        if (hoursDiff < 0) {
          upcomingNotifications.push({
            id: `overdue-${task.id}`,
            taskId: task.id,
            title: task.title,
            message: `Overdue since ${format(dueDateTime, 'MMM dd')} at ${task.dueTime ? formatTime12Hour(task.dueTime) : 'end of day'}`,
            dueDate: dueDateTime,
            dueTime: task.dueTime,
            priority: task.priority,
            type: 'overdue',
            timestamp: now,
            read: false,
          });
        }
      });

    setNotifications(upcomingNotifications);
  }, [tasks]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const handleMarkTaskDone = (taskId: string) => {
    // Find and update task status - this would typically call the task context
    setNotifications(prev => prev.filter(n => n.taskId !== taskId));
    // Note: This would need to be connected to actual task update function
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300';
      default: return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'overdue': return 'bg-red-500 text-white';
      case 'upcoming': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative p-2 hover:bg-muted ${className}`}
          data-testid="button-notification-center"
        >
          {notificationsEnabled ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5 text-muted-foreground" />
          )}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0 max-h-96 overflow-y-auto"
        data-testid="notification-center-content"
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {!notificationsEnabled && (
              <div className="p-4 border-b bg-muted/20">
                <p className="text-sm text-muted-foreground mb-2">
                  Enable notifications to get task reminders
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    if ('Notification' in window) {
                      Notification.requestPermission();
                    }
                  }}
                  data-testid="button-enable-notifications"
                >
                  Enable Notifications
                </Button>
              </div>
            )}

            {notifications.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
                <p className="text-xs mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 hover:bg-muted/50 ${
                      !notification.read ? 'bg-muted/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            className={`text-xs ${getTypeColor(notification.type)}`}
                          >
                            {notification.type}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getPriorityColor(notification.priority)}`}
                          >
                            {notification.priority}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-sm truncate">
                          {notification.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkTaskDone(notification.taskId)}
                          className="h-7 w-7 p-0"
                          data-testid={`button-complete-${notification.taskId}`}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="h-7 w-7 p-0"
                          data-testid={`button-dismiss-${notification.id}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {notifications.length > 0 && (
              <div className="p-3 border-t bg-muted/20">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-xs"
                  onClick={() => {
                    setNotifications([]);
                    setIsOpen(false);
                  }}
                  data-testid="button-clear-all-notifications"
                >
                  Clear all notifications
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}