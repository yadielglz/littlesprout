import { useStore, LogEntry } from '../store/store'
import React from 'react'
import { motion } from 'framer-motion'

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
  const latestGrowth = logs
    .filter((l: LogEntry) => l.type === 'weight' && l.details?.includes('Weight:'))
    .sort((a: LogEntry, b: LogEntry) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]

  const latestTemp = logs
    .filter((l: LogEntry) => l.type === 'custom' && l.customActivity === 'temperature')
    .sort((a: LogEntry, b: LogEntry) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]

  const latestVaccine = logs
    .filter((l: LogEntry) => l.type === 'custom' && l.customActivity === 'vaccine')
    .sort((a: LogEntry, b: LogEntry) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]

  const parsedWeight = latestGrowth?.details.match(/Weight:\s*(\d+(?:\.\d+)?)\s*lbs/i)?.[1]
  const parsedHeight = latestGrowth?.details.match(/Height:\s*(\d+)'(\d+)/i)

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/20 dark:border-gray-700/50"
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
          Health & Growth
        </h2>
        <div className="text-xl sm:text-2xl">🏥</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {/* Growth Card */}
        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4 sm:p-5 flex flex-col shadow-lg cursor-pointer relative overflow-hidden min-h-[140px] sm:min-h-[160px]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-transparent"></div>
          <div className="flex items-center mb-3">
            <span className="text-xl sm:text-2xl mr-2">📏</span>
            <span className="text-xs sm:text-sm font-semibold opacity-90">Growth</span>
          </div>
          <div className="flex-grow space-y-1 sm:space-y-2 mb-3 sm:mb-4">
            <div className="text-xs sm:text-sm opacity-90">
              Weight: {parsedWeight ? `${parsedWeight} lbs` : 'Not recorded'}
            </div>
            <div className="text-xs sm:text-sm opacity-90">
              Height: {parsedHeight ? `${parsedHeight[1]}'${parsedHeight[2]}"` : 'Not recorded'}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogGrowth}
            className="w-full py-2.5 sm:py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors text-xs sm:text-sm font-semibold"
          >
            Log Growth
          </motion.button>
        </motion.div>

        {/* Temperature Card */}
        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-4 sm:p-5 flex flex-col shadow-lg cursor-pointer relative overflow-hidden min-h-[140px] sm:min-h-[160px]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-transparent"></div>
          <div className="flex items-center mb-3">
            <span className="text-xl sm:text-2xl mr-2">🌡️</span>
            <span className="text-xs sm:text-sm font-semibold opacity-90">Vital</span>
          </div>
          <div className="flex-grow space-y-1 sm:space-y-2 mb-3 sm:mb-4">
            <div className="text-xs sm:text-sm opacity-90">
              Last Reading: {latestTemp ? latestTemp.notes?.split(':')[1]?.trim() : 'Not recorded'}
            </div>
            <div className="text-xs opacity-75">
              Normal: 97.5°F - 99.5°F
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogTemp}
            className="w-full py-2.5 sm:py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors text-xs sm:text-sm font-semibold"
          >
            Log Temp
          </motion.button>
        </motion.div>

        {/* Vaccination Card */}
        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-4 sm:p-5 flex flex-col shadow-lg cursor-pointer relative overflow-hidden min-h-[140px] sm:min-h-[160px]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-transparent"></div>
          <div className="flex items-center mb-3">
            <span className="text-xl sm:text-2xl mr-2">💉</span>
            <span className="text-xs sm:text-sm font-semibold opacity-90">Immunization</span>
          </div>
          <div className="flex-grow space-y-1 sm:space-y-2 mb-3 sm:mb-4">
            <div className="text-xs sm:text-sm opacity-90">
              Last Vaccine: {latestVaccine ? new Date(latestVaccine.timestamp).toLocaleDateString() : 'Not recorded'}
            </div>
            <div className="text-xs opacity-75">
              Next due: Check schedule
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogVaccine}
            className="w-full py-2.5 sm:py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors text-xs sm:text-sm font-semibold"
          >
            Log Vaccine
          </motion.button>
        </motion.div>

        {/* Health Notes Card */}
        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4 sm:p-5 flex flex-col shadow-lg cursor-pointer relative overflow-hidden min-h-[140px] sm:min-h-[160px]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent"></div>
          <div className="flex items-center mb-3">
            <span className="text-xl sm:text-2xl mr-2">📝</span>
            <span className="text-xs sm:text-sm font-semibold opacity-90">Notes</span>
          </div>
          <div className="flex-grow space-y-1 sm:space-y-2 mb-3 sm:mb-4">
            <div className="text-xs sm:text-sm opacity-90">
              Track symptoms, concerns & more
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddNote}
            className="w-full py-2.5 sm:py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors text-xs sm:text-sm font-semibold"
          >
            Add Note
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default HealthGrowthCard 