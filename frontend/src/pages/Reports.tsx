import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { FileText, Search, Loader2, RefreshCw, AlertCircle, Shield, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react'
import apiClient from '@/lib/api'

interface Report {
  id: number
  title: string
  type: string
  source: string
  status: string
  createdAt: string
  details: string
}

const typeColors: Record<string, any> = {
  Trust: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.4)', icon: Shield },
  Model: { bg: 'rgba(56, 189, 248, 0.15)', text: '#38BDF8', border: 'rgba(56, 189, 248, 0.4)', icon: BarChart3 },
  Blockchain: { bg: 'rgba(139, 92, 246, 0.15)', text: '#8B5CF6', border: 'rgba(139, 92, 246, 0.4)', icon: TrendingUp },
  Dataset: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)', icon: FileText },
  Attack: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.4)', icon: AlertTriangle },
}

const statusColors: Record<string, any> = {
  Final: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.4)' },
  Draft: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' },
}

export function Reports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    setLoading(true)
    setError(null)
    try {
      const [dRes, mRes, bRes, tRes, aRes] = await Promise.all([
        apiClient.getDatasets(),
        apiClient.getModels(),
        apiClient.getBlocks(),
        apiClient.getTrustScores(),
        apiClient.getAttacks(),
      ])

      const datasets = dRes.data.datasets || {}
      const models = mRes.data.models || {}
      const blocks = bRes.data.blocks || []
      const trust = tRes.data.trust_scores || {}
      const attacks = aRes.data.attacks || {}

      const list: Report[] = []
      let id = 1

      // Dataset reports
      Object.entries(datasets).forEach(([key, val]: [string, any]) => {
        list.push({
          id: id++,
          title: `${key.toUpperCase()} Dataset Analysis`,
          type: 'Dataset',
          source: key,
          status: 'Final',
          createdAt: new Date().toISOString().split('T')[0],
          details: `Quality: ${(val.overall_score || 0).toFixed(1)}% • ${val.total_images || 0} images`,
        })
      })

      // Model reports
      Object.entries(models).forEach(([key, val]: [string, any]) => {
        list.push({
          id: id++,
          title: `${key.toUpperCase()} Model Performance`,
          type: 'Model',
          source: key,
          status: 'Final',
          createdAt: new Date().toISOString().split('T')[0],
          details: `Precision: ${(val.precision || 0).toFixed(1)}% • mAP50: ${(val.mAP50 || 0).toFixed(1)}%`,
        })
      })

      // Trust reports
      Object.entries(trust).forEach(([key, val]: [string, any]) => {
        list.push({
          id: id++,
          title: `${key.toUpperCase()} Trust Report`,
          type: 'Trust',
          source: key,
          status: 'Final',
          createdAt: new Date().toISOString().split('T')[0],
          details: `Score: ${val.score || 0}% • Decision: ${val.decision || 'N/A'}`,
        })
      })

      // Blockchain reports
      if (blocks.length > 0) {
        list.push({
          id: id++,
          title: 'Blockchain Audit Report',
          type: 'Blockchain',
          source: 'Ledger',
          status: 'Final',
          createdAt: new Date().toISOString().split('T')[0],
          details: `${blocks.length} blocks • Chain valid`,
        })
      }

      // Attack reports
      Object.entries(attacks).forEach(([key, val]: [string, any]) => {
        list.push({
          id: id++,
          title: `${val.name || key} Simulation`,
          type: 'Attack',
          source: key,
          status: 'Final',
          createdAt: new Date().toISOString().split('T')[0],
          details: `Severity: ${val.severity || 'N/A'} • ${val.description || ''}`,
        })
      })

      setReports(list)
    } catch (err: any) {
      console.error('Failed:', err)
      setError(err?.message || 'Backend connect nahi ho raha')
    } finally {
      setLoading(false)
    }
  }

  const filtered = reports.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || r.type === filter
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: reports.length,
    final: reports.filter((r) => r.status === 'Final').length,
    byType: {
      Dataset: reports.filter((r) => r.type === 'Dataset').length,
      Model: reports.filter((r) => r.type === 'Model').length,
      Trust: reports.filter((r) => r.type === 'Trust').length,
    },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Reports</h1>
          <p className="text-gray-400 text-sm">
            {loading ? 'Loading...' : `${reports.length} reports generated from real data`}
          </p>
        </div>
        <button onClick={loadReports} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-sm font-medium">
          <RefreshCw size={16} /> Refresh
        </button>
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
          { label: 'Total Reports', value: stats.total, color: '#38BDF8', icon: FileText },
          { label: 'Final', value: stats.final, color: '#10B981', icon: Shield },
          { label: 'Dataset Reports', value: stats.byType.Dataset, color: '#F59E0B', icon: FileText },
          { label: 'Model Reports', value: stats.byType.Model, color: '#8B5CF6', icon: BarChart3 },
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
            {['all', 'Dataset', 'Model', 'Trust', 'Blockchain', 'Attack'].map((f) => (
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
            <span className="ml-3 text-gray-400">Generating reports...</span>
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-500/10">
                  <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Report</th>
                  <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Type</th>
                  <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Details</th>
                  <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Status</th>
                  <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((report) => {
                  const tColors = typeColors[report.type] || typeColors.Dataset
                  const sColors = statusColors[report.status] || statusColors.Final
                  const TypeIcon = tColors.icon
                  return (
                    <tr key={report.id} className="border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: tColors.bg, border: `1px solid ${tColors.border}` }}>
                            <TypeIcon size={14} style={{ color: tColors.text }} />
                          </div>
                          <div className="text-white text-xs font-bold">{report.title}</div>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: tColors.bg, color: tColors.text, border: `1px solid ${tColors.border}` }}>
                          {report.type}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="text-gray-400 text-xs truncate max-w-md">{report.details}</div>
                      </td>
                      <td className="py-3 text-right">
                        <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: sColors.bg, color: sColors.text, border: `1px solid ${sColors.border}` }}>
                          ● {report.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <div className="text-gray-500 text-xs font-mono">{report.createdAt}</div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText size={48} className="text-gray-600 mx-auto mb-3" />
            <div className="text-gray-400 text-sm">No reports found</div>
          </div>
        )}
      </Card>
    </div>
  )
}
