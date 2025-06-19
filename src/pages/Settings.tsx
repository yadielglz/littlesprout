import { useState } from 'react'
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
  Upload
} from 'lucide-react'
import Modal from '../components/Modal'
import { generateId } from '../utils/initialization'
import toast from 'react-hot-toast'

const Settings = () => {
  const { 
    profiles, 
    currentProfileId, 
    addProfile, 
    updateProfile, 
    deleteProfile, 
    setCurrentProfileId,
    isDarkMode,
    toggleDarkMode
  } = useStore()

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

  const tabs = [
    { id: 'profiles', label: 'Profiles', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: isDarkMode ? Moon : Sun },
    { id: 'data', label: 'Data & Backup', icon: Download }
  ]

  // Handlers
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

  const handleExportData = () => {
    const data = {
      profiles,
      currentProfileId,
      logs: useStore.getState().logs,
      inventories: useStore.getState().inventories,
      reminders: useStore.getState().reminders,
      customActivities: useStore.getState().customActivities,
      achievedMilestones: useStore.getState().achievedMilestones,
      appointments: useStore.getState().appointments,
      isDarkMode,
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `littlesprout-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Complete backup exported successfully!')
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string)
        
        // Validate the imported data structure
        if (!importedData.profiles || !Array.isArray(importedData.profiles)) {
          throw new Error('Invalid backup file format')
        }

        // Import all data using store methods
        const store = useStore.getState()
        
        // Import profiles
        importedData.profiles.forEach((profile: BabyProfile) => {
          addProfile(profile)
        })
        
        // Import other data if available
        if (importedData.logs) {
          Object.keys(importedData.logs).forEach(profileId => {
            store.setLogs(profileId, importedData.logs[profileId])
          })
        }
        
        if (importedData.inventories) {
          Object.keys(importedData.inventories).forEach(profileId => {
            store.setInventory(profileId, importedData.inventories[profileId])
          })
        }
        
        if (importedData.reminders) {
          Object.keys(importedData.reminders).forEach(profileId => {
            store.setReminders(profileId, importedData.reminders[profileId])
          })
        }
        
        if (importedData.customActivities) {
          store.setCustomActivities(importedData.customActivities)
        }
        
        if (importedData.achievedMilestones) {
          Object.keys(importedData.achievedMilestones).forEach(profileId => {
            store.setAchievedMilestones(profileId, importedData.achievedMilestones[profileId])
          })
        }
        
        if (importedData.appointments) {
          Object.keys(importedData.appointments).forEach(profileId => {
            importedData.appointments[profileId].forEach((appt: any) => {
              store.addAppointment(profileId, appt)
            })
          })
        }
        
        // Set current profile if available
        if (importedData.currentProfileId) {
          setCurrentProfileId(importedData.currentProfileId)
        }
        
        // Set dark mode if available
        if (typeof importedData.isDarkMode === 'boolean') {
          store.setDarkMode(importedData.isDarkMode)
        }
        
        toast.success('Backup restored successfully!')
      } catch (error) {
        console.error('Import error:', error)
        toast.error('Invalid backup file or import failed')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-slate-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your app preferences and profiles
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon size={20} className="mr-3" />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              {/* Profiles Tab */}
              {activeTab === 'profiles' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Baby Profiles</h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        Manage multiple children and family members
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddProfile(true)}
                      className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Plus size={20} className="mr-2" />
                      Add Profile
                    </button>
                  </div>

                  <div className="space-y-4">
                    {profiles.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                          No profiles yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Add profiles for multiple children or family members.
                        </p>
                        <button
                          onClick={() => setShowAddProfile(true)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Add Your First Profile
                        </button>
                      </div>
                    ) : (
                      profiles.map((profile) => (
                        <div
                          key={profile.id}
                          className={`p-4 rounded-lg border transition-colors ${
                            currentProfileId === profile.id
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                              : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                                <span className="text-lg">🌱</span>
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-800 dark:text-white">
                                  {profile.babyName}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Parent: {profile.userName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                  Born: {new Date(profile.dob).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {currentProfileId === profile.id && (
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                                  Active
                                </span>
                              )}
                              <button
                                onClick={() => setCurrentProfileId(profile.id)}
                                className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                              >
                                Switch
                              </button>
                              <button
                                onClick={() => setEditProfile(profile)}
                                className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                              >
                                <Edit size={16} />
                              </button>
                              {profiles.length > 1 && (
                                <button
                                  onClick={() => setDeleteProfileItem(profile)}
                                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Notifications</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Browser Notifications</h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                        Enable browser notifications to receive reminders for feeding times, diaper changes, and other important activities.
                      </p>
                      <button
                        onClick={() => {
                          if ('Notification' in window) {
                            Notification.requestPermission()
                            toast.success('Notification permission requested!')
                          }
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Enable Notifications
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Appearance</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-white">Dark Mode</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Switch between light and dark themes
                        </p>
                      </div>
                      <button
                        onClick={toggleDarkMode}
                        className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                      >
                        {isDarkMode ? (
                          <>
                            <Sun size={20} className="mr-2" />
                            Light Mode
                          </>
                        ) : (
                          <>
                            <Moon size={20} className="mr-2" />
                            Dark Mode
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Data & Backup Tab */}
              {activeTab === 'data' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Data & Backup</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">Export Data</h3>
                      <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                        Download a backup of all your data including profiles and activities.
                      </p>
                      <button
                        onClick={handleExportData}
                        className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <Download size={20} className="mr-2" />
                        Export Backup
                      </button>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Import Data</h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                        Restore your data from a previous backup file.
                      </p>
                      <label className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
                        <Upload size={20} className="mr-2" />
                        Import Backup
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportData}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-2">Data Privacy</h3>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        All your data is stored locally on your device. We don't collect or store any personal information on our servers.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Add Profile Modal */}
        <Modal isOpen={showAddProfile} onClose={() => setShowAddProfile(false)} title="Add New Profile">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Parent/Caregiver Name *
              </label>
              <input
                type="text"
                value={newProfileData.userName}
                onChange={(e) => setNewProfileData({ ...newProfileData, userName: e.target.value })}
                placeholder="Enter your name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Baby's Name *
              </label>
              <input
                type="text"
                value={newProfileData.babyName}
                onChange={(e) => setNewProfileData({ ...newProfileData, babyName: e.target.value })}
                placeholder="Enter baby's name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date of Birth *
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
                  Parent/Caregiver Name *
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
                  Baby's Name *
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
                  Date of Birth *
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
                  Update Profile
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
                Are you sure you want to delete this profile? This will permanently remove all associated data including activities and settings.
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <p className="font-medium text-red-800 dark:text-red-200">
                  {deleteProfileItem.babyName}
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Parent: {deleteProfileItem.userName}
                </p>
              </div>
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
      </div>
    </div>
  )
}

export default Settings 