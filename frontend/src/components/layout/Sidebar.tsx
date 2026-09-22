import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Database, Brain, Shield, BarChart3,
  Video, Users, Settings, Link as LinkIcon, Wallet,
  FileText, AlertTriangle, Activity, Lock, Cpu,
  TrendingUp, Zap, Eye, Menu, Fingerprint, Bug
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Datasets', path: '/datasets', icon: Database },
  { label: 'Models', path: '/models', icon: Brain },
  { label: 'Trust Scores', path: '/trust', icon: Shield },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Blockchain', path: '/blockchain', icon: LinkIcon },
  { label: 'Cybersecurity', path: '/cybersecurity', icon: Lock },
  { label: 'Attack Simulator', path: '/attacks', icon: AlertTriangle },
  { label: 'Tamper Detection', path: '/tamper', icon: Fingerprint },
  { label: 'XAI', path: '/xai', icon: Activity },
  { label: 'Video Analysis', path: '/video', icon: Video },
  { label: 'Drift Monitor', path: '/drift', icon: TrendingUp },
  { label: 'Robustness', path: '/robustness', icon: Zap },
  { label: 'Performance', path: '/performance', icon: Cpu },
  { label: 'Wallets', path: '/wallets', icon: Wallet },
  { label: 'Model Integrity', path: '/model-integrity', icon: Fingerprint },
  { label: 'Backdoor Detection', path: '/backdoor', icon: Bug },
  { label: 'Dataset Analysis', path: '/dataset-analysis', icon: Database },
  { label: 'Assurance Report', path: '/assurance', icon: FileText },
  { label: 'Reports', path: '/reports', icon: FileText },
  { label: 'Team', path: '/team', icon: Users },
  { label: 'Settings', path: '/settings', icon: Settings },
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
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 hover-scale">
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
          className="text-gray-500 hover:text-white transition-colors hover-scale"
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 hover:translate-x-0.5'
              }`}
            >
              <Icon size={18} className={`${isActive ? 'text-cyan-400' : 'group-hover:text-cyan-400'} transition-colors`} />
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
              )}
              {isActive && collapsed && (
                <span className="absolute right-1 w-1 h-6 rounded-full bg-cyan-400" />
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom Badge */}
      {!collapsed && (
        <div className="p-4 border-t border-cyan-500/10">
          <div className="text-[10px] text-gray-600 tracking-wider text-center hover:text-cyan-400 transition-colors">
            SIH-1 · QUANTUM-EYE v1.0
          </div>
        </div>
      )}
    </aside>
  )
}
