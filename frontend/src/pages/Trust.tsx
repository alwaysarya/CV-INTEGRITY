import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Shield, Search, Eye, TrendingUp, CheckCircle, XCircle, Award, AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
import apiClient from '@/lib/api'

interface TrustScore {
  name: string
  score: number
  decision: string
  icon: string
  recommendation: string
  components?: Record<string, number>
}

// Compute score from components if score is missing
const computeScoreFromComponents = (components: Record<string, number>): number => {
  if (!components) return 0
  const values = Object.values(components).filter(v => typeof v === 'number')
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

export function Trust() {
  const [scores, setScores] = useState<TrustScore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadScores()
  }, [])

  const loadScores = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.getTrustScores()
      const data = res.data
      
      // Log for debugging
      console.log('Trust API Response:', JSON.stringify(data, null, 2))

      let list: TrustScore[] = []

      // Format 1: {trust_scores: {good: {...}, bad: {...}, worst: {...}}}
      if (data.trust_scores && typeof data.trust_scores === 'object') {
        list = Object.entries(data.trust_scores).map(([key, val]: [string, any]) => {
          const components = val.components || {}
          // Try score field first, then compute from components
          let score = typeof val.score === 'number' ? val.score : 0
          if (score === 0) {
            score = computeScoreFromComponents(components)
          }
          return {
            name: key.toUpperCase(),
            score,
            decision: val.decision ?? 'REVIEW',
            icon: val.icon ?? '⚠️',
            recommendation: val.recommendation ?? '',
            components,
          }
        })
      }
      // Format 2: Direct {GOOD: {...}, BAD: {...}, WORST: {...}}
      else if (data.GOOD || data.BAD || data.WORST) {
        list = Object.entries(data)
          .filter(([_, val]) => typeof val === 'object' && val !== null)
          .map(([key, val]: [string, any]) => {
            const components = val.components || {}
            let score = typeof val.score === 'number' ? val.score : 0
            if (score === 0) {
              score = computeScoreFromComponents(components)
            }
            return {
              name: key.toUpperCase(),
              score,
              decision: val.decision ?? 'REVIEW',
              icon: val.icon ?? '⚠️',
              recommendation: val.recommendation ?? '',
              components,
            }
          })
      }
      // Format 3: Array
      else if (Array.isArray(data)) {
        list = data.map((d: any, i: number) => {
          const components = d.components || {}
          let score = d.score ?? d.trust_score ?? 0
          if (score === 0) {
            score = computeScoreFromComponents(components)
          }
          return {
            name: d.name || `Item ${i + 1}`,
            score,
            decision: d.decision ?? 'REVIEW',
            icon: d.icon ?? '⚠️',
            recommendation: d.recommendation ?? '',
            components,
          }
        })
      }

      console.log('Parsed Scores:', list)
      setScores(list)
    } catch (err: any) {
      console.error('Failed:', err)
      setError(err.message || 'Backend connect nahi ho raha')
    } finally {
      setLoading(false)
    }
  }

  const filtered = scores.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  const getLevel = (score: number): string => {
    if (score >= 85) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 50) return 'Fair'
    return 'Poor'
  }

  const getLevelColors = (score: number) => {
    if (score >= 85) return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.4)' }
    if (score >= 70) return { bg: 'rgba(56, 189, 248, 0.15)', text: '#38BDF8', border: 'rgba(56, 189, 248, 0.4)' }
    if (score >= 50) return { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' }
    return { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.4)' }
  }

  const stats = {
    total: scores.length,
    avg: scores.length ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length) : 0,
    excellent: scores.filter((s) => s.score >= 85).length,
    needsReview: scores.filter((s) => s.score < 70).length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Trust Scores</h1>
          <p className="text-gray-400 text-sm">
            {loading ? 'Backend se load ho raha hai...' : `${scores.length} entities from backend`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadScores} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-sm font-medium hover:bg-cyan-500/30 transition-all">
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium">
            <Shield size={16} /> Run Verification
          </button>
        </div>
      </div>

      {error && (
        <Card className="glass-card p-4" style={{ border: '1px solid rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-400" size={20} />
            <div>
              <div className="text-red-400 font-medium text-sm">Backend Error</div>
              <div className="text-gray-400 text-xs">{error}</div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Entities', value: stats.total, color: '#38BDF8', icon: TrendingUp },
          { label: 'Avg Trust Score', value: `${stats.avg}%`, color: '#10B981', icon: Award },
          { label: 'Excellent', value: stats.excellent, color: '#10B981', icon: CheckCircle },
          { label: 'Needs Review', value: stats.needsReview, color: '#EF4444', icon: XCircle },
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

      <Card className="glass-card border-cyan-500/20 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <Input
            placeholder="Search entities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-cyan-500/20 text-white placeholder:text-gray-500 h-10"
          />
        </div>
      </Card>

      <Card className="glass-card border-cyan-500/20 p-5">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
            <span className="ml-3 text-gray-400">Loading trust scores...</span>
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-500/10">
                  <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Entity</th>
                  <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3 w-64">Trust Score</th>
                  <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Level</th>
                  <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Decision</th>
                  <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, idx) => {
                  const colors = getLevelColors(s.score)
                  const level = getLevel(s.score)
                  return (
                    <tr key={idx} className="border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}>
                            <Shield size={14} style={{ color: colors.text }} />
                          </div>
                          <div>
                            <div className="text-white text-xs font-bold">{s.name}</div>
                            {s.recommendation && (
                              <div className="text-gray-500 text-[10px] mt-0.5 truncate max-w-xs">{s.recommendation}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${s.score}%`, background: `linear-gradient(90deg, ${colors.text}, ${colors.text}cc)`, boxShadow: `0 0 10px ${colors.text}80` }} />
                          </div>
                          <span className="text-xs font-bold w-10 text-right" style={{ color: colors.text }}>{s.score.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                          {level}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <div className="text-gray-400 text-xs">{s.decision}</div>
                      </td>
                      <td className="py-3 text-right">
                        <button className="p-1.5 rounded hover:bg-cyan-500/10 text-gray-400 hover:text-cyan-400">
                          <Eye size={12} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Shield size={48} className="text-gray-600 mx-auto mb-3" />
            <div className="text-gray-400 text-sm">No trust scores found</div>
          </div>
        )}
      </Card>

      {/* Component Breakdown */}
      {scores.length > 0 && scores[0].components && Object.keys(scores[0].components).length > 0 && (
        <Card className="glass-card border-cyan-500/20 p-5">
          <div className="mb-4">
            <h3 className="text-white font-bold text-sm">SCORE COMPONENTS — {scores[0].name}</h3>
            <p className="text-gray-500 text-xs mt-0.5">Trust score breakdown</p>
          </div>
          <div className="space-y-3">
            {Object.entries(scores[0].components).map(([key, val]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-300 text-xs capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="text-white text-xs font-bold">{Number(val).toFixed(1)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${val}%`, background: 'linear-gradient(90deg, #38BDF8, #8B5CF6)' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
