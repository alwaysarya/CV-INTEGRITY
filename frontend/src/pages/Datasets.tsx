import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Database, Search, Loader2, RefreshCw, CheckCircle2, AlertTriangle,
  TrendingUp, Image as ImageIcon, Scan, ShieldCheck, XCircle
} from 'lucide-react'
import apiClient from '@/lib/api'

interface Dataset {
  name: string
  overall_score: number
  blur_score: number
  duplicate_score: number
  noise_score: number
  total_images: number
  category: string
}

export function Datasets() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => { loadDatasets() }, [])

  const loadDatasets = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.getDatasets()
      const data = res.data
      let datasetsList: Dataset[] = []
      if (data.datasets && typeof data.datasets === 'object') {
        datasetsList = Object.values(data.datasets)
      }
      setDatasets(datasetsList)
    } catch (err: any) {
      setError(err.message || 'Backend error')
    } finally { setLoading(false) }
  }

  const filtered = datasets.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))

  const totalImages = datasets.reduce((s, d) => s + (d.total_images || 0), 0)
  const avgScore = datasets.length
    ? Math.round(datasets.reduce((s, d) => s + (d.overall_score || 0), 0) / datasets.length)
    : 0
  const goodCount = datasets.filter((d) => (d.category || '').toUpperCase() === 'GOOD').length
  const reviewCount = datasets.filter((d) => (d.category || '').toUpperCase() === 'REVIEW').length

  const getTheme = (score: number) => {
    if (score >= 75) return { bg: '#D1FAE5', text: '#065F46', dot: '#10B981', label: 'Good' }
    if (score >= 50) return { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B', label: 'Review' }
    return { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444', label: 'Critical' }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-6">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              CV-INTEGRITY / Datasets
            </div>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">
              Dataset Integrity
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Quality assessment, blur, noise and duplicate detection across registered datasets.
            </p>
          </div>
          <button
            onClick={loadDatasets}
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Datasets', value: datasets.length, color: '#0F172A', icon: Database },
            { label: 'Total Images', value: totalImages.toLocaleString(), color: '#3B82F6', icon: ImageIcon },
            { label: 'Avg Quality', value: `${avgScore}%`, color: '#10B981', icon: TrendingUp },
            { label: 'Needs Review', value: reviewCount, color: '#F59E0B', icon: AlertTriangle },
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
              placeholder="Search datasets..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-[13px] text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Datasets grid */}
        <div className="mt-6">
          {loading && datasets.length === 0 ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-20 text-[13px] text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              Loading datasets...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <div className="text-[13px] font-medium text-red-700">Failed to load datasets</div>
              <div className="mt-1 text-[11px] text-red-600">{error}</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center">
              <Database size={32} className="mx-auto text-slate-400" />
              <div className="mt-3 text-[14px] font-medium text-slate-700">No datasets found</div>
              <div className="mt-1 text-[11px] text-slate-500">
                {search ? 'Try a different search term' : 'Upload a dataset to get started'}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((d, i) => {
                const theme = getTheme(d.overall_score || 0)
                return (
                  <motion.div
                    key={d.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -3 }}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-slate-100 p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700">
                          <Database size={18} className="text-white" />
                        </div>
                        <div>
                          <div className="text-[14px] font-semibold text-slate-900">{d.name}</div>
                          <div className="mt-0.5 text-[10px] font-mono text-slate-500">
                            {d.category || 'DATASET'} · {d.total_images || 0} images
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

                    {/* Overall score */}
                    <div className="p-5">
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                            Overall Quality
                          </div>
                          <div className="mt-1 text-[36px] font-bold leading-none tracking-tight" style={{ color: theme.dot }}>
                            {d.overall_score || 0}
                            <span className="text-[16px]">%</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(d.overall_score || 0, 100)}%` }}
                          transition={{ duration: 0.8 }}
                          className="h-full rounded-full"
                          style={{ background: theme.dot }}
                        />
                      </div>
                    </div>

                    {/* Sub-scores */}
                    <div className="border-t border-slate-100 p-5">
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Blur', value: d.blur_score || 0, color: '#3B82F6' },
                          { label: 'Duplicates', value: d.duplicate_score || 0, color: '#8B5CF6' },
                          { label: 'Noise', value: d.noise_score || 0, color: '#F59E0B' },
                        ].map((s) => (
                          <div key={s.label}>
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-medium text-slate-500">{s.label}</span>
                              <span className="font-mono text-[10px] font-semibold" style={{ color: s.color }}>
                                {s.value}
                              </span>
                            </div>
                            <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-100">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(s.value, 100)}%` }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="h-full rounded-full"
                                style={{ background: s.color }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
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

export default Datasets
