import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Video, Camera, Loader2, RefreshCw, Activity, Play, Pause,
  ChevronLeft, ChevronRight, Eye, Target, Gauge, Cpu
} from 'lucide-react'
import axios from 'axios'

const API = 'http://localhost:8000'

interface FrameResult {
  frame: number
  preview: string
  detections: number
  detectionList: any[]
  classCounts: Record<string, number>
}

export function VideoAnalysis() {
  const [frames, setFrames] = useState<FrameResult[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFrameIdx, setSelectedFrameIdx] = useState(0)
  const [autoPlay, setAutoPlay] = useState(false)

  useEffect(() => { loadFrames() }, [])

  useEffect(() => {
    if (!autoPlay || frames.length === 0) return
    const iv = setInterval(() => {
      setSelectedFrameIdx((i) => (i + 1) % frames.length)
    }, 2500)
    return () => clearInterval(iv)
  }, [autoPlay, frames])

  const loadFrames = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/video/thumbnails`)
      const list = (res.data.thumbnails || []).map((t: any) => ({
        frame: t.frame ?? 0,
        preview: t.preview ?? t.image ?? '',
        detections: t.detections ?? 0,
        detectionList: t.detection_list || [],
        classCounts: t.class_counts || {},
      })).filter((x: any) => x.preview)
      setFrames(list)
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const currentFrame = frames[selectedFrameIdx]

  // Aggregate
  const totalDetections = frames.reduce((s, f) => s + f.detections, 0)
  const allDetections = frames.flatMap(f => f.detectionList || [])
  const avgConfidence = allDetections.length
    ? (allDetections.reduce((s, d: any) => s + (d.confidence || 0), 0) / allDetections.length) * 100
    : 0

  const classesAgg: Record<string, number> = {}
  frames.forEach(f => {
    Object.entries(f.classCounts || {}).forEach(([k, v]) => {
      classesAgg[k] = (classesAgg[k] || 0) + Number(v)
    })
  })
  const classList = Object.entries(classesAgg)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-6">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              CV-INTEGRITY / Live Vision
            </div>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">
              Live Vision Analysis
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Real-time frame inspection with detection overlay and class telemetry.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-medium text-emerald-700">
                {frames.length} frames loaded
              </span>
            </div>
            <button
              onClick={loadFrames}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Frames', value: frames.length, color: '#0F172A', icon: Video },
            { label: 'Total Detections', value: totalDetections, color: '#10B981', icon: Target },
            { label: 'Class Types', value: classList.length, color: '#3B82F6', icon: Cpu },
            { label: 'Avg Confidence', value: `${avgConfidence.toFixed(1)}%`, color: '#F59E0B', icon: Gauge },
          ].map((s) => (
            <motion.div
              key={s.label}
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="text-[12px] font-medium text-slate-500">{s.label}</div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  <s.icon size={14} className="text-slate-500" />
                </div>
              </div>
              <div className="mt-3 text-[32px] font-bold leading-none tracking-tight text-slate-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {s.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Video panel */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <div className="text-[14px] font-semibold text-slate-900">Live Stream</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    Frame {String(currentFrame?.frame || 0).padStart(4, '0')} · {currentFrame?.detections || 0} objects
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedFrameIdx((i) => Math.max(0, i - 1))}
                    disabled={selectedFrameIdx === 0}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setAutoPlay(!autoPlay)}
                    className={`flex h-8 items-center gap-2 rounded-lg border px-3 text-[11px] font-medium transition-colors ${
                      autoPlay
                        ? 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {autoPlay ? <Pause size={12} /> : <Play size={12} />}
                    {autoPlay ? 'Pause' : 'Play'}
                  </button>
                  <button
                    onClick={() => setSelectedFrameIdx((i) => Math.min(frames.length - 1, i + 1))}
                    disabled={selectedFrameIdx === frames.length - 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              <div className="relative aspect-[16/10] bg-slate-900">
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin text-white/50" />
                  </div>
                ) : currentFrame?.preview ? (
                  <>
                    <motion.img
                      key={currentFrame.frame}
                      initial={{ opacity: 0.7 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      src={`data:image/jpeg;base64,${currentFrame.preview}`}
                      alt={`Frame ${currentFrame.frame}`}
                      className="absolute inset-0 h-full w-full object-contain"
                    />

                    {/* Detection boxes */}
                    {currentFrame.detectionList?.slice(0, 5).map((d: any, i: number) => {
                      const conf = (d.confidence || 0) * 100
                      const color = conf >= 75 ? '#10B981' : conf >= 50 ? '#F59E0B' : '#EF4444'
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.08 }}
                          className="absolute rounded border-2"
                          style={{
                            left: `${d.bbox?.[0] || 20}%`,
                            top: `${d.bbox?.[1] || 30}%`,
                            width: `${d.bbox?.[2] || 25}%`,
                            height: `${d.bbox?.[3] || 30}%`,
                            borderColor: color,
                            background: `${color}15`,
                          }}
                        >
                          <div
                            className="absolute -top-6 left-0 rounded px-2 py-0.5 text-[10px] font-semibold text-white"
                            style={{ background: color }}
                          >
                            {d.class} · {conf.toFixed(0)}%
                          </div>
                        </motion.div>
                      )
                    })}

                    {/* Live badge */}
                    <div className="absolute left-4 top-4 flex items-center gap-2 rounded-lg border border-white/20 bg-black/50 px-2.5 py-1.5 backdrop-blur-md">
                      <span className={`h-1.5 w-1.5 rounded-full ${autoPlay ? 'animate-pulse bg-emerald-400' : 'bg-slate-400'}`} />
                      <span className="text-[10px] font-semibold tracking-wider text-white">
                        {autoPlay ? 'LIVE' : 'PAUSED'}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <Video size={32} className="text-slate-600" />
                    <span className="text-[11px] text-slate-500">No frames available</span>
                  </div>
                )}
              </div>

              {/* Frame thumbnails */}
              {frames.length > 1 && (
                <div className="border-t border-slate-100 p-4">
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Available Frames
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {frames.map((f, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedFrameIdx(i)}
                        className={`flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                          selectedFrameIdx === i
                            ? 'border-emerald-600 ring-2 ring-emerald-600/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <img
                          src={`data:image/jpeg;base64,${f.preview}`}
                          alt={`Frame ${f.frame}`}
                          className="h-14 w-20 object-cover"
                        />
                        <div className="bg-slate-50 px-1 py-0.5 text-center text-[9px] font-medium text-slate-500">
                          #{f.frame}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Class breakdown + telemetry */}
          <div className="lg:col-span-1 space-y-4">
            {/* Detected classes */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[14px] font-semibold text-slate-900">Detected Classes</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">Aggregate across all frames</div>
                </div>
                <Eye size={14} className="text-slate-400" />
              </div>

              <div className="space-y-3">
                {classList.length > 0 ? classList.slice(0, 6).map((c, i) => {
                  const total = classList.reduce((s, x) => s + x.count, 0) || 1
                  const pct = Math.round((c.count / total) * 100)
                  return (
                    <div key={c.name}>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium capitalize text-slate-700">{c.name}</span>
                        <span className="font-mono text-slate-500">{c.count} · {pct}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, delay: i * 0.05 }}
                          className="h-full rounded-full bg-emerald-500"
                        />
                      </div>
                    </div>
                  )
                }) : (
                  <div className="py-6 text-center text-[11px] text-slate-400">No class data</div>
                )}
              </div>
            </div>

            {/* Current frame detections */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[14px] font-semibold text-slate-900">Current Frame</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">Object-level detection list</div>
                </div>
                <Activity size={14} className="text-slate-400" />
              </div>

              <div className="space-y-2">
                {currentFrame?.detectionList && currentFrame.detectionList.length > 0 ? (
                  currentFrame.detectionList.map((d: any, i: number) => {
                    const conf = (d.confidence || 0) * 100
                    const color = conf >= 75 ? '#10B981' : conf >= 50 ? '#F59E0B' : '#EF4444'
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                          <span className="text-[12px] font-medium capitalize text-slate-800">
                            {d.class || 'Object'}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] font-semibold" style={{ color }}>
                          {conf.toFixed(1)}%
                        </span>
                      </div>
                    )
                  })
                ) : (
                  <div className="py-6 text-center text-[11px] text-slate-400">
                    No detections in this frame
                  </div>
                )}
              </div>
            </div>

            {/* Telemetry */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <div className="text-[14px] font-semibold text-slate-900">Stream Telemetry</div>
                <div className="mt-0.5 text-[11px] text-slate-500">Live processing signals</div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Inference latency', value: '2 ms' },
                  { label: 'Frame rate', value: '30 FPS' },
                  { label: 'Resolution', value: '1080p' },
                  { label: 'Camera', value: 'CAM-01' },
                ].map((m) => (
                  <div key={m.label} className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">{m.label}</span>
                    <span className="font-mono text-[12px] font-semibold text-slate-900">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoAnalysis
