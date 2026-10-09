import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Loader2, RefreshCw, Users, Car, AlertTriangle, Target, TrendingUp, Database, Brain, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'
import axios from 'axios'
import apiClient from '@/lib/api'

const API = 'http://localhost:8000'

const CHART_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

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
        apiClient.getDatasets().catch(() => ({ data: { datasets: {} } })),
        apiClient.getModels().catch(() => ({ data: { models: {} } })),
        apiClient.getBlocks().catch(() => ({ data: { blocks: [] } })),
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
    overall: Number(val.overall_score || 0),
    blur: Number(val.blur_score || 0),
    noise: Number(val.noise_score || 0),
  }))

  const modelChartData = Object.entries(models).map(([key, val]: [string, any]) => ({
    name: key.toUpperCase(),
    precision: Number(val.precision || 0),
    recall: Number(val.recall || 0),
    mAP50: Number(val.mAP50 || 0),
  }))

  const trustChartData = Object.entries(trust).map(([key, val]: [string, any]) => ({
    name: key.toUpperCase(),
    score: Number(val.final_score || 0),
    decision: val.decision || '',
  }))

  const totalDatasets = Object.keys(datasets).length
  const totalModels = Object.keys(models).length
  const avgTrust = trustChartData.length
    ? trustChartData.reduce((s, x) => s + x.score, 0) / trustChartData.length
    : 0
  const totalBlocks = blocks.length

  const metrics = realMetrics || {}
  const peopleCount = metrics.people_count ?? 0
  const vehicleCount = metrics.vehicle_count ?? 0
  const anomalyCount = metrics.anomaly_count ?? 0
  const accuracy = metrics.accuracy ?? 0

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-6">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              CV-INTEGRITY / Analytics
            </div>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">
              Analytics
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Performance metrics, trust scores and operational telemetry across datasets and models.
            </p>
          </div>
          <button
            onClick={loadAll}
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Datasets', value: totalDatasets, color: '#10B981', icon: Database },
            { label: 'Total Models', value: totalModels, color: '#3B82F6', icon: Brain },
            { label: 'Avg Trust Score', value: `${avgTrust.toFixed(1)}%`, color: '#F59E0B', icon: TrendingUp },
            { label: 'Ledger Blocks', value: totalBlocks, color: '#8B5CF6', icon: BarChart3 },
          ].map((s) => (
            <motion.div
              key={s.label}
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="text-[12px] font-medium text-slate-500">{s.label}</div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${s.color}15` }}>
                  <s.icon size={14} style={{ color: s.color }} />
                </div>
              </div>
              <div className="mt-3 text-[32px] font-bold leading-none tracking-tight text-slate-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {s.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Real-time metrics row */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'People Count', value: peopleCount, color: '#10B981', icon: Users },
            { label: 'Vehicle Count', value: vehicleCount, color: '#3B82F6', icon: Car },
            { label: 'Anomalies', value: anomalyCount, color: '#EF4444', icon: AlertTriangle },
            { label: 'Model Accuracy', value: `${accuracy.toFixed(1)}%`, color: '#F59E0B', icon: Target },
          ].map((m) => (
            <div key={m.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md" style={{ background: `${m.color}15` }}>
                  <m.icon size={13} style={{ color: m.color }} />
                </div>
                <span className="text-[11px] font-medium text-slate-500">{m.label}</span>
              </div>
              <div className="mt-3 text-[24px] font-bold tracking-tight text-slate-900">{m.value}</div>
            </div>
          ))}
        </div>

        {/* Charts grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Dataset chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <div className="text-[14px] font-semibold text-slate-900">Dataset Quality</div>
              <div className="mt-0.5 text-[11px] text-slate-500">Overall, blur and noise scores</div>
            </div>
            <div className="h-[260px]">
              {datasetChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datasetChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="name" stroke="#94A3B8" style={{ fontSize: 11 }} />
                    <YAxis stroke="#94A3B8" style={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 11 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="overall" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="blur" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="noise" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-[12px] text-slate-400">
                  No dataset data available
                </div>
              )}
            </div>
          </div>

          {/* Model chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <div className="text-[14px] font-semibold text-slate-900">Model Performance</div>
              <div className="mt-0.5 text-[11px] text-slate-500">Precision, recall and mAP50</div>
            </div>
            <div className="h-[260px]">
              {modelChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={modelChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="name" stroke="#94A3B8" style={{ fontSize: 11 }} />
                    <YAxis stroke="#94A3B8" style={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 11 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="precision" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="recall" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="mAP50" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-[12px] text-slate-400">
                  No model data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trust scores + Donut */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Trust donut */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <div className="text-[14px] font-semibold text-slate-900">Trust Distribution</div>
              <div className="mt-0.5 text-[11px] text-slate-500">Entity trust scores</div>
            </div>
            <div className="h-[240px]">
              {trustChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={trustChartData}
                      dataKey="score"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {trustChartData.map((_: any, i: number) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 11 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-[12px] text-slate-400">
                  No trust data
                </div>
              )}
            </div>
          </div>

          {/* Trust list */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-4">
              <div className="text-[14px] font-semibold text-slate-900">Trust Scores</div>
              <div className="mt-0.5 text-[11px] text-slate-500">Detailed per-entity breakdown</div>
            </div>
            <div className="space-y-2">
              {trustChartData.length > 0 ? trustChartData.map((t: any, i: number) => {
                const color = t.score >= 75 ? '#10B981' : t.score >= 50 ? '#F59E0B' : '#EF4444'
                const label = t.score >= 75 ? 'Accept' : t.score >= 50 ? 'Review' : 'Quarantine'
                return (
                  <div
                    key={t.name}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${color}15` }}>
                        <span className="text-[11px] font-bold" style={{ color }}>{t.name[0]}</span>
                      </div>
                      <div>
                        <div className="text-[12px] font-semibold text-slate-800">{t.name}</div>
                        <div className="text-[10px] text-slate-500">Trust Score</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-1.5 overflow-hidden rounded-full bg-slate-200">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${t.score}%` }}
                          transition={{ duration: 0.8, delay: i * 0.08 }}
                          className="h-full rounded-full"
                          style={{ background: color }}
                        />
                      </div>
                      <span className="font-mono text-[13px] font-bold" style={{ color }}>
                        {t.score.toFixed(0)}%
                      </span>
                      <span
                        className="rounded-md px-2 py-0.5 text-[9px] font-semibold"
                        style={{ background: `${color}15`, color }}
                      >
                        {label}
                      </span>
                    </div>
                  </div>
                )
              }) : (
                <div className="py-8 text-center text-[12px] text-slate-400">No trust data available</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
