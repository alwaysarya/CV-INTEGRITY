import { useEffect, useState } from 'react'
import {
  Brain, Loader2, RefreshCw, Target, Zap, Image as ImageIcon,
  Eye, Sparkles, AlertTriangle, CheckCircle
} from 'lucide-react'
import axios from 'axios'

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
}

export function XAI() {
  const [result, setResult] = useState<XAIResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState('occlusion')
  const [methods, setMethods] = useState<{ id: string; label: string }[]>([])
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<'overlay' | 'raw'>('overlay')

  useEffect(() => {
    fetch(`${API}/api/xai/methods`)
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success') {
          setMethods(d.methods || [])
        }
      })
      .catch(() => {
        setMethods([
          { id: 'occlusion', label: 'Occlusion Sensitivity' },
          { id: 'gradcam', label: 'Grad-CAM' },
          { id: 'saliency', label: 'Saliency Map' },
        ])
      })
  }, [])

  const runExplanation = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post(`${API}/api/xai/explain`, {
        method: selectedMethod,
        model_name: 'good',
      }).catch(() => ({ data: null }))
      if (res.data && res.data.status === 'success') {
        setResult(res.data)
      } else if (res.data) {
        setResult(res.data)
      } else {
        setError('XAI service unavailable')
      }
    } catch (err: any) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  useEffect(() => { runExplanation() }, [selectedMethod])

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-6">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              CV-INTEGRITY / Explainable AI
            </div>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">
              Explainable AI
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Visual explanations of model decisions through occlusion and gradient-based methods.
            </p>
          </div>
          <button
            onClick={runExplanation}
            disabled={loading}
            className="flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-3 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            {loading ? 'Generating...' : 'Regenerate'}
          </button>
        </div>

        {/* Method selector */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3">
            <div className="text-[14px] font-semibold text-slate-900">Explanation Method</div>
            <div className="mt-0.5 text-[11px] text-slate-500">
              Choose an XAI technique to visualize model attention
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {(methods.length > 0 ? methods : [
              { id: 'occlusion', label: 'Occlusion' },
              { id: 'gradcam', label: 'Grad-CAM' },
              { id: 'saliency', label: 'Saliency' },
            ]).map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMethod(m.id)}
                className={`rounded-lg border px-4 py-2 text-[12px] font-medium transition-all ${
                  selectedMethod === m.id
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        {result && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Confidence', value: `${((result.confidence || 0) * 100).toFixed(1)}%`, color: '#10B981', icon: Target },
              { label: 'Method', value: result.method || selectedMethod, color: '#3B82F6', icon: Brain },
              { label: 'Model', value: result.model_name || 'good', color: '#8B5CF6', icon: Zap },
              { label: 'Access', value: result.access_level || 'black-box', color: '#F59E0B', icon: Eye },
            ].map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-[12px] font-medium text-slate-500">{s.label}</div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${s.color}15` }}>
                      <Icon size={14} style={{ color: s.color }} />
                    </div>
                  </div>
                  <div className="mt-3 text-[20px] font-bold tracking-tight text-slate-900 capitalize">
                    {s.value}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Main visualization */}
        <div className="mt-6">
          {loading && !result ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-20 text-[13px] text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              Generating explanation...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <AlertTriangle size={24} className="mx-auto text-red-500" />
              <div className="mt-2 text-[13px] font-medium text-red-700">XAI generation failed</div>
              <div className="mt-1 text-[11px] text-red-600">{error}</div>
            </div>
          ) : result ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[14px] font-semibold text-slate-900">Explanation Visualization</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    {view === 'overlay' ? 'Heatmap overlaid on original image' : 'Raw attention heatmap'}
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
                  {(['overlay', 'raw'] as const).map(v => (
                    <button
                      key={v}
                      onClick={() => setView(v)}
                      className={`rounded-md px-3 py-1.5 text-[11px] font-medium capitalize transition-all ${
                        view === v
                          ? 'bg-white text-emerald-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* Original */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <ImageIcon size={13} className="text-slate-400" />
                    <span className="text-[11px] font-medium text-slate-600">Original</span>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
                    {result.original_image ? (
                      <img
                        src={`data:image/jpeg;base64,${result.original_image}`}
                        alt="Original"
                        className="w-full object-contain"
                      />
                    ) : (
                      <div className="flex aspect-video items-center justify-center">
                        <ImageIcon size={28} className="text-slate-600" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Heatmap */}
                <div className="lg:col-span-2">
                  <div className="mb-2 flex items-center gap-2">
                    <Sparkles size={13} className="text-emerald-500" />
                    <span className="text-[11px] font-medium text-slate-600">
                      {view === 'overlay' ? 'Heatmap Overlay' : 'Raw Heatmap'}
                    </span>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
                    {view === 'overlay' && result.heatmap_overlay ? (
                      <img
                        src={`data:image/jpeg;base64,${result.heatmap_overlay}`}
                        alt="Heatmap Overlay"
                        className="w-full object-contain"
                      />
                    ) : view === 'raw' && result.heatmap_raw ? (
                      <img
                        src={`data:image/jpeg;base64,${result.heatmap_raw}`}
                        alt="Raw Heatmap"
                        className="w-full object-contain"
                      />
                    ) : (
                      <div className="flex aspect-video items-center justify-center">
                        <Sparkles size={28} className="text-slate-600" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Limitations */}
              {result.limitations && result.limitations.length > 0 && (
                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
                    <div>
                      <div className="text-[12px] font-semibold text-amber-900">
                        Known Limitations
                      </div>
                      <ul className="mt-2 space-y-1">
                        {result.limitations.map((l, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-amber-800">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-600" />
                            {l}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center">
              <Brain size={32} className="mx-auto text-slate-400" />
              <div className="mt-3 text-[14px] font-medium text-slate-700">Ready to generate</div>
              <div className="mt-1 text-[11px] text-slate-500">
                Select a method above to generate an explanation
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default XAI
