import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import {
  Activity, AlertOctagon, ArrowUpRight, Brain, Camera, Check, Crosshair,
  Database, Eye, FileCheck2, Gauge, Layers3, Radio, RefreshCw, Scan,
  Settings2, ShieldCheck, TriangleAlert, Boxes, Cpu,
} from 'lucide-react'
import apiClient from '@/lib/api'

const API = 'http://localhost:8000'
const HERO_TERRAIN_IMAGE = '/data/cv-integrity-terrain.png'

type Frame = {
  frame: number
  image: string
  detections: number
  detectionList: any[]
  classCounts: Record<string, number>
}

const glass =
  'border border-white/[.07] bg-[#081311]/45 backdrop-blur-[28px] shadow-[0_28px_90px_rgba(0,0,0,.42),inset_0_1px_rgba(255,255,255,.045)]'

function Pill({ children, active = false }: { children: ReactNode, active?: boolean }) {
  return (
    <div
      className="flex items-center gap-2 rounded-full px-3.5 py-2 text-[8px] whitespace-nowrap transition-all duration-200"
      style={{
        background: active ? 'rgba(92,231,194,.10)' : 'rgba(4,10,10,.48)',
        border: `1px solid ${active ? 'rgba(92,231,194,.24)' : 'rgba(255,255,255,.075)'}`,
        boxShadow: active ? '0 0 28px rgba(92,231,194,.06)' : undefined,
      }}
    >
      {children}
    </div>
  )
}

function ScoreCard({ title, code, value, status, icon: Icon }: { title: string, code: string, value: number, status: 'GOOD' | 'REVIEW' | 'CRITICAL', icon: any }) {
  const color = status === 'GOOD' ? '#68E7B8' : status === 'REVIEW' ? '#EBC85D' : '#FF666C'
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`${glass} rounded-[20px] p-3.5`}
      style={{ background: 'linear-gradient(145deg, rgba(16,28,25,.60), rgba(5,10,10,.47))' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-[10px]" style={{ background: `${color}0C`, border: `1px solid ${color}20` }}>
            <Icon size={12} style={{ color }} />
          </div>
          <div>
            <div className="text-[9px] font-medium tracking-wide text-white/90">{title}</div>
            <div className="mt-0.5 text-[5px] font-mono tracking-[.15em] text-white/25">{code}</div>
          </div>
        </div>
        <span className="rounded-full px-2 py-1 text-[5px] font-mono" style={{ color, background: `${color}0D`, border: `1px solid ${color}12` }}>{status}</span>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <div className="text-[30px] font-semibold tracking-[-.055em]" style={{ color }}>
          {Number.isFinite(value) ? value.toFixed(1) : '0.0'}
          <span className="ml-0.5 text-xs">%</span>
        </div>
        <ArrowUpRight size={12} style={{ color: `${color}70` }} />
      </div>
      <div className="mt-2.5 h-[2px] overflow-hidden rounded-full bg-white/[.055]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(value || 0, 100))}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 12px ${color}55` }}
        />
      </div>
    </motion.div>
  )
}

function HeroVision({ frame, online, latency, onSelect }: { frame: Frame | null, online: boolean, latency: number, onSelect: (action: string) => void }) {
  return (
    <div className="relative min-h-[820px] overflow-hidden rounded-[30px] border border-white/[.09] bg-[#06100f] shadow-[0_35px_110px_rgba(0,0,0,.48)] lg:min-h-[880px]">
      <div className="absolute inset-0 bg-[#020807]" />
      <motion.img
        src={HERO_TERRAIN_IMAGE}
        alt="3D computer vision terrain analysis environment"
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1.02 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: 'center 48%', filter: 'brightness(1.28) contrast(1.18) saturate(1.35) hue-rotate(-3deg)' }}
      />
      {frame?.image && (
        <motion.div
          key={frame.frame}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="absolute bottom-[220px] left-5 z-20 hidden w-[150px] overflow-hidden rounded-[14px] border border-emerald-200/15 bg-black/30 shadow-2xl backdrop-blur-xl lg:block"
        >
          <div className="flex items-center justify-between border-b border-white/[.06] bg-black/30 px-2 py-1.5">
            <span className="text-[5px] font-mono tracking-[.14em] text-white/45">LIVE FRAME</span>
            <span className="flex items-center gap-1 text-[5px] font-mono text-emerald-200/70">
              <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-300" />
              {online ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <img src={`data:image/jpeg;base64,${frame.image}`} alt="Live computer vision frame" className="block h-[82px] w-full object-cover" />
        </motion.div>
      )}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(1,6,6,.10) 0%, rgba(1,6,6,.00) 40%, rgba(1,6,6,.03) 65%, rgba(1,6,6,.68) 100%)' }} />
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(circle at 54% 48%, rgba(64,220,186,.26), transparent 42%), radial-gradient(circle at 18% 62%, rgba(234,95,69,.22), transparent 36%), radial-gradient(circle at 86% 32%, rgba(71,163,147,.20), transparent 38%), radial-gradient(circle at 54% 48%, rgba(255,180,80,.10), transparent 22%)' }} />
      <div className="pointer-events-none absolute inset-0 opacity-[.035] [background-image:linear-gradient(rgba(117,255,222,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(117,255,222,.16)_1px,transparent_1px)] [background-size:58px_58px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,.24)_100%)]" />
      <div className="absolute left-5 top-5 h-9 w-9 border-l border-t border-emerald-100/65" />
      <div className="absolute right-5 top-5 h-9 w-9 border-r border-t border-emerald-100/65" />
      <div className="absolute bottom-[200px] left-5 h-9 w-9 border-b border-l border-emerald-100/65" />
      <div className="absolute bottom-[200px] right-5 h-9 w-9 border-b border-r border-emerald-100/65" />
      {/* Hero title — top-left */}
      <div className="absolute left-5 top-5 z-20">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_9px_#68E7B8] animate-pulse" />
          <span className="text-[11px] font-semibold tracking-[.18em] text-white">LIVE VISION</span>
        </div>
        <div className="mt-1 text-[7px] text-white/40">Real-time computer vision analysis</div>
      </div>

      {/* Top-right status */}
      <div className="absolute right-5 top-5 z-20 flex items-center gap-3 text-[7px] font-mono">
        <span className="flex items-center gap-1 text-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
          LIVE
        </span>
        <span className="text-white/45">CAM-01</span>
        <span className="text-white/45">1080p</span>
        <span className="text-white/45">30 FPS</span>
      </div>
      <motion.button
        whileHover={{ y: -2 }}
        transition={{ duration: 0.18 }}
        onClick={() => onSelect('VIEW ANALYSIS')}
        className="absolute left-5 top-[43%] z-20 flex items-center gap-2 rounded-full border border-white/10 bg-[#06100f]/48 px-3.5 py-2.5 text-[8px] text-white/75 shadow-xl backdrop-blur-xl transition-colors duration-200 hover:bg-white/[.09]"
      >
        <Crosshair size={12} />
        View Analysis
      </motion.button>
      {/* Right-top: Verify + Track */}
      <div className="absolute right-5 top-[22%] z-20 flex flex-col items-end gap-2">
        {[
          [ShieldCheck, 'Verify Integrity', 'VERIFY'],
          [Eye, 'Track Object', 'TRACK'],
        ].map(([Icon, label, action]: any) => (
          <motion.button
            key={action}
            whileHover={{ y: -2, x: -2 }}
            transition={{ duration: 0.18 }}
            onClick={() => onSelect(action)}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-[#06100f]/45 px-3.5 py-2.5 text-[8px] text-white/75 shadow-xl backdrop-blur-xl transition-all duration-200 hover:border-emerald-200/20 hover:bg-emerald-200/[.07] hover:text-emerald-50"
          >
            <Icon size={11} />
            {label}
          </motion.button>
        ))}
      </div>

      {/* Right-mid: Deep Analysis */}
      <div className="absolute right-5 top-[44%] z-20 flex flex-col items-end gap-2">
        {[[Scan, 'Deep Analysis', 'ANALYZE']].map(([Icon, label, action]: any) => (
          <motion.button
            key={action}
            whileHover={{ y: -2, x: -2 }}
            transition={{ duration: 0.18 }}
            onClick={() => onSelect(action)}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-[#06100f]/45 px-3.5 py-2.5 text-[8px] text-white/75 shadow-xl backdrop-blur-xl transition-all duration-200 hover:border-emerald-200/20 hover:bg-emerald-200/[.07] hover:text-emerald-50"
          >
            <Icon size={11} />
            {label}
          </motion.button>
        ))}
      </div>

      {/* Left-top: Mark Priority */}
      <div className="absolute left-5 top-[24%] z-20 hidden lg:block">
        <motion.button
          whileHover={{ y: -2 }}
          transition={{ duration: 0.18 }}
          onClick={() => onSelect('PRIORITY')}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-[#06100f]/45 px-3.5 py-2.5 text-[8px] text-white/75 shadow-xl backdrop-blur-xl transition-all duration-200 hover:border-emerald-200/20 hover:bg-emerald-200/[.07] hover:text-emerald-50"
        >
          <Activity size={11} />
          Mark Priority
        </motion.button>
      </div>
      <div className="absolute left-1/2 top-[44%] z-20 flex -translate-x-1/2 flex-col items-center gap-2">
        {(frame?.detectionList || []).slice(0, 3).map((d: any, i: number) => {
          const conf = (d.confidence || 0) * 100
          const color = conf >= 90 ? '#68E7B8' : conf >= 70 ? '#EBC85D' : '#FF686D'
          return (
            <motion.div
              key={`${frame?.frame}-${i}`}
              initial={{ opacity: 0, scale: 0.96, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-full border bg-black/55 px-4 py-2 text-[8px] font-mono backdrop-blur-xl"
              style={{ borderColor: `${color}40`, color: '#FFFFFF' }}
            >
              <span className="capitalize">{d.class || 'OBJECT'}</span>
              <span className="ml-2 font-bold" style={{ color }}>{conf.toFixed(0)}%</span>
            </motion.div>
          )
        })}
      </div>
      {/* Bottom-left: Detection summary */}
      <div className="absolute bottom-[200px] left-5 z-20 hidden lg:block">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">{String(frame?.detections || 0).padStart(2, '0')}</span>
          <span className="text-[7px] font-mono tracking-[.18em] text-white/55">OBJECTS DETECTED</span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          {(frame?.detectionList || []).slice(0, 3).map((d: any, i: number) => {
            const conf = (d.confidence || 0) * 100
            const color = conf >= 90 ? '#68E7B8' : conf >= 70 ? '#EBC85D' : '#FF686D'
            return (
              <span key={i} className="flex items-center gap-1.5 text-[7px]">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                <span className="capitalize text-white/75">{d.class || 'OBJECT'}</span>
                <span className="font-mono" style={{ color }}>{conf.toFixed(0)}%</span>
              </span>
            )
          })}
        </div>
      </div>
      <div className="absolute bottom-[120px] left-0 right-0 z-20 border-t border-white/[.08] bg-[#020707]/45 px-5 py-3.5 backdrop-blur-2xl">
        <div className="grid grid-cols-4 gap-3">
          {[
            ['FRAME', `#${String(frame?.frame || 0).padStart(6, '0')}`],
            ['OBJECTS', String(frame?.detections || 0)],
            ['LATENCY', `${latency} ms`],
            ['CAMERA', online ? 'ONLINE' : 'OFFLINE'],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="text-[5px] font-mono tracking-[.17em] text-white/25">{label}</div>
              <div className="mt-1 text-[8px] font-medium text-white/75">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FloatingPanel({ title, children }: { title: string, children: ReactNode }) {
  return (
    <div
      className="rounded-[24px] border border-white/[.075] p-4 backdrop-blur-[28px]"
      style={{
        background: 'linear-gradient(145deg, rgba(18,31,27,.68), rgba(4,10,10,.58))',
        boxShadow: '0 25px 80px rgba(0,0,0,.40), inset 0 1px rgba(255,255,255,.035)',
      }}
    >
      <div className="mb-3 text-[10px] font-medium text-white/85">{title}</div>
      {children}
    </div>
  )
}

export function Home() {
  const [stats, setStats] = useState({ datasets: 0, models: 0, blocks: 0, wallets: 0 })
  const [metrics, setMetrics] = useState<any>({})
  const [attacks, setAttacks] = useState<any[]>([])
  const [frames, setFrames] = useState<Frame[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [trustScores, setTrustScores] = useState<any[]>([])
  const [modelInfo, setModelInfo] = useState<any>(null)
  const [avgTrust, setAvgTrust] = useState(0)
  const [backendOnline, setBackendOnline] = useState(false)
  const [latency, setLatency] = useState(0)
  const [frameIndex, setFrameIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')

  const checkHealth = async () => {
    try {
      const start = Date.now()
      const response = await fetch(`${API}/health`)
      setLatency(Date.now() - start)
      setBackendOnline(response.ok)
    } catch {
      setBackendOnline(false)
      setLatency(0)
    }
  }

  const load = async () => {
    setLoading(true)
    try {
      const [datasetsResponse, modelsResponse, blocksResponse, walletsResponse, trustResponse, attacksResponse, videoResponse, metricsResponse] = await Promise.all([
        apiClient.getDatasets().catch(() => ({ data: { datasets: {} } })),
        apiClient.getModels().catch(() => ({ data: { models: {} } })),
        apiClient.getBlocks().catch(() => ({ data: { blocks: [] } })),
        apiClient.getWallets().catch(() => ({ data: { wallets: {} } })),
        fetch(`${API}/api/trust-scores`).then((r) => r.json()).catch(() => ({ trust_scores: {} })),
        apiClient.getAttacks().catch(() => ({ data: { attacks: {} } })),
        fetch(`${API}/api/video/thumbnails`).then((r) => r.json()).catch(() => ({ thumbnails: [] })),
        fetch(`${API}/api/analytics/metrics`).then((r) => r.json()).catch(() => ({ metrics: {} })),
      ])

      const datasets = datasetsResponse.data.datasets || {}
      const models = modelsResponse.data.models || {}
      const blocks = blocksResponse.data.blocks || []
      const wallets = walletsResponse.data.wallets || {}

      setStats({
        datasets: Object.keys(datasets).length,
        models: Object.keys(models).length,
        blocks: blocks.length,
        wallets: Object.keys(wallets).length,
      })

      setMetrics(metricsResponse.metrics || {})
      setModelInfo((models as any).good || Object.values(models)[0] || null)

      const trust = Object.entries(trustResponse.trust_scores || {}).map(([key, value]: [string, any]) => ({
        key,
        score: Number(value.final_score || 0),
        decision: value.decision || '',
      }))
      setTrustScores(trust)
      if (trust.length) {
        setAvgTrust(Math.round(trust.reduce((sum, item) => sum + item.score, 0) / trust.length))
      }

      setAttacks(
        Object.entries(attacksResponse.data.attacks || {}).map(([key, value]: [string, any]) => ({
          id: key,
          name: value.name || key,
          severity: String(value.severity || 'MEDIUM').toUpperCase(),
          description: value.description || '',
        })),
      )

      console.log("[CV-INT] raw response:", JSON.stringify(videoResponse).slice(0, 200))
      const nextFrames: Frame[] = (videoResponse.thumbnails || [])
        .map((item: any) => ({
          frame: item.frame || 0,
          image: item.preview || item.image || '',
          detections: item.detections || 0,
          detectionList: item.detection_list || [],
          classCounts: item.class_counts || {},
        }))
        .filter((item: Frame) => item.image)
      console.log("[CV-INT] frames count:", nextFrames.length, "first:", nextFrames[0]?.detections, "image?", nextFrames[0]?.image?.slice(0,20))
      setFrames(nextFrames)

      const counts: Record<string, number> = {}
      nextFrames.forEach((item) => {
        Object.entries(item.classCounts || {}).forEach(([name, count]) => {
          counts[name] = (counts[name] || 0) + Number(count)
        })
      })
      const total = Object.values(counts).reduce((sum, value) => sum + value, 0) || 1
      setClasses(
        Object.entries(counts)
          .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }))
          .sort((a, b) => b.count - a.count),
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    checkHealth()
    const healthTimer = window.setInterval(checkHealth, 10000)
    return () => window.clearInterval(healthTimer)
  }, [])

  // Auto-cycle disabled — frame 0 pe fix
  // useEffect(() => {
  //   if (!frames.length) return
  //   const frameTimer = window.setInterval(() => {
  //     setFrameIndex((index) => (index + 1) % frames.length)
  //   }, 3000)
  //   return () => window.clearInterval(frameTimer)
  // }, [frames])

  const frame = frames[frameIndex] || null
  const detections = frames.reduce((sum, item) => sum + item.detections, 0)
  const allDetections = frames.flatMap((item) => item.detectionList || [])
  const confidence = allDetections.length
    ? (allDetections.reduce((sum, item) => sum + Number(item.confidence || 0), 0) / allDetections.length) * 100
    : 0

  const datasetScore = trustScores.length ? trustScores.reduce((sum, item) => sum + item.score, 0) / trustScores.length : 0
  const modelScore = Number(modelInfo?.mAP50 || 0)
  const outputScore = confidence
  const distributionShift = Number(metrics?.distribution_shift || 2.5)
  const anomalies = Number(metrics?.anomaly_count || 0)

  const getStatus = (value: number): 'GOOD' | 'REVIEW' | 'CRITICAL' =>
    value >= 75 ? 'GOOD' : value >= 45 ? 'REVIEW' : 'CRITICAL'

  const critical = attacks.filter((item) => item.severity === 'CRITICAL').length
  const high = attacks.filter((item) => item.severity === 'HIGH').length
  const medium = attacks.filter((item) => item.severity === 'MEDIUM').length

  const showNotice = (value: string) => {
    setNotice(value)
    window.setTimeout(() => setNotice(''), 1800)
  }

  const integrity = [
    ['CONTRIBUTOR', stats.wallets > 0],
    ['DATASET', stats.datasets > 0],
    ['MODEL', stats.models > 0],
    ['INFERENCE', frames.length > 0],
    ['OUTPUT', stats.blocks > 0],
  ] as [string, boolean][]

  const topClasses = useMemo(() => classes.slice(0, 4), [classes])

  return (
    <div
      className="min-h-screen overflow-x-hidden text-white"
      style={{
        background: 'radial-gradient(circle at 50% -15%, #122b27 0%, #071210 28%, #020606 67%, #010404 100%)',
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <header className="sticky top-0 z-50 border-b border-white/[.055] bg-[#020707]/75 backdrop-blur-2xl">
        <div className="mx-auto flex h-[58px] max-w-[1580px] items-center justify-between px-4 lg:px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-[9px] border border-emerald-200/20 bg-emerald-200/[.055]">
              <Radio size={12} className="text-emerald-200" />
            </div>
            <div>
              <div className="text-[10px] font-semibold tracking-[.15em]">CV-INTEGRITY</div>
              <div className="text-[5px] font-mono tracking-[.16em] text-white/20">COMPUTER VISION ASSURANCE</div>
            </div>
          </div>
          <div className="hidden items-center gap-1.5 lg:flex">
            <Pill active>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Vision System
            </Pill>
            <Pill><Cpu size={10} /> YOLOv8 / GOOD</Pill>
            <Pill><Gauge size={10} /> System Mode: Auto</Pill>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[.07] bg-white/[.02]">
              <TriangleAlert size={11} className="text-white/50" />
            </button>
            <button className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[.07] bg-white/[.02]">
              <Settings2 size={11} className="text-white/50" />
            </button>
            <button onClick={load} className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[.07] bg-white/[.02]">
              <RefreshCw size={11} className={loading ? 'animate-spin text-emerald-200' : 'text-white/50'} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1580px] px-3 pb-8 pt-3 sm:px-4 lg:px-5">
        <section className="relative">
          <HeroVision frame={frame} online={backendOnline} latency={latency} onSelect={showNotice} />

          <div className="pointer-events-none absolute left-4 top-[86px] z-30 hidden w-[228px] space-y-2.5 xl:block">
            <div className="pointer-events-auto">
              <ScoreCard title="Dataset Integrity" code="DATASET / ASSURANCE" value={datasetScore} status={getStatus(datasetScore)} icon={Database} />
            </div>
            <div className="pointer-events-auto">
              <ScoreCard title="Model Integrity" code="MODEL / YOLOV8" value={modelScore} status={getStatus(modelScore)} icon={Brain} />
            </div>
            <div className="pointer-events-auto">
              <ScoreCard title="Output Integrity" code="INFERENCE / OUTPUT" value={outputScore} status={getStatus(outputScore)} icon={ShieldCheck} />
            </div>
          </div>

          <div className="pointer-events-none absolute right-4 top-[86px] z-30 hidden w-[238px] xl:block">
            <div className={`${glass} pointer-events-auto rounded-[22px] p-3.5`} style={{ background: 'linear-gradient(145deg, rgba(14,24,23,.65), rgba(3,8,8,.54))' }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-medium">Threat Catalog</div>
                  <div className="mt-0.5 text-[5px] font-mono tracking-[.16em] text-white/25">ASSURANCE / RISK</div>
                </div>
                <AlertOctagon size={12} className="text-red-300/60" />
              </div>
              <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                {[
                  ['CRITICAL', critical, '#FF686D'],
                  ['HIGH', high, '#EBC85D'],
                  ['MEDIUM', medium, '#62C8FF'],
                ].map(([label, value, color]: any) => (
                  <div key={label} className="rounded-xl px-2 py-2 text-center" style={{ background: `${color}0A` }}>
                    <div className="text-sm font-semibold" style={{ color }}>{value}</div>
                    <div className="mt-0.5 text-[4px] font-mono" style={{ color: `${color}99` }}>{label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-2.5 space-y-1.5">
                {attacks.slice(0, 5).map((attack, index) => {
                  const color = attack.severity === 'CRITICAL' ? '#FF686D' : attack.severity === 'HIGH' ? '#EBC85D' : '#62C8FF'
                  return (
                    <motion.div
                      key={`${attack.id}-${index}`}
                      whileHover={{ x: -2 }}
                      className="rounded-[10px] border-l-2 bg-white/[.025] px-2.5 py-2"
                      style={{ borderLeftColor: color }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[7px] text-white/70">{String(attack.name).replace(/_/g, ' ')}</span>
                        <span className="text-[4px] font-mono" style={{ color }}>{attack.severity}</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="mt-2.5 grid gap-2.5 md:grid-cols-3 xl:hidden">
            <ScoreCard title="Dataset Integrity" code="DATASET" value={datasetScore} status={getStatus(datasetScore)} icon={Database} />
            <ScoreCard title="Model Integrity" code="MODEL" value={modelScore} status={getStatus(modelScore)} icon={Brain} />
            <ScoreCard title="Output Integrity" code="OUTPUT" value={outputScore} status={getStatus(outputScore)} icon={ShieldCheck} />
          </div>

          <div className="relative z-40 mt-[-140px] px-2.5 sm:px-5 lg:px-10">
            <div className="grid gap-2.5 lg:grid-cols-2">
              <FloatingPanel title="VisionSentry">
                <div className="grid grid-cols-12 gap-2.5">
                  <div className="col-span-5 rounded-[18px] border border-red-300/[.08] bg-red-300/[.025] p-3">
                    <div className="flex min-h-[145px] flex-col justify-between">
                      <div className="relative mx-auto mt-1 flex h-[92px] w-[92px] items-center justify-center rounded-full border border-red-300/[.12]">
                        <div className="absolute inset-3 rounded-full border border-red-300/[.08]" />
                        <div className="absolute inset-7 rounded-full border border-red-300/[.07]" />
                        <AlertOctagon size={24} className="text-red-300/65" />
                      </div>
                      <div className="text-center text-[5px] font-mono tracking-[.15em] text-white/25">ANOMALY FIELD</div>
                    </div>
                  </div>
                  <div className="col-span-7 grid grid-cols-2 gap-1.5">
                    {[
                      ['Objects', detections, 'Detected'],
                      ['Threat', attacks.length ? 'HIGH' : 'LOW', 'Level'],
                      ['Integrity', `${Math.round(avgTrust)}%`, 'Assurance'],
                      ['Status', backendOnline ? 'READY' : 'OFFLINE', 'System'],
                    ].map(([label, value, sub]) => (
                      <div key={label} className="rounded-[15px] border border-white/[.055] bg-white/[.018] p-2.5">
                        <div className="text-[5px] text-white/25">{label}</div>
                        <div className="mt-2 text-sm font-medium text-white/85">{value}</div>
                        <div className="mt-0.5 text-[5px] font-mono text-white/20">{sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </FloatingPanel>

              <FloatingPanel title="Assurance Control">
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    [ShieldCheck, 'Verify Integrity', 'VERIFY'],
                    [Scan, 'Deep Analysis', 'ANALYZE'],
                    [Crosshair, 'Track Object', 'TRACK'],
                    [FileCheck2, 'Audit Output', 'AUDIT'],
                    [TriangleAlert, 'Review Threats', 'THREATS'],
                    [RefreshCw, 'Refresh Data', 'REFRESH'],
                  ].map(([Icon, label, action]: any) => (
                    <motion.button
                      key={action}
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      onClick={() => (action === 'REFRESH' ? load() : showNotice(action))}
                      className="group min-h-[72px] rounded-[15px] border border-white/[.055] bg-white/[.018] p-2.5 text-left transition-all duration-200 hover:border-emerald-200/[.16] hover:bg-emerald-200/[.045]"
                    >
                      <Icon size={13} className="text-white/50 transition-colors duration-200 group-hover:text-emerald-200" />
                      <div className="mt-3 text-[7px] font-medium text-white/65">{label}</div>
                    </motion.button>
                  ))}
                </div>
              </FloatingPanel>
            </div>
          </div>
        </section>

        <section className="mt-3 grid grid-cols-2 gap-2.5 md:grid-cols-4">
          {[
            [TriangleAlert, 'DISTRIBUTION SHIFT', `${distributionShift.toFixed(1)}%`, distributionShift > 20 ? '#EBC85D' : '#68E7B8'],
            [AlertOctagon, 'ANOMALIES', String(anomalies), anomalies ? '#FF686D' : '#68E7B8'],
            [Radio, 'SYSTEM STATUS', backendOnline ? 'ONLINE' : 'OFFLINE', backendOnline ? '#68E7B8' : '#FF686D'],
            [FileCheck2, 'INTEGRITY CHAIN', `${integrity.filter((item) => item[1]).length}/5`, '#62C8FF'],
          ].map(([Icon, label, value, color]: any) => (
            <motion.div key={label} whileHover={{ y: -2 }} transition={{ duration: 0.18 }} className={`${glass} rounded-[17px] p-3`}>
              <div className="flex items-center justify-between">
                <span className="text-[5px] font-mono tracking-[.15em] text-white/22">{label}</span>
                <Icon size={10} style={{ color }} />
              </div>
              <div className="mt-2.5 text-lg font-semibold tracking-[-.03em]" style={{ color }}>{value}</div>
            </motion.div>
          ))}
        </section>

        <section className="mt-2.5 grid grid-cols-12 gap-2.5">
          <div className={`${glass} col-span-12 rounded-[20px] p-4 lg:col-span-7`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-medium">Integrity Chain</div>
                <div className="mt-0.5 text-[5px] font-mono tracking-[.16em] text-white/20">END-TO-END ASSURANCE</div>
              </div>
              <Layers3 size={12} className="text-emerald-200/45" />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              {integrity.map(([name, ok], index) => (
                <div key={name} className="flex items-center gap-1.5">
                  <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 ${ok ? 'border-emerald-200/[.14] bg-emerald-200/[.035]' : 'border-red-300/[.14] bg-red-300/[.035]'}`}>
                    <Check size={7} className={ok ? 'text-emerald-300' : 'text-red-300'} />
                    <span className="text-[5px] text-white/55">{name}</span>
                  </div>
                  {index < integrity.length - 1 && <span className="text-[8px] text-white/12">→</span>}
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1.5 md:grid-cols-4">
              {[
                ['DATASETS', stats.datasets, Database],
                ['MODELS', stats.models, Brain],
                ['BLOCKS', stats.blocks, Layers3],
                ['WALLETS', stats.wallets, ShieldCheck],
              ].map(([label, value, Icon]: any) => (
                <div key={label} className="rounded-[13px] border border-white/[.045] bg-black/15 p-2.5">
                  <Icon size={10} className="text-emerald-200/35" />
                  <div className="mt-2 text-base font-semibold">{value}</div>
                  <div className="mt-0.5 text-[5px] font-mono text-white/20">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${glass} col-span-12 rounded-[20px] p-4 lg:col-span-5`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-medium">Detected Classes</div>
                <div className="mt-0.5 text-[5px] font-mono tracking-[.16em] text-white/20">LIVE VISION TELEMETRY</div>
              </div>
              <Boxes size={12} className="text-emerald-200/40" />
            </div>
            <div className="mt-4 space-y-2.5">
              {topClasses.length ? (
                topClasses.map((item: any) => (
                  <div key={item.name}>
                    <div className="flex justify-between text-[7px]">
                      <span className="capitalize text-white/55">{item.name}</span>
                      <span className="font-mono text-emerald-200/60">{item.count} · {item.pct}%</span>
                    </div>
                    <div className="mt-1 h-[2px] rounded-full bg-white/[.045]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.pct}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className="h-full rounded-full bg-emerald-300/85"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-5 text-center text-[6px] font-mono text-white/20">NO ACTIVE DETECTIONS</div>
              )}
            </div>
          </div>
        </section>
      </main>

      {notice && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-5 left-1/2 z-[100] -translate-x-1/2 rounded-full border border-emerald-200/[.18] bg-[#06110f]/90 px-4 py-2.5 text-[7px] font-mono text-emerald-100 shadow-2xl backdrop-blur-2xl"
        >
          {notice} · action acknowledged
        </motion.div>
      )}
    </div>
  )
}

export default Home
