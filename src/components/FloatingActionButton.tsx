import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

export interface ActionItem {
  id: string;
  label: string;
  icon: string;
  color: string;
  category: 'care' | 'health' | 'schedule' | 'other';
  action: () => void;
  requiresTimer?: boolean;
}

interface FloatingActionButtonProps {
  actions: ActionItem[];
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  onActionSelect?: (action: ActionItem) => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  actions,
  position = 'bottom-right',
  onActionSelect
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const fabRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedCategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Group actions by category
  const groupedActions = actions.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, ActionItem[]>);

  const categories = {
    care: { label: 'Daily Care', icon: '🍼', color: 'bg-blue-500' },
    health: { label: 'Health & Growth', icon: '🏥', color: 'bg-green-500' },
    schedule: { label: 'Schedule', icon: '📅', color: 'bg-purple-500' },
    other: { label: 'Other', icon: '⚡', color: 'bg-orange-500' }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'bottom-20 right-4 sm:bottom-24 sm:right-6';
      case 'bottom-left':
        return 'bottom-20 left-4 sm:bottom-24 sm:left-6';
      case 'top-right':
        return 'top-4 right-4 sm:top-6 sm:right-6';
      case 'top-left':
        return 'top-4 left-4 sm:top-6 sm:left-6';
      default:
        return 'bottom-20 right-4 sm:bottom-24 sm:right-6';
    }
  };

  const getMenuDirection = () => {
    if (position.includes('bottom')) return 'up';
    return 'down';
  };

  const handleActionClick = (action: ActionItem) => {
    action.action();
    if (onActionSelect) {
      onActionSelect(action);
    }
    setIsOpen(false);
    setSelectedCategory(null);
  };

  const renderCategoryView = () => {
    if (!selectedCategory) return null;
    
    const categoryActions = groupedActions[selectedCategory] || [];
    const direction = getMenuDirection();
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`absolute ${direction === 'up' ? 'bottom-14 sm:bottom-16' : 'top-14 sm:top-16'} ${
          position.includes('right') ? 'right-0' : 'left-0'
        } w-60 sm:w-64 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden`}
      >
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-white">
              {categories[selectedCategory as keyof typeof categories]?.label}
            </h3>
            <button
              onClick={() => setSelectedCategory(null)}
              className="p-1.5 sm:p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
        
        <div className="max-h-56 sm:max-h-64 overflow-y-auto">
          {categoryActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              className="w-full flex items-center p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-h-[60px] sm:min-h-[64px]"
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${action.color} flex items-center justify-center mr-2 sm:mr-3`}>
                <span className="text-white text-sm sm:text-lg">{action.icon}</span>
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium text-sm sm:text-base text-gray-800 dark:text-white truncate">{action.label}</p>
                {action.requiresTimer && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">With timer</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderCategoryGrid = () => {
    const direction = getMenuDirection();
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`absolute ${direction === 'up' ? 'bottom-14 sm:bottom-16' : 'top-14 sm:top-16'} ${
          position.includes('right') ? 'right-0' : 'left-0'
        } w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-white">Quick Actions</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Select a category to get started</p>
        </div>
        
        <div className="p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {Object.entries(categories).map(([key, category]) => {
              const actionsInCategory = groupedActions[key] || [];
              if (actionsInCategory.length === 0) return null;
              
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`${category.color} text-white p-3 sm:p-4 rounded-lg sm:rounded-xl hover:opacity-90 transition-opacity relative overflow-hidden min-h-[80px] sm:min-h-[90px]`}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-xl sm:text-2xl mb-1 sm:mb-2">{category.icon}</span>
                    <span className="font-medium text-xs sm:text-sm">{category.label}</span>
                    <span className="text-xs opacity-80 mt-0.5 sm:mt-1">
                      {actionsInCategory.length} actions
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10"></div>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div ref={fabRef} className={`fixed ${getPositionClasses()} z-50`}>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            style={{ zIndex: -1 }}
          />
        )}
      </AnimatePresence>

      {/* Action Menu */}
      <AnimatePresence>
        {isOpen && (
          selectedCategory ? renderCategoryView() : renderCategoryGrid()
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <motion.button
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg text-white flex items-center justify-center ${
          isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
        } transition-colors`}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setSelectedCategory(null);
          }
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Plus className="w-5 h-5 sm:w-6 sm:h-6" />}
        </motion.div>
      </motion.button>
    </div>
  );
};

export default FloatingActionButton; 