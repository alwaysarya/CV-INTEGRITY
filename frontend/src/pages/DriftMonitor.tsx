import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingDown, TrendingUp, AlertTriangle, CheckCircle, Activity,
  Loader2, RefreshCw, Gauge, ArrowRight, Sparkles, Radar, Signal,
  BarChart3, Target, Lock, Server, Radio, Shield, Zap, Waves, Eye
} from 'lucide-react'
import apiClient from '@/lib/api'

const API = 'http://localhost:8000'

const severityTheme: Record<string, { color: string; label: string }> = {
  Stable: { color: '#30D158', label: 'Stable' },
  Warning: { color: '#FF9F0A', label: 'Warning' },
  Critical: { color: '#FF453A', label: 'Critical' },
}

/* ============================================================
   ANIMATED RADAR VISUALIZATION
   ============================================================ */
function RadarDisplay() {
  return (
    <div className="relative w-full h-[520px] flex items-center justify-center">
      {/* Rotating rings */}
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="absolute rounded-full"
          style={{
            width: `${i * 120}px`,
            height: `${i * 120}px`,
            border: `1.5px solid ${['#2DD4BF', '#30D158', '#5AC8FA', '#0071E3'][i - 1]}25`,
          }}
        />
      ))}

      {/* Sweep */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[480px] h-[480px] rounded-full"
        style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(45,212,191,0.5) 45deg, transparent 45deg)' }}
      />

      {/* Threat blips */}
      {[
        { a: 45, d: 170, c: '#FF9F0A', l: 'WARN' },
        { a: 135, d: 140, c: '#30D158', l: 'OK' },
        { a: 225, d: 190, c: '#FF453A', l: 'CRIT' },
        { a: 315, d: 155, c: '#5AC8FA', l: 'MON' },
      ].map((dot, i) => {
        const rad = (dot.a * Math.PI) / 180
        return (
          <motion.div
            key={i}
            className="absolute flex flex-col items-center"
            style={{ transform: `translate(${Math.cos(rad) * dot.d}px, ${Math.sin(rad) * dot.d}px)` }}
            animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
          >
            <div className="w-3.5 h-3.5 rounded-full" style={{ background: dot.c, boxShadow: `0 0 24px ${dot.c}, 0 0 48px ${dot.c}60` }} />
            <div className="mt-2 text-[8px] font-bold tracking-[0.14em]" style={{ color: dot.c }}>{dot.l}</div>
          </motion.div>
        )
      })}

      {/* Center core */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative flex h-32 w-32 items-center justify-center rounded-full"
        style={{
          background: 'linear-gradient(135deg, #2DD4BF, #30D158)',
          boxShadow: '0 0 100px #2DD4BF90, 0 0 200px #2DD4BF50, inset 0 0 50px rgba(255,255,255,0.35)',
        }}
      >
        <Radar size={52} className="text-white" strokeWidth={2} />
      </motion.div>
    </div>
  )
}

/* ============================================================
   CIRCULAR DELTA GAUGE
   ============================================================ */
function DeltaGauge({ value, max, color }: { value: number; max: number; color: string }) {
  const r = 36
  const c = 2 * Math.PI * r
  const pct = Math.min(Math.abs(value) / max, 1)
  const off = c - pct * c
  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg viewBox="0 0 96 96" className="w-full h-full -rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
        <motion.circle
          cx="48" cy="48" r={r}
          fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: off }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 10px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[17px] font-bold tabular-nums tracking-[-0.02em]" style={{ color }}>
          {value >= 0 ? '+' : ''}{value.toFixed(1)}
        </div>
        <div className="text-[8px] font-bold tracking-[0.14em] uppercase text-white/40 mt-0.5">Delta</div>
      </div>
    </div>
  )
}

/* ============================================================
   SPARKLINE
   ============================================================ */
function Sparkline({ color, positive }: { color: string; positive: boolean }) {
  const pts = positive ? [20, 25, 22, 30, 28, 35, 32, 40] : [40, 35, 38, 30, 32, 25, 28, 20]
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * 25} ${40 - p}`).join(' ')
  return (
    <svg viewBox="0 0 200 40" className="w-full h-full">
      <defs>
        <linearGradient id={`sg-${color}-${positive}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path d={`${d} L 175 40 L 0 40 Z`} fill={`url(#sg-${color}-${positive})`}
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }} />
      <motion.path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
        style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
    </svg>
  )
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export function DriftMonitor() {
  const [drifts, setDrifts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [riskLevels, setRiskLevels] = useState<any[]>([])

  useEffect(() => {
    loadDrift()
    fetch(`${API}/api/drift/risk-levels`)
      .then(r => r.json())
      .then(d => { if (d.status === 'success') setRiskLevels(d.risk_levels || []) })
      .catch(() => null)
  }, [])

  const loadDrift = async () => {
    setLoading(true); setError(null)
    try {
      const [mRes, dRes] = await Promise.all([
        apiClient.getModels().catch(() => ({ data: { models: {} } })),
        apiClient.getDatasets().catch(() => ({ data: { datasets: {} } })),
      ])
      const models = mRes.data.models || {}
      const datasets = dRes.data.datasets || {}
      const list: any[] = []

      Object.entries(models).forEach(([k, v]: [string, any]) => {
        const cur = v.mAP50 || 0, base = 20, chg = cur - base
        list.push({
          id: `m_${k}`, name: `${k.toUpperCase()} Model`, metric: 'mAP50', kind: 'model',
          baseline: base, current: cur, change: chg,
          severity: Math.abs(chg) < 3 ? 'Stable' : Math.abs(chg) < 5 ? 'Warning' : 'Critical',
        })
      })
      Object.entries(datasets).forEach(([k, v]: [string, any]) => {
        const cur = v.overall_score || 0, base = 85, chg = cur - base
        list.push({
          id: `d_${k}`, name: `${k.toUpperCase()} Dataset`, metric: 'Overall Quality', kind: 'dataset',
          baseline: base, current: cur, change: chg,
          severity: Math.abs(chg) < 5 ? 'Stable' : Math.abs(chg) < 15 ? 'Warning' : 'Critical',
        })
      })
      setDrifts(list)
    } catch (err: any) { setError(err.message) } finally { setLoading(false) }
  }

  const getTheme = (s: string) => severityTheme[s] || severityTheme.Stable
  const stable = drifts.filter(d => d.severity === 'Stable').length
  const warn = drifts.filter(d => d.severity === 'Warning').length
  const crit = drifts.filter(d => d.severity === 'Critical').length
  const avgDelta = drifts.length ? drifts.reduce((s, d) => s + d.change, 0) / drifts.length : 0

  return (
    <div className="min-h-screen bg-black" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-[20%] -translate-y-1/2 w-[1200px] h-[1200px] rounded-full blur-[280px]"
            style={{ background: 'radial-gradient(circle, #2DD4BF, transparent 55%)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.25, 0.45, 0.25] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[900px] h-[900px] rounded-full blur-[260px]"
            style={{ background: 'radial-gradient(circle, #30D158, transparent 55%)' }}
          />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
              maskImage: 'radial-gradient(ellipse at center, black 25%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 25%, transparent 70%)',
            }} />
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${(i * 37) % 100}%`,
                top: `${(i * 43) % 100}%`,
                background: ['#2DD4BF', '#30D158', '#5AC8FA'][i % 3],
                boxShadow: `0 0 10px ${['#2DD4BF', '#30D158', '#5AC8FA'][i % 3]}`,
              }}
              animate={{ y: [0, -50, 0], opacity: [0.15, 0.9, 0.15] }}
              transition={{ duration: 4 + (i % 4), repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-[1300px] px-6 py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl mb-8">
                <motion.span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]"
                  animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ boxShadow: '0 0 10px #2DD4BF' }} />
                <span className="text-white/80 text-[11px] font-semibold tracking-[0.16em] uppercase">
                  Signal Command · Live
                </span>
              </div>

              <h1 className="text-[80px] md:text-[104px] font-semibold leading-[0.92] tracking-[-0.05em] text-white">
                Drift
                <br />
                <motion.span
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-block bg-gradient-to-r from-[#2DD4BF] via-[#30D158] via-[#5AC8FA] to-[#2DD4BF] bg-clip-text text-transparent bg-[length:200%_100%]"
                >
                  detected.
                </motion.span>
              </h1>

              <p className="mt-8 max-w-[520px] text-[19px] leading-[1.55] tracking-[-0.015em] text-white/50">
                Continuous monitoring of model and dataset metrics against baseline thresholds. Early warnings, zero surprises.
              </p>

              <div className="mt-10 grid grid-cols-3 gap-6 max-w-[480px]">
                {[
                  { l: 'Stable', v: stable, c: '#30D158' },
                  { l: 'Warning', v: warn, c: '#FF9F0A' },
                  { l: 'Critical', v: crit, c: '#FF453A' },
                ].map((s, i) => (
                  <motion.div key={s.l}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
                  >
                    <div className="text-[36px] font-semibold leading-none tabular-nums tracking-[-0.04em]"
                      style={{ color: s.c, textShadow: `0 0 40px ${s.c}90` }}>
                      {s.v}
                    </div>
                    <div className="mt-2 text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">{s.l}</div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-12 flex flex-wrap items-center gap-3">
                <a href="#monitors" className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-[15px] font-semibold text-black transition-all hover:scale-[1.03]"
                  style={{ boxShadow: '0 0 60px rgba(255,255,255,0.35)' }}>
                  View Monitors
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
                </a>
                <button onClick={loadDrift}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-8 py-4 text-[15px] font-medium text-white/90 backdrop-blur-xl transition-all hover:bg-white/[0.08]">
                  <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.4, delay: 0.3 }} className="flex items-center justify-center">
              <RadarDisplay />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== FEATURE CARDS ===== */}
      <section className="relative py-28 px-6">
        <div className="mx-auto max-w-[1300px]">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2DD4BF]/10 border border-[#2DD4BF]/25 mb-5">
              <Sparkles size={12} className="text-[#2DD4BF]" />
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#2DD4BF]">Core Capabilities</span>
            </div>
            <h2 className="text-[52px] md:text-[68px] font-semibold tracking-[-0.04em] leading-[1.02] text-white">
              Built for
              <br />
              <span className="bg-gradient-to-r from-[#2DD4BF] via-[#30D158] to-[#5AC8FA] bg-clip-text text-transparent">
                continuous trust.
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Target, label: 'Baseline Tracking', desc: 'Fixed reference values per metric', color: '#2DD4BF' },
              { icon: Gauge, label: 'Delta Analysis', desc: 'Instant drift measurement', color: '#30D158' },
              { icon: Signal, label: 'Severity Alerts', desc: 'Real-time tiered notifications', color: '#FF9F0A' },
              { icon: BarChart3, label: 'Trend Prediction', desc: 'Forecast next drift window', color: '#5AC8FA' },
            ].map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div key={f.label}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.6, delay: i * 0.08 }}
                  whileHover={{ y: -8 }}
                  className="group relative overflow-hidden rounded-[28px] p-8 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 20px 60px -15px rgba(0,0,0,0.4)',
                  }}>
                  <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl opacity-20 group-hover:opacity-50 transition-opacity duration-500"
                    style={{ background: f.color }} />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl mb-6"
                    style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}>
                    <Icon size={22} style={{ color: f.color }} strokeWidth={2.2} />
                  </div>
                  <div className="relative text-[17px] font-semibold tracking-[-0.02em] text-white mb-2">{f.label}</div>
                  <div className="relative text-[13px] leading-[1.5] text-white/40 tracking-[-0.005em]">{f.desc}</div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== LIVE WAVEFORM ===== */}
      <section className="relative py-20 px-6">
        <div className="mx-auto max-w-[1400px]">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1 }}
            className="relative rounded-[40px] overflow-hidden p-12"
            style={{
              background: 'linear-gradient(135deg, rgba(45,212,191,0.08), rgba(48,209,88,0.03))',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 40px 120px -20px rgba(45,212,191,0.25)',
            }}>
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#2DD4BF] to-transparent" />
            <div className="relative flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <motion.span className="w-2 h-2 rounded-full bg-[#2DD4BF]"
                  animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ boxShadow: '0 0 10px #2DD4BF' }} />
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#2DD4BF]">Live Signal Stream</span>
              </div>
              <div className="text-[11px] font-mono text-white/40">1400 samples/s</div>
            </div>
            <div className="relative h-40">
              <svg viewBox="0 0 1400 160" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="wave-g" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2DD4BF" />
                    <stop offset="30%" stopColor="#30D158" />
                    <stop offset="50%" stopColor="#5AC8FA" />
                    <stop offset="70%" stopColor="#0071E3" />
                    <stop offset="100%" stopColor="#2DD4BF" />
                  </linearGradient>
                  <linearGradient id="wave-f" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <motion.path
                  d="M 0 80 Q 100 30, 200 80 T 400 80 T 600 80 T 800 80 T 1000 80 T 1200 80 T 1400 80"
                  fill="none" stroke="url(#wave-g)" strokeWidth="3" strokeLinecap="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ filter: 'drop-shadow(0 0 14px #2DD4BF)' }} />
                <motion.path
                  d="M 0 80 Q 100 30, 200 80 T 400 80 T 600 80 T 800 80 T 1000 80 T 1200 80 T 1400 80 L 1400 160 L 0 160 Z"
                  fill="url(#wave-f)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} />
              </svg>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== MONITORS LIST ===== */}
      <section id="monitors" className="relative py-32 px-6">
        <div className="mx-auto max-w-[1300px]">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }} className="mb-16">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-[1px] bg-white/30" />
              <span className="text-[11px] font-bold tracking-[0.24em] uppercase text-white/50">Live Monitors</span>
            </div>
            <h2 className="text-[52px] md:text-[72px] font-semibold tracking-[-0.04em] leading-[1.0] text-white">
              Every metric,
              <br />tracked.
            </h2>
            <p className="mt-4 text-[15px] text-white/40">{drifts.length} metrics against baseline</p>
          </motion.div>

          {loading && drifts.length === 0 ? (
            <div className="space-y-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-44 rounded-[32px] bg-white/[0.03] border border-white/[0.06] animate-pulse" />
              ))}
            </div>
          ) : drifts.length === 0 ? (
            <div className="rounded-[32px] py-32 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Activity size={44} className="mx-auto text-white/20" strokeWidth={1.8} />
              <div className="mt-4 text-[18px] font-semibold text-white">No monitors</div>
            </div>
          ) : (
            <div className="space-y-5">
              {drifts.map((d, i) => {
                const theme = getTheme(d.severity)
                const pos = d.change >= 0
                return (
                  <motion.div key={d.id}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6, delay: Math.min(i * 0.06, 0.4) }}
                    whileHover={{ x: 6 }}
                    className="group relative overflow-hidden rounded-[32px] transition-all"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
                      border: '1px solid rgba(255,255,255,0.08)',
                      boxShadow: '0 20px 60px -15px rgba(0,0,0,0.4)',
                    }}>
                    <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: `linear-gradient(180deg, ${theme.color}, ${theme.color}60)` }} />
                    <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ background: `${theme.color}25` }} />

                    <div className="relative flex items-center gap-6 px-9 py-8">
                      <DeltaGauge value={d.change} max={20} color={theme.color} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl flex-shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${theme.color}, ${theme.color}CC)`,
                              boxShadow: `0 10px 28px -6px ${theme.color}80`,
                            }}>
                            {pos ? <TrendingUp size={19} className="text-white" strokeWidth={2.4} /> : <TrendingDown size={19} className="text-white" strokeWidth={2.4} />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[19px] font-semibold tracking-[-0.02em] text-white truncate">{d.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] font-mono uppercase text-white/40">{d.kind}</span>
                              <span className="w-1 h-1 rounded-full bg-white/20" />
                              <span className="text-[11px] text-white/40">{d.metric}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08]">
                            <span className="text-[9px] font-bold tracking-[0.14em] uppercase text-white/40">Base</span>
                            <span className="text-[12px] font-semibold font-mono text-white/70">{d.baseline.toFixed(1)}</span>
                          </div>
                          <ArrowRight size={11} className="text-white/20" />
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.07] border border-white/[0.1]">
                            <span className="text-[9px] font-bold tracking-[0.14em] uppercase text-white/40">Curr</span>
                            <span className="text-[12px] font-bold font-mono text-white">{d.current.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                            style={{ background: `${theme.color}15`, border: `1px solid ${theme.color}35` }}>
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: theme.color, boxShadow: `0 0 8px ${theme.color}` }} />
                            <span className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: theme.color }}>
                              {theme.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="w-[220px] h-16 flex-shrink-0 opacity-85">
                        <Sparkline color={theme.color} positive={pos} />
                      </div>

                      <div className="flex items-center gap-1.5 text-[13px] font-semibold flex-shrink-0 transition-all" style={{ color: theme.color }}>
                        <span className="hidden md:inline">Details</span>
                        <ArrowRight size={14} strokeWidth={2.4} className="transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ===== TRUST STRIP ===== */}
      <section className="relative py-20 px-6">
        <div className="mx-auto max-w-[1200px]">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {[
              { label: 'Air-gapped', color: '#2DD4BF', icon: Server },
              { label: 'SHA-256 signed', color: '#30D158', icon: Lock },
              { label: 'Live tracking', color: '#5AC8FA', icon: Radio },
              { label: 'NIST aligned', color: '#0071E3', icon: Shield },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                    <Icon size={15} style={{ color: item.color }} strokeWidth={2.2} />
                  </div>
                  <span className="text-[13px] font-medium text-white/60">{item.label}</span>
                </div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ===== BOTTOM CTA ===== */}
      <section className="relative py-44 px-6 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1300px] h-[1300px] rounded-full blur-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #2DD4BF, transparent 55%)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[900px] h-[900px] rounded-full blur-[260px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #30D158, transparent 55%)' }}
        />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} className="w-[800px] h-[800px]">
            <svg viewBox="0 0 800 800" className="w-full h-full">
              <circle cx="400" cy="400" r="380" fill="none" stroke="#2DD4BF" strokeWidth="1" strokeDasharray="4 10" opacity="0.3" />
            </svg>
          </motion.div>
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} className="absolute top-0 left-0 w-[800px] h-[800px]">
            <svg viewBox="0 0 800 800" className="w-full h-full">
              <circle cx="400" cy="400" r="300" fill="none" stroke="#30D158" strokeWidth="1" strokeDasharray="2 8" opacity="0.4" />
            </svg>
          </motion.div>
        </div>

        {Array.from({ length: 18 }).map((_, i) => (
          <motion.div key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              left: `${10 + (i * 5) % 80}%`,
              top: `${20 + (i * 11) % 60}%`,
              background: ['#2DD4BF', '#30D158', '#5AC8FA'][i % 3],
              boxShadow: `0 0 15px ${['#2DD4BF', '#30D158', '#5AC8FA'][i % 3]}`,
            }}
            animate={{ y: [0, -40, 0], opacity: [0.15, 0.9, 0.15] }}
            transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: i * 0.25 }}
          />
        ))}

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1 }}
          className="relative max-w-[900px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl mb-10">
            <motion.span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]"
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{ boxShadow: '0 0 8px #2DD4BF' }} />
            <span className="text-white/80 text-[11px] font-semibold tracking-[0.16em] uppercase">Always Watching</span>
          </div>

          <h2 className="text-[80px] md:text-[128px] font-semibold leading-[0.88] tracking-[-0.05em] text-white">
            Drift caught,
            <br />
            <motion.span
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-block bg-gradient-to-r from-[#2DD4BF] via-[#30D158] via-[#5AC8FA] to-[#2DD4BF] bg-clip-text text-transparent bg-[length:200%_100%]"
            >
              models protected.
            </motion.span>
          </h2>

          <p className="mt-10 text-[21px] leading-[1.5] text-white/50 max-w-[520px] mx-auto">
            Continuous monitoring. Early warnings. Zero surprises in production.
          </p>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
            <a href="/models" className="group relative inline-flex items-center gap-2 rounded-full bg-white text-black px-8 py-4 text-[15px] font-semibold overflow-hidden transition-all hover:scale-[1.03]"
              style={{ boxShadow: '0 20px 60px -12px rgba(255,255,255,0.4)' }}>
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
              <span className="relative">View Models</span>
              <ArrowRight size={15} className="relative transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
            </a>
            <a href="/robustness" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] backdrop-blur-xl text-white px-8 py-4 text-[15px] font-medium transition-all hover:bg-white/[0.08]">
              Robustness
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

export default DriftMonitor
