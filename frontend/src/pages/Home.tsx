import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheck, Database, Brain, FileCheck2, ArrowUpRight, RefreshCw,
  Video, AlertTriangle, Eye, Check, ChevronRight, Target
} from 'lucide-react'
import apiClient from '@/lib/api'

const API = 'http://localhost:8000'

function ScoreCard({ title, value, status, icon: Icon, emphasized = false }: any) {
  const statusColor = status === 'GOOD' ? '#34C759' : status === 'REVIEW' ? '#FF9500' : '#FF3B30'
  const statusLabel = status === 'GOOD' ? 'Healthy' : status === 'REVIEW' ? 'Review' : 'Critical'
  const safeValue = Number.isFinite(value) ? value : 0
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative overflow-hidden rounded-[22px] p-8 transition-shadow ${
        emphasized
          ? 'bg-[#1D1D1F] text-white shadow-[0_12px_48px_rgba(0,0,0,0.2)]'
          : 'bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]'
      }`}
    >
      {/* Ambient glow inside card on hover */}
      {!emphasized && (
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity group-hover:opacity-100"
          style={{ background: `${statusColor}20` }} />
      )}

      <div className="relative flex items-start justify-between">
        <div className={`text-[14px] font-semibold tracking-[-0.01em] ${emphasized ? 'text-white/80' : 'text-[#6E6E73]'}`}>{title}</div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
          emphasized
            ? 'bg-white/10 text-white group-hover:bg-white/20'
            : 'bg-[#F5F5F7] text-[#1D1D1F] group-hover:bg-[#0071E3] group-hover:text-white group-hover:scale-110'
        }`}>
          <ArrowUpRight size={14} strokeWidth={2.4} />
        </div>
      </div>

      <div className={`relative mt-10 flex items-baseline gap-0.5 font-semibold leading-none tracking-[-0.045em] tabular-nums ${emphasized ? 'text-white' : 'text-[#1D1D1F]'}`}>
        <span className="text-[56px]">{safeValue.toFixed(1)}</span>
        <span className="text-[24px] font-medium opacity-60">%</span>
      </div>

      <div className={`relative mt-4 flex items-center gap-2 text-[12.5px] font-medium ${emphasized ? 'text-white/70' : 'text-[#6E6E73]'}`}>
        <span className="inline-block h-2 w-2 rounded-full" style={{ background: statusColor, boxShadow: `0 0 8px ${statusColor}` }} />
        <span>{statusLabel}</span>
      </div>

      <div className={`relative mt-6 h-1.5 overflow-hidden rounded-full ${emphasized ? 'bg-white/15' : 'bg-[#F0F0F2]'}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(safeValue, 100)}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ background: emphasized ? 'linear-gradient(90deg, #5AC8FA, #0071E3)' : statusColor }}
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

      {/* HERO — Apple keynote */}
      <section className="relative overflow-hidden bg-black">
        {/* Ambient gradients */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-25%] left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full blur-[220px] opacity-30"
            style={{ background: 'radial-gradient(circle, #0071E3, transparent 60%)' }} />
          <div className="absolute bottom-[-20%] right-[10%] w-[900px] h-[900px] rounded-full blur-[220px] opacity-25"
            style={{ background: 'radial-gradient(circle, #AF52DE, transparent 60%)' }} />
          <div className="absolute bottom-[-15%] left-[10%] w-[700px] h-[700px] rounded-full blur-[220px] opacity-15"
            style={{ background: 'radial-gradient(circle, #5AC8FA, transparent 60%)' }} />
        </div>

        {/* Grid overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
          }} />

        {/* Starfield */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1400 900" preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 50 }).map((_, i) => {
            const x = (i * 173.7) % 1400;
            const y = (i * 91.3) % 900;
            const r = (i % 3) * 0.5 + 0.6;
            const dur = 2.5 + (i % 4);
            return (
              <motion.circle
                key={`star-${i}`}
                cx={x} cy={y} r={r}
                fill="white"
                animate={{ opacity: [0.15, 0.85, 0.15] }}
                transition={{ duration: dur, repeat: Infinity, delay: (i % 8) * 0.4, ease: 'easeInOut' }}
              />
            );
          })}
        </svg>

        {/* Content */}
        <div className="relative mx-auto flex max-w-[1200px] flex-col items-center justify-center px-6 pt-40 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center"
          >
            {/* Status badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-12 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 backdrop-blur-xl"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${backendOnline ? 'animate-pulse bg-[#34C759]' : 'bg-[#FF3B30]'}`}
                style={{ boxShadow: backendOnline ? '0 0 10px #34C759' : 'none' }}
              />
              <span className="text-[11px] font-semibold tracking-[0.18em] text-white/60">
                {backendOnline ? 'SYSTEM ONLINE' : 'OFFLINE'}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-[1000px] text-[64px] md:text-[88px] font-semibold leading-[0.98] tracking-[-0.045em] text-white"
            >
              Vision Integrity,
              <br />
              <motion.span
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-block bg-gradient-to-r from-[#5AC8FA] via-[#0071E3] via-[#AF52DE] to-[#5AC8FA] bg-clip-text text-transparent bg-[length:200%_100%]"
              >
                Assured.
              </motion.span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 max-w-[620px] text-[18px] font-medium leading-[1.5] tracking-[-0.015em] text-white/50"
            >
              Real-time assurance for computer vision pipelines — from dataset to deployment.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 flex flex-wrap items-center justify-center gap-3"
            >
              <a
                href="#metrics"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold tracking-[-0.01em] text-black transition-all hover:scale-[1.03]"
                style={{ boxShadow: '0 0 60px rgba(255,255,255,0.3)' }}
              >
                Explore Metrics
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </a>
              <a
                href="/video"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-7 py-3.5 text-[15px] font-medium tracking-[-0.01em] text-white/90 backdrop-blur-xl transition-all hover:scale-[1.03] hover:border-white/25 hover:bg-white/[0.08]"
              >
                View Live Vision
              </a>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="mt-12 flex flex-col items-center gap-2 text-white/25"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em]">Scroll</span>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* METRICS — Apple keynote */}
      <section className="relative bg-[#FBFBFD] py-24 px-6" id="dashboard">
        <div className="mx-auto max-w-[1200px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8 }}
            className="mb-16 text-center"
          >
            <div className="text-[12px] font-semibold tracking-[0.18em] text-[#0071E3] uppercase mb-4">Live Assurance Metrics</div>
            <h2 className="text-[48px] md:text-[56px] font-semibold tracking-[-0.035em] leading-[1.02] text-[#1D1D1F]">
              Everything at a glance.
            </h2>
            <p className="mt-5 max-w-[560px] mx-auto text-[18px] text-[#6E6E73] leading-[1.5] tracking-[-0.015em]">
              Real-time integrity signals across the entire pipeline.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            <ScoreCard title="System Trust" value={systemTrust} status={getStatus(systemTrust)} icon={ShieldCheck} emphasized />
            <ScoreCard title="Dataset Integrity" value={datasetScore} status={getStatus(datasetScore)} icon={Database} />
            <ScoreCard title="Model Integrity" value={modelScore} status={getStatus(modelScore)} icon={Brain} />
            <ScoreCard title="Output Integrity" value={outputScore} status={getStatus(outputScore)} icon={FileCheck2} />
          </div>
        </div>
      </section>

      {/* Integrity Chain + Events */}
      <section className="mx-auto max-w-[1200px] px-6 pb-20">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-[18px] bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="mb-6">
                <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-[#1D1D1F]">Integrity Chain</h2>
                <p className="mt-1 text-[14px] text-[#86868B]">End-to-end assurance pipeline</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {integrity.map(([name, ok], i) => (
                  <div key={name} className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 rounded-full border px-4 py-2 ${ok ? 'border-[#34C759]/30 bg-[#34C759]/5' : 'border-[#FF3B30]/30 bg-[#FF3B30]/5'}`}>
                      <Check size={14} className={ok ? 'text-[#34C759]' : 'text-[#FF3B30]'} />
                      <span className={`text-[13px] font-medium ${ok ? 'text-[#1D1D1F]' : 'text-[#FF3B30]'}`}>{name}</span>
                    </div>
                    {i < integrity.length - 1 && <ChevronRight size={16} className="text-[#D2D2D7]" />}
                  </div>
                ))}
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  ['Datasets', stats.datasets], ['Models', stats.models], ['Blocks', stats.blocks], ['Wallets', stats.wallets],
                ].map(([label, value]: any) => (
                  <div key={label} className="rounded-xl bg-[#FBFBFD] p-5">
                    <div className="text-[28px] font-semibold tracking-[-0.03em] text-[#1D1D1F]">{value}</div>
                    <div className="mt-1 text-[12px] font-medium text-[#86868B]">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="h-full rounded-[18px] bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[21px] font-semibold text-[#1D1D1F]">Active Events</h3>
                  <p className="mt-1 text-[13px] text-[#86868B]">Threats requiring attention</p>
                </div>
                <span className="rounded-md bg-[#FF3B30]/10 px-2 py-0.5 text-[12px] font-semibold text-[#FF3B30]">{attacks.length}</span>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[['Critical', critical, '#FF3B30'], ['High', high, '#FF9500'], ['Medium', medium, '#0071E3']].map(([label, value, color]: any) => (
                  <div key={label} className="rounded-xl bg-[#FBFBFD] p-3">
                    <div className="text-[22px] font-semibold" style={{ color }}>{value}</div>
                    <div className="mt-0.5 text-[11px] font-medium text-[#86868B]">{label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-2">
                {attacks.slice(0, 4).map((a, i) => <EventRow key={i} event={a} />)}
              </div>
            </div>
          </div>
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
                whileHover={{ y: -6 }}
                className="group relative block overflow-hidden rounded-[24px] bg-white border border-[#E5E5EA] hover:border-transparent transition-all"
                style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#F5F5F7]">
                  <img
                    src={f.img}
                    alt={f.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Color overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(135deg, ${f.color}30, transparent 70%)` }} />
                  {/* Category badge */}
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full backdrop-blur-xl border border-white/30 bg-white/20">
                    <span className="text-white text-[10px] font-bold tracking-[0.1em] uppercase">{f.title}</span>
                  </div>
                </div>
                {/* Content */}
                <div className="p-7">
                  <h3 className="text-[22px] font-semibold tracking-[-0.025em] text-[#1D1D1F]">{f.title}</h3>
                  <p className="mt-2 text-[14.5px] text-[#6E6E73] leading-[1.5] tracking-[-0.01em]">{f.desc}</p>
                  <div className="mt-6 flex items-center gap-1.5 text-[13px] font-semibold tracking-[-0.01em] transition-all group-hover:gap-2.5"
                    style={{ color: f.color }}>
                    Explore
                    <ArrowUpRight size={13} strokeWidth={2.4} />
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
            {/* Connecting line */}
            <div className="hidden md:block absolute top-[44px] left-[12%] right-[12%] h-[1px] opacity-30"
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
              <span className="bg-gradient-to-r from-[#5AC8FA] to-[#AF52DE] bg-clip-text text-transparent">
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
            <span className="bg-gradient-to-r from-[#5AC8FA] via-[#0071E3] to-[#AF52DE] bg-clip-text text-transparent">
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
