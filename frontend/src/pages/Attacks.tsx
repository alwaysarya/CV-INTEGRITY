import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle, Loader2, RefreshCw, Shield, Search,
  Filter, ChevronRight, Check, X, Activity
} from 'lucide-react'
import axios from 'axios'

const API = 'http://localhost:8000'

interface Attack {
  id: string
  name: string
  description: string
  severity: string
  detected: boolean
  detection_method?: string
  result?: string
}

const severityTheme: Record<string, { bg: string; text: string; border: string; dot: string; label: string }> = {
  CRITICAL: { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5', dot: '#EF4444', label: 'Critical' },
  HIGH: { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D', dot: '#F59E0B', label: 'High' },
  MEDIUM: { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD', dot: '#3B82F6', label: 'Medium' },
  LOW: { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7', dot: '#10B981', label: 'Low' },
}

export function Attacks() {
  const [attacks, setAttacks] = useState<Attack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<any>({})
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('ALL')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${API}/api/attacks`)
      const data = res.data
      const list = (data.attacks || []).map((a: any) => ({
        id: a.id || 'UNKNOWN',
        name: a.name || 'Unknown Attack',
        description: a.description || '',
        severity: (a.severity || 'MEDIUM').toUpperCase(),
        detected: a.detected ?? false,
        detection_method: a.detection_method || (Array.isArray(a.detection_methods) ? a.detection_methods.join(', ') : ''),
        result: a.result || '',
      }))
      setAttacks(list)
      setSummary({
        total: data.total_attacks || list.length,
        detected: data.detected || 0,
        detection_rate: data.detection_rate || 0,
        timestamp: data.timestamp,
      })
    } catch (err: any) {
      setError(err.message || 'Backend error')
    } finally { setLoading(false) }
  }

  // Counts
  const critical = attacks.filter(a => a.severity === 'CRITICAL').length
  const high = attacks.filter(a => a.severity === 'HIGH').length
  const medium = attacks.filter(a => a.severity === 'MEDIUM').length
  const low = attacks.filter(a => a.severity === 'LOW').length

  // Filter
  const filtered = attacks.filter(a => {
    const matchSearch = !search || 
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase())
    const matchSeverity = severityFilter === 'ALL' || a.severity === severityFilter
    return matchSearch && matchSeverity
  })

  const formatName = (name: string) =>
    name.replace(/_/g, ' ').replace(/attack/i, '').trim().toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase()) + ' Attack'

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-6">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              CV-INTEGRITY / Threats
            </div>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">
              Threat Catalog
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Security events and attack patterns detected by the integrity layer.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-medium text-emerald-700">
                {summary.detection_rate ? `${summary.detection_rate.toFixed(0)}% detected` : 'System online'}
              </span>
            </div>
            <button
              onClick={load}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Threats', value: attacks.length, color: '#0F172A', bg: '#F1F5F9' },
            { label: 'Critical', value: critical, color: '#991B1B', bg: '#FEE2E2' },
            { label: 'High', value: high, color: '#92400E', bg: '#FEF3C7' },
            { label: 'Medium', value: medium, color: '#1E40AF', bg: '#DBEAFE' },
          ].map((s) => (
            <motion.div
              key={s.label}
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="text-[12px] font-medium text-slate-500">{s.label}</div>
              <div className="mt-3 text-[36px] font-bold leading-none tracking-tight" style={{ color: s.color, fontVariantNumeric: 'tabular-nums' }}>
                {s.value}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${attacks.length ? (s.value / attacks.length) * 100 : 0}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full rounded-full"
                    style={{ background: s.color }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search threats..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-[13px] text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-all ${
                  severityFilter === s
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {s === 'ALL' ? 'All' : severityTheme[s]?.label || s}
              </button>
            ))}
          </div>
        </div>

        {/* Threat list */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading && attacks.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-20 text-[13px] text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              Loading threats...
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20">
              <AlertTriangle size={24} className="text-red-500" />
              <div className="text-[13px] font-medium text-slate-700">Failed to load threats</div>
              <div className="text-[11px] text-slate-400">{error}</div>
              <button
                onClick={load}
                className="mt-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
              >
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20">
              <Shield size={24} className="text-emerald-500" />
              <div className="text-[13px] font-medium text-slate-700">No matching threats</div>
              <div className="text-[11px] text-slate-400">Try a different filter or search term</div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {/* Header row */}
              <div className="grid grid-cols-12 gap-4 bg-slate-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                <div className="col-span-5">Threat</div>
                <div className="col-span-2">Severity</div>
                <div className="col-span-3">Detection Method</div>
                <div className="col-span-2 text-right">Status</div>
              </div>

              {filtered.map((a) => {
                const theme = severityTheme[a.severity] || severityTheme.MEDIUM
                const isExpanded = expanded === a.id
                return (
                  <div key={a.id}>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : a.id)}
                      className="grid w-full grid-cols-12 items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50"
                    >
                      <div className="col-span-5 flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-lg"
                          style={{ background: theme.bg }}
                        >
                          <AlertTriangle size={15} style={{ color: theme.dot }} />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-[13px] font-medium text-slate-900">
                            {formatName(a.name)}
                          </div>
                          <div className="mt-0.5 truncate text-[11px] text-slate-500">
                            {a.description}
                          </div>
                        </div>
                      </div>

                      <div className="col-span-2">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold"
                          style={{ background: theme.bg, color: theme.text }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: theme.dot }} />
                          {theme.label}
                        </span>
                      </div>

                      <div className="col-span-3 truncate text-[11px] text-slate-500">
                        {a.detection_method || '—'}
                      </div>

                      <div className="col-span-2 flex items-center justify-end gap-2">
                        {a.detected ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                            <Check size={11} />
                            Detected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                            <X size={11} />
                            Not detected
                          </span>
                        )}
                        <ChevronRight
                          size={14}
                          className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        />
                      </div>
                    </button>

                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-slate-100 bg-slate-50/50 px-5 py-4"
                      >
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              Attack ID
                            </div>
                            <div className="mt-1 font-mono text-[12px] text-slate-700">{a.id}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              Detection Method
                            </div>
                            <div className="mt-1 text-[12px] text-slate-700">
                              {a.detection_method || 'Not specified'}
                            </div>
                          </div>
                          {a.result && (
                            <div className="md:col-span-2">
                              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                Result
                              </div>
                              <div className="mt-1 text-[12px] text-slate-700">{a.result}</div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-[11px] text-slate-500">
            Showing {filtered.length} of {attacks.length} threat{attacks.length !== 1 ? 's' : ''}
            {summary.timestamp && (
              <span className="ml-3 text-slate-400">
                · Last scan: {new Date(summary.timestamp).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Attacks
