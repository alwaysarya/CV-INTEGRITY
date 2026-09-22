import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Activity, BarChart3 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface DriftMetric {
  id: number
  model: string
  metric: string
  baseline: number
  current: number
  change: number
  severity: 'Stable' | 'Warning' | 'Critical'
}

const driftData = [
  { day: 'Day 1', accuracy: 92.4, drift: 0.02 },
  { day: 'Day 5', accuracy: 92.1, drift: 0.05 },
  { day: 'Day 10', accuracy: 91.8, drift: 0.08 },
  { day: 'Day 15', accuracy: 91.2, drift: 0.12 },
  { day: 'Day 20', accuracy: 90.4, drift: 0.18 },
  { day: 'Day 25', accuracy: 89.6, drift: 0.24 },
  { day: 'Day 30', accuracy: 88.9, drift: 0.31 },
]

const staticDrifts: DriftMetric[] = [
  { id: 1, model: 'YOLOv8n', metric: 'Detection Accuracy', baseline: 92.4, current: 88.9, change: -3.8, severity: 'Warning' },
  { id: 2, model: 'ResNet50', metric: 'Classification Accuracy', baseline: 94.1, current: 93.8, change: -0.3, severity: 'Stable' },
  { id: 3, model: 'ViT-B/16', metric: 'Feature Drift', baseline: 0.02, current: 0.31, change: 1450.0, severity: 'Critical' },
  { id: 4, model: 'BERT-Base', metric: 'Token Distribution', baseline: 0.05, current: 0.08, change: 60.0, severity: 'Stable' },
  { id: 5, model: 'Custom-DQN', metric: 'Reward Stability', baseline: 76.3, current: 71.2, change: -6.7, severity: 'Critical' },
]

const severityColors = {
  Stable: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.4)' },
  Warning: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' },
  Critical: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.4)' },
}

export function DriftMonitor() {
  const [drifts] = useState<DriftMetric[]>(staticDrifts)

  const stats = {
    total: drifts.length,
    stable: drifts.filter((d) => d.severity === 'Stable').length,
    warning: drifts.filter((d) => d.severity === 'Warning').length,
    critical: drifts.filter((d) => d.severity === 'Critical').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Drift Monitor</h1>
          <p className="text-gray-400 text-sm">Track model performance degradation over time</p>
        </div>
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/40 gap-1.5 py-2 px-3">
          <AlertTriangle size={12} />
          {stats.critical} Critical
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Monitored', value: stats.total, color: '#38BDF8', icon: Activity },
          { label: 'Stable', value: stats.stable, color: '#10B981', icon: CheckCircle },
          { label: 'Warning', value: stats.warning, color: '#F59E0B', icon: AlertTriangle },
          { label: 'Critical', value: stats.critical, color: '#EF4444', icon: TrendingDown },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="glass-card p-5 border-cyan-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}20`, border: `1px solid ${stat.color}40` }}>
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
              </div>
              <div className="text-white text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-gray-400 text-xs">{stat.label}</div>
            </Card>
          )
        })}
      </div>

      <Card className="glass-card border-cyan-500/20 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-bold text-sm">30-DAY DRIFT TREND</h3>
            <p className="text-gray-500 text-xs mt-0.5">YOLOv8n accuracy degradation</p>
          </div>
          <BarChart3 size={16} className="text-cyan-400" />
        </div>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={driftData}>
              <defs>
                <linearGradient id="accGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(56, 189, 248, 0.1)" />
              <XAxis dataKey="day" stroke="#475569" tick={{ fontSize: 10 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 10 }} domain={[85, 95]} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', fontSize: '11px' }} />
              <ReferenceLine y={90} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: 'Warning', fill: '#F59E0B', fontSize: 10 }} />
              <Line type="monotone" dataKey="accuracy" stroke="url(#accGrad)" strokeWidth={2} dot={{ r: 4, fill: '#38BDF8' }} name="Accuracy %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="glass-card border-cyan-500/20 p-5">
        <div className="mb-4">
          <h3 className="text-white font-bold text-sm">DRIFT METRICS</h3>
          <p className="text-gray-500 text-xs mt-0.5">Current drift status across all models</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyan-500/10">
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Model</th>
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Metric</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Baseline</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Current</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Change</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Severity</th>
              </tr>
            </thead>
            <tbody>
              {drifts.map((drift) => {
                const colors = severityColors[drift.severity]
                const isPositive = drift.change > 0
                return (
                  <tr key={drift.id} className="border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}>
                          {drift.severity === 'Stable' ? (
                            <CheckCircle size={14} style={{ color: colors.text }} />
                          ) : (
                            <AlertTriangle size={14} style={{ color: colors.text }} />
                          )}
                        </div>
                        <div className="text-white text-xs font-medium">{drift.model}</div>
                      </div>
                    </td>
                    <td className="py-3"><div className="text-gray-400 text-xs">{drift.metric}</div></td>
                    <td className="py-3 text-right"><div className="text-gray-300 text-xs font-mono">{drift.baseline}</div></td>
                    <td className="py-3 text-right"><div className="text-white text-xs font-mono font-bold">{drift.current}</div></td>
                    <td className="py-3 text-right">
                      <div className={`text-xs font-bold flex items-center justify-end gap-1 ${isPositive ? 'text-red-400' : 'text-green-400'}`}>
                        {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {drift.change > 0 ? '+' : ''}{drift.change.toFixed(1)}%
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                        {drift.severity}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
