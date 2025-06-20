import { useState, useMemo } from 'react'
import { useStore } from '../store/store'
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Filter
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
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]} 
                  name={entry.name}
                />
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
            {/* Time Range Filter */}
            <div className="flex items-center space-x-2">
              <Calendar className="text-gray-500 dark:text-gray-400" size={20} />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
              </select>
            </div>
            {/* Chart Type Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-500 dark:text-gray-400" size={20} />
              <select
                value={selectedChart}
                onChange={(e) => setSelectedChart(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                <option value="feeding">Feeding</option>
                <option value="sleep">Sleep</option>
                <option value="diaper">Diaper Changes</option>
                <option value="weight">Weight</option>
                <option value="distribution">Activity Distribution</option>
              </select>
            </div>
            {/* Chart Icons */}
            <div className="flex items-center space-x-2">
              <BarChart3 className="text-blue-500" size={20} />
              <TrendingUp className="text-green-500" size={20} />
            </div>
          </div>
        </div>

        {/* Chart Selection */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <button onClick={() => setSelectedChart('feeding')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedChart === 'feeding' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700'}`}>Feeding</button>
          <button onClick={() => setSelectedChart('sleep')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedChart === 'sleep' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700'}`}>Sleep</button>
          <button onClick={() => setSelectedChart('diaper')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedChart === 'diaper' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700'}`}>Diapers</button>
          <button onClick={() => setSelectedChart('weight')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedChart === 'weight' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700'}`}>Weight</button>
          <button onClick={() => setSelectedChart('distribution')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedChart === 'distribution' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700'}`}>Distribution</button>
        </div>

        {/* Chart Display */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 md:p-6">
          <div className="overflow-x-auto">
            <ResponsiveContainer width="100%" height={400}>
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Charts 