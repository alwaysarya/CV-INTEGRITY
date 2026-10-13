import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, X, Trash2, CheckCheck, Info, AlertTriangle,
  ShieldAlert, ShieldCheck, ExternalLink
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  getAllAlerts, markAsRead, markAllAsRead, deleteAlert, clearAllAlerts,
  getTypeColor, formatAlertTime, getUnreadCount, seedAlerts,
  type Alert, type AlertType
} from '@/lib/alerts'

export function AlertsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const load = () => {
    seedAlerts()
    setAlerts(getAllAlerts().sort((a, b) => b.timestamp - a.timestamp))
  }

  useEffect(() => {
    load()
    const onUpdate = () => load()
    window.addEventListener('cv_alerts_updated', onUpdate)
    return () => window.removeEventListener('cv_alerts_updated', onUpdate)
  }, [])

  useEffect(() => { if (open) load() }, [open])

  const filtered = filter === 'unread' ? alerts.filter(a => !a.read) : alerts

  const handleClick = (alert: Alert) => {
    markAsRead(alert.id)
    if (alert.actionUrl) {
      navigate(alert.actionUrl)
      onClose()
    }
  }

  const getIcon = (type: AlertType) => {
    switch (type) {
      case 'info': return Info
      case 'warning': return AlertTriangle
      case 'critical': return ShieldAlert
      case 'success': return ShieldCheck
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[420px] bg-[#0A0A0F] border-l border-white/10 flex flex-col"
            style={{ boxShadow: '-20px 0 60px -10px rgba(0,0,0,0.6)' }}
          >
            <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #0071E3, #5E5CE6)' }}>
                  <Bell size={18} className="text-white" strokeWidth={2.2} />
                </div>
                <div>
                  <div className="text-[15px] font-semibold text-white">Security Alerts</div>
                  <div className="text-[11px] text-white/40">
                    {getUnreadCount()} unread · {alerts.length} total
                  </div>
                </div>
              </div>
              <button onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white transition-colors">
                <X size={16} strokeWidth={2.2} />
              </button>
            </div>

            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between gap-2">
              <div className="flex gap-1">
                {[{ id: 'all', label: 'All' }, { id: 'unread', label: 'Unread' }].map(f => (
                  <button key={f.id} onClick={() => setFilter(f.id as any)}
                    className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                      filter === f.id ? 'bg-white text-black' : 'bg-white/[0.06] text-white/60 hover:bg-white/[0.1]'
                    }`}>{f.label}</button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { markAllAsRead(); load() }}
                  className="flex items-center rounded-lg px-2.5 py-1.5 text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors"
                  title="Mark all as read">
                  <CheckCheck size={13} strokeWidth={2.4} />
                </button>
                <button onClick={() => { clearAllAlerts(); load() }}
                  className="flex items-center rounded-lg px-2.5 py-1.5 text-white/50 hover:text-[#FF453A] hover:bg-[#FF453A]/10 transition-colors"
                  title="Clear all">
                  <Trash2 size={13} strokeWidth={2.4} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] mb-4">
                    <ShieldCheck size={28} className="text-white/20" strokeWidth={1.8} />
                  </div>
                  <div className="text-[14px] font-medium text-white/60 mb-1">All caught up</div>
                  <div className="text-[12px] text-white/30">No alerts to show</div>
                </div>
              ) : (
                filtered.map((alert, i) => {
                  const color = getTypeColor(alert.type)
                  const Icon = getIcon(alert.type)
                  return (
                    <motion.div key={alert.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`group relative rounded-xl border p-3.5 cursor-pointer transition-all ${
                        alert.read ? 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]'
                                  : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.06]'
                      }`}
                      onClick={() => handleClick(alert)}>
                      {!alert.read && (
                        <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full"
                          style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                      )}
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0"
                          style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                          <Icon size={15} style={{ color }} strokeWidth={2.2} />
                        </div>
                        <div className="flex-1 min-w-0 pr-6">
                          <div className={`text-[13px] font-semibold mb-0.5 truncate ${alert.read ? 'text-white/60' : 'text-white'}`}>
                            {alert.title}
                          </div>
                          <div className="text-[12px] text-white/40 leading-snug mb-2 line-clamp-2">
                            {alert.message}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-white/30">
                            <span className="font-mono">{formatAlertTime(alert.timestamp)}</span>
                            <span>·</span>
                            <span className="uppercase tracking-wider font-bold" style={{ color: `${color}90` }}>
                              {alert.source}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteAlert(alert.id); load() }}
                        className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex h-6 w-6 items-center justify-center rounded-md hover:bg-[#FF453A]/15 text-white/30 hover:text-[#FF453A]">
                        <Trash2 size={11} strokeWidth={2.4} />
                      </button>
                    </motion.div>
                  )
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
