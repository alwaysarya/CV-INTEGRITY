import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { AlertTriangle, Search, Eye, Image as ImageIcon, Shield, Upload, Fingerprint, CheckCircle, XCircle } from 'lucide-react'

interface TamperResult {
  id: number
  filename: string
  type: 'Splicing' | 'Copy-Move' | 'Retouching' | 'None'
  confidence: number
  status: 'Tampered' | 'Clean' | 'Suspicious'
  timestamp: string
}

const staticResults: TamperResult[] = [
  { id: 1, filename: 'person_001.jpg', type: 'Copy-Move', confidence: 94, status: 'Tampered', timestamp: '2 min ago' },
  { id: 2, filename: 'street_042.jpg', type: 'None', confidence: 98, status: 'Clean', timestamp: '8 min ago' },
  { id: 3, filename: 'logo_017.png', type: 'Splicing', confidence: 87, status: 'Tampered', timestamp: '15 min ago' },
  { id: 4, filename: 'product_023.jpg', type: 'Retouching', confidence: 72, status: 'Suspicious', timestamp: '28 min ago' },
  { id: 5, filename: 'doc_108.jpg', type: 'None', confidence: 96, status: 'Clean', timestamp: '1 hr ago' },
  { id: 6, filename: 'id_card_055.jpg', type: 'Splicing', confidence: 91, status: 'Tampered', timestamp: '2 hr ago' },
]

const statusColors = {
  Tampered: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.4)' },
  Suspicious: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' },
  Clean: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.4)' },
}

export function TamperDetection() {
  const [results] = useState<TamperResult[]>(staticResults)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')

  const filtered = results.filter((r) => {
    const matchesSearch = r.filename.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || r.status === filter
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: results.length,
    tampered: results.filter((r) => r.status === 'Tampered').length,
    suspicious: results.filter((r) => r.status === 'Suspicious').length,
    clean: results.filter((r) => r.status === 'Clean').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Tamper Detection</h1>
          <p className="text-gray-400 text-sm">Detect image manipulation and forgery</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all">
          <Upload size={16} />
          Upload Image
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Analyzed', value: stats.total, color: '#38BDF8', icon: ImageIcon },
          { label: 'Tampered', value: stats.tampered, color: '#EF4444', icon: XCircle },
          { label: 'Suspicious', value: stats.suspicious, color: '#F59E0B', icon: AlertTriangle },
          { label: 'Clean', value: stats.clean, color: '#10B981', icon: CheckCircle },
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
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-cyan-500/20 text-white placeholder:text-gray-500 h-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'Tampered', 'Suspicious', 'Clean'].map((f) => (
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
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">File</th>
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Type</th>
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3 w-64">Confidence</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Status</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Time</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const colors = statusColors[r.status]
                return (
                  <tr key={r.id} className="border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}>
                          <Fingerprint size={14} style={{ color: colors.text }} />
                        </div>
                        <div className="text-white text-xs font-mono">{r.filename}</div>
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge className="text-[10px] py-0.5 px-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        {r.type}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full rounded-full" style={{
                            width: `${r.confidence}%`,
                            background: `linear-gradient(90deg, ${colors.text}, ${colors.text}aa)`,
                          }} />
                        </div>
                        <span className="text-xs font-bold w-8 text-right" style={{ color: colors.text }}>{r.confidence}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                        ● {r.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right"><div className="text-gray-500 text-xs">{r.timestamp}</div></td>
                    <td className="py-3 text-right">
                      <button className="p-1.5 rounded hover:bg-cyan-500/10 text-gray-400 hover:text-cyan-400 transition-colors">
                        <Eye size={12} />
                      </button>
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
