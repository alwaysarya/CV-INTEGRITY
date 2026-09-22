import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Users, Car, AlertCircle, Target } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const chartData = [
  { time: '00:00', count: 45 },
  { time: '02:00', count: 32 },
  { time: '04:00', count: 55 },
  { time: '06:00', count: 78 },
  { time: '08:00', count: 120 },
  { time: '10:00', count: 145 },
  { time: '12:00', count: 138 },
  { time: '14:00', count: 166 },
  { time: '16:00', count: 155 },
  { time: '18:00', count: 142 },
  { time: '20:00', count: 128 },
  { time: '22:00', count: 115 },
]

export function AnalyticsOverview() {
  const [timeRange, setTimeRange] = useState('24H')

  const metrics = [
    { label: 'People Count', value: '1.2K', change: '+5.2%', positive: true, icon: Users, color: '#38BDF8' },
    { label: 'Vehicles', value: '342', change: '+2.1%', positive: true, icon: Car, color: '#10B981' },
    { label: 'Anomalies', value: '6', change: '-40%', positive: false, icon: AlertCircle, color: '#EF4444' },
    { label: 'Accuracy', value: '92.4%', change: '+1.6%', positive: true, icon: Target, color: '#38BDF8' },
  ]

  return (
    <Card className="glass-card border-cyan-500/20 p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-sm">ANALYTICS OVERVIEW</h3>
          <p className="text-gray-500 text-xs mt-0.5">Key metrics and insights</p>
        </div>
        <div className="flex gap-1 bg-black/40 rounded-lg p-1 border border-cyan-500/20">
          {['24H', '7D', '30D', '1Y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all ${
                timeRange === range
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        {metrics.map((metric, i) => {
          const Icon = metric.icon
          return (
            <div key={i} className="p-3 rounded-lg bg-black/30 border border-cyan-500/10">
              <div className="flex items-center justify-between mb-1">
                <Icon size={12} style={{ color: metric.color }} />
                <div className={`flex items-center gap-0.5 text-[9px] font-medium ${
                  metric.positive ? 'text-green-400' : 'text-red-400'
                }`}>
                  {metric.positive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                  {metric.change}
                </div>
              </div>
              <div className="text-white text-lg font-bold">{metric.value}</div>
              <div className="text-gray-500 text-[9px] mt-0.5">{metric.label}</div>
            </div>
          )
        })}
      </div>

      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(56, 189, 248, 0.1)" />
            <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 9 }} />
            <YAxis stroke="#475569" tick={{ fontSize: 9 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '8px',
                fontSize: '11px',
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="url(#lineGradient)"
              strokeWidth={2}
              dot={{ fill: '#38BDF8', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
