import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User, Bell, Shield, Database, Palette, Save, Check, Key, Loader2, Clock, ArrowRight, AlertTriangle, Globe,
  RefreshCw, Activity, Cpu, Hash, Wallet, Mail, Building2, Lock, Eye
} from 'lucide-react'
import apiClient from '@/lib/api'

type TabType = 'profile' | 'notifications' | 'security' | 'data' | 'appearance'

const API = 'http://localhost:8000'

export function Settings() {
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [saved, setSaved] = useState(false)
  const [theme, setTheme] = useState('light')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [systemInfo, setSystemInfo] = useState<any>({
    health: null, blocks: 0, wallets: 0, datasets: 0, models: 0, attacks: 0,
  })

  const navigate = useNavigate()
  const [profile, setProfile] = useState({
    name: 'Aryan Thakur',
    email: 'aryan@cv-integrity.ai',
    role: 'Administrator',
    organization: 'CV-INTEGRITY AI',
  })

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushAlerts: true,
    criticalOnly: false,
    weeklyReport: true,
    driftAlerts: true,
    securityAlerts: true,
  })

  const [security, setSecurity] = useState({
    twoFactor: true,
    sessionTimeout: '30',
    apiAccess: true,
  })
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' })
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [twoFactorSetup, setTwoFactorSetup] = useState<boolean>(() => localStorage.getItem('cv_2fa_setup') === 'true')
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [loginHistory, setLoginHistory] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('cv_login_history') || '[]')
    } catch { return [] }
  })

  const passwordStrength = (() => {
    const p = passwordForm.newPass
    if (!p) return { score: 0, label: 'Empty', color: '#AEAEB2' }
    let s = 0
    if (p.length >= 8) s += 20
    if (p.length >= 12) s += 10
    if (/[A-Z]/.test(p)) s += 20
    if (/[a-z]/.test(p)) s += 20
    if (/[0-9]/.test(p)) s += 15
    if (/[^A-Za-z0-9]/.test(p)) s += 15
    if (s >= 85) return { score: s, label: 'Strong', color: '#10B981' }
    if (s >= 60) return { score: s, label: 'Good', color: '#3B82F6' }
    if (s >= 40) return { score: s, label: 'Weak', color: '#F59E0B' }
    return { score: s, label: 'Very Weak', color: '#EF4444' }
  })()

  const handlePasswordChange = () => {
    setPasswordError(null)
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError('Passwords do not match')
      return
    }
    if (passwordStrength.score < 60) {
      setPasswordError('Password is too weak. Meet all requirements.')
      return
    }
    // Demo: store hashed password (not real security, just demo)
    localStorage.setItem('cv_password_hash', btoa(passwordForm.newPass))
    setPasswordForm({ current: '', newPass: '', confirm: '' })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handle2FASetup = () => {
    setTwoFactorSetup(true)
    localStorage.setItem('cv_2fa_setup', 'true')
    setShow2FAModal(false)
  }

  useEffect(() => { loadSystemInfo() }, [])

  const loadSystemInfo = async () => {
    setLoading(true)
    try {
      const [hRes, bRes, wRes, dRes, mRes, aRes] = await Promise.all([
        fetch(`${API}/health`).then(r => r.ok).catch(() => false),
        apiClient.getBlocks().catch(() => ({ data: { blocks: [] } })),
        apiClient.getWallets().catch(() => ({ data: { wallets: {} } })),
        apiClient.getDatasets().catch(() => ({ data: { datasets: {} } })),
        apiClient.getModels().catch(() => ({ data: { models: {} } })),
        apiClient.getAttacks().catch(() => ({ data: { attacks: {} } })),
      ])
      setSystemInfo({
        health: hRes,
        blocks: (bRes.data.blocks || []).length,
        wallets: Object.keys(wRes.data.wallets || {}).length,
        datasets: Object.keys(dRes.data.datasets || {}).length,
        models: Object.keys(mRes.data.models || {}).length,
        attacks: Object.keys(aRes.data.attacks || {}).length,
      })
    } catch (err: any) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'sessions', label: 'Active Sessions', icon: Key, link: '/settings/sessions' },
    { id: 'api-keys', label: 'API Keys', icon: Key, link: '/settings/api-keys' },
    { id: 'permissions', label: 'Roles & Permissions', icon: Shield, link: '/settings/permissions' },
    { id: 'ip-allowlist', label: 'IP Allowlist', icon: Globe, link: '/settings/ip-allowlist' },
    { id: 'security-score', label: 'Security Score', icon: Shield, link: '/settings/security-score' },
    { id: 'data', label: 'Data & System', icon: Database },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ]

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-6">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              CV-INTEGRITY / Settings
            </div>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">
              Settings
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Manage your workspace profile, security preferences and system configuration.
            </p>
          </div>
          <button
            onClick={handleSave}
            className="flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-[12px] font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            {saved ? <Check size={14} /> : <Save size={14} />}
            {saved ? 'Saved' : 'Save Changes'}
          </button>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Sidebar tabs */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const active = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if ((tab as any).link) {
                        navigate((tab as any).link)
                      } else {
                        setActiveTab(tab.id)
                      }
                    }}
                    className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium transition-all ${
                      active
                        ? 'bg-emerald-50 text-emerald-900'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="settings-tab-active"
                        className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-emerald-700"
                      />
                    )}
                    <Icon size={16} className={active ? 'text-emerald-700' : 'text-slate-400'} />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-4">
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <div className="text-[15px] font-semibold text-slate-900">Profile Information</div>
                  <div className="mt-0.5 text-[12px] text-slate-500">Your account details and workspace role</div>
                </div>

                {/* Avatar row */}
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-[20px] font-bold text-white">
                    {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold text-slate-900">{profile.name}</div>
                    <div className="text-[12px] text-slate-500">{profile.role}</div>
                  </div>
                </div>

                {/* Fields */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {[
                    { label: 'Full Name', value: profile.name, icon: User, key: 'name' },
                    { label: 'Email', value: profile.email, icon: Mail, key: 'email' },
                    { label: 'Role', value: profile.role, icon: Shield, key: 'role' },
                    { label: 'Organization', value: profile.organization, icon: Building2, key: 'organization' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="mb-1.5 block text-[11px] font-medium text-slate-500">{field.label}</label>
                      <div className="relative">
                        <field.icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-[13px] text-slate-800 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <div className="text-[15px] font-semibold text-slate-900">Notification Preferences</div>
                  <div className="mt-0.5 text-[12px] text-slate-500">Choose which alerts you want to receive</div>
                </div>

                <div className="space-y-3">
                  {[
                    { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive notifications via email' },
                    { key: 'pushAlerts', label: 'Push Alerts', desc: 'In-app push notifications' },
                    { key: 'criticalOnly', label: 'Critical Only', desc: 'Only show critical severity alerts' },
                    { key: 'weeklyReport', label: 'Weekly Report', desc: 'Summary email every Monday' },
                    { key: 'driftAlerts', label: 'Drift Alerts', desc: 'Alert on distribution shift detection' },
                    { key: 'securityAlerts', label: 'Security Alerts', desc: 'Immediate security event notifications' },
                  ].map((item) => {
                    const enabled = (notifications as any)[item.key]
                    return (
                      <div key={item.key} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <div>
                          <div className="text-[13px] font-medium text-slate-800">{item.label}</div>
                          <div className="mt-0.5 text-[11px] text-slate-500">{item.desc}</div>
                        </div>
                        <button
                          onClick={() => setNotifications({ ...notifications, [item.key]: !enabled })}
                          className={`relative h-6 w-11 rounded-full transition-colors ${enabled ? 'bg-emerald-600' : 'bg-slate-300'}`}
                        >
                          <motion.div
                            animate={{ x: enabled ? 22 : 2 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
                          />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="space-y-5">

                {/* CHANGE PASSWORD CARD */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-start justify-between">
                    <div>
                      <div className="text-[15px] font-semibold text-slate-900">Change Password</div>
                      <div className="mt-0.5 text-[12px] text-slate-500">Update your account password</div>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                      <Lock size={15} className="text-emerald-600" strokeWidth={2.2} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-500 mb-2 block">Current Password</label>
                      <input
                        type="password"
                        value={passwordForm.current}
                        onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                        placeholder="Enter current password"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-500 mb-2 block">New Password</label>
                      <input
                        type="password"
                        value={passwordForm.newPass}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                        placeholder="Enter new password"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      />

                      {/* Strength Meter */}
                      {passwordForm.newPass && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-500">Strength</span>
                            <span className="text-[11px] font-bold" style={{ color: passwordStrength.color }}>
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${passwordStrength.score}%` }}
                              transition={{ duration: 0.4 }}
                              className="h-full rounded-full"
                              style={{ background: passwordStrength.color }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Requirements */}
                      {passwordForm.newPass && (
                        <div className="mt-4 space-y-2">
                          {[
                            { label: 'At least 8 characters', ok: passwordForm.newPass.length >= 8 },
                            { label: 'One uppercase letter', ok: /[A-Z]/.test(passwordForm.newPass) },
                            { label: 'One lowercase letter', ok: /[a-z]/.test(passwordForm.newPass) },
                            { label: 'One number', ok: /[0-9]/.test(passwordForm.newPass) },
                            { label: 'One special character', ok: /[^A-Za-z0-9]/.test(passwordForm.newPass) },
                          ].map((req) => (
                            <div key={req.label} className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.ok ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                {req.ok && <Check size={10} className="text-white" strokeWidth={3} />}
                              </div>
                              <span className={`text-[12px] ${req.ok ? 'text-slate-700' : 'text-slate-400'}`}>{req.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-500 mb-2 block">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordForm.confirm}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                        placeholder="Confirm new password"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>

                    {passwordError && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[12px] text-red-700">
                        {passwordError}
                      </div>
                    )}

                    <button
                      onClick={handlePasswordChange}
                      disabled={!passwordForm.current || !passwordForm.newPass || !passwordForm.confirm}
                      className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-3 text-[13px] font-semibold text-white transition-colors"
                    >
                      Update Password
                    </button>
                  </div>
                </div>

                {/* TWO-FACTOR */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <div className="text-[15px] font-semibold text-slate-900">Two-Factor Authentication</div>
                      <div className="mt-0.5 text-[12px] text-slate-500">Add an extra layer of security with TOTP</div>
                    </div>
                    <button
                      onClick={() => setSecurity({ ...security, twoFactor: !security.twoFactor })}
                      className={`relative h-6 w-11 rounded-full transition-colors ${security.twoFactor ? 'bg-emerald-600' : 'bg-slate-300'}`}
                    >
                      <motion.div
                        animate={{ x: security.twoFactor ? 22 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
                      />
                    </button>
                  </div>

                  {security.twoFactor && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                            <Shield size={15} className="text-emerald-600" />
                          </div>
                          <div>
                            <div className="text-[12px] font-medium text-slate-800">Authenticator App</div>
                            <div className="mt-0.5 text-[11px] text-slate-500">
                              {twoFactorSetup ? 'Configured · backup codes saved' : 'Not yet configured'}
                            </div>
                          </div>
                        </div>
                        {!twoFactorSetup ? (
                          <button
                            onClick={() => setShow2FAModal(true)}
                            className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-[12px] font-semibold text-white transition-colors"
                          >
                            Setup
                          </button>
                        ) : (
                          <button
                            onClick={() => setShow2FAModal(true)}
                            className="rounded-lg border border-slate-200 hover:bg-slate-50 px-4 py-2 text-[12px] font-semibold text-slate-700 transition-colors"
                          >
                            View Codes
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* SESSION TIMEOUT */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                        <Key size={15} className="text-blue-600" />
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-slate-800">Session Timeout</div>
                        <div className="mt-0.5 text-[11px] text-slate-500">Auto logout after inactivity</div>
                      </div>
                    </div>
                    <select
                      value={security.sessionTimeout}
                      onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="5">5 minutes</option>
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="0">Never</option>
                    </select>
                  </div>
                </div>

                {/* LOGIN HISTORY */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <div className="text-[15px] font-semibold text-slate-900">Recent Logins</div>
                      <div className="mt-0.5 text-[12px] text-slate-500">Last 5 sign-in attempts on your account</div>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                      <Clock size={15} className="text-amber-600" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {loginHistory.length === 0 ? (
                      <div className="text-center py-6 text-[12px] text-slate-400">No login history</div>
                    ) : (
                      loginHistory.slice(0, 5).map((entry, i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${entry.success ? 'bg-emerald-50' : 'bg-red-50'}`}>
                              {entry.success ? (
                                <Check size={13} className="text-emerald-600" strokeWidth={2.6} />
                              ) : (
                                <AlertTriangle size={13} className="text-red-600" strokeWidth={2.4} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-[12px] font-medium text-slate-800 truncate">
                                {entry.device} · {entry.browser}
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {entry.ip} · {entry.location}
                              </div>
                            </div>
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 flex-shrink-0 ml-3">
                            {new Date(entry.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* ACTIVE SESSIONS LINK */}
                <button
                  onClick={() => navigate('/settings/sessions')}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-5 hover:border-emerald-500/40 hover:shadow-md transition-all flex items-center justify-between group"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                      <Key size={15} className="text-indigo-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-[13px] font-semibold text-slate-800">Active Sessions</div>
                      <div className="mt-0.5 text-[11px] text-slate-500">Manage logged-in devices and sign out remotely</div>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                </button>

              </div>
            )}

            {/* DATA TAB */}
            {activeTab === 'data' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="text-[15px] font-semibold text-slate-900">System Overview</div>
                    <div className="mt-0.5 text-[12px] text-slate-500">Current backend and registry state</div>
                  </div>
                  <button
                    onClick={loadSystemInfo}
                    className="flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                    Refresh
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {[
                    { label: 'Datasets', value: systemInfo.datasets, icon: Database, color: '#10B981' },
                    { label: 'Models', value: systemInfo.models, icon: Cpu, color: '#3B82F6' },
                    { label: 'Blocks', value: systemInfo.blocks, icon: Hash, color: '#F59E0B' },
                    { label: 'Wallets', value: systemInfo.wallets, icon: Wallet, color: '#8B5CF6' },
                    { label: 'Attacks', value: systemInfo.attacks, icon: Shield, color: '#EF4444' },
                    { label: 'Health', value: systemInfo.health ? 'Online' : 'Offline', icon: Activity, color: systemInfo.health ? '#10B981' : '#EF4444' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${s.color}15` }}>
                          <s.icon size={13} style={{ color: s.color }} />
                        </div>
                        <span className="text-[11px] font-medium text-slate-500">{s.label}</span>
                      </div>
                      <div className="mt-3 text-[22px] font-bold text-slate-900">{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <div className="text-[15px] font-semibold text-slate-900">Appearance</div>
                  <div className="mt-0.5 text-[12px] text-slate-500">Choose your preferred theme</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'light', label: 'Light', desc: 'Clean white theme' },
                    { id: 'dark', label: 'Dark', desc: 'Dark teal theme' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`rounded-xl border-2 p-4 text-left transition-all ${
                        theme === t.id
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`text-[13px] font-semibold ${theme === t.id ? 'text-emerald-900' : 'text-slate-800'}`}>
                          {t.label}
                        </div>
                        {theme === t.id && <Check size={14} className="text-emerald-600" />}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500">{t.desc}</div>
                      <div className="mt-3 flex gap-1">
                        {[1, 2, 3].map(i => (
                          <div
                            key={i}
                            className={`h-8 flex-1 rounded ${t.id === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}
                          />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5">
              <div className="text-[18px] font-semibold text-slate-900">Setup Two-Factor Authentication</div>
              <div className="mt-1 text-[13px] text-slate-500">
                1. Install an authenticator app (Google Authenticator, Authy, 1Password)
              </div>
              <div className="mt-1 text-[13px] text-slate-500">
                2. Scan the QR code below
              </div>
            </div>

            {/* QR Code (generated placeholder) */}
            <div className="flex justify-center mb-5">
              <div className="w-48 h-48 rounded-xl bg-slate-50 border-2 border-slate-200 flex items-center justify-center">
                <svg viewBox="0 0 48 48" className="w-32 h-32">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <rect key={i} x={(i * 3) % 12 * 4} y={Math.floor(i * 3 / 12) * 4} width="4" height="4" fill="#1D1D1F" />
                  ))}
                  <rect x="4" y="4" width="12" height="12" fill="#1D1D1F" />
                  <rect x="32" y="4" width="12" height="12" fill="#1D1D1F" />
                  <rect x="4" y="32" width="12" height="12" fill="#1D1D1F" />
                  <rect x="20" y="20" width="8" height="8" fill="#1D1D1F" />
                  <rect x="24" y="36" width="4" height="4" fill="#1D1D1F" />
                  <rect x="36" y="24" width="4" height="4" fill="#1D1D1F" />
                </svg>
              </div>
            </div>

            {/* Secret key */}
            <div className="mb-5">
              <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-500 mb-2">Or enter manually</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-[12px] font-mono text-slate-800">
                  JBSW Y3DP EHPK 3PXP
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText('JBSWY3DPEHPK3PXP')}
                  className="rounded-lg bg-slate-100 hover:bg-slate-200 px-3 py-2 text-[11px] font-medium text-slate-700 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Backup codes */}
            <div className="mb-5">
              <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-500 mb-2">Backup codes (save these)</div>
              <div className="grid grid-cols-2 gap-2">
                {['4F8K-2N9P', '7X3M-5Q1L', '9H2W-8R6T', '3B7V-1C4Y'].map((code) => (
                  <code key={code} className="rounded-md bg-slate-50 border border-slate-200 px-2 py-1.5 text-[11px] font-mono text-center text-slate-700">
                    {code}
                  </code>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShow2FAModal(false)}
                className="flex-1 rounded-lg border border-slate-200 hover:bg-slate-50 py-2.5 text-[13px] font-medium text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handle2FASetup}
                className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 py-2.5 text-[13px] font-semibold text-white transition-colors"
              >
                {twoFactorSetup ? 'Done' : 'Enable 2FA'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Settings
