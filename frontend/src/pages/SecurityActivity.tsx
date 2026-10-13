import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Activity, AlertTriangle, Check, X, MapPin, Globe,
  ArrowLeft, Loader2, Lock, Key, LogOut, LogIn, Zap, RefreshCw
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  getAllEvents, generateRandomEvent, getTypeLabel, getEventColor,
  formatRelativeTime, type SecurityEvent, type EventType
} from '@/lib/securityEvents'

// Simple world map SVG — flat projection
const WORLD_MAP_PATH = "M 80 120 Q 100 100 130 110 L 160 100 L 200 110 Q 230 130 250 120 L 290 130 L 320 150 Q 340 170 350 160 L 380 180 L 420 190 Q 450 200 470 180 L 500 170 L 530 190 L 560 180 Q 580 200 600 210 L 630 220 L 660 240 L 680 260 Q 700 250 720 240 L 740 260 L 760 280 L 780 260 L 800 250 L 820 270 L 840 290 Q 850 310 860 320 L 880 300 L 900 310 L 920 330 L 940 320 L 960 340 L 980 350 L 1000 340 L 1020 350 L 1040 380 L 1060 400 L 1080 420 L 1100 440 Q 1120 450 1140 430 L 1160 440 L 1180 460 L 1200 450 L 1220 470 L 1240 490 L 1260 480 L 1280 500 L 1300 490 L 1320 510 L 1340 500"

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="relative overflow-hidden rounded-2xl bg-white border border-black/[0.04] p-5"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
    >
      <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl opacity-15" style={{ background: color }} />
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl mb-3" style={{ background: `${color}15` }}>
        <Icon size={15} style={{ color }} strokeWidth={2.2} />
      </div>
      <div className="relative text-[11px] font-bold tracking-[0.14em] uppercase text-[#86868B] mb-1.5">{label}</div>
      <div className="relative text-[28px] font-semibold tabular-nums tracking-[-0.03em]" style={{ color }}>
        {value}
      </div>
    </motion.div>
  )
}

export function SecurityActivity() {
  const navigate = useNavigate()
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [live, setLive] = useState(true)
  const [filter, setFilter] = useState<'all' | 'login' | 'failed' | 'critical'>('all')
  const feedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setEvents(getAllEvents().sort((a, b) => b.timestamp - a.timestamp))
  }, [])

  useEffect(() => {
    if (!live) return
    const iv = setInterval(() => {
      generateRandomEvent()
      setEvents(getAllEvents().sort((a, b) => b.timestamp - a.timestamp))
    }, 5000)
    return () => clearInterval(iv)
  }, [live])

  const filtered = events.filter(e => {
    if (filter === 'all') return true
    if (filter === 'login') return e.type === 'login' || e.type === 'logout'
    if (filter === 'failed') return e.type === 'failed'
    if (filter === 'critical') return e.severity === 'critical'
    return true
  })

  const total = events.length
  const successCount = events.filter(e => e.severity === 'success').length
  const warningCount = events.filter(e => e.severity === 'warning').length
  const criticalCount = events.filter(e => e.severity === 'critical').length
  const locationsOnMap = events.slice(0, 20)

  return (
    <div className="min-h-screen bg-black p-6" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>

      <div className="mx-auto max-w-[1400px] flex items-start justify-between gap-4 pb-6">
        <div>
          <button onClick={() => navigate('/settings')} className="flex items-center gap-1.5 text-[12px] font-medium text-white/40 hover:text-white transition-colors mb-3">
            <ArrowLeft size={13} strokeWidth={2.2} /> Back to Settings
          </button>
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #0071E3, #5E5CE6)', boxShadow: '0 0 40px #0071E380' }}>
              <Activity size={20} className="text-white" strokeWidth={2.2} />
              <motion.div className="absolute inset-0 rounded-2xl"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ background: '#0071E340' }} />
            </div>
            <div>
              <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-white">Security Activity</h1>
              <p className="text-[13px] text-white/40">Real-time authentication and security events</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setLive(!live)}
            className={`flex h-10 items-center gap-2 rounded-xl px-4 text-[13px] font-semibold transition-all ${
              live ? 'bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/30' : 'bg-white/[0.06] text-white/60 border border-white/10'
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-[#30D158] animate-pulse' : 'bg-white/40'}`} />
            {live ? 'Live' : 'Paused'}
          </button>
          <button onClick={() => setEvents(getAllEvents().sort((a, b) => b.timestamp - a.timestamp))}
            className="flex h-10 items-center gap-2 rounded-xl bg-white/[0.06] border border-white/10 px-4 text-[13px] font-medium text-white/70 hover:bg-white/[0.1] transition-colors">
            <RefreshCw size={13} strokeWidth={2.4} /> Refresh
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Activity} label="Total Events" value={total} color="#5AC8FA" />
        <StatCard icon={Check} label="Successful" value={successCount} color="#30D158" />
        <StatCard icon={AlertTriangle} label="Warnings" value={warningCount} color="#FF9F0A" />
        <StatCard icon={Lock} label="Critical" value={criticalCount} color="#FF453A" />
      </div>

      <div className="mx-auto max-w-[1400px] grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">

        <div className="relative rounded-3xl bg-[#0A0A0F] border border-white/[0.08] overflow-hidden"
          style={{ boxShadow: '0 30px 80px -20px rgba(0,0,0,0.6)' }}>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0071E3] to-transparent" />

          <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#5AC8FA] mb-1">Global Activity Map</div>
              <div className="text-[14px] text-white/60">{locationsOnMap.length} locations · last {events.length} events</div>
            </div>
            <Globe size={20} className="text-white/30" strokeWidth={1.8} />
          </div>

          <div className="relative aspect-[16/9] p-4">
            <svg viewBox="0 0 1400 600" className="absolute inset-0 w-full h-full opacity-15">
              <defs>
                <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="1.5" fill="#5AC8FA" />
                </pattern>
              </defs>
              <rect width="1400" height="600" fill="url(#dots)" />
            </svg>

            <svg viewBox="0 0 1400 600" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
              {locationsOnMap.slice(0, 8).map((event, i) => {
                const x = ((event.lng + 180) / 360) * 1400
                const y = ((90 - event.lat) / 180) * 600
                const color = getEventColor(event.type)
                return (
                  <motion.line key={event.id}
                    x1={700} y1={300} x2={x} y2={y}
                    stroke={color} strokeWidth="1" strokeDasharray="4 6" opacity="0.4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: [0, 1, 1, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: i * 0.3 }}
                  />
                )
              })}
            </svg>

            <svg viewBox="0 0 1400 600" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
              {locationsOnMap.map((event, i) => {
                const x = ((event.lng + 180) / 360) * 1400
                const y = ((90 - event.lat) / 180) * 600
                const color = getEventColor(event.type)
                return (
                  <g key={`dot-${event.id}`}>
                    <motion.circle cx={x} cy={y} r="8" fill={color} opacity="0.3"
                      animate={{ r: [8, 20, 8], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.2 }} />
                    <circle cx={x} cy={y} r="5" fill={color} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
                  </g>
                )
              })}
              <motion.circle cx="700" cy="300" r="6" fill="#30D158"
                animate={{ r: [6, 14, 6], opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ filter: 'drop-shadow(0 0 12px #30D158)' }} />
            </svg>

            <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-3 px-3 py-2 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10">
              {[
                { label: 'Success', color: '#30D158' },
                { label: 'Failed', color: '#FF9F0A' },
                { label: 'Critical', color: '#FF453A' },
                { label: 'Session', color: '#5E5CE6' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-white/60">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative rounded-3xl bg-[#0A0A0F] border border-white/[0.08] overflow-hidden flex flex-col"
          style={{ boxShadow: '0 30px 80px -20px rgba(0,0,0,0.6)', maxHeight: 'calc(100vh - 120px)' }}>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#AF52DE] to-transparent" />

          <div className="p-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 mb-3">
              <motion.span className="w-2 h-2 rounded-full bg-[#FF453A]"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ boxShadow: '0 0 10px #FF453A' }} />
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-white/70">Live Feed</span>
            </div>
            <div className="flex gap-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'login', label: 'Auth' },
                { id: 'failed', label: 'Failed' },
                { id: 'critical', label: 'Critical' },
              ].map(f => (
                <button key={f.id} onClick={() => setFilter(f.id as any)}
                  className={`flex-1 rounded-lg py-1.5 text-[11px] font-semibold transition-colors ${
                    filter === f.id ? 'bg-white text-black' : 'bg-white/[0.06] text-white/60 hover:bg-white/[0.1]'
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div ref={feedRef} className="flex-1 overflow-y-auto p-3 space-y-2">
            <AnimatePresence initial={false}>
              {filtered.slice(0, 30).map((event) => {
                const color = getEventColor(event.type)
                const Icon = event.type === 'login' ? LogIn
                  : event.type === 'logout' ? LogOut
                  : event.type === 'failed' ? X
                  : event.type === 'lockout' ? Lock
                  : event.type === 'session_revoke' ? LogOut
                  : event.type === 'api_key_created' ? Key
                  : Activity
                return (
                  <motion.div key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] transition-colors">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
                      style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                      <Icon size={13} style={{ color }} strokeWidth={2.4} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[12px] font-semibold text-white truncate">{getTypeLabel(event.type)}</span>
                        <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded"
                          style={{ background: `${color}15`, color }}>{event.severity}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-white/40 truncate">
                        <span className="font-medium text-white/60">@{event.username}</span>
                        <span>·</span>
                        <MapPin size={9} strokeWidth={2.2} />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-white/30 mt-0.5">
                        <span className="font-mono">{event.ip}</span>
                        <span>·</span>
                        <span>{formatRelativeTime(event.timestamp)}</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-white/30 text-[13px]">No events match this filter</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SecurityActivity
