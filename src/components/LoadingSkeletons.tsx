import { motion } from 'framer-motion';

export const SkeletonCard = () => (
  <motion.div
    className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm animate-pulse"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  </motion.div>
);

export const SkeletonList = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
);

export const SkeletonProfile = () => (
  <motion.div
    className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm animate-pulse"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-center space-x-4 mb-4">
      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      <div className="flex-1">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  </motion.div>
);

export const SkeletonChart = () => (
  <motion.div
    className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm animate-pulse"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
  </motion.div>
);

export const SkeletonText = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, index) => (
      <div
        key={index}
        className={`h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${
          index === lines - 1 ? 'w-2/3' : 'w-full'
        }`}
      ></div>
    ))}
  </div>
);

export const SkeletonButton = () => (
  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
);

export const SkeletonStats = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {Array.from({ length: 3 }).map((_, index) => (
      <motion.div
        key={index}
        className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm animate-pulse"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-1"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </motion.div>
    ))}
  </div>
);

export const SkeletonHeader = () => (
  <motion.div
    className="bg-white dark:bg-gray-800 shadow-sm p-4 animate-pulse"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
      </div>
      <div className="flex space-x-2">
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  </motion.div>
);

export const SkeletonActivityLog = () => (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, index) => (
      <motion.div
        key={index}
        className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm animate-pulse"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

export default {
  SkeletonCard,
  SkeletonList,
  SkeletonProfile,
  SkeletonChart,
  SkeletonText,
  SkeletonButton,
  SkeletonStats,
  SkeletonHeader,
  SkeletonActivityLog,
}; 