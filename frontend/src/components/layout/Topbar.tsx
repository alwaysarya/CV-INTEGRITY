import { NavLink, useLocation } from 'react-router-dom'
import { Search, Bell, Settings, ChevronDown, Shield } from 'lucide-react'

const topMenu = [
  { label: 'Dashboard', path: '/', matchPaths: ['/'] },
  { label: 'Vision', path: '/video', matchPaths: ['/video', '/xai', '/drift'] },
  { label: 'Threats', path: '/attacks', matchPaths: ['/attacks', '/cybersecurity', '/cyber-attack', '/backdoor', '/tamper'] },
  { label: 'Models', path: '/models', matchPaths: ['/models', '/model-registry', '/model-integrity', '/robustness', '/provenance', '/performance'] },
  { label: 'Datasets', path: '/datasets', matchPaths: ['/datasets', '/dataset-analysis', '/audit'] },
  { label: 'Blockchain', path: '/blockchain', matchPaths: ['/blockchain', '/wallets', '/contracts', '/contracts-engine'] },
  { label: 'Analytics', path: '/analytics', matchPaths: ['/analytics', '/trust'] },
  { label: 'Reports', path: '/reports', matchPaths: ['/reports', '/assurance'] },
]

export function Topbar() {
  const location = useLocation()

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

        {/* Top Menu — Apple style */}
        <nav className="flex flex-1 items-center justify-center gap-0.5">
          {topMenu.map((item) => {
            const active = isActive(item)
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`whitespace-nowrap rounded-md px-3.5 py-2 text-[12.5px] font-medium transition-colors ${
                  active
                    ? 'text-emerald-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </NavLink>
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
          <button className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">
            <Bell size={15} />
          </button>
          <NavLink
            to="/settings"
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <Settings size={15} />
          </NavLink>
          <button className="ml-1 flex items-center gap-1.5 rounded-full border border-slate-200 bg-white py-0.5 pl-0.5 pr-2.5 transition-colors hover:bg-slate-50">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800">
              <span className="text-[10px] font-bold text-white">AA</span>
            </div>
            <ChevronDown size={12} className="text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  )
}
