import { motion } from 'framer-motion'
import { ShieldCheck, ArrowUpRight } from 'lucide-react'

type Props = { backendOnline: boolean; stats: any; systemTrust: number }

/* ===== VARIANT 1: Orbital Rings ===== */
export function HeroOrbital({ backendOnline, stats, systemTrust }: Props) {
  return (
    <section className="relative overflow-hidden bg-[#0A0A0F] py-32 px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] rounded-full blur-[200px] opacity-25"
          style={{ background: 'radial-gradient(circle, #0071E3, transparent 60%)' }} />
        <div className="absolute bottom-[-20%] right-[20%] w-[700px] h-[700px] rounded-full blur-[200px] opacity-20"
          style={{ background: 'radial-gradient(circle, #AF52DE, transparent 60%)' }} />
      </div>

      <div className="relative mx-auto max-w-[1200px] flex flex-col items-center text-center">
        {/* Orbital emblem */}
        <div className="relative mb-16 flex h-[280px] w-[280px] items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute h-[280px] w-[280px]"
          >
            <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-gradient-to-b from-[#5AC8FA] via-transparent to-transparent rounded-full" />
          </motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute h-[220px] w-[220px]"
          >
            <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-gradient-to-b from-[#AF52DE] via-transparent to-transparent rounded-full" />
          </motion.div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute h-[160px] w-[160px]"
          >
            <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-gradient-to-b from-[#34C759] via-transparent to-transparent rounded-full" />
          </motion.div>
          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl"
            style={{ background: 'linear-gradient(135deg, #0071E3, #AF52DE)', boxShadow: '0 0 80px rgba(0,113,227,0.6)' }}>
            <ShieldCheck size={48} className="text-white" strokeWidth={2} />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 backdrop-blur-xl"
        >
          <span className={`h-1.5 w-1.5 rounded-full ${backendOnline ? 'animate-pulse bg-[#34C759]' : 'bg-[#FF3B30]'}`}
            style={{ boxShadow: backendOnline ? '0 0 10px #34C759' : 'none' }} />
          <span className="text-[11px] font-semibold tracking-[0.18em] text-white/60">
            {backendOnline ? 'SYSTEM ONLINE' : 'OFFLINE'}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[1000px] text-[72px] md:text-[96px] font-semibold leading-[0.98] tracking-[-0.045em] text-white"
        >
          Vision Integrity,
          <br />
          <span className="bg-gradient-to-r from-[#2DD4BF] via-[#10B981] to-[#34C759] bg-clip-text text-transparent">
            Assured.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8 max-w-[620px] text-[20px] font-medium leading-[1.5] tracking-[-0.015em] text-white/50"
        >
          Real-time assurance for computer vision pipelines — from dataset to deployment.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
        >
          <a href="#dashboard" className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold text-black transition-all hover:scale-[1.03]"
            style={{ boxShadow: '0 0 60px rgba(255,255,255,0.3)' }}>
            Open Dashboard
            <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
          </a>
          <a href="/video" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-7 py-3.5 text-[15px] font-medium text-white/90 backdrop-blur-xl transition-all hover:scale-[1.03] hover:bg-white/[0.08]">
            View Live Vision
          </a>
        </motion.div>
      </div>
    </section>
  )
}

/* ===== VARIANT 2: Neon Blob ===== */
export function HeroNeonBlob({ backendOnline }: Props) {
  return (
    <section className="relative overflow-hidden bg-[#FAFAFA] py-32 px-6">
      <div className="relative mx-auto max-w-[1200px] flex flex-col items-center text-center">
        <div className="relative mb-14 flex h-[300px] w-[300px] items-center justify-center">
          {/* Blob layers */}
          <motion.div
            animate={{ scale: [1, 1.08, 1], rotate: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute h-[300px] w-[300px] rounded-full opacity-60 blur-3xl"
            style={{ background: 'radial-gradient(circle, #AF52DE, transparent 60%)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.12, 1], rotate: [0, -10, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute h-[260px] w-[260px] rounded-full opacity-70 blur-3xl"
            style={{ background: 'radial-gradient(circle, #5AC8FA, transparent 60%)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute h-[220px] w-[220px] rounded-full opacity-60 blur-3xl"
            style={{ background: 'radial-gradient(circle, #34C759, transparent 60%)' }}
          />
          <div className="relative flex h-32 w-32 items-center justify-center rounded-[32px] backdrop-blur-2xl"
            style={{ background: 'rgba(255,255,255,0.9)', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
            <div className="flex flex-col items-center gap-2">
              <ShieldCheck size={40} className="text-[#0071E3]" strokeWidth={2} />
              <span className="text-[9px] font-bold tracking-[0.2em] text-[#86868B]">VERIFIED</span>
            </div>
          </div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[1000px] text-[72px] md:text-[96px] font-semibold leading-[0.98] tracking-[-0.045em] text-[#1D1D1F]"
        >
          Vision Integrity,
          <br />
          <span className="bg-gradient-to-r from-[#2DD4BF] via-[#10B981] to-[#34C759] bg-clip-text text-transparent">
            Assured.
          </span>
        </motion.h1>

        <p className="mt-8 max-w-[620px] text-[20px] font-medium leading-[1.5] tracking-[-0.015em] text-[#6E6E73]">
          Real-time assurance for computer vision pipelines — from dataset to deployment.
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <a href="#dashboard" className="group inline-flex items-center gap-2 rounded-full bg-[#0071E3] px-7 py-3.5 text-[15px] font-semibold text-white transition-all hover:scale-[1.03]"
            style={{ boxShadow: '0 12px 40px -8px rgba(0,113,227,0.6)' }}>
            Open Dashboard
            <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
          </a>
          <a href="/video" className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-7 py-3.5 text-[15px] font-medium text-[#1D1D1F] transition-all hover:scale-[1.03]">
            View Live Vision
          </a>
        </div>
      </div>
    </section>
  )
}

/* ===== VARIANT 3: Constellation ===== */
export function HeroConstellation({ backendOnline, stats, systemTrust }: Props) {
  return (
    <section className="relative overflow-hidden bg-black min-h-[700px] flex items-center">
      {/* Network constellation */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1400 700" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#5AC8FA" stopOpacity="1" />
            <stop offset="100%" stopColor="#5AC8FA" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Connection lines */}
        {[
          [200, 150, 500, 200], [500, 200, 850, 180], [850, 180, 1200, 250],
          [200, 150, 350, 400], [350, 400, 600, 500], [600, 500, 900, 550],
          [900, 550, 1200, 500], [500, 200, 600, 500], [850, 180, 900, 550],
          [1200, 250, 1200, 500], [350, 400, 500, 200],
        ].map(([x1, y1, x2, y2], i) => (
          <motion.line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#0071E3" strokeWidth="1" opacity="0.3"
            animate={{ opacity: [0.1, 0.5, 0.1] }}
            transition={{ duration: 4, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
          />
        ))}
        {/* Nodes */}
        {[
          [200, 150], [500, 200], [850, 180], [1200, 250],
          [350, 400], [600, 500], [900, 550], [1200, 500],
        ].map(([cx, cy], i) => (
          <g key={`node-${i}`}>
            <circle cx={cx} cy={cy} r="20" fill="url(#nodeGlow)" opacity="0.3" />
            <motion.circle
              cx={cx} cy={cy} r="4"
              fill="#5AC8FA"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
            />
          </g>
        ))}
      </svg>

      <div className="relative mx-auto max-w-[1200px] px-6 py-32 flex flex-col items-center text-center w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 backdrop-blur-xl"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#34C759] animate-pulse" style={{ boxShadow: '0 0 10px #34C759' }} />
          <span className="text-[11px] font-semibold tracking-[0.18em] text-white/70">Connected · Real-time Assurance Network</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[1000px] text-[72px] md:text-[96px] font-semibold leading-[0.98] tracking-[-0.045em] text-white"
        >
          Vision Integrity,
          <br />
          <span className="bg-gradient-to-r from-[#2DD4BF] via-[#10B981] to-[#34C759] bg-clip-text text-transparent">
            Assured.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-8 max-w-[620px] text-[20px] font-medium leading-[1.5] tracking-[-0.015em] text-white/50"
        >
          Real-time assurance for computer vision pipelines — from dataset to deployment.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
        >
          <a href="#dashboard" className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold text-black transition-all hover:scale-[1.03]">
            Open Dashboard
            <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
          </a>
          <a href="/video" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-7 py-3.5 text-[15px] font-medium text-white/90 backdrop-blur-xl transition-all hover:scale-[1.03] hover:bg-white/[0.08]">
            View Live Vision
          </a>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1 }}
          className="mt-20 grid w-full max-w-[900px] grid-cols-2 gap-y-10 md:grid-cols-4"
        >
          {[
            ['Trust Score', `${systemTrust.toFixed(1)}%`, '#5AC8FA'],
            ['Datasets', String(stats.datasets), '#34C759'],
            ['Models', String(stats.models), '#AF52DE'],
            ['Ledger Blocks', String(stats.blocks), '#0071E3'],
          ].map(([label, value, color]: any) => (
            <div key={label} className="text-center">
              <div className="text-[48px] font-semibold leading-none tracking-[-0.04em] text-white" style={{ textShadow: `0 0 40px ${color}80` }}>{value}</div>
              <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ===== VARIANT 4: Icon Grid ===== */
export function HeroIconGrid({ backendOnline }: Props) {
  return (
    <section className="relative overflow-hidden bg-white py-32 px-6">
      <div className="relative mx-auto max-w-[1200px] flex flex-col items-center text-center">
        {/* Icon grid */}
        <div className="grid grid-cols-4 gap-3 mb-16">
          {[
            { icon: ShieldCheck, color: '#0071E3', active: true },
            { icon: null, color: '#FF3B30', iconChar: '⌐' },
            { icon: null, color: '#34C759', iconChar: '◉' },
            { icon: null, color: '#AF52DE', iconChar: '◈' },
            { icon: null, color: '#FF9500', iconChar: '△' },
            { icon: null, color: '#5AC8FA', iconChar: '◎' },
            { icon: null, color: '#5E5CE6', iconChar: '◐' },
            { icon: null, color: '#34C759', iconChar: '✓' },
            { icon: null, color: '#AF52DE', iconChar: '◇' },
            { icon: null, color: '#FFCC00', iconChar: '✓' },
            { icon: null, color: '#5AC8FA', iconChar: '▤' },
            { icon: null, color: '#FF3B30', iconChar: '◎' },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                whileHover={{ scale: 1.1, y: -4 }}
                className="flex h-20 w-20 items-center justify-center rounded-2xl transition-all"
                style={{
                  background: item.active ? `linear-gradient(135deg, ${item.color}, #0058B0)` : `${item.color}10`,
                  boxShadow: item.active ? `0 12px 40px ${item.color}50` : 'none',
                }}
              >
                {Icon ? (
                  <Icon size={32} className="text-white" strokeWidth={2} />
                ) : (
                  <span className="text-[28px] font-bold" style={{ color: item.active ? 'white' : item.color }}>{item.iconChar}</span>
                )}
              </motion.div>
            )
          })}
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[1000px] text-[72px] md:text-[88px] font-semibold leading-[0.98] tracking-[-0.045em] text-[#1D1D1F]"
        >
          Vision Integrity, Assured.
        </motion.h1>

        <p className="mt-8 max-w-[620px] text-[20px] font-medium leading-[1.5] tracking-[-0.015em] text-[#6E6E73]">
          Real-time assurance for computer vision pipelines — from dataset to deployment.
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <a href="#dashboard" className="group inline-flex items-center gap-2 rounded-full bg-[#0071E3] px-7 py-3.5 text-[15px] font-semibold text-white transition-all hover:scale-[1.03]"
            style={{ boxShadow: '0 12px 40px -8px rgba(0,113,227,0.6)' }}>
            Open Dashboard
            <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
          </a>
          <a href="/video" className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-7 py-3.5 text-[15px] font-medium text-[#1D1D1F] transition-all hover:scale-[1.03]">
            View Live Vision
          </a>
        </div>
      </div>
    </section>
  )
}

/* ===== VARIANT 5: Cosmic Void (current) ===== */
export function HeroCosmic({ backendOnline }: Props) {
  return (
    <section className="relative overflow-hidden bg-black py-32 px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-25%] left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full blur-[220px] opacity-30"
          style={{ background: 'radial-gradient(circle, #0071E3, transparent 60%)' }} />
        <div className="absolute bottom-[-20%] right-[10%] w-[900px] h-[900px] rounded-full blur-[220px] opacity-25"
          style={{ background: 'radial-gradient(circle, #AF52DE, transparent 60%)' }} />
      </div>
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1400 900" preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: 50 }).map((_, i) => {
          const x = (i * 173.7) % 1400
          const y = (i * 91.3) % 900
          const r = (i % 3) * 0.5 + 0.6
          const dur = 2.5 + (i % 4)
          return (
            <motion.circle
              key={`s-${i}`}
              cx={x} cy={y} r={r}
              fill="white"
              animate={{ opacity: [0.15, 0.85, 0.15] }}
              transition={{ duration: dur, repeat: Infinity, delay: (i % 8) * 0.4, ease: 'easeInOut' }}
            />
          )
        })}
      </svg>
      <div className="relative mx-auto max-w-[1200px] flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 backdrop-blur-xl"
        >
          <span className={`h-1.5 w-1.5 rounded-full ${backendOnline ? 'animate-pulse bg-[#34C759]' : 'bg-[#FF3B30]'}`}
            style={{ boxShadow: backendOnline ? '0 0 10px #34C759' : 'none' }} />
          <span className="text-[11px] font-semibold tracking-[0.18em] text-white/60">{backendOnline ? 'SYSTEM ONLINE' : 'OFFLINE'}</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="max-w-[1000px] text-[72px] md:text-[96px] font-semibold leading-[0.98] tracking-[-0.045em] text-white"
        >
          Vision Integrity,
          <br />
          <motion.span
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block bg-gradient-to-r from-[#2DD4BF] via-[#10B981] via-[#34C759] to-[#2DD4BF] bg-clip-text text-transparent bg-[length:200%_100%]"
          >
            Assured.
          </motion.span>
        </motion.h1>
        <p className="mt-8 max-w-[620px] text-[20px] font-medium leading-[1.5] tracking-[-0.015em] text-white/50">
          Real-time assurance for computer vision pipelines — from dataset to deployment.
        </p>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <a href="#dashboard" className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold text-black transition-all hover:scale-[1.03]"
            style={{ boxShadow: '0 0 60px rgba(255,255,255,0.3)' }}>
            Open Dashboard
            <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
          </a>
          <a href="/video" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-7 py-3.5 text-[15px] font-medium text-white/90 backdrop-blur-xl transition-all hover:scale-[1.03] hover:bg-white/[0.08]">
            View Live Vision
          </a>
        </div>
      </div>
    </section>
  )
}
