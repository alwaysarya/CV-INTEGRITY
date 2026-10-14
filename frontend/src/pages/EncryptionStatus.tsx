import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, Lock, Key, Globe, Server, Check, X, AlertTriangle,
  ArrowLeft, Loader2, RefreshCw, Fingerprint, Cpu, Activity, RotateCw
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  getEncryptionStatus, getEncryptionScore, testAESRoundTrip, sha256,
  rotateKeys, getLastRotation, formatDate, type EncryptionStatus
} from '@/lib/encryption'

function ScoreRing({ score, color }: { score: number; color: string }) {
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  return (
    <div className="relative w-[200px] h-[200px]">
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
        <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="12" />
        <motion.circle
          cx="100" cy="100" r={radius}
          fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 14px ${color}90)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[56px] font-semibold leading-none tracking-[-0.05em] tabular-nums" style={{ color }}>
          {score}
        </div>
        <div className="mt-1.5 text-[10px] font-bold tracking-[0.22em] uppercase text-[#86868B]">of 100</div>
      </div>
    </div>
  )
}

function StatusCard({ icon: Icon, title, value, subtitle, color, ok }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="relative overflow-hidden rounded-2xl bg-white border border-black/[0.04] p-5"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
    >
      <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl opacity-[0.08]" style={{ background: color }} />
      <div className="relative flex items-start justify-between mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}15` }}>
          <Icon size={17} style={{ color }} strokeWidth={2.2} />
        </div>
        <div className={`flex h-6 w-6 items-center justify-center rounded-full ${ok ? 'bg-[#30D158]/15' : 'bg-[#FF453A]/15'}`}>
          {ok ? <Check size={12} className="text-[#30D158]" strokeWidth={3} /> : <X size={12} className="text-[#FF453A]" strokeWidth={2.6} />}
        </div>
      </div>
      <div className="relative text-[11px] font-bold tracking-[0.14em] uppercase text-[#86868B] mb-1">{title}</div>
      <div className="relative text-[18px] font-semibold tracking-[-0.02em] text-[#1D1D1F] truncate">{value}</div>
      {subtitle && <div className="relative text-[11px] text-[#86868B] mt-1">{subtitle}</div>}
    </motion.div>
  )
}

export function EncryptionStatusPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<EncryptionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ passed: boolean; hash?: string } | null>(null)
  const [rotating, setRotating] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setTimeout(() => {
      setStatus(getEncryptionStatus())
      setLoading(false)
    }, 200)
  }

  useEffect(() => { load() }, [])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2000) }

  const runTest = async () => {
    setTesting(true); setTestResult(null)
    const passed = await testAESRoundTrip()
    const hash = await sha256('cv-integrity-test')
    setTestResult({ passed, hash: hash || undefined })
    setTesting(false)
    showToast(passed ? 'AES-256-GCM test passed' : 'Encryption test failed')
  }

  const handleRotate = () => {
    setRotating(true)
    setTimeout(() => { rotateKeys(); setRotating(false); load(); showToast('Encryption keys rotated') }, 1000)
  }

  if (loading || !status) {
    return (
      <div className="min-h-screen bg-[#FBFBFD] flex items-center justify-center gap-2 text-[13px] text-[#86868B]">
        <Loader2 size={16} className="animate-spin" /> Checking encryption status...
      </div>
    )
  }

  const scoreData = getEncryptionScore(status)
  const lastRotation = getLastRotation()

  return (
    <div className="min-h-screen bg-[#FBFBFD] p-6" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>
      {toast && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-[#1D1D1F] text-white text-[13px] font-medium shadow-xl">{toast}</motion.div>
      )}

      <div className="mx-auto max-w-[1200px] flex items-start justify-between gap-4 pb-8">
        <div>
          <button onClick={() => navigate('/settings')} className="flex items-center gap-1.5 text-[12px] font-medium text-[#86868B] hover:text-[#1D1D1F] transition-colors mb-3">
            <ArrowLeft size={13} strokeWidth={2.2} /> Back to Settings
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #0071E3, #30D158)', boxShadow: '0 8px 24px rgba(0,113,227,0.3)' }}>
              <Lock size={20} className="text-white" strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-[#1D1D1F]">Encryption Status</h1>
              <p className="text-[13px] text-[#86868B]">TLS, AES, and cryptographic capabilities</p>
            </div>
          </div>
        </div>
        <button onClick={load} className="flex h-10 items-center gap-2 rounded-xl bg-white border border-black/[0.06] px-4 text-[13px] font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} strokeWidth={2.4} /> Refresh
        </button>
      </div>

      <div className="mx-auto max-w-[1200px] space-y-6">
        <div className="rounded-[32px] bg-white border border-black/[0.04] p-10 shadow-sm">
          <div className="flex items-center gap-12 flex-wrap">
            <ScoreRing score={scoreData.score} color={scoreData.color} />
            <div className="flex-1 min-w-[300px]">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
                style={{ background: `${scoreData.color}15`, border: `1px solid ${scoreData.color}30` }}>
                <Shield size={12} style={{ color: scoreData.color }} strokeWidth={2.4} />
                <span className="text-[11px] font-bold tracking-[0.16em] uppercase" style={{ color: scoreData.color }}>
                  {scoreData.level} Encryption
                </span>
              </div>
              <h2 className="text-[28px] font-semibold tracking-[-0.025em] text-[#1D1D1F] mb-3">Browser & connection security</h2>
              <p className="text-[14px] text-[#6E6E73] leading-relaxed mb-6">
                {status.secureContext ? 'Your connection is secure. Modern cryptographic APIs are available.' : 'Some features may not be available. Use HTTPS for production.'}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Secure Context', ok: status.secureContext },
                  { label: 'Web Crypto API', ok: status.cryptoApi },
                  { label: 'AES-256 Support', ok: status.aesSupported },
                  { label: 'HSTS Enabled', ok: status.hsts },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FBFBFD] border border-black/[0.03]">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full ${item.ok ? 'bg-[#30D158]/15' : 'bg-[#FF453A]/15'}`}>
                      {item.ok ? <Check size={11} className="text-[#30D158]" strokeWidth={3} /> : <X size={11} className="text-[#FF453A]" strokeWidth={2.6} />}
                    </div>
                    <span className="text-[12px] font-medium text-[#1D1D1F]">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatusCard icon={Globe} title="Protocol" value={status.protocol} subtitle={status.host} color="#0071E3" ok={status.https} />
          <StatusCard icon={Lock} title="TLS Version" value={status.tlsVersion} subtitle="Transport security" color="#30D158" ok={status.https} />
          <StatusCard icon={Key} title="Cipher Suite" value={status.cipherSuite.split('_').slice(-2).join('-')} subtitle="Symmetric encryption" color="#AF52DE" ok={status.https} />
          <StatusCard icon={Fingerprint} title="Key Exchange" value={status.keyExchange} subtitle="ECDHE-based" color="#FF9F0A" ok={status.https} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-[24px] bg-white border border-black/[0.04] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#AF52DE]/15">
                <Cpu size={17} className="text-[#AF52DE]" strokeWidth={2.2} />
              </div>
              <div>
                <div className="text-[15px] font-semibold tracking-[-0.02em] text-[#1D1D1F]">Algorithm Details</div>
                <div className="text-[11px] text-[#86868B]">Current cryptographic configuration</div>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Cipher Suite', value: status.cipherSuite },
                { label: 'Key Exchange', value: status.keyExchange },
                { label: 'Hash Function', value: status.hash },
                { label: 'Data at Rest', value: status.localStorageEncrypted ? 'AES-256 Encrypted' : 'Plaintext (demo)' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-[#FBFBFD] border border-black/[0.03]">
                  <span className="text-[12px] font-medium text-[#6E6E73]">{item.label}</span>
                  <span className="text-[12px] font-mono font-semibold text-[#1D1D1F] text-right truncate ml-3">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] bg-white border border-black/[0.04] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#30D158]/15">
                <Activity size={17} className="text-[#30D158]" strokeWidth={2.2} />
              </div>
              <div>
                <div className="text-[15px] font-semibold tracking-[-0.02em] text-[#1D1D1F]">Cryptographic Tests</div>
                <div className="text-[11px] text-[#86868B]">Verify encryption round-trip</div>
              </div>
            </div>

            {testResult && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className={`mb-4 p-3 rounded-xl border text-[12px] ${testResult.passed ? 'bg-[#30D158]/8 border-[#30D158]/20 text-[#1D1D1F]' : 'bg-[#FF453A]/8 border-[#FF453A]/20 text-[#FF453A]'}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  {testResult.passed ? <Check size={13} className="text-[#30D158]" strokeWidth={3} /> : <X size={13} className="text-[#FF453A]" strokeWidth={2.6} />}
                  <span className="font-semibold">{testResult.passed ? 'AES-256-GCM round-trip passed' : 'Encryption test failed'}</span>
                </div>
                {testResult.hash && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-[#86868B]">SHA-256:</span>
                    <code className="text-[10px] font-mono text-[#6E6E73] truncate">{testResult.hash.slice(0, 32)}...</code>
                  </div>
                )}
              </motion.div>
            )}

            <div className="space-y-2.5">
              <button onClick={runTest} disabled={testing}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1D1D1F] hover:bg-black disabled:opacity-50 py-3 text-[13px] font-semibold text-white transition-colors">
                {testing ? <Loader2 size={14} className="animate-spin" /> : <Activity size={14} strokeWidth={2.4} />}
                {testing ? 'Running test...' : 'Run AES-256 Test'}
              </button>
              <button onClick={handleRotate} disabled={rotating}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-black/[0.08] hover:bg-[#F5F5F7] disabled:opacity-50 py-3 text-[13px] font-medium text-[#1D1D1F] transition-colors">
                <motion.div animate={rotating ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: rotating ? Infinity : 0 }}>
                  <RotateCw size={14} strokeWidth={2.4} />
                </motion.div>
                {rotating ? 'Rotating...' : 'Rotate Keys'}
              </button>
            </div>

            {lastRotation > 0 && (
              <div className="mt-4 pt-4 border-t border-[#F0F0F2] flex items-center justify-between text-[11px]">
                <span className="text-[#86868B]">Last rotation</span>
                <span className="font-mono text-[#6E6E73]">{formatDate(lastRotation)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[24px] bg-[#0071E3]/8 border border-[#0071E3]/20 p-5 flex items-start gap-3">
          <AlertTriangle size={16} className="text-[#0071E3] flex-shrink-0 mt-0.5" strokeWidth={2.2} />
          <div>
            <div className="text-[13px] font-semibold text-[#1D1D1F] mb-1">Production Note</div>
            <div className="text-[12px] text-[#6E6E73] leading-relaxed">
              In production, TLS 1.3 with AES-256-GCM is enforced at the server. Data at rest uses AES-256 with key rotation every 90 days.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EncryptionStatusPage
