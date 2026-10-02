import { useEffect, useState } from 'react'
import { Zap, Activity, Clock, Cpu, Loader2, RefreshCw, AlertCircle, Target } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import apiClient from '@/lib/api'

interface ModelPerf {
  name: string
  precision: number
  recall: number
  mAP50: number
  mAP50_95: number
}

const tooltipStyle = {
  backgroundColor: '#0A0F14',
  border: '1px solid rgba(94, 234, 212, 0.3)',
  borderRadius: '4px',
  fontSize: '11px',
  color: '#FFFFFF',
  fontFamily: 'monospace',
}

export function Performance() {
  const [models, setModels] = useState<ModelPerf[]>([])
  const [blocks, setBlocks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { loadPerformance() }, [])

  const loadPerformance = async () => {
    setLoading(true)
    setError(null)
    try {
      const [mRes, bRes] = await Promise.all([
        apiClient.getModels(),
        fetch('http://localhost:8000/api/blockchain/live').then(r => r.json()).then(d => ({ data: d })).catch(() => ({ data: { blocks: [] } })),
      ])
      const modelsData = mRes.data.models || {}
      const list: ModelPerf[] = Object.entries(modelsData).map(([key, val]: [string, any]) => ({
        name: key.toUpperCase(),
        precision: val.precision || 0,
        recall: val.recall || 0,
        mAP50: val.mAP50 || 0,
        mAP50_95: val.mAP50_95 || 0,
      }))
      setModels(list)
      setBlocks(bRes.data.blocks || [])
    } catch (err: any) {
      setError(err.message || 'Backend error')
    } finally { setLoading(false) }
  }

  const avgPrecision = models.length ? (models.reduce((s, m) => s + m.precision, 0) / models.length).toFixed(2) : '0'
  const avgRecall = models.length ? (models.reduce((s, m) => s + m.recall, 0) / models.length).toFixed(2) : '0'
  const avgMAP = models.length ? (models.reduce((s, m) => s + m.mAP50, 0) / models.length).toFixed(2) : '0'
  const bestMAP = models.length ? Math.max(...models.map((m) => m.mAP50)).toFixed(2) : '0'

  const chartData = models.map((m) => ({ name: m.name, precision: m.precision, recall: m.recall, mAP50: m.mAP50 }))

  const actionCounts: Record<string, number> = {}
  blocks.forEach((b: any) => {
    const action = b.data?.action || 'UNKNOWN'
    actionCounts[action] = (actionCounts[action] || 0) + 1
  })
  const blockChartData = Object.entries(actionCounts).map(([name, count]) => ({ name: name.replace(/_/g, ' '), count }))

  // Real radar data from backend models
  const getModel = (name: string) => models.find(m => m.name === name.toUpperCase())
  const computeF1 = (p: number, r: number) => p + r > 0 ? (2 * p * r) / (p + r) : 0
  const normalize = (v: number, max: number) => Math.min(100, (v / max) * 100)

  const radarData = (() => {
    const g = getModel('good') || { precision: 0, recall: 0, mAP50: 0, mAP50_95: 0 }
    const b = getModel('bad') || { precision: 0, recall: 0, mAP50: 0, mAP50_95: 0 }
    const w = getModel('worst') || { precision: 0, recall: 0, mAP50: 0, mAP50_95: 0 }
    // Use mAP50 max as baseline (typically 100) — normalize relative
    const maxVal = 60
    return [
      { capability: 'mAP50', Good: normalize(g.mAP50, maxVal), Bad: normalize(b.mAP50, maxVal), Worst: normalize(w.mAP50, maxVal) },
      { capability: 'Precision', Good: normalize(g.precision, maxVal), Bad: normalize(b.precision, maxVal), Worst: normalize(w.precision, maxVal) },
      { capability: 'Recall', Good: normalize(g.recall, maxVal), Bad: normalize(b.recall, maxVal), Worst: normalize(w.recall, maxVal) },
      { capability: 'F1', Good: normalize(computeF1(g.precision, g.recall), maxVal), Bad: normalize(computeF1(b.precision, b.recall), maxVal), Worst: normalize(computeF1(w.precision, w.recall), maxVal) },
      { capability: 'mAP50-95', Good: normalize(g.mAP50_95, maxVal), Bad: normalize(b.mAP50_95, maxVal), Worst: normalize(w.mAP50_95, maxVal) },
      { capability: 'Composite', Good: normalize((g.mAP50 + g.precision + g.recall + computeF1(g.precision, g.recall) + g.mAP50_95) / 5, maxVal), Bad: normalize((b.mAP50 + b.precision + b.recall + computeF1(b.precision, b.recall) + b.mAP50_95) / 5, maxVal), Worst: normalize((w.mAP50 + w.precision + w.recall + computeF1(w.precision, w.recall) + w.mAP50_95) / 5, maxVal) },
    ]
  })()

  return (
    <div className="min-h-screen p-6" style={{ background: '#08080C', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 flex-wrap gap-3"
        style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center"
            style={{ background: 'rgba(94, 234, 212, 0.1)', border: '1px solid rgba(94, 234, 212, 0.4)' }}>
            <Zap size={14} style={{ color: '#5EEAD4' }} />
          </div>
          <div>
            <div className="text-[13px] font-bold tracking-[0.2em]" style={{ color: '#5EEAD4' }}>PERFORMANCE</div>
            <div className="text-[9px] tracking-[0.2em]" style={{ color: '#5EEAD4', opacity: 0.5 }}>
              {loading ? 'LOADING...' : `${models.length}_MODELS · ${blocks.length}_BLOCKS`}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={loadPerformance}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono tracking-wider"
            style={{ background: 'rgba(94, 234, 212, 0.08)', border: '1px solid rgba(94, 234, 212, 0.3)', color: '#5EEAD4' }}>
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} /> REFRESH
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded"
            style={{ background: 'rgba(94, 234, 212, 0.1)', border: '1px solid rgba(94, 234, 212, 0.4)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#5EEAD4' }} />
            <span className="text-[10px] font-mono tracking-wider" style={{ color: '#5EEAD4' }}>ALL_SYSTEMS_NOMINAL</span>
          </div>
        </div>
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
          { label: 'AVG_PRECISION', value: `${avgPrecision}%`, color: '#38BDF8', icon: Clock },
          { label: 'AVG_RECALL', value: `${avgRecall}%`, color: '#FBBF24', icon: Activity },
          { label: 'AVG_MAP50', value: `${avgMAP}%`, color: '#5EEAD4', icon: Zap },
          { label: 'BEST_MAP50', value: `${bestMAP}%`, color: '#A78BFA', icon: Target },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="p-4 rounded"
              style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono tracking-[0.2em]" style={{ color: '#5EEAD4', opacity: 0.5 }}>{stat.label}</span>
                <Icon size={14} style={{ color: stat.color, opacity: 0.7 }} />
              </div>
              <div className="text-[22px] font-bold font-mono leading-none" style={{ color: stat.color }}>{stat.value}</div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <div className="p-5 rounded"
          style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
          <div className="mb-4">
            <h3 className="font-bold text-[11px] font-mono tracking-[0.2em]" style={{ color: '#5EEAD4' }}>MODEL_METRICS</h3>
            <p className="text-[10px] font-mono mt-0.5" style={{ color: '#5EEAD4', opacity: 0.4 }}>Precision, recall, mAP50 by model</p>
          </div>
          <div className="w-full h-64">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin" size={28} style={{ color: '#5EEAD4' }} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(94, 234, 212, 0.08)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#5EEAD4', opacity: 0.6 }} tickLine={false} axisLine={{ stroke: 'rgba(94, 234, 212, 0.2)' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#5EEAD4', opacity: 0.6 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '10px', color: '#5EEAD4', fontFamily: 'monospace' }} />
                  <Bar dataKey="precision" fill="#38BDF8" radius={[4, 4, 0, 0]} name="PRECISION" />
                  <Bar dataKey="recall" fill="#A78BFA" radius={[4, 4, 0, 0]} name="RECALL" />
                  <Bar dataKey="mAP50" fill="#5EEAD4" radius={[4, 4, 0, 0]} name="MAP50" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="p-5 rounded"
          style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
          <div className="mb-4">
            <h3 className="font-bold text-[11px] font-mono tracking-[0.2em]" style={{ color: '#5EEAD4' }}>BLOCKCHAIN_ACTIVITY</h3>
            <p className="text-[10px] font-mono mt-0.5" style={{ color: '#5EEAD4', opacity: 0.4 }}>Blocks by action type</p>
          </div>
          <div className="w-full h-64">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin" size={28} style={{ color: '#5EEAD4' }} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={blockChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(94, 234, 212, 0.08)" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#5EEAD4', opacity: 0.6 }} tickLine={false} axisLine={{ stroke: 'rgba(94, 234, 212, 0.2)' }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: '#5EEAD4', opacity: 0.6 }} tickLine={false} axisLine={false} width={140} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#A78BFA" radius={[0, 4, 4, 0]} name="BLOCKS" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 rounded mb-5"
        style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
        <h3 className="font-bold text-[11px] font-mono tracking-[0.2em] mb-4" style={{ color: '#5EEAD4' }}>
          MODEL_PERFORMANCE_DETAILS
        </h3>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin" size={28} style={{ color: '#5EEAD4' }} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.15)' }}>
                  {['MODEL', 'PRECISION', 'RECALL', 'MAP50', 'MAP50-95', 'STATUS'].map((h, i) => (
                    <th key={i}
                      className={`text-[10px] font-mono tracking-[0.15em] uppercase pb-3 ${i === 0 ? 'text-left' : 'text-right'}`}
                      style={{ color: '#5EEAD4', opacity: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {models.map((m, idx) => {
                  const color = m.mAP50 >= 18 ? '#5EEAD4' : m.mAP50 >= 16 ? '#FBBF24' : '#F87171'
                  const status = m.mAP50 >= 18 ? 'DEPLOYED' : m.mAP50 >= 16 ? 'TESTING' : 'TRAINING'
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.06)' }}>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded flex items-center justify-center"
                            style={{ background: `${color}15`, border: `1px solid ${color}40` }}>
                            <Cpu size={14} style={{ color }} />
                          </div>
                          <div className="text-[11px] font-bold font-mono" style={{ color: '#FFFFFF' }}>{m.name}</div>
                        </div>
                      </td>
                      <td className="py-3 text-right"><span className="text-[11px] font-mono" style={{ color: '#FFFFFF', opacity: 0.85 }}>{m.precision.toFixed(2)}</span></td>
                      <td className="py-3 text-right"><span className="text-[11px] font-mono" style={{ color: '#FFFFFF', opacity: 0.85 }}>{m.recall.toFixed(2)}</span></td>
                      <td className="py-3 text-right"><span className="text-[11px] font-mono font-bold" style={{ color }}>{m.mAP50.toFixed(2)}%</span></td>
                      <td className="py-3 text-right"><span className="text-[11px] font-mono" style={{ color: '#5EEAD4', opacity: 0.6 }}>{m.mAP50_95.toFixed(2)}%</span></td>
                      <td className="py-3 text-right">
                        <span className="text-[9px] font-mono tracking-wider py-0.5 px-2 rounded"
                          style={{ background: `${color}15`, color, border: `1px solid ${color}40` }}>
                          ● {status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Benchmarks - Radar */}
      <div className="pt-5" style={{ borderTop: '1px solid rgba(94, 234, 212, 0.15)' }}>
        <div className="mb-5">
          <h2 className="text-[14px] font-bold font-mono tracking-[0.15em] mb-1" style={{ color: '#5EEAD4' }}>
            PERFORMANCE_BENCHMARKS
          </h2>
          <p className="text-[11px] font-mono" style={{ color: '#5EEAD4', opacity: 0.6 }}>
            Comparative evaluation across all 3 model checkpoints
          </p>
        </div>

        <div className="p-5 rounded"
          style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
          <div className="mb-4">
            <h3 className="font-bold text-[11px] font-mono tracking-[0.2em]" style={{ color: '#5EEAD4' }}>
              CAPABILITY_RADAR_COMPARISON
            </h3>
          </div>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(94, 234, 212, 0.15)" />
                <PolarAngleAxis dataKey="capability" tick={{ fill: '#5EEAD4', fontSize: 10, fontFamily: 'monospace' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#5EEAD4', fontSize: 9, opacity: 0.6 }} />
                <Radar name="GOOD" dataKey="Good" stroke="#5EEAD4" fill="#5EEAD4" fillOpacity={0.2} strokeWidth={2} />
                <Radar name="BAD" dataKey="Bad" stroke="#FBBF24" fill="#FBBF24" fillOpacity={0.1} strokeWidth={2} />
                <Radar name="WORST" dataKey="Worst" stroke="#F87171" fill="#F87171" fillOpacity={0.1} strokeWidth={2} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '10px', color: '#5EEAD4', fontFamily: 'monospace', paddingTop: '10px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
