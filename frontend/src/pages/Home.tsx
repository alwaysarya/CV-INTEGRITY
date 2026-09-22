import { useEffect, useState } from 'react'
import { Database, Brain, AlertTriangle, Activity } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LiveMap } from '@/components/dashboard/LiveMap'
import { ThreatFeed } from '@/components/dashboard/ThreatFeed'
import { LiveVideoFeed } from '@/components/dashboard/LiveVideoFeed'
import { AnalyticsOverview } from '@/components/dashboard/AnalyticsOverview'
import apiClient from '@/lib/api'

export function Home() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.getStats()
      .then((res) => {
        setStats(res.data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Backend not reachable:', err)
        setLoading(false)
      })
  }, [])

  const statCards = [
    { label: 'Total Datasets', value: stats?.stats?.datasets ?? 6, icon: Database, color: '#38BDF8', change: '+2 this week' },
    { label: 'AI Models', value: stats?.stats?.models ?? 4, icon: Brain, color: '#10B981', change: '3 deployed' },
    { label: 'Threats Detected', value: stats?.stats?.attacks_detected ?? 37, icon: AlertTriangle, color: '#EF4444', change: '↑ 12% from yesterday' },
    { label: 'System Uptime', value: '99.9%', icon: Activity, color: '#38BDF8', change: 'All systems operational' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">AI Integrity Command Center</h1>
          <p className="text-gray-400 text-sm">Real-time intelligence for a safer and smarter tomorrow.</p>
        </div>
        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/40">
          🟢 Live
        </Badge>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card
              key={i}
              className="glass-card p-5 border-cyan-500/20 hover:border-cyan-500/40 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}20`, border: `1px solid ${stat.color}40` }}
                >
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
              </div>
              <div className="text-white text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-gray-400 text-xs mb-2">{stat.label}</div>
              <div className="text-xs font-medium" style={{ color: stat.color }}>
                {stat.change}
              </div>
            </Card>
          )
        })}
      </div>

      {/* SECTIONS 1+2+3: 3 EQUAL COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LiveMap />
        <ThreatFeed />
        <LiveVideoFeed />
      </div>

      {/* SECTION 4: ANALYTICS OVERVIEW */}
      <AnalyticsOverview />

    </div>
  )
}
