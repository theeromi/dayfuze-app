import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, ExternalLink, Plus } from 'lucide-react';
import { Task } from '@/contexts/TaskContext';
import { 
  addToCalendar, 
  createGoogleCalendarURL, 
  createOutlookCalendarURL,
  downloadCalendarFile,
  CalendarEvent 
} from '@/lib/calendarUtils';
import { formatTime12Hour } from '@/lib/timeUtils';

interface CalendarIntegrationProps {
  task: Task;
  className?: string;
}

export default function CalendarIntegration({ task, className = '' }: CalendarIntegrationProps) {
  const [adding, setAdding] = useState(false);

  const createCalendarEvent = (task: Task): CalendarEvent => {
    const taskDate = task.dueDate.toDate();
    
    // Set the time if available
    if (task.dueTime) {
      const [hours, minutes] = task.dueTime.split(':').map(Number);
      taskDate.setHours(hours, minutes, 0, 0);
    }

    const endDate = new Date(taskDate.getTime() + 30 * 60 * 1000); // 30 minutes duration

    return {
      title: task.title,
      description: task.description || 'Task from DayFuse productivity app',
      startDate: taskDate,
      endDate: endDate,
    };
  };

  const handleAddToCalendar = async () => {
    setAdding(true);
    try {
      const calendarEvent = createCalendarEvent(task);
      await addToCalendar(calendarEvent);
    } catch (error) {
      console.error('Failed to add to calendar:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleDownloadICS = () => {
    const calendarEvent = createCalendarEvent(task);
    downloadCalendarFile(calendarEvent);
  };

  const openGoogleCalendar = () => {
    const calendarEvent = createCalendarEvent(task);
    const url = createGoogleCalendarURL(calendarEvent);
    window.open(url, '_blank');
  };

  const openOutlookCalendar = () => {
    const calendarEvent = createCalendarEvent(task);
    const url = createOutlookCalendarURL(calendarEvent);
    window.open(url, '_blank');
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Add to Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-semibold">{task.title}</h4>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Due: {task.dueDate.toDate().toLocaleDateString()}</span>
            {task.dueTime && (
              <Badge variant="outline" className="ml-2">
                {formatTime12Hour(task.dueTime)}
              </Badge>
            )}
          </div>
          {task.description && (
            <p className="text-sm text-muted-foreground">{task.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2">
          <Button
            onClick={handleAddToCalendar}
            disabled={adding}
            className="w-full justify-start"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            {adding ? 'Adding...' : 'Auto Add to Calendar'}
          </Button>

          <Button
            onClick={openGoogleCalendar}
            variant="outline"
            className="w-full justify-start"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Add to Google Calendar
          </Button>

          <Button
            onClick={openOutlookCalendar}
            variant="outline"
            className="w-full justify-start"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Add to Outlook Calendar
          </Button>

          <Button
            onClick={handleDownloadICS}
            variant="outline"
            className="w-full justify-start"
          >
            <Download className="h-4 w-4 mr-2" />
            Download .ics File
          </Button>
        </div>

        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <p className="font-medium mb-1">🔔 Enhanced Notifications</p>
          <p>
            Adding tasks to your calendar provides more reliable notifications, especially on mobile devices. 
            Calendar reminders work even when your browser is closed!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}