import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, Database, Boxes, Cpu, Fingerprint, ArrowRight, Check, Link2, Lock, LogOut, ChevronDown, Quote, X, Zap, Terminal, Copy, Book } from 'lucide-react'

function CountUp({ end, duration = 2, suffix = '', prefix = '' }: { end: number; duration?: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useState<HTMLSpanElement | null>(null)

  return <span ref={(el) => { if (el && !hasStarted) { setHasStarted(true); const start = performance.now(); const tick = (now: number) => { const progress = Math.min((now - start) / (duration * 1000), 1); setCount(Math.floor(progress * end)); if (progress < 1) requestAnimationFrame(tick) }; requestAnimationFrame(tick) } }}>{prefix}{count}{suffix}</span>
}

export function Landing() {
  const navigate = useNavigate()
  const [user, setUser] = useState<{ username: string; role: string; name?: string } | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [activeSection, setActiveSection] = useState('overview')
  const [scrollProgress, setScrollProgress] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [activeTab, setActiveTab] = useState('install')
  const [copied, setCopied] = useState(false)

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  useEffect(() => {
    const stored = localStorage.getItem('cv_integrity_user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch { setUser(null) }
    }
  }, [])

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20)
      const total = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0)
      const sections = ['overview', 'features', 'pipeline', 'docs']
      for (const id of sections) {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 120 && rect.bottom > 120) {
            setActiveSection(id)
            break
          }
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height
        setMousePos({ x: x * 20, y: y * 20 })
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('cv_integrity_user')
    localStorage.removeItem('cv_integrity_token')
    localStorage.removeItem('cv_integrity_remember')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden relative">
      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-transparent">
        <motion.div
          className="h-full origin-left"
          style={{ background: 'linear-gradient(90deg, #5AC8FA, #0071E3, #AF52DE)', width: `${scrollProgress}%` }}
        />
      </div>
      {/* ===== NAV ===== */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl border-b transition-all duration-300 ${scrolled ? 'bg-black/85 border-white/[0.1] shadow-[0_4px_30px_rgba(0,0,0,0.5)]' : 'bg-black/50 border-white/[0.04]'}`}>
        <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#0071E3] to-[#AF52DE] flex items-center justify-center">
              <ShieldCheck size={13} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-white text-[13px] font-semibold tracking-tight">CV-Integrity</span>
          </div>
          <div className="hidden md:flex items-center gap-7">
            {['Overview', 'Features', 'Pipeline', 'Docs'].map((item) => {
              const isActive = activeSection === item.toLowerCase()
              return (
                <a key={item} href={`#${item.toLowerCase()}`}
                  className={`relative text-[12px] font-medium tracking-tight transition-colors ${isActive ? 'text-white' : 'text-white/60 hover:text-white'}`}
                >
                  {item}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-gradient-to-r from-[#5AC8FA] to-[#0071E3] rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              )
            })}
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0071E3] to-[#AF52DE] flex items-center justify-center text-white text-[11px] font-semibold uppercase">
                  {(user.name || user.username || 'U').charAt(0)}
                </div>
                <span className="hidden md:block text-white/80 text-[12px] font-medium tracking-tight capitalize">
                  {user.username}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="ml-1 flex items-center gap-1.5 text-[12px] font-medium text-white/50 hover:text-[#FF453A] transition-colors"
                title="Sign out"
              >
                <LogOut size={13} strokeWidth={2.2} />
                <span className="hidden md:inline">Sign out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="text-[12px] font-medium text-white/90 hover:text-white transition-colors"
            >
              Sign in →
            </button>
          )}
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section id="overview" ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-32 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 40%, rgba(0,113,227,0.15), transparent 60%)' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
        </div>
        {/* Ambient glow */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full blur-[180px] opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0071E3, transparent 60%)' }} />
        <div className="absolute bottom-[10%] left-[20%] w-[600px] h-[600px] rounded-full blur-[180px] opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #AF52DE, transparent 60%)' }} />

        {/* Hero background image */}
        <div className="absolute inset-0 pointer-events-none">
          <img src="/images/hero-bg.jpg" alt="" className="w-full h-full object-cover opacity-[0.2]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
        </div>

        {/* Animated grid overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="heroGrid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="0.8" />
            </pattern>
            <radialGradient id="heroFade" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <mask id="heroMask"><rect width="100%" height="100%" fill="url(#heroFade)" /></mask>
          </defs>
          <rect width="100%" height="100%" fill="url(#heroGrid)" mask="url(#heroMask)" />
        </svg>

        {/* Shooting stars */}
        {[
          { delay: 0, duration: 3, top: '15%', left: '80%' },
          { delay: 2, duration: 3.5, top: '30%', left: '20%' },
          { delay: 4, duration: 3, top: '50%', left: '90%' },
          { delay: 6, duration: 4, top: '65%', left: '10%' },
        ].map((star, i) => (
          <motion.div
            key={`star-${i}`}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], x: [-100, 200], y: [-50, 100] }}
            transition={{ duration: star.duration, repeat: Infinity, delay: star.delay, repeatDelay: 5, ease: 'easeOut' }}
            className="absolute w-[2px] h-[2px] rounded-full bg-white pointer-events-none"
            style={{ top: star.top, left: star.left, boxShadow: '0 0 8px white, 0 0 20px #5AC8FA' }}
          />
        ))}

        {/* Floating orbs */}
        <motion.div
          animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[30%] left-[15%] w-3 h-3 rounded-full bg-[#5AC8FA] opacity-60 pointer-events-none"
          style={{ boxShadow: '0 0 20px #5AC8FA' }}
        />
        <motion.div
          animate={{ x: [0, -80, 0], y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[55%] right-[12%] w-2 h-2 rounded-full bg-[#AF52DE] opacity-60 pointer-events-none"
          style={{ boxShadow: '0 0 20px #AF52DE' }}
        />
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -60, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[70%] left-[8%] w-2.5 h-2.5 rounded-full bg-[#34C759] opacity-50 pointer-events-none"
          style={{ boxShadow: '0 0 20px #34C759' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/10 mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" style={{ boxShadow: '0 0 8px #34C759' }} />
          <span className="text-white/85 text-[11px] font-medium tracking-tight">SIH Problem Statement 26228</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative text-center max-w-[1000px] text-[80px] md:text-[120px] font-semibold tracking-[-0.045em] leading-[0.95]"
        >
          Vision Integrity,
          <br />
          <motion.span
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="bg-gradient-to-r from-[#FF006E] via-[#3A86FF] via-[#8338EC] to-[#FF006E] bg-clip-text text-transparent bg-[length:200%_100%]"
          >
            Assured.
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-10 max-w-[640px] text-center text-white/55 text-[21px] leading-[1.5] tracking-[-0.015em]"
        >
          An offline assurance layer for computer vision pipelines. Verify contributors, data, models, and inference — before deployment.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <button
            onClick={() => navigate('/')}
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-[15px] font-medium tracking-tight transition-all"
            style={{ boxShadow: '0 12px 40px -8px rgba(0,113,227,0.6)' }}
          >
            Enter Vision World
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" strokeWidth={2.4} />
          </button>
          <a
            href="#features"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-xl hover:bg-white/[0.08] text-white text-[15px] font-medium tracking-tight transition-all"
          >
            Learn More
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="relative mt-16 flex flex-col items-center gap-2 text-white/30"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </motion.div>

        {/* Mock preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            transform: `perspective(1200px) rotateY(${mousePos.x * 0.3}deg) rotateX(${-mousePos.y * 0.3}deg)`,
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="relative mt-24 w-full max-w-[1000px]"
        >
          <div className="absolute -inset-6 rounded-[40px] opacity-50 blur-3xl"
            style={{ background: 'linear-gradient(135deg, rgba(0,113,227,0.4), rgba(175,82,222,0.3))' }} />
          <div className="relative rounded-[24px] p-[1.5px] bg-gradient-to-tr from-white/15 via-white/[0.04] to-white/15">
            <div className="rounded-[23px] bg-[#0F0F14] overflow-hidden">
              <div className="flex items-center gap-1.5 px-5 py-3.5 border-b border-white/[0.06]">
                <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                <div className="ml-4 text-[11px] text-white/50 font-medium">Integrity Dashboard</div>
                <div className="ml-auto flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#34C759]/15 border border-[#34C759]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse" />
                  <span className="text-[9px] text-[#34C759] font-bold tracking-[0.1em]">LIVE</span>
                </div>
              </div>
              <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-5">
                {[
                  { icon: Database, label: 'Datasets', value: '12', color: '#5AC8FA' },
                  { icon: Boxes, label: 'Models', value: '3', color: '#AF52DE' },
                  { icon: Cpu, label: 'Inference', value: '847', color: '#34C759' },
                  { icon: Fingerprint, label: 'Trust Score', value: '67%', color: '#FF9500' },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="rounded-2xl bg-white/[0.03] border border-white/[0.05] p-5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${item.color}18` }}>
                        <Icon size={16} style={{ color: item.color }} strokeWidth={2.2} />
                      </div>
                      <div className="mt-4 text-[28px] font-semibold tracking-[-0.03em] text-white leading-none">{item.value}</div>
                      <div className="text-[9px] uppercase tracking-[0.15em] text-white/40 font-bold mt-2">{item.label}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== DIVIDER (dark → light) ===== */}
      <div className="relative h-24 bg-black overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 1 }}
          className="absolute inset-x-0 bottom-0 h-full"
          style={{ background: 'linear-gradient(180deg, #000 0%, #000 40%, #fff 100%)' }}
        />
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 96">
          <motion.path
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            d="M0,60 C240,20 480,80 720,50 C960,20 1200,80 1440,40"
            fill="none"
            stroke="url(#dividerGrad)"
            strokeWidth="1.5"
          />
          <defs>
            <linearGradient id="dividerGrad" x1="0" x2="1">
              <stop offset="0%" stopColor="#5AC8FA" stopOpacity="0" />
              <stop offset="50%" stopColor="#0071E3" stopOpacity="1" />
              <stop offset="100%" stopColor="#AF52DE" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ===== FEATURES (Light) ===== */}
      <section id="features" className="relative bg-white text-[#1D1D1F] py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <img src="/images/cyber.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        {/* Subtle background image */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute inset-0 opacity-30" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,113,227,0.05), transparent)' }} />
        </div>
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8 }}
            className="text-center max-w-[760px] mx-auto mb-20"
          >
            <div className="text-[#0071E3] text-[13px] font-semibold tracking-[0.14em] uppercase mb-4">End-to-end assurance</div>
            <h2 className="text-[56px] font-semibold tracking-[-0.04em] leading-[1.02]">
              Every stage.
              <br />
              <span className="text-[#86868B]">Cryptographically verified.</span>
            </h2>
            <p className="mt-6 text-[19px] text-[#6E6E73] leading-[1.5] tracking-[-0.015em]">
              From contributor identity to inference output — the entire pipeline is bound to a tamper-evident ledger.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: ShieldCheck, title: 'Contributor Trust', desc: 'Verify who contributed what. Every commit is signed and recorded.', color: '#0071E3' },
              { icon: Database, title: 'Data Integrity', desc: 'Hash-check datasets before training. Detect drift and poisoning.', color: '#34C759' },
              { icon: Boxes, title: 'Model Provenance', desc: 'Track model lineage from training config to deployed artifact.', color: '#AF52DE' },
              { icon: Cpu, title: 'Inference Auditing', desc: 'Capture every prediction with a signed output record.', color: '#FF9500' },
              { icon: Link2, title: 'Blockchain Ledger', desc: 'Immutable audit trail. No central point of trust.', color: '#5AC8FA' },
              { icon: Lock, title: 'Offline & Air-gapped', desc: 'No cloud. No external dependency. Fully contained.', color: '#FF3B30' },
            ].map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7, delay: i * 0.06 }}
                  className="group relative rounded-3xl bg-[#F5F5F7] p-8 hover:bg-white border border-transparent hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `linear-gradient(135deg, ${f.color}15, transparent 50%)` }} />
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ boxShadow: `inset 0 0 0 1px ${f.color}30` }} />
                  <div className="relative"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                      style={{ background: `${f.color}15` }}>
                      <Icon size={22} style={{ color: f.color }} strokeWidth={2} />
                    </div>
                    <ArrowRight size={16} className="text-[#C7C7CC] group-hover:text-[#1D1D1F] group-hover:translate-x-1 transition-all duration-300 mt-1" strokeWidth={2.2} />
                  </div>
                  <h3 className="mt-6 text-[20px] font-semibold tracking-[-0.02em]">{f.title}</h3>
                  <p className="mt-2 text-[15px] text-[#6E6E73] leading-[1.5] tracking-[-0.01em]">{f.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== LIVE SECURITY FEED ===== */}
      <section className="relative bg-white text-[#1D1D1F] py-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="mb-8 flex items-center gap-3"
          >
            <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" style={{ boxShadow: '0 0 10px #34C759' }} />
            <span className="text-[12px] uppercase tracking-[0.2em] font-bold text-[#1D1D1F]">Live Integrity Feed</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.1 }}
            className="rounded-3xl bg-[#0F0F14] p-6 overflow-hidden relative"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { time: '10:42:18', event: 'Dataset integrity verified', detail: 'coco_val_2017 · 5,000 images', color: '#34C759', icon: Check },
                { time: '10:42:22', event: 'Model signature matched', detail: 'yolov8n.pt · SHA-256 OK', color: '#0071E3', icon: ShieldCheck },
                { time: '10:42:31', event: 'Inference batch anchored', detail: 'Batch #847 · block 0x4a3f…c9', color: '#AF52DE', icon: Link2 },
                { time: '10:42:45', event: 'Drift check: within threshold', detail: 'PSI 0.03 · nominal', color: '#5AC8FA', icon: Zap },
                { time: '10:43:02', event: 'Provenance chain intact', detail: '4 hops verified', color: '#34C759', icon: Fingerprint },
                { time: '10:43:18', event: 'Backdoor scan complete', detail: '0 triggers detected', color: '#FF9500', icon: Lock },
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${item.color}20` }}>
                      <Icon size={14} style={{ color: item.color }} strokeWidth={2.4} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-[13px] font-semibold tracking-[-0.01em] truncate">{item.event}</div>
                      <div className="text-white/40 text-[11px] tracking-[-0.01em] truncate mt-0.5">{item.detail}</div>
                    </div>
                    <div className="text-white/30 text-[10px] font-mono tracking-tight flex-shrink-0">{item.time}</div>
                  </motion.div>
                )
              })}
            </div>

            {/* Bottom fade with animated scan */}
            <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
              style={{ background: 'linear-gradient(180deg, transparent, #0F0F14)' }} />
          </motion.div>
        </div>
      </section>

      {/* ===== PIPELINE (Dark) ===== */}
      <section id="pipeline" className="relative bg-[#111114] text-white py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <img src="/images/cyber.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        {/* Background image */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full blur-[200px] opacity-25 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0071E3, transparent 65%)' }} />

        <div className="max-w-[1200px] mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8 }}
            className="text-center max-w-[720px] mx-auto mb-20"
          >
            <div className="text-[#5AC8FA] text-[13px] font-semibold tracking-[0.14em] uppercase mb-4">Pipeline</div>
            <h2 className="text-[56px] font-semibold tracking-[-0.04em] leading-[1.02]">
              Four steps.
              <br />
              <span className="text-white/40">Zero blind spots.</span>
            </h2>
          </motion.div>

          {/* Connecting line behind pipeline */}
          <div className="hidden md:block absolute top-[60px] left-[12%] right-[12%] h-[1px]">
            <motion.div
              initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }}
              viewport={{ once: true }} transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="h-full origin-left"
              style={{ background: 'linear-gradient(90deg, #5AC8FA, #0071E3, #AF52DE, #34C759)', opacity: 0.3 }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {[
              { num: '01', title: 'Ingest', desc: 'Datasets & models registered with SHA-256 binding.', color: '#5AC8FA' },
              { num: '02', title: 'Analyze', desc: 'Integrity, backdoor, drift & robustness checks run.', color: '#0071E3' },
              { num: '03', title: 'Anchor', desc: 'Results committed to the tamper-evident ledger.', color: '#AF52DE' },
              { num: '04', title: 'Assure', desc: 'Signed assurance reports ready for audit.', color: '#34C759' },
            ].map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7, delay: i * 0.1 }}
                className="relative group"
              >
                <div className="text-[64px] font-semibold tracking-[-0.04em] leading-none opacity-20 group-hover:opacity-40 transition-opacity mb-4" style={{ color: s.color }}>{s.num}</div>
                <div className="h-[2px] mb-6 rounded-full" style={{ background: `linear-gradient(90deg, ${s.color}, transparent)` }} />
                <h3 className="text-[24px] font-semibold tracking-[-0.02em]">{s.title}</h3>
                <p className="mt-3 text-[15px] text-white/50 leading-[1.5] tracking-[-0.01em]">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS (Light) ===== */}
      <section className="relative bg-white text-[#1D1D1F] py-32 px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6 text-center">
            {[
              { value: 100, suffix: '%', label: 'Offline' },
              { value: 256, prefix: 'SHA-', label: 'Cryptographic binding' },
              { value: 4, label: 'Verification layers' },
              { value: 100, prefix: '<', suffix: 'ms', label: 'Inference overhead' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7, delay: i * 0.08 }}
                className="group"
              >
                <div className="text-[48px] md:text-[56px] font-semibold tracking-[-0.04em] bg-gradient-to-br from-[#0071E3] to-[#AF52DE] bg-clip-text text-transparent leading-none transition-transform group-hover:scale-105">
                  <CountUp end={s.value} prefix={s.prefix || ''} suffix={s.suffix || ''} duration={1.8} />
                </div>
                <div className="mt-3 text-[12px] uppercase tracking-[0.18em] text-[#86868B] font-semibold">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRUST LOGOS ===== */}
      <section className="relative bg-white py-16 px-6 border-b border-[#E5E5EA]">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="text-center mb-10"
          >
            <span className="text-[#86868B] text-[11px] uppercase tracking-[0.2em] font-semibold">
              Designed for
            </span>
          </motion.div>
          <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-8">
            {[
              'Defence Labs',
              'ISRO',
              'DRDO',
              'Border Security',
              'Surveillance Ops',
              'Critical Infra',
            ].map((name, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.06 }}
                className="text-[#86868B] hover:text-[#1D1D1F] text-[18px] font-semibold tracking-[-0.02em] transition-colors"
              >
                {name}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SEE IT IN ACTION ===== */}
      <section className="relative bg-[#FBFBFD] text-[#1D1D1F] py-32 px-6 overflow-hidden">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8 }}
            className="text-center max-w-[760px] mx-auto mb-20"
          >
            <div className="text-[#AF52DE] text-[13px] font-semibold tracking-[0.14em] uppercase mb-4">See it in action</div>
            <h2 className="text-[56px] font-semibold tracking-[-0.04em] leading-[1.02]">
              The whole pipeline,
              <br />
              <span className="text-[#86868B]">on a single screen.</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-[1000px] mx-auto"
          >
            {/* Floating labels */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-6 -left-6 z-20 hidden md:flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-[#E5E5EA]"
            >
              <div className="w-6 h-6 rounded-lg bg-[#34C759]/15 flex items-center justify-center">
                <Check size={13} className="text-[#34C759]" strokeWidth={3} />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-[#1D1D1F] tracking-[-0.01em]">Data verified</div>
                <div className="text-[10px] text-[#86868B] font-medium">SHA-256 · 12 files</div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
              className="absolute top-1/3 -right-8 z-20 hidden md:flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-[#E5E5EA]"
            >
              <div className="w-6 h-6 rounded-lg bg-[#AF52DE]/15 flex items-center justify-center">
                <Boxes size={13} className="text-[#AF52DE]" strokeWidth={2.4} />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-[#1D1D1F] tracking-[-0.01em]">Model signed</div>
                <div className="text-[10px] text-[#86868B] font-medium">yolov8n.pt · 6.2MB</div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              className="absolute -bottom-6 left-1/4 z-20 hidden md:flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-[#E5E5EA]"
            >
              <div className="w-6 h-6 rounded-lg bg-[#0071E3]/15 flex items-center justify-center">
                <Lock size={13} className="text-[#0071E3]" strokeWidth={2.4} />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-[#1D1D1F] tracking-[-0.01em]">Ledger anchored</div>
                <div className="text-[10px] text-[#86868B] font-medium">Block #1247</div>
              </div>
            </motion.div>

            {/* Glow */}
            <div className="absolute -inset-6 rounded-[40px] opacity-60 blur-3xl"
              style={{ background: 'linear-gradient(135deg, rgba(0,113,227,0.2), rgba(175,82,222,0.15))' }} />

            {/* Screenshot */}
            <div className="relative rounded-[24px] p-[1.5px] bg-gradient-to-tr from-black/[0.08] via-black/[0.02] to-black/[0.08]">
              <div className="rounded-[23px] bg-white overflow-hidden shadow-[0_40px_120px_-20px_rgba(0,0,0,0.2)]">
                {/* Real image preview */}
                <div className="relative aspect-[16/8] overflow-hidden bg-black">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
                      <rect width="1200" height="600" fill="#0f1f0f" />
                      <ellipse cx="350" cy="250" rx="280" ry="200" fill="rgba(52,88,32,0.7)" />
                      <ellipse cx="850" cy="400" rx="320" ry="220" fill="rgba(40,70,25,0.6)" />
                      <ellipse cx="600" cy="480" rx="400" ry="180" fill="rgba(30,60,20,0.5)" />
                      <g transform="translate(430, 200)">
                        <ellipse cx="170" cy="180" rx="120" ry="90" fill="rgba(70,45,20,0.95)" />
                        <circle cx="100" cy="90" r="65" fill="rgba(80,50,22,0.95)" />
                        <circle cx="70" cy="55" r="22" fill="rgba(70,45,20,0.95)" />
                        <circle cx="125" cy="55" r="22" fill="rgba(70,45,20,0.95)" />
                        <circle cx="85" cy="90" r="7" fill="rgba(0,0,0,0.9)" />
                        <circle cx="115" cy="90" r="7" fill="rgba(0,0,0,0.9)" />
                        <ellipse cx="100" cy="110" rx="18" ry="12" fill="rgba(20,10,5,0.9)" />
                      </g>
                    </svg>
                  {/* Fake YOLO bounding box */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.5 }}
                    className="absolute"
                    style={{ top: '35%', left: '22%', width: '38%', height: '45%' }}
                  >
                    <div className="w-full h-full border-2 border-[#34C759] rounded-md relative" style={{ boxShadow: '0 0 20px rgba(52,199,89,0.6)' }}>
                      <div className="absolute -top-7 left-0 px-2 py-1 rounded bg-[#34C759] text-white text-[11px] font-bold tracking-tight">
                        bear 0.94
                      </div>
                    </div>
                  </motion.div>
                  {/* Corner labels */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-pulse" />
                    <span className="text-white text-[10px] font-bold tracking-wider uppercase">Live</span>
                  </div>
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10">
                    <span className="text-white/80 text-[10px] font-mono">1280×720</span>
                  </div>
                  <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10">
                    <span className="text-white/80 text-[10px] font-mono">yolov8n.pt · 47ms</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-5 py-3.5 border-b border-[#F0F0F2]">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                  <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                  <div className="ml-4 text-[11px] text-[#86868B] font-semibold tracking-[-0.01em]">Integrity Dashboard</div>
                  <div className="ml-auto flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#34C759]/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                    <span className="text-[9px] text-[#34C759] font-bold tracking-[0.1em]">LIVE</span>
                  </div>
                </div>
                <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: Database, label: 'Datasets', value: '12', color: '#0071E3' },
                    { icon: Boxes, label: 'Models', value: '3', color: '#AF52DE' },
                    { icon: Cpu, label: 'Inference', value: '847', color: '#34C759' },
                    { icon: Fingerprint, label: 'Trust Score', value: '67%', color: '#FF9500' },
                  ].map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.label} className="rounded-2xl bg-[#F5F5F7] p-5">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${item.color}18` }}>
                          <Icon size={16} style={{ color: item.color }} strokeWidth={2.2} />
                        </div>
                        <div className="mt-4 text-[26px] font-semibold tracking-[-0.03em] text-[#1D1D1F] leading-none">{item.value}</div>
                        <div className="text-[9px] uppercase tracking-[0.15em] text-[#86868B] font-bold mt-2">{item.label}</div>
                      </div>
                    )
                  })}
                </div>
                <div className="px-8 pb-8 space-y-3">
                  {[
                    { label: 'Data integrity', pct: 100, color: '#34C759' },
                    { label: 'Model signature', pct: 82, color: '#0071E3' },
                    { label: 'Provenance chain', pct: 64, color: '#AF52DE' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-3">
                      <span className="text-[11px] text-[#6E6E73] w-32 font-semibold tracking-[-0.01em]">{row.label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-[#E5E5EA] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }} whileInView={{ width: `${row.pct}%` }}
                          viewport={{ once: true }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full rounded-full"
                          style={{ background: row.color }}
                        />
                      </div>
                      <span className="text-[11px] text-[#1D1D1F] font-bold tabular-nums w-9 text-right">{row.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== COMPARISON ===== */}
      <section className="relative bg-white text-[#1D1D1F] py-32 px-6">
        <div className="max-w-[1100px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8 }}
            className="text-center max-w-[720px] mx-auto mb-20"
          >
            <div className="text-[#0071E3] text-[13px] font-semibold tracking-[0.14em] uppercase mb-4">Why CV-Integrity</div>
            <h2 className="text-[56px] font-semibold tracking-[-0.04em] leading-[1.02]">
              Not just another
              <br />
              <span className="text-[#86868B]">monitoring tool.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional */}
            <motion.div
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8 }}
              className="rounded-3xl bg-[#F5F5F7] overflow-hidden"
            >
              <div className="relative h-44 overflow-hidden bg-[#E8E8ED]">
                <img src="/images/dashboard.jpg" alt="" className="absolute inset-0 w-full h-full object-cover grayscale opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#F5F5F7] via-transparent to-transparent" />
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 176" preserveAspectRatio="none">
                    <rect width="400" height="176" fill="#E8E8ED" />
                    <path d="M20,130 L80,100 L140,120 L200,70 L260,150 L320,110 L380,160" stroke="#FF3B30" strokeWidth="2" fill="none" strokeDasharray="4 4" opacity="0.6" />
                    <circle cx="260" cy="150" r="8" fill="#FF3B30" opacity="0.8" />
                    <text x="275" y="145" fontSize="12" fill="#FF3B30" fontFamily="monospace" fontWeight="700">ERROR</text>
                    <path d="M60,50 L75,75 L45,75 Z" fill="#FF3B30" opacity="0.4" />
                    <path d="M340,60 L355,85 L325,85 Z" fill="#FF3B30" opacity="0.4" />
                  </svg>
                <div className="absolute inset-0 bg-gradient-to-t from-[#F5F5F7] via-transparent to-transparent" />
              </div>
              <div className="p-10 pt-4">
              <div className="text-[#86868B] text-[11px] uppercase tracking-[0.18em] font-bold mb-6">Traditional monitoring</div>
              <ul className="space-y-5">
                {[
                  'Trusts the pipeline by default',
                  'Logs stored in mutable databases',
                  'No cryptographic binding',
                  'Cloud-dependent, always online',
                  'Audit trail can be edited',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#FF3B30]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X size={11} className="text-[#FF3B30]" strokeWidth={3} />
                    </div>
                    <span className="text-[15px] text-[#6E6E73] leading-[1.5] tracking-[-0.01em]">{item}</span>
                  </li>
                ))}
              </ul>
              </div>
            </motion.div>

            {/* CV-Integrity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8, delay: 0.1 }}
              className="rounded-3xl p-[1.5px] bg-gradient-to-br from-[#0071E3] via-[#5E5CE6] to-[#AF52DE]"
            >
              <div className="rounded-[22px] bg-[#0F0F14] h-full overflow-hidden">
                <div className="relative h-44 overflow-hidden">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 176" preserveAspectRatio="none">
                    <rect width="400" height="176" fill="#0a1525" />
                    <line x1="80" y1="88" x2="160" y2="88" stroke="#0071E3" strokeWidth="2" opacity="0.5" />
                    <line x1="160" y1="88" x2="240" y2="88" stroke="#0071E3" strokeWidth="2" opacity="0.5" />
                    <line x1="240" y1="88" x2="320" y2="88" stroke="#AF52DE" strokeWidth="2" opacity="0.5" />
                    <rect x="50" y="68" width="40" height="40" rx="6" fill="rgba(90,200,250,0.15)" stroke="#5AC8FA" strokeWidth="1.5" />
                    <text x="70" y="93" fontSize="10" fill="#5AC8FA" textAnchor="middle" fontFamily="monospace" fontWeight="700">#1247</text>
                    <rect x="130" y="68" width="40" height="40" rx="6" fill="rgba(0,113,227,0.15)" stroke="#0071E3" strokeWidth="1.5" />
                    <text x="150" y="93" fontSize="10" fill="#0071E3" textAnchor="middle" fontFamily="monospace" fontWeight="700">#1248</text>
                    <rect x="210" y="68" width="40" height="40" rx="6" fill="rgba(94,92,230,0.15)" stroke="#5E5CE6" strokeWidth="1.5" />
                    <text x="230" y="93" fontSize="10" fill="#5E5CE6" textAnchor="middle" fontFamily="monospace" fontWeight="700">#1249</text>
                    <rect x="290" y="68" width="40" height="40" rx="6" fill="rgba(175,82,222,0.15)" stroke="#AF52DE" strokeWidth="1.5" />
                    <text x="310" y="93" fontSize="10" fill="#AF52DE" textAnchor="middle" fontFamily="monospace" fontWeight="700">#1250</text>
                  </svg>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F14] via-[#0F0F14]/40 to-transparent" />
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-[#34C759]/20 backdrop-blur-xl border border-[#34C759]/40">
                    <span className="text-[#34C759] text-[10px] font-bold tracking-wider uppercase">Secured</span>
                  </div>
                </div>
                <div className="p-10 pt-4">
                <div className="text-[#5AC8FA] text-[11px] uppercase tracking-[0.18em] font-bold mb-6">CV-Integrity</div>
                <ul className="space-y-5">
                  {[
                    'Zero-trust — verify every stage',
                    'Immutable blockchain ledger',
                    'SHA-256 cryptographic binding',
                    'Offline & air-gapped ready',
                    'Tamper-evident audit trail',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#34C759]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={11} className="text-[#34C759]" strokeWidth={3} />
                      </div>
                      <span className="text-[15px] text-white/85 leading-[1.5] tracking-[-0.01em]">{item}</span>
                    </li>
                  ))}
                </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIAL ===== */}
      <section className="relative bg-[#111114] text-white py-40 px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full blur-[200px] opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #AF52DE, transparent 65%)' }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1 }}
          className="relative max-w-[900px] mx-auto text-center"
        >
          <Quote size={40} className="mx-auto text-[#5AC8FA] opacity-50 mb-8" strokeWidth={1.5} />
          <p className="text-[32px] md:text-[40px] font-semibold tracking-[-0.03em] leading-[1.25] text-white/95">
            "In defence pipelines, trust isn't a feature — it's the foundation. CV-Integrity makes every decision auditable, every artifact provable."
          </p>


        </motion.div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="relative bg-[#FBFBFD] text-[#1D1D1F] py-32 px-6">
        <div className="max-w-[820px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="text-[#0071E3] text-[13px] font-semibold tracking-[0.14em] uppercase mb-4">FAQ</div>
            <h2 className="text-[56px] font-semibold tracking-[-0.04em] leading-[1.02]">
              Questions,
              <br />
              <span className="text-[#86868B]">answered.</span>
            </h2>
          </motion.div>

          <div className="space-y-2">
            {[
              { q: 'How does the cryptographic binding work?', a: 'Every artifact — dataset, model, inference output — is hashed with SHA-256 and anchored to a tamper-evident blockchain ledger. Any modification breaks the chain, instantly detectable.' },
              { q: 'Does it work offline?', a: 'Yes. CV-Integrity is designed for air-gapped environments. No cloud dependency, no external API calls, no telemetry. The ledger runs locally and can be exported for offline audit.' },
              { q: 'What checks are performed?', a: 'Contributor trust, data integrity, model provenance, backdoor detection, drift monitoring, robustness testing, and inference auditing — all bound to the same ledger.' },
              { q: 'Which model formats are supported?', a: 'PyTorch, TensorFlow, ONNX, and YOLO formats. The system is extensible and supports custom checkpoints with minimal configuration.' },
              { q: 'Can it integrate with existing pipelines?', a: 'Yes. CV-Integrity exposes a REST API and CLI for CI/CD integration. Both pre-training ingestion and post-deployment inference can be hooked without pipeline changes.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.05 }}
                className="rounded-2xl bg-white border border-[#E5E5EA] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-[#FAFAFA] transition-colors"
                >
                  <span className="text-[16px] font-semibold tracking-[-0.015em] text-[#1D1D1F]">{item.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-[#86868B] flex-shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}
                    strokeWidth={2.2}
                  />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-5 text-[15px] text-[#6E6E73] leading-[1.6] tracking-[-0.01em]">
                    {item.a}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DOCS (Dark) ===== */}
      <section id="docs" className="relative bg-black text-white py-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[700px] h-[700px] rounded-full blur-[200px] opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0071E3, transparent 65%)' }} />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[200px] opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #AF52DE, transparent 65%)' }} />

        <div className="max-w-[1200px] mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8 }}
            className="text-center max-w-[760px] mx-auto mb-20"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 mb-6">
              <Book size={12} className="text-[#5AC8FA]" />
              <span className="text-white/70 text-[11px] font-semibold tracking-tight uppercase">Documentation</span>
            </div>
            <h2 className="text-[56px] font-semibold tracking-[-0.04em] leading-[1.02]">
              Get started
              <br />
              <span className="text-white/40">in minutes.</span>
            </h2>
            <p className="mt-6 text-white/50 text-[18px] leading-[1.5] tracking-[-0.015em]">
              Everything you need to integrate CV-Integrity into your pipeline.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }}
              className="lg:sticky lg:top-24 lg:self-start"
            >
              <div className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold mb-4">On this page</div>
              <nav className="space-y-1">
                {[
                  { id: 'install', label: 'Installation' },
                  { id: 'quickstart', label: 'Quick Start' },
                  { id: 'api', label: 'API Reference' },
                  { id: 'cli', label: 'CLI' },
                  { id: 'arch', label: 'Architecture' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium tracking-[-0.01em] transition-all ${
                      activeTab === item.id
                        ? 'bg-white/[0.06] text-white border border-white/10'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/[0.03]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-8 border-t border-white/[0.06]">
                <a href="#" className="inline-flex items-center gap-2 text-[#5AC8FA] hover:text-white text-[13px] font-medium tracking-[-0.01em] transition-colors">
                  Full docs
                  <ArrowRight size={13} />
                </a>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8, delay: 0.1 }}
              className="rounded-3xl bg-[#0F0F14] border border-white/[0.06] overflow-hidden"
            >
              {/* Tab header */}
              <div className="flex items-center gap-1 px-5 py-3 border-b border-white/[0.06] bg-black/30">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                <div className="ml-4 flex items-center gap-1">
                  <Terminal size={12} className="text-white/40" />
                  <span className="text-white/50 text-[11px] font-mono tracking-tight">{activeTab}.md</span>
                </div>
              </div>

              {/* Content body */}
              <div className="p-8">
                {activeTab === 'install' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-white text-[20px] font-semibold tracking-[-0.02em] mb-2">Installation</h3>
                      <p className="text-white/50 text-[14px] leading-[1.6] tracking-[-0.01em]">
                        Install CV-Integrity via pip. Python 3.10+ required.
                      </p>
                    </div>

                    <div className="rounded-xl bg-black/60 border border-white/[0.06] overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
                        <span className="text-white/40 text-[10px] font-mono uppercase tracking-wider">bash</span>
                        <button
                          onClick={() => copyCode('pip install cv-integrity')}
                          className="flex items-center gap-1.5 text-white/40 hover:text-white text-[11px] font-medium transition-colors"
                        >
                          {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
                        </button>
                      </div>
                      <pre className="px-4 py-4 text-[13px] font-mono text-[#5AC8FA] overflow-x-auto">
                        <span className="text-white/40">$</span> pip install cv-integrity
                      </pre>
                    </div>

                    <div className="rounded-xl bg-black/60 border border-white/[0.06] overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
                        <span className="text-white/40 text-[10px] font-mono uppercase tracking-wider">bash</span>
                        <button
                          onClick={() => copyCode('git clone https://github.com/alwaysarya/CV-INTEGRITY')}
                          className="flex items-center gap-1.5 text-white/40 hover:text-white text-[11px] font-medium transition-colors"
                        >
                          {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
                        </button>
                      </div>
                      <pre className="px-4 py-4 text-[13px] font-mono text-[#5AC8FA] overflow-x-auto">
                        <span className="text-white/40">$</span> git clone https://github.com/alwaysarya/CV-INTEGRITY
                      </pre>
                    </div>
                  </div>
                )}

                {activeTab === 'quickstart' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-white text-[20px] font-semibold tracking-[-0.02em] mb-2">Quick Start</h3>
                      <p className="text-white/50 text-[14px] leading-[1.6] tracking-[-0.01em]">
                        Bind a dataset to the ledger in three lines.
                      </p>
                    </div>

                    <div className="rounded-xl bg-black/60 border border-white/[0.06] overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
                        <span className="text-white/40 text-[10px] font-mono uppercase tracking-wider">python</span>
                        <button
                          onClick={() => copyCode("from cv_integrity import Ledger\n\nledger = Ledger()\nledger.anchor_dataset('coco_val_2017')")}
                          className="flex items-center gap-1.5 text-white/40 hover:text-white text-[11px] font-medium transition-colors"
                        >
                          {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
                        </button>
                      </div>
                      <pre className="px-4 py-4 text-[13px] font-mono text-white/80 overflow-x-auto leading-[1.7]">
{`from cv_integrity import Ledger

ledger = Ledger()
ledger.anchor_dataset("coco_val_2017")`}
                      </pre>
                    </div>

                    <div className="rounded-xl bg-[#34C759]/5 border border-[#34C759]/20 p-4 flex items-start gap-3">
                      <Check size={16} className="text-[#34C759] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                      <div>
                        <div className="text-[#34C759] text-[12px] font-semibold tracking-[-0.01em] mb-1">Success</div>
                        <div className="text-white/60 text-[13px] leading-[1.5] tracking-[-0.01em]">
                          Dataset anchored. Block <span className="text-white/90 font-mono">#1247</span> committed.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'api' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-white text-[20px] font-semibold tracking-[-0.02em] mb-2">API Reference</h3>
                      <p className="text-white/50 text-[14px] leading-[1.6] tracking-[-0.01em]">
                        REST endpoints exposed on <span className="text-white/80 font-mono text-[13px]">localhost:8000</span>.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {[
                        { method: 'POST', path: '/api/datasets/verify', desc: 'Verify dataset integrity & anchor to ledger' },
                        { method: 'POST', path: '/api/models/sign', desc: 'Sign a model artifact with SHA-256' },
                        { method: 'GET', path: '/api/ledger/blocks', desc: 'List committed ledger blocks' },
                        { method: 'POST', path: '/api/inference/audit', desc: 'Audit inference batch with cryptographic record' },
                        { method: 'GET', path: '/api/reports/assurance', desc: 'Generate signed assurance report' },
                      ].map((ep) => (
                        <div key={ep.path} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                          <span className={`text-[10px] font-mono font-bold tracking-wider px-2 py-1 rounded ${
                            ep.method === 'POST' ? 'bg-[#0071E3]/15 text-[#5AC8FA]' : 'bg-[#34C759]/15 text-[#34C759]'
                          }`}>{ep.method}</span>
                          <span className="text-white/85 text-[13px] font-mono tracking-tight flex-shrink-0">{ep.path}</span>
                          <span className="text-white/40 text-[12px] tracking-[-0.01em] ml-auto hidden md:block">{ep.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'cli' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-white text-[20px] font-semibold tracking-[-0.02em] mb-2">CLI</h3>
                      <p className="text-white/50 text-[14px] leading-[1.6] tracking-[-0.01em]">
                        Full pipeline control from the terminal.
                      </p>
                    </div>

                    <div className="rounded-xl bg-black/60 border border-white/[0.06] overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
                        <span className="text-white/40 text-[10px] font-mono uppercase tracking-wider">bash</span>
                        <button
                          onClick={() => copyCode('cv-integrity verify --dataset coco_val_2017 --model yolov8n.pt')}
                          className="flex items-center gap-1.5 text-white/40 hover:text-white text-[11px] font-medium transition-colors"
                        >
                          {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
                        </button>
                      </div>
                      <pre className="px-4 py-4 text-[13px] font-mono text-[#5AC8FA] overflow-x-auto">
                        <span className="text-white/40">$</span> cv-integrity verify --dataset coco_val_2017 --model yolov8n.pt
                      </pre>
                    </div>

                    <div className="space-y-2">
                      {[
                        { cmd: 'cv-integrity anchor <artifact>', desc: 'Anchor any artifact to the ledger' },
                        { cmd: 'cv-integrity report --format=pdf', desc: 'Generate signed PDF assurance report' },
                        { cmd: 'cv-integrity audit --batch <id>', desc: 'Audit a specific inference batch' },
                        { cmd: 'cv-integrity ledger --tail', desc: 'Stream recent ledger activity' },
                      ].map((item) => (
                        <div key={item.cmd} className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                          <span className="text-white/85 text-[12.5px] font-mono tracking-tight">{item.cmd}</span>
                          <span className="text-white/40 text-[12px] tracking-[-0.01em] hidden md:block">{item.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'arch' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-white text-[20px] font-semibold tracking-[-0.02em] mb-2">Architecture</h3>
                      <p className="text-white/50 text-[14px] leading-[1.6] tracking-[-0.01em]">
                        Four layers, fully offline, air-gapped by design.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { layer: 'Layer 1', title: 'Ingestion', desc: 'Datasets & models registered with SHA-256 binding', color: '#5AC8FA' },
                        { layer: 'Layer 2', title: 'Analysis', desc: 'Integrity, backdoor, drift, robustness checks', color: '#0071E3' },
                        { layer: 'Layer 3', title: 'Ledger', desc: 'Tamper-evident blockchain anchoring', color: '#AF52DE' },
                        { layer: 'Layer 4', title: 'Assurance', desc: 'Signed reports, audit trail, exports', color: '#34C759' },
                      ].map((item) => (
                        <div key={item.layer} className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                            <span className="text-white/40 text-[10px] font-mono uppercase tracking-wider">{item.layer}</span>
                          </div>
                          <div className="text-white text-[15px] font-semibold tracking-[-0.015em]">{item.title}</div>
                          <div className="mt-1.5 text-white/50 text-[13px] leading-[1.5] tracking-[-0.01em]">{item.desc}</div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl bg-[#0071E3]/5 border border-[#0071E3]/20 p-4">
                      <div className="text-[#5AC8FA] text-[12px] font-semibold tracking-[-0.01em] mb-1">Zero external dependency</div>
                      <div className="text-white/60 text-[13px] leading-[1.5] tracking-[-0.01em]">
                        No cloud, no telemetry, no external API calls. Runs entirely on your infrastructure.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== CTA (Dark) ===== */}
      <section className="relative bg-black text-white py-40 px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] rounded-full blur-[200px] opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0071E3, transparent 60%)' }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1 }}
          className="relative max-w-[900px] mx-auto text-center"
        >
          <h2 className="text-[64px] md:text-[88px] font-semibold tracking-[-0.045em] leading-[0.98]">
            Ready to verify
            <br />
            <span className="bg-gradient-to-r from-[#5AC8FA] to-[#AF52DE] bg-clip-text text-transparent">
              your pipeline?
            </span>
          </h2>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#overview"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/20 bg-white/[0.04] backdrop-blur-xl text-white text-[15px] font-medium tracking-tight hover:bg-white/[0.08] transition-colors"
            >
              Back to top
            </a>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-white/40 text-[12px]">
            <span className="flex items-center gap-2"><Check size={12} className="text-[#34C759]" /> Offline</span>
            <span className="flex items-center gap-2"><Check size={12} className="text-[#34C759]" /> Air-gapped</span>
            <span className="flex items-center gap-2"><Check size={12} className="text-[#34C759]" /> No cloud</span>
          </div>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-black border-t border-white/[0.06] pt-20 pb-10 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
            <div className="col-span-2 md:col-span-2">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0071E3] to-[#AF52DE] flex items-center justify-center">
                  <ShieldCheck size={16} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="text-white font-semibold text-[14px] tracking-tight">CV-Integrity</span>
              </div>
              <p className="text-white/45 text-[13px] leading-[1.6] tracking-[-0.01em] max-w-[300px]">
                An offline assurance layer for computer vision pipelines. Built for SIH Problem Statement 26228.
              </p>
            </div>

            {[
              { title: 'Product', items: ['Overview', 'Features', 'Pipeline', 'Security'] },
              { title: 'Resources', items: ['Documentation', 'API Reference', 'Whitepaper', 'Changelog'] },
              { title: 'Company', items: ['About', 'Team', 'Contact', 'Press Kit'] },
            ].map((col) => (
              <div key={col.title}>
                <div className="text-white/85 text-[12px] font-semibold tracking-tight mb-5 uppercase">{col.title}</div>
                <ul className="space-y-3">
                  {col.items.map((item) => (
                    <li key={item}>
                      <a href="#" className="text-white/45 hover:text-white/85 text-[13px] tracking-[-0.01em] transition-colors">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-5 text-white/35 text-[12px] tracking-[-0.01em]">
              <span>© 2026 CV-Integrity</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>SIH 26228</span>
            </div>
            <div className="flex items-center gap-5 text-white/35 text-[12px] tracking-[-0.01em]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                Offline
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                Air-gapped
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                No cloud
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
