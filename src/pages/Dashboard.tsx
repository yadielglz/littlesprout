import { useStore } from '../store/store'
import { useState } from 'react'
import { motion } from 'framer-motion'
import MilestoneTicker from '../components/MilestoneTicker'
import NotificationSystem from '../components/NotificationSystem'
import { useAuth } from '../contexts/AuthContext'
import { useModal } from '../contexts/ModalContext'
import ValueDisplayCard from '../components/ValueDisplayCard'
import { Edit, Trash2 } from 'lucide-react'
import Modal from '../components/Modal'
import { Reminder } from '../store/store'

const Dashboard = () => {
  const {
    getCurrentProfile,
    addLog,
    getCurrentLogs,
    setActiveTimer,
    updateReminder,
    deleteReminder,
    getCurrentReminders
  } = useStore()
  const profile = getCurrentProfile()
  const logs = getCurrentLogs()
  const reminders = getCurrentReminders()
  const appointments = profile ? useStore(state => state.appointments[profile.id] || []) : []
  // Find the next upcoming appointment
  const now = new Date();
  const nextAppointment = appointments
    .map(appt => ({ ...appt, dateObj: new Date(`${appt.date}T${appt.time}`) }))
    .filter(appt => appt.dateObj > now)
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())[0];

  // Modal state
  const [remindersOpen, setRemindersOpen] = useState(false)
  const [editReminder, setEditReminder] = useState<Reminder | null>(null)
  const [editReminderText, setEditReminderText] = useState('')

  // Today's date logic
  const today = new Date();
  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
  const feedsToday = logs.filter(l => l.type === 'feed' && isSameDay(new Date(l.timestamp), today)).length;
  const sleepToday = logs.filter(l => (l.type === 'sleep' || l.type === 'nap') && isSameDay(new Date(l.timestamp), today)).reduce((acc, l) => acc + (l.rawDuration || 0), 0);
  const diapersToday = logs.filter(l => l.type === 'diaper' && isSameDay(new Date(l.timestamp), today)).length;

  const lastWeightLog = logs.filter(l => l.type === 'weight').sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
  const lastHeightLog = logs.filter(l => l.type === 'height').sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]

  // Appointments and reminders for today
  const todaysAppointments = appointments.filter(appt => isSameDay(new Date(appt.date), today));
  const todaysReminders = reminders.filter(r => r.isActive)

  // Edit reminder logic
  const handleEditReminder = (rem: Reminder) => {
    setEditReminder(rem)
    setEditReminderText(rem.text)
  }
  const handleSaveReminder = () => {
    if (editReminder && profile) {
      updateReminder(profile.id, editReminder.id, { text: editReminderText })
      setEditReminder(null)
    }
  }
  const handleDeleteReminder = (rem: Reminder) => {
    if (profile) {
      deleteReminder(profile.id, rem.id)
    }
  }

  const { openModal } = useModal();

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
            className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/20 dark:border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                Health & Growth
              </h2>
              <div className="text-xl sm:text-2xl">❤️‍🩹</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ValueDisplayCard
                label="Weight"
                value={lastWeightLog ? lastWeightLog.details : '-'}
                icon="⚖️"
                color="from-red-400 to-red-500"
                onClick={() => openModal('weight')}
              />
              <ValueDisplayCard
                label="Height"
                value={lastHeightLog ? lastHeightLog.details : '-'}
                icon="📏"
                color="from-blue-400 to-blue-500"
                onClick={() => openModal('height')}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openModal('appointment')}
                className="flex flex-col items-center justify-center text-center p-4 rounded-2xl text-white shadow-lg bg-gradient-to-br from-blue-400 to-blue-600 min-h-[140px] cursor-pointer"
              >
                <div className="text-3xl mb-2">📅</div>
                {nextAppointment ? (
                  <>
                    <div className="text-lg font-semibold mb-1">{nextAppointment.date} {nextAppointment.time}</div>
                    <div className="text-xs">{nextAppointment.location}</div>
                  </>
                ) : (
                  <div className="text-sm">No upcoming appointments</div>
                )}
                <div className="text-xs mt-2 font-semibold">Appointment</div>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* Appointments & Reminders for Today */}
        {(todaysAppointments.length > 0 || todaysReminders.length > 0) && (
          <div className="space-y-4 mb-4">
            {todaysAppointments.map(appt => (
              <div key={appt.id} className="bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500 rounded-xl p-4 flex items-center shadow">
                <div className="text-3xl mr-4">📅</div>
                <div>
                  <div className="font-bold text-blue-800 dark:text-blue-200">Doctor's Appointment</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">{appt.time} @ {appt.location}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{appt.reason}</div>
                </div>
              </div>
            ))}
            {/* Debug: Show all today's appointments raw */}
            {todaysAppointments.length > 0 && (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-2 text-xs text-gray-600 dark:text-gray-300">
                <b>Debug: Today's Appointments Raw:</b>
                <pre>{JSON.stringify(todaysAppointments, null, 2)}</pre>
              </div>
            )}
            {todaysReminders.map(rem => (
              <div key={rem.id} className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 rounded-xl p-4 flex items-center shadow">
                <div className="text-2xl mr-4">🔔</div>
                <div className="flex-1">
                  <div className="font-bold text-yellow-800 dark:text-yellow-200">Reminder</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">{rem.text}</div>
                </div>
                <button onClick={() => handleEditReminder(rem)} className="p-2 text-gray-500 hover:text-blue-500"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDeleteReminder(rem)} className="p-2 text-gray-500 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}

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
                  Add Activity
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed">
                Use the floating action button (FAB) at the bottom right to log feedings, diaper changes, sleep, and more.
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

      {profile && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="py-4"
        >
          <MilestoneTicker dob={profile.dob} />
        </motion.div>
      )}

      {/* Unified Action Modal is now managed by ModalContext and rendered in App.tsx */}

      {/* Reminders Modal */}
      <NotificationSystem 
        isOpen={remindersOpen} 
        onClose={() => setRemindersOpen(false)} 
      />

      {/* Edit Reminder Modal */}
      <Modal isOpen={!!editReminder} onClose={() => setEditReminder(null)} title="Edit Reminder">
        <div className="space-y-4">
          <input
            type="text"
            value={editReminderText}
            onChange={e => setEditReminderText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          />
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSaveReminder}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setEditReminder(null)}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}

export default Dashboard 