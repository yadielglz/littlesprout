import { motion } from 'framer-motion'

interface HealthGrowthCardProps {
  onLogGrowth: () => void;
  onLogTemp: () => void;
}

const HealthGrowthCard = ({ onLogGrowth, onLogTemp }: HealthGrowthCardProps) => {
  const actions = [
    { label: 'Weight & Height', icon: '📏', action: onLogGrowth, color: 'from-red-400 to-red-500' },
    { label: 'Temperature', icon: '🌡️', action: onLogTemp, color: 'from-purple-400 to-purple-500' },
  ];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/20 dark:border-gray-700/50 h-full"
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
          Health & Growth
        </h2>
        <div className="text-xl sm:text-2xl">❤️‍🩹</div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
        {actions.map((action) => (
          <motion.button
            key={action.label}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={action.action}
            className={`flex flex-col items-center justify-center text-center p-3 sm:p-4 rounded-2xl text-white shadow-lg bg-gradient-to-br ${action.color} min-h-[90px] sm:min-h-[100px]`}
          >
            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{action.icon}</div>
            <div className="text-xs sm:text-sm font-semibold">{action.label}</div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default HealthGrowthCard; 