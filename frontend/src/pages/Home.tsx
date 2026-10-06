import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, Brain, ShieldCheck, AlertOctagon, Camera, Radio, Eye } from 'lucide-react'
import apiClient from '@/lib/api'

const API = 'http://localhost:8000'

function AnimatedNumber({ value, duration = 1.2, decimals = 0 }: { value: number, duration?: number, decimals?: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const startTime = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(value * eased)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value, duration])
  return <>{display.toFixed(decimals)}</>
}

function LiveVisionCanvas({ frame, backendOnline }: { frame: any, backendOnline: boolean }) {
  return (
    <div className="relative rounded-2xl overflow-hidden h-full" style={{ background: 'linear-gradient(135deg, rgba(94,234,212,0.05) 0%, rgba(8,8,12,0.98) 100%)', border: '1px solid rgba(94,234,212,0.2)' }}>
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(94,234,212,0.12)' }}>
        <div className="flex items-center gap-2.5">
          <Eye size={14} style={{ color: '#5EEAD4', filter: 'drop-shadow(0 0 4px rgba(94,234,212,0.5))' }} />
          <span className="text-[12px] font-semibold" style={{ color: '#FFFFFF' }}>Live Vision Analysis</span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(94,234,212,0.1)', color: '#5EEAD4', opacity: 0.6 }}>CENTRAL_VISION</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: backendOnline ? '#22C55E' : '#F87171' }} />
          <span className="text-[10px] font-mono" style={{ color: backendOnline ? '#22C55E' : '#F87171' }}>{backendOnline ? 'LIVE' : 'OFFLINE'}</span>
        </div>
      </div>
      <div className="relative" style={{ aspectRatio: '16/10', minHeight: 380 }}>
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#5EEAD4 1px, transparent 1px), linear-gradient(90deg, #5EEAD4 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        {frame?.image ? (
          <motion.img
            key={frame.frame}
            initial={{ opacity: 0.7, scale: 1.01 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            src={`data:image/jpeg;base64,${frame.image}`}
            alt="Live frame"
            className="absolute inset-0 w-full h-full object-contain"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Camera size={48} style={{ color: '#5EEAD4', opacity: 0.2 }} />
            <span className="text-[11px] font-mono" style={{ color: '#5EEAD4', opacity: 0.4 }}>Awaiting vision stream...</span>
          </div>
        )}
        <div className="absolute top-3 left-3 w-5 h-5 pointer-events-none" style={{ borderTop: '2px solid #5EEAD4', borderLeft: '2px solid #5EEAD4', opacity: 0.6 }} />
        <div className="absolute top-3 right-3 w-5 h-5 pointer-events-none" style={{ borderTop: '2px solid #5EEAD4', borderRight: '2px solid #5EEAD4', opacity: 0.6 }} />
        <div className="absolute bottom-3 left-3 w-5 h-5 pointer-events-none" style={{ borderBottom: '2px solid #5EEAD4', borderLeft: '2px solid #5EEAD4', opacity: 0.6 }} />
        <div className="absolute bottom-3 right-3 w-5 h-5 pointer-events-none" style={{ borderBottom: '2px solid #5EEAD4', borderRight: '2px solid #5EEAD4', opacity: 0.6 }} />
        {frame?.detectionList?.length > 0 && (
          <div className="absolute top-3 right-3 space-y-1.5 max-w-[180px]">
            {frame.detectionList.slice(0, 4).map((d: any, i: number) => (
              <motion.div key={`${frame?.frame}-${i}`} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.12, duration: 0.35 }}
                className="px-2.5 py-1 rounded text-[10px] font-mono capitalize flex items-center gap-2 backdrop-blur-sm"
                style={{ background: 'rgba(8,8,12,0.9)', border: '1px solid rgba(94,234,212,0.35)', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#5EEAD4', boxShadow: '0 0 6px #5EEAD4' }} />
                <span style={{ color: '#FFFFFF', fontWeight: 500 }}>{d.class}</span>
                <span className="ml-auto" style={{ color: '#5EEAD4', fontWeight: 600 }}>{((d.confidence || 0) * 100).toFixed(0)}%</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2 px-5 py-3" style={{ borderTop: '1px solid rgba(94,234,212,0.12)', background: 'rgba(0,0,0,0.3)' }}>
        {[
          { label: 'FRAME', value: `#${(frame?.frame ?? 0).toString().padStart(6, '0')}` },
          { label: 'OBJECTS', value: String(frame?.detections ?? 0).padStart(2, '0') },
          { label: 'FPS', value: '29.8' },
          { label: 'CAMERA', value: backendOnline ? 'ONLINE' : 'OFFLINE', ok: backendOnline },
        ].map((s, i) => (
          <div key={i} className="text-center">
            <div className="text-[9px] font-mono mb-0.5" style={{ color: '#5EEAD4', opacity: 0.5 }}>{s.label}</div>
            <div className="text-[11px] font-bold font-mono" style={{ color: s.ok === false ? '#F87171' : s.ok === true ? '#22C55E' : '#FFFFFF' }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function IntegrityCard({ title, subtitle, score, status, metrics, icon: Icon, size = 'large' }: any) {
  const [hover, setHover] = useState(false)
  const statusColor = status === 'ok' ? '#22C55E' : status === 'warn' ? '#FBBF24' : '#F87171'
  const statusLabel = status === 'ok' ? 'Healthy' : status === 'warn' ? 'Review' : 'Critical'
  return (
    <motion.div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} whileHover={{ y: -2 }}
      className="relative rounded-2xl p-5"
      style={{ background: 'linear-gradient(135deg, rgba(94,234,212,0.04) 0%, rgba(12,14,18,0.95) 60%, rgba(8,8,12,0.98) 100%)', border: `1px solid ${hover ? 'rgba(94,234,212,0.35)' : 'rgba(94,234,212,0.12)'}`, boxShadow: size === 'hero' ? (hover ? '0 12px 32px rgba(94,234,212,0.15), inset 0 1px 0 rgba(94,234,212,0.15)' : '0 4px 12px rgba(94,234,212,0.08), inset 0 1px 0 rgba(94,234,212,0.08)') : (hover ? '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(94,234,212,0.08)' : '0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.02)'), transition: 'all 0.25s ease' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(94,234,212,0.1)', border: '1px solid rgba(94,234,212,0.2)' }}>
            <Icon size={13} style={{ color: '#5EEAD4' }} />
          </div>
          <div>
            <div className="text-[11px] font-semibold" style={{ color: '#FFFFFF' }}>{title}</div>
            <div className="text-[8px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>{subtitle}</div>
          </div>
        </div>
        <span className="text-[9px] font-mono px-2 py-0.5 rounded cursor-help" style={{ background: `${statusColor}20`, color: statusColor }} title={status === 'ok' ? 'Metric within healthy range' : status === 'warn' ? 'Needs review' : 'Critical - action required'}>{statusLabel.toUpperCase()}</span>
      </div>
      <div className="mb-1">
        <span className={`font-bold leading-none ${size === 'hero' ? 'text-[44px]' : size === 'large' ? 'text-[36px]' : 'text-[28px]'}`} style={{ color: statusColor }}>
          <AnimatedNumber value={score} decimals={1} />
        </span>
        <span className="text-[16px] font-semibold" style={{ color: statusColor, opacity: 0.6 }}>%</span>
      </div>
      <div className="text-[10px] font-medium mb-3" style={{ color: statusColor, opacity: 0.85 }}>
        {statusLabel}
      </div>
      <div className="h-1 rounded-full overflow-hidden mb-4" style={{ background: 'rgba(94,234,212,0.08)' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(score, 100)}%` }} transition={{ duration: 1.2 }} className="h-full rounded-full" style={{ background: statusColor }} />
      </div>
      <AnimatePresence>
        {hover && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-1.5 pt-3" style={{ borderTop: '1px solid rgba(94,234,212,0.1)' }}>
            {metrics.map((m: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-[10px] font-mono" style={{ color: '#5EEAD4', opacity: 0.6 }}>{m.label}</span>
                <span className="text-[11px] font-mono font-semibold" style={{ color: '#FFFFFF' }}>{m.value}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function SmallCard({ label, value, sub, tone = 'neutral' }: any) {
  const toneColor = { neutral: '#5EEAD4', ok: '#22C55E', warn: '#FBBF24', fail: '#F87171' }[tone] || '#5EEAD4'
  return (
    <motion.div whileHover={{ y: -2 }} className="rounded-xl p-4 h-full" style={{ background: 'linear-gradient(135deg, rgba(94,234,212,0.04) 0%, rgba(12,14,18,0.95) 100%)', border: '1px solid rgba(94,234,212,0.12)', boxShadow: '0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.02)' }}>
      <div className="text-[9px] font-mono mb-2 cursor-help" style={{ color: '#5EEAD4', opacity: 0.5 }} title={label === 'Distribution Shift' ? 'Measures change in data distribution vs training' : label === 'Anomaly Assessment' ? 'Number of flagged anomalies requiring review' : label === 'System Status' ? 'Backend connection and latency' : ''}>{label}</div>
      <div className="text-[20px] font-bold leading-tight" style={{ color: toneColor }}>{value}</div>
      {sub && <div className="text-[9px] font-mono mt-1" style={{ color: '#5EEAD4', opacity: 0.4 }}>{sub}</div>}
    </motion.div>
  )
}

function ThreatRow({ name, severity, desc, color }: any) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div whileHover={{ x: 2, boxShadow: `0 4px 12px rgba(0,0,0,0.5), inset 2px 0 0 ${color}` }} transition={{ duration: 0.2 }} className="rounded-lg overflow-hidden" style={{ background: 'rgba(0,0,0,0.35)', borderLeft: `2px solid ${color}`, boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
      <button onClick={() => setOpen(!open)} className="w-full p-2.5 text-left">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] font-semibold" style={{ color: '#FFFFFF', wordBreak: 'break-word' }}>{name.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}</span>
          <span className="text-[8px] px-1.5 py-0.5 rounded font-mono" style={{ background: `${color}20`, color }}>{severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase()}</span>
        </div>
        {open && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9px] font-mono mt-1.5" style={{ color: '#5EEAD4', opacity: 0.6 }}>{desc}</motion.div>}
      </button>
    </motion.div>
  )
}

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
  const [mainFrame, setMainFrame] = useState<any>(null)
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0)

  useEffect(() => {
    load()
    checkHealth()
    const tick = setInterval(() => setTimestamp(new Date()), 1000)
    const health = setInterval(checkHealth, 10000)
    return () => { clearInterval(tick); clearInterval(health) }
  }, [])

  useEffect(() => {
    if (frames.length === 0) return
    const iv = setInterval(() => setCurrentFrameIdx((i) => (i + 1) % frames.length), 3000)
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
    } catch { setBackendOnline(false); setLatency(0) }
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
      const modelsObj = (mRes.data && mRes.data.models) || {}
      const firstModel = (modelsObj as any).good || Object.values(modelsObj)[0]
      if (firstModel) setModelInfo(firstModel)
      const ts = tRes.trust_scores || {}
      const tsList = Object.entries(ts).map(([key, val]: [string, any]) => ({
        key, dataset: val.dataset || key, score: val.final_score || 0,
        decision: (val.decision || '').replace(/[✅⚠️❌]/g, '').trim() || 'N/A',
      }))
      setTrustScores(tsList)
      if (tsList.length) setAvgTrust(Math.round(tsList.reduce((a, b) => a + b.score, 0) / tsList.length))
      const attackList = Object.entries(aRes.data.attacks || {}).map(([k, v]: [string, any]) => ({
        id: k, name: v.name || k, severity: v.severity || 'Medium', desc: v.description || '',
      }))
      setAttacks(attackList)
      const vList = (vRes.thumbnails || []).map((t: any) => ({
        frame: t.frame ?? 0, image: t.preview ?? t.image ?? '', detections: t.detections ?? 0,
        detectionList: t.detection_list || [], classCounts: t.class_counts || {},
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
      setClasses(Object.entries(agg).map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) })).sort((a, b) => b.count - a.count))
      const blocksList = (bRes.data.blocks || []).slice().reverse()
      setActivities(blocksList.slice(0, 15).map((b: any) => ({ id: b.index ?? 0, action: b.data?.action || 'EVENT', timestamp: b.datetime || b.timestamp })))
      const times = (bRes.data.blocks || []).sort((a: any, b: any) => (a.index || 0) - (b.index || 0)).map((b: any) => b.timestamp || 0).filter((t: number) => t > 0)
      const intervals = times.slice(1).map((t: number, i: number) => { const diff = t - times[i]; return diff > 0 && diff < 300 ? diff * 1000 : 0 }).filter((x: number) => x > 0)
      setBlockTimes(intervals.slice(-20))
    } catch (e) { console.error(e) }
  }

  const severityColors: Record<string, string> = { CRITICAL: '#F87171', HIGH: '#FBBF24', MEDIUM: '#38BDF8', LOW: '#5EEAD4' }
  const totalFrames = frames.length
  const totalDetections = frames.reduce((s, f) => s + (f.detections || 0), 0)
  const classTypes = classes.length
  const allDetections = frames.flatMap((f: any) => f.detectionList || [])
  const avgConfidence = allDetections.length ? (allDetections.reduce((s: number, d: any) => s + (d.confidence || 0), 0) / allDetections.length * 100).toFixed(1) : '0'
  const criticalCount = attacks.filter(a => (a.severity || '').toUpperCase() === 'CRITICAL').length
  const highCount = attacks.filter(a => (a.severity || '').toUpperCase() === 'HIGH').length
  const warnCount = attacks.filter(a => (a.severity || '').toUpperCase() === 'MEDIUM').length
  const datasetScore = trustScores.length ? trustScores.reduce((a, b) => a + b.score, 0) / trustScores.length : 0
  const modelScore = modelInfo?.mAP50 ?? 0
  const precisionScore = modelInfo?.precision ?? 0
  const recallScore = modelInfo?.recall ?? 0
  const outputScore = parseFloat(avgConfidence) || 0
  const shiftScore = metrics?.distribution_shift ?? (metrics?.anomaly_count ? Math.min(metrics.anomaly_count * 2.5, 45) : 8.2)
  const anomalyCount = metrics?.anomaly_count ?? attacks.filter((a: any) => { const sv = (a.severity || '').toUpperCase(); return sv === 'CRITICAL' || sv === 'HIGH' }).length
  const systemHealthy = backendOnline && datasetScore > 80 && modelScore > 50
  const trustTrend = trustScores.length > 0 ? (trustScores.every((t: any) => t.score >= 50) ? 'STABLE' : 'DEGRADED') : 'AWAITING_DATA'
  const integrityChain = [
    { label: 'Contributor', ok: stats.wallets > 0 },
    { label: 'Dataset', ok: stats.datasets > 0 },
    { label: 'Model', ok: stats.models > 0 },
    { label: 'Inference', ok: frames.length > 0 },
    { label: 'Output', ok: stats.blocks > 0 },
  ]

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: '#08080C', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="max-w-[1600px] mx-auto space-y-4">
        <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid rgba(94,234,212,0.12)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(94,234,212,0.08)', border: '1px solid rgba(94,234,212,0.3)' }}>
              <Radio size={15} style={{ color: '#5EEAD4', filter: 'drop-shadow(0 0 6px rgba(94,234,212,0.6))' }} />
            </div>
            <div>
              <div className="text-[14px] font-bold tracking-[0.18em]" style={{ color: '#5EEAD4' }}>CV-INTEGRITY</div>
              <div className="text-[9px] tracking-[0.18em] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>COMPUTER VISION ASSURANCE</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-[10px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>{timestamp.toLocaleTimeString('en-US', { hour12: false })}</div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: systemHealthy ? 'rgba(34,197,94,0.08)' : 'rgba(251,191,36,0.08)', border: systemHealthy ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(251,191,36,0.3)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: systemHealthy ? '#22C55E' : '#FBBF24' }} />
              <span className="text-[10px] font-mono" style={{ color: systemHealthy ? '#22C55E' : '#FBBF24' }}>{systemHealthy ? 'SYSTEM HEALTHY' : 'SYSTEM REVIEW'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 lg:gap-5">
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <IntegrityCard title="Dataset Integrity" subtitle="DATASET_INTEGRITY / PRIMARY" score={datasetScore} status={datasetScore > 80 ? 'ok' : datasetScore > 50 ? 'warn' : 'fail'} icon={Database} size="hero" metrics={[{ label: 'Datasets', value: String(stats.datasets) }, { label: 'Trust Score', value: `${Math.round(datasetScore)}%` }, { label: 'Contributors', value: String(stats.wallets) }]} />
            <IntegrityCard title="Model Performance" subtitle="MODEL_PERFORMANCE / YOLOv8 · mAP50" score={modelScore} status={modelScore > 50 ? 'ok' : modelScore > 30 ? 'warn' : 'fail'} icon={Brain} metrics={[{ label: 'Precision', value: `${precisionScore.toFixed(2)}%` }, { label: 'Recall', value: `${recallScore.toFixed(2)}%` }, { label: 'mAP50', value: `${modelScore.toFixed(2)}%` }]} />
            <IntegrityCard title="Output Integrity" subtitle="OUTPUT_INTEGRITY" score={outputScore} status={outputScore > 60 ? 'ok' : 'warn'} icon={ShieldCheck} metrics={[{ label: 'Valid Outputs', value: String(totalDetections) }, { label: 'Flagged', value: String(anomalyCount) }, { label: 'Confidence', value: `${outputScore}%` }]} />
          </div>

          <div className="col-span-12 lg:col-span-6 space-y-4">
            <LiveVisionCanvas frame={mainFrame} backendOnline={backendOnline} />
            <div className="grid grid-cols-2 gap-4">
              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }} className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg, rgba(94,234,212,0.04) 0%, rgba(12,14,18,0.95) 100%)', border: '1px solid rgba(94,234,212,0.12)', boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold" style={{ color: '#FFFFFF' }}>Detected Classes</span>
                  <span className="text-[9px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>DETECTED_CLASSES</span>
                </div>
                <div className="space-y-2">
                  {classes.slice(0, 6).map((c, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono capitalize" style={{ color: '#FFFFFF', opacity: 0.9 }}>{c.name}</span>
                        <span className="text-[9px] font-mono" style={{ color: '#5EEAD4' }}>{c.count} · {c.pct}%</span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(94,234,212,0.08)' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${c.pct}%` }} transition={{ duration: 0.8, delay: i * 0.05 }} className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #5EEAD4, #38BDF8)' }} />
                      </div>
                    </div>
                  ))}
                  {classes.length === 0 && <div className="text-[10px] font-mono text-center py-3" style={{ color: '#5EEAD4', opacity: 0.4 }}>No detections</div>}
                </div>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }} className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg, rgba(94,234,212,0.04) 0%, rgba(12,14,18,0.95) 100%)', border: '1px solid rgba(94,234,212,0.12)', boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold" style={{ color: '#FFFFFF' }}>Detection Stats</span>
                  <span className="text-[9px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>DETECTION_STATS</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: 'Total Frames', value: String(totalFrames) },
                    { label: 'Total Detections', value: String(totalDetections) },
                    { label: 'Class Types', value: String(classTypes) },
                    { label: 'Avg Confidence', value: `${avgConfidence}%` },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-[10px] font-mono" style={{ color: '#5EEAD4', opacity: 0.6 }}>{m.label}</span>
                      <span className="text-[12px] font-bold font-mono" style={{ color: '#FFFFFF' }}>{m.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-3 space-y-4">
            <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, rgba(248,113,113,0.04) 0%, rgba(12,14,18,0.95) 100%)', border: '1px solid rgba(248,113,113,0.18)', boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertOctagon size={13} style={{ color: '#F87171' }} />
                  <span className="text-[11px] font-semibold" style={{ color: '#FFFFFF' }}>Threat Catalog</span>
                </div>
                <span className="text-[9px] font-mono" style={{ color: '#5EEAD4', opacity: 0.4 }}>THREAT_CATALOG</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(248,113,113,0.1)' }}>
                  <div className="text-[16px] font-bold" style={{ color: '#F87171' }}>{criticalCount}</div>
                  <div className="text-[8px] font-mono" style={{ color: '#F87171', opacity: 0.7 }}>CRITICAL</div>
                </div>
                <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(251,191,36,0.1)' }}>
                  <div className="text-[16px] font-bold" style={{ color: '#FBBF24' }}>{highCount}</div>
                  <div className="text-[8px] font-mono" style={{ color: '#FBBF24', opacity: 0.7 }}>HIGH</div>
                </div>
                <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(56,189,248,0.1)' }}>
                  <div className="text-[16px] font-bold" style={{ color: '#38BDF8' }}>{warnCount}</div>
                  <div className="text-[8px] font-mono" style={{ color: '#38BDF8', opacity: 0.7 }}>MEDIUM</div>
                </div>
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {attacks.slice(0, 8).map((a, i) => (
                  <ThreatRow key={i} name={a.name} severity={a.severity} desc={a.desc} color={severityColors[(a.severity || '').toUpperCase()] || '#38BDF8'} />
                ))}
                {attacks.length === 0 && <div className="text-[10px] font-mono text-center py-3" style={{ color: '#5EEAD4', opacity: 0.4 }}>No threats detected</div>}
              </div>
            </div>

            <div className="rounded-xl p-5" style={{ background: 'linear-gradient(135deg, rgba(94,234,212,0.04) 0%, rgba(12,14,18,0.95) 100%)', border: '1px solid rgba(94,234,212,0.15)', boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold" style={{ color: '#FFFFFF' }}>AI Assessment</span>
                <span className="text-[9px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>PROGNOSIS_AI</span>
              </div>
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono" style={{ color: '#5EEAD4', opacity: 0.6 }}>Avg Trust Score</span>
                  <span className="text-[14px] font-bold font-mono" style={{ color: '#5EEAD4' }}>{avgTrust}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(94,234,212,0.1)' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${avgTrust}%` }} transition={{ duration: 1.5 }} className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #5EEAD4, #38BDF8)' }} />
                </div>
              </div>
              <div className="text-[9px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>TREND: {trustTrend}</div>
            </div>

            <div className="rounded-xl p-5" style={{ background: 'linear-gradient(135deg, rgba(94,234,212,0.04) 0%, rgba(12,14,18,0.95) 100%)', border: '1px solid rgba(94,234,212,0.15)', boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold" style={{ color: '#FFFFFF' }}>Live Feed</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded animate-pulse" style={{ background: 'rgba(248,113,113,0.15)', color: '#F87171' }}>● REC</span>
              </div>
              {frames.length > 0 ? (
                <div className="grid grid-cols-2 gap-1.5">
                  {frames.slice(0, 4).map((f, i) => (
                    <div key={i} onClick={() => setCurrentFrameIdx(i)} className="relative rounded-lg overflow-hidden cursor-pointer" style={{ aspectRatio: '16/9', border: currentFrameIdx === i ? '2px solid #5EEAD4' : '1px solid rgba(94,234,212,0.2)' }}>
                      <img src={`data:image/jpeg;base64,${f.image}`} alt="" className="w-full h-full object-cover" />
                      <div className="absolute bottom-0.5 left-0.5 px-1 py-0.5 rounded text-[7px] font-mono" style={{ background: 'rgba(0,0,0,0.7)', color: '#5EEAD4' }}>#{f.frame}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg flex items-center justify-center" style={{ aspectRatio: '16/9', background: 'rgba(0,0,0,0.35)' }}>
                  <Camera size={20} style={{ color: '#5EEAD4', opacity: 0.3 }} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 lg:gap-5">
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <SmallCard label="Distribution Shift" value={`${(shiftScore || 0).toFixed(1)}%`} sub={(shiftScore || 0) > 20 ? 'MODERATE' : 'STABLE'} tone={(shiftScore || 0) > 20 ? 'warn' : 'ok'} />
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <SmallCard label="Anomaly Assessment" value={String(anomalyCount)} sub={anomalyCount > 0 ? 'REVIEW REQUIRED' : 'ALL NORMAL'} tone={anomalyCount > 0 ? 'fail' : 'ok'} />
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <SmallCard label="System Status" value={backendOnline ? 'Online' : 'Offline'} sub={`${latency}ms`} tone={backendOnline ? 'ok' : 'fail'} />
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }} className="rounded-xl p-4 h-full" style={{ background: 'linear-gradient(135deg, rgba(94,234,212,0.04) 0%, rgba(12,14,18,0.95) 100%)', border: '1px solid rgba(94,234,212,0.12)', boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-semibold" style={{ color: '#FFFFFF' }}>Integrity Chain</span>
                <span className="text-[9px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>INTEGRITY_CHAIN</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {integrityChain.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: s.ok ? 'rgba(34,197,94,0.08)' : 'rgba(248,113,113,0.08)', border: s.ok ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(248,113,113,0.3)' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.ok ? '#22C55E' : '#F87171' }} />
                      <span className="text-[9px] font-mono" style={{ color: '#FFFFFF', opacity: 0.85 }}>{s.label}</span>
                    </div>
                    {i < integrityChain.length - 1 && <span className="text-[10px]" style={{ color: '#5EEAD4', opacity: 0.3 }}>→</span>}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg, rgba(94,234,212,0.04) 0%, rgba(8,8,12,0.95) 100%)', border: '1px solid rgba(94,234,212,0.12)', boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold" style={{ color: '#FFFFFF' }}>Audit Log</span>
            <span className="text-[9px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>SYS_LOG</span>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
            {activities.slice(0, 8).map((a, i) => (
              <div key={i} className="text-[9px] flex gap-1.5" style={{ fontFamily: 'monospace' }}>
                <span style={{ color: '#38BDF8' }}>&gt;</span>
                <span style={{ color: '#5EEAD4', opacity: 0.7 }}>{a.action.replace(/_/g, ' ')}</span>
                <span className="ml-auto" style={{ color: '#5EEAD4', opacity: 0.3 }}>#{a.id}</span>
              </div>
            ))}
            {activities.length === 0 && <div className="text-[9px]" style={{ color: '#5EEAD4', opacity: 0.4 }}>&gt; awaiting data...</div>}
          </div>
        </div>
      </div>
    </div>
  )
}