import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Database, Brain, Activity, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { LiveMap } from '@/components/dashboard/LiveMap'
import { ThreatFeed } from '@/components/dashboard/ThreatFeed'
import { LiveVideoFeed } from '@/components/dashboard/LiveVideoFeed'
import { AnalyticsOverview } from '@/components/dashboard/AnalyticsOverview'
import { ModelTable } from '@/components/dashboard/ModelTable'
import { DatasetTable } from '@/components/dashboard/DatasetTable'
import { SystemResources } from '@/components/dashboard/SystemResources'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { useAutoRefresh } from '@/lib/useAutoRefresh'
import { useBackendStatus } from '@/lib/useBackendStatus'
import apiClient from '@/lib/api'

export function Home() {
  const [stats, setStats] = useState({ datasets: 0, models: 0, blocks: 0, trust: 0 })
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const { online } = useBackendStatus()

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
        trust: trustScores.length > 0 ? Math.round(trustScores.reduce((a: number, b: number) => a + b, 0) / trustScores.length) : 0,
      })
      setLastUpdate(new Date())
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])
  useAutoRefresh(load, 30000)

  const statCards = [
    { label: 'Total Datasets', value: stats.datasets, icon: Database, color: '#38BDF8', change: 'Real from backend', suffix: '' },
    { label: 'AI Models', value: stats.models, icon: Brain, color: '#10B981', change: 'Deployed & tested', suffix: '' },
    { label: 'Blockchain Blocks', value: stats.blocks, icon: Activity, color: '#8B5CF6', change: 'Chain valid', suffix: '' },
    { label: 'Avg Trust Score', value: stats.trust, icon: AlertTriangle, color: '#F59E0B', change: 'Across entities', suffix: '%' },
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-1">AI Integrity Command Center</h1>
          <p className="text-gray-400 text-sm">
            Real-time • Updated {lastUpdate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {online ? (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/40 gap-1.5 py-2 px-3">
              <span className="live-dot" />
              Backend Online
            </Badge>
          ) : (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/40 gap-1.5 py-2 px-3">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              Backend Offline
            </Badge>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
        ) : (
          statCards.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="liquid-glass specular p-5 border-0 hover-lift">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}20`, border: `1px solid ${stat.color}40` }}>
                      <Icon size={20} style={{ color: stat.color }} />
                    </div>
                    <span className="live-dot" />
                  </div>
                  <div className="text-white text-3xl font-bold mb-1">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-gray-400 text-xs mb-2">{stat.label}</div>
                  <div className="text-xs font-medium" style={{ color: stat.color }}>{stat.change}</div>
                </Card>
              </motion.div>
            )
          })
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        <LiveMap />
        <ThreatFeed />
        <LiveVideoFeed />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <AnalyticsOverview />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <ModelTable />
        <DatasetTable />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <SystemResources />
        <ActivityFeed />
      </motion.div>
    </div>
  )
}
