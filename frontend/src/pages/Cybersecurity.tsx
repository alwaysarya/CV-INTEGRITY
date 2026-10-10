import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, AlertTriangle, Loader2, RefreshCw, Activity, Zap,
  Clock, Eye, CheckCircle, XCircle, Radio, TrendingUp
} from 'lucide-react'
import axios from 'axios'

const API = 'http://localhost:8000'

const severityTheme: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  CRITICAL: { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444', label: 'Critical' },
  HIGH: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B', label: 'High' },
  MEDIUM: { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6', label: 'Medium' },
  LOW: { bg: '#D1FAE5', text: '#065F46', dot: '#10B981', label: 'Low' },
}

export function Cybersecurity() {
  const [attacks, setAttacks] = useState<any[]>([])
  const [summary, setSummary] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${API}/api/attacks`).catch(() => ({ data: { attacks: [], total_attacks: 0, detected: 0, detection_rate: 0 } }))
      const data = res.data
      const list = (data.attacks || []).map((a: any) => ({
        id: a.id || 'UNKNOWN',
        name: a.name || 'Unknown',
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
      })
    } catch (err: any) {
      setError(err.message || 'Backend error')
    } finally { setLoading(false) }
  }

  const detectionRate = summary.detection_rate || 0
  const criticalCount = attacks.filter(a => a.severity === 'CRITICAL').length
  const highCount = attacks.filter(a => a.severity === 'HIGH').length
  const detectedCount = attacks.filter(a => a.detected).length

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-6">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              CV-INTEGRITY / Cybersecurity
            </div>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">
              Cyber Command
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Attack detection status and threat intelligence across the platform.
            </p>
          </div>
          <button
            onClick={load}
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Attacks', value: attacks.length, color: '#0F172A', icon: Shield },
            { label: 'Detected', value: detectedCount, color: '#10B981', icon: CheckCircle },
            { label: 'Detection Rate', value: `${detectionRate.toFixed(0)}%`, color: '#3B82F6', icon: TrendingUp },
            { label: 'Critical', value: criticalCount, color: '#EF4444', icon: AlertTriangle },
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

        {/* Attack list */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="text-[14px] font-semibold text-slate-900">Attack Catalog</div>
            <div className="mt-0.5 text-[11px] text-slate-500">
              Detection status for {attacks.length} attack patterns
            </div>
          </div>

          {loading && attacks.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-20 text-[13px] text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              Loading attacks...
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <AlertTriangle size={24} className="mx-auto text-red-500" />
              <div className="mt-2 text-[13px] font-medium text-slate-700">Failed to load attacks</div>
              <div className="mt-1 text-[11px] text-slate-400">{error}</div>
            </div>
          ) : attacks.length === 0 ? (
            <div className="py-20 text-center">
              <Shield size={32} className="mx-auto text-emerald-500" />
              <div className="mt-3 text-[14px] font-medium text-slate-700">No attacks detected</div>
              <div className="mt-1 text-[11px] text-slate-500">All systems nominal</div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-12 gap-4 bg-slate-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                <div className="col-span-5">Attack</div>
                <div className="col-span-2">Severity</div>
                <div className="col-span-3">Detection Method</div>
                <div className="col-span-2 text-right">Status</div>
              </div>

              {attacks.map((a, i) => {
                const theme = severityTheme[a.severity] || severityTheme.MEDIUM
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="grid grid-cols-12 items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                  >
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: theme.bg }}>
                        <AlertTriangle size={15} style={{ color: theme.dot }} />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-medium text-slate-900">
                          {a.name.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                        </div>
                        <div className="mt-0.5 truncate text-[11px] text-slate-500">{a.description}</div>
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
                    <div className="col-span-2 flex justify-end">
                      {a.detected ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                          <CheckCircle size={11} />
                          Detected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-700">
                          <XCircle size={11} />
                          Missed
                        </span>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {attacks.length > 0 && (
            <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-[11px] text-slate-500">
              {detectedCount} of {attacks.length} detected · {detectionRate.toFixed(1)}% detection rate
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Cybersecurity
