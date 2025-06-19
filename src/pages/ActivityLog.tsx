import { useState, useMemo } from 'react'
import { useStore, LogEntry } from '../store/store'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Calendar,
  Clock,
  Plus
} from 'lucide-react'
import Modal from '../components/Modal'
import { generateId } from '../utils/initialization'
import toast from 'react-hot-toast'

const ActivityLog = () => {
  const { getCurrentProfile, getCurrentLogs, addLog, updateLog, deleteLog } = useStore()
  const profile = getCurrentProfile()
  const logs = getCurrentLogs()

  // State
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [editLog, setEditLog] = useState<LogEntry | null>(null)
  const [deleteLogEntry, setDeleteLogEntry] = useState<LogEntry | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newLogData, setNewLogData] = useState({
    type: 'feed',
    details: '',
    notes: '',
    time: new Date().toISOString().slice(0, 16)
  })

  // Filter and search logs
  const filteredLogs = useMemo(() => {
    let filtered = logs

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(log => log.type === filterType)
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(log => new Date(log.timestamp) >= startOfDay)
          break
        case 'week':
          const weekAgo = new Date(startOfDay.getTime() - 7 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(log => new Date(log.timestamp) >= weekAgo)
          break
        case 'month':
          const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
          filtered = filtered.filter(log => new Date(log.timestamp) >= monthAgo)
          break
      }
    }

    // Search
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [logs, searchTerm, filterType, dateFilter])

  // Activity types
  const activityTypes = [
    { value: 'all', label: 'All Activities', icon: '📋' },
    { value: 'feed', label: 'Feeding', icon: '🍼' },
    { value: 'sleep', label: 'Sleep', icon: '😴' },
    { value: 'diaper', label: 'Diaper', icon: '👶' },
    { value: 'weight', label: 'Weight', icon: '📏' },
    { value: 'nap', label: 'Nap', icon: '🛏️' },
    { value: 'tummy', label: 'Tummy Time', icon: '⏱️' }
  ]

  // Date filters
  const dateFilters = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ]

  // Handlers
  const handleAddLog = () => {
    if (!profile || !newLogData.details.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    const log: LogEntry = {
      id: generateId(),
      type: newLogData.type,
      icon: activityTypes.find(t => t.value === newLogData.type)?.icon || '📋',
      color: '',
      details: newLogData.details,
      timestamp: new Date(newLogData.time),
      notes: newLogData.notes || undefined
    }

    addLog(profile.id, log)
    setShowAddModal(false)
    setNewLogData({ type: 'feed', details: '', notes: '', time: new Date().toISOString().slice(0, 16) })
    toast.success('Activity logged successfully!')
  }

  const handleUpdateLog = () => {
    if (!profile || !editLog || !editLog.details.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    updateLog(profile.id, editLog.id, {
      type: editLog.type,
      details: editLog.details,
      notes: editLog.notes,
      timestamp: new Date(editLog.timestamp)
    })
    setEditLog(null)
    toast.success('Activity updated successfully!')
  }

  const handleDeleteLog = () => {
    if (!profile || !deleteLogEntry) return

    deleteLog(profile.id, deleteLogEntry.id)
    setDeleteLogEntry(null)
    toast.success('Activity deleted successfully!')
  }

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            No Profile Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Please set up a profile to view activity logs.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-slate-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Activity Log</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Track and manage {profile.babyName}'s daily activities
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Add Activity
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {activityTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {dateFilters.map(filter => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Activity List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                No activities found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || filterType !== 'all' || dateFilter !== 'all' 
                  ? 'Try adjusting your filters or search terms'
                  : 'Start by adding your first activity!'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLogs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">{log.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-800 dark:text-white capitalize">
                            {log.type}
                          </h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatTime(log.timestamp)}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-1">
                          {log.details}
                        </p>
                        {log.notes && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                            "{log.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditLog(log)}
                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteLogEntry(log)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Add Activity Modal */}
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Activity">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Activity Type
              </label>
              <select
                value={newLogData.type}
                onChange={(e) => setNewLogData({ ...newLogData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                {activityTypes.slice(1).map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Details *
              </label>
              <input
                type="text"
                value={newLogData.details}
                onChange={(e) => setNewLogData({ ...newLogData, details: e.target.value })}
                placeholder="e.g., 4 oz formula, wet diaper, etc."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time
              </label>
              <input
                type="datetime-local"
                value={newLogData.time}
                onChange={(e) => setNewLogData({ ...newLogData, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={newLogData.notes}
                onChange={(e) => setNewLogData({ ...newLogData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleAddLog}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Activity
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>

        {/* Edit Activity Modal */}
        <Modal isOpen={!!editLog} onClose={() => setEditLog(null)} title="Edit Activity">
          {editLog && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Activity Type
                </label>
                <select
                  value={editLog.type}
                  onChange={(e) => setEditLog({ ...editLog, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                >
                  {activityTypes.slice(1).map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Details *
                </label>
                <input
                  type="text"
                  value={editLog.details}
                  onChange={(e) => setEditLog({ ...editLog, details: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time
                </label>
                <input
                  type="datetime-local"
                  value={new Date(editLog.timestamp).toISOString().slice(0, 16)}
                  onChange={(e) => setEditLog({ ...editLog, timestamp: new Date(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={editLog.notes || ''}
                  onChange={(e) => setEditLog({ ...editLog, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleUpdateLog}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Update Activity
                </button>
                <button
                  onClick={() => setEditLog(null)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={!!deleteLogEntry} onClose={() => setDeleteLogEntry(null)} title="Delete Activity">
          {deleteLogEntry && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Are you sure you want to delete this activity? This action cannot be undone.
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{deleteLogEntry.icon}</span>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white capitalize">
                      {deleteLogEntry.type}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {deleteLogEntry.details}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(deleteLogEntry.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleDeleteLog}
                  className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteLogEntry(null)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}

export default ActivityLog 