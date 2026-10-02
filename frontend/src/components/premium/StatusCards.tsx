import { motion } from 'framer-motion'
import { Link as LinkIcon, WifiOff, ShieldCheck, CheckCircle } from 'lucide-react'

interface StatusCardsProps {
  blocks: number
}

export function StatusCards({ blocks }: StatusCardsProps) {
  const items = [
    {
      label: 'Ledger',
      value: `${blocks} blocks`,
      sub: 'SHA-256 chain valid',
      icon: LinkIcon,
      color: '#A78BFA',
    },
    {
      label: 'Network',
      value: 'Offline',
      sub: 'No cloud · No external APIs',
      icon: WifiOff,
      color: '#22D3EE',
    },
    {
      label: 'Compliance',
      value: 'Aligned',
      sub: 'NIST AI RMF · EU AI Act',
      icon: ShieldCheck,
      color: '#5EEAD4',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((item, i) => {
        const Icon = item.icon
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            whileHover={{ y: -3 }}
            className="relative overflow-hidden rounded-2xl p-5 group"
            style={{
              background: `linear-gradient(135deg, ${item.color}08 0%, rgba(15, 31, 31, 0.7) 100%)`,
              border: `1px solid ${item.color}20`,
            }}
          >
            {/* Glow */}
            <div
              className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-[80px] opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ background: `${item.color}25` }}
            />

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `${item.color}15`,
                    border: `1px solid ${item.color}30`,
                  }}
                >
                  <Icon size={18} style={{ color: item.color }} strokeWidth={2} />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full dot-live" style={{ background: item.color }} />
                  <CheckCircle size={12} style={{ color: item.color }} />
                </div>
              </div>

              <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-medium mb-1.5">
                {item.label}
              </div>
              <div className="text-white text-xl font-semibold mb-1">{item.value}</div>
              <div className="text-[11px] font-medium" style={{ color: item.color, opacity: 0.8 }}>
                {item.sub}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
