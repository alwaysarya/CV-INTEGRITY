import { Search, Mail, Bell, ChevronDown } from 'lucide-react'
import { LiveClock } from '@/components/ui/LiveClock'

export function Topbar() {
  const openCommandPalette = () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
  }

  return (
    <header className="sticky top-0 z-40 flex h-[72px] items-center gap-4 border-b border-slate-200 bg-white px-6">
      {/* Search */}
      <button
        onClick={openCommandPalette}
        className="group relative flex h-11 max-w-[520px] flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 text-left transition-all hover:border-slate-300 hover:bg-white"
      >
        <Search size={16} className="text-slate-400 group-hover:text-slate-600" />
        <span className="flex-1 text-[13px] text-slate-400">
          Search events, threats, severity...
        </span>
        <span className="flex items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
          <span className="text-[11px]">⌘</span>K
        </span>
      </button>

      <div className="flex-1" />

      {/* System status */}
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span className="text-[11px] font-medium text-emerald-700">System online</span>
      </div>

      {/* Mail */}
      <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700">
        <Mail size={16} />
      </button>

      {/* Bell */}
      <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700">
        <Bell size={16} />
      </button>

      {/* Profile */}
      <button className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 transition-colors hover:bg-slate-50">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-800">
          <span className="text-[12px] font-bold text-white">AA</span>
        </div>
        <div className="text-left">
          <div className="text-[12.5px] font-semibold leading-tight text-slate-900">
            Assurance Admin
          </div>
          <div className="text-[10.5px] leading-tight text-slate-500">Workspace</div>
        </div>
        <ChevronDown size={14} className="text-slate-400" />
      </button>
    </header>
  )
}
