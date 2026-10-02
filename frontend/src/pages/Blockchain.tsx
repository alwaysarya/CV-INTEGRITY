import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Loader2, RefreshCw, Box, Clock, CheckCircle, Plus, Zap, Shield, Hash, Link as LinkIcon, Radio } from 'lucide-react'
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

const actionColors: Record<string, string> = {
  GENESIS: '#A78BFA',
  DATASET_UPLOAD: '#5EEAD4',
  MODEL_TRAINING: '#38BDF8',
  TRUST_EVALUATION: '#FBBF24',
  INFERENCE_RECORD: '#F87171',
  ATTACK_BLOCKED: '#EF4444',
}

export function Blockchain() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [mining, setMining] = useState(false)
  const [validation, setValidation] = useState<any>({})
  const [stats, setStats] = useState<any>({})
  const [search, setSearch] = useState('')

  useEffect(() => { loadBlocks() }, [])

  const loadBlocks = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/blockchain/live`)
      setBlocks(res.data.blocks || [])
      setValidation(res.data.validation || {})
      setStats(res.data.stats || {})
    } catch (err) { console.error(err) } finally { setLoading(false) }
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
    } finally { setMining(false) }
  }

  const filtered = blocks.filter((b) =>
    b.hash.toLowerCase().includes(search.toLowerCase()) ||
    b.index.toString().includes(search) ||
    (b.data.action || '').toLowerCase().includes(search.toLowerCase())
  )

  const getActionColor = (action: string) => actionColors[action] || '#5EEAD4'

  return (
    <div className="min-h-screen p-6" style={{ background: '#08080C', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Top header */}
      <div className="flex items-center justify-between mb-6 pb-4"
        style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center"
            style={{ background: 'rgba(94, 234, 212, 0.1)', border: '1px solid rgba(94, 234, 212, 0.4)' }}>
            <LinkIcon size={14} style={{ color: '#5EEAD4' }} />
          </div>
          <div>
            <div className="text-[13px] font-bold tracking-[0.2em]" style={{ color: '#5EEAD4' }}>BLOCKCHAIN_EXPLORER</div>
            <div className="text-[9px] tracking-[0.2em]" style={{ color: '#5EEAD4', opacity: 0.5 }}>IMMUTABLE_LEDGER · SHA-256</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#5EEAD4', opacity: 0.5 }} />
            <input
              placeholder="Search block, hash, action..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded text-[11px] font-mono outline-none w-64"
              style={{ background: 'rgba(94, 234, 212, 0.05)', border: '1px solid rgba(94, 234, 212, 0.2)', color: '#FFFFFF' }}
            />
          </div>
          <button onClick={simulateNewBlock} disabled={mining}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono tracking-wider disabled:opacity-50"
            style={{ background: 'rgba(94, 234, 212, 0.15)', border: '1px solid rgba(94, 234, 212, 0.5)', color: '#5EEAD4' }}>
            {mining ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
            {mining ? 'MINING...' : 'MINE'}
          </button>
          <button onClick={loadBlocks}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono tracking-wider"
            style={{ background: 'rgba(94, 234, 212, 0.08)', border: '1px solid rgba(94, 234, 212, 0.3)', color: '#5EEAD4' }}>
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            REFRESH
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded"
            style={{
              background: validation.is_valid ? 'rgba(94, 234, 212, 0.08)' : 'rgba(248, 113, 113, 0.08)',
              border: `1px solid ${validation.is_valid ? 'rgba(94, 234, 212, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
            }}>
            {validation.is_valid ? (
              <><CheckCircle size={11} style={{ color: '#5EEAD4' }} />
              <span className="text-[10px] font-mono tracking-wider" style={{ color: '#5EEAD4' }}>CHAIN_VALID</span></>
            ) : (
              <><Shield size={11} style={{ color: '#F87171' }} />
              <span className="text-[10px] font-mono tracking-wider" style={{ color: '#F87171' }}>INVALID</span></>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'TOTAL_BLOCKS', value: stats.total_blocks || blocks.length, icon: Box, color: '#3A7D8F' },
          { label: 'LATEST_BLOCK', value: `#${stats.latest_block || 0}`, icon: CheckCircle, color: '#5EEAD4' },
          { label: 'UNIQUE_ACTIONS', value: stats.unique_actions || 0, icon: Hash, color: '#A78BFA' },
          { label: 'DIFFICULTY', value: validation.difficulty || 4, icon: Zap, color: '#FBBF24' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="p-4 rounded"
              style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono tracking-[0.2em]" style={{ color: '#5EEAD4', opacity: 0.5 }}>{s.label}</span>
                <Icon size={14} style={{ color: s.color, opacity: 0.7 }} />
              </div>
              <div className="text-[28px] font-bold font-mono leading-none" style={{ color: s.color }}>{s.value}</div>
            </div>
          )
        })}
      </div>

      {/* Chain Visualization */}
      {!loading && blocks.length > 0 && (
        <div className="p-5 rounded mb-5"
          style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
          <div className="mb-4">
            <h3 className="font-bold text-[11px] font-mono tracking-[0.2em]" style={{ color: '#5EEAD4' }}>CHAIN_VISUALIZATION</h3>
            <p className="text-[10px] font-mono mt-0.5" style={{ color: '#5EEAD4', opacity: 0.4 }}>Latest 8 blocks</p>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {blocks.slice(-8).map((block, i, arr) => {
              const action = block.data.action || 'UNKNOWN'
              const color = getActionColor(action)
              return (
                <div key={block.index} className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-32 p-3 rounded transition-all hover:scale-[1.03] cursor-pointer"
                    style={{ background: 'rgba(0, 0, 0, 0.3)', border: `1px solid ${color}40` }}>
                    <div className="flex items-center justify-between mb-2">
                      <Hash size={11} style={{ color }} />
                      <span className="text-[10px] font-mono font-bold" style={{ color }}>#{block.index}</span>
                    </div>
                    <div className="text-[9px] font-mono truncate" style={{ color: '#FFFFFF', opacity: 0.7 }}>
                      {block.hash.substring(0, 14)}...
                    </div>
                    <div className="text-[8px] font-mono mt-1 truncate" style={{ color, opacity: 0.8 }}>
                      {action}
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <span className="text-[14px] font-mono" style={{ color: '#5EEAD4', opacity: 0.4 }}>→</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="p-5 rounded"
        style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin" size={28} style={{ color: '#5EEAD4' }} />
            <span className="ml-3 text-[12px] font-mono" style={{ color: '#5EEAD4', opacity: 0.6 }}>LOADING BLOCKCHAIN...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.15)' }}>
                  {['BLOCK', 'ACTION', 'HASH', 'NONCE', 'TIME', 'STATUS'].map((h, i) => (
                    <th key={h}
                      className={`text-[10px] font-mono tracking-[0.15em] uppercase pb-3 ${i < 3 ? 'text-left' : 'text-right'}`}
                      style={{ color: '#5EEAD4', opacity: 0.5 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((block) => {
                  const action = block.data.action || 'UNKNOWN'
                  const color = getActionColor(action)
                  return (
                    <tr key={block.index} style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.06)' }}>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded flex items-center justify-center"
                            style={{ background: `${color}15`, border: `1px solid ${color}40` }}>
                            <Box size={14} style={{ color }} />
                          </div>
                          <div className="text-[12px] font-bold font-mono" style={{ color: '#FFFFFF' }}>
                            #{block.index}
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="text-[10px] font-mono tracking-wider px-2.5 py-1 rounded"
                          style={{ background: `${color}15`, color, border: `1px solid ${color}40` }}>
                          {action}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="text-[10px] font-mono" style={{ color: '#5EEAD4' }}>
                          {block.hash.substring(0, 20)}...
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <div className="text-[11px] font-mono" style={{ color: '#FFFFFF' }}>
                          {block.nonce.toLocaleString()}
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <div className="text-[10px] font-mono flex items-center justify-end gap-1" style={{ color: '#5EEAD4', opacity: 0.6 }}>
                          <Clock size={9} />
                          {block.datetime ? block.datetime.split('T')[1].split('.')[0] : 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-[10px] font-mono tracking-wider px-2.5 py-1 rounded"
                          style={{ background: 'rgba(94, 234, 212, 0.15)', color: '#5EEAD4', border: '1px solid rgba(94, 234, 212, 0.3)' }}>
                          ● VALID
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && !loading && (
              <div className="text-center py-16">
                <Box size={40} className="mx-auto mb-3" style={{ color: '#5EEAD4', opacity: 0.3 }} />
                <div className="text-[12px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>NO BLOCKS FOUND</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
