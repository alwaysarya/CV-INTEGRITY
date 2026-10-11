import { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, Settings, ChevronDown, Shield, LogOut, User, ShieldCheck } from 'lucide-react'

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
  const navigate = useNavigate()
  const [user, setUser] = useState<{ username?: string; name?: string; role?: string } | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('cv_integrity_user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch { setUser(null) }
    }
  }, [])

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

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

  const handleLogout = () => {
    localStorage.removeItem('cv_integrity_user')
    localStorage.removeItem('cv_integrity_token')
    localStorage.removeItem('cv_integrity_remember')
    navigate('/login')
  }

  const displayName = user?.name || user?.username || 'User'
  const initials = displayName
    .split(' ')
    .map((s: string) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

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
          <button className="relative flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">
            <Bell size={15} />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </button>
          <NavLink
            to="/settings"
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <Settings size={15} />
          </NavLink>

          {/* User dropdown */}
          <div className="relative ml-1" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white py-0.5 pl-0.5 pr-2.5 transition-colors hover:bg-slate-50"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800">
                <span className="text-[10px] font-bold text-white">{initials}</span>
              </div>
              <ChevronDown size={12} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                style={{ boxShadow: '0 20px 40px -12px rgba(0,0,0,0.15)' }}
              >
                {/* User info */}
                <div className="border-b border-slate-100 px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800">
                      <span className="text-[12px] font-bold text-white">{initials}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-semibold text-slate-900">
                        {displayName}
                      </div>
                      <div className="truncate text-[11px] capitalize text-slate-500">
                        {user?.role || 'Analyst'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-1.5">
                  <button
                    onClick={() => { setDropdownOpen(false); navigate('/settings') }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <User size={14} className="text-slate-500" strokeWidth={2} />
                    Profile
                  </button>
                  <button
                    onClick={() => { setDropdownOpen(false); navigate('/settings') }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <Settings size={14} className="text-slate-500" strokeWidth={2} />
                    Settings
                  </button>
                  <button
                    onClick={() => { setDropdownOpen(false); navigate('/trust') }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <ShieldCheck size={14} className="text-slate-500" strokeWidth={2} />
                    Trust Center
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-slate-100 p-1.5">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut size={14} strokeWidth={2} />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
