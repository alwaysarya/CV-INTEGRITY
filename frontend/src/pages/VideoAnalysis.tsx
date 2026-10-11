import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Video, Camera, Loader2, RefreshCw, Play, Pause, ChevronLeft,
  ChevronRight, Eye, Target, Gauge, Cpu
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

function StatCard({ label, value, color, icon: Icon }: any) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="rounded-[18px] bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-center justify-between">
        <div className="text-[15px] font-medium text-[#86868B]">{label}</div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F5F7]">
          <Icon size={14} className="text-[#1D1D1F]" />
        </div>
      </div>
      <div className="mt-8 text-[48px] font-semibold leading-none tracking-[-0.04em] text-[#1D1D1F]" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-[#F5F5F7]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: typeof value === 'string' && value.includes('%') ? value : '60%' }}
          transition={{ duration: 0.8 }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </motion.div>
  )
}

export function VideoAnalysis() {
  const [frames, setFrames] = useState<FrameResult[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFrameIdx, setSelectedFrameIdx] = useState(0)
  const [autoPlay, setAutoPlay] = useState(false)

  useEffect(() => { loadFrames() }, [])

  useEffect(() => {
    if (!autoPlay || frames.length === 0) return
    const iv = setInterval(() => setSelectedFrameIdx((i) => (i + 1) % frames.length), 2500)
    return () => clearInterval(iv)
  }, [autoPlay, frames])

  const loadFrames = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/video/thumbnails`).catch(() => ({ data: { thumbnails: [] } }))
      const list = (res.data.thumbnails || []).map((t: any) => ({
        frame: t.frame ?? 0,
        preview: t.preview ?? t.image ?? '',
        detections: t.detections ?? 0,
        detectionList: t.detection_list || [],
        classCounts: t.class_counts || {},
      })).filter((x: any) => x.preview)
      setFrames(list)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const currentFrame = frames[selectedFrameIdx]
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
    <div className="min-h-screen bg-[#FBFBFD]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>
      {/* Hero */}
      <section className="mx-auto max-w-[1200px] px-6 pt-20 pb-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-[12px] font-medium tracking-[0.14em] text-[#86868B] uppercase">
            CV-INTEGRITY / Vision
          </div>
          <h1 className="mt-4 text-[56px] font-semibold leading-[1.05] tracking-[-0.025em] text-[#1D1D1F]">
            Live Vision Analysis
          </h1>
          <p className="mt-5 max-w-[640px] text-[19px] leading-relaxed text-[#86868B]">
            Real-time frame inspection with detection overlay and class telemetry.
          </p>
        </motion.div>
      </section>

      {/* Stat cards */}
      <section className="mx-auto max-w-[1200px] px-6 pb-16">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Frames" value={frames.length} color="#1D1D1F" icon={Video} />
          <StatCard label="Detections" value={totalDetections} color="#34C759" icon={Target} />
          <StatCard label="Class Types" value={classList.length} color="#0071E3" icon={Cpu} />
          <StatCard label="Avg Confidence" value={`${avgConfidence.toFixed(0)}%`} color="#FF9500" icon={Gauge} />
        </div>
      </section>

      {/* Main content */}
      <section className="mx-auto max-w-[1200px] px-6 pb-16">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Video panel */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between border-b border-[#F5F5F7] px-7 py-5">
                <div>
                  <h2 className="text-[19px] font-semibold text-[#1D1D1F]">Live Stream</h2>
                  <p className="mt-0.5 text-[13px] text-[#86868B]">
                    Frame {String(currentFrame?.frame || 0).padStart(4, '0')} · {currentFrame?.detections || 0} objects
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedFrameIdx((i) => Math.max(0, i - 1))}
                    disabled={selectedFrameIdx === 0}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F7] text-[#1D1D1F] transition-colors hover:bg-[#E5E5EA] disabled:opacity-40"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    onClick={() => setAutoPlay(!autoPlay)}
                    className={`flex h-9 items-center gap-2 rounded-full px-4 text-[12px] font-medium transition-colors ${
                      autoPlay ? 'bg-[#0071E3] text-white hover:bg-[#0077ED]' : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E5E5EA]'
                    }`}
                  >
                    {autoPlay ? <Pause size={12} /> : <Play size={12} />}
                    {autoPlay ? 'Pause' : 'Play'}
                  </button>
                  <button
                    onClick={() => setSelectedFrameIdx((i) => Math.min(frames.length - 1, i + 1))}
                    disabled={selectedFrameIdx === frames.length - 1}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F7] text-[#1D1D1F] transition-colors hover:bg-[#E5E5EA] disabled:opacity-40"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>

              <div className="relative aspect-[16/10] bg-[#1D1D1F]">
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 size={28} className="animate-spin text-white/50" />
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
                    {currentFrame.detectionList?.slice(0, 5).map((d: any, i: number) => {
                      const conf = (d.confidence || 0) * 100
                      const color = conf >= 75 ? '#0071E3' : conf >= 50 ? '#FF9500' : '#FF3B30'
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.08 }}
                          className="absolute rounded-md border-2"
                          style={{
                            left: `${d.bbox?.[0] || 20}%`,
                            top: `${d.bbox?.[1] || 30}%`,
                            width: `${d.bbox?.[2] || 25}%`,
                            height: `${d.bbox?.[3] || 30}%`,
                            borderColor: color,
                            background: `${color}15`,
                          }}
                        >
                          <div className="absolute -top-6 left-0 rounded-md px-2 py-0.5 text-[10px] font-semibold text-white" style={{ background: color }}>
                            {d.class} · {conf.toFixed(0)}%
                          </div>
                        </motion.div>
                      )
                    })}
                    <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 backdrop-blur-xl">
                      <span className={`h-2 w-2 rounded-full ${autoPlay ? 'animate-pulse bg-[#34C759]' : 'bg-white/50'}`} />
                      <span className="text-[11px] font-semibold tracking-wider text-white">
                        {autoPlay ? 'LIVE' : 'PAUSED'}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <Video size={40} className="text-white/30" />
                    <span className="text-[13px] text-white/50">No frames available</span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {frames.length > 1 && (
                <div className="border-t border-[#F5F5F7] p-5">
                  <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">
                    Available Frames
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {frames.map((f, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedFrameIdx(i)}
                        className={`shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                          selectedFrameIdx === i ? 'border-[#0071E3] ring-2 ring-[#0071E3]/20' : 'border-transparent hover:border-[#D2D2D7]'
                        }`}
                      >
                        <img src={`data:image/jpeg;base64,${f.preview}`} alt={`Frame ${f.frame}`} className="h-14 w-20 object-cover" />
                        <div className="bg-[#F5F5F7] px-1 py-0.5 text-center text-[10px] font-medium text-[#86868B]">#{f.frame}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar panels */}
          <div className="space-y-5 lg:col-span-1">
            {/* Detected classes */}
            <div className="rounded-[18px] bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-[17px] font-semibold text-[#1D1D1F]">Detected Classes</h3>
                  <p className="mt-0.5 text-[13px] text-[#86868B]">Aggregate across frames</p>
                </div>
                <Eye size={16} className="text-[#86868B]" />
              </div>

              <div className="space-y-4">
                {classList.length > 0 ? classList.slice(0, 6).map((c) => {
                  const total = classList.reduce((s, x) => s + x.count, 0) || 1
                  const pct = Math.round((c.count / total) * 100)
                  return (
                    <div key={c.name}>
                      <div className="mb-2 flex items-center justify-between text-[13px]">
                        <span className="font-medium capitalize text-[#1D1D1F]">{c.name}</span>
                        <span className="font-mono text-[#86868B]">{c.count} · {pct}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[#F5F5F7]">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7 }} className="h-full rounded-full bg-[#0071E3]" />
                      </div>
                    </div>
                  )
                }) : <div className="py-6 text-center text-[13px] text-[#86868B]">No class data</div>}
              </div>
            </div>

            {/* Current frame detections */}
            <div className="rounded-[18px] bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="mb-5">
                <h3 className="text-[17px] font-semibold text-[#1D1D1F]">Current Frame</h3>
                <p className="mt-0.5 text-[13px] text-[#86868B]">Object-level detections</p>
              </div>
              <div className="space-y-2.5">
                {currentFrame?.detectionList && currentFrame.detectionList.length > 0 ? (
                  currentFrame.detectionList.map((d: any, i: number) => {
                    const conf = (d.confidence || 0) * 100
                    const color = conf >= 75 ? '#34C759' : conf >= 50 ? '#FF9500' : '#FF3B30'
                    return (
                      <div key={i} className="flex items-center justify-between rounded-xl bg-[#FBFBFD] px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                          <span className="text-[13px] font-medium capitalize text-[#1D1D1F]">{d.class || 'Object'}</span>
                        </div>
                        <span className="font-mono text-[13px] font-semibold" style={{ color }}>{conf.toFixed(1)}%</span>
                      </div>
                    )
                  })
                ) : (
                  <div className="py-6 text-center text-[13px] text-[#86868B]">No detections in this frame</div>
                )}
              </div>
            </div>

            {/* Telemetry */}
            <div className="rounded-[18px] bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="mb-5">
                <h3 className="text-[17px] font-semibold text-[#1D1D1F]">Stream Telemetry</h3>
                <p className="mt-0.5 text-[13px] text-[#86868B]">Live processing signals</p>
              </div>
              <div className="space-y-3">
                {[
                  ['Inference latency', '2 ms'],
                  ['Frame rate', '30 FPS'],
                  ['Resolution', '1080p'],
                  ['Camera', 'CAM-01'],
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
    </div>
  )
}

export default VideoAnalysis
