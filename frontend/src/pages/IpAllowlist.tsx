import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, Plus, Trash2, Globe, Ban, Check, ArrowLeft,
  Loader2, AlertTriangle, Wifi, Lock, Copy
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  getAllEntries, addEntry, removeEntry, toggleEntry,
  getSettings, saveSettings, getCurrentIP, validateIP,
  formatDate, type IPEntry
} from '@/lib/ipAllowlist'

function IPCard({ entry, onRemove, onToggle }: { entry: IPEntry; onRemove: (id: string) => void; onToggle: (id: string) => void }) {
  const isAllow = entry.type === 'allow'
  const color = isAllow ? '#30D158' : '#FF453A'
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl bg-white border p-4 ${entry.active ? 'border-black/[0.04]' : 'border-dashed border-[#E5E5EA] opacity-60'}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0" style={{ background: `${color}15` }}>
            {isAllow ? <Check size={16} style={{ color }} strokeWidth={2.6} /> : <Ban size={16} style={{ color }} strokeWidth={2.4} />}
          </div>
          <div className="min-w-0 flex-1">
            <code className="text-[14px] font-mono font-semibold text-[#1D1D1F] truncate block">{entry.ip}</code>
            <div className="flex items-center gap-2 text-[11px] text-[#86868B] mt-0.5">
              <span className="font-medium">{entry.label}</span>
              <span>·</span>
              <span>{formatDate(entry.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => onToggle(entry.id)} className={`relative h-5 w-9 rounded-full transition-colors ${entry.active ? 'bg-[#30D158]' : 'bg-[#AEAEB2]'}`}>
            <motion.div animate={{ x: entry.active ? 18 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm" />
          </button>
          <button onClick={() => onRemove(entry.id)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#FF453A]/10 text-[#86868B] hover:text-[#FF453A] transition-colors">
            <Trash2 size={14} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export function IpAllowlist() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState<IPEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState({ enabled: false, mode: 'allowlist' as 'allowlist' | 'blocklist' })
  const [currentIP, setCurrentIP] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({ ip: '', label: '', type: 'allow' as 'allow' | 'block' })
  const [formError, setFormError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setTimeout(() => {
      setEntries(getAllEntries())
      setSettings(getSettings())
      setCurrentIP(getCurrentIP())
      setLoading(false)
    }, 200)
  }

  useEffect(() => { load() }, [])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2000) }

  const handleCopyIP = () => {
    navigator.clipboard.writeText(currentIP)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleToggleMode = () => {
    const newSettings = { ...settings, mode: settings.mode === 'allowlist' ? 'blocklist' : 'allowlist' } as typeof settings
    setSettings(newSettings); saveSettings(newSettings); showToast(`Switched to ${newSettings.mode}`)
  }

  const handleToggleEnabled = () => {
    const newSettings = { ...settings, enabled: !settings.enabled }
    setSettings(newSettings); saveSettings(newSettings)
    showToast(newSettings.enabled ? 'IP filtering enabled' : 'IP filtering disabled')
  }

  const handleAdd = () => {
    setFormError(null)
    const validation = validateIP(form.ip)
    if (!validation.valid) { setFormError(validation.error || 'Invalid IP'); return }
    const user = JSON.parse(localStorage.getItem('cv_integrity_user') || '{}')
    addEntry(form.ip, form.label, form.type, user.username || 'admin')
    setShowModal(false); setForm({ ip: '', label: '', type: 'allow' }); load(); showToast('IP entry added')
  }

  const handleRemove = (id: string) => { removeEntry(id); load(); showToast('Entry removed') }
  const handleToggleEntry = (id: string) => { toggleEntry(id); load() }

  const allowEntries = entries.filter(e => e.type === 'allow')
  const blockEntries = entries.filter(e => e.type === 'block')

  return (
    <div className="min-h-screen bg-[#FBFBFD] p-6" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>
      <div className="mx-auto max-w-[1000px]">

        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-[#1D1D1F] text-white text-[13px] font-medium shadow-xl">
            {toast}
          </motion.div>
        )}

        <div className="flex items-start justify-between gap-4 pb-8">
          <div>
            <button onClick={() => navigate('/settings')} className="flex items-center gap-1.5 text-[12px] font-medium text-[#86868B] hover:text-[#1D1D1F] transition-colors mb-3">
              <ArrowLeft size={13} strokeWidth={2.2} /> Back to Settings
            </button>
            <h1 className="text-[40px] font-semibold tracking-[-0.035em] text-[#1D1D1F]">IP Allowlist</h1>
            <p className="mt-2 text-[15px] text-[#6E6E73]">Control which IP addresses can access your workspace</p>
          </div>
          <button onClick={() => setShowModal(true)} className="flex h-10 items-center gap-2 rounded-xl bg-[#1D1D1F] px-4 text-[13px] font-semibold text-white hover:bg-black transition-colors">
            <Plus size={14} strokeWidth={2.4} /> Add IP
          </button>
        </div>

        <div className="mb-6 rounded-2xl bg-gradient-to-br from-[#0071E3]/5 to-[#5E5CE6]/5 border border-[#0071E3]/20 p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0071E3]">
                <Wifi size={18} className="text-white" strokeWidth={2.2} />
              </div>
              <div>
                <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#86868B]">Your current IP</div>
                <div className="mt-1 flex items-center gap-2">
                  <code className="text-[18px] font-mono font-semibold text-[#1D1D1F]">{currentIP}</code>
                  <button onClick={handleCopyIP} className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-white text-[#86868B] hover:text-[#1D1D1F] transition-colors">
                    {copied ? <Check size={12} className="text-[#30D158]" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#86868B] mb-1">Status</div>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${settings.enabled ? 'bg-[#30D158]/15 text-[#30D158]' : 'bg-[#AEAEB2]/15 text-[#6E6E73]'}`}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: settings.enabled ? '#30D158' : '#AEAEB2' }} />
                <span className="text-[10px] font-bold tracking-[0.14em] uppercase">{settings.enabled ? 'Active' : 'Off'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-2xl bg-white border border-black/[0.04] p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-[#F0F0F2]">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1D1D1F]">
                <Lock size={14} className="text-white" strokeWidth={2.2} />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-[#1D1D1F]">IP Filtering</div>
                <div className="mt-0.5 text-[11px] text-[#86868B]">Block or allow specific IP addresses</div>
              </div>
            </div>
            <button onClick={handleToggleEnabled} className={`relative h-6 w-11 rounded-full transition-colors ${settings.enabled ? 'bg-[#30D158]' : 'bg-[#AEAEB2]'}`}>
              <motion.div animate={{ x: settings.enabled ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0071E3]/10">
                <Shield size={14} className="text-[#0071E3]" strokeWidth={2.2} />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-[#1D1D1F]">Mode</div>
                <div className="mt-0.5 text-[11px] text-[#86868B]">{settings.mode === 'allowlist' ? 'Only allow listed IPs' : 'Block listed IPs'}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-[#F5F5F7] p-1">
              <button onClick={() => settings.mode !== 'allowlist' && handleToggleMode()} className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${settings.mode === 'allowlist' ? 'bg-white text-[#1D1D1F] shadow-sm' : 'text-[#6E6E73]'}`}>Allowlist</button>
              <button onClick={() => settings.mode !== 'blocklist' && handleToggleMode()} className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${settings.mode === 'blocklist' ? 'bg-white text-[#1D1D1F] shadow-sm' : 'text-[#6E6E73]'}`}>Blocklist</button>
            </div>
          </div>
        </div>

        {loading && entries.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-20 text-[13px] text-[#86868B]">
            <Loader2 size={16} className="animate-spin" /> Loading IP rules...
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-2xl bg-white border border-black/[0.04] py-20 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5F5F7] mb-4">
              <Globe size={28} className="text-[#86868B]" strokeWidth={1.8} />
            </div>
            <div className="text-[18px] font-semibold text-[#1D1D1F] mb-1">No IP rules yet</div>
            <div className="text-[14px] text-[#6E6E73] mb-5">Add IP addresses or ranges to control access</div>
            <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#1D1D1F] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-black transition-colors">
              <Plus size={13} strokeWidth={2.4} /> Add First IP
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {allowEntries.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#30D158]" style={{ boxShadow: '0 0 8px #30D158' }} />
                  <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#30D158]">Allowed · {allowEntries.length}</span>
                </div>
                <div className="space-y-2">
                  {allowEntries.map(entry => <IPCard key={entry.id} entry={entry} onRemove={handleRemove} onToggle={handleToggleEntry} />)}
                </div>
              </div>
            )}
            {blockEntries.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF453A]" style={{ boxShadow: '0 0 8px #FF453A' }} />
                  <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#FF453A]">Blocked · {blockEntries.length}</span>
                </div>
                <div className="space-y-2">
                  {blockEntries.map(entry => <IPCard key={entry.id} entry={entry} onRemove={handleRemove} onToggle={handleToggleEntry} />)}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 rounded-2xl bg-[#FF9F0A]/8 border border-[#FF9F0A]/20 p-4 flex items-start gap-3">
          <AlertTriangle size={16} className="text-[#FF9F0A] flex-shrink-0 mt-0.5" strokeWidth={2.2} />
          <div>
            <div className="text-[13px] font-semibold text-[#1D1D1F] mb-1">Lock yourself out?</div>
            <div className="text-[12px] text-[#6E6E73] leading-relaxed">Add your current IP before enabling allowlist mode.</div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6">
              <div className="text-[20px] font-semibold tracking-[-0.02em] text-[#1D1D1F] mb-1">Add IP Rule</div>
              <div className="text-[13px] text-[#6E6E73]">Add a single IP or CIDR range</div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#86868B] mb-2 block">IP / CIDR</label>
                <input type="text" value={form.ip} onChange={(e) => { setForm({ ...form, ip: e.target.value }); setFormError(null) }} placeholder="192.168.1.1 or 10.0.0.0/24"
                  className="w-full rounded-xl border border-[#E5E5EA] bg-[#FBFBFD] px-4 py-3 text-[14px] font-mono text-[#1D1D1F] outline-none placeholder:text-[#AEAEB2] focus:border-[#0071E3]/40 focus:bg-white focus:ring-4 focus:ring-[#0071E3]/10 transition-all" />
                {formError && <div className="mt-2 text-[12px] text-[#FF453A]">{formError}</div>}
              </div>
              <div>
                <label className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#86868B] mb-2 block">Label</label>
                <input type="text" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g., Office Network"
                  className="w-full rounded-xl border border-[#E5E5EA] bg-[#FBFBFD] px-4 py-3 text-[14px] text-[#1D1D1F] outline-none placeholder:text-[#AEAEB2] focus:border-[#0071E3]/40 focus:bg-white focus:ring-4 focus:ring-[#0071E3]/10 transition-all" />
              </div>
              <div>
                <label className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#86868B] mb-2 block">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setForm({ ...form, type: 'allow' })} className={`flex items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-semibold transition-all ${form.type === 'allow' ? 'bg-[#30D158]/15 text-[#30D158] border-2 border-[#30D158]/40' : 'bg-[#F5F5F7] text-[#6E6E73] border-2 border-transparent'}`}>
                    <Check size={14} strokeWidth={2.6} /> Allow
                  </button>
                  <button onClick={() => setForm({ ...form, type: 'block' })} className={`flex items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-semibold transition-all ${form.type === 'block' ? 'bg-[#FF453A]/15 text-[#FF453A] border-2 border-[#FF453A]/40' : 'bg-[#F5F5F7] text-[#6E6E73] border-2 border-transparent'}`}>
                    <Ban size={14} strokeWidth={2.4} /> Block
                  </button>
                </div>
              </div>
              <button onClick={() => setForm({ ...form, ip: currentIP, label: 'Current IP' })} className="w-full rounded-xl border border-dashed border-[#0071E3]/30 bg-[#0071E3]/5 hover:bg-[#0071E3]/10 py-2.5 text-[12px] font-medium text-[#0071E3] transition-colors">
                + Use my current IP ({currentIP})
              </button>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => { setShowModal(false); setForm({ ip: '', label: '', type: 'allow' }); setFormError(null) }} className="flex-1 rounded-xl border border-[#E5E5EA] hover:bg-[#F5F5F7] py-3 text-[13px] font-medium text-[#1D1D1F] transition-colors">
                Cancel
              </button>
              <button onClick={handleAdd} disabled={!form.ip.trim()} className="flex-1 rounded-xl bg-[#1D1D1F] hover:bg-black disabled:opacity-40 py-3 text-[13px] font-semibold text-white transition-colors">
                Add Rule
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default IpAllowlist
