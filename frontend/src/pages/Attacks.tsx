import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Shield, Loader2, RefreshCw, Bug, Target } from 'lucide-react'
import apiClient from '@/lib/api'

interface Attack {
  id: string
  name: string
  description: string
  severity: string
  category: string
  success_rate: number
  detections: number
}

// Normalize severity to Title Case
const normalizeSeverity = (s: string): string => {
  if (!s) return 'High'
  const lower = s.toLowerCase()
  if (lower.includes('critical')) return 'Critical'
  if (lower.includes('high')) return 'High'
  if (lower.includes('medium')) return 'Medium'
  if (lower.includes('low')) return 'Low'
  return 'High'
}

const severityColors: Record<string, any> = {
  Critical: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.4)' },
  High: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' },
  Medium: { bg: 'rgba(56, 189, 248, 0.15)', text: '#38BDF8', border: 'rgba(56, 189, 248, 0.4)' },
  Low: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.4)' },
}

export function Attacks() {
  const [attacks, setAttacks] = useState<Attack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAttacks()
  }, [])

  const loadAttacks = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.getAttacks()
      const data = res.data

      console.log('Attacks API Response:', data)

      let list: Attack[] = []

      // Handle {attacks: [...]} or {attacks: {...}}
      const raw = data.attacks || data

      if (Array.isArray(raw)) {
        list = raw.map((a: any, i: number) => ({
          id: a.id || `attack_${i}`,
          name: a.name || 'Unknown Attack',
          description: a.description || '',
          severity: normalizeSeverity(a.severity || 'High'),
          category: a.category || 'General',
          success_rate: typeof a.success_rate === 'number' ? a.success_rate : (typeof a.successRate === 'number' ? a.successRate : 0),
          detections: typeof a.detections === 'number' ? a.detections : 0,
        }))
      } else if (typeof raw === 'object') {
        list = Object.entries(raw).map(([key, val]: [string, any]) => ({
          id: key,
          name: val.name || key,
          description: val.description || 'Attack simulation',
          severity: normalizeSeverity(val.severity || 'High'),
          category: val.category || 'General',
          success_rate: typeof val.success_rate === 'number' ? val.success_rate : (typeof val.successRate === 'number' ? val.successRate : 0),
          detections: typeof val.detections === 'number' ? val.detections : 0,
        }))
      }

      setAttacks(list)
    } catch (err: any) {
      console.error('Failed:', err)
      setError(err.message || 'Backend connect nahi ho raha')
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    total: attacks.length,
    critical: attacks.filter((a) => a.severity === 'Critical').length,
    totalDetections: attacks.reduce((s, a) => s + (a.detections || 0), 0),
    avgBlockRate: attacks.length > 0
      ? Math.round(attacks.reduce((s, a) => s + (100 - (a.success_rate || 0)), 0) / attacks.length)
      : 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Attack Simulator</h1>
          <p className="text-gray-400 text-sm">
            {loading ? 'Loading from backend...' : `${attacks.length} attacks from backend`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadAttacks} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-sm font-medium">
            <RefreshCw size={16} /> Refresh
          </button>
          <Badge className="bg-red-500/20 text-red-400 border-red-500/40 gap-1.5 py-2 px-3">
            <Bug size={12} /> Sandbox Mode
          </Badge>
        </div>
      </div>

      {error && (
        <Card className="glass-card p-4" style={{ border: '1px solid rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-400" size={20} />
            <div>
              <div className="text-red-400 font-medium text-sm">Backend Error</div>
              <div className="text-gray-400 text-xs">{error}</div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Attacks', value: stats.total, color: '#38BDF8', icon: Bug },
          { label: 'Critical', value: stats.critical, color: '#EF4444', icon: AlertTriangle },
          { label: 'Detections', value: stats.totalDetections, color: '#10B981', icon: Target },
          { label: 'Block Rate', value: `${stats.avgBlockRate}%`, color: '#38BDF8', icon: Shield },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="glass-card p-5 border-cyan-500/20">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${stat.color}20`, border: `1px solid ${stat.color}40` }}>
                <Icon size={20} style={{ color: stat.color }} />
              </div>
              <div className="text-white text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-gray-400 text-xs">{stat.label}</div>
            </Card>
          )
        })}
      </div>

      {loading ? (
        <Card className="glass-card border-cyan-500/20 p-12">
          <div className="flex items-center justify-center">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
            <span className="ml-3 text-gray-400">Loading attacks...</span>
          </div>
        </Card>
      ) : attacks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attacks.map((attack) => {
            const colors = severityColors[attack.severity] || severityColors.High
            return (
              <Card key={attack.id} className="glass-card border-cyan-500/20 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}>
                    <Bug size={18} style={{ color: colors.text }} />
                  </div>
                  <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                    {attack.severity}
                  </Badge>
                </div>

                <h3 className="text-white font-bold text-sm mb-1">{attack.name}</h3>
                <p className="text-gray-400 text-xs mb-4 min-h-[40px]">{attack.description}</p>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-black/30 border border-cyan-500/10">
                    <div className="text-gray-500 text-[10px] uppercase">Success Rate</div>
                    <div className="text-red-400 text-sm font-bold">{attack.success_rate}%</div>
                  </div>
                  <div className="p-2 rounded-lg bg-black/30 border border-cyan-500/10">
                    <div className="text-gray-500 text-[10px] uppercase">Detected</div>
                    <div className="text-green-400 text-sm font-bold">{attack.detections}</div>
                  </div>
                </div>

                {attack.category && attack.category !== 'General' && (
                  <div className="text-gray-500 text-[10px] text-center pt-2 border-t border-cyan-500/10">
                    Category: {attack.category}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="glass-card border-cyan-500/20 p-12">
          <div className="text-center">
            <Bug size={48} className="text-gray-600 mx-auto mb-3" />
            <div className="text-gray-400 text-sm">No attacks available from backend</div>
          </div>
        </Card>
      )}
    </div>
  )
}
