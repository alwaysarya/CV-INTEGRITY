import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Shield, Loader2, RefreshCw, Bug, Target, Zap, CheckCircle, XCircle, Activity } from 'lucide-react'
import axios from 'axios'
import { notify } from '@/lib/toast'

const API = 'http://localhost:8000'

interface Attack {
  id: string
  name: string
  description: string
  severity: string
  category: string
}

interface AttackResult {
  status: string
  attack_id: string
  attack_name: string
  detected: boolean
  detection_confidence: number
  risk_score: number
  risk_level: string
  detection_methods: Array<{ method: string; confidence: number }>
  recommendation: string
  evidence_hash: string
  timestamp: string
}

const severityColors: Record<string, any> = {
  Critical: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.4)' },
  High: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' },
  Medium: { bg: 'rgba(56, 189, 248, 0.15)', text: '#38BDF8', border: 'rgba(56, 189, 248, 0.4)' },
  Low: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.4)' },
}

export function Attacks() {
  const [attacks, setAttacks] = useState<Attack[]>([])
  const [loading, setLoading] = useState(true)
  const [runningId, setRunningId] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, AttackResult>>({})

  useEffect(() => {
    loadAttacks()
  }, [])

  const loadAttacks = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/attacks/list`)
      setAttacks(res.data.attacks || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const runAttack = async (attackId: string) => {
    setRunningId(attackId)
    try {
      notify.info(`Running ${attackId}...`, 'Executing real attack simulation')
      const res = await axios.post(`${API}/api/attacks/run`, {
        attack_id: attackId,
        access_level: 'black-box',
      })
      setResults((prev) => ({ ...prev, [attackId]: res.data }))
      
      if (res.data.detected) {
        notify.success('Attack Detected & Blocked!', `Confidence: ${res.data.detection_confidence}%`)
      } else {
        notify.error('Attack Succeeded!', 'Detection missed the attack')
      }
    } catch (err: any) {
      notify.error('Attack failed', err.message)
    } finally {
      setRunningId(null)
    }
  }

  const stats = {
    total: attacks.length,
    run: Object.keys(results).length,
    detected: Object.values(results).filter((r) => r.detected).length,
    critical: attacks.filter((a) => a.severity === 'Critical').length,
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
          <h1 className="text-3xl font-bold gradient-text mb-1">Attack Simulator</h1>
          <p className="text-gray-400 text-sm">
            Real attack execution with live detection ({stats.run}/{stats.total} run)
          </p>
        </div>
        <Badge className="bg-red-500/20 text-red-400 border-red-500/40 gap-1.5 py-2 px-3">
          <Bug size={12} /> Sandbox Mode
        </Badge>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Attacks', value: stats.total, color: '#38BDF8', icon: Bug },
          { label: 'Executed', value: stats.run, color: '#F59E0B', icon: Activity },
          { label: 'Detected', value: stats.detected, color: '#10B981', icon: Target },
          { label: 'Critical', value: stats.critical, color: '#EF4444', icon: AlertTriangle },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }}>
              <Card className="liquid-glass specular border-0 p-5 hover-lift">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${stat.color}20`, border: `1px solid ${stat.color}40` }}>
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <div className="text-white text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-gray-400 text-xs">{stat.label}</div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {loading ? (
        <Card className="liquid-glass border-0 p-12">
          <div className="flex items-center justify-center">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attacks.map((attack, i) => {
            const colors = severityColors[attack.severity] || severityColors.Medium
            const running = runningId === attack.id
            const result = results[attack.id]
            
            return (
              <motion.div
                key={attack.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Card className="liquid-glass specular border-0 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}>
                      <Bug size={18} style={{ color: colors.text }} />
                    </div>
                    <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                      {attack.severity}
                    </Badge>
                  </div>

                  <h3 className="text-white font-bold text-sm mb-1">{attack.name}</h3>
                  <p className="text-gray-400 text-xs mb-3 min-h-[40px]">{attack.description}</p>

                  {result ? (
                    <div
                      className="p-3 rounded-lg mb-3 border"
                      style={{
                        backgroundColor: result.detected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        borderColor: result.detected ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {result.detected ? (
                          <CheckCircle size={14} className="text-green-400" />
                        ) : (
                          <XCircle size={14} className="text-red-400" />
                        )}
                        <span className="text-xs font-bold" style={{ color: result.detected ? '#10B981' : '#EF4444' }}>
                          {result.detected ? 'DETECTED & BLOCKED' : 'ATTACK SUCCEEDED'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <div className="text-gray-500 uppercase">Confidence</div>
                          <div className="text-white font-bold">{result.detection_confidence}%</div>
                        </div>
                        <div>
                          <div className="text-gray-500 uppercase">Risk</div>
                          <div className="text-white font-bold">{result.risk_score}%</div>
                        </div>
                      </div>
                      <div className="mt-2 text-[9px] text-gray-500 font-mono">
                        Hash: {result.evidence_hash}...
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-black/20 border border-cyan-500/10 mb-3 min-h-[80px] flex items-center justify-center">
                      <div className="text-gray-500 text-xs">Click "Run Attack" to test</div>
                    </div>
                  )}

                  <button
                    onClick={() => runAttack(attack.id)}
                    disabled={running}
                    className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
                      running
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 cursor-wait'
                        : result
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20'
                        : 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:shadow-lg hover:shadow-red-500/30'
                    }`}
                  >
                    {running ? (
                      <><Loader2 size={12} className="animate-spin" /> Running...</>
                    ) : result ? (
                      <><RefreshCw size={12} /> Run Again</>
                    ) : (
                      <><Zap size={12} /> Run Attack</>
                    )}
                  </button>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
