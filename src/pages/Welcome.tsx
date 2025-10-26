import { useState } from 'react'
import { useFirebaseStore } from '../store/firebaseStore'
import { useAuth } from '../contexts/AuthContext'
// @ts-ignore - Linter incorrectly flags this as unused
import { generateId, calculateAge } from '../utils/initialization'
import toast from 'react-hot-toast'

const Welcome = () => {
  const { createProfile } = useFirebaseStore()
  const { currentUser } = useAuth()
  const [formData, setFormData] = useState({
    userName: '',
    babyName: '',
    dob: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.userName || !formData.babyName || !formData.dob) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)
    
    try {
      if (!currentUser) {
        toast.error('You must be logged in to create a profile.');
        setIsLoading(false);
        return;
      }

      const newProfile = {
        id: generateId(),
        userName: formData.userName.trim(),
        babyName: formData.babyName.trim(),
        dob: formData.dob,
        createdAt: new Date().toISOString()
      }

      await createProfile(currentUser.uid, newProfile)
      
      toast.success(`Welcome ${formData.userName}! Let's start tracking ${formData.babyName}'s journey.`)
      
      // The navigation will happen automatically when the state updates
    } catch (error) {
      toast.error('Failed to create profile. Please try again.')
      console.error('Profile creation error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-slate-800">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">🌱</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Welcome to LittleSprout
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Let's get started tracking your little one's precious moments
          </p>
        </div>

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-white/20 dark:border-gray-700/50">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Your Name
              </label>
              <input
                type="text"
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Sarah"
                required
              />
            </div>

            <div>
              <label htmlFor="babyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Baby's Name
              </label>
              <input
                type="text"
                id="babyName"
                name="babyName"
                value={formData.babyName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Charlie"
                required
              />
            </div>

            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            {formData.dob && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {formData.babyName ? `${formData.babyName} is ` : 'Baby is '}
                  {calculateAge(formData.dob)}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-md font-medium hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? 'Creating Profile...' : 'Start Tracking'}
            </button>
          </form>
        </div>

        <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4">
          <div className="text-center p-3 sm:p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/50">
            <div className="text-xl sm:text-2xl mb-2">🍼</div>
            <h3 className="font-semibold text-xs sm:text-sm text-gray-800 dark:text-white">Feeding</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight">Track feeds & amounts</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/50">
            <div className="text-xl sm:text-2xl mb-2">😴</div>
            <h3 className="font-semibold text-xs sm:text-sm text-gray-800 dark:text-white">Sleep</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight">Monitor sleep patterns</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/50">
            <div className="text-xl sm:text-2xl mb-2">📏</div>
            <h3 className="font-semibold text-xs sm:text-sm text-gray-800 dark:text-white">Growth</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight">Weight & height tracking</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/50">
            <div className="text-xl sm:text-2xl mb-2">📊</div>
            <h3 className="font-semibold text-xs sm:text-sm text-gray-800 dark:text-white">Analytics</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight">View activity reports</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Welcome 