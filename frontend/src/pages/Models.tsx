import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Search, ArrowRight, Hash, Target, Activity, TrendingUp, Cpu, Sparkles, Shield } from 'lucide-react'
import apiClient from '@/lib/api'

const API = 'http://localhost:8000'

interface Model {
  name: string
  precision: number
  recall: number
  mAP50: number
  mAP50_95: number
  model_hash?: string
}

function DonutGauge({ value, color, size = 180, label }: { value: number; color: string; size?: number; label?: string }) {
  const radius = (size - 24) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(value, 100) / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="10" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 12px ${color}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex items-baseline gap-0.5 font-semibold leading-none tracking-[-0.05em]" style={{ color }}>
          <span className="text-[44px]">{value.toFixed(1)}</span>
          <span className="text-[18px] opacity-50">%</span>
        </div>
        {label && (
          <div className="mt-2 text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color }}>
            {label}
          </div>
        )}
      </div>
    </div>
  )
}

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[12px] font-semibold tracking-[0.02em] uppercase text-[#86868B]">{label}</span>
        <span className="text-[15px] font-bold tabular-nums" style={{ color }}>{value.toFixed(1)}%</span>
      </div>
      <div className="h-2 rounded-full bg-[#F0F0F2] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${Math.min(value, 100)}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}AA)`, boxShadow: `0 0 12px ${color}60` }}
        />
      </div>
    </div>
  )
}

export function Models() {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => { loadModels() }, [])

  const loadModels = async () => {
    setLoading(true); setError(null)
    try {
      const [modelsRes, fingerprintsRes] = await Promise.all([
        apiClient.getModels().catch(() => ({ data: { models: {} } })),
        fetch(`${API}/api/premium/model/fingerprints`).then(r => r.json()).catch(() => ({ fingerprints: [] })),
      ])
      const data = modelsRes.data
      const fingerprints = fingerprintsRes.fingerprints || []
      let list: Model[] = []
      if (data.models && typeof data.models === 'object') list = Object.values(data.models)
      list = list.map((m: any) => {
        const fp = fingerprints.find((f: any) => f.name?.toLowerCase() === m.name?.toLowerCase())
        return { ...m, model_hash: fp?.model_hash }
      })
      setModels(list)
    } catch (err: any) { setError(err.message) } finally { setLoading(false) }
  }

  const getTheme = (mAP: number, name: string) => {
    const upper = (name || '').toUpperCase()
    if (upper === 'GOOD') return { color: '#30D158', label: 'HEALTHY' }
    if (upper === 'BAD') return { color: '#FF9F0A', label: 'REVIEW' }
    if (upper === 'WORST') return { color: '#FF453A', label: 'CRITICAL' }
    if (mAP >= 50) return { color: '#30D158', label: 'HEALTHY' }
    if (mAP >= 30) return { color: '#FF9F0A', label: 'REVIEW' }
    return { color: '#FF453A', label: 'CRITICAL' }
  }

  const filtered = models.filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()))
  const avgPrecision = models.length ? models.reduce((s, m) => s + (m.precision || 0), 0) / models.length : 0
  const avgRecall = models.length ? models.reduce((s, m) => s + (m.recall || 0), 0) / models.length : 0
  const avgMAP50 = models.length ? models.reduce((s, m) => s + (m.mAP50 || 0), 0) / models.length : 0
  const bestMAP50 = models.length ? Math.max(...models.map(m => m.mAP50 || 0)) : 0
  const bestModel = [...models].sort((a, b) => (b.mAP50 || 0) - (a.mAP50 || 0))[0]

  return (
    <div className="min-h-screen bg-[#FBFBFD]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>

      {/* ===== HERO — Apple keynote ===== */}
      <section className="relative overflow-hidden bg-black">
        {/* Big gradient mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full blur-[240px] opacity-40"
            style={{ background: 'radial-gradient(circle, #AF52DE, transparent 60%)' }} />
          <div className="absolute bottom-[-30%] right-[10%] w-[900px] h-[900px] rounded-full blur-[240px] opacity-30"
            style={{ background: 'radial-gradient(circle, #0071E3, transparent 60%)' }} />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
              maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
            }} />
        </div>

        <div className="relative mx-auto max-w-[1200px] px-6 pt-32 pb-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl mb-10">
              <Sparkles size={13} className="text-[#AF52DE]" />
              <span className="text-white/80 text-[11px] font-semibold tracking-[0.16em] uppercase">
                Model Registry
              </span>
            </div>

            <h1 className="max-w-[1100px] mx-auto text-[72px] md:text-[112px] font-semibold leading-[0.95] tracking-[-0.045em] text-white">
              Every model,
              <br />
              <span className="bg-gradient-to-r from-[#2DD4BF] via-[#10B981] to-[#34C759] bg-clip-text text-transparent">
                cryptographically bound.
              </span>
            </h1>

            <p className="mt-10 max-w-[620px] mx-auto text-[21px] leading-[1.5] tracking-[-0.015em] text-white/50">
              Performance metrics, integrity fingerprints, and lineage — for every registered artifact.
            </p>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
              <a href="#models" className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold tracking-[-0.01em] text-black transition-all hover:scale-[1.03]"
                style={{ boxShadow: '0 0 60px rgba(255,255,255,0.3)' }}>
                Browse Registry
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
              </a>
              <a href="/upload" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-7 py-3.5 text-[15px] font-medium tracking-[-0.01em] text-white/90 backdrop-blur-xl transition-all hover:bg-white/[0.08]">
                Register Model
              </a>
            </div>

            {/* Live stats */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-[900px] mx-auto">
              {[
                { label: 'Models', value: models.length, color: '#AF52DE' },
                { label: 'Avg Precision', value: `${avgPrecision.toFixed(1)}%`, color: '#0071E3' },
                { label: 'Avg Recall', value: `${avgRecall.toFixed(1)}%`, color: '#FF9F0A' },
                { label: 'Best mAP50', value: `${bestMAP50.toFixed(1)}%`, color: '#30D158' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-[44px] md:text-[52px] font-semibold leading-none tracking-[-0.04em] text-white tabular-nums"
                    style={{ textShadow: `0 0 50px ${stat.color}90` }}>
                    {stat.value}
                  </div>
                  <div className="mt-3 text-[10px] font-bold tracking-[0.22em] uppercase text-white/40">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURED MODEL — Spotlight ===== */}
      {bestModel && (
        <section className="relative bg-white py-32 px-6">
          <div className="mx-auto max-w-[1200px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#30D158]/10 border border-[#30D158]/25 mb-5">
                <TrendingUp size={12} className="text-[#30D158]" />
                <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#30D158]">Top Performer</span>
              </div>
              <h2 className="text-[52px] md:text-[64px] font-semibold tracking-[-0.04em] leading-[1.02] text-[#1D1D1F]">
                The best-in-class
                <br />
                <span className="bg-gradient-to-r from-[#30D158] to-[#0071E3] bg-clip-text text-transparent">
                  model today.
                </span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-[40px] overflow-hidden bg-[#0A0A0F]"
              style={{ boxShadow: '0 40px 120px -20px rgba(0,0,0,0.3)' }}
            >
              {/* Ambient glow */}
              <div className="absolute inset-0">
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] rounded-full blur-[200px] opacity-30"
                  style={{ background: 'radial-gradient(circle, #30D158, transparent 60%)' }} />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[200px] opacity-20"
                  style={{ background: 'radial-gradient(circle, #0071E3, transparent 60%)' }} />
              </div>

              <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 p-12 md:p-16 items-center">
                {/* Left: info */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl"
                      style={{ background: 'linear-gradient(135deg, #30D158, #0071E3)', boxShadow: '0 12px 32px -8px #30D15890' }}>
                      <Brain size={24} className="text-white" strokeWidth={2.2} />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-white/40">Highest mAP50</div>
                      <div className="text-[14px] font-semibold text-white">Best performing</div>
                    </div>
                  </div>

                  <h3 className="text-[56px] md:text-[72px] font-semibold leading-[1] tracking-[-0.045em] text-white">
                    {bestModel.name}
                  </h3>

                  <p className="mt-5 text-[17px] leading-[1.5] tracking-[-0.01em] text-white/50 max-w-[440px]">
                    Cryptographically signed and lineage-verified. Runtime performance tracked end-to-end.
                  </p>

                  <div className="mt-10 space-y-5 max-w-[400px]">
                    <MetricBar label="Precision" value={bestModel.precision || 0} color="#0071E3" />
                    <MetricBar label="Recall" value={bestModel.recall || 0} color="#FF9F0A" />
                    <MetricBar label="mAP50-95" value={bestModel.mAP50_95 || 0} color="#AF52DE" />
                  </div>

                  {bestModel.model_hash && (
                    <div className="mt-10 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] max-w-[440px]">
                      <Shield size={14} className="text-[#30D158]" strokeWidth={2.2} />
                      <span className="truncate font-mono text-[11px] text-white/60 tracking-tight">
                        {bestModel.model_hash.slice(0, 36)}...
                      </span>
                    </div>
                  )}
                </div>

                {/* Right: giant donut */}
                <div className="flex items-center justify-center">
                  <DonutGauge value={bestModel.mAP50 || 0} color="#30D158" size={280} label="mAP50 Score" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ===== ALL MODELS GRID ===== */}
      <section id="models" className="relative bg-[#F5F5F7] py-32 px-6">
        <div className="mx-auto max-w-[1200px]">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-[1px] bg-[#1D1D1F]/30" />
                <span className="text-[11px] font-bold tracking-[0.24em] uppercase text-[#1D1D1F]/50">
                  All Models
                </span>
              </div>
              <h2 className="text-[48px] md:text-[64px] font-semibold leading-[1.0] tracking-[-0.04em] text-[#1D1D1F]">
                Full
                <br />registry.
              </h2>
              <p className="mt-4 text-[15px] text-[#6E6E73] tracking-[-0.01em]">
                {filtered.length} {filtered.length === 1 ? 'model' : 'models'} indexed
              </p>
            </div>

            <div className="w-full md:w-[360px]">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6E6E73]" strokeWidth={2.2} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search registry"
                  className="w-full rounded-2xl bg-white border border-black/[0.06] py-4 pl-11 pr-4 text-[15px] text-[#1D1D1F] outline-none placeholder:text-[#86868B] focus:border-[#0071E3]/40 focus:ring-4 focus:ring-[#0071E3]/10 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Grid */}
          {loading && models.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-[440px] rounded-[32px] bg-white border border-black/[0.04] animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-32">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-black/[0.04] mb-5">
                <Brain size={28} className="text-[#86868B]" strokeWidth={1.8} />
              </div>
              <div className="text-[20px] font-semibold text-[#1D1D1F] mb-1.5">
                {search ? 'No matching models' : 'No models registered'}
              </div>
              <div className="text-[14px] text-[#6E6E73]">
                {search ? 'Try a different search term' : 'Register a model to get started'}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((m, i) => {
                const theme = getTheme(m.mAP50 || 0, m.name)
                return (
                  <motion.div
                    key={m.name}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -8 }}
                    className="group relative overflow-hidden rounded-[32px] bg-white border border-black/[0.04] transition-all"
                    style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
                  >
                    {/* Colored top accent */}
                    <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${theme.color}, ${theme.color}40)` }} />

                    {/* Glow on hover */}
                    <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full blur-[100px] opacity-20 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none"
                      style={{ background: theme.color }} />

                    <div className="relative p-8">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl"
                          style={{ background: `${theme.color}15`, border: `1px solid ${theme.color}30` }}>
                          <Brain size={22} style={{ color: theme.color }} strokeWidth={2.2} />
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                          style={{ background: `${theme.color}15`, border: `1px solid ${theme.color}30` }}>
                          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: theme.color }} />
                          <span className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: theme.color }}>
                            {theme.label}
                          </span>
                        </div>
                      </div>

                      {/* Name */}
                      <div className="mb-1 text-[24px] font-semibold tracking-[-0.025em] text-[#1D1D1F] truncate">
                        {m.name}
                      </div>
                      <div className="mb-8 text-[12px] tracking-[-0.005em] text-[#86868B]">
                        Computer vision model
                      </div>

                      {/* Big mAP50 score */}
                      <div className="mb-8 pb-8 border-b border-[#F0F0F2]">
                        <div className="flex items-baseline gap-1.5 font-semibold leading-none tracking-[-0.05em]">
                          <span className="text-[64px]" style={{ color: theme.color, textShadow: `0 0 40px ${theme.color}40` }}>
                            {(m.mAP50 || 0).toFixed(1)}
                          </span>
                          <span className="text-[28px] opacity-30 text-[#1D1D1F]">%</span>
                        </div>
                        <div className="mt-3 text-[11px] font-bold tracking-[0.2em] uppercase text-[#86868B]">
                          mAP50 Score
                        </div>
                      </div>

                      {/* Metrics list */}
                      <div className="space-y-4 mb-8">
                        {[
                          { label: 'Precision', value: m.precision || 0, color: '#0071E3' },
                          { label: 'Recall', value: m.recall || 0, color: '#FF9F0A' },
                          { label: 'mAP50-95', value: m.mAP50_95 || 0, color: '#AF52DE' },
                        ].map((metric) => (
                          <div key={metric.label} className="flex items-center justify-between">
                            <span className="text-[12px] tracking-[0.02em] uppercase text-[#86868B] font-semibold">
                              {metric.label}
                            </span>
                            <span className="text-[14px] font-bold tabular-nums" style={{ color: metric.color }}>
                              {metric.value.toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Hash */}
                      {m.model_hash && (
                        <div className="mb-6 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FBFBFD] border border-black/[0.03]">
                          <Hash size={10} className="text-[#86868B]" strokeWidth={2.4} />
                          <span className="truncate font-mono text-[10px] text-[#6E6E73] tracking-tight">
                            {m.model_hash.slice(0, 22)}...
                          </span>
                        </div>
                      )}

                      {/* CTA */}
                      <div className="flex items-center justify-between pt-5 border-t border-[#F0F0F2]">
                        <span className="text-[11.5px] font-medium tracking-[-0.005em] text-[#86868B]">
                          SHA-256 signed
                        </span>
                        <div className="flex items-center gap-1.5 text-[13px] font-semibold tracking-[-0.005em] transition-all"
                          style={{ color: theme.color }}>
                          Details
                          <ArrowRight size={13} strokeWidth={2.4} className="transition-transform group-hover:translate-x-1" />
                        </div>
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
      <section className="relative bg-black py-32 px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full blur-[240px] opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #AF52DE, transparent 60%)' }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1 }}
          className="relative max-w-[900px] mx-auto text-center"
        >
          <h2 className="text-[64px] md:text-[88px] font-semibold leading-[0.98] tracking-[-0.045em] text-white">
            Anchor your
            <br />
            <span className="bg-gradient-to-r from-[#2DD4BF] to-[#34C759] bg-clip-text text-transparent">
              next model.
            </span>
          </h2>

          <p className="mt-8 text-[19px] leading-[1.5] tracking-[-0.015em] text-white/50 max-w-[480px] mx-auto">
            Sign, track, and verify every artifact in minutes.
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <a href="/upload" className="group inline-flex items-center gap-2 rounded-full bg-white text-black px-8 py-4 text-[15px] font-semibold tracking-[-0.01em] transition-all hover:scale-[1.03]"
              style={{ boxShadow: '0 20px 60px -12px rgba(255,255,255,0.4)' }}>
              Register Model
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
            </a>
            <a href="/help" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] backdrop-blur-xl text-white px-8 py-4 text-[15px] font-medium tracking-[-0.01em] transition-all hover:bg-white/[0.08]">
              Read Docs
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

export default Models
