import { motion } from 'framer-motion'

interface DatasetIconProps {
  size?: number
  color?: string
  showBadge?: boolean
  glow?: boolean
}

export function DatasetIcon({
  size = 80,
  color = '#5EEAD4',
  showBadge = true,
  glow = true,
}: DatasetIconProps) {
  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      {/* Soft ambient glow */}
      {glow && (
        <div
          className="absolute inset-0 blur-2xl opacity-40 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${color}60 0%, transparent 70%)`,
            transform: 'scale(0.9)',
          }}
        />
      )}

      {/* Database icon (3D style, floating) */}
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
          {/* Database — top ellipse */}
          <ellipse
            cx="24"
            cy="11"
            rx="14"
            ry="4.5"
            fill={color}
            fillOpacity="0.08"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Middle layer */}
          <path
            d="M10 11 V20 C10 22.5 16.3 24.5 24 24.5 C31.7 24.5 38 22.5 38 20 V11"
            fill={color}
            fillOpacity="0.05"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Middle ellipse line */}
          <path
            d="M10 20 C10 22.5 16.3 24.5 24 24.5 C31.7 24.5 38 22.5 38 20"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Bottom layer */}
          <path
            d="M10 20 V30 C10 32.5 16.3 34.5 24 34.5 C31.7 34.5 38 32.5 38 30 V20"
            fill={color}
            fillOpacity="0.05"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Bottom ellipse line */}
          <path
            d="M10 30 C10 32.5 16.3 34.5 24 34.5 C31.7 34.5 38 32.5 38 30"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Bottom-most layer */}
          <path
            d="M10 30 V40 C10 42.5 16.3 44.5 24 44.5 C31.7 44.5 38 42.5 38 40 V30"
            fill={color}
            fillOpacity="0.05"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      {/* Verified badge — floating bottom-right */}
      {showBadge && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2, type: 'spring' }}
          className="absolute flex items-center justify-center rounded-full"
          style={{
            width: size * 0.38,
            height: size * 0.38,
            background: `linear-gradient(135deg, ${color} 0%, #14B8A6 100%)`,
            bottom: '5%',
            right: '0%',
            boxShadow: `0 4px 16px ${color}80, 0 0 0 3px #0A1414`,
          }}
        >
          <svg
            width={size * 0.2}
            height={size * 0.2}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0A1414"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </motion.div>
      )}
    </div>
  )
}
