import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, ShieldCheck, Hash, Lock, CheckCircle, AlertTriangle, Upload, Key, Clock, Fingerprint } from 'lucide-react'

const truncate = (s: string, n = 20) => s ? s.substring(0, n) + '...' : ''

export function Provenance() {
  const [file, setFile] = useState<File | null>(null)
  const [modelName, setModelName] = useState('good')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [verifyResult, setVerifyResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runInference = async () => {
    if (!file) return
    setLoading(true); setError(null); setResult(null); setVerifyResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`http://localhost:8000/api/provenance/infer?model_name=${modelName}`, {
        method: 'POST', body: formData,
      })
      const data = await res.json()
      if (data.status === 'success') setResult(data)
      else setError(data.detail || 'Inference failed')
    } catch (err: any) { setError(err.message) } finally { setLoading(false) }
  }

  const verifyBinding = async () => {
    if (!result) return
    try {
      const res = await fetch('http://localhost:8000/api/provenance/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.provenance),
      })
      const data = await res.json()
      setVerifyResult(data.verification)
    } catch (err: any) { setError(err.message) }
  }

  const tamperTest = async () => {
    if (!result) return
    const tampered = { ...result.provenance, output_hash: '0' + result.provenance.output_hash.substring(1) }
    try {
      const res = await fetch('http://localhost:8000/api/provenance/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tampered),
      })
      const data = await res.json()
      setVerifyResult(data.verification)
    } catch (err: any) { setError(err.message) }
  }

  return (
    <div className="min-h-screen p-6" style={{ background: '#08080C', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 flex-wrap gap-3"
        style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center"
            style={{ background: 'rgba(94, 234, 212, 0.1)', border: '1px solid rgba(94, 234, 212, 0.4)' }}>
            <Fingerprint size={14} style={{ color: '#5EEAD4' }} />
          </div>
          <div>
            <div className="text-[13px] font-bold tracking-[0.2em]" style={{ color: '#5EEAD4' }}>INFERENCE_PROVENANCE</div>
            <div className="text-[9px] tracking-[0.2em]" style={{ color: '#5EEAD4', opacity: 0.5 }}>
              CRYPTOGRAPHIC_BINDING · PS_2.2.3
            </div>
          </div>
        </div>
      </div>

      {/* Upload + Config */}
      <div className="p-5 rounded mb-5"
        style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="text-[10px] font-mono tracking-[0.2em] mb-2 block" style={{ color: '#5EEAD4', opacity: 0.6 }}>
              INPUT_IMAGE
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2.5 rounded text-[11px] font-mono outline-none file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-[10px] file:font-mono file:tracking-wider"
              style={{
                background: 'rgba(94, 234, 212, 0.05)',
                color: '#5EEAD4',
                border: '1px solid rgba(94, 234, 212, 0.2)',
              }}
            />
          </div>
          <div>
            <label className="text-[10px] font-mono tracking-[0.2em] mb-2 block" style={{ color: '#5EEAD4', opacity: 0.6 }}>
              MODEL
            </label>
            <select value={modelName} onChange={(e) => setModelName(e.target.value)}
              className="w-full px-3 py-2.5 rounded text-[11px] font-mono outline-none"
              style={{ background: 'rgba(94, 234, 212, 0.05)', color: '#5EEAD4', border: '1px solid rgba(94, 234, 212, 0.2)' }}>
              <option value="good" style={{ background: '#0A0F14' }}>GOOD</option>
              <option value="bad" style={{ background: '#0A0F14' }}>BAD</option>
              <option value="worst" style={{ background: '#0A0F14' }}>WORST</option>
              <option value="base" style={{ background: '#0A0F14' }}>BASE (YOLOV8N)</option>
            </select>
          </div>
        </div>

        <button onClick={runInference} disabled={!file || loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded text-[11px] font-mono tracking-[0.15em] font-bold disabled:opacity-40"
          style={{
            background: 'rgba(94, 234, 212, 0.15)',
            border: '1px solid rgba(94, 234, 212, 0.5)',
            color: '#5EEAD4',
            boxShadow: !file || loading ? 'none' : '0 0 16px rgba(94, 234, 212, 0.2)',
          }}>
          {loading ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
          {loading ? 'RUNNING_INFERENCE_&_GENERATING_BINDING...' : 'RUN_INFERENCE_&_GENERATE_PROVENANCE'}
        </button>

        {error && (
          <div className="mt-4 p-3 rounded flex items-center gap-2"
            style={{ background: 'rgba(248, 113, 113, 0.08)', border: '1px solid rgba(248, 113, 113, 0.3)' }}>
            <AlertTriangle size={13} style={{ color: '#F87171' }} />
            <span className="text-[11px] font-mono" style={{ color: '#F87171' }}>{error}</span>
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Detections */}
          <div className="p-5 rounded mb-5"
            style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
            <h2 className="font-bold text-[11px] font-mono tracking-[0.2em] mb-3" style={{ color: '#5EEAD4' }}>
              DETECTIONS ({result.total_detections})
            </h2>
            {result.detections.length === 0 ? (
              <div className="text-[11px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>NO_OBJECTS_DETECTED</div>
            ) : (
              <div className="space-y-2">
                {result.detections.map((d: any, i: number) => (
                  <div key={i} className="p-3 rounded flex items-center justify-between flex-wrap gap-2"
                    style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(94, 234, 212, 0.1)' }}>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold font-mono" style={{ color: '#5EEAD4' }}>{d.class_name}</span>
                      <span className="text-[10px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>conf: {(d.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <span className="text-[10px] font-mono" style={{ color: '#A78BFA' }}>
                      bbox: [{d.bbox.map((v: number) => v.toFixed(0)).join(', ')}]
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Binding */}
          <div className="p-5 rounded mb-5"
            style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded flex items-center justify-center"
                style={{ background: 'rgba(94, 234, 212, 0.15)', border: '1px solid rgba(94, 234, 212, 0.4)' }}>
                <Fingerprint size={16} style={{ color: '#5EEAD4' }} />
              </div>
              <div>
                <h2 className="font-bold text-[12px] font-mono tracking-[0.15em]" style={{ color: '#5EEAD4' }}>
                  CRYPTOGRAPHIC_BINDING
                </h2>
                <p className="text-[10px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>
                  All components bound together with SHA-256
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { label: 'INPUT_HASH', value: result.provenance.input_hash, icon: Upload, color: '#38BDF8' },
                { label: 'MODEL_WEIGHT_DIGEST', value: result.provenance.model_hash, icon: Key, color: '#A78BFA' },
                { label: 'PREPROCESSING_HASH', value: result.provenance.preprocess_hash, icon: Hash, color: '#FBBF24' },
                { label: 'INFERENCE_CONFIG_HASH', value: result.provenance.config_hash, icon: Lock, color: '#F87171' },
                { label: 'OUTPUT_HASH', value: result.provenance.output_hash, icon: CheckCircle, color: '#5EEAD4' },
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <div key={i} className="p-3 rounded"
                    style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(94, 234, 212, 0.1)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={11} style={{ color: item.color }} />
                      <span className="text-[9px] font-mono tracking-[0.2em]" style={{ color: '#5EEAD4', opacity: 0.5 }}>{item.label}</span>
                    </div>
                    <div className="text-[10px] font-mono break-all" style={{ color: item.color }}>
                      {item.value}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 p-4 rounded"
              style={{ background: 'rgba(94, 234, 212, 0.08)', border: '1px solid rgba(94, 234, 212, 0.4)' }}>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={14} style={{ color: '#5EEAD4' }} />
                <span className="font-bold text-[11px] font-mono tracking-[0.15em]" style={{ color: '#5EEAD4' }}>
                  COMBINED_BINDING
                </span>
              </div>
              <div className="text-[10px] font-mono break-all" style={{ color: '#5EEAD4' }}>
                {result.provenance.binding}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
              {[
                { label: 'SEQUENCE', value: result.provenance.sequence },
                { label: 'TIMESTAMP', value: truncate(result.provenance.timestamp, 16) },
                { label: 'NONCE', value: truncate(result.provenance.nonce, 12) },
              ].map((s, i) => (
                <div key={i} className="p-3 rounded"
                  style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(94, 234, 212, 0.1)' }}>
                  <div className="text-[9px] font-mono tracking-wider mb-1" style={{ color: '#5EEAD4', opacity: 0.5 }}>{s.label}</div>
                  <div className="text-[11px] font-mono" style={{ color: '#FFFFFF' }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={verifyBinding}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded text-[10px] font-mono tracking-wider font-bold"
                style={{ background: 'rgba(94, 234, 212, 0.15)', border: '1px solid rgba(94, 234, 212, 0.5)', color: '#5EEAD4' }}>
                <CheckCircle size={12} /> VERIFY_BINDING
              </button>
              <button onClick={tamperTest}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded text-[10px] font-mono tracking-wider font-bold"
                style={{ background: 'rgba(248, 113, 113, 0.15)', border: '1px solid rgba(248, 113, 113, 0.5)', color: '#F87171' }}>
                <AlertTriangle size={12} /> TAMPER_TEST
              </button>
            </div>
          </div>

          {/* Verification */}
          {verifyResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded"
              style={{
                background: verifyResult.binding_valid ? 'rgba(94, 234, 212, 0.06)' : 'rgba(248, 113, 113, 0.06)',
                border: `1px solid ${verifyResult.binding_valid ? 'rgba(94, 234, 212, 0.4)' : 'rgba(248, 113, 113, 0.4)'}`,
              }}>
              <div className="flex items-center gap-3">
                {verifyResult.binding_valid ? (
                  <CheckCircle size={28} style={{ color: '#5EEAD4' }} />
                ) : (
                  <AlertTriangle size={28} style={{ color: '#F87171' }} />
                )}
                <div>
                  <div className="font-bold text-[14px] font-mono tracking-wider"
                    style={{ color: verifyResult.binding_valid ? '#5EEAD4' : '#F87171' }}>
                    {verifyResult.binding_valid ? 'BINDING_VALID' : 'TAMPERING_DETECTED'}
                  </div>
                  <div className="text-[10px] font-mono mt-0.5" style={{ color: '#5EEAD4', opacity: 0.7 }}>
                    {verifyResult.binding_valid
                      ? 'Cryptographic binding matches — no tampering'
                      : 'Binding mismatch — record has been altered'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                {[
                  { label: 'RECOMPUTED', value: truncate(verifyResult.recomputed_binding, 30) },
                  { label: 'CLAIMED', value: truncate(verifyResult.claimed_binding, 30) },
                ].map((s, i) => (
                  <div key={i} className="p-3 rounded"
                    style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(94, 234, 212, 0.1)' }}>
                    <div className="text-[9px] font-mono tracking-wider mb-1" style={{ color: '#5EEAD4', opacity: 0.5 }}>{s.label}</div>
                    <div className="text-[10px] font-mono break-all" style={{ color: '#FFFFFF' }}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 mt-3 pt-3 flex-wrap"
                style={{ borderTop: '1px solid rgba(94, 234, 212, 0.1)' }}>
                <Clock size={11} style={{ color: '#5EEAD4', opacity: 0.5 }} />
                <span className="text-[10px] font-mono" style={{ color: '#5EEAD4', opacity: 0.6 }}>
                  Record age: {verifyResult.record_age_seconds}s
                </span>
                <span className="text-[9px] font-mono py-0.5 px-2 rounded tracking-wider font-bold"
                  style={{
                    background: verifyResult.replay_risk === 'low' ? 'rgba(94, 234, 212, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                    color: verifyResult.replay_risk === 'low' ? '#5EEAD4' : '#F87171',
                    border: `1px solid ${verifyResult.replay_risk === 'low' ? 'rgba(94, 234, 212, 0.4)' : 'rgba(248, 113, 113, 0.4)'}`,
                  }}>
                  REPLAY_RISK: {verifyResult.replay_risk.toUpperCase()}
                </span>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
