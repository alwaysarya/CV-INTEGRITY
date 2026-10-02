import { motion } from 'framer-motion'
import { FileCode, CheckCircle, AlertTriangle, XCircle, Zap, RefreshCw, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { notify } from '@/lib/toast'

const API = 'http://localhost:8000'

interface Contract {
  id: string
  name: string
  description: string
  executions: number
  approved: number
  quarantined: number
  thresholds?: any
}

export function ContractsEngine() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [executing, setExecuting] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, approved: 0, review: 0, quarantine: 0 })

  useEffect(() => { init() }, [])

  const init = async () => {
    await loadContracts()
    await loadStats()
  }

  const loadStats = async () => {
    try {
      const res = await fetch(`${API}/api/contracts/stats`)
      const data = await res.json()
      if (data.status === 'success') {
        setStats({
          total: data.total_executions || 0,
          approved: data.decisions?.auto_approve || 0,
          review: data.decisions?.review || 0,
          quarantine: data.decisions?.quarantine || 0,
        })
      }
    } catch (err) { console.error(err) }
  }

  const loadContracts = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/contracts/list`)
      const list = (res.data.contracts || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        thresholds: c.thresholds,
        executions: c.executions || 0,
        approved: c.approved || 0,
        quarantined: c.quarantined || 0,
      }))
      setContracts(list)
    } catch (err) {
      console.error(err)
      notify.error('Load failed', 'Could not fetch contracts')
    } finally {
      setLoading(false)
    }
  }

  const executeContract = async (contract: Contract) => {
    setExecuting(contract.id)
    notify.info('Executing contract...', contract.name)
    try {
      const res = await fetch(`${API}/api/contracts/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contract_id: contract.id, target: 'system', metrics: {} }),
      })
      const data = await res.json()
      if (data.status === 'success') {
        const decision = data.decision
        const score = data.trust_score
        if (decision === 'AUTO_APPROVE') notify.success(contract.name, `AUTO-APPROVE (score: ${score})`)
        else if (decision === 'REVIEW') notify.info(contract.name, `REVIEW (score: ${score})`)
        else notify.error(contract.name, `QUARANTINE (score: ${score})`)

        // Update local state + refresh stats
        setContracts(prev => prev.map(c => c.id === contract.id ? {
          ...c,
          executions: (c.executions || 0) + 1,
          approved: decision === 'AUTO_APPROVE' ? (c.approved || 0) + 1 : c.approved,
          quarantined: decision === 'QUARANTINE' ? (c.quarantined || 0) + 1 : c.quarantined,
        } : c))
        await loadStats()
      } else {
        notify.error('Execution failed', data.detail || 'Unknown error')
      }
    } catch (err: any) {
      notify.error('Execution failed', err.message)
    } finally {
      setExecuting(null)
    }
  }

  return (
    <div className="space-y-6 p-6" style={{ background: '#0A0F14', minHeight: 'calc(100vh - 72px)' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-[32px] font-bold tracking-tight mb-1 text-[#E5F5F0]">Smart Contracts Engine</h1>
            <p className="text-[13px] max-w-2xl text-[#8AA4A0]">
              Deterministic smart contracts encode platform governance rules — auto-fire decisions based on trust score thresholds.
            </p>
          </div>
          <button onClick={loadContracts}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-medium bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Executions', value: stats.total, color: '#5EEAD4' },
            { label: 'Auto Approved', value: stats.approved, color: '#10B981' },
            { label: 'Under Review', value: stats.review, color: '#F59E0B' },
            { label: 'Quarantined', value: stats.quarantine, color: '#F87171' },
          ].map((s, i) => (
            <div key={i} className="p-4 rounded-2xl bg-[#0F1419] border border-cyan-500/20">
              <div className="text-[10px] uppercase tracking-wider mb-1 text-[#8AA4A0]">{s.label}</div>
              <div className="text-2xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Auto-Decision Rule Set */}
        <div className="p-5 rounded-3xl mb-6 bg-[#0F1419] border border-cyan-500/20">
          <h3 className="font-bold text-[13px] tracking-wide mb-4 text-[#E5F5F0]">Auto-Decision Rule Set</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { score: 'Trust Score ≥ 80', label: 'AUTO-APPROVE', icon: CheckCircle, bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981' },
              { score: '50 ≤ Trust Score < 80', label: 'REVIEW', icon: AlertTriangle, bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' },
              { score: 'Trust Score < 50', label: 'QUARANTINE', icon: XCircle, bg: 'rgba(248, 113, 113, 0.1)', color: '#F87171' },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="p-5 rounded-2xl text-center" style={{ background: item.bg, border: `1px solid ${item.color}40` }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 bg-[#0A0F14]">
                    <Icon size={18} style={{ color: item.color }} />
                  </div>
                  <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: item.color, opacity: 0.8 }}>{item.score}</div>
                  <div className="text-[13px] font-bold" style={{ color: item.color }}>{item.label}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Contract Cards — LIVE FROM API */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-cyan-400" size={28} />
            <span className="ml-3 text-[#8AA4A0]">Loading contracts...</span>
          </div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-16 text-[#8AA4A0]">
            <FileCode size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No contracts found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contracts.map((contract, i) => (
              <motion.div
                key={contract.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-5 rounded-3xl bg-[#0F1419] border border-cyan-500/20"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-cyan-500/10 border border-cyan-500/30">
                    <FileCode size={18} className="text-cyan-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[13px] font-bold leading-tight mb-1 text-[#E5F5F0]">{contract.name}</h3>
                    <div className="text-[9px] font-mono truncate text-[#5EEAD4] opacity-60">{contract.id}</div>
                  </div>
                </div>

                <p className="text-[11px] mb-4 min-h-[40px] text-[#8AA4A0]">{contract.description}</p>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: 'Executions', value: contract.executions, color: '#E5F5F0' },
                    { label: 'Approved', value: contract.approved, color: '#10B981' },
                    { label: 'Quarantined', value: contract.quarantined, color: '#F87171' },
                  ].map((item, k) => (
                    <div key={k} className="p-2.5 rounded-xl text-center bg-[#0A0F14] border border-cyan-500/10">
                      <div className="text-[9px] uppercase tracking-wider mb-1 text-[#8AA4A0]">{item.label}</div>
                      <div className="text-[12px] font-bold font-mono" style={{ color: item.color }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => executeContract(contract)}
                  disabled={executing === contract.id}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-[12px] font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{ background: '#2E7D4F', boxShadow: '0 4px 14px rgba(46, 125, 79, 0.25)' }}
                >
                  {executing === contract.id ? (
                    <>
                      <Loader2 className="animate-spin" size={12} /> Executing...
                    </>
                  ) : (
                    <>
                      <Zap size={12} /> Execute Contract
                    </>
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
