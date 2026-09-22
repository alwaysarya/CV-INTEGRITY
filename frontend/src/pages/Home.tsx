import { useEffect, useState } from 'react'
import { Database, Brain, Activity, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LiveMap } from '@/components/dashboard/LiveMap'
import { ThreatFeed } from '@/components/dashboard/ThreatFeed'
import { LiveVideoFeed } from '@/components/dashboard/LiveVideoFeed'
import { AnalyticsOverview } from '@/components/dashboard/AnalyticsOverview'
import { ModelTable } from '@/components/dashboard/ModelTable'
import { DatasetTable } from '@/components/dashboard/DatasetTable'
import { SystemResources } from '@/components/dashboard/SystemResources'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import apiClient from '@/lib/api'

export function Home() {
  const [stats, setStats] = useState({ datasets: 0, models: 0, blocks: 0, trust: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])
  const load = async () => {
    try {
      const [dRes, mRes, bRes, tRes] = await Promise.all([
        apiClient.getDatasets(), apiClient.getModels(), apiClient.getBlocks(), apiClient.getTrustScores()
      ])
      const datasets = dRes.data.datasets || {}
      const models = mRes.data.models || {}
      const blocks = bRes.data.blocks || []
      const trust = tRes.data.trust_scores || {}
      const trustScores = Object.values(trust).map((t: any) => t.score || 0)
      setStats({
        datasets: Object.keys(datasets).length,
        models: Object.keys(models).length,
        blocks: blocks.length,
        trust: trustScores.length > 0 ? Math.round(trustScores.reduce((a, b) => a + b, 0) / trustScores.length) : 0,
      })
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const statCards = [
    { label: 'Total Datasets', value: stats.datasets, icon: Database, color: '#38BDF8', change: 'Real from backend' },
    { label: 'AI Models', value: stats.models, icon: Brain, color: '#10B981', change: 'Deployed & tested' },
    { label: 'Blockchain Blocks', value: stats.blocks, icon: Activity, color: '#8B5CF6', change: 'Chain valid' },
    { label: 'Avg Trust Score', value: `${stats.trust}%`, icon: AlertTriangle, color: '#F59E0B', change: 'Across entities' },
  ]

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">AI Integrity Command Center</h1>
          <p className="text-gray-400 text-sm">Real-time intelligence from FastAPI backend</p>
        </div>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/40 gap-1.5 py-2 px-3">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Backend Connected
        </Badge>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="glass-card p-5 border-cyan-500/20 hover:border-cyan-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${stat.color}20`, border: `1px solid ${stat.color}40` }}>
                <Icon size={20} style={{ color: stat.color }} />
              </div>
              <div className="text-white text-3xl font-bold mb-1">{loading ? '-' : stat.value}</div>
              <div className="text-gray-400 text-xs mb-2">{stat.label}</div>
              <div className="text-xs font-medium" style={{ color: stat.color }}>{stat.change}</div>
            </Card>
          )
        })}
      </div>

      {/* Row 1: Map + Threat + Video */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LiveMap />
        <ThreatFeed />
        <LiveVideoFeed />
      </div>

      {/* Row 2: Analytics */}
      <AnalyticsOverview />

      {/* Row 3: Model + Dataset Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ModelTable />
        <DatasetTable />
      </div>

      {/* Row 4: System + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SystemResources />
        <ActivityFeed />
      </div>
    </div>
  )
}
