import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Database, Brain, Shield, BarChart3, Link as LinkIcon,
  Lock, AlertTriangle, Eye, Activity, Video, TrendingUp, Zap, Cpu,
  Wallet, FileText, Users, Settings, Search, ArrowRight
} from 'lucide-react'

const commands = [
  { group: 'Navigation', items: [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Datasets', path: '/datasets', icon: Database },
    { label: 'Models', path: '/models', icon: Brain },
    { label: 'Trust Scores', path: '/trust', icon: Shield },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Blockchain', path: '/blockchain', icon: LinkIcon },
    { label: 'Cybersecurity', path: '/cybersecurity', icon: Lock },
    { label: 'Attack Simulator', path: '/attacks', icon: AlertTriangle },
    { label: 'Tamper Detection', path: '/tamper', icon: Eye },
    { label: 'XAI', path: '/xai', icon: Activity },
    { label: 'Video Analysis', path: '/video', icon: Video },
    { label: 'Drift Monitor', path: '/drift', icon: TrendingUp },
    { label: 'Robustness', path: '/robustness', icon: Zap },
    { label: 'Performance', path: '/performance', icon: Cpu },
    { label: 'Wallets', path: '/wallets', icon: Wallet },
    { label: 'Reports', path: '/reports', icon: FileText },
    { label: 'Team', path: '/team', icon: Users },
    { label: 'Settings', path: '/settings', icon: Settings },
  ]},
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = (path: string) => {
    setOpen(false)
    setSearch('')
    navigate(path)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="command-palette"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl liquid-glass specular"
            style={{ overflow: 'hidden' }}
          >
            <Command shouldFilter={true} className="bg-transparent">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-cyan-500/20">
                <Search size={18} className="text-cyan-400" />
                <Command.Input
                  autoFocus
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Search pages, features, models..."
                  className="flex-1 bg-transparent border-0 outline-none text-white text-sm placeholder:text-gray-500"
                />
                <kbd className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/10">ESC</kbd>
              </div>
              <Command.List className="max-h-96 overflow-y-auto p-2">
                <Command.Empty className="text-center py-8 text-gray-500 text-sm">
                  No results found.
                </Command.Empty>
                {commands.map((group) => (
                  <Command.Group key={group.group} heading={group.group} className="text-xs text-gray-500 px-2 py-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider">
                    {group.items.map((item) => {
                      const Icon = item.icon
                      return (
                        <Command.Item
                          key={item.path}
                          onSelect={() => runCommand(item.path)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all data-[selected=true]:bg-cyan-500/15 data-[selected=true]:text-cyan-400"
                        >
                          <Icon size={16} />
                          <span className="text-sm flex-1">{item.label}</span>
                          <ArrowRight size={14} className="opacity-0 group-hover:opacity-100" />
                        </Command.Item>
                      )
                    })}
                  </Command.Group>
                ))}
              </Command.List>
              <div className="px-4 py-2 border-t border-cyan-500/20 flex items-center justify-between text-[10px] text-gray-500">
                <span>Navigate with ↑ ↓ • Select with Enter</span>
                <span>⌘K to toggle</span>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
