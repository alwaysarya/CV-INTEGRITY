import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Video, Loader2, Play, Pause, ChevronLeft, ChevronRight,
  Eye, Target, Gauge, Cpu, Sparkles, ArrowRight, Activity, Scan, Zap
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
    <div className="min-h-screen bg-black" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-black">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1400px] rounded-full blur-[280px]"
            style={{ background: 'radial-gradient(circle, #2DD4BF, transparent 55%)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.45, 0.25] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            className="absolute bottom-0 right-[15%] w-[900px] h-[900px] rounded-full blur-[240px]"
            style={{ background: 'radial-gradient(circle, #0071E3, transparent 55%)' }}
          />
          <div className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
              maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
            }} />
        </div>

        <div className="relative mx-auto max-w-[1200px] px-6 pt-32 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl mb-10">
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ boxShadow: '0 0 10px #2DD4BF' }}
              />
              <span className="text-white/80 text-[11px] font-semibold tracking-[0.16em] uppercase">
                Live Vision · Real-time
              </span>
            </div>

            <h1 className="max-w-[1100px] mx-auto text-[72px] md:text-[128px] font-semibold leading-[0.9] tracking-[-0.05em] text-white">
              See what
              <br />
              <motion.span
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-block bg-gradient-to-r from-[#2DD4BF] via-[#10B981] via-[#30D158] to-[#2DD4BF] bg-clip-text text-transparent bg-[length:200%_100%]"
              >
                the model sees.
              </motion.span>
            </h1>

            <p className="mt-10 max-w-[620px] mx-auto text-[21px] leading-[1.5] tracking-[-0.015em] text-white/50">
              Real-time frame inspection with detection overlays and class telemetry.
            </p>

            {/* Live stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[1000px] mx-auto">
              {[
                { label: 'Frames', value: frames.length, color: '#2DD4BF', icon: Video },
                { label: 'Detections', value: totalDetections, color: '#30D158', icon: Target },
                { label: 'Class Types', value: classList.length, color: '#0071E3', icon: Cpu },
                { label: 'Avg Confidence', value: `${avgConfidence.toFixed(0)}%`, color: '#FF9F0A', icon: Gauge },
              ].map((stat, i) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
                    className="relative rounded-2xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] p-5 overflow-hidden group hover:bg-white/[0.06] transition-all"
                  >
                    <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-opacity"
                      style={{ background: stat.color }} />
                    <div className="relative flex items-center gap-2 mb-3">
                      <Icon size={12} style={{ color: stat.color }} strokeWidth={2.4} />
                      <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-white/40">
                        {stat.label}
                      </span>
                    </div>
                    <div className="relative text-[36px] font-semibold leading-none tracking-[-0.04em] text-white tabular-nums"
                      style={{ textShadow: `0 0 40px ${stat.color}80` }}>
                      {stat.value}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== LIVE VIDEO SHOWCASE ===== */}
      <section className="relative bg-black py-24 px-6">
        <div className="mx-auto max-w-[1400px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2DD4BF]/10 border border-[#2DD4BF]/25 mb-5">
              <Scan size={12} className="text-[#2DD4BF]" />
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#2DD4BF]">Live Stream</span>
            </div>
            <h2 className="text-[52px] md:text-[72px] font-semibold tracking-[-0.04em] leading-[1.0] text-white">
              Every frame,
              <br />
              <span className="bg-gradient-to-r from-[#2DD4BF] to-[#30D158] bg-clip-text text-transparent">
                annotated.
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            {/* MAIN VIDEO PANEL */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-[36px] overflow-hidden"
              style={{
                background: '#0A0A0F',
                boxShadow: '0 40px 120px -20px rgba(0,0,0,0.6), 0 0 120px rgba(45,212,191,0.1)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Top gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#2DD4BF] to-transparent z-20" />

              {/* Header */}
              <div className="relative flex items-center justify-between px-7 py-5 border-b border-white/[0.06] z-10">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <motion.span
                      className={`w-2 h-2 rounded-full ${autoPlay ? 'bg-[#30D158]' : 'bg-white/40'}`}
                      animate={autoPlay ? { opacity: [1, 0.3, 1] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      style={autoPlay ? { boxShadow: '0 0 10px #30D158' } : {}}
                    />
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#2DD4BF]">
                      {autoPlay ? 'Streaming' : 'Standby'}
                    </span>
                  </div>
                  <div className="h-4 w-[1px] bg-white/10" />
                  <div className="font-mono text-[12px] text-white/50">
                    FRAME · {String(currentFrame?.frame || 0).padStart(4, '0')}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedFrameIdx((i) => Math.max(0, i - 1))}
                    disabled={selectedFrameIdx === 0}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] border border-white/10 text-white/80 transition-all hover:bg-white/[0.12] hover:border-white/20 disabled:opacity-30"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    onClick={() => setAutoPlay(!autoPlay)}
                    className={`flex h-9 items-center gap-2 rounded-full px-5 text-[12px] font-semibold transition-all ${
                      autoPlay
                        ? 'text-black'
                        : 'bg-white/[0.06] border border-white/10 text-white/80 hover:bg-white/[0.12]'
                    }`}
                    style={autoPlay ? { background: '#2DD4BF', boxShadow: '0 0 20px rgba(45,212,191,0.5)' } : {}}
                  >
                    {autoPlay ? <Pause size={12} /> : <Play size={12} />}
                    {autoPlay ? 'Pause' : 'Play'}
                  </button>
                  <button
                    onClick={() => setSelectedFrameIdx((i) => Math.min(frames.length - 1, i + 1))}
                    disabled={selectedFrameIdx === frames.length - 1}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] border border-white/10 text-white/80 transition-all hover:bg-white/[0.12] hover:border-white/20 disabled:opacity-30"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>

              {/* Video area */}
              <div className="relative aspect-[16/9] bg-black">
                {/* Scan line */}
                {autoPlay && (
                  <motion.div
                    className="absolute left-0 right-0 h-[2px] z-30 pointer-events-none"
                    style={{ background: 'linear-gradient(90deg, transparent, #2DD4BF, transparent)', boxShadow: '0 0 20px #2DD4BF' }}
                    animate={{ top: ['0%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />
                )}

                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 size={32} className="animate-spin text-white/50" />
                  </div>
                ) : currentFrame?.preview ? (
                  <>
                    {/* Corner HUDs */}
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-xl border border-[#2DD4BF]/40">
                        <motion.span
                          className="w-2 h-2 rounded-full bg-[#2DD4BF]"
                          animate={autoPlay ? { opacity: [1, 0.3, 1] } : {}}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <span className="text-[#2DD4BF] text-[10px] font-bold tracking-wider uppercase">
                          {autoPlay ? 'Live' : 'Paused'}
                        </span>
                      </div>
                      <div className="px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-xl border border-white/15">
                        <span className="text-white/90 text-[10px] font-mono">CAM-01</span>
                      </div>
                    </div>

                    <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                      <div className="px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-xl border border-white/15">
                        <span className="text-white/90 text-[10px] font-mono">1280×720</span>
                      </div>
                      <div className="px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-xl border border-[#30D158]/40">
                        <span className="text-[#30D158] text-[10px] font-mono font-bold">2ms</span>
                      </div>
                    </div>

                    <motion.img
                      key={currentFrame.frame}
                      initial={{ opacity: 0.7 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      src={`data:image/jpeg;base64,${currentFrame.preview}`}
                      alt={`Frame ${currentFrame.frame}`}
                      className="absolute inset-0 h-full w-full object-contain"
                    />

                    {/* Animated bounding boxes */}
                    {currentFrame.detectionList?.slice(0, 5).map((d: any, i: number) => {
                      const conf = (d.confidence || 0) * 100
                      const color = conf >= 75 ? '#30D158' : conf >= 50 ? '#FF9F0A' : '#FF453A'
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1, duration: 0.4 }}
                          className="absolute rounded-lg border-2 z-10"
                          style={{
                            left: `${d.bbox?.[0] || 20}%`,
                            top: `${d.bbox?.[1] || 30}%`,
                            width: `${d.bbox?.[2] || 25}%`,
                            height: `${d.bbox?.[3] || 30}%`,
                            borderColor: color,
                            background: `linear-gradient(135deg, ${color}25, ${color}05)`,
                            boxShadow: `0 0 30px ${color}80, inset 0 0 20px ${color}30`,
                          }}
                        >
                          {/* Corner brackets */}
                          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 rounded-tl" style={{ borderColor: color }} />
                          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 rounded-tr" style={{ borderColor: color }} />
                          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 rounded-bl" style={{ borderColor: color }} />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 rounded-br" style={{ borderColor: color }} />

                          <div className="absolute -top-7 left-0 flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold text-white whitespace-nowrap shadow-lg"
                            style={{ background: color }}>
                            <span className="capitalize">{d.class}</span>
                            <span className="opacity-70">·</span>
                            <span className="font-mono">{conf.toFixed(0)}%</span>
                          </div>
                        </motion.div>
                      )
                    })}

                    {/* Bottom HUD */}
                    <div className="absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between gap-4">
                      <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-black/75 backdrop-blur-xl border border-white/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#30D158]" style={{ boxShadow: '0 0 8px #30D158' }} />
                        <span className="text-white text-[12px] font-semibold capitalize">objects detected</span>
                        <span className="text-white/60 text-[11px] font-mono">{currentFrame.detections}</span>
                      </div>
                      <div className="px-3.5 py-2 rounded-xl bg-black/75 backdrop-blur-xl border border-white/10">
                        <div className="text-[9px] font-bold tracking-[0.16em] text-white/40 uppercase mb-0.5">Output hash</div>
                        <div className="text-white/90 text-[10px] font-mono">0x8f3a…4b2c</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <Video size={48} className="text-white/20" />
                    <span className="text-[14px] text-white/40">No frames available</span>
                  </div>
                )}
              </div>

              {/* Thumbnails strip */}
              {frames.length > 1 && (
                <div className="border-t border-white/[0.06] p-5 bg-black/40">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                      Frame Timeline · {frames.length}
                    </div>
                    <div className="text-[10px] font-mono text-[#2DD4BF]">
                      {selectedFrameIdx + 1} / {frames.length}
                    </div>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {frames.map((f, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedFrameIdx(i)}
                        className={`shrink-0 overflow-hidden rounded-lg transition-all ${
                          selectedFrameIdx === i
                            ? 'ring-2 ring-[#2DD4BF] ring-offset-2 ring-offset-black'
                            : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={`data:image/jpeg;base64,${f.preview}`} alt={`Frame ${f.frame}`} className="h-14 w-20 object-cover" />
                        <div className="bg-black/60 px-1 py-0.5 text-center text-[10px] font-mono text-white/60">
                          #{f.frame}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* SIDEBAR */}
            <div className="space-y-5">
              {/* Detected classes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
                className="relative rounded-[24px] overflow-hidden"
                style={{
                  background: '#0A0A0F',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 20px 60px -15px rgba(0,0,0,0.4)',
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#0071E3] to-transparent" />
                <div className="p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="text-[16px] font-semibold tracking-[-0.015em] text-white">Detected Classes</h3>
                      <p className="mt-0.5 text-[11px] text-white/40">Aggregate across frames</p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0071E3]/15 border border-[#0071E3]/30">
                      <Eye size={14} className="text-[#0071E3]" strokeWidth={2.2} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {classList.length > 0 ? classList.slice(0, 6).map((c, i) => {
                      const total = classList.reduce((s, x) => s + x.count, 0) || 1
                      const pct = Math.round((c.count / total) * 100)
                      const colors = ['#2DD4BF', '#0071E3', '#AF52DE', '#FF9F0A', '#30D158', '#FF453A']
                      const color = colors[i % colors.length]
                      return (
                        <div key={c.name}>
                          <div className="mb-2 flex items-center justify-between text-[12.5px]">
                            <span className="font-semibold capitalize text-white/90">{c.name}</span>
                            <span className="font-mono text-white/50">{c.count} · {pct}%</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${pct}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.9, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                              className="h-full rounded-full"
                              style={{ background: `linear-gradient(90deg, ${color}, ${color}AA)`, boxShadow: `0 0 12px ${color}80` }}
                            />
                          </div>
                        </div>
                      )
                    }) : <div className="py-6 text-center text-[12px] text-white/30">No class data</div>}
                  </div>
                </div>
              </motion.div>

              {/* Current frame */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
                className="relative rounded-[24px] overflow-hidden"
                style={{
                  background: '#0A0A0F',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 20px 60px -15px rgba(0,0,0,0.4)',
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#AF52DE] to-transparent" />
                <div className="p-6">
                  <div className="mb-5">
                    <h3 className="text-[16px] font-semibold tracking-[-0.015em] text-white">Current Frame</h3>
                    <p className="mt-0.5 text-[11px] text-white/40">Object-level detections</p>
                  </div>
                  <div className="space-y-2">
                    {currentFrame?.detectionList && currentFrame.detectionList.length > 0 ? (
                      currentFrame.detectionList.map((d: any, i: number) => {
                        const conf = (d.confidence || 0) * 100
                        const color = conf >= 75 ? '#30D158' : conf >= 50 ? '#FF9F0A' : '#FF453A'
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }}
                            className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/[0.06] px-3.5 py-2.5"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="h-2 w-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                              <span className="text-[12.5px] font-semibold capitalize text-white/90">{d.class || 'Object'}</span>
                            </div>
                            <span className="font-mono text-[12.5px] font-bold tabular-nums" style={{ color }}>{conf.toFixed(1)}%</span>
                          </motion.div>
                        )
                      })
                    ) : (
                      <div className="py-6 text-center text-[12px] text-white/30">No detections in this frame</div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Telemetry */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}
                className="relative rounded-[24px] overflow-hidden"
                style={{
                  background: '#0A0A0F',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 20px 60px -15px rgba(0,0,0,0.4)',
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#2DD4BF] to-transparent" />
                <div className="p-6">
                  <div className="mb-5 flex items-center gap-2">
                    <Activity size={14} className="text-[#2DD4BF]" strokeWidth={2.2} />
                    <h3 className="text-[14px] font-semibold tracking-[-0.015em] text-white">Stream Telemetry</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      ['Inference latency', '2 ms', '#2DD4BF'],
                      ['Frame rate', '30 FPS', '#30D158'],
                      ['Resolution', '1280×720', '#0071E3'],
                      ['Camera ID', 'CAM-01', '#AF52DE'],
                    ].map(([l, v, c]) => (
                      <div key={l} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full" style={{ background: c, boxShadow: `0 0 6px ${c}` }} />
                          <span className="text-[12px] text-white/50">{l}</span>
                        </div>
                        <span className="font-mono text-[12px] font-semibold tabular-nums text-white/90">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BOTTOM CTA ===== */}
      <section className="relative bg-black py-40 px-6 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] rounded-full blur-[260px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #2DD4BF, transparent 55%)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[220px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0071E3, transparent 55%)' }}
        />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="w-[700px] h-[700px]"
          >
            <svg viewBox="0 0 700 700" className="w-full h-full">
              <circle cx="350" cy="350" r="330" fill="none" stroke="#2DD4BF" strokeWidth="1" strokeDasharray="4 8" opacity="0.25" />
            </svg>
          </motion.div>
        </div>

        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              left: `${15 + (i * 7) % 70}%`,
              top: `${25 + (i * 11) % 55}%`,
              background: i % 2 === 0 ? '#2DD4BF' : '#0071E3',
              boxShadow: `0 0 15px ${i % 2 === 0 ? '#2DD4BF' : '#0071E3'}`,
            }}
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.9, 0.2] }}
            transition={{ duration: 4 + (i % 3), repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1 }}
          className="relative max-w-[900px] mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl mb-10">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ boxShadow: '0 0 8px #2DD4BF' }}
            />
            <span className="text-white/80 text-[11px] font-semibold tracking-[0.16em] uppercase">
              Ready to stream
            </span>
          </div>

          <h2 className="text-[72px] md:text-[112px] font-semibold leading-[0.9] tracking-[-0.05em] text-white">
            Every frame,
            <br />
            <motion.span
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-block bg-gradient-to-r from-[#2DD4BF] via-[#10B981] via-[#30D158] to-[#2DD4BF] bg-clip-text text-transparent bg-[length:200%_100%]"
            >
              cryptographically bound.
            </motion.span>
          </h2>

          <p className="mt-10 text-[21px] leading-[1.5] tracking-[-0.015em] text-white/50 max-w-[520px] mx-auto">
            Detection overlays, class telemetry, and inference auditing — in real time.
          </p>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
            <a href="/upload" className="group relative inline-flex items-center gap-2 rounded-full bg-white text-black px-8 py-4 text-[15px] font-semibold tracking-[-0.01em] transition-all hover:scale-[1.03] overflow-hidden"
              style={{ boxShadow: '0 20px 60px -12px rgba(255,255,255,0.4)' }}>
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
              <span className="relative">Upload Video</span>
              <ArrowRight size={15} className="relative transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
            </a>
            <a href="/xai" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] backdrop-blur-xl text-white px-8 py-4 text-[15px] font-medium tracking-[-0.01em] transition-all hover:bg-white/[0.08]">
              View XAI
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

export default VideoAnalysis
