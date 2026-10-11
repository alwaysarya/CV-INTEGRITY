import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, Database, Boxes, Cpu, Fingerprint, ArrowRight, Check, Link2, Lock, Zap } from 'lucide-react'

export function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* ===== NAV ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-black/70 border-b border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#0071E3] to-[#AF52DE] flex items-center justify-center">
              <ShieldCheck size={13} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-white text-[13px] font-semibold tracking-tight">CV-Integrity</span>
          </div>
          <div className="hidden md:flex items-center gap-7">
            {['Overview', 'Features', 'Pipeline', 'Docs'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-white/60 hover:text-white text-[12px] font-medium tracking-tight transition-colors">
                {item}
              </a>
            ))}
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-[12px] font-medium text-white/90 hover:text-white transition-colors"
          >
            Dashboard →
          </button>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section id="overview" className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-32 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full blur-[180px] opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0071E3, transparent 60%)' }} />
        <div className="absolute bottom-[10%] left-[20%] w-[600px] h-[600px] rounded-full blur-[180px] opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #AF52DE, transparent 60%)' }} />

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/10 mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" style={{ boxShadow: '0 0 8px #34C759' }} />
          <span className="text-white/85 text-[11px] font-medium tracking-tight">SIH Problem Statement 26228</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative text-center max-w-[1000px] text-[80px] md:text-[120px] font-semibold tracking-[-0.045em] leading-[0.95]"
        >
          Vision Integrity,
          <br />
          <span className="bg-gradient-to-r from-[#5AC8FA] via-[#0071E3] to-[#AF52DE] bg-clip-text text-transparent">
            Assured.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-10 max-w-[640px] text-center text-white/55 text-[21px] leading-[1.5] tracking-[-0.015em]"
        >
          An offline assurance layer for computer vision pipelines. Verify contributors, data, models, and inference — before deployment.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <button
            onClick={() => navigate('/')}
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-[15px] font-medium tracking-tight transition-all"
            style={{ boxShadow: '0 12px 40px -8px rgba(0,113,227,0.6)' }}
          >
            Enter Dashboard
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" strokeWidth={2.4} />
          </button>
          <a
            href="#features"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-xl hover:bg-white/[0.08] text-white text-[15px] font-medium tracking-tight transition-all"
          >
            Learn More
          </a>
        </motion.div>

        {/* Mock preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-24 w-full max-w-[1000px]"
        >
          <div className="absolute -inset-6 rounded-[40px] opacity-50 blur-3xl"
            style={{ background: 'linear-gradient(135deg, rgba(0,113,227,0.4), rgba(175,82,222,0.3))' }} />
          <div className="relative rounded-[24px] p-[1.5px] bg-gradient-to-tr from-white/15 via-white/[0.04] to-white/15">
            <div className="rounded-[23px] bg-[#0F0F14] overflow-hidden">
              <div className="flex items-center gap-1.5 px-5 py-3.5 border-b border-white/[0.06]">
                <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                <div className="ml-4 text-[11px] text-white/50 font-medium">Integrity Dashboard</div>
                <div className="ml-auto flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#34C759]/15 border border-[#34C759]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse" />
                  <span className="text-[9px] text-[#34C759] font-bold tracking-[0.1em]">LIVE</span>
                </div>
              </div>
              <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-5">
                {[
                  { icon: Database, label: 'Datasets', value: '12', color: '#5AC8FA' },
                  { icon: Boxes, label: 'Models', value: '3', color: '#AF52DE' },
                  { icon: Cpu, label: 'Inference', value: '847', color: '#34C759' },
                  { icon: Fingerprint, label: 'Trust Score', value: '67%', color: '#FF9500' },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="rounded-2xl bg-white/[0.03] border border-white/[0.05] p-5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${item.color}18` }}>
                        <Icon size={16} style={{ color: item.color }} strokeWidth={2.2} />
                      </div>
                      <div className="mt-4 text-[28px] font-semibold tracking-[-0.03em] text-white leading-none">{item.value}</div>
                      <div className="text-[9px] uppercase tracking-[0.15em] text-white/40 font-bold mt-2">{item.label}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== FEATURES (Light) ===== */}
      <section id="features" className="relative bg-white text-[#1D1D1F] py-32 px-6">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8 }}
            className="text-center max-w-[760px] mx-auto mb-20"
          >
            <div className="text-[#0071E3] text-[13px] font-semibold tracking-[0.14em] uppercase mb-4">End-to-end assurance</div>
            <h2 className="text-[56px] font-semibold tracking-[-0.04em] leading-[1.02]">
              Every stage.
              <br />
              <span className="text-[#86868B]">Cryptographically verified.</span>
            </h2>
            <p className="mt-6 text-[19px] text-[#6E6E73] leading-[1.5] tracking-[-0.015em]">
              From contributor identity to inference output — the entire pipeline is bound to a tamper-evident ledger.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: ShieldCheck, title: 'Contributor Trust', desc: 'Verify who contributed what. Every commit is signed and recorded.', color: '#0071E3' },
              { icon: Database, title: 'Data Integrity', desc: 'Hash-check datasets before training. Detect drift and poisoning.', color: '#34C759' },
              { icon: Boxes, title: 'Model Provenance', desc: 'Track model lineage from training config to deployed artifact.', color: '#AF52DE' },
              { icon: Cpu, title: 'Inference Auditing', desc: 'Capture every prediction with a signed output record.', color: '#FF9500' },
              { icon: Link2, title: 'Blockchain Ledger', desc: 'Immutable audit trail. No central point of trust.', color: '#5AC8FA' },
              { icon: Lock, title: 'Offline & Air-gapped', desc: 'No cloud. No external dependency. Fully contained.', color: '#FF3B30' },
            ].map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7, delay: i * 0.06 }}
                  className="group rounded-3xl bg-[#F5F5F7] p-8 hover:bg-white border border-transparent hover:border-[#E5E5EA] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: `${f.color}15` }}>
                    <Icon size={22} style={{ color: f.color }} strokeWidth={2} />
                  </div>
                  <h3 className="mt-6 text-[20px] font-semibold tracking-[-0.02em]">{f.title}</h3>
                  <p className="mt-2 text-[15px] text-[#6E6E73] leading-[1.5] tracking-[-0.01em]">{f.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== PIPELINE (Dark) ===== */}
      <section id="pipeline" className="relative bg-[#111114] text-white py-32 px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full blur-[200px] opacity-25 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0071E3, transparent 65%)' }} />

        <div className="max-w-[1200px] mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8 }}
            className="text-center max-w-[720px] mx-auto mb-20"
          >
            <div className="text-[#5AC8FA] text-[13px] font-semibold tracking-[0.14em] uppercase mb-4">Pipeline</div>
            <h2 className="text-[56px] font-semibold tracking-[-0.04em] leading-[1.02]">
              Four steps.
              <br />
              <span className="text-white/40">Zero blind spots.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { num: '01', title: 'Ingest', desc: 'Datasets & models registered with SHA-256 binding.', color: '#5AC8FA' },
              { num: '02', title: 'Analyze', desc: 'Integrity, backdoor, drift & robustness checks run.', color: '#0071E3' },
              { num: '03', title: 'Anchor', desc: 'Results committed to the tamper-evident ledger.', color: '#AF52DE' },
              { num: '04', title: 'Assure', desc: 'Signed assurance reports ready for audit.', color: '#34C759' },
            ].map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7, delay: i * 0.1 }}
                className="relative"
              >
                <div className="text-[64px] font-semibold tracking-[-0.04em] leading-none opacity-20 mb-4">{s.num}</div>
                <div className="h-[2px] mb-6 rounded-full" style={{ background: `linear-gradient(90deg, ${s.color}, transparent)` }} />
                <h3 className="text-[24px] font-semibold tracking-[-0.02em]">{s.title}</h3>
                <p className="mt-3 text-[15px] text-white/50 leading-[1.5] tracking-[-0.01em]">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS (Light) ===== */}
      <section className="relative bg-white text-[#1D1D1F] py-32 px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6 text-center">
            {[
              { value: '100%', label: 'Offline' },
              { value: 'SHA-256', label: 'Cryptographic binding' },
              { value: '4', label: 'Verification layers' },
              { value: '<100ms', label: 'Inference overhead' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7, delay: i * 0.08 }}
              >
                <div className="text-[48px] md:text-[56px] font-semibold tracking-[-0.04em] bg-gradient-to-br from-[#0071E3] to-[#AF52DE] bg-clip-text text-transparent leading-none">
                  {s.value}
                </div>
                <div className="mt-3 text-[12px] uppercase tracking-[0.18em] text-[#86868B] font-semibold">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA (Dark) ===== */}
      <section className="relative bg-black text-white py-40 px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] rounded-full blur-[200px] opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0071E3, transparent 60%)' }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1 }}
          className="relative max-w-[900px] mx-auto text-center"
        >
          <h2 className="text-[64px] md:text-[88px] font-semibold tracking-[-0.045em] leading-[0.98]">
            Ready to verify
            <br />
            <span className="bg-gradient-to-r from-[#5AC8FA] to-[#AF52DE] bg-clip-text text-transparent">
              your pipeline?
            </span>
          </h2>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black text-[15px] font-semibold tracking-tight hover:scale-[1.02] transition-transform"
              style={{ boxShadow: '0 20px 60px -12px rgba(255,255,255,0.4)' }}
            >
              Enter Dashboard
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" strokeWidth={2.4} />
            </button>
            <a
              href="#overview"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/20 bg-white/[0.04] backdrop-blur-xl text-white text-[15px] font-medium tracking-tight hover:bg-white/[0.08] transition-colors"
            >
              Back to top
            </a>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-white/40 text-[12px]">
            <span className="flex items-center gap-2"><Check size={12} className="text-[#34C759]" /> Offline</span>
            <span className="flex items-center gap-2"><Check size={12} className="text-[#34C759]" /> Air-gapped</span>
            <span className="flex items-center gap-2"><Check size={12} className="text-[#34C759]" /> No cloud</span>
          </div>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-black border-t border-white/[0.06] py-10 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#0071E3] to-[#AF52DE] flex items-center justify-center">
              <ShieldCheck size={13} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-white/60 text-[12px] font-medium tracking-tight">CV-Integrity</span>
          </div>
          <div className="flex items-center gap-6 text-white/35 text-[11px] tracking-tight">
            <span>© 2026 CV-Integrity</span>
            <span>·</span>
            <span>SIH 26228</span>
            <span>·</span>
            <span>Offline · Air-gapped</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
