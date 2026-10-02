import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Check } from 'lucide-react'

interface PremiumIconProps {
  icon: LucideIcon
  size?: 'sm' | 'md' | 'lg'
  color?: string
  verified?: boolean
  showGlow?: boolean
  animated?: boolean
}

export function PremiumIcon({
  icon: Icon,
  size = 'md',
  color = '#5EEAD4',
  verified = true,
  showGlow = true,
  animated = true,
}: PremiumIconProps) {
  const dimensions = {
    sm: { box: 40, icon: 22, badge: 16, badgeIcon: 10 },
    md: { box: 56, icon: 32, badge: 22, badgeIcon: 13 },
    lg: { box: 72, icon: 40, badge: 28, badgeIcon: 16 },
  }[size]

  return (
    <div className="relative inline-flex" style={{ width: dimensions.box, height: dimensions.box }}>
      {/* Ambient glow behind icon */}
      {showGlow && (
        <div
          className="absolute inset-0 blur-2xl opacity-50 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${color}80 0%, transparent 70%)`,
            transform: 'scale(0.85)',
          }}
        />
      )}

      {/* Icon — floating, no box */}
      <motion.div
        whileHover={animated ? { scale: 1.08, rotate: 2 } : undefined}
        transition={{ type: 'spring', stiffness: 300 }}
        className="relative w-full h-full flex items-center justify-center"
      >
        <Icon
          size={dimensions.icon}
          strokeWidth={1.8}
          style={{
            color,
            filter: `drop-shadow(0 0 16px ${color}90) drop-shadow(0 4px 8px ${color}40)`,
          }}
        />
      </motion.div>

      {/* Verified badge — floating bottom-right */}
      {verified && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2, type: 'spring' }}
          className="absolute flex items-center justify-center rounded-full"
          style={{
            width: dimensions.badge,
            height: dimensions.badge,
            background: `linear-gradient(135deg, ${color} 0%, #14B8A6 100%)`,
            bottom: '5%',
            right: '0%',
            boxShadow: `0 4px 16px ${color}80, 0 0 0 2.5px #0A1414`,
          }}
        >
          <Check
            size={dimensions.badgeIcon}
            style={{ color: '#0A1414' }}
            strokeWidth={3.5}
          />
        </motion.div>
      )}
    </div>
  )
}
