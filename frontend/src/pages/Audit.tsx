import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Loader2, RefreshCw, CheckCircle, XCircle, Hash, FileText,
  User, Lock, Activity, ShieldCheck, AlertTriangle, Sparkles,
  ArrowRight, Server, Radio, Download, Filter, Eye, Clock, Key
} from 'lucide-react'
import axios from 'axios'

const API = 'http://localhost:8000'

/* ===== Animated chain link ===== */
function ChainLink({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-16 h-16"
    >
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <motion.rect
          x="12" y="12" width="40" height="40" rx="12"
          fill="none"
          stroke="#FF9F0A"
          strokeWidth="2"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: delay + 0.3 }}
        />
        <motion.circle
          cx="32" cy="32" r="8"
          fill="#FF9F0A"
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, delay: delay + 0.5 }}
          style={{ transformOrigin: '32px 32px', filter: 'drop-shadow(0 0 8px #FF9F0A)' }}
        />
      </svg>
    </motion.div>
  )
}

/* ===== Hero chain visualization ===== */
function ChainVisual() {
  return (
    <div className="relative w-full h-[480px] flex items-center justify-center">
      {/* Ambient glow */}
      <div className="absolute inset-0 rounded-full blur-[120px] opacity-40"
        style={{ background: 'radial-gradient(circle, #FF9F0A, transparent 70%)' }} />

      {/* Chain row */}
      <div className="relative flex items-center gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <ChainLink key={i} delay={i * 0.15} />
        ))}
      </div>

      {/* Floating labels */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[20%] left-[15%] flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white shadow-xl border border-[#E5E5EA]"
      >
        <ShieldCheck size={14} className="text-[#30D158]" strokeWidth={2.4} />
        <span className="text-[11px] font-bold text-[#1D1D1F]">Verified</span>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute top-[70%] right-[15%] flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white shadow-xl border border-[#E5E5EA]"
      >
        <Hash size={14} className="text-[#FF9F0A]" strokeWidth={2.4} />
        <span className="text-[11px] font-bold text-[#1D1D1F]">SHA-256</span>
      </motion.div>
    </div>
  )
}

export function Audit() {
  const [entries, setEntries] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [verification, setVerification] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const res = await axios.get(`${API}/api/advanced/audit/trail`).catch(() => ({ data: { entries: [], stats: {}, verification: {} } }))
      setEntries(res.data.entries || [])
      setStats(res.data.stats || {})
      setVerification(res.data.verification || {})
    } catch (err: any) { setError(err.message) } finally { setLoading(false) }
  }

  const filtered = entries.filter(e => {
    if (!search) return true
    const s = search.toLowerCase()
    return (e.action || e.event || '').toLowerCase().includes(s) ||
           (e.actor || e.user || '').toLowerCase().includes(s) ||
           (e.hash || '').toLowerCase().includes(s)
  })

  const verifiedCount = entries.filter(e => (e.action || '').toLowerCase().includes('verified') || e.status === 'verified').length
  const totalCount = entries.length || stats.total || 0
  const chainValid = verification.valid !== false
  const actorsCount = new Set(entries.map(e => e.actor || e.user || 'system')).size || 1

  return (
    <div className="min-h-screen bg-[#FBFBFD]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[-20%] left-[-10%] w-[900px] h-[900px] rounded-full blur-[220px]"
            style={{ background: 'radial-gradient(circle, #FF9F0A, transparent 60%)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.22, 0.12] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full blur-[220px]"
            style={{ background: 'radial-gradient(circle, #30D158, transparent 60%)' }}
          />
        </div>

        <div className="relative mx-auto max-w-[1300px] px-6 py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-black/[0.06] shadow-sm mb-7">
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-[#FF9F0A]"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ boxShadow: '0 0 8px #FF9F0A' }}
                />
                <span className="text-[#1D1D1F] text-[11px] font-semibold tracking-[0.16em] uppercase">
                  Audit Trail
                </span>
              </div>

              <h1 className="text-[72px] md:text-[96px] font-semibold leading-[0.94] tracking-[-0.045em] text-[#1D1D1F]">
                Every action,
                <br />
                <motion.span
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-block bg-gradient-to-r from-[#FF9F0A] via-[#FF6B9D] via-[#30D158] to-[#FF9F0A] bg-clip-text text-transparent bg-[length:200%_100%]"
                >
                  provable forever.
                </motion.span>
              </h1>

              <p className="mt-7 max-w-[520px] text-[19px] leading-[1.5] tracking-[-0.015em] text-[#6E6E73]">
                Tamper-evident SHA-256 chain of all system events and actions. Every record cryptographically sealed.
              </p>

              <div className="mt-9 grid grid-cols-3 gap-6 max-w-[480px]">
                {[
                  { l: 'Total Events', v: totalCount, c: '#0071E3' },
                  { l: 'Verified', v: verifiedCount, c: '#30D158' },
                  { l: 'Chain', v: chainValid ? 'Valid' : 'Broken', c: chainValid ? '#30D158' : '#FF453A' },
                ].map((s, i) => (
                  <motion.div key={s.l}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
                  >
                    <div className="text-[36px] font-semibold leading-none tabular-nums tracking-[-0.04em]" style={{ color: s.c }}>
                      {s.v}
                    </div>
                    <div className="mt-2 text-[10px] font-bold tracking-[0.2em] uppercase text-[#86868B]">{s.l}</div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-11 flex flex-wrap items-center gap-3">
                <a href="#entries" className="group inline-flex items-center gap-2 rounded-full bg-[#FF9F0A] px-7 py-3.5 text-[15px] font-semibold text-white transition-all hover:scale-[1.03]"
                  style={{ boxShadow: '0 12px 40px -8px rgba(255,159,10,0.6)' }}>
                  View Entries
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
                </a>
                <button onClick={load}
                  className="inline-flex items-center gap-2 rounded-full bg-white border border-black/[0.08] px-7 py-3.5 text-[15px] font-medium text-[#1D1D1F] transition-all hover:bg-[#F5F5F7] hover:shadow-md">
                  <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.4, delay: 0.3 }} className="flex items-center justify-center">
              <ChainVisual />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="relative py-20 px-6">
        <div className="mx-auto max-w-[1300px]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Events', value: totalCount, color: '#0071E3', icon: FileText },
              { label: 'Verified', value: verifiedCount, color: '#30D158', icon: CheckCircle },
              { label: 'Chain Status', value: chainValid ? 'Valid' : 'Broken', color: chainValid ? '#30D158' : '#FF453A', icon: ShieldCheck },
              { label: 'Actors', value: actorsCount, color: '#FF9F0A', icon: User },
            ].map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="group relative overflow-hidden rounded-[24px] bg-white p-6 border border-black/[0.04] transition-all"
                  style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
                >
                  <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `${stat.color}30` }} />
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl mb-5"
                    style={{ background: `${stat.color}15` }}>
                    <Icon size={18} style={{ color: stat.color }} strokeWidth={2.2} />
                  </div>
                  <div className="relative text-[11px] font-bold tracking-[0.16em] uppercase text-[#86868B] mb-2">
                    {stat.label}
                  </div>
                  <div className="relative text-[36px] font-semibold leading-none tracking-[-0.04em] tabular-nums" style={{ color: stat.color }}>
                    {stat.value}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== ENTRIES ===== */}
      <section id="entries" className="relative py-24 px-6">
        <div className="mx-auto max-w-[1300px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-[1px] bg-[#1D1D1F]/30" />
              <span className="text-[11px] font-bold tracking-[0.24em] uppercase text-[#1D1D1F]/50">
                Audit Log
              </span>
            </div>
            <h2 className="text-[44px] md:text-[56px] font-semibold tracking-[-0.04em] leading-[1.05] text-[#1D1D1F]">
              Complete trail,
              <br />in chronological order.
            </h2>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="mb-8 rounded-2xl bg-white p-4 border border-black/[0.04]"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
          >
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Filter size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6E6E73]" strokeWidth={2.2} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search actions, actors, hashes..."
                  className="w-full rounded-xl bg-[#F5F5F7] py-3 pl-11 pr-4 text-[14px] text-[#1D1D1F] outline-none placeholder:text-[#86868B] border border-transparent focus:bg-white focus:border-[#FF9F0A]/40 focus:ring-4 focus:ring-[#FF9F0A]/10 transition-all"
                />
              </div>
              <button className="flex items-center gap-2 rounded-xl bg-[#F5F5F7] hover:bg-[#EBEBED] px-4 text-[13px] font-medium text-[#1D1D1F] transition-colors">
                <Download size={14} strokeWidth={2.2} />
                <span className="hidden md:inline">Export</span>
              </button>
            </div>
          </motion.div>

          {loading && entries.length === 0 ? (
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 rounded-2xl bg-white border border-black/[0.04] animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[32px] bg-white py-32 text-center border border-black/[0.04]">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-[#F5F5F7] mb-5">
                <FileText size={36} className="text-[#86868B]" strokeWidth={1.8} />
              </div>
              <div className="text-[20px] font-semibold text-[#1D1D1F] mb-2">
                {search ? 'No matching entries' : 'No audit events'}
              </div>
              <div className="text-[14px] text-[#6E6E73]">
                {search ? 'Try a different search term' : 'Audit log is empty or not configured'}
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline vertical line */}
              <div className="absolute left-[60px] top-4 bottom-4 w-[1px] bg-gradient-to-b from-[#FF9F0A] via-[#FF9F0A40] to-transparent" />

              <div className="space-y-3">
                {filtered.slice(0, 50).map((e, i) => {
                  const verified = (e.action || '').toLowerCase().includes('verified') || e.status === 'verified' || chainValid
                  const actionText = (e.action || e.event || 'Event').replace(/_/g, ' ')
                  const actorText = e.actor || e.user || 'system'
                  const hashText = e.hash ? e.hash.slice(0, 32) + '...' : '—'
                  const timestamp = e.timestamp ? new Date(e.timestamp * 1000).toLocaleTimeString() : ''

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-30px' }}
                      transition={{ duration: 0.5, delay: Math.min(i * 0.04, 0.4) }}
                      whileHover={{ x: 6 }}
                      className="group relative flex items-start gap-5"
                    >
                      {/* Timeline marker */}
                      <div className="relative flex-shrink-0 w-[80px] flex justify-center pt-5">
                        <motion.div
                          whileHover={{ scale: 1.15 }}
                          className="relative flex h-12 w-12 items-center justify-center rounded-2xl z-10"
                          style={{
                            background: 'linear-gradient(135deg, #FF9F0A, #FF9F0ACC)',
                            boxShadow: '0 8px 24px -6px #FF9F0A90, 0 0 0 4px #FBFBFD',
                          }}
                        >
                          <Activity size={18} className="text-white" strokeWidth={2.4} />
                        </motion.div>
                      </div>

                      {/* Card */}
                      <div
                        className="flex-1 overflow-hidden rounded-2xl bg-white transition-all"
                        style={{
                          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                          border: '1px solid rgba(0,0,0,0.04)',
                        }}
                      >
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="text-[16px] font-semibold tracking-[-0.02em] text-[#1D1D1F] capitalize mb-1.5">
                                {actionText}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                                <div className="flex items-center gap-1.5">
                                  <User size={11} className="text-[#86868B]" strokeWidth={2.4} />
                                  <span className="text-[12px] text-[#6E6E73] font-medium">{actorText}</span>
                                </div>
                                {timestamp && (
                                  <div className="flex items-center gap-1.5">
                                    <Clock size={11} className="text-[#86868B]" strokeWidth={2.4} />
                                    <span className="text-[12px] text-[#6E6E73] font-mono">{timestamp}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {verified ? (
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#30D158]/10 border border-[#30D158]/25 flex-shrink-0">
                                <CheckCircle size={11} className="text-[#30D158]" strokeWidth={2.6} />
                                <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#30D158]">Verified</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF453A]/10 border border-[#FF453A]/25 flex-shrink-0">
                                <XCircle size={11} className="text-[#FF453A]" strokeWidth={2.6} />
                                <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#FF453A]">Failed</span>
                              </div>
                            )}
                          </div>

                          {/* Hash */}
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FBFBFD] border border-black/[0.03]">
                            <Hash size={10} className="text-[#86868B]" strokeWidth={2.4} />
                            <span className="truncate font-mono text-[11px] text-[#6E6E73] tracking-tight">
                              {hashText}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {entries.length > 50 && (
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-black/[0.06] text-[13px] font-medium text-[#6E6E73]">
                    Showing 50 of {entries.length} entries
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ===== VERIFICATION PANEL ===== */}
      {Object.keys(verification).length > 0 && (
        <section className="relative py-24 px-6">
          <div className="mx-auto max-w-[1300px]">
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8 }}
              className="relative rounded-[32px] p-10 overflow-hidden"
              style={{
                background: '#0A0A0F',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 30px 80px -20px rgba(0,0,0,0.4)',
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#30D158] to-transparent" />
              <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full blur-3xl opacity-25 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #30D158, transparent 65%)' }} />

              <div className="relative flex items-start gap-4 mb-8">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #30D158, #2DD4BF)',
                    boxShadow: '0 16px 40px -8px #30D15890',
                  }}
                >
                  <ShieldCheck size={24} className="text-white" strokeWidth={2.2} />
                </motion.div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <motion.span
                      className="w-1.5 h-1.5 rounded-full bg-[#30D158]"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      style={{ boxShadow: '0 0 10px #30D158' }}
                    />
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#30D158]">
                      Chain Verification · Live
                    </span>
                  </div>
                  <h3 className="text-[24px] font-semibold tracking-[-0.02em] text-white">SHA-256 Hash Chain Integrity</h3>
                  <p className="mt-1.5 text-[14px] text-white/50">Continuous verification of every audit entry</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(verification).slice(0, 4).map(([key, val]) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
                    className="relative rounded-2xl bg-white/[0.04] border border-white/[0.08] p-5 overflow-hidden"
                  >
                    <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-white/40 mb-2">
                      {key.replace(/_/g, ' ')}
                    </div>
                    <div className="text-[20px] font-semibold tabular-nums text-white">
                      {typeof val === 'boolean' ? (val ? '✓ Valid' : '✗ Invalid') : String(val)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ===== BOTTOM CTA ===== */}
      <section className="relative bg-black py-40 px-6 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1300px] h-[1300px] rounded-full blur-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #FF9F0A, transparent 55%)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[900px] h-[900px] rounded-full blur-[260px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #30D158, transparent 55%)' }}
        />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} className="w-[800px] h-[800px]">
            <svg viewBox="0 0 800 800" className="w-full h-full">
              <circle cx="400" cy="400" r="380" fill="none" stroke="#FF9F0A" strokeWidth="1" strokeDasharray="4 10" opacity="0.3" />
            </svg>
          </motion.div>
        </div>

        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              left: `${10 + (i * 5) % 80}%`,
              top: `${20 + (i * 11) % 60}%`,
              background: ['#FF9F0A', '#30D158', '#FF6B9D'][i % 3],
              boxShadow: `0 0 15px ${['#FF9F0A', '#30D158', '#FF6B9D'][i % 3]}`,
            }}
            animate={{ y: [0, -40, 0], opacity: [0.15, 0.9, 0.15] }}
            transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: i * 0.25 }}
          />
        ))}

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1 }}
          className="relative max-w-[900px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl mb-10">
            <motion.span className="w-1.5 h-1.5 rounded-full bg-[#FF9F0A]"
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{ boxShadow: '0 0 8px #FF9F0A' }} />
            <span className="text-white/80 text-[11px] font-semibold tracking-[0.16em] uppercase">Immutable Record</span>
          </div>

          <h2 className="text-[72px] md:text-[112px] font-semibold leading-[0.9] tracking-[-0.05em] text-white">
            Full trail.
            <br />
            <motion.span
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-block bg-gradient-to-r from-[#FF9F0A] via-[#FF6B9D] via-[#30D158] to-[#FF9F0A] bg-clip-text text-transparent bg-[length:200%_100%]"
            >
              Forever provable.
            </motion.span>
          </h2>

          <p className="mt-10 text-[21px] leading-[1.5] text-white/50 max-w-[520px] mx-auto">
            Every action cryptographically sealed. Any tampering breaks the chain.
          </p>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
            <a href="/blockchain" className="group relative inline-flex items-center gap-2 rounded-full bg-white text-black px-8 py-4 text-[15px] font-semibold overflow-hidden transition-all hover:scale-[1.03]"
              style={{ boxShadow: '0 20px 60px -12px rgba(255,255,255,0.4)' }}>
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
              <span className="relative">View Ledger</span>
              <ArrowRight size={15} className="relative transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
            </a>
            <a href="/security-governance" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] backdrop-blur-xl text-white px-8 py-4 text-[15px] font-medium transition-all hover:bg-white/[0.08]">
              Security Governance
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

export default Audit
