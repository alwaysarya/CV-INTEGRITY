import { motion } from 'framer-motion'

interface PillBarChartProps {
  data: { label: string; value: number }[]
  max?: number
}

export function PillBarChart({ data, max = 100 }: PillBarChartProps) {
  return (
    <div className="flex items-end justify-between gap-2 h-48">
      {data.map((item, i) => {
        const height = Math.min((item.value / max) * 100, 100)
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div className="text-[10px] text-teal-400 font-medium tabular-nums">
              {item.value}%
            </div>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
              className="w-full max-w-[28px] rounded-full relative overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, #5EEAD4 0%, #14B8A6 60%, #0D9488 100%)',
                boxShadow: '0 0 24px rgba(94, 234, 212, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
                minHeight: '20px',
              }}
            >
              {/* Inner highlight */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/3 bg-white/30 rounded-full blur-sm" />
            </motion.div>
            <div className="text-[10px] text-slate-500 font-medium">{item.label}</div>
          </div>
        )
      })}
    </div>
  )
}
