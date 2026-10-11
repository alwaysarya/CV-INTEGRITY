import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search, Loader2, RefreshCw, Box, Clock, CheckCircle, Plus,
  Hash, Link as LinkIcon, Cpu
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
  data: any
}

const actionTheme: Record<string, { color: string; label: string }> = {
  GENESIS: { color: '#AF52DE', label: 'Genesis' },
  DATASET_UPLOAD: { color: '#34C759', label: 'Dataset Upload' },
  MODEL_TRAINING: { color: '#0071E3', label: 'Model Training' },
  TRUST_EVALUATION: { color: '#FF9500', label: 'Trust Evaluation' },
  INFERENCE_RECORD: { color: '#FF3B30', label: 'Inference Record' },
  ATTACK_BLOCKED: { color: '#FF3B30', label: 'Attack Blocked' },
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
        <motion.div initial={{ width: 0 }} animate={{ width: '60%' }} transition={{ duration: 0.8 }} className="h-full rounded-full" style={{ background: color }} />
      </div>
    </motion.div>
  )
}

export function Blockchain() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { loadBlocks() }, [])

  const loadBlocks = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/blockchain/live`).catch(() => ({ data: { blocks: [] } }))
      setBlocks(res.data.blocks || [])
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const filtered = blocks.filter((b) =>
    b.hash.toLowerCase().includes(search.toLowerCase()) ||
    b.index.toString().includes(search) ||
    (b.data?.action || '').toLowerCase().includes(search.toLowerCase())
  )

  const getTheme = (action: string) => actionTheme[action] || { color: '#86868B', label: action || 'Event' }

  const actionCounts: Record<string, number> = {}
  blocks.forEach(b => {
    const a = b.data?.action || 'UNKNOWN'
    actionCounts[a] = (actionCounts[a] || 0) + 1
  })

  const latestBlock = blocks[blocks.length - 1]

  return (
    <div className="min-h-screen bg-[#FBFBFD]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>
      {/* Hero */}
      <section className="mx-auto max-w-[1200px] px-6 pt-20 pb-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-[12px] font-medium tracking-[0.14em] text-[#86868B] uppercase">
            CV-INTEGRITY / Blockchain
          </div>
          <h1 className="mt-4 text-[56px] font-semibold leading-[1.05] tracking-[-0.025em] text-[#1D1D1F]">
            Ledger
          </h1>
          <p className="mt-5 max-w-[640px] text-[19px] leading-relaxed text-[#86868B]">
            Tamper-evident blockchain ledger for all platform events and actions.
          </p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-[1200px] px-6 pb-16">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Blocks" value={blocks.length} color="#1D1D1F" icon={Box} />
          <StatCard label="Action Types" value={Object.keys(actionCounts).length} color="#0071E3" icon={Cpu} />
          <StatCard label="Chain Status" value="Valid" color="#34C759" icon={CheckCircle} />
          <StatCard label="Latest Nonce" value={latestBlock?.nonce ?? 0} color="#FF9500" icon={Hash} />
        </div>
      </section>

      {/* Action breakdown */}
      {Object.keys(actionCounts).length > 0 && (
        <section className="mx-auto max-w-[1200px] px-6 pb-16">
          <div className="rounded-[18px] bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <div className="mb-5 text-[17px] font-semibold text-[#1D1D1F]">Action Breakdown</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(actionCounts).map(([action, count]) => {
                const theme = getTheme(action)
                return (
                  <div
                    key={action}
                    className="flex items-center gap-2 rounded-full px-4 py-2"
                    style={{ background: `${theme.color}12` }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ background: theme.color }} />
                    <span className="text-[13px] font-medium text-[#1D1D1F]">{theme.label}</span>
                    <span className="font-mono text-[13px] font-semibold" style={{ color: theme.color }}>{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Search */}
      <section className="mx-auto max-w-[1200px] px-6 pb-8">
        <div className="rounded-[18px] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by hash, index or action..."
              className="w-full rounded-xl border border-[#D2D2D7] bg-white py-3 pl-11 pr-4 text-[14px] text-[#1D1D1F] outline-none placeholder:text-[#86868B] focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20"
            />
          </div>
        </div>
      </section>

      {/* Blocks */}
      <section className="mx-auto max-w-[1200px] px-6 pb-20">
        {loading && blocks.length === 0 ? (
          <div className="flex items-center justify-center gap-2 rounded-[18px] bg-white py-32 text-[14px] text-[#86868B] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <Loader2 size={18} className="animate-spin" />
            Loading blockchain...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[18px] bg-white py-32 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <Box size={32} className="mx-auto text-[#86868B]" />
            <div className="mt-4 text-[17px] font-medium text-[#1D1D1F]">No blocks found</div>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.slice().reverse().map((b, i) => {
              const theme = getTheme(b.data?.action || 'UNKNOWN')
              return (
                <motion.div
                  key={b.index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.4) }}
                  whileHover={{ y: -3 }}
                  className="overflow-hidden rounded-[18px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-[#F5F5F7] px-7 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5F5F7]">
                        <Box size={18} className="text-[#1D1D1F]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[17px] font-semibold text-[#1D1D1F]">#{b.index}</span>
                          <span className="rounded-full px-3 py-0.5 text-[11px] font-semibold" style={{ background: `${theme.color}15`, color: theme.color }}>
                            {theme.label}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-[12px] text-[#86868B]">
                          <Clock size={11} />
                          {b.datetime || new Date(b.timestamp * 1000).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#34C759]/10 px-3 py-1 text-[11px] font-semibold text-[#34C759]">
                      <CheckCircle size={11} />
                      Valid
                    </span>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-1 gap-5 p-7 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-4">
                      <div>
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">
                          <Hash size={10} />
                          Block Hash
                        </div>
                        <div className="mt-1.5 truncate font-mono text-[12px] text-[#1D1D1F]">{b.hash}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">
                          <LinkIcon size={10} />
                          Previous Hash
                        </div>
                        <div className="mt-1.5 truncate font-mono text-[12px] text-[#86868B]">{b.previous_hash}</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">Nonce</div>
                        <div className="mt-1.5 font-mono text-[14px] font-semibold text-[#1D1D1F]">{b.nonce}</div>
                      </div>
                      {b.data?.trust_score !== undefined && (
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">Trust Score</div>
                          <div className="mt-1.5 font-mono text-[14px] font-semibold text-[#34C759]">{b.data.trust_score}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default Blockchain
