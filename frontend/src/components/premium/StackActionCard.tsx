import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

interface StackActionCardProps {
  to: string
  title: string
  desc: string
  count?: number | string
  countLabel?: string
  icon: ReactNode
  color: string
  delay?: number
}

export function StackActionCard({
  to, title, desc, count, countLabel = 'ITEMS', icon, color, delay = 0,
}: StackActionCardProps) {
  return (
    <Link to={to}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ scale: 1.01, y: -2 }}
        className="group relative overflow-hidden rounded-2xl p-4 transition-all cursor-pointer"
        style={{
          background: `linear-gradient(135deg, ${color}10 0%, rgba(15, 31, 31, 0.85) 50%, rgba(8, 20, 20, 0.9) 100%)`,
          border: `1px solid ${color}20`,
          boxShadow: `0 4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 ${color}15`,
        }}
      >
        {/* Ambient glow */}
        <div
          className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-[80px] opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none"
          style={{ background: color }}
        />

        {/* Wave pattern on the right */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 pointer-events-none overflow-hidden">
          <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`wave-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,50 Q50,20 100,50 T200,50 L200,100 L0,100 Z"
              fill={`url(#wave-${title})`}
            />
          </svg>
        </div>

        <div className="relative flex items-center gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            {icon}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-sm">{title}</div>
            <div className="text-slate-400 text-xs mt-0.5 truncate">{desc}</div>
          </div>

          {/* Count + arrow */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {count !== undefined && (
              <div className="text-right">
                <div className="text-white text-lg font-bold tabular-nums leading-none">{count}</div>
                <div className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">{countLabel}</div>
              </div>
            )}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
              style={{
                background: `${color}20`,
                border: `1px solid ${color}40`,
              }}
            >
              <ArrowRight size={14} className="text-white group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
