export const initializeApp = async () => {
  // Placeholder for any async initialization logic
  return Promise.resolve()
}

export const generateId = () =>
  Math.random().toString(36).substr(2, 9) + Date.now().toString(36)

// Re-export the more robust age calculation function from datetime utils
export { calculateAgeSafe as calculateAge } from './datetime' 