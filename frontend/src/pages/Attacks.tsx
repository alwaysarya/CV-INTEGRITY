import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle, Loader2, Shield, Search, Check, X,
  Sparkles, ArrowRight, Target, Activity, Zap, Lock, Radar
} from 'lucide-react'
import axios from 'axios'

const API = 'http://localhost:8000'

interface Attack {
  id: string
  name: string
  description: string
  severity: string
  detected: boolean
  detection_method?: string
  result?: string
}

const severityTheme: Record<string, { color: string; label: string }> = {
  CRITICAL: { color: '#FF453A', label: 'Critical' },
  HIGH: { color: '#FF9F0A', label: 'High' },
  MEDIUM: { color: '#0071E3', label: 'Medium' },
  LOW: { color: '#30D158', label: 'Low' },
}

function RadarVisualization() {
  return (
    <div className="relative w-[400px] h-[400px] flex items-center justify-center">
      {/* Concentric rings */}
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="absolute rounded-full border-2"
          style={{
            width: `${i * 90}px`,
            height: `${i * 90}px`,
            borderColor: `rgba(255, 69, 58, ${0.4 - i * 0.08})`,
          }}
        />
      ))}

      {/* Rotating sweep */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[360px] h-[360px]"
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[180px] h-[180px] origin-bottom-left"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,69,58,0.4) 60deg, transparent 60deg)',
            borderRadius: '100% 0 0 0',
            transformOrigin: 'bottom left',
          }}
        />
      </motion.div>

      {/* Center core */}
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full"
        style={{
          background: 'linear-gradient(135deg, #FF453A, #FF9F0A)',
          boxShadow: '0 0 60px #FF453A90, 0 0 120px #FF453A50',
        }}>
        <Shield size={40} className="text-white" strokeWidth={2.2} />
      </div>

      {/* Threat dots on radar */}
      {[
        { angle: 45, distance: 140, color: '#FF453A' },
        { angle: 120, distance: 120, color: '#FF9F0A' },
        { angle: 210, distance: 100, color: '#FF453A' },
        { angle: 300, distance: 130, color: '#0071E3' },
      ].map((dot, i) => {
        const rad = (dot.angle * Math.PI) / 180
        const x = Math.cos(rad) * dot.distance
        const y = Math.sin(rad) * dot.distance
        return (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              transform: `translate(${x}px, ${y}px)`,
              background: dot.color,
              boxShadow: `0 0 20px ${dot.color}`,
            }}
            animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.4, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}
          />
        )
      })}
    </div>
  )
}

export function Attacks() {
  const [attacks, setAttacks] = useState<Attack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<any>({})
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('ALL')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const res = await axios.get(`${API}/api/attacks`).catch(() => ({ data: { attacks: {} } }))
      const data = res.data
      const list = Object.entries(data.attacks || {}).map(([key, val]: [string, any]) => ({
        id: val.id || key,
        name: val.name || key,
        description: val.description || '',
        severity: (val.severity || 'MEDIUM').toUpperCase(),
        detected: val.detected ?? false,
        detection_method: val.detection_method || (Array.isArray(val.detection_methods) ? val.detection_methods.join(', ') : ''),
        result: val.result || '',
      }))
      setAttacks(list)
      setSummary({
        total: data.total_attacks || list.length,
        detected: data.detected || 0,
        detection_rate: data.detection_rate || 0,
      })
    } catch (err: any) {
      setError(err.message || 'Backend error')
    } finally { setLoading(false) }
  }

  const filtered = attacks.filter(a => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase())
    const matchSeverity = severityFilter === 'ALL' || a.severity === severityFilter
    return matchSearch && matchSeverity
  })

  const critical = attacks.filter(a => a.severity === 'CRITICAL').length
  const high = attacks.filter(a => a.severity === 'HIGH').length
  const medium = attacks.filter(a => a.severity === 'MEDIUM').length
  const low = attacks.filter(a => a.severity === 'LOW').length
  const detected = attacks.filter(a => a.detected).length
  const detectionRate = attacks.length ? (detected / attacks.length) * 100 : 0

  return (
    <div className="min-h-screen bg-[#FBFBFD]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>

      {/* ===== HERO — Command center with radar ===== */}
      <section className="relative overflow-hidden bg-black">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-[15%] -translate-y-1/2 w-[900px] h-[900px] rounded-full blur-[240px]"
            style={{ background: 'radial-gradient(circle, #FF453A, transparent 55%)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[220px]"
            style={{ background: 'radial-gradient(circle, #FF9F0A, transparent 55%)' }}
          />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
              maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
            }} />
        </div>

        <div className="relative mx-auto max-w-[1200px] px-6 pt-32 pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl mb-8">
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-[#FF453A]"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ boxShadow: '0 0 10px #FF453A' }}
                />
                <span className="text-white/80 text-[11px] font-semibold tracking-[0.16em] uppercase">
                  Threat Intel · Live
                </span>
              </div>

              <h1 className="text-[72px] md:text-[96px] font-semibold leading-[0.94] tracking-[-0.05em] text-white">
                Every attack,
                <br />
                <span className="bg-gradient-to-r from-[#FF453A] via-[#FF9F0A] to-[#FF453A] bg-clip-text text-transparent">
                  blocked.
                </span>
              </h1>

              <p className="mt-8 max-w-[480px] text-[19px] leading-[1.5] tracking-[-0.015em] text-white/50">
                Adversarial patterns, backdoors, and tampering — continuously monitored by the integrity layer.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-8">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#30D158]" style={{ boxShadow: '0 0 8px #30D158' }} />
                  <span className="text-white/70 text-[14px] font-medium">{detected} threats neutralized</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF453A]" style={{ boxShadow: '0 0 8px #FF453A' }} />
                  <span className="text-white/70 text-[14px] font-medium">{critical} critical alerts</span>
                </div>
              </div>

              <div className="mt-12 flex flex-wrap items-center gap-3">
                <a href="#catalog" className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold tracking-[-0.01em] text-black transition-all hover:scale-[1.03]"
                  style={{ boxShadow: '0 0 60px rgba(255,255,255,0.3)' }}>
                  View Catalog
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
                </a>
                <a href="/cybersecurity" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-7 py-3.5 text-[15px] font-medium tracking-[-0.01em] text-white/90 backdrop-blur-xl transition-all hover:bg-white/[0.08]">
                  Command Center
                </a>
              </div>
            </motion.div>

            {/* Right: radar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-center"
            >
              <RadarVisualization />
            </motion.div>
          </div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[1000px]"
          >
            {[
              { label: 'Total Threats', value: attacks.length, color: '#FF453A' },
              { label: 'Detected', value: detected, color: '#30D158' },
              { label: 'Critical', value: critical, color: '#FF453A' },
              { label: 'Detection Rate', value: `${detectionRate.toFixed(0)}%`, color: '#2DD4BF' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + i * 0.1 }}
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

      {/* ===== SEVERITY HEATMAP ===== */}
      <section className="relative bg-white py-32 px-6">
        <div className="mx-auto max-w-[1200px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF453A]/10 border border-[#FF453A]/25 mb-5">
              <Activity size={12} className="text-[#FF453A]" />
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#FF453A]">Severity Map</span>
            </div>
            <h2 className="text-[52px] md:text-[64px] font-semibold tracking-[-0.04em] leading-[1.02] text-[#1D1D1F]">
              The landscape,
              <br />
              <span className="bg-gradient-to-r from-[#FF453A] to-[#FF9F0A] bg-clip-text text-transparent">
                visualized.
              </span>
            </h2>
          </motion.div>

          {/* Big 4-column heatmap */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { label: 'Critical', value: critical, color: '#FF453A', icon: AlertTriangle },
              { label: 'High', value: high, color: '#FF9F0A', icon: Zap },
              { label: 'Medium', value: medium, color: '#0071E3', icon: Shield },
              { label: 'Low', value: low, color: '#30D158', icon: Lock },
            ].map((item, i) => {
              const Icon = item.icon
              const total = attacks.length || 1
              const pct = (item.value / total) * 100
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -8 }}
                  className="group relative overflow-hidden rounded-[28px] bg-white p-7 border border-black/[0.04] transition-all"
                  style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
                >
                  <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl opacity-20 group-hover:opacity-50 transition-opacity duration-500"
                    style={{ background: item.color }} />

                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl mb-6"
                    style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                    <Icon size={20} style={{ color: item.color }} strokeWidth={2.2} />
                  </div>

                  <div className="relative text-[11px] font-bold tracking-[0.16em] uppercase text-[#6E6E73] mb-3">
                    {item.label}
                  </div>

                  <div className="relative flex items-baseline gap-2">
                    <div className="text-[56px] font-semibold leading-none tabular-nums tracking-[-0.04em]"
                      style={{ color: item.color, textShadow: `0 0 40px ${item.color}60` }}>
                      {item.value}
                    </div>
                    <div className="text-[16px] font-bold text-[#AEAEB2] tabular-nums">
                      {pct.toFixed(0)}%
                    </div>
                  </div>

                  {/* Bar */}
                  <div className="relative mt-6 h-1.5 rounded-full bg-[#F0F0F2] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${item.color}, ${item.color}AA)` }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== THREAT CATALOG ===== */}
      <section id="catalog" className="relative bg-[#F5F5F7] py-32 px-6">
        <div className="mx-auto max-w-[1200px]">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-[1px] bg-[#1D1D1F]/30" />
                <span className="text-[11px] font-bold tracking-[0.24em] uppercase text-[#1D1D1F]/50">
                  Threat Catalog
                </span>
              </div>
              <h2 className="text-[48px] md:text-[64px] font-semibold tracking-[-0.04em] leading-[1.0] text-[#1D1D1F]">
                Full
                <br />inventory.
              </h2>
              <p className="mt-4 text-[15px] text-[#6E6E73] tracking-[-0.01em]">
                {filtered.length} {filtered.length === 1 ? 'threat' : 'threats'} matched
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-[360px]">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6E6E73]" strokeWidth={2.2} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search threats"
                  className="w-full rounded-2xl bg-white border border-black/[0.06] py-4 pl-11 pr-4 text-[15px] text-[#1D1D1F] outline-none placeholder:text-[#86868B] focus:border-[#FF453A]/40 focus:ring-4 focus:ring-[#FF453A]/10 transition-all"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(s => {
                  const theme = s !== 'ALL' ? severityTheme[s] : null
                  const isActive = severityFilter === s
                  return (
                    <button
                      key={s}
                      onClick={() => setSeverityFilter(s)}
                      className={`rounded-full px-4 py-2 text-[12.5px] font-semibold tracking-[-0.005em] transition-all ${
                        isActive
                          ? 'text-white'
                          : 'bg-white text-[#6E6E73] hover:bg-white/80 border border-black/[0.06]'
                      }`}
                      style={isActive ? { background: theme?.color || '#1D1D1F' } : {}}
                    >
                      {s === 'ALL' ? 'All' : theme?.label || s}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {loading && attacks.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-60 rounded-[28px] bg-white border border-black/[0.04] animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[24px] bg-white py-32 text-center border border-black/[0.04]">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5F5F7] mb-4">
                <Shield size={28} className="text-[#86868B]" strokeWidth={1.8} />
              </div>
              <div className="mt-4 text-[18px] font-semibold text-[#1D1D1F]">No threats match</div>
              <div className="mt-1.5 text-[14px] text-[#6E6E73]">Try a different filter or search</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((a, i) => {
                const theme = severityTheme[a.severity] || severityTheme.MEDIUM
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6, delay: Math.min(i * 0.06, 0.4), ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -6 }}
                    className="group relative overflow-hidden rounded-[28px] bg-white border border-black/[0.04] transition-all cursor-pointer"
                    style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
                  >
                    <div className="h-1" style={{ background: `linear-gradient(90deg, ${theme.color}, ${theme.color}00)` }} />

                    <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ background: `${theme.color}20` }} />

                    <div className="relative p-7">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl"
                          style={{ background: `${theme.color}15`, border: `1px solid ${theme.color}30` }}>
                          <AlertTriangle size={17} style={{ color: theme.color }} strokeWidth={2.2} />
                        </div>

                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                          style={{ background: `${theme.color}15`, border: `1px solid ${theme.color}30` }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: theme.color }} />
                          <span className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: theme.color }}>
                            {theme.label}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-[19px] font-semibold tracking-[-0.02em] text-[#1D1D1F] mb-2 line-clamp-1">
                        {a.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </h3>
                      <p className="text-[13px] leading-[1.5] tracking-[-0.01em] text-[#6E6E73] line-clamp-2 mb-6 h-[40px]">
                        {a.description || 'No description available.'}
                      </p>

                      <div className="flex items-center justify-between pt-5 border-t border-[#F0F0F2]">
                        <div className="text-[11px] text-[#86868B] tracking-[-0.005em] truncate">
                          <span className="font-semibold text-[#6E6E73]">Detection:</span>{' '}
                          {a.detection_method || '—'}
                        </div>
                        {a.detected ? (
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <Check size={12} className="text-[#30D158]" strokeWidth={3} />
                            <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#30D158]">Blocked</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <X size={12} className="text-[#FF453A]" strokeWidth={3} />
                            <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#FF453A]">Missed</span>
                          </div>
                        )}
                      </div>
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
          style={{ background: 'radial-gradient(circle, #FF453A, transparent 55%)' }}
        />

        {/* Rotating rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="w-[700px] h-[700px]"
          >
            <svg viewBox="0 0 700 700" className="w-full h-full">
              <circle cx="350" cy="350" r="330" fill="none" stroke="#FF453A" strokeWidth="1" strokeDasharray="4 8" opacity="0.25" />
            </svg>
          </motion.div>
        </div>

        {/* Floating particles */}
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-[#FF453A]"
            style={{
              left: `${15 + (i * 8) % 70}%`,
              top: `${25 + (i * 11) % 55}%`,
              boxShadow: '0 0 15px #FF453A, 0 0 30px #FF453A60',
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
              className="w-1.5 h-1.5 rounded-full bg-[#30D158]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ boxShadow: '0 0 8px #30D158' }}
            />
            <span className="text-white/80 text-[11px] font-semibold tracking-[0.16em] uppercase">
              Continuous Defense
            </span>
          </div>

          <h2 className="text-[72px] md:text-[112px] font-semibold leading-[0.9] tracking-[-0.05em] text-white">
            Always watching.
            <br />
            <motion.span
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-block bg-gradient-to-r from-[#FF453A] via-[#FF9F0A] via-[#FF453A] to-[#FF453A] bg-clip-text text-transparent bg-[length:200%_100%]"
            >
              Always ready.
            </motion.span>
          </h2>

          <p className="mt-10 text-[21px] leading-[1.5] tracking-[-0.015em] text-white/50 max-w-[520px] mx-auto">
            Backdoor scans, poisoning detection, and tamper monitoring — around the clock.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
            {[
              { label: 'Backdoor Detection', color: '#FF453A' },
              { label: 'Data Poisoning', color: '#FF9F0A' },
              { label: 'Model Tampering', color: '#FF453A' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                <span className="text-white/60 text-[13px] font-medium tracking-[-0.005em]">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
            <a href="/cybersecurity" className="group relative inline-flex items-center gap-2 rounded-full bg-white text-black px-8 py-4 text-[15px] font-semibold tracking-[-0.01em] transition-all hover:scale-[1.03] overflow-hidden"
              style={{ boxShadow: '0 20px 60px -12px rgba(255,255,255,0.4)' }}>
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
              <span className="relative">Cyber Command Center</span>
              <ArrowRight size={15} className="relative transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
            </a>
            <a href="/backdoor" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] backdrop-blur-xl text-white px-8 py-4 text-[15px] font-medium tracking-[-0.01em] transition-all hover:bg-white/[0.08]">
              Backdoor Detection
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

export default Attacks
