import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileCode, Loader2, RefreshCw, Play, CheckCircle } from 'lucide-react'
import axios from 'axios'
import { notify } from '@/lib/toast'

const API = 'http://localhost:8000'

export function Contracts() {
  const [contracts, setContracts] = useState<any[]>([])
  const [executions, setExecutions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)
  const [testScore, setTestScore] = useState(75)

  useEffect(() => { loadContracts() }, [])

  const loadContracts = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/advanced/contracts`)
      setContracts(res.data.contracts || [])
      setExecutions(res.data.execution_log || [])
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const executeContracts = async () => {
    setExecuting(true)
    try {
      notify.info('Executing contracts...', `Trust: ${testScore}`)
      const res = await axios.post(`${API}/api/advanced/contracts/execute`)
      notify.success('Executed!', `${res.data.results?.length || 0} triggered`)
      await loadContracts()
    } catch (err: any) {
      notify.error('Failed', err.message)
    } finally { setExecuting(false) }
  }

  return (
    <div className="space-y-6 p-6" style={{ background: '#F5F5F0', minHeight: 'calc(100vh - 72px)' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight" style={{ color: '#1A1A14' }}>Smart Contracts</h1>
          <p className="text-[13px] mt-1" style={{ color: '#6B6B60' }}>Automated rules on blockchain</p>
        </div>
        <button onClick={loadContracts}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-medium"
          style={{ background: '#FFFFFF', color: '#1A1A14', border: '1px solid #E8E6DC' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Contracts', value: contracts.length, color: '#3A7D8F' },
          { label: 'Total Executions', value: executions.length, color: '#2E7D4F' },
          { label: 'Engine', value: 'Active', color: '#6B4B94' },
          { label: 'Auto-Response', value: 'ON', color: '#8B6D1F' },
        ].map((s, i) => (
          <div key={i} className="p-5 rounded-3xl" style={{ background: '#FFFFFF' }}>
            <div className="text-[28px] font-bold tracking-tight leading-none mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[12px]" style={{ color: '#8B8B80' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Test Execution */}
      <div className="p-5 rounded-3xl" style={{ background: '#FFFFFF' }}>
        <h3 className="font-bold text-[13px] tracking-wide mb-4" style={{ color: '#1A1A14' }}>TEST CONTRACT EXECUTION</h3>
        <div className="flex items-center gap-4 flex-wrap">
          <input type="range" min="0" max="100" value={testScore}
            onChange={(e) => setTestScore(Number(e.target.value))}
            className="flex-1 accent-[#2E7D4F]" />
          <div className="text-[24px] font-bold w-20 text-center font-mono" style={{ color: '#1A1A14' }}>{testScore}</div>
          <button onClick={executeContracts} disabled={executing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold text-white disabled:opacity-50 transition-all hover:scale-[1.02]"
            style={{ background: '#2E7D4F', boxShadow: '0 4px 14px rgba(46, 125, 79, 0.25)' }}>
            {executing ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            Execute
          </button>
        </div>
      </div>

      {/* Contracts Grid */}
      {loading ? (
        <div className="p-12 rounded-3xl text-center" style={{ background: '#FFFFFF' }}>
          <Loader2 className="animate-spin mx-auto" size={28} style={{ color: '#8B8B80' }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contracts.map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-5 rounded-3xl" style={{ background: '#FFFFFF' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#EBE5F0' }}>
                  <FileCode size={18} style={{ color: '#6B4B94' }} />
                </div>
                <span className="text-[10px] py-1 px-2.5 rounded-full font-bold"
                  style={{ background: '#E8F0E5', color: '#2E7D4F' }}>{c.executions} execs</span>
              </div>
              <h3 className="text-[14px] font-bold mb-1" style={{ color: '#1A1A14' }}>{c.name}</h3>
              <p className="text-[11px] mb-3" style={{ color: '#6B6B60' }}>{c.description}</p>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                {[
                  { label: 'Trigger', value: c.trigger?.type || 'N/A', color: '#3A7D8F' },
                  { label: 'Action', value: c.action?.type || 'N/A', color: '#6B4B94' },
                ].map((item, k) => (
                  <div key={k} className="p-2.5 rounded-xl" style={{ background: '#F5F5F0' }}>
                    <div className="text-[9px] uppercase mb-1" style={{ color: '#8B8B80' }}>{item.label}</div>
                    <div className="text-[11px] font-bold font-mono" style={{ color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Recent Executions */}
      {executions.length > 0 && (
        <div className="p-5 rounded-3xl" style={{ background: '#FFFFFF' }}>
          <h3 className="font-bold text-[13px] tracking-wide mb-4" style={{ color: '#1A1A14' }}>RECENT EXECUTIONS ({executions.length})</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {executions.slice().reverse().map((e, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-2xl flex-wrap gap-2" style={{ background: '#F5F5F0' }}>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} style={{ color: '#2E7D4F' }} />
                  <span className="text-[12px] font-bold" style={{ color: '#1A1A14' }}>{e.contract_name}</span>
                </div>
                <span className="text-[10px] py-1 px-2.5 rounded-full font-bold"
                  style={{ background: '#E0EAEE', color: '#3A7D8F' }}>{e.action_taken}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
