import { motion } from 'framer-motion'

// ============================================================
// 5 CUSTOM 3D ICONS — CARD STACK STYLE
// ============================================================

export function DatabaseStackIcon({ size = 56, color = '#38BDF8' }: { size?: number; color?: string }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }} style={{ width: size, height: size }} className="relative flex items-center justify-center">
      <div className="absolute inset-0 blur-2xl opacity-50" style={{ background: `radial-gradient(circle, ${color}90 0%, transparent 70%)` }} />
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ filter: `drop-shadow(0 0 12px ${color}90)` }}>
        <defs>
          <linearGradient id="dbs-1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7DD3FC" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        <ellipse cx="24" cy="12" rx="12" ry="4" fill="url(#dbs-1)" fillOpacity="0.9" />
        <path d="M12 12 V20 C12 22.2 17.4 24 24 24 C30.6 24 36 22.2 36 20 V12" fill="url(#dbs-1)" fillOpacity="0.7" />
        <ellipse cx="24" cy="20" rx="12" ry="4" fill="#3B82F6" fillOpacity="0.5" />
        <path d="M12 20 V28 C12 30.2 17.4 32 24 32 C30.6 32 36 30.2 36 28 V20" fill="url(#dbs-1)" fillOpacity="0.6" />
        <ellipse cx="24" cy="28" rx="12" ry="4" fill="#3B82F6" fillOpacity="0.4" />
        <path d="M12 28 V36 C12 38.2 17.4 40 24 40 C30.6 40 36 38.2 36 36 V28" fill="url(#dbs-1)" fillOpacity="0.5" />
        {/* Highlights */}
        <path d="M14 13 Q18 11 22 12" stroke="white" strokeWidth="1" strokeOpacity="0.6" fill="none" />
      </svg>
    </motion.div>
  )
}

export function CubeIcon({ size = 56, color = '#818CF8' }: { size?: number; color?: string }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }} style={{ width: size, height: size }} className="relative flex items-center justify-center">
      <div className="absolute inset-0 blur-2xl opacity-50" style={{ background: `radial-gradient(circle, ${color}90 0%, transparent 70%)` }} />
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ filter: `drop-shadow(0 0 12px ${color}90)` }}>
        <defs>
          <linearGradient id="cube-1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#A5B4FC" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
        </defs>
        {/* Top face */}
        <path d="M24 8 L40 16 L24 24 L8 16 Z" fill="url(#cube-1)" fillOpacity="0.9" />
        {/* Left face */}
        <path d="M8 16 L24 24 V40 L8 32 Z" fill="url(#cube-1)" fillOpacity="0.7" />
        {/* Right face */}
        <path d="M40 16 L24 24 V40 L40 32 Z" fill="url(#cube-1)" fillOpacity="0.55" />
        {/* Inner grid */}
        <path d="M16 12 L24 16 M32 12 L24 16 M16 16 L24 20 M32 16 L24 20" stroke="white" strokeWidth="0.8" strokeOpacity="0.4" fill="none" />
      </svg>
    </motion.div>
  )
}

export function AnalyticsWaveIcon({ size = 56, color = '#22D3EE' }: { size?: number; color?: string }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }} style={{ width: size, height: size }} className="relative flex items-center justify-center">
      <div className="absolute inset-0 blur-2xl opacity-50" style={{ background: `radial-gradient(circle, ${color}90 0%, transparent 70%)` }} />
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ filter: `drop-shadow(0 0 12px ${color}90)` }}>
        <defs>
          <linearGradient id="wave-1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#67E8F9" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        {/* 3 vertical bars */}
        <rect x="10" y="20" width="6" height="20" rx="3" fill="url(#wave-1)" fillOpacity="0.9" />
        <rect x="21" y="12" width="6" height="28" rx="3" fill="url(#wave-1)" fillOpacity="0.9" />
        <rect x="32" y="18" width="6" height="22" rx="3" fill="url(#wave-1)" fillOpacity="0.9" />
        {/* Glow highlights */}
        <rect x="11" y="21" width="2" height="18" rx="1" fill="white" fillOpacity="0.4" />
        <rect x="22" y="13" width="2" height="26" rx="1" fill="white" fillOpacity="0.4" />
        <rect x="33" y="19" width="2" height="20" rx="1" fill="white" fillOpacity="0.4" />
      </svg>
    </motion.div>
  )
}

export function ShieldIcon({ size = 56, color = '#5EEAD4' }: { size?: number; color?: string }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }} style={{ width: size, height: size }} className="relative flex items-center justify-center">
      <div className="absolute inset-0 blur-2xl opacity-50" style={{ background: `radial-gradient(circle, ${color}90 0%, transparent 70%)` }} />
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ filter: `drop-shadow(0 0 12px ${color}90)` }}>
        <defs>
          <linearGradient id="shield-1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A7F3D0" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
        {/* Shield */}
        <path d="M24 6 L38 12 V24 C38 32 31 40 24 42 C17 40 10 32 10 24 V12 Z" fill="url(#shield-1)" fillOpacity="0.9" />
        {/* Lightning bolt */}
        <path d="M26 14 L18 26 H24 L22 34 L30 22 H24 Z" fill="white" fillOpacity="0.9" />
      </svg>
    </motion.div>
  )
}

export function CameraLensIcon({ size = 56, color = '#60A5FA' }: { size?: number; color?: string }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }} style={{ width: size, height: size }} className="relative flex items-center justify-center">
      <div className="absolute inset-0 blur-2xl opacity-50" style={{ background: `radial-gradient(circle, ${color}90 0%, transparent 70%)` }} />
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ filter: `drop-shadow(0 0 12px ${color}90)` }}>
        <defs>
          <linearGradient id="lens-1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#93C5FD" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <radialGradient id="lens-inner">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="100%" stopColor="#0F172A" />
          </radialGradient>
        </defs>
        {/* Outer ring */}
        <circle cx="24" cy="24" r="18" fill="url(#lens-1)" fillOpacity="0.9" />
        {/* Middle ring */}
        <circle cx="24" cy="24" r="12" fill="url(#lens-inner)" />
        {/* Inner glow */}
        <circle cx="24" cy="24" r="7" fill="#1E40AF" fillOpacity="0.8" />
        {/* Center light */}
        <circle cx="24" cy="24" r="3" fill="#60A5FA" />
        {/* Reflection */}
        <circle cx="20" cy="20" r="2" fill="white" fillOpacity="0.6" />
      </svg>
    </motion.div>
  )
}
