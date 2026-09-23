import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Link as LinkIcon, Search, Eye, Hash, Box, Clock, CheckCircle, Loader2, RefreshCw, Plus, Zap, Shield } from 'lucide-react'
import axios from 'axios'
import { notify } from '@/lib/toast'

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

const actionColors: Record<string, { bg: string; text: string; border: string }> = {
  GENESIS: { bg: 'rgba(139, 92, 246, 0.15)', text: '#8B5CF6', border: 'rgba(139, 92, 246, 0.4)' },
  DATASET_UPLOAD: { bg: 'rgba(56, 189, 248, 0.15)', text: '#38BDF8', border: 'rgba(56, 189, 248, 0.4)' },
  MODEL_TRAINING: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.4)' },
  TRUST_EVALUATION: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' },
  INFERENCE_RECORD: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.4)' },
  ATTACK_BLOCKED: { bg: 'rgba(220, 38, 38, 0.15)', text: '#DC2626', border: 'rgba(220, 38, 38, 0.4)' },
}

export function Blockchain() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [mining, setMining] = useState(false)
  const [validation, setValidation] = useState<any>({})
  const [stats, setStats] = useState<any>({})
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadBlocks()
  }, [])

  const loadBlocks = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/blockchain/live`)
      setBlocks(res.data.blocks || [])
      setValidation(res.data.validation || {})
      setStats(res.data.stats || {})
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const simulateNewBlock = async () => {
    setMining(true)
    try {
      notify.info('Mining new block...', 'Proof of Work in progress')
      const res = await axios.post(`${API}/api/blockchain/simulate`)
      if (res.data.status === 'success') {
        notify.success('Block mined!', res.data.message)
        await loadBlocks()
      }
    } catch (err: any) {
      notify.error('Mining failed', err.message)
    } finally {
      setMining(false)
    }
  }

  const filtered = blocks.filter((b) =>
    b.hash.toLowerCase().includes(search.toLowerCase()) ||
    b.index.toString().includes(search) ||
    (b.data.action || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-1">Blockchain Explorer</h1>
          <p className="text-gray-400 text-sm">
            {loading ? 'Loading blockchain...' : `${blocks.length} blocks on-chain`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={simulateNewBlock}
            disabled={mining}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-medium disabled:opacity-50 hover-scale"
          >
            {mining ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {mining ? 'Mining...' : 'Mine New Block'}
          </button>
          <button
            onClick={loadBlocks}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-sm font-medium hover:bg-cyan-500/30 hover-scale"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <Badge className={validation.is_valid ? 'bg-green-500/20 text-green-400 border-green-500/40 gap-1.5 py-2 px-3' : 'bg-red-500/20 text-red-400 border-red-500/40 gap-1.5 py-2 px-3'}>
            {validation.is_valid ? <CheckCircle size={12} /> : <Shield size={12} />}
            {validation.is_valid ? 'Chain Valid' : 'Invalid'}
          </Badge>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Blocks', value: stats.total_blocks || blocks.length, color: '#38BDF8', icon: Box },
          { label: 'Latest Block', value: `#${stats.latest_block || 0}`, color: '#10B981', icon: CheckCircle },
          { label: 'Unique Actions', value: stats.unique_actions || 0, color: '#8B5CF6', icon: Hash },
          { label: 'Difficulty', value: validation.difficulty || 4, color: '#F59E0B', icon: Zap },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }}>
              <Card className="liquid-glass specular border-0 p-5 hover-lift">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${stat.color}20`, border: `1px solid ${stat.color}40` }}>
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <div className="text-white text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-gray-400 text-xs">{stat.label}</div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Chain Visualization */}
      {!loading && blocks.length > 0 && (
        <Card className="liquid-glass border-0 p-6">
          <div className="mb-4">
            <h3 className="text-white font-bold text-sm">CHAIN VISUALIZATION</h3>
            <p className="text-gray-500 text-xs mt-0.5">Real blockchain from backend</p>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-4">
            {blocks.slice(-8).map((block, i, arr) => {
              const action = block.data.action || 'UNKNOWN'
              const colors = actionColors[action] || actionColors.GENESIS
              return (
                <div key={block.index} className="flex items-center gap-2 flex-shrink-0">
                  <div
                    className="w-32 p-3 rounded-xl border-2 transition-all cursor-pointer hover:scale-105"
                    style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderColor: colors.border, boxShadow: `0 0 20px ${colors.text}20` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Hash size={12} style={{ color: colors.text }} />
                      <span className="text-[10px] font-bold" style={{ color: colors.text }}>#{block.index}</span>
                    </div>
                    <div className="text-white text-[10px] font-mono truncate">{block.hash.substring(0, 14)}...</div>
                    <div className="text-gray-500 text-[9px] mt-1 truncate">{action}</div>
                  </div>
                  {i < arr.length - 1 && (
                    <LinkIcon size={16} className="text-cyan-400/50 flex-shrink-0" />
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Search */}
      <Card className="liquid-glass border-0 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <Input
            placeholder="Search by block, hash, or action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-cyan-500/20 text-white placeholder:text-gray-500 h-10"
          />
        </div>
      </Card>

      {/* Blocks Table */}
      <Card className="liquid-glass border-0 p-5">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
            <span className="ml-3 text-gray-400">Loading blockchain...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-500/10">
                  <th className="text-left text-gray-500 text-[10px] font-bold uppercase pb-3">Block</th>
                  <th className="text-left text-gray-500 text-[10px] font-bold uppercase pb-3">Action</th>
                  <th className="text-left text-gray-500 text-[10px] font-bold uppercase pb-3">Hash</th>
                  <th className="text-right text-gray-500 text-[10px] font-bold uppercase pb-3">Nonce</th>
                  <th className="text-right text-gray-500 text-[10px] font-bold uppercase pb-3">Time</th>
                  <th className="text-right text-gray-500 text-[10px] font-bold uppercase pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((block) => {
                  const action = block.data.action || 'UNKNOWN'
                  const colors = actionColors[action] || actionColors.GENESIS
                  return (
                    <tr key={block.index} className="border-b border-cyan-500/5 hover:bg-cyan-500/5">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}>
                            <Box size={14} style={{ color: colors.text }} />
                          </div>
                          <div className="text-white text-xs font-bold">#{block.index}</div>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                          {action}
                        </Badge>
                      </td>
                      <td className="py-3"><div className="text-cyan-400 text-xs font-mono">{block.hash.substring(0, 20)}...</div></td>
                      <td className="py-3 text-right"><div className="text-gray-300 text-xs font-mono">{block.nonce.toLocaleString()}</div></td>
                      <td className="py-3 text-right">
                        <div className="text-gray-500 text-xs font-mono flex items-center justify-end gap-1">
                          <Clock size={10} />
                          {block.datetime ? block.datetime.split('T')[1].split('.')[0] : 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <Badge className="text-[10px] py-0.5 px-2 bg-green-500/20 text-green-400 border-green-500/40">
                          ● Valid
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
