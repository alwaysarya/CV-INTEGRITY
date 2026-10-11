import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, Search, Loader2, CheckCircle, XCircle, Award, AlertTriangle,
  Sparkles, ArrowRight, Target, Activity, TrendingUp, Layers, Zap
} from 'lucide-react'

const API = 'http://localhost:8000'

interface TrustScore {
  name: string
  score: number
  decision: string
  recommendation: string
  components?: Record<string, number>
}

/* ===== Animated orbital shield ===== */
function OrbitalShield() {
  return (
    <div className="relative w-[500px] h-[500px] flex items-center justify-center">
      {/* Outer ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[460px] h-[460px]"
      >
        <svg viewBox="0 0 460 460" className="w-full h-full">
          <circle cx="230" cy="230" r="220" fill="none" stroke="#0071E3" strokeWidth="1" strokeDasharray="4 12" opacity="0.4" />
          <circle cx="230" cy="10" r="4" fill="#5AC8FA" opacity="0.9" />
        </svg>
      </motion.div>

      {/* Middle ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[340px] h-[340px]"
      >
        <svg viewBox="0 0 340 340" className="w-full h-full">
          <circle cx="170" cy="170" r="160" fill="none" stroke="#AF52DE" strokeWidth="1.5" strokeDasharray="2 8" opacity="0.5" />
          <circle cx="170" cy="10" r="3.5" fill="#AF52DE" opacity="0.9" />
        </svg>
      </motion.div>

      {/* Inner ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[220px] h-[220px]"
      >
        <svg viewBox="0 0 220 220" className="w-full h-full">
          <circle cx="110" cy="110" r="100" fill="none" stroke="#5AC8FA" strokeWidth="2" strokeDasharray="1 6" opacity="0.6" />
          <circle cx="110" cy="10" r="3" fill="#5AC8FA" />
        </svg>
      </motion.div>

      {/* Center shield */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative flex h-32 w-32 items-center justify-center rounded-full"
        style={{
          background: 'linear-gradient(135deg, #0071E3, #AF52DE)',
          boxShadow: '0 0 80px #0071E390, 0 0 160px #AF52DE50, inset 0 0 40px rgba(255,255,255,0.3)',
        }}>
        <Shield size={56} className="text-white" strokeWidth={1.8} />
      </motion.div>

      {/* Floating particles */}
      {[
        { angle: 0, distance: 230, color: '#5AC8FA' },
        { angle: 90, distance: 230, color: '#AF52DE' },
        { angle: 180, distance: 230, color: '#0071E3' },
        { angle: 270, distance: 230, color: '#5AC8FA' },
      ].map((p, i) => {
        const rad = (p.angle * Math.PI) / 180
        const x = Math.cos(rad) * p.distance
        const y = Math.sin(rad) * p.distance
        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              transform: `translate(${x}px, ${y}px)`,
              background: p.color,
              boxShadow: `0 0 20px ${p.color}`,
            }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.4, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}
          />
        )
      })}
    </div>
  )
}

/* ===== Trust Flow visualization ===== */
function TrustFlow() {
  const stages = [
    { label: 'Contributor', color: '#5AC8FA' },
    { label: 'Dataset', color: '#0071E3' },
    { label: 'Model', color: '#AF52DE' },
    { label: 'Inference', color: '#5E5CE6' },
    { label: 'Output', color: '#30D158' },
  ]

  return (
    <div className="relative">
      {/* Connecting line */}
      <div className="absolute top-1/2 left-[6%] right-[6%] h-[2px] -translate-y-1/2 rounded-full bg-gradient-to-r from-[#5AC8FA] via-[#0071E3] via-[#AF52DE] to-[#30D158] opacity-25" />

      <div className="relative flex items-center justify-between gap-2">
        {stages.map((stage, i) => (
          <motion.div
            key={stage.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="flex flex-col items-center gap-3 flex-1"
          >
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-[14px] font-bold"
                style={{
                  background: `linear-gradient(135deg, ${stage.color}, ${stage.color}CC)`,
                  boxShadow: `0 12px 30px -6px ${stage.color}90`,
                }}
              >
                <CheckCircle size={22} strokeWidth={2.4} />
              </motion.div>
              <motion.div
                className="absolute inset-0 rounded-2xl"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3, ease: 'easeOut' }}
                style={{ background: `${stage.color}40` }}
              />
            </div>
            <span className="text-[12px] font-semibold tracking-[-0.005em] text-white/80 whitespace-nowrap">
              {stage.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export function Trust() {
  const [scores, setScores] = useState<TrustScore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => { loadScores() }, [])

  const loadScores = async () => {
    setLoading(true); setError(null)
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
    if (score >= 85) return { color: '#30D158', label: 'Excellent', decision: 'Accept' }
    if (score >= 70) return { color: '#0071E3', label: 'Good', decision: 'Accept' }
    if (score >= 50) return { color: '#FF9F0A', label: 'Fair', decision: 'Review' }
    return { color: '#FF453A', label: 'Poor', decision: 'Quarantine' }
  }

  const avgScore = scores.length ? Math.round(scores.reduce((s, x) => s + x.score, 0) / scores.length) : 0
  const acceptCount = scores.filter(s => s.score >= 70).length
  const reviewCount = scores.filter(s => s.score >= 50 && s.score < 70).length
  const quarantineCount = scores.filter(s => s.score < 50).length
  const bestEntity = [...scores].sort((a, b) => b.score - a.score)[0]

  return (
    <div className="min-h-screen bg-[#FBFBFD]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>

      {/* ===== HERO — Command center ===== */}
      <section className="relative overflow-hidden bg-black min-h-[90vh] flex items-center">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-[20%] -translate-y-1/2 w-[1100px] h-[1100px] rounded-full blur-[240px]"
            style={{ background: 'radial-gradient(circle, #0071E3, transparent 55%)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.45, 0.25] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[220px]"
            style={{ background: 'radial-gradient(circle, #AF52DE, transparent 55%)' }}
          />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
              maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
            }} />
        </div>

        <div className="relative mx-auto max-w-[1200px] px-6 py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl mb-8">
                <Sparkles size={13} className="text-[#5AC8FA]" />
                <span className="text-white/80 text-[11px] font-semibold tracking-[0.16em] uppercase">
                  Trust Matrix
                </span>
              </div>

              <h1 className="text-[72px] md:text-[96px] font-semibold leading-[0.94] tracking-[-0.05em] text-white">
                Trust,
                <br />
                <span className="bg-gradient-to-r from-[#5AC8FA] via-[#0071E3] to-[#AF52DE] bg-clip-text text-transparent">
                  quantified.
                </span>
              </h1>

              <p className="mt-8 max-w-[480px] text-[19px] leading-[1.5] tracking-[-0.015em] text-white/50">
                Weighted trust scores with component breakdowns. From dataset to inference.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-8">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#30D158]" style={{ boxShadow: '0 0 8px #30D158' }} />
                  <span className="text-white/70 text-[14px] font-medium">{acceptCount} accepted</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF9F0A]" style={{ boxShadow: '0 0 8px #FF9F0A' }} />
                  <span className="text-white/70 text-[14px] font-medium">{reviewCount} in review</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF453A]" style={{ boxShadow: '0 0 8px #FF453A' }} />
                  <span className="text-white/70 text-[14px] font-medium">{quarantineCount} quarantined</span>
                </div>
              </div>

              <div className="mt-12 flex flex-wrap items-center gap-3">
                <a href="#matrix" className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold tracking-[-0.01em] text-black transition-all hover:scale-[1.03]"
                  style={{ boxShadow: '0 0 60px rgba(255,255,255,0.3)' }}>
                  View Matrix
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
                </a>
                <a href="/datasets" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-7 py-3.5 text-[15px] font-medium tracking-[-0.01em] text-white/90 backdrop-blur-xl transition-all hover:bg-white/[0.08]">
                  Explore Datasets
                </a>
              </div>
            </motion.div>

            {/* Right: orbital shield */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-center"
            >
              <OrbitalShield />
            </motion.div>
          </div>

          {/* Live stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[1000px]"
          >
            {[
              { label: 'Average Trust', value: `${avgScore}%`, color: '#5AC8FA' },
              { label: 'Accepted', value: acceptCount, color: '#30D158' },
              { label: 'Review', value: reviewCount, color: '#FF9F0A' },
              { label: 'Quarantine', value: quarantineCount, color: '#FF453A' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + i * 0.1 }}
                className="relative rounded-2xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] p-5 overflow-hidden group hover:bg-white/[0.06] transition-all"
              >
                <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-opacity"
                  style={{ background: stat.color }} />
                <div className="relative text-[10px] font-bold tracking-[0.16em] uppercase text-white/40 mb-3">
                  {stat.label}
                </div>
                <div className="relative text-[36px] font-semibold leading-none tracking-[-0.04em] text-white tabular-nums"
                  style={{ textShadow: `0 0 40px ${stat.color}80` }}>
                  {stat.value}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== TRUST FLOW ===== */}
      <section className="relative bg-white py-32 px-6">
        <div className="mx-auto max-w-[1200px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0071E3]/10 border border-[#0071E3]/25 mb-5">
              <Activity size={12} className="text-[#0071E3]" />
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#0071E3]">Assurance Flow</span>
            </div>
            <h2 className="text-[52px] md:text-[64px] font-semibold tracking-[-0.04em] leading-[1.02] text-[#1D1D1F]">
              Five stages.
              <br />
              <span className="bg-gradient-to-r from-[#0071E3] to-[#AF52DE] bg-clip-text text-transparent">
                One trust score.
              </span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1 }}
            className="relative rounded-[40px] overflow-hidden bg-[#0A0A0F] p-12 md:p-16"
            style={{ boxShadow: '0 40px 120px -20px rgba(0,0,0,0.3)' }}
          >
            <div className="absolute inset-0">
              <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[180px] opacity-25"
                style={{ background: 'radial-gradient(circle, #0071E3, transparent 60%)' }} />
            </div>
            <div className="relative">
              <TrustFlow />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURED — Highest trust entity ===== */}
      {bestEntity && (
        <section className="relative bg-[#F5F5F7] py-32 px-6">
          <div className="mx-auto max-w-[1200px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0071E3]/10 border border-[#0071E3]/25 mb-5">
                <Award size={12} className="text-[#0071E3]" />
                <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#0071E3]">Top Trusted</span>
              </div>
              <h2 className="text-[52px] md:text-[64px] font-semibold tracking-[-0.04em] leading-[1.02] text-[#1D1D1F]">
                Most trusted
                <br />
                <span className="bg-gradient-to-r from-[#0071E3] to-[#AF52DE] bg-clip-text text-transparent">
                  entity today.
                </span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-[40px] overflow-hidden bg-[#0A0A0F]"
              style={{ boxShadow: '0 40px 120px -20px rgba(0,0,0,0.3)' }}
            >
              <div className="absolute inset-0">
                <div className="absolute top-0 left-1/4 w-[700px] h-[700px] rounded-full blur-[180px] opacity-30"
                  style={{ background: 'radial-gradient(circle, #0071E3, transparent 60%)' }} />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[180px] opacity-20"
                  style={{ background: 'radial-gradient(circle, #AF52DE, transparent 60%)' }} />
              </div>

              <div className="relative h-[2px] bg-gradient-to-r from-transparent via-[#0071E3] to-transparent" />

              <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 p-12 md:p-16 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl"
                      style={{
                        background: 'linear-gradient(135deg, #0071E3, #AF52DE)',
                        boxShadow: '0 16px 40px -8px #0071E390, 0 0 60px #0071E340',
                      }}>
                      <Shield size={28} className="text-white" strokeWidth={2.2} />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-white/40">Highest Score</div>
                      <div className="text-[14px] font-semibold text-white">Trust evaluation</div>
                    </div>
                  </div>

                  <h3 className="text-[56px] md:text-[72px] font-semibold leading-[1] tracking-[-0.045em] text-white">
                    {bestEntity.name}
                  </h3>

                  {bestEntity.recommendation && (
                    <p className="mt-6 text-[17px] leading-[1.5] tracking-[-0.01em] text-white/50 max-w-[440px]">
                      {bestEntity.recommendation}
                    </p>
                  )}

                  {bestEntity.components && Object.keys(bestEntity.components).length > 0 && (
                    <div className="mt-10 space-y-5 max-w-[400px]">
                      {Object.entries(bestEntity.components).slice(0, 3).map(([key, val], i) => {
                        const v = Number(val)
                        const colors = ['#5AC8FA', '#0071E3', '#AF52DE']
                        return (
                          <div key={key}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[12px] font-semibold tracking-[0.02em] uppercase text-white/50">
                                {key.replace(/_/g, ' ')}
                              </span>
                              <span className="text-[15px] font-bold tabular-nums" style={{ color: colors[i % 3] }}>
                                {v.toFixed(0)}%
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${Math.min(v, 100)}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                                className="h-full rounded-full"
                                style={{ background: `linear-gradient(90deg, ${colors[i % 3]}, ${colors[i % 3]}AA)`, boxShadow: `0 0 12px ${colors[i % 3]}80` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Giant animated donut */}
                <div className="flex items-center justify-center relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                    className="absolute w-[340px] h-[340px]"
                  >
                    <svg viewBox="0 0 340 340" className="w-full h-full">
                      <circle cx="170" cy="170" r="160" fill="none" stroke="#0071E3" strokeWidth="1" strokeDasharray="4 8" opacity="0.3" />
                    </svg>
                  </motion.div>
                  <svg viewBox="0 0 240 240" className="w-[240px] h-[240px] -rotate-90">
                    <circle cx="120" cy="120" r="108" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
                    <motion.circle
                      cx="120" cy="120" r="108"
                      fill="none" stroke="#5AC8FA" strokeWidth="12" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 108}
                      initial={{ strokeDashoffset: 2 * Math.PI * 108 }}
                      whileInView={{ strokeDashoffset: 2 * Math.PI * 108 * (1 - bestEntity.score / 100) }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                      style={{ filter: 'drop-shadow(0 0 24px #5AC8FA90)' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="flex items-baseline gap-0.5 font-semibold leading-none tracking-[-0.05em]" style={{ color: '#5AC8FA' }}>
                      <span className="text-[72px]">{bestEntity.score.toFixed(0)}</span>
                      <span className="text-[28px] opacity-50">%</span>
                    </div>
                    <div className="mt-3 text-[10px] font-bold tracking-[0.22em] uppercase text-white/50">
                      Trust Score
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ===== ALL ENTITIES ===== */}
      <section id="matrix" className="relative bg-[#FBFBFD] py-32 px-6">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-[1px] bg-[#1D1D1F]/30" />
                <span className="text-[11px] font-bold tracking-[0.24em] uppercase text-[#1D1D1F]/50">
                  Trust Matrix
                </span>
              </div>
              <h2 className="text-[48px] md:text-[64px] font-semibold tracking-[-0.04em] leading-[1.0] text-[#1D1D1F]">
                Full
                <br />inventory.
              </h2>
              <p className="mt-4 text-[15px] text-[#6E6E73] tracking-[-0.01em]">
                {filtered.length} {filtered.length === 1 ? 'entity' : 'entities'} evaluated
              </p>
            </div>

            <div className="w-full md:w-[360px]">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6E6E73]" strokeWidth={2.2} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search entities"
                  className="w-full rounded-2xl bg-white border border-black/[0.06] py-4 pl-11 pr-4 text-[15px] text-[#1D1D1F] outline-none placeholder:text-[#86868B] focus:border-[#0071E3]/40 focus:ring-4 focus:ring-[#0071E3]/10 transition-all"
                />
              </div>
            </div>
          </div>

          {loading && scores.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-72 rounded-[28px] bg-white border border-black/[0.04] animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[24px] bg-white py-32 text-center border border-black/[0.04]">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5F5F7] mb-4">
                <Shield size={28} className="text-[#86868B]" strokeWidth={1.8} />
              </div>
              <div className="mt-4 text-[18px] font-semibold text-[#1D1D1F]">No entities found</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.map((s, i) => {
                const theme = getTheme(s.score)
                const components = s.components || {}
                return (
                  <motion.div
                    key={s.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6, delay: Math.min(i * 0.06, 0.4), ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -6 }}
                    className="group relative overflow-hidden rounded-[28px] bg-white border border-black/[0.04] transition-all"
                    style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
                  >
                    <div className="h-1" style={{ background: `linear-gradient(90deg, ${theme.color}, ${theme.color}00)` }} />

                    <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ background: `${theme.color}20` }} />

                    <div className="relative p-7">
                      <div className="flex items-center justify-between mb-7">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl"
                            style={{ background: `${theme.color}15`, border: `1px solid ${theme.color}30` }}>
                            <Shield size={18} style={{ color: theme.color }} strokeWidth={2.2} />
                          </div>
                          <div>
                            <div className="text-[17px] font-semibold tracking-[-0.02em] text-[#1D1D1F]">{s.name}</div>
                            <div className="mt-0.5 text-[11px] text-[#86868B]">Trust evaluation</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                          style={{ background: `${theme.color}15`, border: `1px solid ${theme.color}30` }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: theme.color }} />
                          <span className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: theme.color }}>
                            {theme.decision}
                          </span>
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="flex items-baseline gap-1.5 font-semibold leading-none tracking-[-0.05em]">
                          <span className="text-[64px]" style={{ color: theme.color, textShadow: `0 0 40px ${theme.color}40` }}>
                            {s.score.toFixed(0)}
                          </span>
                          <span className="text-[28px] opacity-30 text-[#1D1D1F]">%</span>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#86868B]">
                            Trust Score
                          </span>
                          <span className="text-[10px] font-bold tracking-[0.16em] uppercase px-2 py-0.5 rounded-full"
                            style={{ background: `${theme.color}15`, color: theme.color, border: `1px solid ${theme.color}30` }}>
                            {theme.label}
                          </span>
                        </div>
                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-[#F0F0F2] mb-6">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${Math.min(s.score, 100)}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${theme.color}, ${theme.color}AA)` }}
                        />
                      </div>

                      {Object.keys(components).length > 0 && (
                        <div className="pt-5 border-t border-[#F0F0F2]">
                          <div className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#AEAEB2] mb-4">
                            Component Breakdown
                          </div>
                          <div className="space-y-3">
                            {Object.entries(components).map(([key, val], idx) => {
                              const v = Number(val)
                              const compColor = v >= 75 ? '#30D158' : v >= 50 ? '#FF9F0A' : '#FF453A'
                              return (
                                <div key={key}>
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[11px] font-semibold capitalize text-[#6E6E73]">
                                      {key.replace(/_/g, ' ')}
                                    </span>
                                    <span className="text-[12px] font-bold tabular-nums" style={{ color: compColor }}>
                                      {v.toFixed(0)}%
                                    </span>
                                  </div>
                                  <div className="h-1 rounded-full bg-[#F0F0F2] overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      whileInView={{ width: `${Math.min(v, 100)}%` }}
                                      viewport={{ once: true }}
                                      transition={{ duration: 0.8, delay: 0.2 + idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
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

                      {s.recommendation && (
                        <div className="mt-6 pt-5 border-t border-[#F0F0F2] flex items-start gap-2">
                          <Award size={12} className="text-[#86868B] mt-0.5 flex-shrink-0" strokeWidth={2.2} />
                          <span className="text-[12px] text-[#6E6E73] leading-[1.5]">{s.recommendation}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ===== BOTTOM CTA ===== */}
      <section className="relative bg-black py-40 px-6 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] rounded-full blur-[260px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0071E3, transparent 55%)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[220px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #AF52DE, transparent 55%)' }}
        />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="w-[700px] h-[700px]"
          >
            <svg viewBox="0 0 700 700" className="w-full h-full">
              <circle cx="350" cy="350" r="330" fill="none" stroke="#5AC8FA" strokeWidth="1" strokeDasharray="4 8" opacity="0.25" />
            </svg>
          </motion.div>
        </div>

        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              left: `${15 + (i * 8) % 70}%`,
              top: `${25 + (i * 11) % 55}%`,
              background: i % 2 === 0 ? '#5AC8FA' : '#AF52DE',
              boxShadow: `0 0 15px ${i % 2 === 0 ? '#5AC8FA' : '#AF52DE'}`,
            }}
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.9, 0.2] }}
            transition={{ duration: 4 + (i % 3), repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1 }}
          className="relative max-w-[900px] mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl mb-10">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-[#5AC8FA]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ boxShadow: '0 0 8px #5AC8FA' }}
            />
            <span className="text-white/80 text-[11px] font-semibold tracking-[0.16em] uppercase">
              Weighted Trust
            </span>
          </div>

          <h2 className="text-[72px] md:text-[112px] font-semibold leading-[0.9] tracking-[-0.05em] text-white">
            Quantify trust.
            <br />
            <motion.span
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-block bg-gradient-to-r from-[#5AC8FA] via-[#0071E3] via-[#AF52DE] to-[#5AC8FA] bg-clip-text text-transparent bg-[length:200%_100%]"
            >
              Act with confidence.
            </motion.span>
          </h2>

          <p className="mt-10 text-[21px] leading-[1.5] tracking-[-0.015em] text-white/50 max-w-[520px] mx-auto">
            Every dataset, model, and inference — scored, weighted, and recommendation-ready.
          </p>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
            <a href="/datasets" className="group relative inline-flex items-center gap-2 rounded-full bg-white text-black px-8 py-4 text-[15px] font-semibold tracking-[-0.01em] transition-all hover:scale-[1.03] overflow-hidden"
              style={{ boxShadow: '0 20px 60px -12px rgba(255,255,255,0.4)' }}>
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
              <span className="relative">View Datasets</span>
              <ArrowRight size={15} className="relative transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
            </a>
            <a href="/analytics" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] backdrop-blur-xl text-white px-8 py-4 text-[15px] font-medium tracking-[-0.01em] transition-all hover:bg-white/[0.08]">
              Analytics
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

export default Trust
