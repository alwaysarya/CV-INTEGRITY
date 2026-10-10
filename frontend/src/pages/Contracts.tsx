import { useEffect, useState } from 'react'
import { FileCode, Loader2, RefreshCw, Play, CheckCircle, Zap, AlertTriangle, Activity } from 'lucide-react'
import axios from 'axios'

const API = 'http://localhost:8000'

export function Contracts() {
  const [contracts, setContracts] = useState<any[]>([])
  const [executions, setExecutions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)
  const [testScore, setTestScore] = useState(75)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadContracts()
  }, [])

  const loadContracts = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${API}/api/advanced/contracts`).catch(() => ({ data: { contracts: [], execution_log: [] } }))
      setContracts(res.data.contracts || [])
      setExecutions(res.data.execution_log || [])
    } catch (err: any) {
      setError(err.message || 'Backend error')
    } finally {
      setLoading(false)
    }
  }

  const executeContracts = async () => {
    setExecuting(true)
    try {
      await axios.post(`${API}/api/advanced/contracts/execute`, { trust_score: testScore }).catch(() => null)
      await loadContracts()
    } catch (err) {
      console.error(err)
    } finally {
      setExecuting(false)
    }
  }

  const activeContracts = contracts.filter(c => c.active !== false && c.enabled !== false).length

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex items-start justify-between gap-4 pb-6">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              CV-INTEGRITY / Smart Contracts
            </div>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">
              Smart Contracts
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Automated rules triggered by trust score evaluation on the blockchain.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadContracts}
              className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={executeContracts}
              disabled={executing}
              className="flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-3 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {executing ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
              {executing ? 'Running...' : 'Execute All'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Contracts', value: contracts.length, color: '#0F172A', icon: FileCode },
            { label: 'Active', value: activeContracts, color: '#10B981', icon: CheckCircle },
            { label: 'Executions', value: executions.length, color: '#3B82F6', icon: Zap },
            { label: 'Test Score', value: testScore, color: '#F59E0B', icon: Activity },
          ].map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-medium text-slate-500">{s.label}</div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${s.color}15` }}>
                    <Icon size={14} style={{ color: s.color }} />
                  </div>
                </div>
                <div className="mt-3 text-[28px] font-bold leading-none tracking-tight text-slate-900">
                  {s.value}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[14px] font-semibold text-slate-900">Test Trust Score</div>
              <div className="mt-0.5 text-[11px] text-slate-500">
                Simulate contract execution with a specific trust score
              </div>
            </div>
            <div className="text-[24px] font-bold text-slate-900">{testScore}</div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={testScore}
            onChange={(e) => setTestScore(Number(e.target.value))}
            className="w-full accent-emerald-600"
          />
          <div className="mt-2 flex justify-between text-[10px] font-medium text-slate-500">
            <span>0 (Quarantine)</span>
            <span>50 (Review)</span>
            <span>100 (Accept)</span>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="text-[14px] font-semibold text-slate-900">Registered Contracts</div>
            <div className="mt-0.5 text-[11px] text-slate-500">
              {contracts.length} contract rules configured
            </div>
          </div>

          {loading ? (
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
              <div className="mt-3 text-[14px] font-medium text-slate-700">No contracts registered</div>
              <div className="mt-1 text-[11px] text-slate-500">
                Contracts will appear here once the backend has them
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-12 gap-4 bg-slate-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                <div className="col-span-5">Contract</div>
                <div className="col-span-3">Trigger</div>
                <div className="col-span-2">Action</div>
                <div className="col-span-2 text-right">Status</div>
              </div>

              {contracts.map((c, i) => (
                <div
                  key={c.id || c.name || i}
                  className="grid grid-cols-12 items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                >
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                      <FileCode size={15} className="text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-medium text-slate-900">
                        {typeof c.name === 'string' ? c.name : typeof c.id === 'string' ? c.id : `Contract ${i + 1}`}
                      </div>
                      <div className="mt-0.5 truncate text-[11px] text-slate-500">
                        {typeof c.description === 'string' ? c.description : 'Automated rule'}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3 text-[11px] text-slate-600">
                    {typeof c.condition === 'string'
                      ? c.condition
                      : typeof c.trigger === 'string'
                      ? c.trigger
                      : c.condition && typeof c.condition === 'object'
                      ? `${c.condition.type || 'trust'} ${c.condition.operator || '>='} ${c.condition.threshold ?? 50}`
                      : `Trust >= ${c.threshold || 50}`}
                  </div>
                  <div className="col-span-2 text-[11px] text-slate-600">
                    {typeof c.action === 'string'
                      ? c.action
                      : c.action && typeof c.action === 'object'
                      ? c.action.type || c.action.name || 'Execute'
                      : 'Execute'}
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      <CheckCircle size={10} />
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {executions.length > 0 && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="text-[14px] font-semibold text-slate-900">Execution Log</div>
              <div className="mt-0.5 text-[11px] text-slate-500">
                Last {Math.min(executions.length, 20)} executions
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {executions.slice(-20).reverse().map((e, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50">
                      <Zap size={12} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="text-[12px] font-medium text-slate-800">
                        {e.contract_name || e.contract_id || 'Contract Executed'}
                      </div>
                      <div className="mt-0.5 text-[10px] text-slate-500">
                        {e.timestamp ? new Date(e.timestamp).toLocaleString() : 'Recent'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {e.trust_score !== undefined && (
                      <span className="font-mono text-[11px] text-slate-600">
                        Trust: {e.trust_score}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      <CheckCircle size={10} />
                      Executed
                    </span>
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

export default Contracts
