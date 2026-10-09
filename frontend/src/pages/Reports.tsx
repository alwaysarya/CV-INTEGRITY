import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  FileText, Search, Loader2, RefreshCw, Shield, TrendingUp,
  AlertTriangle, BarChart3, Download, ChevronDown, FileJson, FileType2, Eye
} from 'lucide-react'
import apiClient from '@/lib/api'
import { CoverageStatement } from '@/components/assurance/CoverageStatement'
import jsPDF from 'jspdf'

const API = 'http://localhost:8000'
import autoTable from 'jspdf-autotable'

interface Report {
  id: number
  title: string
  type: string
  source: string
  status: string
  createdAt: string
  details: string
}

const typeTheme: Record<string, { bg: string; text: string; border: string }> = {
  Trust: { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
  Model: { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' },
  Blockchain: { bg: '#EDE9FE', text: '#5B21B6', border: '#C4B5FD' },
  Dataset: { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  Attack: { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' },
  History: { bg: '#E0F2FE', text: '#075985', border: '#7DD3FC' },
}

export function Reports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => { loadReports() }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDownloadMenu(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadReports = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch all data sources in parallel
      const [tRes, mRes, dRes, aRes, bRes] = await Promise.all([
        fetch(`${API}/api/trust-scores`).then(r => r.json()).catch(() => ({ trust_scores: {} })),
        apiClient.getModels().catch(() => ({ data: { models: {} } })),
        apiClient.getDatasets().catch(() => ({ data: { datasets: {} } })),
        apiClient.getAttacks().catch(() => ({ data: { attacks: {} } })),
        apiClient.getBlocks().catch(() => ({ data: { blocks: [] } })),
      ])

      const trustData = tRes.trust_scores || {}
      const modelsData = mRes.data?.models || {}
      const datasetsData = dRes.data?.datasets || {}
      const attacksData = aRes.data?.attacks || {}
      const blocksData = bRes.data?.blocks || []

      const now = new Date().toISOString()
      const generated: Report[] = [
        {
          id: 1,
          title: 'Trust Score Evaluation',
          type: 'Trust',
          source: 'Trust Engine',
          status: 'Ready',
          createdAt: now,
          details: `${Object.keys(trustData).length} entities evaluated · avg ${Object.keys(trustData).length ? Math.round(Object.values(trustData).reduce((s: number, t: any) => s + (t.final_score || 0), 0) / Object.keys(trustData).length) : 0}%`,
        },
        {
          id: 2,
          title: 'Model Integrity Report',
          type: 'Model',
          source: 'Model Registry',
          status: 'Ready',
          createdAt: now,
          details: `${Object.keys(modelsData).length} models analyzed · mAP50 avg ${Object.keys(modelsData).length ? (Object.values(modelsData).reduce((s: number, m: any) => s + (m.mAP50 || 0), 0) / Object.keys(modelsData).length).toFixed(1) : 0}%`,
        },
        {
          id: 3,
          title: 'Dataset Quality Report',
          type: 'Dataset',
          source: 'Dataset Analyzer',
          status: 'Ready',
          createdAt: now,
          details: `${Object.keys(datasetsData).length} datasets reviewed`,
        },
        {
          id: 4,
          title: 'Security Threat Report',
          type: 'Attack',
          source: 'Threat Detection',
          status: 'Ready',
          createdAt: now,
          details: `${Object.keys(attacksData).length} attack patterns cataloged`,
        },
        {
          id: 5,
          title: 'Blockchain Audit Trail',
          type: 'Blockchain',
          source: 'Ledger Service',
          status: 'Ready',
          createdAt: now,
          details: `${blocksData.length} blocks recorded`,
        },
        {
          id: 6,
          title: 'Inference History Log',
          type: 'History',
          source: 'Inference Engine',
          status: 'Ready',
          createdAt: now,
          details: `Recent inference events`,
        },
      ]

      setReports(generated)
    } catch (err: any) {
      setError(err.message || 'Backend error')
    } finally { setLoading(false) }
  }

  // Filter
  const filtered = reports.filter(r => {
    const matchSearch = !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase()) ||
      r.source.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || r.type.toLowerCase() === filter.toLowerCase()
    return matchSearch && matchFilter
  })

  // Stats
  const types = Array.from(new Set(reports.map(r => r.type)))
  const readyCount = reports.filter(r => r.status.toLowerCase().includes('ready') || r.status.toLowerCase().includes('complete')).length

  // Export functions
  const exportJSON = () => {
    const data = JSON.stringify(reports, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cv-integrity-reports-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setShowDownloadMenu(false)
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('CV-INTEGRITY — Reports', 14, 22)
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30)

    autoTable(doc, {
      startY: 40,
      head: [['ID', 'Title', 'Type', 'Source', 'Status']],
      body: reports.map(r => [r.id, r.title, r.type, r.source, r.status]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [16, 185, 129] },
    })
    doc.save(`cv-integrity-reports-${Date.now()}.pdf`)
    setShowDownloadMenu(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-6">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              CV-INTEGRITY / Reports
            </div>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">
              Reports & Evidence
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Generated assurance reports, evidence records, and exportable compliance documentation.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadReports}
              className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                className="flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-3 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                <Download size={13} />
                Export
                <ChevronDown size={12} />
              </button>
              {showDownloadMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                >
                  <button
                    onClick={exportPDF}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <FileType2 size={14} className="text-red-500" />
                    Export as PDF
                  </button>
                  <button
                    onClick={exportJSON}
                    className="flex w-full items-center gap-2 border-t border-slate-100 px-3 py-2.5 text-left text-[12px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <FileJson size={14} className="text-blue-500" />
                    Export as JSON
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Reports', value: reports.length, color: '#0F172A', icon: FileText },
            { label: 'Ready', value: readyCount, color: '#10B981', icon: Shield },
            { label: 'Report Types', value: types.length, color: '#3B82F6', icon: BarChart3 },
            { label: 'Sources', value: Array.from(new Set(reports.map(r => r.source))).length, color: '#8B5CF6', icon: TrendingUp },
          ].map((s) => (
            <motion.div
              key={s.label}
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="text-[12px] font-medium text-slate-500">{s.label}</div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  <s.icon size={14} className="text-slate-500" />
                </div>
              </div>
              <div className="mt-3 text-[32px] font-bold leading-none tracking-tight text-slate-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {s.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search + filter */}
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-[13px] text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {['all', ...types].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-all ${
                  filter === t
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {t === 'all' ? 'All Types' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Reports list */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading && reports.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-20 text-[13px] text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              Loading reports...
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20">
              <AlertTriangle size={24} className="text-red-500" />
              <div className="text-[13px] font-medium text-slate-700">Failed to load reports</div>
              <div className="text-[11px] text-slate-400">{error}</div>
              <button
                onClick={loadReports}
                className="mt-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
              >
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20">
              <FileText size={24} className="text-slate-400" />
              <div className="text-[13px] font-medium text-slate-700">No matching reports</div>
              <div className="text-[11px] text-slate-400">Try a different filter or search term</div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-12 gap-4 bg-slate-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                <div className="col-span-5">Report</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Source</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1 text-right">Action</div>
              </div>

              {filtered.map((r) => {
                const theme = typeTheme[r.type] || typeTheme.Trust
                return (
                  <div
                    key={r.id}
                    className="grid grid-cols-12 items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                  >
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: theme.bg }}>
                        <FileText size={15} style={{ color: theme.text }} />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-medium text-slate-900">{r.title}</div>
                        <div className="mt-0.5 truncate text-[11px] text-slate-500">{r.details}</div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span
                        className="inline-flex rounded-md px-2 py-1 text-[10px] font-semibold"
                        style={{ background: theme.bg, color: theme.text }}
                      >
                        {r.type}
                      </span>
                    </div>
                    <div className="col-span-2 truncate text-[12px] text-slate-600">{r.source}</div>
                    <div className="col-span-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {r.status}
                      </span>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200">
                        <Eye size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-[11px] text-slate-500">
            Showing {filtered.length} of {reports.length} report{reports.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Coverage Statement */}
        <div className="mt-6">
          <CoverageStatement />
        </div>
      </div>
    </div>
  )
}

export default Reports
