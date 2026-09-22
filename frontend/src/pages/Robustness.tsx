import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Search, Eye, Activity, Zap, Target, AlertTriangle, CheckCircle } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'

interface TestResult {
  id: number
  test: string
  category: 'Noise' | 'Blur' | 'Rotation' | 'Occlusion' | 'Adversarial'
  score: number
  status: 'Pass' | 'Warning' | 'Fail'
  timestamp: string
}

const staticResults: TestResult[] = [
  { id: 1, test: 'Gaussian Noise (σ=0.1)', category: 'Noise', score: 91, status: 'Pass', timestamp: '2 min ago' },
  { id: 2, test: 'Motion Blur (radius=5)', category: 'Blur', score: 87, status: 'Pass', timestamp: '8 min ago' },
  { id: 3, test: 'Rotation (45°)', category: 'Rotation', score: 78, status: 'Warning', timestamp: '15 min ago' },
  { id: 4, test: 'Occlusion (30%)', category: 'Occlusion', score: 68, status: 'Warning', timestamp: '28 min ago' },
  { id: 5, test: 'FGSM Adversarial', category: 'Adversarial', score: 42, status: 'Fail', timestamp: '1 hr ago' },
  { id: 6, test: 'Brightness Variation', category: 'Noise', score: 94, status: 'Pass', timestamp: '2 hr ago' },
]

const radarData = [
  { category: 'Noise', score: 91 },
  { category: 'Blur', score: 87 },
  { category: 'Rotation', score: 78 },
  { category: 'Occlusion', score: 68 },
  { category: 'Adversarial', score: 42 },
  { category: 'Weather', score: 85 },
]

const statusColors = {
  Pass: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.4)' },
  Warning: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' },
  Fail: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.4)' },
}

export function Robustness() {
  const [results, setResults] = useState<TestResult[]>(staticResults)
  const [search, setSearch] = useState('')

  const filtered = results.filter((r) =>
    r.test.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: results.length,
    pass: results.filter((r) => r.status === 'Pass').length,
    warning: results.filter((r) => r.status === 'Warning').length,
    fail: results.filter((r) => r.status === 'Fail').length,
  }

  const avgScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Robustness Testing</h1>
          <p className="text-gray-400 text-sm">Stress test models under adverse conditions</p>
        </div>
        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/40 gap-1.5 py-2 px-3">
          <Shield size={12} />
          Avg Score: {avgScore}%
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tests', value: stats.total, color: '#38BDF8', icon: Activity },
          { label: 'Passed', value: stats.pass, color: '#10B981', icon: CheckCircle },
          { label: 'Warnings', value: stats.warning, color: '#F59E0B', icon: AlertTriangle },
          { label: 'Failed', value: stats.fail, color: '#EF4444', icon: Zap },
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

      {/* Radar + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="glass-card border-cyan-500/20 p-5 lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-white font-bold text-sm">ROBUSTNESS RADAR</h3>
            <p className="text-gray-500 text-xs mt-0.5">Performance across test categories</p>
          </div>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(56, 189, 248, 0.2)" />
                <PolarAngleAxis dataKey="category" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 9 }} />
                <Radar name="Score" dataKey="score" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.4} strokeWidth={2} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', fontSize: '11px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="glass-card border-cyan-500/20 p-5">
          <div className="mb-4">
            <h3 className="text-white font-bold text-sm">OVERALL ROBUSTNESS</h3>
            <p className="text-gray-500 text-xs mt-0.5">Aggregate score</p>
          </div>
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(56, 189, 248, 0.1)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke="#38BDF8" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (avgScore / 100) * 251.2}
                  style={{ filter: 'drop-shadow(0 0 8px #38BDF8)' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Target size={24} className="text-cyan-400 mb-1" />
                <span className="text-white font-bold text-3xl">{avgScore}%</span>
                <span className="text-gray-500 text-[10px] uppercase tracking-wider mt-0.5">Robustness</span>
              </div>
            </div>
            <div className="text-gray-400 text-xs mt-4 text-center">
              Model is <span className="text-cyan-400 font-bold">moderately robust</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="glass-card border-cyan-500/20 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <Input
            placeholder="Search tests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-cyan-500/20 text-white placeholder:text-gray-500 h-10"
          />
        </div>
      </Card>

      {/* Results Table */}
      <Card className="glass-card border-cyan-500/20 p-5">
        <div className="mb-4">
          <h3 className="text-white font-bold text-sm">TEST RESULTS</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyan-500/10">
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Test</th>
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Category</th>
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3 w-64">Score</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Status</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Time</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((result) => {
                const colors = statusColors[result.status]
                return (
                  <tr key={result.id} className="border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}>
                          <Shield size={14} style={{ color: colors.text }} />
                        </div>
                        <div className="text-white text-xs font-medium">{result.test}</div>
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge className="text-[10px] py-0.5 px-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        {result.category}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{
                            width: `${result.score}%`,
                            background: `linear-gradient(90deg, ${colors.text}, ${colors.text}aa)`,
                            boxShadow: `0 0 10px ${colors.text}80`,
                          }} />
                        </div>
                        <span className="text-xs font-bold w-8 text-right" style={{ color: colors.text }}>{result.score}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                        ● {result.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right"><div className="text-gray-500 text-xs">{result.timestamp}</div></td>
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

import { Input } from '@/components/ui/input'
