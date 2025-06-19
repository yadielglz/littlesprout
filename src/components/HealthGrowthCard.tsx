import { useStore } from '../store/store'

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
  const logs = useStore(state => state.getCurrentLogs())

  // Get latest measurements
  const latestWeight = logs
    .filter(l => l.type === 'weight' && l.details.includes('Weight:'))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]

  const latestHeight = logs
    .filter(l => l.type === 'weight' && l.details.includes('Height:'))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]

  const latestTemp = logs
    .filter(l => l.type === 'temperature')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]

  const latestVaccine = logs
    .filter(l => l.type === 'vaccine')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Health & Growth
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Growth Card */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center">
              <span className="text-xl mr-2">📏</span>
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Growth</span>
            </div>
            <button
              onClick={onLogGrowth}
              className="text-xs px-2 py-1 bg-purple-200 dark:bg-purple-700 text-purple-700 dark:text-purple-200 rounded hover:bg-purple-300 dark:hover:bg-purple-600"
            >
              Log Growth
            </button>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Weight: {latestWeight ? latestWeight.details.split('Weight:')[1].trim().split(' ')[0] : 'Not recorded'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Height: {latestHeight ? latestHeight.details.split('Height:')[1].trim().split(' ')[0] : 'Not recorded'}
            </div>
          </div>
        </div>

        {/* Temperature Card */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center">
              <span className="text-xl mr-2">🌡️</span>
              <span className="text-sm font-medium text-red-700 dark:text-red-300">Vital</span>
            </div>
            <button
              onClick={onLogTemp}
              className="text-xs px-2 py-1 bg-red-200 dark:bg-red-700 text-red-700 dark:text-red-200 rounded hover:bg-red-300 dark:hover:bg-red-600"
            >
              Log Temp
            </button>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Last Reading: {latestTemp ? latestTemp.details.split(':')[1].trim() : 'Not recorded'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Normal: 97.5°F - 99.5°F
            </div>
          </div>
        </div>

        {/* Vaccination Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center">
              <span className="text-xl mr-2">💉</span>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Immunization</span>
            </div>
            <button
              onClick={onLogVaccine}
              className="text-xs px-2 py-1 bg-green-200 dark:bg-green-700 text-green-700 dark:text-green-200 rounded hover:bg-green-300 dark:hover:bg-green-600"
            >
              Log Vaccine
            </button>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Last Vaccine: {latestVaccine ? new Date(latestVaccine.timestamp).toLocaleDateString() : 'Not recorded'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Next due: Check schedule
            </div>
          </div>
        </div>

        {/* Health Notes Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center">
              <span className="text-xl mr-2">📝</span>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Notes</span>
            </div>
            <button
              onClick={onAddNote}
              className="text-xs px-2 py-1 bg-blue-200 dark:bg-blue-700 text-blue-700 dark:text-blue-200 rounded hover:bg-blue-300 dark:hover:bg-blue-600"
            >
              Add Note
            </button>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Track symptoms, concerns & more
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HealthGrowthCard 