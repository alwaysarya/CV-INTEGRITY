import { motion } from 'framer-motion'
import { FileCode, CheckCircle, AlertTriangle, XCircle, Zap, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { notify } from '@/lib/toast'

const API = 'http://localhost:8000'

export function ContractsEngine() {
  const [contracts, setContracts] = useState<any[]>([])
  const [executing, setExecuting] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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
        const totalExecs = data.total_executions || 0
        const totalApproved = data.decisions?.auto_approve || 0
        const totalQuarantined = data.decisions?.quarantine || 0
        setContracts(prev => {
          const total = prev.length || 1
          return prev.map((c, i) => ({
            ...c,
            executions: Math.floor(totalExecs / total) + (i < (totalExecs % total) ? 1 : 0),
            approved: Math.floor(totalApproved / total) + (i < (totalApproved % total) ? 1 : 0),
            quarantined: Math.floor(totalQuarantined / total) + (i < (totalQuarantined % total) ? 1 : 0),
          }))
        })
      }
    } catch (err) { console.error(err) }
  }

  const loadContracts = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/contracts/list`)
      setContracts((res.data.contracts || []).map((c: any) => ({ ...c, executions: 0, approved: 0, quarantined: 0 })))
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const contractEngine = [
    { id: 'contract_model_quality', name: 'Model Quality & Performance Contract', description: 'Evaluates precision, recall, mAP50-95, and inference latency against SLA thresholds.', executions: 0, approved: 0, quarantined: 0 },
    { id: 'contract_dataset_verification', name: 'Dataset Quality & Integrity Contract', description: 'Verifies label balance, duplicate ratio, blur variance, and synthetic noise anomalies.', executions: 0, approved: 0, quarantined: 0 },
    { id: 'contract_adversarial_robustness', name: 'Adversarial Robustness Contract', description: 'Validates boundary resilience against FGSM, PGD, and patch-evasion attacks.', executions: 0, approved: 0, quarantined: 0 },
    { id: 'contract_data_concept_drift', name: 'Data & Concept Drift Monitor Contract', description: 'Monitors population stability index (PSI) and Wasserstein drift across live feature streams.', executions: 0, approved: 0, quarantined: 0 },
    { id: 'contract_deployment_gate', name: 'Production Deployment Gate Contract', description: 'Enforces multisig sign-off, benchmark verification, and compliance standards before rollout.', executions: 0, approved: 0, quarantined: 0 },
    { id: 'contract_integrity_shield', name: 'Cryptographic Integrity Shield Contract', description: 'Continuously validates SHA-256 weight fingerprints and blockchain state consistency.', executions: 0, approved: 0, quarantined: 0 },
  ]

  const executeContract = async (contract: any) => {
    setExecuting(contract.id)
    notify.info('Executing contract...', contract.name)
    try {
      const res = await fetch(`${API}/api/contracts/execute`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contract_id: contract.id, target: 'system', metrics: {} }),
      })
      const data = await res.json()
      if (data.status === 'success') {
        const decision = data.decision
        const score = data.trust_score
        if (decision === 'AUTO_APPROVE') notify.success(contract.name, `AUTO-APPROVE (score: ${score})`)
        else if (decision === 'REVIEW') notify.info(contract.name, `REVIEW (score: ${score})`)
        else notify.error(contract.name, `QUARANTINE (score: ${score})`)

        setContracts(prev => prev.map(c => c.id === contract.id ? {
          ...c,
          executions: (c.executions || 0) + 1,
          approved: decision === 'AUTO_APPROVE' ? (c.approved || 0) + 1 : c.approved,
          quarantined: decision === 'QUARANTINE' ? (c.quarantined || 0) + 1 : c.quarantined,
        } : c))
      } else {
        notify.error('Execution failed', data.detail || 'Unknown error')
      }
    } catch (err: any) {
      notify.error('Execution failed', err.message)
    } finally {
      setExecuting(null)
      setTimeout(() => loadStats(), 500)
    }
  }

  return (
    <div className="space-y-6 p-6" style={{ background: '#F5F5F0', minHeight: 'calc(100vh - 72px)' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-[32px] font-bold tracking-tight mb-1" style={{ color: '#1A1A14' }}>Smart Contracts Engine</h1>
            <p className="text-[13px] max-w-2xl" style={{ color: '#6B6B60' }}>
              6 deterministic smart contracts encode platform governance rules — auto-fire decisions based on trust score thresholds.
            </p>
          </div>
          <button onClick={loadContracts}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-medium"
            style={{ background: '#FFFFFF', color: '#1A1A14', border: '1px solid #E8E6DC' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Auto-Decision Rule Set */}
        <div className="p-5 rounded-3xl mb-6" style={{ background: '#FFFFFF' }}>
          <h3 className="font-bold text-[13px] tracking-wide mb-4" style={{ color: '#1A1A14' }}>Auto-Decision Rule Set</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { score: 'Trust Score ≥ 80', label: 'AUTO-APPROVE', icon: CheckCircle, bg: '#E8F0E5', color: '#2E7D4F' },
              { score: '50 ≤ Trust Score < 80', label: 'REVIEW', icon: AlertTriangle, bg: '#F0E8D0', color: '#8B6D1F' },
              { score: 'Trust Score < 50', label: 'QUARANTINE', icon: XCircle, bg: '#F0DCD8', color: '#8B3A2E' },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="p-5 rounded-2xl text-center" style={{ background: item.bg }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ background: '#FFFFFF' }}>
                    <Icon size={18} style={{ color: item.color }} />
                  </div>
                  <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: item.color, opacity: 0.8 }}>{item.score}</div>
                  <div className="text-[13px] font-bold" style={{ color: item.color }}>{item.label}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 6 Contract Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contractEngine.map((contract, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-5 rounded-3xl" style={{ background: '#FFFFFF' }}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#E0EAEE' }}>
                  <FileCode size={18} style={{ color: '#3A7D8F' }} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[13px] font-bold leading-tight mb-1" style={{ color: '#1A1A14' }}>{contract.name}</h3>
                  <div className="text-[9px] font-mono truncate" style={{ color: '#8B8B80' }}>{contract.id}</div>
                </div>
              </div>

              <p className="text-[11px] mb-4 min-h-[40px]" style={{ color: '#6B6B60' }}>{contract.description}</p>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'Executions', value: contract.executions, color: '#1A1A14' },
                  { label: 'Approved', value: contract.approved, color: '#2E7D4F' },
                  { label: 'Quarantined', value: contract.quarantined, color: '#8B3A2E' },
                ].map((item, k) => (
                  <div key={k} className="p-2.5 rounded-xl text-center" style={{ background: '#F5F5F0' }}>
                    <div className="text-[9px] uppercase tracking-wider mb-1" style={{ color: '#8B8B80' }}>{item.label}</div>
                    <div className="text-[12px] font-bold font-mono" style={{ color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>

              <button onClick={() => executeContract(contract)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-[12px] font-semibold text-white transition-all hover:scale-[1.02]"
                style={{ background: '#2E7D4F', boxShadow: '0 4px 14px rgba(46, 125, 79, 0.25)' }}>
                <Zap size={12} /> Execute Contract
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
