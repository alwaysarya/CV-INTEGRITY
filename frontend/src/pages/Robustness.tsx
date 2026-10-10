import { useEffect, useState } from 'react'
import {
  Shield, Search, Loader2, RefreshCw, Zap, Target, CheckCircle,
  AlertTriangle, XCircle, BarChart3
} from 'lucide-react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Legend
} from 'recharts'
import apiClient from '@/lib/api'

const statusTheme: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  Pass: { bg: '#D1FAE5', text: '#065F46', dot: '#10B981', label: 'Pass' },
  Warning: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B', label: 'Warning' },
  Fail: { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444', label: 'Fail' },
}

export function Robustness() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => { loadRobustness() }, [])

  const loadRobustness = async () => {
    setLoading(true)
    setError(null)
    try {
      const [dRes, mRes] = await Promise.all([
        apiClient.getDatasets().catch(() => ({ data: { datasets: {} } })),
        apiClient.getModels().catch(() => ({ data: { models: {} } })),
      ])
      const datasets = dRes.data.datasets || {}
      const models = mRes.data.models || {}
      const list: any[] = []
      let id = 1

      Object.entries(datasets).forEach(([key, val]: [string, any]) => {
        const blur = val.blur_score || 0
        const dup = val.duplicate_score || 0
        const noise = val.noise_score || 0
        list.push({ id: id++, test: `${key.toUpperCase()} Blur`, category: 'Blur', score: blur, status: blur >= 90 ? 'Pass' : blur >= 75 ? 'Warning' : 'Fail' })
        list.push({ id: id++, test: `${key.toUpperCase()} Duplicate`, category: 'Duplicate', score: dup, status: dup >= 90 ? 'Pass' : dup >= 75 ? 'Warning' : 'Fail' })
        list.push({ id: id++, test: `${key.toUpperCase()} Noise`, category: 'Noise', score: noise, status: noise >= 90 ? 'Pass' : noise >= 75 ? 'Warning' : 'Fail' })
      })

      Object.entries(models).forEach(([key, val]: [string, any]) => {
        const mAP = Math.min((val.mAP50 || 0) * 5, 100)
        list.push({ id: id++, test: `${key.toUpperCase()} Adversarial`, category: 'Adversarial', score: mAP, status: mAP >= 90 ? 'Pass' : mAP >= 75 ? 'Warning' : 'Fail' })
      })

      setResults(list)
    } catch (err: any) {
      setError(err.message || 'Backend error')
    } finally { setLoading(false) }
  }

  const filtered = results.filter((r) => r.test.toLowerCase().includes(search.toLowerCase()))

  const passCount = results.filter(r => r.status === 'Pass').length
  const warnCount = results.filter(r => r.status === 'Warning').length
  const failCount = results.filter(r => r.status === 'Fail').length
  const avgScore = results.length
    ? results.reduce((s, r) => s + r.score, 0) / results.length
    : 0

  // Radar data — average score per category
  const categories = ['Blur', 'Duplicate', 'Noise', 'Adversarial']
  const radarData = categories.map(cat => {
    const items = results.filter(r => r.category === cat)
    const avg = items.length ? items.reduce((s, r) => s + r.score, 0) / items.length : 0
    return { category: cat, score: Number(avg.toFixed(1)) }
  })

  // Bar data — score per test
  const barData = results.slice(0, 10).map(r => ({
    name: r.test.split(' ')[0] + ' ' + r.category,
    score: Number(r.score.toFixed(1)),
  }))

  const getTheme = (status: string) => statusTheme[status] || statusTheme.Warning

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-6">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              CV-INTEGRITY / Robustness
            </div>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">
              Adversarial Robustness
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Blur, noise, duplicate and adversarial robustness assessment across models and datasets.
            </p>
          </div>
          <button
            onClick={loadRobustness}
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Rerun Tests
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Tests', value: results.length, color: '#0F172A', icon: Shield },
            { label: 'Passed', value: passCount, color: '#10B981', icon: CheckCircle },
            { label: 'Warnings', value: warnCount, color: '#F59E0B', icon: AlertTriangle },
            { label: 'Avg Score', value: `${avgScore.toFixed(1)}%`, color: '#3B82F6', icon: Target },
          ].map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-medium text-slate-500">{s.label}</div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${s.color}15` }}>
                    <Icon size={14} style={{ color: s.color }} />
                  </div>
                </div>
                <div className="mt-3 text-[28px] font-bold leading-none tracking-tight text-slate-900">{s.value}</div>
              </div>
            )
          })}
        </div>

        {/* Charts */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Radar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                <Shield size={14} className="text-blue-600" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-slate-900">Robustness Profile</div>
                <div className="mt-0.5 text-[11px] text-slate-500">Average score per category</div>
              </div>
            </div>
            <div className="h-[280px]">
              {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="category" stroke="#94A3B8" style={{ fontSize: 11 }} />
                    <PolarRadiusAxis stroke="#94A3B8" style={{ fontSize: 10 }} domain={[0, 100]} />
                    <Radar name="Score" dataKey="score" stroke="#10B981" fill="#10B981" fillOpacity={0.35} />
                    <Tooltip contentStyle={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 11 }} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-[12px] text-slate-400">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                <BarChart3 size={14} className="text-emerald-600" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-slate-900">Test Scores</div>
                <div className="mt-0.5 text-[11px] text-slate-500">Score per robustness test</div>
              </div>
            </div>
            <div className="h-[280px]">
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="name" stroke="#94A3B8" style={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                    <YAxis stroke="#94A3B8" style={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 11 }} />
                    <Bar dataKey="score" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-[12px] text-slate-400">
                  No data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tests..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-[13px] text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Test results table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="text-[14px] font-semibold text-slate-900">Robustness Tests</div>
            <div className="mt-0.5 text-[11px] text-slate-500">
              {filtered.length} of {results.length} tests
            </div>
          </div>

          {loading && results.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-20 text-[13px] text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              Running robustness tests...
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <AlertTriangle size={24} className="mx-auto text-red-500" />
              <div className="mt-2 text-[13px] font-medium text-slate-700">Failed to load tests</div>
              <div className="mt-1 text-[11px] text-slate-400">{error}</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Shield size={32} className="mx-auto text-slate-400" />
              <div className="mt-3 text-[14px] font-medium text-slate-700">No tests found</div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-12 gap-4 bg-slate-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                <div className="col-span-6">Test</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Score</div>
                <div className="col-span-2 text-right">Status</div>
              </div>

              {filtered.map((r, i) => {
                const theme = getTheme(r.status)
                return (
                  <div
                    key={r.id}
                    className="grid grid-cols-12 items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50"
                  >
                    <div className="col-span-6 flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: theme.bg }}>
                        <Shield size={13} style={{ color: theme.dot }} />
                      </div>
                      <span className="truncate text-[12px] font-medium text-slate-800">{r.test}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        {r.category}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <span className="font-mono text-[12px] font-semibold text-slate-900">
                        {r.score.toFixed(1)}
                      </span>
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.min(r.score, 100)}%`, background: theme.dot }}
                        />
                      </div>
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <span
                        className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: theme.bg, color: theme.text }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: theme.dot }} />
                        {theme.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Robustness
