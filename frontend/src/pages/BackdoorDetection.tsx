import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, Bug, AlertTriangle, Shield, CheckCircle, Zap, Target, Activity } from 'lucide-react'
import apiClient from '@/lib/api'

interface Finding {
  method: string
  confidence: number
  status?: string
  [key: string]: any
}

interface BackdoorResult {
  status: string
  access_level: string
  num_samples: number
  findings: Finding[]
  overall_risk: {
    score: number
    level: string
    num_findings: number
  }
  recommendation: string
  limitations: string[]
}

const levelColors: Record<string, any> = {
  LOW: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.4)' },
  MEDIUM: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' },
  HIGH: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.4)' },
  CRITICAL: { bg: 'rgba(220, 38, 38, 0.15)', text: '#DC2626', border: 'rgba(220, 38, 38, 0.4)' },
  UNKNOWN: { bg: 'rgba(107, 114, 128, 0.15)', text: '#9CA3AF', border: 'rgba(107, 114, 128, 0.4)' },
}

export function BackdoorDetection() {
  const [result, setResult] = useState<BackdoorResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accessLevel, setAccessLevel] = useState('black-box')

  useEffect(() => {
    runDetection()
  }, [accessLevel])

  const runDetection = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.backdoorDetect({
        num_samples: 20,
        access_level: accessLevel,
      })
      setResult(res.data)
    } catch (err: any) {
      setError(err.message || 'Backend connect nahi ho raha')
    } finally {
      setLoading(false)
    }
  }

  const getLevelColors = (level: string) => levelColors[level] || levelColors.UNKNOWN

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-1">Backdoor Detection</h1>
          <p className="text-gray-400 text-sm">
            Real trigger detection using 4 algorithms
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={accessLevel}
            onChange={(e) => setAccessLevel(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/5 border border-cyan-500/20 text-white text-sm"
          >
            <option value="black-box">Black-box</option>
            <option value="white-box">White-box</option>
          </select>
          <button
            onClick={runDetection}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-sm font-medium hover:bg-cyan-500/30 hover-scale"
          >
            <RefreshCw size={16} /> Re-run Detection
          </button>
        </div>
      </motion.div>

      {error && (
        <Card className="glass-card p-4 border-red-500/40 bg-red-500/5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-400" size={20} />
            <div>
              <div className="text-red-400 font-medium text-sm">Error</div>
              <div className="text-gray-400 text-xs">{error}</div>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <Card className="liquid-glass border-0 p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-cyan-400 mb-4" size={48} />
            <span className="text-gray-400 text-sm">Running backdoor detection on real images...</span>
            <span className="text-gray-500 text-xs mt-2">Frequency analysis • Trigger search • Statistical anomaly</span>
          </div>
        </Card>
      ) : result ? (
        <>
          {/* Risk Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card
              className="liquid-glass specular border-0 p-6"
              style={{
                background: `linear-gradient(135deg, ${getLevelColors(result.overall_risk.level).bg}, rgba(15, 23, 42, 0.8))`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{
                      backgroundColor: `${getLevelColors(result.overall_risk.level).text}20`,
                      border: `2px solid ${getLevelColors(result.overall_risk.level).text}`,
                    }}
                  >
                    {result.overall_risk.level === 'LOW' ? (
                      <CheckCircle size={32} style={{ color: getLevelColors(result.overall_risk.level).text }} />
                    ) : (
                      <AlertTriangle size={32} style={{ color: getLevelColors(result.overall_risk.level).text }} />
                    )}
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs tracking-widest uppercase mb-1">Overall Risk Level</div>
                    <div
                      className="text-4xl font-bold"
                      style={{ color: getLevelColors(result.overall_risk.level).text }}
                    >
                      {result.overall_risk.level}
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      Score: <span className="font-bold" style={{ color: getLevelColors(result.overall_risk.level).text }}>
                        {result.overall_risk.score}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Recommendation</div>
                  <div className="text-white text-lg font-bold max-w-md">{result.recommendation}</div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Samples Analyzed', value: result.num_samples, color: '#38BDF8', icon: Target },
              { label: 'Methods Run', value: result.overall_risk.num_findings, color: '#8B5CF6', icon: Zap },
              { label: 'Access Level', value: result.access_level, color: '#10B981', icon: Shield },
            ].map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                >
                  <Card className="liquid-glass specular border-0 p-5 hover-lift">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${stat.color}20`, border: `1px solid ${stat.color}40` }}
                      >
                        <Icon size={20} style={{ color: stat.color }} />
                      </div>
                      <div>
                        <div className="text-white text-2xl font-bold capitalize">{stat.value}</div>
                        <div className="text-gray-400 text-xs">{stat.label}</div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Detection Methods */}
          <Card className="liquid-glass border-0 p-5">
            <div className="mb-4">
              <h3 className="text-white font-bold text-sm">DETECTION METHODS</h3>
              <p className="text-gray-500 text-xs mt-0.5">Individual method results with confidence scores</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.findings.map((finding, i) => {
                const conf = finding.confidence || 0
                const confColor = conf >= 0.7 ? '#EF4444' : conf >= 0.4 ? '#F59E0B' : '#10B981'
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="p-4 rounded-xl bg-black/30 border border-cyan-500/10 hover:border-cyan-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${confColor}20`, border: `1px solid ${confColor}40` }}
                        >
                          <Bug size={14} style={{ color: confColor }} />
                        </div>
                        <div className="text-white text-xs font-bold capitalize">
                          {finding.method.replace(/_/g, ' ')}
                        </div>
                      </div>
                      <Badge
                        className="text-[10px] py-0.5 px-2"
                        style={{
                          backgroundColor: `${confColor}20`,
                          color: confColor,
                          border: `1px solid ${confColor}60`,
                        }}
                      >
                        {finding.status || 'success'}
                      </Badge>
                    </div>

                    {/* Confidence Bar */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-500 text-[10px] uppercase tracking-wider">Confidence</span>
                        <span className="text-xs font-bold" style={{ color: confColor }}>
                          {(conf * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${conf * 100}%`,
                            background: `linear-gradient(90deg, ${confColor}, ${confColor}cc)`,
                            boxShadow: `0 0 10px ${confColor}80`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Details */}
                    {finding.reason && (
                      <div className="text-gray-500 text-[10px] mt-2">{finding.reason}</div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </Card>

          {/* Limitations */}
          {result.limitations && result.limitations.length > 0 && (
            <Card className="liquid-glass border-0 p-5" style={{
              borderLeft: '3px solid rgba(245, 158, 11, 0.6)'
            }}>
              <div className="mb-3">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <AlertTriangle size={14} className="text-yellow-400" />
                  LIMITATIONS
                </h3>
                <p className="text-gray-500 text-xs mt-0.5">Known constraints of this assessment</p>
              </div>
              <ul className="space-y-2">
                {result.limitations.map((lim, i) => (
                  <li key={i} className="text-gray-300 text-xs flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">•</span>
                    <span>{lim}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      ) : null}
    </div>
  )
}
