import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function CTACard() {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.0 }}
      onClick={() => navigate('/datasets')}
      className="relative overflow-hidden rounded-3xl p-6 cursor-pointer group h-full min-h-[280px]"
      style={{
        background: 'linear-gradient(135deg, #5EEAD4 0%, #14B8A6 50%, #0D9488 100%)',
        boxShadow: '0 20px 60px rgba(20, 184, 166, 0.3)',
      }}
    >
      {/* Ambient lighter spots */}
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-white/10 rounded-full blur-[60px] pointer-events-none" />

      <div className="relative h-full flex flex-col justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#0A1414]/20 border border-[#0A1414]/20 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0A1414] animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.15em] text-[#0A1414] font-bold">Start Now</span>
          </div>

          <h3 className="text-3xl font-semibold tracking-tight leading-[1.1] text-[#0A1414] mb-3">
            Ready to achieve<br />excellence?
          </h3>

          <p className="text-[#0A1414]/70 text-xs leading-relaxed">
            Upload your dataset and get a complete integrity report in seconds.
          </p>
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-[#0A1414] text-xs font-medium">Verify now</span>
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-11 h-11 rounded-full bg-[#0A1414] flex items-center justify-center shadow-lg"
          >
            <ArrowRight size={18} className="text-teal-400 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
