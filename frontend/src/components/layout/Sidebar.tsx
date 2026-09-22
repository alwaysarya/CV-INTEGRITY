import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Database, Brain, Shield, BarChart3,
  Video, Users, Settings, Link as LinkIcon, Wallet,
  FileText, AlertTriangle, Activity, Lock, Cpu,
  TrendingUp, Zap, Eye, Search, Menu
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  label: string
  path: string
  icon: any
  group?: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, group: 'main' },
  { label: 'Datasets', path: '/datasets', icon: Database, group: 'data' },
  { label: 'Models', path: '/models', icon: Brain, group: 'data' },
  { label: 'Trust Scores', path: '/trust', icon: Shield, group: 'data' },
  { label: 'Analytics', path: '/analytics', icon: BarChart3, group: 'data' },
  { label: 'Blockchain', path: '/blockchain', icon: LinkIcon, group: 'security' },
  { label: 'Cybersecurity', path: '/cybersecurity', icon: Lock, group: 'security' },
  { label: 'Attack Simulator', path: '/attacks', icon: AlertTriangle, group: 'security' },
  { label: 'Tamper Detection', path: '/tamper', icon: Eye, group: 'security' },
  { label: 'XAI', path: '/xai', icon: Activity, group: 'ai' },
  { label: 'Video Analysis', path: '/video', icon: Video, group: 'ai' },
  { label: 'Drift Monitor', path: '/drift', icon: TrendingUp, group: 'ai' },
  { label: 'Robustness', path: '/robustness', icon: Zap, group: 'ai' },
  { label: 'Performance', path: '/performance', icon: Cpu, group: 'ai' },
  { label: 'Wallets', path: '/wallets', icon: Wallet, group: 'blockchain' },
  { label: 'Reports', path: '/reports', icon: FileText, group: 'team' },
  { label: 'Team', path: '/team', icon: Users, group: 'team' },
  { label: 'Settings', path: '/settings', icon: Settings, group: 'team' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  return (
    <aside
      className={`flex flex-col border-r border-cyan-500/10 bg-[#0A0E1A]/95 backdrop-blur-2xl transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-cyan-500/10">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
          <span className="text-lg">🧠</span>
        </div>
        {!collapsed && (
          <div className="flex-1">
            <div className="text-white font-bold text-sm leading-tight">CV-INTEGRITY</div>
            <div className="text-gray-500 text-[10px] tracking-wider">AI TRUST PLATFORM</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:text-white transition-colors"
        >
          <Menu size={16} />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-cyan-400' : ''} />
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom Badge */}
      {!collapsed && (
        <div className="p-4 border-t border-cyan-500/10">
          <div className="text-[10px] text-gray-600 tracking-wider text-center">
            SIH-1 · QUANTUM-EYE v1.0
          </div>
        </div>
      )}
    </aside>
  )
}
