import React, { useState, useEffect } from 'react'

interface TimerProps {
  label: string
  onSave: (duration: number) => void
  onCancel: () => void
}

const Timer: React.FC<TimerProps> = ({ label, onSave, onCancel }) => {
  const [isRunning, setIsRunning] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
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
    onSave(elapsed)
    setIsRunning(false)
    setStartTime(null)
    setElapsed(0)
  }
  const handleCancel = () => {
    setIsRunning(false)
    setStartTime(null)
    setElapsed(0)
    onCancel()
  }
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`
  }
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-2xl font-bold text-gray-800 dark:text-white">{label}</div>
      <div className="text-3xl font-mono text-green-600 dark:text-green-400">{formatTime(elapsed)}</div>
      <div className="flex space-x-2">
        {!isRunning && <button onClick={handleStart} className="px-4 py-2 bg-green-500 text-white rounded">Start</button>}
        {isRunning && <button onClick={handleStop} className="px-4 py-2 bg-yellow-500 text-white rounded">Stop</button>}
        {!isRunning && elapsed > 0 && <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded">Save</button>}
        <button onClick={handleCancel} className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded">Cancel</button>
      </div>
    </div>
  )
}

export default Timer 