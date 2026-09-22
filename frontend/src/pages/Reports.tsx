import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { FileText, Search, Eye, Download, Plus, Filter, BarChart3, Shield, TrendingUp, AlertTriangle } from 'lucide-react'

interface Report {
  id: number
  title: string
  type: 'Trust' | 'Drift' | 'Security' | 'Performance' | 'Analytics'
  author: string
  status: 'Final' | 'Draft' | 'Archived'
  createdAt: string
  size: string
}

const staticReports: Report[] = [
  { id: 1, title: 'Q4 2026 Trust Score Analysis', type: 'Trust', author: 'Aryan Thakur', status: 'Final', createdAt: '2026-09-22', size: '2.4 MB' },
  { id: 2, title: 'YOLOv8n Drift Report', type: 'Drift', author: 'Priya Sharma', status: 'Final', createdAt: '2026-09-20', size: '1.8 MB' },
  { id: 3, title: 'Cybersecurity Incident Summary', type: 'Security', author: 'Rohan Mehta', status: 'Final', createdAt: '2026-09-18', size: '3.2 MB' },
  { id: 4, title: 'API Performance Benchmark', type: 'Performance', author: 'Sneha Kapoor', status: 'Draft', createdAt: '2026-09-16', size: '956 KB' },
  { id: 5, title: 'Monthly Analytics Overview', type: 'Analytics', author: 'Aryan Thakur', status: 'Final', createdAt: '2026-09-15', size: '4.1 MB' },
  { id: 6, title: 'Old Blockchain Audit', type: 'Security', author: 'Vikram Singh', status: 'Archived', createdAt: '2026-08-28', size: '1.2 MB' },
]

const typeColors = {
  Trust: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.4)', icon: Shield },
  Drift: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)', icon: TrendingUp },
  Security: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.4)', icon: AlertTriangle },
  Performance: { bg: 'rgba(56, 189, 248, 0.15)', text: '#38BDF8', border: 'rgba(56, 189, 248, 0.4)', icon: BarChart3 },
  Analytics: { bg: 'rgba(139, 92, 246, 0.15)', text: '#8B5CF6', border: 'rgba(139, 92, 246, 0.4)', icon: BarChart3 },
}

const statusColors = {
  Final: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.4)' },
  Draft: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' },
  Archived: { bg: 'rgba(107, 114, 128, 0.15)', text: '#9CA3AF', border: 'rgba(107, 114, 128, 0.4)' },
}

export function Reports() {
  const [reports] = useState<Report[]>(staticReports)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')

  const filtered = reports.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || r.type === filter
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: reports.length,
    final: reports.filter((r) => r.status === 'Final').length,
    drafts: reports.filter((r) => r.status === 'Draft').length,
    archived: reports.filter((r) => r.status === 'Archived').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Reports</h1>
          <p className="text-gray-400 text-sm">Generated reports across all modules</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all">
          <Plus size={16} />
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Reports', value: stats.total, color: '#38BDF8', icon: FileText },
          { label: 'Final', value: stats.final, color: '#10B981', icon: Shield },
          { label: 'Drafts', value: stats.drafts, color: '#F59E0B', icon: FileText },
          { label: 'Archived', value: stats.archived, color: '#9CA3AF', icon: FileText },
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
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-cyan-500/20 text-white placeholder:text-gray-500 h-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'Trust', 'Drift', 'Security', 'Performance', 'Analytics'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
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
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Report</th>
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Type</th>
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Author</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Size</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Status</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Date</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((report) => {
                const tColors = typeColors[report.type]
                const sColors = statusColors[report.status]
                const TypeIcon = tColors.icon
                return (
                  <tr key={report.id} className="border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: tColors.bg, border: `1px solid ${tColors.border}` }}>
                          <FileText size={14} style={{ color: tColors.text }} />
                        </div>
                        <div className="text-white text-xs font-medium">{report.title}</div>
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: tColors.bg, color: tColors.text, border: `1px solid ${tColors.border}` }}>
                        <TypeIcon size={9} className="inline mr-0.5" />
                        {report.type}
                      </Badge>
                    </td>
                    <td className="py-3"><div className="text-gray-400 text-xs">{report.author}</div></td>
                    <td className="py-3 text-right"><div className="text-gray-300 text-xs font-mono">{report.size}</div></td>
                    <td className="py-3 text-right">
                      <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: sColors.bg, color: sColors.text, border: `1px solid ${sColors.border}` }}>
                        ● {report.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right"><div className="text-gray-500 text-xs font-mono">{report.createdAt}</div></td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded hover:bg-cyan-500/10 text-gray-400 hover:text-cyan-400 transition-colors">
                          <Eye size={12} />
                        </button>
                        <button className="p-1.5 rounded hover:bg-cyan-500/10 text-gray-400 hover:text-cyan-400 transition-colors">
                          <Download size={12} />
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
            <FileText size={48} className="text-gray-600 mx-auto mb-3" />
            <div className="text-gray-400 text-sm">No reports found</div>
          </div>
        )}
      </Card>
    </div>
  )
}
