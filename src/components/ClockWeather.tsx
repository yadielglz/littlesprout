import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Sun, Cloud, CloudRain, CloudSnow, Wind, Thermometer, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import { useStore } from '../store/store'
import { WeatherService, WeatherData } from '../services/weather'

const WeatherIcon: React.FC<{ icon: string }> = ({ icon }) => {
  // OpenWeatherMap icons
  if (icon.startsWith('01')) return <Sun className="w-8 h-8 text-yellow-500" /> // Clear sky
  if (icon.startsWith('02')) return <Cloud className="w-8 h-8 text-gray-400" /> // Partly cloudy
  if (icon.startsWith('03') || icon.startsWith('04')) return <Cloud className="w-8 h-8 text-gray-500" /> // Cloudy
  if (icon.startsWith('09') || icon.startsWith('10')) return <CloudRain className="w-8 h-8 text-blue-500" /> // Rain
  if (icon.startsWith('11')) return <CloudRain className="w-8 h-8 text-purple-500" /> // Thunderstorm
  if (icon.startsWith('13')) return <CloudSnow className="w-8 h-8 text-white" /> // Snow
  if (icon.startsWith('50')) return <Wind className="w-8 h-8 text-gray-400" /> // Mist
  
  return <Wind className="w-8 h-8 text-gray-500" /> // Default
}

const ClockWeather: React.FC = () => {
  const [time, setTime] = useState(new Date())
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const { temperatureUnit, weatherSettings, updateWeatherSettings } = useStore()
  const [weatherService, setWeatherService] = useState<WeatherService | null>(null)

  // Initialize weather service when settings change
  useEffect(() => {
    const service = new WeatherService(weatherSettings)
    setWeatherService(service)
  }, [weatherSettings])

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)

    const fetchWeather = async () => {
      if (!weatherService) return

      try {
        const weatherData = await weatherService.getWeather()
        setWeather(weatherData)
        
        // Update location in settings if we got coordinates
        if (weatherData.city && weatherData.city !== 'Current Location') {
          updateWeatherSettings({ city: weatherData.city })
        }
      } catch (error) {
        console.error('Weather fetch error:', error)
        toast.error('Could not fetch weather data.')
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()

    // Refresh weather every 10 minutes
    const weatherInterval = setInterval(fetchWeather, 10 * 60 * 1000)

    return () => {
      clearInterval(interval)
      clearInterval(weatherInterval)
    }
  }, [weatherService, updateWeatherSettings])

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
      const tempF = (weather.feelsLike * 9) / 5 + 32;
      return `${Math.round(tempF)}°F`;
    }
    return `${Math.round(weather.feelsLike)}°C`;
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
              <WeatherIcon icon={weather.icon} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              Feels like: {getFormattedFeelsLike()}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              {weather.description}
            </div>
            {weather.city && weather.city !== 'Current Location' && (
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {weather.city}
              </div>
            )}
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