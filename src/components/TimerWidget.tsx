import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pause } from 'lucide-react';
import { useTimer } from '../contexts/TimerContext';
import { useStore } from '../store/store';
import { DatabaseService } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { generateId } from '../utils/initialization';
import { formatLocalDateTimeInput } from '../utils/datetime';
import { formatTime, createTimerLog } from '../utils/timerUtils';
import toast from 'react-hot-toast';

const TimerWidget: React.FC = () => {
  const { activeTimers, stopTimer, getTimerElapsed } = useTimer();
  const { getCurrentProfile, addLog } = useStore();
  const { currentUser } = useAuth();
  const profile = getCurrentProfile();

  const handleStopTimer = async (timer: any) => {
    if (!profile) return;

    const elapsed = getTimerElapsed(timer.id);
    const duration = elapsed;
    
    // Create log entry using common utility
    const log = createTimerLog(timer, duration, formatTime);

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

  if (activeTimers.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-4 z-40 space-y-2"
      >
        {activeTimers.map((timer) => (
          <motion.div
            key={timer.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={`${timer.color} text-white rounded-2xl shadow-2xl p-3 backdrop-blur-sm border border-white/20 min-w-[240px] max-w-[280px]`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{timer.icon}</div>
                <div>
                  <div className="font-semibold text-xs">{timer.label}</div>
                  <div className="text-base font-mono font-bold">
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
              <div className="w-full bg-white/20 rounded-full h-1">
                <motion.div
                  className="bg-white h-1 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((getTimerElapsed(timer.id) / (60 * 60 * 1000)) * 100, 100)}%` }}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export default TimerWidget; 