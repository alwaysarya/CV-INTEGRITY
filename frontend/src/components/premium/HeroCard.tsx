import { motion } from 'framer-motion'
import { ShieldCheck, Lock, Zap } from 'lucide-react'

export function HeroCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.9 }}
      className="glass-card p-6 relative overflow-hidden h-full min-h-[280px]"
    >
      {/* Ambient glow */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-teal-500/[0.12] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-cyan-500/[0.08] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative h-full flex flex-col justify-between">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
              <ShieldCheck size={16} className="text-[#0A1414]" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-teal-400/80 font-medium">AI-Enhanced</span>
          </div>
          <h3 className="text-2xl font-semibold text-white tracking-tight leading-tight mb-2">
            Integrity Score
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Every dataset, model, and inference output is cryptographically verified before deployment.
          </p>
        </div>

        {/* Central visual — shield with pulse */}
        <div className="flex-1 flex items-center justify-center my-4">
          <div className="relative">
            {/* Outer pulse rings */}
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full bg-teal-500/20"
            />
            <motion.div
              animate={{ scale: [1, 1.7, 1], opacity: [0.2, 0, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute inset-0 rounded-full bg-teal-500/10"
            />

            {/* Center shield */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-2xl shadow-teal-500/40"
            >
              <ShieldCheck size={36} className="text-[#0A1414]" strokeWidth={2} />
            </motion.div>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-xl bg-[#0F1F1F]/60 border border-teal-500/[0.08]">
            <div className="flex items-center gap-1.5 mb-1">
              <Lock size={10} className="text-teal-400" />
              <span className="text-[9px] uppercase tracking-wider text-slate-500">Hash</span>
            </div>
            <div className="text-white text-xs font-semibold">SHA-256</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0F1F1F]/60 border border-teal-500/[0.08]">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap size={10} className="text-teal-400" />
              <span className="text-[9px] uppercase tracking-wider text-slate-500">Status</span>
            </div>
            <div className="text-teal-400 text-xs font-semibold">Active</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
