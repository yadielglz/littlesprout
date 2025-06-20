import { useStore } from '../store/store'
import { calculateAge } from '../utils/initialization'
import ClockWeather from './ClockWeather'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, User, Wifi } from 'lucide-react'
import toast from 'react-hot-toast'
import { useFirebaseStore } from '../store/firebaseStore'

const Header = () => {
  const { getCurrentProfile } = useStore()
  const profile = getCurrentProfile()
  const { currentUser, logout } = useAuth()
  const { syncWithFirebase } = useFirebaseStore()

  if (!profile || !currentUser) {
    return null
  }

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error('Logout failed: ' + error.message);
    }
  };

  const handleSync = async () => {
    if (!currentUser) {
      toast.error('You must be logged in to sync data.');
      return;
    }
    try {
      await syncWithFirebase(currentUser.uid);
      toast.success('Data synced with cloud');
    } catch (error: any) {
      toast.error('Sync failed: ' + error.message);
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-40">
        {/* User Status Bar */}
        <div className="bg-blue-600 text-white px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium truncate">
                {currentUser.email}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSync}
                className="p-1 rounded hover:bg-blue-700 transition-colors"
                title="Sync with cloud"
              >
                <Wifi className="w-4 h-4" />
              </button>
              <button
                onClick={handleLogout}
                className="p-1 rounded hover:bg-blue-700 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Hello, {profile.userName}!
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{profile.babyName}</span> is {calculateAge(profile.dob)}
                </p>
              </div>
              <ClockWeather />
            </div>
          </div>
        </header>
      </div>
      <div className="h-36" /> {/* Spacer for fixed header */}
    </>
  )
}

export default Header 