import { useState, useMemo } from 'react'
import { useStore } from '../store/store'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Filter,
  Download
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'

const Charts = () => {
  const { getCurrentProfile, getCurrentLogs } = useStore()
  const profile = getCurrentProfile()
  const logs = getCurrentLogs()

  // State
  const [timeRange, setTimeRange] = useState('week')
  const [selectedChart, setSelectedChart] = useState('feeding')

  // Chart data processing
  const chartData = useMemo(() => {
    if (!logs.length) return {
      feeding: [],
      sleep: [],
      diaper: [],
      activityDistribution: [],
      weight: []
    }

    const now = new Date()
    const startDate = new Date()
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    const filteredLogs = logs.filter(log => new Date(log.timestamp) >= startDate)

    // Feeding data
    const feedingData = filteredLogs
      .filter(log => log.type === 'feed')
      .reduce((acc, log) => {
        const date = new Date(log.timestamp).toLocaleDateString()
        if (!acc[date]) acc[date] = { date, count: 0, amount: 0 }
        acc[date].count++
        // Extract amount from details if available
        const amountMatch = log.details.match(/(\d+(?:\.\d+)?)\s*(oz|ml|ounces?|milliliters?)/i)
        if (amountMatch) {
          acc[date].amount += parseFloat(amountMatch[1])
        }
        return acc
      }, {} as Record<string, { date: string; count: number; amount: number }>)

    // Sleep data
    const sleepData = filteredLogs
      .filter(log => log.type === 'sleep' || log.type === 'nap')
      .reduce((acc, log) => {
        const date = new Date(log.timestamp).toLocaleDateString()
        if (!acc[date]) acc[date] = { date, duration: 0, sessions: 0 }
        acc[date].sessions++
        if (log.rawDuration) {
          acc[date].duration += log.rawDuration / (1000 * 60 * 60) // Convert to hours
        }
        return acc
      }, {} as Record<string, { date: string; duration: number; sessions: number }>)

    // Diaper data
    const diaperData = filteredLogs
      .filter(log => log.type === 'diaper')
      .reduce((acc, log) => {
        const date = new Date(log.timestamp).toLocaleDateString()
        if (!acc[date]) acc[date] = { date, count: 0 }
        acc[date].count++
        return acc
      }, {} as Record<string, { date: string; count: number }>)

    // Activity distribution
    const activityDistribution = filteredLogs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Weight tracking (if available)
    const weightData = filteredLogs
      .filter(log => log.type === 'weight')
      .map(log => {
        const weightMatch = log.details.match(/(\d+(?:\.\d+)?)\s*(lbs?|kg|pounds?|kilograms?)/i)
        return {
          date: new Date(log.timestamp).toLocaleDateString(),
          weight: weightMatch ? parseFloat(weightMatch[1]) : 0,
          timestamp: new Date(log.timestamp)
        }
      })
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

    return {
      feeding: Object.values(feedingData),
      sleep: Object.values(sleepData),
      diaper: Object.values(diaperData),
      activityDistribution: Object.entries(activityDistribution).map(([type, count]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value: count
      })),
      weight: weightData
    }
  }, [logs, timeRange])

  // Chart colors
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            No Profile Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Please set up a profile to view charts and analytics.
          </p>
        </div>
      </div>
    )
  }

  const renderChart = () => {
    switch (selectedChart) {
      case 'feeding':
        return (
          <BarChart data={chartData.feeding}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="count" fill="#3B82F6" name="Feedings" />
            <Bar yAxisId="right" dataKey="amount" fill="#10B981" name="Amount (oz)" />
          </BarChart>
        )
      case 'sleep':
        return (
          <AreaChart data={chartData.sleep}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="duration" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} name="Hours" />
            <Line type="monotone" dataKey="sessions" stroke="#EF4444" name="Sessions" />
          </AreaChart>
        )
      case 'diaper':
        return (
          <BarChart data={chartData.diaper}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#F59E0B" name="Changes" />
          </BarChart>
        )
      case 'weight':
        return (
          <LineChart data={chartData.weight}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="weight" stroke="#06B6D4" strokeWidth={3} name="Weight" />
          </LineChart>
        )
      case 'distribution':
        return (
          <PieChart>
            <Pie
              data={chartData.activityDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.activityDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )
      default:
        return (
          <BarChart data={chartData.feeding}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="count" fill="#3B82F6" name="Feedings" />
            <Bar yAxisId="right" dataKey="amount" fill="#10B981" name="Amount (oz)" />
          </BarChart>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-slate-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Charts & Analytics</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Visualize {profile.babyName}'s growth and patterns
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 3 Months</option>
            </select>
            <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              <Download size={20} className="mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Chart Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'feeding', label: 'Feeding', icon: '🍼' },
              { id: 'sleep', label: 'Sleep', icon: '😴' },
              { id: 'diaper', label: 'Diaper', icon: '👶' },
              { id: 'weight', label: 'Weight', icon: '📏' },
              { id: 'distribution', label: 'Activity Distribution', icon: '📊' }
            ].map((chart) => (
              <button
                key={chart.id}
                onClick={() => setSelectedChart(chart.id)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  selectedChart === chart.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="mr-2">{chart.icon}</span>
                {chart.label}
              </button>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Chart */}
          <motion.div
            key={selectedChart}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              {selectedChart === 'feeding' && 'Feeding Patterns'}
              {selectedChart === 'sleep' && 'Sleep Duration'}
              {selectedChart === 'diaper' && 'Diaper Changes'}
              {selectedChart === 'weight' && 'Weight Tracking'}
              {selectedChart === 'distribution' && 'Activity Distribution'}
            </h2>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Summary Cards */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🍼</span>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Feedings</p>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {chartData.feeding.reduce((sum, item) => sum + item.count, 0)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">😴</span>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Sleep/Day</p>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {chartData.sleep.length > 0 ? 
                        (chartData.sleep.reduce((sum, item) => sum + item.duration, 0) / chartData.sleep.length).toFixed(1) + 'h' : 
                        '0h'
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">👶</span>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Diaper Changes</p>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {chartData.diaper.reduce((sum, item) => sum + item.count, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Insights</h3>
            <div className="space-y-3">
              {chartData.feeding.length > 0 && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Feeding Pattern:</strong> Average {chartData.feeding.length > 0 ? 
                      (chartData.feeding.reduce((sum, item) => sum + item.count, 0) / chartData.feeding.length).toFixed(1) : 0} feedings per day
                  </p>
                </div>
              )}
              
              {chartData.sleep.length > 0 && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Sleep Quality:</strong> {chartData.sleep.length > 0 ? 
                      (chartData.sleep.reduce((sum, item) => sum + item.duration, 0) / chartData.sleep.length).toFixed(1) : 0} hours average sleep duration
                  </p>
                </div>
              )}
              
              {chartData.weight.length > 1 && (
                <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Growth:</strong> Weight change of {(
                      chartData.weight[chartData.weight.length - 1].weight - chartData.weight[0].weight
                    ).toFixed(1)} units over this period
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Charts 