import { useStore } from '../store/store'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Timer from '../components/Timer'
import MilestoneTicker from '../components/MilestoneTicker'
import HealthGrowthCard from '../components/HealthGrowthCard'
import NotificationSystem from '../components/NotificationSystem'
import FloatingActionButton, { ActionItem } from '../components/FloatingActionButton'
import UnifiedActionModal, { ActionType } from '../components/UnifiedActionModal'
import { DatabaseService } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'

const Dashboard = () => {
  const {
    getCurrentProfile,
    addLog,
    getCurrentLogs,
    setActiveTimer
  } = useStore()
  const profile = getCurrentProfile()
  const logs = getCurrentLogs()
  const { currentUser } = useAuth()

  // Modal state
  const [remindersOpen, setRemindersOpen] = useState(false)
  
  // Unified Action System state
  const [unifiedModalOpen, setUnifiedModalOpen] = useState(false)
  const [selectedActionType, setSelectedActionType] = useState<ActionType | null>(null)
  const [timerOpen, setTimerOpen] = useState(false)
  const [timerLabel, setTimerLabel] = useState('')

  // Define all available actions for the FAB
  const fabActions: ActionItem[] = [
    // Daily Care Actions
    { 
      id: 'feed', 
      label: 'Log Feeding', 
      icon: '🍼', 
      color: 'bg-blue-500', 
      category: 'care', 
      action: () => handleUnifiedAction('feed') 
    },
    { 
      id: 'diaper', 
      label: 'Diaper Change', 
      icon: '👶', 
      color: 'bg-amber-500', 
      category: 'care', 
      action: () => handleUnifiedAction('diaper') 
    },
    { 
      id: 'sleep', 
      label: 'Sleep', 
      icon: '😴', 
      color: 'bg-indigo-500', 
      category: 'care', 
      action: () => handleUnifiedAction('sleep'),
      requiresTimer: true
    },
    { 
      id: 'nap', 
      label: 'Nap', 
      icon: '🛏️', 
      color: 'bg-yellow-500', 
      category: 'care', 
      action: () => handleUnifiedAction('nap'),
      requiresTimer: true
    },
    { 
      id: 'tummy', 
      label: 'Tummy Time', 
      icon: '⏱️', 
      color: 'bg-green-500', 
      category: 'care', 
      action: () => handleUnifiedAction('tummy'),
      requiresTimer: true
    },

    // Health & Growth Actions
    { 
      id: 'weight', 
      label: 'Weight & Height', 
      icon: '📏', 
      color: 'bg-red-500', 
      category: 'health', 
      action: () => handleUnifiedAction('weight') 
    },
    { 
      id: 'temperature', 
      label: 'Temperature', 
      icon: '🌡️', 
      color: 'bg-purple-500', 
      category: 'health', 
      action: () => handleUnifiedAction('temperature') 
    },
    { 
      id: 'vaccine', 
      label: 'Vaccine', 
      icon: '💉', 
      color: 'bg-pink-500', 
      category: 'health', 
      action: () => handleUnifiedAction('vaccine') 
    },
    { 
      id: 'health', 
      label: 'Health Note', 
      icon: '📝', 
      color: 'bg-teal-500', 
      category: 'health', 
      action: () => handleUnifiedAction('health') 
    },

    // Schedule Actions
    { 
      id: 'appointment', 
      label: 'Doctor\'s Appointment', 
      icon: '📅', 
      color: 'bg-blue-600', 
      category: 'schedule', 
      action: () => handleUnifiedAction('appointment') 
    },
    { 
      id: 'reminder', 
      label: 'Add Reminder', 
      icon: '🔔', 
      color: 'bg-orange-500', 
      category: 'schedule', 
      action: () => handleUnifiedAction('reminder') 
    }
  ]

  // Handle unified action selection
  const handleUnifiedAction = (actionType: ActionType) => {
    setSelectedActionType(actionType)
    setUnifiedModalOpen(true)
  }

  // Handle starting timer from unified modal
  const handleStartTimer = (type: 'sleep' | 'nap' | 'tummy') => {
    setTimerLabel(type === 'sleep' ? 'Sleep Timer' : type === 'nap' ? 'Nap Timer' : 'Tummy Time Timer')
    setActiveTimer({ type, startTime: Date.now() })
    setTimerOpen(true)
    setUnifiedModalOpen(false)
  }

  // Timer save handler
  const handleTimerSave = (duration: number, time: string) => {
    if (!profile) return
    
    const timerType = timerLabel.toLowerCase().replace(' timer', '')
    const logEntry = {
      id: `timer_${Date.now()}`,
      type: timerType,
      icon: timerLabel === 'Sleep Timer' ? '😴' : timerLabel === 'Nap Timer' ? '🛏️' : '⏱️',
      color: '',
      details: `Duration: ${Math.round(duration/60000)} min`,
      timestamp: new Date(time),
      rawDuration: duration
    }
    
    addLog(profile.id, logEntry)
    if(currentUser){
      DatabaseService.addLog(currentUser.uid, profile.id, logEntry).catch(console.error)
    }
    
    setTimerOpen(false)
    setTimerLabel('')
    setActiveTimer(null)
  }

  // Today's summary
  const today = new Date().toDateString()
  const feedsToday = logs.filter(l => l.type === 'feed' && new Date(l.timestamp).toDateString() === today).length
  const sleepToday = logs.filter(l => (l.type === 'sleep' || l.type === 'nap') && new Date(l.timestamp).toDateString() === today).reduce((acc, l) => acc + (l.rawDuration || 0), 0)
  const diapersToday = logs.filter(l => l.type === 'diaper' && new Date(l.timestamp).toDateString() === today).length

  if (!profile) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700"
        >
          <div className="text-6xl mb-4">👶</div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            No Profile Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Please set up a profile to get started.
          </p>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20"
    >
      {profile && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="py-4"
        >
          <MilestoneTicker dob={profile.dob} />
        </motion.div>
      )}

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8">
        {/* Today's Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8"
        >
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/20 dark:border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                Today's Summary
              </h2>
              <div className="text-xl sm:text-2xl">📊</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-4 sm:p-6 shadow-lg cursor-pointer relative overflow-hidden min-h-[120px] sm:min-h-[140px]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent"></div>
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🍼</div>
                <motion.div 
                  key={feedsToday}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-2xl sm:text-3xl font-bold"
                >
                  {feedsToday}
                </motion.div>
                <div className="text-xs sm:text-sm opacity-90 font-medium">Feeds</div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl p-4 sm:p-6 shadow-lg cursor-pointer relative overflow-hidden min-h-[120px] sm:min-h-[140px]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-transparent"></div>
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">😴</div>
                <motion.div 
                  key={sleepToday}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-lg sm:text-2xl font-bold text-center"
                >
                  {Math.floor(sleepToday/3600000)}h {Math.round((sleepToday%3600000)/60000)}m
                </motion.div>
                <div className="text-xs sm:text-sm opacity-90 font-medium">Sleep</div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-4 sm:p-6 shadow-lg cursor-pointer relative overflow-hidden min-h-[120px] sm:min-h-[140px]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-transparent"></div>
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">👶</div>
                <motion.div 
                  key={diapersToday}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-2xl sm:text-3xl font-bold"
                >
                  {diapersToday}
                </motion.div>
                <div className="text-xs sm:text-sm opacity-90 font-medium">Diapers</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Health & Growth Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <HealthGrowthCard 
              onLogGrowth={() => handleUnifiedAction('weight')}
              onLogTemp={() => handleUnifiedAction('temperature')}
              onLogVaccine={() => handleUnifiedAction('vaccine')}
              onAddNote={() => handleUnifiedAction('health')}
            />
          </motion.div>
        </motion.div>

        {/* Quick Actions Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.01 }}
          className="bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 dark:from-violet-500/20 dark:via-purple-500/20 dark:to-pink-500/20 rounded-2xl p-4 sm:p-6 lg:p-8 border border-violet-200/50 dark:border-violet-700/50 backdrop-blur-sm shadow-lg"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg sm:rounded-xl">
                  <div className="text-lg sm:text-2xl">🚀</div>
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 dark:text-white">
                  Quick Actions Available
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed">
                Use the floating action button to quickly log activities, schedule appointments, and manage reminders. 
                All your actions are organized by category for easy access.
              </p>
            </div>
            <div className="hidden lg:block flex-shrink-0">
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="text-5xl xl:text-6xl opacity-70"
              >
                📝
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton 
        actions={fabActions}
        position="bottom-right"
        onActionSelect={(action) => console.log('Action selected:', action)}
      />

      {/* Unified Action Modal */}
      <UnifiedActionModal
        isOpen={unifiedModalOpen}
        actionType={selectedActionType}
        onClose={() => {
          setUnifiedModalOpen(false)
          setSelectedActionType(null)
        }}
        onStartTimer={handleStartTimer}
      />

      {/* Timer Component */}
      <Timer 
        isOpen={timerOpen} 
        onClose={() => setTimerOpen(false)} 
        onSave={handleTimerSave} 
        label={timerLabel} 
      />

      {/* Reminders Modal */}
      <NotificationSystem 
        isOpen={remindersOpen} 
        onClose={() => setRemindersOpen(false)} 
      />
    </motion.div>
  )
}

export default Dashboard 