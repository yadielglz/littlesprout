import { useState, useEffect } from 'react'
import { useStore, BabyProfile } from '../store/store'
import { motion } from 'framer-motion'
import { 
  Users, 
  Bell, 
  Moon, 
  Sun,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Shield,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Database,
  History,
  Cloud,
  MapPin,
  Key
} from 'lucide-react'
import Modal from '../components/Modal'
import { generateId } from '../utils/initialization'
import { 
  createDataBackup, 
  restoreFromBackup, 
  exportAppData, 
  importAppData, 
  getLocalBackups, 
  getRecoveryInfo,
  BackupData 
} from '../utils/dataBackup'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { formatDateSafe } from '../utils/datetime'
import { WeatherService } from '../services/weather'

// Helper Components for Settings
const SettingsRow = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-700/50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    {children}
  </div>
);

const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
  </label>
);

const StatusIndicator = ({ status, children }: { status: 'success' | 'warning' | 'error', children: React.ReactNode }) => {
  const colors = {
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400'
  };
  
  const icons = {
    success: CheckCircle,
    warning: AlertCircle,
    error: AlertCircle
  };
  
  const Icon = icons[status];
  
  return (
    <div className={`flex items-center space-x-2 ${colors[status]}`}>
      <Icon className="w-4 h-4" />
      <span>{children}</span>
    </div>
  );
};

const Settings = () => {
  // Debug log for mobile testing
  console.log('[Settings] Component loaded on:', {
    userAgent: navigator.userAgent,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    isMobile: window.innerWidth < 768
  });

  const { 
    profiles, 
    currentProfileId, 
    addProfile, 
    updateProfile, 
    deleteProfile, 
    setCurrentProfileId,
    isDarkMode,
    toggleDarkMode,
    temperatureUnit,
    toggleTemperatureUnit,
    measurementUnit,
    toggleMeasurementUnit,
    addReminder,
    deleteReminder,
    reminders,
    setLogs,
    setReminders,
    setAppointments,
    weatherSettings,
    updateWeatherSettings,
  } = useStore()

  const { currentUser } = useAuth()

  // State
  const [activeTab, setActiveTab] = useState('profiles')
  const [showAddProfile, setShowAddProfile] = useState(false)
  const [editProfile, setEditProfile] = useState<BabyProfile | null>(null)
  const [deleteProfileItem, setDeleteProfileItem] = useState<BabyProfile | null>(null)
  const [newProfileData, setNewProfileData] = useState({
    userName: '',
    babyName: '',
    dob: ''
  })

  // Weather settings state
  const [weatherApiKey, setWeatherApiKey] = useState(weatherSettings.apiKey || '')
  const [weatherCity, setWeatherCity] = useState(weatherSettings.city || '')
  const [weatherProvider, setWeatherProvider] = useState(weatherSettings.provider)
  const [isTestingWeather, setIsTestingWeather] = useState(false)
  const [weatherTestResult, setWeatherTestResult] = useState<{ success: boolean; message: string } | null>(null)

  // Enhanced backup state
  const [backups, setBackups] = useState<BackupData[]>([])
  const [recoveryInfo, setRecoveryInfo] = useState<any>(null)
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [showBackupHistory, setShowBackupHistory] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)

  // State for reminders management
  const [newReminderText, setNewReminderText] = useState('')

  const tabs = [
    { id: 'profiles', label: 'Profiles', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: isDarkMode ? Moon : Sun },
    { id: 'data', label: 'Data & Backup', icon: Database },
    { id: 'weather', label: 'Weather', icon: Cloud }
  ]

  // Load backup information on component mount
  useEffect(() => {
    const loadBackupInfo = () => {
      setBackups(getLocalBackups())
      setRecoveryInfo(getRecoveryInfo())
    }

    loadBackupInfo()
    
    // Refresh recovery info every 30 seconds
    const interval = setInterval(loadBackupInfo, 30000)
    return () => clearInterval(interval)
  }, [])

  // Handlers
  const handleAddReminder = () => {
    if (newReminderText.trim() && currentProfileId) {
      addReminder(currentProfileId, {
        id: generateId(),
        text: newReminderText.trim(),
        time: Date.now(),
        frequency: 'none',
        isActive: true,
      })
      setNewReminderText('')
      toast.success('Reminder added successfully!')
    }
  }

  const handleAddProfile = () => {
    if (!newProfileData.userName.trim() || !newProfileData.babyName.trim() || !newProfileData.dob) {
      toast.error('Please fill in all fields')
      return
    }

    const profile: BabyProfile = {
      id: generateId(),
      userName: newProfileData.userName.trim(),
      babyName: newProfileData.babyName.trim(),
      dob: newProfileData.dob,
      createdAt: new Date().toISOString()
    }

    addProfile(profile)
    setShowAddProfile(false)
    setNewProfileData({ userName: '', babyName: '', dob: '' })
    toast.success('Profile added successfully!')
  }

  const handleUpdateProfile = () => {
    if (!editProfile || !editProfile.userName.trim() || !editProfile.babyName.trim() || !editProfile.dob) {
      toast.error('Please fill in all fields')
      return
    }

    updateProfile(editProfile.id, {
      userName: editProfile.userName.trim(),
      babyName: editProfile.babyName.trim(),
      dob: editProfile.dob
    })
    setEditProfile(null)
    toast.success('Profile updated successfully!')
  }

  const handleDeleteProfile = () => {
    if (!deleteProfileItem) return

    deleteProfile(deleteProfileItem.id)
    setDeleteProfileItem(null)
    toast.success('Profile deleted successfully!')
  }

  // Enhanced backup handlers
  const handleCreateBackup = async () => {
    setIsCreatingBackup(true)
    try {
      await createDataBackup(currentUser?.uid)
      setBackups(getLocalBackups())
      toast.success('Backup created successfully!')
    } catch (error) {
      toast.error('Failed to create backup')
    } finally {
      setIsCreatingBackup(false)
    }
  }

  const handleRestoreBackup = async (backup: BackupData) => {
    try {
      await restoreFromBackup(backup)
      setBackups(getLocalBackups())
      toast.success('Data restored successfully!')
    } catch (error) {
      toast.error('Failed to restore backup')
    }
  }

  const handleExportData = () => {
    try {
      const exportData = exportAppData()
      const blob = new Blob([exportData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `littlesprout-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Data exported successfully!')
    } catch (error) {
      toast.error('Failed to export data')
    }
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const jsonData = e.target?.result as string
        await importAppData(jsonData)
        setBackups(getLocalBackups())
        // Reset the input
        event.target.value = ''
      } catch (error) {
        toast.error('Failed to import data. Please check the file format.')
      }
    }
    reader.readAsText(file)
  }

  const handleResetData = () => {
    profiles.forEach(profile => {
      setLogs(profile.id, [])
      setReminders(profile.id, [])
      setAppointments(profile.id, [])
    })
    toast.success('All activity, reminders, and appointments erased!')
    setShowResetModal(false)
  }

  // Weather settings handlers
  const handleSaveWeatherSettings = () => {
    const newSettings = {
      provider: weatherProvider,
      apiKey: weatherApiKey || undefined,
      city: weatherCity || undefined,
      latitude: weatherSettings.latitude,
      longitude: weatherSettings.longitude,
    }
    
    updateWeatherSettings(newSettings)
    toast.success('Weather settings saved!')
  }

  const handleTestWeather = async () => {
    setIsTestingWeather(true)
    setWeatherTestResult(null)
    
    try {
      const testSettings = {
        provider: weatherProvider,
        apiKey: weatherApiKey || undefined,
        city: weatherCity || undefined,
        latitude: weatherSettings.latitude,
        longitude: weatherSettings.longitude,
      }
      
      const weatherService = new WeatherService(testSettings)
      const weather = await weatherService.getWeather()
      
      setWeatherTestResult({
        success: true,
        message: `Weather test successful! Current weather in ${weather.city}: ${weather.description}, ${Math.round(weather.temperature)}°C`
      })
    } catch (error) {
      setWeatherTestResult({
        success: false,
        message: `Weather test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setIsTestingWeather(false)
    }
  }

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateWeatherSettings({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            city: undefined // Clear city when using coordinates
          })
          toast.success('Location updated!')
        },
        (error) => {
          toast.error('Could not get location. Please enable location services.')
        }
      )
    } else {
      toast.error('Geolocation is not supported by this browser.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getBackupSize = (backup: BackupData) => {
    const size = JSON.stringify(backup).length
    return size > 1024 ? `${(size / 1024).toFixed(1)} KB` : `${size} B`
  }

  const renderDataTab = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Recovery Status */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-4 sm:p-6 border border-white/20 dark:border-gray-700/20">
        <div className="flex items-center mb-4">
          <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 mr-2 sm:mr-3" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">Data Protection Status</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <StatusIndicator status={recoveryInfo?.isOnline ? 'success' : 'warning'}>
              {recoveryInfo?.isOnline ? 'Connected' : 'Offline Mode'}
            </StatusIndicator>
            <StatusIndicator status={recoveryInfo?.backupCount > 0 ? 'success' : 'warning'}>
              {recoveryInfo?.backupCount || 0} Local Backups
            </StatusIndicator>
            <StatusIndicator status={recoveryInfo?.queuedItems === 0 ? 'success' : 'warning'}>
              {recoveryInfo?.queuedItems || 0} Pending Sync Items
            </StatusIndicator>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>Last Sync: {recoveryInfo?.lastSyncTime ? new Date(recoveryInfo.lastSyncTime).toLocaleString() : 'Never'}</p>
            <p>Auto-backup: Every 30 minutes</p>
            <p>Data Retention: 5 local backups</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <button
          onClick={handleCreateBackup}
          disabled={isCreatingBackup}
          className="flex items-center justify-center p-3 sm:p-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm sm:text-base"
        >
          {isCreatingBackup ? (
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
          ) : (
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          )}
          {isCreatingBackup ? 'Creating Backup...' : 'Create Backup Now'}
        </button>
        
        <button
          onClick={() => setShowBackupHistory(true)}
          className="flex items-center justify-center p-3 sm:p-4 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors text-sm sm:text-base"
        >
          <History className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          View Backup History
        </button>
        <button
          onClick={() => setShowResetModal(true)}
          className="flex items-center justify-center p-3 sm:p-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-sm sm:text-base"
        >
          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Reset All Data
        </button>
      </div>

      {/* Import/Export */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Import & Export</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleExportData}
            className="flex items-center justify-center p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Export All Data
          </button>
          
          <label className="flex items-center justify-center p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 transition-colors cursor-pointer">
            <Upload className="w-5 h-5 mr-2" />
            Import Data
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Export creates a complete backup file. Import will merge with existing data after creating a safety backup.
        </p>
      </div>

      {/* Recent Backups */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Backups</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {backups.length} of 5 backup slots used
          </span>
        </div>
        
        {backups.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No backups available</p>
            <p className="text-sm">Create your first backup to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {backups.slice(0, 3).map((backup) => (
              <div
                key={backup.timestamp}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">
                    {formatDate(backup.timestamp)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Size: {getBackupSize(backup)} • Version: {backup.version}
                  </div>
                </div>
                <button
                  onClick={() => handleRestoreBackup(backup)}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Restore
                </button>
              </div>
            ))}
            {backups.length > 3 && (
              <button
                onClick={() => setShowBackupHistory(true)}
                className="w-full p-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                View all {backups.length} backups
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )

  const renderProfiles = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Baby Profiles</h3>
        <button
          onClick={() => setShowAddProfile(true)}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Profile
        </button>
      </div>

      <div className="space-y-3">
        {profiles.map((profile) => (
          <SettingsRow key={profile.id}>
            <div className="flex items-center space-x-4">
              <div className={`w-4 h-4 rounded-full ${currentProfileId === profile.id ? 'bg-green-500' : 'bg-gray-300'}`} />
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white">{profile.babyName}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Parent: {profile.userName} • Born: {formatDateSafe(profile.dob)}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              {currentProfileId !== profile.id && (
                <button
                  onClick={() => setCurrentProfileId(profile.id)}
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  Select
                </button>
              )}
              <button
                onClick={() => setEditProfile(profile)}
                className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteProfileItem(profile)}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </SettingsRow>
        ))}
      </div>
    </div>
  )

  const renderAppearance = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Appearance Settings</h3>
      
      <SettingsRow>
        <div>
          <h4 className="font-medium text-gray-800 dark:text-white">Dark Mode</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Use dark theme throughout the app</p>
        </div>
        <ToggleSwitch checked={isDarkMode} onChange={toggleDarkMode} />
      </SettingsRow>

      <SettingsRow>
        <div>
          <h4 className="font-medium text-gray-800 dark:text-white">Temperature Unit</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Display temperatures in {temperatureUnit === 'F' ? 'Fahrenheit' : 'Celsius'}</p>
        </div>
        <button
          onClick={toggleTemperatureUnit}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {temperatureUnit}°
        </button>
      </SettingsRow>

      <SettingsRow>
        <div>
          <h4 className="font-medium text-gray-800 dark:text-white">Measurement Unit</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Display volumes in {measurementUnit === 'oz' ? 'ounces' : 'milliliters'}</p>
        </div>
        <button
          onClick={toggleMeasurementUnit}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {measurementUnit}
        </button>
      </SettingsRow>
    </div>
  )

  const renderNotifications = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Notification Settings</h3>
      
      <SettingsRow>
        <div>
          <h4 className="font-medium text-gray-800 dark:text-white">Browser Notifications</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications in your browser</p>
        </div>
        <button
          onClick={() => {
            if ('Notification' in window) {
              Notification.requestPermission().then(permission => {
                toast.success(`Notifications ${permission === 'granted' ? 'enabled' : 'disabled'}`)
              })
            }
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Enable
        </button>
      </SettingsRow>

      <div className="mt-6">
        <h4 className="font-medium text-gray-800 dark:text-white mb-3">Quick Reminders</h4>
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={newReminderText}
            onChange={(e) => setNewReminderText(e.target.value)}
            placeholder="Add a quick reminder..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          />
          <button
            onClick={handleAddReminder}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add
          </button>
        </div>
        
        <div className="space-y-2">
          {currentProfileId && reminders[currentProfileId] && reminders[currentProfileId].map((reminder) => (
            <div key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-gray-800 dark:text-white">{reminder.text}</span>
              <button
                onClick={() => currentProfileId && deleteReminder(currentProfileId, reminder.id)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderWeather = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Weather Settings</h3>
      
      <SettingsRow>
        <div>
          <h4 className="font-medium text-gray-800 dark:text-white">Weather Provider</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Choose your weather data source</p>
        </div>
        <select
          value={weatherProvider}
          onChange={(e) => setWeatherProvider(e.target.value as 'openweathermap' | 'open-meteo')}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
        >
          <option value="open-meteo">Open-Meteo (Free)</option>
          <option value="openweathermap">OpenWeatherMap (API Key Required)</option>
        </select>
      </SettingsRow>

      {weatherProvider === 'openweathermap' && (
        <SettingsRow>
          <div>
            <h4 className="font-medium text-gray-800 dark:text-white">OpenWeatherMap API Key</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Get your free API key from openweathermap.org</p>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="password"
              value={weatherApiKey}
              onChange={(e) => setWeatherApiKey(e.target.value)}
              placeholder="Enter API key"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white w-48"
            />
            <Key className="w-4 h-4 text-gray-400" />
          </div>
        </SettingsRow>
      )}

      <SettingsRow>
        <div>
          <h4 className="font-medium text-gray-800 dark:text-white">Location</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {weatherCity ? `City: ${weatherCity}` : 
             weatherSettings.latitude && weatherSettings.longitude ? 
             `Coordinates: ${weatherSettings.latitude.toFixed(4)}, ${weatherSettings.longitude.toFixed(4)}` : 
             'No location set'}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleGetLocation}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            <MapPin className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={weatherCity}
            onChange={(e) => setWeatherCity(e.target.value)}
            placeholder="Enter city name"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white w-32"
          />
        </div>
      </SettingsRow>

      {/* Test Weather Connection */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 dark:text-white mb-3">Test Weather Connection</h4>
        <div className="flex space-x-2 mb-3">
          <button
            onClick={handleTestWeather}
            disabled={isTestingWeather}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {isTestingWeather ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Cloud className="w-4 h-4 mr-2" />
                Test Connection
              </>
            )}
          </button>
          <button
            onClick={handleSaveWeatherSettings}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Save Settings
          </button>
        </div>
        
        {weatherTestResult && (
          <div className={`p-3 rounded-lg ${
            weatherTestResult.success 
              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
              : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          }`}>
            <div className="flex items-center">
              {weatherTestResult.success ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <AlertCircle className="w-4 h-4 mr-2" />
              )}
              <span className="text-sm">{weatherTestResult.message}</span>
            </div>
          </div>
        )}
      </div>

      {/* Current Settings Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 dark:text-white mb-2">Current Settings</h4>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p>Provider: {weatherSettings.provider === 'openweathermap' ? 'OpenWeatherMap' : 'Open-Meteo'}</p>
          <p>API Key: {weatherSettings.apiKey ? '✓ Configured' : '✗ Not configured'}</p>
          <p>City: {weatherSettings.city || 'Not set'}</p>
          <p>Coordinates: {weatherSettings.latitude && weatherSettings.longitude ? 
            `${weatherSettings.latitude.toFixed(4)}, ${weatherSettings.longitude.toFixed(4)}` : 'Not set'}</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-12 pb-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-2">Settings</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage your profiles, preferences, and data
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-6 lg:mb-8 bg-white/90 dark:bg-gray-800/90 rounded-2xl p-2 shadow-lg border border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors text-sm sm:text-base ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-white/95 dark:bg-gray-800/95 rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {(() => {
              console.log('[Settings] Rendering tab:', activeTab);
              if (activeTab === 'profiles') return renderProfiles();
              if (activeTab === 'notifications') return renderNotifications();
              if (activeTab === 'appearance') return renderAppearance();
              if (activeTab === 'data') return renderDataTab();
              if (activeTab === 'weather') return renderWeather();
              return <div className="p-8 text-center text-gray-500">No content available for this tab.</div>;
            })()}
          </motion.div>
        </div>
      </div>

      {/* Backup History Modal */}
      <Modal isOpen={showBackupHistory} onClose={() => setShowBackupHistory(false)} title="Backup History" size="large">
        <div className="space-y-4">
          {backups.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No backups available</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {backups.map((backup, index) => (
                <div
                  key={backup.timestamp}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-800 dark:text-white">
                        Backup #{backups.length - index}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {getBackupSize(backup)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Created: {formatDate(backup.timestamp)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Profiles: {backup.data.profiles.length} • 
                      Logs: {Object.values(backup.data.logs).flat().length} • 
                      Version: {backup.version}
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => {
                        handleRestoreBackup(backup)
                        setShowBackupHistory(false)
                      }}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Restore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Add Profile Modal */}
      <Modal isOpen={showAddProfile} onClose={() => setShowAddProfile(false)} title="Add New Profile">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Parent/Guardian Name
            </label>
            <input
              type="text"
              value={newProfileData.userName}
              onChange={(e) => setNewProfileData({ ...newProfileData, userName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Baby's Name
            </label>
            <input
              type="text"
              value={newProfileData.babyName}
              onChange={(e) => setNewProfileData({ ...newProfileData, babyName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              placeholder="Enter baby's name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              value={newProfileData.dob}
              onChange={(e) => setNewProfileData({ ...newProfileData, dob: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleAddProfile}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add Profile
            </button>
            <button
              onClick={() => setShowAddProfile(false)}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal isOpen={!!editProfile} onClose={() => setEditProfile(null)} title="Edit Profile">
        {editProfile && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Parent/Guardian Name
              </label>
              <input
                type="text"
                value={editProfile.userName}
                onChange={(e) => setEditProfile({ ...editProfile, userName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Baby's Name
              </label>
              <input
                type="text"
                value={editProfile.babyName}
                onChange={(e) => setEditProfile({ ...editProfile, babyName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={editProfile.dob}
                onChange={(e) => setEditProfile({ ...editProfile, dob: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleUpdateProfile}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditProfile(null)}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Profile Modal */}
      <Modal isOpen={!!deleteProfileItem} onClose={() => setDeleteProfileItem(null)} title="Delete Profile">
        {deleteProfileItem && (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Are you sure you want to delete the profile for <strong>{deleteProfileItem.babyName}</strong>? 
              This will also delete all associated logs, reminders, and appointments. This action cannot be undone.
            </p>
            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleDeleteProfile}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete Profile
              </button>
              <button
                onClick={() => setDeleteProfileItem(null)}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reset Data Modal */}
      <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)} title="Reset All Data?">
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to erase <b>all activity, reminders, and appointments</b> for all profiles? This cannot be undone.
          </p>
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleResetData}
              className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
            >
              Yes, Reset Everything
            </button>
            <button
              onClick={() => setShowResetModal(false)}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Settings 