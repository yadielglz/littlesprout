import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Sun, Cloud, CloudRain, CloudSnow, Wind, Thermometer, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import { useStore } from '../store/store'

interface Weather {
  temperature: number
  windspeed: number
  weathercode: number
  apparentTemperature: number
}

const getWeather = async (latitude: number, longitude: number): Promise<Weather> => {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=apparent_temperature&timezone=auto`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch weather data')
  }
  const data = await response.json()
  // Find the current hour's apparent temperature
  let apparentTemperature = data.current_weather.temperature;
  if (data.hourly && data.hourly.time && data.hourly.apparent_temperature) {
    const now = new Date();
    const currentHour = now.toISOString().slice(0, 13); // e.g., '2024-07-26T15'
    const idx = data.hourly.time.findIndex((t: string) => t.startsWith(currentHour));
    if (idx !== -1) {
      apparentTemperature = data.hourly.apparent_temperature[idx];
    }
  }
  return {
    temperature: data.current_weather.temperature,
    windspeed: data.current_weather.windspeed,
    weathercode: data.current_weather.weathercode,
    apparentTemperature,
  }
}

const WeatherIcon: React.FC<{ code: number }> = ({ code }) => {
  if (code >= 0 && code <= 1) return <Sun className="w-8 h-8 text-yellow-500" /> // Clear, mainly clear
  if (code >= 2 && code <= 3) return <Cloud className="w-8 h-8 text-gray-400" /> // Partly cloudy, overcast
  if (code >= 51 && code <= 67) return <CloudRain className="w-8 h-8 text-blue-500" /> // Drizzle, Rain
  if (code >= 71 && code <= 77) return <CloudSnow className="w-8 h-8 text-white" /> // Snow
  return <Wind className="w-8 h-8 text-gray-500" /> // Default
}

const ClockWeather: React.FC = () => {
  const [time, setTime] = useState(new Date())
  const [weather, setWeather] = useState<Weather | null>(null)
  const [loading, setLoading] = useState(true)
  const { temperatureUnit } = useStore()

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)

    const fetchWeather = () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords
            const weatherData = await getWeather(latitude, longitude)
            setWeather(weatherData)
          } catch (error) {
            toast.error('Could not fetch weather data.')
            console.error(error)
          } finally {
            setLoading(false)
          }
        },
        (error) => {
          toast.error('Could not get location. Please enable location services.')
          console.error(error)
          setLoading(false)
        }
      )
    }

    fetchWeather()

    return () => clearInterval(interval)
  }, [])

  const getFormattedTemperature = () => {
    if (!weather) return '--';
    if (temperatureUnit === 'F') {
      const tempF = (weather.temperature * 9) / 5 + 32;
      return `${Math.round(tempF)}°F`;
    }
    return `${Math.round(weather.temperature)}°C`;
  };

  const getFormattedFeelsLike = () => {
    if (!weather) return '--';
    if (temperatureUnit === 'F') {
      const tempF = (weather.apparentTemperature * 9) / 5 + 32;
      return `${Math.round(tempF)}°F`;
    }
    return `${Math.round(weather.apparentTemperature)}°C`;
  };

  // Add a function to map weather codes to descriptions
  const getWeatherDescription = (code: number) => {
    if (code >= 0 && code <= 1) return 'Sunny';
    if (code >= 2 && code <= 3) return 'Cloudy';
    if (code >= 51 && code <= 67) return 'Rain';
    if (code >= 71 && code <= 77) return 'Snow';
    return 'Windy';
  };

  return (
    <div className="flex flex-wrap items-center justify-between bg-gradient-to-br from-blue-100 to-green-100 dark:from-slate-700 dark:to-gray-800 p-4 rounded-xl shadow-md gap-4">
      <div className="text-left min-w-[180px]">
        <div className="font-bold text-4xl text-gray-800 dark:text-white tracking-wider">
          {format(time, 'h:mm')}
          <span className="text-2xl ml-2">{format(time, 'a')}</span>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {format(time, 'eeee, MMMM do')}
        </div>
      </div>
      <div className="text-right">
        {loading ? (
          <div className="text-sm text-gray-500">Loading Weather...</div>
        ) : weather ? (
          <div className="flex flex-col items-end space-y-1">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <Thermometer className="w-5 h-5 mr-1 text-red-500" />
                <span className="font-semibold">{getFormattedTemperature()}</span>
              </div>
              <WeatherIcon code={weather.weathercode} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              Feels like: {getFormattedFeelsLike()}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              {getWeatherDescription(weather.weathercode)}
            </div>
          </div>
        ) : (
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-1" />
            <span>Weather unavailable</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ClockWeather 