import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Database, Search, ArrowRight, Loader2, Sparkles, Download } from 'lucide-react'
import apiClient from '@/lib/api'
import { exportCSV, exportJSON } from '@/lib/export'

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

  const handleExportCSV = () => {
    const data = datasets.map(d => ({
      Name: d.name,
      Score: d.overall_score,
      Blur: d.blur_score,
      Duplicate: d.duplicate_score,
      Noise: d.noise_score,
      Images: d.total_images,
      Category: d.category,
    }))
    exportCSV(data, 'datasets')
  }

  const handleExportJSON = () => {
    exportJSON(datasets, 'datasets')
  }

  useEffect(() => { loadDatasets() }, [])

  const loadDatasets = async () => {
    setLoading(true); setError(null)
    try {
      const res = await apiClient.getDatasets().catch(() => ({ data: { datasets: {} } }))
      const data = res.data
      let list: Dataset[] = []
      if (data.datasets && typeof data.datasets === 'object') list = Object.values(data.datasets)
      setDatasets(list)
    } catch (err: any) { setError(err.message) } finally { setLoading(false) }
  }

  const getTheme = (score: number, name: string) => {
    // Name-based (user's dataset names)
    const upperName = (name || '').toUpperCase()
    if (upperName === 'GOOD') return { color: '#30D158', label: 'GOOD' }        // Green
    if (upperName === 'BAD') return { color: '#FF9F0A', label: 'BAD' }          // Yellow/Orange
    if (upperName === 'WORST') return { color: '#FF453A', label: 'WORST' }      // Red
    
    // Fallback: score-based
    if (score >= 90) return { color: '#30D158', label: 'Excellent' }
    if (score >= 75) return { color: '#0A84FF', label: 'Good' }
    if (score >= 50) return { color: '#FF9F0A', label: 'Fair' }
    return { color: '#FF453A', label: 'Poor' }
  }

  const filtered = datasets.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))
  const totalImages = datasets.reduce((s, d) => s + (d.total_images || 0), 0)
  const avgScore = datasets.length ? Math.round(datasets.reduce((s, d) => s + (d.overall_score || 0), 0) / datasets.length) : 0

  return (
    <div className="min-h-screen bg-[#FBFBFD]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>

      {/* ===== HERO — Dramatic Apple Pro style ===== */}
      <section className="relative flex items-center overflow-hidden">
        {/* Massive radial glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[900px] h-[900px] rounded-full blur-[240px] opacity-40"
            style={{ background: 'radial-gradient(circle, #0A84FF, transparent 60%)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-[800px] h-[800px] rounded-full blur-[240px] opacity-30"
            style={{ background: 'radial-gradient(circle, #BF5AF2, transparent 60%)' }} />
        </div>

        {/* Animated grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="datasetsGrid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#1D1D1F" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#datasetsGrid)" />
        </svg>

        <div className="relative mx-auto max-w-[1200px] px-6 pt-24 pb-20 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white backdrop-blur-xl border border-black/[0.06] mb-10">
              <Sparkles size={13} className="text-[#FFD60A]" />
              <span className="text-[#1D1D1F] text-[12px] font-semibold tracking-[0.16em] uppercase">
                Dataset Integrity
              </span>
            </div>

            <h1 className="text-[64px] md:text-[96px] font-semibold leading-[0.95] tracking-[-0.045em] text-[#1D1D1F] max-w-[1000px]">
              Data you can
              <br />
              <span className="bg-gradient-to-r from-[#0A84FF] via-[#5E5CE6] to-[#BF5AF2] bg-clip-text text-transparent">
                trust completely.
              </span>
            </h1>

            <p className="mt-10 max-w-[560px] text-[21px] leading-[1.42] tracking-[-0.015em] text-[#6E6E73]">
              Every dataset scored, hashed, and anchored to the ledger. Verification you can prove.
            </p>
          </motion.div>

          {/* Floating stats — bold, dramatic */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[1000px]"
          >
            {[
              { label: 'Datasets Verified', value: datasets.length, accent: '#0A84FF' },
              { label: 'Total Images', value: totalImages.toLocaleString(), accent: '#BF5AF2' },
              { label: 'Avg Quality', value: `${avgScore}%`, accent: '#30D158' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 + i * 0.1 }}
                className="relative rounded-3xl bg-white backdrop-blur-2xl border border-black/[0.05] p-8 overflow-hidden group hover:bg-white transition-all"
              >
                <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-opacity"
                  style={{ background: stat.accent }} />
                <div className="relative text-[12px] font-semibold tracking-[0.16em] uppercase text-[#86868B] mb-4">
                  {stat.label}
                </div>
                <div className="relative text-[64px] md:text-[72px] font-semibold leading-none tracking-[-0.05em] text-[#1D1D1F] tabular-nums"
                  style={{ textShadow: `0 0 60px ${stat.accent}60` }}>
                  {stat.value}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURED — Cinematic dark card ===== */}
      {datasets.length > 0 && (() => {
        const best = [...datasets].sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0))[0]
        const theme = getTheme(best.overall_score, best.name)
        return (
          <section className="relative bg-[#FBFBFD] py-24 overflow-hidden">
            <div className="mx-auto max-w-[1200px] px-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-[1px] bg-white/30" />
                <span className="text-[11px] font-bold tracking-[0.24em] uppercase text-[#6E6E73]">
                  Featured Dataset
                </span>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="relative rounded-[40px] overflow-hidden border border-black/[0.05]"
              >
                {/* Background glow */}
                <div className="absolute inset-0">
                  <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[180px] opacity-40"
                    style={{ background: `radial-gradient(circle, ${theme.color}, transparent 60%)` }} />
                </div>

                <div className="relative grid grid-cols-1 lg:grid-cols-2">
                  {/* Left: name + description */}
                  <div className="p-10 md:p-14 flex flex-col justify-center">
                    <div className="text-[11px] font-bold tracking-[0.24em] uppercase mb-5"
                      style={{ color: theme.color }}>
                      Highest Overall Score
                    </div>

                    <h2 className="text-[64px] md:text-[80px] font-semibold leading-[0.98] tracking-[-0.045em] text-[#1D1D1F]">
                      {best.name}
                    </h2>

                    <p className="mt-6 text-[19px] leading-[1.5] tracking-[-0.015em] text-[#6E6E73] max-w-[440px]">
                      {best.total_images.toLocaleString()} images verified with end-to-end cryptographic proof.
                    </p>

                    <div className="mt-10 flex flex-wrap items-center gap-3">
                      <a href="#" className="group inline-flex items-center gap-2 rounded-full px-6 py-3 text-[15px] font-semibold tracking-[-0.01em] text-[#1D1D1F] transition-all"
                        style={{ background: theme.color, boxShadow: `0 12px 40px -8px ${theme.color}` }}>
                        Open dataset
                        <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
                      </a>
                      <a href="#" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[15px] font-medium tracking-[-0.01em] text-[#1D1D1F] border border-black/[0.08] hover:bg-[#F5F5F7] transition-all">
                        View details
                      </a>
                    </div>
                  </div>

                  {/* Right: giant score */}
                  <div className="relative p-12 md:p-16 flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                      <div className="flex items-baseline justify-center gap-2 font-semibold leading-none tracking-[-0.06em]"
                        style={{ color: theme.color }}>
                        <span className="text-[120px] md:text-[160px]"
                          style={{ textShadow: `0 0 100px ${theme.color}80` }}>
                          {best.overall_score}
                        </span>
                        <span className="text-[48px] md:text-[56px] opacity-40">%</span>
                      </div>
                      <div className="mt-6 text-[12px] font-bold tracking-[0.24em] uppercase text-[#86868B]">
                        Overall Quality Score
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        )
      })()}

      {/* ===== ALL DATASETS — Cinematic grid ===== */}
      <section className="relative bg-white py-24 px-6">
        <div className="mx-auto max-w-[1200px]">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-[1px] bg-white/30" />
                <span className="text-[11px] font-bold tracking-[0.24em] uppercase text-[#6E6E73]">
                  All Datasets
                </span>
              </div>
              <h2 className="text-[48px] md:text-[56px] font-semibold leading-[0.98] tracking-[-0.04em] text-[#1D1D1F]">
                Full<br />catalog.
              </h2>
            </div>

            <div className="w-full md:w-[360px]">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" strokeWidth={2.2} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search catalog"
                  className="w-full rounded-2xl bg-white border border-black/[0.05] py-4 pl-11 pr-4 text-[15px] text-[#1D1D1F] outline-none placeholder:text-[#AEAEB2] focus:bg-white focus:border-black/[0.1] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Grid */}
          {loading && datasets.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-[420px] rounded-[32px] bg-[#F5F5F7] border border-black/[0.04] animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-32">
              <div className="text-[24px] font-semibold text-[#1D1D1F] mb-2">No datasets found</div>
              <div className="text-[15px] text-[#86868B]">Try a different search term</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((d, i) => {
                const theme = getTheme(d.overall_score || 0, d.name)
                return (
                  <motion.a
                    key={d.name}
                    href="#"
                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -8 }}
                    className="group relative rounded-[28px] overflow-hidden border border-black/[0.06] hover:border-black/[0.12] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] transition-all"
                  >
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent" />

                    {/* Colored top accent glow */}
                    <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
                      style={{ background: theme.color }} />

                    <div className="relative p-7">
                      {/* Top row */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl"
                          style={{ background: `${theme.color}15`, border: `1px solid ${theme.color}30` }}>
                          <Database size={18} style={{ color: theme.color }} strokeWidth={2.2} />
                        </div>
                        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#AEAEB2] tabular-nums">
                          {String(i + 1).padStart(2, '0')}
                        </div>
                      </div>

                      {/* Score — big and bold */}
                      <div className="mb-8">
                        <div className="flex items-baseline gap-2 font-semibold leading-none tracking-[-0.05em] text-[#1D1D1F]">
                          <span className="text-[72px] md:text-[80px]"
                            style={{ textShadow: `0 0 60px ${theme.color}60` }}>
                            {d.overall_score || 0}
                          </span>
                          <span className="text-[32px] opacity-30">%</span>
                        </div>
                        <div className="mt-3 text-[11px] font-bold tracking-[0.2em] uppercase text-[#86868B]">
                          Overall Score
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="h-[1px] bg-[#F5F5F7] mb-6" />

                      {/* Info */}
                      <div className="space-y-3 mb-8">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] tracking-[0.02em] uppercase text-[#86868B] font-semibold">Name</span>
                          <span className="text-[14px] font-semibold text-[#1D1D1F] tracking-[-0.01em]">{d.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] tracking-[0.02em] uppercase text-[#86868B] font-semibold">Images</span>
                          <span className="text-[14px] font-semibold text-[#1D1D1F] tracking-[-0.01em] tabular-nums">{d.total_images.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] tracking-[0.02em] uppercase text-[#86868B] font-semibold">Verified</span>
                          <span className="text-[14px] font-semibold tabular-nums" style={{ color: theme.color }}>SHA-256</span>
                        </div>
                      </div>

                      {/* Metrics — bar strip */}
                      <div className="flex items-center gap-1.5 mb-6">
                        {[
                          { v: d.blur_score || 0, c: '#0A84FF' },
                          { v: d.duplicate_score || 0, c: '#BF5AF2' },
                          { v: d.noise_score || 0, c: '#FF9F0A' },
                        ].map((m, idx) => (
                          <div key={idx} className="flex-1 h-1.5 rounded-full bg-white overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${Math.min(m.v, 100)}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.2, delay: 0.2 + idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                              className="h-full rounded-full"
                              style={{ background: m.c }}
                            />
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[12px] font-medium tracking-[-0.005em] text-[#86868B]">
                          Ready to inspect
                        </span>
                        <div className="flex items-center gap-1.5 text-[13px] font-semibold tracking-[-0.005em] transition-all"
                          style={{ color: theme.color }}>
                          Open
                          <ArrowRight size={13} strokeWidth={2.4} className="transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </motion.a>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ===== BOTTOM CTA — Cinematic ===== */}
      <section className="relative bg-[#FBFBFD] py-32 px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full blur-[240px] opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0A84FF, transparent 60%)' }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1 }}
          className="relative max-w-[900px] mx-auto text-center"
        >
          <h2 className="text-[48px] md:text-[56px] font-semibold leading-[0.98] tracking-[-0.045em] text-[#1D1D1F]">
            Anchor your
            <br />
            <span className="bg-gradient-to-r from-[#0A84FF] to-[#BF5AF2] bg-clip-text text-transparent">
              next dataset.
            </span>
          </h2>

          <p className="mt-8 text-[19px] leading-[1.5] tracking-[-0.015em] text-[#6E6E73] max-w-[480px] mx-auto">
            Upload, verify, and anchor in minutes.
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <a href="/upload" className="group inline-flex items-center gap-2 rounded-full bg-[#0071E3] text-[#1D1D1F] px-8 py-4 text-[15px] font-semibold tracking-[-0.01em] transition-all hover:scale-[1.03]"
              style={{ boxShadow: '0 20px 60px -12px rgba(255,255,255,0.4)' }}>
              Upload Dataset
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
            </a>
            <a href="/help" className="inline-flex items-center gap-2 rounded-full border border-black/[0.1] bg-white backdrop-blur-xl text-[#1D1D1F] px-8 py-4 text-[15px] font-medium tracking-[-0.01em] transition-all hover:bg-[#F5F5F7]">
              Read Docs
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

export default Datasets
