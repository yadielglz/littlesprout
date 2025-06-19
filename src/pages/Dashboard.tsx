import { useStore, Appointment } from '../store/store'
import { calculateAge } from '../utils/initialization'
import { useState } from 'react'
import Modal from '../components/Modal'
import Timer from '../components/Timer'
import { generateId } from '../utils/initialization'
import SettingsModal from '../components/SettingsModal'
import Reminders from '../components/Reminders'
import { LogEntry } from '../store/store'
import ClockWeather from '../components/ClockWeather'
import MilestoneTicker from '../components/MilestoneTicker'

const Dashboard = () => {
  const {
    getCurrentProfile,
    addLog,
    getCurrentLogs,
    currentProfileId,
    deleteLog,
    updateLog,
    getNextAppointment,
    addAppointment,
    updateAppointment,
    deleteAppointment,
  } = useStore()
  const profile = getCurrentProfile()
  const logs = getCurrentLogs()

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'feed'|'sleep'|'diaper'|'weight'|'nap'|'tummy'|'temperature'|'vaccine'|'health'|null>(null)
  const [timerOpen, setTimerOpen] = useState(false)
  const [timerLabel, setTimerLabel] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [editLog, setEditLog] = useState<LogEntry | null>(null)
  const [deleteLogEntry, setDeleteLogEntry] = useState<LogEntry | null>(null)
  const [apptModalOpen, setApptModalOpen] = useState(false)
  const [editAppt, setEditAppt] = useState<Appointment | null>(null)
  const [remindersOpen, setRemindersOpen] = useState(false)

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
  const handleLog = (type: string, details: string, time: string, amount?: number) => {
    if (!profile) return
    addLog(profile.id, {
      id: generateId(),
      type,
      icon: type === 'feed' ? '🍼' : type === 'diaper' ? '👶' : type === 'weight' ? '📏' : '',
      color: '',
      details,
      timestamp: new Date(time),
      rawAmount: amount
    })
    setModalOpen(false)
    setModalType(null)
  }

  // Timer save handler
  const handleTimerSave = (duration: number, time: string) => {
    if (!profile) return
    addLog(profile.id, {
      id: generateId(),
      type: timerLabel.toLowerCase().replace(' timer',''),
      icon: timerLabel === 'Sleep Timer' ? '😴' : timerLabel === 'Nap Timer' ? '🛏️' : '⏱️',
      color: '',
      details: `Duration: ${Math.round(duration/60000)} min`,
      timestamp: new Date(time),
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

  const nextAppt = profile ? getNextAppointment(profile.id) : null

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
          </div>
        </div>
      </header>
      
      {/* Action Buttons Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 py-3">
            <button 
              onClick={() => handleQuickAction('feed')} 
              className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition-colors flex items-center"
            >
              <span className="mr-2">📝</span>
              Quick Actions
            </button>
            <button 
              onClick={() => setRemindersOpen(true)} 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors flex items-center"
            >
              <span className="mr-2">🔔</span>
              Reminders
            </button>
            <button 
              onClick={() => setSettingsOpen(true)} 
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center"
            >
              <span className="mr-2">⚙️</span>
              Settings
            </button>
          </div>
        </div>
      </div>
      
      {profile && <div className="my-4"><MilestoneTicker dob={profile.dob} /></div>}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 md:space-y-14">
        {/* Doctor's Appointment Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Next Doctor's Appointment</h2>
            {nextAppt ? (
              <div>
                <div className="font-bold text-blue-700 dark:text-blue-300">{nextAppt.date} at {nextAppt.time}</div>
                <div className="text-gray-700 dark:text-gray-200">Dr. {nextAppt.doctor} &mdash; {nextAppt.location}</div>
                <div className="text-gray-500 dark:text-gray-400 text-sm">Reason: {nextAppt.reason}</div>
                {nextAppt.notes && <div className="text-xs text-gray-400 mt-1">Notes: {nextAppt.notes}</div>}
                {nextAppt.summary && <div className="text-xs text-gray-400 mt-1">Summary: {nextAppt.summary}</div>}
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400">No upcoming appointments</div>
            )}
          </div>
          <div>
            <button onClick={() => { setEditAppt(null); setApptModalOpen(true) }} className="bg-blue-500 text-white px-4 py-2 rounded shadow">{nextAppt ? 'Edit' : 'Add'} Appointment</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

          {/* Health Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
              Health & Growth
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Growth Tracking */}
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-lg p-4 shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-2xl">📏</div>
                  <span className="text-xs text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-800 px-2 py-1 rounded">Growth</span>
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Height & Weight</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Latest Weight:</span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {(() => {
                        const weightLogs = logs.filter(l => l.type === 'weight').sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                        if (weightLogs.length > 0) {
                          const match = weightLogs[0].details.match(/Weight: ([\d.]+) lbs/);
                          return match ? `${match[1]} lbs` : 'Not recorded';
                        }
                        return 'Not recorded';
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Latest Height:</span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {(() => {
                        const weightLogs = logs.filter(l => l.type === 'weight').sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                        if (weightLogs.length > 0) {
                          const match = weightLogs[0].details.match(/Height: (\d+)'(\d+)\"/);
                          return match ? `${match[1]}'${match[2]}"` : 'Not recorded';
                        }
                        return 'Not recorded';
                      })()}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => handleQuickAction('weight')} 
                  className="w-full mt-3 bg-purple-500 text-white py-2 rounded text-sm hover:bg-purple-600 transition-colors"
                >
                  Log Growth
                </button>
              </div>

              {/* Temperature */}
              <div className="bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 rounded-lg p-4 shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-2xl">🌡️</div>
                  <span className="text-xs text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-800 px-2 py-1 rounded">Vital</span>
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Temperature</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Last Reading:</span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {(() => {
                        const tempLogs = logs.filter(l => l.type === 'temperature').sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                        if (tempLogs.length > 0) {
                          const match = tempLogs[0].details.match(/Temperature: ([\d.]+)°F/);
                          return match ? `${match[1]}°F` : 'Not recorded';
                        }
                        return 'Not recorded';
                      })()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Normal: 97.5-99.5°F
                  </div>
                </div>
                <button 
                  onClick={() => handleQuickAction('temperature')} 
                  className="w-full mt-3 bg-red-500 text-white py-2 rounded text-sm hover:bg-red-600 transition-colors"
                >
                  Log Temperature
                </button>
              </div>

              {/* Vaccinations */}
              <div className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-lg p-4 shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-2xl">💉</div>
                  <span className="text-xs text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-800 px-2 py-1 rounded">Immunization</span>
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Vaccinations</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Last Vaccine:</span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {(() => {
                        const vaccineLogs = logs.filter(l => l.type === 'vaccine').sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                        if (vaccineLogs.length > 0) {
                          return vaccineLogs[0].details.split(' - ')[0];
                        }
                        return 'None recorded';
                      })()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Next due: Check schedule
                  </div>
                </div>
                <button 
                  onClick={() => handleQuickAction('vaccine')} 
                  className="w-full mt-3 bg-green-500 text-white py-2 rounded text-sm hover:bg-green-600 transition-colors"
                >
                  Log Vaccine
                </button>
              </div>

              {/* Health Notes */}
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg p-4 shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-2xl">📋</div>
                  <span className="text-xs text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">Notes</span>
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Health Notes</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Recent Notes:</span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {(() => {
                        const healthLogs = logs.filter(l => l.type === 'health').sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                        return healthLogs.length > 0 ? healthLogs.length : 0;
                      })()} notes
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Track symptoms, concerns
                  </div>
                </div>
                <button 
                  onClick={() => handleQuickAction('health')} 
                  className="w-full mt-3 bg-blue-500 text-white py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  Add Note
                </button>
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
          <form onSubmit={(e) => {
            e.preventDefault()
            const form = e.target as HTMLFormElement
            const details = form.details.value
            const time = form.time.value
            const amount = parseFloat(form.amount.value)
            handleLog('feed', `${details} - ${amount}ml`, time, amount)
          }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Type
                </label>
                <select
                  name="details"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  defaultValue="Bottle (Formula)"
                >
                  <option>Bottle (Formula)</option>
                  <option>Breast Feed</option>
                  <option>Food (Solids)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Amount (ml)
                </label>
                <input
                  type="number"
                  name="amount"
                  min="0"
                  step="5"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Time
                </label>
                <input
                  type="datetime-local"
                  name="time"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  defaultValue={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); setModalType(null) }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        )}
        {modalType === 'diaper' && (
          <form onSubmit={e => {
            e.preventDefault();
            const form = e.target as any;
            const type = form.type.value;
            const time = form.time.value;
            handleLog('diaper', `Type: ${type}`, time)
          }} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
            <select name="type" className="w-full px-3 py-2 border rounded" required>
              <option value="wet">Wet</option>
              <option value="dirty">Dirty</option>
              <option value="mixed">Mixed</option>
            </select>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
            <input name="time" type="datetime-local" className="w-full px-3 py-2 border rounded" defaultValue={new Date().toISOString().slice(0,16)} required />
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
            handleLog('weight', `Weight: ${weight} lbs, Height: ${heightFt}'${heightIn}\"`, new Date().toISOString())
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
        {modalType === 'temperature' && (
          <form onSubmit={e => {
            e.preventDefault();
            const form = e.target as any;
            const temperature = form.temperature.value;
            const method = form.method.value;
            const notes = form.notes.value;
            const time = form.time.value;
            handleLog('temperature', `Temperature: ${temperature}°F (${method})${notes ? ` - ${notes}` : ''}`, time)
          }} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Temperature (°F)</label>
            <input name="temperature" type="number" min="90" max="110" step="0.1" className="w-full px-3 py-2 border rounded" required />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Method</label>
            <select name="method" className="w-full px-3 py-2 border rounded" required>
              <option value="oral">Oral</option>
              <option value="rectal">Rectal</option>
              <option value="armpit">Armpit</option>
              <option value="ear">Ear</option>
              <option value="forehead">Forehead</option>
            </select>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes (optional)</label>
            <textarea name="notes" className="w-full px-3 py-2 border rounded" placeholder="Any symptoms or concerns..." />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
            <input name="time" type="datetime-local" className="w-full px-3 py-2 border rounded" defaultValue={new Date().toISOString().slice(0,16)} required />
            <button type="submit" className="w-full bg-red-500 text-white py-2 rounded">Log Temperature</button>
          </form>
        )}
        {modalType === 'vaccine' && (
          <form onSubmit={e => {
            e.preventDefault();
            const form = e.target as any;
            const vaccine = form.vaccine.value;
            const dose = form.dose.value;
            const location = form.location.value;
            const notes = form.notes.value;
            const time = form.time.value;
            handleLog('vaccine', `${vaccine} - Dose ${dose} (${location})${notes ? ` - ${notes}` : ''}`, time)
          }} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vaccine Name</label>
            <select name="vaccine" className="w-full px-3 py-2 border rounded" required>
              <option value="">Select vaccine...</option>
              <option value="Hepatitis B">Hepatitis B</option>
              <option value="DTaP">DTaP</option>
              <option value="Hib">Hib</option>
              <option value="IPV">IPV</option>
              <option value="PCV13">PCV13</option>
              <option value="Rotavirus">Rotavirus</option>
              <option value="MMR">MMR</option>
              <option value="Varicella">Varicella</option>
              <option value="Hepatitis A">Hepatitis A</option>
              <option value="Influenza">Influenza</option>
              <option value="COVID-19">COVID-19</option>
              <option value="Other">Other</option>
            </select>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dose Number</label>
            <input name="dose" type="text" className="w-full px-3 py-2 border rounded" placeholder="e.g., 1st, 2nd, Booster" required />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
            <input name="location" type="text" className="w-full px-3 py-2 border rounded" placeholder="e.g., Left thigh, Right arm" required />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes (optional)</label>
            <textarea name="notes" className="w-full px-3 py-2 border rounded" placeholder="Any reactions or notes..." />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
            <input name="time" type="datetime-local" className="w-full px-3 py-2 border rounded" defaultValue={new Date().toISOString().slice(0,16)} required />
            <button type="submit" className="w-full bg-green-500 text-white py-2 rounded">Log Vaccine</button>
          </form>
        )}
        {modalType === 'health' && (
          <form onSubmit={e => {
            e.preventDefault();
            const form = e.target as any;
            const category = form.category.value;
            const symptoms = form.symptoms.value;
            const severity = form.severity.value;
            const notes = form.notes.value;
            const time = form.time.value;
            handleLog('health', `${category} - ${symptoms} (${severity})${notes ? ` - ${notes}` : ''}`, time)
          }} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
            <select name="category" className="w-full px-3 py-2 border rounded" required>
              <option value="">Select category...</option>
              <option value="Fever">Fever</option>
              <option value="Cough">Cough</option>
              <option value="Cold">Cold</option>
              <option value="Rash">Rash</option>
              <option value="Vomiting">Vomiting</option>
              <option value="Diarrhea">Diarrhea</option>
              <option value="Allergy">Allergy</option>
              <option value="Injury">Injury</option>
              <option value="Teething">Teething</option>
              <option value="Other">Other</option>
            </select>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Symptoms</label>
            <input name="symptoms" type="text" className="w-full px-3 py-2 border rounded" placeholder="Describe symptoms..." required />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Severity</label>
            <select name="severity" className="w-full px-3 py-2 border rounded" required>
              <option value="Mild">Mild</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe</option>
            </select>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes (optional)</label>
            <textarea name="notes" className="w-full px-3 py-2 border rounded" placeholder="Additional details, medications, etc..." />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
            <input name="time" type="datetime-local" className="w-full px-3 py-2 border rounded" defaultValue={new Date().toISOString().slice(0,16)} required />
            <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">Add Health Note</button>
          </form>
        )}
      </Modal>

      {/* Timer Modal */}
      <Modal isOpen={timerOpen} onClose={() => { setTimerOpen(false); setTimerLabel('') }} title={timerLabel}>
        <Timer label={timerLabel} onSave={(duration, time) => handleTimerSave(duration, time)} onCancel={() => { setTimerOpen(false); setTimerLabel('') }} />
        <div className="mt-4 border-t pt-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 text-center">Missed a log? Enter manually:</div>
          <form onSubmit={e => {
            e.preventDefault();
            const form = e.target as any;
            const mins = parseInt(form.manualMins.value, 10) || 0;
            const hrs = parseInt(form.manualHrs.value, 10) || 0;
            const duration = (hrs * 60 + mins) * 60000;
            const time = form.time.value;
            handleTimerSave(duration, time);
          }} className="flex flex-col items-center space-y-2">
            <div className="flex space-x-2">
              <input name="manualHrs" type="number" min="0" max="23" placeholder="Hrs" className="w-16 px-2 py-1 border rounded" />
              <input name="manualMins" type="number" min="0" max="59" placeholder="Mins" className="w-16 px-2 py-1 border rounded" />
            </div>
            <input name="time" type="datetime-local" className="w-full px-3 py-2 border rounded" defaultValue={new Date().toISOString().slice(0,16)} required />
            <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded">Log Manually</button>
          </form>
        </div>
      </Modal>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <Reminders isOpen={remindersOpen} onClose={() => setRemindersOpen(false)} />

      {/* Edit Log Modal */}
      <Modal isOpen={!!editLog} onClose={() => setEditLog(null)} title="Edit Log">
        {editLog && (
          <form onSubmit={e => {
            e.preventDefault();
            const form = e.target as any;
            if (editLog.type === 'feed') {
              const feedType = form.feedType.value;
              const amount = form.amount.value;
              const time = form.time.value;
              const feedTypeText = feedType === 'bottle' ? 'Bottle (Formula)' : 
                                 feedType === 'breast' ? 'Breast Feed' : 'Food (Solids)';
              updateLog(currentProfileId!, editLog.id, { 
                details: `${feedTypeText} - ${amount}ml`, 
                timestamp: new Date(time),
                rawAmount: parseFloat(amount)
              });
            } else if (editLog.type === 'diaper') {
              const type = form.type.value;
              const time = form.time.value;
              updateLog(currentProfileId!, editLog.id, { details: `Type: ${type}`, timestamp: new Date(time) });
            } else if (editLog.type === 'weight') {
              const weight = form.weight.value;
              const heightFt = form.heightFt.value;
              const heightIn = form.heightIn.value;
              const time = form.time.value;
              updateLog(currentProfileId!, editLog.id, { details: `Weight: ${weight} lbs, Height: ${heightFt}'${heightIn}\"`, timestamp: new Date(time) });
            } else if (editLog.type === 'sleep' || editLog.type === 'nap' || editLog.type === 'tummy') {
              const mins = parseInt(form.manualMins.value, 10) || 0;
              const hrs = parseInt(form.manualHrs.value, 10) || 0;
              const duration = (hrs * 60 + mins) * 60000;
              const time = form.time.value;
              updateLog(currentProfileId!, editLog.id, { details: `Duration: ${Math.round(duration/60000)} min`, rawDuration: duration, timestamp: new Date(time) });
            }
            setEditLog(null);
          }} className="space-y-4">
            {editLog.type === 'feed' && (
              <>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Feed Type</label>
                <select name="feedType" className="w-full px-3 py-2 border rounded" defaultValue={
                  editLog.details.includes('Bottle') ? 'bottle' : 
                  editLog.details.includes('Breast') ? 'breast' : 'food'
                } required>
                  <option value="bottle">Bottle (Formula)</option>
                  <option value="breast">Breast Feed</option>
                  <option value="food">Food (Solids)</option>
                </select>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (ml)</label>
                <input name="amount" type="number" min="0" step="5" className="w-full px-3 py-2 border rounded" defaultValue={editLog.details.match(/Amount: ([\d.]+)/)?.[1] || ''} required />
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
            <input name="time" type="datetime-local" className="w-full px-3 py-2 border rounded" defaultValue={editLog.timestamp.toISOString().slice(0,16)} required />
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

      {/* Appointment Modal */}
      <Modal isOpen={apptModalOpen} onClose={() => setApptModalOpen(false)} title={editAppt ? 'Edit Appointment' : 'Add Appointment'}>
        <form onSubmit={e => {
          e.preventDefault();
          const form = e.target as any;
          const appt: Appointment = {
            id: editAppt?.id || Math.random().toString(36).substr(2, 9),
            date: form.date.value,
            time: form.time.value,
            doctor: form.doctor.value,
            location: form.location.value,
            reason: form.reason.value,
            notes: form.notes.value,
            summary: form.summary.value,
          }
          if (editAppt) {
            updateAppointment(profile!.id, appt.id, appt)
          } else {
            addAppointment(profile!.id, appt)
          }
          setApptModalOpen(false)
        }} className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
          <input name="date" type="date" className="w-full px-3 py-2 border rounded" defaultValue={editAppt?.date || ''} required />
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
          <input name="time" type="time" className="w-full px-3 py-2 border rounded" defaultValue={editAppt?.time || ''} required />
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Doctor</label>
          <input name="doctor" type="text" className="w-full px-3 py-2 border rounded" defaultValue={editAppt?.doctor || ''} required />
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
          <input name="location" type="text" className="w-full px-3 py-2 border rounded" defaultValue={editAppt?.location || ''} required />
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
          <input name="reason" type="text" className="w-full px-3 py-2 border rounded" defaultValue={editAppt?.reason || ''} required />
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
          <textarea name="notes" className="w-full px-3 py-2 border rounded" defaultValue={editAppt?.notes || ''} />
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Summary</label>
          <textarea name="summary" className="w-full px-3 py-2 border rounded" defaultValue={editAppt?.summary || ''} />
          {editAppt && (
            <button type="button" onClick={() => { deleteAppointment(profile!.id, editAppt.id); setApptModalOpen(false) }} className="w-full bg-red-500 text-white py-2 rounded mt-2">Delete Appointment</button>
          )}
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">Save</button>
        </form>
      </Modal>
    </div>
  )
}

export default Dashboard 