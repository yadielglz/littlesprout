import React, { useMemo, useState } from 'react'
import { useStore } from '../store/store'
import { Heart, Pill, AlertTriangle, TrendingUp, FileText, Activity } from 'lucide-react'
import MedicationTracker from '../components/MedicationTracker'
import SymptomTracker from '../components/SymptomTracker'
import GrowthPercentileChart from '../components/GrowthPercentileChart'
import Card from '../components/common/Card'
import PageLayout from '../components/layout/PageLayout'

const HealthDashboard = () => {
  const { getCurrentProfile, getCurrentLogs } = useStore()
  const profile = getCurrentProfile()
  const logs = getCurrentLogs()

  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Heart },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'symptoms', label: 'Symptoms', icon: AlertTriangle },
    { id: 'growth', label: 'Growth', icon: TrendingUp },
    { id: 'records', label: 'Records', icon: FileText }
  ]

  const healthStats = useMemo(() => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const recentLogs = logs.filter((log) => new Date(log.timestamp) >= thirtyDaysAgo)
    const weeklyLogs = logs.filter((log) => new Date(log.timestamp) >= sevenDaysAgo)

    const medicationLogs = recentLogs.filter((log) => log.type === 'medication')
    const temperatureLogs = recentLogs.filter((log) => log.type === 'temperature')
    const vaccineLogs = recentLogs.filter((log) => log.type === 'vaccine')
    const weightLogs = logs
      .filter((log) => log.type === 'weight')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    const heightLogs = logs
      .filter((log) => log.type === 'height')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return {
      medicationsThisMonth: medicationLogs.length,
      symptomsThisWeek: weeklyLogs.filter((log) => log.type === 'health').length,
      lastTemperature: temperatureLogs.length > 0 ? temperatureLogs[temperatureLogs.length - 1] : null,
      vaccinesTotal: vaccineLogs.length,
      latestWeight: weightLogs[0] || null,
      latestHeight: heightLogs[0] || null,
      totalHealthRecords: recentLogs.length
    }
  }, [logs])

  const renderOverview = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Medications (30d)</p>
              <p className="text-2xl font-bold">{healthStats.medicationsThisMonth}</p>
            </div>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <Pill className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Symptoms (7d)</p>
              <p className="text-2xl font-bold">{healthStats.symptomsThisWeek}</p>
            </div>
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total vaccines</p>
              <p className="text-2xl font-bold">{healthStats.vaccinesTotal}</p>
            </div>
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
              <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Health records</p>
              <p className="text-2xl font-bold">{healthStats.totalHealthRecords}</p>
            </div>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="space-y-3">
          <h3 className="text-lg font-semibold">Latest measurements</h3>
          <div className="space-y-3">
            {healthStats.latestWeight && (
              <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">Weight</p>
                    <p className="text-xs text-gray-500">
                      {new Date(healthStats.latestWeight.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="font-semibold">{healthStats.latestWeight.details}</p>
              </div>
            )}

            {healthStats.latestHeight && (
              <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium">Height</p>
                    <p className="text-xs text-gray-500">
                      {new Date(healthStats.latestHeight.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="font-semibold">{healthStats.latestHeight.details}</p>
              </div>
            )}

            {healthStats.lastTemperature && (
              <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium">Temperature</p>
                    <p className="text-xs text-gray-500">
                      {new Date(healthStats.lastTemperature.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="font-semibold">{healthStats.lastTemperature.details}</p>
              </div>
            )}

            {!healthStats.latestWeight && !healthStats.latestHeight && !healthStats.lastTemperature && (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <Heart className="w-10 h-10 mx-auto mb-2 opacity-60" />
                <p>No recent measurements yet.</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-lg font-semibold">Recent health activity</h3>
          <div className="space-y-2">
            {logs
              .filter((log) => ['medication', 'health', 'temperature', 'vaccine', 'weight', 'height'].includes(log.type))
              .slice(0, 5)
              .map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
                >
                  <span className="text-2xl">{log.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium capitalize">{log.type}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{log.details}</p>
                    <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}

            {logs.filter((log) => ['medication', 'health', 'temperature', 'vaccine', 'weight', 'height'].includes(log.type)).length ===
              0 && (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <Activity className="w-10 h-10 mx-auto mb-2 opacity-60" />
                <p>No health activity yet.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="space-y-3">
        <h3 className="text-lg font-semibold">Quick health actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => setActiveTab('medications')}
            className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <Pill className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium">Add medication</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Track doses and schedules</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('symptoms')}
            className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="font-medium">Log symptom</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Keep a quick note</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('growth')}
            className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-medium">View growth</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Percentiles and trends</p>
            </div>
          </button>
        </div>
      </Card>
    </div>
  )

  const renderGrowthTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <GrowthPercentileChart measurementType="weight" gender="boy" />
        </Card>
        <Card>
          <GrowthPercentileChart measurementType="height" gender="boy" />
        </Card>
      </div>
    </div>
  )

  if (!profile) {
    return (
      <PageLayout title="Health" subtitle="Track vitals and health">
        <Card className="text-center space-y-2">
          <Heart className="w-10 h-10 mx-auto text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">Add a profile to start health tracking.</p>
        </Card>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Health" subtitle={`Health tracking for ${profile.babyName}`}>
      <Card className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </Card>

      <Card>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'medications' && <MedicationTracker />}
        {activeTab === 'symptoms' && <SymptomTracker />}
        {activeTab === 'growth' && renderGrowthTab()}
        {activeTab === 'records' && (
          <div className="text-center py-10 text-gray-600 dark:text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-semibold mb-1">Medical records</h3>
            <p className="text-sm">Document storage and records will appear here when available.</p>
          </div>
        )}
      </Card>
    </PageLayout>
  )
}

export default HealthDashboard