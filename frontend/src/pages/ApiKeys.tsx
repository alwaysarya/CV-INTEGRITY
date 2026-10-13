import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Key, Plus, Copy, Check, Trash2, XCircle, AlertTriangle,
  ArrowLeft, Loader2, Eye, EyeOff, Clock, Shield, Lock, Ban
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  getAllKeys, createKey, revokeKey, deleteKey,
  formatRelative, formatDate, type ApiKey
} from '@/lib/apiKeys'

const SCOPE_OPTIONS = [
  { id: 'read', label: 'Read', desc: 'View datasets, models, reports' },
  { id: 'write', label: 'Write', desc: 'Create and modify resources' },
  { id: 'admin', label: 'Admin', desc: 'Manage users and settings' },
  { id: 'audit', label: 'Audit', desc: 'Access audit trail and logs' },
]

export function ApiKeys() {
  const navigate = useNavigate()
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [createdKey, setCreatedKey] = useState<ApiKey | null>(null)
  const [copied, setCopied] = useState(false)
  const [revealedKey, setRevealedKey] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // New key form
  const [form, setForm] = useState({
    name: '',
    scopes: ['read'] as string[],
    expires: 30, // days
  })

  const load = () => {
    setLoading(true)
    setTimeout(() => {
      setKeys(getAllKeys())
      setLoading(false)
    }, 200)
  }

  useEffect(() => { load() }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
    showToast('Copied to clipboard')
  }

  const handleCreate = () => {
    if (!form.name.trim()) {
      showToast('Please enter a key name')
      return
    }
    const user = JSON.parse(localStorage.getItem('cv_integrity_user') || '{}')
    const newKey = createKey(form.name, form.scopes, form.expires, user.username || 'admin')
    setCreatedKey(newKey)
    load()
  }

  const handleRevoke = (id: string) => {
    revokeKey(id)
    load()
    showToast('API key revoked')
  }

  const handleDelete = (id: string) => {
    deleteKey(id)
    load()
    showToast('API key deleted')
  }

  const closeModal = () => {
    setShowModal(false)
    setCreatedKey(null)
    setForm({ name: '', scopes: ['read'], expires: 30 })
    setCopied(false)
  }

  return (
    <div className="min-h-screen bg-[#FBFBFD] p-6" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>
      <div className="mx-auto max-w-[1000px]">

        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-[#1D1D1F] text-white text-[13px] font-medium shadow-xl"
          >
            {toast}
          </motion.div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-8">
          <div>
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-1.5 text-[12px] font-medium text-[#86868B] hover:text-[#1D1D1F] transition-colors mb-3"
            >
              <ArrowLeft size={13} strokeWidth={2.2} />
              Back to Settings
            </button>
            <h1 className="text-[40px] font-semibold tracking-[-0.035em] text-[#1D1D1F]">
              API Keys
            </h1>
            <p className="mt-2 text-[15px] text-[#6E6E73]">
              Manage programmatic access to your workspace
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex h-10 items-center gap-2 rounded-xl bg-[#1D1D1F] px-4 text-[13px] font-semibold text-white hover:bg-black transition-colors"
          >
            <Plus size={14} strokeWidth={2.4} />
            New API Key
          </button>
        </div>

        {loading && keys.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-20 text-[13px] text-[#86868B]">
            <Loader2 size={16} className="animate-spin" />
            Loading keys...
          </div>
        ) : keys.length === 0 ? (
          <div className="rounded-2xl bg-white border border-black/[0.04] py-20 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5F5F7] mb-4">
              <Key size={28} className="text-[#86868B]" strokeWidth={1.8} />
            </div>
            <div className="text-[18px] font-semibold text-[#1D1D1F] mb-1">No API keys yet</div>
            <div className="text-[14px] text-[#6E6E73] mb-5">Create your first API key to get started</div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1D1D1F] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-black transition-colors"
            >
              <Plus size={13} strokeWidth={2.4} />
              Create API Key
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((k, i) => (
              <motion.div
                key={k.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl bg-white border border-black/[0.04] p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl flex-shrink-0 ${
                      k.status === 'active' ? 'bg-emerald-50' : k.status === 'revoked' ? 'bg-red-50' : 'bg-amber-50'
                    }`}>
                      {k.status === 'active' && <Key size={18} className="text-emerald-600" strokeWidth={2.2} />}
                      {k.status === 'revoked' && <Ban size={18} className="text-red-600" strokeWidth={2.2} />}
                      {k.status === 'expired' && <Clock size={18} className="text-amber-600" strokeWidth={2.2} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="text-[16px] font-semibold tracking-[-0.02em] text-[#1D1D1F] truncate">
                          {k.name}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-[0.14em] uppercase ${
                          k.status === 'active' ? 'bg-emerald-500/15 text-emerald-700' :
                          k.status === 'revoked' ? 'bg-red-500/15 text-red-700' :
                          'bg-amber-500/15 text-amber-700'
                        }`}>
                          {k.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <code className="text-[11px] font-mono text-[#6E6E73] truncate">
                          {revealedKey === k.id ? k.key : k.prefix}
                        </code>
                        {revealedKey === k.id && (
                          <button
                            onClick={() => handleCopy(k.key)}
                            className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-[#F5F5F7] text-[#86868B] hover:text-[#1D1D1F] transition-colors"
                          >
                            {copied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-[#6E6E73]">
                        <div className="flex items-center gap-1.5">
                          <Shield size={10} className="text-[#86868B]" strokeWidth={2.4} />
                          <span className="font-medium">Scopes:</span>
                          <span>{k.scopes.join(', ')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={10} className="text-[#86868B]" strokeWidth={2.4} />
                          <span className="font-medium">Created:</span>
                          <span>{formatDate(k.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Eye size={10} className="text-[#86868B]" strokeWidth={2.4} />
                          <span className="font-medium">Last used:</span>
                          <span>{formatRelative(k.lastUsedAt)}</span>
                        </div>
                        {k.expiresAt && (
                          <div className="flex items-center gap-1.5">
                            <AlertTriangle size={10} className="text-[#86868B]" strokeWidth={2.4} />
                            <span className="font-medium">Expires:</span>
                            <span>{formatDate(k.expiresAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setRevealedKey(revealedKey === k.id ? null : k.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#F5F5F7] text-[#86868B] hover:text-[#1D1D1F] transition-colors"
                      title="Reveal key"
                    >
                      {revealedKey === k.id ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>

                    {k.status === 'active' && (
                      <button
                        onClick={() => handleRevoke(k.id)}
                        className="flex h-8 items-center gap-1.5 px-3 rounded-lg bg-[#FF453A]/10 hover:bg-[#FF453A]/20 text-[11px] font-semibold text-[#FF453A] transition-colors"
                      >
                        <Ban size={12} strokeWidth={2.4} />
                        Revoke
                      </button>
                    )}

                    {(k.status === 'revoked' || k.status === 'expired') && (
                      <button
                        onClick={() => handleDelete(k.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-red-50 text-[#86868B] hover:text-red-600 transition-colors"
                        title="Delete permanently"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Info box */}
        <div className="mt-8 rounded-2xl bg-[#FF9F0A]/8 border border-[#FF9F0A]/20 p-4 flex items-start gap-3">
          <AlertTriangle size={16} className="text-[#FF9F0A] flex-shrink-0 mt-0.5" strokeWidth={2.2} />
          <div>
            <div className="text-[13px] font-semibold text-[#1D1D1F] mb-1">Keep your keys secure</div>
            <div className="text-[12px] text-[#6E6E73] leading-relaxed">
              Never share API keys publicly. If a key is compromised, revoke it immediately.
            </div>
          </div>
        </div>
      </div>

      {/* CREATE KEY MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            {!createdKey ? (
              <>
                <div className="mb-6">
                  <div className="text-[20px] font-semibold tracking-[-0.02em] text-[#1D1D1F] mb-1">
                    Create API Key
                  </div>
                  <div className="text-[13px] text-[#6E6E73]">
                    Generate a new key for programmatic access
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#86868B] mb-2 block">
                      Key Name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g., CI/CD Pipeline"
                      className="w-full rounded-xl border border-[#E5E5EA] bg-[#FBFBFD] px-4 py-3 text-[14px] text-[#1D1D1F] outline-none placeholder:text-[#AEAEB2] focus:border-[#0071E3]/40 focus:bg-white focus:ring-4 focus:ring-[#0071E3]/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#86868B] mb-2 block">
                      Scopes
                    </label>
                    <div className="space-y-2">
                      {SCOPE_OPTIONS.map(scope => (
                        <label key={scope.id} className="flex items-start gap-3 p-3 rounded-xl border border-[#E5E5EA] hover:bg-[#FBFBFD] cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={form.scopes.includes(scope.id)}
                            onChange={(e) => {
                              const newScopes = e.target.checked
                                ? [...form.scopes, scope.id]
                                : form.scopes.filter(s => s !== scope.id)
                              setForm({ ...form, scopes: newScopes })
                            }}
                            className="mt-0.5 w-4 h-4 rounded accent-[#0071E3]"
                          />
                          <div>
                            <div className="text-[13px] font-semibold text-[#1D1D1F]">{scope.label}</div>
                            <div className="text-[11px] text-[#6E6E73] mt-0.5">{scope.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#86868B] mb-2 block">
                      Expires in (days)
                    </label>
                    <select
                      value={form.expires}
                      onChange={(e) => setForm({ ...form, expires: Number(e.target.value) })}
                      className="w-full rounded-xl border border-[#E5E5EA] bg-white px-4 py-3 text-[14px] text-[#1D1D1F] outline-none focus:border-[#0071E3]/40 focus:ring-4 focus:ring-[#0071E3]/10 transition-all"
                    >
                      <option value={7}>7 days</option>
                      <option value={30}>30 days</option>
                      <option value={90}>90 days</option>
                      <option value={365}>1 year</option>
                      <option value={0}>Never</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 rounded-xl border border-[#E5E5EA] hover:bg-[#F5F5F7] py-3 text-[13px] font-medium text-[#1D1D1F] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!form.name.trim() || form.scopes.length === 0}
                    className="flex-1 rounded-xl bg-[#1D1D1F] hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed py-3 text-[13px] font-semibold text-white transition-colors"
                  >
                    Generate Key
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                      <Check size={16} className="text-emerald-600" strokeWidth={2.6} />
                    </div>
                    <div className="text-[20px] font-semibold tracking-[-0.02em] text-[#1D1D1F]">
                      API Key Created
                    </div>
                  </div>
                  <div className="text-[13px] text-[#6E6E73]">
                    Copy this key now. You won't be able to see it again.
                  </div>
                </div>

                <div className="mb-6 p-4 rounded-xl bg-[#FBFBFD] border border-[#E5E5EA]">
                  <code className="block text-[13px] font-mono text-[#1D1D1F] break-all">
                    {createdKey.key}
                  </code>
                </div>

                <button
                  onClick={() => handleCopy(createdKey.key)}
                  className="w-full rounded-xl bg-[#1D1D1F] hover:bg-black py-3 text-[13px] font-semibold text-white transition-colors flex items-center justify-center gap-2 mb-3"
                >
                  {copied ? (
                    <>
                      <Check size={14} strokeWidth={2.6} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} strokeWidth={2.4} />
                      Copy Key
                    </>
                  )}
                </button>

                <button
                  onClick={closeModal}
                  className="w-full rounded-xl border border-[#E5E5EA] hover:bg-[#F5F5F7] py-3 text-[13px] font-medium text-[#1D1D1F] transition-colors"
                >
                  Done
                </button>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default ApiKeys
