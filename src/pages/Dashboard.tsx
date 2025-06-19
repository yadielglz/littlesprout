import { useStore } from '../store/store'
import { calculateAge } from '../utils/initialization'
import { useState } from 'react'
import Modal from '../components/Modal'
import Timer from '../components/Timer'
import { generateId } from '../utils/initialization'

const Dashboard = () => {
  const {
    getCurrentProfile,
    addLog,
    getCurrentLogs,
    getCurrentInventory,
    setInventory,
  } = useStore()
  const profile = getCurrentProfile()
  const logs = getCurrentLogs()
  const inventory = getCurrentInventory()

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'feed'|'sleep'|'diaper'|'weight'|'nap'|'tummy'|null>(null)
  const [timerOpen, setTimerOpen] = useState(false)
  const [timerLabel, setTimerLabel] = useState('')

  // Inventory state
  const handleInventoryChange = (item: 'diapers'|'formula', delta: number) => {
    setInventory(profile?.id || '', {
      ...inventory,
      [item]: Math.max(0, (inventory?.[item] || 0) + delta)
    })
  }

  // Quick action handlers
  const handleQuickAction = (type: typeof modalType) => {
    if (type === 'sleep' || type === 'nap' || type === 'tummy') {
      setTimerLabel(type === 'sleep' ? 'Sleep Timer' : type === 'nap' ? 'Nap Timer' : 'Tummy Time Timer')
      setTimerOpen(true)
    } else {
      setModalType(type)
      setModalOpen(true)
    }
  }

  // Log submit handlers
  const handleLog = (type: string, details: string) => {
    if (!profile) return
    addLog(profile.id, {
      id: generateId(),
      type,
      icon: type === 'feed' ? '🍼' : type === 'diaper' ? '👶' : type === 'weight' ? '📏' : '',
      color: '',
      details,
      timestamp: new Date(),
    })
    setModalOpen(false)
    setModalType(null)
  }

  // Timer save handler
  const handleTimerSave = (duration: number) => {
    if (!profile) return
    addLog(profile.id, {
      id: generateId(),
      type: timerLabel.toLowerCase().replace(' timer',''),
      icon: timerLabel === 'Sleep Timer' ? '😴' : timerLabel === 'Nap Timer' ? '🛏️' : '⏱️',
      color: '',
      details: `Duration: ${Math.round(duration/60000)} min`,
      timestamp: new Date(),
      rawDuration: duration
    })
    setTimerOpen(false)
    setTimerLabel('')
  }

  // Today's summary
  const today = new Date().toDateString()
  const feedsToday = logs.filter(l => l.type === 'feed' && new Date(l.timestamp).toDateString() === today).length
  const sleepToday = logs.filter(l => (l.type === 'sleep' || l.type === 'nap') && new Date(l.timestamp).toDateString() === today).reduce((acc, l) => acc + (l.rawDuration || 0), 0)
  const diapersToday = logs.filter(l => l.type === 'diaper' && new Date(l.timestamp).toDateString() === today).length

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            No Profile Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Please set up a profile to get started.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-slate-800">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Hello, {profile.userName}!
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {profile.babyName} is {calculateAge(profile.dob)}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-xl">🌱</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleQuickAction('feed')} className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-2">
                  🍼
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-white">Feed</span>
              </button>
              <button onClick={() => handleQuickAction('sleep')} className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-2">
                  😴
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-white">Sleep</span>
              </button>
              <button onClick={() => handleQuickAction('diaper')} className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mb-2">
                  👶
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-white">Diaper</span>
              </button>
              <button onClick={() => handleQuickAction('weight')} className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-2">
                  📏
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-white">Weight</span>
              </button>
              <button onClick={() => handleQuickAction('nap')} className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors col-span-2">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center mb-2">
                  🛏️
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-white">Nap Timer</span>
              </button>
              <button onClick={() => handleQuickAction('tummy')} className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors col-span-2">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-2">
                  ⏱️
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-white">Tummy Time</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Inventory
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Diapers</span>
                <div className="flex items-center space-x-2">
                  <button onClick={() => handleInventoryChange('diapers', -1)} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">-</button>
                  <span className="font-semibold text-gray-800 dark:text-white">{inventory?.diapers || 0}</span>
                  <button onClick={() => handleInventoryChange('diapers', 1)} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">+</button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Formula</span>
                <div className="flex items-center space-x-2">
                  <button onClick={() => handleInventoryChange('formula', -1)} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">-</button>
                  <span className="font-semibold text-gray-800 dark:text-white">{inventory?.formula || 0}</span>
                  <button onClick={() => handleInventoryChange('formula', 1)} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">+</button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Today's Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Feeds</span>
                <span className="font-semibold text-gray-800 dark:text-white">{feedsToday}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Sleep</span>
                <span className="font-semibold text-gray-800 dark:text-white">{Math.floor(sleepToday/3600000)}h {Math.round((sleepToday%3600000)/60000)}m</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Diapers</span>
                <span className="font-semibold text-gray-800 dark:text-white">{diapersToday}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
            Recent Activity
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            {logs.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📝</div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No activities logged yet
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                  Start tracking to see your baby's journey
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {logs.slice(-10).reverse().map(log => (
                  <li key={log.id} className="py-2 flex items-center space-x-3">
                    <span className="text-2xl">{log.icon}</span>
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">{log.type.charAt(0).toUpperCase() + log.type.slice(1)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{log.details}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">{new Date(log.timestamp).toLocaleString()}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      {/* Modal for quick actions */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setModalType(null) }} title={modalType ? `Log ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}` : ''}>
        {modalType === 'feed' && (
          <form onSubmit={e => { e.preventDefault(); const amount = (e.target as any).amount.value; handleLog('feed', `Amount: ${amount} ml`) }} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (ml)</label>
            <input name="amount" type="number" min="0" className="w-full px-3 py-2 border rounded" required />
            <button type="submit" className="w-full bg-green-500 text-white py-2 rounded">Log Feed</button>
          </form>
        )}
        {modalType === 'diaper' && (
          <form onSubmit={e => { e.preventDefault(); const type = (e.target as any).type.value; handleLog('diaper', `Type: ${type}`) }} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
            <select name="type" className="w-full px-3 py-2 border rounded" required>
              <option value="wet">Wet</option>
              <option value="dirty">Dirty</option>
              <option value="mixed">Mixed</option>
            </select>
            <button type="submit" className="w-full bg-amber-500 text-white py-2 rounded">Log Diaper</button>
          </form>
        )}
        {modalType === 'weight' && (
          <form onSubmit={e => { e.preventDefault(); const weight = (e.target as any).weight.value; handleLog('weight', `Weight: ${weight} kg`) }} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Weight (kg)</label>
            <input name="weight" type="number" min="0" step="0.01" className="w-full px-3 py-2 border rounded" required />
            <button type="submit" className="w-full bg-red-500 text-white py-2 rounded">Log Weight</button>
          </form>
        )}
      </Modal>

      {/* Timer Modal */}
      <Modal isOpen={timerOpen} onClose={() => { setTimerOpen(false); setTimerLabel('') }} title={timerLabel}>
        <Timer label={timerLabel} onSave={handleTimerSave} onCancel={() => { setTimerOpen(false); setTimerLabel('') }} />
      </Modal>
    </div>
  )
}

export default Dashboard 