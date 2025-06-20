import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/store'
import { useFirebaseStore } from './store/firebaseStore'
import { useAuth } from './contexts/AuthContext'
import BottomNavigation from './components/BottomNavigation'
import Dashboard from './pages/Dashboard'
import ActivityLog from './pages/ActivityLog'
import Charts from './pages/Charts'
import Settings from './pages/Settings'
import Welcome from './pages/Welcome'
import Login from './components/Login'
import FirebaseTest from './components/FirebaseTest'

function App() {
  const [isHydrated, setIsHydrated] = useState(false)
  const { profiles, isDarkMode } = useStore()
  const { currentUser, loading: authLoading } = useAuth()
  const { syncWithFirebase, subscribeToRealTimeUpdates, unsubscribeFromUpdates } = useFirebaseStore()
  const hasProfiles = profiles.length > 0

  useEffect(() => {
    const unsubHydrate = useStore.persist.onHydrate(() => setIsHydrated(false))
    const unsubFinishHydration = useStore.persist.onFinishHydration(() => setIsHydrated(true))

    setIsHydrated(useStore.persist.hasHydrated())

    return () => {
      unsubHydrate()
      unsubFinishHydration()
    }
  }, [])

  // Handle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Sync with Firebase when user is authenticated
  useEffect(() => {
    if (currentUser) {
      syncWithFirebase(currentUser.uid).catch(console.error)
      subscribeToRealTimeUpdates(currentUser.uid)
      
      return () => {
        unsubscribeFromUpdates()
      }
    }
  }, [currentUser])

  if (!isHydrated || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login if not authenticated
  if (!currentUser) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <BottomNavigation />
      <div className="pt-10 pb-20 px-4">
        <Routes>
          {hasProfiles ? (
            <>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/activity-log" element={<ActivityLog />} />
              <Route path="/charts" element={<Charts />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/firebase-test" element={<FirebaseTest />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Welcome />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/firebase-test" element={<FirebaseTest />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </div>
    </div>
  )
}

export default App