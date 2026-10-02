import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, RefreshCw, CheckCircle, XCircle, Hash, FileText, User, Lock, Activity } from 'lucide-react'
import axios from 'axios'

const API = 'http://localhost:8000'

export function Audit() {
  const [entries, setEntries] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [verification, setVerification] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/advanced/audit/trail`)
      setEntries(res.data.entries || [])
      setStats(res.data.stats || {})
      setVerification(res.data.verification || {})
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen p-6" style={{ background: '#08080C', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Top header */}
      <div className="flex items-center justify-between mb-6 pb-4 flex-wrap gap-3"
        style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center"
            style={{ background: 'rgba(94, 234, 212, 0.1)', border: '1px solid rgba(94, 234, 212, 0.4)' }}>
            <FileText size={14} style={{ color: '#5EEAD4' }} />
          </div>
          <div>
            <div className="text-[13px] font-bold tracking-[0.2em]" style={{ color: '#5EEAD4' }}>AUDIT_TRAIL</div>
            <div className="text-[9px] tracking-[0.2em]" style={{ color: '#5EEAD4', opacity: 0.5 }}>SHA-256_TAMPER_EVIDENT_CHAIN</div>
          </div>
        </div>

        <button onClick={load}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono tracking-wider"
          style={{ background: 'rgba(94, 234, 212, 0.08)', border: '1px solid rgba(94, 234, 212, 0.3)', color: '#5EEAD4' }}>
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
          REFRESH
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'TOTAL_ENTRIES', value: stats.total_entries || 0, icon: FileText, color: '#3A7D8F' },
          { label: 'UNIQUE_ACTIONS', value: stats.unique_actions || 0, icon: Activity, color: '#5EEAD4' },
          { label: 'UNIQUE_USERS', value: stats.unique_users || 0, icon: User, color: '#A78BFA' },
          { label: 'CHAIN_STATUS', value: verification.valid ? 'VALID' : 'BROKEN', icon: Lock, color: verification.valid ? '#5EEAD4' : '#F87171' },
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

      {/* Chain Status Banner */}
      <div className="p-4 rounded mb-5 flex items-center gap-3"
        style={{
          background: verification.valid ? 'rgba(94, 234, 212, 0.08)' : 'rgba(248, 113, 113, 0.08)',
          border: `1px solid ${verification.valid ? 'rgba(94, 234, 212, 0.4)' : 'rgba(248, 113, 113, 0.4)'}`,
        }}>
        {verification.valid ? (
          <>
            <CheckCircle size={18} style={{ color: '#5EEAD4' }} />
            <span className="text-[12px] font-bold font-mono tracking-wider" style={{ color: '#5EEAD4' }}>
              CHAIN_VALID · All entries verified
            </span>
          </>
        ) : (
          <>
            <XCircle size={18} style={{ color: '#F87171' }} />
            <span className="text-[12px] font-bold font-mono tracking-wider" style={{ color: '#F87171' }}>
              CHAIN_BROKEN · Tamper detected
            </span>
          </>
        )}
      </div>

      {verification.message && (
        <div className="mb-5 text-[10px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>
          {verification.message}
        </div>
      )}

      {/* Entries */}
      <div className="p-5 rounded"
        style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
        <h3 className="font-bold text-[11px] font-mono tracking-[0.2em] mb-4" style={{ color: '#5EEAD4' }}>
          AUDIT_ENTRIES ({entries.length})
        </h3>
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="animate-spin mx-auto" size={28} style={{ color: '#5EEAD4' }} />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={40} className="mx-auto mb-3" style={{ color: '#5EEAD4', opacity: 0.3 }} />
            <div className="text-[11px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>NO_AUDIT_ENTRIES</div>
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {entries.slice().reverse().map((e, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                className="p-3 rounded"
                style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(94, 234, 212, 0.1)' }}>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-wider py-0.5 px-2 rounded"
                      style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                      #{e.entry_id}
                    </span>
                    <span className="text-[11px] font-bold font-mono" style={{ color: '#FFFFFF' }}>{e.action}</span>
                  </div>
                  <span className="text-[9px] font-mono tracking-wider py-0.5 px-2 rounded"
                    style={{ background: 'rgba(94, 234, 212, 0.1)', color: '#5EEAD4', border: '1px solid rgba(94, 234, 212, 0.3)' }}>
                    ● VERIFIED
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] mb-1">
                  <Hash size={10} style={{ color: '#A78BFA' }} />
                  <span className="font-mono truncate" style={{ color: '#A78BFA' }}>
                    {e.hash?.substring(0, 40)}...
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono" style={{ color: '#5EEAD4', opacity: 0.6 }}>
                  <User size={10} />
                  {e.user || 'system'}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
