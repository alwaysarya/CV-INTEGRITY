import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Loader2, RefreshCw, Users, Car, AlertTriangle, Target, Radio, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import axios from 'axios'
import apiClient from '@/lib/api'

const API = 'http://localhost:8000'

export function Analytics() {
  const [datasets, setDatasets] = useState<any>({})
  const [models, setModels] = useState<any>({})
  const [blocks, setBlocks] = useState<any[]>([])
  const [trust, setTrust] = useState<any>({})
  const [realMetrics, setRealMetrics] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const [dRes, mRes, bRes, tRes, metricsRes] = await Promise.all([
        apiClient.getDatasets(),
        apiClient.getModels(),
        apiClient.getBlocks(),
        apiClient.getTrustScores().catch(() => ({ data: { trust_scores: {} } })),
        axios.get(`${API}/api/analytics/metrics`).catch(() => ({ data: { metrics: {} } })),
      ])
      setDatasets(dRes.data.datasets || {})
      setModels(mRes.data.models || {})
      setBlocks(bRes.data.blocks || [])
      setTrust(tRes.data.trust_scores || {})
      setRealMetrics(metricsRes.data.metrics || {})
    } catch (err: any) {
      setError(err.message || 'Backend error')
    } finally { setLoading(false) }
  }

  const datasetChartData = Object.entries(datasets).map(([key, val]: [string, any]) => ({
    name: key.toUpperCase(),
    overall: val.overall_score || 0,
    blur: val.blur_score || 0,
    noise: val.noise_score || 0,
  }))

  const modelChartData = Object.entries(models).map(([key, val]: [string, any]) => ({
    name: key.toUpperCase(),
    precision: val.precision || 0,
    recall: val.recall || 0,
    mAP50: val.mAP50 || 0,
  }))

  const actionCounts: Record<string, number> = {}
  blocks.forEach((b: any) => {
    const action = b.data?.action || 'UNKNOWN'
    actionCounts[action] = (actionCounts[action] || 0) + 1
  })
  const blockChartData = Object.entries(actionCounts).map(([name, count]) => ({
    name: name.replace(/_/g, ' '),
    count,
  }))

  const trustEntries = Object.entries(trust)
  const avgTrust = trustEntries.length
    ? Math.round(trustEntries.reduce((s: number, [, v]: [string, any]) => s + (v.final_score || 0), 0) / trustEntries.length)
    : 0

  const stats = {
    datasets: Object.keys(datasets).length,
    models: Object.keys(models).length,
    blocks: blocks.length,
    avgTrust,
  }

  const chartTooltipStyle = {
    backgroundColor: '#0A0F14',
    border: '1px solid rgba(94, 234, 212, 0.3)',
    borderRadius: '4px',
    fontSize: '11px',
    color: '#FFFFFF',
  }

  return (
    <div className="min-h-screen p-6" style={{ background: '#08080C', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Top header */}
      <div className="flex items-center justify-between mb-6 pb-4"
        style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center"
            style={{ background: 'rgba(94, 234, 212, 0.1)', border: '1px solid rgba(94, 234, 212, 0.4)' }}>
            <BarChart3 size={14} style={{ color: '#5EEAD4' }} />
          </div>
          <div>
            <div className="text-[13px] font-bold tracking-[0.2em]" style={{ color: '#5EEAD4' }}>ANALYTICS</div>
            <div className="text-[9px] tracking-[0.2em]" style={{ color: '#5EEAD4', opacity: 0.5 }}>PERFORMANCE_METRICS · LIVE_VIEW</div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded"
          style={{ background: 'rgba(94, 234, 212, 0.08)', border: '1px solid rgba(94, 234, 212, 0.3)' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#5EEAD4' }} />
          <span className="text-[10px] font-mono tracking-wider" style={{ color: '#5EEAD4' }}>REAL_DATA</span>
        </div>

        <button onClick={loadAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono tracking-wider"
          style={{ background: 'rgba(94, 234, 212, 0.08)', border: '1px solid rgba(94, 234, 212, 0.3)', color: '#5EEAD4' }}>
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
          REFRESH
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded flex items-center gap-2"
          style={{ background: 'rgba(248, 113, 113, 0.08)', border: '1px solid rgba(248, 113, 113, 0.3)' }}>
          <AlertTriangle size={14} style={{ color: '#F87171' }} />
          <span className="text-[11px] font-mono" style={{ color: '#F87171' }}>{error}</span>
        </div>
      )}

      {/* Real Metrics from /api/analytics/metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'PEOPLE_COUNT', value: (realMetrics.people_count ?? 0).toLocaleString(), icon: Users, color: '#5EEAD4' },
          { label: 'VEHICLE_COUNT', value: (realMetrics.vehicle_count ?? 0).toLocaleString(), icon: Car, color: '#38BDF8' },
          { label: 'ANOMALY_COUNT', value: String(realMetrics.anomaly_count ?? 0), icon: AlertTriangle, color: '#F87171' },
          { label: 'MODEL_ACCURACY', value: `${(realMetrics.accuracy ?? 0).toFixed(1)}%`, icon: Target, color: '#A78BFA' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="p-4 rounded"
              style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-mono tracking-[0.2em]" style={{ color: '#5EEAD4', opacity: 0.5 }}>{s.label}</div>
                <Icon size={14} style={{ color: s.color, opacity: 0.7 }} />
              </div>
              <div className="text-[28px] font-bold font-mono leading-none" style={{ color: s.color }}>{s.value}</div>
            </div>
          )
        })}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'TOTAL_DATASETS', value: stats.datasets },
          { label: 'TOTAL_MODELS', value: stats.models },
          { label: 'TOTAL_BLOCKS', value: stats.blocks },
          { label: 'AVG_TRUST', value: `${stats.avgTrust}%` },
        ].map((s, i) => (
          <div key={i} className="p-4 rounded flex items-center justify-between"
            style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
            <span className="text-[10px] font-mono tracking-[0.2em]" style={{ color: '#5EEAD4', opacity: 0.5 }}>{s.label}</span>
            <span className="text-[20px] font-bold font-mono" style={{ color: '#FFFFFF' }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Charts */}
      {loading ? (
        <div className="p-12 rounded flex items-center justify-center"
          style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
          <Loader2 className="animate-spin" size={28} style={{ color: '#5EEAD4' }} />
          <span className="ml-3 text-[12px] font-mono" style={{ color: '#5EEAD4', opacity: 0.6 }}>LOADING...</span>
        </div>
      ) : (
        <>
          {/* Row 1: Dataset + Model charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
            <div className="p-5 rounded" style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
              <div className="mb-4">
                <h3 className="font-bold text-[11px] font-mono tracking-[0.2em]" style={{ color: '#5EEAD4' }}>DATASET_QUALITY_SCORES</h3>
                <p className="text-[10px] font-mono mt-0.5" style={{ color: '#5EEAD4', opacity: 0.4 }}>FROM /api/datasets</p>
              </div>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datasetChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(94, 234, 212, 0.08)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#5EEAD4', opacity: 0.6 }} tickLine={false} axisLine={{ stroke: 'rgba(94, 234, 212, 0.2)' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#5EEAD4', opacity: 0.6 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
                    <Bar dataKey="overall" fill="#5EEAD4" radius={[3, 3, 0, 0]} name="OVERALL" />
                    <Bar dataKey="blur" fill="#38BDF8" radius={[3, 3, 0, 0]} name="BLUR" />
                    <Bar dataKey="noise" fill="#A78BFA" radius={[3, 3, 0, 0]} name="NOISE" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-5 rounded" style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
              <div className="mb-4">
                <h3 className="font-bold text-[11px] font-mono tracking-[0.2em]" style={{ color: '#5EEAD4' }}>MODEL_PERFORMANCE</h3>
                <p className="text-[10px] font-mono mt-0.5" style={{ color: '#5EEAD4', opacity: 0.4 }}>FROM /api/models</p>
              </div>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={modelChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(94, 234, 212, 0.08)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#5EEAD4', opacity: 0.6 }} tickLine={false} axisLine={{ stroke: 'rgba(94, 234, 212, 0.2)' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#5EEAD4', opacity: 0.6 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
                    <Bar dataKey="precision" fill="#5EEAD4" radius={[3, 3, 0, 0]} name="PRECISION" />
                    <Bar dataKey="recall" fill="#A78BFA" radius={[3, 3, 0, 0]} name="RECALL" />
                    <Bar dataKey="mAP50" fill="#38BDF8" radius={[3, 3, 0, 0]} name="MAP50" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 2: Blockchain Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-5 rounded" style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
              <div className="mb-4">
                <h3 className="font-bold text-[11px] font-mono tracking-[0.2em]" style={{ color: '#5EEAD4' }}>BLOCKCHAIN_ACTIVITY</h3>
                <p className="text-[10px] font-mono mt-0.5" style={{ color: '#5EEAD4', opacity: 0.4 }}>FROM /api/blockchain/live</p>
              </div>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={blockChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(94, 234, 212, 0.08)" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#5EEAD4', opacity: 0.6 }} tickLine={false} axisLine={{ stroke: 'rgba(94, 234, 212, 0.2)' }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: '#5EEAD4', opacity: 0.6 }} tickLine={false} axisLine={false} width={130} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="count" fill="#A78BFA" radius={[0, 3, 3, 0]} name="BLOCKS" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trust Overview */}
            <div className="p-5 rounded" style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
              <div className="mb-4">
                <h3 className="font-bold text-[11px] font-mono tracking-[0.2em]" style={{ color: '#5EEAD4' }}>TRUST_OVERVIEW</h3>
                <p className="text-[10px] font-mono mt-0.5" style={{ color: '#5EEAD4', opacity: 0.4 }}>FROM /api/trust-scores</p>
              </div>
              <div className="space-y-4">
                {trustEntries.map(([key, val]: [string, any]) => {
                  const score = val.final_score || 0
                  const color = score >= 80 ? '#5EEAD4' : score >= 50 ? '#FBBF24' : '#F87171'
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: '#FFFFFF', opacity: 0.8 }}>{key}</span>
                        <span className="text-[13px] font-bold font-mono" style={{ color }}>{score}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(94, 234, 212, 0.1)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                        />
                      </div>
                      <div className="text-[9px] font-mono mt-1" style={{ color: '#5EEAD4', opacity: 0.5 }}>
                        {(val.decision || '').replace(/[✅⚠️❌]/g, '').trim()}
                      </div>
                    </div>
                  )
                })}
                {trustEntries.length === 0 && (
                  <div className="text-[11px] font-mono text-center py-8" style={{ color: '#5EEAD4', opacity: 0.4 }}>
                    NO TRUST DATA
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
