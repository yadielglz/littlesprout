import { useState, useEffect } from 'react'
import { useStore, Reminder } from '../store/store'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react'
import Modal from './Modal'
import { generateId } from '../utils/initialization'
import toast from 'react-hot-toast'

interface NotificationSystemProps {
  isOpen: boolean
  onClose: () => void
}

const NotificationSystem = ({ isOpen, onClose }: NotificationSystemProps) => {
  const { getCurrentProfile, getCurrentReminders, addReminder, updateReminder, deleteReminder } = useStore()
  const profile = getCurrentProfile()
  const reminders = getCurrentReminders()

  // State
  const [showAddModal, setShowAddModal] = useState(false)
  const [editReminder, setEditReminder] = useState<Reminder | null>(null)
  const [deleteReminderItem, setDeleteReminderItem] = useState<Reminder | null>(null)
  const [newReminderData, setNewReminderData] = useState<Omit<Reminder, 'id'>>({
    text: '',
    time: Date.now(),
    frequency: 'daily',
    isActive: true
  })

  // Check for due reminders
  useEffect(() => {
    if (!profile) return

    const checkReminders = () => {
      const now = new Date()
      const currentTime = now.getHours() * 60 + now.getMinutes() // Convert to minutes

      reminders.forEach(reminder => {
        if (!reminder.isActive) return

        const reminderTime = new Date(reminder.time)
        const reminderMinutes = reminderTime.getHours() * 60 + reminderTime.getMinutes()

        // Check if it's time for the reminder
        if (Math.abs(currentTime - reminderMinutes) < 5) { // Within 5 minutes
          showNotification(reminder.text)
        }
      })
    }

    // Check every minute
    const interval = setInterval(checkReminders, 60000)
    checkReminders() // Initial check

    return () => clearInterval(interval)
  }, [reminders, profile])

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const showNotification = (text: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('LittleSprout Reminder', {
        body: text,
        icon: '/favicon.svg',
        badge: '/favicon.svg'
      })
    } else {
      toast(text, {
        duration: 5000,
        icon: '🔔'
      })
    }
  }

  // Handlers
  const handleAddReminder = () => {
    if (!profile || !newReminderData.text.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    const reminder: Reminder = {
      id: generateId(),
      ...newReminderData
    }

    addReminder(profile.id, reminder)
    setShowAddModal(false)
    setNewReminderData({
      text: '',
      time: Date.now(),
      frequency: 'daily',
      isActive: true
    })
    toast.success('Reminder added successfully!')
  }

  const handleUpdateReminder = () => {
    if (!profile || !editReminder || !editReminder.text.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    updateReminder(profile.id, editReminder.id, {
      text: editReminder.text,
      time: editReminder.time,
      frequency: editReminder.frequency,
      isActive: editReminder.isActive
    })
    setEditReminder(null)
    toast.success('Reminder updated successfully!')
  }

  const handleDeleteReminder = () => {
    if (!profile || !deleteReminderItem) return

    deleteReminder(profile.id, deleteReminderItem.id)
    setDeleteReminderItem(null)
    toast.success('Reminder deleted successfully!')
  }

  const toggleReminder = (reminder: Reminder) => {
    if (!profile) return
    updateReminder(profile.id, reminder.id, { isActive: !reminder.isActive })
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const getFrequencyLabel = (frequency: 'none' | 'daily' | 'weekly') => {
    switch (frequency) {
      case 'daily': return 'Daily'
      case 'weekly': return 'Weekly'
      case 'none': return 'Once'
      default: return frequency
    }
  }

  const getNextDue = (reminder: Reminder) => {
    const now = new Date()
    const reminderTime = new Date(reminder.time)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const reminderToday = new Date(today.getTime() + reminderTime.getTime() - new Date(reminderTime.getFullYear(), reminderTime.getMonth(), reminderTime.getDate()).getTime())
    
    if (reminderToday > now) {
      return `Today at ${formatTime(reminder.time)}`
    } else {
      return `Tomorrow at ${formatTime(reminder.time)}`
    }
  }

  if (!profile) {
    return null
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Notifications & Reminders" size="xl">
        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Active Reminders ({reminders.filter(r => r.isActive).length})
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage notifications for {profile.babyName}'s care
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Add Reminder
              </button>
              <button
                onClick={() => onClose()}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                title="Notification Settings"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>

          {/* Reminders List */}
          <div className="space-y-3">
            <AnimatePresence>
              {reminders.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-8"
                >
                  <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                    No reminders yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Add reminders for feeding times, diaper changes, and other important activities.
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Add Your First Reminder
                  </button>
                </motion.div>
              ) : (
                reminders.map((reminder) => (
                  <motion.div
                    key={reminder.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`p-4 rounded-lg border transition-colors ${
                      reminder.isActive
                        ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleReminder(reminder)}
                          className={`p-2 rounded-full transition-colors ${
                            reminder.isActive
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                          }`}
                        >
                          {reminder.isActive ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        </button>
                        <div className="flex-1">
                          <p className={`font-medium ${reminder.isActive ? 'text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                            {reminder.text}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <span className="flex items-center">
                              <Clock size={14} className="mr-1" />
                              {formatTime(reminder.time)}
                            </span>
                            <span>{getFrequencyLabel(reminder.frequency)}</span>
                            <span>Next: {getNextDue(reminder)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditReminder(reminder)}
                          className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteReminderItem(reminder)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Quick Add Suggestions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3">Quick Add Suggestions</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { text: 'Morning Feeding', time: '08:00' },
                { text: 'Afternoon Nap', time: '13:00' },
                { text: 'Evening Feeding', time: '18:00' },
                { text: 'Bedtime Routine', time: '20:00' }
              ].map((suggestion) => (
                <button
                  key={suggestion.text}
                  onClick={() => {
                    setNewReminderData({
                      text: suggestion.text,
                      time: new Date().setHours(
                        parseInt(suggestion.time.split(':')[0]),
                        parseInt(suggestion.time.split(':')[1]),
                        0,
                        0
                      ),
                      frequency: 'daily',
                      isActive: true
                    })
                    setShowAddModal(true)
                  }}
                  className="text-left p-2 rounded border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
                >
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">{suggestion.text}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-300">{suggestion.time}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Add Reminder Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Reminder"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reminder Text
            </label>
            <input
              type="text"
              value={newReminderData.text}
              onChange={(e) => setNewReminderData(prev => ({ ...prev, text: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              placeholder="Enter reminder text..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time
            </label>
            <input
              type="time"
              value={formatTime(newReminderData.time)}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':')
                const date = new Date()
                date.setHours(parseInt(hours))
                date.setMinutes(parseInt(minutes))
                setNewReminderData(prev => ({ ...prev, time: date.getTime() }))
              }}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Frequency
            </label>
            <select
              value={newReminderData.frequency}
              onChange={(e) => setNewReminderData(prev => ({ 
                ...prev, 
                frequency: e.target.value as 'none' | 'daily' | 'weekly'
              }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="none">Once</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleAddReminder}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Add Reminder
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Reminder Modal */}
      <Modal
        isOpen={!!editReminder}
        onClose={() => setEditReminder(null)}
        title="Edit Reminder"
      >
        {editReminder && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reminder Text
              </label>
              <input
                type="text"
                value={editReminder.text}
                onChange={(e) => setEditReminder({ ...editReminder, text: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                placeholder="Enter reminder text..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time
              </label>
              <input
                type="time"
                value={formatTime(editReminder.time)}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':')
                  const date = new Date()
                  date.setHours(parseInt(hours))
                  date.setMinutes(parseInt(minutes))
                  setEditReminder({ ...editReminder, time: date.getTime() })
                }}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Frequency
              </label>
              <select
                value={editReminder.frequency}
                onChange={(e) => setEditReminder({ 
                  ...editReminder, 
                  frequency: e.target.value as 'none' | 'daily' | 'weekly'
                })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="none">Once</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditReminder(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateReminder}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Update Reminder
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteReminderItem}
        onClose={() => setDeleteReminderItem(null)}
        title="Delete Reminder"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this reminder? This action cannot be undone.
          </p>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setDeleteReminderItem(null)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteReminder}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default NotificationSystem 