import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center p-4">
      <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-gray-100">404 - Page Not Found</h1>
      <p className="mb-6 text-gray-600 dark:text-gray-300">Sorry, the page you're looking for doesn't exist.</p>
      <Link to="/" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
        Go back home
      </Link>
    </div>
  )
} 