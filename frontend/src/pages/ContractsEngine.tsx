import { useState, useEffect } from 'react'
import {
  FileCode, CheckCircle, AlertTriangle, XCircle, Zap, RefreshCw,
  Loader2, Play, BarChart3, TrendingUp, Activity
} from 'lucide-react'
import axios from 'axios'

const API = 'http://localhost:8000'

interface Contract {
  id: string
  name: string
  description: string
  executions: number
  approved: number
  quarantined: number
  thresholds?: any
}

export function ContractsEngine() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [executing, setExecuting] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({ total: 0, approved: 0, review: 0, quarantine: 0 })

  useEffect(() => { init() }, [])

  const init = async () => {
    await Promise.all([loadContracts(), loadStats()])
  }

  const loadStats = async () => {
    try {
      const res = await fetch(`${API}/api/contracts/stats`).then(r => r.json()).catch(() => null)
      if (res && res.status === 'success') {
        setStats({
          total: res.total_executions || 0,
          approved: res.decisions?.auto_approve || 0,
          review: res.decisions?.review || 0,
          quarantine: res.decisions?.quarantine || 0,
        })
      }
    } catch (err) { console.error(err) }
  }

  const loadContracts = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${API}/api/contracts/list`).catch(() => ({ data: { contracts: [] } }))
      const list = res.data.contracts || []
      setContracts(list.map((c: any, i: number) => ({
        id: c.id || `contract_${i}`,
        name: c.name || `Contract ${i + 1}`,
        description: typeof c.description === 'string' ? c.description : 'Automated rule',
        executions: c.executions || 0,
        approved: c.approved || 0,
        quarantined: c.quarantined || 0,
        thresholds: c.thresholds,
      })))
    } catch (err: any) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  const executeContract = async (id: string) => {
    setExecuting(id)
    try {
      await axios.post(`${API}/api/contracts/execute/${id}`).catch(() => null)
      await init()
    } catch (err) { console.error(err) } finally { setExecuting(null) }
  }

  const executeAll = async () => {
    setExecuting('all')
    try {
      await Promise.all(contracts.map(c => axios.post(`${API}/api/contracts/execute/${c.id}`).catch(() => null)))
      await init()
    } catch (err) { console.error(err) } finally { setExecuting(null) }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-6">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              CV-INTEGRITY / Contracts Engine
            </div>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">
              Contracts Engine
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Execution engine for automated trust-based decisions across the platform.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={init}
              className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={executeAll}
              disabled={executing === 'all' || contracts.length === 0}
              className="flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-3 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {executing === 'all' ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
              {executing === 'all' ? 'Running...' : 'Execute All'}
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Executions', value: stats.total, color: '#0F172A', icon: Activity },
            { label: 'Auto-Approved', value: stats.approved, color: '#10B981', icon: CheckCircle },
            { label: 'Review', value: stats.review, color: '#F59E0B', icon: AlertTriangle },
            { label: 'Quarantined', value: stats.quarantine, color: '#EF4444', icon: XCircle },
          ].map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-medium text-slate-500">{s.label}</div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${s.color}15` }}>
                    <Icon size={14} style={{ color: s.color }} />
                  </div>
                </div>
                <div className="mt-3 text-[28px] font-bold leading-none tracking-tight text-slate-900">{s.value}</div>
              </div>
            )
          })}
        </div>

        {/* Decision breakdown */}
        {stats.total > 0 && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 text-[13px] font-semibold text-slate-900">Decision Breakdown</div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Auto-Approved', value: stats.approved, color: '#10B981' },
                { label: 'Review', value: stats.review, color: '#F59E0B' },
                { label: 'Quarantined', value: stats.quarantine, color: '#EF4444' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 rounded-lg border px-3 py-1.5"
                  style={{ background: `${item.color}10`, borderColor: `${item.color}30` }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-[11px] font-medium text-slate-700">{item.label}</span>
                  <span className="font-mono text-[11px] font-bold" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contracts list */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="text-[14px] font-semibold text-slate-900">Active Contracts</div>
            <div className="mt-0.5 text-[11px] text-slate-500">
              {contracts.length} contracts in execution engine
            </div>
          </div>

          {loading && contracts.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-20 text-[13px] text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              Loading contracts...
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <AlertTriangle size={24} className="mx-auto text-red-500" />
              <div className="mt-2 text-[13px] font-medium text-slate-700">Failed to load contracts</div>
              <div className="mt-1 text-[11px] text-slate-400">{error}</div>
            </div>
          ) : contracts.length === 0 ? (
            <div className="py-20 text-center">
              <FileCode size={32} className="mx-auto text-slate-400" />
              <div className="mt-3 text-[14px] font-medium text-slate-700">No contracts</div>
              <div className="mt-1 text-[11px] text-slate-500">Contracts will appear here once registered</div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {contracts.map((c) => (
                <div
                  key={c.id}
                  className="grid grid-cols-12 items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                >
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                      <FileCode size={15} className="text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-medium text-slate-900">{c.name}</div>
                      <div className="mt-0.5 truncate text-[11px] text-slate-500">{c.description}</div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="text-[10px] font-medium text-slate-500">Executions</div>
                    <div className="mt-0.5 font-mono text-[14px] font-bold text-slate-900">{c.executions}</div>
                  </div>

                  <div className="col-span-2">
                    <div className="text-[10px] font-medium text-slate-500">Approved</div>
                    <div className="mt-0.5 font-mono text-[14px] font-bold text-emerald-600">{c.approved}</div>
                  </div>

                  <div className="col-span-2">
                    <div className="text-[10px] font-medium text-slate-500">Quarantined</div>
                    <div className="mt-0.5 font-mono text-[14px] font-bold text-red-600">{c.quarantined}</div>
                  </div>

                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => executeContract(c.id)}
                      disabled={executing === c.id}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"
                    >
                      {executing === c.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Play size={13} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ContractsEngine
