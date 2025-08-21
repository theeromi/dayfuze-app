import React, { useState } from 'react';
import { Button } from './ui/button';
import { Calendar, Download, Smartphone } from 'lucide-react';

interface MobileNotificationButtonProps {
  taskId: string;
  taskTitle: string;
  dueTime: Date;
  onCalendarDownload?: () => void;
}

export function MobileNotificationButton({ 
  taskId, 
  taskTitle, 
  dueTime, 
  onCalendarDownload 
}: MobileNotificationButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const downloadCalendarEvent = async () => {
    setDownloading(true);
    
    try {
      // Get calendar data from localStorage or create it
      const calendarData = localStorage.getItem(`calendar-backup-${taskId}`);
      
      if (calendarData) {
        // Create download blob
        const blob = new Blob([calendarData], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement('a');
        link.href = url;
        link.download = `dayfuse-task-${taskId}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up URL
        URL.revokeObjectURL(url);
        
        onCalendarDownload?.();
      }
    } catch (error) {
      console.error('Failed to download calendar event:', error);
    } finally {
      setDownloading(false);
    }
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  return (
    <div className="flex flex-col space-y-2">
      <Button
        onClick={downloadCalendarEvent}
        disabled={downloading}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
        data-testid="download-calendar-event"
      >
        {downloading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            Preparing...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Download Calendar Event
          </>
        )}
      </Button>
      
      <div className="text-xs text-muted-foreground flex items-center gap-1">
        <Smartphone className="h-3 w-3" />
        {isIOS && "Add to iPhone Calendar for notifications"}
        {isAndroid && "Add to Android Calendar for notifications"}
        {!isIOS && !isAndroid && "Add to device calendar for notifications"}
      </div>
    </div>
  );
}