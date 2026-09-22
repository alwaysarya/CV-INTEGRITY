import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Video, Camera, Play, Maximize2, Activity, Eye, Clock, Target } from 'lucide-react'

interface VideoFeed {
  id: string
  name: string
  location: string
  status: 'Live' | 'Offline' | 'Recording'
  detections: number
  fps: number
}

const feeds: VideoFeed[] = [
  { id: 'CAM-01', name: 'Main Entrance', location: 'Bengaluru HQ', status: 'Live', detections: 12, fps: 30 },
  { id: 'CAM-02', name: 'Parking Lot', location: 'Bengaluru HQ', status: 'Live', detections: 8, fps: 30 },
  { id: 'CAM-03', name: 'Server Room', location: 'Bengaluru HQ', status: 'Recording', detections: 3, fps: 25 },
  { id: 'CAM-04', name: 'Reception', location: 'Bengaluru HQ', status: 'Live', detections: 15, fps: 30 },
  { id: 'CAM-05', name: 'Warehouse', location: 'Electronic City', status: 'Offline', detections: 0, fps: 0 },
  { id: 'CAM-06', name: 'Perimeter', location: 'Electronic City', status: 'Live', detections: 22, fps: 30 },
]

const statusColors = {
  Live: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.4)' },
  Recording: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' },
  Offline: { bg: 'rgba(107, 114, 128, 0.15)', text: '#9CA3AF', border: 'rgba(107, 114, 128, 0.4)' },
}

export function VideoAnalysis() {
  const [activeCam, setActiveCam] = useState(feeds[0])

  const stats = {
    totalCams: feeds.length,
    live: feeds.filter((f) => f.status === 'Live').length,
    totalDetections: feeds.reduce((sum, f) => sum + f.detections, 0),
    avgFps: Math.round(feeds.reduce((sum, f) => sum + f.fps, 0) / feeds.length),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Video Analysis</h1>
          <p className="text-gray-400 text-sm">AI-powered object detection across camera feeds</p>
        </div>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/40 gap-1.5 py-2 px-3">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          {stats.live} Live Cameras
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Cameras', value: stats.totalCams, color: '#38BDF8', icon: Camera },
          { label: 'Live Feeds', value: stats.live, color: '#10B981', icon: Video },
          { label: 'Total Detections', value: stats.totalDetections, color: '#8B5CF6', icon: Target },
          { label: 'Avg FPS', value: stats.avgFps, color: '#F59E0B', icon: Activity },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="glass-card p-5 border-cyan-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}20`, border: `1px solid ${stat.color}40` }}>
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
              </div>
              <div className="text-white text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-gray-400 text-xs">{stat.label}</div>
            </Card>
          )
        })}
      </div>

      {/* Main Video Player */}
      <Card className="glass-card border-cyan-500/20 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: statusColors[activeCam.status].bg, color: statusColors[activeCam.status].text, border: `1px solid ${statusColors[activeCam.status].border}` }}>
              ● {activeCam.status}
            </Badge>
            <h3 className="text-white font-bold text-sm">{activeCam.id} — {activeCam.name}</h3>
            <span className="text-gray-500 text-xs">• {activeCam.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/40 text-[10px]">
              {activeCam.fps} FPS
            </Badge>
            <button className="p-1.5 rounded hover:bg-cyan-500/10 text-gray-400 hover:text-cyan-400 transition-colors">
              <Maximize2 size={14} />
            </button>
          </div>
        </div>

        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-cyan-500/30 bg-black">
          {/* Simulated video background */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1a1f2e 0%, #0a0f1e 50%, #1a1f2e 100%)' }} />

          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.2) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }} />

          {/* Silhouettes */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice">
            <ellipse cx="250" cy="280" rx="20" ry="25" fill="#1a1a1a" />
            <ellipse cx="320" cy="290" rx="22" ry="27" fill="#1a1a1a" />
            <ellipse cx="420" cy="280" rx="20" ry="25" fill="#1a1a1a" />
            <ellipse cx="580" cy="290" rx="22" ry="27" fill="#1a1a1a" />
          </svg>

          {/* Detection Boxes */}
          {[
            { x: '30%', y: '55%', label: 'Person 94%' },
            { x: '38%', y: '58%', label: 'Person 87%' },
            { x: '50%', y: '55%', label: 'Person 91%' },
            { x: '70%', y: '58%', label: 'Vehicle 88%' },
          ].map((det, i) => (
            <div
              key={i}
              className="absolute border-2 border-cyan-400 rounded"
              style={{
                left: det.x,
                top: det.y,
                width: '60px',
                height: '90px',
                boxShadow: '0 0 15px rgba(56, 189, 248, 0.6)',
              }}
            >
              <div className="absolute -top-5 left-0 bg-cyan-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                {det.label}
              </div>
            </div>
          ))}

          {/* LIVE Badge */}
          {activeCam.status === 'Live' && (
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 backdrop-blur">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 text-xs font-bold tracking-wider">LIVE</span>
            </div>
          )}

          {/* Time */}
          <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur border border-cyan-500/30">
            <span className="text-cyan-400 text-xs font-mono">{new Date().toLocaleTimeString()}</span>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <Badge className="bg-black/70 text-green-400 border-green-500/30 text-[10px] gap-1">
              <Target size={10} />
              {activeCam.detections} detections
            </Badge>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg bg-black/70 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-colors">
                <Play size={14} />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Camera Grid */}
      <Card className="glass-card border-cyan-500/20 p-5">
        <div className="mb-4">
          <h3 className="text-white font-bold text-sm">ALL CAMERAS</h3>
          <p className="text-gray-500 text-xs mt-0.5">Click to switch feed</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {feeds.map((feed) => {
            const colors = statusColors[feed.status]
            const isActive = activeCam.id === feed.id
            return (
              <button
                key={feed.id}
                onClick={() => setActiveCam(feed)}
                className={`relative aspect-video rounded-lg overflow-hidden transition-all ${
                  isActive ? 'border-2 border-cyan-400 shadow-lg shadow-cyan-500/30' : 'border border-cyan-500/20 hover:border-cyan-500/40'
                }`}
                style={{ background: 'linear-gradient(135deg, #1a1f2e, #0a0f1e)' }}
              >
                {/* Mini grid */}
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: `linear-gradient(rgba(56, 189, 248, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.3) 1px, transparent 1px)`,
                  backgroundSize: '10px 10px',
                }} />

                {/* Live dot */}
                {feed.status === 'Live' && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}

                {/* Label */}
                <div className="absolute bottom-1 left-1 text-[9px] text-white font-bold bg-black/70 px-1.5 py-0.5 rounded">
                  {feed.id}
                </div>

                {/* Detections */}
                {feed.detections > 0 && (
                  <div className="absolute top-1 left-1 text-[8px] text-green-400 font-bold bg-black/70 px-1.5 py-0.5 rounded">
                    {feed.detections}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </Card>

      {/* Camera Table */}
      <Card className="glass-card border-cyan-500/20 p-5">
        <div className="mb-4">
          <h3 className="text-white font-bold text-sm">CAMERA DETAILS</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyan-500/10">
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Camera</th>
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Name</th>
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Location</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Detections</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">FPS</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Status</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {feeds.map((feed) => {
                const colors = statusColors[feed.status]
                return (
                  <tr key={feed.id} className="border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                          <Camera size={14} className="text-cyan-400" />
                        </div>
                        <div className="text-white text-xs font-bold">{feed.id}</div>
                      </div>
                    </td>
                    <td className="py-3"><div className="text-gray-300 text-xs">{feed.name}</div></td>
                    <td className="py-3"><div className="text-gray-400 text-xs">{feed.location}</div></td>
                    <td className="py-3 text-right"><div className="text-green-400 text-xs font-mono">{feed.detections}</div></td>
                    <td className="py-3 text-right"><div className="text-gray-300 text-xs font-mono">{feed.fps}</div></td>
                    <td className="py-3 text-right">
                      <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                        ● {feed.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <button className="p-1.5 rounded hover:bg-cyan-500/10 text-gray-400 hover:text-cyan-400 transition-colors">
                        <Eye size={12} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
