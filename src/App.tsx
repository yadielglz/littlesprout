import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/store'
import Navigation from './components/Navigation'
import Dashboard from './pages/Dashboard'
import ActivityLog from './pages/ActivityLog'
import Memories from './pages/Memories'
import Charts from './pages/Charts'
import Settings from './pages/Settings'
import Welcome from './pages/Welcome'
import SplashScreen from './components/SplashScreen'

const App = () => {
  const [isHydrated, setIsHydrated] = useState(false)
  const hasProfile = useStore(state => state.profiles.length > 0)

  useEffect(() => {
    // Set initial hydration state
    setIsHydrated(useStore.persist.hasHydrated())

    // Subscribe to hydration updates
    const unsubFinishHydration = useStore.persist.onFinishHydration(() => {
      setIsHydrated(true)
    })

    return () => {
      unsubFinishHydration()
    }
  }, [])

  // Show splash screen while hydrating
  if (!isHydrated) {
    return <SplashScreen show={true} />
  }

  return (
    <div className={useStore.getState().isDarkMode ? 'dark' : ''}>
      {hasProfile ? (
        <>
          <Navigation />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/log" element={<ActivityLog />} />
            <Route path="/memories" element={<Memories />} />
            <Route path="/charts" element={<Charts />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </>
      ) : (
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </div>
  )
}

export default App