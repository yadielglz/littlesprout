import { useStore } from '../store/store'
import { useFirebaseStore } from '../store/firebaseStore'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'
import { motion } from 'framer-motion'
import MilestoneTicker from '../components/MilestoneTicker'
import NotificationSystem from '../components/NotificationSystem'
import QuickNotesWidget from '../components/QuickNotesWidget'
import { useModal } from '../contexts/ModalContext'
import ValueDisplayCard from '../components/ValueDisplayCard'
import TimerCard from '../components/TimerCard'
import StatCard from '../components/common/StatCard'
import { Edit, Trash2, BarChart3, Heart, Rocket, FileText, Calendar, Bell, Baby, Moon, Droplet, Scale, Ruler } from 'lucide-react'
import Modal from '../components/common/Modal'
import { Reminder } from '../store/store'
import toast from 'react-hot-toast'
import { formatDashboardDateTime, formatTime, isToday, isSameDay } from '../utils/datetime'

const Dashboard = () => {
  const {
    getCurrentProfile,
    getCurrentLogs,
    getCurrentReminders,
    measurementUnit
  } = useStore()
  const {
    updateReminderInFirebase,
    deleteReminderFromFirebase
  } = useFirebaseStore()
  const { currentUser } = useAuth()
  const profile = getCurrentProfile()
  const logs = getCurrentLogs()
  const reminders = getCurrentReminders()
  const appointments = useStore(state => profile ? state.appointments[profile.id] || [] : [])
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
  
  // Enhanced feeds calculation
  const todaysFeeds = logs.filter(l => l.type === 'feed' && isSameDay(new Date(l.timestamp), today));
  const feedsToday = todaysFeeds.length;
  
  // Calculate total liquid intake (bottle + breast feeds only, exclude solids)
  const liquidIntakeToday = todaysFeeds
    .filter(feed => {
      // Check if it's a liquid feed (bottle or breast) by looking at the details
      const isBottle = feed.details.includes('Bottle (Formula)');
      const isBreast = feed.details.includes('Breast Feed');
      return isBottle || isBreast;
    })
    .reduce((total, feed) => total + (feed.rawAmount || 0), 0);

  // Get last feed information
  const allFeeds = logs.filter(l => l.type === 'feed').sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const lastFeed = allFeeds[0];
  const timeSinceLastFeed = lastFeed ? Date.now() - new Date(lastFeed.timestamp).getTime() : null;
  
  const formatTimeSince = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
  };

  const formatLastFeedTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const sleepToday = logs.filter(l => (l.type === 'sleep' || l.type === 'nap') && isSameDay(new Date(l.timestamp), today)).reduce((acc, l) => acc + (l.rawDuration || 0), 0);
  const diapersToday = logs.filter(l => l.type === 'diaper' && isSameDay(new Date(l.timestamp), today)).length;

  const lastWeightLog = logs.filter(l => l.type === 'weight').sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
  const lastHeightLog = logs.filter(l => l.type === 'height').sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]

  // Appointments and reminders for today
  const todaysAppointments = appointments.filter(appt => isToday(appt.date));
  const todaysReminders = reminders.filter(r => r.isActive)

  // Edit reminder logic
  const handleEditReminder = (rem: Reminder) => {
    setEditReminder(rem)
    setEditReminderText(rem.text)
  }
  
  const handleSaveReminder = async () => {
    if (editReminder && profile && currentUser) {
      try {
        await updateReminderInFirebase(currentUser.uid, profile.id, editReminder.id, { text: editReminderText })
        setEditReminder(null)
        toast.success('Reminder updated successfully!')
      } catch {
        toast.error('Failed to update reminder. Please try again.')
      }
    }
  }
  
  const handleDeleteReminder = async (rem: Reminder) => {
    if (profile && currentUser) {
      try {
        await deleteReminderFromFirebase(currentUser.uid, profile.id, rem.id)
        toast.success('Reminder deleted successfully!')
      } catch {
        toast.error('Failed to delete reminder. Please try again.')
      }
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
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
    >
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-12 pb-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8">
        {/* Today's Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                Today's Summary
              </h2>
              <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
            </div>
            
            {/* Feeding Summary */}
            {lastFeed && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Last Feed</div>
                    <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      {formatLastFeedTime(new Date(lastFeed.timestamp))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-blue-600 dark:text-blue-300">Time Since</div>
                    <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      {timeSinceLastFeed ? formatTimeSince(timeSinceLastFeed) : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <StatCard
                icon={<Baby className="w-8 h-8" />}
                label="Feeds"
                value={feedsToday}
                color="blue"
              >
                {liquidIntakeToday > 0 && (
                  <div className="text-xs mt-1 opacity-90">
                    {liquidIntakeToday.toFixed(1)} {measurementUnit}
                  </div>
                )}
              </StatCard>
              
              <StatCard
                icon={<Moon className="w-8 h-8" />}
                label="Sleep"
                value={`${Math.floor(sleepToday/3600000)}h ${Math.round((sleepToday%3600000)/60000)}m`}
                color="indigo"
              />
              
              <StatCard
                icon={<Droplet className="w-8 h-8" />}
                label="Diapers"
                value={diapersToday}
                color="amber"
              />
            </div>
          </motion.div>

          {/* Timer Card */}
          <TimerCard />
        </motion.div>

        {/* Health & Growth Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
              Health & Growth
            </h2>
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ValueDisplayCard
              label="Weight"
              value={lastWeightLog ? lastWeightLog.details : '-'}
              icon={<Scale className="w-10 h-10" />}
              color="from-red-400 to-red-500"
              onClick={() => openModal('weight')}
            />
            <ValueDisplayCard
              label="Height"
              value={lastHeightLog ? lastHeightLog.details : '-'}
              icon={<Ruler className="w-10 h-10" />}
              color="from-blue-400 to-blue-500"
              onClick={() => openModal('height')}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openModal('appointment')}
              className="flex flex-col items-center justify-center text-center p-6 rounded-xl text-white shadow-sm bg-blue-500 hover:bg-blue-600 min-h-[140px] cursor-pointer transition-colors"
            >
              <Calendar className="w-12 h-12 mb-2 text-white" />
              {nextAppointment ? (
                <>
                  <div className="text-lg font-semibold mb-1">{formatDashboardDateTime(nextAppointment.date, nextAppointment.time)}</div>
                  <div className="text-xs">{nextAppointment.location}</div>
                </>
              ) : (
                <div className="text-sm">No upcoming appointments</div>
              )}
              <div className="text-xs mt-2 font-semibold">Appointment</div>
            </motion.button>
          </div>
        </motion.div>

        {/* Appointments & Reminders for Today */}
        {(todaysAppointments.length > 0 || todaysReminders.length > 0) && (
          <div className="space-y-4 mb-4">
            {todaysAppointments.map(appt => (
              <div key={appt.id} className="bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500 rounded-xl p-4 flex items-center shadow">
                <Calendar className="w-8 h-8 mr-4 text-blue-500" />
                <div>
                  <div className="font-bold text-blue-800 dark:text-blue-200">Doctor's Appointment</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">{formatTime(appt.time)} @ {appt.location}</div>
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
                <Bell className="w-6 h-6 mr-4" />
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
          className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Rocket className="w-6 h-6" />
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
                <FileText className="w-12 h-12 xl:w-16 xl:h-16 opacity-70 text-blue-600 dark:text-blue-400" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Quick Notes Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <QuickNotesWidget />
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