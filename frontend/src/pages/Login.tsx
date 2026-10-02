import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Lock, User, ArrowRight, Loader2, Wifi, WifiOff } from 'lucide-react'

export function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError(null)

    // Try backend auth first
    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()

      if (data.status === 'success') {
        localStorage.setItem('cv_integrity_user', JSON.stringify(data.user))
        localStorage.setItem('cv_integrity_token', data.token)
        setLoading(false)
        navigate('/')
        return
      } else {
        setError(data.detail || 'Invalid credentials')
        setLoading(false)
        return
      }
    } catch (err) {
      // Fallback: offline demo mode
      localStorage.setItem('cv_integrity_user', JSON.stringify({
        username,
        role: 'analyst',
        name: 'Demo User',
      }))
      localStorage.setItem('cv_integrity_token', 'demo_token')
      setLoading(false)
      navigate('/')
    }
  }

  const quickLogin = (role: string) => {
    setUsername(role)
    setPassword('demo')
  }

  return (
    <div className="min-h-screen flex bg-[#0A1414] relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-teal-500/[0.07] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/[0.05] rounded-full blur-[120px] pointer-events-none" />

      {/* Left: Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-14 relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
            <ShieldCheck size={22} className="text-[#0A1414]" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-white font-semibold text-base tracking-tight">CV-INTEGRITY</div>
            <div className="text-teal-400/60 text-[10px] uppercase tracking-[0.2em] font-medium">AI Trust Platform</div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 dot-live" />
            <span className="text-teal-300 text-[11px] font-medium uppercase tracking-wider">Trustworthy AI for Defence</span>
          </div>

          <h1 className="text-5xl font-semibold text-white tracking-tight leading-[1.1] mb-6">
            Verify every stage of your{' '}
            <span className="bg-gradient-to-r from-teal-300 to-cyan-400 bg-clip-text text-transparent">
              computer vision
            </span>{' '}
            pipeline.
          </h1>

          <p className="text-slate-400 text-base leading-relaxed mb-8">
            An offline assurance layer for SIH Problem Statement 26228. Checks contributors, data, models, inference, and output — before any of it gets deployed.
          </p>

          {/* Feature List */}
          <div className="space-y-4">
            {[
              { text: 'Fully offline · Air-gapped ready', icon: WifiOff },
              { text: 'Cryptographic binding for every stage', icon: ShieldCheck },
              { text: 'NIST AI RMF and EU AI Act aligned', icon: Lock },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-teal-400" strokeWidth={2} />
                  </div>
                  <span className="text-slate-300 text-sm">{item.text}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>© 2026 CV-Integrity · SIH 26228</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            Offline Mode Active
          </span>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-14 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
              <ShieldCheck size={22} className="text-[#0A1414]" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-white font-semibold text-base tracking-tight">CV-INTEGRITY</div>
              <div className="text-teal-400/60 text-[10px] uppercase tracking-[0.2em] font-medium">AI Trust Platform</div>
            </div>
          </div>

          {/* Glass card */}
          <div className="glass-card p-8 relative overflow-hidden">
            {/* Ambient glow inside card */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/[0.08] rounded-full blur-[100px] pointer-events-none" />

            <div className="relative">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-white tracking-tight mb-2">Sign in</h2>
                <p className="text-slate-400 text-sm">Access the integrity assurance dashboard</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-medium mb-2 block">
                    Username
                  </label>
                  <div className="relative group">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" strokeWidth={1.5} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="analyst"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#0F1F1F]/60 border border-teal-500/10 text-white text-sm placeholder:text-slate-600 focus:border-teal-500/40 focus:bg-[#0F1F1F]/80 outline-none transition-all"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-medium mb-2 block">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" strokeWidth={1.5} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#0F1F1F]/60 border border-teal-500/10 text-white text-sm placeholder:text-slate-600 focus:border-teal-500/40 focus:bg-[#0F1F1F]/80 outline-none transition-all"
                      disabled={loading}
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-mint w-full flex items-center justify-center gap-2 py-3.5 text-sm disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight size={16} strokeWidth={2.5} />
                    </>
                  )}
                </button>
              </form>

              {/* Demo accounts */}
              <div className="mt-8 pt-6 border-t border-teal-500/[0.08]">
                <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-medium mb-3">
                  Demo accounts
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['analyst', 'auditor', 'admin'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => quickLogin(role)}
                      className="px-3 py-2.5 rounded-xl bg-[#0F1F1F]/40 border border-teal-500/10 hover:border-teal-500/30 hover:bg-teal-500/[0.06] transition-all text-slate-300 text-xs font-medium capitalize"
                    >
                      {role}
                    </button>
                  ))}
                </div>
                <p className="text-slate-600 text-[10px] mt-3 text-center">
                  Demo mode · any credentials work
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-slate-600 text-xs flex items-center justify-center gap-3">
            <span className="flex items-center gap-1.5">
              <WifiOff size={10} />
              Offline
            </span>
            <span className="text-slate-700">·</span>
            <span>Air-gapped</span>
            <span className="text-slate-700">·</span>
            <span>No cloud</span>
          </div>
        </div>
      </div>
    </div>
  )
}
