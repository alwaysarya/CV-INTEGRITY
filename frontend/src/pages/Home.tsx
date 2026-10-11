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
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`group relative overflow-hidden rounded-[18px] p-7 transition-shadow ${
        emphasized ? 'bg-[#1D1D1F] text-white shadow-[0_8px_40px_rgba(0,0,0,0.15)]' : 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className={`text-[15px] font-medium ${emphasized ? 'text-white/85' : 'text-[#86868B]'}`}>{title}</div>
        <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
          emphasized ? 'bg-white/10 text-white' : 'bg-[#F5F5F7] text-[#1D1D1F] group-hover:bg-[#0071E3] group-hover:text-white'
        }`}>
          <ArrowUpRight size={14} />
        </div>
      </div>
      <div className={`mt-8 text-[56px] font-semibold leading-none tracking-[-0.04em] ${emphasized ? 'text-white' : 'text-[#1D1D1F]'}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
        {Number.isFinite(value) ? value.toFixed(1) : '0.0'}
        <span className="ml-0.5 text-[28px] font-medium">%</span>
      </div>
      <div className={`mt-3 flex items-center gap-2 text-[13px] ${emphasized ? 'text-white/70' : 'text-[#86868B]'}`}>
        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: statusColor }} />
        <span className="font-medium">{statusLabel}</span>
      </div>
      <div className={`mt-6 h-1 overflow-hidden rounded-full ${emphasized ? 'bg-white/15' : 'bg-[#F5F5F7]'}`}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(value || 0, 100)}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full rounded-full" style={{ background: emphasized ? '#0071E3' : statusColor }} />
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

  useEffect(() => { load(); checkHealth(); const t = setInterval(checkHealth, 10000); return () => clearInterval(t) }, [])

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

                              {/* HERO — Cosmic Void (Option Z) */}
      <section className="relative overflow-hidden bg-black">
        <div className="pointer-events-none absolute inset-0">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1400 900" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="starGlowZ" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="horizonZ" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0071E3" stopOpacity="0" />
                <stop offset="50%" stopColor="#5AC8FA" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#AF52DE" stopOpacity="0" />
              </linearGradient>
            </defs>

            {Array.from({ length: 80 }).map((_, i) => {
              const x = (i * 137.5) % 1400;
              const y = (i * 73.3) % 700;
              const r = (i % 3) * 0.6 + 0.8;
              const dur = 2 + (i % 5);
              return (
                <motion.circle
                  key={`star-${i}`}
                  cx={x} cy={y} r={r}
                  fill="white"
                  animate={{ opacity: [0.15, 0.9, 0.15] }}
                  transition={{ duration: dur, repeat: Infinity, delay: (i % 10) * 0.3, ease: 'easeInOut' }}
                />
              );
            })}

            {Array.from({ length: 18 }).map((_, i) => (
              <line
                key={`grid-v-${i}`}
                x1={i * 80} y1="700" x2={700 + (i * 80 - 700) * 4} y2="900"
                stroke="#0071E3" strokeWidth="0.5" opacity="0.25"
              />
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <line
                key={`grid-h-${i}`}
                x1="0" y1={700 + i * 40} x2="1400" y2={700 + i * 40}
                stroke="#0071E3" strokeWidth="0.5" opacity={0.3 - i * 0.04}
              />
            ))}
          </svg>

          <div className="absolute left-0 right-0 top-[68%] h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, #5AC8FA, #AF52DE, transparent)', boxShadow: '0 0 40px #0071E3, 0 0 80px #5AC8FA' }} />
          <div className="absolute left-0 right-0 top-[68%] h-[400px]" style={{ background: 'linear-gradient(180deg, rgba(0,113,227,0.15), transparent)' }} />
        </div>

        <div className="relative mx-auto max-w-[1200px] px-6 pt-32 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl"
            >
              <span className={`h-2 w-2 rounded-full ${backendOnline ? 'animate-pulse bg-[#34C759]' : 'bg-[#FF3B30]'}`} style={{ boxShadow: backendOnline ? '0 0 10px #34C759' : 'none' }} />
              <span className="text-[11px] font-semibold tracking-[0.18em] text-white/70">
                {backendOnline ? 'SYSTEM ONLINE' : 'OFFLINE'}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.3 }}
              className="max-w-[950px] text-[96px] font-semibold leading-[0.95] tracking-[-0.045em] text-white"
              style={{ textShadow: '0 0 80px rgba(90,200,250,0.3)' }}
            >
              Vision Integrity,{' '}
              <span className="bg-gradient-to-r from-[#5AC8FA] via-[#0071E3] to-[#AF52DE] bg-clip-text text-transparent">
                Assured.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-8 max-w-[640px] text-[22px] font-medium leading-relaxed text-white/50"
            >
              Real-time assurance for computer vision pipelines — from dataset to deployment.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-4"
            >
              <a href="#dashboard" className="rounded-full bg-white px-8 py-3.5 text-[15px] font-semibold text-black transition-all hover:scale-105" style={{ boxShadow: '0 0 60px rgba(255,255,255,0.4)' }}>
                Open Dashboard
              </a>
              <a href="/video" className="rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-[15px] font-medium text-white backdrop-blur-xl transition-all hover:scale-105 hover:bg-white/10">
                View Live Vision →
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1 }}
              className="mt-24 flex flex-wrap items-center justify-center gap-x-20 gap-y-10"
            >
              {[
                ['Trust Score', `${systemTrust.toFixed(1)}%`, '#5AC8FA'],
                ['Datasets', String(stats.datasets), '#34C759'],
                ['Models', String(stats.models), '#AF52DE'],
                ['Ledger Blocks', String(stats.blocks), '#0071E3'],
              ].map(([label, value, color]: any) => (
                <div key={label} className="text-center">
                  <div className="text-[44px] font-semibold tracking-[-0.03em] text-white" style={{ textShadow: `0 0 40px ${color}` }}>
                    {value}
                  </div>
                  <div className="mt-2 text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">
                    {label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

{/* Live Vision — Alag Section */}
      <section className="mx-auto max-w-[1200px] px-6 pt-8 pb-20">
        <div className="mb-8 text-center">
          <div className="text-[12px] font-medium tracking-[0.14em] text-[#86868B] uppercase">Live Vision Analysis</div>
          <h2 className="mt-3 text-[40px] font-semibold tracking-[-0.02em] text-[#1D1D1F]">See what the model sees.</h2>
          <p className="mt-3 text-[17px] text-[#86868B]">Real-time frame inspection with detection overlay and confidence metrics.</p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-[18px] bg-[#1D1D1F] shadow-[0_8px_40px_rgba(0,0,0,0.15)]">
              <div className="relative aspect-[16/10]">
                {frame?.image ? (
                  <>
                    <img src={`data:image/jpeg;base64,${frame.image}`} alt="Live vision" className="absolute inset-0 h-full w-full object-cover" />
                    {frame.detectionList?.slice(0, 3).map((d: any, i: number) => {
                      const conf = (d.confidence || 0) * 100
                      const color = conf >= 75 ? '#34C759' : conf >= 50 ? '#FF9500' : '#FF3B30'
                      return (
                        <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.12 }} className="absolute rounded-lg border-2" style={{ left: `${d.bbox?.[0] || 20}%`, top: `${d.bbox?.[1] || 30}%`, width: `${d.bbox?.[2] || 25}%`, height: `${d.bbox?.[3] || 30}%`, borderColor: color, background: `${color}15` }}>
                          <div className="absolute -top-6 left-0 rounded-md px-2 py-0.5 text-[10px] font-semibold text-white" style={{ background: color }}>
                            {d.class} · {conf.toFixed(0)}%
                          </div>
                        </motion.div>
                      )
                    })}
                    <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 backdrop-blur-xl">
                      <span className={`h-2 w-2 rounded-full ${backendOnline ? 'animate-pulse bg-[#34C759]' : 'bg-[#FF3B30]'}`} />
                      <span className="text-[11px] font-semibold tracking-wider text-white">LIVE</span>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <Video size={48} className="text-white/30" />
                    <span className="text-[14px] text-white/50">Awaiting vision stream...</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-4 gap-4 border-t border-white/10 px-7 py-5">
                {[
                  { label: 'FRAME', value: `#${String(frame?.frame || 0).padStart(4, '0')}` },
                  { label: 'OBJECTS', value: String(frame?.detections || 0) },
                  { label: 'DETECTIONS', value: String(frame?.detectionList?.length || 0) },
                  { label: 'CAMERA', value: backendOnline ? 'ONLINE' : 'OFFLINE' },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-[10px] font-medium tracking-wider text-white/40">{s.label}</div>
                    <div className="mt-1 text-[14px] font-semibold text-white">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5 lg:col-span-1">
            <div className="rounded-[18px] bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-[17px] font-semibold text-[#1D1D1F]">Detected Classes</h3>
                  <p className="mt-0.5 text-[13px] text-[#86868B]">Live telemetry</p>
                </div>
                <Eye size={16} className="text-[#86868B]" />
              </div>
              <div className="space-y-4">
                {classes.slice(0, 5).map((c) => (
                  <div key={c.name}>
                    <div className="mb-2 flex items-center justify-between text-[13px]">
                      <span className="font-medium capitalize text-[#1D1D1F]">{c.name}</span>
                      <span className="font-mono text-[#86868B]">{c.count} · {c.pct}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#F5F5F7]">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${c.pct}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-[#0071E3]" />
                    </div>
                  </div>
                ))}
                {classes.length === 0 && <div className="py-4 text-center text-[13px] text-[#86868B]">No detections</div>}
              </div>
            </div>

            <div className="rounded-[18px] bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="mb-5">
                <h3 className="text-[17px] font-semibold text-[#1D1D1F]">Performance</h3>
                <p className="mt-0.5 text-[13px] text-[#86868B]">Inference signals</p>
              </div>
              <div className="space-y-3">
                {[
                  ['Objects detected', String(frame?.detections || 0)],
                  ['Inference latency', '2 ms'],
                  ['Distribution shift', `${distributionShift.toFixed(1)}%`],
                  ['Anomalies', String(anomalies)],
                ].map(([l, v]) => (
                  <div key={l} className="flex items-center justify-between">
                    <span className="text-[13px] text-[#86868B]">{l}</span>
                    <span className="font-mono text-[13px] font-semibold text-[#1D1D1F]">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Score Cards */}
      <section className="mx-auto max-w-[1200px] px-6 pb-20" id="dashboard">
        <div className="mb-8 text-center">
          <div className="text-[12px] font-medium tracking-[0.14em] text-[#86868B] uppercase">Live Assurance Metrics</div>
          <h2 className="mt-3 text-[40px] font-semibold tracking-[-0.02em] text-[#1D1D1F]">Everything at a glance.</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <ScoreCard title="System Trust" value={systemTrust} status={getStatus(systemTrust)} icon={ShieldCheck} emphasized />
          <ScoreCard title="Dataset Integrity" value={datasetScore} status={getStatus(datasetScore)} icon={Database} />
          <ScoreCard title="Model Integrity" value={modelScore} status={getStatus(modelScore)} icon={Brain} />
          <ScoreCard title="Output Integrity" value={outputScore} status={getStatus(outputScore)} icon={FileCheck2} />
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

    </div>
  )
}

export default Home
