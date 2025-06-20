import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  BarChart2, 
  BookOpen, 
  Settings, 
  LogIn, 
  LogOut, 
  User, 
  Zap, 
  Wifi,
} from 'lucide-react';
import { useFirebaseStore } from '../store/firebaseStore';
import toast from 'react-hot-toast';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const { syncWithFirebase } = useFirebaseStore();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/activity-log', label: 'Activities', icon: BarChart2 },
    { path: '/charts', label: 'Charts', icon: BookOpen },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error('Logout failed: ' + error.message);
    }
  };

  const handleSync = async () => {
    if (!currentUser) {
      toast.error('You must be logged in to sync data.');
      return;
    }
    try {
      await syncWithFirebase(currentUser.uid);
      toast.success('Data synced with cloud');
    } catch (error: any) {
      toast.error('Sync failed: ' + error.message);
    }
  };

  return (
    <>
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                isActive(path)
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* User Status Bar */}
      {currentUser && (
        <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white px-4 py-2 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium truncate">
                {currentUser.email}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSync}
                className="p-1 rounded hover:bg-blue-700 transition-colors"
                title="Sync with cloud"
              >
                <Wifi className="w-4 h-4" />
              </button>
              <button
                onClick={handleLogout}
                className="p-1 rounded hover:bg-blue-700 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Spacer for Navigation */}
      <div className="h-16"></div>
      
      {/* Top Spacer for User Bar */}
      {currentUser && <div className="h-10"></div>}
    </>
  );
};

export default BottomNavigation; 