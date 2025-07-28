export interface WeatherData {
  temperature: number
  feelsLike: number
  humidity: number
  windSpeed: number
  description: string
  icon: string
  city: string
}

export interface WeatherSettings {
  provider: 'openweathermap' | 'open-meteo'
  apiKey?: string
  city?: string
  latitude?: number
  longitude?: number
}

// OpenWeatherMap API service
class OpenWeatherMapService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async getWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
    )
    
    if (!response.ok) {
      throw new Error(`OpenWeatherMap API error: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      city: data.name
    }
  }

  async getWeatherByCity(city: string): Promise<WeatherData> {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`
    )
    
    if (!response.ok) {
      throw new Error(`OpenWeatherMap API error: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      city: data.name
    }
  }
}

// Open-Meteo API service (fallback)
class OpenMeteoService {
  async getWeather(lat: number, lon: number): Promise<WeatherData> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=apparent_temperature&timezone=auto`
    console.log('OpenMeteoService: Fetching from URL:', url)
    
    const response = await fetch(url)
    
    if (!response.ok) {
      console.error('OpenMeteoService: API error:', response.status, response.statusText)
      throw new Error(`Failed to fetch weather data from Open-Meteo: ${response.status}`)
    }

    const data = await response.json()
    console.log('OpenMeteoService: Received data:', data)
    
    // Find the current hour's apparent temperature
    let apparentTemperature = data.current_weather.temperature
    if (data.hourly && data.hourly.time && data.hourly.apparent_temperature) {
      const now = new Date()
      const currentHour = now.toISOString().slice(0, 13) // e.g., '2024-07-26T15'
      const idx = data.hourly.time.findIndex((t: string) => t.startsWith(currentHour))
      if (idx !== -1) {
        apparentTemperature = data.hourly.apparent_temperature[idx]
      }
    }

    // Map weather codes to descriptions
    const getWeatherDescription = (code: number) => {
      if (code >= 0 && code <= 1) return 'Clear sky'
      if (code >= 2 && code <= 3) return 'Partly cloudy'
      if (code >= 51 && code <= 67) return 'Rain'
      if (code >= 71 && code <= 77) return 'Snow'
      return 'Cloudy'
    }

    const result = {
      temperature: data.current_weather.temperature,
      feelsLike: apparentTemperature,
      humidity: 0, // Open-Meteo doesn't provide humidity in current weather
      windSpeed: data.current_weather.windspeed,
      description: getWeatherDescription(data.current_weather.weathercode),
      icon: this.getWeatherIcon(data.current_weather.weathercode),
      city: 'Current Location'
    }
    
    console.log('OpenMeteoService: Returning weather data:', result)
    return result
  }

  private getWeatherIcon(code: number): string {
    if (code >= 0 && code <= 1) return '01d' // Clear sky
    if (code >= 2 && code <= 3) return '02d' // Partly cloudy
    if (code >= 51 && code <= 67) return '10d' // Rain
    if (code >= 71 && code <= 77) return '13d' // Snow
    return '03d' // Cloudy
  }
}

// Main weather service
export class WeatherService {
  private settings: WeatherSettings
  private openWeatherMap?: OpenWeatherMapService
  private openMeteo: OpenMeteoService

  constructor(settings: WeatherSettings) {
    this.settings = settings
    this.openMeteo = new OpenMeteoService()
    
    if (settings.provider === 'openweathermap' && settings.apiKey) {
      this.openWeatherMap = new OpenWeatherMapService(settings.apiKey)
    }
  }

  async getWeather(): Promise<WeatherData> {
    try {
      console.log('WeatherService: Starting weather fetch with settings:', this.settings)
      
      // Try OpenWeatherMap first if configured
      if (this.settings.provider === 'openweathermap' && this.openWeatherMap) {
        console.log('WeatherService: Trying OpenWeatherMap')
        if (this.settings.city) {
          console.log('WeatherService: Using city:', this.settings.city)
          return await this.openWeatherMap.getWeatherByCity(this.settings.city)
        } else if (this.settings.latitude && this.settings.longitude) {
          console.log('WeatherService: Using coordinates:', this.settings.latitude, this.settings.longitude)
          return await this.openWeatherMap.getWeatherByCoords(this.settings.latitude, this.settings.longitude)
        }
      }

      // Fallback to Open-Meteo with geolocation
      if (this.settings.latitude && this.settings.longitude) {
        console.log('WeatherService: Using Open-Meteo with coordinates:', this.settings.latitude, this.settings.longitude)
        return await this.openMeteo.getWeather(this.settings.latitude, this.settings.longitude)
      }

      // Final fallback: get location from browser
      console.log('WeatherService: Requesting browser geolocation')
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          console.error('WeatherService: Geolocation not supported')
          reject(new Error('Geolocation not supported'))
          return
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              console.log('WeatherService: Got position:', position.coords)
              const { latitude, longitude } = position.coords
              const weather = await this.openMeteo.getWeather(latitude, longitude)
              console.log('WeatherService: Successfully got weather from Open-Meteo')
              resolve(weather)
            } catch (error) {
              console.error('WeatherService: Error fetching weather from Open-Meteo:', error)
              reject(new Error('Failed to fetch weather data'))
            }
          },
          (error) => {
            console.error('WeatherService: Geolocation error:', error)
            reject(new Error(`Location access denied: ${error.message}`))
          },
          {
            timeout: 10000,
            enableHighAccuracy: false,
            maximumAge: 300000 // 5 minutes
          }
        )
      })
    } catch (error) {
      console.error('WeatherService: General error:', error)
      throw error
    }
  }

  updateSettings(newSettings: WeatherSettings) {
    this.settings = newSettings
    if (newSettings.provider === 'openweathermap' && newSettings.apiKey) {
      this.openWeatherMap = new OpenWeatherMapService(newSettings.apiKey)
    } else {
      this.openWeatherMap = undefined
    }
  }
}