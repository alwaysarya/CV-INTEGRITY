import { motion } from 'framer-motion'

interface LedgerIconProps {
  size?: number
  color?: string
  glow?: boolean
}

export function LedgerIcon({ size = 80, color = '#A78BFA', glow = true }: LedgerIconProps) {
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
          {/* Chain links — 3D isometric look */}
          {/* Top-left link */}
          <rect
            x="6" y="10" width="16" height="16" rx="4"
            fill={color}
            fillOpacity="0.08"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="rotate(-15 14 18)"
          />
          {/* Bottom-right link */}
          <rect
            x="24" y="22" width="16" height="16" rx="4"
            fill={color}
            fillOpacity="0.08"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="rotate(-15 32 30)"
          />
          {/* Connecting bar */}
          <path
            d="M20 22 L28 30"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>
    </div>
  )
}
