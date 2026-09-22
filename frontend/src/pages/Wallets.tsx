import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Wallet, Search, Copy, Loader2, RefreshCw, AlertCircle, Activity, Coins, Shield, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
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
      console.log('Wallets API Response:', data)

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Wallets</h1>
          <p className="text-gray-400 text-sm">
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
        <Card className="glass-card p-4" style={{ border: '1px solid rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-400" size={20} />
            <div>
              <div className="text-red-400 font-medium text-sm">Backend Error</div>
              <div className="text-gray-400 text-xs">{error}</div>
            </div>
          </div>
        </Card>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Wallets', value: stats.total, color: '#38BDF8', icon: Wallet },
          { label: 'Total Balance', value: `${stats.totalBalance}`, color: '#10B981', icon: Coins },
          { label: 'Transactions', value: stats.totalTx, color: '#F59E0B', icon: Activity },
          { label: 'Total Supply', value: `${(totalSupply / 1000).toFixed(0)}K`, color: '#8B5CF6', icon: Shield },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="glass-card p-5 border-cyan-500/20">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${stat.color}20`, border: `1px solid ${stat.color}40` }}>
                <Icon size={20} style={{ color: stat.color }} />
              </div>
              <div className="text-white text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-gray-400 text-xs">{stat.label}</div>
            </Card>
          )
        })}
      </div>

      {/* Search */}
      <Card className="glass-card border-cyan-500/20 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <Input
            placeholder="Search by owner or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-cyan-500/20 text-white placeholder:text-gray-500 h-10"
          />
        </div>
      </Card>

      {/* 2-Column Layout: Table + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Wallets Table */}
        <Card className="glass-card border-cyan-500/20 p-5 lg:col-span-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-cyan-400" size={32} />
              <span className="ml-3 text-gray-400">Loading wallets...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cyan-500/10">
                    <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Owner</th>
                    <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Address</th>
                    <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Balance</th>
                    <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Tx</th>
                    <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Status</th>
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
                          <div className="text-white text-xs font-bold">{w.owner}</div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="text-cyan-400 text-[10px] font-mono">{w.address.substring(0, 12)}...</div>
                          <button className="text-gray-500 hover:text-cyan-400" onClick={(e) => e.stopPropagation()}>
                            <Copy size={10} />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <div className="text-white text-xs font-mono font-bold">{w.balance} {tokenName}</div>
                      </td>
                      <td className="py-3 text-right"><div className="text-gray-300 text-xs font-mono">{w.txCount}</div></td>
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

          {!loading && filtered.length === 0 && (
            <div className="text-center py-12">
              <Wallet size={48} className="text-gray-600 mx-auto mb-3" />
              <div className="text-gray-400 text-sm">No wallets found</div>
            </div>
          )}
        </Card>

        {/* Transaction Detail */}
        <Card className="glass-card border-cyan-500/20 p-5 lg:col-span-1">
          <div className="mb-4">
            <h3 className="text-white font-bold text-sm">TRANSACTIONS</h3>
            <p className="text-gray-500 text-xs mt-0.5">
              {selectedWallet ? selectedWallet.owner : 'Select a wallet'}
            </p>
          </div>

          {selectedWallet && selectedWallet.transactions.length > 0 ? (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {selectedWallet.transactions.map((tx, i) => {
                const isCredit = tx.type === 'CREDIT'
                const color = getTxColor(tx.type)
                return (
                  <div
                    key={i}
                    className="p-3 rounded-lg border"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      borderColor: `${color}30`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        {isCredit ? (
                          <ArrowDownLeft size={12} style={{ color }} />
                        ) : (
                          <ArrowUpRight size={12} style={{ color }} />
                        )}
                        <span className="text-xs font-bold" style={{ color }}>{tx.type}</span>
                      </div>
                      <span className="text-xs font-bold" style={{ color }}>
                        {isCredit ? '+' : '-'}{tx.amount}
                      </span>
                    </div>
                    <div className="text-gray-300 text-[10px] mb-1">{tx.reason}</div>
                    <div className="flex items-center justify-between text-[9px] text-gray-500">
                      <span>Bal: {tx.balance_after}</span>
                      <span>{new Date(tx.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity size={32} className="text-gray-600 mx-auto mb-2" />
              <div className="text-gray-500 text-xs">No transactions</div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
