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

export function Wallets() {
  const [wallets, setWallets] = useState<WalletData[]>([])
  const [tokenName, setTokenName] = useState('CVIT')
  const [totalSupply, setTotalSupply] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null)

  useEffect(() => {
    loadWallets()
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

  const governanceWallets = [
    {
      name: 'Model Deployment & Quarantine Governance',
      walletId: 'wallet_2of3',
      quorum: '2 of 3',
      balance: '100.0 CVI',
      signers: ['alice', 'bob', 'charlie'],
      transactions: [
        {
          status: 'EXECUTED',
          title: 'Promote YOLOv8-Good to Production',
          description: 'Passed all 6 smart contract gates with composite trust score 94.2',
          signedBy: ['alice', 'bob'],
          signatures: '2/2 signatures',
          txId: 'tx-a23-01',
          hash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2',
        },
        {
          status: 'PENDING',
          title: 'Approve High-Resolution Synthetic Dataset Batch #04',
          description: '300 validated street scene frames with clean bounding boxes',
          signedBy: ['bob'],
          signatures: '1/2 signatures',
          txId: 'tx-a23-02',
          action: 'Sign as Charlie',
        },
      ],
    },
    {
      name: 'Core Security & Emergency Quarantine Vault',
      walletId: 'wallet_3of5',
      quorum: '3 of 5',
      balance: '250.0 CVI',
      signers: ['alice', 'bob', 'charlie', 'david', 'eve'],
      transactions: [
        {
          status: 'EXECUTED',
          title: 'Hard Quarantine Model Worst Checkpoint',
          description: 'Detected adversarial vulnerability with evasion success rate > 65%',
          signedBy: ['david', 'charlie', 'eve'],
          signatures: '3/3 signatures',
          txId: 'tx-a35-01',
          hash: 'fe98dc76ba543210fe98dc76ba543210fe98dc76ba543210fe98dc76ba543210',
        },
        {
          status: 'PENDING',
          title: 'Authorize Defense Firmware Shield v3.1',
          description: 'Integrates automated GradCAM saliency drift protection',
          signedBy: ['alice', 'eve'],
          signatures: '2/3 signatures',
          txId: 'tx-a35-02',
        },
      ],
    },
  ]

  const getStatusColors = (status: string) => {
    if (status === 'EXECUTED') return { text: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)' }
    if (status === 'PENDING') return { text: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)' }
    return { text: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)' }
  }

  return (
    <div className="space-y-6 p-6" style={{ background: '#F5F5F0', minHeight: 'calc(100vh - 72px)' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-[#1A1A14] mb-1">Multisig Governance Wallets</h1>
          <p className="text-[#6B6B60] text-sm">
            Cryptographic multi-party governance enforcing quorum approval for all model deployments and quarantine actions.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {governanceWallets.map((wallet, wIdx) => (
            <Card key={wIdx} className="rounded-3xl p-6">
              <div className="flex items-start justify-between mb-5 flex-wrap gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                    <Wallet size={18} className="text-cyan-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[#1A1A14] font-bold text-base">{wallet.name}</h3>
                      <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/40 text-[9px] font-mono">
                        {wallet.walletId}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#6B6B60]">
                      <span>Quorum Required: <span className="text-[#1A1A14] font-bold">{wallet.quorum} signatures</span></span>
                      <span>•</span>
                      <span>Balance: <span className="text-green-400 font-bold">{wallet.balance}</span></span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {wallet.signers.map((signer, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#F5F5F0] border border-cyan-500/20">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-[#1A1A14] text-[8px] font-bold">
                        {signer.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[#1A1A14] text-[10px]">{signer}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <div className="text-[#8B8B80] text-[10px] uppercase tracking-wider font-bold mb-3">
                  PENDING &amp; EXECUTED TRANSACTIONS
                </div>

                <div className="space-y-3">
                  {wallet.transactions.map((tx, tIdx) => {
                    const colors = getStatusColors(tx.status)
                    return (
                      <div key={tIdx} className="p-4 rounded-lg bg-[#F5F5F0] border" style={{ borderColor: colors.border }}>
                        <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <Badge className="text-[9px] gap-1 py-0.5 px-2" style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                              {tx.status === 'EXECUTED' ? <CheckCircle size={10} /> : <Clock size={10} />}
                              {tx.status}
                            </Badge>
                            <span className="text-[#1A1A14] text-xs font-bold">{tx.title}</span>
                          </div>
                          {tx.status === 'PENDING' && tx.action && (
                            <button className="flex items-center gap-1 px-3 py-1 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-[10px] font-medium hover:bg-cyan-500/30">
                              <Vote size={10} />
                              {tx.action}
                            </button>
                          )}
                        </div>

                        <p className="text-[#6B6B60] text-[11px] mb-3">{tx.description}</p>

                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            {tx.signedBy.map((signer, sIdx) => (
                              <Badge key={sIdx} className="text-[9px] gap-1 py-0.5 px-1.5 bg-green-500/15 text-green-400 border-green-500/30">
                                <CheckCircle size={8} />
                                {signer}
                              </Badge>
                            ))}
                          </div>
                          <span className="text-[#8B8B80] text-[10px]">{tx.signatures}</span>
                          <span className="text-[#8B8B80] text-[10px] font-mono">TX: {tx.txId}</span>
                        </div>

                        {tx.hash && (
                          <div className="p-2 rounded bg-[#F5F5F0] border border-cyan-500/10">
                            <div className="text-[#8B8B80] text-[9px] font-mono truncate">
                              TX Hash: <span className="text-cyan-400">{tx.hash}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>

      <div className="border-t border-cyan-500/20 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1A1A14] mb-1">Wallets</h2>
            <p className="text-[#6B6B60] text-sm">
              {loading ? 'Loading from backend...' : `${wallets.length} wallets • ${tokenName} Token`}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadWallets} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-sm font-medium">
              <RefreshCw size={16} /> Refresh
            </button>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/40 gap-1.5 py-2 px-3">
              <Coins size={12} /> {tokenName}
            </Badge>
          </div>
        </div>

        {error && (
          <Card className="rounded-3xl p-4 mb-6" style={{ border: '1px solid rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.05)' }}>
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-400" size={20} />
              <div>
                <div className="text-red-400 font-medium text-sm">Backend Error</div>
                <div className="text-[#6B6B60] text-xs">{error}</div>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Wallets', value: stats.total, color: '#38BDF8', icon: Wallet },
            { label: 'Total Balance', value: `${stats.totalBalance}`, color: '#10B981', icon: Coins },
            { label: 'Transactions', value: stats.totalTx, color: '#F59E0B', icon: Activity },
            { label: 'Total Supply', value: `${(totalSupply / 1000).toFixed(0)}K`, color: '#8B5CF6', icon: Shield },
          ].map((stat, i) => {
            const Icon = stat.icon
            return (
              <Card key={i} className="rounded-3xl p-5 border-cyan-500/20">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${stat.color}20`, border: `1px solid ${stat.color}40` }}>
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <div className="text-[#1A1A14] text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-[#6B6B60] text-xs">{stat.label}</div>
              </Card>
            )
          })}
        </div>

        <Card className="rounded-3xl border-cyan-500/20 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8B80]" size={16} />
            <Input
              placeholder="Search by owner or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[#F5F5F0] border-cyan-500/20 text-[#1A1A14] placeholder:text-[#8B8B80] h-10"
            />
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="rounded-3xl border-cyan-500/20 p-5 lg:col-span-2">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-cyan-400" size={32} />
                <span className="ml-3 text-[#6B6B60]">Loading wallets...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cyan-500/10">
                      <th className="text-left text-[#8B8B80] text-[10px] font-bold tracking-wider uppercase pb-3">Owner</th>
                      <th className="text-left text-[#8B8B80] text-[10px] font-bold tracking-wider uppercase pb-3">Address</th>
                      <th className="text-right text-[#8B8B80] text-[10px] font-bold tracking-wider uppercase pb-3">Balance</th>
                      <th className="text-right text-[#8B8B80] text-[10px] font-bold tracking-wider uppercase pb-3">Tx</th>
                      <th className="text-right text-[#8B8B80] text-[10px] font-bold tracking-wider uppercase pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((w, idx) => (
                      <tr
                        key={idx}
                        onClick={() => setSelectedWallet(w)}
                        className={`border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-colors cursor-pointer ${
                          selectedWallet?.owner === w.owner ? 'bg-cyan-500/10' : ''
                        }`}
                      >
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                              <Wallet size={14} className="text-purple-400" />
                            </div>
                            <div className="text-[#1A1A14] text-xs font-bold">{w.owner}</div>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="text-cyan-400 text-[10px] font-mono">{w.address.substring(0, 12)}...</div>
                            <button className="text-[#8B8B80] hover:text-cyan-400" onClick={(e) => e.stopPropagation()}>
                              <Copy size={10} />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          <div className="text-[#1A1A14] text-xs font-mono font-bold">{w.balance} {tokenName}</div>
                        </td>
                        <td className="py-3 text-right"><div className="text-[#1A1A14] text-xs font-mono">{w.txCount}</div></td>
                        <td className="py-3 text-right">
                          <Badge className="text-[10px] py-0.5 px-2 bg-green-500/20 text-green-400 border-green-500/40">
                            ● Active
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card className="rounded-3xl border-cyan-500/20 p-5 lg:col-span-1">
            <div className="mb-4">
              <h3 className="text-[#1A1A14] font-bold text-sm">TRANSACTIONS</h3>
              <p className="text-[#8B8B80] text-xs mt-0.5">
                {selectedWallet ? selectedWallet.owner : 'Select a wallet'}
              </p>
            </div>
            {selectedWallet && selectedWallet.transactions.length > 0 ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {selectedWallet.transactions.map((tx, i) => {
                  const isCredit = tx.type === 'CREDIT'
                  const color = getTxColor(tx.type)
                  return (
                    <div key={i} className="p-3 rounded-lg border" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderColor: `${color}30` }}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          {isCredit ? <ArrowDownLeft size={12} style={{ color }} /> : <ArrowUpRight size={12} style={{ color }} />}
                          <span className="text-xs font-bold" style={{ color }}>{tx.type}</span>
                        </div>
                        <span className="text-xs font-bold" style={{ color }}>{isCredit ? '+' : '-'}{tx.amount}</span>
                      </div>
                      <div className="text-[#1A1A14] text-[10px] mb-1">{tx.reason}</div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity size={32} className="text-[#8B8B80] mx-auto mb-2" />
                <div className="text-[#8B8B80] text-xs">No transactions</div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}