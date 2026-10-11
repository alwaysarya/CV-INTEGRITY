import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Database, Search, Loader2, TrendingUp, Image as ImageIcon, AlertTriangle
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
        <motion.div initial={{ width: 0 }} animate={{ width: typeof value === 'string' && value.includes('%') ? value : '60%' }} transition={{ duration: 0.8 }} className="h-full rounded-full" style={{ background: color }} />
      </div>
    </motion.div>
  )
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
      const res = await apiClient.getDatasets().catch(() => ({ data: { datasets: {} } }))
      const data = res.data
      let list: Dataset[] = []
      if (data.datasets && typeof data.datasets === 'object') list = Object.values(data.datasets)
      setDatasets(list)
    } catch (err: any) { setError(err.message) } finally { setLoading(false) }
  }

  const filtered = datasets.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))
  const totalImages = datasets.reduce((s, d) => s + (d.total_images || 0), 0)
  const avgScore = datasets.length ? Math.round(datasets.reduce((s, d) => s + (d.overall_score || 0), 0) / datasets.length) : 0
  const reviewCount = datasets.filter((d) => (d.category || '').toUpperCase() === 'MODERATE').length

  const getTheme = (score: number) => {
    if (score >= 90) return { color: '#34C759', label: 'Excellent' }
    if (score >= 75) return { color: '#0071E3', label: 'Good' }
    if (score >= 50) return { color: '#FF9500', label: 'Fair' }
    return { color: '#FF3B30', label: 'Poor' }
  }

  return (
    <div className="min-h-screen bg-[#FBFBFD]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>
      {/* Hero */}
      <section className="mx-auto max-w-[1200px] px-6 pt-20 pb-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-[12px] font-medium tracking-[0.14em] text-[#86868B] uppercase">
            CV-INTEGRITY / Datasets
          </div>
          <h1 className="mt-4 text-[56px] font-semibold leading-[1.05] tracking-[-0.025em] text-[#1D1D1F]">
            Dataset Integrity
          </h1>
          <p className="mt-5 max-w-[640px] text-[19px] leading-relaxed text-[#86868B]">
            Quality assessment, blur, noise and duplicate detection across registered datasets.
          </p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-[1200px] px-6 pb-16">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Datasets" value={datasets.length} color="#1D1D1F" icon={Database} />
          <StatCard label="Total Images" value={totalImages.toLocaleString()} color="#0071E3" icon={ImageIcon} />
          <StatCard label="Avg Quality" value={`${avgScore}%`} color="#34C759" icon={TrendingUp} />
          <StatCard label="Needs Review" value={reviewCount} color="#FF9500" icon={AlertTriangle} />
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
              placeholder="Search datasets..."
              className="w-full rounded-xl border border-[#D2D2D7] bg-white py-3 pl-11 pr-4 text-[14px] text-[#1D1D1F] outline-none placeholder:text-[#86868B] focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20"
            />
          </div>
        </div>
      </section>

      {/* Datasets */}
      <section className="mx-auto max-w-[1200px] px-6 pb-20">
        {loading && datasets.length === 0 ? (
          <div className="flex items-center justify-center gap-2 rounded-[18px] bg-white py-32 text-[14px] text-[#86868B] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <Loader2 size={18} className="animate-spin" />
            Loading datasets...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[18px] bg-white py-32 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <Database size={32} className="mx-auto text-[#86868B]" />
            <div className="mt-4 text-[17px] font-medium text-[#1D1D1F]">No datasets found</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {filtered.map((d, i) => {
              const theme = getTheme(d.overall_score)
              return (
                <motion.div
                  key={d.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -4 }}
                  className="overflow-hidden rounded-[18px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex items-center justify-between border-b border-[#F5F5F7] px-7 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0071E3]">
                        <Database size={20} className="text-white" />
                      </div>
                      <div>
                        <div className="text-[17px] font-semibold text-[#1D1D1F]">{d.name}</div>
                        <div className="mt-0.5 text-[12px] text-[#86868B]">{d.total_images} images</div>
                      </div>
                    </div>
                    <span className="rounded-full px-3 py-1 text-[11px] font-semibold" style={{ background: `${theme.color}15`, color: theme.color }}>
                      {theme.label}
                    </span>
                  </div>

                  <div className="p-7">
                    <div className="flex items-baseline gap-2">
                      <div className="text-[56px] font-semibold leading-none tracking-[-0.04em]" style={{ color: theme.color }}>
                        {d.overall_score || 0}
                      </div>
                      <span className="text-[20px] font-medium" style={{ color: theme.color }}>%</span>
                    </div>
                    <div className="mt-2 text-[13px] text-[#86868B]">Overall quality score</div>

                    <div className="mt-7 grid grid-cols-3 gap-4">
                      {[
                        { label: 'Blur', value: d.blur_score || 0, color: '#0071E3' },
                        { label: 'Duplicate', value: d.duplicate_score || 0, color: '#AF52DE' },
                        { label: 'Noise', value: d.noise_score || 0, color: '#FF9500' },
                      ].map((m) => (
                        <div key={m.label}>
                          <div className="flex items-center justify-between text-[12px]">
                            <span className="font-medium text-[#86868B]">{m.label}</span>
                            <span className="font-mono font-semibold" style={{ color: m.color }}>{m.value}</span>
                          </div>
                          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#F5F5F7]">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(m.value, 100)}%` }} transition={{ duration: 0.6 }} className="h-full rounded-full" style={{ background: m.color }} />
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
      </section>
    </div>
  )
}

export default Datasets
