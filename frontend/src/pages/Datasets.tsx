import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Database, Search, Upload, Filter, Download, Eye, Trash2, Plus } from 'lucide-react'
import apiClient from '@/lib/api'

interface Dataset {
  id: number
  name: string
  type: string
  size: string
  status: 'Verified' | 'Processing' | 'Flagged'
  samples: number
  uploaded: string
}

const staticDatasets: Dataset[] = [
  { id: 1, name: 'ImageNet-1K', type: 'Image', size: '46.8 GB', status: 'Verified', samples: 1281167, uploaded: '2 days ago' },
  { id: 2, name: 'COCO-2017', type: 'Image', size: '25.3 GB', status: 'Verified', samples: 123287, uploaded: '3 days ago' },
  { id: 3, name: 'OpenImages-v7', type: 'Image', size: '102 GB', status: 'Processing', samples: 1743042, uploaded: '5 days ago' },
  { id: 4, name: 'LAION-5B', type: 'Image', size: '1.2 TB', status: 'Verified', samples: 5851267, uploaded: '1 week ago' },
  { id: 5, name: 'Custom-Data', type: 'Video', size: '34.1 GB', status: 'Verified', samples: 4820, uploaded: '2 weeks ago' },
  { id: 6, name: 'Drone-Detection', type: 'Video', size: '18.6 GB', status: 'Flagged', samples: 2156, uploaded: '3 weeks ago' },
]

const statusColors = {
  Verified: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.4)' },
  Processing: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' },
  Flagged: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.4)' },
}

export function Datasets() {
  const [datasets, setDatasets] = useState<Dataset[]>(staticDatasets)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')

  const filtered = datasets.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || d.status === filter
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: datasets.length,
    verified: datasets.filter((d) => d.status === 'Verified').length,
    processing: datasets.filter((d) => d.status === 'Processing').length,
    flagged: datasets.filter((d) => d.status === 'Flagged').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Datasets</h1>
          <p className="text-gray-400 text-sm">Manage, verify, and analyze your datasets</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all">
          <Upload size={16} />
          Upload Dataset
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Datasets', value: stats.total, color: '#38BDF8', icon: Database },
          { label: 'Verified', value: stats.verified, color: '#10B981', icon: Eye },
          { label: 'Processing', value: stats.processing, color: '#F59E0B', icon: Filter },
          { label: 'Flagged', value: stats.flagged, color: '#EF4444', icon: Trash2 },
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

      {/* Filters + Search */}
      <Card className="glass-card border-cyan-500/20 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <Input
              placeholder="Search datasets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-cyan-500/20 text-white placeholder:text-gray-500 h-10"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'Verified', 'Processing', 'Flagged'].map((f) => (
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

      {/* Datasets Table */}
      <Card className="glass-card border-cyan-500/20 p-5">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyan-500/10">
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Dataset</th>
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Type</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Samples</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Size</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Status</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Uploaded</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((dataset) => {
                const colors = statusColors[dataset.status]
                return (
                  <tr key={dataset.id} className="border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                          <Database size={14} className="text-cyan-400" />
                        </div>
                        <div className="text-white text-xs font-medium">{dataset.name}</div>
                      </div>
                    </td>
                    <td className="py-3"><div className="text-gray-400 text-xs">{dataset.type}</div></td>
                    <td className="py-3 text-right"><div className="text-gray-300 text-xs font-mono">{dataset.samples.toLocaleString()}</div></td>
                    <td className="py-3 text-right"><div className="text-gray-300 text-xs">{dataset.size}</div></td>
                    <td className="py-3 text-right">
                      <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                        ● {dataset.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right"><div className="text-gray-500 text-xs">{dataset.uploaded}</div></td>
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

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Database size={48} className="text-gray-600 mx-auto mb-3" />
            <div className="text-gray-400 text-sm">No datasets found</div>
          </div>
        )}
      </Card>
    </div>
  )
}
