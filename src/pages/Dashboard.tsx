import { useStore } from '../store/store'
import { useFirebaseStore } from '../store/firebaseStore'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'
import MilestoneTicker from '../components/MilestoneTicker'
import NotificationSystem from '../components/NotificationSystem'
import QuickNotesWidget from '../components/QuickNotesWidget'
import { useModal } from '../contexts/ModalContext'
import ValueDisplayCard from '../components/ValueDisplayCard'
import TimerCard from '../components/TimerCard'
import StatCard from '../components/common/StatCard'
import {
  Edit,
  Trash2,
  BarChart3,
  Heart,
  Calendar,
  Bell,
  Baby,
  Moon,
  Droplet,
  Scale,
  Ruler
} from 'lucide-react'
import Modal from '../components/common/Modal'
import Card from '../components/common/Card'
import { Reminder } from '../store/store'
import toast from 'react-hot-toast'
import { formatDashboardDateTime, formatTime, isToday, isSameDay } from '../utils/datetime'
import PageLayout from '../components/layout/PageLayout'

const Dashboard = () => {
  const { getCurrentProfile, getCurrentLogs, getCurrentReminders, measurementUnit } = useStore()
  const { updateReminderInFirebase, deleteReminderFromFirebase } = useFirebaseStore()
  const { currentUser } = useAuth()
  const profile = getCurrentProfile()
  const logs = getCurrentLogs()
  const reminders = getCurrentReminders()
  const appointments = useStore((state) => (profile ? state.appointments[profile.id] || [] : []))
  const { openModal } = useModal()

  const now = new Date()
  const nextAppointment = appointments
    .map((appt) => ({ ...appt, dateObj: new Date(`${appt.date}T${appt.time}`) }))
    .filter((appt) => appt.dateObj > now)
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())[0]

  const [remindersOpen, setRemindersOpen] = useState(false)
  const [editReminder, setEditReminder] = useState<Reminder | null>(null)
  const [editReminderText, setEditReminderText] = useState('')

  const today = new Date()
  const todaysFeeds = logs.filter((l) => l.type === 'feed' && isSameDay(new Date(l.timestamp), today))
  const feedsToday = todaysFeeds.length
  const liquidIntakeToday = todaysFeeds
    .filter((feed) => feed.details.includes('Bottle (Formula)') || feed.details.includes('Breast Feed'))
    .reduce((total, feed) => total + (feed.rawAmount || 0), 0)

  const allFeeds = logs
    .filter((l) => l.type === 'feed')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  const lastFeed = allFeeds[0]
  const timeSinceLastFeed = lastFeed ? Date.now() - new Date(lastFeed.timestamp).getTime() : null

  const formatTimeSince = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    if (hours > 0) return `${hours}h ${minutes}m ago`
    return `${minutes}m ago`
  }

  const formatLastFeedTime = (timestamp: Date) =>
    timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  const sleepToday = logs
    .filter((l) => (l.type === 'sleep' || l.type === 'nap') && isSameDay(new Date(l.timestamp), today))
    .reduce((acc, l) => acc + (l.rawDuration || 0), 0)
  const diapersToday = logs.filter((l) => l.type === 'diaper' && isSameDay(new Date(l.timestamp), today)).length

  const lastWeightLog = logs
    .filter((l) => l.type === 'weight')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
  const lastHeightLog = logs
    .filter((l) => l.type === 'height')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]

  const todaysAppointments = appointments.filter((appt) => isToday(appt.date))
  const todaysReminders = reminders.filter((r) => r.isActive)

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

  if (!profile) {
    return (
      <PageLayout title="Dashboard" subtitle="Create a profile to start tracking">
        <Card className="text-center space-y-3">
          <div className="text-5xl">👶</div>
          <h2 className="text-xl font-semibold">No profile yet</h2>
          <p className="text-gray-600 dark:text-gray-400">Add your little one to unlock the dashboard.</p>
        </Card>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Dashboard" subtitle={`Today with ${profile.babyName}`}>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        <Card className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Today</p>
              <h2 className="text-xl font-bold">Activity snapshot</h2>
            </div>
            <BarChart3 className="w-5 h-5 text-blue-500" />
          </div>

          {lastFeed && (
            <div className="flex items-center justify-between rounded-lg border border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-blue-700 dark:text-blue-200">Last feed</p>
                <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  {formatLastFeedTime(new Date(lastFeed.timestamp))}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-600 dark:text-blue-300">Time since</p>
                <p className="text-base font-semibold text-blue-900 dark:text-blue-100">
                  {timeSinceLastFeed ? formatTimeSince(timeSinceLastFeed) : 'N/A'}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <StatCard icon={<Baby className="w-7 h-7" />} label="Feeds" value={feedsToday} color="blue">
              {liquidIntakeToday > 0 && (
                <div className="text-xs mt-1 opacity-90">
                  {liquidIntakeToday.toFixed(1)} {measurementUnit}
                </div>
              )}
            </StatCard>

            <StatCard
              icon={<Moon className="w-7 h-7" />}
              label="Sleep"
              value={`${Math.floor(sleepToday / 3600000)}h ${Math.round((sleepToday % 3600000) / 60000)}m`}
              color="indigo"
            />

            <StatCard icon={<Droplet className="w-7 h-7" />} label="Diapers" value={diapersToday} color="amber" />
          </div>
        </Card>

        <TimerCard />
      </div>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Health & Growth</p>
            <h2 className="text-xl font-bold">Latest measurements</h2>
          </div>
          <Heart className="w-5 h-5 text-red-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ValueDisplayCard
            label="Weight"
            value={lastWeightLog ? lastWeightLog.details : '-'}
            icon={<Scale className="w-8 h-8" />}
            tone="red"
            onClick={() => openModal('weight')}
          />
          <ValueDisplayCard
            label="Height"
            value={lastHeightLog ? lastHeightLog.details : '-'}
            icon={<Ruler className="w-8 h-8" />}
            tone="blue"
            onClick={() => openModal('height')}
          />
          <ValueDisplayCard
            label="Next appointment"
            value={
              nextAppointment
                ? formatDashboardDateTime(nextAppointment.date, nextAppointment.time)
                : 'Not scheduled'
            }
            icon={<Calendar className="w-8 h-8" />}
            tone="slate"
            onClick={() => openModal('appointment')}
          />
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Today</h3>
          <button
            onClick={() => setRemindersOpen(true)}
            className="text-sm text-blue-600 dark:text-blue-300 hover:text-blue-700"
          >
            Manage reminders
          </button>
        </div>

        {todaysAppointments.length === 0 && todaysReminders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 px-4 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Nothing scheduled for today.
          </div>
        ) : (
          <div className="space-y-3">
            {todaysAppointments.map((appt) => (
              <div
                key={appt.id}
                className="flex items-start gap-3 rounded-lg border border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-4 py-3"
              >
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-300 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-blue-900 dark:text-blue-100">Appointment</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{formatTime(appt.time)} @ {appt.location}</p>
                  {appt.reason && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{appt.reason}</p>}
                </div>
              </div>
            ))}

            {todaysReminders.map((rem) => (
              <div
                key={rem.id}
                className="flex items-start gap-3 rounded-lg border border-amber-100 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/20 px-4 py-3"
              >
                <Bell className="w-5 h-5 text-amber-600 dark:text-amber-300 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-900 dark:text-amber-100">Reminder</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{rem.text}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditReminder(rem)}
                    className="p-2 rounded-md hover:bg-amber-100 dark:hover:bg-amber-800/40"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteReminder(rem)}
                    className="p-2 rounded-md hover:bg-amber-100 dark:hover:bg-amber-800/40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <QuickNotesWidget />
      </Card>

      <MilestoneTicker dob={profile.dob} />

      <NotificationSystem isOpen={remindersOpen} onClose={() => setRemindersOpen(false)} />

      <Modal isOpen={!!editReminder} onClose={() => setEditReminder(null)} title="Edit Reminder">
        <div className="space-y-4">
          <input
            type="text"
            value={editReminderText}
            onChange={(e) => setEditReminderText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          />
          <div className="flex space-x-3 pt-2">
            <button
              onClick={handleSaveReminder}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setEditReminder(null)}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  )
}

export default Dashboard