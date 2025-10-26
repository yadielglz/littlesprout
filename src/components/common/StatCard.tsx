import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  icon: string | React.ReactNode;
  label: string;
  value: string | number;
  color?: 'blue' | 'indigo' | 'amber' | 'green' | 'red' | 'purple' | 'slate';
  onClick?: () => void;
  children?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  label, 
  value, 
  color = 'blue',
  onClick,
  children 
}) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-white',
    indigo: 'bg-indigo-500 text-white',
    amber: 'bg-amber-500 text-white',
    green: 'bg-green-500 text-white',
    red: 'bg-red-500 text-white',
    purple: 'bg-purple-500 text-white',
    slate: 'bg-slate-600 text-white'
  };

  return (
    <motion.div 
      whileHover={{ scale: onClick ? 1.02 : 1 }}
      whileTap={{ scale: onClick ? 0.98 : 1 }}
      onClick={onClick}
      className={`${colorClasses[color]} rounded-xl p-6 shadow-md cursor-pointer transition-shadow hover:shadow-lg flex flex-col items-center justify-center min-h-[120px]`}
    >
      <div className="mb-2 flex items-center justify-center">
        {typeof icon === 'string' ? (
          <span className="text-4xl">{icon}</span>
        ) : (
          icon
        )}
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm opacity-90 font-medium">{label}</div>
      {children}
    </motion.div>
  );
};

export default StatCard;

