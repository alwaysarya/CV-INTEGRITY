import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSession } from '@/lib/sessions'
import { checkLockout, recordFailure, recordSuccess, formatCountdown, getPolicy } from '@/lib/lockout'
import { motion } from 'framer-motion'
import { ShieldCheck, Loader2, ArrowRight, Check, Lock, Database, Cpu, Boxes, Fingerprint, Sun, Moon } from 'lucide-react'

export function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)
  const [countdown, setCountdown] = useState<string>('')
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null)

  // Live countdown ticker
  useEffect(() => {
    if (!lockedUntil) return
    const tick = () => {
      const remaining = lockedUntil - Date.now()
      if (remaining <= 0) {
        setLockedUntil(null)
        setCountdown('')
        setError(null)
        setAttemptsLeft(null)
        return
      }
      setCountdown(formatCountdown(remaining))
    }
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [lockedUntil])
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('cv_integrity_theme') as 'dark' | 'light') || 'dark'
  })

  useEffect(() => { localStorage.setItem('cv_integrity_theme', theme) }, [theme])
  const isDark = theme === 'dark'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) { setError('Please fill in all fields'); return }

    // Check if locked out
    const lockState = checkLockout(username)
    if (lockState.locked) {
      setLockedUntil(Date.now() + lockState.remainingMs)
      setError('Account locked due to too many failed attempts')
      return
    }

    setLoading(true); setError(null)
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
        if (remember) localStorage.setItem('cv_integrity_remember', '1')
        recordSuccess(username)
        createSession(username)
        setLoading(false); navigate('/landing'); return
      }
      if (data.detail === 'Not Found' || data.detail?.includes('Not Found')) {
        localStorage.setItem('cv_integrity_user', JSON.stringify({ username, role: username, name: 'Demo User' }))
        localStorage.setItem('cv_integrity_token', 'demo_token')
        if (remember) localStorage.setItem('cv_integrity_remember', '1')
        recordSuccess(username)
        createSession(username)
        setLoading(false); navigate('/landing'); return
      }
      const result = recordFailure(username)
      if (result.locked) {
        setLockedUntil(result.lockedUntil)
        setError('Account locked due to too many failed attempts')
      } else {
        setAttemptsLeft(result.attemptsLeft)
        setError(`Invalid credentials · ${result.attemptsLeft} attempt${result.attemptsLeft === 1 ? '' : 's'} remaining`)
      }
      setLoading(false)
    } catch {
      localStorage.setItem('cv_integrity_user', JSON.stringify({ username, role: 'analyst', name: 'Demo User' }))
      localStorage.setItem('cv_integrity_token', 'demo_token')
      if (remember) localStorage.setItem('cv_integrity_remember', '1')
      recordSuccess(username)
      createSession(username)
      setLoading(false); navigate('/landing')
    }
  }
  const quickLogin = (role: string) => { setUsername(role); setPassword('demo') }

  // ===== PALETTE =====
  const bg = isDark ? 'bg-[#111114]' : 'bg-[#EDEDF0]'
  const text = isDark ? 'text-white' : 'text-[#1D1D1F]'
  const subtext = isDark ? 'text-white/60' : 'text-[#6E6E73]'
  const faint = isDark ? 'text-white/35' : 'text-[#86868B]'

  // Grid — visible in both
  const gridStroke = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(29,29,31,0.14)'
  const gridOpacity = isDark ? 'opacity-100' : 'opacity-100'

  // Blobs — SAME opacity
  const blobOpacity = isDark ? 'opacity-30' : 'opacity-[0.22]'

  // Cards
  const cardBg = isDark ? 'bg-[#18181C]' : 'bg-white'
  const cardBorder = isDark
    ? 'from-white/15 via-white/[0.05] to-white/15'
    : 'from-black/[0.12] via-black/[0.04] to-black/[0.12]'
  const cardShadow = isDark
    ? 'shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]'
    : 'shadow-[0_30px_80px_-20px_rgba(0,0,0,0.18)]'

  // Inputs
  const inputBg = isDark
    ? 'bg-white/[0.05] border-white/10 text-white placeholder:text-white/30'
    : 'bg-[#F5F5F7] border-[#DDDDE2] text-[#1D1D1F] placeholder:text-[#AEAEB2]'
  const inputFocus = isDark
    ? 'focus:bg-white/[0.08] focus:border-[#5AC8FA]/50 focus:ring-[#5AC8FA]/10'
    : 'focus:bg-white focus:border-[#0071E3]/50 focus:ring-[#0071E3]/10'

  const divider = isDark ? 'bg-white/10' : 'bg-[#D8D8DD]'

  // Tiles — visible borders/shadows in light
  const tileBg = isDark ? 'bg-white/[0.04] border-white/[0.06]' : 'bg-[#F8F8FA] border-[#E5E5EA]'

  // Progress track — darker in light
  const progressTrack = isDark ? 'bg-white/[0.06]' : 'bg-[#E0E0E5]'

  const demoBtn = isDark
    ? 'bg-white/[0.05] hover:bg-white/[0.09] border-white/10 hover:border-white/20 text-white/85 hover:text-white'
    : 'bg-[#F5F5F7] hover:bg-white border-[#DDDDE2] hover:border-[#C7C7CC] text-[#1D1D1F] hover:shadow-sm'

  const toggleBtn = isDark
    ? 'bg-white/[0.06] border-white/10 text-white/80 hover:bg-white/[0.1]'
    : 'bg-white border-[#DDDDE2] text-[#1D1D1F] hover:bg-[#F5F5F7] shadow-sm'

  const badgeBg = isDark ? 'bg-white/[0.04] border-white/10' : 'bg-white border-[#DDDDE2] shadow-sm'
  const badgeText = isDark ? 'text-white/85' : 'text-[#1D1D1F]'

  return (
    <div className={`min-h-screen flex ${bg} relative overflow-hidden ${text} transition-colors duration-500`}>
      {/* Grid — visible in both modes */}
      <svg className={`absolute inset-0 w-full h-full ${gridOpacity}`} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke={gridStroke} strokeWidth="1" />
          </pattern>
          <radialGradient id="fadeGrid" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="mask1"><rect width="100%" height="100%" fill="url(#fadeGrid)" /></mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" mask="url(#mask1)" />
      </svg>

      {/* Blobs */}
      <motion.div
        animate={{ x: [0, 100, 0], y: [0, -60, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute top-[-20%] left-[-10%] w-[900px] h-[900px] rounded-full blur-[200px] ${blobOpacity}`}
        style={{ background: 'radial-gradient(circle, #0071E3, transparent 65%)' }}
      />
      <motion.div
        animate={{ x: [0, -80, 0], y: [0, 60, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute bottom-[-25%] right-[-10%] w-[900px] h-[900px] rounded-full blur-[200px] ${blobOpacity}`}
        style={{ background: 'radial-gradient(circle, #AF52DE, transparent 65%)' }}
      />

      {/* Scanline */}
      <motion.div
        animate={{ y: ['-10%', '110%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className="absolute left-0 right-0 h-[2px] pointer-events-none opacity-40"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(90,200,250,0.6), transparent)', filter: 'blur(2px)' }}
      />

      {/* Theme toggle */}
      <motion.button
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        className={`absolute top-6 right-6 z-30 w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-xl border transition-colors ${toggleBtn}`}
      >
        <motion.div key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
          {isDark ? <Sun size={17} strokeWidth={2.2} /> : <Moon size={17} strokeWidth={2.2} />}
        </motion.div>
      </motion.button>

      {/* LEFT */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-14 relative z-10">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[14px] flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #0071E3, #AF52DE)',
              boxShadow: isDark ? '0 0 30px rgba(0,113,227,0.4)' : '0 6px 20px rgba(0,113,227,0.25)'
            }}>
            <ShieldCheck size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className={`font-semibold text-[15px] tracking-tight ${text}`}>CV-Integrity</div>
            <div className={`${subtext} text-[9px] tracking-[0.18em] font-semibold`}>AI TRUST PLATFORM</div>
          </div>
        </motion.div>

        <div className="max-w-[580px]">
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full backdrop-blur-xl border mb-7 ${badgeBg}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" style={{ boxShadow: '0 0 8px #34C759' }} />
            <span className={`${badgeText} text-[11px] font-semibold tracking-[-0.005em]`}>Trustworthy AI for Defence</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className={`text-[72px] font-semibold tracking-[-0.042em] leading-[0.96] ${text}`}
          >
            Vision integrity,
            <br />
            <span className="bg-gradient-to-r from-[#0071E3] via-[#5E5CE6] to-[#AF52DE] bg-clip-text text-transparent">
              assured.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25 }}
            className={`mt-7 ${subtext} text-[18px] leading-[1.55] tracking-[-0.015em] max-w-[520px]`}
          >
            An offline assurance layer for SIH Problem Statement 26228. Verify contributors, data, models, and inference — before deployment.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.35 }}
            className="mt-11 flex items-center gap-3"
          >
            {['Data', 'Model', 'Inference', 'Verified'].map((label, i) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      i === 3 ? 'bg-[#34C759]' : isDark ? 'bg-white/10 border border-white/15' : 'bg-[#1D1D1F]'
                    }`}
                  >
                    <Check size={12} className="text-white" strokeWidth={3} />
                  </div>
                  <span className={`${text} text-[14px] font-semibold tracking-[-0.01em] opacity-90`}>{label}</span>
                </div>
                {i < 3 && <div className={`w-6 h-[1.5px] ${isDark ? 'bg-white/15' : 'bg-[#C7C7CC]'}`} />}
              </div>
            ))}
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, y: 50, rotateX: 12 }} animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1.2, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mt-16 relative" style={{ perspective: '1200px' }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className={`absolute -top-5 -right-5 z-20 flex items-center gap-2 px-3.5 py-2 rounded-full shadow-xl ${
                isDark ? 'bg-white text-[#1D1D1F] shadow-black/30' : 'bg-[#1D1D1F] text-white shadow-black/20'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-[#34C759] flex items-center justify-center">
                <Check size={11} className="text-white" strokeWidth={3.5} />
              </div>
              <span className="text-[12px] font-semibold tracking-[-0.01em]">Verified</span>
            </motion.div>

            <div className={`relative rounded-[28px] p-[1.5px] bg-gradient-to-tr ${cardBorder}`}>
              <div className={`rounded-[27px] ${cardBg} overflow-hidden ${cardShadow}`}>
                <div className={`flex items-center gap-1.5 px-5 py-3.5 border-b ${isDark ? 'border-white/[0.06]' : 'border-[#EDEDF0]'}`}>
                  <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                  <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                  <div className={`ml-4 text-[11px] ${subtext} font-semibold tracking-[-0.01em]`}>Integrity Dashboard</div>
                  <div className="ml-auto flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#34C759]/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                    <span className="text-[9px] text-[#34C759] font-bold tracking-[0.1em]">LIVE</span>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-4 gap-4">
                  {[
                    { icon: Database, label: 'Data', value: '12', color: '#0071E3' },
                    { icon: Boxes, label: 'Models', value: '3', color: '#AF52DE' },
                    { icon: Cpu, label: 'Inference', value: '847', color: '#34C759' },
                    { icon: Fingerprint, label: 'Trust', value: '67%', color: '#FF9500' },
                  ].map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.label} className={`rounded-2xl p-4 border ${tileBg}`}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${item.color}18` }}>
                          <Icon size={15} style={{ color: item.color }} strokeWidth={2.2} />
                        </div>
                        <div className={`mt-3.5 text-[22px] font-semibold tracking-[-0.03em] leading-none ${text}`}>{item.value}</div>
                        <div className={`text-[9px] uppercase tracking-[0.14em] ${faint} font-bold mt-1.5`}>{item.label}</div>
                      </div>
                    )
                  })}
                </div>

                <div className="px-6 pb-6 space-y-3.5">
                  {[
                    { label: 'Data integrity', pct: 100, color: '#34C759' },
                    { label: 'Model signature', pct: 82, color: '#0071E3' },
                    { label: 'Provenance chain', pct: 64, color: '#AF52DE' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-3.5">
                      <span className={`text-[11.5px] ${subtext} w-36 tracking-[-0.01em] font-semibold`}>{row.label}</span>
                      <div className={`flex-1 h-2 rounded-full ${progressTrack} overflow-hidden`}>
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${row.pct}%` }}
                          transition={{ duration: 1.5, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full rounded-full"
                          style={{ background: row.color }}
                        />
                      </div>
                      <span className={`text-[11.5px] ${text} font-bold tabular-nums w-10 text-right`}>{row.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.9 }}
          className={`flex items-center gap-4 ${faint} text-[11px] tracking-[-0.01em]`}
        >
          <span>© 2026 CV-Integrity</span>
          <span className={`w-1 h-1 rounded-full ${isDark ? 'bg-white/20' : 'bg-[#C7C7CC]'}`} />
          <span>SIH 26228</span>
          <span className={`w-1 h-1 rounded-full ${isDark ? 'bg-white/20' : 'bg-[#C7C7CC]'}`} />
          <span>Offline · Air-gapped</span>
        </motion.div>
      </div>

      {/* RIGHT */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[430px]"
        >
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-11 h-11 rounded-[14px] flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0071E3, #AF52DE)' }}>
              <ShieldCheck size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <div className={`font-semibold text-[15px] tracking-tight ${text}`}>CV-Integrity</div>
          </div>

          <div className={`relative rounded-[32px] p-[1.5px] bg-gradient-to-tr ${cardBorder} ${cardShadow}`}>
            <div className={`${cardBg} rounded-[31px] p-9 md:p-10`}>
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-5">
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${isDark ? 'bg-white/[0.06] border-white/10' : 'bg-[#1D1D1F] border-transparent'}`}>
                    <Lock size={13} className="text-white" strokeWidth={2.5} />
                  </div>
                  <span className={`text-[10px] uppercase tracking-[0.2em] ${subtext} font-bold`}>Secure Access</span>
                </div>
                <h2 className={`text-[34px] font-semibold tracking-[-0.034em] leading-[1.05] ${text}`}>
                  Welcome back
                </h2>
                <p className={`mt-2.5 ${subtext} text-[14.5px] tracking-[-0.01em]`}>
                  Sign in to access your integrity dashboard.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-3.5">
                <input
                  type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username" disabled={loading}
                  className={`w-full px-4 py-4 rounded-2xl border text-[15px] outline-none transition-all tracking-[-0.01em] focus:ring-4 ${inputBg} ${inputFocus}`}
                />
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password" disabled={loading}
                  className={`w-full px-4 py-4 rounded-2xl border text-[15px] outline-none transition-all tracking-[-0.01em] focus:ring-4 ${inputBg} ${inputFocus}`}
                />

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#0071E3]" />
                    <span className={`${subtext} text-[13px] tracking-[-0.01em]`}>Remember me</span>
                  </label>
                  <button type="button" className="text-[#0071E3] hover:opacity-80 text-[13px] tracking-[-0.01em] transition-opacity font-semibold">
                    Forgot?
                  </button>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-[#FF3B30]/10 border border-[#FF3B30]/25 text-[#FF453A] text-[13px] tracking-[-0.01em]">
                    {error}
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.99 }}
                  type="submit" disabled={loading}
                  className="relative w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white text-[15px] font-semibold tracking-[-0.01em] transition-all disabled:opacity-50 mt-4 overflow-hidden group"
                  style={{ background: 'linear-gradient(135deg, #0071E3, #0058B0)', boxShadow: '0 12px 36px -8px rgba(0,113,227,0.6)' }}
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                  {loading ? (<><Loader2 size={16} className="animate-spin" />Signing in...</>) : (<>Sign in<ArrowRight size={16} strokeWidth={2.4} /></>)}
                </motion.button>
              </form>

              <div className="mt-8 mb-5 flex items-center gap-3">
                <div className={`flex-1 h-[1px] ${divider}`} />
                <span className={`${faint} text-[10px] tracking-[0.2em] font-bold`}>DEMO ACCESS</span>
                <div className={`flex-1 h-[1px] ${divider}`} />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {['analyst', 'auditor', 'admin'].map((role) => (
                  <motion.button
                    key={role} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                    type="button" onClick={() => quickLogin(role)}
                    className={`px-3 py-3 rounded-xl border transition-all text-[12.5px] font-semibold capitalize tracking-[-0.01em] ${demoBtn}`}
                  >
                    {role}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-7 text-center">
            <span className={`${faint} text-[12px] tracking-[-0.01em]`}>
              Air-gapped · No cloud · Fully offline
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
