import { useMemo, useState } from 'react'
import { useStore, LogEntry } from '../store/store'
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Calendar,
  Clock
} from 'lucide-react'
import Modal from '../components/common/Modal'
import toast from 'react-hot-toast'
import { formatLocalDateTimeInput } from '../utils/datetime'
import { DatabaseService } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'
import PageLayout from '../components/layout/PageLayout'
import Card from '../components/common/Card'

const ActivityLog = () => {
  const { getCurrentProfile, getCurrentLogs, updateLog, deleteLog } = useStore()
  const profile = getCurrentProfile()
  const logs = getCurrentLogs()
  const { currentUser } = useAuth()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [editLog, setEditLog] = useState<LogEntry | null>(null)
  const [deleteLogEntry, setDeleteLogEntry] = useState<LogEntry | null>(null)

  const filteredLogs = useMemo(() => {
    let filtered = logs

    if (filterType !== 'all') {
      filtered = filtered.filter((log) => log.type === filterType)
    }

    if (dateFilter !== 'all') {
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())

      switch (dateFilter) {
        case 'today': {
          filtered = filtered.filter((log) => new Date(log.timestamp) >= startOfDay)
          break
        }
        case 'week': {
          const weekAgo = new Date(startOfDay.getTime() - 7 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter((log) => new Date(log.timestamp) >= weekAgo)
          break
        }
        case 'month': {
          const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
          filtered = filtered.filter((log) => new Date(log.timestamp) >= monthAgo)
          break
        }
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [logs, searchTerm, filterType, dateFilter])

  const activityTypes = [
    { value: 'all', label: 'All activities', icon: '📋' },
    { value: 'feed', label: 'Feeding', icon: '🍼' },
    { value: 'sleep', label: 'Sleep', icon: '😴' },
    { value: 'diaper', label: 'Diaper', icon: '👶' },
    { value: 'nap', label: 'Nap', icon: '🛏️' },
    { value: 'tummy', label: 'Tummy time', icon: '⏱️' },
    { value: 'helmet', label: 'Helmet', icon: '🪖' },
    { value: 'shower', label: 'Shower/Bath', icon: '🚿' },
    { value: 'weight', label: 'Weight & Height', icon: '📏' },
    { value: 'temperature', label: 'Temperature', icon: '🌡️' },
    { value: 'vaccine', label: 'Vaccine', icon: '💉' },
    { value: 'health', label: 'Health note', icon: '📝' }
  ]

  const dateFilters = [
    { value: 'all', label: 'All time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This week' },
    { value: 'month', label: 'This month' }
  ]

  const handleEditLog = () => {
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

    if (currentUser) {
      DatabaseService.updateLog(currentUser.uid, profile.id, editLog.id, {
        ...editLog,
        timestamp: editLog.timestamp
      }).catch(console.error)
    }

    setEditLog(null)
    toast.success('Activity updated successfully!')
  }

  const handleDeleteLog = () => {
    if (!profile || !deleteLogEntry) return

    deleteLog(profile.id, deleteLogEntry.id)
    if (currentUser) {
      DatabaseService.deleteLog(currentUser.uid, profile.id, deleteLogEntry.id).catch(console.error)
    }
    setDeleteLogEntry(null)
    toast.success('Activity deleted successfully!')
  }

  const formatTime = (timestamp: Date) =>
    new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

  if (!profile) {
    return (
      <PageLayout title="Activity Log" subtitle="Track your day">
        <Card className="text-center space-y-2">
          <div className="text-4xl">📋</div>
          <p className="text-gray-600 dark:text-gray-400">Create a profile to start logging activities.</p>
        </Card>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Activity Log" subtitle={`Daily record for ${profile.babyName}`}>
      <Card className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          >
            {activityTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          >
            {dateFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 px-4 py-8 text-center text-sm text-gray-600 dark:text-gray-400">
            No activities match your filters.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start justify-between gap-3 py-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl leading-none">{log.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold capitalize">{log.type}</span>
                      <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Clock size={14} className="mr-1" />
                        {formatTime(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">{log.details}</p>
                    {log.notes && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{log.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditLog(log)}
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteLogEntry(log)}
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {(filterType !== 'all' || dateFilter !== 'all') && (
          <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
            {filterType !== 'all' && (
              <span className="inline-flex items-center gap-1">
                <Filter size={14} />
                Filtered by {filterType}
              </span>
            )}
            {dateFilter !== 'all' && (
              <span className="inline-flex items-center gap-1">
                <Calendar size={14} />
                {dateFilters.find((f) => f.value === dateFilter)?.label}
              </span>
            )}
          </div>
        )}
      </Card>

      <Modal isOpen={!!editLog} onClose={() => setEditLog(null)} title="Edit Activity">
        {editLog && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Activity type</label>
              <select
                value={editLog.type}
                onChange={(e) => setEditLog({ ...editLog, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                {activityTypes.slice(1).map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Details *</label>
              <input
                type="text"
                value={editLog.details}
                onChange={(e) => setEditLog({ ...editLog, details: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Time</label>
              <input
                type="datetime-local"
                value={formatLocalDateTimeInput(new Date(editLog.timestamp))}
                onChange={(e) => setEditLog({ ...editLog, timestamp: new Date(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Notes (optional)</label>
              <textarea
                value={editLog.notes || ''}
                onChange={(e) => setEditLog({ ...editLog, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={handleEditLog}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update activity
              </button>
              <button
                onClick={() => setEditLog(null)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

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
                  <p className="font-medium text-gray-800 dark:text-white capitalize">{deleteLogEntry.type}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{deleteLogEntry.details}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatTime(deleteLogEntry.timestamp)}</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={handleDeleteLog}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteLogEntry(null)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </PageLayout>
  )
}

export default ActivityLog