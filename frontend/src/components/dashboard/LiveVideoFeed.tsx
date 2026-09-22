import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Video, Camera, Maximize2, ChevronRight } from 'lucide-react'

interface Camera {
  id: string
  name: string
  location: string
  time: string
  detections: number
  isLive: boolean
}

const cameras: Camera[] = [
  { id: 'CAM-04', name: 'Camera 04', location: 'Koramangala', time: '14:28:17', detections: 3, isLive: true },
  { id: 'CAM-01', name: 'Camera 01', location: 'MG Road', time: '14:28:15', detections: 1, isLive: true },
  { id: 'CAM-02', name: 'Camera 02', location: 'Indiranagar', time: '14:28:12', detections: 2, isLive: true },
  { id: 'CAM-03', name: 'Camera 03', location: 'HSR Layout', time: '14:28:10', detections: 0, isLive: true },
]

export function LiveVideoFeed() {
  const [activeCamera, setActiveCamera] = useState(0)

  const active = cameras[activeCamera]

  return (
    <Card className="glass-card border-cyan-500/20 p-5 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Video size={14} className="text-green-400" />
            LIVE VIDEO FEED
          </h3>
          <p className="text-gray-500 text-xs mt-0.5">AI-powered surveillance</p>
        </div>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/40 gap-1 text-xs">
          <Camera size={10} />
          12 Live Cameras
        </Badge>
      </div>

      {/* Main Video Feed */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-cyan-500/30 mb-3">
        {/* Simulated video background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #1a1f2e 0%, #0a0f1e 50%, #1a1f2e 100%)',
          }}
        />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(16, 185, 129, 0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16, 185, 129, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px',
          }}
        />

        {/* "Video" content simulation — silhouettes */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 225">
          {/* Ground */}
          <rect x="0" y="160" width="400" height="65" fill="#0a0a0a" opacity="0.5" />
          {/* Person silhouettes */}
          <ellipse cx="120" cy="130" rx="8" ry="10" fill="#1a1a1a" />
          <ellipse cx="160" cy="135" rx="9" ry="11" fill="#1a1a1a" />
          <ellipse cx="220" cy="130" rx="8" ry="10" fill="#1a1a1a" />
          <ellipse cx="280" cy="135" rx="9" ry="11" fill="#1a1a1a" />
        </svg>

        {/* AI Detection Boxes */}
        <div className="absolute top-[45%] left-[25%] w-14 h-20 border-2 border-cyan-400 rounded"
          style={{ boxShadow: '0 0 10px rgba(56, 189, 248, 0.5)' }}>
          <div className="absolute -top-5 left-0 bg-cyan-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded">
            Person 92%
          </div>
        </div>
        <div className="absolute top-[48%] left-[38%] w-14 h-20 border-2 border-cyan-400 rounded"
          style={{ boxShadow: '0 0 10px rgba(56, 189, 248, 0.5)' }}>
          <div className="absolute -top-5 left-0 bg-cyan-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded">
            Person 87%
          </div>
        </div>
        <div className="absolute top-[45%] left-[52%] w-14 h-20 border-2 border-cyan-400 rounded"
          style={{ boxShadow: '0 0 10px rgba(56, 189, 248, 0.5)' }}>
          <div className="absolute -top-5 left-0 bg-cyan-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded">
            Person 94%
          </div>
        </div>

        {/* Camera Info Overlay — Top */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <Badge className="bg-black/70 text-white border-white/20 text-[10px] gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {active.id}
          </Badge>
          <span className="text-white text-xs font-medium">{active.location}</span>
        </div>

        {/* Time Overlay — Top Right */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-black/70 text-cyan-400 border-cyan-500/30 text-[10px] font-mono">
            {active.time}
          </Badge>
        </div>

        {/* Detection Count Overlay — Bottom Left */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <Badge className="bg-black/70 text-green-400 border-green-500/30 text-[10px] gap-1">
            <Camera size={10} />
            {active.detections} detections
          </Badge>
        </div>

        {/* Maximize Button — Bottom Right */}
        <button className="absolute bottom-3 right-3 w-8 h-8 rounded-lg bg-black/70 border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20">
          <Maximize2 size={14} />
        </button>
      </div>

      {/* Camera Thumbnails */}
      <div className="grid grid-cols-4 gap-2">
        {cameras.map((cam, i) => (
          <button
            key={cam.id}
            onClick={() => setActiveCamera(i)}
            className={`relative aspect-video rounded-lg overflow-hidden transition-all ${
              i === activeCamera
                ? 'border-2 border-cyan-400 shadow-lg shadow-cyan-500/30'
                : 'border border-cyan-500/20 hover:border-cyan-500/40'
            }`}
            style={{ background: 'linear-gradient(135deg, #1a1f2e, #0a0f1e)' }}
          >
            {/* Mini silhouette */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 56">
              <ellipse cx="30" cy="35" rx="4" ry="5" fill="#2a2a2a" />
              <ellipse cx="50" cy="37" rx="4" ry="5" fill="#2a2a2a" />
              <ellipse cx="70" cy="35" rx="4" ry="5" fill="#2a2a2a" />
            </svg>
            {/* Mini detection */}
            <div className="absolute top-[35%] left-[25%] w-4 h-6 border border-cyan-400 rounded-sm" />

            {/* Label */}
            <div className="absolute bottom-1 left-1 text-[8px] text-white font-medium bg-black/70 px-1 rounded">
              {cam.id}
            </div>

            {/* Live indicator */}
            {i === activeCamera && (
              <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-cyan-500/10 flex items-center justify-between">
        <div className="text-gray-500 text-[10px]">
          Showing camera {activeCamera + 1} of {cameras.length}
        </div>
        <button className="text-cyan-400 text-[10px] hover:text-cyan-300 flex items-center gap-0.5">
          View All Cameras <ChevronRight size={10} />
        </button>
      </div>
    </Card>
  )
}
