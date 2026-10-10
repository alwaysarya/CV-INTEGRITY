import { useEffect, useState } from 'react'
import {
  TrendingDown, TrendingUp, AlertTriangle, CheckCircle, Activity,
  Loader2, RefreshCw, BarChart3, Gauge, Target
} from 'lucide-react'
import apiClient from '@/lib/api'

const API = 'http://localhost:8000'

const severityTheme: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  Stable: { bg: '#D1FAE5', text: '#065F46', dot: '#10B981', label: 'Stable' },
  Warning: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B', label: 'Warning' },
  Critical: { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444', label: 'Critical' },
}

export function DriftMonitor() {
  const [drifts, setDrifts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [riskLevels, setRiskLevels] = useState<any[]>([])

  useEffect(() => {
    loadDrift()
    fetch(`${API}/api/drift/risk-levels`)
      .then(r => r.json())
      .then(d => { if (d.status === 'success') setRiskLevels(d.risk_levels || []) })
      .catch(() => null)
  }, [])

  const loadDrift = async () => {
    setLoading(true)
    setError(null)
    try {
      const [mRes, dRes] = await Promise.all([
        apiClient.getModels().catch(() => ({ data: { models: {} } })),
        apiClient.getDatasets().catch(() => ({ data: { datasets: {} } })),
      ])
      const models = mRes.data.models || {}
      const datasets = dRes.data.datasets || {}
      const list: any[] = []

      Object.entries(models).forEach(([key, val]: [string, any]) => {
        const mAP = val.mAP50 || 0
        const baseline = 20
        const change = mAP - baseline
        list.push({
          id: `model_${key}`,
          model: `${key.toUpperCase()} Model`,
          metric: 'mAP50 Performance',
          baseline,
          current: mAP,
          change,
          severity: Math.abs(change) < 3 ? 'Stable' : Math.abs(change) < 5 ? 'Warning' : 'Critical',
          kind: 'model',
        })
      })

      Object.entries(datasets).forEach(([key, val]: [string, any]) => {
        const score = val.overall_score || 0
        const baseline = 85
        const change = score - baseline
        list.push({
          id: `dataset_${key}`,
          model: `${key.toUpperCase()} Dataset`,
          metric: 'Overall Quality',
          baseline,
          current: score,
          change,
          severity: Math.abs(change) < 5 ? 'Stable' : Math.abs(change) < 15 ? 'Warning' : 'Critical',
          kind: 'dataset',
        })
      })

      setDrifts(list)
    } catch (err: any) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  const getTheme = (severity: string) => severityTheme[severity] || severityTheme.Stable

  const stableCount = drifts.filter(d => d.severity === 'Stable').length
  const warningCount = drifts.filter(d => d.severity === 'Warning').length
  const criticalCount = drifts.filter(d => d.severity === 'Critical').length

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-6">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              CV-INTEGRITY / Drift Monitor
            </div>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">
              Drift Detection
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Monitor performance drift across models and datasets against baseline thresholds.
            </p>
          </div>
          <button
            onClick={loadDrift}
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Monitors', value: drifts.length, color: '#0F172A', icon: Activity },
            { label: 'Stable', value: stableCount, color: '#10B981', icon: CheckCircle },
            { label: 'Warning', value: warningCount, color: '#F59E0B', icon: AlertTriangle },
            { label: 'Critical', value: criticalCount, color: '#EF4444', icon: AlertTriangle },
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

        {/* Risk levels info */}
        {riskLevels.length > 0 && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Gauge size={14} className="text-slate-400" />
              <span className="text-[13px] font-semibold text-slate-900">Risk Level Thresholds</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {riskLevels.map((r: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5"
                >
                  <span className="text-[11px] font-medium text-slate-700">{r.label || r.level}</span>
                  {r.min !== undefined && (
                    <span className="font-mono text-[11px] text-slate-500">
                      {r.min}–{r.max ?? '∞'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drifts table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="text-[14px] font-semibold text-slate-900">Drift Monitors</div>
            <div className="mt-0.5 text-[11px] text-slate-500">
              {drifts.length} metrics being tracked
            </div>
          </div>

          {loading && drifts.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-20 text-[13px] text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              Computing drift...
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <AlertTriangle size={24} className="mx-auto text-red-500" />
              <div className="mt-2 text-[13px] font-medium text-slate-700">Failed to load drift data</div>
              <div className="mt-1 text-[11px] text-slate-400">{error}</div>
            </div>
          ) : drifts.length === 0 ? (
            <div className="py-20 text-center">
              <Activity size={32} className="mx-auto text-slate-400" />
              <div className="mt-3 text-[14px] font-medium text-slate-700">No drift monitors</div>
              <div className="mt-1 text-[11px] text-slate-500">Add models or datasets to monitor drift</div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-12 gap-4 bg-slate-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                <div className="col-span-4">Entity</div>
                <div className="col-span-3">Metric</div>
                <div className="col-span-2">Baseline</div>
                <div className="col-span-2">Current</div>
                <div className="col-span-1 text-right">Severity</div>
              </div>

              {drifts.map((d, i) => {
                const theme = getTheme(d.severity)
                const isPositive = d.change >= 0
                return (
                  <div
                    key={i}
                    className="grid grid-cols-12 items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: theme.bg }}>
                        {isPositive ? (
                          <TrendingUp size={15} style={{ color: theme.dot }} />
                        ) : (
                          <TrendingDown size={15} style={{ color: theme.dot }} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-medium text-slate-900">{d.model}</div>
                        <div className="mt-0.5 text-[10px] font-mono text-slate-500">{d.kind}</div>
                      </div>
                    </div>
                    <div className="col-span-3 text-[11px] text-slate-600">{d.metric}</div>
                    <div className="col-span-2 font-mono text-[12px] text-slate-600">{d.baseline.toFixed(1)}</div>
                    <div className="col-span-2">
                      <div className="font-mono text-[12px] font-semibold text-slate-900">{d.current.toFixed(1)}</div>
                      <div className="mt-0.5 flex items-center gap-1 text-[10px]">
                        {isPositive ? (
                          <TrendingUp size={9} className="text-emerald-600" />
                        ) : (
                          <TrendingDown size={9} className="text-red-600" />
                        )}
                        <span className="font-mono" style={{ color: isPositive ? '#10B981' : '#EF4444' }}>
                          {isPositive ? '+' : ''}{d.change.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <span
                        className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: theme.bg, color: theme.text }}
                      >
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

export default DriftMonitor
