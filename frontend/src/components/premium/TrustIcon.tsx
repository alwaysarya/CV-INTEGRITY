import { motion } from 'framer-motion'

interface TrustIconProps {
  size?: number
  color?: string
  glow?: boolean
}

export function TrustIcon({ size = 80, color = '#FBBF24', glow = true }: TrustIconProps) {
  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      {glow && (
        <div
          className="absolute inset-0 blur-2xl opacity-40 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${color}60 0%, transparent 70%)`,
            transform: 'scale(0.9)',
          }}
        />
      )}
      <motion.div
        whileHover={{ scale: 1.08 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="relative w-full h-full flex items-center justify-center"
      >
        <svg
          width={size * 0.9}
          height={size * 0.9}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            filter: `drop-shadow(0 0 16px ${color}80) drop-shadow(0 4px 8px ${color}40)`,
          }}
        >
          {/* Outer ring */}
          <circle
            cx="24" cy="24" r="16"
            fill={color}
            fillOpacity="0.06"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Middle ring */}
          <circle
            cx="24" cy="24" r="10"
            fill={color}
            fillOpacity="0.08"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Inner dot */}
          <circle
            cx="24" cy="24" r="4"
            fill={color}
          />
          {/* Crosshair lines */}
          <path d="M24 2 V8" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <path d="M24 40 V46" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <path d="M2 24 H8" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <path d="M40 24 H46" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
      </motion.div>
    </div>
  )
}
