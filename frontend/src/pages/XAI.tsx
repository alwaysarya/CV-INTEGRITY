import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  heatmap_raw: string
  image_size: number[]
}

const methods = [
  { id: 'occlusion', label: 'Occlusion', desc: 'Black-box compatible' },
  { id: 'saliency', label: 'Saliency', desc: 'Gradient-based' },
  { id: 'lime', label: 'LIME', desc: 'Local approximation' },
  { id: 'shap', label: 'SHAP', desc: 'Shapley values' },
]

export function XAI() {
  const [result, setResult] = useState<XAIResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState('occlusion')

  useEffect(() => {
    runExplanation()
  }, [selectedMethod])

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

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-1">Explainable AI</h1>
          <p className="text-gray-400 text-sm">
            Visual explanations with colored heatmap overlays
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={runExplanation}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-sm font-medium disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Regenerate
          </button>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/40 gap-1.5 py-2 px-3">
            <Brain size={12} /> XAI Active
          </Badge>
        </div>
      </motion.div>

      {/* Method Selector */}
      <Card className="liquid-glass border-0 p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-gray-400 text-xs uppercase tracking-wider">Method:</span>
          {methods.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMethod(m.id)}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedMethod === m.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'text-gray-500 hover:text-gray-300 border border-cyan-500/10 hover:border-cyan-500/30'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </Card>

      {loading ? (
        <Card className="liquid-glass border-0 p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-cyan-400 mb-4" size={48} />
            <div className="text-gray-400">Running {selectedMethod}...</div>
            <div className="text-gray-500 text-xs mt-2">Analyzing image and generating heatmap</div>
          </div>
        </Card>
      ) : result ? (
        <>
          {/* Image + Heatmap Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Original Image */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <Card className="liquid-glass specular border-0 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={14} className="text-cyan-400" />
                    <h3 className="text-white font-bold text-sm">ORIGINAL IMAGE</h3>
                  </div>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/40 text-[10px]">
                    Input
                  </Badge>
                </div>
                <div className="rounded-xl overflow-hidden border border-cyan-500/20">
                  <img
                    src={`data:image/png;base64,${result.original_image}`}
                    alt="Original"
                    className="w-full h-64 object-cover"
                  />
                </div>
                <div className="mt-3 text-gray-500 text-[10px] font-mono truncate">
                  {result.image_source?.split('/').slice(-2).join('/') || 'synthetic'}
                </div>
              </Card>
            </motion.div>

            {/* Heatmap Overlay */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <Card className="liquid-glass specular border-0 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Target size={14} className="text-red-400" />
                    <h3 className="text-white font-bold text-sm">HEATMAP OVERLAY</h3>
                  </div>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/40 text-[10px]">
                    {result.method}
                  </Badge>
                </div>
                <div className="rounded-xl overflow-hidden border border-red-500/20">
                  <img
                    src={`data:image/png;base64,${result.heatmap_overlay}`}
                    alt="Heatmap Overlay"
                    className="w-full h-64 object-cover"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px]">
                  <span className="text-gray-500">Red = High attention</span>
                  <span className="text-cyan-400 font-bold">
                    Confidence: {(result.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Details Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="liquid-glass border-0 p-5">
              <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Method Used</div>
              <div className="text-white text-lg font-bold capitalize">{result.method}</div>
              <div className="text-gray-500 text-xs mt-1">{result.access_level}</div>
            </Card>
            <Card className="liquid-glass border-0 p-5">
              <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Model</div>
              <div className="text-white text-lg font-bold">{result.model_name}</div>
              <div className="text-gray-500 text-xs mt-1">Image: {result.image_size?.join('×')}</div>
            </Card>
            <Card className="liquid-glass border-0 p-5">
              <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Confidence</div>
              <div className="text-3xl font-bold" style={{
                color: result.confidence > 0.7 ? '#10B981' : result.confidence > 0.4 ? '#F59E0B' : '#EF4444'
              }}>
                {(result.confidence * 100).toFixed(1)}%
              </div>
            </Card>
          </div>

          {/* Limitations */}
          {result.limitations && result.limitations.length > 0 && (
            <Card className="liquid-glass border-0 p-5" style={{ borderLeft: '3px solid rgba(245, 158, 11, 0.6)' }}>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={14} className="text-yellow-400" />
                <h3 className="text-white font-bold text-sm">LIMITATIONS</h3>
              </div>
              <ul className="space-y-1">
                {result.limitations.map((lim, i) => (
                  <li key={i} className="text-gray-300 text-xs flex items-start gap-2">
                    <span className="text-yellow-400">•</span>
                    {lim}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      ) : null}
    </div>
  )
}
