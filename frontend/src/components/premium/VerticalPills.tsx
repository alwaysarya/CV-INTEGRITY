import { motion } from 'framer-motion'

interface VerticalPillsProps {
  data: { label: string; value: number }[]
  max?: number
  height?: number
}

export function VerticalPills({ data, max = 100, height = 180 }: VerticalPillsProps) {
  return (
    <div className="flex items-end justify-between gap-3 px-2" style={{ height }}>
      {data.map((item, i) => {
        const pillHeight = Math.max((item.value / max) * (height - 50), 30)
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: pillHeight }}
              transition={{ duration: 0.9, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-[36px] rounded-full relative overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, rgba(94, 234, 212, 0.9) 0%, rgba(20, 184, 166, 0.5) 60%, rgba(13, 148, 136, 0.3) 100%)',
                boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.4), 0 0 24px rgba(94, 234, 212, 0.35)',
              }}
            >
              {/* Top highlight */}
              <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-white/40 to-transparent rounded-full" />
              {/* Shine */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-1/2 bg-white/30 blur-md rounded-full" />
            </motion.div>
            <div className="text-[10px] text-slate-500 font-medium tabular-nums">
              {String(i + 1).padStart(2, '0')}
            </div>
          </div>
        )
      })}
    </div>
  )
}
