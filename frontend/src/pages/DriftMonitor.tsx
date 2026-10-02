import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp, AlertTriangle, CheckCircle, Activity, Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import apiClient from '@/lib/api'

const API = 'http://localhost:8000'

const severityColors: Record<string, string> = {
  Stable: '#5EEAD4',
  Warning: '#FBBF24',
  Critical: '#F87171',
}

export function DriftMonitor() {
  const [drifts, setDrifts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [riskLevels, setRiskLevels] = useState<any[]>([])

  useEffect(() => {
    loadDrift()
    fetch(`${API}/api/drift/risk-levels`)
      .then(r => r.json())
      .then(d => { if (d.status === 'success') setRiskLevels(d.risk_levels || []) })
      .catch(console.error)
  }, [])

  const loadDrift = async () => {
    setLoading(true)
    setError(null)
    try {
      const [mRes, dRes] = await Promise.all([apiClient.getModels(), apiClient.getDatasets()])
      const models = mRes.data.models || {}
      const datasets = dRes.data.datasets || {}
      const list: any[] = []

      Object.entries(models).forEach(([key, val]: [string, any]) => {
        const mAP = val.mAP50 || 0
        const baseline = 20
        const change = mAP - baseline
        list.push({
          id: `model_${key}`,
          model: `${key.toUpperCase()} Model`,
          metric: 'mAP50 Performance',
          baseline, current: mAP, change,
          severity: Math.abs(change) < 3 ? 'Stable' : Math.abs(change) < 5 ? 'Warning' : 'Critical',
        })
      })

      Object.entries(datasets).forEach(([key, val]: [string, any]) => {
        const quality = val.overall_score || 0
        const baseline = 95
        const change = quality - baseline
        list.push({
          id: `dataset_${key}`,
          model: `${key.toUpperCase()} Dataset`,
          metric: 'Quality Score',
          baseline, current: quality, change,
          severity: Math.abs(change) < 5 ? 'Stable' : Math.abs(change) < 15 ? 'Warning' : 'Critical',
        })
      })
      setDrifts(list)
    } catch (err: any) {
      setError(err.message || 'Backend error')
    } finally { setLoading(false) }
  }

  const stats = {
    total: drifts.length,
    stable: drifts.filter((d) => d.severity === 'Stable').length,
    warning: drifts.filter((d) => d.severity === 'Warning').length,
    critical: drifts.filter((d) => d.severity === 'Critical').length,
  }


  return (
    <div className="min-h-screen p-6" style={{ background: '#08080C', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 flex-wrap gap-3"
        style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center"
            style={{ background: 'rgba(94, 234, 212, 0.1)', border: '1px solid rgba(94, 234, 212, 0.4)' }}>
            <Activity size={14} style={{ color: '#5EEAD4' }} />
          </div>
          <div>
            <div className="text-[13px] font-bold tracking-[0.2em]" style={{ color: '#5EEAD4' }}>DRIFT_MONITOR</div>
            <div className="text-[9px] tracking-[0.2em]" style={{ color: '#5EEAD4', opacity: 0.5 }}>
              {loading ? 'LOADING...' : `${drifts.length}_METRICS_MONITORED`}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={loadDrift}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono tracking-wider"
            style={{ background: 'rgba(94, 234, 212, 0.08)', border: '1px solid rgba(94, 234, 212, 0.3)', color: '#5EEAD4' }}>
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} /> REFRESH
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded"
            style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.4)' }}>
            <AlertTriangle size={11} style={{ color: '#F87171' }} />
            <span className="text-[10px] font-mono tracking-wider" style={{ color: '#F87171' }}>{stats.critical} CRITICAL</span>
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
          { label: 'TOTAL_MONITORED', value: stats.total, color: '#3A7D8F', icon: Activity },
          { label: 'STABLE', value: stats.stable, color: '#5EEAD4', icon: CheckCircle },
          { label: 'WARNING', value: stats.warning, color: '#FBBF24', icon: AlertTriangle },
          { label: 'CRITICAL', value: stats.critical, color: '#F87171', icon: TrendingDown },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="p-4 rounded"
              style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono tracking-[0.2em]" style={{ color: '#5EEAD4', opacity: 0.5 }}>{stat.label}</span>
                <Icon size={14} style={{ color: stat.color, opacity: 0.7 }} />
              </div>
              <div className="text-[24px] font-bold font-mono leading-none" style={{ color: stat.color }}>{stat.value}</div>
            </div>
          )
        })}
      </div>

      {/* Drifts table */}
      <div className="p-5 rounded mb-5"
        style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin" size={28} style={{ color: '#5EEAD4' }} />
            <span className="ml-3 text-[11px] font-mono" style={{ color: '#5EEAD4', opacity: 0.6 }}>LOADING_DRIFT_METRICS...</span>
          </div>
        ) : drifts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.15)' }}>
                  {['ENTITY', 'METRIC', 'BASELINE', 'CURRENT', 'CHANGE', 'SEVERITY'].map((h, i) => (
                    <th key={i}
                      className={`text-[10px] font-mono tracking-[0.15em] uppercase pb-3 ${i < 2 ? 'text-left' : 'text-right'}`}
                      style={{ color: '#5EEAD4', opacity: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {drifts.map((d) => {
                  const color = severityColors[d.severity]
                  const isPositive = d.change > 0
                  return (
                    <tr key={d.id} style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.06)' }}>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded flex items-center justify-center"
                            style={{ background: `${color}15`, border: `1px solid ${color}40` }}>
                            {d.severity === 'Stable' ? (
                              <CheckCircle size={14} style={{ color }} />
                            ) : (
                              <AlertTriangle size={14} style={{ color }} />
                            )}
                          </div>
                          <div className="text-[11px] font-bold font-mono" style={{ color: '#FFFFFF' }}>{d.model}</div>
                        </div>
                      </td>
                      <td className="py-3"><div className="text-[10px] font-mono" style={{ color: '#5EEAD4', opacity: 0.7 }}>{d.metric}</div></td>
                      <td className="py-3 text-right"><div className="text-[11px] font-mono" style={{ color: '#5EEAD4', opacity: 0.6 }}>{d.baseline.toFixed(2)}</div></td>
                      <td className="py-3 text-right"><div className="text-[11px] font-bold font-mono" style={{ color: '#FFFFFF' }}>{d.current.toFixed(2)}</div></td>
                      <td className="py-3 text-right">
                        <div className="text-[11px] font-bold flex items-center justify-end gap-1 font-mono"
                          style={{ color: isPositive ? '#5EEAD4' : '#F87171' }}>
                          {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {isPositive ? '+' : ''}{d.change.toFixed(2)}
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-[9px] font-mono tracking-wider py-0.5 px-2 rounded"
                          style={{ background: `${color}15`, color, border: `1px solid ${color}40` }}>
                          {d.severity.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertTriangle size={40} className="mx-auto mb-3" style={{ color: '#5EEAD4', opacity: 0.3 }} />
            <div className="text-[11px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>NO_DRIFT_METRICS</div>
          </div>
        )}
      </div>

      {/* Model & Data Drift Detection */}
      <div className="pt-5" style={{ borderTop: '1px solid rgba(94, 234, 212, 0.15)' }}>
        <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
          <div>
            <h2 className="text-[14px] font-bold font-mono tracking-[0.15em] mb-1" style={{ color: '#5EEAD4' }}>
              MODEL_&_DATA_DRIFT_DETECTION
            </h2>
            <p className="text-[11px] font-mono" style={{ color: '#5EEAD4', opacity: 0.6 }}>
              Baseline vs current streaming telemetry across 5 calibrated risk tiers
            </p>
          </div>
        </div>

        {/* Risk Rating */}
        <div className="p-5 rounded mb-5"
          style={{ background: 'rgba(248, 113, 113, 0.04)', border: '1px solid rgba(248, 113, 113, 0.3)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="text-[9px] font-mono tracking-wider py-1 px-2.5 rounded inline-flex items-center gap-1.5"
                  style={{ background: 'rgba(248, 113, 113, 0.15)', color: '#F87171', border: '1px solid rgba(248, 113, 113, 0.4)' }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#F87171' }} />
                  CRITICAL
                </span>
                <span className="text-[10px] font-mono" style={{ color: '#5EEAD4', opacity: 0.6 }}>STREAM: BAD_DATASET</span>
              </div>
              <h3 className="text-[24px] font-bold font-mono tracking-wider mb-2" style={{ color: '#FFFFFF' }}>
                RISK: <span style={{ color: '#F87171' }}>CRITICAL</span>
              </h3>
              <p className="text-[10px] font-mono" style={{ color: '#F87171' }}>
                HARD_QUARANTINE: Immediate smart contract lockdown. Model halted.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'PSI_SCORE', value: '0.3764', color: '#FFFFFF' },
                { label: 'KS_STATISTIC', value: '0.647', color: '#FFFFFF' },
                { label: 'MAP_DELTA', value: '-0.254', color: '#F87171' },
                { label: 'WASSERSTEIN', value: '0.309', color: '#FFFFFF' },
              ].map((s, i) => (
                <div key={i} className="p-3 rounded"
                  style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(94, 234, 212, 0.1)' }}>
                  <div className="text-[9px] font-mono tracking-wider mb-1" style={{ color: '#5EEAD4', opacity: 0.5 }}>{s.label}</div>
                  <div className="text-[16px] font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5 Risk Levels */}
        <div className="p-5 rounded"
          style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="font-bold text-[11px] font-mono tracking-[0.2em]" style={{ color: '#5EEAD4' }}>
              5_STANDARDIZED_RISK_LEVELS
            </h3>
            <span className="text-[9px] font-mono tracking-wider" style={{ color: '#5EEAD4', opacity: 0.5 }}>
              POPULATION_STABILITY_INDEX
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.15)' }}>
                  {['RISK_LEVEL', 'PSI_RANGE', 'KS_RANGE', 'MAP_DROP', 'POLICY'].map((h, i) => (
                    <th key={i} className="text-left text-[10px] font-mono tracking-[0.15em] uppercase pb-3"
                      style={{ color: '#5EEAD4', opacity: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {riskLevels.map((level, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.06)' }}>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: level.color, boxShadow: `0 0 6px ${level.color}` }} />
                        <span className="text-[11px] font-mono font-bold tracking-wider" style={{ color: level.color }}>{level.level}</span>
                      </div>
                    </td>
                    <td className="py-3"><div className="text-[10px] font-mono" style={{ color: '#5EEAD4', opacity: 0.7 }}>{level.psi}</div></td>
                    <td className="py-3"><div className="text-[10px] font-mono" style={{ color: '#5EEAD4', opacity: 0.7 }}>{level.ks}</div></td>
                    <td className="py-3"><div className="text-[10px] font-mono" style={{ color: level.color }}>{level.mapDrop}</div></td>
                    <td className="py-3"><div className="text-[10px] font-mono" style={{ color: '#FFFFFF', opacity: 0.7 }}>{level.policy}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
