import { motion } from 'framer-motion'
import { ShieldCheck, ArrowRight, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import heroImg from '@/assets/hero.png'

export function HeroBanner() {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl border border-teal-500/20 p-8 lg:p-10"
      style={{
        background: 'linear-gradient(135deg, rgba(15, 31, 31, 0.9) 0%, rgba(13, 148, 136, 0.15) 50%, rgba(8, 20, 20, 0.95) 100%)',
      }}
    >
      {/* Ambient glows */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-teal-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(94, 234, 212, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(94, 234, 212, 0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left: Content */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 mb-5"
          >
            <Sparkles size={12} className="text-teal-400" />
            <span className="text-teal-300 text-[10px] uppercase tracking-[0.2em] font-medium">
              AI Integrity Command Center
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl lg:text-4xl font-semibold text-white tracking-tight leading-[1.15] mb-4"
          >
            Verify every stage of your{' '}
            <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
              computer vision
            </span>{' '}
            pipeline.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-slate-400 text-sm leading-relaxed mb-6 max-w-lg"
          >
            Offline assurance layer for SIH Problem Statement 26228. Checks contributors, data, models, inference, and output — before any of it gets deployed.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center gap-3 flex-wrap"
          >
            <button
              onClick={() => navigate('/datasets')}
              className="group flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 text-[#0A1414] text-sm font-semibold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-all"
            >
              Start Verification
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-500/[0.08] border border-teal-500/20 text-teal-300 text-sm font-medium hover:bg-teal-500/[0.15] hover:border-teal-500/40 transition-all"
            >
              View Reports
            </button>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex items-center gap-6 mt-6 pt-6 border-t border-teal-500/[0.08]"
          >
            {[
              { label: 'Offline', value: '100%' },
              { label: 'Encrypted', value: 'SHA-256' },
              { label: 'Compliant', value: 'NIST' },
            ].map((item, i) => (
              <div key={i}>
                <div className="text-white text-sm font-semibold">{item.value}</div>
                <div className="text-slate-500 text-[10px] uppercase tracking-wider mt-0.5">{item.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative flex items-center justify-center"
        >
          {/* Glow behind image */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/30 to-cyan-500/20 rounded-full blur-[80px] scale-75" />

          {/* Image with animation */}
          <motion.img
            src={heroImg}
            alt="CV-Integrity Hero"
            className="relative w-full max-w-md h-auto object-contain drop-shadow-2xl"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Floating badge top right */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="absolute top-4 right-4 glass-card px-3 py-2 flex items-center gap-2"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
              <ShieldCheck size={12} className="text-[#0A1414]" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[9px] text-slate-500 uppercase tracking-wider">Trust</div>
              <div className="text-teal-300 text-xs font-bold">Verified</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
