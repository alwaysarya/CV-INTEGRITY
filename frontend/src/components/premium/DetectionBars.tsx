import { motion } from 'framer-motion'

interface DetectionBarsProps {
  data: { label: string; value: number }[]
}

export function DetectionBars({ data }: DetectionBarsProps) {
  const max = 100

  return (
    <div className="space-y-5">
      {data.map((item, i) => {
        const color = item.value >= 92 ? '#5EEAD4' : item.value >= 88 ? '#22D3EE' : '#FBBF24'

        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold"
                  style={{
                    background: `${color}15`,
                    border: `1px solid ${color}30`,
                    color: color,
                  }}
                >
                  {i + 1}
                </div>
                <span className="text-white text-sm font-medium">{item.label} Detection</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold tabular-nums" style={{ color }}>
                  {item.value}
                </span>
                <span className="text-xs" style={{ color }}>%</span>
              </div>
            </div>

            <div className="h-2 rounded-full bg-slate-800/60 overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / max) * 100}%` }}
                transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                className="h-full rounded-full relative"
                style={{
                  background: `linear-gradient(90deg, ${color}, ${color}99)`,
                  boxShadow: `0 0 12px ${color}60`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              </motion.div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
