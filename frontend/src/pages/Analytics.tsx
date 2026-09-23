import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, TrendingUp, Users, Target, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import apiClient from '@/lib/api'

export function Analytics() {
  const [datasets, setDatasets] = useState<any>({})
  const [models, setModels] = useState<any>({})
  const [blocks, setBlocks] = useState<any[]>([])
  const [trust, setTrust] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const [dRes, mRes, bRes, tRes] = await Promise.all([
        apiClient.getDatasets(),
        apiClient.getModels(),
        apiClient.getBlocks(),
        apiClient.getTrustScores(),
      ])

      setDatasets(dRes.data.datasets || {})
      setModels(mRes.data.models || {})
      setBlocks(bRes.data.blocks || [])
      setTrust(tRes.data.trust_scores || {})
    } catch (err: any) {
      console.error('Failed:', err)
      setError(err.message || 'Backend connect nahi ho raha')
    } finally {
      setLoading(false)
    }
  }

  // Build chart data from real backend
  const datasetEntries = Object.entries(datasets)
  const modelEntries = Object.entries(models)
  const trustEntries = Object.entries(trust)

  // Chart 1: Dataset Quality Scores
  const datasetChartData = datasetEntries.map(([key, val]: [string, any]) => ({
    name: key.toUpperCase(),
    overall: val.overall_score || 0,
    blur: val.blur_score || 0,
    duplicate: val.duplicate_score || 0,
    noise: val.noise_score || 0,
  }))

  // Chart 2: Model Metrics
  const modelChartData = modelEntries.map(([key, val]: [string, any]) => ({
    name: key.toUpperCase(),
    precision: val.precision || 0,
    recall: val.recall || 0,
    mAP50: val.mAP50 || 0,
    mAP50_95: val.mAP50_95 || 0,
  }))

  // Chart 3: Trust Scores
  const trustChartData = trustEntries.map(([key, val]: [string, any]) => {
    // Try multiple possible score fields
    const score = typeof val === 'number' ? val :
                  val?.score ?? val?.trust_score ?? val?.final_score ?? 0
    return {
      name: key.toUpperCase(),
      score: Number(score) || 0,
    }
  })

  // Chart 4: Blockchain actions
  const actionCounts: Record<string, number> = {}
  blocks.forEach((b: any) => {
    const action = b.data?.action || 'UNKNOWN'
    actionCounts[action] = (actionCounts[action] || 0) + 1
  })
  const blockChartData = Object.entries(actionCounts).map(([name, count]) => ({
    name: name.replace(/_/g, ' '),
    count,
  }))

  const stats = {
    totalDatasets: datasetEntries.length,
    totalModels: modelEntries.length,
    totalBlocks: blocks.length,
    avgTrust: trustEntries.length
      ? Math.round(trustEntries.reduce((s, [, v]: [string, any]) => s + (v.score || 0), 0) / trustEntries.length)
      : 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Analytics</h1>
          <p className="text-gray-400 text-sm">
            {loading ? 'Loading...' : 'Real-time data from FastAPI backend'}
          </p>
        </div>
        <button onClick={loadAll} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-sm font-medium hover:bg-cyan-500/30 transition-all">
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
          { label: 'Total Datasets', value: stats.totalDatasets, color: '#38BDF8', icon: Activity },
          { label: 'AI Models', value: stats.totalModels, color: '#10B981', icon: TrendingUp },
          { label: 'Blockchain Blocks', value: stats.totalBlocks, color: '#8B5CF6', icon: Users },
          { label: 'Avg Trust Score', value: `${stats.avgTrust}%`, color: '#F59E0B', icon: Target },
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

      {loading ? (
        <Card className="glass-card border-cyan-500/20 p-12">
          <div className="flex items-center justify-center">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
            <span className="ml-3 text-gray-400">Loading analytics...</span>
          </div>
        </Card>
      ) : (
        <>
          {/* Chart 1: Dataset Quality */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="glass-card border-cyan-500/20 p-5">
              <div className="mb-4">
                <h3 className="text-white font-bold text-sm">DATASET QUALITY SCORES</h3>
                <p className="text-gray-500 text-xs mt-0.5">From backend: real quality metrics</p>
              </div>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datasetChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(56, 189, 248, 0.1)" />
                    <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#475569" tick={{ fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="overall" fill="#38BDF8" radius={[8, 8, 0, 0]} name="Overall" />
                    <Bar dataKey="blur" fill="#F59E0B" radius={[8, 8, 0, 0]} name="Blur" />
                    <Bar dataKey="noise" fill="#10B981" radius={[8, 8, 0, 0]} name="Noise" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="glass-card border-cyan-500/20 p-5">
              <div className="mb-4">
                <h3 className="text-white font-bold text-sm">MODEL PERFORMANCE</h3>
                <p className="text-gray-500 text-xs mt-0.5">From backend: real model metrics</p>
              </div>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={modelChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(56, 189, 248, 0.1)" />
                    <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="precision" fill="#38BDF8" radius={[8, 8, 0, 0]} name="Precision" />
                    <Bar dataKey="recall" fill="#8B5CF6" radius={[8, 8, 0, 0]} name="Recall" />
                    <Bar dataKey="mAP50" fill="#10B981" radius={[8, 8, 0, 0]} name="mAP50" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Chart 2: Trust Scores */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="glass-card border-cyan-500/20 p-5">
              <div className="mb-4">
                <h3 className="text-white font-bold text-sm">TRUST SCORE COMPARISON</h3>
                <p className="text-gray-500 text-xs mt-0.5">From backend: entity trust scores</p>
              </div>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trustChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(56, 189, 248, 0.1)" />
                    <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#475569" tick={{ fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', fontSize: '11px' }} />
                    <Bar dataKey="score" fill="url(#trustGrad)" radius={[8, 8, 0, 0]} name="Trust Score" />
                    <defs>
                      <linearGradient id="trustGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#38BDF8" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="glass-card border-cyan-500/20 p-5">
              <div className="mb-4">
                <h3 className="text-white font-bold text-sm">BLOCKCHAIN ACTIVITY</h3>
                <p className="text-gray-500 text-xs mt-0.5">From backend: block actions breakdown</p>
              </div>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={blockChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(56, 189, 248, 0.1)" />
                    <XAxis type="number" stroke="#475569" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fontSize: 9 }} width={120} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', fontSize: '11px' }} />
                    <Bar dataKey="count" fill="#8B5CF6" radius={[0, 8, 8, 0]} name="Blocks" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
