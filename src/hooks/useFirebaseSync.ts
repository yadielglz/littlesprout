import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useFirebaseStore } from '../store/firebaseStore'

export const useFirebaseSync = (appInitialized: boolean) => {
  const { currentUser } = useAuth()
  const { syncWithFirebase, subscribeToRealTimeUpdates, unsubscribeFromUpdates } = useFirebaseStore()

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
}

