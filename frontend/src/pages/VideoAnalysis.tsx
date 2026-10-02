import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Video, Camera, Loader2, RefreshCw, Target, Activity, Play, Film, Zap } from 'lucide-react'
import axios from 'axios'
import { notify } from '@/lib/toast'

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
  const [autoPlay, setAutoPlay] = useState(true)

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

  // Aggregate class counts
  const aggClasses: Record<string, number> = {}
  frames.forEach((f) => {
    Object.entries(f.classCounts).forEach(([k, v]) => {
      aggClasses[k] = (aggClasses[k] || 0) + (v as number)
    })
  })
  const totalDetections = frames.reduce((s, f) => s + f.detections, 0)
  const allDetections = frames.flatMap((f) => f.detectionList)
  const avgConfidence = allDetections.length
    ? (allDetections.reduce((s, d) => s + (d.confidence || 0), 0) / allDetections.length * 100).toFixed(1)
    : '0'

  return (
    <div className="min-h-screen p-6" style={{ background: '#08080C', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Top header */}
      <div className="flex items-center justify-between mb-6 pb-4"
        style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center"
            style={{ background: 'rgba(94, 234, 212, 0.1)', border: '1px solid rgba(94, 234, 212, 0.4)' }}>
            <Video size={14} style={{ color: '#5EEAD4' }} />
          </div>
          <div>
            <div className="text-[13px] font-bold tracking-[0.2em]" style={{ color: '#5EEAD4' }}>VIDEO_ANALYSIS</div>
            <div className="text-[9px] tracking-[0.2em]" style={{ color: '#5EEAD4', opacity: 0.5 }}>FRAME_INFERENCE · YOLO_DETECTIONS</div>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setAutoPlay(!autoPlay)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono tracking-wider"
            style={{
              background: autoPlay ? 'rgba(94, 234, 212, 0.15)' : 'rgba(94, 234, 212, 0.05)',
              border: `1px solid ${autoPlay ? 'rgba(94, 234, 212, 0.5)' : 'rgba(94, 234, 212, 0.2)'}`,
              color: '#5EEAD4',
            }}>
            {autoPlay ? '● AUTOPLAY' : '○ AUTOPLAY'}
          </button>
          <button onClick={loadFrames}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono tracking-wider"
            style={{ background: 'rgba(94, 234, 212, 0.08)', border: '1px solid rgba(94, 234, 212, 0.3)', color: '#5EEAD4' }}>
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            REFRESH
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'TOTAL_FRAMES', value: frames.length, icon: Film, color: '#3A7D8F' },
          { label: 'TOTAL_DETECTIONS', value: totalDetections, icon: Target, color: '#5EEAD4' },
          { label: 'CLASS_TYPES', value: Object.keys(aggClasses).length, icon: Activity, color: '#A78BFA' },
          { label: 'AVG_CONFIDENCE', value: `${avgConfidence}%`, icon: Zap, color: '#FBBF24' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="p-4 rounded"
              style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono tracking-[0.2em]" style={{ color: '#5EEAD4', opacity: 0.5 }}>{s.label}</span>
                <Icon size={14} style={{ color: s.color, opacity: 0.7 }} />
              </div>
              <div className="text-[28px] font-bold font-mono leading-none" style={{ color: s.color }}>{s.value}</div>
            </div>
          )
        })}
      </div>

      {/* Main content: Frame viewer + Side data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">

        {/* Frame Viewer */}
        <div className="lg:col-span-2 p-5 rounded"
          style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[11px] font-mono tracking-[0.2em]" style={{ color: '#5EEAD4' }}>
              FRAME_{currentFrame?.frame ?? 0}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>
                {selectedFrameIdx + 1} / {frames.length}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
              <Loader2 className="animate-spin" size={32} style={{ color: '#5EEAD4' }} />
            </div>
          ) : currentFrame ? (
            <div className="relative rounded overflow-hidden"
              style={{ aspectRatio: '4/3', background: '#050810', border: '1px solid rgba(94, 234, 212, 0.3)' }}>

              {/* Video frame image */}
              <img
                src={`data:image/jpeg;base64,${currentFrame.preview}`}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Grid overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.08]"
                style={{
                  backgroundImage: 'linear-gradient(#5EEAD4 1px, transparent 1px), linear-gradient(90deg, #5EEAD4 1px, transparent 1px)',
                  backgroundSize: '60px 60px',
                }} />

              {/* Corner brackets */}
              <div className="absolute top-3 left-3 w-5 h-5 pointer-events-none" style={{ borderTop: '2px solid #5EEAD4', borderLeft: '2px solid #5EEAD4' }} />
              <div className="absolute top-3 right-3 w-5 h-5 pointer-events-none" style={{ borderTop: '2px solid #5EEAD4', borderRight: '2px solid #5EEAD4' }} />
              <div className="absolute bottom-3 left-3 w-5 h-5 pointer-events-none" style={{ borderBottom: '2px solid #5EEAD4', borderLeft: '2px solid #5EEAD4' }} />
              <div className="absolute bottom-3 right-3 w-5 h-5 pointer-events-none" style={{ borderBottom: '2px solid #5EEAD4', borderRight: '2px solid #5EEAD4' }} />

              {/* Real detection bboxes */}
              {currentFrame.detectionList.map((d: any, i: number) => {
                if (!d.bbox) return null
                const [x1, y1, x2, y2] = d.bbox
                const left = (x1 / 640) * 100
                const top = (y1 / 480) * 100
                const width = ((x2 - x1) / 640) * 100
                const height = ((y2 - y1) / 480) * 100
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.2 }}
                    className="absolute pointer-events-none"
                    style={{
                      left: `${left}%`, top: `${top}%`,
                      width: `${width}%`, height: `${height}%`,
                      border: '2px solid #5EEAD4',
                      boxShadow: '0 0 16px rgba(94, 234, 212, 0.7)',
                      background: 'rgba(94, 234, 212, 0.06)',
                    }}>
                    <div className="absolute -top-5 left-0 px-2 py-0.5 rounded text-[9px] font-mono font-bold whitespace-nowrap"
                      style={{ background: '#5EEAD4', color: '#08080C' }}>
                      {d.class.toUpperCase()} · {(d.confidence * 100).toFixed(1)}%
                    </div>
                    <div className="absolute -top-1 -left-1 w-2 h-2" style={{ background: '#5EEAD4' }} />
                    <div className="absolute -top-1 -right-1 w-2 h-2" style={{ background: '#5EEAD4' }} />
                    <div className="absolute -bottom-1 -left-1 w-2 h-2" style={{ background: '#5EEAD4' }} />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2" style={{ background: '#5EEAD4' }} />
                  </motion.div>
                )
              })}

              {/* Top status */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded"
                style={{ background: 'rgba(0, 0, 0, 0.7)' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#F87171' }} />
                <span className="text-[9px] font-mono tracking-wider" style={{ color: '#F87171' }}>REC</span>
                <span className="text-[9px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>·</span>
                <span className="text-[9px] font-mono" style={{ color: '#5EEAD4' }}>CAM-01</span>
              </div>

              {/* Bottom info */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div className="px-2 py-1 rounded text-[9px] font-mono"
                  style={{ background: 'rgba(0, 0, 0, 0.8)', color: '#5EEAD4', border: '1px solid rgba(94, 234, 212, 0.4)' }}>
                  {currentFrame.detections} OBJECTS
                </div>
                <div className="px-2 py-1 rounded text-[9px] font-mono"
                  style={{ background: 'rgba(0, 0, 0, 0.8)', color: '#5EEAD4', border: '1px solid rgba(94, 234, 212, 0.4)' }}>
                  FRAME_{currentFrame.frame}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16" style={{ aspectRatio: '16/9' }}>
              <Camera size={48} style={{ color: '#5EEAD4', opacity: 0.3 }} />
              <span className="text-[11px] font-mono mt-3" style={{ color: '#5EEAD4', opacity: 0.5 }}>NO FRAMES AVAILABLE</span>
            </div>
          )}

          {/* Timeline scrubber */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono tracking-wider" style={{ color: '#5EEAD4', opacity: 0.5 }}>TIMELINE</span>
              <span className="text-[10px] font-mono" style={{ color: '#5EEAD4' }}>Frame {selectedFrameIdx + 1} of {frames.length}</span>
            </div>
            <input
              type="range"
              min="0"
              max={Math.max(frames.length - 1, 0)}
              value={selectedFrameIdx}
              onChange={(e) => { setSelectedFrameIdx(Number(e.target.value)); setAutoPlay(false) }}
              className="w-full accent-[#5EEAD4]"
            />
          </div>
        </div>

        {/* Right: Class counts + detection list */}
        <div className="space-y-4">
          {/* Class distribution */}
          <div className="p-5 rounded"
            style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
            <div className="text-[10px] font-mono tracking-[0.2em] mb-3" style={{ color: '#5EEAD4', opacity: 0.6 }}>CLASS_DISTRIBUTION</div>
            <div className="space-y-2.5">
              {Object.entries(aggClasses).map(([name, count], i) => {
                const pct = totalDetections > 0 ? Math.round((count as number) / totalDetections * 100) : 0
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-mono capitalize" style={{ color: '#FFFFFF', opacity: 0.9 }}>{name}</span>
                      <span className="text-[10px] font-mono" style={{ color: '#5EEAD4' }}>{count as number} ({pct}%)</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(94, 234, 212, 0.1)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #5EEAD4, #38BDF8)', boxShadow: '0 0 6px #5EEAD4' }}
                      />
                    </div>
                  </div>
                )
              })}
              {Object.keys(aggClasses).length === 0 && (
                <div className="text-[10px] font-mono text-center py-3" style={{ color: '#5EEAD4', opacity: 0.4 }}>
                  NO CLASSES DETECTED
                </div>
              )}
            </div>
          </div>

          {/* Current frame detections */}
          <div className="p-5 rounded"
            style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
            <div className="text-[10px] font-mono tracking-[0.2em] mb-3" style={{ color: '#5EEAD4', opacity: 0.6 }}>CURRENT_FRAME_DETECTIONS</div>
            <div className="space-y-2">
              {currentFrame?.detectionList.map((d: any, i: number) => (
                <div key={i} className="p-2.5 rounded flex items-center justify-between"
                  style={{ background: 'rgba(0, 0, 0, 0.3)', borderLeft: '2px solid #5EEAD4' }}>
                  <div>
                    <div className="text-[11px] font-mono font-bold capitalize" style={{ color: '#FFFFFF' }}>
                      {d.class}
                    </div>
                    <div className="text-[9px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>
                      bbox: [{d.bbox?.map((v: number) => v.toFixed(0)).join(', ') || 'N/A'}]
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold" style={{ color: '#5EEAD4' }}>
                    {(d.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
              {(!currentFrame?.detectionList || currentFrame.detectionList.length === 0) && (
                <div className="text-[10px] font-mono text-center py-3" style={{ color: '#5EEAD4', opacity: 0.4 }}>
                  NO DETECTIONS IN THIS FRAME
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Frame thumbnails row */}
      <div className="p-5 rounded"
        style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
        <div className="text-[10px] font-mono tracking-[0.2em] mb-3" style={{ color: '#5EEAD4', opacity: 0.6 }}>ALL_FRAMES</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {frames.map((f, i) => (
            <motion.div
              key={i}
              onClick={() => { setSelectedFrameIdx(i); setAutoPlay(false) }}
              whileHover={{ scale: 1.03 }}
              className="relative rounded overflow-hidden cursor-pointer transition-all"
              style={{
                aspectRatio: '16/9',
                border: selectedFrameIdx === i ? '2px solid #5EEAD4' : '1px solid rgba(94, 234, 212, 0.2)',
                boxShadow: selectedFrameIdx === i ? '0 0 12px rgba(94, 234, 212, 0.5)' : 'none',
              }}>
              <img src={`data:image/jpeg;base64,${f.preview}`} alt="" className="w-full h-full object-cover" />
              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8px] font-mono"
                style={{ background: 'rgba(0, 0, 0, 0.8)', color: '#5EEAD4' }}>
                #{f.frame}
              </div>
              <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold"
                style={{ background: '#5EEAD4', color: '#08080C' }}>
                {f.detections}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
