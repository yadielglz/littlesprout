export function formatLocalDateTimeInput(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

/**
 * Parse a date string (YYYY-MM-DD) without timezone conversion
 * This prevents the common issue where "2025-02-10" becomes Feb 9 in local timezone
 */
export function parseDateSafe(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
}

/**
 * Format a date string (YYYY-MM-DD) for display without timezone issues
 * Use this instead of new Date(dateString).toLocaleDateString()
 */
export function formatDateSafe(dateString: string): string {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  } catch (error) {
    return dateString; // fallback to original if parsing fails
  }
}

/**
 * Calculate age from birth date string without timezone issues
 * Use this instead of new Date(dob) calculations
 */
export function calculateAgeSafe(dobString: string): string {
  try {
    const [birthYear, birthMonth, birthDay] = dobString.split('-').map(Number);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // Convert to 1-indexed
    const currentDay = now.getDate();
    
    let years = currentYear - birthYear;
    let months = currentMonth - birthMonth;
    let days = currentDay - birthDay;
    
    if (days < 0) {
      months--;
      const daysInPrevMonth = new Date(currentYear, currentMonth - 1, 0).getDate();
      days += daysInPrevMonth;
    }
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    return `${years > 0 ? years + 'y ' : ''}${months > 0 ? months + 'm ' : ''}${days}d`;
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Format date for dashboard widgets - shows month and day (e.g., "July 25")
 */
export function formatDashboardDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric' 
    });
  } catch (error) {
    return dateString; // fallback to original if parsing fails
  }
}

/**
 * Format date for appointment pages - shows full readable date (e.g., "Monday, July 25, 2025")
 */
export function formatAppointmentDate(dateString: string): string {
  try {
    // Use the safe parsing method to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed in Date constructor
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  } catch (error) {
    return dateString; // fallback to original if parsing fails
  }
}

/**
 * Format time in 12-hour format (e.g., "9:00 AM")
 */
export function formatTime(timeString: string): string {
  try {
    // Handle both "HH:MM" and "HH:MM:SS" formats
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  } catch (error) {
    return timeString; // fallback to original if parsing fails
  }
}

/**
 * Format date and time together for appointments (e.g., "Monday, July 25, 2025 at 9:00 AM")
 */
export function formatAppointmentDateTime(dateString: string, timeString: string): string {
  const formattedDate = formatAppointmentDate(dateString);
  const formattedTime = formatTime(timeString);
  return `${formattedDate} at ${formattedTime}`;
}

/**
 * Format compact date and time for dashboard (e.g., "July 25 at 9:00 AM")
 */
export function formatDashboardDateTime(dateString: string, timeString: string): string {
  const formattedDate = formatDashboardDate(dateString);
  const formattedTime = formatTime(timeString);
  return `${formattedDate} at ${formattedTime}`;
}

/**
 * Check if a date is today
 */
export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function isToday(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  } catch (error) {
    return false;
  }
}

/**
 * Check if a date is in the future
 */
export function isFuture(dateString: string, timeString?: string): boolean {
  try {
    let date = new Date(dateString);
    if (timeString) {
      const [hours, minutes] = timeString.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
    }
    return date > new Date();
  } catch (error) {
    return false;
  }
} 