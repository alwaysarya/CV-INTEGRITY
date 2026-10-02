import { motion } from 'framer-motion'

interface MiniPillsProps {
  items: { label: string; value: string | number }[]
  color?: string
}

export function MiniPills({ items, color = '#5EEAD4' }: MiniPillsProps) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          className="p-2 rounded-xl text-center"
          style={{
            background: `${color}08`,
            border: `1px solid ${color}20`,
          }}
        >
          <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5">
            {item.label}
          </div>
          <div className="text-xs font-bold tabular-nums" style={{ color }}>
            {item.value}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
