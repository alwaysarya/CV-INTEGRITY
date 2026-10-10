import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Bug, Zap, Loader2, Terminal as TerminalIcon, Shield, Lock,
  FileText, Database, RefreshCw, Play, CheckCircle, XCircle,
  AlertTriangle, ChevronRight
} from 'lucide-react'
import axios from 'axios'

const API = 'http://localhost:8000'

interface Attack {
  id: string
  name: string
  description: string
  severity: string
  detected: boolean
  detection_method?: string
}

const severityTheme: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  CRITICAL: { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444', label: 'Critical' },
  HIGH: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B', label: 'High' },
  MEDIUM: { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6', label: 'Medium' },
  LOW: { bg: '#D1FAE5', text: '#065F46', dot: '#10B981', label: 'Low' },
}

const typeForId = (id: string): string => {
  const lower = id.toLowerCase()
  if (lower.includes('poison') || lower.includes('tamper')) return 'Poisoning'
  if (lower.includes('inversion') || lower.includes('privacy')) return 'Privacy'
  if (lower.includes('replay')) return 'Replay'
  if (lower.includes('inference') || lower.includes('manipulation')) return 'Integrity'
  return 'Evasion'
}

export function CyberAttack() {
  const [attacks, setAttacks] = useState<Attack[]>([])
  const [selected, setSelected] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [launching, setLaunching] = useState(false)
  const [logs, setLogs] = useState<string[]>(['> Awaiting attack launch...'])
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
      const res = await axios.get(`${API}/api/attacks`).catch(() => ({ data: { attacks: [] } }))
      const list = (res.data.attacks || []).map((a: any) => ({
        id: a.id || 'UNKNOWN',
        name: a.name || 'Unknown',
        description: a.description || '',
        severity: (a.severity || 'MEDIUM').toUpperCase(),
        detected: a.detected ?? false,
        detection_method: a.detection_method || (Array.isArray(a.detection_methods) ? a.detection_methods.join(', ') : ''),
      }))
      setAttacks(list)
      if (list.length > 0 && !selected) setSelected(list[0].id)
    } finally { setLoading(false) }
  }

  const launchAttack = () => {
    const attack = attacks.find(a => a.id === selected)
    if (!attack) return
    setLaunching(true)
    setLogs([])
    const steps = [
      `> Initializing attack simulation...`,
      `> Target: ${attack.name.replace(/_/g, ' ')}`,
      `> Severity: ${attack.severity}`,
      `> Injecting malicious payload...`,
      `> Modifying target resources...`,
      `> Running detection engine...`,
      attack.detected
        ? `✓ ATTACK DETECTED — ${attack.detection_method || 'SHA-256 verification'}`
        : `✗ ATTACK MISSED — no detection matched`,
      `> Simulation complete.`,
    ]
    let i = 0
    const interval = setInterval(() => {
      if (i < steps.length) {
        setLogs(prev => [...prev, steps[i]])
        i++
      } else {
        clearInterval(interval)
        setLaunching(false)
      }
    }, 350)
  }

  const selectedAttack = attacks.find(a => a.id === selected)

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-6">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              CV-INTEGRITY / Cyber Attack
            </div>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">
              Live Attack Simulator
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Launch simulated attacks and observe real-time detection responses.
            </p>
          </div>
          <button
            onClick={loadAttacks}
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Grid: attack list + terminal */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Attack selector */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                  <Bug size={14} className="text-red-600" />
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-slate-900">Select Attack</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">{attacks.length} patterns available</div>
                </div>
              </div>

              {loading ? (
                <div className="py-8 text-center">
                  <Loader2 size={16} className="mx-auto animate-spin text-slate-400" />
                </div>
              ) : (
                <div className="space-y-1.5">
                  {attacks.map(a => {
                    const theme = severityTheme[a.severity]
                    const active = selected === a.id
                    return (
                      <button
                        key={a.id}
                        onClick={() => setSelected(a.id)}
                        className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all ${
                          active
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: theme.dot }} />
                        <div className="min-w-0 flex-1">
                          <div className={`truncate text-[12px] font-medium ${active ? 'text-emerald-900' : 'text-slate-800'}`}>
                            {a.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </div>
                          <div className="mt-0.5 text-[10px] text-slate-500">
                            {typeForId(a.id)} · {theme.label}
                          </div>
                        </div>
                        {active && <ChevronRight size={13} className="text-emerald-600" />}
                      </button>
                    )
                  })}
                </div>
              )}

              <button
                onClick={launchAttack}
                disabled={!selectedAttack || launching}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-[12px] font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {launching ? (
                  <><Loader2 size={14} className="animate-spin" /> Running...</>
                ) : (
                  <><Play size={14} /> Launch Attack</>
                )}
              </button>
            </div>
          </div>

          {/* Terminal + details */}
          <div className="space-y-4 lg:col-span-2">
            {/* Terminal */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                <div className="flex items-center gap-2">
                  <TerminalIcon size={14} className="text-emerald-400" />
                  <span className="text-[11px] font-mono font-medium text-white">Attack Simulation Terminal</span>
                </div>
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
                </div>
              </div>
              <div
                ref={terminalRef}
                className="h-[280px] overflow-y-auto bg-slate-950 p-5 font-mono text-[12px] leading-relaxed"
              >
                {logs.map((log, i) => {
                  const color = log.startsWith('✓') ? '#10B981' : log.startsWith('✗') ? '#EF4444' : log.startsWith('>') ? '#94A3B8' : '#E2E8F0'
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ color }}
                    >
                      {log}
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Selected attack details */}
            {selectedAttack && (
              <motion.div
                key={selectedAttack.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ background: severityTheme[selectedAttack.severity].bg }}
                    >
                      <Bug size={18} style={{ color: severityTheme[selectedAttack.severity].text }} />
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-slate-900">
                        {selectedAttack.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-500">
                        {typeForId(selectedAttack.id)} attack
                      </div>
                    </div>
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase"
                    style={{
                      background: severityTheme[selectedAttack.severity].bg,
                      color: severityTheme[selectedAttack.severity].text,
                    }}
                  >
                    {severityTheme[selectedAttack.severity].label}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Description
                    </div>
                    <div className="mt-1 text-[12px] text-slate-700">{selectedAttack.description}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Detection Method
                    </div>
                    <div className="mt-1 text-[12px] text-slate-700">
                      {selectedAttack.detection_method || 'Not specified'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                    {selectedAttack.detected ? (
                      <>
                        <CheckCircle size={14} className="text-emerald-600" />
                        <span className="text-[12px] font-medium text-emerald-800">
                          Detection confirmed — this attack pattern is caught by the system
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle size={14} className="text-red-600" />
                        <span className="text-[12px] font-medium text-red-800">
                          Not detected — potential gap in coverage
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CyberAttack
