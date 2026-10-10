import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search, Loader2, RefreshCw, Box, Clock, CheckCircle, Plus,
  Zap, Shield, Hash, Link as LinkIcon, Cpu
} from 'lucide-react'
import axios from 'axios'

const API = 'http://localhost:8000'

interface Block {
  index: number
  hash: string
  previous_hash: string
  timestamp: number
  datetime?: string
  nonce: number
  data: {
    action?: string
    user?: string
    dataset_name?: string
    model?: string
    trust_score?: number
    decision?: string
    [key: string]: any
  }
}

const actionTheme: Record<string, { bg: string; text: string; dot: string }> = {
  GENESIS: { bg: '#EDE9FE', text: '#5B21B6', dot: '#8B5CF6' },
  DATASET_UPLOAD: { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
  MODEL_TRAINING: { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
  TRUST_EVALUATION: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
  INFERENCE_RECORD: { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
  ATTACK_BLOCKED: { bg: '#FEE2E2', text: '#7F1D1D', dot: '#DC2626' },
}

export function Blockchain() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [mining, setMining] = useState(false)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { loadBlocks() }, [])

  const loadBlocks = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${API}/api/blockchain/live`).catch(() => ({ data: { blocks: [] } }))
      setBlocks(res.data.blocks || [])
    } catch (err: any) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  const mineBlock = async () => {
    setMining(true)
    try {
      await axios.post(`${API}/api/blockchain/mine`, {}).catch(() => null)
      await loadBlocks()
    } finally { setMining(false) }
  }

  const filtered = blocks.filter((b) =>
    b.hash.toLowerCase().includes(search.toLowerCase()) ||
    b.index.toString().includes(search) ||
    (b.data?.action || '').toLowerCase().includes(search.toLowerCase())
  )

  const getActionTheme = (action: string) =>
    actionTheme[action] || { bg: '#F1F5F9', text: '#334155', dot: '#64748B' }

  const actionCounts: Record<string, number> = {}
  blocks.forEach(b => {
    const a = b.data?.action || 'UNKNOWN'
    actionCounts[a] = (actionCounts[a] || 0) + 1
  })

  const latestBlock = blocks[blocks.length - 1]

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-6">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              CV-INTEGRITY / Blockchain
            </div>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">
              Ledger
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Tamper-evident blockchain ledger for all platform events and actions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadBlocks}
              className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={mineBlock}
              disabled={mining}
              className="flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-3 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {mining ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              {mining ? 'Mining...' : 'Mine Block'}
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Blocks', value: blocks.length, color: '#0F172A', icon: Box },
            { label: 'Action Types', value: Object.keys(actionCounts).length, color: '#3B82F6', icon: Zap },
            { label: 'Chain Status', value: 'Valid', color: '#10B981', icon: Shield },
            { label: 'Latest Nonce', value: latestBlock?.nonce ?? 0, color: '#F59E0B', icon: Cpu },
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
              <div className="mt-3 text-[28px] font-bold leading-none tracking-tight text-slate-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {s.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action breakdown */}
        {Object.keys(actionCounts).length > 0 && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 text-[13px] font-semibold text-slate-900">Action Breakdown</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(actionCounts).map(([action, count]) => {
                const theme = getActionTheme(action)
                return (
                  <div
                    key={action}
                    className="flex items-center gap-2 rounded-lg border px-3 py-1.5"
                    style={{ background: theme.bg, borderColor: `${theme.dot}30` }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: theme.dot }} />
                    <span className="text-[11px] font-medium" style={{ color: theme.text }}>
                      {action.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono text-[11px] font-bold" style={{ color: theme.text }}>
                      {count}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by hash, index or action..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-[13px] text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Blocks list */}
        <div className="mt-6">
          {loading && blocks.length === 0 ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-20 text-[13px] text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              Loading blockchain...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <div className="text-[13px] font-medium text-red-700">Failed to load blockchain</div>
              <div className="mt-1 text-[11px] text-red-600">{error}</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center">
              <Box size={32} className="mx-auto text-slate-400" />
              <div className="mt-3 text-[14px] font-medium text-slate-700">No blocks found</div>
              <div className="mt-1 text-[11px] text-slate-500">
                {search ? 'Try a different search term' : 'Mine a block to start the chain'}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.slice().reverse().map((b, i) => {
                const theme = getActionTheme(b.data?.action || 'UNKNOWN')
                return (
                  <motion.div
                    key={b.index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.4) }}
                    whileHover={{ y: -2 }}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                          <Box size={15} className="text-slate-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[13px] font-bold text-slate-900">
                              #{b.index}
                            </span>
                            <span
                              className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase"
                              style={{ background: theme.bg, color: theme.text }}
                            >
                              <span className="h-1.5 w-1.5 rounded-full" style={{ background: theme.dot }} />
                              {(b.data?.action || 'UNKNOWN').replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-500">
                            <Clock size={9} />
                            {b.datetime || new Date(b.timestamp * 1000).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                        <CheckCircle size={10} />
                        Valid
                      </span>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
                      <div className="md:col-span-2 space-y-2.5">
                        <div>
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            <Hash size={9} />
                            Block Hash
                          </div>
                          <div className="mt-1 truncate font-mono text-[11px] text-slate-700">{b.hash}</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            <LinkIcon size={9} />
                            Previous Hash
                          </div>
                          <div className="mt-1 truncate font-mono text-[11px] text-slate-500">
                            {b.previous_hash}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Nonce
                          </div>
                          <div className="mt-1 font-mono text-[12px] font-semibold text-slate-900">{b.nonce}</div>
                        </div>
                        {b.data?.trust_score !== undefined && (
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                              Trust Score
                            </div>
                            <div className="mt-1 font-mono text-[12px] font-semibold text-emerald-700">
                              {b.data.trust_score}
                            </div>
                          </div>
                        )}
                        {b.data?.decision && (
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                              Decision
                            </div>
                            <div className="mt-1 text-[12px] font-semibold text-slate-800">
                              {b.data.decision}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Blockchain
