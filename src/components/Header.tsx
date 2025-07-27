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
        <div className="bg-blue-600 text-white px-4 py-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1 max-w-[150px] sm:max-w-none truncate">
              <User className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium truncate">
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
            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 py-4">
              <div>
                {/* Mobile: Single line with child info */}
                <h1 className="block sm:hidden text-lg font-bold text-gray-800 dark:text-white leading-tight">
                  Hello, {profile.userName}! 
                  <span className="ml-2 font-semibold text-indigo-600 dark:text-indigo-400">{profile.babyName}</span>
                  <span className="ml-1 text-sm font-normal text-gray-600 dark:text-gray-300">({calculateAge(profile.dob)})</span>
                </h1>
                
                {/* Desktop: Separate lines */}
                <div className="hidden sm:block">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white leading-tight">
                    Hello, {profile.userName}!
                  </h1>
                  <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{profile.babyName}</span> is {calculateAge(profile.dob)}
                  </p>
                </div>
              </div>
              <div className="w-full sm:w-auto">
                <ClockWeather />
              </div>
            </div>
          </div>
        </header>
      </div>
      {/* Spacer for fixed header - increased height for mobile */}
      <div className="h-44 sm:h-40" />
    </>
  )
}

export default Header 