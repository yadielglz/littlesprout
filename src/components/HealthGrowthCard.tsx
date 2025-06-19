import { useStore, LogEntry } from '../store/store'
import React from 'react'

interface HealthGrowthCardProps {
  onLogGrowth: () => void
  onLogTemp: () => void
  onLogVaccine: () => void
  onAddNote: () => void
}

const HealthGrowthCard: React.FC<HealthGrowthCardProps> = ({
  onLogGrowth,
  onLogTemp,
  onLogVaccine,
  onAddNote
}) => {
  const logs = useStore((state: { getCurrentLogs: () => LogEntry[] }) => state.getCurrentLogs())

  // Get latest measurements
  const latestWeight = logs
    .filter((l: LogEntry) => l.type === 'custom' && l.customActivity === 'weight' && l.notes?.includes('Weight:'))
    .sort((a: LogEntry, b: LogEntry) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]

  const latestHeight = logs
    .filter((l: LogEntry) => l.type === 'custom' && l.customActivity === 'height' && l.notes?.includes('Height:'))
    .sort((a: LogEntry, b: LogEntry) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]

  const latestTemp = logs
    .filter((l: LogEntry) => l.type === 'custom' && l.customActivity === 'temperature')
    .sort((a: LogEntry, b: LogEntry) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]

  const latestVaccine = logs
    .filter((l: LogEntry) => l.type === 'custom' && l.customActivity === 'vaccine')
    .sort((a: LogEntry, b: LogEntry) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Health & Growth
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Growth Card */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-lg p-4 flex flex-col">
          <div className="flex items-center mb-3">
            <span className="text-xl mr-2">📏</span>
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Growth</span>
          </div>
          <div className="flex-grow space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Weight: {latestWeight ? latestWeight.notes?.split('Weight:')[1]?.trim().split(' ')[0] : 'Not recorded'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Height: {latestHeight ? latestHeight.notes?.split('Height:')[1]?.trim().split(' ')[0] : 'Not recorded'}
            </div>
          </div>
          <button
            onClick={onLogGrowth}
            className="mt-4 w-full py-2 bg-purple-200 dark:bg-purple-700 text-purple-700 dark:text-purple-200 rounded hover:bg-purple-300 dark:hover:bg-purple-600 transition-colors text-sm font-medium"
          >
            Log Growth
          </button>
        </div>

        {/* Temperature Card */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 rounded-lg p-4 flex flex-col">
          <div className="flex items-center mb-3">
            <span className="text-xl mr-2">🌡️</span>
            <span className="text-sm font-medium text-red-700 dark:text-red-300">Vital</span>
          </div>
          <div className="flex-grow space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Last Reading: {latestTemp ? latestTemp.notes?.split(':')[1]?.trim() : 'Not recorded'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Normal: 97.5°F - 99.5°F
            </div>
          </div>
          <button
            onClick={onLogTemp}
            className="mt-4 w-full py-2 bg-red-200 dark:bg-red-700 text-red-700 dark:text-red-200 rounded hover:bg-red-300 dark:hover:bg-red-600 transition-colors text-sm font-medium"
          >
            Log Temp
          </button>
        </div>

        {/* Vaccination Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg p-4 flex flex-col">
          <div className="flex items-center mb-3">
            <span className="text-xl mr-2">💉</span>
            <span className="text-sm font-medium text-green-700 dark:text-green-300">Immunization</span>
          </div>
          <div className="flex-grow space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Last Vaccine: {latestVaccine ? new Date(latestVaccine.timestamp).toLocaleDateString() : 'Not recorded'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Next due: Check schedule
            </div>
          </div>
          <button
            onClick={onLogVaccine}
            className="mt-4 w-full py-2 bg-green-200 dark:bg-green-700 text-green-700 dark:text-green-200 rounded hover:bg-green-300 dark:hover:bg-green-600 transition-colors text-sm font-medium"
          >
            Log Vaccine
          </button>
        </div>

        {/* Health Notes Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-4 flex flex-col">
          <div className="flex items-center mb-3">
            <span className="text-xl mr-2">📝</span>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Notes</span>
          </div>
          <div className="flex-grow space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Track symptoms, concerns & more
            </div>
          </div>
          <button
            onClick={onAddNote}
            className="mt-4 w-full py-2 bg-blue-200 dark:bg-blue-700 text-blue-700 dark:text-blue-200 rounded hover:bg-blue-300 dark:hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            Add Note
          </button>
        </div>
      </div>
    </div>
  )
}

export default HealthGrowthCard 