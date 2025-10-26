import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ActiveTimer {
  id: string;
  type: 'sleep' | 'nap' | 'tummy' | 'helmet' | 'shower';
  startTime: number;
  label: string;
  icon: string;
  color: string;
}

interface TimerContextType {
  activeTimers: ActiveTimer[];
  startTimer: (type: 'sleep' | 'nap' | 'tummy' | 'helmet' | 'shower') => void;
  stopTimer: (id: string) => void;
  getTimerElapsed: (id: string) => number;
  isTimerRunning: (type: 'sleep' | 'nap' | 'tummy' | 'helmet' | 'shower') => boolean;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

export const TimerProvider = ({ children }: { children: ReactNode }) => {
  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every second to keep timers accurate
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Load timers from localStorage on mount
  useEffect(() => {
    const savedTimers = localStorage.getItem('activeTimers');
    if (savedTimers) {
      try {
        const timers = JSON.parse(savedTimers);
        setActiveTimers(timers);
      } catch (error) {
        console.error('Failed to load timers from localStorage:', error);
      }
    }
  }, []);

  // Save timers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('activeTimers', JSON.stringify(activeTimers));
  }, [activeTimers]);

  const startTimer = (type: 'sleep' | 'nap' | 'tummy' | 'helmet' | 'shower') => {
    const timerConfig = {
      sleep: { label: 'Sleep', icon: '😴', color: 'bg-indigo-500' },
      nap: { label: 'Nap', icon: '🛏️', color: 'bg-yellow-500' },
      tummy: { label: 'Tummy Time', icon: '⏱️', color: 'bg-green-500' },
      helmet: { label: 'Helmet Wear', icon: '🪖', color: 'bg-slate-600' },
      shower: { label: 'Shower/Bath', icon: '🚿', color: 'bg-cyan-500' }
    };

    const config = timerConfig[type];
    const newTimer: ActiveTimer = {
      id: `${type}_${Date.now()}`,
      type,
      startTime: Date.now(),
      label: config.label,
      icon: config.icon,
      color: config.color
    };

    setActiveTimers(prev => [...prev, newTimer]);
  };

  const stopTimer = (id: string) => {
    setActiveTimers(prev => prev.filter(timer => timer.id !== id));
  };

  const getTimerElapsed = (id: string): number => {
    const timer = activeTimers.find(t => t.id === id);
    if (!timer) return 0;
    return currentTime - timer.startTime;
  };

  const isTimerRunning = (type: 'sleep' | 'nap' | 'tummy' | 'helmet' | 'shower'): boolean => {
    return activeTimers.some(timer => timer.type === type);
  };

  return (
    <TimerContext.Provider value={{
      activeTimers,
      startTimer,
      stopTimer,
      getTimerElapsed,
      isTimerRunning
    }}>
      {children}
    </TimerContext.Provider>
  );
}; 