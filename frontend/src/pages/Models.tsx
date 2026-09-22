import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Brain, Search, Upload, Eye, Download, Trash2, Zap, Target, TrendingUp } from 'lucide-react'

interface Model {
  id: number
  name: string
  type: string
  version: string
  accuracy: number
  status: 'Deployed' | 'Testing' | 'Training' | 'Archived'
  size: string
  updated: string
}

const staticModels: Model[] = [
  { id: 1, name: 'YOLOv8n', type: 'Object Detection', version: 'v8.0.196', accuracy: 92.4, status: 'Deployed', size: '6.2 MB', updated: '2 days ago' },
  { id: 2, name: 'ResNet50', type: 'Image Classification', version: 'v2.1', accuracy: 94.1, status: 'Deployed', size: '98 MB', updated: '3 days ago' },
  { id: 3, name: 'ViT-B/16', type: 'Vision Transformer', version: 'v1.5', accuracy: 91.2, status: 'Testing', size: '330 MB', updated: '5 days ago' },
  { id: 4, name: 'BERT-Base', type: 'NLP', version: 'v3.0', accuracy: 88.7, status: 'Deployed', size: '440 MB', updated: '1 week ago' },
  { id: 5, name: 'Custom-DQN', type: 'Anomaly Detection', version: 'v0.9', accuracy: 76.3, status: 'Training', size: '24 MB', updated: '2 weeks ago' },
  { id: 6, name: 'EfficientNet-B4', type: 'Image Classification', version: 'v1.2', accuracy: 93.5, status: 'Archived', size: '75 MB', updated: '3 weeks ago' },
]

const statusColors = {
  Deployed: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.4)' },
  Testing: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' },
  Training: { bg: 'rgba(56, 189, 248, 0.15)', text: '#38BDF8', border: 'rgba(56, 189, 248, 0.4)' },
  Archived: { bg: 'rgba(107, 114, 128, 0.15)', text: '#9CA3AF', border: 'rgba(107, 114, 128, 0.4)' },
}

export function Models() {
  const [models, setModels] = useState<Model[]>(staticModels)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')

  const filtered = models.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || m.status === filter
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: models.length,
    deployed: models.filter((m) => m.status === 'Deployed').length,
    testing: models.filter((m) => m.status === 'Testing').length,
    training: models.filter((m) => m.status === 'Training').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">AI Models</h1>
          <p className="text-gray-400 text-sm">Deploy, monitor, and manage ML models</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all">
          <Upload size={16} />
          Deploy Model
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Models', value: stats.total, color: '#38BDF8', icon: Brain },
          { label: 'Deployed', value: stats.deployed, color: '#10B981', icon: Zap },
          { label: 'Testing', value: stats.testing, color: '#F59E0B', icon: Target },
          { label: 'Training', value: stats.training, color: '#38BDF8', icon: TrendingUp },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="glass-card p-5 border-cyan-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}20`, border: `1px solid ${stat.color}40` }}>
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
              </div>
              <div className="text-white text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-gray-400 text-xs">{stat.label}</div>
            </Card>
          )
        })}
      </div>

      <Card className="glass-card border-cyan-500/20 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <Input
              placeholder="Search models..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-cyan-500/20 text-white placeholder:text-gray-500 h-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'Deployed', 'Testing', 'Training', 'Archived'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  filter === f
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'text-gray-500 hover:text-gray-300 border border-cyan-500/10'
                }`}
              >
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="glass-card border-cyan-500/20 p-5">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyan-500/10">
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Model</th>
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Type</th>
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Version</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Accuracy</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Size</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Status</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Updated</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((model) => {
                const colors = statusColors[model.status]
                return (
                  <tr key={model.id} className="border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                          <Brain size={14} className="text-green-400" />
                        </div>
                        <div className="text-white text-xs font-medium">{model.name}</div>
                      </div>
                    </td>
                    <td className="py-3"><div className="text-gray-400 text-xs">{model.type}</div></td>
                    <td className="py-3"><div className="text-gray-300 text-xs font-mono">{model.version}</div></td>
                    <td className="py-3 text-right"><div className="text-green-400 text-xs font-bold">{model.accuracy}%</div></td>
                    <td className="py-3 text-right"><div className="text-gray-300 text-xs">{model.size}</div></td>
                    <td className="py-3 text-right">
                      <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                        ● {model.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right"><div className="text-gray-500 text-xs">{model.updated}</div></td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded hover:bg-cyan-500/10 text-gray-400 hover:text-cyan-400 transition-colors">
                          <Eye size={12} />
                        </button>
                        <button className="p-1.5 rounded hover:bg-cyan-500/10 text-gray-400 hover:text-cyan-400 transition-colors">
                          <Download size={12} />
                        </button>
                        <button className="p-1.5 rounded hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
