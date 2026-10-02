import { motion } from 'framer-motion'

interface ModelIconProps {
  size?: number
  color?: string
  glow?: boolean
}

export function ModelIcon({ size = 80, color = '#22D3EE', glow = true }: ModelIconProps) {
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
          {/* Brain outline */}
          <path
            d="M24 8 C18 8 14 12 14 18 C10 18 8 22 8 26 C8 30 10 34 14 36 C14 40 18 44 24 44 C30 44 34 40 34 36 C38 34 40 30 40 26 C40 22 38 18 34 18 C34 12 30 8 24 8 Z"
            fill={color}
            fillOpacity="0.06"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Center divide */}
          <path
            d="M24 12 V40"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
          />
          {/* Neuron nodes */}
          <circle cx="18" cy="20" r="2" fill={color} opacity="0.6" />
          <circle cx="30" cy="20" r="2" fill={color} opacity="0.6" />
          <circle cx="20" cy="30" r="2" fill={color} opacity="0.6" />
          <circle cx="28" cy="30" r="2" fill={color} opacity="0.6" />
          <circle cx="24" cy="24" r="2.5" fill={color} />
          {/* Connections */}
          <path d="M18 20 L24 24 L30 20" stroke={color} strokeWidth="1" opacity="0.4" />
          <path d="M20 30 L24 24 L28 30" stroke={color} strokeWidth="1" opacity="0.4" />
        </svg>
      </motion.div>
    </div>
  )
}
