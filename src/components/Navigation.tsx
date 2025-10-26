import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/store';
import { BarChart3, FileText, TrendingUp, Settings } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen } = useStore();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <BarChart3 className="w-6 h-6" /> },
    { path: '/activity-log', label: 'Activity Log', icon: <FileText className="w-6 h-6" /> },
    { path: '/charts', label: 'Charts', icon: <TrendingUp className="w-6 h-6" /> },
    { path: '/settings', label: 'Settings', icon: <Settings className="w-6 h-6" /> },
  ];

  return (
    <nav className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 z-50 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
      <div className="flex flex-col h-full">
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && <span className="text-xl font-bold dark:text-white">LittleSprout</span>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {navItems.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center p-4 ${
                isActive(path)
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {icon}
              {sidebarOpen && <span className="ml-3">{label}</span>}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 