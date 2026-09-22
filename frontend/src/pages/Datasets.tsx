import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Database, Search, Upload, Eye, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import apiClient from '@/lib/api'

interface Dataset {
  name: string
  overall_score: number
  blur_score: number
  duplicate_score: number
  noise_score: number
  total_images: number
  category: string
}

export function Datasets() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadDatasets()
  }, [])

  const loadDatasets = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.getDatasets()
      const data = res.data
      
      // Parse real backend format: {datasets: {good: {...}, bad: {...}, worst: {...}}, count: 3}
      let datasetsList: Dataset[] = []
      if (data.datasets && typeof data.datasets === 'object') {
        datasetsList = Object.values(data.datasets)
      }
      
      setDatasets(datasetsList)
    } catch (err: any) {
      console.error('Failed:', err)
      setError(err.message || 'Backend connect nahi ho raha')
    } finally {
      setLoading(false)
    }
  }

  const filtered = datasets.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: datasets.length,
    avgScore: datasets.length ? Math.round(datasets.reduce((s, d) => s + d.overall_score, 0) / datasets.length) : 0,
    good: datasets.filter((d) => d.category === 'GOOD').length,
    totalImages: datasets.reduce((s, d) => s + d.total_images, 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Datasets</h1>
          <p className="text-gray-400 text-sm">
            {loading ? 'Backend se data load ho raha hai...' : `${datasets.length} datasets backend se`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadDatasets} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-sm font-medium hover:bg-cyan-500/30 transition-all">
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium">
            <Upload size={16} />
            Upload
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
          { label: 'Total Datasets', value: stats.total, color: '#38BDF8', icon: Database },
          { label: 'Avg Score', value: `${stats.avgScore}%`, color: '#10B981', icon: Eye },
          { label: 'Good Category', value: stats.good, color: '#8B5CF6', icon: Database },
          { label: 'Total Images', value: stats.totalImages, color: '#F59E0B', icon: Database },
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
            placeholder="Search datasets..."
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
                  <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Dataset</th>
                  <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Overall</th>
                  <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Blur</th>
                  <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Duplicate</th>
                  <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Noise</th>
                  <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Images</th>
                  <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Category</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, idx) => {
                  const scoreColor = d.overall_score >= 90 ? '#10B981' : d.overall_score >= 80 ? '#F59E0B' : '#EF4444'
                  const catColor = d.category === 'GOOD' ? '#10B981' : '#F59E0B'
                  return (
                    <tr key={idx} className="border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                            <Database size={14} className="text-cyan-400" />
                          </div>
                          <div className="text-white text-xs font-bold">{d.name}</div>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-xs font-bold" style={{ color: scoreColor }}>{d.overall_score.toFixed(2)}%</span>
                      </td>
                      <td className="py-3 text-right"><span className="text-gray-300 text-xs font-mono">{d.blur_score.toFixed(1)}</span></td>
                      <td className="py-3 text-right"><span className="text-gray-300 text-xs font-mono">{d.duplicate_score.toFixed(1)}</span></td>
                      <td className="py-3 text-right"><span className="text-gray-300 text-xs font-mono">{d.noise_score.toFixed(1)}</span></td>
                      <td className="py-3 text-right"><span className="text-white text-xs font-mono font-bold">{d.total_images}</span></td>
                      <td className="py-3 text-right">
                        <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: `${catColor}20`, color: catColor, border: `1px solid ${catColor}60` }}>
                          {d.category}
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
            <Database size={48} className="text-gray-600 mx-auto mb-3" />
            <div className="text-gray-400 text-sm">No datasets found</div>
          </div>
        )}
      </Card>
    </div>
  )
}
