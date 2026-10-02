import { motion } from 'framer-motion'

interface MetricPillsProps {
  items: { label: string; value: number; max: number; color: string }[]
}

export function MetricPills({ items }: MetricPillsProps) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const pct = Math.min((item.value / item.max) * 100, 100)
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-400 text-xs font-medium">{item.label}</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-white text-sm font-bold tabular-nums">{item.value}</span>
                <span className="text-[9px] text-slate-500">/ {item.max}</span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800/60 overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: 'easeOut' }}
                className="h-full rounded-full relative"
                style={{
                  background: `linear-gradient(90deg, ${item.color}, ${item.color}99)`,
                  boxShadow: `0 0 10px ${item.color}50`,
                }}
              />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
