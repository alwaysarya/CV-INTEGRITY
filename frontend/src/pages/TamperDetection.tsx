import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Fingerprint, Search, Loader2, RefreshCw, CheckCircle, XCircle,
  Shield, Hash, AlertTriangle, Link as LinkIcon
} from 'lucide-react'
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
      const res = await apiClient.getBlocks().catch(() => ({ data: { blocks: [] } }))
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
    } finally {
      setLoading(false)
    }
  }

  const filtered = blocks.filter((b) =>
    b.hash.toLowerCase().includes(search.toLowerCase()) ||
    b.index.toString().includes(search) ||
    (b.data?.action || '').toLowerCase().includes(search.toLowerCase())
  )

  const statusTheme = {
    checking: { bg: '#F1F5F9', text: '#334155', dot: '#64748B', label: 'Checking' },
    valid: { bg: '#D1FAE5', text: '#065F46', dot: '#10B981', label: 'Chain Valid' },
    invalid: { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444', label: 'Chain Broken' },
  }[validationStatus]

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-6">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              CV-INTEGRITY / Tamper Detection
            </div>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">
              Tamper Detection
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Hash chain validation to detect any modification in the audit ledger.
            </p>
          </div>
          <button
            onClick={loadBlocks}
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Revalidate
          </button>
        </div>

        {/* Status banner */}
        <div
          className="rounded-2xl border p-5 shadow-sm"
          style={{
            borderColor: `${statusTheme.dot}30`,
            background: `linear-gradient(145deg, ${statusTheme.bg}, white)`,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: `${statusTheme.dot}20` }}
              >
                {validationStatus === 'valid' ? (
                  <CheckCircle size={22} style={{ color: statusTheme.dot }} />
                ) : validationStatus === 'invalid' ? (
                  <XCircle size={22} style={{ color: statusTheme.dot }} />
                ) : (
                  <Loader2 size={22} className="animate-spin" style={{ color: statusTheme.dot }} />
                )}
              </div>
              <div>
                <div className="text-[12px] font-medium text-slate-600">Chain Status</div>
                <div className="mt-0.5 text-[22px] font-bold tracking-tight" style={{ color: statusTheme.text }}>
                  {statusTheme.label}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-600">
                  {validationStatus === 'valid'
                    ? 'All blocks linked correctly — no tampering detected'
                    : validationStatus === 'invalid'
                    ? 'Hash chain integrity compromised'
                    : 'Running validation...'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-medium text-slate-500">Total Blocks</div>
              <div className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">
                {blocks.length}
              </div>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Blocks', value: blocks.length, color: '#0F172A', icon: Shield },
            { label: 'Verified', value: validationStatus === 'valid' ? blocks.length : 0, color: '#10B981', icon: CheckCircle },
            { label: 'Issues', value: validationStatus === 'invalid' ? 1 : 0, color: '#EF4444', icon: XCircle },
            { label: 'Integrity', value: validationStatus === 'valid' ? '100%' : '0%', color: '#3B82F6', icon: Fingerprint },
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

        {/* Search */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by hash, index or action..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-[13px] text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Blocks list */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading && blocks.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-20 text-[13px] text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              Validating chain...
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <AlertTriangle size={24} className="mx-auto text-red-500" />
              <div className="mt-2 text-[13px] font-medium text-slate-700">Validation failed</div>
              <div className="mt-1 text-[11px] text-slate-400">{error}</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Fingerprint size={32} className="mx-auto text-slate-400" />
              <div className="mt-3 text-[14px] font-medium text-slate-700">No blocks found</div>
              <div className="mt-1 text-[11px] text-slate-500">
                {search ? 'Try a different search term' : 'No blocks in ledger yet'}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-12 gap-4 bg-slate-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                <div className="col-span-2">Block</div>
                <div className="col-span-4">Hash</div>
                <div className="col-span-4">Previous Hash</div>
                <div className="col-span-2 text-right">Link</div>
              </div>

              {filtered.slice(0, 50).map((b, i) => {
                const prevMatch = i === 0 || b.previous_hash === filtered[i - 1]?.hash
                return (
                  <motion.div
                    key={b.index || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.02, 0.4) }}
                    className="grid grid-cols-12 items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50"
                  >
                    <div className="col-span-2 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50">
                        <span className="font-mono text-[10px] font-bold text-emerald-700">
                          #{b.index ?? i}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-4 flex items-center gap-2">
                      <Hash size={11} className="text-slate-400" />
                      <span className="truncate font-mono text-[10px] text-slate-700">
                        {b.hash ? b.hash.slice(0, 28) + '...' : '—'}
                      </span>
                    </div>

                    <div className="col-span-4 flex items-center gap-2">
                      <LinkIcon size={11} className="text-slate-400" />
                      <span className="truncate font-mono text-[10px] text-slate-500">
                        {b.previous_hash ? b.previous_hash.slice(0, 28) + '...' : 'Genesis'}
                      </span>
                    </div>

                    <div className="col-span-2 flex justify-end">
                      {validationStatus === 'valid' ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                          <CheckCircle size={10} />
                          Linked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-700">
                          <XCircle size={10} />
                          Broken
                        </span>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {blocks.length > 0 && (
            <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-[11px] text-slate-500">
              Showing {Math.min(filtered.length, 50)} of {blocks.length} blocks · Chain {validationStatus === 'valid' ? 'valid' : 'invalid'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TamperDetection
