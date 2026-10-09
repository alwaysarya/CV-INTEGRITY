import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutGrid, Shield, Video, BarChart3, FileCheck2,
  Settings, HelpCircle, LogOut, Download
} from 'lucide-react'

interface NavItem {
  label: string
  path: string
  icon: any
  badge?: string
}

const workspaceItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutGrid },
  { label: 'Threats', path: '/attacks', icon: Shield, badge: '12+' },
  { label: 'Live Vision', path: '/video', icon: Video },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Compliance', path: '/security-governance', icon: FileCheck2 },
]

const generalItems: NavItem[] = [
  { label: 'Settings', path: '/settings', icon: Settings },
  { label: 'Help', path: '/help', icon: HelpCircle },
]

export function Sidebar() {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <aside className="flex w-[240px] shrink-0 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>
        <div>
          <div className="text-[15px] font-bold tracking-tight text-slate-900">CV-INTEGRITY</div>
          <div className="text-[9px] font-medium tracking-wider text-slate-400">VISION ASSURANCE</div>
        </div>
      </div>

      {/* MENU section */}
      <div className="flex-1 overflow-y-auto px-3">
        <div className="px-3 pb-2 pt-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Menu
          </span>
        </div>

        <nav className="space-y-0.5">
          {workspaceItems.map((item) => {
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
                  size={18}
                  className={active ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'}
                  strokeWidth={2}
                />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* GENERAL section */}
        <div className="px-3 pb-2 pt-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            General
          </span>
        </div>

        <nav className="space-y-0.5">
          {generalItems.map((item) => {
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
                    layoutId="sidebar-active-general"
                    className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-emerald-700"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon
                  size={18}
                  className={active ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'}
                  strokeWidth={2}
                />
                <span className="flex-1">{item.label}</span>
              </NavLink>
            )
          })}

          {/* Logout */}
          <button
            type="button"
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium text-slate-600 transition-all duration-150 hover:bg-slate-50 hover:text-slate-900"
          >
            <LogOut size={18} className="text-slate-400 group-hover:text-slate-600" strokeWidth={2} />
            <span className="flex-1 text-left">Logout</span>
          </button>
        </nav>
      </div>

      {/* Bottom promo card */}
      <div className="p-3">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950 p-4">
          {/* Decorative curves */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-500/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-8 h-24 w-24 rounded-full bg-emerald-700/30 blur-2xl" />

          <div className="relative">
            <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
              <Download size={13} className="text-white" />
            </div>
            <div className="text-[12px] font-semibold text-white">Download our Desktop App</div>
            <div className="mt-1 text-[10px] leading-relaxed text-white/55">
              Get real-time alerts on your desktop
            </div>
            <button className="mt-3 w-full rounded-lg bg-emerald-600 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-500">
              Download
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
