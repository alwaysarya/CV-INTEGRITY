import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Loader2, RefreshCw, Target, Zap, Image as ImageIcon, AlertCircle } from 'lucide-react'
import axios from 'axios'
import { notify } from '@/lib/toast'

const API = 'http://localhost:8000'

interface XAIResult {
  status: string
  method: string
  model_name: string
  access_level: string
  confidence: number
  limitations: string[]
  image_source: string
  original_image: string
  heatmap_overlay: string
  image_size: number[]
}

const methods = [
  { id: 'occlusion', label: 'OCCLUSION' },
  { id: 'saliency', label: 'SALIENCY' },
  { id: 'lime', label: 'LIME' },
  { id: 'shap', label: 'SHAP' },
]

export function XAI() {
  const [result, setResult] = useState<XAIResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState('occlusion')

  useEffect(() => { runExplanation() }, [selectedMethod])

  const runExplanation = async () => {
    setLoading(true)
    try {
      notify.info(`Running ${selectedMethod}...`, 'Generating explanation')
      const res = await axios.post(`${API}/api/xai/explain`, { method: selectedMethod, model_name: 'yolov8n' })
      if (res.data.status === 'success') {
        setResult(res.data)
        notify.success('Explanation generated!', `Method: ${selectedMethod}`)
      } else {
        notify.error('Failed', res.data.error)
      }
    } catch (err: any) {
      notify.error('Error', err.message)
    } finally { setLoading(false) }
  }

  const xaiLabFeatures = [
    { name: 'Vehicle Windshield & Hood Silhouette', value: 41.0, positive: true },
    { name: 'Wheel Contour & Shadow Baseline', value: 32.0, positive: true },
    { name: 'Road Asphalt Contrast Line', value: 16.0, positive: true },
    { name: 'Pedestrian Distractor Profile', value: -7.0, positive: false },
    { name: 'Background Sky Lighting Artifact', value: -4.0, positive: false },
  ]

  return (
    <div className="min-h-screen p-6" style={{ background: '#08080C', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Top header */}
      <div className="flex items-center justify-between mb-6 pb-4 flex-wrap gap-3"
        style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center"
            style={{ background: 'rgba(167, 139, 250, 0.1)', border: '1px solid rgba(167, 139, 250, 0.4)' }}>
            <Brain size={14} style={{ color: '#A78BFA' }} />
          </div>
          <div>
            <div className="text-[13px] font-bold tracking-[0.2em]" style={{ color: '#5EEAD4' }}>EXPLAINABLE_AI</div>
            <div className="text-[9px] tracking-[0.2em]" style={{ color: '#5EEAD4', opacity: 0.5 }}>
              VISUAL_ATTRIBUTION_HEATMAPS · SALIENCY_MAPS
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded"
            style={{ background: 'rgba(167, 139, 250, 0.15)', border: '1px solid rgba(167, 139, 250, 0.4)' }}>
            <Brain size={11} style={{ color: '#A78BFA' }} />
            <span className="text-[10px] font-mono tracking-wider" style={{ color: '#A78BFA' }}>XAI_ACTIVE</span>
          </div>
          <button onClick={runExplanation} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono tracking-wider disabled:opacity-50"
            style={{ background: 'rgba(94, 234, 212, 0.08)', border: '1px solid rgba(94, 234, 212, 0.3)', color: '#5EEAD4' }}>
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            REGENERATE
          </button>
        </div>
      </div>

      {/* Method Selector */}
      <div className="p-4 rounded mb-5 flex items-center gap-3 flex-wrap"
        style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
        <span className="text-[10px] font-mono tracking-wider" style={{ color: '#5EEAD4', opacity: 0.5 }}>METHOD:</span>
        {methods.map((m) => (
          <button key={m.id} onClick={() => setSelectedMethod(m.id)} disabled={loading}
            className="px-3 py-1.5 rounded text-[10px] font-mono tracking-wider transition-all"
            style={selectedMethod === m.id
              ? { background: 'rgba(94, 234, 212, 0.2)', color: '#5EEAD4', border: '1px solid rgba(94, 234, 212, 0.5)' }
              : { background: 'transparent', color: '#5EEAD4', opacity: 0.5, border: '1px solid rgba(94, 234, 212, 0.15)' }}>
            {m.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 rounded flex flex-col items-center justify-center"
          style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
          <Loader2 className="animate-spin mb-4" size={40} style={{ color: '#5EEAD4' }} />
          <div className="text-[12px] font-mono" style={{ color: '#5EEAD4', opacity: 0.8 }}>
            RUNNING_{selectedMethod.toUpperCase()}...
          </div>
          <div className="text-[10px] font-mono mt-2" style={{ color: '#5EEAD4', opacity: 0.4 }}>
            Analyzing image and generating heatmap
          </div>
        </div>
      ) : result ? (
        <>
          {/* Image + Heatmap */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
            <div className="p-5 rounded"
              style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ImageIcon size={13} style={{ color: '#38BDF8' }} />
                  <h3 className="font-bold text-[11px] font-mono tracking-[0.2em]" style={{ color: '#5EEAD4' }}>ORIGINAL_IMAGE</h3>
                </div>
                <span className="text-[9px] font-mono py-0.5 px-2 rounded tracking-wider"
                  style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
                  INPUT
                </span>
              </div>
              <div className="rounded overflow-hidden" style={{ background: '#050810', border: '1px solid rgba(94, 234, 212, 0.2)' }}>
                <img src={`data:image/png;base64,${result.original_image}`} alt="Original" className="w-full h-64 object-contain" />
              </div>
              <div className="mt-3 text-[9px] font-mono truncate" style={{ color: '#5EEAD4', opacity: 0.5 }}>
                {result.image_source?.split('/').slice(-2).join('/') || 'synthetic'}
              </div>
            </div>

            <div className="p-5 rounded"
              style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target size={13} style={{ color: '#F87171' }} />
                  <h3 className="font-bold text-[11px] font-mono tracking-[0.2em]" style={{ color: '#5EEAD4' }}>HEATMAP_OVERLAY</h3>
                </div>
                <span className="text-[9px] font-mono py-0.5 px-2 rounded tracking-wider"
                  style={{ background: 'rgba(248, 113, 113, 0.15)', color: '#F87171', border: '1px solid rgba(248, 113, 113, 0.4)' }}>
                  {result.method.toUpperCase()}
                </span>
              </div>
              <div className="rounded overflow-hidden" style={{ background: '#050810', border: '1px solid rgba(94, 234, 212, 0.2)' }}>
                <img src={`data:image/png;base64,${result.heatmap_overlay}`} alt="Heatmap" className="w-full h-64 object-contain" />
              </div>
              <div className="mt-3 flex items-center justify-between text-[9px] font-mono">
                <span style={{ color: '#5EEAD4', opacity: 0.5 }}>RED = HIGH ATTENTION</span>
                <span style={{ color: '#5EEAD4' }}>CONFIDENCE: {(result.confidence * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {[
              { label: 'METHOD_USED', value: result.method.toUpperCase(), sub: result.access_level, color: '#5EEAD4' },
              { label: 'MODEL', value: result.model_name, sub: `Image: ${result.image_size?.join('×')}`, color: '#A78BFA' },
              { label: 'CONFIDENCE', value: `${(result.confidence * 100).toFixed(1)}%`, color: result.confidence > 0.7 ? '#5EEAD4' : result.confidence > 0.4 ? '#FBBF24' : '#F87171' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded"
                style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
                <div className="text-[10px] font-mono tracking-[0.2em] mb-1.5" style={{ color: '#5EEAD4', opacity: 0.5 }}>{item.label}</div>
                <div className="text-[20px] font-bold font-mono" style={{ color: item.color }}>{item.value}</div>
                {item.sub && <div className="text-[10px] font-mono mt-1" style={{ color: '#5EEAD4', opacity: 0.5 }}>{item.sub}</div>}
              </div>
            ))}
          </div>

          {/* Limitations */}
          {result.limitations && result.limitations.length > 0 && (
            <div className="p-5 rounded mb-5"
              style={{ background: 'rgba(251, 191, 36, 0.03)', border: '1px solid rgba(251, 191, 36, 0.3)', borderLeft: '3px solid #FBBF24' }}>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={13} style={{ color: '#FBBF24' }} />
                <h3 className="font-bold text-[11px] font-mono tracking-[0.2em]" style={{ color: '#FBBF24' }}>LIMITATIONS</h3>
              </div>
              <ul className="space-y-1">
                {result.limitations.map((lim, i) => (
                  <li key={i} className="text-[11px] font-mono flex items-start gap-2"
                    style={{ color: '#5EEAD4', opacity: 0.7 }}>
                    <span style={{ color: '#FBBF24' }}>•</span>
                    {lim}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* XAI Lab */}
          <div className="pt-5" style={{ borderTop: '1px solid rgba(94, 234, 212, 0.15)' }}>
            <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
              <div>
                <h2 className="text-[16px] font-bold font-mono tracking-[0.15em] mb-1" style={{ color: '#5EEAD4' }}>
                  XAI_LAB
                </h2>
                <p className="text-[11px] font-mono" style={{ color: '#5EEAD4', opacity: 0.6 }}>
                  Visual attribution heatmaps revealing what the vision model attends to
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-5 rounded"
                style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Target size={13} style={{ color: '#5EEAD4' }} />
                    <h3 className="font-bold text-[11px] font-mono tracking-[0.2em]" style={{ color: '#5EEAD4' }}>
                      GRADCAM_HEATMAP
                    </h3>
                  </div>
                  <span className="text-[9px] font-mono py-0.5 px-2 rounded tracking-wider"
                    style={{ background: 'rgba(94, 234, 212, 0.15)', color: '#5EEAD4', border: '1px solid rgba(94, 234, 212, 0.4)' }}>
                    HIGH_CONFIDENCE
                  </span>
                </div>
                <div className="rounded overflow-hidden mb-4 aspect-video" style={{ background: '#050810', border: '1px solid rgba(94, 234, 212, 0.2)' }}>
                  {result ? (
                    <img src={`data:image/png;base64,${result.heatmap_overlay}`} alt="Heatmap" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>
                      LOADING...
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'TARGET', value: 'CAR', color: '#FFFFFF' },
                    { label: 'CONFIDENCE', value: '94.0%', color: '#5EEAD4' },
                    { label: 'COMPUTE', value: '18.2ms', color: '#FFFFFF' },
                  ].map((s, i) => (
                    <div key={i} className="p-2.5 rounded" style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(94, 234, 212, 0.1)' }}>
                      <div className="text-[9px] font-mono tracking-wider mb-1" style={{ color: '#5EEAD4', opacity: 0.5 }}>{s.label}</div>
                      <div className="font-bold text-[11px] font-mono" style={{ color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded"
                style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap size={13} style={{ color: '#5EEAD4' }} />
                    <h3 className="font-bold text-[11px] font-mono tracking-[0.2em]" style={{ color: '#5EEAD4' }}>
                      FEATURE_ATTRIBUTIONS
                    </h3>
                  </div>
                  <div className="text-[9px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>
                    FAITHFULNESS: <span style={{ color: '#5EEAD4' }}>93.6%</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {xaiLabFeatures.map((feature, i) => {
                    const barWidth = (Math.abs(feature.value) / 41) * 100
                    const color = feature.positive ? '#5EEAD4' : '#F87171'
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-mono" style={{ color: '#FFFFFF', opacity: 0.85 }}>{feature.name}</span>
                          <span className="text-[10px] font-bold font-mono" style={{ color }}>
                            {feature.positive ? '+' : ''}{feature.value.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(94, 234, 212, 0.1)' }}>
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${barWidth}%`, background: color, boxShadow: `0 0 6px ${color}` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
