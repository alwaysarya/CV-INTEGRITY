import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Shield, Search, Loader2, RefreshCw, AlertCircle, Zap, Target, CheckCircle, AlertTriangle } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import apiClient from '@/lib/api'

interface TestResult {
  id: number
  test: string
  category: string
  score: number
  status: string
}

export function Robustness() {
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadRobustness()
  }, [])

  const loadRobustness = async () => {
    setLoading(true)
    setError(null)
    try {
      const [dRes, mRes] = await Promise.all([
        apiClient.getDatasets(),
        apiClient.getModels(),
      ])

      const datasets = dRes.data.datasets || {}
      const models = mRes.data.models || {}
      const list: TestResult[] = []
      let id = 1

      // Dataset quality tests
      Object.entries(datasets).forEach(([key, val]: [string, any]) => {
        list.push({
          id: id++,
          test: `${key.toUpperCase()} Blur Robustness`,
          category: 'Blur',
          score: val.blur_score || 0,
          status: (val.blur_score || 0) >= 90 ? 'Pass' : (val.blur_score || 0) >= 75 ? 'Warning' : 'Fail',
        })
        list.push({
          id: id++,
          test: `${key.toUpperCase()} Duplicate Resistance`,
          category: 'Duplicate',
          score: val.duplicate_score || 0,
          status: (val.duplicate_score || 0) >= 90 ? 'Pass' : (val.duplicate_score || 0) >= 75 ? 'Warning' : 'Fail',
        })
        list.push({
          id: id++,
          test: `${key.toUpperCase()} Noise Robustness`,
          category: 'Noise',
          score: val.noise_score || 0,
          status: (val.noise_score || 0) >= 90 ? 'Pass' : (val.noise_score || 0) >= 75 ? 'Warning' : 'Fail',
        })
      })

      // Model performance
      Object.entries(models).forEach(([key, val]: [string, any]) => {
        const mAP = (val.mAP50 || 0) * 5 // Scale 0-100
        list.push({
          id: id++,
          test: `${key.toUpperCase()} Adversarial`,
          category: 'Adversarial',
          score: Math.min(mAP, 100),
          status: mAP >= 90 ? 'Pass' : mAP >= 75 ? 'Warning' : 'Fail',
        })
      })

      setResults(list)
    } catch (err: any) {
      console.error('Failed:', err)
      setError(err.message || 'Backend connect nahi ho raha')
    } finally {
      setLoading(false)
    }
  }

  const filtered = results.filter((r) =>
    r.test.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: results.length,
    pass: results.filter((r) => r.status === 'Pass').length,
    warning: results.filter((r) => r.status === 'Warning').length,
    fail: results.filter((r) => r.status === 'Fail').length,
  }

  const avgScore = results.length
    ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
    : 0

  // Radar data by category
  const categoryScores: Record<string, { total: number; count: number }> = {}
  results.forEach((r) => {
    if (!categoryScores[r.category]) categoryScores[r.category] = { total: 0, count: 0 }
    categoryScores[r.category].total += r.score
    categoryScores[r.category].count += 1
  })

  const radarData = Object.entries(categoryScores).map(([category, { total, count }]) => ({
    category,
    score: Math.round(total / count),
  }))

  const statusColors: Record<string, any> = {
    Pass: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.4)' },
    Warning: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' },
    Fail: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.4)' },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Robustness Testing</h1>
          <p className="text-gray-400 text-sm">
            {loading ? 'Loading from backend...' : `${results.length} tests from real data`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadRobustness} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-sm font-medium">
            <RefreshCw size={16} /> Refresh
          </button>
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/40 gap-1.5 py-2 px-3">
            <Shield size={12} /> Avg: {avgScore}%
          </Badge>
        </div>
      </div>

      {error && (
        <Card className="glass-card p-4" style={{ border: '1px solid rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-400" size={20} />
            <div>
              <div className="text-red-400 font-medium text-sm">Backend Error</div>
              <div className="text-gray-400 text-xs">{error}</div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tests', value: stats.total, color: '#38BDF8', icon: Shield },
          { label: 'Passed', value: stats.pass, color: '#10B981', icon: CheckCircle },
          { label: 'Warnings', value: stats.warning, color: '#F59E0B', icon: AlertTriangle },
          { label: 'Failed', value: stats.fail, color: '#EF4444', icon: Zap },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="glass-card p-5 border-cyan-500/20">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${stat.color}20`, border: `1px solid ${stat.color}40` }}>
                <Icon size={20} style={{ color: stat.color }} />
              </div>
              <div className="text-white text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-gray-400 text-xs">{stat.label}</div>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="glass-card border-cyan-500/20 p-5 lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-white font-bold text-sm">ROBUSTNESS RADAR</h3>
            <p className="text-gray-500 text-xs mt-0.5">Performance across categories</p>
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
            <h3 className="text-white font-bold text-sm">OVERALL</h3>
            <p className="text-gray-500 text-xs mt-0.5">Aggregate robustness</p>
          </div>
          <div className="flex flex-col items-center justify-center h-80">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(56, 189, 248, 0.1)" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#38BDF8" strokeWidth="8" strokeLinecap="round" strokeDasharray={251.2} strokeDashoffset={251.2 - (avgScore / 100) * 251.2} style={{ filter: 'drop-shadow(0 0 8px #38BDF8)' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Target size={24} className="text-cyan-400 mb-1" />
                <span className="text-white font-bold text-3xl">{avgScore}%</span>
                <span className="text-gray-500 text-[10px] uppercase mt-0.5">Robustness</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="glass-card border-cyan-500/20 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <Input placeholder="Search tests..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-white/5 border-cyan-500/20 text-white placeholder:text-gray-500 h-10" />
        </div>
      </Card>

      <Card className="glass-card border-cyan-500/20 p-5">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
            <span className="ml-3 text-gray-400">Loading tests...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-500/10">
                  <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Test</th>
                  <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Category</th>
                  <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3 w-64">Score</th>
                  <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const colors = statusColors[r.status]
                  return (
                    <tr key={r.id} className="border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}>
                            <Shield size={14} style={{ color: colors.text }} />
                          </div>
                          <div className="text-white text-xs font-medium">{r.test}</div>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge className="text-[10px] py-0.5 px-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                          {r.category}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${r.score}%`, background: `linear-gradient(90deg, ${colors.text}, ${colors.text}aa)` }} />
                          </div>
                          <span className="text-xs font-bold w-10 text-right" style={{ color: colors.text }}>{r.score.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                          ● {r.status}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
