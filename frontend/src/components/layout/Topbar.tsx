import { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Search, Bell, Settings, ChevronDown, Shield, LogOut, User, ShieldCheck,
  Video, Eye, Activity, Target, AlertTriangle, Lock, Scan, Zap, Cpu, Brain,
  Database, Upload, FileSearch, Box, Wallet, FileCode, ClipboardCheck,
  BarChart3, TrendingUp, FileText, CheckCircle, Users, HelpCircle, Layers
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { clearAllSessions } from '@/lib/sessions'
import { AlertsPanel } from '@/components/alerts/AlertsPanel'
import { getUnreadCount } from '@/lib/alerts'

const topMenu = [
  {
    label: 'Dashboard',
    path: '/',
    matchPaths: ['/'],
    items: null,
  },
  {
    label: 'Vision',
    path: '/video',
    matchPaths: ['/video', '/xai', '/drift', '/robustness'],
    items: [
      { label: 'Live Vision', desc: 'Real-time detection', path: '/video', icon: Video, color: '#2DD4BF' },
      { label: 'Explainability', desc: 'Grad-CAM, SHAP', path: '/xai', icon: Eye, color: '#AF52DE' },
      { label: 'Drift Monitor', desc: 'Distribution shifts', path: '/drift', icon: Activity, color: '#FF9F0A' },
      { label: 'Robustness', desc: 'Adversarial testing', path: '/robustness', icon: Target, color: '#FF453A' },
    ],
  },
  {
    label: 'Threats',
    path: '/attacks',
    matchPaths: ['/attacks', '/cybersecurity', '/cyber-attack', '/backdoor', '/tamper'],
    items: [
      { label: 'Attack Catalog', desc: 'Threat patterns', path: '/attacks', icon: AlertTriangle, color: '#FF453A' },
      { label: 'Cybersecurity', desc: 'Command center', path: '/cybersecurity', icon: Shield, color: '#0071E3' },
      { label: 'Cyber Attack', desc: 'Attack simulation', path: '/cyber-attack', icon: Zap, color: '#FF9F0A' },
      { label: 'Tamper Detection', desc: 'Integrity breaks', path: '/tamper', icon: Scan, color: '#AF52DE' },
      { label: 'Backdoor Detection', desc: 'Trigger scans', path: '/backdoor', icon: Lock, color: '#FF453A' },
    ],
  },
  {
    label: 'Models',
    path: '/models',
    matchPaths: ['/models', '/model-registry', '/model-integrity', '/provenance', '/performance'],
    items: [
      { label: 'Model Registry', desc: 'All registered models', path: '/models', icon: Brain, color: '#0071E3' },
      { label: 'Model Integrity', desc: 'Signature verification', path: '/model-integrity', icon: CheckCircle, color: '#30D158' },
      { label: 'Provenance', desc: 'Lineage chain', path: '/provenance', icon: Layers, color: '#AF52DE' },
      { label: 'Performance', desc: 'Metrics & benchmarks', path: '/performance', icon: TrendingUp, color: '#2DD4BF' },
    ],
  },
  {
    label: 'Datasets',
    path: '/datasets',
    matchPaths: ['/datasets', '/dataset-analysis', '/upload'],
    items: [
      { label: 'Datasets', desc: 'Catalog & scores', path: '/datasets', icon: Database, color: '#0071E3' },
      { label: 'Dataset Analysis', desc: 'Deep inspection', path: '/dataset-analysis', icon: FileSearch, color: '#AF52DE' },
      { label: 'Upload', desc: 'Add new dataset', path: '/upload', icon: Upload, color: '#30D158' },
    ],
  },
  {
    label: 'Blockchain',
    path: '/blockchain',
    matchPaths: ['/blockchain', '/wallets', '/contracts', '/contracts-engine', '/audit'],
    items: [
      { label: 'Ledger', desc: 'Block explorer', path: '/blockchain', icon: Box, color: '#30D158' },
      { label: 'Wallets', desc: 'Key management', path: '/wallets', icon: Wallet, color: '#FF9F0A' },
      { label: 'Contracts', desc: 'Smart contracts', path: '/contracts', icon: FileCode, color: '#AF52DE' },
      { label: 'Audit Trail', desc: 'Verification logs', path: '/audit', icon: ClipboardCheck, color: '#0071E3' },
    ],
  },
  {
    label: 'Analytics',
    path: '/analytics',
    matchPaths: ['/analytics', '/trust'],
    items: [
      { label: 'Analytics', desc: 'Metrics & charts', path: '/analytics', icon: BarChart3, color: '#2DD4BF' },
      { label: 'Trust Matrix', desc: 'Entity scoring', path: '/trust', icon: ShieldCheck, color: '#0071E3' },
    ],
  },
  {
    label: 'Reports',
    path: '/reports',
    matchPaths: ['/reports', '/assurance'],
    items: [
      { label: 'Reports', desc: 'Evidence library', path: '/reports', icon: FileText, color: '#2DD4BF' },
      { label: 'Assurance Report', desc: 'Full pipeline', path: '/assurance', icon: CheckCircle, color: '#30D158' },
    ],
  },
]

const settingsMenu = [
  { label: 'Settings', path: '/settings', icon: Settings },
  { label: 'Team', path: '/team', icon: Users },
  { label: 'Security Governance', path: '/security-governance', icon: ShieldCheck },
  { label: 'Help', path: '/help', icon: HelpCircle },
]

export function Topbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState<{ username?: string; name?: string; role?: string } | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null)
  const [alertsOpen, setAlertsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)
  const hoverTimeout = useRef<any>(null)

  useEffect(() => {
    setUnreadCount(getUnreadCount())
    const onUpdate = () => setUnreadCount(getUnreadCount())
    window.addEventListener('cv_alerts_updated', onUpdate)
    return () => window.removeEventListener('cv_alerts_updated', onUpdate)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('cv_integrity_user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch { setUser(null) }
    }
  }, [])

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const openCommandPalette = () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
  }

  const isActive = (item: any) => {
    const paths = item.matchPaths || [item.path]
    return paths.some((p: string) => {
      if (p === '/') return location.pathname === '/'
      return location.pathname === p || location.pathname.startsWith(p + '/')
    })
  }

  const handleLogout = () => {
    clearAllSessions()
    localStorage.removeItem('cv_integrity_user')
    localStorage.removeItem('cv_integrity_token')
    localStorage.removeItem('cv_integrity_remember')
    navigate('/login')
  }

  const handleMouseEnter = (label: string) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
    setHoveredMenu(label)
  }

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setHoveredMenu(null)
    }, 150)
  }

  const displayName = user?.name || user?.username || 'User'
  const initials = displayName.split(' ').map((s: string) => s[0]).join('').slice(0, 2).toUpperCase()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[56px] max-w-[1600px] items-center gap-8 px-8">
        {/* Logo */}
        <NavLink to="/" className="flex shrink-0 items-center gap-2">
          <Shield size={18} className="text-emerald-700" strokeWidth={2.2} />
          <span className="text-[13px] font-semibold tracking-tight text-slate-900">
            CV-INTEGRITY
          </span>
        </NavLink>

        {/* Top Menu with dropdowns */}
        <nav className="flex flex-1 items-center justify-center gap-0.5">
          {topMenu.map((item) => {
            const active = isActive(item)
            const hasItems = item.items && item.items.length > 0
            const isHovered = hoveredMenu === item.label

            return (
              <div
                key={item.path}
                className="relative"
                onMouseEnter={() => hasItems && handleMouseEnter(item.label)}
                onMouseLeave={handleMouseLeave}
              >
                <NavLink
                  to={item.path}
                  className={`flex items-center gap-1 whitespace-nowrap rounded-md px-3.5 py-2 text-[12.5px] font-medium transition-colors ${
                    active
                      ? 'text-emerald-700'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                  {hasItems && (
                    <ChevronDown
                      size={11}
                      className={`transition-transform duration-200 ${isHovered ? 'rotate-180' : ''}`}
                    />
                  )}
                </NavLink>

                {/* Dropdown */}
                {hasItems && isHovered && (
                  <div
                    className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50"
                    style={{ minWidth: '280px' }}
                  >
                    <div
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-xl"
                      style={{ boxShadow: '0 20px 60px -15px rgba(0,0,0,0.15), 0 4px 20px -4px rgba(0,0,0,0.08)' }}
                    >
                      <div className="p-2">
                        {item.items!.map((sub) => {
                          const Icon = sub.icon
                          const subActive = location.pathname === sub.path
                          return (
                            <NavLink
                              key={sub.path}
                              to={sub.path}
                              onClick={() => setHoveredMenu(null)}
                              className={`group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                                subActive ? 'bg-emerald-50' : 'hover:bg-slate-50'
                              }`}
                            >
                              <div
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5"
                                style={{ background: `${sub.color}15` }}
                              >
                                <Icon size={14} style={{ color: sub.color }} strokeWidth={2.2} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className={`text-[13px] font-semibold tracking-tight ${subActive ? 'text-emerald-700' : 'text-slate-900'}`}>
                                  {sub.label}
                                </div>
                                <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                                  {sub.desc}
                                </div>
                              </div>
                            </NavLink>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Utility */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={openCommandPalette}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <Search size={15} />
          </button>
          <button
            onClick={() => setAlertsOpen(true)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#FF453A] text-[9px] font-bold text-white px-1 shadow-md"
                style={{ boxShadow: '0 0 8px #FF453A80' }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Settings dropdown */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setSettingsOpen((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <Settings size={15} />
            </button>

            {settingsOpen && (
              <div
                className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white"
                style={{ boxShadow: '0 20px 40px -12px rgba(0,0,0,0.15)' }}
              >
                <div className="p-1.5">
                  {settingsMenu.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.path}
                        onClick={() => { setSettingsOpen(false); navigate(item.path) }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <Icon size={14} className="text-slate-500" strokeWidth={2} />
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User dropdown */}
          <div className="relative ml-1" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white py-0.5 pl-0.5 pr-2.5 transition-colors hover:bg-slate-50"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800">
                <span className="text-[10px] font-bold text-white">{initials}</span>
              </div>
              <ChevronDown size={12} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                style={{ boxShadow: '0 20px 40px -12px rgba(0,0,0,0.15)' }}
              >
                <div className="border-b border-slate-100 px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800">
                      <span className="text-[12px] font-bold text-white">{initials}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-semibold text-slate-900">
                        {displayName}
                      </div>
                      <div className="truncate text-[11px] capitalize text-slate-500">
                        {user?.role || 'Analyst'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-1.5">
                  <button
                    onClick={() => { setDropdownOpen(false); navigate('/settings') }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <User size={14} className="text-slate-500" strokeWidth={2} />
                    Profile
                  </button>
                  <button
                    onClick={() => { setDropdownOpen(false); navigate('/settings') }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <Settings size={14} className="text-slate-500" strokeWidth={2} />
                    Settings
                  </button>
                  <button
                    onClick={() => { setDropdownOpen(false); navigate('/trust') }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <ShieldCheck size={14} className="text-slate-500" strokeWidth={2} />
                    Trust Center
                  </button>
                </div>

                <div className="border-t border-slate-100 p-1.5">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut size={14} strokeWidth={2} />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <AlertsPanel open={alertsOpen} onClose={() => setAlertsOpen(false)} />
    </header>
  )
}
