import { motion } from 'framer-motion'
import { Users, Database, Cpu, Send, CheckCircle, ArrowDown } from 'lucide-react'

export function IntegrityChain() {
  const stages = [
    { name: 'Contributor', desc: 'Source attribution', icon: Users, color: '#5EEAD4' },
    { name: 'Data', desc: 'Dataset quality', icon: Database, color: '#22D3EE' },
    { name: 'Model', desc: 'Weight integrity', icon: Cpu, color: '#A78BFA' },
    { name: 'Inference', desc: 'I/O binding', icon: Send, color: '#FBBF24' },
    { name: 'Output', desc: 'Tamper check', icon: CheckCircle, color: '#34D399' },
  ]

  return (
    <div className="space-y-3">
      {stages.map((stage, i) => {
        const Icon = stage.icon
        return (
          <div key={stage.name}>
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group relative p-3 rounded-2xl border transition-all hover:scale-[1.02]"
              style={{
                background: `linear-gradient(135deg, ${stage.color}08 0%, rgba(15, 31, 31, 0.6) 100%)`,
                borderColor: `${stage.color}25`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative"
                  style={{
                    background: `${stage.color}15`,
                    border: `1px solid ${stage.color}40`,
                    boxShadow: `0 0 16px ${stage.color}20`,
                  }}
                >
                  <Icon size={16} style={{ color: stage.color }} strokeWidth={2} />
                  <div
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: stage.color }}
                  >
                    <CheckCircle size={10} className="text-[#0A1414]" strokeWidth={3} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-semibold">{stage.name}</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">{stage.desc}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: stage.color }}>
                    Stage {i + 1}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Passing</div>
                </div>
              </div>
            </motion.div>

            {i < stages.length - 1 && (
              <div className="flex justify-center my-1">
                <ArrowDown size={12} className="text-slate-700" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
