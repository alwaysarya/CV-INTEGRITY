import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Brain, Loader2, RefreshCw, Target, Zap, Image as ImageIcon,
  Eye, Sparkles, AlertTriangle, ArrowRight, Layers, Scan, Cpu, Shield,
  Activity, Lock, TrendingUp, BarChart3, CheckCircle, Radio, Waves,
  Network, Gauge, Microscope, Flame
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
  original_image: string
  heatmap_overlay: string
  heatmap_raw: string
  image_size: number[]
  timestamp: string
}

const methodThemes: Record<string, { color: string; label: string; desc: string; icon: any }> = {
  occlusion: { color: '#AF52DE', label: 'Occlusion', desc: 'Region masking', icon: Layers },
  gradcam: { color: '#0071E3', label: 'Grad-CAM', desc: 'Gradient attention', icon: Flame },
  saliency: { color: '#2DD4BF', label: 'Saliency', desc: 'Pixel importance', icon: Eye },
  lime: { color: '#FF9F0A', label: 'LIME', desc: 'Local surrogate', icon: Microscope },
  shap: { color: '#30D158', label: 'SHAP', desc: 'Shapley values', icon: BarChart3 },
}

/* ===== Neural Layers visual (deep network) ===== */
function NeuralLayers() {
  const layers = [
    { count: 4, color: '#5AC8FA', label: 'Input' },
    { count: 6, color: '#00E5FF', label: 'Conv 1' },
    { count: 8, color: '#0071E3', label: 'Conv 2' },
    { count: 8, color: '#5E5CE6', label: 'Conv 3' },
    { count: 6, color: '#AF52DE', label: 'Dense' },
    { count: 3, color: '#FF6B9D', label: 'Output' },
  ]

  return (
    <div className="relative w-full h-[320px] flex items-center justify-around px-4">
      {layers.map((layer, li) => (
        <div key={li} className="relative flex flex-col items-center justify-center gap-2">
          {/* Layer label */}
          <div className="absolute -top-8 text-[9px] font-bold tracking-[0.14em] uppercase text-white/40">
            {layer.label}
          </div>

          {/* Nodes column */}
          <div className="flex flex-col gap-2">
            {Array.from({ length: layer.count }).map((_, ni) => (
              <motion.div
                key={ni}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: li * 0.08 + ni * 0.03 }}
                className="relative w-3 h-3 rounded-full"
                style={{
                  background: layer.color,
                  boxShadow: `0 0 12px ${layer.color}, 0 0 24px ${layer.color}60`,
                }}
              >
                {/* Pulse */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ background: layer.color }}
                  animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: ni * 0.2 }}
                />
              </motion.div>
            ))}
          </div>

          {/* Connecting lines to next layer */}
          {li < layers.length - 1 && (
            <svg
              className="absolute left-full top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ width: 'calc(100% / 5 - 12px)', height: '100%' }}
              viewBox="0 0 60 200"
              preserveAspectRatio="none"
            >
              {Array.from({ length: 4 }).map((_, ci) => (
                <motion.line
                  key={ci}
                  x1="0" y1={40 + ci * 40}
                  x2="60" y2={30 + ci * 45}
                  stroke={layers[li + 1].color}
                  strokeWidth="0.5"
                  opacity="0.3"
                  animate={{ opacity: [0.1, 0.5, 0.1] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: ci * 0.3 }}
                />
              ))}
            </svg>
          )}
        </div>
      ))}
    </div>
  )
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
      .then(d => { if (d.status === 'success') setMethods(d.methods || []) })
      .catch(() => setMethods([
        { id: 'occlusion', label: 'Occlusion' },
        { id: 'gradcam', label: 'Grad-CAM' },
        { id: 'saliency', label: 'Saliency' },
        { id: 'lime', label: 'LIME' },
        { id: 'shap', label: 'SHAP' },
      ]))
  }, [])

  const runExplanation = async () => {
    setLoading(true); setError(null)
    try {
      const res = await axios.post(`${API}/api/xai/explain`, {
        method: selectedMethod,
        model_name: 'good',
      }).catch(() => ({ data: null }))
      if (res.data) setResult(res.data)
      else setError('XAI service unavailable')
    } catch (err: any) { setError(err.message) } finally { setLoading(false) }
  }

  useEffect(() => { runExplanation() }, [selectedMethod])

  const currentTheme = methodThemes[selectedMethod] || methodThemes.occlusion
  const displayMethods = methods.length > 0 ? methods : Object.keys(methodThemes).map(k => ({ id: k, label: methodThemes[k].label }))

  return (
    <div className="min-h-screen bg-black" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>

      {/* ===== HERO — Neural Command Center ===== */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Massive glow mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1500px] h-[1500px] rounded-full blur-[300px]"
            style={{ background: 'radial-gradient(circle, #AF52DE, transparent 50%)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute top-0 right-0 w-[900px] h-[900px] rounded-full blur-[240px]"
            style={{ background: 'radial-gradient(circle, #0071E3, transparent 55%)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.4, 0.25] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
            className="absolute bottom-0 left-[10%] w-[800px] h-[800px] rounded-full blur-[220px]"
            style={{ background: 'radial-gradient(circle, #5AC8FA, transparent 55%)' }}
          />

          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
              maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
            }} />

          {/* Floating particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={`p-${i}`}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${(i * 37) % 100}%`,
                top: `${(i * 53) % 100}%`,
                background: ['#5AC8FA', '#AF52DE', '#0071E3'][i % 3],
                boxShadow: `0 0 8px ${['#5AC8FA', '#AF52DE', '#0071E3'][i % 3]}`,
              }}
              animate={{
                y: [0, -40, 0],
                opacity: [0.2, 0.9, 0.2],
              }}
              transition={{ duration: 4 + (i % 4), repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-[1200px] px-6 py-24 w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl mb-10">
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-[#AF52DE]"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ boxShadow: '0 0 10px #AF52DE' }}
              />
              <span className="text-white/80 text-[11px] font-semibold tracking-[0.16em] uppercase">
                Neural Command Center · Live
              </span>
            </div>

            <h1 className="max-w-[1200px] mx-auto text-[80px] md:text-[136px] font-semibold leading-[0.88] tracking-[-0.05em] text-white">
              Explainable AI,
              <br />
              <motion.span
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-block bg-gradient-to-r from-[#5AC8FA] via-[#AF52DE] via-[#FF6B9D] to-[#5AC8FA] bg-clip-text text-transparent bg-[length:200%_100%]"
              >
                demystified.
              </motion.span>
            </h1>

            <p className="mt-10 max-w-[640px] mx-auto text-[21px] leading-[1.5] tracking-[-0.015em] text-white/50">
              From occlusion to SHAP — visualize what the model sees, at every layer.
            </p>

            <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
              <a href="#methods" className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-[15px] font-semibold tracking-[-0.01em] text-black transition-all hover:scale-[1.03]"
                style={{ boxShadow: '0 0 60px rgba(255,255,255,0.35)' }}>
                Choose a Method
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
              </a>
              <a href="/video" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-8 py-4 text-[15px] font-medium tracking-[-0.01em] text-white/90 backdrop-blur-xl transition-all hover:bg-white/[0.08]">
                Live Vision
              </a>
            </div>
          </motion.div>

          {/* Floating stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[1000px] mx-auto"
          >
            {[
              { label: 'Methods', value: displayMethods.length, color: '#AF52DE', icon: Layers },
              { label: 'Model', value: 'YOLOv8', color: '#5AC8FA', icon: Cpu },
              { label: 'Access', value: 'White-Box', color: '#00E5FF', icon: Shield },
              { label: 'Confidence', value: `${((result?.confidence || 0) * 100).toFixed(0)}%`, color: '#30D158', icon: Target },
            ].map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 + i * 0.1 }}
                  className="relative rounded-2xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] p-5 overflow-hidden group hover:bg-white/[0.08] transition-all"
                >
                  <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl opacity-30 group-hover:opacity-70 transition-opacity"
                    style={{ background: stat.color }} />
                  <div className="relative flex items-center gap-2 mb-3">
                    <Icon size={12} style={{ color: stat.color }} strokeWidth={2.4} />
                    <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-white/40">{stat.label}</span>
                  </div>
                  <div className="relative text-[32px] font-semibold leading-none tracking-[-0.035em] text-white tabular-nums"
                    style={{ textShadow: `0 0 40px ${stat.color}80` }}>
                    {stat.value}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ===== NEURAL LAYERS VISUALIZATION ===== */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="mx-auto max-w-[1200px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5AC8FA]/10 border border-[#5AC8FA]/25 mb-5">
              <Network size={12} className="text-[#5AC8FA]" />
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#5AC8FA]">Neural Architecture</span>
            </div>
            <h2 className="text-[52px] md:text-[72px] font-semibold tracking-[-0.04em] leading-[1.0] text-white">
              Six layers.
              <br />
              <span className="bg-gradient-to-r from-[#5AC8FA] via-[#AF52DE] to-[#FF6B9D] bg-clip-text text-transparent">
                Every neuron visible.
              </span>
            </h2>
            <p className="mt-6 max-w-[560px] mx-auto text-[18px] leading-[1.5] tracking-[-0.015em] text-white/50">
              Watch data flow through the network — from input pixels to final prediction.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-[40px] overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(90,200,250,0.08), rgba(175,82,222,0.06))',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 40px 120px -20px rgba(175,82,222,0.3)',
            }}
          >
            <div className="h-[2px] bg-gradient-to-r from-transparent via-[#AF52DE] to-transparent" />
            <div className="p-12">
              <NeuralLayers />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== METHOD SELECTOR ===== */}
      <section id="methods" className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full blur-[240px] opacity-15"
            style={{ background: 'radial-gradient(circle, #AF52DE, transparent 60%)' }} />
        </div>

        <div className="mx-auto max-w-[1200px] relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#AF52DE]/10 border border-[#AF52DE]/25 mb-5">
              <Brain size={12} className="text-[#AF52DE]" />
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#AF52DE]">XAI Techniques</span>
            </div>
            <h2 className="text-[52px] md:text-[72px] font-semibold tracking-[-0.04em] leading-[1.0] text-white">
              Five methods.
              <br />
              <span className="bg-gradient-to-r from-[#AF52DE] to-[#0071E3] bg-clip-text text-transparent">
                One truth.
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
            {displayMethods.map((m, i) => {
              const theme = methodThemes[m.id] || methodThemes.occlusion
              const Icon = theme.icon
              const isActive = selectedMethod === m.id
              return (
                <motion.button
                  key={m.id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                  onClick={() => setSelectedMethod(m.id)}
                  whileHover={{ y: -8, scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative overflow-hidden rounded-[28px] p-6 transition-all text-left border-2 ${
                    isActive ? 'text-white' : 'bg-white/[0.02] border-white/[0.08] text-white hover:border-white/20'
                  }`}
                  style={isActive ? {
                    background: `linear-gradient(135deg, ${theme.color}, ${theme.color}CC)`,
                    borderColor: theme.color,
                    boxShadow: `0 25px 70px -15px ${theme.color}90, 0 0 80px ${theme.color}40`,
                  } : {}}
                >
                  {/* Glow for inactive */}
                  {!isActive && (
                    <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `${theme.color}40` }} />
                  )}

                  <div className="relative">
                    {/* Icon */}
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                      style={{
                        background: isActive ? 'rgba(255,255,255,0.25)' : `${theme.color}15`,
                        border: isActive ? '1px solid rgba(255,255,255,0.4)' : `1px solid ${theme.color}30`,
                        boxShadow: isActive ? `0 0 30px ${theme.color}80` : 'none',
                      }}>
                      <Icon size={22} style={{ color: isActive ? 'white' : theme.color }} strokeWidth={2.2} />
                    </div>

                    <div className={`text-[17px] font-semibold tracking-[-0.02em] mb-1 ${isActive ? 'text-white' : 'text-white'}`}>
                      {m.label}
                    </div>
                    <div className={`text-[11px] font-medium tracking-[-0.005em] ${isActive ? 'text-white/80' : 'text-white/40'}`}>
                      {theme.desc}
                    </div>

                    {/* Radio indicator */}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-0 right-0 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-xl"
                      >
                        <div className="w-3 h-3 rounded-full" style={{ background: theme.color }} />
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Regenerate */}
          <div className="flex justify-center">
            <motion.button
              onClick={runExplanation}
              disabled={loading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center gap-2 rounded-full px-9 py-4 text-[15px] font-semibold text-white transition-all disabled:opacity-50"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.color}, ${currentTheme.color}CC)`,
                boxShadow: `0 20px 60px -12px ${currentTheme.color}90, 0 0 60px ${currentTheme.color}40`,
              }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              {loading ? 'Generating...' : 'Regenerate Explanation'}
            </motion.button>
          </div>
        </div>
      </section>

      {/* ===== VISUALIZATION ===== */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="mx-auto max-w-[1400px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2DD4BF]/10 border border-[#2DD4BF]/25 mb-5">
              <Scan size={12} className="text-[#2DD4BF]" />
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#2DD4BF]">Live Visualization</span>
            </div>
            <h2 className="text-[52px] md:text-[72px] font-semibold tracking-[-0.04em] leading-[1.0] text-white">
              See inside
              <br />
              <span className="bg-gradient-to-r from-[#2DD4BF] via-[#5AC8FA] to-[#0071E3] bg-clip-text text-transparent">
                the black box.
              </span>
            </h2>
          </motion.div>

          {loading && !result ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-[40px] py-40" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Loader2 size={36} className="animate-spin text-white/50" />
              <div className="text-[15px] text-white/40">Generating explanation...</div>
            </div>
          ) : error ? (
            <div className="rounded-[40px] p-10 text-center" style={{ background: 'rgba(255,69,58,0.05)', border: '1px solid rgba(255,69,58,0.2)' }}>
              <AlertTriangle size={36} className="mx-auto text-[#FF453A]" />
              <div className="mt-3 text-[18px] font-semibold text-white">XAI generation failed</div>
              <div className="mt-1 text-[13px] text-white/50">{error}</div>
            </div>
          ) : result ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-[40px] overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: `0 40px 120px -20px ${currentTheme.color}40, 0 0 120px ${currentTheme.color}20`,
              }}
            >
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] rounded-full blur-[200px] opacity-30"
                  style={{ background: `radial-gradient(circle, ${currentTheme.color}, transparent 60%)` }} />
              </div>

              <div className="relative h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${currentTheme.color}, transparent)` }} />

              {/* Header */}
              <div className="relative flex items-center justify-between px-10 py-7 border-b border-white/[0.06]">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex h-16 w-16 items-center justify-center rounded-3xl"
                    style={{
                      background: `linear-gradient(135deg, ${currentTheme.color}, ${currentTheme.color}CC)`,
                      boxShadow: `0 20px 50px -10px ${currentTheme.color}90, 0 0 60px ${currentTheme.color}40`,
                    }}>
                    <currentTheme.icon size={28} className="text-white" strokeWidth={2.2} />
                  </motion.div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <motion.span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: currentTheme.color, boxShadow: `0 0 10px ${currentTheme.color}` }}
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: currentTheme.color }}>
                        Active · Live
                      </span>
                    </div>
                    <div className="text-[24px] font-semibold text-white tracking-[-0.02em]">{currentTheme.label} Method</div>
                  </div>
                </div>

                {/* View toggle */}
                <div className="flex items-center gap-1 rounded-full bg-white/[0.06] border border-white/10 p-1">
                  {(['overlay', 'raw'] as const).map(v => (
                    <button
                      key={v}
                      onClick={() => setView(v)}
                      className={`rounded-full px-5 py-2 text-[12px] font-semibold capitalize transition-all ${
                        view === v ? 'text-black' : 'text-white/60 hover:text-white'
                      }`}
                      style={view === v ? { background: 'white' } : {}}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 p-10">
                {/* Original */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] border border-white/10">
                        <ImageIcon size={16} className="text-white/60" strokeWidth={2.2} />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold tracking-[0.14em] uppercase text-white/70">Original</div>
                        <div className="text-[10px] text-white/30 font-mono">Input frame</div>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/10">
                      <span className="text-white/60 text-[10px] font-mono">
                        {result.image_size?.[0]}×{result.image_size?.[1] || 640}
                      </span>
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-black">
                    {result.original_image ? (
                      <img src={`data:image/jpeg;base64,${result.original_image}`} alt="Original" className="w-full object-contain" />
                    ) : (
                      <div className="flex aspect-video items-center justify-center">
                        <ImageIcon size={44} className="text-white/20" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Heatmap */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ background: `${currentTheme.color}20`, border: `1px solid ${currentTheme.color}40` }}>
                        <Sparkles size={16} style={{ color: currentTheme.color }} strokeWidth={2.2} />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold tracking-[0.14em] uppercase" style={{ color: currentTheme.color }}>
                          {view === 'overlay' ? 'Heatmap Overlay' : 'Raw Attention'}
                        </div>
                        <div className="text-[10px] text-white/30 font-mono">Model focus</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-xl border border-white/15">
                      <motion.span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: currentTheme.color, boxShadow: `0 0 8px ${currentTheme.color}` }}
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <span className="text-white text-[9px] font-bold tracking-wider uppercase">Live</span>
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-black">
                    {view === 'overlay' && result.heatmap_overlay ? (
                      <img src={`data:image/jpeg;base64,${result.heatmap_overlay}`} alt="Heatmap" className="w-full object-contain" />
                    ) : view === 'raw' && result.heatmap_raw ? (
                      <img src={`data:image/jpeg;base64,${result.heatmap_raw}`} alt="Raw" className="w-full object-contain" />
                    ) : (
                      <div className="flex aspect-video items-center justify-center">
                        <Sparkles size={44} className="text-white/20" />
                      </div>
                    )}

                    {/* Scanline */}
                    <motion.div
                      className="absolute left-0 right-0 h-[3px] pointer-events-none"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${currentTheme.color}, transparent)`,
                        boxShadow: `0 0 30px ${currentTheme.color}`,
                      }}
                      animate={{ top: ['0%', '100%'] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    />

                    {/* Corner HUD */}
                    <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-xl border border-white/15">
                      <span className="text-white/90 text-[10px] font-mono">
                        {((result.confidence || 0) * 100).toFixed(1)}% conf
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Limitations */}
              {result.limitations && result.limitations.length > 0 && (
                <div className="relative mx-10 mb-10 rounded-3xl p-6"
                  style={{ background: 'rgba(255,159,10,0.08)', border: '1px solid rgba(255,159,10,0.25)' }}>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl flex-shrink-0"
                      style={{ background: 'rgba(255,159,10,0.2)' }}>
                      <AlertTriangle size={20} className="text-[#FF9F0A]" strokeWidth={2.2} />
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-bold tracking-[0.16em] uppercase text-[#FF9F0A] mb-3">
                        Known Limitations
                      </div>
                      <ul className="space-y-2">
                        {result.limitations.map((l, i) => (
                          <li key={i} className="flex items-start gap-2 text-[14px] text-white/70">
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#FF9F0A]" />
                            {l}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="rounded-[40px] py-40 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-white/[0.04] mb-6">
                <Brain size={48} className="text-white/30" strokeWidth={1.8} />
              </div>
              <div className="text-[22px] font-semibold text-white mb-2">Ready to explain</div>
              <div className="text-[14px] text-white/40">Select a method above to generate an explanation</div>
            </div>
          )}
        </div>
      </section>

      {/* ===== BOTTOM CTA ===== */}
      <section className="relative py-40 px-6 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full blur-[280px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #AF52DE, transparent 55%)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[240px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #5AC8FA, transparent 55%)' }}
        />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="w-[700px] h-[700px]"
          >
            <svg viewBox="0 0 700 700" className="w-full h-full">
              <circle cx="350" cy="350" r="330" fill="none" stroke="#AF52DE" strokeWidth="1" strokeDasharray="4 8" opacity="0.3" />
            </svg>
          </motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 left-0 w-[700px] h-[700px]"
          >
            <svg viewBox="0 0 700 700" className="w-full h-full">
              <circle cx="350" cy="350" r="260" fill="none" stroke="#5AC8FA" strokeWidth="1" strokeDasharray="2 6" opacity="0.4" />
            </svg>
          </motion.div>
        </div>

        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              left: `${10 + (i * 6) % 80}%`,
              top: `${20 + (i * 13) % 60}%`,
              background: ['#5AC8FA', '#AF52DE', '#0071E3'][i % 3],
              boxShadow: `0 0 15px ${['#5AC8FA', '#AF52DE', '#0071E3'][i % 3]}`,
            }}
            animate={{ y: [0, -40, 0], opacity: [0.2, 0.9, 0.2] }}
            transition={{ duration: 4 + (i % 3), repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1 }}
          className="relative max-w-[900px] mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl mb-10">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-[#AF52DE]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ boxShadow: '0 0 8px #AF52DE' }}
            />
            <span className="text-white/80 text-[11px] font-semibold tracking-[0.16em] uppercase">
              Interpretable by Design
            </span>
          </div>

          <h2 className="text-[72px] md:text-[120px] font-semibold leading-[0.88] tracking-[-0.05em] text-white">
            No black boxes.
            <br />
            <motion.span
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-block bg-gradient-to-r from-[#5AC8FA] via-[#AF52DE] via-[#FF6B9D] to-[#5AC8FA] bg-clip-text text-transparent bg-[length:200%_100%]"
            >
              Only transparency.
            </motion.span>
          </h2>

          <p className="mt-10 text-[21px] leading-[1.5] tracking-[-0.015em] text-white/50 max-w-[520px] mx-auto">
            Every prediction explained. Every decision provable.
          </p>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
            <a href="/video" className="group relative inline-flex items-center gap-2 rounded-full bg-white text-black px-8 py-4 text-[15px] font-semibold tracking-[-0.01em] transition-all hover:scale-[1.03] overflow-hidden"
              style={{ boxShadow: '0 20px 60px -12px rgba(255,255,255,0.4)' }}>
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
              <span className="relative">View Live Vision</span>
              <ArrowRight size={15} className="relative transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
            </a>
            <a href="/drift" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] backdrop-blur-xl text-white px-8 py-4 text-[15px] font-medium tracking-[-0.01em] transition-all hover:bg-white/[0.08]">
              Drift Monitor
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

export default XAI
