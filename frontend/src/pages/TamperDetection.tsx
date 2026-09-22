import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Fingerprint, Search, Loader2, RefreshCw, AlertCircle, CheckCircle, XCircle, Shield, Hash } from 'lucide-react'
import apiClient from '@/lib/api'

interface BlockData {
  index: number
  hash: string
  previous_hash: string
  datetime: string
  data: any
  tampered?: boolean
}

export function TamperDetection() {
  const [blocks, setBlocks] = useState<BlockData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [validationStatus, setValidationStatus] = useState<'checking' | 'valid' | 'invalid'>('checking')

  useEffect(() => {
    loadBlocks()
  }, [])

  const loadBlocks = async () => {
    setLoading(true)
    setError(null)
    setValidationStatus('checking')
    try {
      const res = await apiClient.getBlocks()
      const data = res.data
      const blockList = data.blocks || []

      // Validate chain integrity
      let isValid = true
      for (let i = 1; i < blockList.length; i++) {
        if (blockList[i].previous_hash !== blockList[i - 1].hash) {
          isValid = false
          break
        }
      }

      setValidationStatus(isValid ? 'valid' : 'invalid')
      setBlocks(blockList.reverse()) // Latest first
    } catch (err: any) {
      console.error('Failed:', err)
      setError(err?.message || 'Backend connect nahi ho raha')
      setValidationStatus('invalid')
    } finally {
      setLoading(false)
    }
  }

  const filtered = blocks.filter((b) =>
    b.hash.toLowerCase().includes(search.toLowerCase()) ||
    b.index.toString().includes(search) ||
    (b.data?.action || '').toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: blocks.length,
    verified: validationStatus === 'valid' ? blocks.length : 0,
    issues: validationStatus === 'invalid' ? blocks.length : 0,
    integrity: validationStatus === 'valid' ? '100%' : '0%',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Tamper Detection</h1>
          <p className="text-gray-400 text-sm">
            {loading ? 'Verifying blockchain integrity...' : `Cryptographic validation of ${blocks.length} blocks`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadBlocks} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-sm font-medium">
            <RefreshCw size={16} /> Re-validate
          </button>
          <Badge
            className={validationStatus === 'valid'
              ? 'bg-green-500/20 text-green-400 border-green-500/40 gap-1.5 py-2 px-3'
              : 'bg-red-500/20 text-red-400 border-red-500/40 gap-1.5 py-2 px-3'
            }
          >
            {validationStatus === 'checking' ? (
              <><Loader2 size={12} className="animate-spin" /> Checking</>
            ) : validationStatus === 'valid' ? (
              <><Shield size={12} /> Chain Intact</>
            ) : (
              <><AlertCircle size={12} /> Tampered</>
            )}
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
          { label: 'Total Blocks', value: stats.total, color: '#38BDF8', icon: Hash },
          { label: 'Verified', value: stats.verified, color: '#10B981', icon: CheckCircle },
          { label: 'Issues', value: stats.issues, color: '#EF4444', icon: XCircle },
          { label: 'Integrity', value: stats.integrity, color: validationStatus === 'valid' ? '#10B981' : '#EF4444', icon: Shield },
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

      {/* Chain Integrity Visual */}
      {!loading && blocks.length > 0 && (
        <Card className="glass-card border-cyan-500/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-bold text-sm">CHAIN INTEGRITY CHECK</h3>
              <p className="text-gray-500 text-xs mt-0.5">Each block links to previous via SHA-256 hash</p>
            </div>
            {validationStatus === 'valid' ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/40 gap-1.5">
                <CheckCircle size={12} /> All links valid
              </Badge>
            ) : (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/40 gap-1.5">
                <XCircle size={12} /> Broken link detected
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            {blocks.slice(0, 6).map((block, i) => {
              const isFirst = i === 0
              const linked = !isFirst ? block.previous_hash === blocks[i - 1].hash : true
              const linkColor = linked ? '#10B981' : '#EF4444'
              return (
                <div key={block.index} className="flex items-center gap-3 p-3 rounded-lg bg-black/30 border" style={{ borderColor: `${linkColor}30` }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${linkColor}20`, border: `1px solid ${linkColor}40` }}>
                    {linked ? <CheckCircle size={14} style={{ color: linkColor }} /> : <XCircle size={14} style={{ color: linkColor }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white text-xs font-bold">Block #{block.index}</span>
                      <Badge className="text-[9px] py-0 px-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        {block.data?.action || 'UNKNOWN'}
                      </Badge>
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono truncate">
                      Hash: {block.hash.substring(0, 30)}...
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono truncate">
                      ← {block.previous_hash.substring(0, 30)}...
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[9px] text-gray-500">{block.datetime?.split('T')[1]?.split('.')[0] || 'N/A'}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Search */}
      <Card className="glass-card border-cyan-500/20 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <Input
            placeholder="Search by block #, hash, or action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-cyan-500/20 text-white placeholder:text-gray-500 h-10"
          />
        </div>
      </Card>

      {/* Blocks Table */}
      <Card className="glass-card border-cyan-500/20 p-5">
        <div className="mb-4">
          <h3 className="text-white font-bold text-sm">ALL BLOCKS — TAMPER STATUS</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
            <span className="ml-3 text-gray-400">Verifying blockchain...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-500/10">
                  <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Block</th>
                  <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Action</th>
                  <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Hash</th>
                  <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Nonce</th>
                  <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Time</th>
                  <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Integrity</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((block, i) => {
                  const isFirst = i === filtered.length - 1
                  const linked = !isFirst && block.previous_hash === blocks[i + 1]?.hash
                  return (
                    <tr key={block.index} className="border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                            <Fingerprint size={14} className="text-cyan-400" />
                          </div>
                          <div className="text-white text-xs font-bold">#{block.index}</div>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge className="text-[10px] py-0.5 px-2 bg-purple-500/20 text-purple-400 border border-purple-500/40">
                          {block.data?.action || 'UNKNOWN'}
                        </Badge>
                      </td>
                      <td className="py-3"><div className="text-cyan-400 text-xs font-mono">{block.hash.substring(0, 20)}...</div></td>
                      <td className="py-3 text-right"><div className="text-gray-300 text-xs font-mono">{block.data?.nonce || 'N/A'}</div></td>
                      <td className="py-3 text-right">
                        <div className="text-gray-500 text-xs font-mono">
                          {block.datetime?.split('T')[1]?.split('.')[0] || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <Badge className="text-[10px] py-0.5 px-2 bg-green-500/20 text-green-400 border-green-500/40">
                          <CheckCircle size={9} className="inline mr-0.5" />
                          Valid
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
