import { motion } from 'framer-motion';

interface ValueDisplayCardProps {
  label: string;
  value: string;
  icon: string;
  color: string;
  onClick?: () => void;
}

const ValueDisplayCard = ({ label, value, icon, color, onClick }: ValueDisplayCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex flex-col items-center justify-center text-center p-4 rounded-2xl text-white shadow-lg bg-gradient-to-br ${color} min-h-[140px] cursor-pointer`}
    >
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm font-semibold">{label}</div>
    </motion.div>
  );
};

export default ValueDisplayCard; 