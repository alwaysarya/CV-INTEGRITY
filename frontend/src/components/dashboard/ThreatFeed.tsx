import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import apiClient from '@/lib/api'

interface Threat {
  id: number
  type: string
  location: string
  time: string
  severity: 'High' | 'Medium' | 'Low'
}

const staticThreats: Threat[] = [
  { id: 1, type: 'Unauthorised drone detected', location: 'HSR Layout, Bengaluru', time: '14:28', severity: 'High' },
  { id: 2, type: 'Suspicious person detected', location: 'Indiranagar, Bengaluru', time: '14:26', severity: 'Medium' },
  { id: 3, type: 'Unusual vehicle loitering', location: 'Koramangala, Bengaluru', time: '14:24', severity: 'Medium' },
  { id: 4, type: 'Restricted area breach', location: 'Electronic City, Bengaluru', time: '14:21', severity: 'High' },
  { id: 5, type: 'Abandoned object detected', location: 'Whitefield, Bengaluru', time: '14:18', severity: 'Low' },
]

const severityColors = {
  High: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#EF4444', bar: '#EF4444' },
  Medium: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', text: '#F59E0B', bar: '#F59E0B' },
  Low: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', text: '#10B981', bar: '#10B981' },
}

export function ThreatFeed() {
  const [threats, setThreats] = useState<Threat[]>(staticThreats)

  useEffect(() => {
    apiClient.getAttacks()
      .then((res) => {
        // If backend returns real data, use it
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          // Keep static for now — will integrate real data later
        }
      })
      .catch(() => {
        // Silent fail — use static
      })
  }, [])

  return (
    <Card className="glass-card border-cyan-500/20 p-5 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-400" />
            THREAT MONITORING
          </h3>
          <p className="text-gray-500 text-xs mt-0.5">Real-time detection and alerts</p>
        </div>
        <button className="text-cyan-400 text-xs hover:text-cyan-300 flex items-center gap-1">
          View All <ArrowRight size={12} />
        </button>
      </div>

      {/* Threat List */}
      <div className="space-y-2">
        {threats.map((threat) => {
          const colors = severityColors[threat.severity]
          return (
            <div
              key={threat.id}
              className="group flex items-start gap-3 p-3 rounded-lg transition-all cursor-pointer hover:translate-x-1"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderLeft: `3px solid ${colors.bar}`,
                border: `1px solid rgba(56, 189, 248, 0.1)`,
                borderLeftWidth: '3px',
              }}
            >
              {/* Icon/Image placeholder */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
              >
                <AlertTriangle size={16} style={{ color: colors.text }} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-medium mb-0.5 truncate">
                  {threat.type}
                </div>
                <div className="text-gray-500 text-[10px] truncate">
                  {threat.location}
                </div>
              </div>

              {/* Time + Badge */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <div className="text-gray-400 text-[10px] font-mono">{threat.time}</div>
                <Badge
                  className="text-[9px] py-0.5 px-2 font-bold"
                  style={{
                    backgroundColor: colors.bg,
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  {threat.severity}
                </Badge>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-cyan-500/10 flex items-center justify-between">
        <div className="text-gray-500 text-[10px]">
          {threats.length} active threats
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          <span className="text-red-400 text-[10px] font-medium">MONITORING</span>
        </div>
      </div>
    </Card>
  )
}
