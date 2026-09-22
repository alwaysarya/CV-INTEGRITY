import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, TrendingUp, Users, Car, Target, Activity } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const lineData = [
  { time: '00:00', people: 45, vehicles: 32 },
  { time: '04:00', people: 55, vehicles: 40 },
  { time: '08:00', people: 120, vehicles: 85 },
  { time: '12:00', people: 138, vehicles: 95 },
  { time: '16:00', people: 166, vehicles: 110 },
  { time: '20:00', people: 128, vehicles: 88 },
]

const barData = [
  { name: 'Mon', detections: 145 },
  { name: 'Tue', detections: 178 },
  { name: 'Wed', detections: 220 },
  { name: 'Thu', detections: 190 },
  { name: 'Fri', detections: 245 },
  { name: 'Sat', detections: 290 },
  { name: 'Sun', detections: 210 },
]

const pieData = [
  { name: 'People', value: 45, color: '#38BDF8' },
  { name: 'Vehicles', value: 30, color: '#10B981' },
  { name: 'Drones', value: 15, color: '#F59E0B' },
  { name: 'Objects', value: 10, color: '#8B5CF6' },
]

export function Analytics() {
  const [timeRange, setTimeRange] = useState('24H')

  const metrics = [
    { label: 'Total Detections', value: '12.4K', change: '+18.5%', icon: Activity, color: '#38BDF8' },
    { label: 'Unique Entities', value: '1,247', change: '+5.2%', icon: Users, color: '#10B981' },
    { label: 'Vehicles Tracked', value: '342', change: '+2.1%', icon: Car, color: '#8B5CF6' },
    { label: 'Model Accuracy', value: '92.4%', change: '+1.6%', icon: Target, color: '#38BDF8' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Analytics</h1>
          <p className="text-gray-400 text-sm">Key metrics and insights across the platform</p>
        </div>
        <div className="flex gap-1 bg-black/40 rounded-lg p-1 border border-cyan-500/20">
          {['24H', '7D', '30D', '1Y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, i) => {
          const Icon = metric.icon
          return (
            <Card key={i} className="glass-card p-5 border-cyan-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${metric.color}20`, border: `1px solid ${metric.color}40` }}>
                  <Icon size={20} style={{ color: metric.color }} />
                </div>
                <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                  {metric.change}
                </Badge>
              </div>
              <div className="text-white text-3xl font-bold mb-1">{metric.value}</div>
              <div className="text-gray-400 text-xs">{metric.label}</div>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-card border-cyan-500/20 p-5">
          <div className="mb-4">
            <h3 className="text-white font-bold text-sm">DETECTIONS OVER TIME</h3>
            <p className="text-gray-500 text-xs mt-0.5">People & vehicles tracked</p>
          </div>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <defs>
                  <linearGradient id="peopleGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(56, 189, 248, 0.1)" />
                <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 10 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} />
                <Line type="monotone" dataKey="people" stroke="url(#peopleGrad)" strokeWidth={2} dot={{ r: 3 }} name="People" />
                <Line type="monotone" dataKey="vehicles" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} name="Vehicles" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="glass-card border-cyan-500/20 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-bold text-sm">WEEKLY DETECTIONS</h3>
              <p className="text-gray-500 text-xs mt-0.5">Total per day</p>
            </div>
            <BarChart3 size={16} className="text-cyan-400" />
          </div>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(56, 189, 248, 0.1)" />
                <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 10 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="detections" fill="url(#barGrad)" radius={[8, 8, 0, 0]} name="Detections" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="glass-card border-cyan-500/20 p-5">
          <div className="mb-4">
            <h3 className="text-white font-bold text-sm">DETECTION TYPES</h3>
            <p className="text-gray-500 text-xs mt-0.5">Distribution by category</p>
          </div>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="glass-card border-cyan-500/20 p-5 lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-white font-bold text-sm">TOP PERFORMERS</h3>
            <p className="text-gray-500 text-xs mt-0.5">Highest accuracy models this week</p>
          </div>
          <div className="space-y-4">
            {[
              { name: 'ResNet50', value: 94.1, color: '#10B981' },
              { name: 'YOLOv8n', value: 92.4, color: '#38BDF8' },
              { name: 'ViT-B/16', value: 91.2, color: '#8B5CF6' },
              { name: 'BERT-Base', value: 88.7, color: '#F59E0B' },
            ].map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-xs font-medium">{item.name}</span>
                  <span className="text-xs font-bold" style={{ color: item.color }}>{item.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${item.value}%`,
                      background: `linear-gradient(90deg, ${item.color}, ${item.color}aa)`,
                      boxShadow: `0 0 10px ${item.color}60`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
