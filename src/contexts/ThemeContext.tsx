import React, { createContext, useContext, useEffect } from 'react'
import { useStore } from '../store/store'

const ThemeContext = createContext<{ isDarkMode: boolean; toggleDarkMode: () => void }>({
  isDarkMode: false,
  toggleDarkMode: () => {},
})

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDarkMode, toggleDarkMode } = useStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext) 