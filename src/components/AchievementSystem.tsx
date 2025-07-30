import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/store';
import { Trophy, Star, Target, Award, Gift, Lock, CheckCircle, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'tracking' | 'milestones' | 'consistency' | 'health' | 'social' | 'special';
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  requirement: {
    type: 'count' | 'streak' | 'milestone' | 'time' | 'special';
    target: number;
    metric: string;
  };
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

export interface UserStats {
  totalLogs: number;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  achievementsUnlocked: number;
  daysActive: number;
  favoriteActivity: string;
  weeklyGoalsMet: number;
}

const AchievementSystem: React.FC = () => {
  const { getCurrentProfile, getCurrentLogs } = useStore();
  const profile = getCurrentProfile();
  const logs = getCurrentLogs();

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalLogs: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalPoints: 0,
    achievementsUnlocked: 0,
    daysActive: 0,
    favoriteActivity: '',
    weeklyGoalsMet: 0
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCelebration, setShowCelebration] = useState<Achievement | null>(null);

  // Define all achievements
  const allAchievements: Omit<Achievement, 'isUnlocked' | 'unlockedAt' | 'progress' | 'maxProgress'>[] = [
    // Tracking Achievements
    {
      id: 'first_log',
      title: 'Getting Started',
      description: 'Log your first activity',
      icon: '🌱',
      category: 'tracking',
      difficulty: 'bronze',
      points: 10,
      requirement: { type: 'count', target: 1, metric: 'total_logs' }
    },
    {
      id: 'dedicated_tracker',
      title: 'Dedicated Tracker',
      description: 'Log 50 activities',
      icon: '📊',
      category: 'tracking',
      difficulty: 'silver',
      points: 50,
      requirement: { type: 'count', target: 50, metric: 'total_logs' }
    },
    {
      id: 'super_tracker',
      title: 'Super Tracker',
      description: 'Log 200 activities',
      icon: '🏆',
      category: 'tracking',
      difficulty: 'gold',
      points: 100,
      requirement: { type: 'count', target: 200, metric: 'total_logs' }
    },
    {
      id: 'master_tracker',
      title: 'Master Tracker',
      description: 'Log 500 activities',
      icon: '👑',
      category: 'tracking',
      difficulty: 'platinum',
      points: 250,
      requirement: { type: 'count', target: 500, metric: 'total_logs' }
    },

    // Consistency Achievements
    {
      id: 'consistent_week',
      title: 'Consistent Week',
      description: 'Log activities for 7 days in a row',
      icon: '🔥',
      category: 'consistency',
      difficulty: 'bronze',
      points: 25,
      requirement: { type: 'streak', target: 7, metric: 'daily_streak' }
    },
    {
      id: 'consistent_month',
      title: 'Consistent Month',
      description: 'Log activities for 30 days in a row',
      icon: '⚡',
      category: 'consistency',
      difficulty: 'silver',
      points: 75,
      requirement: { type: 'streak', target: 30, metric: 'daily_streak' }
    },
    {
      id: 'consistency_champion',
      title: 'Consistency Champion',
      description: 'Log activities for 100 days in a row',
      icon: '🌟',
      category: 'consistency',
      difficulty: 'gold',
      points: 200,
      requirement: { type: 'streak', target: 100, metric: 'daily_streak' }
    },

    // Health Achievements
    {
      id: 'health_conscious',
      title: 'Health Conscious',
      description: 'Log 10 health-related activities',
      icon: '❤️',
      category: 'health',
      difficulty: 'bronze',
      points: 30,
      requirement: { type: 'count', target: 10, metric: 'health_logs' }
    },
    {
      id: 'growth_tracker',
      title: 'Growth Tracker',
      description: 'Log 5 weight or height measurements',
      icon: '📏',
      category: 'health',
      difficulty: 'silver',
      points: 40,
      requirement: { type: 'count', target: 5, metric: 'growth_logs' }
    },

    // Milestone Achievements
    {
      id: 'milestone_recorder',
      title: 'Milestone Recorder',
      description: 'Record your first milestone',
      icon: '🎉',
      category: 'milestones',
      difficulty: 'bronze',
      points: 20,
      requirement: { type: 'count', target: 1, metric: 'milestone_logs' }
    },
    {
      id: 'memory_keeper',
      title: 'Memory Keeper',
      description: 'Record 10 milestones',
      icon: '📸',
      category: 'milestones',
      difficulty: 'silver',
      points: 60,
      requirement: { type: 'count', target: 10, metric: 'milestone_logs' }
    },

    // Special Achievements
    {
      id: 'early_bird',
      title: 'Early Bird',
      description: 'Log an activity before 6 AM',
      icon: '🌅',
      category: 'special',
      difficulty: 'bronze',
      points: 15,
      requirement: { type: 'special', target: 1, metric: 'early_morning_log' }
    },
    {
      id: 'night_owl',
      title: 'Night Owl',
      description: 'Log an activity after 10 PM',
      icon: '🦉',
      category: 'special',
      difficulty: 'bronze',
      points: 15,
      requirement: { type: 'special', target: 1, metric: 'late_night_log' }
    },
    {
      id: 'weekend_warrior',
      title: 'Weekend Warrior',
      description: 'Log activities on both weekend days',
      icon: '🎯',
      category: 'special',
      difficulty: 'silver',
      points: 35,
      requirement: { type: 'special', target: 1, metric: 'weekend_both_days' }
    }
  ];

  const categoryConfig = {
    all: { label: 'All', icon: Trophy, color: 'text-gray-600' },
    tracking: { label: 'Tracking', icon: Target, color: 'text-blue-600' },
    consistency: { label: 'Consistency', icon: TrendingUp, color: 'text-green-600' },
    health: { label: 'Health', icon: Award, color: 'text-red-600' },
    milestones: { label: 'Milestones', icon: Star, color: 'text-purple-600' },
    special: { label: 'Special', icon: Gift, color: 'text-orange-600' }
  };

  const difficultyConfig = {
    bronze: { color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/20', label: 'Bronze' },
    silver: { color: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20', label: 'Silver' },
    gold: { color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20', label: 'Gold' },
    platinum: { color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20', label: 'Platinum' }
  };

  // Calculate user stats and achievement progress
  useEffect(() => {
    if (!profile || !logs.length) return;

    // Calculate basic stats
    const totalLogs = logs.length;
    const healthLogs = logs.filter(log => ['health', 'temperature', 'weight', 'height', 'vaccine', 'medication'].includes(log.type)).length;
    const growthLogs = logs.filter(log => ['weight', 'height'].includes(log.type)).length;
    const milestoneLogs = logs.filter(log => log.type === 'milestone' || log.type === 'health').length;

    // Calculate streaks
    const sortedLogs = [...logs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const logDates = Array.from(new Set(sortedLogs.map(log => new Date(log.timestamp).toDateString())));
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateString = checkDate.toDateString();
      
      if (logDates.includes(dateString)) {
        tempStreak++;
        if (i === 0 || (i > 0 && tempStreak > currentStreak)) {
          currentStreak = tempStreak;
        }
      } else {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        if (i === 0) {
          currentStreak = 0;
        }
        tempStreak = 0;
      }
    }

    // Calculate activity frequency
    const activityCounts = logs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const favoriteActivity = Object.entries(activityCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    const stats: UserStats = {
      totalLogs,
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      totalPoints: 0, // Will be calculated after achievements
      achievementsUnlocked: 0, // Will be calculated after achievements
      daysActive: logDates.length,
      favoriteActivity,
      weeklyGoalsMet: Math.floor(currentStreak / 7)
    };

    // Calculate achievement progress
    const updatedAchievements = allAchievements.map(achievement => {
      let progress = 0;
      let maxProgress = achievement.requirement.target;
      let isUnlocked = false;

      switch (achievement.requirement.metric) {
        case 'total_logs':
          progress = totalLogs;
          break;
        case 'daily_streak':
          progress = stats.longestStreak;
          break;
        case 'health_logs':
          progress = healthLogs;
          break;
        case 'growth_logs':
          progress = growthLogs;
          break;
        case 'milestone_logs':
          progress = milestoneLogs;
          break;
        case 'early_morning_log':
          progress = logs.filter(log => new Date(log.timestamp).getHours() < 6).length > 0 ? 1 : 0;
          break;
        case 'late_night_log':
          progress = logs.filter(log => new Date(log.timestamp).getHours() >= 22).length > 0 ? 1 : 0;
          break;
        case 'weekend_both_days':
          const weekendLogs = logs.filter(log => {
            const day = new Date(log.timestamp).getDay();
            return day === 0 || day === 6; // Sunday or Saturday
          });
          const weekendDays = new Set(weekendLogs.map(log => new Date(log.timestamp).toDateString()));
          const hasWeekendPair = Array.from(weekendDays).some(dateStr => {
            const date = new Date(dateStr);
            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);
            const prevDay = new Date(date);
            prevDay.setDate(date.getDate() - 1);
            
            return weekendDays.has(nextDay.toDateString()) || weekendDays.has(prevDay.toDateString());
          });
          progress = hasWeekendPair ? 1 : 0;
          break;
      }

      isUnlocked = progress >= maxProgress;

      return {
        ...achievement,
        progress: Math.min(progress, maxProgress),
        maxProgress,
        isUnlocked,
        unlockedAt: isUnlocked ? new Date() : undefined
      };
    });

    // Update stats with achievement data
    const unlockedAchievements = updatedAchievements.filter(a => a.isUnlocked);
    stats.achievementsUnlocked = unlockedAchievements.length;
    stats.totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);

    setUserStats(stats);
    
    // Check for newly unlocked achievements
    const previouslyUnlocked = achievements.filter(a => a.isUnlocked).map(a => a.id);
    const newlyUnlocked = updatedAchievements.filter(a => 
      a.isUnlocked && !previouslyUnlocked.includes(a.id)
    );

    setAchievements(updatedAchievements);

    // Show celebration for newly unlocked achievements
    if (newlyUnlocked.length > 0) {
      newlyUnlocked.forEach((achievement, index) => {
        setTimeout(() => {
          setShowCelebration(achievement);
          toast.success(`🎉 Achievement Unlocked: ${achievement.title}!`);
        }, index * 1000);
      });
    }
  }, [logs, profile]);

  const filteredAchievements = achievements.filter(achievement => 
    selectedCategory === 'all' || achievement.category === selectedCategory
  );

  const unlockedAchievements = filteredAchievements.filter(a => a.isUnlocked);
  const lockedAchievements = filteredAchievements.filter(a => !a.isUnlocked);

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Achievement Center</h2>
            <p className="opacity-90">Track your parenting journey milestones</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{userStats.totalPoints}</div>
            <div className="text-sm opacity-90">Total Points</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold">{userStats.achievementsUnlocked}</div>
            <div className="text-sm opacity-90">Achievements</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{userStats.currentStreak}</div>
            <div className="text-sm opacity-90">Current Streak</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{userStats.totalLogs}</div>
            <div className="text-sm opacity-90">Total Logs</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{userStats.daysActive}</div>
            <div className="text-sm opacity-90">Days Active</div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(categoryConfig).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === key
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            Unlocked Achievements ({unlockedAchievements.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedAchievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-2 border-green-200 dark:border-green-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${difficultyConfig[achievement.difficulty].color}`}>
                      {difficultyConfig[achievement.difficulty].label}
                    </span>
                    <div className="flex items-center text-yellow-500">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      <span className="text-sm font-semibold">{achievement.points}</span>
                    </div>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
                  {achievement.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {achievement.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                  {achievement.unlockedAt && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {achievement.unlockedAt.toLocaleDateString()}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <Lock className="w-5 h-5 mr-2 text-gray-400" />
            In Progress ({lockedAchievements.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedAchievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl opacity-50">{achievement.icon}</div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${difficultyConfig[achievement.difficulty].color}`}>
                      {difficultyConfig[achievement.difficulty].label}
                    </span>
                    <div className="flex items-center text-gray-400">
                      <Star className="w-4 h-4 mr-1" />
                      <span className="text-sm">{achievement.points}</span>
                    </div>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
                  {achievement.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {achievement.description}
                </p>
                
                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{achievement.progress}/{achievement.maxProgress}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {achievement.maxProgress - achievement.progress} more to unlock
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Achievement Celebration Modal */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCelebration(null)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
                className="text-6xl mb-4"
              >
                {showCelebration.icon}
              </motion.div>
              
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Achievement Unlocked!
              </h2>
              
              <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400 mb-2">
                {showCelebration.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {showCelebration.description}
              </p>
              
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="flex items-center text-yellow-500">
                  <Star className="w-5 h-5 mr-1 fill-current" />
                  <span className="font-semibold">{showCelebration.points} points</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${difficultyConfig[showCelebration.difficulty].color}`}>
                  {difficultyConfig[showCelebration.difficulty].label}
                </span>
              </div>
              
              <button
                onClick={() => setShowCelebration(null)}
                className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Awesome!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AchievementSystem;