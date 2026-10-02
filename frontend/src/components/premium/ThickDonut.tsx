import { motion } from 'framer-motion'

interface ThickDonutProps {
  value: number
  total: number
  label: string
  color?: string
  size?: number
}

export function ThickDonut({ value, total, label, color = '#5EEAD4', size = 140 }: ThickDonutProps) {
  const percentage = (value / total) * 100
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
          <defs>
            <linearGradient id={`td-${color}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor="#0D9488" />
            </linearGradient>
            <filter id={`glow-${color}`}>
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="14"
          />
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={`url(#td-${color})`}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            filter={`url(#glow-${color})`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-white tabular-nums leading-none">{value}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-[0.15em] mt-1 font-medium">
            {label}
          </div>
        </div>
      </div>
    </div>
  )
}
