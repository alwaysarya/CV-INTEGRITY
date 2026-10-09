import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheck, Database, Brain, FileCheck2, ArrowUpRight, RefreshCw,
  Search, Video, AlertTriangle, Activity, Gauge, Eye, Check, X
} from 'lucide-react'
import apiClient from '@/lib/api'

const API = 'http://localhost:8000'

function ScoreCard({ title, code, value, status, icon: Icon, emphasized = false }: any) {
  const statusColor =
    status === 'GOOD' ? { bg: '#10B981', text: '#065F46', light: '#D1FAE5', label: 'Healthy' }
    : status === 'REVIEW' ? { bg: '#F59E0B', text: '#92400E', light: '#FEF3C7', label: 'Review' }
    : { bg: '#EF4444', text: '#991B1B', light: '#FEE2E2', label: 'Critical' }

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      className={`relative rounded-2xl border p-5 transition-shadow ${
        emphasized
          ? 'border-emerald-700 bg-gradient-to-br from-emerald-800 to-emerald-950 shadow-lg'
          : 'border-slate-200 bg-white hover:shadow-lg'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className={`text-[14px] font-semibold ${emphasized ? 'text-white' : 'text-slate-900'}`}>
          {title}
        </div>
        <button className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
          emphasized
            ? 'border-white/20 bg-white/10 text-white hover:bg-white/20'
            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800'
        }`}>
          <ArrowUpRight size={14} />
        </button>
      </div>

      <div className={`mt-6 text-[42px] font-bold leading-none tracking-tight ${
        emphasized ? 'text-white' : 'text-slate-900'
      }`} style={{ fontVariantNumeric: 'tabular-nums' }}>
        {Number.isFinite(value) ? value.toFixed(1) : '0.0'}
        <span className="ml-0.5 text-xl font-semibold">%</span>
      </div>

      <div className={`mt-3 flex items-center gap-1.5 text-[11px] ${
        emphasized ? 'text-emerald-200' : 'text-slate-500'
      }`}>
        <span className={`inline-block h-1.5 w-1.5 rounded-full`} style={{ background: emphasized ? '#A7F3D0' : statusColor.bg }} />
        <span className="font-medium">{statusColor.label}</span>
      </div>

      <div className={`mt-4 h-1 overflow-hidden rounded-full ${
        emphasized ? 'bg-white/15' : 'bg-slate-100'
      }`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value || 0, 100)}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: emphasized ? '#A7F3D0' : statusColor.bg }}
        />
      </div>
    </motion.div>
  )
}

function LiveVision({ frame, online }: any) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm">
      <div className="relative aspect-[16/10]">
        {frame?.image ? (
          <img
            src={`data:image/jpeg;base64,${frame.image}`}
            alt="Live vision frame"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900">
            <Video size={32} className="text-slate-600" />
            <span className="text-[11px] text-slate-500">Awaiting vision stream...</span>
          </div>
        )}

        {/* Top-left label */}
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 backdrop-blur-md">
          <span className={`h-1.5 w-1.5 rounded-full ${online ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
          <span className="text-[10px] font-semibold tracking-wider text-white">LIVE VISION</span>
        </div>

        {/* Top-right status */}
        <div className="absolute right-4 top-4 flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 backdrop-blur-md">
          <span className="text-[9px] font-mono text-white/70">CAM-01 · 1080p · 30 FPS</span>
        </div>

        {/* Detection boxes overlay */}
        {frame?.detectionList?.slice(0, 3).map((d: any, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="absolute rounded border border-emerald-400/80 bg-emerald-400/10 backdrop-blur-sm"
            style={{
              left: `${d.bbox?.[0] || 20}%`,
              top: `${d.bbox?.[1] || 30}%`,
              width: `${d.bbox?.[2] || 25}%`,
              height: `${d.bbox?.[3] || 30}%`,
            }}
          >
            <div className="absolute -top-5 left-0 rounded bg-emerald-500 px-1.5 py-0.5 text-[9px] font-semibold text-white">
              {d.class} · {((d.confidence || 0) * 100).toFixed(0)}%
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer stats */}
      <div className="grid grid-cols-4 gap-3 border-t border-white/10 bg-slate-950 px-5 py-3">
        {[
          { label: 'FRAME', value: `#${String(frame?.frame || 0).padStart(6, '0')}` },
          { label: 'OBJECTS', value: String(frame?.detections || 0) },
          { label: 'DETECTIONS', value: String(frame?.detectionList?.length || 0) },
          { label: 'CAMERA', value: online ? 'ONLINE' : 'OFFLINE' },
        ].map((s) => (
          <div key={s.label}>
            <div className="text-[9px] font-medium tracking-wider text-white/40">{s.label}</div>
            <div className="mt-0.5 text-[12px] font-semibold text-white">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EventRow({ event }: any) {
  const color =
    event.severity === 'CRITICAL' ? '#EF4444'
    : event.severity === 'HIGH' ? '#F59E0B'
    : '#3B82F6'

  return (
    <motion.div
      whileHover={{ x: 2 }}
      className="flex items-start gap-3 rounded-lg border-l-[3px] bg-slate-50 px-3 py-2.5 transition-colors hover:bg-slate-100"
      style={{ borderLeftColor: color }}
    >
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12px] font-medium text-slate-800">
          {String(event.name || '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())}
        </div>
        <div className="mt-0.5 text-[10px] text-slate-500">Recent event</div>
      </div>
      <span
        className="shrink-0 rounded px-2 py-0.5 text-[9px] font-semibold"
        style={{ background: `${color}15`, color }}
      >
        {event.severity}
      </span>
    </motion.div>
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
  const [loading, setLoading] = useState(false)

  const checkHealth = async () => {
    try {
      const res = await fetch(`${API}/health`)
      setBackendOnline(res.ok)
    } catch {
      setBackendOnline(false)
    }
  }

  const load = async () => {
    setLoading(true)
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
        key,
        score: val.final_score || 0,
        decision: (val.decision || '').replace(/[✅⚠️❌]/g, '').trim(),
      }))
      setTrustScores(tsList)
      if (tsList.length) {
        setAvgTrust(Math.round(tsList.reduce((a, b) => a + b.score, 0) / tsList.length))
      }

      setAttacks(
        Object.entries(aRes.data.attacks || {}).map(([k, v]: [string, any]) => ({
          id: k,
          name: v.name || k,
          severity: String(v.severity || 'MEDIUM').toUpperCase(),
        }))
      )

      const vList = (vRes.thumbnails || [])
        .map((t: any) => ({
          frame: t.frame ?? 0,
          image: t.preview ?? t.image ?? '',
          detections: t.detections ?? 0,
          detectionList: t.detection_list || [],
          classCounts: t.class_counts || {},
        }))
        .filter((x: any) => x.image)

      setFrames(vList)

      const agg: Record<string, number> = {}
      for (const t of (vRes.thumbnails || [])) {
        for (const [k, v] of Object.entries(t.class_counts || {})) {
          agg[k] = (agg[k] || 0) + (v as number)
        }
      }
      const total = Object.values(agg).reduce((a, b) => a + b, 0) || 1
      setClasses(
        Object.entries(agg)
          .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }))
          .sort((a, b) => b.count - a.count)
      )
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    checkHealth()
    const timer = window.setInterval(checkHealth, 10000)
    return () => window.clearInterval(timer)
  }, [])

  const frame = frames[0] || null
  const allDetections = frames.flatMap((f: any) => f.detectionList || [])
  const avgConfidence = allDetections.length
    ? (allDetections.reduce((s: number, d: any) => s + (d.confidence || 0), 0) / allDetections.length) * 100
    : 0

  const datasetScore = trustScores.length
    ? trustScores.reduce((sum, item) => sum + item.score, 0) / trustScores.length
    : 0
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
  ]

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-6">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              CV-INTEGRITY / Overview
            </div>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">
              Vision Assurance Center
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Monitor model quality, inference integrity, and security events from one workspace.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-medium text-emerald-700">
                {backendOnline ? 'System online' : 'System offline'}
              </span>
            </div>
            <button
              onClick={load}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* 4 Score Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ScoreCard title="System Trust" code="OVERALL ASSURANCE" value={systemTrust} status={getStatus(systemTrust)} icon={ShieldCheck} emphasized />
          <ScoreCard title="Dataset Integrity" code="DATA QUALITY" value={datasetScore} status={getStatus(datasetScore)} icon={Database} />
          <ScoreCard title="Model Integrity" code="MODEL ASSURANCE" value={modelScore} status={getStatus(modelScore)} icon={Brain} />
          <ScoreCard title="Output Integrity" code="INFERENCE OUTPUT" value={outputScore} status={getStatus(outputScore)} icon={FileCheck2} />
        </div>

        {/* Live Vision + Active Events */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[14px] font-semibold text-slate-900">Live Vision</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">Real-time scene analysis and detection preview</div>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-mono text-slate-600">
                  Frame {String(frame?.frame || 0).padStart(6, '0')}
                </div>
              </div>
              <LiveVision frame={frame} online={backendOnline} />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[14px] font-semibold text-slate-900">Active Events</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">Threats and events requiring attention</div>
                </div>
                <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-600">
                  {attacks.length}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  ['Critical', critical, '#EF4444'],
                  ['High', high, '#F59E0B'],
                  ['Medium', medium, '#3B82F6'],
                ].map(([label, value, color]: any) => (
                  <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[20px] font-bold" style={{ color }}>{value}</div>
                    <div className="mt-0.5 text-[10px] font-medium text-slate-500">{label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                {attacks.slice(0, 5).map((a, i) => (
                  <EventRow key={i} event={a} />
                ))}
                {attacks.length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center">
                    <Check size={20} className="mx-auto text-emerald-500" />
                    <div className="mt-2 text-[12px] font-medium text-slate-700">No active events</div>
                    <div className="mt-0.5 text-[10px] text-slate-500">All systems nominal</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Snapshot */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[14px] font-semibold text-slate-900">Performance Snapshot</div>
              <div className="mt-0.5 text-[11px] text-slate-500">Current inference and assurance signals</div>
            </div>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-500">
              Live metrics
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: 'Objects detected', value: String(frame?.detections || 0), note: 'Current frame', color: '#10B981', icon: Eye },
              { label: 'Inference latency', value: '2 ms', note: 'Processing time', color: '#3B82F6', icon: Activity },
              { label: 'Distribution shift', value: `${distributionShift.toFixed(1)}%`, note: 'Data drift signal', color: '#F59E0B', icon: Gauge },
              { label: 'Anomalies', value: String(anomalies), note: 'Flagged records', color: anomalies > 0 ? '#EF4444' : '#10B981', icon: AlertTriangle },
            ].map(({ label, value, note, color, icon: Icon }) => (
              <motion.div
                key={label}
                whileHover={{ y: -2 }}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition-colors hover:bg-slate-100"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md" style={{ background: `${color}15` }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">{label}</span>
                </div>
                <div className="mt-3 text-[24px] font-bold tracking-tight text-slate-900">{value}</div>
                <div className="mt-0.5 text-[10px] text-slate-400">{note}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Integrity Chain + Detected Classes */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-[14px] font-semibold text-slate-900">Integrity Chain</div>
                <div className="mt-0.5 text-[11px] text-slate-500">End-to-end assurance pipeline</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {integrity.map(([name, ok]: any, i: number) => (
                <div key={name} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
                    ok ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
                  }`}>
                    <Check size={12} className={ok ? 'text-emerald-600' : 'text-red-600'} />
                    <span className={`text-[11px] font-medium ${ok ? 'text-emerald-700' : 'text-red-700'}`}>
                      {name}
                    </span>
                  </div>
                  {i < integrity.length - 1 && <span className="text-slate-300">→</span>}
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                ['Datasets', stats.datasets, Database],
                ['Models', stats.models, Brain],
                ['Blocks', stats.blocks, ShieldCheck],
                ['Wallets', stats.wallets, FileCheck2],
              ].map(([label, value, Icon]: any) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <Icon size={14} className="text-slate-400" />
                  <div className="mt-2 text-[18px] font-bold text-slate-900">{value}</div>
                  <div className="mt-0.5 text-[10px] font-medium text-slate-500">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <div className="text-[14px] font-semibold text-slate-900">Detected Classes</div>
              <div className="mt-0.5 text-[11px] text-slate-500">Live vision telemetry</div>
            </div>
            <div className="space-y-3">
              {classes.slice(0, 5).map((c: any) => (
                <div key={c.name}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium capitalize text-slate-700">{c.name}</span>
                    <span className="font-mono text-slate-500">{c.count} · {c.pct}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${c.pct}%` }}
                      transition={{ duration: 0.7, delay: 0.1 }}
                      className="h-full rounded-full bg-emerald-500"
                    />
                  </div>
                </div>
              ))}
              {classes.length === 0 && (
                <div className="py-8 text-center text-[11px] text-slate-400">No active detections</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
