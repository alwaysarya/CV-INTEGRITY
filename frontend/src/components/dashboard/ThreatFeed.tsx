import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, ArrowRight, Loader2 } from 'lucide-react'
import apiClient from '@/lib/api'

interface Threat {
  id: string
  type: string
  severity: string
  description: string
}

const normalizeSeverity = (s: string): string => {
  const lower = (s || '').toLowerCase()
  if (lower.includes('critical')) return 'High'
  if (lower.includes('high')) return 'High'
  if (lower.includes('medium')) return 'Medium'
  return 'Low'
}

const severityColors: Record<string, any> = {
  High: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.4)' },
  Medium: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' },
  Low: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.4)' },
}

export function ThreatFeed() {
  const [threats, setThreats] = useState<Threat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadThreats()
  }, [])

  const loadThreats = async () => {
    setLoading(true)
    try {
      const res = await apiClient.getAttacks()
      const raw = res.data.attacks || {}
      const list: Threat[] = Object.entries(raw).map(([key, val]: [string, any], i) => ({
        id: key,
        type: val.name || key,
        severity: normalizeSeverity(val.severity || 'Medium'),
        description: val.description || 'Attack simulation',
      }))
      setThreats(list)
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
            <AlertTriangle size={14} className="text-red-400" />
            THREAT MONITORING
          </h3>
          <p className="text-gray-500 text-xs mt-0.5">Real attacks from backend</p>
        </div>
        <Badge className="bg-red-500/20 text-red-400 border-red-500/40 text-[10px]">
          {threats.length} attacks
        </Badge>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-cyan-400" size={24} />
        </div>
      ) : (
        <div className="space-y-2">
          {threats.map((threat) => {
            const colors = severityColors[threat.severity]
            return (
              <div key={threat.id} className="group flex items-start gap-3 p-3 rounded-lg transition-all hover:translate-x-1" style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderLeft: `3px solid ${colors.text}`,
                border: '1px solid rgba(56, 189, 248, 0.1)',
              }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}>
                  <AlertTriangle size={14} style={{ color: colors.text }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-bold mb-0.5 truncate">{threat.type}</div>
                  <div className="text-gray-500 text-[10px] truncate">{threat.description}</div>
                </div>
                <Badge className="text-[9px] py-0.5 px-2 flex-shrink-0" style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                  {threat.severity}
                </Badge>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-cyan-500/10 flex items-center justify-between">
        <div className="text-gray-500 text-[10px]">{threats.length} attacks loaded</div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          <span className="text-red-400 text-[10px] font-medium">MONITORING</span>
        </div>
      </div>
    </Card>
  )
}
