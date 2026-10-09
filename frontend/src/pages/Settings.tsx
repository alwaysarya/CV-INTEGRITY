import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  User, Bell, Shield, Database, Palette, Save, Check, Key, Loader2,
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
                    onClick={() => setActiveTab(tab.id)}
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
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <div className="text-[15px] font-semibold text-slate-900">Security Settings</div>
                  <div className="mt-0.5 text-[12px] text-slate-500">Two-factor authentication and access control</div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                        <Lock size={14} className="text-emerald-600" />
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-slate-800">Two-Factor Authentication</div>
                        <div className="mt-0.5 text-[11px] text-slate-500">Add an extra layer of security</div>
                      </div>
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

                  <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                        <Key size={14} className="text-blue-600" />
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-slate-800">Session Timeout</div>
                        <div className="mt-0.5 text-[11px] text-slate-500">Minutes of inactivity before logout</div>
                      </div>
                    </div>
                    <input
                      type="number"
                      value={security.sessionTimeout}
                      onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
                      className="w-20 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-center text-[13px] font-medium text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                        <Eye size={14} className="text-amber-600" />
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-slate-800">API Access</div>
                        <div className="mt-0.5 text-[11px] text-slate-500">Allow external API integration</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSecurity({ ...security, apiAccess: !security.apiAccess })}
                      className={`relative h-6 w-11 rounded-full transition-colors ${security.apiAccess ? 'bg-emerald-600' : 'bg-slate-300'}`}
                    >
                      <motion.div
                        animate={{ x: security.apiAccess ? 22 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
                      />
                    </button>
                  </div>
                </div>
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
    </div>
  )
}

export default Settings
