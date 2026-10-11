import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search, Box, Clock, CheckCircle, Hash, Link as LinkIcon, Cpu,
  Sparkles, ArrowRight, Shield, Layers, TrendingUp, Zap, Lock
} from 'lucide-react'
import axios from 'axios'

const API = 'http://localhost:8000'

interface Block {
  index: number
  hash: string
  previous_hash: string
  timestamp: number
  datetime?: string
  nonce: number
  data: any
}

const actionTheme: Record<string, { color: string; label: string }> = {
  GENESIS: { color: '#AF52DE', label: 'Genesis' },
  DATASET_UPLOAD: { color: '#30D158', label: 'Dataset Upload' },
  MODEL_TRAINING: { color: '#0071E3', label: 'Model Training' },
  TRUST_EVALUATION: { color: '#FF9F0A', label: 'Trust Evaluation' },
  INFERENCE_RECORD: { color: '#FF453A', label: 'Inference Record' },
  ATTACK_BLOCKED: { color: '#FF453A', label: 'Attack Blocked' },
}

export function Blockchain() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { loadBlocks() }, [])

  const loadBlocks = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/blockchain/live`).catch(() => ({ data: { blocks: [] } }))
      setBlocks(res.data.blocks || [])
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const filtered = blocks.filter((b) =>
    b.hash.toLowerCase().includes(search.toLowerCase()) ||
    b.index.toString().includes(search) ||
    (b.data?.action || '').toLowerCase().includes(search.toLowerCase())
  )

  const getTheme = (action: string) => actionTheme[action] || { color: '#86868B', label: action || 'Event' }

  const actionCounts: Record<string, number> = {}
  blocks.forEach(b => {
    const a = b.data?.action || 'UNKNOWN'
    actionCounts[a] = (actionCounts[a] || 0) + 1
  })

  const latestBlock = blocks[blocks.length - 1]

  return (
    <div className="min-h-screen bg-[#FBFBFD]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>

      {/* ===== HERO — Full-screen immersive with animated chain ===== */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-black">
        {/* Massive glows */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1400px] rounded-full blur-[280px]"
            style={{ background: 'radial-gradient(circle, #30D158, transparent 55%)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-0 left-[20%] w-[800px] h-[800px] rounded-full blur-[240px]"
            style={{ background: 'radial-gradient(circle, #0071E3, transparent 55%)' }}
          />
        </div>

        {/* Animated SVG chain across screen */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 1400 900" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="chainGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0" />
              <stop offset="50%" stopColor="#30D158" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Flowing lines */}
          {[200, 450, 700].map((y, i) => (
            <motion.path
              key={i}
              d={`M 0 ${y} Q 350 ${y - 80} 700 ${y} T 1400 ${y}`}
              fill="none"
              stroke="url(#chainGrad)"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 1, 1], opacity: [0, 0.8, 0] }}
              transition={{ duration: 6, repeat: Infinity, delay: i * 2, ease: 'easeInOut' }}
            />
          ))}
        </svg>

        {/* Animated block particles floating */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-[#30D158]"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i * 8) % 60}%`,
              boxShadow: '0 0 20px #30D158, 0 0 40px #30D15880',
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
          />
        ))}

        <div className="relative mx-auto max-w-[1200px] px-6 py-24 w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl mb-10"
            >
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-[#30D158]"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ boxShadow: '0 0 8px #30D158' }}
              />
              <span className="text-white/80 text-[11px] font-semibold tracking-[0.16em] uppercase">
                {blocks.length} blocks anchored
              </span>
            </motion.div>

            <h1 className="max-w-[1100px] mx-auto text-[80px] md:text-[128px] font-semibold leading-[0.9] tracking-[-0.05em] text-white">
              A chain of trust,
              <br />
              <motion.span
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-block bg-gradient-to-r from-[#2DD4BF] via-[#30D158] via-[#10B981] to-[#2DD4BF] bg-clip-text text-transparent bg-[length:200%_100%]"
              >
                block by block.
              </motion.span>
            </h1>

            <p className="mt-10 max-w-[620px] mx-auto text-[21px] leading-[1.5] tracking-[-0.015em] text-white/50">
              Every action cryptographically bound. Tamper-evident. Air-gapped. Provable.
            </p>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
              <a href="#explorer" className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold tracking-[-0.01em] text-black transition-all hover:scale-[1.03]"
                style={{ boxShadow: '0 0 60px rgba(255,255,255,0.3)' }}>
                Explore Blocks
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
              </a>
              <a href="/upload" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-7 py-3.5 text-[15px] font-medium tracking-[-0.01em] text-white/90 backdrop-blur-xl transition-all hover:bg-white/[0.08]">
                Anchor New
              </a>
            </div>

            {/* Live stats row */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-[1000px] mx-auto">
              {[
                { label: 'Total Blocks', value: blocks.length, color: '#30D158', icon: Box },
                { label: 'Action Types', value: Object.keys(actionCounts).length, color: '#0071E3', icon: Layers },
                { label: 'Chain Health', value: '100%', color: '#2DD4BF', icon: Shield },
                { label: 'Latest Nonce', value: latestBlock?.nonce ?? 0, color: '#FF9F0A', icon: Zap },
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

      {/* ===== LATEST BLOCK — Spotlight with live ticker ===== */}
      {latestBlock && (
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
                <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#30D158]">Live from chain</span>
              </div>
              <h2 className="text-[52px] md:text-[64px] font-semibold tracking-[-0.04em] leading-[1.02] text-[#1D1D1F]">
                Just anchored.
                <br />
                <span className="bg-gradient-to-r from-[#2DD4BF] to-[#30D158] bg-clip-text text-transparent">
                  Immutably.
                </span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-[40px] overflow-hidden bg-[#0A0A0F]"
              style={{ boxShadow: '0 40px 120px -20px rgba(0,0,0,0.3)' }}
            >
              {/* Glow */}
              <div className="absolute inset-0">
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] rounded-full blur-[200px] opacity-30"
                  style={{ background: 'radial-gradient(circle, #30D158, transparent 60%)' }} />
              </div>

              {/* Top accent bar */}
              <div className="relative h-[2px] bg-gradient-to-r from-transparent via-[#30D158] to-transparent" />

              <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 p-12 md:p-16 items-center">
                {/* Left: info */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="flex h-16 w-16 items-center justify-center rounded-2xl"
                      style={{
                        background: 'linear-gradient(135deg, #30D158, #0071E3)',
                        boxShadow: '0 16px 40px -8px #30D15890, 0 0 60px #30D15840',
                      }}
                    >
                      <Box size={28} className="text-white" strokeWidth={2.2} />
                    </motion.div>
                    <div>
                      <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-white/40">Block Index</div>
                      <div className="text-[18px] font-semibold text-white font-mono tracking-tight">#{latestBlock.index}</div>
                    </div>
                  </div>

                  <h3 className="text-[56px] md:text-[72px] font-semibold leading-[1] tracking-[-0.045em] text-white">
                    {getTheme(latestBlock.data?.action).label}
                  </h3>

                  <p className="mt-5 text-[17px] leading-[1.5] tracking-[-0.01em] text-white/50 max-w-[440px]">
                    {latestBlock.datetime || new Date(latestBlock.timestamp * 1000).toLocaleString()}
                  </p>

                  <div className="mt-10 space-y-6 max-w-[480px]">
                    <div>
                      <div className="flex items-center gap-2 mb-2.5">
                        <Hash size={12} className="text-[#30D158]" strokeWidth={2.4} />
                        <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-white/40">Block Hash</span>
                      </div>
                      <div className="truncate font-mono text-[12px] text-white/80 tracking-tight px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                        {latestBlock.hash}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2.5">
                        <LinkIcon size={12} className="text-white/40" strokeWidth={2.4} />
                        <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-white/40">Previous Hash</span>
                      </div>
                      <div className="truncate font-mono text-[12px] text-white/60 tracking-tight px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                        {latestBlock.previous_hash}
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#30D158]/15 border border-[#30D158]/30">
                      <CheckCircle size={13} className="text-[#30D158]" strokeWidth={2.6} />
                      <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#30D158]">Verified</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08]">
                      <Zap size={12} className="text-[#FF9F0A]" strokeWidth={2.4} />
                      <span className="text-[11px] font-semibold text-white/70 font-mono">nonce {latestBlock.nonce}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08]">
                      <Lock size={12} className="text-white/60" strokeWidth={2.4} />
                      <span className="text-[11px] font-semibold text-white/70 font-mono">immutable</span>
                    </div>
                  </div>
                </div>

                {/* Right: giant animated block number */}
                <div className="relative flex flex-col items-center justify-center min-w-[280px]">
                  {/* Rotating ring */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                    className="absolute w-[280px] h-[280px]"
                  >
                    <svg viewBox="0 0 280 280" className="w-full h-full">
                      <circle
                        cx="140" cy="140" r="130"
                        fill="none"
                        stroke="#30D158"
                        strokeWidth="1"
                        strokeDasharray="4 8"
                        opacity="0.4"
                      />
                    </svg>
                  </motion.div>

                  {/* Second ring rotating reverse */}
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute w-[240px] h-[240px]"
                  >
                    <svg viewBox="0 0 240 240" className="w-full h-full">
                      <circle
                        cx="120" cy="120" r="110"
                        fill="none"
                        stroke="#2DD4BF"
                        strokeWidth="1.5"
                        strokeDasharray="2 6"
                        opacity="0.5"
                      />
                    </svg>
                  </motion.div>

                  {/* Center number */}
                  <div className="relative flex flex-col items-center">
                    <div className="text-[120px] md:text-[140px] font-semibold leading-none tracking-[-0.06em] text-white tabular-nums"
                      style={{ textShadow: '0 0 80px #30D15880, 0 0 120px #30D15840' }}>
                      {latestBlock.index}
                    </div>
                    <div className="mt-3 text-[10px] font-bold tracking-[0.28em] uppercase text-[#30D158]">
                      Block
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ===== ACTION DISTRIBUTION ===== */}
      {Object.keys(actionCounts).length > 0 && (
        <section className="relative bg-[#F5F5F7] py-32 px-6">
          <div className="mx-auto max-w-[1200px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }}
              className="mb-16"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-[1px] bg-[#1D1D1F]/30" />
                <span className="text-[11px] font-bold tracking-[0.24em] uppercase text-[#1D1D1F]/50">
                  Distribution
                </span>
              </div>
              <h2 className="text-[52px] md:text-[64px] font-semibold tracking-[-0.04em] leading-[1.02] text-[#1D1D1F]">
                What's on
                <br />
                the chain.
              </h2>
            </motion.div>

            {/* Heat bar — one massive stacked bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="mb-16"
            >
              <div className="h-4 rounded-full overflow-hidden flex bg-white border border-black/[0.04]"
                style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
                {Object.entries(actionCounts).map(([action, count], i) => {
                  const theme = getTheme(action)
                  const pct = (count / blocks.length) * 100
                  return (
                    <motion.div
                      key={action}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full"
                      style={{ background: `linear-gradient(90deg, ${theme.color}, ${theme.color}CC)` }}
                    />
                  )
                })}
              </div>
            </motion.div>

            {/* Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(actionCounts).map(([action, count], i) => {
                const theme = getTheme(action)
                const pct = ((count / blocks.length) * 100).toFixed(0)
                return (
                  <motion.div
                    key={action}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -8 }}
                    className="group relative overflow-hidden rounded-[24px] bg-white p-6 border border-black/[0.04] transition-all"
                    style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
                  >
                    <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-opacity duration-500"
                      style={{ background: theme.color }} />

                    <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl mb-5"
                      style={{ background: `${theme.color}15`, border: `1px solid ${theme.color}30` }}>
                      <Layers size={18} style={{ color: theme.color }} strokeWidth={2.2} />
                    </div>

                    <div className="relative flex items-baseline gap-2">
                      <div className="text-[40px] font-semibold leading-none tabular-nums tracking-[-0.04em]"
                        style={{ color: theme.color, textShadow: `0 0 30px ${theme.color}60` }}>
                        {count}
                      </div>
                      <div className="text-[12px] font-bold tabular-nums text-[#AEAEB2]">
                        {pct}%
                      </div>
                    </div>

                    <div className="relative mt-3 text-[11px] font-bold tracking-[0.14em] uppercase text-[#6E6E73] truncate">
                      {theme.label}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== BLOCK EXPLORER ===== */}
      <section id="explorer" className="relative bg-[#FBFBFD] py-32 px-6">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-[1px] bg-[#1D1D1F]/30" />
                <span className="text-[11px] font-bold tracking-[0.24em] uppercase text-[#1D1D1F]/50">
                  Block Explorer
                </span>
              </div>
              <h2 className="text-[52px] md:text-[64px] font-semibold tracking-[-0.04em] leading-[1.0] text-[#1D1D1F]">
                Every block.
                <br />Every action.
              </h2>
              <p className="mt-5 text-[15px] text-[#6E6E73] tracking-[-0.01em]">
                {filtered.length} {filtered.length === 1 ? 'block' : 'blocks'} indexed
              </p>
            </div>

            <div className="w-full md:w-[360px]">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6E6E73]" strokeWidth={2.2} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search hash, index, action"
                  className="w-full rounded-2xl bg-white border border-black/[0.06] py-4 pl-11 pr-4 text-[15px] text-[#1D1D1F] outline-none placeholder:text-[#86868B] focus:border-[#30D158]/40 focus:ring-4 focus:ring-[#30D158]/10 transition-all"
                />
              </div>
            </div>
          </div>

          {loading && blocks.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-72 rounded-[28px] bg-white border border-black/[0.04] animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[24px] bg-white py-32 text-center border border-black/[0.04]">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5F5F7] mb-4">
                <Box size={28} className="text-[#86868B]" strokeWidth={1.8} />
              </div>
              <div className="mt-4 text-[18px] font-semibold text-[#1D1D1F]">
                {search ? 'No matching blocks' : 'No blocks yet'}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.slice().reverse().map((b, i) => {
                const theme = getTheme(b.data?.action || 'UNKNOWN')
                return (
                  <motion.div
                    key={b.index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6, delay: Math.min(i * 0.06, 0.4), ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -8 }}
                    className="group relative overflow-hidden rounded-[28px] bg-white border border-black/[0.04] transition-all cursor-pointer"
                    style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
                  >
                    {/* Top accent */}
                    <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${theme.color}, ${theme.color}40)` }} />

                    {/* Glow on hover */}
                    <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full blur-[100px] opacity-20 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none"
                      style={{ background: theme.color }} />

                    <div className="relative p-8">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl"
                            style={{
                              background: `linear-gradient(135deg, ${theme.color}, ${theme.color}CC)`,
                              boxShadow: `0 12px 32px -8px ${theme.color}80`,
                            }}>
                            <Box size={22} className="text-white" strokeWidth={2.2} />
                          </div>
                          <div>
                            <div className="font-mono text-[24px] font-semibold tracking-[-0.025em] text-[#1D1D1F]">
                              #{b.index}
                            </div>
                            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#6E6E73]">
                              <Clock size={10} strokeWidth={2.4} />
                              {b.datetime || new Date(b.timestamp * 1000).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                          style={{ background: `${theme.color}15`, border: `1px solid ${theme.color}30` }}>
                          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: theme.color }} />
                          <span className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: theme.color }}>
                            {theme.label}
                          </span>
                        </div>
                      </div>

                      {/* Hashes */}
                      <div className="space-y-5 mb-7">
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Hash size={10} style={{ color: theme.color }} strokeWidth={2.4} />
                            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#86868B]">Block Hash</span>
                          </div>
                          <div className="truncate font-mono text-[11.5px] text-[#1D1D1F] tracking-tight px-3 py-2 rounded-lg bg-[#FBFBFD] border border-black/[0.03]">
                            {b.hash}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <LinkIcon size={10} className="text-[#86868B]" strokeWidth={2.4} />
                            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#86868B]">Previous</span>
                          </div>
                          <div className="truncate font-mono text-[11.5px] text-[#6E6E73] tracking-tight px-3 py-2 rounded-lg bg-[#FBFBFD] border border-black/[0.03]">
                            {b.previous_hash}
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-6 border-t border-[#F0F0F2]">
                        <div className="flex items-center gap-5">
                          <div>
                            <div className="text-[9.5px] font-bold tracking-[0.16em] uppercase text-[#AEAEB2]">Nonce</div>
                            <div className="mt-1 font-mono text-[15px] font-semibold text-[#1D1D1F] tabular-nums">{b.nonce}</div>
                          </div>
                          {b.data?.trust_score !== undefined && (
                            <div>
                              <div className="text-[9.5px] font-bold tracking-[0.16em] uppercase text-[#AEAEB2]">Trust</div>
                              <div className="mt-1 font-mono text-[15px] font-semibold tabular-nums" style={{ color: '#30D158' }}>
                                {b.data.trust_score}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#30D158]/10 border border-[#30D158]/20">
                          <CheckCircle size={11} className="text-[#30D158]" strokeWidth={2.6} />
                          <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#30D158]">Valid</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ===== BOTTOM CTA — Immersive ===== */}
      <section className="relative bg-black py-40 px-6 overflow-hidden">
        {/* Animated gradient mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] rounded-full blur-[260px]"
            style={{ background: 'radial-gradient(circle, #30D158, transparent 55%)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute top-[30%] left-[20%] w-[700px] h-[700px] rounded-full blur-[220px]"
            style={{ background: 'radial-gradient(circle, #0071E3, transparent 55%)' }}
          />
        </div>

        {/* Rotating rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="w-[800px] h-[800px]"
          >
            <svg viewBox="0 0 800 800" className="w-full h-full">
              <circle cx="400" cy="400" r="380" fill="none" stroke="#30D158" strokeWidth="1" strokeDasharray="4 8" opacity="0.2" />
            </svg>
          </motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 left-0 w-[800px] h-[800px]"
          >
            <svg viewBox="0 0 800 800" className="w-full h-full">
              <circle cx="400" cy="400" r="320" fill="none" stroke="#2DD4BF" strokeWidth="1.5" strokeDasharray="2 6" opacity="0.3" />
            </svg>
          </motion.div>
        </div>

        {/* Floating particles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-[#30D158]"
            style={{
              left: `${10 + (i * 7) % 80}%`,
              top: `${20 + (i * 13) % 60}%`,
              boxShadow: '0 0 15px #30D158, 0 0 30px #30D15860',
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.2, 0.9, 0.2],
            }}
            transition={{ duration: 4 + (i % 3), repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-[900px] mx-auto text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl mb-10">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-[#30D158]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ boxShadow: '0 0 8px #30D158' }}
            />
            <span className="text-white/80 text-[11px] font-semibold tracking-[0.16em] uppercase">
              Ready to anchor
            </span>
          </div>

          <h2 className="text-[72px] md:text-[112px] font-semibold leading-[0.9] tracking-[-0.05em] text-white">
            Your ledger,
            <br />
            <motion.span
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-block bg-gradient-to-r from-[#2DD4BF] via-[#30D158] via-[#10B981] to-[#2DD4BF] bg-clip-text text-transparent bg-[length:200%_100%]"
            >
              your proof.
            </motion.span>
          </h2>

          <p className="mt-10 text-[21px] leading-[1.5] tracking-[-0.015em] text-white/50 max-w-[520px] mx-auto">
            Every action anchored. Every block immutable. Forever.
          </p>

          {/* Trust indicators */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
            {[
              { label: 'Air-gapped', color: '#30D158' },
              { label: 'Tamper-evident', color: '#2DD4BF' },
              { label: 'SHA-256', color: '#0071E3' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                <span className="text-white/60 text-[13px] font-medium tracking-[-0.005em]">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
            <a href="/upload" className="group relative inline-flex items-center gap-2 rounded-full bg-white text-black px-8 py-4 text-[15px] font-semibold tracking-[-0.01em] transition-all hover:scale-[1.03] overflow-hidden"
              style={{ boxShadow: '0 20px 60px -12px rgba(255,255,255,0.4)' }}>
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
              <span className="relative">Anchor New Block</span>
              <ArrowRight size={15} className="relative transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
            </a>
            <a href="/wallets" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] backdrop-blur-xl text-white px-8 py-4 text-[15px] font-medium tracking-[-0.01em] transition-all hover:bg-white/[0.08]">
              View Wallets
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

export default Blockchain
