import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Car, AlertTriangle, Target, Database, Brain, Link as LinkIcon, Wallet,
  Shield, Camera, Play, Activity, ChevronRight, Radio, Eye, TrendingUp,
  Zap, FileText, Hash, Lock, CheckCircle, XCircle, Wifi, WifiOff
} from 'lucide-react'
import apiClient from '@/lib/api'

const API = 'http://localhost:8000'

export function Home() {
  const [stats, setStats] = useState({ datasets: 0, models: 0, blocks: 0, wallets: 0 })
  const [metrics, setMetrics] = useState<any>({})
  const [attacks, setAttacks] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [frames, setFrames] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [trustScores, setTrustScores] = useState<any[]>([])
  const [avgTrust, setAvgTrust] = useState(0)
  const [modelInfo, setModelInfo] = useState<any>(null)
  const [blockTimes, setBlockTimes] = useState<number[]>([])
  const [backendOnline, setBackendOnline] = useState(true)
  const [latency, setLatency] = useState(0)
  const [timestamp, setTimestamp] = useState(new Date())
  const [activeTab, setActiveTab] = useState('LIVE')
  const [mainFrame, setMainFrame] = useState<any>(null)
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0)

  useEffect(() => {
    load()
    checkHealth()
    const tick = setInterval(() => setTimestamp(new Date()), 1000)
    const health = setInterval(checkHealth, 10000)
    return () => { clearInterval(tick); clearInterval(health) }
  }, [])

  // Auto-cycle frames every 3s (like real video)
  useEffect(() => {
    if (frames.length === 0) return
    const iv = setInterval(() => {
      setCurrentFrameIdx((i) => (i + 1) % frames.length)
    }, 3000)
    return () => clearInterval(iv)
  }, [frames])

  useEffect(() => {
    if (frames.length > 0) setMainFrame(frames[currentFrameIdx])
  }, [currentFrameIdx, frames])

  const checkHealth = async () => {
    try {
      const start = Date.now()
      const res = await fetch(`${API}/health`)
      setLatency(Date.now() - start)
      setBackendOnline(res.ok)
    } catch {
      setBackendOnline(false)
      setLatency(0)
    }
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

      const modelsObj = mRes.data.models || {}
      const firstModel = Object.values(modelsObj)[0] as any
      if (firstModel) setModelInfo(firstModel)

      const ts = tRes.trust_scores || {}
      const tsList = Object.entries(ts).map(([key, val]: [string, any]) => ({
        key,
        dataset: val.dataset || key,
        score: val.final_score || 0,
        decision: (val.decision || '').replace(/[✅⚠️❌]/g, '').trim() || 'N/A',
      }))
      setTrustScores(tsList)
      if (tsList.length) {
        setAvgTrust(Math.round(tsList.reduce((a, b) => a + b.score, 0) / tsList.length))
      }

      const attackList = Object.entries(aRes.data.attacks || {}).map(([k, v]: [string, any]) => ({
        id: k,
        name: v.name || k,
        severity: v.severity || 'Medium',
        desc: v.description || '',
      }))
      setAttacks(attackList)

      const vList = (vRes.thumbnails || []).map((t: any) => ({
        frame: t.frame ?? 0,
        image: t.preview ?? t.image ?? '',
        detections: t.detections ?? 0,
        detectionList: t.detection_list || [],
        classCounts: t.class_counts || {},
        imageSize: [640, 480],
      })).filter((x: any) => x.image)
      setFrames(vList)
      if (vList.length > 0) setMainFrame(vList[0])

      const agg: Record<string, number> = {}
      for (const t of (vRes.thumbnails || [])) {
        for (const [k, v] of Object.entries(t.class_counts || {})) {
          agg[k] = (agg[k] || 0) + (v as number)
        }
      }
      const total = Object.values(agg).reduce((a, b) => a + b, 0) || 1
      setClasses(Object.entries(agg).map(([name, count]) => ({
        name, count, pct: Math.round((count / total) * 100),
      })).sort((a, b) => b.count - a.count))

      const blocksList = (bRes.data.blocks || []).slice().reverse()
      setActivities(blocksList.slice(0, 15).map((b: any) => ({
        id: b.index ?? 0,
        action: b.data?.action || 'EVENT',
        timestamp: b.datetime || b.timestamp,
      })))

      // REAL block intervals for waveform
      const times = (bRes.data.blocks || [])
        .sort((a: any, b: any) => (a.index || 0) - (b.index || 0))
        .map((b: any) => b.timestamp || 0)
        .filter((t: number) => t > 0)
      const intervals = times.slice(1).map((t: number, i: number) => {
        const diff = t - times[i]
        return diff > 0 && diff < 300 ? diff * 1000 : 0
      }).filter((x: number) => x > 0)
      setBlockTimes(intervals.slice(-20))
    } catch (e) { console.error(e) }
  }

  const severityColors: Record<string, string> = {
    Critical: '#F87171',
    High: '#FBBF24',
    Medium: '#38BDF8',
    Low: '#5EEAD4',
  }

  // REAL computed stats
  const totalFrames = frames.length
  const totalDetections = frames.reduce((s, f) => s + (f.detections || 0), 0)
  const classTypes = classes.length
  const allDetections = frames.flatMap((f: any) => f.detectionList || [])
  const avgConfidence = allDetections.length
    ? (allDetections.reduce((s: number, d: any) => s + (d.confidence || 0), 0) / allDetections.length * 100).toFixed(1)
    : '0'

  // NEURAL_LINK waveform — real block intervals normalized
  const maxInterval = Math.max(...blockTimes, 1)
  const waveformPoints = blockTimes.length > 1
    ? blockTimes.map((t, i) => `${(i / (blockTimes.length - 1)) * 300},${70 - (t / maxInterval) * 50}`).join(' ')
    : '0,60 300,60'

  // Trust trend — derived from real scores
  const trustTrend = trustScores.length > 0
    ? trustScores.every((t: any) => t.score >= 50) ? 'STABLE' : 'DEGRADED'
    : 'AWAITING_DATA'

  return (
    <div className="min-h-screen p-6" style={{ background: '#08080C', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 pb-4"
        style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center"
            style={{ background: 'rgba(94, 234, 212, 0.1)', border: '1px solid rgba(94, 234, 212, 0.4)' }}>
            <Radio size={14} style={{ color: '#5EEAD4' }} />
          </div>
          <div>
            <div className="text-[13px] font-bold tracking-[0.2em]" style={{ color: '#5EEAD4' }}>CV-INTEGRITY</div>
            <div className="text-[9px] tracking-[0.2em]" style={{ color: '#5EEAD4', opacity: 0.5 }}>COMPUTER VISION ASSURANCE</div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {['MONITOR', 'ANALYSIS', 'THREATS', 'REPORTS'].map((t, i) => (
            <div key={t} className="text-[10px] tracking-[0.15em] font-semibold cursor-pointer"
              style={{ color: '#5EEAD4', opacity: i === 0 ? 1 : 0.4 }}>
              {t} {i === 0 && '[F1]'}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded"
          style={{
            background: backendOnline ? 'rgba(94, 234, 212, 0.08)' : 'rgba(248, 113, 113, 0.08)',
            border: backendOnline ? '1px solid rgba(94, 234, 212, 0.3)' : '1px solid rgba(248, 113, 113, 0.3)',
          }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: backendOnline ? '#5EEAD4' : '#F87171' }} />
          <span className="text-[10px] font-mono tracking-wider"
            style={{ color: backendOnline ? '#5EEAD4' : '#F87171' }}>
            {backendOnline ? 'ONLINE' : 'OFFLINE'} :: {latency}ms :: {timestamp.toLocaleTimeString('en-US', { hour12: false })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">

        {/* LEFT COLUMN */}
        <div className="col-span-12 lg:col-span-3 space-y-4">

          {/* System Identity */}
          <div className="p-4 rounded" style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] tracking-[0.2em] font-bold" style={{ color: '#5EEAD4' }}>SYSTEM_IDENTITY</span>
              <Shield size={12} style={{ color: '#5EEAD4', opacity: 0.6 }} />
            </div>
            <div className="text-[20px] font-bold mb-1" style={{ color: '#FFFFFF' }}>
              YOLOv8 · {modelInfo?.name || 'LOADING'}
            </div>
            <div className="text-[10px] font-mono" style={{ color: '#5EEAD4', opacity: 0.6 }}>
              PRECISION: {(modelInfo?.precision || 0).toFixed(2)}%
            </div>
            <div className="text-[10px] font-mono" style={{ color: '#5EEAD4', opacity: 0.6 }}>
              mAP50: {(modelInfo?.mAP50 || 0).toFixed(2)}%
            </div>
            <div className="flex gap-2 mt-3">
              <span className="text-[9px] px-2 py-1 rounded font-mono"
                style={{ background: 'rgba(94, 234, 212, 0.15)', border: '1px solid rgba(94, 234, 212, 0.4)', color: '#5EEAD4' }}>
                SHA-256
              </span>
              <span className="text-[9px] px-2 py-1 rounded font-mono"
                style={{ background: 'rgba(94, 234, 212, 0.15)', border: '1px solid rgba(94, 234, 212, 0.4)', color: '#5EEAD4' }}>
                TRACKED
              </span>
            </div>
          </div>

          {/* Live Metrics */}
          <div className="p-4 rounded" style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] tracking-[0.2em] font-bold" style={{ color: '#5EEAD4' }}>LIVE_METRICS</span>
              <span className="text-[9px] px-2 py-0.5 rounded font-mono"
                style={{ background: 'rgba(94, 234, 212, 0.15)', color: '#5EEAD4' }}>LIVE</span>
            </div>
            <div className="space-y-3">
              <MetricRow label="PEOPLE_COUNT" value={(metrics.people_count ?? 0).toLocaleString()} />
              <MetricRow label="VEHICLE_COUNT" value={(metrics.vehicle_count ?? 0).toLocaleString()} />
              <MetricRow label="ANOMALY_COUNT" value={String(metrics.anomaly_count ?? 0)} />
              <MetricRow label="MODEL_ACCURACY" value={`${(metrics.accuracy ?? 0).toFixed(1)}%`} />
            </div>
          </div>

          {/* System Status */}
          <div className="p-4 rounded" style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
            <div className="text-[10px] tracking-[0.2em] font-bold mb-3" style={{ color: '#5EEAD4' }}>SYSTEM_STATUS</div>
            <div className="space-y-2.5">
              <MetricRow label="DATASETS" value={String(stats.datasets)} />
              <MetricRow label="MODELS" value={String(stats.models)} />
              <MetricRow label="BLOCKS" value={String(stats.blocks)} />
              <MetricRow label="WALLETS" value={String(stats.wallets)} />
            </div>
          </div>

          {/* Integrity Chain — real status derived from data */}
          <div className="p-4 rounded" style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
            <div className="text-[10px] tracking-[0.2em] font-bold mb-3" style={{ color: '#5EEAD4' }}>INTEGRITY_CHAIN</div>
            <div className="space-y-2">
              {[
                { label: 'CONTRIBUTOR', ok: stats.wallets > 0 },
                { label: 'DATA', ok: stats.datasets > 0 },
                { label: 'MODEL', ok: stats.models > 0 },
                { label: 'INFERENCE', ok: frames.length > 0 },
                { label: 'OUTPUT', ok: stats.blocks > 0 },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full"
                    style={{ background: s.ok ? '#5EEAD4' : '#F87171', boxShadow: `0 0 6px ${s.ok ? '#5EEAD4' : '#F87171'}` }} />
                  <span className="text-[10px] font-mono tracking-wider" style={{ color: '#FFFFFF', opacity: 0.8 }}>{s.label}</span>
                  <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded font-mono"
                    style={{
                      background: s.ok ? 'rgba(94, 234, 212, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                      color: s.ok ? '#5EEAD4' : '#F87171',
                    }}>
                    {s.ok ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Scores — real per entity */}
          <div className="p-4 rounded" style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
            <div className="text-[10px] tracking-[0.2em] font-bold mb-3" style={{ color: '#5EEAD4' }}>TRUST_SCORES</div>
            <div className="space-y-2">
              {trustScores.map((t, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase" style={{ color: '#5EEAD4', opacity: 0.7 }}>{t.dataset}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold font-mono"
                      style={{ color: t.score >= 80 ? '#5EEAD4' : t.score >= 50 ? '#FBBF24' : '#F87171' }}>
                      {t.score}
                    </span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded font-mono"
                      style={{
                        background: t.score >= 80 ? 'rgba(94, 234, 212, 0.15)' : t.score >= 50 ? 'rgba(251, 191, 36, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                        color: t.score >= 80 ? '#5EEAD4' : t.score >= 50 ? '#FBBF24' : '#F87171',
                      }}>
                      {t.decision}
                    </span>
                  </div>
                </div>
              ))}
              {trustScores.length === 0 && (
                <div className="text-[10px] font-mono text-center py-2" style={{ color: '#5EEAD4', opacity: 0.4 }}>
                  Loading...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN */}
        <div className="col-span-12 lg:col-span-6 space-y-4">

          {/* Center — Real Video with bboxes + Robot eye overlay */}
          <div className="relative rounded overflow-hidden p-6"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(94, 234, 212, 0.08) 0%, rgba(8, 8, 12, 0.95) 70%)',
              border: '1px solid rgba(94, 234, 212, 0.2)',
              minHeight: 620,
            }}>

            {/* Corner brackets */}
            <div className="absolute top-4 left-4 w-6 h-6 pointer-events-none" style={{ borderTop: '2px solid #5EEAD4', borderLeft: '2px solid #5EEAD4' }} />
            <div className="absolute top-4 right-4 w-6 h-6 pointer-events-none" style={{ borderTop: '2px solid #5EEAD4', borderRight: '2px solid #5EEAD4' }} />
            <div className="absolute bottom-4 left-4 w-6 h-6 pointer-events-none" style={{ borderBottom: '2px solid #5EEAD4', borderLeft: '2px solid #5EEAD4' }} />
            <div className="absolute bottom-4 right-4 w-6 h-6 pointer-events-none" style={{ borderBottom: '2px solid #5EEAD4', borderRight: '2px solid #5EEAD4' }} />

            <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded text-[10px] font-mono tracking-wider z-20"
              style={{ background: 'rgba(94, 234, 212, 0.08)', border: '1px solid rgba(94, 234, 212, 0.3)', color: '#5EEAD4' }}>
              SCAN_SEQ: CAM-01_FRAME_{mainFrame?.frame ?? 0}
            </div>

            <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
              style={{
                backgroundImage: 'linear-gradient(#5EEAD4 1px, transparent 1px), linear-gradient(90deg, #5EEAD4 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }} />

            {/* Camera / Vision Lens */}
            <div className="relative flex items-center justify-center" style={{ minHeight: 520 }}>
              <svg viewBox="0 0 600 500" className="w-full max-w-2xl h-auto">
                <defs>
                  <radialGradient id="lensAmbient">
                    <stop offset="0%" stopColor="#5EEAD4" stopOpacity="0.4" />
                    <stop offset="60%" stopColor="#5EEAD4" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#5EEAD4" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="glassInner">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
                    <stop offset="30%" stopColor="#5EEAD4" stopOpacity="0.4" />
                    <stop offset="60%" stopColor="#38BDF8" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#0A0F14" stopOpacity="0.9" />
                  </radialGradient>
                  <linearGradient id="metalRing" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#5EEAD4" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.7" />
                  </linearGradient>
                  <linearGradient id="irisGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5EEAD4" />
                    <stop offset="50%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#A78BFA" />
                  </linearGradient>
                  <filter id="softGlow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Ambient glow */}
                <circle cx="300" cy="250" r="240" fill="url(#lensAmbient)" />

                {/* Outer rotating tick ring */}
                <motion.g
                  animate={{ rotate: 360 }}
                  transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
                  style={{ transformOrigin: '300px 250px' }}
                >
                  {Array.from({ length: 60 }).map((_, i) => {
                    const angle = (i * 6 * Math.PI) / 180
                    const r1 = 220, r2 = i % 5 === 0 ? 200 : 210
                    return (
                      <line key={i}
                        x1={300 + r1 * Math.cos(angle)} y1={250 + r1 * Math.sin(angle)}
                        x2={300 + r2 * Math.cos(angle)} y2={250 + r2 * Math.sin(angle)}
                        stroke="#5EEAD4" strokeWidth={i % 5 === 0 ? 1.5 : 0.8}
                        opacity={i % 5 === 0 ? 0.7 : 0.3} />
                    )
                  })}
                </motion.g>

                {/* Outer ring */}
                <circle cx="300" cy="250" r="220" fill="none" stroke="url(#metalRing)" strokeWidth="2" opacity="0.6" />
                <circle cx="300" cy="250" r="200" fill="none" stroke="#5EEAD4" strokeWidth="0.5" opacity="0.4" strokeDasharray="2 6" />

                {/* Counter-rotating gear ring */}
                <motion.g
                  animate={{ rotate: -360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                  style={{ transformOrigin: '300px 250px' }}
                >
                  {Array.from({ length: 12 }).map((_, i) => {
                    const angle = (i * 30 * Math.PI) / 180
                    return (
                      <line key={i}
                        x1={300 + 180 * Math.cos(angle)} y1={250 + 180 * Math.sin(angle)}
                        x2={300 + 165 * Math.cos(angle)} y2={250 + 165 * Math.sin(angle)}
                        stroke="#38BDF8" strokeWidth="2" opacity="0.6" />
                    )
                  })}
                </motion.g>

                <circle cx="300" cy="250" r="165" fill="none" stroke="#38BDF8" strokeWidth="0.8" opacity="0.5" />

                {/* Lens housing */}
                <circle cx="300" cy="250" r="140" fill="#050810" stroke="url(#metalRing)" strokeWidth="2.5" />
                <circle cx="300" cy="250" r="135" fill="none" stroke="#5EEAD4" strokeWidth="0.5" opacity="0.4" />

                {/* Aperture blades — rotating */}
                <motion.g
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                  style={{ transformOrigin: '300px 250px' }}
                >
                  {Array.from({ length: 8 }).map((_, i) => {
                    const angle = (i * 45 * Math.PI) / 180
                    const x1 = 300 + 60 * Math.cos(angle)
                    const y1 = 250 + 60 * Math.sin(angle)
                    const x2 = 300 + 100 * Math.cos(angle + 0.45)
                    const y2 = 250 + 100 * Math.sin(angle + 0.45)
                    const x3 = 300 + 100 * Math.cos(angle + 0.9)
                    const y3 = 250 + 100 * Math.sin(angle + 0.9)
                    return (
                      <path
                        key={i}
                        d={`M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} Z`}
                        fill="#0F1419" stroke="#5EEAD4" strokeWidth="1" opacity="0.7"
                      />
                    )
                  })}
                </motion.g>

                {/* Inner glass ring */}
                <circle cx="300" cy="250" r="95" fill="none" stroke="#5EEAD4" strokeWidth="1.2" opacity="0.6" />
                <circle cx="300" cy="250" r="88" fill="none" stroke="#38BDF8" strokeWidth="0.6" opacity="0.4" strokeDasharray="3 3" />

                {/* Glass lens — inner glow */}
                <circle cx="300" cy="250" r="80" fill="url(#glassInner)" opacity="0.9" />
                <circle cx="300" cy="250" r="80" fill="none" stroke="url(#irisGrad2)" strokeWidth="2" filter="url(#softGlow)" />

                {/* Lens reflections */}
                <ellipse cx="275" cy="225" rx="22" ry="15" fill="#FFFFFF" opacity="0.15" transform="rotate(-30 275 225)" />
                <ellipse cx="330" cy="285" rx="12" ry="8" fill="#FFFFFF" opacity="0.08" transform="rotate(-30 330 285)" />

                {/* Center iris */}
                <circle cx="300" cy="250" r="45" fill="none" stroke="#5EEAD4" strokeWidth="1.5" opacity="0.8" />
                <circle cx="300" cy="250" r="35" fill="#050810" />
                <motion.circle
                  cx="300" cy="250" r="28"
                  fill="url(#irisGrad2)" opacity="0.8"
                  animate={{ r: ['26px', '30px', '26px'], opacity: [0.7, 0.9, 0.7] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  style={{ filter: 'drop-shadow(0 0 12px #5EEAD4)' }}
                />
                <circle cx="300" cy="250" r="15" fill="#08080C" />
                <motion.circle
                  cx="300" cy="250" r="8"
                  fill="#5EEAD4"
                  animate={{ r: ['6px', '9px', '6px'], opacity: [0.9, 1, 0.9] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  style={{ filter: 'drop-shadow(0 0 10px #5EEAD4)' }}
                />
                <circle cx="300" cy="250" r="3" fill="#FFFFFF" />

                {/* Focus ring crosshairs */}
                <line x1="300" y1="100" x2="300" y2="140" stroke="#5EEAD4" strokeWidth="0.8" opacity="0.5" />
                <line x1="300" y1="360" x2="300" y2="400" stroke="#5EEAD4" strokeWidth="0.8" opacity="0.5" />
                <line x1="150" y1="250" x2="190" y2="250" stroke="#5EEAD4" strokeWidth="0.8" opacity="0.5" />
                <line x1="410" y1="250" x2="450" y2="250" stroke="#5EEAD4" strokeWidth="0.8" opacity="0.5" />

                {/* Compass markers */}
                {['N', 'E', 'S', 'W'].map((dir, i) => {
                  const angle = (i * 90 - 90) * Math.PI / 180
                  const x = 300 + 245 * Math.cos(angle)
                  const y = 250 + 245 * Math.sin(angle)
                  return (
                    <text key={dir} x={x} y={y + 4} fontSize="11" fill="#5EEAD4" textAnchor="middle" fontFamily="monospace" fontWeight="bold">{dir}</text>
                  )
                })}

                {/* Data labels around lens */}
                <text x="80" y="105" fontSize="9" fill="#5EEAD4" opacity="0.6" fontFamily="monospace">ISO_3200</text>
                <text x="80" y="120" fontSize="9" fill="#38BDF8" opacity="0.6" fontFamily="monospace">F/1.4</text>

                <text x="490" y="105" fontSize="9" fill="#5EEAD4" opacity="0.6" fontFamily="monospace" textAnchor="end">50MM</text>
                <text x="490" y="120" fontSize="9" fill="#38BDF8" opacity="0.6" fontFamily="monospace" textAnchor="end">1/125s</text>

                <text x="80" y="410" fontSize="9" fill="#5EEAD4" opacity="0.6" fontFamily="monospace">AF_LOCK</text>
                <text x="490" y="410" fontSize="9" fill="#5EEAD4" opacity="0.6" fontFamily="monospace" textAnchor="end">OIS_ON</text>

                {/* HUD corner brackets */}
                <path d="M 20 20 L 60 20 M 20 20 L 20 60" stroke="#5EEAD4" strokeWidth="1.5" fill="none" opacity="0.6" />
                <path d="M 580 20 L 540 20 M 580 20 L 580 60" stroke="#5EEAD4" strokeWidth="1.5" fill="none" opacity="0.6" />
                <path d="M 20 480 L 60 480 M 20 480 L 20 440" stroke="#5EEAD4" strokeWidth="1.5" fill="none" opacity="0.6" />
                <path d="M 580 480 L 540 480 M 580 480 L 580 440" stroke="#5EEAD4" strokeWidth="1.5" fill="none" opacity="0.6" />

                {/* Top + bottom status */}
                <text x="300" y="35" fontSize="10" fill="#5EEAD4" opacity="0.7" textAnchor="middle" fontFamily="monospace" letterSpacing="3">OPTICAL_VISION_SYSTEM</text>
                <text x="300" y="485" fontSize="9" fill="#5EEAD4" opacity="0.5" textAnchor="middle" fontFamily="monospace" letterSpacing="2">CV-INTEGRITY · CAM_01 · LENS_ACTIVE</text>
              </svg>

              {/* Real detections overlay */}
              {mainFrame?.detectionList?.length > 0 && (
                <div className="absolute top-20 right-8 space-y-2">
                  {mainFrame.detectionList.slice(0, 3).map((d: any, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.2 }}
                      className="px-3 py-1.5 rounded text-[10px] font-mono capitalize flex items-center gap-2"
                      style={{ background: 'rgba(94, 234, 212, 0.15)', border: '1px solid rgba(94, 234, 212, 0.4)', color: '#5EEAD4' }}>
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#5EEAD4' }} />
                      {d.class} :: {(d.confidence * 100).toFixed(0)}%
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Working tabs */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1 z-20">
              {['LIVE', 'ANALYTICS', 'THREATS'].map((t) => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className="px-5 py-2 rounded text-[10px] font-mono tracking-wider transition-all"
                  style={activeTab === t
                    ? { background: 'rgba(94, 234, 212, 0.2)', color: '#5EEAD4', border: '1px solid rgba(94, 234, 212, 0.5)' }
                    : { background: 'transparent', color: '#5EEAD4', opacity: 0.4, border: '1px solid rgba(94, 234, 212, 0.15)' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Class + Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded" style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
              <div className="text-[10px] tracking-[0.2em] font-bold mb-3" style={{ color: '#5EEAD4' }}>DETECTED_CLASSES</div>
              <div className="space-y-2">
                {classes.map((c, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono capitalize" style={{ color: '#FFFFFF', opacity: 0.9 }}>{c.name}</span>
                      <span className="text-[10px] font-mono" style={{ color: '#5EEAD4' }}>{c.count} ({c.pct}%)</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(94, 234, 212, 0.1)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${c.pct}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #5EEAD4, #38BDF8)' }}
                      />
                    </div>
                  </div>
                ))}
                {classes.length === 0 && (
                  <div className="text-[10px] font-mono text-center py-3" style={{ color: '#5EEAD4', opacity: 0.4 }}>
                    No detections
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 rounded" style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
              <div className="text-[10px] tracking-[0.2em] font-bold mb-3" style={{ color: '#5EEAD4' }}>DETECTION_STATS</div>
              <div className="space-y-3">
                <MetricRow label="TOTAL_FRAMES" value={String(totalFrames)} />
                <MetricRow label="TOTAL_DETECTIONS" value={String(totalDetections)} />
                <MetricRow label="CLASS_TYPES" value={String(classTypes)} />
                <MetricRow label="AVG_CONFIDENCE" value={`${avgConfidence}%`} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-12 lg:col-span-3 space-y-4">

          {/* Threat Catalog — real */}
          <div className="p-4 rounded" style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] tracking-[0.2em] font-bold" style={{ color: '#5EEAD4' }}>THREAT_CATALOG</span>
              <span className="text-[9px] font-mono" style={{ color: '#F87171' }}>{attacks.length} TOTAL</span>
            </div>
            <div className="space-y-2">
              {attacks.slice(0, 6).map((a, i) => (
                <div key={i} className="p-2.5 rounded" style={{ background: 'rgba(0, 0, 0, 0.3)', borderLeft: `2px solid ${severityColors[a.severity] || '#38BDF8'}` }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold tracking-wider truncate" style={{ color: '#FFFFFF', maxWidth: '140px' }}>
                      {a.name.toUpperCase()}
                    </span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded font-mono flex-shrink-0"
                      style={{ background: `${severityColors[a.severity]}20`, color: severityColors[a.severity] }}>
                      {a.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[9px] font-mono truncate" style={{ color: '#5EEAD4', opacity: 0.5 }}>
                    {a.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NEURAL_LINK — real block intervals waveform */}
          <div className="p-4 rounded" style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] tracking-[0.2em] font-bold" style={{ color: '#5EEAD4' }}>NEURAL_LINK</span>
              <span className="text-[9px] px-2 py-0.5 rounded font-mono"
                style={{ background: 'rgba(94, 234, 212, 0.15)', color: '#5EEAD4' }}>SYNC</span>
            </div>
            <div className="relative h-20 rounded overflow-hidden" style={{ background: 'rgba(0, 0, 0, 0.3)' }}>
              <svg viewBox="0 0 300 80" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#5EEAD4" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#5EEAD4" stopOpacity="1" />
                    <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.5" />
                  </linearGradient>
                </defs>
                {blockTimes.length > 1 ? (
                  <polyline
                    points={waveformPoints}
                    fill="none" stroke="url(#waveGrad)" strokeWidth="2"
                    strokeLinejoin="round" strokeLinecap="round"
                  />
                ) : (
                  <line x1="0" y1="60" x2="300" y2="60" stroke="#5EEAD4" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.3" />
                )}
              </svg>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[9px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>
                BLOCKS: {blockTimes.length}
              </span>
              <span className="text-[9px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>
                AVG: {blockTimes.length ? Math.round(blockTimes.reduce((a, b) => a + b, 0) / blockTimes.length) : 0}ms
              </span>
            </div>
          </div>

          {/* PROGNOSIS_AI — real avg trust + trend */}
          <div className="p-4 rounded" style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] tracking-[0.2em] font-bold" style={{ color: '#5EEAD4' }}>PROGNOSIS_AI</span>
              <span className="text-[9px] px-2 py-0.5 rounded font-mono animate-pulse"
                style={{ background: 'rgba(94, 234, 212, 0.15)', color: '#5EEAD4' }}>AI</span>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono" style={{ color: '#5EEAD4', opacity: 0.6 }}>AVG_TRUST_SCORE</span>
                  <span className="text-[13px] font-bold font-mono" style={{ color: '#5EEAD4' }}>{avgTrust}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(94, 234, 212, 0.1)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${avgTrust}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #5EEAD4, #38BDF8)', boxShadow: '0 0 8px #5EEAD4' }}
                  />
                </div>
              </div>
              <div className="text-[9px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>
                TREND: {trustTrend}
              </div>
            </div>
          </div>

          {/* Live Video Feed thumbnails */}
          <div className="p-4 rounded" style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] tracking-[0.2em] font-bold" style={{ color: '#5EEAD4' }}>LIVE_FEED</span>
              <span className="text-[9px] px-2 py-0.5 rounded font-mono animate-pulse"
                style={{ background: 'rgba(248, 113, 113, 0.15)', color: '#F87171' }}>● REC</span>
            </div>
            {frames.length > 0 ? (
              <div className="grid grid-cols-2 gap-1.5">
                {frames.map((f, i) => (
                  <div key={i}
                    onClick={() => setCurrentFrameIdx(i)}
                    className="relative rounded overflow-hidden cursor-pointer transition-all"
                    style={{
                      aspectRatio: '16/9',
                      border: currentFrameIdx === i ? '2px solid #5EEAD4' : '1px solid rgba(94, 234, 212, 0.2)',
                    }}>
                    <img src={`data:image/jpeg;base64,${f.image}`} alt="" className="w-full h-full object-cover" />
                    <div className="absolute bottom-0.5 left-0.5 px-1 py-0.5 rounded text-[7px] font-mono"
                      style={{ background: 'rgba(0, 0, 0, 0.7)', color: '#5EEAD4' }}>
                      #{f.frame} · {f.detections}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded flex items-center justify-center" style={{ aspectRatio: '16/9', background: 'rgba(0,0,0,0.3)' }}>
                <Camera size={24} style={{ color: '#5EEAD4', opacity: 0.3 }} />
              </div>
            )}
          </div>

          {/* SYS_LOG — real blockchain events */}
          <div className="p-4 rounded" style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
            <div className="text-[10px] tracking-[0.2em] font-bold mb-3" style={{ color: '#5EEAD4' }}>SYS_LOG</div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {activities.map((a, i) => (
                <div key={i} className="text-[9px] flex gap-1.5" style={{ fontFamily: 'monospace' }}>
                  <span style={{ color: '#38BDF8' }}>&gt;</span>
                  <span style={{ color: '#5EEAD4', opacity: 0.7 }}>
                    {a.action.replace(/_/g, ' ')}
                  </span>
                  <span className="ml-auto" style={{ color: '#5EEAD4', opacity: 0.3 }}>#{a.id}</span>
                </div>
              ))}
              {activities.length === 0 && (
                <div className="text-[9px]" style={{ color: '#5EEAD4', opacity: 0.4 }}>
                  &gt; awaiting data...
                </div>
              )}
              <div className="text-[9px] flex items-center gap-1" style={{ color: '#5EEAD4' }}>
                <span style={{ color: '#38BDF8' }}>&gt;</span>
                <span className="w-1.5 h-3 animate-pulse" style={{ background: '#5EEAD4' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricRow({ label, value }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-mono tracking-wider" style={{ color: '#5EEAD4', opacity: 0.6 }}>{label}</span>
      <span className="text-[13px] font-bold font-mono" style={{ color: '#FFFFFF' }}>{value}</span>
    </div>
  )
}
