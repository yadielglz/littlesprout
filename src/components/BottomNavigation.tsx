import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  BarChart2,
  Settings,
  Heart,
} from 'lucide-react';

const BottomNavigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/activity-log', label: 'Activities', icon: BarChart2 },
    { path: '/health', label: 'Health', icon: Heart },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

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

      {/* Bottom Spacer for Navigation */}
      <div className="h-16"></div>
      
    </>
  );
};

export default BottomNavigation; 