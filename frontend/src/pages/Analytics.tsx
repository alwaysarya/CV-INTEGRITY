import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Loader2, Users, Car, AlertTriangle, Target,
  TrendingUp, Database, Brain, BarChart3, Sparkles, ArrowRight, Activity, Zap
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import axios from 'axios'
import apiClient from '@/lib/api'

const API = 'http://localhost:8000'

function DonutGauge({ value, color, size = 220, label }: { value: number; color: string; size?: number; label?: string }) {
  const radius = (size - 24) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(value, 100) / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 20px ${color}90)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex items-baseline gap-0.5 font-semibold leading-none tracking-[-0.05em]" style={{ color }}>
          <span className="text-[64px]">{value.toFixed(0)}</span>
          <span className="text-[24px] opacity-50">%</span>
        </div>
        {label && (
          <div className="mt-3 text-[10px] font-bold tracking-[0.22em] uppercase text-white/50">
            {label}
          </div>
        )}
      </div>
    </div>
  )
}

/* ===== Custom animated bar chart ===== */
function CustomBarChart({ data, series }: { data: any[]; series: { key: string; label: string; color: string }[] }) {
  const maxValue = Math.max(...data.flatMap(d => series.map(s => d[s.key] || 0)), 100)
  const [hoveredBar, setHoveredBar] = useState<{ row: number; col: number } | null>(null)

  return (
    <div className="relative">
      <div className="flex">
        <div className="flex flex-col justify-between h-[280px] pr-4 text-right">
          {[100, 75, 50, 25, 0].map((v) => (
            <div key={v} className="text-[10px] font-mono text-white/30 tabular-nums leading-none">
              {v}
            </div>
          ))}
        </div>

        <div className="flex-1 relative">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="absolute left-0 right-0 border-t border-dashed border-white/[0.06]"
              style={{ top: `${i * 25}%` }}
            />
          ))}

          <div className="relative h-[280px] flex items-end justify-around gap-4">
            {data.map((row, rowIdx) => (
              <div key={rowIdx} className="flex items-end gap-2 flex-1 max-w-[120px]">
                {series.map((s, colIdx) => {
                  const value = row[s.key] || 0
                  const pct = (value / maxValue) * 100
                  const isHovered = hoveredBar?.row === rowIdx && hoveredBar?.col === colIdx

                  return (
                    <div key={s.key} className="flex-1 relative group" style={{ height: '100%' }}>
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        whileInView={{ height: `${pct}%`, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: rowIdx * 0.1 + colIdx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                        onMouseEnter={() => setHoveredBar({ row: rowIdx, col: colIdx })}
                        onMouseLeave={() => setHoveredBar(null)}
                        className="absolute bottom-0 left-0 right-0 rounded-t-md cursor-pointer transition-all"
                        style={{
                          background: isHovered
                            ? `linear-gradient(180deg, ${s.color}, ${s.color}CC)`
                            : `linear-gradient(180deg, ${s.color}CC, ${s.color}80)`,
                          boxShadow: isHovered ? `0 0 30px ${s.color}80, inset 0 1px 0 rgba(255,255,255,0.3)` : 'none',
                          transform: isHovered ? 'scaleX(1.05)' : 'scaleX(1)',
                        }}
                      />
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg backdrop-blur-xl border border-white/10 whitespace-nowrap z-10"
                          style={{ background: 'rgba(10,10,15,0.95)' }}
                        >
                          <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-white/50">
                            {s.label}
                          </div>
                          <div className="text-[13px] font-semibold tabular-nums" style={{ color: s.color }}>
                            {value.toFixed(1)}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          <div className="flex justify-around mt-4">
            {data.map((row, i) => (
              <div key={i} className="flex-1 max-w-[120px] text-center text-[11px] font-semibold tracking-[0.08em] uppercase text-white/50">
                {row.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-5 mt-6 pt-6 border-t border-white/[0.06]">
        {series.map((s) => (
          <div key={s.key} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 10px ${s.color}80` }} />
            <span className="text-[11px] font-semibold tracking-[0.02em] uppercase text-white/60">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
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

  const tooltipStyle = {
    background: '#0A0A0F',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    fontSize: 12,
    color: 'white',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
  }

  return (
    <div className="min-h-screen bg-[#FBFBFD]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-black">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1300px] h-[1300px] rounded-full blur-[260px]"
            style={{ background: 'radial-gradient(circle, #30D158, transparent 55%)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.45, 0.25] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            className="absolute bottom-0 right-[15%] w-[800px] h-[800px] rounded-full blur-[220px]"
            style={{ background: 'radial-gradient(circle, #2DD4BF, transparent 55%)' }}
          />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
              maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
            }} />
        </div>

        <div className="relative mx-auto max-w-[1200px] px-6 pt-32 pb-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl mb-10">
              <Activity size={13} className="text-[#2DD4BF]" />
              <span className="text-white/80 text-[11px] font-semibold tracking-[0.16em] uppercase">
                Analytics
              </span>
            </div>

            <h1 className="max-w-[1100px] mx-auto text-[72px] md:text-[112px] font-semibold leading-[0.95] tracking-[-0.045em] text-white">
              Every metric,
              <br />
              <span className="bg-gradient-to-r from-[#2DD4BF] via-[#10B981] to-[#30D158] bg-clip-text text-transparent">
                live and verified.
              </span>
            </h1>

            <p className="mt-10 max-w-[620px] mx-auto text-[21px] leading-[1.5] tracking-[-0.015em] text-white/50">
              Performance, trust scores, and operational telemetry across datasets and models.
            </p>

            <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-[1000px] mx-auto">
              {[
                { label: 'Datasets', value: totalDatasets, color: '#30D158', icon: Database },
                { label: 'Models', value: totalModels, color: '#0071E3', icon: Brain },
                { label: 'Avg Trust', value: `${avgTrust.toFixed(1)}%`, color: '#2DD4BF', icon: TrendingUp },
                { label: 'Ledger Blocks', value: blocks.length, color: '#AF52DE', icon: BarChart3 },
              ].map((stat, i) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
                    className="relative rounded-2xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] p-5 overflow-hidden group hover:bg-white/[0.06] transition-all"
                  >
                    <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-opacity"
                      style={{ background: stat.color }} />
                    <div className="relative flex items-center gap-2 mb-3">
                      <Icon size={12} style={{ color: stat.color }} strokeWidth={2.4} />
                      <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-white/40">
                        {stat.label}
                      </span>
                    </div>
                    <div className="relative text-[36px] font-semibold leading-none tracking-[-0.04em] text-white tabular-nums"
                      style={{ textShadow: `0 0 40px ${stat.color}80` }}>
                      {stat.value}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== LIVE METRICS ===== */}
      <section className="relative bg-white py-32 px-6">
        <div className="mx-auto max-w-[1200px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#30D158]/10 border border-[#30D158]/25 mb-5">
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-[#30D158]"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ boxShadow: '0 0 8px #30D158' }}
              />
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#30D158]">Live Telemetry</span>
            </div>
            <h2 className="text-[52px] md:text-[64px] font-semibold tracking-[-0.04em] leading-[1.02] text-[#1D1D1F]">
              Real-time signals,
              <br />
              <span className="bg-gradient-to-r from-[#2DD4BF] to-[#30D158] bg-clip-text text-transparent">
                continuously verified.
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {[
              { label: 'People Count', value: peopleCount.toLocaleString(), color: '#30D158', icon: Users },
              { label: 'Vehicle Count', value: vehicleCount.toLocaleString(), color: '#0071E3', icon: Car },
              { label: 'Anomalies', value: anomalyCount, color: '#FF453A', icon: AlertTriangle },
              { label: 'Model Accuracy', value: `${accuracy.toFixed(1)}%`, color: '#2DD4BF', icon: Target },
            ].map((m, i) => {
              const Icon = m.icon
              return (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -6 }}
                  className="group relative overflow-hidden rounded-[24px] bg-white p-6 border border-black/[0.04] transition-all"
                  style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
                >
                  <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `${m.color}30` }} />

                  <div className="relative flex items-center gap-3 mb-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: `${m.color}15` }}>
                      <Icon size={17} style={{ color: m.color }} strokeWidth={2.2} />
                    </div>
                    <span className="text-[12px] font-semibold tracking-[0.02em] uppercase text-[#86868B]">{m.label}</span>
                  </div>

                  <div className="relative text-[40px] font-semibold leading-none tracking-[-0.04em] tabular-nums"
                    style={{ color: m.color, textShadow: `0 0 30px ${m.color}40` }}>
                    {m.value}
                  </div>

                  <div className="relative mt-5 h-1.5 rounded-full bg-[#F0F0F2] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '78%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${m.color}, ${m.color}AA)` }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

            {/* ===== CHARTS — Custom animated ===== */}
      <section className="relative bg-[#F5F5F7] py-32 px-6">
        <div className="mx-auto max-w-[1200px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2DD4BF]/10 border border-[#2DD4BF]/25 mb-5">
              <Zap size={12} className="text-[#2DD4BF]" />
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#2DD4BF]">Deep Dive</span>
            </div>
            <h2 className="text-[52px] md:text-[72px] font-semibold tracking-[-0.04em] leading-[1.0] text-[#1D1D1F]">
              Charts that
              <br />
              <span className="bg-gradient-to-r from-[#0071E3] via-[#2DD4BF] to-[#30D158] bg-clip-text text-transparent">
                tell the story.
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ==== Dataset Chart — Custom SVG ==== */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-[32px] overflow-hidden bg-[#0A0A0F] p-8"
              style={{ boxShadow: '0 30px 80px -20px rgba(0,0,0,0.4)' }}
            >
              {/* Ambient glow */}
              <div className="absolute -top-40 -left-40 w-[400px] h-[400px] rounded-full blur-[120px] opacity-25"
                style={{ background: 'radial-gradient(circle, #30D158, transparent 60%)' }} />

              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#30D158] to-transparent" />

              <div className="relative">
                <div className="flex items-start justify-between mb-10">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#30D158] animate-pulse" style={{ boxShadow: '0 0 8px #30D158' }} />
                      <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#30D158]">Dataset Quality</span>
                    </div>
                    <h3 className="text-[24px] font-semibold tracking-[-0.02em] text-white">Overall · Blur · Noise</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-bold tracking-[0.16em] uppercase text-white/40">Live</div>
                    <div className="mt-1 text-[11px] font-mono text-[#30D158]">{datasetChartData.length} rows</div>
                  </div>
                </div>

                {datasetChartData.length > 0 ? (
                  <CustomBarChart
                    data={datasetChartData}
                    series={[
                      { key: 'overall', label: 'Overall', color: '#30D158' },
                      { key: 'blur', label: 'Blur', color: '#0071E3' },
                      { key: 'noise', label: 'Noise', color: '#FF9F0A' },
                    ]}
                  />
                ) : (
                  <div className="flex h-[280px] items-center justify-center text-[13px] text-white/40">No dataset data</div>
                )}
              </div>
            </motion.div>

            {/* ==== Model Chart — Custom SVG ==== */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-[32px] overflow-hidden bg-[#0A0A0F] p-8"
              style={{ boxShadow: '0 30px 80px -20px rgba(0,0,0,0.4)' }}
            >
              <div className="absolute -top-40 -right-40 w-[400px] h-[400px] rounded-full blur-[120px] opacity-25"
                style={{ background: 'radial-gradient(circle, #2DD4BF, transparent 60%)' }} />

              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#2DD4BF] to-transparent" />

              <div className="relative">
                <div className="flex items-start justify-between mb-10">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] animate-pulse" style={{ boxShadow: '0 0 8px #2DD4BF' }} />
                      <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#2DD4BF]">Model Performance</span>
                    </div>
                    <h3 className="text-[24px] font-semibold tracking-[-0.02em] text-white">Precision · Recall · mAP50</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-bold tracking-[0.16em] uppercase text-white/40">Live</div>
                    <div className="mt-1 text-[11px] font-mono text-[#2DD4BF]">{modelChartData.length} rows</div>
                  </div>
                </div>

                {modelChartData.length > 0 ? (
                  <CustomBarChart
                    data={modelChartData}
                    series={[
                      { key: 'precision', label: 'Precision', color: '#2DD4BF' },
                      { key: 'recall', label: 'Recall', color: '#0071E3' },
                      { key: 'mAP50', label: 'mAP50', color: '#AF52DE' },
                    ]}
                  />
                ) : (
                  <div className="flex h-[280px] items-center justify-center text-[13px] text-white/40">No model data</div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== BOTTOM CTA ===== */}
      <section className="relative bg-black py-40 px-6 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] rounded-full blur-[260px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #30D158, transparent 55%)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[220px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #2DD4BF, transparent 55%)' }}
        />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="w-[700px] h-[700px]"
          >
            <svg viewBox="0 0 700 700" className="w-full h-full">
              <circle cx="350" cy="350" r="330" fill="none" stroke="#30D158" strokeWidth="1" strokeDasharray="4 8" opacity="0.25" />
            </svg>
          </motion.div>
        </div>

        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              left: `${15 + (i * 8) % 70}%`,
              top: `${25 + (i * 11) % 55}%`,
              background: i % 2 === 0 ? '#30D158' : '#2DD4BF',
              boxShadow: `0 0 15px ${i % 2 === 0 ? '#30D158' : '#2DD4BF'}`,
            }}
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.9, 0.2] }}
            transition={{ duration: 4 + (i % 3), repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1 }}
          className="relative max-w-[900px] mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl mb-10">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-[#30D158]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ boxShadow: '0 0 8px #30D158' }}
            />
            <span className="text-white/80 text-[11px] font-semibold tracking-[0.16em] uppercase">
              Live Analytics
            </span>
          </div>

          <h2 className="text-[72px] md:text-[112px] font-semibold leading-[0.9] tracking-[-0.05em] text-white">
            Measure what
            <br />
            <motion.span
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-block bg-gradient-to-r from-[#2DD4BF] via-[#10B981] via-[#30D158] to-[#2DD4BF] bg-clip-text text-transparent bg-[length:200%_100%]"
            >
              matters most.
            </motion.span>
          </h2>

          <p className="mt-10 text-[21px] leading-[1.5] tracking-[-0.015em] text-white/50 max-w-[520px] mx-auto">
            Every dataset, model, and inference — measured with cryptographic precision.
          </p>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
            <a href="/datasets" className="group relative inline-flex items-center gap-2 rounded-full bg-white text-black px-8 py-4 text-[15px] font-semibold tracking-[-0.01em] transition-all hover:scale-[1.03] overflow-hidden"
              style={{ boxShadow: '0 20px 60px -12px rgba(255,255,255,0.4)' }}>
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
              <span className="relative">View Datasets</span>
              <ArrowRight size={15} className="relative transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
            </a>
            <a href="/reports" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] backdrop-blur-xl text-white px-8 py-4 text-[15px] font-medium tracking-[-0.01em] transition-all hover:bg-white/[0.08]">
              View Reports
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

export default Analytics
