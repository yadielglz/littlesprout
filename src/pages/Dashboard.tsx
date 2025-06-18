import { useStore } from '../store/store'
import { calculateAge } from '../utils/initialization'

const Dashboard = () => {
  const { getCurrentProfile } = useStore()
  const profile = getCurrentProfile()

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            No Profile Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Please set up a profile to get started.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-slate-800">
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
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-xl">🌱</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-2">
                  🍼
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-white">Feed</span>
              </button>
              <button className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-2">
                  😴
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-white">Sleep</span>
              </button>
              <button className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mb-2">
                  👶
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-white">Diaper</span>
              </button>
              <button className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-2">
                  📏
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-white">Weight</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Today's Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Feeds</span>
                <span className="font-semibold text-gray-800 dark:text-white">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Sleep</span>
                <span className="font-semibold text-gray-800 dark:text-white">0h 0m</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Diapers</span>
                <span className="font-semibold text-gray-800 dark:text-white">0</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Recent Activity
            </h2>
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No activities logged yet
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                Start tracking to see your baby's journey
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
            Coming Soon - Enhanced Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 text-center">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Analytics</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Advanced charts and insights
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 text-center">
              <div className="text-3xl mb-2">🔔</div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Reminders</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Smart notifications
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 text-center">
              <div className="text-3xl mb-2">📱</div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-1">PWA</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Install as app
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 text-center">
              <div className="text-3xl mb-2">☁️</div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Sync</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Multi-device sync
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard 