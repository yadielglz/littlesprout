import { Suspense, lazy, useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useStore } from './store/store'
import { useFirebaseStore } from './store/firebaseStore'
import { useAuth } from './contexts/AuthContext'
import { useModal } from './contexts/ModalContext'
import { TimerProvider } from './contexts/TimerContext'
import Header from './components/Header'
import UnifiedActionModal from './components/UnifiedActionModal'
import LoadingSpinner from './components/common/LoadingSpinner'

import BottomNavigation from './components/BottomNavigation'
import Login from './components/Login'
import FloatingActionButton, { ActionItem } from './components/FloatingActionButton'
import SplashScreen from './components/SplashScreen'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const ActivityLog = lazy(() => import('./pages/ActivityLog'))
const Appointments = lazy(() => import('./pages/Appointments'))
const Charts = lazy(() => import('./pages/Charts'))
const HealthDashboard = lazy(() => import('./pages/HealthDashboard'))
const FeaturesShowcase = lazy(() => import('./pages/FeaturesShowcase'))
const Settings = lazy(() => import('./pages/Settings'))
const Welcome = lazy(() => import('./pages/Welcome'))
const FirebaseTest = lazy(() => import('./components/FirebaseTest'))
const NotFound = lazy(() => import('./pages/NotFound'))

function App() {
  const { isDarkMode, profiles } = useStore()
  const { syncWithFirebase, subscribeToRealTimeUpdates, unsubscribeFromUpdates } = useFirebaseStore()
  const { currentUser, loading: authLoading } = useAuth()
  const { isModalOpen, actionType, closeModal, openModal } = useModal()
  const location = useLocation()
  const navigate = useNavigate()
  
  const [isHydrated, setIsHydrated] = useState(false)

  const [showSplash, setShowSplash] = useState(true)
  const [appInitialized, setAppInitialized] = useState(false)


  const hasProfiles = profiles.length > 0

  // Splash screen and app initialization
  useEffect(() => {
    const initializeApp = async () => {
      // Ensure splash screen shows for at least 2.5 seconds
      const minSplashTime = new Promise(resolve => setTimeout(resolve, 2500))
      
      // Wait for store hydration and auth
      const appReady = new Promise<void>((resolve) => {
        const checkReady = () => {
          if (isHydrated && !authLoading) {
            resolve()
          } else {
            setTimeout(checkReady, 100)
          }
        }
        checkReady()
      })

      await Promise.all([minSplashTime, appReady])
      setAppInitialized(true)
    }

    initializeApp()
  }, [isHydrated, authLoading])

  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  // Mobile-specific route fix
  useEffect(() => {
    // Check if we're on a mobile device and handle potential routing issues
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobile && currentUser && hasProfiles) {
      // If mobile user is on root and should be on dashboard, redirect
      if (location.pathname === '/' || location.pathname === '/littlesprout/' || location.pathname === '/littlesprout') {
        navigate('/dashboard', { replace: true })
      }
      
      // Handle any malformed paths that might occur on mobile
      const validPaths = ['/dashboard', '/activity-log', '/appointments', '/charts', '/health', '/features', '/settings', '/firebase-test']
      const currentPath = location.pathname
      
      if (!validPaths.includes(currentPath) && currentPath !== '/' && !currentPath.includes('welcome')) {
        console.warn('Mobile: Invalid path detected, redirecting to dashboard:', currentPath)
        navigate('/dashboard', { replace: true })
      }
    }
  }, [location.pathname, currentUser, hasProfiles, navigate])

  const fabActions: ActionItem[] = [
    { id: 'feed', label: 'Feeding', icon: '🍼', color: 'bg-blue-600', category: 'care', action: () => openModal('feed') },
    { id: 'diaper', label: 'Diaper Change', icon: '👶', color: 'bg-yellow-500', category: 'care', action: () => openModal('diaper') },
    { id: 'sleep', label: 'Sleep', icon: '😴', color: 'bg-purple-600', category: 'care', action: () => openModal('sleep') },
    { id: 'weight', label: 'Weight', icon: '⚖️', color: 'bg-red-500', category: 'health', action: () => openModal('weight') },
    { id: 'height', label: 'Height', icon: '📏', color: 'bg-green-600', category: 'health', action: () => openModal('height') },
    { id: 'temperature', label: 'Temperature', icon: '🌡️', color: 'bg-orange-500', category: 'health', action: () => openModal('temperature') },
    { id: 'vaccine', label: 'Vaccination', icon: '💉', color: 'bg-teal-600', category: 'health', action: () => openModal('vaccine') },
    { id: 'milestone', label: 'Milestone', icon: '🎉', color: 'bg-pink-600', category: 'other', action: () => openModal('health') },
    { id: 'appointment', label: 'Doctor\'s Appointment', icon: '📅', color: 'bg-blue-600', category: 'schedule', action: () => openModal('appointment') },
    { id: 'reminder', label: 'Add Reminder', icon: '🔔', color: 'bg-orange-500', category: 'schedule', action: () => openModal('reminder') }
  ]

  useEffect(() => {
    const unsubHydrate = useStore.persist.onHydrate(() => setIsHydrated(false))
    const unsubFinishHydration = useStore.persist.onFinishHydration(() => setIsHydrated(true))

    setIsHydrated(useStore.persist.hasHydrated())

    return () => {
      unsubHydrate()
      unsubFinishHydration()
    }
  }, [])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  useEffect(() => {
    if (currentUser && appInitialized) {
      syncWithFirebase(currentUser.uid).catch(console.error)
      subscribeToRealTimeUpdates(currentUser.uid)
      
      return () => {
        unsubscribeFromUpdates()
      }
    } else {
      unsubscribeFromUpdates()
    }
  }, [currentUser, syncWithFirebase, subscribeToRealTimeUpdates, unsubscribeFromUpdates, appInitialized])



  // Show splash screen while app is initializing
  if (showSplash || !appInitialized) {
    return <SplashScreen show={true} onComplete={handleSplashComplete} />
  }

  if (!currentUser) {
    return <Login />
  }

  return (
    <TimerProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Toaster position="bottom-center" reverseOrder={false} />
        {hasProfiles && <Header />}
        
        <main className="pb-20">
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading..." />}>
            <Routes>
              {hasProfiles ? (
                <>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/activity-log" element={<ActivityLog />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/charts" element={<Charts />} />
                  <Route path="/health" element={<HealthDashboard />} />
                  <Route path="/features" element={<FeaturesShowcase />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/firebase-test" element={<FirebaseTest />} />
                  <Route path="*" element={<NotFound />} />
                </>
              ) : (
                <>
                  <Route path="/" element={<Welcome />} />
                  <Route path="*" element={<Navigate to="/welcome" replace />} />
                </>
              )}
            </Routes>
          </Suspense>
        </main>

        {hasProfiles && <BottomNavigation />}

        <FloatingActionButton
          actions={fabActions}
          position="bottom-right"
          onActionSelect={(action) => console.log('Action selected:', action)}
        />

        <UnifiedActionModal
          isOpen={isModalOpen}
          actionType={actionType}
          onClose={closeModal}
        />
        
      </div>
    </TimerProvider>
  )
}

export default App