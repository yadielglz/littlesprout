import { useState } from 'react'
import { useStore, Reminder } from '../store/store'
import { useFirebaseStore } from '../store/firebaseStore'
import { useAuth } from '../contexts/AuthContext'
import { generateId } from '../utils/initialization'
import { motion } from 'framer-motion'
import { Edit, Trash2, Bell, Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Modal from './common/Modal'
import toast from 'react-hot-toast'

interface RemindersProps {
  isOpen: boolean
  onClose: () => void
}

const Reminders = ({ isOpen, onClose }: RemindersProps) => {
  const { getCurrentProfile, getCurrentReminders } = useStore()
  const { 
    addReminderToFirebase, 
    updateReminderInFirebase, 
    deleteReminderFromFirebase 
  } = useFirebaseStore()
  const { currentUser } = useAuth()
  const profile = getCurrentProfile()
  const reminders = getCurrentReminders()

  // State
  const [showAddModal, setShowAddModal] = useState(false)
  const [editReminder, setEditReminder] = useState<Reminder | null>(null)
  const [deleteReminderItem, setDeleteReminderItem] = useState<Reminder | null>(null)
  const [newReminderData, setNewReminderData] = useState({
    text: '',
    time: new Date().getTime(),
    frequency: 'daily' as 'none' | 'daily' | 'weekly',
    isActive: true
  })

  // Check for due reminders
  // useEffect(() => {
  //   if (!profile) return

  //   const checkReminders = () => {
  //     const now = new Date()
  //     const currentTime = now.getHours() * 60 + now.getMinutes()

  //     reminders.forEach(reminder => {
  //       if (!reminder.isActive) return

  //       const reminderTime = new Date(reminder.time)
  //       const reminderMinutes = reminderTime.getHours() * 60 + reminderTime.getMinutes()

  //       if (Math.abs(currentTime - reminderMinutes) < 5) {
  //         showNotification(reminder.text)
  //       }
  //     })
  //   }

  //   const interval = setInterval(checkReminders, 60000)
  //   checkReminders()

  //   return () => clearInterval(interval)
  // }, [reminders, profile])

  // Request notification permission
  // useEffect(() => {
  //   if ('Notification' in window && Notification.permission === 'default') {
  //     Notification.requestPermission()
  //   }
  // }, [])



  const handleAddReminder = async () => {
    if (!profile || !currentUser || !newReminderData.text.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    const reminder: Reminder = {
      id: generateId(),
      text: newReminderData.text,
      time: newReminderData.time,
      frequency: newReminderData.frequency,
      isActive: newReminderData.isActive
    }

    try {
      await addReminderToFirebase(currentUser.uid, profile.id, reminder)
      setShowAddModal(false)
      setNewReminderData({
        text: '',
        time: new Date().getTime(),
        frequency: 'daily',
        isActive: true
      })
      toast.success('Reminder added successfully!')
    } catch (error) {
      toast.error('Failed to add reminder. Please try again.')
    }
  }

  const handleUpdateReminder = async () => {
    if (!profile || !currentUser || !editReminder || !editReminder.text.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      await updateReminderInFirebase(currentUser.uid, profile.id, editReminder.id, {
        text: editReminder.text,
        time: editReminder.time,
        frequency: editReminder.frequency,
        isActive: editReminder.isActive
      })
      setEditReminder(null)
      toast.success('Reminder updated successfully!')
    } catch (error) {
      toast.error('Failed to update reminder. Please try again.')
    }
  }

  const handleDeleteReminder = async () => {
    if (!profile || !currentUser || !deleteReminderItem) return

    try {
      await deleteReminderFromFirebase(currentUser.uid, profile.id, deleteReminderItem.id)
      setDeleteReminderItem(null)
      toast.success('Reminder deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete reminder. Please try again.')
    }
  }

  const toggleReminder = async (reminder: Reminder) => {
    if (!profile || !currentUser) return

    try {
      await updateReminderInFirebase(currentUser.uid, profile.id, reminder.id, { 
        isActive: !reminder.isActive 
      })
    } catch (error) {
      toast.error('Failed to update reminder. Please try again.')
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Daily'
      case 'weekly': return 'Weekly'
      case 'none': return 'Once'
      default: return frequency
    }
  }

  if (!profile) return null

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Notifications & Reminders" size="xl">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Active Reminders ({reminders.filter(r => r.isActive).length})
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage notifications for {profile.babyName}'s care
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Add Reminder
            </button>
          </div>

          <div className="space-y-3">
            {reminders.length === 0 ? (
              <div className="text-center py-8">
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
              </div>
            ) : (
              reminders.map((reminder) => (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
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
          </div>
        </div>
      </Modal>

      {/* Add/Edit Reminder Modal */}
      <Modal
        isOpen={showAddModal || editReminder !== null}
        onClose={() => {
          setShowAddModal(false)
          setEditReminder(null)
        }}
        title={editReminder ? 'Edit Reminder' : 'Add Reminder'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reminder Text
            </label>
            <input
              type="text"
              value={editReminder?.text || newReminderData.text}
              onChange={(e) => {
                if (editReminder) {
                  setEditReminder({ ...editReminder, text: e.target.value })
                } else {
                  setNewReminderData({ ...newReminderData, text: e.target.value })
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              placeholder="Enter reminder text..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time
            </label>
            <input
              type="time"
              value={new Date(editReminder?.time || newReminderData.time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':')
                const date = new Date()
                date.setHours(parseInt(hours), parseInt(minutes))
                if (editReminder) {
                  setEditReminder({ ...editReminder, time: date.getTime() })
                } else {
                  setNewReminderData({ ...newReminderData, time: date.getTime() })
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Frequency
            </label>
            <select
              value={editReminder?.frequency || newReminderData.frequency}
              onChange={(e) => {
                const value = e.target.value as 'none' | 'daily' | 'weekly'
                if (editReminder) {
                  setEditReminder({ ...editReminder, frequency: value })
                } else {
                  setNewReminderData({ ...newReminderData, frequency: value })
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              <option value="none">Once</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={() => {
                setShowAddModal(false)
                setEditReminder(null)
              }}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={editReminder ? handleUpdateReminder : handleAddReminder}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {editReminder ? 'Update' : 'Add'} Reminder
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteReminderItem !== null}
        onClose={() => setDeleteReminderItem(null)}
        title="Delete Reminder"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this reminder? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setDeleteReminderItem(null)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteReminder}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default Reminders 