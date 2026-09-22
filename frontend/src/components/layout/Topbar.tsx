import { Search, Bell, Settings, ChevronDown, RefreshCw } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { LiveClock } from '@/components/ui/LiveClock'
import { notify } from '@/lib/toast'

export function Topbar() {
  const openCommandPalette = () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
  }

  const handleRefresh = () => {
    notify.info('Refreshing data...', 'Fetching latest from backend')
    setTimeout(() => {
      notify.success('Data refreshed!', 'All systems synced')
    }, 1000)
  }

  const handleNotifications = () => {
    notify.warning('3 new alerts', 'Check threat monitoring')
  }

  return (
    <header className="h-16 border-b border-cyan-500/10 bg-[#0A0E1A]/95 backdrop-blur-2xl flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={openCommandPalette}
          className="relative w-full text-left group"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10" size={16} />
          <div className="pl-10 pr-16 py-2.5 rounded-lg bg-white/5 border border-cyan-500/20 text-gray-500 text-sm hover:border-cyan-500/40 hover:bg-white/10 transition-all cursor-pointer">
            Search pages, models, blocks...
          </div>
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 bg-white/10 px-2 py-1 rounded border border-white/10 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 group-hover:border-cyan-500/40 transition-all">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <Badge className="bg-green-500/20 text-green-400 border-green-500/40 gap-1.5 py-1.5">
          <span className="live-dot" />
          Live
        </Badge>

        <LiveClock />

        <button
          onClick={handleRefresh}
          className="text-gray-400 hover:text-cyan-400 transition-colors hover-scale"
          title="Refresh data"
        >
          <RefreshCw size={18} />
        </button>

        <button className="text-gray-400 hover:text-white transition-colors">
          <Settings size={18} />
        </button>

        <button
          onClick={handleNotifications}
          className="text-gray-400 hover:text-white transition-colors relative"
        >
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-cyan-500/10">
          <Avatar className="h-9 w-9 border-2 border-cyan-500/30">
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-xs">
              AT
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <div className="text-white text-xs font-semibold">Aryan Thakur</div>
            <div className="text-gray-500 text-[10px]">Project Team</div>
          </div>
          <ChevronDown size={14} className="text-gray-500" />
        </div>
      </div>
    </header>
  )
}
