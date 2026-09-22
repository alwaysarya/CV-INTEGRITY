import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Wallet, Search, Eye, Copy, TrendingUp, Activity, Shield, Coins } from 'lucide-react'

interface WalletData {
  id: number
  address: string
  owner: string
  balance: number
  transactions: number
  trustScore: number
  status: 'Active' | 'Inactive'
  created: string
}

const staticWallets: WalletData[] = [
  { id: 1, address: '0x7a3f...9b2c', owner: 'Aryan Thakur', balance: 1247.5, transactions: 234, trustScore: 94, status: 'Active', created: '3 months ago' },
  { id: 2, address: '0x4e1d...3a8f', owner: 'Priya Sharma', balance: 892.3, transactions: 156, trustScore: 87, status: 'Active', created: '2 months ago' },
  { id: 3, address: '0x9c2b...7e1a', owner: 'Rohan Mehta', balance: 534.8, transactions: 89, trustScore: 76, status: 'Active', created: '2 months ago' },
  { id: 4, address: '0x1f8a...4d3c', owner: 'Sneha Kapoor', balance: 2104.7, transactions: 312, trustScore: 98, status: 'Active', created: '1 month ago' },
  { id: 5, address: '0x8b5c...2a9e', owner: 'Vikram Singh', balance: 0, transactions: 42, trustScore: 45, status: 'Inactive', created: '4 months ago' },
  { id: 6, address: '0x3d7e...6c1b', owner: 'Ananya Rao', balance: 1567.2, transactions: 198, trustScore: 91, status: 'Active', created: '6 weeks ago' },
]

const statusColors = {
  Active: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.4)' },
  Inactive: { bg: 'rgba(107, 114, 128, 0.15)', text: '#9CA3AF', border: 'rgba(107, 114, 128, 0.4)' },
}

export function Wallets() {
  const [wallets] = useState<WalletData[]>(staticWallets)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')

  const filtered = wallets.filter((w) => {
    const matchesSearch = w.owner.toLowerCase().includes(search.toLowerCase()) || w.address.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || w.status === filter
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: wallets.length,
    active: wallets.filter((w) => w.status === 'Active').length,
    totalBalance: wallets.reduce((sum, w) => sum + w.balance, 0),
    avgTrust: Math.round(wallets.reduce((sum, w) => sum + w.trustScore, 0) / wallets.length),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Wallets</h1>
          <p className="text-gray-400 text-sm">Blockchain wallet management and verification</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all">
          <Wallet size={16} />
          Create Wallet
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Wallets', value: stats.total, color: '#38BDF8', icon: Wallet },
          { label: 'Active', value: stats.active, color: '#10B981', icon: Activity },
          { label: 'Total Balance', value: `${stats.totalBalance.toFixed(0)} CVT`, color: '#F59E0B', icon: Coins },
          { label: 'Avg Trust', value: `${stats.avgTrust}%`, color: '#8B5CF6', icon: Shield },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="glass-card p-5 border-cyan-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}20`, border: `1px solid ${stat.color}40` }}>
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
              </div>
              <div className="text-white text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-gray-400 text-xs">{stat.label}</div>
            </Card>
          )
        })}
      </div>

      <Card className="glass-card border-cyan-500/20 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <Input
              placeholder="Search by owner or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-cyan-500/20 text-white placeholder:text-gray-500 h-10"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'Active', 'Inactive'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  filter === f
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'text-gray-500 hover:text-gray-300 border border-cyan-500/10'
                }`}
              >
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="glass-card border-cyan-500/20 p-5">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyan-500/10">
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Owner</th>
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Address</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Balance</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Transactions</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Trust</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Status</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((wallet) => {
                const colors = statusColors[wallet.status]
                return (
                  <tr key={wallet.id} className="border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                          <Wallet size={14} className="text-purple-400" />
                        </div>
                        <div>
                          <div className="text-white text-xs font-medium">{wallet.owner}</div>
                          <div className="text-gray-500 text-[10px]">{wallet.created}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="text-cyan-400 text-xs font-mono">{wallet.address}</div>
                        <button className="text-gray-500 hover:text-cyan-400">
                          <Copy size={10} />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 text-right"><div className="text-white text-xs font-mono font-bold">{wallet.balance.toFixed(1)} CVT</div></td>
                    <td className="py-3 text-right"><div className="text-gray-300 text-xs font-mono">{wallet.transactions}</div></td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full rounded-full" style={{
                            width: `${wallet.trustScore}%`,
                            background: wallet.trustScore >= 80 ? '#10B981' : wallet.trustScore >= 60 ? '#F59E0B' : '#EF4444',
                          }} />
                        </div>
                        <span className="text-xs font-bold" style={{ color: wallet.trustScore >= 80 ? '#10B981' : wallet.trustScore >= 60 ? '#F59E0B' : '#EF4444' }}>{wallet.trustScore}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                        ● {wallet.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <button className="p-1.5 rounded hover:bg-cyan-500/10 text-gray-400 hover:text-cyan-400 transition-colors">
                        <Eye size={12} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
