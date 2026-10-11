import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Brain, Search, Loader2, RefreshCw, Hash, TrendingUp, Target, Activity
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
}

function StatCard({ label, value, color, icon: Icon }: any) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="rounded-[18px] bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-center justify-between">
        <div className="text-[15px] font-medium text-[#86868B]">{label}</div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F5F7]">
          <Icon size={14} className="text-[#1D1D1F]" />
        </div>
      </div>
      <div className="mt-8 text-[48px] font-semibold leading-none tracking-[-0.04em] text-[#1D1D1F]" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-[#F5F5F7]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: typeof value === 'string' && value.includes('%') ? value : '60%' }}
          transition={{ duration: 0.8 }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </motion.div>
  )
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
      let list: Model[] = []
      if (data.models && typeof data.models === 'object') list = Object.values(data.models)
      list = list.map((m: any) => {
        const fp = fingerprints.find((f: any) => f.name?.toLowerCase() === m.name?.toLowerCase())
        return { ...m, model_hash: fp?.model_hash }
      })
      setModels(list)
    } catch (err: any) { setError(err.message) } finally { setLoading(false) }
  }

  const filtered = models.filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()))
  const avgPrecision = models.length ? models.reduce((s, m) => s + (m.precision || 0), 0) / models.length : 0
  const avgRecall = models.length ? models.reduce((s, m) => s + (m.recall || 0), 0) / models.length : 0
  const avgMAP50 = models.length ? models.reduce((s, m) => s + (m.mAP50 || 0), 0) / models.length : 0
  const bestMAP50 = models.length ? Math.max(...models.map(m => m.mAP50 || 0)) : 0

  const getStatus = (v: number) => v >= 50 ? 'GOOD' : v >= 30 ? 'REVIEW' : 'CRITICAL'
  const statusColor = (v: number) => v >= 50 ? '#34C759' : v >= 30 ? '#FF9500' : '#FF3B30'

  return (
    <div className="min-h-screen bg-[#FBFBFD]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>
      {/* Hero */}
      <section className="mx-auto max-w-[1200px] px-6 pt-20 pb-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-[12px] font-medium tracking-[0.14em] text-[#86868B] uppercase">
            CV-INTEGRITY / Models
          </div>
          <h1 className="mt-4 text-[56px] font-semibold leading-[1.05] tracking-[-0.025em] text-[#1D1D1F]">
            Model Registry
          </h1>
          <p className="mt-5 max-w-[640px] text-[19px] leading-relaxed text-[#86868B]">
            Registered computer vision models with performance metrics and integrity fingerprints.
          </p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-[1200px] px-6 pb-16">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Models" value={models.length} color="#1D1D1F" icon={Brain} />
          <StatCard label="Avg Precision" value={`${avgPrecision.toFixed(1)}%`} color="#0071E3" icon={Target} />
          <StatCard label="Avg Recall" value={`${avgRecall.toFixed(1)}%`} color="#FF9500" icon={Activity} />
          <StatCard label="Best mAP50" value={`${bestMAP50.toFixed(1)}%`} color="#34C759" icon={TrendingUp} />
        </div>
      </section>

      {/* Search */}
      <section className="mx-auto max-w-[1200px] px-6 pb-8">
        <div className="rounded-[18px] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search models..."
              className="w-full rounded-xl border border-[#D2D2D7] bg-white py-3 pl-11 pr-4 text-[14px] text-[#1D1D1F] outline-none placeholder:text-[#86868B] focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20"
            />
          </div>
        </div>
      </section>

      {/* Model cards */}
      <section className="mx-auto max-w-[1200px] px-6 pb-20">
        {loading && models.length === 0 ? (
          <div className="flex items-center justify-center gap-2 rounded-[18px] bg-white py-32 text-[14px] text-[#86868B] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <Loader2 size={18} className="animate-spin" />
            Loading models...
          </div>
        ) : error ? (
          <div className="rounded-[18px] bg-white py-32 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <div className="text-[15px] font-medium text-[#1D1D1F]">Failed to load models</div>
            <div className="mt-1 text-[13px] text-[#86868B]">{error}</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[18px] bg-white py-32 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <Brain size={32} className="mx-auto text-[#86868B]" />
            <div className="mt-4 text-[17px] font-medium text-[#1D1D1F]">No models found</div>
            <div className="mt-1 text-[13px] text-[#86868B]">{search ? 'Try a different search term' : 'Register a model to get started'}</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {filtered.map((m, i) => {
              const color = statusColor(m.mAP50)
              const label = m.mAP50 >= 50 ? 'Healthy' : m.mAP50 >= 30 ? 'Review' : 'Critical'
              return (
                <motion.div
                  key={m.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -4 }}
                  className="overflow-hidden rounded-[18px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-[#F5F5F7] px-7 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0071E3]">
                        <Brain size={20} className="text-white" />
                      </div>
                      <div>
                        <div className="text-[17px] font-semibold text-[#1D1D1F]">{m.name}</div>
                        <div className="mt-0.5 text-[12px] text-[#86868B]">Computer vision model</div>
                      </div>
                    </div>
                    <span className="rounded-full px-3 py-1 text-[11px] font-semibold" style={{ background: `${color}15`, color }}>
                      {label}
                    </span>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-5 p-7">
                    {[
                      { label: 'Precision', value: m.precision || 0, color: '#0071E3' },
                      { label: 'Recall', value: m.recall || 0, color: '#FF9500' },
                      { label: 'mAP50', value: m.mAP50 || 0, color: '#34C759' },
                      { label: 'mAP50-95', value: m.mAP50_95 || 0, color: '#AF52DE' },
                    ].map((metric) => (
                      <div key={metric.label}>
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="font-medium text-[#86868B]">{metric.label}</span>
                          <span className="font-mono font-semibold" style={{ color: metric.color }}>{metric.value.toFixed(1)}%</span>
                        </div>
                        <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#F5F5F7]">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(metric.value, 100)}%` }} transition={{ duration: 0.6 }} className="h-full rounded-full" style={{ background: metric.color }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {m.model_hash && (
                    <div className="border-t border-[#F5F5F7] bg-[#FBFBFD] px-7 py-4">
                      <div className="flex items-center gap-2">
                        <Hash size={12} className="text-[#86868B]" />
                        <span className="truncate font-mono text-[11px] text-[#86868B]">{m.model_hash.slice(0, 32)}...</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default Models
