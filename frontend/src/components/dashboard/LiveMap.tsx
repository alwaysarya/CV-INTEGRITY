import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { MapPin, Search, Plus, Minus, Layers, Loader2 } from 'lucide-react'
import apiClient from '@/lib/api'

interface MapMarker {
  id: string
  type: 'dataset' | 'model'
  x: number
  y: number
  label: string
  value: number
  color: string
}

export function LiveMap() {
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMarkers()
  }, [])

  const loadMarkers = async () => {
    setLoading(true)
    try {
      const [dRes, mRes] = await Promise.all([
        apiClient.getDatasets(),
        apiClient.getModels(),
      ])

      const datasets = dRes.data.datasets || {}
      const models = mRes.data.models || {}

      const list: MapMarker[] = []
      let idx = 0

      // Datasets as markers
      Object.entries(datasets).forEach(([key, val]: [string, any]) => {
        list.push({
          id: `ds_${key}`,
          type: 'dataset',
          x: 20 + (idx * 15) % 60,
          y: 25 + (idx * 12) % 50,
          label: key.toUpperCase(),
          value: val.total_images || 0,
          color: '#38BDF8',
        })
        idx++
      })

      // Models as markers
      Object.entries(models).forEach(([key, val]: [string, any]) => {
        list.push({
          id: `md_${key}`,
          type: 'model',
          x: 25 + (idx * 13) % 55,
          y: 30 + (idx * 11) % 45,
          label: key.toUpperCase(),
          value: val.mAP50 || 0,
          color: '#10B981',
        })
        idx++
      })

      setMarkers(list)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="glass-card border-cyan-500/20 p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            LIVE SITUATIONAL MAP
          </h3>
          <p className="text-gray-500 text-xs mt-0.5">Real datasets & models tracked</p>
        </div>
        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/40 text-[10px]">
          {markers.length} entities
        </Badge>
      </div>

      <div className="relative w-full h-80 rounded-xl overflow-hidden bg-[#0a0f1e] border border-cyan-500/20">
        {/* Grid */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        {/* Roads */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.4 }}>
          <path d="M 0 200 Q 200 150 400 200 T 800 180" stroke="#1e3a5f" strokeWidth="2" fill="none" />
          <path d="M 150 0 Q 200 150 250 400" stroke="#1e3a5f" strokeWidth="2" fill="none" />
          <path d="M 500 0 Q 450 200 500 400" stroke="#1e3a5f" strokeWidth="2" fill="none" />
        </svg>

        {/* Search */}
        <div className="absolute top-3 left-3 right-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <Input placeholder="Search..." className="pl-9 h-9 bg-black/60 border-cyan-500/30 text-white text-xs placeholder:text-gray-500" />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
          </div>
        )}

        {/* Markers */}
        {markers.map((marker) => (
          <div
            key={marker.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
          >
            <div className="absolute inset-0 rounded-full animate-ping" style={{
              backgroundColor: `${marker.color}40`,
              width: '40px', height: '40px', left: '-12px', top: '-12px',
            }} />
            <div className="relative w-4 h-4 rounded-full border-2 border-white" style={{ backgroundColor: marker.color, boxShadow: `0 0 20px ${marker.color}` }} />
            <div className="absolute top-6 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity" style={{
              backgroundColor: 'rgba(0,0,0,0.9)', border: `1px solid ${marker.color}60`, color: marker.color,
            }}>
              {marker.label}: {marker.value.toFixed(0)}
            </div>
          </div>
        ))}

        {/* Filters */}
        <div className="absolute top-16 right-3 p-3 rounded-lg bg-black/70 backdrop-blur border border-cyan-500/30 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#38BDF8' }} />
            Datasets ({markers.filter(m => m.type === 'dataset').length})
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10B981' }} />
            Models ({markers.filter(m => m.type === 'model').length})
          </div>
        </div>

        {/* Zoom */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1 bg-black/70 rounded-lg border border-cyan-500/30">
          <button className="p-2 text-gray-400 hover:text-white"><Plus size={14} /></button>
          <div className="h-px bg-cyan-500/20" />
          <button className="p-2 text-gray-400 hover:text-white"><Minus size={14} /></button>
        </div>

        {/* Badges */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/40 gap-1 text-[10px]">
            <MapPin size={10} /> Live Data
          </Badge>
        </div>
      </div>
    </Card>
  )
}
