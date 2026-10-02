import { motion } from 'framer-motion'
import flowerImg from '@/assets/flower.png'

export function GlassStackIllustration() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full h-full relative overflow-hidden"
    >
      {/* Blurred flower background — LESS blur so it's visible */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${flowerImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(6px) brightness(0.85) saturate(1.1)',
        }}
      />

      {/* Light dark overlay — flower still visible */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, rgba(15, 23, 42, 0.1) 0%, rgba(2, 6, 23, 0.55) 100%)',
        }}
      />

      {/* Cyan corner brackets */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="bracket-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter="url(#bracket-glow)">
          {/* Top-left */}
          <path
            d="M 20 32 L 20 20 Q 20 20 32 20"
            stroke="#5EEAD4" strokeOpacity="0.85"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Top-right */}
          <path
            d="M 68 20 Q 80 20 80 20 L 80 32"
            stroke="#5EEAD4" strokeOpacity="0.85"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Bottom-left */}
          <path
            d="M 20 68 L 20 80 Q 20 80 32 80"
            stroke="#5EEAD4" strokeOpacity="0.85"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Bottom-right */}
          <path
            d="M 68 80 Q 80 80 80 80 L 80 68"
            stroke="#5EEAD4" strokeOpacity="0.85"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </svg>

      {/* Center plus icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M 12 5 L 12 19 M 5 12 L 19 12"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </motion.div>
  )
}
