import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Video, Camera, Loader2, Maximize2 } from 'lucide-react'
import axios from 'axios'

const API = 'http://localhost:8000'

interface Thumbnail {
  index: number
  frame: number
  preview: string
  detections: number
  class_counts: Record<string, number>
}

export function LiveVideoFeed() {
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => { loadThumbnails() }, [])

  const loadThumbnails = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/video/thumbnails`)
      setThumbnails(res.data.thumbnails || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const active = thumbnails[activeIdx]

  return (
    <Card className="glass-card border-cyan-500/20 p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Video size={14} className="text-green-400" /> LIVE VIDEO FEED
          </h3>
          <p className="text-gray-500 text-xs mt-0.5">Real frames from test_video.mp4</p>
        </div>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/40 text-[10px]">
          <Camera size={10} className="mr-1" /> {thumbnails.length} Frames
        </Badge>
      </div>

      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-cyan-500/30 mb-3">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
          </div>
        ) : active ? (
          <>
            <img
              src={`data:image/jpeg;base64,${active.preview}`}
              alt={`Frame ${active.frame}`}
              className="w-full h-full object-cover"
            />
            {/* Camera info */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <Badge className="bg-black/70 text-white border-white/20 text-[10px] gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                CAM-01
              </Badge>
              <span className="text-white text-xs">Koramangala</span>
            </div>
            {/* Time */}
            <div className="absolute top-3 right-3">
              <Badge className="bg-black/70 text-cyan-400 border-cyan-500/30 text-[10px] font-mono">
                Frame #{active.frame}
              </Badge>
            </div>
            {/* Detections */}
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-black/70 text-green-400 border-green-500/30 text-[10px]">
                <Camera size={10} className="mr-1" /> {active.detections} detections
              </Badge>
            </div>
            {/* Maximize */}
            <button className="absolute bottom-3 right-3 w-8 h-8 rounded-lg bg-black/70 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Maximize2 size={14} />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
            No frames available
          </div>
        )}
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-2">
        {thumbnails.map((thumb, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className={`relative aspect-video rounded-lg overflow-hidden transition-all ${
              i === activeIdx ? 'border-2 border-cyan-400' : 'border border-cyan-500/20 hover:border-cyan-500/40'
            }`}
          >
            <img
              src={`data:image/jpeg;base64,${thumb.preview}`}
              alt={`Thumb ${i}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-1 left-1 text-[8px] text-white font-medium bg-black/70 px-1 rounded">
              #{thumb.frame}
            </div>
          </button>
        ))}
      </div>
    </Card>
  )
}
