import React from 'react';
import { 
  Baby, 
  Droplet, 
  Moon, 
  BedDouble,
  Clock,
  Shield,
  Droplets,
  Pill,
  Scale,
  Ruler,
  Thermometer,
  Syringe,
  FileText,
  Calendar,
  Bell
} from 'lucide-react';

export const IconMap: Record<string, React.ReactNode> = {
  // Care actions
  'feed': <Baby className="w-5 h-5" />,
  'diaper': <Droplet className="w-5 h-5" />,
  'sleep': <Moon className="w-5 h-5" />,
  'nap': <BedDouble className="w-5 h-5" />,
  'tummy': <Clock className="w-5 h-5" />,
  'helmet': <Shield className="w-5 h-5" />,
  'shower': <Droplets className="w-5 h-5" />,
  
  // Health actions
  'medication': <Pill className="w-5 h-5" />,
  'weight': <Scale className="w-5 h-5" />,
  'height': <Ruler className="w-5 h-5" />,
  'temperature': <Thermometer className="w-5 h-5" />,
  'vaccine': <Syringe className="w-5 h-5" />,
  'health': <FileText className="w-5 h-5" />,
  
  // Schedule actions
  'appointment': <Calendar className="w-5 h-5" />,
  'reminder': <Bell className="w-5 h-5" />,
  
  // Category icons (larger for category display)
  'category_care': <Baby className="w-6 h-6" />,
  'category_health': <FileText className="w-6 h-6" />,
  'category_schedule': <Calendar className="w-6 h-6" />,
  'category_other': <Bell className="w-6 h-6" />
};

export const getIcon = (type: string): React.ReactNode => {
  return IconMap[type] || <FileText className="w-5 h-5" />;
};

export const getEmojiIcon = (type: string): string => {
  const emojiMap: Record<string, string> = {
    'feed': '🍼',
    'diaper': '👶',
    'sleep': '😴',
    'nap': '🛏️',
    'tummy': '⏱️',
    'helmet': '🪖',
    'shower': '🚿',
    'medication': '💊',
    'weight': '⚖️',
    'height': '📏',
    'temperature': '🌡️',
    'vaccine': '💉',
    'health': '📝',
    'appointment': '📅',
    'reminder': '🔔'
  };
  return emojiMap[type] || '📝';
};

