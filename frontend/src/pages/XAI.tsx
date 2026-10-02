import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Loader2, RefreshCw, Target, Zap, Image as ImageIcon } from 'lucide-react'
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
  image_source?: string
  original_image: string
  heatmap_overlay: string
  heatmap_raw: string
  image_size: number[]
  timestamp: string
  overlay?: string
  image?: string
}



export function XAI() {
  const [result, setResult] = useState<XAIResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState('occlusion')
  const [methods, setMethods] = useState<{id: string; label: string}[]>([])

  useEffect(() => {
    fetch(`${API}/api/xai/methods`)
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success') {
          setMethods(d.methods || [])
        }
      })
      .catch(console.error)
  }, [])

  useEffect(() => { runExplanation() }, [selectedMethod])

  const runExplanation = async () => {
    setLoading(true)
    try {
      notify.info(`Running ${selectedMethod}...`, 'Generating explanation')
      const res = await axios.post(`${API}/api/xai/explain`, {
        method: selectedMethod,
        model_name: 'yolov8n',
      })
      if (res.data.status === 'success') {
        setResult(res.data)
        notify.success('Explanation generated!', `Method: ${selectedMethod}`)
      } else {
        notify.error('Failed', res.data.error)
      }
    } catch (err: any) {
      notify.error('Error', err.message)
    } finally {
      setLoading(false)
    }
  }

  const confidence = result?.confidence ?? 0
  const confidencePct = (confidence * 100).toFixed(1)
  const confidenceLabel =
    confidence >= 0.7 ? 'HIGH' : confidence >= 0.4 ? 'MEDIUM' : 'LOW'

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: '#08080C', fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between mb-6 pb-4 flex-wrap gap-3"
        style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.15)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded flex items-center justify-center"
            style={{
              background: 'rgba(94, 234, 212, 0.1)',
              border: '1px solid rgba(94, 234, 212, 0.4)',
            }}
          >
            <Brain size={14} style={{ color: '#5EEAD4' }} />
          </div>
          <div>
            <div
              className="text-[13px] font-bold tracking-[0.2em]"
              style={{ color: '#5EEAD4' }}
            >
              EXPLAINABLE_AI
            </div>
            <div
              className="text-[9px] tracking-[0.2em]"
              style={{ color: '#5EEAD4', opacity: 0.5 }}
            >
              VISUAL_ATTRIBUTION_HEATMAPS · SALIENCY_MAPS
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono tracking-wider"
            style={{
              background: 'rgba(167, 139, 250, 0.15)',
              border: '1px solid rgba(167, 139, 250, 0.5)',
              color: '#A78BFA',
            }}
          >
            ⚡ XAI_ACTIVE
          </button>
          <button
            onClick={runExplanation}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono tracking-wider disabled:opacity-40"
            style={{
              background: 'rgba(94, 234, 212, 0.08)',
              border: '1px solid rgba(94, 234, 212, 0.3)',
              color: '#5EEAD4',
            }}
          >
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            REGENERATE
          </button>
        </div>
      </div>

      {/* Method switcher */}
      <div
        className="flex items-center gap-2 mb-5 p-3 rounded flex-wrap"
        style={{
          background: 'rgba(94, 234, 212, 0.02)',
          border: '1px solid rgba(94, 234, 212, 0.15)',
        }}
      >
        <span
          className="text-[10px] font-mono tracking-wider mr-2"
          style={{ color: '#5EEAD4', opacity: 0.6 }}
        >
          METHODS:
        </span>
        {methods.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMethod(m.id)}
            disabled={loading}
            className="px-3 py-1.5 rounded text-[10px] font-mono tracking-wider transition-all disabled:opacity-40"
            style={{
              background:
                selectedMethod === m.id
                  ? 'rgba(94, 234, 212, 0.15)'
                  : 'rgba(94, 234, 212, 0.03)',
              border: `1px solid ${
                selectedMethod === m.id
                  ? 'rgba(94, 234, 212, 0.5)'
                  : 'rgba(94, 234, 212, 0.15)'
              }`,
              color: selectedMethod === m.id ? '#FFFFFF' : '#5EEAD4',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded"
          style={{
            background: 'rgba(94, 234, 212, 0.02)',
            border: '1px solid rgba(94, 234, 212, 0.15)',
          }}
        >
          <Loader2
            className="animate-spin mb-4"
            size={32}
            style={{ color: '#5EEAD4' }}
          />
          <span
            className="text-[11px] font-mono"
            style={{ color: '#5EEAD4', opacity: 0.6 }}
          >
            RUNNING {selectedMethod.toUpperCase()}...
          </span>
        </div>
      ) : result ? (
        <>
          {/* Image comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
            {/* Original Image */}
            <div
              className="p-4 rounded"
              style={{
                background: 'rgba(94, 234, 212, 0.02)',
                border: '1px solid rgba(94, 234, 212, 0.15)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon size={12} style={{ color: '#5EEAD4' }} />
                  <span
                    className="text-[10px] font-mono tracking-wider"
                    style={{ color: '#5EEAD4' }}
                  >
                    ORIGINAL_IMAGE
                  </span>
                </div>
                <span
                  className="text-[9px] font-mono py-0.5 px-2 rounded"
                  style={{
                    background: 'rgba(94, 234, 212, 0.1)',
                    color: '#5EEAD4',
                    border: '1px solid rgba(94, 234, 212, 0.3)',
                  }}
                >
                  INPUT
                </span>
              </div>
              <div
                className="rounded overflow-hidden flex items-center justify-center"
                style={{
                  background: '#050810',
                  border: '1px solid rgba(94, 234, 212, 0.3)',
                  minHeight: 280,
                }}
              >
                <img
                  src={`data:image/jpeg;base64,${result.original_image}`}
                  alt="Original"
                  style={{ width: '100%', display: 'block' }}
                />
              </div>
              <div
                className="text-[9px] font-mono mt-2 truncate"
                style={{ color: '#5EEAD4', opacity: 0.5 }}
              >
                {result.image_source || 'input_image'}
              </div>
            </div>

            {/* Heatmap Overlay */}
            <div
              className="p-4 rounded"
              style={{
                background: 'rgba(94, 234, 212, 0.02)',
                border: '1px solid rgba(94, 234, 212, 0.15)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target size={12} style={{ color: '#F87171' }} />
                  <span
                    className="text-[10px] font-mono tracking-wider"
                    style={{ color: '#F87171' }}
                  >
                    HEATMAP_OVERLAY
                  </span>
                </div>
                <span
                  className="text-[9px] font-mono py-0.5 px-2 rounded"
                  style={{
                    background: 'rgba(248, 113, 113, 0.1)',
                    color: '#F87171',
                    border: '1px solid rgba(248, 113, 113, 0.3)',
                  }}
                >
                  {result.method?.toUpperCase()}
                </span>
              </div>
              <div
                className="rounded overflow-hidden flex items-center justify-center"
                style={{
                  background: '#050810',
                  border: '1px solid rgba(94, 234, 212, 0.3)',
                  minHeight: 280,
                }}
              >
                <img
                  src={`data:image/png;base64,${result.heatmap_overlay}`}
                  alt="Heatmap Overlay"
                  style={{ width: '100%', display: 'block' }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span
                  className="text-[9px] font-mono"
                  style={{ color: '#F87171', opacity: 0.7 }}
                >
                  RED = HIGH ATTENTION
                </span>
                <span
                  className="text-[9px] font-mono"
                  style={{ color: '#5EEAD4', opacity: 0.7 }}
                >
                  CONFIDENCE: {confidencePct}%
                </span>
              </div>
            </div>
          </div>

          {/* Metrics Row — real from backend */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {[
              { label: 'MODEL', value: (result.model_name || 'N/A').toUpperCase(), color: '#FFFFFF' },
              { label: 'METHOD', value: (result.method || 'N/A').toUpperCase(), color: '#5EEAD4' },
              { label: 'CONFIDENCE', value: `${confidencePct}%`, color: '#5EEAD4' },
            ].map((item, i) => (
              <div
                key={i}
                className="p-4 rounded"
                style={{
                  background: 'rgba(94, 234, 212, 0.02)',
                  border: '1px solid rgba(94, 234, 212, 0.15)',
                }}
              >
                <div
                  className="text-[9px] font-mono tracking-wider mb-1"
                  style={{ color: '#5EEAD4', opacity: 0.5 }}
                >
                  {item.label}
                </div>
                <div
                  className="text-[16px] font-bold font-mono"
                  style={{ color: item.color }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Limitations */}
          {result.limitations && result.limitations.length > 0 && (
            <div
              className="p-4 rounded mb-5"
              style={{
                background: 'rgba(251, 191, 36, 0.03)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[13px]">⚠️</span>
                <span
                  className="text-[10px] font-mono tracking-[0.2em] font-bold"
                  style={{ color: '#FBBF24' }}
                >
                  LIMITATIONS
                </span>
              </div>
              <ul className="space-y-1.5">
                {result.limitations.map((l, i) => (
                  <li
                    key={i}
                    className="text-[10px] font-mono flex gap-2"
                    style={{ color: '#FBBF24', opacity: 0.85 }}
                  >
                    <span>•</span>
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* XAI Lab */}
          <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(94, 234, 212, 0.15)' }}>
            <div className="mb-4">
              <h3
                className="text-[13px] font-bold font-mono tracking-[0.2em] mb-1"
                style={{ color: '#5EEAD4' }}
              >
                XAI_LAB
              </h3>
              <p
                className="text-[10px] font-mono"
                style={{ color: '#5EEAD4', opacity: 0.5 }}
              >
                Visual attribution heatmaps revealing what the vision model attends to
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* GradCAM Heatmap */}
              <div
                className="p-4 rounded"
                style={{
                  background: 'rgba(94, 234, 212, 0.02)',
                  border: '1px solid rgba(94, 234, 212, 0.15)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target size={12} style={{ color: '#5EEAD4' }} />
                    <span
                      className="text-[10px] font-mono tracking-wider"
                      style={{ color: '#5EEAD4' }}
                    >
                      GRADCAM_HEATMAP
                    </span>
                  </div>
                  <span
                    className="text-[9px] font-mono py-0.5 px-2 rounded"
                    style={{
                      background: 'rgba(94, 234, 212, 0.1)',
                      color: '#5EEAD4',
                      border: '1px solid rgba(94, 234, 212, 0.3)',
                    }}
                  >
                    {confidenceLabel}_CONFIDENCE
                  </span>
                </div>
                <div
                  className="rounded overflow-hidden"
                  style={{ border: '1px solid rgba(94, 234, 212, 0.3)' }}
                >
                  <img
                    src={`data:image/png;base64,${result.heatmap_overlay}`}
                    alt="GradCAM Heatmap"
                    style={{ width: '100%', display: 'block' }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[
                    { label: 'MODEL', value: (result.model_name || 'N/A').toUpperCase(), color: '#FFFFFF' },
                    { label: 'METHOD', value: (result.method || 'N/A').toUpperCase(), color: '#5EEAD4' },
                    { label: 'CONFIDENCE', value: `${confidencePct}%`, color: '#5EEAD4' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="p-2 rounded"
                      style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(94, 234, 212, 0.1)',
                      }}
                    >
                      <div
                        className="text-[8px] font-mono tracking-wider mb-1"
                        style={{ color: '#5EEAD4', opacity: 0.5 }}
                      >
                        {item.label}
                      </div>
                      <div
                        className="text-[11px] font-bold font-mono truncate"
                        style={{ color: item.color }}
                      >
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature Attributions — real heatmap */}
              <div
                className="p-4 rounded"
                style={{
                  background: 'rgba(94, 234, 212, 0.02)',
                  border: '1px solid rgba(94, 234, 212, 0.15)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap size={12} style={{ color: '#5EEAD4' }} />
                    <span
                      className="text-[10px] font-mono tracking-wider"
                      style={{ color: '#5EEAD4' }}
                    >
                      RAW_HEATMAP
                    </span>
                  </div>
                  <span
                    className="text-[9px] font-mono"
                    style={{ color: '#5EEAD4', opacity: 0.6 }}
                  >
                    ACCESS: {(result.access_level || 'N/A').toUpperCase()}
                  </span>
                </div>
                <div
                  className="rounded overflow-hidden flex items-center justify-center"
                  style={{
                    background: '#050810',
                    border: '1px solid rgba(94, 234, 212, 0.3)',
                    minHeight: 280,
                  }}
                >
                  <img
                    src={`data:image/png;base64,${result.heatmap_raw}`}
                    alt="Raw Heatmap"
                    style={{ width: '100%', display: 'block' }}
                  />
                </div>
                <div
                  className="text-[9px] font-mono mt-3"
                  style={{ color: '#5EEAD4', opacity: 0.5 }}
                >
                  Method: {result.method} · Size: {result.image_size?.join('×')}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div
          className="text-center py-16 rounded"
          style={{
            background: 'rgba(94, 234, 212, 0.02)',
            border: '1px solid rgba(94, 234, 212, 0.15)',
          }}
        >
          <Brain size={40} style={{ color: '#5EEAD4' }} className="mx-auto mb-3" />
          <p className="text-[11px] font-mono" style={{ color: '#5EEAD4', opacity: 0.6 }}>
            Click REGENERATE to run XAI explanation
          </p>
        </div>
      )}
    </div>
  )
}
