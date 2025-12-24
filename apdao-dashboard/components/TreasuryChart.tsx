'use client';

import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TreasuryHistoryItem } from '@/data/mockData';
import { formatDate, cn } from '@/lib/utils';

interface TreasuryChartProps {
  data: TreasuryHistoryItem[];
}

type TimeRange = '7d' | '30d' | '90d' | 'max';
type ViewMode = 'market' | 'liquid';

const timeRangeLabels: Record<TimeRange, string> = {
  '7d': '7D',
  '30d': '30D',
  '90d': '90D',
  max: 'Max',
};

export default function TreasuryChart({ data }: TreasuryChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [viewMode, setViewMode] = useState<ViewMode>('market');

  const getFilteredData = () => {
    const ranges: Record<TimeRange, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      max: data.length,
    };
    return data.slice(-ranges[timeRange]);
  };

  const filteredData = getFilteredData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-text-primary font-medium mb-2">{label}</p>
          {payload.reverse().map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-text-secondary">{entry.name}:</span>
              <span className="text-text-primary font-medium">{entry.value}%</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-lg font-semibold text-text-primary">
          Treasury Composition Over Time
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-background rounded-lg p-1">
            {(['market', 'liquid'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-md transition-colors',
                  viewMode === mode
                    ? 'bg-card text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {mode === 'market' ? 'Market Value' : 'Liquid Backing'}
              </button>
            ))}
          </div>

          <div className="flex bg-background rounded-lg p-1">
            {(Object.keys(timeRangeLabels) as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-md transition-colors',
                  timeRange === range
                    ? 'bg-card text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {timeRangeLabels[range]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={filteredData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorStables" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0088CC" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#0088CC" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="colorVolatile" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#FF6B35" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="colorValidator" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#00E5FF" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="colorLp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFD700" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#FFD700" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a4a52" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#a0b0b5"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#2a4a52' }}
            />
            <YAxis
              stroke="#a0b0b5"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#2a4a52' }}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => (
                <span className="text-text-secondary text-sm">{value}</span>
              )}
            />
            <Area
              type="monotone"
              dataKey="lp"
              name="LPs"
              stackId="1"
              stroke="#FFD700"
              fill="url(#colorLp)"
            />
            <Area
              type="monotone"
              dataKey="validator"
              name="Validator"
              stackId="1"
              stroke="#00E5FF"
              fill="url(#colorValidator)"
            />
            <Area
              type="monotone"
              dataKey="volatile"
              name="Volatile"
              stackId="1"
              stroke="#FF6B35"
              fill="url(#colorVolatile)"
            />
            <Area
              type="monotone"
              dataKey="stables"
              name="Stables"
              stackId="1"
              stroke="#0088CC"
              fill="url(#colorStables)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
