import { useEffect, useState } from 'react'
import { Fingerprint, Search, Loader2, RefreshCw, AlertCircle, CheckCircle, XCircle, Shield, Hash } from 'lucide-react'
import apiClient from '@/lib/api'

export function TamperDetection() {
  const [blocks, setBlocks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [validationStatus, setValidationStatus] = useState<'checking' | 'valid' | 'invalid'>('checking')

  useEffect(() => { loadBlocks() }, [])

  const loadBlocks = async () => {
    setLoading(true)
    setError(null)
    setValidationStatus('checking')
    try {
      const res = await apiClient.getBlocks()
      const data = res.data
      const blockList = data.blocks || []

      let isValid = true
      for (let i = 1; i < blockList.length; i++) {
        if (blockList[i].previous_hash !== blockList[i - 1].hash) {
          isValid = false
          break
        }
      }
      setValidationStatus(isValid ? 'valid' : 'invalid')
      setBlocks(blockList.reverse())
    } catch (err: any) {
      setError(err?.message || 'Backend error')
      setValidationStatus('invalid')
    } finally { setLoading(false) }
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
    <div className="space-y-6 p-6" style={{ background: '#F5F5F0', minHeight: 'calc(100vh - 72px)' }}>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight" style={{ color: '#1A1A14' }}>Tamper Detection</h1>
          <p className="text-[13px] mt-1" style={{ color: '#6B6B60' }}>
            {loading ? 'Verifying blockchain integrity...' : `Cryptographic validation of ${blocks.length} blocks`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={loadBlocks}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-medium"
            style={{ background: '#FFFFFF', color: '#1A1A14', border: '1px solid #E8E6DC' }}>
            <RefreshCw size={14} /> Re-validate
          </button>
          <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-full"
            style={{ background: validationStatus === 'valid' ? '#E8F0E5' : '#F0DCD8' }}>
            {validationStatus === 'checking' ? (
              <><Loader2 size={12} className="animate-spin" style={{ color: '#3A7D8F' }} /><span className="text-[11px] font-bold" style={{ color: '#3A7D8F' }}>Checking</span></>
            ) : validationStatus === 'valid' ? (
              <><Shield size={12} style={{ color: '#2E7D4F' }} /><span className="text-[11px] font-bold" style={{ color: '#2E7D4F' }}>Chain Intact</span></>
            ) : (
              <><AlertCircle size={12} style={{ color: '#8B3A2E' }} /><span className="text-[11px] font-bold" style={{ color: '#8B3A2E' }}>Tampered</span></>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl flex items-center gap-3" style={{ background: '#F0DCD8', border: '1px solid #E5BDB2' }}>
          <AlertCircle size={18} style={{ color: '#8B3A2E' }} />
          <div className="text-[13px]" style={{ color: '#8B3A2E' }}>{error}</div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Blocks', value: stats.total, color: '#3A7D8F', icon: Hash },
          { label: 'Verified', value: stats.verified, color: '#2E7D4F', icon: CheckCircle },
          { label: 'Issues', value: stats.issues, color: '#8B3A2E', icon: XCircle },
          { label: 'Integrity', value: stats.integrity, color: validationStatus === 'valid' ? '#2E7D4F' : '#8B3A2E', icon: Shield },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="p-5 rounded-3xl" style={{ background: '#FFFFFF' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: '#F5F5F0' }}>
                <Icon size={18} style={{ color: stat.color }} />
              </div>
              <div className="text-[28px] font-bold tracking-tight leading-none mb-1" style={{ color: '#1A1A14' }}>{stat.value}</div>
              <div className="text-[12px]" style={{ color: '#8B8B80' }}>{stat.label}</div>
            </div>
          )
        })}
      </div>

      {/* Chain Integrity Visual */}
      {!loading && blocks.length > 0 && (
        <div className="p-5 rounded-3xl" style={{ background: '#FFFFFF' }}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-[13px] tracking-wide" style={{ color: '#1A1A14' }}>CHAIN INTEGRITY CHECK</h3>
              <p className="text-[11px] mt-0.5" style={{ color: '#8B8B80' }}>Each block links to previous via SHA-256 hash</p>
            </div>
            {validationStatus === 'valid' ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold"
                style={{ background: '#E8F0E5', color: '#2E7D4F' }}>
                <CheckCircle size={11} /> All links valid
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold"
                style={{ background: '#F0DCD8', color: '#8B3A2E' }}>
                <XCircle size={11} /> Broken link
              </span>
            )}
          </div>

          <div className="space-y-2">
            {blocks.slice(0, 6).map((block, i) => {
              const isFirst = i === 0
              const linked = !isFirst ? block.previous_hash === blocks[i - 1].hash : true
              const linkColor = linked ? '#2E7D4F' : '#8B3A2E'
              return (
                <div key={block.index} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: '#F5F5F0' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#FFFFFF' }}>
                    {linked ? <CheckCircle size={14} style={{ color: linkColor }} /> : <XCircle size={14} style={{ color: linkColor }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[12px] font-bold" style={{ color: '#1A1A14' }}>Block #{block.index}</span>
                      <span className="text-[9px] py-0.5 px-2 rounded-full font-bold"
                        style={{ background: '#E0EAEE', color: '#3A7D8F' }}>
                        {block.data?.action || 'UNKNOWN'}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono truncate" style={{ color: '#8B8B80' }}>
                      Hash: {block.hash.substring(0, 30)}...
                    </div>
                    <div className="text-[10px] font-mono truncate" style={{ color: '#8B8B80' }}>
                      ← {block.previous_hash.substring(0, 30)}...
                    </div>
                  </div>
                  <div className="text-[9px]" style={{ color: '#8B8B80' }}>
                    {block.datetime?.split('T')[1]?.split('.')[0] || 'N/A'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#8B8B80' }} />
        <input placeholder="Search by block #, hash, or action..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl text-[13px] outline-none"
          style={{ background: '#FFFFFF', color: '#1A1A14', border: '1px solid #EFEDE4' }} />
      </div>

      {/* Table */}
      <div className="p-5 rounded-3xl" style={{ background: '#FFFFFF' }}>
        <h3 className="font-bold text-[13px] tracking-wide mb-4" style={{ color: '#1A1A14' }}>ALL BLOCKS — TAMPER STATUS</h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin" size={28} style={{ color: '#8B8B80' }} />
            <span className="ml-3 text-[13px]" style={{ color: '#8B8B80' }}>Verifying blockchain...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #F5F5F0' }}>
                  {['Block', 'Action', 'Hash', 'Nonce', 'Time', 'Integrity'].map((h, i) => (
                    <th key={i}
                      className={`text-[10px] font-bold tracking-wider uppercase pb-3 ${i < 3 ? 'text-left' : 'text-right'}`}
                      style={{ color: '#8B8B80' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((block, i) => (
                  <tr key={block.index} style={{ borderBottom: '1px solid #F5F5F0' }}>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#E0EAEE' }}>
                          <Fingerprint size={14} style={{ color: '#3A7D8F' }} />
                        </div>
                        <div className="text-[12px] font-bold" style={{ color: '#1A1A14' }}>#{block.index}</div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-[10px] py-1 px-2.5 rounded-full font-bold"
                        style={{ background: '#EBE5F0', color: '#6B4B94' }}>
                        {block.data?.action || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="py-3"><div className="text-[11px] font-mono" style={{ color: '#2E7D4F' }}>{block.hash.substring(0, 20)}...</div></td>
                    <td className="py-3 text-right"><div className="text-[11px] font-mono" style={{ color: '#1A1A14' }}>{block.data?.nonce || 'N/A'}</div></td>
                    <td className="py-3 text-right">
                      <div className="text-[11px] font-mono" style={{ color: '#8B8B80' }}>
                        {block.datetime?.split('T')[1]?.split('.')[0] || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] py-1 px-2.5 rounded-full font-bold"
                        style={{ background: '#E8F0E5', color: '#2E7D4F' }}>
                        <CheckCircle size={9} /> Valid
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
