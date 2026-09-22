import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { MapPin, Users, Car, Plane, Search, Plus, Minus, Layers } from 'lucide-react'

interface MapMarker {
  id: string
  type: 'people' | 'vehicles' | 'drone' | 'activity'
  x: number
  y: number
  label: string
  count?: number
  color: string
}

const markers: MapMarker[] = [
  { id: '1', type: 'activity', x: 30, y: 25, label: 'High Activity', color: '#EF4444' },
  { id: '2', type: 'people', x: 45, y: 40, label: '23 People', count: 23, color: '#38BDF8' },
  { id: '3', type: 'vehicles', x: 35, y: 55, label: '7 Vehicles', count: 7, color: '#10B981' },
  { id: '4', type: 'drone', x: 60, y: 65, label: 'Drone', color: '#F59E0B' },
]

export function LiveMap() {
  const [filters, setFilters] = useState({
    people: true,
    vehicles: true,
    drones: true,
    suspicious: true,
    cctv: true,
    heatmap: true,
  })

  return (
    <Card className="glass-card border-cyan-500/20 p-5 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            LIVE SITUATIONAL MAP
          </h3>
          <p className="text-gray-500 text-xs mt-0.5">Real-time tracking and detection across zones</p>
        </div>
        <button className="text-gray-500 hover:text-white">
          <Layers size={16} />
        </button>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-80 rounded-xl overflow-hidden bg-[#0a0f1e] border border-cyan-500/20">
        {/* Grid Background */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(56, 189, 248, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Fake Roads */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.4 }}>
          <path d="M 0 200 Q 200 150 400 200 T 800 180" stroke="#1e3a5f" strokeWidth="2" fill="none" />
          <path d="M 150 0 Q 200 150 250 400" stroke="#1e3a5f" strokeWidth="2" fill="none" />
          <path d="M 500 0 Q 450 200 500 400" stroke="#1e3a5f" strokeWidth="2" fill="none" />
        </svg>

        {/* Search Box */}
        <div className="absolute top-3 left-3 right-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <Input
              placeholder="Search location..."
              className="pl-9 h-9 bg-black/60 border-cyan-500/30 text-white text-xs placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Markers */}
        {markers.map((marker) => {
          if (marker.type === 'people' && !filters.people) return null
          if (marker.type === 'vehicles' && !filters.vehicles) return null
          if (marker.type === 'drone' && !filters.drones) return null
          if (marker.type === 'activity' && !filters.suspicious) return null

          return (
            <div
              key={marker.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
            >
              {/* Pulse Ring */}
              <div
                className="absolute inset-0 rounded-full animate-ping"
                style={{
                  backgroundColor: `${marker.color}40`,
                  width: '40px',
                  height: '40px',
                  left: '-12px',
                  top: '-12px',
                }}
              />
              {/* Marker */}
              <div
                className="relative w-4 h-4 rounded-full border-2 border-white shadow-lg"
                style={{ backgroundColor: marker.color, boxShadow: `0 0 20px ${marker.color}` }}
              />
              {/* Label */}
              <div
                className="absolute top-6 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md text-xs whitespace-nowrap"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: `1px solid ${marker.color}60`,
                  color: marker.color,
                }}
              >
                {marker.label}
              </div>
            </div>
          )
        })}

        {/* Zone Overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <polygon
            points="200,180 350,150 400,250 300,300 200,280"
            fill="rgba(56, 189, 248, 0.05)"
            stroke="rgba(56, 189, 248, 0.3)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        </svg>

        {/* Filter Checkboxes (Right) */}
        <div className="absolute top-16 right-3 p-3 rounded-lg bg-black/70 backdrop-blur border border-cyan-500/30 space-y-1.5">
          {[
            { key: 'people', label: 'People', icon: Users },
            { key: 'vehicles', label: 'Vehicles', icon: Car },
            { key: 'drones', label: 'Drones', icon: Plane },
            { key: 'suspicious', label: 'Suspicious Activity', icon: MapPin },
            { key: 'cctv', label: 'CCTV Feeds', icon: Layers },
            { key: 'heatmap', label: 'Heatmap', icon: MapPin },
          ].map((item) => {
            const Icon = item.icon
            return (
              <label key={item.key} className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={filters[item.key as keyof typeof filters]}
                  onChange={(e) => setFilters({ ...filters, [item.key]: e.target.checked })}
                  className="w-3 h-3 accent-cyan-400"
                />
                <Icon size={12} />
                <span>{item.label}</span>
              </label>
            )
          })}
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1 bg-black/70 rounded-lg border border-cyan-500/30">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5">
            <Plus size={14} />
          </button>
          <div className="h-px bg-cyan-500/20" />
          <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5">
            <Minus size={14} />
          </button>
        </div>

        {/* Location Badge */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/40 gap-1">
            <MapPin size={10} />
            Bengaluru, Karnataka
          </Badge>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/40 gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </Badge>
        </div>
      </div>
    </Card>
  )
}
