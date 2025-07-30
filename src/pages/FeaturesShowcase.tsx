import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/store';
import { 
  Heart, 
  Users, 
  Camera, 
  StickyNote, 
  Trophy, 
  Pill, 
  AlertTriangle, 
  TrendingUp,
  Star,
  Gift,
  Sparkles,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import FamilySharing from '../components/FamilySharing';
import PhotoTimeline from '../components/PhotoTimeline';
import QuickNotesWidget from '../components/QuickNotesWidget';
import AchievementSystem from '../components/AchievementSystem';
import MedicationTracker from '../components/MedicationTracker';
import SymptomTracker from '../components/SymptomTracker';
import GrowthPercentileChart from '../components/GrowthPercentileChart';

const FeaturesShowcase = () => {
  const { getCurrentProfile } = useStore();
  const profile = getCurrentProfile();

  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const features = [
    {
      id: 'health-tracking',
      title: 'Enhanced Health & Medical Tracking',
      description: 'Comprehensive health monitoring with medication tracking, symptom logging, and WHO growth charts',
      icon: Heart,
      color: 'from-red-500 to-pink-500',
      items: [
        'Medication tracker with dosing schedules',
        'Symptom tracker with photo documentation',
        'WHO/CDC growth percentile charts',
        'Temperature and vital signs monitoring',
        'Vaccination record keeping'
      ],
      component: 'health'
    },
    {
      id: 'family-collaboration',
      title: 'Family Sharing & Collaboration',
      description: 'Share your baby\'s journey with family members and caregivers with role-based permissions',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      items: [
        'Invite family members and caregivers',
        'Role-based permissions (Owner, Parent, Caregiver, Viewer)',
        'Real-time data synchronization',
        'Secure invitation system',
        'Activity sharing and collaboration'
      ],
      component: 'family'
    },
    {
      id: 'photo-timeline',
      title: 'Photo Timeline & Memories',
      description: 'Capture and organize precious moments with milestone tracking and smart organization',
      icon: Camera,
      color: 'from-purple-500 to-pink-500',
      items: [
        'Visual milestone timeline',
        'Photo tagging and categorization',
        'Age calculation at photo time',
        'Favorite photos collection',
        'Easy sharing and downloading'
      ],
      component: 'photos'
    },
    {
      id: 'quick-notes',
      title: 'Quick Notes & Observations',
      description: 'Capture quick thoughts, observations, and important notes with colorful sticky notes',
      icon: StickyNote,
      color: 'from-yellow-500 to-orange-500',
      items: [
        'Colorful sticky note interface',
        'Pin important notes',
        'Quick capture and editing',
        'Automatic activity logging',
        'Search and organize notes'
      ],
      component: 'notes'
    },
    {
      id: 'achievements',
      title: 'Achievement System & Gamification',
      description: 'Stay motivated with achievements, streaks, and progress tracking',
      icon: Trophy,
      color: 'from-purple-500 to-indigo-500',
      items: [
        'Achievement badges and points',
        'Tracking consistency streaks',
        'Progress milestones',
        'Different difficulty levels',
        'Celebration animations'
      ],
      component: 'achievements'
    },
    {
      id: 'enhanced-ux',
      title: 'Enhanced User Experience',
      description: 'Improved interface with better navigation, animations, and accessibility',
      icon: Sparkles,
      color: 'from-green-500 to-teal-500',
      items: [
        'Smooth animations and transitions',
        'Improved mobile responsiveness',
        'Dark mode support',
        'Better accessibility features',
        'Intuitive navigation'
      ],
      component: null
    }
  ];

  const renderFeatureComponent = () => {
    switch (activeFeature) {
      case 'health':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Medication Tracker</h3>
                <MedicationTracker />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Symptom Tracker</h3>
                <SymptomTracker />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Growth Charts</h3>
              <GrowthPercentileChart measurementType="weight" gender="boy" />
            </div>
          </div>
        );
      case 'family':
        return <FamilySharing />;
      case 'photos':
        return <PhotoTimeline />;
      case 'notes':
        return <QuickNotesWidget />;
      case 'achievements':
        return <AchievementSystem />;
      default:
        return null;
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            No Profile Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Please set up a profile to explore all the amazing features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-12 pb-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-white mb-4">
              ✨ New Features
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Discover all the amazing new capabilities we've added to make tracking {profile.babyName}'s journey even better
            </p>
          </motion.div>
        </div>

        {/* Feature Overview */}
        {!activeFeature && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group cursor-pointer"
                    onClick={() => feature.component && setActiveFeature(feature.component)}
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group-hover:border-transparent">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-purple-600 group-hover:to-pink-600">
                        {feature.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                        {feature.description}
                      </p>
                      
                      <ul className="space-y-2 mb-6">
                        {feature.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {feature.component && (
                        <div className="flex items-center text-purple-600 dark:text-purple-400 font-medium group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                          <span>Explore Feature</span>
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Stats Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center"
            >
              <h2 className="text-3xl font-bold mb-4">🎉 What's New in LittleSprout v6.0</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-3xl font-bold">6</div>
                  <div className="text-sm opacity-90">Major Features</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">15+</div>
                  <div className="text-sm opacity-90">New Components</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">50+</div>
                  <div className="text-sm opacity-90">Improvements</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">100%</div>
                  <div className="text-sm opacity-90">More Awesome</div>
                </div>
              </div>
            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Ready to explore?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Click on any feature above to dive in and start using these amazing new capabilities!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => setActiveFeature('health')}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Try Health Tracking
                </button>
                <button
                  onClick={() => setActiveFeature('family')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Invite Family
                </button>
                <button
                  onClick={() => setActiveFeature('achievements')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center"
                >
                  <Trophy className="w-5 h-5 mr-2" />
                  View Achievements
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Feature Detail View */}
        {activeFeature && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveFeature(null)}
                className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Back to Features
              </button>
              
              <div className="text-right">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {features.find(f => f.component === activeFeature)?.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {features.find(f => f.component === activeFeature)?.description}
                </p>
              </div>
            </div>

            <div className="bg-white/95 dark:bg-gray-800/95 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              {renderFeatureComponent()}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FeaturesShowcase;