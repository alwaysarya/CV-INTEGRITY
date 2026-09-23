import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Video, Camera, Loader2, RefreshCw, Target, Activity, AlertCircle, Play, Image as ImageIcon } from 'lucide-react'
import axios from 'axios'
import { notify } from '@/lib/toast'

const API = 'http://localhost:8000'

interface Video {
  name: string
  path: string
  size_mb: number
}

interface FrameResult {
  frame: number
  timestamp: number
  detections: Array<{ class: string; confidence: number; bbox: number[] }>
  count: number
  preview: string
}

interface AnalysisResult {
  status: string
  video: {
    name: string
    path: string
    total_frames: number
    fps: number
    resolution: string
    duration: number
  }
  analysis: {
    frames_analyzed: number
    confidence_threshold: number
    model: string
  }
  results: {
    total_detections: number
    class_distribution: Record<string, number>
    avg_detections_per_frame: number
    detection_rate: number
  }
  frames: FrameResult[]
}

export function VideoAnalysis() {
  const [videos, setVideos] = useState<Video[]>([])
  const [selectedVideo, setSelectedVideo] = useState<string>('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    loadVideos()
  }, [])

  const loadVideos = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/video/videos`)
      const list = res.data.videos || []
      setVideos(list)
      if (list.length > 0 && !selectedVideo) {
        setSelectedVideo(list[0].name)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const runAnalysis = async () => {
    setAnalyzing(true)
    try {
      notify.info('Analyzing video...', 'Running YOLOv8n inference')
      const res = await axios.post(`${API}/api/video/analyze`, {
        video_name: selectedVideo || undefined,
        num_frames: 5,
        confidence: 0.25,
      }, {
        timeout: 120000,  // 2 minutes timeout for YOLO inference
      })
      if (res.data.status === 'success') {
        setResult(res.data)
        notify.success('Analysis complete!', `${res.data.results.total_detections} detections`)
      } else {
        notify.error('Analysis failed', res.data.error)
      }
    } catch (err: any) {
      notify.error('Error', err.message)
    } finally {
      setAnalyzing(false)
    }
  }

  const stats = result ? {
    detections: result.results.total_detections,
    frames: `${result.analysis.frames_analyzed}/${result.video.total_frames}`,
    rate: `${result.results.detection_rate}%`,
    avg: result.results.avg_detections_per_frame,
  } : { detections: 0, frames: '0/0', rate: '0%', avg: 0 }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-1">Video Analysis</h1>
          <p className="text-gray-400 text-sm">
            Real YOLOv8n inference on video frames
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedVideo}
            onChange={(e) => setSelectedVideo(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/5 border border-cyan-500/20 text-white text-sm"
          >
            {videos.map((v) => (
              <option key={v.name} value={v.name}>{v.name}</option>
            ))}
          </select>
          <button
            onClick={runAnalysis}
            disabled={analyzing || !selectedVideo}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium disabled:opacity-50 hover-scale"
          >
            {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            {analyzing ? 'Analyzing...' : 'Analyze Video'}
          </button>
          <button onClick={loadVideos} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-sm">
            <RefreshCw size={16} />
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Detections', value: stats.detections, color: '#38BDF8', icon: Target },
          { label: 'Frames Analyzed', value: stats.frames, color: '#10B981', icon: Video },
          { label: 'Detection Rate', value: stats.rate, color: '#F59E0B', icon: Activity },
          { label: 'Avg/Frame', value: stats.avg, color: '#8B5CF6', icon: Camera },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }}>
              <Card className="liquid-glass specular border-0 p-5 hover-lift">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${stat.color}20`, border: `1px solid ${stat.color}40` }}>
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <div className="text-white text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-gray-400 text-xs">{stat.label}</div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {analyzing && !result ? (
        <Card className="liquid-glass border-0 p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-cyan-400 mb-4" size={48} />
            <span className="text-gray-400">Running YOLOv8n inference...</span>
            <span className="text-gray-500 text-xs mt-2">Analyzing {5} frames from video</span>
          </div>
        </Card>
      ) : result ? (
        <>
          {/* Video Info */}
          <Card className="liquid-glass border-0 p-5">
            <div className="mb-4">
              <h3 className="text-white font-bold text-sm">VIDEO INFORMATION</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Name</div>
                <div className="text-white text-xs font-bold">{result.video.name}</div>
              </div>
              <div>
                <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Resolution</div>
                <div className="text-white text-xs font-bold">{result.video.resolution}</div>
              </div>
              <div>
                <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Duration</div>
                <div className="text-white text-xs font-bold">{result.video.duration}s</div>
              </div>
              <div>
                <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">FPS</div>
                <div className="text-white text-xs font-bold">{result.video.fps}</div>
              </div>
              <div>
                <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Model</div>
                <div className="text-white text-xs font-bold">{result.analysis.model}</div>
              </div>
            </div>
          </Card>

          {/* Frame Grid with Detections */}
          <Card className="liquid-glass border-0 p-5">
            <div className="mb-4">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <ImageIcon size={14} className="text-cyan-400" />
                FRAME ANALYSIS WITH YOLO DETECTIONS
              </h3>
              <p className="text-gray-500 text-xs mt-0.5">
                {result.frames.length} frames analyzed with bounding boxes
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.frames.map((frame, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="rounded-xl overflow-hidden border border-cyan-500/20 bg-black/30"
                >
                  <div className="relative">
                    <img
                      src={`data:image/jpeg;base64,${frame.preview}`}
                      alt={`Frame ${frame.frame}`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <Badge className="bg-black/70 text-white border-white/20 text-[10px] gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        #{frame.frame}
                      </Badge>
                      <Badge className="bg-cyan-500/70 text-white border-cyan-400/40 text-[10px]">
                        {frame.timestamp}s
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-500/80 text-white border-green-400/40 text-[10px]">
                        {frame.count} detections
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3">
                    {Object.entries(frame.class_counts).length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(frame.class_counts).map(([cls, cnt]) => (
                          <Badge key={cls} className="text-[9px] py-0.5 px-1.5 bg-cyan-500/20 text-cyan-400 border-cyan-500/40">
                            {cls}: {cnt}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-[10px]">No detections in this frame</div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Class Distribution */}
          {Object.keys(result.results.class_distribution).length > 0 && (
            <Card className="liquid-glass border-0 p-5">
              <div className="mb-4">
                <h3 className="text-white font-bold text-sm">CLASS DISTRIBUTION</h3>
                <p className="text-gray-500 text-xs mt-0.5">Detected object classes</p>
              </div>
              <div className="space-y-3">
                {Object.entries(result.results.class_distribution).map(([cls, count], i) => {
                  const max = Math.max(...Object.values(result.results.class_distribution))
                  const pct = (count / max) * 100
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-xs font-medium capitalize">{cls}</span>
                        <span className="text-cyan-400 text-xs font-bold">{count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full" style={{
                          width: `${pct}%`,
                          background: 'linear-gradient(90deg, #38BDF8, #8B5CF6)',
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
        </>
      ) : (
        <Card className="liquid-glass border-0 p-12">
          <div className="text-center">
            <Video size={64} className="text-gray-600 mx-auto mb-4" />
            <div className="text-white text-lg font-bold mb-2">No video analyzed yet</div>
            <div className="text-gray-400 text-sm mb-4">Select a video and click "Analyze Video"</div>
            {videos.length === 0 && (
              <div className="text-yellow-400 text-xs">
                ⚠️ No videos found in datasets/videos/
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
