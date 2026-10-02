import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, AlertTriangle, Loader2, RefreshCw, Activity, Zap, Clock, Eye, Radio, CheckCircle, XCircle } from 'lucide-react'
import axios from 'axios'

const API = 'http://localhost:8000'

export function Cybersecurity() {
  const [attacks, setAttacks] = useState<any[]>([])
  const [summary, setSummary] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${API}/api/attacks`)
      const data = res.data
      const list = (data.attacks || []).map((a: any) => ({
        id: a.id || 'UNKNOWN',
        name: a.name || 'Unknown',
        description: a.description || '',
        severity: (a.severity || 'MEDIUM').toUpperCase(),
        detected: a.detected ?? false,
        detection_method: a.detection_method || (Array.isArray(a.detection_methods) ? a.detection_methods.join(', ') : ''),
        result: a.result || '',
      }))
      setAttacks(list)
      setSummary({
        total: data.total_attacks || list.length,
        detected: data.detected || 0,
        detection_rate: data.detection_rate || 0,
      })
    } catch (err: any) {
      setError(err.message || 'Backend error')
    } finally { setLoading(false) }
  }

  const sevColor: Record<string, string> = {
    CRITICAL: '#F87171',
    HIGH: '#FBBF24',
    MEDIUM: '#38BDF8',
    LOW: '#5EEAD4',
  }

  // Real metrics — computed from attacks
  const detectionRate = summary.detection_rate || 0
  const criticalCount = attacks.filter(a => a.severity === 'CRITICAL').length
  const highCount = attacks.filter(a => a.severity === 'HIGH').length
  const detectedCount = summary.detected || attacks.filter(a => a.detected).length

  return (
    <div className="min-h-screen p-6" style={{ background: '#08080C', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Top header */}
      <div className="flex items-center justify-between mb-6 pb-4"
        style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center"
            style={{ background: 'rgba(94, 234, 212, 0.1)', border: '1px solid rgba(94, 234, 212, 0.4)' }}>
            <Shield size={14} style={{ color: '#5EEAD4' }} />
          </div>
          <div>
            <div className="text-[13px] font-bold tracking-[0.2em]" style={{ color: '#5EEAD4' }}>CYBERSECURITY_COMMAND_CENTER</div>
            <div className="text-[9px] tracking-[0.2em]" style={{ color: '#5EEAD4', opacity: 0.5 }}>REAL_TIME_THREAT_INTELLIGENCE · PERIMETER_DEFENSE</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded"
            style={{ background: 'rgba(94, 234, 212, 0.08)', border: '1px solid rgba(94, 234, 212, 0.3)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#5EEAD4' }} />
            <span className="text-[10px] font-mono tracking-wider" style={{ color: '#5EEAD4' }}>SHIELD_ARMED</span>
          </div>
          <button onClick={load}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono tracking-wider"
            style={{ background: 'rgba(94, 234, 212, 0.08)', border: '1px solid rgba(94, 234, 212, 0.3)', color: '#5EEAD4' }}>
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            REFRESH
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded flex items-center gap-2"
          style={{ background: 'rgba(248, 113, 113, 0.08)', border: '1px solid rgba(248, 113, 113, 0.3)' }}>
          <AlertTriangle size={14} style={{ color: '#F87171' }} />
          <span className="text-[11px] font-mono" style={{ color: '#F87171' }}>{error}</span>
        </div>
      )}

      {/* 4 top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'OVERALL_BLOCK_RATE', value: `${detectionRate}%`, sub: `${detectedCount} of ${attacks.length} neutralized`, icon: Shield, color: '#5EEAD4' },
          { label: 'DETECTED_ATTACKS', value: detectedCount, sub: 'Multi-layer heuristics', icon: Activity, color: '#38BDF8' },
          { label: 'CRITICAL_THREATS', value: criticalCount, sub: `${highCount} high severity`, icon: AlertTriangle, color: '#F87171' },
          { label: 'MONITORED_VECTORS', value: attacks.length, sub: 'Continuously benchmarked', icon: Eye, color: '#FBBF24' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="p-4 rounded"
              style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono tracking-[0.2em]" style={{ color: '#5EEAD4', opacity: 0.5 }}>{s.label}</span>
                <Icon size={14} style={{ color: s.color, opacity: 0.7 }} />
              </div>
              <div className="text-[24px] font-bold font-mono leading-none mb-1.5" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[9px] font-mono" style={{ color: '#5EEAD4', opacity: 0.4 }}>{s.sub}</div>
            </div>
          )
        })}
      </div>

      {/* Monitored Attack Vectors */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#F87171' }} />
          <h2 className="text-[11px] font-mono tracking-[0.2em]" style={{ color: '#5EEAD4' }}>MONITORED_ATTACK_VECTORS</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full p-12 rounded flex items-center justify-center"
              style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
              <Loader2 className="animate-spin" size={28} style={{ color: '#5EEAD4' }} />
            </div>
          ) : attacks.map((a, i) => {
            const color = sevColor[a.severity] || '#38BDF8'
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded"
                style={{ background: 'rgba(94, 234, 212, 0.02)', border: `1px solid ${color}30` }}>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-mono tracking-wider px-2 py-0.5 rounded"
                    style={{ background: `${color}15`, color, border: `1px solid ${color}40` }}>
                    {a.severity}
                  </span>
                  {a.detected ? (
                    <CheckCircle size={12} style={{ color: '#5EEAD4' }} />
                  ) : (
                    <XCircle size={12} style={{ color: '#F87171' }} />
                  )}
                </div>

                <div className="text-[12px] font-bold font-mono mb-2" style={{ color: '#FFFFFF' }}>{a.name}</div>
                <p className="text-[10px] font-mono mb-3 min-h-[36px]" style={{ color: '#5EEAD4', opacity: 0.6 }}>
                  {a.description}
                </p>

                <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(94, 234, 212, 0.1)' }}>
                  <span className="text-[9px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>{a.id}</span>
                  <span className="text-[9px] font-mono" style={{ color: color }}>
                    {a.detected ? 'DETECTED' : 'MISSED'}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Detection Methods */}
      <div className="p-5 rounded"
        style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
        <h3 className="font-bold text-[11px] font-mono tracking-[0.2em] mb-4" style={{ color: '#5EEAD4' }}>DETECTION_METHODS</h3>
        <div className="space-y-2">
          {attacks.filter(a => a.detection_method).map((a, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded"
              style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(94, 234, 212, 0.1)' }}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Zap size={12} style={{ color: sevColor[a.severity] || '#5EEAD4' }} />
                <span className="text-[11px] font-mono truncate" style={{ color: '#FFFFFF', opacity: 0.8 }}>{a.name}</span>
              </div>
              <span className="text-[10px] font-mono ml-3 truncate max-w-xs" style={{ color: '#5EEAD4', opacity: 0.7 }}>
                {a.detection_method}
              </span>
            </div>
          ))}
          {attacks.length === 0 && (
            <div className="text-[10px] font-mono text-center py-4" style={{ color: '#5EEAD4', opacity: 0.4 }}>
              NO METHODS LOADED
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
