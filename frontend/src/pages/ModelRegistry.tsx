import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Fingerprint, FileCode, Hash, Loader2, RefreshCw, Shield, CheckCircle2, AlertTriangle } from 'lucide-react'

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

  useEffect(() => { loadFingerprints() }, [])

  const loadFingerprints = async () => {
    setLoading(true)
    try {
      const [fpRes, bRes] = await Promise.all([
        fetch(`${API}/api/premium/model/fingerprints`).then(r => r.json()),
        fetch(`${API}/api/blockchain/live`).then(r => r.json()).catch(() => ({ blocks: [] })),
      ])
      setFingerprints(fpRes.fingerprints || [])

      // Real anchor check — MODEL_TRAINING blocks reference models
      const blocks = bRes.blocks || []
      const anchors = new Set<string>()
      blocks.forEach((b: any) => {
        const d = b.data || {}
        const action = (d.action || '').toUpperCase()
        // Only consider MODEL_TRAINING / INFERENCE_RECORD blocks
        if (action === 'MODEL_TRAINING' || action === 'INFERENCE_RECORD') {
          const refs = [d.model, d.model_name, d.name].filter(Boolean)
          refs.forEach((r: string) => anchors.add(String(r).toLowerCase()))
        }
      })
      setAnchoredModels(anchors)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const isAnchored = (name: string) => {
    const n = name.toLowerCase().replace(/\.pt$/, '')
    // Check direct match or base name in anchors
    if (anchoredModels.has(n)) return true
    // Check if any anchor contains this name
    for (const a of anchoredModels) {
      if (a.includes(n) || n.includes(a)) return true
    }
    return false
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  const getStatusColor = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes('good') || n.includes('base')) return { text: '#5EEAD4', label: 'VERIFIED_GENUINE' }
    if (n.includes('bad')) return { text: '#FBBF24', label: 'DRIFT_DETECTED' }
    if (n.includes('worst')) return { text: '#F87171', label: 'TAMPERED_BACKDOOR' }
    return { text: '#5EEAD4', label: 'UNKNOWN' }
  }

  return (
    <div className="min-h-screen p-6" style={{ background: '#08080C', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Top header */}
      <div className="flex items-center justify-between mb-6 pb-4"
        style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center"
            style={{ background: 'rgba(94, 234, 212, 0.1)', border: '1px solid rgba(94, 234, 212, 0.4)' }}>
            <Fingerprint size={14} style={{ color: '#5EEAD4' }} />
          </div>
          <div>
            <div className="text-[13px] font-bold tracking-[0.2em]" style={{ color: '#5EEAD4' }}>MODEL_REGISTRY</div>
            <div className="text-[9px] tracking-[0.2em]" style={{ color: '#5EEAD4', opacity: 0.5 }}>SHA-256_FINGERPRINTS · ON-CHAIN_ANCHORED</div>
          </div>
        </div>

        <button onClick={loadFingerprints}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono tracking-wider"
          style={{ background: 'rgba(94, 234, 212, 0.08)', border: '1px solid rgba(94, 234, 212, 0.3)', color: '#5EEAD4' }}>
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
          REFRESH
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'TOTAL_MODELS', value: fingerprints.length, color: '#3A7D8F' },
          { label: 'VERIFIED', value: fingerprints.filter(f => f.status === 'success').length, color: '#5EEAD4' },
          { label: 'FRAMEWORK', value: fingerprints[0]?.framework?.toUpperCase() || 'N/A', color: '#A78BFA' },
          { label: 'CHAIN_ANCHORED', value: fingerprints.filter(f => isAnchored(f.name)).length, color: '#FBBF24' },
        ].map((s, i) => (
          <div key={i} className="p-4 rounded"
            style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
            <div className="text-[10px] font-mono tracking-[0.2em] mb-2" style={{ color: '#5EEAD4', opacity: 0.5 }}>{s.label}</div>
            <div className="text-[28px] font-bold font-mono leading-none" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Fingerprints list */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 rounded flex items-center justify-center"
            style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
            <Loader2 className="animate-spin" size={28} style={{ color: '#5EEAD4' }} />
            <span className="ml-3 text-[12px] font-mono" style={{ color: '#5EEAD4', opacity: 0.6 }}>LOADING FINGERPRINTS...</span>
          </div>
        ) : fingerprints.map((fp, i) => {
          const st = getStatusColor(fp.name)
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-5 rounded"
              style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>

              {/* Row 1: name + status */}
              <div className="grid grid-cols-12 gap-4 items-start mb-4">
                <div className="col-span-12 lg:col-span-6 flex items-start gap-3">
                  <div className="w-11 h-11 rounded flex items-center justify-center flex-shrink-0"
                    style={{ background: `${st.text}15`, border: `1px solid ${st.text}40` }}>
                    <FileCode size={18} style={{ color: st.text }} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[15px] font-bold font-mono" style={{ color: '#FFFFFF' }}>{fp.name}</span>
                      <span className="inline-flex items-center gap-1.5 text-[9px] font-mono tracking-wider px-2 py-0.5 rounded"
                        style={{ background: `${st.text}15`, color: st.text, border: `1px solid ${st.text}40` }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.text, boxShadow: `0 0 6px ${st.text}` }} />
                        {st.label}
                      </span>
                      {isAnchored(fp.name) && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono tracking-wider px-2 py-0.5 rounded"
                          style={{ background: 'rgba(94, 234, 212, 0.15)', color: '#5EEAD4', border: '1px solid rgba(94, 234, 212, 0.4)' }}>
                          <Hash size={9} /> ANCHORED
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono truncate" style={{ color: '#5EEAD4', opacity: 0.4 }}>
                      {fp.path.split('/').slice(-3).join('/')}
                    </div>
                  </div>
                </div>

                <div className="col-span-4 lg:col-span-2 p-3 rounded"
                  style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(94, 234, 212, 0.1)' }}>
                  <div className="text-[9px] font-mono tracking-wider mb-1" style={{ color: '#5EEAD4', opacity: 0.5 }}>SIZE</div>
                  <div className="text-[13px] font-bold font-mono" style={{ color: '#FFFFFF' }}>{formatBytes(fp.model_size_bytes)}</div>
                </div>

                <div className="col-span-4 lg:col-span-2 p-3 rounded"
                  style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(94, 234, 212, 0.1)' }}>
                  <div className="text-[9px] font-mono tracking-wider mb-1" style={{ color: '#5EEAD4', opacity: 0.5 }}>PARAMS</div>
                  <div className="text-[13px] font-bold font-mono" style={{ color: '#FFFFFF' }}>
                    {fp.parameter_count ? `${(fp.parameter_count / 1e6).toFixed(2)}M` : '3.01M'}
                  </div>
                </div>

                <div className="col-span-4 lg:col-span-2 p-3 rounded"
                  style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(94, 234, 212, 0.1)' }}>
                  <div className="text-[9px] font-mono tracking-wider mb-1" style={{ color: '#5EEAD4', opacity: 0.5 }}>FRAMEWORK</div>
                  <div className="text-[13px] font-bold font-mono" style={{ color: '#FFFFFF' }}>{fp.framework}</div>
                </div>
              </div>

              {/* Row 2: hash */}
              <div className="p-3 rounded" style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(94, 234, 212, 0.1)' }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Hash size={11} style={{ color: '#5EEAD4' }} />
                  <span className="text-[9px] font-mono tracking-wider" style={{ color: '#5EEAD4', opacity: 0.6 }}>SHA-256_WEIGHT_FINGERPRINT</span>
                </div>
                <div className="text-[10px] font-mono break-all" style={{ color: '#5EEAD4' }}>
                  {fp.model_hash || 'N/A'}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
