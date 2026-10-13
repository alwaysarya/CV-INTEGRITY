import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, Search, Loader2, RefreshCw, Target, CheckCircle,
  AlertTriangle, BarChart3, Sparkles, ArrowRight, Lock,
  Activity, Server, Radio, Layers, Zap, Waves, Cpu, Play
} from 'lucide-react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis,
  CartesianGrid
} from 'recharts'
import apiClient from '@/lib/api'

const statusTheme: Record<string, { color: string; label: string }> = {
  Pass: { color: '#30D158', label: 'Pass' },
  Warning: { color: '#FF9F0A', label: 'Warning' },
  Fail: { color: '#FF453A', label: 'Fail' },
}

const categoryMeta: Record<string, { icon: any; color: string; desc: string }> = {
  Blur: { icon: Waves, color: '#5AC8FA', desc: 'Gaussian & motion blur' },
  Duplicate: { icon: Layers, color: '#5E5CE6', desc: 'Near-identical samples' },
  Noise: { icon: Radio, color: '#FF9F0A', desc: 'Salt, pepper, gaussian' },
  Adversarial: { icon: Zap, color: '#FF453A', desc: 'Crafted perturbations' },
}

/* ===== Concentric armor rings (light theme) ===== */
function ArmorRings() {
  return (
    <div className="relative w-full h-[520px] flex items-center justify-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute rounded-full"
          style={{
            width: `${i * 110}px`,
            height: `${i * 110}px`,
            border: `1.5px solid ${['#5AC8FA', '#0071E3', '#5E5CE6', '#AF52DE', '#FF6B9D'][i - 1]}25`,
          }}
        />
      ))}

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[240px] h-[240px]"
      >
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#5AC8FA]" style={{ boxShadow: '0 0 20px #5AC8FA' }} />
      </motion.div>
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[400px] h-[400px]"
      >
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-3 h-3 rounded-full bg-[#5E5CE6]" style={{ boxShadow: '0 0 16px #5E5CE6' }} />
      </motion.div>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[500px] h-[500px]"
      >
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#AF52DE]" style={{ boxShadow: '0 0 14px #AF52DE' }} />
      </motion.div>

      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative flex h-32 w-32 items-center justify-center rounded-[28px]"
        style={{
          background: 'linear-gradient(135deg, #0071E3, #5E5CE6)',
          boxShadow: '0 30px 80px -10px #0071E380, 0 0 80px #0071E340, inset 0 1px 0 rgba(255,255,255,0.3)',
        }}
      >
        <Shield size={56} className="text-white" strokeWidth={2} />
      </motion.div>
    </div>
  )
}

/* ===== Big category tile ===== */
function CategoryTile({ category, data, index }: { category: string; data: any; index: number }) {
  const meta = categoryMeta[category]
  const Icon = meta.icon
  const avg = data.avg
  const status = avg >= 90 ? 'Pass' : avg >= 75 ? 'Warning' : 'Fail'
  const statusColor = statusTheme[status].color

  // Progress ring
  const r = 44
  const c = 2 * Math.PI * r
  const off = c - (avg / 100) * c

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8 }}
      className="group relative overflow-hidden rounded-[28px] bg-white p-7 border border-black/[0.04] transition-all"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
    >
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl opacity-[0.06] group-hover:opacity-20 transition-opacity duration-500"
        style={{ background: meta.color }} />

      <div className="relative flex items-start justify-between mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}30` }}>
          <Icon size={20} style={{ color: meta.color }} strokeWidth={2.2} />
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ background: `${statusColor}15`, border: `1px solid ${statusColor}30` }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}` }} />
          <span className="text-[9px] font-bold tracking-[0.14em] uppercase" style={{ color: statusColor }}>{status}</span>
        </div>
      </div>

      {/* Ring + score */}
      <div className="relative flex items-center gap-6 mb-6">
        <div className="relative w-[100px] h-[100px] flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="6" />
            <motion.circle
              cx="50" cy="50" r={r}
              fill="none" stroke={meta.color} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={c}
              initial={{ strokeDashoffset: c }}
              whileInView={{ strokeDashoffset: off }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, delay: 0.3 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ filter: `drop-shadow(0 0 8px ${meta.color}90)` }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[20px] font-bold tabular-nums tracking-[-0.02em]" style={{ color: meta.color }}>
              {avg.toFixed(0)}%
            </span>
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-[20px] font-semibold tracking-[-0.02em] text-[#1D1D1F] mb-1">{category}</div>
          <div className="text-[12px] text-[#86868B] leading-tight">{meta.desc}</div>
          <div className="mt-3 text-[11px] font-bold tracking-[0.14em] uppercase text-[#AEAEB2]">
            {data.pass} pass · {data.warn} warn · {data.fail} fail
          </div>
        </div>
      </div>

      <div className="relative h-[1px] bg-[#F0F0F2] mb-4" />

      <div className="relative flex items-center justify-between">
        <span className="text-[11px] font-medium text-[#86868B]">{data.count} tests</span>
        <div className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: meta.color }}>
          Details
          <ArrowRight size={11} strokeWidth={2.4} className="transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </motion.div>
  )
}

export function Robustness() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => { loadRobustness() }, [])

  const loadRobustness = async () => {
    setLoading(true); setError(null)
    try {
      const [dRes, mRes] = await Promise.all([
        apiClient.getDatasets().catch(() => ({ data: { datasets: {} } })),
        apiClient.getModels().catch(() => ({ data: { models: {} } })),
      ])
      const datasets = dRes.data.datasets || {}
      const models = mRes.data.models || {}
      const list: any[] = []
      let id = 1

      Object.entries(datasets).forEach(([key, val]: [string, any]) => {
        const blur = val.blur_score || 0
        const dup = val.duplicate_score || 0
        const noise = val.noise_score || 0
        list.push({ id: id++, test: `${key.toUpperCase()} Blur`, category: 'Blur', score: blur, status: blur >= 90 ? 'Pass' : blur >= 75 ? 'Warning' : 'Fail' })
        list.push({ id: id++, test: `${key.toUpperCase()} Duplicate`, category: 'Duplicate', score: dup, status: dup >= 90 ? 'Pass' : dup >= 75 ? 'Warning' : 'Fail' })
        list.push({ id: id++, test: `${key.toUpperCase()} Noise`, category: 'Noise', score: noise, status: noise >= 90 ? 'Pass' : noise >= 75 ? 'Warning' : 'Fail' })
      })

      Object.entries(models).forEach(([key, val]: [string, any]) => {
        const mAP = Math.min((val.mAP50 || 0) * 5, 100)
        list.push({ id: id++, test: `${key.toUpperCase()} Adversarial`, category: 'Adversarial', score: mAP, status: mAP >= 90 ? 'Pass' : mAP >= 75 ? 'Warning' : 'Fail' })
      })

      setResults(list)
    } catch (err: any) { setError(err.message) } finally { setLoading(false) }
  }

  const filtered = results.filter((r) => r.test.toLowerCase().includes(search.toLowerCase()))
  const passCount = results.filter(r => r.status === 'Pass').length
  const warnCount = results.filter(r => r.status === 'Warning').length
  const failCount = results.filter(r => r.status === 'Fail').length
  const avgScore = results.length ? results.reduce((s, r) => s + r.score, 0) / results.length : 0

  const categories = ['Blur', 'Duplicate', 'Noise', 'Adversarial']
  const radarData = categories.map(cat => {
    const items = results.filter(r => r.category === cat)
    const avg = items.length ? items.reduce((s, r) => s + r.score, 0) / items.length : 0
    return { category: cat, score: Number(avg.toFixed(1)) }
  })

  const barData = results.slice(0, 10).map(r => ({
    name: r.test.split(' ')[0] + ' ' + r.category,
    score: Number(r.score.toFixed(1)),
  }))

  // Category stats for tiles
  const categoryStats = categories.map(cat => {
    const items = results.filter(r => r.category === cat)
    const avg = items.length ? items.reduce((s, r) => s + r.score, 0) / items.length : 0
    return {
      category: cat,
      avg,
      count: items.length,
      pass: items.filter(r => r.status === 'Pass').length,
      warn: items.filter(r => r.status === 'Warning').length,
      fail: items.filter(r => r.status === 'Fail').length,
    }
  })

  const getTheme = (status: string) => statusTheme[status] || statusTheme.Warning

  const processSteps = [
    { n: '01', label: 'Inject', desc: 'Craft perturbations', color: '#5AC8FA', icon: Zap },
    { n: '02', label: 'Test', desc: 'Run against model', color: '#0071E3', icon: Play },
    { n: '03', label: 'Score', desc: 'Compute robustness', color: '#5E5CE6', icon: Target },
    { n: '04', label: 'Harden', desc: 'Fix and re-verify', color: '#30D158', icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-[#FBFBFD]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[-20%] left-[-10%] w-[900px] h-[900px] rounded-full blur-[220px]"
            style={{ background: 'radial-gradient(circle, #5AC8FA, transparent 60%)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.22, 0.12] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full blur-[220px]"
            style={{ background: 'radial-gradient(circle, #5E5CE6, transparent 60%)' }}
          />
        </div>

        <div className="relative mx-auto max-w-[1300px] px-6 py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-black/[0.06] shadow-sm mb-7">
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-[#5AC8FA]"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ boxShadow: '0 0 8px #5AC8FA' }}
                />
                <span className="text-[#1D1D1F] text-[11px] font-semibold tracking-[0.16em] uppercase">
                  Adversarial Robustness
                </span>
              </div>

              <h1 className="text-[72px] md:text-[96px] font-semibold leading-[0.94] tracking-[-0.045em] text-[#1D1D1F]">
                Tested
                <br />
                <motion.span
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-block bg-gradient-to-r from-[#5AC8FA] via-[#0071E3] via-[#5E5CE6] to-[#5AC8FA] bg-clip-text text-transparent bg-[length:200%_100%]"
                >
                  against everything.
                </motion.span>
              </h1>

              <p className="mt-7 max-w-[520px] text-[19px] leading-[1.5] tracking-[-0.015em] text-[#6E6E73]">
                Blur, noise, duplicate and adversarial robustness assessment across all models and datasets.
              </p>

              <div className="mt-9 grid grid-cols-3 gap-6 max-w-[440px]">
                {[
                  { l: 'Passed', v: passCount, c: '#30D158' },
                  { l: 'Warning', v: warnCount, c: '#FF9F0A' },
                  { l: 'Failed', v: failCount, c: '#FF453A' },
                ].map((s, i) => (
                  <motion.div key={s.l}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
                  >
                    <div className="text-[36px] font-semibold leading-none tabular-nums tracking-[-0.04em]" style={{ color: s.c }}>
                      {s.v}
                    </div>
                    <div className="mt-2 text-[10px] font-bold tracking-[0.2em] uppercase text-[#86868B]">{s.l}</div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-11 flex flex-wrap items-center gap-3">
                <a href="#tests" className="group inline-flex items-center gap-2 rounded-full bg-[#0071E3] px-7 py-3.5 text-[15px] font-semibold text-white transition-all hover:scale-[1.03] hover:bg-[#0077ED]"
                  style={{ boxShadow: '0 12px 40px -8px rgba(0,113,227,0.5)' }}>
                  View Tests
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
                </a>
                <button onClick={loadRobustness}
                  className="inline-flex items-center gap-2 rounded-full bg-white border border-black/[0.08] px-7 py-3.5 text-[15px] font-medium text-[#1D1D1F] transition-all hover:bg-[#F5F5F7] hover:shadow-md">
                  <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                  Rerun Tests
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.4, delay: 0.3 }} className="flex items-center justify-center">
              <ArmorRings />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== CATEGORY TILES ===== */}
      <section className="relative py-24 px-6">
        <div className="mx-auto max-w-[1300px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }}
            className="mb-14 text-center"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0071E3]/10 border border-[#0071E3]/25 mb-5">
              <Layers size={12} className="text-[#0071E3]" />
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#0071E3]">Attack Vectors</span>
            </div>
            <h2 className="text-[52px] md:text-[64px] font-semibold tracking-[-0.04em] leading-[1.02] text-[#1D1D1F]">
              Four angles.
              <br />
              <span className="bg-gradient-to-r from-[#0071E3] to-[#5E5CE6] bg-clip-text text-transparent">
                Fully tested.
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {categoryStats.map((cat, i) => (
              <CategoryTile key={cat.category} category={cat.category} data={cat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROCESS FLOW ===== */}
      <section className="relative py-24 px-6">
        <div className="mx-auto max-w-[1300px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5E5CE6]/10 border border-[#5E5CE6]/25 mb-5">
              <Activity size={12} className="text-[#5E5CE6]" />
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#5E5CE6]">How it works</span>
            </div>
            <h2 className="text-[52px] md:text-[64px] font-semibold tracking-[-0.04em] leading-[1.02] text-[#1D1D1F]">
              Four steps.
              <br />
              <span className="text-[#86868B]">Zero blind spots.</span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-[44px] left-[12%] right-[12%] h-[2px] rounded-full"
              style={{ background: 'linear-gradient(90deg, #5AC8FA, #0071E3, #5E5CE6, #30D158)' }} />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {processSteps.map((s, i) => {
                const Icon = s.icon
                return (
                  <motion.div
                    key={s.n}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="relative text-center"
                  >
                    <div className="relative inline-flex">
                      <div
                        className="relative flex h-24 w-24 items-center justify-center rounded-3xl z-10"
                        style={{
                          background: `linear-gradient(135deg, ${s.color}, ${s.color}CC)`,
                          boxShadow: `0 20px 50px -12px ${s.color}80, 0 0 40px ${s.color}30`,
                        }}
                      >
                        <Icon size={32} className="text-white" strokeWidth={2.2} />
                      </div>
                      <motion.div
                        className="absolute inset-0 rounded-3xl"
                        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
                        style={{ background: `${s.color}30` }}
                      />
                    </div>
                    <div className="mt-6 text-[13px] font-bold tracking-[0.14em] uppercase text-[#AEAEB2]">Step {s.n}</div>
                    <div className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-[#1D1D1F]">{s.label}</div>
                    <div className="mt-2 text-[13px] text-[#86868B] leading-tight">{s.desc}</div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CHARTS ===== */}
      <section className="relative py-24 px-6">
        <div className="mx-auto max-w-[1300px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#30D158]/10 border border-[#30D158]/25 mb-5">
              <BarChart3 size={12} className="text-[#30D158]" />
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#30D158]">Analytics</span>
            </div>
            <h2 className="text-[52px] md:text-[64px] font-semibold tracking-[-0.04em] leading-[1.02] text-[#1D1D1F]">
              Deep dive.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8 }}
              className="relative rounded-[32px] p-8 overflow-hidden"
              style={{
                background: '#0A0A0F',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 30px 80px -20px rgba(0,0,0,0.4)',
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#5AC8FA] to-transparent" />
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl"
                  style={{ background: '#5AC8FA20', border: '1px solid #5AC8FA40' }}>
                  <Target size={18} className="text-[#5AC8FA]" strokeWidth={2.2} />
                </div>
                <div>
                  <div className="text-[16px] font-semibold text-white tracking-[-0.02em]">Robustness Profile</div>
                  <div className="text-[11px] text-white/40">Average score per category</div>
                </div>
              </div>
              <div className="h-[300px]">
                {radarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="category" stroke="rgba(255,255,255,0.5)" style={{ fontSize: 11 }} />
                      <PolarRadiusAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: 10 }} domain={[0, 100]} />
                      <Radar name="Score" dataKey="score" stroke="#5AC8FA" fill="#5AC8FA" fillOpacity={0.35} strokeWidth={2} />
                      <Tooltip contentStyle={{ background: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12, color: 'white' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : <div className="flex h-full items-center justify-center text-[12px] text-white/40">No data</div>}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8, delay: 0.1 }}
              className="relative rounded-[32px] p-8 overflow-hidden"
              style={{
                background: '#0A0A0F',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 30px 80px -20px rgba(0,0,0,0.4)',
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#30D158] to-transparent" />
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl"
                  style={{ background: '#30D15820', border: '1px solid #30D15840' }}>
                  <BarChart3 size={18} className="text-[#30D158]" strokeWidth={2.2} />
                </div>
                <div>
                  <div className="text-[16px] font-semibold text-white tracking-[-0.02em]">Test Scores</div>
                  <div className="text-[11px] text-white/40">Score per robustness test</div>
                </div>
              </div>
              <div className="h-[300px]">
                {barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" style={{ fontSize: 10 }} angle={-25} textAnchor="end" height={70} />
                      <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12, color: 'white' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                      <Bar dataKey="score" fill="#30D158" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="flex h-full items-center justify-center text-[12px] text-white/40">No data</div>}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== TEST RESULTS ===== */}
      <section id="tests" className="relative py-24 px-6">
        <div className="mx-auto max-w-[1300px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-[1px] bg-[#1D1D1F]/30" />
              <span className="text-[11px] font-bold tracking-[0.24em] uppercase text-[#1D1D1F]/50">
                Live Tests
              </span>
            </div>
            <h2 className="text-[44px] md:text-[56px] font-semibold tracking-[-0.04em] leading-[1.05] text-[#1D1D1F]">
              Every test,
              <br />verified.
            </h2>
            <p className="mt-3 text-[14px] text-[#86868B]">{filtered.length} of {results.length} tests</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="mb-6 rounded-2xl bg-white p-4 border border-black/[0.04]"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
          >
            <div className="relative">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6E6E73]" strokeWidth={2.2} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tests..."
                className="w-full rounded-xl bg-[#F5F5F7] py-3 pl-11 pr-4 text-[14px] text-[#1D1D1F] outline-none placeholder:text-[#86868B] border border-transparent focus:bg-white focus:border-[#0071E3]/40 focus:ring-4 focus:ring-[#0071E3]/10 transition-all"
              />
            </div>
          </motion.div>

          {loading && results.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-32 rounded-2xl bg-white border border-black/[0.04] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((r, i) => {
                const theme = getTheme(r.status)
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.5, delay: Math.min(i * 0.04, 0.4) }}
                    whileHover={{ y: -6 }}
                    className="group relative overflow-hidden rounded-2xl bg-white transition-all"
                    style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.04)' }}
                  >
                    <div className="h-1" style={{ background: `linear-gradient(90deg, ${theme.color}, ${theme.color}00)` }} />
                    <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `${theme.color}25` }} />

                    <div className="relative p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
                          style={{ background: `${theme.color}15`, border: `1px solid ${theme.color}30` }}>
                          <Shield size={16} style={{ color: theme.color }} strokeWidth={2.2} />
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
                          style={{ background: `${theme.color}15`, border: `1px solid ${theme.color}30` }}>
                          <span className="w-1 h-1 rounded-full" style={{ background: theme.color }} />
                          <span className="text-[9px] font-bold tracking-[0.12em] uppercase" style={{ color: theme.color }}>{theme.label}</span>
                        </div>
                      </div>

                      <div className="text-[15px] font-semibold tracking-[-0.02em] text-[#1D1D1F] mb-1 truncate">{r.test}</div>
                      <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#AEAEB2] mb-4">{r.category}</div>

                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-[32px] font-semibold tracking-[-0.04em] tabular-nums" style={{ color: theme.color }}>
                          {r.score.toFixed(1)}
                        </span>
                        <span className="text-[14px] font-semibold" style={{ color: theme.color, opacity: 0.4 }}>%</span>
                      </div>

                      <div className="h-1.5 rounded-full overflow-hidden bg-[#F0F0F2]">
                        <motion.div
                          initial={{ width: 0 }} whileInView={{ width: `${Math.min(r.score, 100)}%` }}
                          viewport={{ once: true }} transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${theme.color}, ${theme.color}AA)` }}
                        />
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
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1300px] h-[1300px] rounded-full blur-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0071E3, transparent 55%)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[900px] h-[900px] rounded-full blur-[260px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #5E5CE6, transparent 55%)' }}
        />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} className="w-[800px] h-[800px]">
            <svg viewBox="0 0 800 800" className="w-full h-full">
              <circle cx="400" cy="400" r="380" fill="none" stroke="#5AC8FA" strokeWidth="1" strokeDasharray="4 10" opacity="0.3" />
            </svg>
          </motion.div>
        </div>

        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              left: `${10 + (i * 5) % 80}%`,
              top: `${20 + (i * 11) % 60}%`,
              background: ['#5AC8FA', '#0071E3', '#5E5CE6'][i % 3],
              boxShadow: `0 0 15px ${['#5AC8FA', '#0071E3', '#5E5CE6'][i % 3]}`,
            }}
            animate={{ y: [0, -40, 0], opacity: [0.15, 0.9, 0.15] }}
            transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: i * 0.25 }}
          />
        ))}

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1 }}
          className="relative max-w-[900px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl mb-10">
            <motion.span className="w-1.5 h-1.5 rounded-full bg-[#5AC8FA]"
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{ boxShadow: '0 0 8px #5AC8FA' }} />
            <span className="text-white/80 text-[11px] font-semibold tracking-[0.16em] uppercase">Battle Tested</span>
          </div>

          <h2 className="text-[72px] md:text-[112px] font-semibold leading-[0.9] tracking-[-0.05em] text-white">
            Hardened
            <br />
            <motion.span
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-block bg-gradient-to-r from-[#5AC8FA] via-[#0071E3] via-[#5E5CE6] to-[#5AC8FA] bg-clip-text text-transparent bg-[length:200%_100%]"
            >
              from every angle.
            </motion.span>
          </h2>

          <p className="mt-10 text-[21px] leading-[1.5] text-white/50 max-w-[520px] mx-auto">
            Blur, noise, duplicate, adversarial. Every angle covered.
          </p>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
            <a href="/drift" className="group relative inline-flex items-center gap-2 rounded-full bg-white text-black px-8 py-4 text-[15px] font-semibold overflow-hidden transition-all hover:scale-[1.03]"
              style={{ boxShadow: '0 20px 60px -12px rgba(255,255,255,0.4)' }}>
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
              <span className="relative">Drift Monitor</span>
              <ArrowRight size={15} className="relative transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
            </a>
            <a href="/models" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] backdrop-blur-xl text-white px-8 py-4 text-[15px] font-medium transition-all hover:bg-white/[0.08]">
              View Models
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

export default Robustness
