import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Link, Search, Eye, Hash, Box, Clock, CheckCircle, Zap, Shield } from 'lucide-react'

interface Block {
  id: number
  index: number
  hash: string
  prevHash: string
  timestamp: string
  transactions: number
  difficulty: number
  nonce: number
  status: 'Confirmed' | 'Pending' | 'Invalid'
}

const staticBlocks: Block[] = [
  { id: 1, index: 6, hash: '0x7a3f...9b2c', prevHash: '0x4e1d...3a8f', timestamp: '14:28:17', transactions: 12, difficulty: 4, nonce: 84293, status: 'Confirmed' },
  { id: 2, index: 5, hash: '0x4e1d...3a8f', prevHash: '0x9c2b...7e1a', timestamp: '14:26:42', transactions: 8, difficulty: 4, nonce: 71834, status: 'Confirmed' },
  { id: 3, index: 4, hash: '0x9c2b...7e1a', prevHash: '0x1f8a...4d3c', timestamp: '14:24:05', transactions: 15, difficulty: 4, nonce: 62917, status: 'Confirmed' },
  { id: 4, index: 3, hash: '0x1f8a...4d3c', prevHash: '0x8b5c...2a9e', timestamp: '14:21:33', transactions: 6, difficulty: 4, nonce: 58204, status: 'Confirmed' },
  { id: 5, index: 2, hash: '0x8b5c...2a9e', prevHash: '0x3d7e...6c1b', timestamp: '14:18:12', transactions: 11, difficulty: 4, nonce: 47382, status: 'Confirmed' },
  { id: 6, index: 1, hash: '0x3d7e...6c1b', prevHash: '0x0000...0000', timestamp: '14:15:00', transactions: 1, difficulty: 4, nonce: 12847, status: 'Confirmed' },
]

const statusColors = {
  Confirmed: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.4)' },
  Pending: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' },
  Invalid: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.4)' },
}

export function Blockchain() {
  const [blocks, setBlocks] = useState<Block[]>(staticBlocks)
  const [search, setSearch] = useState('')

  const filtered = blocks.filter((b) =>
    b.hash.toLowerCase().includes(search.toLowerCase()) ||
    b.index.toString().includes(search)
  )

  const stats = {
    total: blocks.length,
    confirmed: blocks.filter((b) => b.status === 'Confirmed').length,
    avgTx: Math.round(blocks.reduce((sum, b) => sum + b.transactions, 0) / blocks.length),
    difficulty: blocks[0]?.difficulty || 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Blockchain Explorer</h1>
          <p className="text-gray-400 text-sm">Immutable ledger of all dataset and model verifications</p>
        </div>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/40 gap-1.5 py-2 px-3">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Chain Valid
        </Badge>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Blocks', value: stats.total, color: '#38BDF8', icon: Box },
          { label: 'Confirmed', value: stats.confirmed, color: '#10B981', icon: CheckCircle },
          { label: 'Avg Transactions', value: stats.avgTx, color: '#8B5CF6', icon: Zap },
          { label: 'Difficulty', value: stats.difficulty, color: '#F59E0B', icon: Shield },
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

      {/* Search */}
      <Card className="glass-card border-cyan-500/20 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <Input
            placeholder="Search by block number or hash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-cyan-500/20 text-white placeholder:text-gray-500 h-10"
          />
        </div>
      </Card>

      {/* Chain Visualization */}
      <Card className="glass-card border-cyan-500/20 p-6">
        <div className="mb-4">
          <h3 className="text-white font-bold text-sm">CHAIN VISUALIZATION</h3>
          <p className="text-gray-500 text-xs mt-0.5">Click any block to explore details</p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-4">
          {blocks.map((block, i) => {
            const colors = statusColors[block.status]
            return (
              <div key={block.id} className="flex items-center gap-2 flex-shrink-0">
                <div
                  className="w-32 p-3 rounded-xl border-2 transition-all cursor-pointer hover:scale-105"
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    borderColor: colors.border,
                    boxShadow: `0 0 20px ${colors.text}20`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Hash size={12} style={{ color: colors.text }} />
                    <span className="text-[10px] font-bold" style={{ color: colors.text }}>#{block.index}</span>
                  </div>
                  <div className="text-white text-[10px] font-mono truncate">{block.hash}</div>
                  <div className="text-gray-500 text-[9px] mt-1">{block.transactions} tx</div>
                </div>
                {i < blocks.length - 1 && (
                  <Link size={16} className="text-cyan-400/50 flex-shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Blocks Table */}
      <Card className="glass-card border-cyan-500/20 p-5">
        <div className="mb-4">
          <h3 className="text-white font-bold text-sm">ALL BLOCKS</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyan-500/10">
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Block</th>
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Hash</th>
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Prev Hash</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Tx</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Nonce</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Time</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Status</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((block) => {
                const colors = statusColors[block.status]
                return (
                  <tr key={block.id} className="border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                          <Box size={14} className="text-cyan-400" />
                        </div>
                        <div className="text-white text-xs font-bold">#{block.index}</div>
                      </div>
                    </td>
                    <td className="py-3"><div className="text-cyan-400 text-xs font-mono">{block.hash}</div></td>
                    <td className="py-3"><div className="text-gray-500 text-xs font-mono">{block.prevHash}</div></td>
                    <td className="py-3 text-right"><div className="text-gray-300 text-xs font-mono">{block.transactions}</div></td>
                    <td className="py-3 text-right"><div className="text-gray-300 text-xs font-mono">{block.nonce.toLocaleString()}</div></td>
                    <td className="py-3 text-right"><div className="text-gray-500 text-xs font-mono flex items-center justify-end gap-1"><Clock size={10} />{block.timestamp}</div></td>
                    <td className="py-3 text-right">
                      <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                        ● {block.status}
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
