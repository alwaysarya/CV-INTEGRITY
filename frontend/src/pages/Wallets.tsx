import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Wallet, Search, Loader2, RefreshCw, Activity, Coins, Shield,
  CheckCircle, Clock, Vote, Plus, X, Copy, TrendingUp
} from 'lucide-react'
import apiClient from '@/lib/api'

const API = 'http://localhost:8000'

interface Transaction {
  type: string
  amount: number
  reason: string
  balance_after: number
  timestamp: string
}

interface WalletData {
  owner: string
  address: string
  balance: number
  transactions: Transaction[]
  txCount: number
  status: string
  created_at: string
}

interface MultisigWallet {
  wallet_id: string
  name?: string
  owner?: string
  required: number
  total: number
  signers: string[]
  balance: number
  transaction_count?: number
  transactions?: MultisigTransaction[]
}

interface MultisigTransaction {
  tx_id: string
  to_wallet: string
  amount: number
  reason: string
  signatures: string[]
  executed: boolean
  required_signatures?: number
  created_at?: string
}

export function Wallets() {
  const [wallets, setWallets] = useState<WalletData[]>([])
  const [multisigWallets, setMultisigWallets] = useState<MultisigWallet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'wallets' | 'multisig'>('wallets')

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const [wRes, mRes] = await Promise.all([
        apiClient.getWallets().catch(() => ({ data: { wallets: {} } })),
        fetch(`${API}/api/multisig/wallets`).then(r => r.json()).catch(() => ({ wallets: [] })),
      ])
      const wData = wRes.data.wallets || {}
      const wList: WalletData[] = Object.entries(wData).map(([key, val]: [string, any]) => ({
        owner: key,
        address: val.address || `0x${key.slice(0, 8)}`,
        balance: val.balance ?? val.balance_coins ?? 0,
        transactions: val.transactions || [],
        txCount: val.transactions?.length || val.tx_count || 0,
        status: val.status || 'active',
        created_at: val.created_at || new Date().toISOString(),
      }))
      setWallets(wList)

      const mList = mRes.wallets || []
      setMultisigWallets(mList)
    } catch (err: any) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  const filteredWallets = wallets.filter((w) =>
    w.owner.toLowerCase().includes(search.toLowerCase()) ||
    w.address.toLowerCase().includes(search.toLowerCase())
  )

  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0)
  const totalTx = wallets.reduce((s, w) => s + w.txCount, 0)

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-6">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              CV-INTEGRITY / Wallets
            </div>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">
              Wallet Registry
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Contributor wallets and multi-signature accounts across the ledger.
            </p>
          </div>
          <button
            onClick={loadAll}
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Wallets', value: wallets.length, color: '#0F172A', icon: Wallet },
            { label: 'Total Balance', value: totalBalance.toFixed(2), color: '#10B981', icon: Coins },
            { label: 'Transactions', value: totalTx, color: '#3B82F6', icon: Activity },
            { label: 'Multisig', value: multisigWallets.length, color: '#8B5CF6', icon: Shield },
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

        {/* Tabs */}
        <div className="mt-6 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
          {[
            { id: 'wallets' as const, label: 'Wallets', count: wallets.length },
            { id: 'multisig' as const, label: 'Multisig', count: multisigWallets.length },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-[12px] font-medium transition-all ${
                tab === t.id
                  ? 'bg-emerald-50 text-emerald-900'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t.label}
              <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                tab === t.id ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search wallets by owner or address..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-[13px] text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-20 text-[13px] text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              Loading wallets...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <div className="text-[13px] font-medium text-red-700">Failed to load wallets</div>
              <div className="mt-1 text-[11px] text-red-600">{error}</div>
            </div>
          ) : tab === 'wallets' ? (
            filteredWallets.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center">
                <Wallet size={32} className="mx-auto text-slate-400" />
                <div className="mt-3 text-[14px] font-medium text-slate-700">No wallets found</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {filteredWallets.map((w, i) => (
                  <motion.div
                    key={w.owner}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -3 }}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-slate-100 p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700">
                          <Wallet size={18} className="text-white" />
                        </div>
                        <div>
                          <div className="text-[14px] font-semibold text-slate-900">{w.owner}</div>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <span className="truncate font-mono text-[10px] text-slate-500">
                              {w.address.slice(0, 24)}...
                            </span>
                            <button
                              onClick={() => navigator.clipboard.writeText(w.address)}
                              className="text-slate-400 transition-colors hover:text-emerald-600"
                            >
                              <Copy size={10} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {w.status}
                      </span>
                    </div>

                    {/* Balance */}
                    <div className="p-5">
                      <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                        Balance
                      </div>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-[32px] font-bold leading-none tracking-tight text-slate-900">
                          {w.balance.toFixed(2)}
                        </span>
                        <span className="text-[12px] font-medium text-slate-500">coins</span>
                      </div>
                    </div>

                    {/* Transactions */}
                    {w.transactions.length > 0 && (
                      <div className="border-t border-slate-100 p-5">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[11px] font-medium text-slate-500">Recent Transactions</span>
                          <span className="text-[10px] text-slate-400">{w.txCount} total</span>
                        </div>
                        <div className="space-y-2">
                          {w.transactions.slice(-3).reverse().map((tx, idx) => {
                            const isPositive = tx.amount > 0
                            const color = isPositive ? '#10B981' : '#EF4444'
                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                                  <span className="text-[11px] font-medium text-slate-700">
                                    {tx.reason || tx.type}
                                  </span>
                                </div>
                                <span className="font-mono text-[12px] font-bold" style={{ color }}>
                                  {isPositive ? '+' : ''}{tx.amount}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )
          ) : (
            /* Multisig tab */
            multisigWallets.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center">
                <Shield size={32} className="mx-auto text-slate-400" />
                <div className="mt-3 text-[14px] font-medium text-slate-700">No multisig wallets</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {multisigWallets.map((m, i) => (
                  <motion.div
                    key={m.wallet_id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -3 }}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between border-b border-slate-100 p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-700">
                          <Shield size={18} className="text-white" />
                        </div>
                        <div>
                          <div className="text-[14px] font-semibold text-slate-900">
                            {m.name || m.wallet_id}
                          </div>
                          <div className="mt-0.5 text-[10px] font-mono text-slate-500">
                            {m.required} of {m.total} signatures required
                          </div>
                        </div>
                      </div>
                      <span className="rounded-md bg-violet-50 px-2 py-1 text-[10px] font-semibold uppercase text-violet-700">
                        Multisig
                      </span>
                    </div>

                    <div className="p-5">
                      <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                        Balance
                      </div>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-[28px] font-bold leading-none tracking-tight text-slate-900">
                          {(m.balance || 0).toFixed(2)}
                        </span>
                        <span className="text-[12px] font-medium text-slate-500">coins</span>
                      </div>
                    </div>

                    {m.signers && m.signers.length > 0 && (
                      <div className="border-t border-slate-100 p-5">
                        <div className="mb-2 text-[11px] font-medium text-slate-500">
                          Signers ({m.signers.length})
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {m.signers.map((s, idx) => (
                            <span
                              key={idx}
                              className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[10px] text-slate-700"
                            >
                              {s.slice(0, 12)}...
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default Wallets
