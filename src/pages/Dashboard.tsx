import { useStore } from '../store/store'
import { calculateAge } from '../utils/initialization'
import { useState } from 'react'
import Modal from '../components/Modal'
import Timer from '../components/Timer'
import { generateId } from '../utils/initialization'
import SettingsModal from '../components/SettingsModal'
import { LogEntry } from '../store/store'
import ClockWeather from '../components/ClockWeather'
import MilestoneTicker from '../components/MilestoneTicker'

const Dashboard = () => {
  const {
    getCurrentProfile,
    addLog,
    getCurrentLogs,
    getCurrentInventory,
    setInventory,
    currentProfileId,
    deleteLog,
    updateLog,
  } = useStore()
  const profile = getCurrentProfile()
  const logs = getCurrentLogs()
  const inventory = getCurrentInventory()

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'feed'|'sleep'|'diaper'|'weight'|'nap'|'tummy'|null>(null)
  const [timerOpen, setTimerOpen] = useState(false)
  const [timerLabel, setTimerLabel] = useState('')
  const [quickActionsOpen, setQuickActionsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [editLog, setEditLog] = useState<LogEntry | null>(null)
  const [deleteLogEntry, setDeleteLogEntry] = useState<LogEntry | null>(null)

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
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-xl">🌱</span>
              </div>
              <ClockWeather />
            </div>
            <button onClick={() => setQuickActionsOpen(true)} className="ml-4 px-4 py-2 bg-green-500 text-white rounded shadow">Quick Actions</button>
            <button onClick={() => setSettingsOpen(true)} className="ml-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded shadow">Settings</button>
          </div>
        </div>
      </header>
      {profile && <div className="my-4"><MilestoneTicker dob={profile.dob} /></div>}

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

          {/* Inventory UI */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Inventory
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-lg p-4 shadow">
                <div className="text-3xl mb-2">🧷</div>
                <div className="font-semibold text-gray-800 dark:text-white mb-1">Diapers</div>
                <div className="flex items-center space-x-2 mb-2">
                  <button onClick={() => handleInventoryChange('diapers', -1)} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-lg">-</button>
                  <span className="text-xl font-bold text-green-700 dark:text-green-300">{inventory?.diapers || 0}</span>
                  <button onClick={() => handleInventoryChange('diapers', 1)} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-lg">+</button>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Track diaper stock</span>
              </div>
              <div className="flex flex-col items-center bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg p-4 shadow">
                <div className="text-3xl mb-2">🍼</div>
                <div className="font-semibold text-gray-800 dark:text-white mb-1">Formula</div>
                <div className="flex items-center space-x-2 mb-2">
                  <button onClick={() => handleInventoryChange('formula', -1)} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-lg">-</button>
                  <span className="text-xl font-bold text-blue-700 dark:text-blue-300">{inventory?.formula || 0}</span>
                  <button onClick={() => handleInventoryChange('formula', 1)} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-lg">+</button>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Track formula stock</span>
              </div>
            </div>
          </div>

          {/* Today's Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Today's Summary
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg p-4 shadow">
                <div className="text-3xl mb-1">🍼</div>
                <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{feedsToday}</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Feeds</div>
              </div>
              <div className="flex flex-col items-center bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800 rounded-lg p-4 shadow">
                <div className="text-3xl mb-1">😴</div>
                <div className="text-lg font-bold text-indigo-700 dark:text-indigo-300">{Math.floor(sleepToday/3600000)}h {Math.round((sleepToday%3600000)/60000)}m</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Sleep</div>
              </div>
              <div className="flex flex-col items-center bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800 rounded-lg p-4 shadow">
                <div className="text-3xl mb-1">👶</div>
                <div className="text-lg font-bold text-amber-700 dark:text-amber-300">{diapersToday}</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Diapers</div>
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
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 dark:text-white">{log.type.charAt(0).toUpperCase() + log.type.slice(1)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{log.details}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">{new Date(log.timestamp).toLocaleString()}</div>
                    </div>
                    <button onClick={() => setEditLog(log)} className="text-xs px-2 py-1 bg-blue-200 rounded">Edit</button>
                    <button onClick={() => setDeleteLogEntry(log)} className="text-xs px-2 py-1 bg-red-200 rounded">Delete</button>
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
          <form onSubmit={e => {
            e.preventDefault();
            const form = e.target as any;
            const feedType = form.feedType.value;
            const amount = form.amount.value;
            handleLog('feed', `${feedType === 'bottle' ? 'Bottle (Formula)' : 'Breast'} Feed, Amount: ${amount} oz`)
          }} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Feed Type</label>
            <select name="feedType" className="w-full px-3 py-2 border rounded" required>
              <option value="bottle">Bottle (Formula)</option>
              <option value="breast">Breast</option>
            </select>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (oz)</label>
            <input name="amount" type="number" min="0" step="0.1" className="w-full px-3 py-2 border rounded" required />
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
          <form onSubmit={e => {
            e.preventDefault();
            const form = e.target as any;
            const weight = form.weight.value;
            const heightFt = form.heightFt.value;
            const heightIn = form.heightIn.value;
            handleLog('weight', `Weight: ${weight} lbs, Height: ${heightFt}'${heightIn}\"`)
          }} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Weight (lbs)</label>
            <input name="weight" type="number" min="0" step="0.1" className="w-full px-3 py-2 border rounded" required />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Height</label>
            <div className="flex space-x-2">
              <input name="heightFt" type="number" min="0" max="8" placeholder="ft" className="w-16 px-2 py-2 border rounded" required />
              <input name="heightIn" type="number" min="0" max="11" placeholder="in" className="w-16 px-2 py-2 border rounded" required />
            </div>
            <button type="submit" className="w-full bg-red-500 text-white py-2 rounded">Log Weight & Height</button>
          </form>
        )}
      </Modal>

      {/* Timer Modal */}
      <Modal isOpen={timerOpen} onClose={() => { setTimerOpen(false); setTimerLabel('') }} title={timerLabel}>
        <Timer label={timerLabel} onSave={handleTimerSave} onCancel={() => { setTimerOpen(false); setTimerLabel('') }} />
        <div className="mt-4 border-t pt-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 text-center">Missed a log? Enter manually:</div>
          <form onSubmit={e => {
            e.preventDefault();
            const form = e.target as any;
            const mins = parseInt(form.manualMins.value, 10) || 0;
            const hrs = parseInt(form.manualHrs.value, 10) || 0;
            const duration = (hrs * 60 + mins) * 60000;
            handleTimerSave(duration);
          }} className="flex flex-col items-center space-y-2">
            <div className="flex space-x-2">
              <input name="manualHrs" type="number" min="0" max="23" placeholder="Hrs" className="w-16 px-2 py-1 border rounded" />
              <input name="manualMins" type="number" min="0" max="59" placeholder="Mins" className="w-16 px-2 py-1 border rounded" />
            </div>
            <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded">Log Manually</button>
          </form>
        </div>
      </Modal>

      {/* Quick Actions Modal */}
      <Modal isOpen={quickActionsOpen} onClose={() => setQuickActionsOpen(false)} title="Quick Actions" size="large">
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => { setQuickActionsOpen(false); handleQuickAction('feed') }} className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-2">🍼</div>
            <span className="text-sm font-medium text-gray-800 dark:text-white">Feed</span>
          </button>
          <button onClick={() => { setQuickActionsOpen(false); handleQuickAction('sleep') }} className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-2">😴</div>
            <span className="text-sm font-medium text-gray-800 dark:text-white">Sleep</span>
          </button>
          <button onClick={() => { setQuickActionsOpen(false); handleQuickAction('diaper') }} className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mb-2">👶</div>
            <span className="text-sm font-medium text-gray-800 dark:text-white">Diaper</span>
          </button>
          <button onClick={() => { setQuickActionsOpen(false); handleQuickAction('weight') }} className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-2">📏</div>
            <span className="text-sm font-medium text-gray-800 dark:text-white">Weight</span>
          </button>
          <button onClick={() => { setQuickActionsOpen(false); handleQuickAction('nap') }} className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors col-span-2">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center mb-2">🛏️</div>
            <span className="text-sm font-medium text-gray-800 dark:text-white">Nap Timer</span>
          </button>
          <button onClick={() => { setQuickActionsOpen(false); handleQuickAction('tummy') }} className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors col-span-2">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-2">⏱️</div>
            <span className="text-sm font-medium text-gray-800 dark:text-white">Tummy Time</span>
          </button>
        </div>
      </Modal>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Edit Log Modal */}
      <Modal isOpen={!!editLog} onClose={() => setEditLog(null)} title="Edit Log">
        {editLog && (
          <form onSubmit={e => {
            e.preventDefault();
            const form = e.target as any;
            if (editLog.type === 'feed') {
              const feedType = form.feedType.value;
              const amount = form.amount.value;
              updateLog(currentProfileId!, editLog.id, { details: `${feedType === 'bottle' ? 'Bottle (Formula)' : 'Breast'} Feed, Amount: ${amount} oz` });
            } else if (editLog.type === 'diaper') {
              const type = form.type.value;
              updateLog(currentProfileId!, editLog.id, { details: `Type: ${type}` });
            } else if (editLog.type === 'weight') {
              const weight = form.weight.value;
              const heightFt = form.heightFt.value;
              const heightIn = form.heightIn.value;
              updateLog(currentProfileId!, editLog.id, { details: `Weight: ${weight} lbs, Height: ${heightFt}'${heightIn}\"` });
            } else if (editLog.type === 'sleep' || editLog.type === 'nap' || editLog.type === 'tummy') {
              const mins = parseInt(form.manualMins.value, 10) || 0;
              const hrs = parseInt(form.manualHrs.value, 10) || 0;
              const duration = (hrs * 60 + mins) * 60000;
              updateLog(currentProfileId!, editLog.id, { details: `Duration: ${Math.round(duration/60000)} min`, rawDuration: duration });
            }
            setEditLog(null);
          }} className="space-y-4">
            {editLog.type === 'feed' && (
              <>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Feed Type</label>
                <select name="feedType" className="w-full px-3 py-2 border rounded" defaultValue={editLog.details.includes('Bottle') ? 'bottle' : 'breast'} required>
                  <option value="bottle">Bottle (Formula)</option>
                  <option value="breast">Breast</option>
                </select>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (oz)</label>
                <input name="amount" type="number" min="0" step="0.1" className="w-full px-3 py-2 border rounded" defaultValue={editLog.details.match(/Amount: ([\d.]+)/)?.[1] || ''} required />
              </>
            )}
            {editLog.type === 'diaper' && (
              <>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                <select name="type" className="w-full px-3 py-2 border rounded" defaultValue={editLog.details.match(/Type: (\w+)/)?.[1] || ''} required>
                  <option value="wet">Wet</option>
                  <option value="dirty">Dirty</option>
                  <option value="mixed">Mixed</option>
                </select>
              </>
            )}
            {editLog.type === 'weight' && (
              <>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Weight (lbs)</label>
                <input name="weight" type="number" min="0" step="0.1" className="w-full px-3 py-2 border rounded" defaultValue={editLog.details.match(/Weight: ([\d.]+)/)?.[1] || ''} required />
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Height</label>
                <div className="flex space-x-2">
                  <input name="heightFt" type="number" min="0" max="8" placeholder="ft" className="w-16 px-2 py-2 border rounded" defaultValue={editLog.details.match(/Height: (\d+)'/)?.[1] || ''} required />
                  <input name="heightIn" type="number" min="0" max="11" placeholder="in" className="w-16 px-2 py-2 border rounded" defaultValue={editLog.details.match(/'(\d+)\"/)?.[1] || ''} required />
                </div>
              </>
            )}
            {(editLog.type === 'sleep' || editLog.type === 'nap' || editLog.type === 'tummy') && (
              <>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration</label>
                <div className="flex space-x-2">
                  <input name="manualHrs" type="number" min="0" max="23" placeholder="Hrs" className="w-16 px-2 py-1 border rounded" defaultValue={Math.floor((editLog.rawDuration || 0)/3600000)} />
                  <input name="manualMins" type="number" min="0" max="59" placeholder="Mins" className="w-16 px-2 py-1 border rounded" defaultValue={Math.round(((editLog.rawDuration || 0)%3600000)/60000)} />
                </div>
              </>
            )}
            <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">Save Changes</button>
          </form>
        )}
      </Modal>

      {/* Delete Log Modal */}
      <Modal isOpen={!!deleteLogEntry} onClose={() => setDeleteLogEntry(null)} title="Delete Log?">
        <div className="mb-4">Are you sure you want to delete this log?</div>
        <button onClick={() => { if (deleteLogEntry && currentProfileId) { deleteLog(currentProfileId, deleteLogEntry.id); } setDeleteLogEntry(null); }} className="bg-red-500 text-white px-4 py-2 rounded">Delete</button>
        <button onClick={() => setDeleteLogEntry(null)} className="ml-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded">Cancel</button>
      </Modal>
    </div>
  )
}

export default Dashboard 