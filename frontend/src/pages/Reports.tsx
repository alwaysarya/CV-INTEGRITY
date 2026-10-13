import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Search, Loader2, RefreshCw, Shield, Eye, Sparkles, ArrowRight, Lock, CheckCircle, Download, Layers, Activity } from 'lucide-react'
import apiClient from '@/lib/api'

const API = 'http://localhost:8000'

interface Report {
  id: number
  title: string
  type: string
  source: string
  status: string
  details: string
}

const typeTheme: Record<string, { color: string; label: string }> = {
  Trust: { color: '#30D158', label: 'Trust' },
  Model: { color: '#00E5FF', label: 'Model' },
  Blockchain: { color: '#14B8A6', label: 'Blockchain' },
  Dataset: { color: '#FF9F0A', label: 'Dataset' },
  Attack: { color: '#FF453A', label: 'Attack' },
  History: { color: '#06B6D4', label: 'History' },
}

/* ===== Animated document stack ===== */
function DocumentStack() {
  return (
    <div className="relative w-[400px] h-[400px] flex items-center justify-center">
      {/* Rotating outer ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[380px] h-[380px]"
      >
        <svg viewBox="0 0 380 380" className="w-full h-full">
          <circle cx="190" cy="190" r="180" fill="none" stroke="#2DD4BF" strokeWidth="1" strokeDasharray="4 12" opacity="0.4" />
          <circle cx="190" cy="10" r="4" fill="#2DD4BF" opacity="0.9" />
        </svg>
      </motion.div>

      {/* Reverse rotating ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[300px] h-[300px]"
      >
        <svg viewBox="0 0 300 300" className="w-full h-full">
          <circle cx="150" cy="150" r="140" fill="none" stroke="#0071E3" strokeWidth="1.5" strokeDasharray="2 8" opacity="0.5" />
        </svg>
      </motion.div>

      {/* Stack of documents */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30, rotate: -15 + i * 5 }}
          animate={{
            opacity: 1,
            y: i * -8,
            rotate: -12 + i * 6,
          }}
          transition={{ duration: 1, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="absolute w-[220px] h-[280px] rounded-2xl backdrop-blur-xl"
          style={{
            background: i === 3 ? 'linear-gradient(135deg, rgba(45,212,191,0.35), rgba(48,209,88,0.35))' : 'rgba(255,255,255,0.06)',
            border: i === 3 ? '1px solid rgba(45,212,191,0.6)' : '1px solid rgba(255,255,255,0.1)',
            boxShadow: i === 3 ? '0 20px 60px rgba(45,212,191,0.4), 0 0 80px rgba(45,212,191,0.25)' : '0 10px 30px rgba(0,0,0,0.3)',
            zIndex: i,
          }}
        >
          {i === 3 && (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={16} className="text-white" />
                <span className="text-white text-[11px] font-bold tracking-[0.16em] uppercase">Signed</span>
              </div>
              <div className="space-y-2">
                {[90, 75, 85, 60, 80, 70].map((w, j) => (
                  <motion.div
                    key={j}
                    initial={{ width: 0 }}
                    animate={{ width: `${w}%` }}
                    transition={{ duration: 1, delay: 1 + j * 0.1 }}
                    className="h-2 rounded-full bg-white/20"
                  />
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-white/20">
                <div className="text-[9px] font-bold tracking-[0.16em] uppercase text-white/60">SHA-256</div>
                <div className="mt-1 font-mono text-[10px] text-white/90 truncate">0x8f3a...4b2c</div>
              </div>
            </div>
          )}
        </motion.div>
      ))}

      {/* Glow behind */}
      <div className="absolute inset-0 rounded-full blur-[80px] opacity-50"
        style={{ background: 'radial-gradient(circle, #2DD4BF, transparent 70%)' }} />
    </div>
  )
}

export function Reports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => { loadReports() }, [])

  const loadReports = async () => {
    setLoading(true)
    try {
      const [tRes, mRes, dRes, aRes, bRes] = await Promise.all([
        fetch(`${API}/api/trust-scores`).then(r => r.json()).catch(() => ({ trust_scores: {} })),
        apiClient.getModels().catch(() => ({ data: { models: {} } })),
        apiClient.getDatasets().catch(() => ({ data: { datasets: {} } })),
        apiClient.getAttacks().catch(() => ({ data: { attacks: {} } })),
        apiClient.getBlocks().catch(() => ({ data: { blocks: [] } })),
      ])

      setReports([
        { id: 1, title: 'Trust Score Evaluation', type: 'Trust', source: 'Trust Engine', status: 'Ready', details: `${Object.keys(tRes.trust_scores || {}).length} entities evaluated` },
        { id: 2, title: 'Model Integrity Report', type: 'Model', source: 'Model Registry', status: 'Ready', details: `${Object.keys(mRes.data?.models || {}).length} models analyzed` },
        { id: 3, title: 'Dataset Quality Report', type: 'Dataset', source: 'Dataset Analyzer', status: 'Ready', details: `${Object.keys(dRes.data?.datasets || {}).length} datasets reviewed` },
        { id: 4, title: 'Security Threat Report', type: 'Attack', source: 'Threat Detection', status: 'Ready', details: `${Object.keys(aRes.data?.attacks || {}).length} patterns cataloged` },
        { id: 5, title: 'Blockchain Audit Trail', type: 'Blockchain', source: 'Ledger Service', status: 'Ready', details: `${(bRes.data?.blocks || []).length} blocks recorded` },
        { id: 6, title: 'Inference History Log', type: 'History', source: 'Inference Engine', status: 'Ready', details: `Recent events` },
      ])
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const filtered = reports.filter(r => {
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || r.type.toLowerCase() === filter.toLowerCase()
    return matchSearch && matchFilter
  })

  const types = Array.from(new Set(reports.map(r => r.type)))
  const readyCount = reports.filter(r => r.status.toLowerCase().includes('ready')).length

  return (
    <div className="min-h-screen bg-[#FBFBFD]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>

      {/* ===== HERO with document stack ===== */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-black">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-[25%] -translate-y-1/2 w-[1000px] h-[1000px] rounded-full blur-[240px]"
            style={{ background: 'radial-gradient(circle, #2DD4BF, transparent 55%)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.45, 0.25] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[220px]"
            style={{ background: 'radial-gradient(circle, #30D158, transparent 55%)' }}
          />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
              maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
            }} />
        </div>

        <div className="relative mx-auto max-w-[1200px] px-6 py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl mb-8">
                <Sparkles size={13} className="text-[#2DD4BF]" />
                <span className="text-white/80 text-[11px] font-semibold tracking-[0.16em] uppercase">
                  Reports & Evidence
                </span>
              </div>

              <h1 className="text-[72px] md:text-[96px] font-semibold leading-[0.94] tracking-[-0.05em] text-white">
                Every report,
                <br />
                <span className="bg-gradient-to-r from-[#2DD4BF] via-[#10B981] to-[#30D158] bg-clip-text text-transparent">
                  signed & archived.
                </span>
              </h1>

              <p className="mt-8 max-w-[480px] text-[19px] leading-[1.5] tracking-[-0.015em] text-white/50">
                Generated assurance reports, evidence records, and exportable compliance documentation.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-8">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#30D158]" style={{ boxShadow: '0 0 8px #30D158' }} />
                  <span className="text-white/70 text-[14px] font-medium">{readyCount} reports ready</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]" style={{ boxShadow: '0 0 8px #2DD4BF' }} />
                  <span className="text-white/70 text-[14px] font-medium">{types.length} report types</span>
                </div>
              </div>

              <div className="mt-12 flex flex-wrap items-center gap-3">
                <a href="#library" className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold tracking-[-0.01em] text-black transition-all hover:scale-[1.03]"
                  style={{ boxShadow: '0 0 60px rgba(255,255,255,0.3)' }}>
                  Browse Library
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
                </a>
                <button onClick={loadReports} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-7 py-3.5 text-[15px] font-medium tracking-[-0.01em] text-white/90 backdrop-blur-xl transition-all hover:bg-white/[0.08]">
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </motion.div>

            {/* Right: document stack */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-center"
            >
              <DocumentStack />
            </motion.div>
          </div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[1000px]"
          >
            {[
              { label: 'Total Reports', value: reports.length, color: '#2DD4BF' },
              { label: 'Ready', value: readyCount, color: '#30D158' },
              { label: 'Report Types', value: types.length, color: '#30D158' },
              { label: 'Sources', value: Array.from(new Set(reports.map(r => r.source))).length, color: '#00E5FF' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + i * 0.1 }}
                className="relative rounded-2xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] p-5 overflow-hidden group hover:bg-white/[0.06] transition-all"
              >
                <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-opacity"
                  style={{ background: stat.color }} />
                <div className="relative text-[10px] font-bold tracking-[0.16em] uppercase text-white/40 mb-3">
                  {stat.label}
                </div>
                <div className="relative text-[36px] font-semibold leading-none tracking-[-0.04em] text-white tabular-nums"
                  style={{ textShadow: `0 0 40px ${stat.color}80` }}>
                  {stat.value}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* ===== FEATURED REPORT SPOTLIGHT ===== */}
      <section className="relative bg-white py-32 px-6">
        <div className="mx-auto max-w-[1200px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#30D158]/10 border border-[#30D158]/25 mb-5">
              <CheckCircle size={12} className="text-[#30D158]" />
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#30D158]">Featured Report</span>
            </div>
            <h2 className="text-[52px] md:text-[64px] font-semibold tracking-[-0.04em] leading-[1.02] text-[#1D1D1F]">
              Full assurance,
              <br />
              <span className="bg-gradient-to-r from-[#2DD4BF] to-[#30D158] bg-clip-text text-transparent">
                in one document.
              </span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-[40px] overflow-hidden bg-[#0A0A0F]"
            style={{ boxShadow: '0 40px 120px -20px rgba(0,0,0,0.4)' }}
          >
            <div className="absolute inset-0">
              <div className="absolute top-0 left-1/4 w-[700px] h-[700px] rounded-full blur-[180px] opacity-25"
                style={{ background: 'radial-gradient(circle, #2DD4BF, transparent 60%)' }} />
              <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[180px] opacity-20"
                style={{ background: 'radial-gradient(circle, #30D158, transparent 60%)' }} />
            </div>

            <div className="relative h-[2px] bg-gradient-to-r from-transparent via-[#2DD4BF] to-transparent" />

            <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 p-12 md:p-16 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, #2DD4BF, #30D158)',
                      boxShadow: '0 16px 40px -8px #2DD4BF90, 0 0 60px #2DD4BF40',
                    }}>
                    <Shield size={28} className="text-white" strokeWidth={2.2} />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-white/40">Complete Report</div>
                    <div className="text-[14px] font-semibold text-white">Full pipeline assurance</div>
                  </div>
                </div>

                <h3 className="text-[48px] md:text-[64px] font-semibold leading-[1] tracking-[-0.045em] text-white">
                  Full Pipeline
                  <br />
                  <span className="text-[#2DD4BF]">Assurance Report.</span>
                </h3>

                <p className="mt-6 text-[17px] leading-[1.5] tracking-[-0.01em] text-white/50 max-w-[480px]">
                  Every stage cryptographically verified — contributor, dataset, model, inference, and output. Exportable PDF with embedded signatures.
                </p>

                {/* Report components grid */}
                <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-3 max-w-[560px]">
                  {[
                    { label: 'Trust Score', value: '67%', color: '#30D158' },
                    { label: 'Datasets', value: '3', color: '#2DD4BF' },
                    { label: 'Models', value: '3', color: '#00E5FF' },
                    { label: 'Blocks', value: '6', color: '#14B8A6' },
                    { label: 'Wallets', value: '3', color: '#06B6D4' },
                    { label: 'Threats', value: '5', color: '#FF9F0A' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3.5">
                      <div className="text-[9px] font-bold tracking-[0.14em] uppercase text-white/40 mb-1.5">
                        {item.label}
                      </div>
                      <div className="text-[20px] font-semibold tabular-nums tracking-[-0.02em]" style={{ color: item.color }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-10 flex flex-wrap items-center gap-3">
                  <a href="/assurance" className="group inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold tracking-[-0.01em] text-black transition-all hover:scale-[1.03]"
                    style={{ background: '#2DD4BF', boxShadow: '0 12px 40px -8px #2DD4BF80' }}>
                    <Download size={14} />
                    Download PDF
                  </a>
                  <a href="#" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-medium tracking-[-0.01em] text-white/80 border border-white/15 hover:bg-white/[0.06] transition-all">
                    <Layers size={14} />
                    Export JSON
                  </a>
                </div>
              </div>

              {/* Right: animated preview */}
              <div className="flex items-center justify-center">
                <div className="relative w-[280px] h-[380px]">
                  {/* Document shadow glow */}
                  <div className="absolute -inset-8 rounded-full blur-3xl opacity-40"
                    style={{ background: 'radial-gradient(circle, #2DD4BF, transparent 70%)' }} />

                  {/* Document */}
                  <motion.div
                    initial={{ rotate: -5, y: 20, opacity: 0 }}
                    whileInView={{ rotate: -2, y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full h-full rounded-2xl backdrop-blur-2xl p-8"
                    style={{
                      background: 'linear-gradient(135deg, rgba(45,212,191,0.2), rgba(48,209,88,0.15))',
                      border: '1px solid rgba(45,212,191,0.4)',
                      boxShadow: '0 30px 80px rgba(45,212,191,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #2DD4BF, #30D158)' }}>
                        <Shield size={14} className="text-white" />
                      </div>
                      <div>
                        <div className="text-white text-[11px] font-bold tracking-[0.14em] uppercase">Assurance</div>
                        <div className="text-white/40 text-[9px] font-mono">v1.0 · 2026</div>
                      </div>
                    </div>

                    {/* Content lines */}
                    <div className="space-y-2.5 mb-6">
                      {[100, 85, 92, 70, 88, 60, 75, 82].map((w, j) => (
                        <motion.div
                          key={j}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${w}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.3 + j * 0.08 }}
                          className="h-2 rounded-full bg-white/[0.15]"
                        />
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="absolute bottom-8 left-8 right-8 pt-4 border-t border-white/10">
                      <div className="text-[9px] font-bold tracking-[0.16em] uppercase text-white/40 mb-1">Signed</div>
                      <div className="font-mono text-[11px] text-[#2DD4BF] truncate">0x8f3a...4b2c</div>
                    </div>

                    {/* Verified badge */}
                    <div className="absolute -top-3 -right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-xl">
                      <div className="w-3.5 h-3.5 rounded-full bg-[#30D158] flex items-center justify-center">
                        <CheckCircle size={9} className="text-white" strokeWidth={3.5} />
                      </div>
                      <span className="text-[10px] font-bold text-black tracking-[-0.005em]">Verified</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== COMPLIANCE BADGES ===== */}
      <section className="relative bg-[#F5F5F7] py-24 px-6">
        <div className="mx-auto max-w-[1200px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/25 mb-5">
              <Lock size={12} className="text-[#00E5FF]" />
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#00E5FF]">Standards Aligned</span>
            </div>
            <h2 className="text-[40px] md:text-[52px] font-semibold tracking-[-0.04em] leading-[1.05] text-[#1D1D1F]">
              Compliance built in.
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { label: 'NIST AI RMF', color: '#2DD4BF', icon: Shield },
              { label: 'ISO 27001', color: '#30D158', icon: Lock },
              { label: 'EU AI Act', color: '#00E5FF', icon: CheckCircle },
              { label: 'SIH 26228', color: '#14B8A6', icon: Sparkles },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -6 }}
                  className="group relative overflow-hidden rounded-[24px] bg-white p-6 border border-black/[0.04] transition-all"
                  style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
                >
                  <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `${item.color}30` }} />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl mb-5"
                    style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                    <Icon size={20} style={{ color: item.color }} strokeWidth={2.2} />
                  </div>
                  <div className="relative text-[16px] font-semibold tracking-[-0.02em] text-[#1D1D1F]">
                    {item.label}
                  </div>
                  <div className="relative mt-1 text-[11px] font-bold tracking-[0.12em] uppercase text-[#30D158]">
                    ✓ Compliant
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Trust indicators row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
          >
            {[
              { label: 'Air-gapped', color: '#30D158' },
              { label: 'Tamper-evident', color: '#2DD4BF' },
              { label: 'SHA-256 signed', color: '#00E5FF' },
              { label: 'Zero external dependency', color: '#14B8A6' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                <span className="text-[13px] font-medium tracking-[-0.005em] text-[#6E6E73]">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== SEARCH ===== */}
      <section id="library" className="relative bg-white py-24 px-6">
        <div className="mx-auto max-w-[1200px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-[1px] bg-[#1D1D1F]/30" />
              <span className="text-[11px] font-bold tracking-[0.24em] uppercase text-[#1D1D1F]/50">
                Evidence Library
              </span>
            </div>
            <h2 className="text-[48px] md:text-[64px] font-semibold tracking-[-0.04em] leading-[1.0] text-[#1D1D1F]">
              Every report,
              <br />every source.
            </h2>
          </motion.div>

          <div className="rounded-[24px] bg-white p-5 border border-black/[0.04] mb-12" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6E6E73]" strokeWidth={2.2} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search reports..."
                  className="w-full rounded-xl bg-[#F5F5F7] py-3.5 pl-11 pr-4 text-[14px] text-[#1D1D1F] outline-none placeholder:text-[#86868B] border border-transparent focus:bg-white focus:border-[#2DD4BF]/40 focus:ring-4 focus:ring-[#2DD4BF]/10 transition-all"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {['all', ...types].map((t) => {
                  const theme = t !== 'all' ? typeTheme[t] : null
                  const isActive = filter === t
                  return (
                    <button
                      key={t}
                      onClick={() => setFilter(t)}
                      className={`rounded-full px-4 py-2.5 text-[12.5px] font-semibold tracking-[-0.005em] transition-all ${
                        isActive
                          ? 'text-white'
                          : 'bg-[#F5F5F7] text-[#6E6E73] hover:bg-[#EBEBED]'
                      }`}
                      style={isActive ? { background: theme?.color || '#1D1D1F' } : {}}
                    >
                      {t === 'all' ? 'All' : t}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ===== HORIZONTAL SHOWCASE ===== */}
          {loading && reports.length === 0 ? (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-32 rounded-[24px] bg-white border border-black/[0.04] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((r, i) => {
                const theme = typeTheme[r.type] || { color: '#86868B', label: r.type }
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6, delay: Math.min(i * 0.06, 0.4), ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ x: 6 }}
                    className="group relative overflow-hidden rounded-[24px] bg-white border border-black/[0.04] transition-all cursor-pointer"
                    style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
                  >
                    {/* Left colored bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: `linear-gradient(180deg, ${theme.color}, ${theme.color}80)` }} />

                    {/* Glow on hover */}
                    <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ background: `${theme.color}20` }} />

                    <div className="relative flex items-center gap-6 px-8 py-6">
                      {/* Index */}
                      <div className="text-[14px] font-mono font-bold text-[#AEAEB2] tabular-nums min-w-[32px]">
                        {String(i + 1).padStart(2, '0')}
                      </div>

                      {/* Icon */}
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${theme.color}, ${theme.color}CC)`,
                          boxShadow: `0 8px 24px -6px ${theme.color}80`,
                        }}>
                        <FileText size={22} className="text-white" strokeWidth={2.2} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1.5">
                          <h3 className="text-[19px] font-semibold tracking-[-0.02em] text-[#1D1D1F] truncate">
                            {r.title}
                          </h3>
                          <span className="text-[10px] font-bold tracking-[0.14em] uppercase px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: `${theme.color}15`, color: theme.color, border: `1px solid ${theme.color}30` }}>
                            {theme.label}
                          </span>
                        </div>
                        <p className="text-[13.5px] text-[#6E6E73] tracking-[-0.005em] truncate">
                          {r.details} · from {r.source}
                        </p>
                      </div>

                      {/* Ready badge */}
                      <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#30D158]/10 border border-[#30D158]/20 flex-shrink-0">
                        <CheckCircle size={11} className="text-[#30D158]" strokeWidth={2.6} />
                        <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#30D158]">
                          {r.status}
                        </span>
                      </div>

                      {/* Signed */}
                      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5F5F7] flex-shrink-0">
                        <Lock size={10} className="text-[#86868B]" strokeWidth={2.4} />
                        <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#86868B]">SHA-256</span>
                      </div>

                      {/* Arrow */}
                      <div className="flex items-center gap-1.5 text-[13px] font-semibold tracking-[-0.005em] transition-all"
                        style={{ color: theme.color }}>
                        <span className="hidden sm:inline">View</span>
                        <ArrowRight size={14} strokeWidth={2.4} className="transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ===== BOTTOM CTA ===== */}
      <section className="relative bg-black py-40 px-6 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] rounded-full blur-[260px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #2DD4BF, transparent 55%)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[220px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #30D158, transparent 55%)' }}
        />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="w-[700px] h-[700px]"
          >
            <svg viewBox="0 0 700 700" className="w-full h-full">
              <circle cx="350" cy="350" r="330" fill="none" stroke="#2DD4BF" strokeWidth="1" strokeDasharray="4 8" opacity="0.25" />
            </svg>
          </motion.div>
        </div>

        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              left: `${15 + (i * 7) % 70}%`,
              top: `${25 + (i * 11) % 55}%`,
              background: i % 2 === 0 ? '#2DD4BF' : '#30D158',
              boxShadow: `0 0 15px ${i % 2 === 0 ? '#2DD4BF' : '#30D158'}`,
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
              className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ boxShadow: '0 0 8px #2DD4BF' }}
            />
            <span className="text-white/80 text-[11px] font-semibold tracking-[0.16em] uppercase">
              Signed & Archived
            </span>
          </div>

          <h2 className="text-[72px] md:text-[112px] font-semibold leading-[0.9] tracking-[-0.05em] text-white">
            Ready for
            <br />
            <motion.span
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-block bg-gradient-to-r from-[#2DD4BF] via-[#10B981] via-[#30D158] to-[#2DD4BF] bg-clip-text text-transparent bg-[length:200%_100%]"
            >
              any audit.
            </motion.span>
          </h2>

          <p className="mt-10 text-[21px] leading-[1.5] tracking-[-0.015em] text-white/50 max-w-[520px] mx-auto">
            Every report cryptographically signed and exportable for compliance review.
          </p>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
            <a href="/assurance" className="group relative inline-flex items-center gap-2 rounded-full bg-white text-black px-8 py-4 text-[15px] font-semibold tracking-[-0.01em] transition-all hover:scale-[1.03] overflow-hidden"
              style={{ boxShadow: '0 20px 60px -12px rgba(255,255,255,0.4)' }}>
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
              <span className="relative">Full Assurance Report</span>
              <ArrowRight size={15} className="relative transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
            </a>
            <a href="/audit" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] backdrop-blur-xl text-white px-8 py-4 text-[15px] font-medium tracking-[-0.01em] transition-all hover:bg-white/[0.08]">
              Audit Trail
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

export default Reports
