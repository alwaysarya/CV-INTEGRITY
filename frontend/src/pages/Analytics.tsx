import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Loader2, RefreshCw, Users, Car, AlertTriangle, Target,
  TrendingUp, Database, Brain, BarChart3
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import axios from 'axios'
import apiClient from '@/lib/api'

const API = 'http://localhost:8000'

function StatCard({ label, value, color, icon: Icon }: any) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="rounded-[18px] bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-center justify-between">
        <div className="text-[15px] font-medium text-[#86868B]">{label}</div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F5F7]">
          <Icon size={14} className="text-[#1D1D1F]" />
        </div>
      </div>
      <div className="mt-8 text-[48px] font-semibold leading-none tracking-[-0.04em] text-[#1D1D1F]" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-[#F5F5F7]">
        <motion.div initial={{ width: 0 }} animate={{ width: typeof value === 'string' && value.includes('%') ? value : '60%' }} transition={{ duration: 0.8 }} className="h-full rounded-full" style={{ background: color }} />
      </div>
    </motion.div>
  )
}

export function Analytics() {
  const [datasets, setDatasets] = useState<any>({})
  const [models, setModels] = useState<any>({})
  const [blocks, setBlocks] = useState<any[]>([])
  const [trust, setTrust] = useState<any>({})
  const [realMetrics, setRealMetrics] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [dRes, mRes, bRes, tRes, metricsRes] = await Promise.all([
        apiClient.getDatasets().catch(() => ({ data: { datasets: {} } })),
        apiClient.getModels().catch(() => ({ data: { models: {} } })),
        apiClient.getBlocks().catch(() => ({ data: { blocks: [] } })),
        apiClient.getTrustScores?.().catch(() => ({ data: { trust_scores: {} } })) || Promise.resolve({ data: { trust_scores: {} } }),
        axios.get(`${API}/api/analytics/metrics`).catch(() => ({ data: { metrics: {} } })),
      ])
      setDatasets(dRes.data.datasets || {})
      setModels(mRes.data.models || {})
      setBlocks(bRes.data.blocks || [])
      setTrust(tRes.data.trust_scores || {})
      setRealMetrics(metricsRes.data.metrics || {})
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const datasetChartData = Object.entries(datasets).map(([key, val]: [string, any]) => ({
    name: key.toUpperCase(),
    overall: Number(val.overall_score || 0),
    blur: Number(val.blur_score || 0),
    noise: Number(val.noise_score || 0),
  }))

  const modelChartData = Object.entries(models).map(([key, val]: [string, any]) => ({
    name: key.toUpperCase(),
    precision: Number(val.precision || 0),
    recall: Number(val.recall || 0),
    mAP50: Number(val.mAP50 || 0),
  }))

  const trustChartData = Object.entries(trust).map(([key, val]: [string, any]) => ({
    name: key.toUpperCase(),
    score: Number(val.final_score || 0),
  }))

  const totalDatasets = Object.keys(datasets).length
  const totalModels = Object.keys(models).length
  const avgTrust = trustChartData.length ? trustChartData.reduce((s, x) => s + x.score, 0) / trustChartData.length : 0

  const metrics = realMetrics || {}
  const peopleCount = metrics.people_count ?? 0
  const vehicleCount = metrics.vehicle_count ?? 0
  const anomalyCount = metrics.anomaly_count ?? 0
  const accuracy = metrics.accuracy ?? 0

  const tooltipStyle = { background: '#FFF', border: '1px solid #D2D2D7', borderRadius: 12, fontSize: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }

  return (
    <div className="min-h-screen bg-[#FBFBFD]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>
      {/* Hero */}
      <section className="mx-auto max-w-[1200px] px-6 pt-20 pb-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-[12px] font-medium tracking-[0.14em] text-[#86868B] uppercase">
            CV-INTEGRITY / Analytics
          </div>
          <h1 className="mt-4 text-[56px] font-semibold leading-[1.05] tracking-[-0.025em] text-[#1D1D1F]">
            Analytics
          </h1>
          <p className="mt-5 max-w-[640px] text-[19px] leading-relaxed text-[#86868B]">
            Performance metrics, trust scores and operational telemetry across datasets and models.
          </p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-[1200px] px-6 pb-16">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Datasets" value={totalDatasets} color="#34C759" icon={Database} />
          <StatCard label="Models" value={totalModels} color="#0071E3" icon={Brain} />
          <StatCard label="Avg Trust" value={`${avgTrust.toFixed(1)}%`} color="#FF9500" icon={TrendingUp} />
          <StatCard label="Ledger Blocks" value={blocks.length} color="#AF52DE" icon={BarChart3} />
        </div>
      </section>

      {/* Real-time metrics */}
      <section className="mx-auto max-w-[1200px] px-6 pb-16">
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {[
            { label: 'People Count', value: peopleCount.toLocaleString(), color: '#34C759', icon: Users },
            { label: 'Vehicle Count', value: vehicleCount.toLocaleString(), color: '#0071E3', icon: Car },
            { label: 'Anomalies', value: anomalyCount, color: '#FF3B30', icon: AlertTriangle },
            { label: 'Model Accuracy', value: `${accuracy.toFixed(1)}%`, color: '#FF9500', icon: Target },
          ].map((m) => {
            const Icon = m.icon
            return (
              <div key={m.label} className="rounded-[18px] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${m.color}15` }}>
                    <Icon size={14} style={{ color: m.color }} />
                  </div>
                  <span className="text-[13px] font-medium text-[#86868B]">{m.label}</span>
                </div>
                <div className="mt-4 text-[32px] font-semibold tracking-[-0.03em] text-[#1D1D1F]">{m.value}</div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Charts */}
      <section className="mx-auto max-w-[1200px] px-6 pb-20">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Dataset chart */}
          <div className="rounded-[18px] bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <div className="mb-6">
              <h3 className="text-[19px] font-semibold text-[#1D1D1F]">Dataset Quality</h3>
              <p className="mt-0.5 text-[13px] text-[#86868B]">Overall, blur and noise scores</p>
            </div>
            <div className="h-[280px]">
              {datasetChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datasetChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F7" vertical={false} />
                    <XAxis dataKey="name" stroke="#86868B" style={{ fontSize: 12 }} />
                    <YAxis stroke="#86868B" style={{ fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="overall" fill="#34C759" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="blur" fill="#0071E3" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="noise" fill="#FF9500" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-[13px] text-[#86868B]">No dataset data</div>
              )}
            </div>
          </div>

          {/* Model chart */}
          <div className="rounded-[18px] bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <div className="mb-6">
              <h3 className="text-[19px] font-semibold text-[#1D1D1F]">Model Performance</h3>
              <p className="mt-0.5 text-[13px] text-[#86868B]">Precision, recall and mAP50</p>
            </div>
            <div className="h-[280px]">
              {modelChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={modelChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F7" vertical={false} />
                    <XAxis dataKey="name" stroke="#86868B" style={{ fontSize: 12 }} />
                    <YAxis stroke="#86868B" style={{ fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="precision" fill="#34C759" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="recall" fill="#0071E3" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="mAP50" fill="#FF9500" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-[13px] text-[#86868B]">No model data</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Analytics
