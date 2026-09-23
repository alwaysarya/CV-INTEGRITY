import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { MapPin, Search, Plus, Minus, Loader2, Database, Brain } from 'lucide-react'
import axios from 'axios'

const API = 'http://localhost:8000'

interface Location {
  id: string
  name: string
  lat: number
  lng: number
  city: string
  country: string
  type: 'dataset' | 'model'
  quality_score?: number
  mAP50?: number
  total_images?: number
}

// India bounding box for map projection
const INDIA_BOUNDS = {
  minLat: 8.0,
  maxLat: 37.0,
  minLng: 68.0,
  maxLng: 97.0,
}

export function LiveMap() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [center, setCenter] = useState({ lat: 20.5937, lng: 78.9629, zoom: 5 })

  useEffect(() => {
    loadLocations()
  }, [])

  const loadLocations = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/locations/all`)
      setLocations(res.data.locations || [])
      if (res.data.center) setCenter(res.data.center)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Convert GPS to map percentage
  const gpsToPercent = (lat: number, lng: number) => {
    const x = ((lng - INDIA_BOUNDS.minLng) / (INDIA_BOUNDS.maxLng - INDIA_BOUNDS.minLng)) * 100
    const y = ((INDIA_BOUNDS.maxLat - lat) / (INDIA_BOUNDS.maxLat - INDIA_BOUNDS.minLat)) * 100
    return { x, y }
  }

  return (
    <Card className="glass-card border-cyan-500/20 p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            LIVE SITUATIONAL MAP
          </h3>
          <p className="text-gray-500 text-xs mt-0.5">Real GPS coordinates — India</p>
        </div>
        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/40 text-[10px]">
          {locations.length} locations
        </Badge>
      </div>

      <div className="relative w-full h-80 rounded-xl overflow-hidden bg-[#0a0f1e] border border-cyan-500/20">
        {/* Grid background */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        {/* India Outline (simplified SVG path) */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ opacity: 0.15 }}>
          {/* Simplified India outline */}
          <path
            d="M 30 15 L 42 12 L 52 18 L 60 16 L 68 22 L 72 32 L 78 38 L 82 48 L 78 58 L 72 68 L 62 78 L 52 88 L 42 92 L 32 88 L 28 78 L 22 68 L 18 58 L 16 48 L 18 38 L 22 28 L 26 20 Z"
            fill="none"
            stroke="rgba(56, 189, 248, 0.5)"
            strokeWidth="0.5"
          />
        </svg>

        {/* Search box */}
        <div className="absolute top-3 left-3 right-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <Input placeholder="Search location..." className="pl-9 h-9 bg-black/60 border-cyan-500/30 text-white text-xs placeholder:text-gray-500" />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
          </div>
        )}

        {/* Markers — Real GPS coordinates */}
        {locations.map((loc) => {
          const pos = gpsToPercent(loc.lat, loc.lng)
          const color = loc.type === 'dataset' ? '#38BDF8' : '#10B981'
          const score = loc.quality_score || loc.mAP50 || 0
          
          return (
            <div
              key={loc.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              {/* Pulse ring */}
              <div className="absolute inset-0 rounded-full animate-ping" style={{
                backgroundColor: `${color}40`,
                width: '30px',
                height: '30px',
                left: '-11px',
                top: '-11px',
              }} />
              {/* Marker dot */}
              <div className="relative w-4 h-4 rounded-full border-2 border-white" style={{ 
                backgroundColor: color, 
                boxShadow: `0 0 15px ${color}` 
              }} />
              {/* Tooltip */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10" style={{
                backgroundColor: 'rgba(0,0,0,0.9)',
                border: `1px solid ${color}60`,
                color: color,
              }}>
                <div className="font-bold">{loc.name}</div>
                <div className="text-[10px] text-gray-400">{loc.city}</div>
                {score > 0 && <div className="text-[10px]">{loc.type === 'dataset' ? 'Quality' : 'mAP50'}: {score}%</div>}
              </div>
            </div>
          )
        })}

        {/* Legend */}
        <div className="absolute top-16 right-3 p-3 rounded-lg bg-black/70 backdrop-blur border border-cyan-500/30 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <Database size={10} style={{ color: '#38BDF8' }} />
            Datasets ({locations.filter(l => l.type === 'dataset').length})
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <Brain size={10} style={{ color: '#10B981' }} />
            Models ({locations.filter(l => l.type === 'model').length})
          </div>
        </div>

        {/* Zoom */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1 bg-black/70 rounded-lg border border-cyan-500/30">
          <button className="p-2 text-gray-400 hover:text-white"><Plus size={14} /></button>
          <div className="h-px bg-cyan-500/20" />
          <button className="p-2 text-gray-400 hover:text-white"><Minus size={14} /></button>
        </div>

        {/* Center info */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/40 gap-1 text-[10px]">
            <MapPin size={10} /> India
          </Badge>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/40 gap-1 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </Badge>
        </div>
      </div>
    </Card>
  )
}
