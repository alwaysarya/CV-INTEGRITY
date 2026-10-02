import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Wallet, Search, Copy, Loader2, RefreshCw, AlertCircle, Activity, Coins, Shield, ArrowUpRight, ArrowDownLeft, CheckCircle, Clock, Vote } from 'lucide-react'
import apiClient from '@/lib/api'

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
  balance: number
  required_signatures: number
  signers: string[]
  transactions: MultisigTransaction[]
}

interface MultisigTransaction {
  tx_id: string
  to_wallet: string
  amount: number
  reason: string
  signatures: string[]
  executed: boolean
  created_at?: string
}

const API_BASE = 'http://localhost:8000'

export function Wallets() {
  const [wallets, setWallets] = useState<WalletData[]>([])
  const [tokenName, setTokenName] = useState('CVIT')
  const [totalSupply, setTotalSupply] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null)
  const [multisigWallets, setMultisigWallets] = useState<MultisigWallet[]>([])
  const [multisigLoading, setMultisigLoading] = useState(true)
  const [actionMsg, setActionMsg] = useState<string | null>(null)

  useEffect(() => {
    loadWallets()
    loadMultisigWallets()
  }, [])

  const loadWallets = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.getWallets()
      const data = res.data
      setTokenName(data.token_name || 'CVIT')
      setTotalSupply(data.total_supply || 0)
      const walletsObj = data.wallets || {}
      const list: WalletData[] = Object.entries(walletsObj).map(([key, val]: [string, any]) => ({
        owner: val.owner || key,
        address: val.address || '',
        balance: Number(val.balance) || 0,
        transactions: val.transactions || [],
        txCount: (val.transactions || []).length,
        status: 'Active',
        created_at: val.created_at || '',
      }))
      setWallets(list)
      if (list.length > 0) setSelectedWallet(list[0])
    } catch (err: any) {
      console.error('Failed:', err)
      setError(err?.message || 'Backend connect nahi ho raha')
    } finally {
      setLoading(false)
    }
  }

  const loadMultisigWallets = async () => {
    setMultisigLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/advanced/multisig/wallets`)
      const data = await res.json()
      if (data.status === 'success') {
        setMultisigWallets(data.wallets || [])
      }
    } catch (err) {
      console.error('Multisig load failed:', err)
    } finally {
      setMultisigLoading(false)
    }
  }

  const signTransaction = async (walletId: string, txId: string) => {
    setActionMsg('Signing...')
    try {
      const res = await fetch(`${API_BASE}/api/advanced/multisig/wallets/${walletId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tx_id: txId, signer: 'current-user' }),
      })
      const data = await res.json()
      setActionMsg(data.status === 'success' ? '✅ Signed' : '❌ Sign failed')
      await loadMultisigWallets()
      setTimeout(() => setActionMsg(null), 2000)
    } catch (err) {
      setActionMsg('❌ Sign failed')
      setTimeout(() => setActionMsg(null), 2000)
    }
  }

  const executeTransaction = async (walletId: string, txId: string) => {
    setActionMsg('Executing...')
    try {
      const res = await fetch(`${API_BASE}/api/advanced/multisig/wallets/${walletId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tx_id: txId }),
      })
      const data = await res.json()
      setActionMsg(data.status === 'success' ? '✅ Executed' : '❌ Execute failed')
      await loadMultisigWallets()
      setTimeout(() => setActionMsg(null), 2000)
    } catch (err) {
      setActionMsg('❌ Execute failed')
      setTimeout(() => setActionMsg(null), 2000)
    }
  }

  const filtered = wallets.filter((w) =>
    w.owner.toLowerCase().includes(search.toLowerCase()) ||
    w.address.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: wallets.length,
    active: wallets.length,
    totalBalance: wallets.reduce((s, w) => s + w.balance, 0),
    totalTx: wallets.reduce((s, w) => s + w.txCount, 0),
  }

  const getTxColor = (type: string) => {
    return type === 'CREDIT' ? '#10B981' : '#EF4444'
  }

  const getStatusColors = (status: string) => {
    if (status === 'EXECUTED') return { text: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)' }
    if (status === 'PENDING') return { text: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)' }
    return { text: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)' }
  }

  return (
    <div className="space-y-6 p-6" style={{ background: '#0A0F14', minHeight: 'calc(100vh - 72px)' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-[#E5F5F0] mb-1">Multisig Governance Wallets</h1>
            <p className="text-[#8AA4A0] text-sm">
              Cryptographic multi-party governance enforcing quorum approval for all model deployments and quarantine actions.
            </p>
          </div>
          {actionMsg && (
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/40 text-xs px-3 py-1">
              {actionMsg}
            </Badge>
          )}
        </div>

        {/* GOVERNANCE WALLETS — LIVE FROM API */}
        <div className="space-y-4 mb-8">
          {multisigLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-cyan-400" size={24} />
              <span className="ml-3 text-[#8AA4A0]">Loading multisig wallets...</span>
            </div>
          ) : multisigWallets.length === 0 ? (
            <Card className="rounded-3xl p-8 text-center">
              <Shield size={32} className="mx-auto mb-3 text-cyan-400 opacity-40" />
              <p className="text-[#E5F5F0] text-sm font-bold mb-1">No multisig wallets yet</p>
              <p className="text-[#8AA4A0] text-xs">
                Backend API ready: POST /api/advanced/multisig/wallets to create one
              </p>
            </Card>
          ) : (
            multisigWallets.map((wallet, wIdx) => (
              <Card key={wallet.wallet_id || wIdx} className="rounded-3xl p-6">
                <div className="flex items-start justify-between mb-5 flex-wrap gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                      <Shield size={18} className="text-cyan-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[#E5F5F0] font-bold text-base">
                          {wallet.name || wallet.wallet_id}
                        </h3>
                        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/40 text-[9px] font-mono">
                          {wallet.wallet_id}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-[#8AA4A0]">
                        <span>Quorum: <span className="text-[#E5F5F0] font-bold">{wallet.required_signatures}/{wallet.signers?.length || 0}</span></span>
                        <span>•</span>
                        <span>Balance: <span className="text-green-400 font-bold">{wallet.balance || 0} CVI</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(wallet.signers || []).slice(0, 5).map((s: string, i: number) => (
                      <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-[#0A0F14] text-[9px] font-bold" title={s}>
                        {s.substring(0, 2).toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {(wallet.transactions || []).length === 0 ? (
                    <div className="text-center py-6 text-[#8AA4A0] text-xs">
                      No transactions yet
                    </div>
                  ) : (
                    wallet.transactions.map((tx, tIdx) => {
                      const status = tx.executed ? 'EXECUTED' : 'PENDING'
                      const colors = getStatusColors(status)
                      const signerCount = tx.signatures?.length || 0
                      const required = wallet.required_signatures || 1
                      return (
                        <div key={tIdx} className="p-4 rounded-lg bg-[#0F1419] border" style={{ borderColor: colors.border }}>
                          <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <Badge className="text-[9px] gap-1 py-0.5 px-2" style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                                {status === 'EXECUTED' ? <CheckCircle size={10} /> : <Clock size={10} />}
                                {status}
                              </Badge>
                              <span className="text-[#E5F5F0] text-xs font-bold">{tx.reason || tx.to_wallet}</span>
                            </div>
                            {status === 'PENDING' && signerCount < required && (
                              <button
                                onClick={() => signTransaction(wallet.wallet_id, tx.tx_id)}
                                className="flex items-center gap-1 px-3 py-1 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-[10px] font-medium hover:bg-cyan-500/30 transition"
                              >
                                <Vote size={10} />
                                Sign ({signerCount}/{required})
                              </button>
                            )}
                            {status === 'PENDING' && signerCount >= required && (
                              <button
                                onClick={() => executeTransaction(wallet.wallet_id, tx.tx_id)}
                                className="flex items-center gap-1 px-3 py-1 rounded-md bg-green-500/20 text-green-400 border border-green-500/40 text-[10px] font-medium hover:bg-green-500/30 transition"
                              >
                                <CheckCircle size={10} />
                                Execute
                              </button>
                            )}
                          </div>
                          <p className="text-[#8AA4A0] text-[11px] mb-3">
                            Amount: {tx.amount} CVI · To: {tx.to_wallet || 'N/A'}
                          </p>
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className="text-[#5EEAD4] text-[10px]">
                              Signatures: {signerCount}/{required}
                            </span>
                            <span className="text-[#5EEAD4] text-[10px] font-mono">
                              TX: {tx.tx_id}
                            </span>
                          </div>
                          {(tx.signatures || []).length > 0 && (
                            <div className="p-2 rounded bg-[#0A0F14] border border-cyan-500/10">
                              <div className="text-[#5EEAD4] text-[9px] font-mono truncate">
                                Signed by: {tx.signatures.join(', ')}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* WALLETS SECTION — live from /api/wallets */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#E5F5F0] mb-1">Wallets</h2>
          <p className="text-[#8AA4A0] text-sm">{wallets.length} wallets · {tokenName} Token</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Wallets', value: stats.total, icon: Wallet, color: '#5EEAD4' },
            { label: 'Total Balance', value: stats.totalBalance, icon: Coins, color: '#10B981' },
            { label: 'Transactions', value: stats.totalTx, icon: Activity, color: '#F59E0B' },
            { label: 'Total Supply', value: totalSupply, icon: Shield, color: '#8B5CF6' },
          ].map((s, i) => (
            <Card key={i} className="rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon size={14} style={{ color: s.color }} />
                <span className="text-[#8AA4A0] text-[10px] uppercase tracking-wider">{s.label}</span>
              </div>
              <div className="text-[#E5F5F0] text-2xl font-bold">{s.value}</div>
            </Card>
          ))}
        </div>

        <Card className="rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5EEAD4] opacity-60" size={14} />
              <Input
                placeholder="Search by owner or address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[#0F1419] border-cyan-500/30 text-[#E5F5F0] placeholder:text-[#5EEAD4]/40 h-10"
              />
            </div>
            <button
              onClick={loadWallets}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs hover:bg-cyan-500/20 transition"
            >
              <RefreshCw size={12} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-cyan-400" size={24} />
              <span className="ml-3 text-[#8AA4A0]">Loading wallets...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-400 text-xs">
              <AlertCircle className="mx-auto mb-2" size={24} />
              {error}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cyan-500/20">
                    <th className="text-left text-[#5EEAD4] text-[10px] font-bold tracking-wider uppercase pb-3">Owner</th>
                    <th className="text-left text-[#5EEAD4] text-[10px] font-bold tracking-wider uppercase pb-3">Address</th>
                    <th className="text-right text-[#5EEAD4] text-[10px] font-bold tracking-wider uppercase pb-3">Balance</th>
                    <th className="text-right text-[#5EEAD4] text-[10px] font-bold tracking-wider uppercase pb-3">Tx</th>
                    <th className="text-right text-[#5EEAD4] text-[10px] font-bold tracking-wider uppercase pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((w, i) => (
                    <tr key={i} className="border-b border-cyan-500/10 hover:bg-cyan-500/5 transition">
                      <td className="py-3 text-[#E5F5F0] text-xs font-medium">{w.owner}</td>
                      <td className="py-3 text-[#8AA4A0] text-[11px] font-mono">
                        {w.address.slice(0, 10)}...{w.address.slice(-6)}
                      </td>
                      <td className="py-3 text-right text-green-400 text-xs font-bold">{w.balance} {tokenName}</td>
                      <td className="py-3 text-right text-[#8AA4A0] text-xs">{w.txCount}</td>
                      <td className="py-3 text-right">
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/40 text-[9px]">
                          {w.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
