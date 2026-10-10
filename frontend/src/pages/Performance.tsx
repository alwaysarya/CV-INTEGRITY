import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Activity, Cpu, Loader2, RefreshCw, Target, TrendingUp, BarChart3 } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line
} from 'recharts'
import apiClient from '@/lib/api'

const API = 'http://localhost:8000'

interface ModelPerf {
  name: string
  precision: number
  recall: number
  mAP50: number
  mAP50_95: number
}

export function Performance() {
  const [models, setModels] = useState<ModelPerf[]>([])
  const [blocks, setBlocks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { loadPerformance() }, [])

  const loadPerformance = async () => {
    setLoading(true)
    setError(null)
    try {
      const [mRes, bRes] = await Promise.all([
        apiClient.getModels().catch(() => ({ data: { models: {} } })),
        fetch(`${API}/api/blockchain/live`).then(r => r.json()).catch(() => ({ blocks: [] })),
      ])
      const modelsData = mRes.data.models || {}
      const list: ModelPerf[] = Object.entries(modelsData).map(([key, val]: [string, any]) => ({
        name: key.toUpperCase(),
        precision: val.precision || 0,
        recall: val.recall || 0,
        mAP50: val.mAP50 || 0,
        mAP50_95: val.mAP50_95 || 0,
      }))
      setModels(list)
      setBlocks(bRes.blocks || [])
    } catch (err: any) {
      setError(err.message || 'Backend error')
    } finally { setLoading(false) }
  }

  const avgPrecision = models.length ? models.reduce((s, m) => s + m.precision, 0) / models.length : 0
  const avgRecall = models.length ? models.reduce((s, m) => s + m.recall, 0) / models.length : 0
  const avgMAP50 = models.length ? models.reduce((s, m) => s + m.mAP50, 0) / models.length : 0
  const bestMAP50 = models.length ? Math.max(...models.map(m => m.mAP50)) : 0

  const radarData = models.map(m => ({
    model: m.name,
    precision: m.precision,
    recall: m.recall,
    mAP50: m.mAP50,
    mAP50_95: m.mAP50_95,
  }))

  const blockData = blocks.slice(-15).map((_, i) => ({
    index: i + 1,
    blocks: i + 1,
  }))

  const tooltipStyle = {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '11px',
    color: '#0F172A',
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-6">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              CV-INTEGRITY / Performance
            </div>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">
              Model Performance
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Precision, recall and mAP metrics across all registered models.
            </p>
          </div>
          <button
            onClick={loadPerformance}
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Avg Precision', value: `${avgPrecision.toFixed(1)}%`, color: '#3B82F6', icon: Target },
            { label: 'Avg Recall', value: `${avgRecall.toFixed(1)}%`, color: '#8B5CF6', icon: Activity },
            { label: 'Avg mAP50', value: `${avgMAP50.toFixed(1)}%`, color: '#10B981', icon: TrendingUp },
            { label: 'Best mAP50', value: `${bestMAP50.toFixed(1)}%`, color: '#F59E0B', icon: Zap },
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

        {/* Charts */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Bar chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                <BarChart3 size={14} className="text-blue-600" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-slate-900">Model Comparison</div>
                <div className="mt-0.5 text-[11px] text-slate-500">Precision, recall, mAP50 across models</div>
              </div>
            </div>
            <div className="h-[300px]">
              {models.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={models}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="name" stroke="#94A3B8" style={{ fontSize: 11 }} />
                    <YAxis stroke="#94A3B8" style={{ fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="precision" name="Precision" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="recall" name="Recall" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="mAP50" name="mAP50" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-[12px] text-slate-400">
                  No model data available
                </div>
              )}
            </div>
          </div>

          {/* Radar chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                <Cpu size={14} className="text-emerald-600" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-slate-900">Performance Profile</div>
                <div className="mt-0.5 text-[11px] text-slate-500">Multi-metric radar comparison</div>
              </div>
            </div>
            <div className="h-[300px]">
              {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="model" stroke="#94A3B8" style={{ fontSize: 11 }} />
                    <PolarRadiusAxis stroke="#94A3B8" style={{ fontSize: 10 }} />
                    <Radar name="Precision" dataKey="precision" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                    <Radar name="Recall" dataKey="recall" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                    <Radar name="mAP50" dataKey="mAP50" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-[12px] text-slate-400">
                  No radar data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Model detail table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="text-[14px] font-semibold text-slate-900">Model Detail</div>
            <div className="mt-0.5 text-[11px] text-slate-500">Full metrics per model</div>
          </div>

          {models.length === 0 ? (
            <div className="py-16 text-center">
              <Cpu size={28} className="mx-auto text-slate-400" />
              <div className="mt-2 text-[13px] font-medium text-slate-700">No models</div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-12 gap-4 bg-slate-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                <div className="col-span-4">Model</div>
                <div className="col-span-2">Precision</div>
                <div className="col-span-2">Recall</div>
                <div className="col-span-2">mAP50</div>
                <div className="col-span-2">mAP50-95</div>
              </div>

              {models.map((m, i) => (
                <motion.div
                  key={m.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="grid grid-cols-12 items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                      <Cpu size={14} className="text-emerald-600" />
                    </div>
                    <span className="text-[13px] font-medium text-slate-900">{m.name}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-mono text-[13px] font-semibold text-blue-600">
                      {m.precision.toFixed(1)}%
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-mono text-[13px] font-semibold text-purple-600">
                      {m.recall.toFixed(1)}%
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-mono text-[13px] font-semibold text-emerald-600">
                      {m.mAP50.toFixed(1)}%
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-mono text-[13px] font-semibold text-amber-600">
                      {m.mAP50_95.toFixed(1)}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Performance
