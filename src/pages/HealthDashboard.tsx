import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/store';
import { Heart, Pill, AlertTriangle, TrendingUp, FileText, Activity } from 'lucide-react';
import MedicationTracker from '../components/MedicationTracker';
import SymptomTracker from '../components/SymptomTracker';
import GrowthPercentileChart from '../components/GrowthPercentileChart';

const HealthDashboard = () => {
  const { getCurrentProfile, getCurrentLogs } = useStore();
  const profile = getCurrentProfile();
  const logs = getCurrentLogs();

  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Heart },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'symptoms', label: 'Symptoms', icon: AlertTriangle },
    { id: 'growth', label: 'Growth Charts', icon: TrendingUp },
    { id: 'records', label: 'Medical Records', icon: FileText }
  ];

  // Calculate health stats
  const healthStats = React.useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentLogs = logs.filter(log => new Date(log.timestamp) >= thirtyDaysAgo);
    const weeklyLogs = logs.filter(log => new Date(log.timestamp) >= sevenDaysAgo);

    const medicationLogs = recentLogs.filter(log => log.type === 'medication');
    // const healthLogs = recentLogs.filter(log => log.type === 'health');
    const temperatureLogs = recentLogs.filter(log => log.type === 'temperature');
    const vaccineLogs = recentLogs.filter(log => log.type === 'vaccine');
    const weightLogs = logs.filter(log => log.type === 'weight').sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const heightLogs = logs.filter(log => log.type === 'height').sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      medicationsThisMonth: medicationLogs.length,
      symptomsThisWeek: weeklyLogs.filter(log => log.type === 'health').length,
      lastTemperature: temperatureLogs.length > 0 ? temperatureLogs[temperatureLogs.length - 1] : null,
      vaccinesTotal: vaccineLogs.length,
      latestWeight: weightLogs[0] || null,
      latestHeight: heightLogs[0] || null,
      totalHealthRecords: recentLogs.length
    };
  }, [logs]);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Health Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Medications (30d)</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {healthStats.medicationsThisMonth}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Pill className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Symptoms (7d)</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {healthStats.symptomsThisWeek}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Vaccines</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {healthStats.vaccinesTotal}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Health Records</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {healthStats.totalHealthRecords}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Latest Measurements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Latest Measurements
          </h3>
          <div className="space-y-4">
            {healthStats.latestWeight && (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Weight</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(healthStats.latestWeight.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800 dark:text-white">
                    {healthStats.latestWeight.details}
                  </p>
                </div>
              </div>
            )}

            {healthStats.latestHeight && (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Height</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(healthStats.latestHeight.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800 dark:text-white">
                    {healthStats.latestHeight.details}
                  </p>
                </div>
              </div>
            )}

            {healthStats.lastTemperature && (
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Temperature</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(healthStats.lastTemperature.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800 dark:text-white">
                    {healthStats.lastTemperature.details}
                  </p>
                </div>
              </div>
            )}

            {!healthStats.latestWeight && !healthStats.latestHeight && !healthStats.lastTemperature && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent measurements</p>
                <p className="text-sm">Start tracking health data to see insights here</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Recent Health Activity
          </h3>
          <div className="space-y-3">
            {logs
              .filter(log => ['medication', 'health', 'temperature', 'vaccine', 'weight', 'height'].includes(log.type))
              .slice(0, 5)
              .map(log => (
                <div key={log.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-2xl">{log.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-white capitalize">
                      {log.type}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {log.details}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            
            {logs.filter(log => ['medication', 'health', 'temperature', 'vaccine', 'weight', 'height'].includes(log.type)).length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No health activity yet</p>
                <p className="text-sm">Health records will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Quick Health Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('medications')}
            className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Pill className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800 dark:text-white">Add Medication</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Track medications and doses</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('symptoms')}
            className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800 dark:text-white">Log Symptom</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Record health symptoms</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('growth')}
            className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800 dark:text-white">View Growth</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Check growth percentiles</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderGrowthTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GrowthPercentileChart measurementType="weight" gender="boy" />
        <GrowthPercentileChart measurementType="height" gender="boy" />
      </div>
    </div>
  );

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            No Profile Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Please set up a profile to access health tracking features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-12 pb-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-4 lg:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-1">
            Health Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Comprehensive health tracking for {profile.babyName}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-6 lg:mb-8 bg-white/90 dark:bg-gray-800/90 rounded-2xl p-2 shadow-lg border border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors text-sm sm:text-base ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-white/95 dark:bg-gray-800/95 rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'medications' && <MedicationTracker />}
            {activeTab === 'symptoms' && <SymptomTracker />}
            {activeTab === 'growth' && renderGrowthTab()}
            {activeTab === 'records' && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Medical Records</h3>
                <p>Document storage and medical records management coming soon!</p>
                <p className="text-sm mt-2">This feature will be available when Firebase Storage is enabled.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;