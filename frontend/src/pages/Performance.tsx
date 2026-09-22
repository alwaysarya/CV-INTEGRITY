import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap, Activity, Clock, Cpu, Loader2, RefreshCw, AlertCircle, Target } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import apiClient from '@/lib/api'

interface ModelPerf {
  name: string
  precision: number
  recall: number
  mAP50: number
  mAP50_95: number
}

export function Performance() {
  const [models, setModels] = useState<ModelPerf[]>([])
  const [blocks, setBlocks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPerformance()
  }, [])

  const loadPerformance = async () => {
    setLoading(true)
    setError(null)
    try {
      const [mRes, bRes, health] = await Promise.all([
        apiClient.getModels(),
        apiClient.getBlocks(),
        apiClient.getHealth(),
      ])

      const modelsData = mRes.data.models || {}
      const list: ModelPerf[] = Object.entries(modelsData).map(([key, val]: [string, any]) => ({
        name: key.toUpperCase(),
        precision: val.precision || 0,
        recall: val.recall || 0,
        mAP50: val.mAP50 || 0,
        mAP50_95: val.mAP50_95 || 0,
      }))

      setModels(list)
      setBlocks(bRes.data.blocks || [])
    } catch (err: any) {
      console.error('Failed:', err)
      setError(err.message || 'Backend connect nahi ho raha')
    } finally {
      setLoading(false)
    }
  }

  const avgPrecision = models.length
    ? (models.reduce((s, m) => s + m.precision, 0) / models.length).toFixed(2)
    : '0'
  const avgRecall = models.length
    ? (models.reduce((s, m) => s + m.recall, 0) / models.length).toFixed(2)
    : '0'
  const avgMAP = models.length
    ? (models.reduce((s, m) => s + m.mAP50, 0) / models.length).toFixed(2)
    : '0'
  const bestMAP = models.length ? Math.max(...models.map((m) => m.mAP50)).toFixed(2) : '0'

  // Model performance chart data
  const chartData = models.map((m) => ({
    name: m.name,
    precision: m.precision,
    recall: m.recall,
    mAP50: m.mAP50,
  }))

  // Blockchain activity data
  const actionCounts: Record<string, number> = {}
  blocks.forEach((b: any) => {
    const action = b.data?.action || 'UNKNOWN'
    actionCounts[action] = (actionCounts[action] || 0) + 1
  })
  const blockChartData = Object.entries(actionCounts).map(([name, count]) => ({
    name: name.replace(/_/g, ' '),
    count,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Performance</h1>
          <p className="text-gray-400 text-sm">
            {loading ? 'Loading from backend...' : `${models.length} models + ${blocks.length} blocks`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadPerformance} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-sm font-medium">
            <RefreshCw size={16} /> Refresh
          </button>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/40 gap-1.5 py-2 px-3">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            All Systems Nominal
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
          { label: 'Avg Precision', value: `${avgPrecision}%`, color: '#38BDF8', icon: Clock },
          { label: 'Avg Recall', value: `${avgRecall}%`, color: '#F59E0B', icon: Activity },
          { label: 'Avg mAP50', value: `${avgMAP}%`, color: '#10B981', icon: Zap },
          { label: 'Best mAP50', value: `${bestMAP}%`, color: '#8B5CF6', icon: Target },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-card border-cyan-500/20 p-5">
          <div className="mb-4">
            <h3 className="text-white font-bold text-sm">MODEL METRICS</h3>
            <p className="text-gray-500 text-xs mt-0.5">Precision, recall, mAP50 by model</p>
          </div>
          <div className="w-full h-64">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-cyan-400" size={32} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(56, 189, 248, 0.1)" />
                  <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="precision" fill="#38BDF8" radius={[8, 8, 0, 0]} name="Precision" />
                  <Bar dataKey="recall" fill="#8B5CF6" radius={[8, 8, 0, 0]} name="Recall" />
                  <Bar dataKey="mAP50" fill="#10B981" radius={[8, 8, 0, 0]} name="mAP50" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="glass-card border-cyan-500/20 p-5">
          <div className="mb-4">
            <h3 className="text-white font-bold text-sm">BLOCKCHAIN ACTIVITY</h3>
            <p className="text-gray-500 text-xs mt-0.5">Blocks by action type</p>
          </div>
          <div className="w-full h-64">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-cyan-400" size={32} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={blockChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(56, 189, 248, 0.1)" />
                  <XAxis type="number" stroke="#475569" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fontSize: 9 }} width={130} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', fontSize: '11px' }} />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[0, 8, 8, 0]} name="Blocks" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <Card className="glass-card border-cyan-500/20 p-5">
        <div className="mb-4">
          <h3 className="text-white font-bold text-sm">MODEL PERFORMANCE DETAILS</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-500/10">
                  <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Model</th>
                  <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Precision</th>
                  <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Recall</th>
                  <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">mAP50</th>
                  <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">mAP50-95</th>
                  <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {models.map((m, idx) => {
                  const mapColor = m.mAP50 >= 18 ? '#10B981' : m.mAP50 >= 16 ? '#F59E0B' : '#EF4444'
                  const status = m.mAP50 >= 18 ? 'Deployed' : m.mAP50 >= 16 ? 'Testing' : 'Training'
                  return (
                    <tr key={idx} className="border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                            <Cpu size={14} className="text-green-400" />
                          </div>
                          <div className="text-white text-xs font-bold">{m.name}</div>
                        </div>
                      </td>
                      <td className="py-3 text-right"><span className="text-gray-300 text-xs font-mono">{m.precision.toFixed(2)}</span></td>
                      <td className="py-3 text-right"><span className="text-gray-300 text-xs font-mono">{m.recall.toFixed(2)}</span></td>
                      <td className="py-3 text-right"><span className="text-xs font-mono font-bold" style={{ color: mapColor }}>{m.mAP50.toFixed(2)}%</span></td>
                      <td className="py-3 text-right"><span className="text-gray-400 text-xs font-mono">{m.mAP50_95.toFixed(2)}%</span></td>
                      <td className="py-3 text-right">
                        <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: `${mapColor}20`, color: mapColor, border: `1px solid ${mapColor}60` }}>
                          ● {status}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
