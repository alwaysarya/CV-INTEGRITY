import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Brain, Search, Upload, Loader2, AlertCircle, RefreshCw,
  CheckCircle2, Clock, TrendingUp, Scan, Hash, Radio
} from 'lucide-react'
import apiClient from '@/lib/api'

const API = 'http://localhost:8000'

interface Model {
  name: string
  precision: number
  recall: number
  mAP50: number
  mAP50_95: number
  model_hash?: string
  model_size_bytes?: number
  parameter_count?: number
  framework?: string
}

export function Models() {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => { loadModels() }, [])

  const loadModels = async () => {
    setLoading(true)
    setError(null)
    try {
      const [modelsRes, fingerprintsRes] = await Promise.all([
        apiClient.getModels(),
        fetch(`${API}/api/premium/model/fingerprints`).then(r => r.json()).catch(() => ({ fingerprints: [] })),
      ])
      const data = modelsRes.data
      const fingerprints = fingerprintsRes.fingerprints || []
      let modelsList: Model[] = []
      if (data.models && typeof data.models === 'object') {
        modelsList = Object.values(data.models)
      }
      modelsList = modelsList.map((m: any) => {
        const fp = fingerprints.find((f: any) => f.name?.toLowerCase() === m.name?.toLowerCase())
        return {
          ...m,
          model_hash: fp?.model_hash,
          model_size_bytes: fp?.model_size_bytes,
          parameter_count: fp?.parameter_count,
          framework: fp?.framework,
        }
      })
      setModels(modelsList)
    } catch (err: any) {
      setError(err.message || 'Backend error')
    } finally { setLoading(false) }
  }

  const filtered = models.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))

  const stats = {
    total: models.length,
    bestMAP: models.length ? Math.max(...models.map((m) => m.mAP50)).toFixed(2) : '0',
    avgPrecision: models.length ? (models.reduce((s, m) => s + m.precision, 0) / models.length).toFixed(2) : '0',
    avgRecall: models.length ? (models.reduce((s, m) => s + m.recall, 0) / models.length).toFixed(2) : '0',
  }

  const getStatus = (map: number) => {
    if (map >= 18) return { label: 'DEPLOYED', color: '#5EEAD4' }
    if (map >= 16) return { label: 'TESTING', color: '#FBBF24' }
    return { label: 'TRAINING', color: '#F87171' }
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
            <div className="text-[13px] font-bold tracking-[0.2em]" style={{ color: '#5EEAD4' }}>MODELS</div>
            <div className="text-[9px] tracking-[0.2em]" style={{ color: '#5EEAD4', opacity: 0.5 }}>MODEL_REGISTRY · INTEGRITY_VIEW</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#5EEAD4', opacity: 0.5 }} />
            <input
              placeholder="Search models..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded text-[11px] font-mono outline-none w-52"
              style={{ background: 'rgba(94, 234, 212, 0.05)', border: '1px solid rgba(94, 234, 212, 0.2)', color: '#FFFFFF' }}
            />
          </div>
          <button onClick={loadModels}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono tracking-wider"
            style={{ background: 'rgba(94, 234, 212, 0.08)', border: '1px solid rgba(94, 234, 212, 0.3)', color: '#5EEAD4' }}>
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            REFRESH
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono tracking-wider"
            style={{ background: 'rgba(94, 234, 212, 0.15)', border: '1px solid rgba(94, 234, 212, 0.5)', color: '#5EEAD4' }}>
            <Upload size={11} />
            DEPLOY
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded flex items-center gap-2"
          style={{ background: 'rgba(248, 113, 113, 0.08)', border: '1px solid rgba(248, 113, 113, 0.3)' }}>
          <AlertCircle size={14} style={{ color: '#F87171' }} />
          <span className="text-[11px] font-mono" style={{ color: '#F87171' }}>{error}</span>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'TOTAL_MODELS', value: stats.total, color: '#3A7D8F' },
          { label: 'BEST_MAP50', value: stats.bestMAP, color: '#5EEAD4' },
          { label: 'AVG_PRECISION', value: stats.avgPrecision, color: '#A78BFA' },
          { label: 'AVG_RECALL', value: stats.avgRecall, color: '#FBBF24' },
        ].map((s, i) => (
          <div key={i} className="p-4 rounded"
            style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
            <div className="text-[10px] font-mono tracking-[0.2em] mb-2" style={{ color: '#5EEAD4', opacity: 0.5 }}>{s.label}</div>
            <div className="text-[28px] font-bold font-mono leading-none" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Models Table */}
      <div className="p-5 rounded" style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin" size={28} style={{ color: '#5EEAD4' }} />
            <span className="ml-3 text-[12px] font-mono" style={{ color: '#5EEAD4', opacity: 0.6 }}>LOADING MODELS...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.15)' }}>
                  {['MODEL', 'PRECISION', 'RECALL', 'MAP50', 'MAP50-95', 'PARAMS', 'SHA-256', 'SIZE', 'STATUS'].map((h, i) => (
                    <th key={h}
                      className={`text-[10px] font-mono tracking-[0.15em] uppercase pb-3 ${i === 0 ? 'text-left' : 'text-right'}`}
                      style={{ color: '#5EEAD4', opacity: 0.5 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((model, i) => {
                  const st = getStatus(model.mAP50)
                  return (
                    <motion.tr key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.06)' }}>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded flex items-center justify-center"
                            style={{ background: `${st.color}15`, border: `1px solid ${st.color}40` }}>
                            <Brain size={16} style={{ color: st.color }} />
                          </div>
                          <div>
                            <div className="text-[13px] font-bold font-mono" style={{ color: '#FFFFFF' }}>{model.name.toUpperCase()}</div>
                            <div className="text-[10px] font-mono truncate max-w-[200px]" style={{ color: '#5EEAD4', opacity: 0.4 }}>
                              {model.model_hash ? model.model_hash.substring(0, 20) + '...' : 'No hash'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <span className="text-[12px] font-mono" style={{ color: '#FFFFFF' }}>{model.precision.toFixed(2)}</span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="text-[12px] font-mono" style={{ color: '#FFFFFF' }}>{model.recall.toFixed(2)}</span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="text-[12px] font-bold font-mono" style={{ color: st.color }}>{model.mAP50.toFixed(2)}</span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="text-[12px] font-mono" style={{ color: '#5EEAD4', opacity: 0.6 }}>{model.mAP50_95.toFixed(2)}</span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="text-[11px] font-mono" style={{ color: '#FFFFFF' }}>
                          {model.parameter_count ? `${(model.parameter_count / 1e6).toFixed(2)}M` : '3.01M'}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="text-[10px] font-mono cursor-help" style={{ color: '#5EEAD4' }} title={model.model_hash || ''}>
                          {model.model_hash ? model.model_hash.substring(0, 12) + '...' : '—'}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="text-[11px] font-mono" style={{ color: '#FFFFFF' }}>
                          {model.model_size_bytes ? `${(model.model_size_bytes / 1024 / 1024).toFixed(2)} MB` : '—'}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono"
                          style={{ background: `${st.color}15`, color: st.color, border: `1px solid ${st.color}40` }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.color, boxShadow: `0 0 6px ${st.color}` }} />
                          {st.label}
                        </span>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>

            {filtered.length === 0 && !loading && (
              <div className="text-center py-16">
                <Brain size={40} className="mx-auto mb-3" style={{ color: '#5EEAD4', opacity: 0.3 }} />
                <div className="text-[12px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>NO MODELS FOUND</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
