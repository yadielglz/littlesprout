import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/store'
import Navigation from './components/Navigation'
import Dashboard from './pages/Dashboard'
import ActivityLog from './pages/ActivityLog'
import Charts from './pages/Charts'
import Settings from './pages/Settings'
import Welcome from './pages/Welcome'

function App() {
  const { profiles } = useStore()
  const hasProfiles = profiles.length > 0

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {hasProfiles ? (
          <>
            <Navigation />
            <div className="md:ml-16 pt-4 pb-20 md:pb-4 px-4">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/activity-log" element={<ActivityLog />} />
                <Route path="/charts" element={<Charts />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </>
        ) : (
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  )
}

export default App