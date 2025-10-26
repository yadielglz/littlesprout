import { useEffect } from 'react'
import { useStore } from '../store/store'

export const useDarkMode = () => {
  const { isDarkMode } = useStore()

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])
}

