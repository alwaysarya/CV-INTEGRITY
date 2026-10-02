import { motion } from 'framer-motion'
import { Cloud, Aperture, Sun, Contrast, Copy } from 'lucide-react'
import { GlassStackIllustration } from './illustrations/GlassStackIllustration'

interface DetectionCardChartProps {
  data: { label: string; value: number }[]
}

const cardConfigs = [
  {
    bg: 'linear-gradient(180deg, #0C4A6E 0%, #082F49 50%, #041A28 100%)',
    accent: '#7DD3FC',
    icon: Cloud,
    label: 'Blur',
    Illustration: BlurIllustration,
  },
  {
    bg: 'linear-gradient(180deg, #4338CA 0%, #1E3A8A 50%, #0F172A 100%)',
    accent: '#93C5FD',
    icon: Aperture,
    label: 'Noise',
    Illustration: NoiseIllustration,
  },
  {
    bg: 'linear-gradient(180deg, #D97706 0%, #92400E 50%, #451A03 100%)',
    accent: '#FCD34D',
    icon: Sun,
    label: 'Bright',
    Illustration: BrightIllustration,
  },
  {
    bg: 'linear-gradient(180deg, #4338CA 0%, #1E1B4B 50%, #0C0A2E 100%)',
    accent: '#A5B4FC',
    icon: Contrast,
    label: 'Contr',
    Illustration: ContrastIllustration,
  },
  {
    bg: 'linear-gradient(180deg, #0E7490 0%, #0C4A6E 50%, #082F49 100%)',
    accent: '#7DD3FC',
    icon: Copy,
    label: 'Dup',
    Illustration: DuplicateIllustration,
  },
]

export function DetectionCardChart({ data }: DetectionCardChartProps) {
  return (
    <div className="flex items-start gap-4">
      {/* Section number */}
      <div className="flex-shrink-0 pt-0.5">
        <div className="text-4xl font-bold text-white leading-none tracking-tight">06</div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-white font-semibold text-base leading-tight">Detection Accuracy</h2>
            <p className="text-slate-500 text-[11px] mt-0.5">Per-method confidence rates</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/[0.08] border border-teal-500/20 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <span className="text-teal-300 text-xs font-semibold">Avg 91.6%</span>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-5 gap-2">
          {data.map((item, i) => {
            const cfg = cardConfigs[i] || cardConfigs[0]
            const Icon = cfg.icon
            const Illustration = cfg.Illustration

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="group flex flex-col cursor-pointer"
              >
                {/* Value — ABOVE card, centered */}
                <div className="text-center mb-2">
                  <span className="text-white text-base font-bold tabular-nums">
                    {item.value}%
                  </span>
                </div>

                {/* Card */}
                <div
                  className="relative rounded-2xl overflow-hidden transition-all duration-300"
                  style={{
                    aspectRatio: '0.82',
                    background: cfg.bg,
                    border: `1px solid ${cfg.accent}30`,
                    boxShadow: `0 6px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 ${cfg.accent}30`,
                  }}
                >
                  {/* Illustration */}
                  <div className="absolute inset-0">
                    <Illustration color={cfg.accent} />
                  </div>

                  {/* Dark gradient bottom for label readability */}
                  <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

                  {/* Icon — centered, BIG — only for non-Blur cards */}
                  {cfg.label !== 'Blur' && (
                    <div className="absolute inset-0 flex items-center justify-center pt-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-md"
                        style={{
                          background: `${cfg.accent}20`,
                          border: `1.5px solid ${cfg.accent}60`,
                          boxShadow: `0 4px 16px ${cfg.accent}50, inset 0 1px 0 ${cfg.accent}80`,
                        }}
                      >
                        <Icon size={22} style={{ color: cfg.accent }} strokeWidth={2} />
                      </div>
                    </div>
                  )}

                  {/* Label — bottom, above brackets */}
                  <div className="absolute bottom-0.5 left-0 right-0 text-center">
                    <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-white">
                      {cfg.label}
                    </span>
                  </div>

                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, ${cfg.accent}20 0%, transparent 70%)`,
                    }}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// ILLUSTRATIONS
// ============================================================

function BlurIllustration() {
  return (
    <div className="absolute inset-0">
      <GlassStackIllustration />
    </div>
  )
}

function NoiseIllustration({ color }: { color: string }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 120" preserveAspectRatio="none">
      <defs>
        <radialGradient id="noise-g" cx="0.5" cy="0.4">
          <stop offset="0%" stopColor={color} stopOpacity="0.7" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="50" rx="65" ry="45" fill="url(#noise-g)" />
      {Array.from({ length: 50 }).map((_, i) => {
        const x = (Math.sin(i * 13.7) * 0.5 + 0.5) * 100
        const y = (Math.cos(i * 7.3) * 0.5 + 0.5) * 100
        const r = (Math.sin(i * 2) * 0.5 + 0.5) * 0.9 + 0.2
        return <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={0.35 + (i % 5) * 0.1} />
      })}
    </svg>
  )
}

function BrightIllustration({ color }: { color: string }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 120" preserveAspectRatio="none">
      <defs>
        <radialGradient id="bright-g" cx="0.5" cy="0.4">
          <stop offset="0%" stopColor="#FFFBEB" stopOpacity="1" />
          <stop offset="30%" stopColor={color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="50" rx="60" ry="55" fill="url(#bright-g)" />
      <circle cx="50" cy="50" r="11" fill="#FFFFFF" />
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2
        const x1 = 50 + Math.cos(angle) * 16
        const y1 = 50 + Math.sin(angle) * 16
        const x2 = 50 + Math.cos(angle) * 30
        const y2 = 50 + Math.sin(angle) * 30
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.2" strokeOpacity="0.6" strokeLinecap="round" />
        )
      })}
    </svg>
  )
}

function ContrastIllustration({ color }: { color: string }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 120" preserveAspectRatio="none">
      <defs>
        <linearGradient id="contrast-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.7" />
          <stop offset="100%" stopColor={color} stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {Array.from({ length: 20 }).map((_, i) => {
        const x = (Math.sin(i * 8.3) * 0.5 + 0.5) * 100
        const y = (Math.cos(i * 4.1) * 0.5 + 0.5) * 40
        return <circle key={i} cx={x} cy={y} r="0.6" fill="#FFFFFF" opacity={0.4 + (i % 4) * 0.15} />
      })}
      <path d="M0 75 L30 50 L50 65 L75 42 L100 55 L100 120 L0 120 Z" fill="url(#contrast-g)" />
      <path d="M0 95 L25 80 L45 90 L70 78 L100 88 L100 120 L0 120 Z" fill="#0C0A2E" fillOpacity="0.9" />
    </svg>
  )
}

function DuplicateIllustration({ color }: { color: string }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 120" preserveAspectRatio="none">
      <defs>
        <linearGradient id="dup-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.6" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0 50 Q25 38 50 50 T100 50 L100 120 L0 120 Z" fill="url(#dup-g)" />
      <path d="M0 68 Q25 58 50 68 T100 68 L100 120 L0 120 Z" fill={color} fillOpacity="0.3" />
      <path d="M0 85 Q25 76 50 85 T100 85 L100 120 L0 120 Z" fill={color} fillOpacity="0.2" />
    </svg>
  )
}
