import { motion } from 'framer-motion'

interface VerticalPillChartProps {
  data: { label: string; value: number }[]
  max?: number
  height?: number
}

export function VerticalPillChart({ data, max = 100, height = 220 }: VerticalPillChartProps) {
  const getGradient = (value: number) => {
    if (value >= 92) return { from: '#5EEAD4', to: '#14B8A6' }
    if (value >= 88) return { from: '#22D3EE', to: '#0891B2' }
    return { from: '#FBBF24', to: '#D97706' }
  }

  return (
    <div className="flex items-end justify-between gap-4 px-2" style={{ height }}>
      {data.map((item, i) => {
        const pillHeight = Math.max((item.value / max) * (height - 60), 40)
        const grad = getGradient(item.value)

        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-3">
            {/* Value label */}
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="text-xs font-bold tabular-nums"
              style={{ color: grad.from }}
            >
              {item.value}%
            </motion.div>

            {/* Pill */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: pillHeight }}
              transition={{ duration: 1, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-[44px] rounded-full relative overflow-hidden"
              style={{
                background: `linear-gradient(180deg, ${grad.from} 0%, ${grad.to} 100%)`,
                boxShadow: `0 0 28px ${grad.from}50, inset 0 2px 4px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.2)`,
              }}
            >
              {/* Top highlight */}
              <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/40 to-transparent rounded-full pointer-events-none" />
              {/* Left shine */}
              <div className="absolute top-1 left-1 w-2 h-1/2 bg-white/30 rounded-full blur-sm pointer-events-none" />
            </motion.div>

            {/* Label */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold"
            >
              {item.label}
            </motion.div>
          </div>
        )
      })}
    </div>
  )
}
