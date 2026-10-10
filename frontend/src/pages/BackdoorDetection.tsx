import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Loader2, RefreshCw, Bug, AlertTriangle, Shield, Play, ShieldAlert
} from 'lucide-react'
import axios from 'axios'

const API = 'http://localhost:8000'

const levelTheme: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  LOW: { bg: '#D1FAE5', text: '#065F46', dot: '#10B981', label: 'Low' },
  MEDIUM: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B', label: 'Medium' },
  HIGH: { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444', label: 'High' },
  CRITICAL: { bg: '#FEE2E2', text: '#7F1D1D', dot: '#DC2626', label: 'Critical' },
  UNKNOWN: { bg: '#F1F5F9', text: '#334155', dot: '#64748B', label: 'Unknown' },
}

export function BackdoorDetection() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [accessLevel, setAccessLevel] = useState('black-box')
  const [dataset, setDataset] = useState('clean')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { runDetection() }, [])

  const runDetection = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post(`${API}/api/backdoor/detect`, {
        dataset,
        num_samples: 20,
        access_level: accessLevel,
      }).catch(() => ({ data: null }))
      if (res.data) setResult(res.data)
      else setError('Backend unavailable')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getLevelTheme = (level: string) => levelTheme[level] || levelTheme.UNKNOWN

  const overallLevel = result?.overall_risk?.level || 'UNKNOWN'
  const overallTheme = getLevelTheme(overallLevel)

  const findings = result?.detections || result?.findings || []

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex items-start justify-between gap-4 pb-6">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              CV-INTEGRITY / Backdoor Detection
            </div>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">
              Backdoor Scanner
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Trigger-based backdoor detection in datasets through label and bbox analysis.
            </p>
          </div>
          <button
            onClick={runDetection}
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Rescan
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-4">
              <div className="text-[14px] font-semibold text-slate-900">Scan Configuration</div>
              <div className="mt-0.5 text-[11px] text-slate-500">
                Choose dataset and access level for backdoor analysis
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-slate-500">Dataset</label>
                <select
                  value={dataset}
                  onChange={(e) => setDataset(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] text-slate-800 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="clean">Clean dataset</option>
                  <option value="poisoned">Poisoned dataset</option>
                  <option value="good">good</option>
                  <option value="bad">bad</option>
                  <option value="worst">worst</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-slate-500">Access Level</label>
                <select
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] text-slate-800 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="black-box">Black-box</option>
                  <option value="gray-box">Gray-box</option>
                  <option value="white-box">White-box</option>
                </select>
              </div>
            </div>

            <button
              onClick={runDetection}
              disabled={loading}
              className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
              {loading ? 'Scanning...' : 'Run Scan'}
            </button>
          </div>

          <div
            className="rounded-2xl border p-5 shadow-sm"
            style={{
              borderColor: `${overallTheme.dot}30`,
              background: `linear-gradient(145deg, ${overallTheme.bg}, white)`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: `${overallTheme.dot}20` }}
              >
                {overallLevel === 'LOW' ? (
                  <Shield size={18} style={{ color: overallTheme.dot }} />
                ) : overallLevel === 'UNKNOWN' ? (
                  <ShieldAlert size={18} style={{ color: overallTheme.dot }} />
                ) : (
                  <AlertTriangle size={18} style={{ color: overallTheme.dot }} />
                )}
              </div>
              <div>
                <div className="text-[11px] font-medium text-slate-600">Overall Risk</div>
                <div className="text-[11px] font-mono text-slate-500">{dataset}</div>
              </div>
            </div>
            <div className="mt-4 text-[32px] font-bold leading-none tracking-tight" style={{ color: overallTheme.text }}>
              {overallTheme.label}
            </div>
            {result?.overall_risk?.score !== undefined && (
              <div className="mt-3 text-[12px] text-slate-600">
                Risk score:{' '}
                <span className="font-mono font-semibold">
                  {Number(result.overall_risk.score).toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>

        {loading && !result ? (
          <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-20 text-[13px] text-slate-400">
            <Loader2 size={16} className="animate-spin" />
            Running backdoor detection...
          </div>
        ) : error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertTriangle size={24} className="mx-auto text-red-500" />
            <div className="mt-2 text-[13px] font-medium text-red-700">Scan failed</div>
            <div className="mt-1 text-[11px] text-red-600">{error}</div>
          </div>
        ) : result && findings.length > 0 ? (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="text-[14px] font-semibold text-slate-900">Detection Findings</div>
              <div className="mt-0.5 text-[11px] text-slate-500">
                {findings.length} detection methods executed
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {findings.map((d: any, i: number) => {
                const conf = Number(d.confidence || 0)
                const level =
                  d.level ||
                  d.severity ||
                  (conf > 0.5 ? 'HIGH' : conf > 0.2 ? 'MEDIUM' : 'LOW')
                const theme = getLevelTheme(level)
                const methodName = (d.method || d.name || d.type || `Method ${i + 1}`)
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (c: string) => c.toUpperCase())
                const description =
                  d.reason || d.description || d.detail || `Confidence: ${conf.toFixed(2)}`
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="grid grid-cols-12 items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                  >
                    <div className="col-span-6 flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-lg"
                        style={{ background: theme.bg }}
                      >
                        <Bug size={15} style={{ color: theme.dot }} />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-medium text-slate-900">
                          {methodName}
                        </div>
                        <div className="mt-0.5 truncate text-[11px] text-slate-500">
                          {description}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-3 text-[11px] text-slate-500">
                      {d.status || '—'}
                    </div>
                    <div className="col-span-3 flex justify-end">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold uppercase"
                        style={{ background: theme.bg, color: theme.text }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: theme.dot }} />
                        {theme.label}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ) : result ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <Shield size={28} className="mx-auto text-emerald-600" />
            <div className="mt-3 text-[14px] font-medium text-emerald-900">
              No backdoor patterns detected
            </div>
            <div className="mt-1 text-[11px] text-emerald-700">
              Scan completed with no suspicious findings
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default BackdoorDetection
