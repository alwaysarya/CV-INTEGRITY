import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheck, Database, Brain, FileCheck2, ArrowUpRight, RefreshCw,
  Video, AlertTriangle, Eye, Check, ChevronRight, Target
} from 'lucide-react'
import apiClient from '@/lib/api'
import { HeroOrbital, HeroNeonBlob, HeroConstellation, HeroIconGrid, HeroCosmic } from '@/components/hero/HeroVariants'

const API = 'http://localhost:8000'

function ScoreCard({ title, value, status, icon: Icon, emphasized = false }: any) {
  const statusColor = status === 'GOOD' ? '#34C759' : status === 'REVIEW' ? '#FF9500' : '#FF3B30'
  const statusLabel = status === 'GOOD' ? 'Healthy' : status === 'REVIEW' ? 'Review' : 'Critical'
  const safeValue = Number.isFinite(value) ? value : 0

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative overflow-hidden rounded-[24px] p-7 transition-all ${
        emphasized
          ? 'bg-[#0A0A0F] text-white'
          : 'bg-white'
      }`}
      style={{
        boxShadow: emphasized
          ? '0 20px 60px -15px rgba(0,0,0,0.4)'
          : '0 4px 24px rgba(0,0,0,0.04)',
        border: emphasized ? 'none' : '1px solid rgba(0,0,0,0.04)',
      }}
    >
      {/* Gradient glow top-right */}
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `${statusColor}40` }} />

      {/* Top row */}
      <div className="relative flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110`}
          style={{ background: emphasized ? `${statusColor}25` : `${statusColor}15` }}>
          <Icon size={18} style={{ color: statusColor }} strokeWidth={2.2} />
        </div>
        <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
          emphasized
            ? 'bg-white/10 text-white/70 group-hover:bg-white/20 group-hover:text-white'
            : 'bg-[#F5F5F7] text-[#86868B] group-hover:bg-[#1D1D1F] group-hover:text-white'
        }`}>
          <ArrowUpRight size={13} strokeWidth={2.4} />
        </div>
      </div>

      {/* Title */}
      <div className={`relative mt-7 text-[13px] font-semibold tracking-[0.02em] uppercase ${emphasized ? 'text-white/50' : 'text-[#86868B]'}`}>
        {title}
      </div>

      {/* Big value */}
      <div className={`relative mt-3 flex items-baseline gap-1 font-semibold leading-none tracking-[-0.05em] tabular-nums ${emphasized ? 'text-white' : 'text-[#1D1D1F]'}`}>
        <span className="text-[64px]">{safeValue.toFixed(1)}</span>
        <span className="text-[24px] font-medium opacity-40">%</span>
      </div>

      {/* Status */}
      <div className={`relative mt-5 flex items-center gap-2 text-[12.5px] font-semibold ${emphasized ? 'text-white/70' : 'text-[#6E6E73]'}`}>
        <span className="inline-block h-2 w-2 rounded-full" style={{ background: statusColor, boxShadow: `0 0 10px ${statusColor}` }} />
        <span>{statusLabel}</span>
      </div>

      {/* Progress bar */}
      <div className={`relative mt-5 h-1.5 overflow-hidden rounded-full ${emphasized ? 'bg-white/10' : 'bg-[#F0F0F2]'}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(safeValue, 100)}%` }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${statusColor}, ${statusColor}AA)` }}
        />
      </div>
    </motion.div>
  )
}

function EventRow({ event }: any) {
  const color = event.severity === 'CRITICAL' ? '#FF3B30' : event.severity === 'HIGH' ? '#FF9500' : '#0071E3'
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#F5F5F7] bg-[#FBFBFD] px-4 py-3 transition-colors hover:bg-[#F5F5F7]">
      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-medium text-[#1D1D1F]">
          {String(event.name || '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())}
        </div>
        <div className="mt-0.5 text-[12px] text-[#86868B]">Recent event</div>
      </div>
      <span className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold" style={{ background: `${color}15`, color }}>
        {event.severity}
      </span>
    </div>
  )
}

export function Home() {
  const [stats, setStats] = useState({ datasets: 0, models: 0, blocks: 0, wallets: 0 })
  const [metrics, setMetrics] = useState<any>({})
  const [attacks, setAttacks] = useState<any[]>([])
  const [frames, setFrames] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [trustScores, setTrustScores] = useState<any[]>([])
  const [avgTrust, setAvgTrust] = useState(0)
  const [modelInfo, setModelInfo] = useState<any>(null)
  const [backendOnline, setBackendOnline] = useState(true)
  const [heroVariant, setHeroVariant] = useState(() => localStorage.getItem('cv_hero_variant') || 'cosmic')

  useEffect(() => {
    localStorage.setItem('cv_hero_variant', heroVariant)
  }, [heroVariant])

  const checkHealth = async () => {
    try { const res = await fetch(`${API}/health`); setBackendOnline(res.ok) } catch { setBackendOnline(false) }
  }

  const load = async () => {
    try {
      console.log('LOAD_CALLED')
      const [dRes, mRes, bRes, wRes, tRes, aRes, vRes, metRes] = await Promise.all([
        apiClient.getDatasets().catch(() => ({ data: { datasets: {} } })),
        apiClient.getModels().catch(() => ({ data: { models: {} } })),
        apiClient.getBlocks().catch(() => ({ data: { blocks: [] } })),
        apiClient.getWallets().catch(() => ({ data: { wallets: {} } })),
        fetch(`${API}/api/trust-scores`).then(r => r.json()).catch(() => ({ trust_scores: {} })),
        apiClient.getAttacks().catch(() => ({ data: { attacks: {} } })),
        fetch(`${API}/api/video/thumbnails`).then(r => r.json()).catch(() => ({ thumbnails: [] })),
        fetch(`${API}/api/analytics/metrics`).then(r => r.json()).catch(() => ({ metrics: {} })),
      ])
      setStats({
        datasets: Object.keys(dRes.data.datasets || {}).length,
        models: Object.keys(mRes.data.models || {}).length,
        blocks: (bRes.data.blocks || []).length,
        wallets: Object.keys(wRes.data.wallets || {}).length,
      })
      setMetrics(metRes.metrics || {})
      const modelsObj = mRes.data?.models || {}
      setModelInfo((modelsObj as any).good || Object.values(modelsObj)[0] || null)
      const tsList = Object.entries(tRes.trust_scores || {}).map(([key, val]: [string, any]) => ({
        key, score: Number(val.final_score || 0), decision: (val.decision || '').replace(/[✅⚠️❌]/g, '').trim(),
      }))
      setTrustScores(tsList)
      if (tsList.length) setAvgTrust(Math.round(tsList.reduce((a, b) => a + b.score, 0) / tsList.length))
      setAttacks(Object.entries(aRes.data.attacks || {}).map(([k, v]: [string, any]) => ({
        id: k, name: v.name || k, severity: String(v.severity || 'MEDIUM').toUpperCase(),
      })))
      const vList = (vRes.thumbnails || []).map((t: any) => ({
        frame: t.frame ?? 0, image: t.preview ?? t.image ?? '', detections: t.detections ?? 0,
        detectionList: t.detection_list || [], classCounts: t.class_counts || {},
      })).filter((x: any) => x.image)
      setFrames(vList)
      const agg: Record<string, number> = {}
      for (const t of (vRes.thumbnails || [])) {
        for (const [k, v] of Object.entries(t.class_counts || {})) agg[k] = (agg[k] || 0) + (v as number)
      }
      const total = Object.values(agg).reduce((a, b) => a + b, 0) || 1
      setClasses(Object.entries(agg).map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) })).sort((a, b) => b.count - a.count))
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
    let mounted = true
    const run = async () => {
      if (!mounted) return
      await load()
      await checkHealth()
    }
    run()
    const t = setInterval(() => {
      if (mounted) checkHealth()
    }, 30000)
    return () => { mounted = false; clearInterval(t) }
  }, [])

  const frame = frames[0] || null
  const allDetections = frames.flatMap((f: any) => f.detectionList || [])
  const avgConfidence = allDetections.length ? (allDetections.reduce((s: number, d: any) => s + (d.confidence || 0), 0) / allDetections.length) * 100 : 0
  const datasetScore = trustScores.length ? trustScores.reduce((sum, item) => sum + item.score, 0) / trustScores.length : 0
  const modelScore = Number(modelInfo?.mAP50 || 0)
  const outputScore = avgConfidence
  const distributionShift = Number(metrics?.distribution_shift || 2.5)
  const anomalies = Number(metrics?.anomaly_count || 0)
  const systemTrust = avgTrust
  const getStatus = (v: number) => v >= 75 ? 'GOOD' : v >= 45 ? 'REVIEW' : 'CRITICAL'
  const critical = attacks.filter(a => a.severity === 'CRITICAL').length
  const high = attacks.filter(a => a.severity === 'HIGH').length
  const medium = attacks.filter(a => a.severity === 'MEDIUM').length
  const integrity = [
    ['Contributor', stats.wallets > 0],
    ['Dataset', stats.datasets > 0],
    ['Model', stats.models > 0],
    ['Inference', frames.length > 0],
    ['Output', stats.blocks > 0],
  ] as [string, boolean][]

  return (
    <div className="min-h-screen bg-[#FBFBFD]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>

      {/* HERO — Switcher */}
      <div className="relative">
        {/* Hero variant switcher — floating top-right */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-1 rounded-full border border-white/15 bg-black/60 backdrop-blur-2xl px-1.5 py-1.5 shadow-2xl">
          <span className="px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">Hero</span>
          {[
            { id: 'cosmic', label: 'Cosmic' },
            { id: 'orbital', label: 'Orbital' },
            { id: 'blob', label: 'Blob' },
            { id: 'constellation', label: 'Network' },
            { id: 'grid', label: 'Grid' },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setHeroVariant(v.id)}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold tracking-[-0.01em] transition-all ${
                heroVariant === v.id
                  ? 'bg-white text-black'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {heroVariant === 'cosmic' && <HeroCosmic backendOnline={backendOnline} stats={stats} systemTrust={systemTrust} />}
        {heroVariant === 'orbital' && <HeroOrbital backendOnline={backendOnline} stats={stats} systemTrust={systemTrust} />}
        {heroVariant === 'blob' && <HeroNeonBlob backendOnline={backendOnline} stats={stats} systemTrust={systemTrust} />}
        {heroVariant === 'constellation' && <HeroConstellation backendOnline={backendOnline} stats={stats} systemTrust={systemTrust} />}
        {heroVariant === 'grid' && <HeroIconGrid backendOnline={backendOnline} stats={stats} systemTrust={systemTrust} />}
      </div>

      {/* METRICS — Mission Control layout */}
      <section className="relative bg-[#FBFBFD] py-32 px-6" id="dashboard">
        <div className="mx-auto max-w-[1200px]">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <div className="flex items-end justify-between flex-wrap gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0071E3]/8 border border-[#0071E3]/15 mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3] animate-pulse" />
                  <span className="text-[11px] font-bold tracking-[0.16em] text-[#0071E3] uppercase">Mission Control</span>
                </div>
                <h2 className="text-[56px] md:text-[64px] font-semibold tracking-[-0.04em] leading-[1.0] text-[#1D1D1F]">
                  System status.
                </h2>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-semibold tracking-[0.16em] text-[#86868B] uppercase mb-1">Last updated</div>
                <div className="text-[14px] font-medium text-[#1D1D1F] tabular-nums">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} UTC</div>
              </div>
            </div>
          </motion.div>

          {/* Hero score + breakdown grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 mb-10">
            {/* Big circular gauge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="relative rounded-[28px] bg-[#0A0A0F] p-8 overflow-hidden"
              style={{ boxShadow: '0 30px 80px -20px rgba(0,0,0,0.4)' }}
            >
              {/* Glow */}
              <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl opacity-40"
                style={{ background: 'radial-gradient(circle, #0071E3, transparent 65%)' }} />

              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <div className="text-[11px] font-bold tracking-[0.16em] text-white/50 uppercase">System Trust</div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF9500]" />
                    <span className="text-[10px] font-bold tracking-wider text-white/70 uppercase">Review</span>
                  </div>
                </div>

                {/* Circular gauge */}
                <div className="relative flex items-center justify-center py-4">
                  <svg viewBox="0 0 200 200" className="w-[220px] h-[220px] -rotate-90">
                    <defs>
                      <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#5AC8FA" />
                        <stop offset="50%" stopColor="#0071E3" />
                        <stop offset="100%" stopColor="#AF52DE" />
                      </linearGradient>
                    </defs>
                    {/* Track */}
                    <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
                    {/* Progress */}
                    <motion.circle
                      cx="100" cy="100" r="80"
                      fill="none"
                      stroke="url(#gaugeGrad)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 80}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                      whileInView={{ strokeDashoffset: 2 * Math.PI * 80 * (1 - systemTrust / 100) }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                    />
                    {/* Tick marks */}
                    {Array.from({ length: 60 }).map((_, i) => {
                      const angle = (i * 6) * Math.PI / 180
                      const r1 = 92, r2 = 96
                      const x1 = 100 + r1 * Math.cos(angle)
                      const y1 = 100 + r1 * Math.sin(angle)
                      const x2 = 100 + r2 * Math.cos(angle)
                      const y2 = 100 + r2 * Math.sin(angle)
                      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                    })}
                  </svg>

                  {/* Center value */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="flex items-baseline gap-1 text-white font-semibold tabular-nums tracking-[-0.05em]">
                      <span className="text-[64px] leading-none">{systemTrust.toFixed(1)}</span>
                      <span className="text-[24px] opacity-40">%</span>
                    </div>
                    <div className="mt-2 text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">Overall</div>
                  </div>
                </div>

                {/* Bottom labels */}
                <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'Data', value: datasetScore, color: '#0071E3' },
                    { label: 'Model', value: modelScore, color: '#AF52DE' },
                    { label: 'Output', value: outputScore, color: '#34C759' },
                  ].map((m) => (
                    <div key={m.label} className="rounded-xl bg-white/[0.04] border border-white/[0.06] py-3">
                      <div className="text-[16px] font-semibold text-white tabular-nums tracking-[-0.02em]">{m.value.toFixed(1)}%</div>
                      <div className="mt-1 text-[9px] font-bold tracking-[0.16em] text-white/40 uppercase">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right side — breakdown + mini charts */}
            <div className="space-y-5">
              {[
                { title: 'Dataset Integrity', value: datasetScore, status: getStatus(datasetScore), color: '#0071E3', icon: Database },
                { title: 'Model Integrity', value: modelScore, status: getStatus(modelScore), color: '#AF52DE', icon: Brain },
                { title: 'Output Integrity', value: outputScore, status: getStatus(outputScore), color: '#34C759', icon: FileCheck2 },
              ].map((item, i) => {
                const Icon = item.icon
                const statusColor = item.status === 'GOOD' ? '#34C759' : item.status === 'REVIEW' ? '#FF9500' : '#FF3B30'
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    className="group flex items-center gap-5 rounded-2xl bg-white p-5 border border-black/[0.04] transition-all hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.08)]"
                  >
                    {/* Icon */}
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
                      style={{ background: `${item.color}12` }}>
                      <Icon size={24} style={{ color: item.color }} strokeWidth={2} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-semibold tracking-[-0.01em] text-[#1D1D1F]">{item.title}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
                        <span className="text-[12px] font-medium text-[#86868B] capitalize">{item.status.toLowerCase()}</span>
                      </div>
                    </div>

                    {/* Value */}
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-[36px] font-semibold leading-none tabular-nums tracking-[-0.04em]" style={{ color: item.color }}>
                        {item.value.toFixed(1)}
                      </span>
                      <span className="text-[16px] font-medium opacity-40" style={{ color: item.color }}>%</span>
                    </div>

                    {/* Mini bar */}
                    <div className="w-24 h-1.5 rounded-full bg-[#F0F0F2] overflow-hidden flex-shrink-0">
                      <motion.div
                        initial={{ width: 0 }} whileInView={{ width: `${Math.min(item.value, 100)}%` }}
                        viewport={{ once: true }} transition={{ duration: 1.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full"
                        style={{ background: item.color }}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* INTEGRITY CHAIN + ACTIVE EVENTS — Mission Control */}
      <section className="relative bg-[#FBFBFD] px-6 pb-32">
        <div className="mx-auto max-w-[1200px] grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-8">

          {/* LEFT: Integrity Chain */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8 }}
            className="relative rounded-[28px] bg-white p-8 border border-black/[0.04] overflow-hidden"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse" />
                  <span className="text-[10px] font-bold tracking-[0.18em] text-[#34C759] uppercase">Live Pipeline</span>
                </div>
                <h3 className="text-[26px] font-semibold tracking-[-0.025em] text-[#1D1D1F]">Integrity Chain</h3>
                <p className="mt-1 text-[14px] text-[#86868B] tracking-[-0.01em]">End-to-end assurance pipeline</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#34C759]/8 border border-[#34C759]/20">
                <Check size={12} className="text-[#34C759]" strokeWidth={3} />
                <span className="text-[11px] font-bold tracking-wider text-[#34C759] uppercase">Verified</span>
              </div>
            </div>

            {/* Pipeline stages — vertical timeline */}
            <div className="relative">
              {/* Vertical flow line */}
              <div className="absolute left-[27px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-[#5AC8FA] via-[#0071E3] via-[#AF52DE] to-[#34C759] opacity-20 rounded-full" />

              {/* Animated pulse traveling down */}
              <motion.div
                className="absolute left-[26px] w-[4px] h-[40px] rounded-full"
                style={{ background: 'linear-gradient(180deg, transparent, #5AC8FA, transparent)', filter: 'blur(2px)' }}
                animate={{ top: ['5%', '85%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />

              <div className="space-y-3 relative">
                {[
                  { label: 'Contributor', desc: 'Signed identity verification', count: null, color: '#5AC8FA', icon: 'ID' },
                  { label: 'Dataset', desc: 'SHA-256 hash + drift scan', count: stats.datasets, unit: 'datasets', color: '#0071E3', icon: 'DB' },
                  { label: 'Model', desc: 'Signature + lineage tracked', count: stats.models, unit: 'models', color: '#AF52DE', icon: 'M' },
                  { label: 'Inference', desc: 'Runtime audit + output signed', count: null, color: '#5E5CE6', icon: 'I' },
                  { label: 'Output', desc: 'Anchored to immutable ledger', count: stats.blocks, unit: 'blocks', color: '#34C759', icon: 'OK' },
                ].map((step, i) => (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="group flex items-center gap-5 rounded-2xl bg-[#FBFBFD] hover:bg-white p-4 border border-transparent hover:border-black/[0.04] transition-all cursor-default"
                  >
                    {/* Node */}
                    <div className="relative flex-shrink-0">
                      <div
                        className="flex h-[56px] w-[56px] items-center justify-center rounded-2xl text-white text-[13px] font-bold tracking-tight transition-transform duration-300 group-hover:scale-105"
                        style={{
                          background: `linear-gradient(135deg, ${step.color}, ${step.color}CC)`,
                          boxShadow: `0 8px 24px -6px ${step.color}80`
                        }}
                      >
                        {step.icon}
                      </div>
                      <div className="absolute -right-1 -bottom-1 w-5 h-5 rounded-full bg-white border-2 flex items-center justify-center"
                        style={{ borderColor: step.color }}>
                        <Check size={11} style={{ color: step.color }} strokeWidth={3.5} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[16px] font-semibold tracking-[-0.015em] text-[#1D1D1F]">{step.label}</span>
                        <span className="text-[10px] font-bold tracking-[0.14em] text-[#86868B] uppercase">Stage 0{i + 1}</span>
                      </div>
                      <div className="mt-0.5 text-[13px] text-[#86868B] tracking-[-0.005em]">{step.desc}</div>
                    </div>

                    {/* Count badge */}
                    {step.count !== null && (
                      <div className="flex flex-col items-end flex-shrink-0">
                        <div className="text-[26px] font-semibold leading-none tabular-nums tracking-[-0.03em]" style={{ color: step.color }}>
                          {step.count}
                        </div>
                        <div className="mt-1 text-[9px] font-bold tracking-[0.14em] text-[#86868B] uppercase">{step.unit}</div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Stats footer */}
            <div className="mt-8 pt-6 border-t border-black/[0.04] grid grid-cols-3 gap-4">
              {[
                { label: 'Chain Length', value: '5 stages', color: '#0071E3' },
                { label: 'Avg Latency', value: '47ms', color: '#AF52DE' },
                { label: 'Success Rate', value: '99.8%', color: '#34C759' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="text-[10px] font-bold tracking-[0.16em] text-[#86868B] uppercase mb-1">{item.label}</div>
                  <div className="text-[18px] font-semibold tabular-nums tracking-[-0.02em]" style={{ color: item.color }}>{item.value}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT: Active Events */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8, delay: 0.1 }}
            className="relative rounded-[28px] bg-[#0A0A0F] p-8 overflow-hidden"
            style={{ boxShadow: '0 20px 60px -15px rgba(0,0,0,0.4)' }}
          >
            {/* Glow */}
            <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full blur-3xl opacity-30"
              style={{ background: 'radial-gradient(circle, #FF3B30, transparent 65%)' }} />

            {/* Header */}
            <div className="relative flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-pulse" style={{ boxShadow: '0 0 8px #FF3B30' }} />
                  <span className="text-[10px] font-bold tracking-[0.18em] text-[#FF453A] uppercase">Live Alerts</span>
                </div>
                <h3 className="text-[26px] font-semibold tracking-[-0.025em] text-white">Active Events</h3>
                <p className="mt-1 text-[13px] text-white/40 tracking-[-0.005em]">Threats requiring attention</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FF3B30]/15 border border-[#FF3B30]/30">
                <span className="text-[16px] font-bold text-[#FF453A]">5</span>
              </div>
            </div>

            {/* Severity breakdown */}
            <div className="relative grid grid-cols-3 gap-2 mb-6">
              {[
                { label: 'Critical', count: 2, color: '#FF3B30' },
                { label: 'High', count: 2, color: '#FF9500' },
                { label: 'Medium', count: 1, color: '#0071E3' },
              ].map((sev) => (
                <div key={sev.label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
                  <div className="text-[22px] font-semibold tabular-nums tracking-[-0.03em]" style={{ color: sev.color }}>{sev.count}</div>
                  <div className="mt-0.5 text-[9px] font-bold tracking-[0.14em] text-white/40 uppercase">{sev.label}</div>
                </div>
              ))}
            </div>

            {/* Events list */}
            <div className="relative space-y-2">
              {attacks.slice(0, 5).map((event: any, i: number) => {
                const isCritical = event.severity === 'CRITICAL'
                const isHigh = event.severity === 'HIGH'
                const color = isCritical ? '#FF3B30' : isHigh ? '#FF9500' : '#0071E3'
                const name = String(event.name || '').replace(/_/g, ' ').toLowerCase().replace(/\w/g, (c: string) => c.toUpperCase())
                return (
                  <motion.div
                    key={event.id || i}
                    initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="group flex items-center gap-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] px-4 py-3 transition-all cursor-default"
                  >
                    {/* Left color bar */}
                    <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 8px ${color}80` }} />

                    {/* Icon */}
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0" style={{ background: `${color}20` }}>
                      <AlertTriangle size={14} style={{ color }} strokeWidth={2.2} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-white tracking-[-0.005em] truncate">{name || 'Event'}</div>
                      <div className="text-[10px] text-white/40 tracking-tight mt-0.5">Recent · {Math.floor(Math.random() * 60) + 1}min ago</div>
                    </div>

                    {/* Severity */}
                    <span className="text-[9px] font-bold tracking-[0.1em] uppercase px-2 py-1 rounded-md flex-shrink-0"
                      style={{ background: `${color}20`, color }}>
                      {event.severity}
                    </span>
                  </motion.div>
                )
              })}
              {attacks.length === 0 && (
                <div className="text-center py-8 text-white/30 text-[13px]">No active events</div>
              )}
            </div>

            {/* View all */}
            <a
              href="/attacks"
              className="relative mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] text-[13px] font-semibold text-white/80 hover:text-white transition-all"
            >
              View All Events
              <ArrowUpRight size={13} strokeWidth={2.4} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ===== SEE IT IN ACTION ===== */}
      <section className="relative bg-[#FBFBFD] py-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8 }}
            className="text-center max-w-[760px] mx-auto mb-16"
          >
            <div className="text-[#AF52DE] text-[12px] font-semibold tracking-[0.18em] uppercase mb-4">See it in action</div>
            <h2 className="text-[44px] font-semibold tracking-[-0.03em] leading-[1.05] text-[#1D1D1F]">
              Live inference,
              <br />
              <span className="text-[#86868B]">cryptographically verified.</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-[1000px] mx-auto"
          >
            {/* Floating labels */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-5 -left-5 z-20 hidden md:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-[#E5E5EA]"
            >
              <div className="w-7 h-7 rounded-lg bg-[#34C759]/15 flex items-center justify-center">
                <span className="text-[#34C759] text-[12px] font-bold">✓</span>
              </div>
              <div>
                <div className="text-[12px] font-semibold text-[#1D1D1F] tracking-[-0.01em]">Data verified</div>
                <div className="text-[10px] text-[#86868B] font-medium">SHA-256 · 12 files</div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
              className="absolute top-1/3 -right-6 z-20 hidden md:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-[#E5E5EA]"
            >
              <div className="w-7 h-7 rounded-lg bg-[#AF52DE]/15 flex items-center justify-center">
                <span className="text-[#AF52DE] text-[12px] font-bold">◆</span>
              </div>
              <div>
                <div className="text-[12px] font-semibold text-[#1D1D1F] tracking-[-0.01em]">Model signed</div>
                <div className="text-[10px] text-[#86868B] font-medium">yolov8n.pt · 6.2MB</div>
              </div>
            </motion.div>

            {/* Glow */}
            <div className="absolute -inset-6 rounded-[40px] opacity-50 blur-3xl"
              style={{ background: 'linear-gradient(135deg, rgba(0,113,227,0.15), rgba(175,82,222,0.12))' }} />

            {/* Card */}
            <div className="relative rounded-[24px] p-[1.5px] bg-gradient-to-tr from-black/[0.06] via-black/[0.02] to-black/[0.06]">
              <div className="rounded-[23px] bg-white overflow-hidden shadow-[0_40px_120px_-20px_rgba(0,0,0,0.15)]">
                {/* Real image with bbox */}
                <div className="relative aspect-[16/8] overflow-hidden bg-black">
                  <img src="/images/bear.jpg" alt="Bear detection" className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-xl border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-pulse" />
                    <span className="text-white text-[10px] font-bold tracking-wider uppercase">Live</span>
                  </div>
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-xl border border-white/10">
                    <span className="text-white/80 text-[10px] font-mono">1280×720 · 47ms</span>
                  </div>
                  {/* Bounding box */}
                  <div className="absolute" style={{ top: '35%', left: '22%', width: '38%', height: '50%' }}>
                    <div className="w-full h-full border-2 border-[#34C759] rounded-md relative" style={{ boxShadow: '0 0 20px rgba(52,199,89,0.6)' }}>
                      <div className="absolute -top-7 left-0 px-2 py-1 rounded bg-[#34C759] text-white text-[11px] font-bold tracking-tight">bear 0.94</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== QUICK ACTIONS ===== */}
      <section className="relative bg-white py-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <div className="text-[#0071E3] text-[12px] font-semibold tracking-[0.18em] uppercase mb-3">Quick Actions</div>
            <h2 className="text-[40px] font-semibold tracking-[-0.03em] leading-[1.05] text-[#1D1D1F]">
              Start in seconds.
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: 'Upload Dataset', desc: 'Anchor new data', color: '#0071E3', icon: '⬆', link: '/upload' },
              { title: 'Register Model', desc: 'Sign artifact', color: '#AF52DE', icon: '◆', link: '/models' },
              { title: 'Run Audit', desc: 'Full pipeline check', color: '#34C759', icon: '✓', link: '/audit' },
              { title: 'Generate Report', desc: 'Signed PDF', color: '#FF9500', icon: '▤', link: '/reports' },
            ].map((action, i) => (
              <motion.a
                key={action.title}
                href={action.link}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="group relative block rounded-[22px] bg-[#F5F5F7] p-7 border border-transparent hover:border-[#E5E5EA] hover:bg-white transition-all overflow-hidden"
                style={{ boxShadow: '0 0 0 rgba(0,0,0,0)' }}
              >
                {/* Colored glow on hover */}
                <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100 pointer-events-none"
                  style={{ background: `${action.color}25` }} />

                <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{ background: `${action.color}18`, boxShadow: `0 0 0 ${action.color}00` }}>
                  <span className="text-[20px] font-bold" style={{ color: action.color }}>{action.icon}</span>
                </div>
                <div className="relative text-[16px] font-semibold tracking-[-0.02em] text-[#1D1D1F]">{action.title}</div>
                <div className="relative mt-1.5 text-[13.5px] text-[#86868B] tracking-[-0.01em]">{action.desc}</div>

                <div className="relative mt-6 flex items-center gap-1.5 text-[12.5px] font-semibold tracking-[-0.01em] opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1"
                  style={{ color: action.color }}>
                  Open
                  <ArrowUpRight size={12} strokeWidth={2.4} />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== RECENT ACTIVITY FEED ===== */}
      <section className="relative bg-[#111114] py-24 px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full blur-[200px] opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0071E3, transparent 65%)' }} />

        <div className="max-w-[1000px] mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8 }}
            className="mb-12 flex items-center gap-3"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse" style={{ boxShadow: '0 0 10px #34C759' }} />
            <span className="text-[12px] font-semibold tracking-[0.2em] uppercase text-white">Live Integrity Feed</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.1 }}
            className="rounded-3xl bg-white/[0.02] border border-white/[0.06] p-5 backdrop-blur-xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {[
                { time: '10:42:18', event: 'Dataset integrity verified', detail: 'coco_val_2017 · 5,000 images', color: '#34C759' },
                { time: '10:42:22', event: 'Model signature matched', detail: 'yolov8n.pt · SHA-256 OK', color: '#0071E3' },
                { time: '10:42:31', event: 'Inference batch anchored', detail: 'Batch #847 · block 0x4a3f…c9', color: '#AF52DE' },
                { time: '10:42:45', event: 'Drift check: within threshold', detail: 'PSI 0.03 · nominal', color: '#5AC8FA' },
                { time: '10:43:02', event: 'Provenance chain intact', detail: '4 hops verified', color: '#34C759' },
                { time: '10:43:18', event: 'Backdoor scan complete', detail: '0 triggers detected', color: '#FF9500' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-colors"
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-[13px] font-semibold tracking-[-0.01em] truncate">{item.event}</div>
                    <div className="text-white/40 text-[11px] tracking-[-0.01em] truncate mt-0.5">{item.detail}</div>
                  </div>
                  <div className="text-white/30 text-[10px] font-mono tracking-tight flex-shrink-0">{item.time}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      
      {/* ===== FEATURES GRID ===== */}
      <section className="relative bg-white py-32 px-6">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8 }}
            className="text-center max-w-[760px] mx-auto mb-20"
          >
            <div className="text-[12px] font-semibold tracking-[0.18em] text-[#0071E3] uppercase mb-4">What it covers</div>
            <h2 className="text-[52px] md:text-[64px] font-semibold tracking-[-0.04em] leading-[1.02] text-[#1D1D1F]">
              Everything,
              <br />
              <span className="text-[#86868B]">end to end.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: 'Datasets', desc: 'Verify integrity, detect drift, flag poisoned samples.', img: '/images/feat-datasets.jpg', color: '#0071E3', link: '/datasets' },
              { title: 'Models', desc: 'Sign artifacts, track lineage, audit signatures.', img: '/images/feat-models.jpg', color: '#AF52DE', link: '/models' },
              { title: 'Blockchain', desc: 'Tamper-evident ledger for every artifact.', img: '/images/feat-blockchain.jpg', color: '#34C759', link: '/blockchain' },
              { title: 'Security', desc: 'Backdoor detection, tamper monitoring, threat feeds.', img: '/images/feat-security.jpg', color: '#FF3B30', link: '/cybersecurity' },
              { title: 'Explainability', desc: 'Grad-CAM, SHAP, saliency — explain every prediction.', img: '/images/feat-xai.jpg', color: '#5E5CE6', link: '/xai' },
              { title: 'Analytics', desc: 'Real-time metrics across the entire pipeline.', img: '/images/feat-analytics.jpg', color: '#FF9500', link: '/analytics' },
            ].map((f, i) => (
              <motion.a
                key={f.title}
                href={f.link}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7, delay: i * 0.08 }}
                whileHover={{ y: -8 }}
                className="group relative block overflow-hidden rounded-[28px] bg-white border border-[#E5E5EA]/60 hover:border-transparent transition-all"
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}
              >
                {/* Colored glow on hover */}
                <div className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[28px] pointer-events-none"
                  style={{ background: `linear-gradient(135deg, ${f.color}30, transparent 60%)`, filter: 'blur(20px)' }} />

                {/* Image or Custom Visual */}
                <div className="relative aspect-[16/11] overflow-hidden bg-[#F5F5F7]">
                  {f.custom === 'analytics' ? (
                    /* Custom SVG analytics visualization */
                    <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)' }}>
                      <svg viewBox="0 0 400 275" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                        {/* Grid lines */}
                        {[60, 100, 140, 180].map((y, i) => (
                          <line key={i} x1="50" y1={y} x2="380" y2={y} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2 4" opacity="0.5" />
                        ))}

                        {/* Y-axis labels */}
                        {[{y:60, l:'100'}, {y:100, l:'75'}, {y:140, l:'50'}, {y:180, l:'25'}].map((item, i) => (
                          <text key={i} x="30" y={item.y + 4} fontSize="9" fill="#9CA3AF" textAnchor="end" fontFamily="monospace">{item.l}</text>
                        ))}

                        {/* Area chart — animated gradient fill */}
                        <defs>
                          <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#FF9500" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#FF9500" stopOpacity="0" />
                          </linearGradient>
                          <linearGradient id="lineGrad" x1="0" x2="1">
                            <stop offset="0%" stopColor="#FFB340" />
                            <stop offset="100%" stopColor="#FF9500" />
                          </linearGradient>
                        </defs>

                        <motion.path
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 2, ease: 'easeOut', repeat: Infinity, repeatDelay: 2 }}
                          d="M 60,190 L 110,150 L 160,160 L 210,110 L 260,120 L 310,80 L 360,90"
                          fill="none"
                          stroke="url(#lineGrad)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        <motion.path
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                          d="M 60,190 L 110,150 L 160,160 L 210,110 L 260,120 L 310,80 L 360,90 L 360,220 L 60,220 Z"
                          fill="url(#areaGrad)"
                        />

                        {/* Data points */}
                        {[[60,190],[110,150],[160,160],[210,110],[260,120],[310,80],[360,90]].map(([cx, cy], i) => (
                          <motion.circle
                            key={i}
                            cx={cx} cy={cy} r="3.5"
                            fill="white"
                            stroke="#FF9500"
                            strokeWidth="2.5"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.3 + i * 0.15, repeat: Infinity, repeatDelay: 3.5 }}
                          />
                        ))}

                        {/* Bars overlay in back */}
                        {[85, 130, 175, 220, 265, 310, 355].map((x, i) => {
                          const heights = [30, 45, 38, 60, 55, 75, 68]
                          return (
                            <motion.rect
                              key={i}
                              x={x - 8} y={220 - heights[i]}
                              width="16" height={heights[i]}
                              rx="3"
                              fill="#FF9500"
                              opacity="0.12"
                              initial={{ scaleY: 0 }}
                              animate={{ scaleY: 1 }}
                              style={{ transformOrigin: `0 220px` }}
                              transition={{ duration: 0.8, delay: i * 0.1, repeat: Infinity, repeatDelay: 3.5 }}
                            />
                          )
                        })}
                      </svg>

                      {/* Live badge */}
                      <div className="absolute top-5 left-5 flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-xl border border-white/40 bg-white/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF9500] animate-pulse" />
                        <span className="text-[#7C2D12] text-[10px] font-bold tracking-[0.12em] uppercase">Live Data</span>
                      </div>

                      {/* Stat overlay */}
                      <div className="absolute bottom-4 right-4 px-3 py-2 rounded-xl backdrop-blur-xl bg-white/80 border border-white/60">
                        <div className="text-[9px] uppercase tracking-[0.14em] text-[#9CA3AF] font-bold">Events/min</div>
                        <div className="text-[18px] font-semibold tabular-nums text-[#1D1D1F] tracking-[-0.02em]">847</div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={f.img}
                      alt={f.title}
                      className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.08]"
                    />
                  )}
                  {/* Bottom gradient fade */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Colored overlay on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"
                    style={{ background: `linear-gradient(135deg, ${f.color}50, transparent 70%)` }} />

                  {/* Category badge — Apple style */}
                  <div className="absolute top-5 left-5 flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-xl border border-white/30 bg-white/25">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: f.color }} />
                    <span className="text-white text-[10px] font-bold tracking-[0.14em] uppercase">{f.title}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="relative p-8">
                  <h3 className="text-[24px] font-semibold tracking-[-0.028em] text-[#1D1D1F] leading-tight">{f.title}</h3>
                  <p className="mt-2.5 text-[15px] text-[#6E6E73] leading-[1.55] tracking-[-0.012em]">{f.desc}</p>

                  {/* Explore link with hover animation */}
                  <div className="mt-7 flex items-center gap-2 text-[13.5px] font-semibold tracking-[-0.01em] transition-all duration-300"
                    style={{ color: f.color }}>
                    <span>Explore</span>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 group-hover:translate-x-1"
                      style={{ background: `${f.color}15` }}>
                      <ArrowUpRight size={13} strokeWidth={2.6} />
                    </div>
                  </div>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-8 right-8 h-[2px] rounded-full overflow-hidden">
                    <div className="h-full w-0 group-hover:w-full transition-all duration-700 ease-out"
                      style={{ background: `linear-gradient(90deg, ${f.color}, ${f.color}00)` }} />
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PIPELINE VISUAL ===== */}
      <section className="relative bg-[#111114] py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img src="/images/pipeline.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#111114] via-[#111114]/60 to-[#111114]" />
        </div>

        <div className="max-w-[1200px] mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8 }}
            className="text-center max-w-[760px] mx-auto mb-20"
          >
            <div className="text-[12px] font-semibold tracking-[0.18em] text-[#5AC8FA] uppercase mb-4">Pipeline</div>
            <h2 className="text-[52px] md:text-[64px] font-semibold tracking-[-0.04em] leading-[1.02] text-white">
              Every stage,
              <br />
              <span className="text-white/40">cryptographically bound.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Connecting line — below numbers */}
            <div className="hidden md:block absolute top-[88px] left-[12%] right-[12%] h-[1px] opacity-25 pointer-events-none"
              style={{ background: 'linear-gradient(90deg, #5AC8FA, #0071E3, #AF52DE, #34C759)' }} />

            {[
              { num: '01', title: 'Ingest', desc: 'Data & models registered with SHA-256.', color: '#5AC8FA' },
              { num: '02', title: 'Analyze', desc: 'Integrity, drift, backdoor, robustness.', color: '#0071E3' },
              { num: '03', title: 'Anchor', desc: 'Committed to tamper-evident ledger.', color: '#AF52DE' },
              { num: '04', title: 'Assure', desc: 'Signed reports ready for audit.', color: '#34C759' },
            ].map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7, delay: i * 0.1 }}
                className="relative group"
              >
                <div className="text-[64px] font-semibold leading-none tracking-[-0.04em] opacity-25 mb-6 transition-opacity group-hover:opacity-60"
                  style={{ color: s.color }}>
                  {s.num}
                </div>
                <div className="h-[2px] mb-6 rounded-full" style={{ background: `linear-gradient(90deg, ${s.color}, transparent)` }} />
                <h3 className="text-[22px] font-semibold tracking-[-0.02em] text-white">{s.title}</h3>
                <p className="mt-3 text-[14.5px] text-white/50 leading-[1.5] tracking-[-0.01em]">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BLOCKCHAIN LEDGER ===== */}
      <section className="relative bg-white py-32 px-6 overflow-hidden">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.9 }}
            >
              <div className="text-[12px] font-semibold tracking-[0.18em] text-[#34C759] uppercase mb-4">Immutable Ledger</div>
              <h2 className="text-[48px] md:text-[56px] font-semibold tracking-[-0.035em] leading-[1.02] text-[#1D1D1F]">
                A chain of trust,
                <br />
                <span className="text-[#86868B]">block by block.</span>
              </h2>
              <p className="mt-6 text-[18px] text-[#6E6E73] leading-[1.5] tracking-[-0.015em] max-w-[500px]">
                Every artifact — dataset, model, or inference output — is cryptographically anchored to an immutable ledger. Any tampering breaks the chain and is instantly detectable.
              </p>
              <div className="mt-10 flex items-center gap-4">
                <a href="/blockchain" className="group inline-flex items-center gap-2 rounded-full bg-[#0071E3] px-7 py-3.5 text-[15px] font-semibold text-white transition-all hover:scale-[1.03]"
                  style={{ boxShadow: '0 12px 40px -8px rgba(0,113,227,0.6)' }}>
                  Explore Ledger
                  <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
                </a>
              </div>

              {/* Stats grid */}
              <div className="mt-12 grid grid-cols-3 gap-4">
                {[
                  { label: 'Blocks', value: stats.blocks, color: '#34C759' },
                  { label: 'Wallets', value: stats.wallets, color: '#FF9500' },
                  { label: 'Contracts', value: '4', color: '#AF52DE' },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-[40px] font-semibold tracking-[-0.03em] leading-none tabular-nums" style={{ color: s.color }}>{s.value}</div>
                    <div className="mt-2 text-[11px] uppercase tracking-[0.16em] font-semibold text-[#86868B]">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.9, delay: 0.1 }}
              className="relative"
            >
              <div className="absolute -inset-6 rounded-[44px] opacity-40 blur-3xl"
                style={{ background: 'linear-gradient(135deg, rgba(52,199,89,0.3), rgba(0,113,227,0.2))' }} />
              <div className="relative rounded-[28px] p-[1.5px] bg-gradient-to-tr from-black/[0.06] via-black/[0.02] to-black/[0.06]">
                <div className="rounded-[27px] overflow-hidden bg-white shadow-[0_40px_120px_-20px_rgba(0,0,0,0.15)]">
                  <img src="/images/feat-blockchain.jpg" alt="Blockchain ledger" className="w-full h-auto" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== DEFENCE CONTEXT ===== */}
      <section className="relative min-h-[600px] overflow-hidden">
        <img src="/images/cyber.jpg" alt="Defence context" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

        <div className="relative max-w-[1200px] mx-auto px-6 py-32 flex items-center min-h-[600px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1 }}
            className="max-w-[640px]"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/15 bg-white/[0.05] backdrop-blur-xl mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" style={{ boxShadow: '0 0 8px #34C759' }} />
              <span className="text-white/80 text-[11px] font-semibold tracking-[0.16em] uppercase">Built for defence</span>
            </div>
            <h2 className="text-[52px] md:text-[64px] font-semibold tracking-[-0.04em] leading-[1.02] text-white">
              Trust isn't a feature.
              <br />
              <span className="bg-gradient-to-r from-[#2DD4BF] via-[#10B981] to-[#34C759] bg-clip-text text-transparent" style={{ filter: 'drop-shadow(0 0 30px rgba(45,212,191,0.4))' }}>
                It's the foundation.
              </span>
            </h2>
            <p className="mt-8 text-[19px] text-white/60 leading-[1.5] tracking-[-0.015em] max-w-[520px]">
              Designed for SIH Problem Statement 26228. Fully offline, air-gapped, and NIST AI RMF aligned. No cloud. No external dependency.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a href="/trust" className="inline-flex items-center gap-2 rounded-full bg-white text-black px-7 py-3.5 text-[15px] font-semibold tracking-[-0.01em] transition-all hover:scale-[1.03]"
                style={{ boxShadow: '0 20px 60px -12px rgba(255,255,255,0.3)' }}>
                Trust Center
              </a>
              <a href="/assurance" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.05] backdrop-blur-xl text-white px-7 py-3.5 text-[15px] font-medium tracking-[-0.01em] transition-all hover:bg-white/[0.1]">
                Assurance Reports
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="relative overflow-hidden bg-black">
        <img src="/images/cta-bg.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-black" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full blur-[200px] opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0071E3, transparent 60%)' }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1 }}
          className="relative max-w-[900px] mx-auto text-center py-40 px-6"
        >
          <h2 className="text-[56px] md:text-[80px] font-semibold tracking-[-0.045em] leading-[0.98] text-white">
            Ready to verify
            <br />
            <span className="bg-gradient-to-r from-[#2DD4BF] via-[#10B981] to-[#34C759] bg-clip-text text-transparent">
              your pipeline?
            </span>
          </h2>
          <p className="mt-8 text-[18px] text-white/50 leading-[1.5] tracking-[-0.015em] max-w-[540px] mx-auto">
            Start anchoring your datasets and models to a tamper-evident ledger today.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <a href="/upload" className="group inline-flex items-center gap-2 rounded-full bg-white text-black px-8 py-4 text-[15px] font-semibold tracking-[-0.01em] transition-all hover:scale-[1.03]"
              style={{ boxShadow: '0 20px 60px -12px rgba(255,255,255,0.4)' }}>
              Get Started
              <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
            </a>
            <a href="/help" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.05] backdrop-blur-xl text-white px-8 py-4 text-[15px] font-medium tracking-[-0.01em] transition-all hover:bg-white/[0.1]">
              Read Docs
            </a>
          </div>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-black border-t border-white/[0.06] py-8 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-[12px] font-semibold tracking-tight">CV-INTEGRITY</span>
          </div>
          <div className="flex items-center gap-5 text-white/30 text-[11px] tracking-tight">
            <span>© 2026 CV-Integrity</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>SIH 26228</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>Offline · Air-gapped</span>
          </div>
        </div>
      </footer>


    </div>
  )
}

export default Home
