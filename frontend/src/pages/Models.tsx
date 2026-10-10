import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Brain, Search, Loader2, RefreshCw, Hash, Cpu, TrendingUp,
  Target, Gauge, Activity, ChevronRight, FileCode
} from 'lucide-react'
import apiClient from '@/lib/api'

const API = 'http://localhost:8000'

interface Model {
  name: string
  precision: number
  recall: number
  mAP50: number
  mAP50_95: number
  model_hash?: string
  model_size_bytes?: number
  parameter_count?: number
  framework?: string
}

export function Models() {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => { loadModels() }, [])

  const loadModels = async () => {
    setLoading(true)
    setError(null)
    try {
      const [modelsRes, fingerprintsRes] = await Promise.all([
        apiClient.getModels().catch(() => ({ data: { models: {} } })),
        fetch(`${API}/api/premium/model/fingerprints`).then(r => r.json()).catch(() => ({ fingerprints: [] })),
      ])
      const data = modelsRes.data
      const fingerprints = fingerprintsRes.fingerprints || []
      let modelsList: Model[] = []
      if (data.models && typeof data.models === 'object') {
        modelsList = Object.values(data.models)
      }
      modelsList = modelsList.map((m: any) => {
        const fp = fingerprints.find((f: any) => f.name?.toLowerCase() === m.name?.toLowerCase())
        return {
          ...m,
          model_hash: fp?.model_hash,
          model_size_bytes: fp?.model_size_bytes,
          parameter_count: fp?.parameter_count,
          framework: fp?.framework,
        }
      })
      setModels(modelsList)
    } catch (err: any) {
      setError(err.message || 'Backend error')
    } finally { setLoading(false) }
  }

  const filtered = models.filter(m =>
    !search || m.name.toLowerCase().includes(search.toLowerCase())
  )

  const avgPrecision = models.length ? models.reduce((s, m) => s + (m.precision || 0), 0) / models.length : 0
  const avgRecall = models.length ? models.reduce((s, m) => s + (m.recall || 0), 0) / models.length : 0
  const avgMAP50 = models.length ? models.reduce((s, m) => s + (m.mAP50 || 0), 0) / models.length : 0
  const avgMAP5095 = models.length ? models.reduce((s, m) => s + (m.mAP50_95 || 0), 0) / models.length : 0

  const getStatus = (v: number) => v >= 50 ? 'GOOD' : v >= 30 ? 'REVIEW' : 'CRITICAL'
  const statusTheme = (v: number) =>
    v >= 50 ? { bg: '#D1FAE5', text: '#065F46', dot: '#10B981', label: 'Healthy' }
    : v >= 30 ? { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B', label: 'Review' }
    : { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444', label: 'Critical' }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-6">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              CV-INTEGRITY / Models
            </div>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">
              Model Registry
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Registered computer vision models with performance metrics and integrity fingerprints.
            </p>
          </div>
          <button
            onClick={loadModels}
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Models', value: models.length, color: '#0F172A', icon: Brain },
            { label: 'Avg Precision', value: `${avgPrecision.toFixed(1)}%`, color: '#3B82F6', icon: Target },
            { label: 'Avg Recall', value: `${avgRecall.toFixed(1)}%`, color: '#8B5CF6', icon: Activity },
            { label: 'Avg mAP50', value: `${avgMAP50.toFixed(1)}%`, color: '#10B981', icon: TrendingUp },
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

        {/* Search */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search models..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-[13px] text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Models grid */}
        <div className="mt-6">
          {loading && models.length === 0 ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-20 text-[13px] text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              Loading models...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <div className="text-[13px] font-medium text-red-700">Failed to load models</div>
              <div className="mt-1 text-[11px] text-red-600">{error}</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center">
              <Brain size={32} className="mx-auto text-slate-400" />
              <div className="mt-3 text-[14px] font-medium text-slate-700">No models found</div>
              <div className="mt-1 text-[11px] text-slate-500">
                {search ? 'Try a different search term' : 'Register a model to get started'}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((m, i) => {
                const theme = statusTheme(m.mAP50 || 0)
                return (
                  <motion.div
                    key={m.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -3 }}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-slate-100 p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700">
                          <Brain size={18} className="text-white" />
                        </div>
                        <div>
                          <div className="text-[14px] font-semibold text-slate-900">{m.name}</div>
                          <div className="mt-0.5 text-[10px] font-mono text-slate-500">
                            {m.framework || 'YOLOv8'}
                          </div>
                        </div>
                      </div>
                      <span
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold"
                        style={{ background: theme.bg, color: theme.text }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: theme.dot }} />
                        {theme.label}
                      </span>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4 p-5">
                      {[
                        { label: 'Precision', value: m.precision || 0, color: '#3B82F6' },
                        { label: 'Recall', value: m.recall || 0, color: '#8B5CF6' },
                        { label: 'mAP50', value: m.mAP50 || 0, color: '#10B981' },
                        { label: 'mAP50-95', value: m.mAP50_95 || 0, color: '#F59E0B' },
                      ].map((metric) => (
                        <div key={metric.label}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-medium text-slate-500">{metric.label}</span>
                            <span className="font-mono text-[11px] font-bold" style={{ color: metric.color }}>
                              {metric.value.toFixed(1)}%
                            </span>
                          </div>
                          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-100">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(metric.value, 100)}%` }}
                              transition={{ duration: 0.6 }}
                              className="h-full rounded-full"
                              style={{ background: metric.color }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    {m.model_hash && (
                      <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Hash size={11} className="text-slate-400" />
                          <span className="truncate font-mono text-[10px] text-slate-500">
                            {m.model_hash.slice(0, 24)}...
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Models
