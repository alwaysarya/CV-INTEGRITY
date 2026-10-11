import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle, Loader2, RefreshCw, Shield, Search, Filter,
  ChevronRight, Check, X
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

const severityTheme: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  CRITICAL: { bg: '#FF3B30', text: '#FF3B30', dot: '#FF3B30', label: 'Critical' },
  HIGH: { bg: '#FF9500', text: '#FF9500', dot: '#FF9500', label: 'High' },
  MEDIUM: { bg: '#0071E3', text: '#0071E3', dot: '#0071E3', label: 'Medium' },
  LOW: { bg: '#34C759', text: '#34C759', dot: '#34C759', label: 'Low' },
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
          animate={{ width: `${Math.min((value / 10) * 100, 100)}%` }}
          transition={{ duration: 0.8 }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </motion.div>
  )
}

export function Attacks() {
  const [attacks, setAttacks] = useState<Attack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<any>({})
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('ALL')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${API}/api/attacks`).catch(() => ({ data: { attacks: {} } }))
      const data = res.data
      const list = Object.entries(data.attacks || {}).map(([key, val]: [string, any]) => ({
        id: val.id || key,
        name: val.name || key,
        description: val.description || '',
        severity: (val.severity || 'MEDIUM').toUpperCase(),
        detected: val.detected ?? false,
        detection_method: val.detection_method || (Array.isArray(val.detection_methods) ? val.detection_methods.join(', ') : ''),
        result: val.result || '',
      }))
      setAttacks(list)
      setSummary({
        total: data.total_attacks || list.length,
        detected: data.detected || 0,
        detection_rate: data.detection_rate || 0,
      })
    } catch (err: any) {
      setError(err.message || 'Backend error')
    } finally { setLoading(false) }
  }

  const filtered = attacks.filter(a => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase())
    const matchSeverity = severityFilter === 'ALL' || a.severity === severityFilter
    return matchSearch && matchSeverity
  })

  const critical = attacks.filter(a => a.severity === 'CRITICAL').length
  const high = attacks.filter(a => a.severity === 'HIGH').length
  const medium = attacks.filter(a => a.severity === 'MEDIUM').length

  return (
    <div className="min-h-screen bg-[#FBFBFD]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>
      {/* Hero */}
      <section className="mx-auto max-w-[1200px] px-6 pt-20 pb-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-[12px] font-medium tracking-[0.14em] text-[#86868B] uppercase">
            CV-INTEGRITY / Threats
          </div>
          <h1 className="mt-4 text-[56px] font-semibold leading-[1.05] tracking-[-0.025em] text-[#1D1D1F]">
            Threat Catalog
          </h1>
          <p className="mt-5 max-w-[640px] text-[19px] leading-relaxed text-[#86868B]">
            Security events and attack patterns detected by the integrity layer.
          </p>
        </motion.div>
      </section>

      {/* Stat cards */}
      <section className="mx-auto max-w-[1200px] px-6 pb-16">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Threats" value={attacks.length} color="#1D1D1F" icon={Shield} />
          <StatCard label="Critical" value={critical} color="#FF3B30" icon={AlertTriangle} />
          <StatCard label="High" value={high} color="#FF9500" icon={AlertTriangle} />
          <StatCard label="Detection Rate" value={`${(summary.detection_rate || 0).toFixed(0)}%`} color="#0071E3" icon={Check} />
        </div>
      </section>

      {/* Filter row */}
      <section className="mx-auto max-w-[1200px] px-6 pb-8">
        <div className="flex flex-col gap-4 rounded-[18px] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search threats..."
              className="w-full rounded-xl border border-[#D2D2D7] bg-white py-3 pl-11 pr-4 text-[14px] text-[#1D1D1F] outline-none transition-all placeholder:text-[#86868B] focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Filter size={14} className="text-[#86868B]" />
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(s => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`rounded-full px-4 py-2 text-[13px] font-medium transition-all ${
                  severityFilter === s
                    ? 'bg-[#0071E3] text-white'
                    : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E5E5EA]'
                }`}
              >
                {s === 'ALL' ? 'All' : severityTheme[s]?.label || s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Threat list */}
      <section className="mx-auto max-w-[1200px] px-6 pb-20">
        <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          {loading && attacks.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-32 text-[14px] text-[#86868B]">
              <Loader2 size={18} className="animate-spin" />
              Loading threats...
            </div>
          ) : error ? (
            <div className="py-32 text-center">
              <AlertTriangle size={28} className="mx-auto text-[#FF3B30]" />
              <div className="mt-4 text-[15px] font-medium text-[#1D1D1F]">Failed to load threats</div>
              <div className="mt-1 text-[13px] text-[#86868B]">{error}</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-32 text-center">
              <Shield size={32} className="mx-auto text-[#34C759]" />
              <div className="mt-4 text-[17px] font-medium text-[#1D1D1F]">No matching threats</div>
              <div className="mt-1 text-[13px] text-[#86868B]">Try a different filter or search term</div>
            </div>
          ) : (
            <div className="divide-y divide-[#F5F5F7]">
              {filtered.map((a, i) => {
                const theme = severityTheme[a.severity] || severityTheme.MEDIUM
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-start gap-5 px-8 py-6 transition-colors hover:bg-[#FBFBFD]"
                  >
                    <div
                      className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: `${theme.dot}12` }}
                    >
                      <AlertTriangle size={18} style={{ color: theme.dot }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-[17px] font-medium text-[#1D1D1F]">
                          {a.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </h3>
                        <span
                          className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
                          style={{ background: `${theme.dot}15`, color: theme.text }}
                        >
                          {theme.label}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[14px] leading-relaxed text-[#86868B]">
                        {a.description}
                      </p>
                      <div className="mt-3 flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[12px] text-[#86868B]">
                          <span className="font-medium">Detection:</span>
                          <span>{a.detection_method || '—'}</span>
                        </div>
                        {a.detected ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#34C759]/10 px-2.5 py-1 text-[11px] font-semibold text-[#34C759]">
                            <Check size={11} />
                            Detected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#FF3B30]/10 px-2.5 py-1 text-[11px] font-semibold text-[#FF3B30]">
                            <X size={11} />
                            Missed
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={18} className="mt-3 shrink-0 text-[#D2D2D7]" />
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Attacks
