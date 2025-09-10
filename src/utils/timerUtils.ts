/**
 * Common timer utilities used across timer components
 */

export const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
};

export const getTimerConfig = (type: string) => {
  const configs = {
    sleep: { 
      label: 'Sleep', 
      icon: '😴', 
      color: 'from-indigo-500 to-indigo-600', 
      bgColor: 'bg-indigo-500',
      solidColor: 'bg-indigo-500'
    },
    nap: { 
      label: 'Nap', 
      icon: '🛏️', 
      color: 'from-yellow-500 to-yellow-600', 
      bgColor: 'bg-yellow-500',
      solidColor: 'bg-yellow-500'
    },
    tummy: { 
      label: 'Tummy Time', 
      icon: '⏱️', 
      color: 'from-green-500 to-green-600', 
      bgColor: 'bg-green-500',
      solidColor: 'bg-green-500'
    }
  };
  return configs[type as keyof typeof configs] || configs.sleep;
};

export const createTimerLog = (timer: any, elapsed: number, formatTime: (ms: number) => string) => {
  return {
    id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
    type: timer.type,
    icon: timer.icon,
    color: '',
    details: `Duration: ${formatTime(elapsed)}`,
    timestamp: new Date(timer.startTime),
    rawDuration: elapsed,
    notes: `Timer stopped at ${new Date().toISOString().slice(0, 16)}`
  };
};
