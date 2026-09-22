import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingDown, TrendingUp, AlertTriangle, CheckCircle, Activity, Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import apiClient from '@/lib/api'

interface DriftMetric {
  id: string
  model: string
  metric: string
  baseline: number
  current: number
  change: number
  severity: string
}

const severityColors: Record<string, any> = {
  Stable: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.4)' },
  Warning: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' },
  Critical: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.4)' },
}

export function DriftMonitor() {
  const [drifts, setDrifts] = useState<DriftMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDrift()
  }, [])

  const loadDrift = async () => {
    setLoading(true)
    setError(null)
    try {
      const [mRes, dRes] = await Promise.all([
        apiClient.getModels(),
        apiClient.getDatasets(),
      ])

      const models = mRes.data.models || {}
      const datasets = dRes.data.datasets || {}
      const list: DriftMetric[] = []

      Object.entries(models).forEach(([key, val]: [string, any]) => {
        const mAP = val.mAP50 || 0
        const baseline = 20
        const change = mAP - baseline
        list.push({
          id: `model_${key}`,
          model: `${key.toUpperCase()} Model`,
          metric: 'mAP50 Performance',
          baseline,
          current: mAP,
          change,
          severity: Math.abs(change) < 3 ? 'Stable' : Math.abs(change) < 5 ? 'Warning' : 'Critical',
        })
      })

      Object.entries(datasets).forEach(([key, val]: [string, any]) => {
        const quality = val.overall_score || 0
        const baseline = 95
        const change = quality - baseline
        list.push({
          id: `dataset_${key}`,
          model: `${key.toUpperCase()} Dataset`,
          metric: 'Quality Score',
          baseline,
          current: quality,
          change,
          severity: Math.abs(change) < 5 ? 'Stable' : Math.abs(change) < 15 ? 'Warning' : 'Critical',
        })
      })

      setDrifts(list)
    } catch (err: any) {
      console.error('Failed:', err)
      setError(err.message || 'Backend connect nahi ho raha')
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    total: drifts.length,
    stable: drifts.filter((d) => d.severity === 'Stable').length,
    warning: drifts.filter((d) => d.severity === 'Warning').length,
    critical: drifts.filter((d) => d.severity === 'Critical').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Drift Monitor</h1>
          <p className="text-gray-400 text-sm">
            {loading ? 'Loading from backend...' : `${drifts.length} metrics monitored`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadDrift} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-sm font-medium">
            <RefreshCw size={16} /> Refresh
          </button>
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/40 gap-1.5 py-2 px-3">
            <AlertTriangle size={12} /> {stats.critical} Critical
          </Badge>
        </div>
      </div>

      {error && (
        <Card className="glass-card p-4" style={{ border: '1px solid rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-400" size={20} />
            <div>
              <div className="text-red-400 font-medium text-sm">Backend Error</div>
              <div className="text-gray-400 text-xs">{error}</div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Monitored', value: stats.total, color: '#38BDF8', icon: Activity },
          { label: 'Stable', value: stats.stable, color: '#10B981', icon: CheckCircle },
          { label: 'Warning', value: stats.warning, color: '#F59E0B', icon: AlertTriangle },
          { label: 'Critical', value: stats.critical, color: '#EF4444', icon: TrendingDown },
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

      <Card className="glass-card border-cyan-500/20 p-5">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
            <span className="ml-3 text-gray-400">Loading drift metrics...</span>
          </div>
        ) : drifts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-500/10">
                  <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Entity</th>
                  <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Metric</th>
                  <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Baseline</th>
                  <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Current</th>
                  <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Change</th>
                  <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Severity</th>
                </tr>
              </thead>
              <tbody>
                {drifts.map((d) => {
                  const colors = severityColors[d.severity]
                  const isPositive = d.change > 0
                  return (
                    <tr key={d.id} className="border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}>
                            {d.severity === 'Stable' ? (
                              <CheckCircle size={14} style={{ color: colors.text }} />
                            ) : (
                              <AlertTriangle size={14} style={{ color: colors.text }} />
                            )}
                          </div>
                          <div className="text-white text-xs font-bold">{d.model}</div>
                        </div>
                      </td>
                      <td className="py-3"><div className="text-gray-400 text-xs">{d.metric}</div></td>
                      <td className="py-3 text-right"><div className="text-gray-300 text-xs font-mono">{d.baseline.toFixed(2)}</div></td>
                      <td className="py-3 text-right"><div className="text-white text-xs font-mono font-bold">{d.current.toFixed(2)}</div></td>
                      <td className="py-3 text-right">
                        <div className={`text-xs font-bold flex items-center justify-end gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                          {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {isPositive ? '+' : ''}{d.change.toFixed(2)}
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                          {d.severity}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertTriangle size={48} className="text-gray-600 mx-auto mb-3" />
            <div className="text-gray-400 text-sm">No drift metrics available</div>
          </div>
        )}
      </Card>
    </div>
  )
}
