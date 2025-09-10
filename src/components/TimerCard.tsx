import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Pause, Save } from 'lucide-react';
import { useTimer } from '../contexts/TimerContext';
import { useStore } from '../store/store';
import { DatabaseService } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { generateId } from '../utils/initialization';
import { formatLocalDateTimeInput } from '../utils/datetime';
import { formatTime, getTimerConfig, createTimerLog } from '../utils/timerUtils';
import toast from 'react-hot-toast';

const TimerCard: React.FC = () => {
  const { activeTimers, stopTimer, getTimerElapsed } = useTimer();
  const { getCurrentProfile, addLog } = useStore();
  const { currentUser } = useAuth();
  const profile = getCurrentProfile();
  
  // State for confirmation dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [timerToStop, setTimerToStop] = useState<any>(null);

  const handleStopTimerClick = (timer: any) => {
    setTimerToStop(timer);
    setShowConfirmDialog(true);
  };

  const handleSaveTimer = async () => {
    if (!timerToStop || !profile) return;

    const elapsed = getTimerElapsed(timerToStop.id);
    const duration = elapsed;
    
    // Create log entry using common utility
    const log = createTimerLog(timerToStop, duration, formatTime);

    try {
      // Add to local store
      addLog(profile.id, log);
      
      // Add to Firebase if user is authenticated
      if (currentUser) {
        await DatabaseService.addLog(currentUser.uid, profile.id, log);
      }
      
      // Stop the timer
      stopTimer(timerToStop.id);
      
      toast.success(`${timerToStop.label} logged successfully!`);
    } catch (error) {
      toast.error('Failed to save timer. Please try again.');
      console.error('Timer save error:', error);
    } finally {
      setShowConfirmDialog(false);
      setTimerToStop(null);
    }
  };

  const handleCancelTimer = () => {
    if (!timerToStop) return;
    
    // Just stop the timer without saving
    stopTimer(timerToStop.id);
    toast.success(`${timerToStop.label} timer cancelled`);
    setShowConfirmDialog(false);
    setTimerToStop(null);
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
                    onClick={() => handleStopTimerClick(timer)}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    title="Stop timer (will prompt to save)"
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

      {showConfirmDialog && timerToStop && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
              Stop {timerToStop.label} Timer?
            </h3>
            <div className="mb-4">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Timer has been running for:
              </p>
              <div className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">
                {formatTime(getTimerElapsed(timerToStop.id))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={handleSaveTimer}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save & Stop
              </button>
              <button
                onClick={handleCancelTimer}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel Timer
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TimerCard;