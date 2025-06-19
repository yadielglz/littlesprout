import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from './store/store'
import { ThemeProvider } from './contexts/ThemeContext'
import { DataProvider } from './contexts/DataContext'
import SplashScreen from './components/SplashScreen'
import Navigation from './components/Navigation'
import Dashboard from './pages/Dashboard'
import Welcome from './pages/Welcome'
import Settings from './pages/Settings'
import ActivityLog from './pages/ActivityLog'
import Memories from './pages/Memories'
import Charts from './pages/Charts'
import { loadData } from './utils/storage'
import { initializeApp } from './utils/initialization'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [showSplash, setShowSplash] = useState(true)
  const { profiles, setProfiles, setCurrentProfileId, getCurrentProfile } = useStore()
  const [isHydrated, setIsHydrated] = useState(false)
  const profile = getCurrentProfile()

  useEffect(() => {
    const initialize = async () => {
      try {
        // Load data from localStorage
        const data = await loadData()
        setProfiles(data.profiles || [])
        setCurrentProfileId(data.currentProfileId)
        // Initialize app features
        await initializeApp()
        // Show splash for minimum time
        setTimeout(() => {
          setShowSplash(false)
          setTimeout(() => setIsLoading(false), 500)
        }, 2000)
      } catch (error) {
        console.error('Failed to initialize app:', error)
        setShowSplash(false)
        setIsLoading(false)
      }
    }
    initialize()
  }, [setProfiles, setCurrentProfileId])

  useEffect(() => {
    // Wait for store to be hydrated
    const unsubHydrate = useStore.persist.onHydrate(() => setIsHydrated(false))
    const unsubFinishHydration = useStore.persist.onFinishHydration(() => setIsHydrated(true))

    return () => {
      unsubHydrate()
      unsubFinishHydration()
    }
  }, [])

  if (!isHydrated) {
    return <SplashScreen show={true} />
  }

  return (
    <ThemeProvider>
      <DataProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-slate-800 transition-colors duration-300">
          {/* Navigation */}
          {profiles.length > 0 && <Navigation />}
          
          {/* Main Content */}
          <div className="md:ml-0">
            <AnimatePresence mode="wait">
              <Routes>
                <Route 
                  path="/" 
                  element={
                    profiles.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Welcome />
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Dashboard />
                      </motion.div>
                    )
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Dashboard />
                    </motion.div>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <Settings />
                    </motion.div>
                  } 
                />
                <Route 
                  path="/log" 
                  element={
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <ActivityLog />
                    </motion.div>
                  } 
                />
                <Route 
                  path="/memories" 
                  element={
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <Memories />
                    </motion.div>
                  } 
                />
                <Route 
                  path="/charts" 
                  element={
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <Charts />
                    </motion.div>
                  } 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </div>
        </div>
      </DataProvider>
    </ThemeProvider>
  )
}

export default App 