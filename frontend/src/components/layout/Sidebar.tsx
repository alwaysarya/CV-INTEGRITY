import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutGrid, Shield, Video, BarChart3, FileCheck2, Brain, Database,
  Link as LinkIcon, Settings, HelpCircle, LogOut, Download,
  Activity, Fingerprint, TrendingUp, Bug, Scan, Eye, FileCode,
  Wallet, Box, Zap, Target
} from 'lucide-react'

interface SidebarSection {
  title: string
  items: { label: string; path: string; icon: any }[]
}

// Contextual sidebar per top menu
function getSidebar(location: string): SidebarSection[] {
  // Dashboard
  if (location === '/' || location.startsWith('/trust') || location.startsWith('/performance')) {
    return [
      {
        title: 'Overview',
        items: [
          { label: 'Vision Assurance', path: '/', icon: LayoutGrid },
          { label: 'Trust Matrix', path: '/trust', icon: Shield },
          { label: 'Performance', path: '/performance', icon: Activity },
        ],
      },
      {
        title: 'Actions',
        items: [
          { label: 'Upload Data', path: '/upload', icon: Download },
          { label: 'Team', path: '/team', icon: Eye },
        ],
      },
    ]
  }

  // Vision
  if (location.startsWith('/video') || location.startsWith('/xai') || location.startsWith('/drift')) {
    return [
      {
        title: 'Live Vision',
        items: [
          { label: 'Live Feed', path: '/video', icon: Video },
          { label: 'XAI', path: '/xai', icon: Fingerprint },
          { label: 'Drift Monitor', path: '/drift', icon: TrendingUp },
        ],
      },
    ]
  }

  // Threats
  if (location.startsWith('/attacks') || location.startsWith('/cyber') || location.startsWith('/backdoor') || location.startsWith('/tamper')) {
    return [
      {
        title: 'Threats',
        items: [
          { label: 'Attack Catalog', path: '/attacks', icon: Shield },
          { label: 'Cyber Command', path: '/cybersecurity', icon: Target },
          { label: 'Attack Simulator', path: '/cyber-attack', icon: Zap },
          { label: 'Backdoor Scanner', path: '/backdoor', icon: Bug },
          { label: 'Tamper Detection', path: '/tamper', icon: Fingerprint },
        ],
      },
    ]
  }

  // Models
  if (location.startsWith('/models') || location.startsWith('/model-') || location.startsWith('/robustness') || location.startsWith('/provenance')) {
    return [
      {
        title: 'Models',
        items: [
          { label: 'Registry', path: '/models', icon: Brain },
          { label: 'Model Registry', path: '/model-registry', icon: Fingerprint },
          { label: 'Integrity', path: '/model-integrity', icon: Shield },
          { label: 'Robustness', path: '/robustness', icon: Target },
          { label: 'Provenance', path: '/provenance', icon: Eye },
        ],
      },
    ]
  }

  // Datasets
  if (location.startsWith('/datasets') || location.startsWith('/dataset-analysis') || location.startsWith('/audit')) {
    return [
      {
        title: 'Datasets',
        items: [
          { label: 'All Datasets', path: '/datasets', icon: Database },
          { label: 'Analysis', path: '/dataset-analysis', icon: Scan },
          { label: 'Audit Trail', path: '/audit', icon: FileCheck2 },
        ],
      },
    ]
  }

  // Blockchain
  if (location.startsWith('/blockchain') || location.startsWith('/wallets') || location.startsWith('/contracts')) {
    return [
      {
        title: 'Ledger',
        items: [
          { label: 'Blocks', path: '/blockchain', icon: Box },
          { label: 'Wallets', path: '/wallets', icon: Wallet },
          { label: 'Contracts', path: '/contracts', icon: FileCode },
          { label: 'Engine', path: '/contracts-engine', icon: Zap },
        ],
      },
    ]
  }

  // Analytics
  if (location.startsWith('/analytics')) {
    return [
      {
        title: 'Analytics',
        items: [
          { label: 'Metrics', path: '/analytics', icon: BarChart3 },
          { label: 'Reports', path: '/reports', icon: FileCheck2 },
          { label: 'Assurance', path: '/assurance', icon: Shield },
        ],
      },
    ]
  }

  // Reports
  if (location.startsWith('/reports') || location.startsWith('/assurance')) {
    return [
      {
        title: 'Reports',
        items: [
          { label: 'All Reports', path: '/reports', icon: FileCheck2 },
          { label: 'Assurance', path: '/assurance', icon: Shield },
        ],
      },
    ]
  }

  // Default
  return [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', path: '/', icon: LayoutGrid },
        { label: 'Vision', path: '/video', icon: Video },
        { label: 'Threats', path: '/attacks', icon: Shield },
      ],
    },
  ]
}

export function Sidebar() {
  const location = useLocation()
  const sections = getSidebar(location.pathname)

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <aside className="flex w-[240px] shrink-0 flex-col border-r border-slate-200 bg-white">
      {/* Sidebar content */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {sections.map((section) => (
          <div key={section.title} className="mb-4">
            <div className="px-3 pb-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {section.title}
              </span>
            </div>

            <nav className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.path)
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-all duration-150 ${
                      active
                        ? 'bg-emerald-50 text-emerald-900'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-emerald-700"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon
                      size={17}
                      className={active ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'}
                      strokeWidth={2}
                    />
                    <span className="flex-1">{item.label}</span>
                  </NavLink>
                )
              })}
            </nav>
          </div>
        ))}

        {/* GENERAL section */}
        <div className="mt-6">
          <div className="px-3 pb-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              General
            </span>
          </div>

          <nav className="space-y-0.5">
            <NavLink
              to="/settings"
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-all duration-150 ${
                isActive('/settings')
                  ? 'bg-emerald-50 text-emerald-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Settings size={17} className={isActive('/settings') ? 'text-emerald-700' : 'text-slate-400'} strokeWidth={2} />
              <span className="flex-1">Settings</span>
            </NavLink>

            <NavLink
              to="/help"
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-all duration-150 ${
                isActive('/help')
                  ? 'bg-emerald-50 text-emerald-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <HelpCircle size={17} className={isActive('/help') ? 'text-emerald-700' : 'text-slate-400'} strokeWidth={2} />
              <span className="flex-1">Help</span>
            </NavLink>

            <button
              type="button"
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium text-slate-600 transition-all duration-150 hover:bg-slate-50 hover:text-slate-900"
            >
              <LogOut size={17} className="text-slate-400 group-hover:text-slate-600" strokeWidth={2} />
              <span className="flex-1 text-left">Logout</span>
            </button>
          </nav>
        </div>
      </div>
    </aside>
  )
}
