import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, RefreshCw, Bug, AlertTriangle, Shield, CheckCircle, Zap, Target, Image as ImageIcon, Radio } from 'lucide-react'
import axios from 'axios'
import { notify } from '@/lib/toast'

const API = 'http://localhost:8000'

const levelColors: Record<string, string> = {
  LOW: '#5EEAD4',
  MEDIUM: '#FBBF24',
  HIGH: '#F87171',
  CRITICAL: '#EF4444',
  UNKNOWN: '#3A7D8F',
}

export function BackdoorDetection() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [accessLevel, setAccessLevel] = useState('black-box')
  const [dataset, setDataset] = useState('clean')

  useEffect(() => { runDetection() }, [])

  const runDetection = async () => {
    setLoading(true)
    try {
      notify.info('Analyzing dataset...', `Dataset: ${dataset}`)
      const res = await axios.post(`${API}/api/backdoor/detect`, {
        dataset, num_samples: 20, access_level: accessLevel,
      })
      setResult(res.data)
      if (res.data.status === 'success') {
        notify.success('Analysis complete', `Risk: ${res.data.overall_risk?.level}`)
      }
    } catch (err: any) {
      notify.error('Failed', err.message)
    } finally { setLoading(false) }
  }

  const getLevelColor = (level: string) => levelColors[level] || levelColors.UNKNOWN

  return (
    <div className="min-h-screen p-6" style={{ background: '#08080C', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Top header */}
      <div className="flex items-center justify-between mb-6 pb-4 flex-wrap gap-3"
        style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center"
            style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.4)' }}>
            <Bug size={14} style={{ color: '#F87171' }} />
          </div>
          <div>
            <div className="text-[13px] font-bold tracking-[0.2em]" style={{ color: '#5EEAD4' }}>BACKDOOR_DETECTION</div>
            <div className="text-[9px] tracking-[0.2em]" style={{ color: '#5EEAD4', opacity: 0.5 }}>TRIGGER_DETECTION · MODEL_INFERENCE</div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <select value={dataset} onChange={(e) => setDataset(e.target.value)}
            className="px-3 py-1.5 rounded text-[10px] font-mono tracking-wider outline-none"
            style={{ background: 'rgba(94, 234, 212, 0.05)', color: '#5EEAD4', border: '1px solid rgba(94, 234, 212, 0.2)' }}>
            <option value="clean" style={{ background: '#0A0F14' }}>CLEAN_DATASET</option>
            <option value="bad" style={{ background: '#0A0F14' }}>BAD_DATASET</option>
          </select>
          <select value={accessLevel} onChange={(e) => setAccessLevel(e.target.value)}
            className="px-3 py-1.5 rounded text-[10px] font-mono tracking-wider outline-none"
            style={{ background: 'rgba(94, 234, 212, 0.05)', color: '#5EEAD4', border: '1px solid rgba(94, 234, 212, 0.2)' }}>
            <option value="black-box" style={{ background: '#0A0F14' }}>BLACK_BOX</option>
            <option value="white-box" style={{ background: '#0A0F14' }}>WHITE_BOX</option>
          </select>
          <button onClick={runDetection} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono tracking-wider disabled:opacity-50"
            style={{ background: 'rgba(94, 234, 212, 0.15)', border: '1px solid rgba(94, 234, 212, 0.5)', color: '#5EEAD4' }}>
            {loading ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
            {loading ? 'RUNNING...' : 'RE_RUN'}
          </button>
        </div>
      </div>

      {loading && !result ? (
        <div className="p-12 rounded flex flex-col items-center justify-center"
          style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
          <Loader2 className="animate-spin mb-4" size={40} style={{ color: '#5EEAD4' }} />
          <span className="text-[12px] font-mono" style={{ color: '#5EEAD4', opacity: 0.6 }}>RUNNING_BACKDOOR_DETECTION...</span>
        </div>
      ) : result ? (
        <>
          {/* Risk Overview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded mb-5"
            style={{
              background: `linear-gradient(135deg, ${getLevelColor(result.overall_risk.level)}10, ${getLevelColor(result.overall_risk.level)}05)`,
              border: `1px solid ${getLevelColor(result.overall_risk.level)}40`,
            }}>
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded flex items-center justify-center"
                  style={{
                    background: `${getLevelColor(result.overall_risk.level)}15`,
                    border: `1px solid ${getLevelColor(result.overall_risk.level)}40`,
                  }}>
                  {result.overall_risk.level === 'LOW' ? (
                    <CheckCircle size={28} style={{ color: getLevelColor(result.overall_risk.level) }} />
                  ) : (
                    <AlertTriangle size={28} style={{ color: getLevelColor(result.overall_risk.level) }} />
                  )}
                </div>
                <div>
                  <div className="text-[10px] font-mono tracking-[0.2em] mb-1"
                    style={{ color: getLevelColor(result.overall_risk.level), opacity: 0.7 }}>OVERALL_RISK</div>
                  <div className="text-[32px] font-bold font-mono leading-none"
                    style={{ color: getLevelColor(result.overall_risk.level) }}>
                    {result.overall_risk.level}
                  </div>
                  <div className="text-[12px] font-mono mt-1.5"
                    style={{ color: getLevelColor(result.overall_risk.level), opacity: 0.7 }}>
                    Score: <span className="font-bold">{result.overall_risk.score}%</span>
                  </div>
                </div>
              </div>
              <div className="text-right max-w-md">
                <div className="text-[10px] font-mono tracking-[0.2em] mb-1"
                  style={{ color: getLevelColor(result.overall_risk.level), opacity: 0.7 }}>RECOMMENDATION</div>
                <div className="text-[13px] font-bold font-mono" style={{ color: '#FFFFFF' }}>
                  {result.recommendation}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            {[
              { label: 'IMAGES_ANALYZED', value: result.num_images_analyzed || result.num_samples, color: '#3A7D8F', icon: Target },
              { label: 'METHODS_RUN', value: result.findings?.length || 0, color: '#A78BFA', icon: Zap },
              { label: 'ACCESS_LEVEL', value: (result.access_level || '').toUpperCase(), color: '#5EEAD4', icon: Shield },
              { label: 'DATASET', value: (result.dataset_used || 'clean').toUpperCase(), color: '#FBBF24', icon: ImageIcon },
            ].map((stat, i) => {
              const Icon = stat.icon
              return (
                <div key={i} className="p-4 rounded"
                  style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono tracking-[0.2em]" style={{ color: '#5EEAD4', opacity: 0.5 }}>{stat.label}</span>
                    <Icon size={14} style={{ color: stat.color, opacity: 0.7 }} />
                  </div>
                  <div className="text-[20px] font-bold font-mono" style={{ color: stat.color }}>{stat.value}</div>
                </div>
              )
            })}
          </div>

          {/* Heatmap */}
          {result.heatmap_visualization && (
            <div className="p-5 rounded mb-5"
              style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
              <div className="mb-4">
                <h3 className="font-bold text-[11px] font-mono tracking-[0.2em] flex items-center gap-2"
                  style={{ color: '#5EEAD4' }}>
                  <ImageIcon size={13} /> FREQUENCY_HEATMAP
                </h3>
                <p className="text-[10px] font-mono mt-0.5" style={{ color: '#5EEAD4', opacity: 0.5 }}>
                  Red = High frequency (potential trigger regions)
                </p>
              </div>
              <div className="rounded overflow-hidden" style={{ background: '#050810', border: '1px solid rgba(94, 234, 212, 0.2)' }}>
                <img src={`data:image/png;base64,${result.heatmap_visualization}`} alt="Heatmap"
                  className="w-full h-64 object-contain" />
              </div>
            </div>
          )}

          {/* Detection Methods */}
          <div className="p-5 rounded mb-5"
            style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
            <h3 className="font-bold text-[11px] font-mono tracking-[0.2em] mb-4" style={{ color: '#5EEAD4' }}>
              DETECTION_METHODS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.findings?.map((finding: any, i: number) => {
                const conf = finding.confidence || 0
                const confColor = conf >= 0.7 ? '#F87171' : conf >= 0.4 ? '#FBBF24' : '#5EEAD4'
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded"
                    style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(94, 234, 212, 0.1)' }}>
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded flex items-center justify-center"
                          style={{ background: `${confColor}15`, border: `1px solid ${confColor}40` }}>
                          <Bug size={13} style={{ color: confColor }} />
                        </div>
                        <div className="text-[11px] font-mono font-bold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>
                          {(finding.method || '').replace(/_/g, ' ')}
                        </div>
                      </div>
                      <span className="text-[9px] font-mono tracking-wider py-0.5 px-2 rounded"
                        style={{ background: 'rgba(94, 234, 212, 0.1)', color: '#5EEAD4', border: '1px solid rgba(94, 234, 212, 0.3)' }}>
                        {(finding.status || 'success').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-mono tracking-wider" style={{ color: '#5EEAD4', opacity: 0.5 }}>CONFIDENCE</span>
                      <span className="text-[12px] font-bold font-mono" style={{ color: confColor }}>
                        {(conf * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(94, 234, 212, 0.1)' }}>
                      <div className="h-full rounded-full" style={{ width: `${conf * 100}%`, background: confColor, boxShadow: `0 0 6px ${confColor}` }} />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Limitations */}
          {result.limitations && result.limitations.length > 0 && (
            <div className="p-5 rounded"
              style={{ background: 'rgba(251, 191, 36, 0.04)', border: '1px solid rgba(251, 191, 36, 0.3)', borderLeft: '3px solid #FBBF24' }}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={13} style={{ color: '#FBBF24' }} />
                <h3 className="font-bold text-[11px] font-mono tracking-[0.2em]" style={{ color: '#FBBF24' }}>LIMITATIONS</h3>
              </div>
              <ul className="space-y-1">
                {result.limitations.map((lim: string, i: number) => (
                  <li key={i} className="text-[11px] font-mono flex items-start gap-2"
                    style={{ color: '#5EEAD4', opacity: 0.7 }}>
                    <span style={{ color: '#FBBF24' }}>•</span>
                    {lim}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
