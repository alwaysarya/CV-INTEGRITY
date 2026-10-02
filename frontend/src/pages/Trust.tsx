import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Search, Eye, TrendingUp, CheckCircle, XCircle, Award, AlertTriangle, Loader2, RefreshCw, Check, Radio } from 'lucide-react'

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
        score: val.final_score || 0,
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

  const getLevel = (score: number) => {
    if (score >= 85) return 'EXCELLENT'
    if (score >= 70) return 'GOOD'
    if (score >= 50) return 'FAIR'
    return 'POOR'
  }

  const getColor = (score: number) => {
    if (score >= 85) return '#5EEAD4'
    if (score >= 70) return '#38BDF8'
    if (score >= 50) return '#FBBF24'
    return '#F87171'
  }

  const stats = {
    total: scores.length,
    avg: scores.length ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length) : 0,
    excellent: scores.filter((s) => s.score >= 85).length,
    needsReview: scores.filter((s) => s.score < 70).length,
  }

  // REAL pillars computed from backend components
  const components = scores.flatMap(s => Object.entries(s.components || {}))
  const aggComponents: Record<string, number[]> = {}
  scores.forEach(s => {
    Object.entries(s.components || {}).forEach(([k, v]) => {
      if (!aggComponents[k]) aggComponents[k] = []
      aggComponents[k].push(Number(v))
    })
  })
  const trustPillars = Object.entries(aggComponents).map(([key, values]) => ({
    label: key.replace(/_/g, ' '),
    value: values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length * 10) / 10 : 0,
  }))

  return (
    <div className="min-h-screen p-6" style={{ background: '#08080C', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Top header */}
      <div className="flex items-center justify-between mb-6 pb-4"
        style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center"
            style={{ background: 'rgba(94, 234, 212, 0.1)', border: '1px solid rgba(94, 234, 212, 0.4)' }}>
            <Shield size={14} style={{ color: '#5EEAD4' }} />
          </div>
          <div>
            <div className="text-[13px] font-bold tracking-[0.2em]" style={{ color: '#5EEAD4' }}>TRUST_MATRIX</div>
            <div className="text-[9px] tracking-[0.2em]" style={{ color: '#5EEAD4', opacity: 0.5 }}>COMPOSITE_ASSURANCE · NIST_AI_RMF</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#5EEAD4', opacity: 0.5 }} />
            <input
              placeholder="Search entities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded text-[11px] font-mono outline-none w-52"
              style={{ background: 'rgba(94, 234, 212, 0.05)', border: '1px solid rgba(94, 234, 212, 0.2)', color: '#FFFFFF' }}
            />
          </div>
          <button onClick={loadScores}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono tracking-wider"
            style={{ background: 'rgba(94, 234, 212, 0.08)', border: '1px solid rgba(94, 234, 212, 0.3)', color: '#5EEAD4' }}>
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            REFRESH
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded"
            style={{ background: 'rgba(94, 234, 212, 0.08)', border: '1px solid rgba(94, 234, 212, 0.3)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#5EEAD4' }} />
            <span className="text-[10px] font-mono tracking-wider" style={{ color: '#5EEAD4' }}>TIER_1</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded flex items-center gap-2"
          style={{ background: 'rgba(248, 113, 113, 0.08)', border: '1px solid rgba(248, 113, 113, 0.3)' }}>
          <AlertTriangle size={14} style={{ color: '#F87171' }} />
          <span className="text-[11px] font-mono" style={{ color: '#F87171' }}>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'TOTAL_ENTITIES', value: stats.total, color: '#3A7D8F', icon: TrendingUp },
          { label: 'AVG_TRUST_SCORE', value: `${stats.avg}%`, color: '#5EEAD4', icon: Award },
          { label: 'EXCELLENT', value: stats.excellent, color: '#5EEAD4', icon: CheckCircle },
          { label: 'NEEDS_REVIEW', value: stats.needsReview, color: '#F87171', icon: XCircle },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="p-4 rounded"
              style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono tracking-[0.2em]" style={{ color: '#5EEAD4', opacity: 0.5 }}>{s.label}</span>
                <Icon size={14} style={{ color: s.color, opacity: 0.7 }} />
              </div>
              <div className="text-[28px] font-bold font-mono leading-none" style={{ color: s.color }}>{s.value}</div>
            </div>
          )
        })}
      </div>

      {/* Trust Table */}
      <div className="p-5 rounded mb-5"
        style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin" size={28} style={{ color: '#5EEAD4' }} />
            <span className="ml-3 text-[12px] font-mono" style={{ color: '#5EEAD4', opacity: 0.6 }}>LOADING TRUST SCORES...</span>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.15)' }}>
                {['ENTITY', 'TRUST_SCORE', 'LEVEL', 'DECISION'].map((h, i) => (
                  <th key={h}
                    className={`text-[10px] font-mono tracking-[0.15em] uppercase pb-3 ${i < 2 ? 'text-left' : 'text-right'}`}
                    style={{ color: '#5EEAD4', opacity: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, idx) => {
                const color = getColor(s.score)
                const level = getLevel(s.score)
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.06)' }}>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded flex items-center justify-center"
                          style={{ background: `${color}15`, border: `1px solid ${color}40` }}>
                          <Shield size={15} style={{ color }} />
                        </div>
                        <div>
                          <div className="text-[13px] font-bold font-mono" style={{ color: '#FFFFFF' }}>{s.name}</div>
                          {s.recommendation && (
                            <div className="text-[10px] font-mono truncate max-w-xs" style={{ color: '#5EEAD4', opacity: 0.4 }}>{s.recommendation}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3 max-w-md">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden"
                          style={{ background: 'rgba(94, 234, 212, 0.1)' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${s.score}%` }}
                            transition={{ duration: 0.8 }}
                            className="h-full rounded-full"
                            style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                          />
                        </div>
                        <span className="text-[13px] font-bold font-mono w-12 text-right" style={{ color }}>
                          {s.score.toFixed(0)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-[10px] font-mono tracking-wider px-2.5 py-1 rounded"
                        style={{ background: `${color}15`, color, border: `1px solid ${color}40` }}>
                        {level}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-[11px] font-mono font-bold" style={{ color }}>
                        {s.decision}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Global Composite + Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        {/* Composite Index */}
        <div className="p-5 rounded"
          style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
          <div className="text-[10px] font-mono tracking-[0.2em] mb-3" style={{ color: '#5EEAD4', opacity: 0.6 }}>GLOBAL_COMPOSITE_INDEX</div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-[48px] font-bold font-mono leading-none" style={{ color: '#5EEAD4' }}>{stats.avg}</span>
            <span className="text-[18px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>/100</span>
          </div>
          <p className="text-[10px] font-mono leading-relaxed" style={{ color: '#5EEAD4', opacity: 0.5 }}>
            Synthesized from SHA-256 blockchain verification, adversarial evasion boundaries, backdoor checks, and drift monitoring.
          </p>
          <div className="flex gap-2 mt-4">
            <span className="text-[9px] px-2 py-0.5 rounded font-mono"
              style={{ background: 'rgba(94, 234, 212, 0.15)', color: '#5EEAD4', border: '1px solid rgba(94, 234, 212, 0.3)' }}>
              TIER_1
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded font-mono"
              style={{ background: 'rgba(94, 234, 212, 0.15)', color: '#5EEAD4', border: '1px solid rgba(94, 234, 212, 0.3)' }}>
              NIST_AI_RMF
            </span>
          </div>
        </div>

        {/* 6 Trust Pillars */}
        <div className="lg:col-span-2 p-5 rounded"
          style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
          <div className="text-[10px] font-mono tracking-[0.2em] mb-4" style={{ color: '#5EEAD4', opacity: 0.6 }}>6_TRUST_DIMENSION_PILLARS</div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {trustPillars.map((p, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono" style={{ color: '#FFFFFF', opacity: 0.8 }}>{p.label.toUpperCase()}</span>
                  <span className="text-[11px] font-bold font-mono" style={{ color: '#5EEAD4' }}>{p.value}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(94, 234, 212, 0.1)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p.value}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #5EEAD4, #38BDF8)', boxShadow: '0 0 6px #5EEAD4' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      </div>
  )
}
