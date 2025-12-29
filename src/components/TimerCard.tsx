import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Pause, Save } from 'lucide-react'
import { useTimer } from '../contexts/TimerContext'
import { useStore } from '../store/store'
import { DatabaseService } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'
import { formatTime, getTimerConfig, createTimerLog } from '../utils/timerUtils'
import toast from 'react-hot-toast'
import Card from './common/Card'

const TimerCard: React.FC = () => {
  const { activeTimers, stopTimer, getTimerElapsed } = useTimer()
  const { getCurrentProfile, addLog } = useStore()
  const { currentUser } = useAuth()
  const profile = getCurrentProfile()

  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [timerToStop, setTimerToStop] = useState<any>(null)

  const handleStopTimerClick = (timer: any) => {
    setTimerToStop(timer)
    setShowConfirmDialog(true)
  }

  const handleSaveTimer = async () => {
    if (!timerToStop || !profile) return

    const elapsed = getTimerElapsed(timerToStop.id)
    const duration = elapsed

    const log = createTimerLog(timerToStop, duration, formatTime)

    try {
      addLog(profile.id, log)

      if (currentUser) {
        await DatabaseService.addLog(currentUser.uid, profile.id, log)
      }

      stopTimer(timerToStop.id)
      toast.success(`${timerToStop.label} logged successfully!`)
    } catch (error) {
      toast.error('Failed to save timer. Please try again.')
      console.error('Timer save error:', error)
    } finally {
      setShowConfirmDialog(false)
      setTimerToStop(null)
    }
  }

  const handleCancelTimer = () => {
    if (!timerToStop) return

    stopTimer(timerToStop.id)
    toast.success(`${timerToStop.label} timer cancelled`)
    setShowConfirmDialog(false)
    setTimerToStop(null)
  }

  if (activeTimers.length === 0) {
    return (
      <Card className="h-full flex flex-col gap-3" padding="lg" shadow="sm" animated>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Active Timers</h2>
          <div className="text-xl">⏱️</div>
        </div>
        <div className="text-center py-6 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
          <div className="text-4xl mb-2 opacity-60">⏰</div>
          <p className="text-gray-600 dark:text-gray-400">No active timers</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">Start a timer from the action button</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="space-y-4 h-full" padding="lg" shadow="sm" animated>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Active Timers</h2>
        <div className="text-xl">⏱️</div>
      </div>

      <div className="space-y-3">
        {activeTimers.map((timer) => {
          const config = getTimerConfig(timer.type)
          return (
            <div
              key={timer.id}
              className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4 bg-white dark:bg-gray-800"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{config.icon}</div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">{config.label}</div>
                    <div className="text-lg font-mono font-bold">{formatTime(getTimerElapsed(timer.id))}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStopTimerClick(timer)}
                    className="inline-flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    title="Stop timer (save)"
                  >
                    <Pause className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => stopTimer(timer.id)}
                    className="inline-flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    title="Cancel timer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((getTimerElapsed(timer.id) / (60 * 60 * 1000)) * 100, 100)}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {showConfirmDialog && timerToStop && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 px-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-md w-full border border-gray-200 dark:border-gray-700 space-y-4">
            <div>
              <h3 className="text-lg font-bold">Stop {timerToStop.label} timer?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">We will log the elapsed time for you.</p>
            </div>
            <div className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">
              {formatTime(getTimerElapsed(timerToStop.id))}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={handleSaveTimer}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save & Stop
              </button>
              <button
                onClick={handleCancelTimer}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel Timer
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

export default TimerCard