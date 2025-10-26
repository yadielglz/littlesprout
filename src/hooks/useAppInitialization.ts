import { useState, useEffect } from 'react'
import { useStore } from '../store/store'

export const useAppInitialization = (authLoading: boolean) => {
  const [isHydrated, setIsHydrated] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [appInitialized, setAppInitialized] = useState(false)

  // Store hydration management
  useEffect(() => {
    const unsubHydrate = useStore.persist.onHydrate(() => setIsHydrated(false))
    const unsubFinishHydration = useStore.persist.onFinishHydration(() => setIsHydrated(true))

    setIsHydrated(useStore.persist.hasHydrated())

    return () => {
      unsubHydrate()
      unsubFinishHydration()
    }
  }, [])

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

  return {
    isHydrated,
    showSplash,
    appInitialized,
    handleSplashComplete
  }
}

