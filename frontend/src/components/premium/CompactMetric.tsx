import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { DatasetIcon } from './DatasetIcon'
import { ModelIcon } from './ModelIcon'
import { LedgerIcon } from './LedgerIcon'
import { TrustIcon } from './TrustIcon'

interface CompactMetricProps {
  value: number
  label: string
  change?: string
  suffix?: string
  color?: string
  trend?: number[]
  iconType?: 'dataset' | 'model' | 'ledger' | 'trust'
}

export function CompactMetric({
  value, label, change = '+12%', suffix = '', color = '#5EEAD4', trend = [],
  iconType,
}: CompactMetricProps) {
  const safeTrend = trend.length >= 2 ? trend : [0, 0]

  const max = Math.max(...safeTrend, 1)
  const min = Math.min(...safeTrend, 0)
  const range = max - min || 1
  const width = 100
  const height = 40
  const step = width / Math.max(safeTrend.length - 1, 1)

  const points = safeTrend.map((v, i) => {
    const x = i * step
    const y = height - ((v - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  const areaPoints = `0,${height} ${points} ${width},${height}`

  const renderIcon = () => {
    switch (iconType) {
      case 'dataset': return <DatasetIcon size={80} color={color} showBadge={false} glow={true} />
      case 'model': return <ModelIcon size={80} color={color} glow={true} />
      case 'ledger': return <LedgerIcon size={80} color={color} glow={true} />
      case 'trust': return <TrustIcon size={80} color={color} glow={true} />
      default: return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4 }}
      className="group relative flex flex-col p-2"
      style={{ minHeight: 200 }}
    >
      <div className="flex items-start justify-between mb-3">
        <motion.div
          whileHover={{ scale: 1.08, rotate: 3 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {renderIcon()}
        </motion.div>

        <div className="flex items-center gap-1 text-xs font-semibold mt-3" style={{ color }}>
          <TrendingUp size={12} strokeWidth={2.5} />
          {change}
        </div>
      </div>

      <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">
        {label}
      </div>

      <div className="text-5xl font-bold text-white tracking-tight tabular-nums leading-none mb-5">
        <AnimatedCounter value={value} suffix={suffix} />
      </div>

      <div className="-mx-1 mt-auto" style={{ height: 44 }}>
        <svg
          width="100%"
          height="44"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          style={{ display: 'block' }}
        >
          <defs>
            <linearGradient id={`cg-${label.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={areaPoints} fill={`url(#cg-${label.replace(/\s+/g, '-')})`} />
          <motion.polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
          />
        </svg>
      </div>
    </motion.div>
  )
}
