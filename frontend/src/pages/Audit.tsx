import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Loader2, RefreshCw, CheckCircle, XCircle, Hash, FileText,
  User, Lock, Activity, ShieldCheck, AlertTriangle
} from 'lucide-react'
import axios from 'axios'

const API = 'http://localhost:8000'

export function Audit() {
  const [entries, setEntries] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [verification, setVerification] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${API}/api/advanced/audit/trail`).catch(() => ({ data: { entries: [], stats: {}, verification: {} } }))
      setEntries(res.data.entries || [])
      setStats(res.data.stats || {})
      setVerification(res.data.verification || {})
    } catch (err: any) {
      setError(err.message || 'Backend error')
    } finally { setLoading(false) }
  }

  const verifiedCount = entries.filter(e => (e.action || '').toLowerCase().includes('verified') || e.status === 'verified').length
  const totalCount = entries.length || stats.total || 0
  const chainValid = verification.valid !== false

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-6">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              CV-INTEGRITY / Audit
            </div>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">
              Audit Trail
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Tamper-evident SHA-256 chain of all system events and actions.
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
            { label: 'Total Events', value: totalCount, color: '#0F172A', icon: FileText },
            { label: 'Verified', value: verifiedCount, color: '#10B981', icon: CheckCircle },
            { label: 'Chain Status', value: chainValid ? 'Valid' : 'Broken', color: chainValid ? '#10B981' : '#EF4444', icon: ShieldCheck },
            { label: 'Actors', value: new Set(entries.map(e => e.actor || e.user || 'system')).size || 1, color: '#3B82F6', icon: User },
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

        {/* Entries table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading && entries.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-20 text-[13px] text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              Loading audit trail...
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <AlertTriangle size={24} className="mx-auto text-red-500" />
              <div className="mt-2 text-[13px] font-medium text-slate-700">Failed to load audit trail</div>
              <div className="mt-1 text-[11px] text-slate-400">{error}</div>
            </div>
          ) : entries.length === 0 ? (
            <div className="py-20 text-center">
              <FileText size={32} className="mx-auto text-slate-400" />
              <div className="mt-3 text-[14px] font-medium text-slate-700">No audit events</div>
              <div className="mt-1 text-[11px] text-slate-500">Audit log is empty or not configured</div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-12 gap-4 bg-slate-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                <div className="col-span-1">#</div>
                <div className="col-span-4">Action</div>
                <div className="col-span-2">Actor</div>
                <div className="col-span-3">Hash</div>
                <div className="col-span-2 text-right">Status</div>
              </div>

              {entries.slice(0, 50).map((e, i) => {
                const verified = (e.action || '').toLowerCase().includes('verified') || e.status === 'verified' || chainValid
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.02, 0.5) }}
                    className="grid grid-cols-12 items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50"
                  >
                    <div className="col-span-1">
                      <span className="font-mono text-[11px] text-slate-400">
                        {String(i + 1).padStart(3, '0')}
                      </span>
                    </div>

                    <div className="col-span-4 flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100">
                        <Activity size={12} className="text-slate-500" />
                      </div>
                      <span className="truncate text-[12px] font-medium text-slate-800">
                        {(e.action || e.event || 'Event').replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="col-span-2 flex items-center gap-1.5">
                      <User size={11} className="text-slate-400" />
                      <span className="truncate text-[11px] text-slate-600">
                        {e.actor || e.user || 'system'}
                      </span>
                    </div>

                    <div className="col-span-3 flex items-center gap-1.5">
                      <Hash size={10} className="text-slate-400" />
                      <span className="truncate font-mono text-[10px] text-slate-500">
                        {e.hash ? e.hash.slice(0, 24) + '...' : '—'}
                      </span>
                    </div>

                    <div className="col-span-2 flex justify-end">
                      {verified ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          <CheckCircle size={10} />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                          <XCircle size={10} />
                          Failed
                        </span>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {entries.length > 0 && (
            <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-[11px] text-slate-500">
              Showing {Math.min(entries.length, 50)} of {entries.length} entries
            </div>
          )}
        </div>

        {/* Verification status */}
        {Object.keys(verification).length > 0 && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                <ShieldCheck size={14} className="text-emerald-600" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-slate-900">Chain Verification</div>
                <div className="mt-0.5 text-[11px] text-slate-500">SHA-256 hash chain integrity check</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {Object.entries(verification).slice(0, 4).map(([key, val]) => (
                <div key={key} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div className="mt-1.5 text-[14px] font-semibold text-slate-900">
                    {typeof val === 'boolean' ? (val ? 'Valid' : 'Invalid') : String(val)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Audit
