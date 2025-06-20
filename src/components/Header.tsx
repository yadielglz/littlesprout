import { useStore } from '../store/store'
import { calculateAge } from '../utils/initialization'
import ClockWeather from './ClockWeather'

const Header = () => {
  const { getCurrentProfile } = useStore()
  const profile = getCurrentProfile()

  if (!profile) {
    return null
  }

  return (
    <>
      {/* Mobile-only Sprout Icon */}
      <div className="sm:hidden flex justify-center items-center py-4 bg-white dark:bg-gray-800">
        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
          <span className="text-xl">🌱</span>
        </div>
      </div>

      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Hello, {profile.userName}!
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {profile.babyName} is {calculateAge(profile.dob)}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Sprout Icon for larger screens */}
              <div className="hidden sm:flex w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full items-center justify-center">
                <span className="text-xl">🌱</span>
              </div>
              <ClockWeather />
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

export default Header 