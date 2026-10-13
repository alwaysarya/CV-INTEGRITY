import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, Check, X, ArrowLeft, Loader2, Lock, Globe, Key,
  Users, AlertTriangle, TrendingUp, Award, ChevronRight
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { computeSecurityScore, CATEGORY_INFO, type SecurityScore } from '@/lib/securityScore'

function ScoreRing({ score, color }: { score: number; color: string }) {
  const radius = 90
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative w-[220px] h-[220px]">
      <svg viewBox="0 0 220 220" className="w-full h-full -rotate-90">
        <circle cx="110" cy="110" r={radius} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="14" />
        <motion.circle
          cx="110" cy="110" r={radius}
          fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 16px ${color}90)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[64px] font-semibold leading-none tracking-[-0.05em] tabular-nums" style={{ color }}>
          {score}
        </div>
        <div className="mt-2 text-[11px] font-bold tracking-[0.22em] uppercase text-[#86868B]">of 100</div>
      </div>
    </div>
  )
}

export function SecurityScorePage() {
  const navigate = useNavigate()
  const [data, setData] = useState<SecurityScore | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setData(computeSecurityScore())
      setLoading(false)
    }, 300)
  }, [])

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#FBFBFD] flex items-center justify-center gap-2 text-[13px] text-[#86868B]">
        <Loader2 size={16} className="animate-spin" />
        Computing security score...
      </div>
    )
  }

  const failedChecks = data.checks.filter(c => !c.passed)

  return (
    <div className="min-h-screen bg-[#FBFBFD] p-6" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>
      <div className="mx-auto max-w-[1100px]">
        <div className="pb-8">
          <button onClick={() => navigate('/settings')} className="flex items-center gap-1.5 text-[12px] font-medium text-[#86868B] hover:text-[#1D1D1F] transition-colors mb-3">
            <ArrowLeft size={13} strokeWidth={2.2} /> Back to Settings
          </button>
          <h1 className="text-[40px] font-semibold tracking-[-0.035em] text-[#1D1D1F]">Security Score</h1>
          <p className="mt-2 text-[15px] text-[#6E6E73]">Overall security posture based on your actual settings</p>
        </div>

        <div className="mb-8 rounded-[32px] bg-white border border-black/[0.04] p-10 shadow-sm">
          <div className="flex items-center gap-12 flex-wrap">
            <ScoreRing score={data.score} color={data.color} />
            <div className="flex-1 min-w-[300px]">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
                style={{ background: `${data.color}15`, border: `1px solid ${data.color}30` }}>
                <Award size={12} style={{ color: data.color }} strokeWidth={2.4} />
                <span className="text-[11px] font-bold tracking-[0.16em] uppercase" style={{ color: data.color }}>
                  {data.label} Security
                </span>
              </div>
              <h2 className="text-[28px] font-semibold tracking-[-0.025em] text-[#1D1D1F] mb-3">
                {data.passed} of {data.total} checks passed
              </h2>
              <p className="text-[14px] text-[#6E6E73] leading-relaxed mb-6">
                {data.score >= 85 ? 'Excellent security. All critical checks passing.'
                 : data.score >= 70 ? 'Good posture. A few improvements needed.'
                 : data.score >= 50 ? 'Fair security. Several recommendations below.'
                 : 'Security needs attention. Enable missing checks.'}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(CATEGORY_INFO).map(([key, info]) => {
                  const catChecks = data.checks.filter(c => c.category === key)
                  const passed = catChecks.filter(c => c.passed).length
                  const total = catChecks.length
                  if (total === 0) return null
                  const pct = Math.round((passed / total) * 100)
                  return (
                    <div key={key} className="rounded-xl bg-[#FBFBFD] border border-black/[0.03] p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#86868B]">{info.label}</span>
                        <span className="text-[12px] font-bold tabular-nums" style={{ color: info.color }}>{passed}/{total}</span>
                      </div>
                      <div className="h-1 rounded-full bg-[#E5E5EA] overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }}
                          className="h-full rounded-full" style={{ background: info.color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] bg-white border border-black/[0.04] overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-[#F0F0F2]">
            <div className="text-[15px] font-semibold text-[#1D1D1F]">Security Checks</div>
            <div className="mt-0.5 text-[12px] text-[#6E6E73]">{data.passed} passing · {data.total - data.passed} to improve</div>
          </div>
          <div className="divide-y divide-[#F0F0F2]">
            {data.checks.map((check, i) => {
              const catInfo = CATEGORY_INFO[check.category]
              return (
                <motion.div key={check.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-[#FBFBFD] transition-colors">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 ${check.passed ? 'bg-[#30D158]/15' : 'bg-[#FF453A]/15'}`}>
                    {check.passed ? <Check size={16} className="text-[#30D158]" strokeWidth={3} /> : <X size={16} className="text-[#FF453A]" strokeWidth={2.6} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[14px] font-semibold text-[#1D1D1F]">{check.label}</span>
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold tracking-[0.12em] uppercase"
                        style={{ background: `${catInfo.color}15`, color: catInfo.color }}>{catInfo.label}</span>
                    </div>
                    <div className="text-[12px] text-[#86868B]">{check.description}</div>
                  </div>
                  <div className={`text-[11px] font-bold tracking-[0.14em] uppercase flex-shrink-0 ${check.passed ? 'text-[#30D158]' : 'text-[#FF453A]'}`}>
                    {check.passed ? 'Pass' : 'Improve'}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {failedChecks.length > 0 && (
          <div className="mt-8 rounded-[24px] bg-[#FF9F0A]/8 border border-[#FF9F0A]/20 p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF9F0A]/20 flex-shrink-0">
                <AlertTriangle size={18} className="text-[#FF9F0A]" strokeWidth={2.2} />
              </div>
              <div>
                <div className="text-[15px] font-semibold text-[#1D1D1F]">
                  {failedChecks.length} recommendation{failedChecks.length > 1 ? 's' : ''}
                </div>
                <div className="text-[12px] text-[#6E6E73] mt-0.5">Fix these to improve your score</div>
              </div>
            </div>
            <div className="space-y-2">
              {failedChecks.map(check => (
                <div key={check.id} className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-black/[0.04]">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 rounded-full bg-[#FF9F0A]" />
                    <div>
                      <div className="text-[13px] font-semibold text-[#1D1D1F]">{check.label}</div>
                      <div className="text-[11px] text-[#86868B] mt-0.5">{check.description}</div>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-[#86868B] flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SecurityScorePage
