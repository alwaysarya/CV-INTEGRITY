import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Loader2, RefreshCw, Bug, Target, Zap, CheckCircle, XCircle, Activity } from 'lucide-react'
import axios from 'axios'
import { notify } from '@/lib/toast'

const API = 'http://localhost:8000'

interface Attack {
  id: string
  name: string
  description: string
  severity: string
  detected: boolean
  detection_method?: string
  result?: string
}

const severityColors: Record<string, string> = {
  CRITICAL: '#F87171',
  HIGH: '#FBBF24',
  MEDIUM: '#38BDF8',
  LOW: '#5EEAD4',
}

export function Attacks() {
  const [attacks, setAttacks] = useState<Attack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<any>({})

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${API}/api/attacks`)
      const data = res.data
      const list = (data.attacks || []).map((a: any) => ({
        id: a.id || 'UNKNOWN',
        name: a.name || 'Unknown Attack',
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
        timestamp: data.timestamp,
      })
    } catch (err: any) {
      setError(err.message || 'Backend error')
    } finally { setLoading(false) }
  }

  const stats = {
    total: summary.total || attacks.length,
    detected: summary.detected || attacks.filter(a => a.detected).length,
    critical: attacks.filter(a => a.severity === 'CRITICAL').length,
    detection_rate: summary.detection_rate || 0,
  }

  return (
    <div className="min-h-screen p-6" style={{ background: '#08080C', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Top header */}
      <div className="flex items-center justify-between mb-6 pb-4"
        style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center"
            style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.4)' }}>
            <Bug size={14} style={{ color: '#F87171' }} />
          </div>
          <div>
            <div className="text-[13px] font-bold tracking-[0.2em]" style={{ color: '#5EEAD4' }}>ATTACK_CATALOG</div>
            <div className="text-[9px] tracking-[0.2em]" style={{ color: '#5EEAD4', opacity: 0.5 }}>THREAT_INTELLIGENCE · MONITORED_VECTORS</div>
          </div>
        </div>

        <button onClick={load}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono tracking-wider"
          style={{ background: 'rgba(94, 234, 212, 0.08)', border: '1px solid rgba(94, 234, 212, 0.3)', color: '#5EEAD4' }}>
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
          REFRESH
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded flex items-center gap-2"
          style={{ background: 'rgba(248, 113, 113, 0.08)', border: '1px solid rgba(248, 113, 113, 0.3)' }}>
          <AlertTriangle size={14} style={{ color: '#F87171' }} />
          <span className="text-[11px] font-mono" style={{ color: '#F87171' }}>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'TOTAL_ATTACKS', value: stats.total, color: '#3A7D8F', icon: Bug },
          { label: 'DETECTED', value: stats.detected, color: '#5EEAD4', icon: CheckCircle },
          { label: 'CRITICAL', value: stats.critical, color: '#F87171', icon: AlertTriangle },
          { label: 'DETECTION_RATE', value: `${stats.detection_rate}%`, color: '#FBBF24', icon: Target },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="p-4 rounded"
              style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono tracking-[0.2em]" style={{ color: '#5EEAD4', opacity: 0.5 }}>{s.label}</span>
                <Icon size={14} style={{ color: s.color, opacity: 0.7 }} />
              </div>
              <div className="text-[24px] font-bold font-mono leading-none" style={{ color: s.color }}>{s.value}</div>
            </div>
          )
        })}
      </div>

      {/* Attack list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full p-12 rounded flex items-center justify-center"
            style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
            <Loader2 className="animate-spin" size={28} style={{ color: '#5EEAD4' }} />
            <span className="ml-3 text-[12px] font-mono" style={{ color: '#5EEAD4', opacity: 0.6 }}>LOADING ATTACKS...</span>
          </div>
        ) : attacks.length === 0 ? (
          <div className="col-span-full p-12 rounded text-center"
            style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
            <Bug size={40} className="mx-auto mb-3" style={{ color: '#5EEAD4', opacity: 0.3 }} />
            <div className="text-[12px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>NO ATTACKS LOADED</div>
          </div>
        ) : attacks.map((a, i) => {
          const color = severityColors[a.severity] || '#38BDF8'
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="p-5 rounded"
              style={{ background: 'rgba(94, 234, 212, 0.02)', border: `1px solid ${color}30` }}>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded flex items-center justify-center"
                    style={{ background: `${color}15`, border: `1px solid ${color}40` }}>
                    <Bug size={16} style={{ color }} />
                  </div>
                  <div>
                    <div className="text-[9px] font-mono tracking-wider" style={{ color: '#5EEAD4', opacity: 0.5 }}>{a.id}</div>
                    <div className="text-[13px] font-bold font-mono" style={{ color: '#FFFFFF' }}>{a.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono tracking-wider px-2 py-0.5 rounded"
                    style={{ background: `${color}15`, color, border: `1px solid ${color}40` }}>
                    {a.severity}
                  </span>
                </div>
              </div>

              <p className="text-[11px] font-mono mb-4 min-h-[32px]" style={{ color: '#5EEAD4', opacity: 0.6 }}>
                {a.description}
              </p>

              {a.detection_method && (
                <div className="p-2.5 rounded mb-3"
                  style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(94, 234, 212, 0.1)' }}>
                  <div className="text-[9px] font-mono tracking-wider mb-1" style={{ color: '#5EEAD4', opacity: 0.4 }}>DETECTION_METHOD</div>
                  <div className="text-[10px] font-mono" style={{ color: '#5EEAD4' }}>{a.detection_method}</div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(94, 234, 212, 0.1)' }}>
                <div className="flex items-center gap-2">
                  {a.detected ? (
                    <><CheckCircle size={12} style={{ color: '#5EEAD4' }} />
                    <span className="text-[10px] font-mono tracking-wider" style={{ color: '#5EEAD4' }}>DETECTED</span></>
                  ) : (
                    <><XCircle size={12} style={{ color: '#F87171' }} />
                    <span className="text-[10px] font-mono tracking-wider" style={{ color: '#F87171' }}>MISSED</span></>
                  )}
                </div>
                <div className="text-[9px] font-mono" style={{ color: '#5EEAD4', opacity: 0.4 }}>
                  {a.result || 'N/A'}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
