import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Search, Loader2, RefreshCw, Shield, Eye } from 'lucide-react'
import apiClient from '@/lib/api'

const API = 'http://localhost:8000'

interface Report {
  id: number
  title: string
  type: string
  source: string
  status: string
  details: string
}

const typeTheme: Record<string, { color: string; label: string }> = {
  Trust: { color: '#34C759', label: 'Trust' },
  Model: { color: '#0071E3', label: 'Model' },
  Blockchain: { color: '#AF52DE', label: 'Blockchain' },
  Dataset: { color: '#FF9500', label: 'Dataset' },
  Attack: { color: '#FF3B30', label: 'Attack' },
  History: { color: '#5AC8FA', label: 'History' },
}

function StatCard({ label, value, color, icon: Icon }: any) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="rounded-[18px] bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
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
        <motion.div initial={{ width: 0 }} animate={{ width: '60%' }} transition={{ duration: 0.8 }} className="h-full rounded-full" style={{ background: color }} />
      </div>
    </motion.div>
  )
}

export function Reports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => { loadReports() }, [])

  const loadReports = async () => {
    setLoading(true)
    try {
      const [tRes, mRes, dRes, aRes, bRes] = await Promise.all([
        fetch(`${API}/api/trust-scores`).then(r => r.json()).catch(() => ({ trust_scores: {} })),
        apiClient.getModels().catch(() => ({ data: { models: {} } })),
        apiClient.getDatasets().catch(() => ({ data: { datasets: {} } })),
        apiClient.getAttacks().catch(() => ({ data: { attacks: {} } })),
        apiClient.getBlocks().catch(() => ({ data: { blocks: [] } })),
      ])

      setReports([
        { id: 1, title: 'Trust Score Evaluation', type: 'Trust', source: 'Trust Engine', status: 'Ready', details: `${Object.keys(tRes.trust_scores || {}).length} entities evaluated` },
        { id: 2, title: 'Model Integrity Report', type: 'Model', source: 'Model Registry', status: 'Ready', details: `${Object.keys(mRes.data?.models || {}).length} models analyzed` },
        { id: 3, title: 'Dataset Quality Report', type: 'Dataset', source: 'Dataset Analyzer', status: 'Ready', details: `${Object.keys(dRes.data?.datasets || {}).length} datasets reviewed` },
        { id: 4, title: 'Security Threat Report', type: 'Attack', source: 'Threat Detection', status: 'Ready', details: `${Object.keys(aRes.data?.attacks || {}).length} patterns cataloged` },
        { id: 5, title: 'Blockchain Audit Trail', type: 'Blockchain', source: 'Ledger Service', status: 'Ready', details: `${(bRes.data?.blocks || []).length} blocks recorded` },
        { id: 6, title: 'Inference History Log', type: 'History', source: 'Inference Engine', status: 'Ready', details: `Recent events` },
      ])
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const filtered = reports.filter(r => {
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || r.type.toLowerCase() === filter.toLowerCase()
    return matchSearch && matchFilter
  })

  const types = Array.from(new Set(reports.map(r => r.type)))
  const readyCount = reports.filter(r => r.status.toLowerCase().includes('ready')).length

  return (
    <div className="min-h-screen bg-[#FBFBFD]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>
      <section className="mx-auto max-w-[1200px] px-6 pt-20 pb-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[12px] font-medium tracking-[0.14em] text-[#86868B] uppercase">
                CV-INTEGRITY / Reports
              </div>
              <h1 className="mt-4 text-[56px] font-semibold leading-[1.05] tracking-[-0.025em] text-[#1D1D1F]">
                Reports & Evidence
              </h1>
              <p className="mt-5 max-w-[640px] text-[19px] leading-relaxed text-[#86868B]">
                Generated assurance reports, evidence records, and exportable compliance documentation.
              </p>
            </div>
            <button onClick={loadReports} className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1D1D1F] shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-colors hover:bg-[#F5F5F7]">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 pb-16">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Reports" value={reports.length} color="#1D1D1F" icon={FileText} />
          <StatCard label="Ready" value={readyCount} color="#34C759" icon={Shield} />
          <StatCard label="Report Types" value={types.length} color="#0071E3" icon={FileText} />
          <StatCard label="Sources" value={Array.from(new Set(reports.map(r => r.source))).length} color="#AF52DE" icon={FileText} />
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 pb-8">
        <div className="flex flex-col gap-4 rounded-[18px] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports..."
              className="w-full rounded-xl border border-[#D2D2D7] bg-white py-3 pl-11 pr-4 text-[14px] text-[#1D1D1F] outline-none placeholder:text-[#86868B] focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', ...types].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`rounded-full px-4 py-2 text-[13px] font-medium transition-all ${
                  filter === t ? 'bg-[#0071E3] text-white' : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E5E5EA]'
                }`}
              >
                {t === 'all' ? 'All' : t}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 pb-20">
        {loading && reports.length === 0 ? (
          <div className="flex items-center justify-center gap-2 rounded-[18px] bg-white py-32 text-[14px] text-[#86868B] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <Loader2 size={18} className="animate-spin" />
            Loading reports...
          </div>
        ) : (
          <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            {filtered.map((r, i) => {
              const theme = typeTheme[r.type] || { color: '#86868B', label: r.type }
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-5 border-b border-[#F5F5F7] px-8 py-5 transition-colors last:border-b-0 hover:bg-[#FBFBFD]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: `${theme.color}15` }}>
                    <FileText size={18} style={{ color: theme.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[16px] font-medium text-[#1D1D1F]">{r.title}</div>
                    <div className="mt-0.5 text-[13px] text-[#86868B]">{r.details}</div>
                  </div>
                  <span className="rounded-full px-3 py-1 text-[12px] font-medium" style={{ background: `${theme.color}15`, color: theme.color }}>
                    {theme.label}
                  </span>
                  <span className="hidden text-[13px] text-[#86868B] md:inline">{r.source}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#34C759]/10 px-3 py-1 text-[12px] font-semibold text-[#34C759]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#34C759]" />
                    {r.status}
                  </span>
                  <button className="flex h-9 w-9 items-center justify-center rounded-full text-[#86868B] transition-colors hover:bg-[#F5F5F7] hover:text-[#0071E3]">
                    <Eye size={15} />
                  </button>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default Reports
