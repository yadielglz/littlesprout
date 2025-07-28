import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pause, Play } from 'lucide-react';
import { useTimer } from '../contexts/TimerContext';
import { useStore } from '../store/store';
import { DatabaseService } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { generateId } from '../utils/initialization';
import { formatLocalDateTimeInput } from '../utils/datetime';
import toast from 'react-hot-toast';

const TimerCard: React.FC = () => {
  const { activeTimers, stopTimer, getTimerElapsed, startTimer } = useTimer();
  const { getCurrentProfile, addLog } = useStore();
  const { currentUser } = useAuth();
  const profile = getCurrentProfile();

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
  };

  const handleStopTimer = async (timer: any) => {
    if (!profile) return;

    const elapsed = getTimerElapsed(timer.id);
    const duration = elapsed;
    
    // Create log entry
    const log = {
      id: generateId(),
      type: timer.type,
      icon: timer.icon,
      color: '',
      details: `Duration: ${formatTime(duration)}`,
      timestamp: new Date(timer.startTime),
      rawDuration: duration,
      notes: `Timer stopped at ${formatLocalDateTimeInput()}`
    };

    try {
      // Add to local store
      addLog(profile.id, log);
      
      // Add to Firebase if user is authenticated
      if (currentUser) {
        await DatabaseService.addLog(currentUser.uid, profile.id, log);
      }
      
      // Stop the timer
      stopTimer(timer.id);
      
      toast.success(`${timer.label} logged successfully!`);
    } catch (error) {
      toast.error('Failed to save timer. Please try again.');
      console.error('Timer save error:', error);
    }
  };

  const getTimerConfig = (type: string) => {
    const configs = {
      sleep: { label: 'Sleep', icon: '😴', color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-500' },
      nap: { label: 'Nap', icon: '🛏️', color: 'from-yellow-500 to-yellow-600', bgColor: 'bg-yellow-500' },
      tummy: { label: 'Tummy Time', icon: '⏱️', color: 'from-green-500 to-green-600', bgColor: 'bg-green-500' }
    };
    return configs[type as keyof typeof configs] || configs.sleep;
  };

  if (activeTimers.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/20 dark:border-gray-700/50"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
            Active Timers
          </h2>
          <div className="text-xl sm:text-2xl">⏱️</div>
        </div>
        <div className="text-center py-8">
          <div className="text-4xl mb-4 opacity-50">⏰</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">No active timers</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Start a timer from the floating action button
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/20 dark:border-gray-700/50"
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
          Active Timers
        </h2>
        <div className="text-xl sm:text-2xl">⏱️</div>
      </div>
      
      <div className="space-y-4">
        {activeTimers.map((timer) => {
          const config = getTimerConfig(timer.type);
          return (
            <motion.div
              key={timer.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`bg-gradient-to-r ${config.color} text-white rounded-xl shadow-lg p-4`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{config.icon}</div>
                  <div>
                    <div className="font-semibold text-sm">{config.label}</div>
                    <div className="text-lg font-mono font-bold">
                      {formatTime(getTimerElapsed(timer.id))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleStopTimer(timer)}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    title="Stop and save timer"
                  >
                    <Pause className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => stopTimer(timer.id)}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    title="Cancel timer"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-3">
                <div className="w-full bg-white/20 rounded-full h-2">
                  <motion.div
                    className="bg-white h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((getTimerElapsed(timer.id) / (60 * 60 * 1000)) * 100, 100)}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default TimerCard;