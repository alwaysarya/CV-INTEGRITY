import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Shield, Search, Eye, AlertTriangle, Lock, Zap, Activity, TrendingUp } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

interface Threat {
  id: number
  type: string
  severity: 'Critical' | 'High' | 'Medium' | 'Low'
  source: string
  target: string
  timestamp: string
  status: 'Blocked' | 'Investigating' | 'Resolved'
}

const staticThreats: Threat[] = [
  { id: 1, type: 'Data Poisoning Attempt', severity: 'Critical', source: 'External IP 185.23.44.x', target: 'Dataset Pipeline', timestamp: '14:28', status: 'Blocked' },
  { id: 2, type: 'Model Inversion Attack', severity: 'High', source: 'Internal User', target: 'YOLOv8n Model', timestamp: '14:15', status: 'Blocked' },
  { id: 3, type: 'Adversarial Input Detected', severity: 'Medium', source: 'API Endpoint', target: 'Inference Service', timestamp: '13:52', status: 'Resolved' },
  { id: 4, type: 'Unauthorized Access Attempt', severity: 'High', source: 'Unknown', target: 'Blockchain Wallet', timestamp: '13:30', status: 'Blocked' },
  { id: 5, type: 'Anomalous Traffic Spike', severity: 'Low', source: 'CDN', target: 'API Gateway', timestamp: '13:12', status: 'Investigating' },
  { id: 6, type: 'Malicious File Upload', severity: 'Critical', source: 'User Upload', target: 'Dataset Store', timestamp: '12:45', status: 'Blocked' },
]

const severityColors = {
  Critical: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.4)' },
  High: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' },
  Medium: { bg: 'rgba(56, 189, 248, 0.15)', text: '#38BDF8', border: 'rgba(56, 189, 248, 0.4)' },
  Low: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.4)' },
}

const statusColors = {
  Blocked: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.4)' },
  Investigating: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' },
  Resolved: { bg: 'rgba(56, 189, 248, 0.15)', text: '#38BDF8', border: 'rgba(56, 189, 248, 0.4)' },
}

const attackData = [
  { time: '00:00', attacks: 2 },
  { time: '04:00', attacks: 5 },
  { time: '08:00', attacks: 12 },
  { time: '12:00', attacks: 18 },
  { time: '16:00', attacks: 15 },
  { time: '20:00', attacks: 8 },
]

export function Cybersecurity() {
  const [threats, setThreats] = useState<Threat[]>(staticThreats)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')

  const filtered = threats.filter((t) => {
    const matchesSearch = t.type.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || t.severity === filter
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: threats.length,
    blocked: threats.filter((t) => t.status === 'Blocked').length,
    critical: threats.filter((t) => t.severity === 'Critical').length,
    uptime: '99.9%',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Cybersecurity</h1>
          <p className="text-gray-400 text-sm">Real-time threat detection and response</p>
        </div>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/40 gap-1.5 py-2 px-3">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Protected
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Threats', value: stats.total, color: '#38BDF8', icon: AlertTriangle },
          { label: 'Blocked', value: stats.blocked, color: '#10B981', icon: Shield },
          { label: 'Critical', value: stats.critical, color: '#EF4444', icon: Zap },
          { label: 'System Uptime', value: stats.uptime, color: '#38BDF8', icon: Activity },
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
        <div className="mb-4">
          <h3 className="text-white font-bold text-sm">THREAT TIMELINE (24H)</h3>
          <p className="text-gray-500 text-xs mt-0.5">Attack attempts over time</p>
        </div>
        <div className="w-full h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={attackData}>
              <defs>
                <linearGradient id="attackGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(56, 189, 248, 0.1)" />
              <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 10 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', fontSize: '11px' }} />
              <Line type="monotone" dataKey="attacks" stroke="url(#attackGrad)" strokeWidth={2} dot={{ fill: '#EF4444', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="glass-card border-cyan-500/20 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <Input
              placeholder="Search threats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-cyan-500/20 text-white placeholder:text-gray-500 h-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'Critical', 'High', 'Medium', 'Low'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  filter === f
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'text-gray-500 hover:text-gray-300 border border-cyan-500/10'
                }`}
              >
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="glass-card border-cyan-500/20 p-5">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyan-500/10">
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Threat Type</th>
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Source</th>
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Target</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Severity</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Status</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Time</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((threat) => {
                const sev = severityColors[threat.severity]
                const st = statusColors[threat.status]
                return (
                  <tr key={threat.id} className="border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: sev.bg, border: `1px solid ${sev.border}` }}>
                          <AlertTriangle size={14} style={{ color: sev.text }} />
                        </div>
                        <div className="text-white text-xs font-medium">{threat.type}</div>
                      </div>
                    </td>
                    <td className="py-3"><div className="text-gray-400 text-xs">{threat.source}</div></td>
                    <td className="py-3"><div className="text-gray-400 text-xs">{threat.target}</div></td>
                    <td className="py-3 text-right">
                      <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: sev.bg, color: sev.text, border: `1px solid ${sev.border}` }}>
                        {threat.severity}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: st.bg, color: st.text, border: `1px solid ${st.border}` }}>
                        ● {threat.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right"><div className="text-gray-500 text-xs font-mono">{threat.timestamp}</div></td>
                    <td className="py-3 text-right">
                      <button className="p-1.5 rounded hover:bg-cyan-500/10 text-gray-400 hover:text-cyan-400 transition-colors">
                        <Eye size={12} />
                      </button>
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
