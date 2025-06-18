import React, { createContext, useContext, useEffect, useState } from 'react'
import { useStore } from '../store/store'
import { saveData } from '../utils/storage'

interface DataContextType {
  customActivities: any[]
  achievedMilestones: Record<string, any[]>
}

const DataContext = createContext<DataContextType>({
  customActivities: [],
  achievedMilestones: {},
})

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { customActivities, achievedMilestones } = useStore()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setError(null)
    try {
      // Data is loaded through Zustand persist middleware
    } catch (err) {
      setError('Failed to load data')
    }
  }, [])

  useEffect(() => {
    saveData({ customActivities, achievedMilestones })
  }, [customActivities, achievedMilestones])

  return (
    <DataContext.Provider value={{ customActivities, achievedMilestones }}>
      {error && <div className="text-red-500">{error}</div>}
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext) 