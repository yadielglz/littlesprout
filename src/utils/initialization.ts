export const initializeApp = async () => {
  // Placeholder for any async initialization logic
  return Promise.resolve()
}

export const generateId = () =>
  Math.random().toString(36).substr(2, 9) + Date.now().toString(36)

export const calculateAge = (dob: string) => {
  try {
    const [birthYear, birthMonth, birthDay] = dob.split('-').map(Number);
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