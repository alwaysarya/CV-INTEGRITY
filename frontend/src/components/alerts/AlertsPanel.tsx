import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, X, Trash2, CheckCheck, Info, AlertTriangle,
  ShieldAlert, ShieldCheck
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
  const unread = alerts.filter(a => !a.read).length

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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="fixed right-0 top-0 z-[110] h-screen w-full max-w-[440px] flex flex-col bg-white"
            style={{
              borderLeft: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '-30px 0 80px -20px rgba(0,0,0,0.15)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[#F0F0F2] flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #0071E3, #5E5CE6)',
                    boxShadow: '0 6px 20px rgba(0,113,227,0.25)',
                  }}
                >
                  <Bell size={18} className="text-white" strokeWidth={2.4} />
                </div>
                <div className="min-w-0">
                  <div className="text-[15px] font-semibold text-[#1D1D1F] truncate">
                    Security Alerts
                  </div>
                  <div className="text-[11px] text-[#86868B] truncate">
                    {unread} unread · {alerts.length} total
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#86868B] hover:bg-[#F5F5F7] hover:text-[#1D1D1F] transition-colors flex-shrink-0"
              >
                <X size={18} strokeWidth={2.4} />
              </button>
            </div>

            {/* Filters + actions */}
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[#F0F0F2] flex-shrink-0">
              <div className="flex gap-1.5">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'unread', label: 'Unread' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id as any)}
                    className={`rounded-lg px-3.5 py-1.5 text-[11.5px] font-semibold transition-colors ${
                      filter === f.id
                        ? 'bg-[#1D1D1F] text-white'
                        : 'bg-[#F5F5F7] text-[#6E6E73] hover:bg-[#EBEBED] hover:text-[#1D1D1F]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { markAllAsRead(); load() }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck size={14} strokeWidth={2.4} />
                </button>
                <button
                  onClick={() => { clearAllAlerts(); load() }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#86868B] hover:text-[#FF453A] hover:bg-[#FF453A]/10 transition-colors"
                  title="Clear all"
                >
                  <Trash2 size={14} strokeWidth={2.4} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#FBFBFD]">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-[#F0F0F2] mb-4">
                    <ShieldCheck size={28} className="text-[#AEAEB2]" strokeWidth={1.8} />
                  </div>
                  <div className="text-[14px] font-semibold text-[#1D1D1F] mb-1">All caught up</div>
                  <div className="text-[12px] text-[#86868B]">No alerts to show</div>
                </div>
              ) : (
                filtered.map((alert, i) => {
                  const color = getTypeColor(alert.type)
                  const Icon = getIcon(alert.type)
                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`group relative rounded-xl border p-3.5 cursor-pointer transition-all bg-white ${
                        alert.read
                          ? 'border-[#F0F0F2] hover:border-[#E5E5EA] hover:shadow-md'
                          : 'border-[#E5E5EA] shadow-sm hover:shadow-md'
                      }`}
                      onClick={() => handleClick(alert)}
                    >
                      {!alert.read && (
                        <span
                          className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full"
                          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                        />
                      )}
                      <div className="flex items-start gap-3">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0"
                          style={{ background: `${color}15`, border: `1px solid ${color}30` }}
                        >
                          <Icon size={15} style={{ color }} strokeWidth={2.2} />
                        </div>
                        <div className="flex-1 min-w-0 pr-6">
                          <div className={`text-[13.5px] font-semibold mb-1 ${alert.read ? 'text-[#6E6E73]' : 'text-[#1D1D1F]'}`}>
                            {alert.title}
                          </div>
                          <div className="text-[12px] text-[#86868B] leading-snug mb-2">
                            {alert.message}
                          </div>
                          <div className="flex items-center gap-2 text-[10.5px] text-[#AEAEB2]">
                            <span className="font-mono">{formatAlertTime(alert.timestamp)}</span>
                            <span>·</span>
                            <span className="uppercase tracking-wider font-bold" style={{ color }}>
                              {alert.source}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteAlert(alert.id); load() }}
                        className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex h-6 w-6 items-center justify-center rounded-md hover:bg-[#FF453A]/10 text-[#AEAEB2] hover:text-[#FF453A]"
                      >
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
