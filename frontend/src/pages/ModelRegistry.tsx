import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Fingerprint, Hash, Loader2, RefreshCw, Shield, CheckCircle2,
  AlertTriangle, FileCode, Cpu, HardDrive, Boxes, Link as LinkIcon
} from 'lucide-react'

const API = 'http://localhost:8000'

interface ModelFingerprint {
  name: string
  path: string
  status: string
  model_hash: string
  model_size_bytes: number
  parameter_count: number
  framework: string
}

export function ModelRegistry() {
  const [fingerprints, setFingerprints] = useState<ModelFingerprint[]>([])
  const [anchoredModels, setAnchoredModels] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { loadFingerprints() }, [])

  const loadFingerprints = async () => {
    setLoading(true)
    setError(null)
    try {
      const [fpRes, bRes] = await Promise.all([
        fetch(`${API}/api/premium/model/fingerprints`).then(r => r.json()).catch(() => ({ fingerprints: [] })),
        fetch(`${API}/api/blockchain/live`).then(r => r.json()).catch(() => ({ blocks: [] })),
      ])
      setFingerprints(fpRes.fingerprints || [])

      const blocks = bRes.blocks || []
      const anchors = new Set<string>()
      blocks.forEach((b: any) => {
        const d = b.data || {}
        const action = (d.action || '').toUpperCase()
        if (action === 'MODEL_TRAINING' || action === 'INFERENCE_RECORD') {
          const refs = [d.model, d.model_name, d.name].filter(Boolean)
          refs.forEach((r: string) => anchors.add(String(r).toLowerCase()))
        }
      })
      setAnchoredModels(anchors)
    } catch (err: any) {
      setError(err.message || 'Backend error')
    } finally { setLoading(false) }
  }

  const isAnchored = (name: string) => {
    const n = name.toLowerCase().replace(/\.pt$/, '')
    return Array.from(anchoredModels).some(a => a.includes(n) || n.includes(a))
  }

  const formatBytes = (bytes: number) => {
    if (!bytes) return '—'
    const mb = bytes / (1024 * 1024)
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`
  }

  const formatParams = (n: number) => {
    if (!n) return '—'
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
    return String(n)
  }

  const anchoredCount = fingerprints.filter(f => isAnchored(f.name)).length

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-6">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              CV-INTEGRITY / Model Registry
            </div>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">
              Model Fingerprints
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Cryptographic fingerprints, weight hashes and blockchain anchoring status for all registered models.
            </p>
          </div>
          <button
            onClick={loadFingerprints}
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Registered', value: fingerprints.length, color: '#0F172A', icon: Fingerprint },
            { label: 'Anchored', value: anchoredCount, color: '#10B981', icon: LinkIcon },
            { label: 'Frameworks', value: Array.from(new Set(fingerprints.map(f => f.framework).filter(Boolean))).length, color: '#3B82F6', icon: FileCode },
            { label: 'Total Size', value: formatBytes(fingerprints.reduce((s, f) => s + (f.model_size_bytes || 0), 0)), color: '#8B5CF6', icon: HardDrive },
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

        {/* Fingerprints table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading && fingerprints.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-20 text-[13px] text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              Loading fingerprints...
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <AlertTriangle size={24} className="mx-auto text-red-500" />
              <div className="mt-2 text-[13px] font-medium text-slate-700">Failed to load fingerprints</div>
              <div className="mt-1 text-[11px] text-slate-400">{error}</div>
            </div>
          ) : fingerprints.length === 0 ? (
            <div className="py-20 text-center">
              <Fingerprint size={32} className="mx-auto text-slate-400" />
              <div className="mt-3 text-[14px] font-medium text-slate-700">No model fingerprints found</div>
              <div className="mt-1 text-[11px] text-slate-500">Fingerprints are generated when models are registered</div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-12 gap-4 bg-slate-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                <div className="col-span-4">Model</div>
                <div className="col-span-2">Framework</div>
                <div className="col-span-2">Parameters</div>
                <div className="col-span-2">Size</div>
                <div className="col-span-2 text-right">Anchored</div>
              </div>

              {fingerprints.map((f, i) => {
                const anchored = isAnchored(f.name)
                return (
                  <motion.div
                    key={f.name}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="grid grid-cols-12 items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                        <Fingerprint size={15} className="text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-medium text-slate-900">{f.name}</div>
                        <div className="mt-0.5 flex items-center gap-1 truncate font-mono text-[10px] text-slate-500">
                          <Hash size={9} />
                          {f.model_hash ? f.model_hash.slice(0, 20) + '...' : 'No hash'}
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">
                        <FileCode size={10} />
                        {f.framework || 'Unknown'}
                      </span>
                    </div>

                    <div className="col-span-2 flex items-center gap-1.5">
                      <Boxes size={12} className="text-slate-400" />
                      <span className="font-mono text-[12px] font-semibold text-slate-800">
                        {formatParams(f.parameter_count)}
                      </span>
                    </div>

                    <div className="col-span-2 flex items-center gap-1.5">
                      <HardDrive size={12} className="text-slate-400" />
                      <span className="font-mono text-[12px] text-slate-700">
                        {formatBytes(f.model_size_bytes)}
                      </span>
                    </div>

                    <div className="col-span-2 flex justify-end">
                      {anchored ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                          <CheckCircle2 size={11} />
                          Anchored
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
                          <AlertTriangle size={11} />
                          Pending
                        </span>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {fingerprints.length > 0 && (
            <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-[11px] text-slate-500">
              Showing {fingerprints.length} fingerprint{fingerprints.length !== 1 ? 's' : ''} · {anchoredCount} anchored on-chain
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ModelRegistry
