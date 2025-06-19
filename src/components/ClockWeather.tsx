import React, { useEffect, useState } from 'react'

const OPENWEATHER_API_KEY = 'demo' // Replace with your real API key

const ClockWeather: React.FC = () => {
  const [time, setTime] = useState(new Date())
  const [weather, setWeather] = useState<{ temp: number, icon: string, desc: string } | null>(null)

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude, longitude } = pos.coords
      try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=imperial&appid=${OPENWEATHER_API_KEY}`)
        const data = await res.json()
        setWeather({
          temp: Math.round(data.main.temp),
          icon: data.weather[0].icon,
          desc: data.weather[0].main
        })
      } catch {}
    })
  }, [])

  return (
    <div className="flex items-center space-x-4">
      <div className="font-mono text-lg text-gray-700 dark:text-gray-200">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
      {weather && (
        <div className="flex items-center space-x-1">
          <img src={`https://openweathermap.org/img/wn/${weather.icon}.png`} alt={weather.desc} className="w-6 h-6" />
          <span className="text-gray-700 dark:text-gray-200">{weather.temp}°F</span>
        </div>
      )}
    </div>
  )
}

export default ClockWeather 