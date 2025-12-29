import React, { createContext, useContext, useEffect, useState } from 'react'
import { useStore } from '../store/store'
import { useFirebaseStore } from '../store/firebaseStore'
import { supabase } from '../lib/supabaseClient'

interface AuthContextType {
  currentUser: { uid: string; email?: string } | null
  login: (email: string, password: string) => Promise<{ uid: string; email?: string } | null>
  signup: (email: string, password: string) => Promise<{ uid: string; email?: string } | null>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<{ uid: string; email?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  const signup = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    const user = data.user ? { uid: data.user.id, email: data.user.email || undefined } : null
    setCurrentUser(user)
    return user
  }

  const login = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    const user = data.user ? { uid: data.user.id, email: data.user.email || undefined } : null
    setCurrentUser(user)
    return user
  }

  const logout = async () => {
    if (!supabase) {
      setCurrentUser(null)
      useStore.setState({
        profiles: [],
        currentProfileId: null,
        logs: {},
        inventories: {},
        reminders: {},
        appointments: {},
        achievedMilestones: {},
        activeTimer: null,
        customActivities: []
      })
      return Promise.resolve()
    }
    // Clear all local data before logging out
    const { unsubscribeFromUpdates } = useFirebaseStore.getState()
    
    // Unsubscribe from Firebase listeners
    unsubscribeFromUpdates()
    
    // Clear the store state (this will also clear localStorage due to persist)
    useStore.setState({
      profiles: [],
      currentProfileId: null,
      logs: {},
      inventories: {},
      reminders: {},
      appointments: {},
      achievedMilestones: {},
      activeTimer: null,
      customActivities: []
      // Keep user preferences like isDarkMode, temperatureUnit, measurementUnit
    })
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setCurrentUser(null)
    return Promise.resolve()
  }

  useEffect(() => {
    if (!supabase) {
      console.warn('Supabase not configured; auth disabled')
      setLoading(false)
      return
    }
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser({ uid: session.user.id, email: session.user.email || undefined })
      } else {
        setCurrentUser(null)
      }
      setLoading(false)
    })

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (data.session?.user) {
          setCurrentUser({ uid: data.session.user.id, email: data.session.user.email || undefined })
        }
      })
      .finally(() => setLoading(false))

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  const value = { currentUser, login, signup, logout, loading }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}