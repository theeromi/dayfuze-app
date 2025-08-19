// Calendar integration utilities for task notifications

export interface CalendarEvent {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
}

/**
 * Generates a calendar (.ics) file content for a task
 * @param task - Task information
 * @returns ICS file content as string
 */
export function generateICSContent(task: CalendarEvent): string {
  const formatICSDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DayFuse//Task Reminder//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${Date.now()}-${Math.random().toString(36).substr(2, 9)}@dayfuse.app`,
    `DTSTART:${formatICSDate(task.startDate)}`,
    `DTEND:${formatICSDate(task.endDate)}`,
    `SUMMARY:${task.title}`,
    task.description ? `DESCRIPTION:${task.description}` : '',
    `CREATED:${formatICSDate(new Date())}`,
    `LAST-MODIFIED:${formatICSDate(new Date())}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'BEGIN:VALARM',
    'TRIGGER:PT0M',
    'DESCRIPTION:Task Reminder',
    'ACTION:DISPLAY',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\r\n');

  return icsContent;
}

/**
 * Creates a downloadable calendar file for a task
 * @param task - Task information
 * @returns Blob URL for download
 */
export function createCalendarFile(task: CalendarEvent): string {
  const icsContent = generateICSContent(task);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  return URL.createObjectURL(blob);
}

/**
 * Triggers download of a calendar file
 * @param task - Task information
 * @param filename - Optional filename
 */
export function downloadCalendarFile(task: CalendarEvent, filename?: string): void {
  const url = createCalendarFile(task);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${task.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_reminder.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Attempts to add event to user's calendar using various methods
 * @param task - Task information
 * @returns Promise<boolean> - Success status
 */
export async function addToCalendar(task: CalendarEvent): Promise<boolean> {
  // Check if device has native calendar integration
  if ('calendar' in navigator && 'createEvent' in (navigator as any).calendar) {
    try {
      await (navigator as any).calendar.createEvent({
        title: task.title,
        description: task.description,
        startDate: task.startDate,
        endDate: task.endDate,
        location: task.location
      });
      return true;
    } catch (error) {
      console.warn('Native calendar integration failed:', error);
    }
  }

  // Fallback to downloading ICS file
  try {
    downloadCalendarFile(task);
    return true;
  } catch (error) {
    console.error('Calendar file generation failed:', error);
    return false;
  }
}

/**
 * Creates Google Calendar URL for adding event
 * @param task - Task information
 * @returns Google Calendar URL
 */
export function createGoogleCalendarURL(task: CalendarEvent): string {
  const formatGoogleDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: task.title,
    dates: `${formatGoogleDate(task.startDate)}/${formatGoogleDate(task.endDate)}`,
    details: task.description || '',
    location: task.location || ''
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Creates Outlook Calendar URL for adding event
 * @param task - Task information
 * @returns Outlook Calendar URL
 */
export function createOutlookCalendarURL(task: CalendarEvent): string {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: task.title,
    startdt: task.startDate.toISOString(),
    enddt: task.endDate.toISOString(),
    body: task.description || '',
    location: task.location || ''
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}