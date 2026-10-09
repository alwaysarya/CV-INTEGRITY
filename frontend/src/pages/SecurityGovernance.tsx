import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, Cpu, Database, Lock, Activity, RefreshCw, Loader2,
  CheckCircle, TrendingUp, BarChart3, FileCheck2, Fingerprint, Link as LinkIcon
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import apiClient from '@/lib/api'

const API = 'http://localhost:8000'

export function SecurityGovernance() {
  const [stats, setStats] = useState({ trust: 0, models: 0, datasets: 0, blocks: 0 })
  const [datasets, setDatasets] = useState<any[]>([])
  const [models, setModels] = useState<any[]>([])
  const [blocks, setBlocks] = useState<any[]>([])
  const [trustScores, setTrustScores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [dRes, mRes, bRes, tRes] = await Promise.all([
        apiClient.getDatasets().catch(() => ({ data: { datasets: {} } })),
        apiClient.getModels().catch(() => ({ data: { models: {} } })),
        fetch(`${API}/api/blockchain/live`).then(r => r.json()).catch(() => ({ blocks: [] })),
        fetch(`${API}/api/trust-scores`).then(r => r.json()).catch(() => ({ trust_scores: {} })),
      ])

      const datasetsData = dRes.data.datasets || {}
      const modelsData = mRes.data.models || {}
      const blocksData = bRes.blocks || []
      const trustData = tRes.trust_scores || {}

      const trustList = Object.values(trustData).map((t: any) => t.final_score || 0)
      const avgTrust = trustList.length
        ? Math.round(trustList.reduce((a: number, b: number) => a + b, 0) / trustList.length)
        : 0

      setStats({
        trust: avgTrust,
        models: Object.keys(modelsData).length,
        datasets: Object.keys(datasetsData).length,
        blocks: blocksData.length,
      })

      setDatasets(Object.entries(datasetsData).map(([k, d]: [string, any]) => ({
        key: k, name: k.toUpperCase(), score: d.overall_score || 0
      })))
      setModels(Object.entries(modelsData).map(([k, m]: [string, any]) => ({
        key: k, name: k.toUpperCase(), mAP50: m.mAP50 || 0
      })))
      setBlocks(blocksData)
      setTrustScores(Object.entries(trustData).map(([k, t]: [string, any]) => ({
        key: k, name: k.toUpperCase(), score: t.final_score || 0,
        decision: (t.decision || '').replace(/[✅⚠️❌]/g, '').trim(),
      })))
    } catch (err: any) {
      setError(err.message || 'Backend error')
    } finally { setLoading(false) }
  }

  // Chart data — blocks count over time
  const blockTimeData = blocks.slice(-20).map((b: any, i: number) => ({
    index: i,
    blocks: i + 1,
    time: b.index ?? i,
  }))

  const integrityStages = [
    { label: 'Contributor', ok: stats.datasets > 0, icon: Fingerprint },
    { label: 'Dataset', ok: stats.datasets > 0, icon: Database },
    { label: 'Model', ok: stats.models > 0, icon: Cpu },
    { label: 'Inference', ok: true, icon: Activity },
    { label: 'Output', ok: stats.blocks > 0, icon: FileCheck2 },
  ]

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-6">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              CV-INTEGRITY / Compliance
            </div>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">
              Security Governance
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Trust scores, integrity chain, and blockchain governance across the platform.
            </p>
          </div>
          <button
            onClick={load}
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Trust Score', value: `${stats.trust}%`, color: '#10B981', icon: Shield },
            { label: 'Datasets', value: stats.datasets, color: '#3B82F6', icon: Database },
            { label: 'Models', value: stats.models, color: '#8B5CF6', icon: Cpu },
            { label: 'Ledger Blocks', value: stats.blocks, color: '#F59E0B', icon: LinkIcon },
          ].map((s) => (
            <motion.div
              key={s.label}
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="text-[12px] font-medium text-slate-500">{s.label}</div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${s.color}15` }}>
                  <s.icon size={14} style={{ color: s.color }} />
                </div>
              </div>
              <div className="mt-3 text-[32px] font-bold leading-none tracking-tight text-slate-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {s.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Integrity Chain */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[14px] font-semibold text-slate-900">Integrity Chain</div>
              <div className="mt-0.5 text-[11px] text-slate-500">End-to-end assurance pipeline</div>
            </div>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-500">
              {integrityStages.filter(s => s.ok).length}/{integrityStages.length} stages
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {integrityStages.map((s, i) => (
              <div key={s.label} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
                  s.ok ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
                }`}>
                  <s.icon size={13} className={s.ok ? 'text-emerald-600' : 'text-red-600'} />
                  <span className={`text-[11px] font-medium ${s.ok ? 'text-emerald-700' : 'text-red-700'}`}>
                    {s.label}
                  </span>
                  {s.ok ? (
                    <CheckCircle size={11} className="text-emerald-600" />
                  ) : null}
                </div>
                {i < integrityStages.length - 1 && <span className="text-slate-300">→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Blockchain activity chart */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <div className="text-[14px] font-semibold text-slate-900">Blockchain Activity</div>
            <div className="mt-0.5 text-[11px] text-slate-500">
              {blocks.length} blocks recorded in the ledger
            </div>
          </div>
          <div className="h-[240px]">
            {blockTimeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={blockTimeData}>
                  <defs>
                    <linearGradient id="blockGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="index" stroke="#94A3B8" style={{ fontSize: 11 }} />
                  <YAxis stroke="#94A3B8" style={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 11 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="blocks"
                    stroke="#10B981"
                    strokeWidth={2}
                    fill="url(#blockGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-[12px] text-slate-400">
                No blockchain data available
              </div>
            )}
          </div>
        </div>

        {/* Trust Scores + Datasets/Models */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Trust Scores */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-4">
              <div className="text-[14px] font-semibold text-slate-900">Trust Scores</div>
              <div className="mt-0.5 text-[11px] text-slate-500">Per-entity trust evaluation</div>
            </div>
            <div className="space-y-2">
              {trustScores.length > 0 ? trustScores.map((t: any, i: number) => {
                const color = t.score >= 75 ? '#10B981' : t.score >= 50 ? '#F59E0B' : '#EF4444'
                const label = t.score >= 75 ? 'Accept' : t.score >= 50 ? 'Review' : 'Quarantine'
                return (
                  <div key={t.key} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${color}15` }}>
                        <span className="text-[11px] font-bold" style={{ color }}>{t.name[0]}</span>
                      </div>
                      <div>
                        <div className="text-[12px] font-semibold text-slate-800">{t.name}</div>
                        <div className="text-[10px] text-slate-500">Trust</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-200">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${t.score}%` }}
                          transition={{ duration: 0.8, delay: i * 0.08 }}
                          className="h-full rounded-full"
                          style={{ background: color }}
                        />
                      </div>
                      <span className="font-mono text-[13px] font-bold" style={{ color }}>{t.score}%</span>
                      <span
                        className="rounded-md px-2 py-0.5 text-[9px] font-semibold"
                        style={{ background: `${color}15`, color }}
                      >
                        {label}
                      </span>
                    </div>
                  </div>
                )
              }) : (
                <div className="py-8 text-center text-[12px] text-slate-400">No trust data available</div>
              )}
            </div>
          </div>

          {/* Datasets + Models summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <div className="text-[14px] font-semibold text-slate-900">Registry</div>
              <div className="mt-0.5 text-[11px] text-slate-500">Registered entities</div>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-center gap-2">
                  <Database size={13} className="text-emerald-600" />
                  <span className="text-[11px] font-medium text-slate-700">Datasets</span>
                </div>
                <div className="mt-1.5 text-[22px] font-bold text-slate-900">{stats.datasets}</div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-center gap-2">
                  <Cpu size={13} className="text-blue-600" />
                  <span className="text-[11px] font-medium text-slate-700">Models</span>
                </div>
                <div className="mt-1.5 text-[22px] font-bold text-slate-900">{stats.models}</div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-center gap-2">
                  <Lock size={13} className="text-amber-600" />
                  <span className="text-[11px] font-medium text-slate-700">Blocks</span>
                </div>
                <div className="mt-1.5 text-[22px] font-bold text-slate-900">{stats.blocks}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SecurityGovernance
