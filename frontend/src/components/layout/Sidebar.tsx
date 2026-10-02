import { NavLink, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, MapPin, Video, AlertTriangle, ShieldCheck, BarChart3, FileText,
  Settings, RotateCw, Database, Brain, Link as LinkIcon, Lock,
  Fingerprint, FileCode, Zap, Bug, Cpu, TrendingUp, Hash, Wallet,
  Activity, Eye
} from 'lucide-react'

interface SubItem { label: string; path: string; icon: any }
interface NavGroup { key: string; label: string; path: string; icon: any; items?: SubItem[] }

const navGroups: NavGroup[] = [
  { key: 'home', label: 'Home', path: '/', icon: Home },
  {
    key: 'monitoring', label: 'Live Monitoring', path: '/video', icon: Video,
    items: [
      { label: 'Live Video Feed', path: '/video', icon: Video },
      { label: 'Video Analysis', path: '/video', icon: Video },
    ],
  },
  {
    key: 'threats', label: 'Threats', path: '/attacks', icon: AlertTriangle,
    items: [
      { label: 'Attack Catalog', path: '/attacks', icon: AlertTriangle },
      { label: 'Cyber Command', path: '/cybersecurity', icon: Lock },
      { label: 'Live Cyber Simulator', path: '/cyber-attack', icon: Bug },
      { label: 'Backdoor Scanner', path: '/backdoor', icon: Bug },
    ],
  },
  {
    key: 'compliance', label: 'Compliance', path: '/security-governance', icon: ShieldCheck,
    items: [
      { label: 'Security Governance', path: '/security-governance', icon: ShieldCheck },
      { label: 'Trust Matrix', path: '/trust', icon: ShieldCheck },
      { label: 'Audit Trail', path: '/audit', icon: FileText },
      { label: 'Assurance & Standards', path: '/assurance', icon: FileText },
    ],
  },
  {
    key: 'models', label: 'Models', path: '/models', icon: Brain,
    items: [
      { label: 'Models', path: '/models', icon: Brain },
      { label: 'Model Registry', path: '/model-registry', icon: Hash },
      { label: 'Model Integrity', path: '/model-integrity', icon: Fingerprint },
      { label: 'Explainable AI', path: '/xai', icon: Activity },
      { label: 'Drift Detection', path: '/drift', icon: TrendingUp },
      { label: 'Adversarial Robustness', path: '/robustness', icon: Zap },
      { label: 'Performance', path: '/performance', icon: Cpu },
      { label: 'Provenance', path: '/provenance', icon: Eye },
    ],
  },
  {
    key: 'data', label: 'Data & Blockchain', path: '/datasets', icon: Database,
    items: [
      { label: 'Datasets', path: '/datasets', icon: Database },
      { label: 'Dataset Analysis', path: '/dataset-analysis', icon: Database },
      { label: 'Blockchain', path: '/blockchain', icon: LinkIcon },
      { label: 'Smart Contracts', path: '/contracts', icon: FileCode },
      { label: 'Contracts Engine', path: '/contracts-engine', icon: Zap },
      { label: 'Wallets', path: '/wallets', icon: Wallet },
    ],
  },
  { key: 'analytics', label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { key: 'reports', label: 'Reports', path: '/reports', icon: FileText },
]

export function Sidebar() {
  const location = useLocation()
  const [hovered, setHovered] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => { if (closeTimer.current) clearTimeout(closeTimer.current) }
  }, [])

  const cancelClose = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null }
  }

  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => {
      setHovered(null)
      closeTimer.current = null
    }, 250)
  }

  const openMenu = (key: string) => {
    cancelClose()
    setHovered(key)
  }

  const isGroupActive = (group: NavGroup) => {
    if (location.pathname === group.path) return true
    if (group.items) return group.items.some((i) => location.pathname === i.path)
    return false
  }

  return (
    <aside className="flex flex-col items-center py-5 gap-2 w-[72px] shrink-0 relative z-30"
      style={{ background: '#08080C', borderRight: '1px solid rgba(94, 234, 212, 0.1)' }}>

      {/* Logo */}
      <div className="w-10 h-10 rounded flex items-center justify-center mb-4"
        style={{ background: 'rgba(94, 234, 212, 0.1)', border: '1px solid rgba(94, 234, 212, 0.4)' }}>
        <span className="font-black text-[14px] tracking-tight" style={{ color: '#5EEAD4' }}>CV</span>
      </div>

      {navGroups.map((group) => {
        const Icon = group.icon
        const active = isGroupActive(group)
        const hasItems = group.items && group.items.length > 0
        const isOpen = hovered === group.key

        return (
          <div
            key={group.key}
            className="relative"
            onMouseEnter={() => hasItems && openMenu(group.key)}
            onMouseLeave={() => hasItems && scheduleClose()}>

            <NavLink
              to={group.path}
              title={group.label}
              className="w-11 h-11 rounded flex items-center justify-center relative group-icon"
              style={{
                background: active ? 'rgba(94, 234, 212, 0.18)' : 'transparent',
                border: active ? '1px solid rgba(94, 234, 212, 0.6)' : '1px solid transparent',
                color: '#5EEAD4',
                opacity: active ? 1 : 0.45,
                boxShadow: active ? '0 0 16px rgba(94, 234, 212, 0.25), inset 0 0 8px rgba(94, 234, 212, 0.08)' : 'none',
                transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.opacity = '0.85'
                  e.currentTarget.style.background = 'rgba(94, 234, 212, 0.08)'
                  e.currentTarget.style.borderColor = 'rgba(94, 234, 212, 0.3)'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.opacity = '0.45'
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'transparent'
                }
              }}>
              <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
              {hasItems && (
                <span className="absolute bottom-1 right-1 w-1 h-1 rounded-full"
                  style={{
                    background: active ? '#5EEAD4' : 'rgba(94, 234, 212, 0.3)',
                    boxShadow: active ? '0 0 6px #5EEAD4' : 'none',
                    transition: 'all 300ms ease',
                  }} />
              )}
            </NavLink>

            <AnimatePresence>
              {hasItems && isOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute left-full top-0 z-50"
                  style={{ paddingLeft: '2px' }}
                  onMouseEnter={cancelClose}
                  onMouseLeave={scheduleClose}>
                  <div className="min-w-[240px] rounded overflow-hidden"
                    style={{
                      background: '#0A0F14',
                      border: '1px solid rgba(94, 234, 212, 0.3)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 24px rgba(94, 234, 212, 0.08)',
                    }}>
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.15)' }}>
                      <div className="text-[10px] font-mono tracking-[0.2em] font-bold" style={{ color: '#5EEAD4' }}>
                        {group.label.toUpperCase()}
                      </div>
                    </div>
                    <div className="py-1.5">
                      {group.items!.map((item) => {
                        const ItemIcon = item.icon
                        const itemActive = location.pathname === item.path
                        return (
                          <NavLink
                            key={item.path + item.label}
                            to={item.path}
                            onMouseEnter={cancelClose}
                            className="relative flex items-center gap-3 px-4 py-2.5"
                            style={{
                              background: itemActive ? 'rgba(94, 234, 212, 0.14)' : 'transparent',
                              transition: 'background 200ms ease, padding-left 200ms ease',
                            }}
                            onMouseOver={(e) => {
                              if (!itemActive) {
                                e.currentTarget.style.background = 'rgba(94, 234, 212, 0.06)'
                                e.currentTarget.style.paddingLeft = '20px'
                              }
                            }}
                            onMouseOut={(e) => {
                              if (!itemActive) {
                                e.currentTarget.style.background = 'transparent'
                                e.currentTarget.style.paddingLeft = '16px'
                              }
                            }}>
                            {/* Active left bar */}
                            {itemActive && (
                              <motion.span
                                layoutId="activeBar"
                                className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r"
                                style={{ background: '#5EEAD4', boxShadow: '0 0 8px #5EEAD4' }}
                              />
                            )}
                            <ItemIcon
                              size={13}
                              style={{
                                color: itemActive ? '#5EEAD4' : '#5EEAD4',
                                opacity: itemActive ? 1 : 0.5,
                                transition: 'opacity 200ms ease',
                                filter: itemActive ? 'drop-shadow(0 0 4px rgba(94, 234, 212, 0.6))' : 'none',
                              }} />
                            <span className="text-[11px] font-mono tracking-wider"
                              style={{
                                color: itemActive ? '#5EEAD4' : '#FFFFFF',
                                opacity: itemActive ? 1 : 0.75,
                                fontWeight: itemActive ? 700 : 400,
                                transition: 'all 200ms ease',
                              }}>
                              {item.label}
                            </span>
                            {itemActive && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="ml-auto w-1.5 h-1.5 rounded-full"
                                style={{ background: '#5EEAD4', boxShadow: '0 0 8px #5EEAD4' }}
                              />
                            )}
                          </NavLink>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}

      <div className="flex-1" />

      <button className="w-11 h-11 rounded flex items-center justify-center"
        style={{ color: '#5EEAD4', opacity: 0.4, transition: 'opacity 200ms ease' }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.4'}
        title="Refresh">
        <RotateCw size={18} strokeWidth={1.8} />
      </button>
      <NavLink to="/settings"
        className="w-11 h-11 rounded flex items-center justify-center"
        style={{
          background: location.pathname === '/settings' ? 'rgba(94, 234, 212, 0.15)' : 'transparent',
          border: location.pathname === '/settings' ? '1px solid rgba(94, 234, 212, 0.5)' : '1px solid transparent',
          color: '#5EEAD4',
          opacity: location.pathname === '/settings' ? 1 : 0.4,
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onMouseEnter={(e) => { if (location.pathname !== '/settings') e.currentTarget.style.opacity = '0.8' }}
        onMouseLeave={(e) => { if (location.pathname !== '/settings') e.currentTarget.style.opacity = '0.4' }}
        title="Settings">
        <Settings size={18} strokeWidth={1.8} />
      </NavLink>
    </aside>
  )
}
