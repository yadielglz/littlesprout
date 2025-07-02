import React, { useState, useEffect } from 'react'
import Modal from './Modal'
import { formatLocalDateTimeInput } from '../utils/datetime'

interface TimerProps {
  label: string
  onSave: (duration: number, time: string) => void
  onClose: () => void
  isOpen: boolean
}

const Timer: React.FC<TimerProps> = ({ label, onSave, onClose, isOpen }) => {
  const [isRunning, setIsRunning] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (isOpen && !isRunning && !startTime) {
      handleStart()
    }
  }, [isOpen])

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined
    if (isRunning && startTime !== null) {
      interval = setInterval(() => {
        setElapsed(Date.now() - startTime)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, startTime])

  const handleStart = () => {
    setIsRunning(true)
    setStartTime(Date.now())
    setElapsed(0)
  }

  const handleStop = () => {
    setIsRunning(false)
    if (startTime) setElapsed(Date.now() - startTime)
  }

  const handleSave = () => {
    onSave(elapsed, formatLocalDateTimeInput())
    setIsRunning(false)
    setStartTime(null)
    setElapsed(0)
  }

  const handleCancel = () => {
    setIsRunning(false)
    setStartTime(null)
    setElapsed(0)
    onClose()
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={label}>
      <div className="flex flex-col items-center space-y-6 py-4">
        <div className="text-4xl font-mono text-green-600 dark:text-green-400">{formatTime(elapsed)}</div>
        <div className="flex space-x-3">
          {!isRunning && (
            <button 
              onClick={handleStart} 
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              Start
            </button>
          )}
          {isRunning && (
            <button 
              onClick={handleStop} 
              className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
            >
              Stop
            </button>
          )}
          {!isRunning && elapsed > 0 && (
            <button 
              onClick={handleSave} 
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Save
            </button>
          )}
          <button 
            onClick={handleCancel} 
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default Timer 