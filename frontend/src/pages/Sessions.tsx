import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Monitor, Smartphone, Tablet, MapPin, Globe, Clock, LogOut,
  ShieldCheck, AlertTriangle, Loader2, RefreshCw, ArrowLeft
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  getAllSessions, revokeSession, revokeAllOtherSessions,
  formatRelativeTime, formatAbsoluteTime,
  getCurrentSession, type Session
} from '@/lib/sessions'

export function Sessions() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setTimeout(() => {
      setSessions(getAllSessions())
      setLoading(false)
    }, 300)
  }

  useEffect(() => { load() }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const handleRevoke = (id: string) => {
    setActionLoading(id)
    setTimeout(() => {
      const ok = revokeSession(id)
      setActionLoading(null)
      if (ok) {
        load()
        showToast('Session revoked successfully')
      } else {
        showToast('Cannot revoke current session')
      }
    }, 500)
  }

  const handleRevokeAll = () => {
    setActionLoading('all')
    setTimeout(() => {
      const count = revokeAllOtherSessions()
      setActionLoading(null)
      load()
      showToast(`${count} session${count !== 1 ? 's' : ''} revoked`)
    }, 600)
  }

  const current = sessions.find(s => s.current)
  const others = sessions.filter(s => !s.current)

  const getDeviceIcon = (device: string) => {
    if (device === 'Mobile') return Smartphone
    if (device === 'Tablet') return Tablet
    return Monitor
  }

  return (
    <div className="min-h-screen bg-[#FBFBFD] p-6" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>
      <div className="mx-auto max-w-[1000px]">

        {/* Toast */}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-[#1D1D1F] text-white text-[13px] font-medium shadow-xl"
          >
            {toast}
          </motion.div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-8">
          <div>
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-1.5 text-[12px] font-medium text-[#86868B] hover:text-[#1D1D1F] transition-colors mb-3"
            >
              <ArrowLeft size={13} strokeWidth={2.2} />
              Back to Settings
            </button>
            <h1 className="text-[40px] font-semibold tracking-[-0.035em] text-[#1D1D1F]">
              Active Sessions
            </h1>
            <p className="mt-2 text-[15px] text-[#6E6E73]">
              Manage your logged-in devices and sign out remotely
            </p>
          </div>
          <button
            onClick={load}
            className="flex h-9 items-center gap-2 rounded-lg bg-white border border-black/[0.06] px-3 text-[12px] font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {loading && sessions.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-20 text-[13px] text-[#86868B]">
            <Loader2 size={16} className="animate-spin" />
            Loading sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="rounded-2xl bg-white border border-black/[0.04] py-20 text-center">
            <ShieldCheck size={32} className="mx-auto text-[#86868B]" />
            <div className="mt-3 text-[14px] font-medium text-[#1D1D1F]">No active sessions</div>
            <div className="mt-1 text-[12px] text-[#86868B]">Log in to create a session</div>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Current Session */}
            {current && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#30D158]" style={{ boxShadow: '0 0 8px #30D158' }} />
                  <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#30D158]">
                    Current Device
                  </span>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-2xl bg-white border-2 border-[#30D158]/30 p-6"
                  style={{ boxShadow: '0 8px 32px -8px rgba(48,209,88,0.15)' }}
                >
                  <div className="flex items-start gap-4">
                    {(() => {
                      const Icon = getDeviceIcon(current.device)
                      return (
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #30D158, #2DD4BF)' }}>
                          <Icon size={24} className="text-white" strokeWidth={2.2} />
                        </div>
                      )
                    })()}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="text-[17px] font-semibold tracking-[-0.02em] text-[#1D1D1F]">
                          {current.device} · {current.browser}
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-[#30D158]/15 text-[#30D158] text-[10px] font-bold tracking-[0.14em] uppercase">
                          This device
                        </span>
                      </div>
                      <div className="text-[12px] text-[#86868B] mb-4">{current.os}</div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <MapPin size={11} className="text-[#86868B]" strokeWidth={2.2} />
                            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#AEAEB2]">Location</span>
                          </div>
                          <div className="text-[13px] font-medium text-[#1D1D1F]">{current.location}</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Globe size={11} className="text-[#86868B]" strokeWidth={2.2} />
                            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#AEAEB2]">IP Address</span>
                          </div>
                          <div className="text-[13px] font-medium text-[#1D1D1F] font-mono">{current.ip}</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Clock size={11} className="text-[#86868B]" strokeWidth={2.2} />
                            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#AEAEB2]">Active</span>
                          </div>
                          <div className="text-[13px] font-medium text-[#30D158]">{formatRelativeTime(current.lastActiveAt)}</div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-[#F0F0F2] text-[11px] text-[#86868B]">
                        Signed in on {formatAbsoluteTime(current.createdAt)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Other Sessions */}
            {others.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF9F0A]" />
                    <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#FF9F0A]">
                      Other Devices · {others.length}
                    </span>
                  </div>
                  <button
                    onClick={handleRevokeAll}
                    disabled={actionLoading === 'all'}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#FF453A] hover:bg-[#FF453A]/10 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === 'all' ? <Loader2 size={12} className="animate-spin" /> : <LogOut size={12} strokeWidth={2.4} />}
                    Logout all
                  </button>
                </div>

                <div className="space-y-3">
                  {others.map((s, i) => {
                    const Icon = getDeviceIcon(s.device)
                    return (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="overflow-hidden rounded-2xl bg-white border border-black/[0.04] p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0 bg-[#F5F5F7]">
                            <Icon size={20} className="text-[#6E6E73]" strokeWidth={2.2} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="text-[16px] font-semibold tracking-[-0.02em] text-[#1D1D1F] mb-0.5">
                              {s.device} · {s.browser}
                            </div>
                            <div className="text-[12px] text-[#86868B] mb-3">{s.os}</div>

                            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px] text-[#6E6E73]">
                              <div className="flex items-center gap-1.5">
                                <MapPin size={11} className="text-[#86868B]" strokeWidth={2.2} />
                                {s.location}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Globe size={11} className="text-[#86868B]" strokeWidth={2.2} />
                                <span className="font-mono">{s.ip}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock size={11} className="text-[#86868B]" strokeWidth={2.2} />
                                {formatRelativeTime(s.lastActiveAt)}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleRevoke(s.id)}
                            disabled={actionLoading === s.id}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FF453A]/10 hover:bg-[#FF453A]/20 text-[12px] font-semibold text-[#FF453A] transition-colors disabled:opacity-50 flex-shrink-0"
                          >
                            {actionLoading === s.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <LogOut size={13} strokeWidth={2.4} />
                            )}
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Security Tip */}
            <div className="rounded-2xl bg-[#FF9F0A]/8 border border-[#FF9F0A]/20 p-4 flex items-start gap-3">
              <AlertTriangle size={16} className="text-[#FF9F0A] flex-shrink-0 mt-0.5" strokeWidth={2.2} />
              <div>
                <div className="text-[13px] font-semibold text-[#1D1D1F] mb-1">Security Tip</div>
                <div className="text-[12px] text-[#6E6E73] leading-relaxed">
                  If you see a device you don't recognize, sign out of it immediately and change your password.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sessions
