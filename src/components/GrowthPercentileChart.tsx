import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/store';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Ruler, Scale, Info } from 'lucide-react';

interface GrowthData {
  ageMonths: number;
  weight?: number;
  height?: number;
  headCircumference?: number;
  date: string;
}

interface PercentileData {
  ageMonths: number;
  p3: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  p97: number;
}

// WHO Growth Standards for boys (0-24 months) - Weight in kg
const WHO_WEIGHT_BOYS: PercentileData[] = [
  { ageMonths: 0, p3: 2.5, p10: 2.9, p25: 3.3, p50: 3.3, p75: 3.9, p90: 4.4, p97: 5.1 },
  { ageMonths: 1, p3: 3.4, p10: 3.9, p25: 4.5, p50: 4.5, p75: 5.1, p90: 5.8, p97: 6.6 },
  { ageMonths: 2, p3: 4.3, p10: 4.9, p25: 5.6, p50: 5.6, p75: 6.3, p90: 7.1, p97: 8.0 },
  { ageMonths: 3, p3: 5.0, p10: 5.7, p25: 6.4, p50: 6.4, p75: 7.2, p90: 8.0, p97: 9.0 },
  { ageMonths: 6, p3: 6.4, p10: 7.3, p25: 8.2, p50: 7.9, p75: 8.8, p90: 9.8, p97: 10.9 },
  { ageMonths: 9, p3: 7.1, p10: 8.0, p25: 8.9, p50: 8.9, p75: 9.9, p90: 10.9, p97: 12.0 },
  { ageMonths: 12, p3: 7.7, p10: 8.6, p25: 9.6, p50: 9.6, p75: 10.6, p90: 11.7, p97: 12.8 },
  { ageMonths: 18, p3: 8.4, p10: 9.4, p25: 10.5, p50: 10.5, p75: 11.7, p90: 12.8, p97: 14.1 },
  { ageMonths: 24, p3: 9.0, p10: 10.1, p25: 11.3, p50: 11.3, p75: 12.5, p90: 13.8, p97: 15.3 }
];

// WHO Growth Standards for girls (0-24 months) - Weight in kg
const WHO_WEIGHT_GIRLS: PercentileData[] = [
  { ageMonths: 0, p3: 2.4, p10: 2.8, p25: 3.2, p50: 3.2, p75: 3.7, p90: 4.2, p97: 4.8 },
  { ageMonths: 1, p3: 3.2, p10: 3.6, p25: 4.2, p50: 4.2, p75: 4.8, p90: 5.5, p97: 6.2 },
  { ageMonths: 2, p3: 3.9, p10: 4.5, p25: 5.1, p50: 5.1, p75: 5.8, p90: 6.6, p97: 7.5 },
  { ageMonths: 3, p3: 4.5, p10: 5.2, p25: 5.8, p50: 5.8, p75: 6.6, p90: 7.5, p97: 8.5 },
  { ageMonths: 6, p3: 5.7, p10: 6.5, p25: 7.3, p50: 7.3, p75: 8.2, p90: 9.3, p97: 10.6 },
  { ageMonths: 9, p3: 6.4, p10: 7.3, p25: 8.2, p50: 8.2, p75: 9.2, p90: 10.5, p97: 11.9 },
  { ageMonths: 12, p3: 7.0, p10: 7.9, p25: 8.9, p50: 8.9, p75: 10.1, p90: 11.5, p97: 13.1 },
  { ageMonths: 18, p3: 7.7, p10: 8.8, p25: 9.9, p50: 9.9, p75: 11.3, p90: 12.8, p97: 14.7 },
  { ageMonths: 24, p3: 8.4, p10: 9.6, p25: 10.8, p50: 10.8, p75: 12.4, p90: 14.1, p97: 16.1 }
];

// WHO Growth Standards for boys (0-24 months) - Height in cm
const WHO_HEIGHT_BOYS: PercentileData[] = [
  { ageMonths: 0, p3: 46.1, p10: 47.5, p25: 48.9, p50: 49.9, p75: 51.0, p90: 52.0, p97: 53.4 },
  { ageMonths: 1, p3: 50.8, p10: 52.3, p25: 53.8, p50: 54.7, p75: 55.6, p90: 56.7, p97: 58.1 },
  { ageMonths: 2, p3: 54.4, p10: 56.0, p25: 57.6, p50: 58.4, p75: 59.4, p90: 60.4, p97: 61.8 },
  { ageMonths: 3, p3: 57.3, p10: 59.0, p25: 60.6, p50: 61.4, p75: 62.4, p90: 63.5, p97: 64.9 },
  { ageMonths: 6, p3: 63.3, p10: 65.2, p25: 67.0, p50: 67.6, p75: 68.7, p90: 69.8, p97: 71.3 },
  { ageMonths: 9, p3: 67.7, p10: 69.7, p25: 71.7, p50: 72.0, p75: 73.2, p90: 74.5, p97: 76.0 },
  { ageMonths: 12, p3: 71.0, p10: 73.2, p25: 75.3, p50: 75.7, p75: 77.1, p90: 78.4, p97: 80.1 },
  { ageMonths: 18, p3: 76.9, p10: 79.2, p25: 81.5, p50: 82.3, p75: 83.6, p90: 85.1, p97: 87.0 },
  { ageMonths: 24, p3: 81.7, p10: 84.1, p25: 86.5, p50: 87.1, p75: 88.6, p90: 90.2, p97: 92.2 }
];

// WHO Growth Standards for girls (0-24 months) - Height in cm
const WHO_HEIGHT_GIRLS: PercentileData[] = [
  { ageMonths: 0, p3: 45.4, p10: 46.8, p25: 48.2, p50: 49.1, p75: 50.0, p90: 51.0, p97: 52.4 },
  { ageMonths: 1, p3: 49.8, p10: 51.3, p25: 52.8, p50: 53.7, p75: 54.6, p90: 55.6, p97: 57.1 },
  { ageMonths: 2, p3: 53.0, p10: 54.6, p25: 56.2, p50: 57.1, p75: 58.0, p90: 59.1, p97: 60.6 },
  { ageMonths: 3, p3: 55.6, p10: 57.3, p25: 59.0, p50: 59.8, p75: 60.8, p90: 61.9, p97: 63.4 },
  { ageMonths: 6, p3: 61.2, p10: 63.0, p25: 64.8, p50: 65.7, p75: 66.8, p90: 67.9, p97: 69.3 },
  { ageMonths: 9, p3: 65.3, p10: 67.3, p25: 69.1, p50: 70.1, p75: 71.4, p90: 72.6, p97: 74.2 },
  { ageMonths: 12, p3: 68.9, p10: 71.0, p25: 72.8, p50: 74.0, p75: 75.3, p90: 76.6, p97: 78.4 },
  { ageMonths: 18, p3: 74.9, p10: 77.2, p25: 79.2, p50: 80.7, p75: 82.2, p90: 83.6, p97: 85.7 },
  { ageMonths: 24, p3: 80.0, p10: 82.5, p25: 84.6, p50: 86.4, p75: 88.1, p90: 89.6, p97: 91.9 }
];

interface GrowthPercentileChartProps {
  gender?: 'boy' | 'girl';
  measurementType: 'weight' | 'height';
}

const GrowthPercentileChart: React.FC<GrowthPercentileChartProps> = ({ 
  gender = 'boy', 
  measurementType 
}) => {
  const { getCurrentProfile, getCurrentLogs } = useStore();
  const profile = getCurrentProfile();
  const logs = getCurrentLogs();

  const [selectedPercentiles, setSelectedPercentiles] = useState<string[]>(['p3', 'p50', 'p97']);

  const growthData = useMemo(() => {
    if (!profile) return [];

    const birthDate = new Date(profile.dob);
    const relevantLogs = logs.filter(log => 
      log.type === measurementType && 
      log.details.includes(measurementType === 'weight' ? 'Weight:' : 'Height:')
    );

    return relevantLogs.map(log => {
      const ageMonths = Math.floor((new Date(log.timestamp).getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
      
      let value = 0;
      if (measurementType === 'weight') {
        const match = log.details.match(/Weight:\s*(\d+(?:\.\d+)?)/);
        value = match ? parseFloat(match[1]) : 0;
        // Convert lbs to kg if needed
        if (log.details.includes('lbs')) {
          value = value * 0.453592;
        }
      } else {
        const match = log.details.match(/Height:\s*(\d+(?:\.\d+)?)/);
        value = match ? parseFloat(match[1]) : 0;
        // Convert inches to cm if needed
        if (log.details.includes('in')) {
          value = value * 2.54;
        }
      }

      return {
        ageMonths,
        [measurementType]: value,
        date: log.timestamp.toLocaleDateString()
      };
    }).sort((a, b) => a.ageMonths - b.ageMonths);
  }, [profile, logs, measurementType]);

  const percentileData = useMemo(() => {
    let data: PercentileData[];
    
    if (measurementType === 'weight') {
      data = gender === 'boy' ? WHO_WEIGHT_BOYS : WHO_WEIGHT_GIRLS;
    } else {
      data = gender === 'boy' ? WHO_HEIGHT_BOYS : WHO_HEIGHT_GIRLS;
    }

    return data;
  }, [gender, measurementType]);

  const chartData = useMemo(() => {
    const maxAge = Math.max(
      ...growthData.map(d => d.ageMonths),
      ...percentileData.map(d => d.ageMonths)
    );

    const combinedData: any[] = [];
    
    for (let age = 0; age <= Math.max(maxAge, 24); age++) {
      const percentile = percentileData.find(p => p.ageMonths === age);
      const growth = growthData.find(g => g.ageMonths === age);
      
      if (percentile || growth) {
        combinedData.push({
          ageMonths: age,
          ...percentile,
          actualValue: growth?.[measurementType] || null,
          date: growth?.date
        });
      }
    }

    return combinedData;
  }, [growthData, percentileData, measurementType]);

  const getPercentileForValue = (value: number, ageMonths: number) => {
    const percentile = percentileData.find(p => p.ageMonths === ageMonths);
    if (!percentile) return null;

    if (value <= percentile.p3) return '< 3rd';
    if (value <= percentile.p10) return '3rd-10th';
    if (value <= percentile.p25) return '10th-25th';
    if (value <= percentile.p50) return '25th-50th';
    if (value <= percentile.p75) return '50th-75th';
    if (value <= percentile.p90) return '75th-90th';
    if (value <= percentile.p97) return '90th-97th';
    return '> 97th';
  };

  const getCurrentPercentile = () => {
    if (growthData.length === 0) return null;
    const latest = growthData[growthData.length - 1];
    const value = latest[measurementType];
    return getPercentileForValue(typeof value === 'number' ? value : 0, latest.ageMonths);
  };

  const percentileColors = {
    p3: '#ef4444',   // red
    p10: '#f97316',  // orange
    p25: '#eab308',  // yellow
    p50: '#22c55e',  // green
    p75: '#3b82f6',  // blue
    p90: '#8b5cf6',  // purple
    p97: '#ec4899'   // pink
  };

  const percentileLabels = {
    p3: '3rd percentile',
    p10: '10th percentile',
    p25: '25th percentile',
    p50: '50th percentile (median)',
    p75: '75th percentile',
    p90: '90th percentile',
    p97: '97th percentile'
  };

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
            {measurementType === 'weight' ? (
              <Scale className="w-6 h-6 text-green-600 dark:text-green-400" />
            ) : (
              <Ruler className="w-6 h-6 text-green-600 dark:text-green-400" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {measurementType === 'weight' ? 'Weight' : 'Height'} Growth Chart
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              WHO Growth Standards for {gender}s • Current percentile: {getCurrentPercentile() || 'No data'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {growthData.length} measurements
          </span>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 dark:text-white">Percentile Lines</h3>
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Select which percentile lines to display
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {Object.entries(percentileLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                setSelectedPercentiles(prev => 
                  prev.includes(key) 
                    ? prev.filter(p => p !== key)
                    : [...prev, key]
                );
              }}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedPercentiles.includes(key)
                  ? 'text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              style={{
                backgroundColor: selectedPercentiles.includes(key) 
                  ? percentileColors[key as keyof typeof percentileColors]
                  : undefined
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Growth Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="ageMonths" 
                stroke="#6b7280"
                label={{ value: 'Age (months)', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                stroke="#6b7280"
                label={{ 
                  value: measurementType === 'weight' ? 'Weight (kg)' : 'Height (cm)', 
                  angle: -90, 
                  position: 'insideLeft' 
                }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'actualValue') {
                    return [
                      `${value?.toFixed(1)} ${measurementType === 'weight' ? 'kg' : 'cm'}`,
                      `${profile.babyName}'s ${measurementType}`
                    ];
                  }
                  return [
                    `${value?.toFixed(1)} ${measurementType === 'weight' ? 'kg' : 'cm'}`,
                    percentileLabels[name as keyof typeof percentileLabels] || name
                  ];
                }}
                labelFormatter={(ageMonths) => `Age: ${ageMonths} months`}
              />
              <Legend />
              
              {/* Percentile Lines */}
              {selectedPercentiles.map(percentile => (
                <Line
                  key={percentile}
                  type="monotone"
                  dataKey={percentile}
                  stroke={percentileColors[percentile as keyof typeof percentileColors]}
                  strokeWidth={2}
                  dot={false}
                  name={percentileLabels[percentile as keyof typeof percentileLabels]}
                />
              ))}
              
              {/* Actual Growth Data */}
              <Line
                type="monotone"
                dataKey="actualValue"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                name={`${profile.babyName}'s ${measurementType}`}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Growth Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Latest {measurementType}</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {growthData.length > 0
                  ? (() => {
                      const value = growthData[growthData.length - 1][measurementType];
                      return typeof value === 'number'
                        ? `${value.toFixed(1)} ${measurementType === 'weight' ? 'kg' : 'cm'}`
                        : 'No data';
                    })()
                  : 'No data'
                }
              </p>
            </div>
            {measurementType === 'weight' ? (
              <Scale className="w-8 h-8 text-green-500" />
            ) : (
              <Ruler className="w-8 h-8 text-green-500" />
            )}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Percentile</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {getCurrentPercentile() || 'No data'}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Measurements</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {growthData.length}
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
              <span className="text-purple-600 dark:text-purple-400 font-bold">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Interpretation */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
        <div className="flex items-start space-x-3">
          <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Understanding Growth Percentiles
            </h3>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
              <p>
                • <strong>50th percentile (median):</strong> Average growth for babies of the same age and gender
              </p>
              <p>
                • <strong>25th-75th percentile:</strong> Normal range where most healthy babies fall
              </p>
              <p>
                • <strong>Below 3rd or above 97th percentile:</strong> May warrant discussion with pediatrician
              </p>
              <p>
                • <strong>Growth pattern matters more than single measurements:</strong> Consistent growth along any percentile line is typically healthy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrowthPercentileChart;