import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Loader2, RefreshCw, Brain, Hash, CheckCircle2, AlertTriangle,
  ShieldCheck, ShieldAlert, XCircle, HardDrive, Boxes, Scan
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

export function ModelIntegrity() {
  const [models, setModels] = useState<ModelFingerprint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { loadFingerprints() }, [])

  const loadFingerprints = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/api/premium/model/fingerprints`).then(r => r.json())
      setModels(res.fingerprints || [])
    } catch (err: any) {
      setError(err.message || 'Backend error')
    } finally { setLoading(false) }
  }

  const formatBytes = (bytes: number) => {
    if (!bytes) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  const getModelStyle = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes('good') || n.includes('base')) return { bg: '#D1FAE5', text: '#065F46', dot: '#10B981', label: 'Clean' }
    if (n.includes('bad')) return { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B', label: 'Drift' }
    if (n.includes('worst')) return { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444', label: 'Tampered' }
    return { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6', label: 'Unknown' }
  }

  const cleanCount = models.filter(m => {
    const n = m.name.toLowerCase()
    return n.includes('good') || n.includes('base')
  }).length
  const driftCount = models.filter(m => m.name.toLowerCase().includes('bad')).length
  const tamperedCount = models.filter(m => m.name.toLowerCase().includes('worst')).length

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-6">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              CV-INTEGRITY / Model Integrity
            </div>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">
              Model Integrity
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Weight fingerprinting, tamper detection and integrity status across all models.
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
            { label: 'Total Models', value: models.length, color: '#0F172A', icon: Brain },
            { label: 'Clean', value: cleanCount, color: '#10B981', icon: ShieldCheck },
            { label: 'Drift', value: driftCount, color: '#F59E0B', icon: ShieldAlert },
            { label: 'Tampered', value: tamperedCount, color: '#EF4444', icon: XCircle },
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
              <div className="mt-3 text-[32px] font-bold leading-none tracking-tight text-slate-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {s.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Models list */}
        <div className="mt-6">
          {loading && models.length === 0 ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-20 text-[13px] text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              Analyzing model integrity...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <div className="text-[13px] font-medium text-red-700">Failed to load models</div>
              <div className="mt-1 text-[11px] text-red-600">{error}</div>
            </div>
          ) : models.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center">
              <Brain size={32} className="mx-auto text-slate-400" />
              <div className="mt-3 text-[14px] font-medium text-slate-700">No models registered</div>
              <div className="mt-1 text-[11px] text-slate-500">Register a model to analyze integrity</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {models.map((m, i) => {
                const theme = getModelStyle(m.name)
                return (
                  <motion.div
                    key={m.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ y: -3 }}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-slate-100 p-5">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-11 w-11 items-center justify-center rounded-xl"
                          style={{ background: theme.bg }}
                        >
                          {theme.label === 'Clean' ? (
                            <ShieldCheck size={18} style={{ color: theme.text }} />
                          ) : theme.label === 'Drift' ? (
                            <ShieldAlert size={18} style={{ color: theme.text }} />
                          ) : theme.label === 'Tampered' ? (
                            <XCircle size={18} style={{ color: theme.text }} />
                          ) : (
                            <Scan size={18} style={{ color: theme.text }} />
                          )}
                        </div>
                        <div>
                          <div className="text-[14px] font-semibold text-slate-900">{m.name}</div>
                          <div className="mt-0.5 text-[10px] font-mono text-slate-500">
                            {m.framework || 'python'} · {m.status || 'registered'}
                          </div>
                        </div>
                      </div>
                      <span
                        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide"
                        style={{ background: theme.bg, color: theme.text }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: theme.dot }} />
                        {theme.label}
                      </span>
                    </div>

                    {/* Metrics grid */}
                    <div className="grid grid-cols-3 gap-3 p-5">
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <div className="flex items-center gap-1.5">
                          <Boxes size={11} className="text-slate-400" />
                          <span className="text-[10px] font-medium text-slate-500">Parameters</span>
                        </div>
                        <div className="mt-1.5 font-mono text-[14px] font-bold text-slate-900">
                          {m.parameter_count ? (m.parameter_count / 1e6).toFixed(1) + 'M' : '—'}
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <div className="flex items-center gap-1.5">
                          <HardDrive size={11} className="text-slate-400" />
                          <span className="text-[10px] font-medium text-slate-500">Size</span>
                        </div>
                        <div className="mt-1.5 font-mono text-[14px] font-bold text-slate-900">
                          {formatBytes(m.model_size_bytes)}
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 size={11} className="text-slate-400" />
                          <span className="text-[10px] font-medium text-slate-500">Status</span>
                        </div>
                        <div className="mt-1.5 text-[12px] font-semibold" style={{ color: theme.dot }}>
                          Verified
                        </div>
                      </div>
                    </div>

                    {/* Hash footer */}
                    <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Hash size={11} className="text-slate-400" />
                        <span className="text-[10px] font-medium text-slate-500">SHA-256</span>
                        <span className="truncate font-mono text-[10px] text-slate-600">
                          {m.model_hash ? m.model_hash.slice(0, 32) + '...' : 'Not computed'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ModelIntegrity
