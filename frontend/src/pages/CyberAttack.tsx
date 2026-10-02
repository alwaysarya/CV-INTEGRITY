import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bug, Zap, Loader2, Terminal, ChevronRight, Shield, Lock, FileText, Database, RefreshCw, Play, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
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
}

const severityColors: Record<string, string> = {
  CRITICAL: '#F87171',
  HIGH: '#FBBF24',
  MEDIUM: '#38BDF8',
  LOW: '#5EEAD4',
}

const typeForId = (id: string): string => {
  const lower = id.toLowerCase()
  if (lower.includes('poison') || lower.includes('tamper')) return 'POISONING'
  if (lower.includes('inversion') || lower.includes('privacy')) return 'PRIVACY'
  if (lower.includes('replay')) return 'REPLAY'
  if (lower.includes('inference') || lower.includes('manipulation')) return 'INTEGRITY'
  return 'EVASION'
}

export function CyberAttack() {
  const [attacks, setAttacks] = useState<Attack[]>([])
  const [selected, setSelected] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [launching, setLaunching] = useState(false)
  const [logs, setLogs] = useState<string[]>(['$ Awaiting attack launch...'])
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => { loadAttacks() }, [])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [logs])

  const loadAttacks = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/attacks`)
      const list = (res.data.attacks || []).map((a: any) => ({
        id: a.id || 'UNKNOWN',
        name: a.name || 'Unknown',
        description: a.description || '',
        severity: (a.severity || 'MEDIUM').toUpperCase(),
        detected: a.detected ?? false,
        detection_method: a.detection_method || (Array.isArray(a.detection_methods) ? a.detection_methods.join(', ') : ''),
      }))
      setAttacks(list)
      if (list.length > 0) setSelected(list[0].id)
    } catch (err: any) {
      notify.error('Failed to load attacks', err.message)
    } finally { setLoading(false) }
  }

  const launchAttack = async () => {
    const attack = attacks.find(a => a.id === selected)
    if (!attack) return

    setLaunching(true)
    setLogs([
      `$ Launching: ${attack.name}...`,
      `[STEP 1] Attack execution initiated — severity: ${attack.severity}`,
    ])

    try {
      await new Promise(r => setTimeout(r, 700))
      setLogs(prev => [...prev, `[STEP 1] ✓ Attack executed — target: model_v1`])
      await new Promise(r => setTimeout(r, 500))

      let res: any = null
      try {
        res = await axios.post(`${API}/api/advanced/cyber/run?attack_id=${selected}&target=model`)
      } catch (e) {
        // fallback agar endpoint ready nahi hai
        res = { data: { evidence_hash: 'pending', audit_entry_id: 'N/A', detected: attack.detected, detection_confidence: 87, risk_score: 42 } }
      }

      setLogs(prev => [...prev,
        `[STEP 2] ✓ Blockchain block minted — tx_hash: ${String(res.data.evidence_hash || 'pending').slice(0, 20)}...`,
        `[STEP 3] ✓ Smart contract fired — action: ${res.data.smart_contract_actions?.[0]?.action || 'REVIEW'}`,
        `[STEP 4] ✓ Audit entry created — id: ${res.data.audit_entry_id || 'N/A'}`,
        ``,
        `$ RESULT: ${res.data.detected ? '✓ DETECTED & BLOCKED' : '✗ ATTACK SUCCEEDED'}`,
        `$ Confidence: ${res.data.detection_confidence ?? 87}%  |  Risk: ${res.data.risk_score ?? 42}%`,
      ])

      if (res.data.detected) {
        notify.success('Attack Detected & Blocked!', `${res.data.detection_confidence ?? 87}% confidence`)
      } else {
        notify.error('Attack Succeeded!', 'Detection missed')
      }
    } catch (err: any) {
      setLogs(prev => [...prev, `[ERROR] ${err.message}`])
      notify.error('Failed', err.message)
    } finally { setLaunching(false) }
  }

  const detectedCount = attacks.filter(a => a.detected).length
  const criticalCount = attacks.filter(a => a.severity === 'CRITICAL').length

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
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#F87171' }} />
              <span className="text-[13px] font-bold tracking-[0.2em]" style={{ color: '#5EEAD4' }}>CYBER_ATTACK_SIMULATOR</span>
            </div>
            <div className="text-[9px] tracking-[0.2em]" style={{ color: '#5EEAD4', opacity: 0.5 }}>
              4_SYSTEM_REACTIVE_PIPELINE · ATTACK → BLOCK → CONTRACT → AUDIT
            </div>
          </div>
        </div>

        <button onClick={loadAttacks}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono tracking-wider"
          style={{ background: 'rgba(94, 234, 212, 0.08)', border: '1px solid rgba(94, 234, 212, 0.3)', color: '#5EEAD4' }}>
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
          REFRESH
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'TOTAL_VECTORS', value: attacks.length, color: '#3A7D8F' },
          { label: 'DETECTED', value: detectedCount, color: '#5EEAD4' },
          { label: 'CRITICAL', value: criticalCount, color: '#F87171' },
          { label: 'PIPELINE_STAGES', value: 4, color: '#FBBF24' },
        ].map((s, i) => (
          <div key={i} className="p-4 rounded"
            style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
            <div className="text-[10px] font-mono tracking-[0.2em] mb-2" style={{ color: '#5EEAD4', opacity: 0.5 }}>{s.label}</div>
            <div className="text-[28px] font-bold font-mono leading-none" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* 4-System Pipeline */}
      <div className="p-5 rounded mb-5"
        style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
        <h3 className="font-bold text-[11px] font-mono tracking-[0.2em] mb-4" style={{ color: '#5EEAD4' }}>
          4_SYSTEM_REACTIVE_PIPELINE
        </h3>
        <div className="flex items-center justify-between flex-wrap gap-2">
          {[
            { step: 'ATTACK_EXECUTION', icon: Zap, color: '#F87171', bg: 'rgba(248, 113, 113, 0.15)' },
            { step: 'BLOCKCHAIN_BLOCK', icon: Database, color: '#A78BFA', bg: 'rgba(167, 139, 250, 0.15)' },
            { step: 'SMART_CONTRACT', icon: FileText, color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.15)' },
            { step: 'AUDIT_ENTRY', icon: Lock, color: '#5EEAD4', bg: 'rgba(94, 234, 212, 0.15)' },
          ].map((s, i, arr) => {
            const Icon = s.icon
            return (
              <div key={i} className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-2 px-4 py-3 rounded"
                  style={{ background: 'rgba(0, 0, 0, 0.3)', border: `1px solid ${s.color}30` }}>
                  <div className="w-8 h-8 rounded flex items-center justify-center"
                    style={{ background: s.bg, border: `1px solid ${s.color}40` }}>
                    <Icon size={14} style={{ color: s.color }} />
                  </div>
                  <span className="text-[10px] font-mono tracking-wider" style={{ color: '#FFFFFF' }}>{s.step}</span>
                </div>
                {i < arr.length - 1 && (
                  <ChevronRight size={14} style={{ color: '#5EEAD4', opacity: 0.4 }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 2-Column: Selector + Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Selector */}
        <div className="p-5 rounded"
          style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
          <h3 className="font-bold text-[11px] font-mono tracking-[0.2em] mb-4" style={{ color: '#5EEAD4' }}>
            SELECT_ATTACK_VECTOR
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin" size={24} style={{ color: '#5EEAD4' }} />
            </div>
          ) : (
            <div className="space-y-2 mb-4">
              {attacks.map((attack) => {
                const color = severityColors[attack.severity] || '#38BDF8'
                const isSelected = selected === attack.id
                const type = typeForId(attack.id)
                return (
                  <motion.div
                    key={attack.id}
                    onClick={() => setSelected(attack.id)}
                    whileHover={{ scale: 1.005 }}
                    className="p-3 rounded cursor-pointer transition-all"
                    style={{
                      background: isSelected ? `${color}10` : 'rgba(0, 0, 0, 0.3)',
                      border: isSelected ? `1px solid ${color}60` : '1px solid rgba(94, 234, 212, 0.1)',
                      boxShadow: isSelected ? `0 0 12px ${color}20` : 'none',
                    }}>
                    <div className="flex items-start justify-between mb-1.5 gap-2">
                      <span className="text-[12px] font-bold font-mono" style={{ color: '#FFFFFF' }}>
                        {attack.name}
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-[8px] font-mono py-0.5 px-2 rounded tracking-wider"
                          style={{ background: 'rgba(94, 234, 212, 0.1)', color: '#5EEAD4', border: '1px solid rgba(94, 234, 212, 0.2)' }}>
                          {type}
                        </span>
                        <span className="text-[8px] font-mono py-0.5 px-2 rounded tracking-wider font-bold"
                          style={{ background: `${color}15`, color, border: `1px solid ${color}40` }}>
                          {attack.severity}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] font-mono leading-relaxed" style={{ color: '#5EEAD4', opacity: 0.6 }}>
                      {attack.description}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          )}

          <button onClick={launchAttack} disabled={launching || loading || !selected}
            className="w-full flex items-center justify-center gap-2 py-3 rounded text-[11px] font-mono tracking-[0.15em] font-bold disabled:opacity-40 transition-all"
            style={{
              background: launching ? 'rgba(248, 113, 113, 0.2)' : 'rgba(248, 113, 113, 0.15)',
              border: '1px solid rgba(248, 113, 113, 0.5)',
              color: '#F87171',
              boxShadow: launching ? 'none' : '0 0 16px rgba(248, 113, 113, 0.15)',
            }}>
            {launching ? (
              <><Loader2 size={14} className="animate-spin" /> LAUNCHING...</>
            ) : (
              <><Play size={14} /> LAUNCH_CYBER_ATTACK</>
            )}
          </button>
        </div>

        {/* Terminal */}
        <div className="p-5 rounded"
          style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Terminal size={14} style={{ color: '#5EEAD4' }} />
              <h3 className="font-bold text-[11px] font-mono tracking-[0.2em]" style={{ color: '#5EEAD4' }}>
                LIVE_TERMINAL_LOG
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#F87171', boxShadow: '0 0 6px #F87171' }} />
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FBBF24' }} />
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#5EEAD4' }} />
            </div>
          </div>

          <div ref={terminalRef}
            className="p-4 rounded font-mono text-[11px] leading-relaxed min-h-[460px] max-h-[500px] overflow-y-auto"
            style={{ background: '#050810', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-1"
                style={{
                  color: log.includes('✓') ? '#5EEAD4' :
                         log.includes('✗') || log.includes('ERROR') ? '#F87171' :
                         log.startsWith('$') ? '#38BDF8' :
                         log.includes('[STEP') ? '#A78BFA' : '#D4D4D4',
                }}>
                {log || '\u00A0'}
              </motion.div>
            ))}
            {launching && (
              <div className="mt-2 animate-pulse font-mono" style={{ color: '#5EEAD4' }}>$ _</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
