import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Brain, Search, Upload, Eye, Loader2, AlertCircle, RefreshCw, TrendingUp } from 'lucide-react'
import apiClient from '@/lib/api'

interface Model {
  name: string
  precision: number
  recall: number
  mAP50: number
  mAP50_95: number
}

export function Models() {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadModels()
  }, [])

  const loadModels = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.getModels()
      const data = res.data
      
      let modelsList: Model[] = []
      if (data.models && typeof data.models === 'object') {
        modelsList = Object.values(data.models)
      }
      
      setModels(modelsList)
    } catch (err: any) {
      console.error('Failed:', err)
      setError(err.message || 'Backend connect nahi ho raha')
    } finally {
      setLoading(false)
    }
  }

  const filtered = models.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: models.length,
    bestMAP: models.length ? Math.max(...models.map((m) => m.mAP50)).toFixed(2) : '0',
    avgPrecision: models.length ? (models.reduce((s, m) => s + m.precision, 0) / models.length).toFixed(2) : '0',
    avgRecall: models.length ? (models.reduce((s, m) => s + m.recall, 0) / models.length).toFixed(2) : '0',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">AI Models</h1>
          <p className="text-gray-400 text-sm">
            {loading ? 'Backend se data load ho raha hai...' : `${models.length} models backend se`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadModels} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-sm font-medium hover:bg-cyan-500/30 transition-all">
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium">
            <Upload size={16} />
            Deploy
          </button>
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
          { label: 'Total Models', value: stats.total, color: '#38BDF8', icon: Brain },
          { label: 'Best mAP50', value: `${stats.bestMAP}%`, color: '#10B981', icon: TrendingUp },
          { label: 'Avg Precision', value: `${stats.avgPrecision}%`, color: '#8B5CF6', icon: Brain },
          { label: 'Avg Recall', value: `${stats.avgRecall}%`, color: '#F59E0B', icon: Brain },
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

      <Card className="glass-card border-cyan-500/20 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <Input
            placeholder="Search models..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-cyan-500/20 text-white placeholder:text-gray-500 h-10"
          />
        </div>
      </Card>

      <Card className="glass-card border-cyan-500/20 p-5">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
            <span className="ml-3 text-gray-400">Loading from FastAPI...</span>
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
                {filtered.map((m, idx) => {
                  const mapColor = m.mAP50 >= 18 ? '#10B981' : m.mAP50 >= 16 ? '#F59E0B' : '#EF4444'
                  const status = m.mAP50 >= 18 ? 'Deployed' : m.mAP50 >= 16 ? 'Testing' : 'Training'
                  return (
                    <tr key={idx} className="border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                            <Brain size={14} className="text-green-400" />
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

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <Brain size={48} className="text-gray-600 mx-auto mb-3" />
            <div className="text-gray-400 text-sm">No models found</div>
          </div>
        )}
      </Card>
    </div>
  )
}
