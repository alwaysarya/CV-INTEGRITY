import { Search, MapPin, Settings, ChevronDown } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LiveClock } from '@/components/ui/LiveClock'

const tabs = [
  { label: 'Overview', path: '/' },
  { label: 'Map', path: '/video' },
  { label: 'Video', path: '/video' },
  { label: 'Threats', path: '/attacks' },
  { label: 'Compliance', path: '/security-governance' },
  { label: 'Reports', path: '/reports' },
]

export function Topbar() {
  const location = useLocation()
  const navigate = useNavigate()

  const openCommandPalette = () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
  }

  return (
    <header className="h-[72px] flex items-center gap-4 px-6 sticky top-0 z-40"
      style={{ background: '#08080C', borderBottom: '1px solid rgba(94, 234, 212, 0.1)' }}>

      {/* Tabs */}
      <div className="flex items-center gap-1">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path || (tab.label === 'Overview' && location.pathname === '/')
          return (
            <button
              key={tab.label}
              onClick={() => navigate(tab.path)}
              className="px-4 py-2 rounded text-[10px] font-mono tracking-[0.15em] uppercase transition-all"
              style={active
                ? { background: 'rgba(94, 234, 212, 0.15)', color: '#5EEAD4', border: '1px solid rgba(94, 234, 212, 0.5)' }
                : { background: 'transparent', color: '#5EEAD4', opacity: 0.4, border: '1px solid transparent' }}>
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Search */}
      <button
        onClick={openCommandPalette}
        className="relative flex-1 max-w-md text-left group"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 z-10" size={13} style={{ color: '#5EEAD4', opacity: 0.5 }} />
        <div className="pl-10 pr-4 py-2 rounded text-[11px] font-mono transition-all"
          style={{ background: 'rgba(94, 234, 212, 0.05)', border: '1px solid rgba(94, 234, 212, 0.2)', color: '#5EEAD4', opacity: 0.6 }}>
          SEARCH...
        </div>
      </button>

      <div className="flex-1" />

      {/* Location */}
      <div className="flex items-center gap-2 px-3 py-2 rounded"
        style={{ background: 'rgba(94, 234, 212, 0.05)', border: '1px solid rgba(94, 234, 212, 0.2)' }}>
        <MapPin size={12} style={{ color: '#5EEAD4' }} />
        <span className="text-[10px] font-mono tracking-wider" style={{ color: '#5EEAD4' }}>BENGALURU</span>
      </div>

      {/* Clock */}
      <div className="hidden lg:block text-[10px] font-mono tracking-wider" style={{ color: '#5EEAD4', opacity: 0.6 }}>
        <LiveClock />
      </div>

      {/* Settings */}
      <button className="w-9 h-9 rounded flex items-center justify-center"
        style={{ background: 'rgba(94, 234, 212, 0.05)', border: '1px solid rgba(94, 234, 212, 0.2)' }}>
        <Settings size={14} style={{ color: '#5EEAD4', opacity: 0.6 }} />
      </button>

      {/* Avatar */}
      <button className="flex items-center gap-2 pl-1 pr-3 py-1 rounded"
        style={{ background: 'rgba(94, 234, 212, 0.05)', border: '1px solid rgba(94, 234, 212, 0.2)' }}>
        <div className="w-7 h-7 rounded flex items-center justify-center"
          style={{ background: 'rgba(94, 234, 212, 0.15)', border: '1px solid rgba(94, 234, 212, 0.4)' }}>
          <span className="text-[10px] font-mono font-bold" style={{ color: '#5EEAD4' }}>AT</span>
        </div>
        <ChevronDown size={11} style={{ color: '#5EEAD4', opacity: 0.6 }} />
      </button>
    </header>
  )
}
