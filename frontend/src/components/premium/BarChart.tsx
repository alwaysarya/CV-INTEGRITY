import { motion } from 'framer-motion'

interface BarChartProps {
  data: { label: string; value: number }[]
  color?: string
}

export function BarChart({ data, color = '#5EEAD4' }: BarChartProps) {
  const max = Math.max(...data.map(d => d.value), 1)

  return (
    <div className="flex items-end justify-between gap-3 h-40">
      {data.map((item, i) => {
        const height = (item.value / max) * 100
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div className="text-[10px] text-slate-400 font-medium tabular-nums">
              {item.value}
            </div>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="w-full rounded-full relative overflow-hidden"
              style={{
                background: `linear-gradient(180deg, ${color} 0%, ${color}88 100%)`,
                boxShadow: `0 0 20px ${color}40`,
                minHeight: '20px',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
            </motion.div>
            <div className="text-[10px] text-slate-500">{item.label}</div>
          </div>
        )
      })}
    </div>
  )
}
