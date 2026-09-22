import { Search, Bell, Settings, ChevronDown, Activity } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export function Topbar() {
  return (
    <header className="h-16 border-b border-cyan-500/10 bg-[#0A0E1A]/95 backdrop-blur-2xl flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left: Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <Input
            placeholder="Search datasets, models, blocks..."
            className="pl-10 bg-white/5 border-cyan-500/20 text-white placeholder:text-gray-500 focus:border-cyan-500/50 h-10"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/10">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions + Profile */}
      <div className="flex items-center gap-4">
        {/* Live Badge */}
        <Badge className="bg-green-500/20 text-green-400 border-green-500/40 gap-1.5 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          Live
        </Badge>

        {/* Time */}
        <div className="text-gray-400 text-xs hidden lg:block">
          {new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>

        {/* Settings */}
        <button className="text-gray-400 hover:text-white transition-colors">
          <Settings size={18} />
        </button>

        {/* Notifications */}
        <button className="text-gray-400 hover:text-white transition-colors relative">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
        </button>

        {/* Profile */}
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
