// Time formatting utilities

/**
 * Converts 24-hour time format (HH:MM) to 12-hour format (h:MM AM/PM)
 * @param time24 - Time in 24-hour format (e.g., "13:30")
 * @returns Time in 12-hour format (e.g., "1:30 PM")
 */
export function formatTime12Hour(time24: string): string {
  if (!time24) return '';
  
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Converts 12-hour time format to 24-hour format for HTML time input
 * @param time12 - Time in 12-hour format (e.g., "1:30 PM")
 * @returns Time in 24-hour format (e.g., "13:30")
 */
export function formatTime24Hour(time12: string): string {
  if (!time12) return '';
  
  const [time, period] = time12.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  
  let hour24 = hours;
  if (period === 'PM' && hours !== 12) {
    hour24 = hours + 12;
  } else if (period === 'AM' && hours === 12) {
    hour24 = 0;
  }
  
  return `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Gets current time in 12-hour format
 * @returns Current time as "h:MM AM/PM"
 */
export function getCurrentTime12Hour(): string {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Creates a Date object from date and time strings
 * @param dateStr - Date string or Date object
 * @param timeStr - Time string in 24-hour format (HH:MM)
 * @returns Combined Date object
 */
export function createDateTime(dateStr: string | Date, timeStr: string): Date {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  const dateTime = new Date(date);
  dateTime.setHours(hours, minutes, 0, 0);
  
  return dateTime;
}

/**
 * Checks if a given time is in the future
 * @param dateStr - Date string or Date object
 * @param timeStr - Time string in 24-hour format
 * @returns true if the time is in the future
 */
export function isTimeInFuture(dateStr: string | Date, timeStr: string): boolean {
  const dateTime = createDateTime(dateStr, timeStr);
  return dateTime.getTime() > Date.now();
}