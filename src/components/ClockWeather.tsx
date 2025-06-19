import React, { useEffect, useState } from 'react'

const ClockWeather: React.FC = () => {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center space-x-4">
      <div className="font-mono text-lg text-gray-700 dark:text-gray-200">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  )
}

export default ClockWeather 