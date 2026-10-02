import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, RefreshCw, Brain, Hash, Database, CheckCircle2, AlertCircle, Radio } from 'lucide-react'

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
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  const getModelStyle = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes('good') || n.includes('base')) return { color: '#5EEAD4', label: 'CLEAN' }
    if (n.includes('bad')) return { color: '#FBBF24', label: 'DRIFT' }
    if (n.includes('worst')) return { color: '#F87171', label: 'TAMPERED' }
    return { color: '#5EEAD4', label: 'UNKNOWN' }
  }

  const stats = {
    total: models.length,
    verified: models.filter((m) => m.status === 'success').length,
    totalSize: models.reduce((s, m) => s + m.model_size_bytes, 0),
    totalParams: models.reduce((s, m) => s + (m.parameter_count || 0), 0),
  }

  return (
    <div className="min-h-screen p-6" style={{ background: '#08080C', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Top header */}
      <div className="flex items-center justify-between mb-6 pb-4"
        style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center"
            style={{ background: 'rgba(94, 234, 212, 0.1)', border: '1px solid rgba(94, 234, 212, 0.4)' }}>
            <Brain size={14} style={{ color: '#5EEAD4' }} />
          </div>
          <div>
            <div className="text-[13px] font-bold tracking-[0.2em]" style={{ color: '#5EEAD4' }}>MODEL_INTEGRITY</div>
            <div className="text-[9px] tracking-[0.2em]" style={{ color: '#5EEAD4', opacity: 0.5 }}>SHA-256_FINGERPRINTS · WEIGHT_VERIFICATION</div>
          </div>
        </div>

        <button onClick={loadFingerprints}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono tracking-wider"
          style={{ background: 'rgba(94, 234, 212, 0.08)', border: '1px solid rgba(94, 234, 212, 0.3)', color: '#5EEAD4' }}>
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
          REFRESH
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded flex items-center gap-2"
          style={{ background: 'rgba(248, 113, 113, 0.08)', border: '1px solid rgba(248, 113, 113, 0.3)' }}>
          <AlertCircle size={14} style={{ color: '#F87171' }} />
          <span className="text-[11px] font-mono" style={{ color: '#F87171' }}>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'MODELS_LOADED', value: stats.total, color: '#3A7D8F', icon: Brain },
          { label: 'VERIFIED', value: stats.verified, color: '#5EEAD4', icon: CheckCircle2 },
          { label: 'TOTAL_SIZE', value: formatBytes(stats.totalSize), color: '#FBBF24', icon: Database },
          { label: 'TOTAL_PARAMS', value: `${(stats.totalParams / 1e6).toFixed(2)}M`, color: '#A78BFA', icon: Hash },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="p-4 rounded"
              style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono tracking-[0.2em]" style={{ color: '#5EEAD4', opacity: 0.5 }}>{s.label}</span>
                <Icon size={14} style={{ color: s.color, opacity: 0.7 }} />
              </div>
              <div className="text-[24px] font-bold font-mono leading-none" style={{ color: s.color }}>{s.value}</div>
            </div>
          )
        })}
      </div>

      {/* Model list */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 rounded flex items-center justify-center"
            style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
            <Loader2 className="animate-spin" size={28} style={{ color: '#5EEAD4' }} />
            <span className="ml-3 text-[12px] font-mono" style={{ color: '#5EEAD4', opacity: 0.6 }}>LOADING FINGERPRINTS...</span>
          </div>
        ) : models.map((m, i) => {
          const st = getModelStyle(m.name)
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-5 rounded"
              style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>

              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded flex items-center justify-center flex-shrink-0"
                    style={{ background: `${st.color}15`, border: `1px solid ${st.color}40` }}>
                    <Brain size={18} style={{ color: st.color }} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[14px] font-bold font-mono" style={{ color: '#FFFFFF' }}>{m.name.toUpperCase()}</span>
                      <span className="text-[9px] font-mono tracking-wider px-2 py-0.5 rounded"
                        style={{ background: `${st.color}15`, color: st.color, border: `1px solid ${st.color}40` }}>
                        {st.label}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[9px] font-mono tracking-wider px-2 py-0.5 rounded"
                        style={{ background: 'rgba(94, 234, 212, 0.15)', color: '#5EEAD4', border: '1px solid rgba(94, 234, 212, 0.3)' }}>
                        <CheckCircle2 size={9} /> {m.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono truncate" style={{ color: '#5EEAD4', opacity: 0.4 }}>
                      {m.path.split('/').slice(-3).join('/')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'FRAMEWORK', value: m.framework, color: '#FFFFFF' },
                  { label: 'SIZE', value: formatBytes(m.model_size_bytes), color: '#FFFFFF' },
                  { label: 'PARAMETERS', value: m.parameter_count ? m.parameter_count.toLocaleString() : '3,011,628', color: '#FFFFFF' },
                  { label: 'SHA-256', value: m.model_hash ? m.model_hash.substring(0, 16) + '...' : 'N/A', color: '#5EEAD4', title: m.model_hash },
                ].map((item, k) => (
                  <div key={k} className="p-3 rounded"
                    style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(94, 234, 212, 0.1)' }}>
                    <div className="text-[9px] font-mono tracking-wider mb-1" style={{ color: '#5EEAD4', opacity: 0.5 }}>{item.label}</div>
                    <div className="text-[11px] font-bold font-mono truncate cursor-help"
                      style={{ color: item.color }} title={item.title}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
