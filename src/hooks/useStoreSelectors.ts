import { useMemo } from 'react';
import { useStore } from '../store/store';
import type { BabyProfile, LogEntry, Inventory, Reminder, Appointment } from '../store/store';

// Memoized selectors to prevent unnecessary re-renders

export const useCurrentProfile = (): BabyProfile | null => {
  return useStore(state => {
    return state.profiles.find(p => p.id === state.currentProfileId) || null;
  });
};

export const useCurrentProfileId = (): string | null => {
  return useStore(state => state.currentProfileId);
};

export const useProfileCount = (): number => {
  return useStore(state => state.profiles.length);
};

export const useCurrentLogs = (): LogEntry[] => {
  return useStore(state => {
    return state.currentProfileId ? state.logs[state.currentProfileId] || [] : [];
  });
};

export const useCurrentInventory = (): Inventory => {
  return useStore(state => {
    return state.currentProfileId 
      ? state.inventories[state.currentProfileId] || { diapers: 0, formula: 0 }
      : { diapers: 0, formula: 0 };
  });
};

export const useCurrentReminders = (): Reminder[] => {
  return useStore(state => {
    return state.currentProfileId ? state.reminders[state.currentProfileId] || [] : [];
  });
};

export const useCurrentAppointments = (): Appointment[] => {
  return useStore(state => {
    return state.currentProfileId ? state.appointments[state.currentProfileId] || [] : [];
  });
};

export const useThemeSettings = () => {
  return useStore(state => ({
    isDarkMode: state.isDarkMode,
    temperatureUnit: state.temperatureUnit,
    measurementUnit: state.measurementUnit,
  }));
};

// Performance optimized hooks for specific data needs
export const useTodaysLogs = (): LogEntry[] => {
  const logs = useCurrentLogs();
  
  return useMemo(() => {
    const today = new Date().toDateString();
    return logs.filter(log => new Date(log.timestamp).toDateString() === today);
  }, [logs]);
};

export const useLogsByType = (type: string): LogEntry[] => {
  const logs = useCurrentLogs();
  
  return useMemo(() => {
    return logs.filter(log => log.type === type);
  }, [logs, type]);
};

export const useRecentLogs = (count: number = 10): LogEntry[] => {
  const logs = useCurrentLogs();
  
  return useMemo(() => {
    return logs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, count);
  }, [logs, count]);
};

export const useActiveReminders = (): Reminder[] => {
  const reminders = useCurrentReminders();
  
  return useMemo(() => {
    return reminders.filter(reminder => reminder.isActive);
  }, [reminders]);
};

export const useUpcomingAppointments = (): Appointment[] => {
  const appointments = useCurrentAppointments();
  
  return useMemo(() => {
    const now = new Date();
    return appointments
      .filter(appt => new Date(`${appt.date}T${appt.time}`) > now)
      .sort((a, b) => 
        new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
      );
  }, [appointments]);
};

export const useNextAppointment = (): Appointment | null => {
  const upcomingAppointments = useUpcomingAppointments();
  
  return useMemo(() => {
    return upcomingAppointments[0] || null;
  }, [upcomingAppointments]);
};

// Dashboard specific selectors
export const useDashboardStats = () => {
  const logs = useCurrentLogs();
  
  return useMemo(() => {
    const today = new Date().toDateString();
    const todaysLogs = logs.filter(log => new Date(log.timestamp).toDateString() === today);
    
    const feedsToday = todaysLogs.filter(log => log.type === 'feed').length;
    const diapersToday = todaysLogs.filter(log => log.type === 'diaper').length;
    const sleepToday = todaysLogs
      .filter(log => log.type === 'sleep' || log.type === 'nap')
      .reduce((total, log) => total + (log.rawDuration || 0), 0);
    
    return {
      feedsToday,
      diapersToday,
      sleepToday,
      totalLogsToday: todaysLogs.length,
    };
  }, [logs]);
};

// Chart data selectors
export const useWeeklyFeedingData = () => {
  const logs = useCurrentLogs();
  
  return useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weeklyFeeds = logs.filter(log => 
      log.type === 'feed' && new Date(log.timestamp) >= weekAgo
    );
    
    const dailyData: { [key: string]: number } = {};
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateString = date.toDateString();
      dailyData[dateString] = weeklyFeeds.filter(feed => 
        new Date(feed.timestamp).toDateString() === dateString
      ).length;
    }
    
    return Object.entries(dailyData)
      .map(([date, count]) => ({ date, count }))
      .reverse();
  }, [logs]);
};

export const useInventoryStatus = () => {
  const inventory = useCurrentInventory();
  
  return useMemo(() => {
    const lowStockThreshold = 5;
    
    return {
      ...inventory,
      isLowStock: inventory.diapers <= lowStockThreshold || inventory.formula <= lowStockThreshold,
      lowStockItems: [
        ...(inventory.diapers <= lowStockThreshold ? ['diapers'] : []),
        ...(inventory.formula <= lowStockThreshold ? ['formula'] : []),
      ],
    };
  }, [inventory]);
}; 