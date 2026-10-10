import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, Search, Loader2, RefreshCw, CheckCircle, XCircle,
  Award, TrendingUp, AlertTriangle, Hash, Database, Cpu, Activity
} from 'lucide-react'

const API = 'http://localhost:8000'

interface TrustScore {
  name: string
  score: number
  decision: string
  recommendation: string
  components?: Record<string, number>
}

export function Trust() {
  const [scores, setScores] = useState<TrustScore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => { loadScores() }, [])

  const loadScores = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/api/trust-scores`)
      const data = await res.json()
      const ts = data.trust_scores || {}
      const list: TrustScore[] = Object.entries(ts).map(([key, val]: [string, any]) => ({
        name: key.toUpperCase(),
        score: Number(val.final_score || 0),
        decision: (val.decision || 'REVIEW').replace(/[✅⚠️❌]/g, '').trim(),
        recommendation: val.recommendation || '',
        components: val.components || {},
      }))
      setScores(list)
    } catch (err: any) {
      setError(err.message || 'Backend error')
    } finally { setLoading(false) }
  }

  const filtered = scores.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))

  const getTheme = (score: number) => {
    if (score >= 85) return { bg: '#D1FAE5', text: '#065F46', dot: '#10B981', label: 'Excellent', decision: 'Accept' }
    if (score >= 70) return { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6', label: 'Good', decision: 'Accept' }
    if (score >= 50) return { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B', label: 'Fair', decision: 'Review' }
    return { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444', label: 'Poor', decision: 'Quarantine' }
  }

  const avgScore = scores.length
    ? Math.round(scores.reduce((s, x) => s + x.score, 0) / scores.length)
    : 0
  const acceptCount = scores.filter(s => s.score >= 70).length
  const reviewCount = scores.filter(s => s.score >= 50 && s.score < 70).length
  const quarantineCount = scores.filter(s => s.score < 50).length

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-6">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              CV-INTEGRITY / Trust
            </div>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">
              Trust Matrix
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Entity trust scores with component breakdown and disposition recommendations.
            </p>
          </div>
          <button
            onClick={loadScores}
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Average Trust', value: `${avgScore}%`, color: '#0F172A', icon: Shield },
            { label: 'Accepted', value: acceptCount, color: '#10B981', icon: CheckCircle },
            { label: 'Review', value: reviewCount, color: '#F59E0B', icon: AlertTriangle },
            { label: 'Quarantine', value: quarantineCount, color: '#EF4444', icon: XCircle },
          ].map((s) => (
            <motion.div
              key={s.label}
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="text-[12px] font-medium text-slate-500">{s.label}</div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${s.color}15` }}>
                  <s.icon size={14} style={{ color: s.color }} />
                </div>
              </div>
              <div className="mt-3 text-[32px] font-bold leading-none tracking-tight text-slate-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {s.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search entities..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-[13px] text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Trust scores */}
        <div className="mt-6">
          {loading && scores.length === 0 ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-20 text-[13px] text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              Loading trust scores...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <div className="text-[13px] font-medium text-red-700">Failed to load trust scores</div>
              <div className="mt-1 text-[11px] text-red-600">{error}</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center">
              <Shield size={32} className="mx-auto text-slate-400" />
              <div className="mt-3 text-[14px] font-medium text-slate-700">No trust data</div>
              <div className="mt-1 text-[11px] text-slate-500">
                {search ? 'Try a different search term' : 'Trust scores will appear once entities are evaluated'}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {filtered.map((s, i) => {
                const theme = getTheme(s.score)
                const components = s.components || {}
                return (
                  <motion.div
                    key={s.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ y: -3 }}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-slate-100 p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: theme.bg }}>
                          <Shield size={18} style={{ color: theme.text }} />
                        </div>
                        <div>
                          <div className="text-[15px] font-semibold text-slate-900">{s.name}</div>
                          <div className="mt-0.5 text-[11px] text-slate-500">Trust evaluation</div>
                        </div>
                      </div>
                      <span
                        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide"
                        style={{ background: theme.bg, color: theme.text }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: theme.dot }} />
                        {theme.decision}
                      </span>
                    </div>

                    {/* Score */}
                    <div className="p-5">
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                            Trust Score
                          </div>
                          <div className="mt-1 text-[42px] font-bold leading-none tracking-tight" style={{ color: theme.dot }}>
                            {s.score.toFixed(0)}
                            <span className="text-[18px]">%</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-medium text-slate-500">Level</div>
                          <div className="mt-1 text-[14px] font-semibold" style={{ color: theme.text }}>
                            {theme.label}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(s.score, 100)}%` }}
                          transition={{ duration: 0.8 }}
                          className="h-full rounded-full"
                          style={{ background: theme.dot }}
                        />
                      </div>
                    </div>

                    {/* Components */}
                    {Object.keys(components).length > 0 && (
                      <div className="border-t border-slate-100 p-5">
                        <div className="mb-3 text-[11px] font-medium text-slate-500">Component Breakdown</div>
                        <div className="space-y-2.5">
                          {Object.entries(components).map(([key, val]) => {
                            const v = Number(val)
                            const compColor = v >= 75 ? '#10B981' : v >= 50 ? '#F59E0B' : '#EF4444'
                            return (
                              <div key={key}>
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-medium capitalize text-slate-600">
                                    {key.replace(/_/g, ' ')}
                                  </span>
                                  <span className="font-mono font-semibold" style={{ color: compColor }}>
                                    {v.toFixed(0)}%
                                  </span>
                                </div>
                                <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-100">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(v, 100)}%` }}
                                    transition={{ duration: 0.6, delay: 0.1 }}
                                    className="h-full rounded-full"
                                    style={{ background: compColor }}
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Recommendation */}
                    {s.recommendation && (
                      <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Award size={12} className="text-slate-400" />
                          <span className="text-[11px] text-slate-600">{s.recommendation}</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Trust
