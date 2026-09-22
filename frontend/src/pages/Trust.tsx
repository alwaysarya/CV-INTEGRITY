import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Shield, Search, Eye, TrendingUp, AlertTriangle, CheckCircle, XCircle, Award } from 'lucide-react'

interface TrustScore {
  id: number
  entity: string
  entityType: 'Dataset' | 'Model' | 'Wallet'
  score: number
  level: 'Excellent' | 'Good' | 'Fair' | 'Poor'
  verifications: number
  lastCheck: string
}

const staticScores: TrustScore[] = [
  { id: 1, entity: 'ImageNet-1K', entityType: 'Dataset', score: 94, level: 'Excellent', verifications: 1247, lastCheck: '2 min ago' },
  { id: 2, entity: 'YOLOv8n', entityType: 'Model', score: 92, level: 'Excellent', verifications: 856, lastCheck: '14 min ago' },
  { id: 3, entity: 'COCO-2017', entityType: 'Dataset', score: 88, level: 'Good', verifications: 623, lastCheck: '1 hr ago' },
  { id: 4, entity: 'ResNet50', entityType: 'Model', score: 87, level: 'Good', verifications: 445, lastCheck: '2 hr ago' },
  { id: 5, entity: '0x7a3f...9b2c', entityType: 'Wallet', score: 76, level: 'Fair', verifications: 234, lastCheck: '3 hr ago' },
  { id: 6, entity: 'Drone-Detection', entityType: 'Dataset', score: 42, level: 'Poor', verifications: 89, lastCheck: '5 hr ago' },
]

const levelColors = {
  Excellent: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.4)', icon: Award },
  Good: { bg: 'rgba(56, 189, 248, 0.15)', text: '#38BDF8', border: 'rgba(56, 189, 248, 0.4)', icon: CheckCircle },
  Fair: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)', icon: AlertTriangle },
  Poor: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.4)', icon: XCircle },
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${score}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            boxShadow: `0 0 10px ${color}80`,
          }}
        />
      </div>
      <span className="text-xs font-bold" style={{ color }}>{score}%</span>
    </div>
  )
}

export function Trust() {
  const [scores, setScores] = useState<TrustScore[]>(staticScores)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')

  const filtered = scores.filter((s) => {
    const matchesSearch = s.entity.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || s.level === filter
    return matchesSearch && matchesFilter
  })

  const stats = {
    avg: Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length),
    excellent: scores.filter((s) => s.level === 'Excellent').length,
    good: scores.filter((s) => s.level === 'Good').length,
    poor: scores.filter((s) => s.level === 'Poor').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Trust Scores</h1>
          <p className="text-gray-400 text-sm">Entity trust verification and reputation</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all">
          <Shield size={16} />
          Run Verification
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Avg Trust Score', value: `${stats.avg}%`, color: '#38BDF8', icon: TrendingUp },
          { label: 'Excellent', value: stats.excellent, color: '#10B981', icon: Award },
          { label: 'Good', value: stats.good, color: '#38BDF8', icon: CheckCircle },
          { label: 'Poor', value: stats.poor, color: '#EF4444', icon: XCircle },
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

      <Card className="glass-card border-cyan-500/20 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <Input
              placeholder="Search entities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-cyan-500/20 text-white placeholder:text-gray-500 h-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'Excellent', 'Good', 'Fair', 'Poor'].map((f) => (
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
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Entity</th>
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Type</th>
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3 w-64">Trust Score</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Level</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Verifications</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Last Check</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const colors = levelColors[s.level]
                return (
                  <tr key={s.id} className="border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}>
                          <Shield size={14} style={{ color: colors.text }} />
                        </div>
                        <div className="text-white text-xs font-medium">{s.entity}</div>
                      </div>
                    </td>
                    <td className="py-3"><div className="text-gray-400 text-xs">{s.entityType}</div></td>
                    <td className="py-3"><ScoreBar score={s.score} color={colors.text} /></td>
                    <td className="py-3 text-right">
                      <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                        {s.level}
                      </Badge>
                    </td>
                    <td className="py-3 text-right"><div className="text-gray-300 text-xs font-mono">{s.verifications.toLocaleString()}</div></td>
                    <td className="py-3 text-right"><div className="text-gray-500 text-xs">{s.lastCheck}</div></td>
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
