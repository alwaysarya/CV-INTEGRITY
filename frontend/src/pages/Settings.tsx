import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { User, Bell, Shield, Database, Palette, Save, Check, Key, Loader2, RefreshCw, Activity, Cpu, Hash, Wallet } from 'lucide-react'
import apiClient from '@/lib/api'

type TabType = 'profile' | 'notifications' | 'security' | 'data' | 'appearance'

export function Settings() {
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [saved, setSaved] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [systemInfo, setSystemInfo] = useState<any>({
    health: null,
    blocks: 0,
    wallets: 0,
    datasets: 0,
    models: 0,
    attacks: 0,
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

  useEffect(() => {
    loadSystemInfo()
  }, [])

  const loadSystemInfo = async () => {
    setLoading(true)
    setError(null)
    try {
      const [health, bRes, wRes, dRes, mRes, aRes] = await Promise.all([
        apiClient.getHealth(),
        apiClient.getBlocks(),
        apiClient.getWallets(),
        apiClient.getDatasets(),
        apiClient.getModels(),
        apiClient.getAttacks(),
      ])

      setSystemInfo({
        health: health.data,
        blocks: (bRes.data.blocks || []).length,
        wallets: Object.keys(wRes.data.wallets || {}).length,
        datasets: Object.keys(dRes.data.datasets || {}).length,
        models: Object.keys(mRes.data.models || {}).length,
        attacks: Object.keys(aRes.data.attacks || {}).length,
      })
    } catch (err: any) {
      console.error('Failed:', err)
      setError(err?.message || 'Backend connect nahi ho raha')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
    { id: 'security' as TabType, label: 'Security', icon: Shield },
    { id: 'data' as TabType, label: 'System', icon: Database },
    { id: 'appearance' as TabType, label: 'Appearance', icon: Palette },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Settings</h1>
          <p className="text-gray-400 text-sm">Manage account and platform preferences</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadSystemInfo} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-sm font-medium">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium">
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {error && (
        <Card className="glass-card p-4" style={{ border: '1px solid rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <div className="text-red-400 text-sm">{error}</div>
        </Card>
      )}

      {/* System Overview Bar */}
      <Card className="glass-card border-cyan-500/20 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-sm">SYSTEM OVERVIEW</h3>
          {systemInfo.health?.status === 'healthy' ? (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/40 gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Backend Healthy
            </Badge>
          ) : (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/40 gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              Backend Offline
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Blocks', value: systemInfo.blocks, icon: Hash, color: '#8B5CF6' },
            { label: 'Wallets', value: systemInfo.wallets, icon: Wallet, color: '#38BDF8' },
            { label: 'Datasets', value: systemInfo.datasets, icon: Database, color: '#10B981' },
            { label: 'Models', value: systemInfo.models, icon: Cpu, color: '#F59E0B' },
            { label: 'Attacks', value: systemInfo.attacks, icon: Activity, color: '#EF4444' },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-black/30 border border-cyan-500/10">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${item.color}20`, border: `1px solid ${item.color}40` }}>
                  <Icon size={14} style={{ color: item.color }} />
                </div>
                <div>
                  <div className="text-white text-sm font-bold">{loading ? '-' : item.value}</div>
                  <div className="text-gray-500 text-[10px] uppercase">{item.label}</div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs */}
        <Card className="glass-card border-cyan-500/20 p-3 lg:col-span-1">
          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    active
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3 space-y-4">
          {activeTab === 'profile' && (
            <Card className="glass-card border-cyan-500/20 p-6">
              <div className="flex items-center gap-2 mb-6">
                <User size={18} className="text-cyan-400" />
                <h3 className="text-white font-bold text-base">Profile Information</h3>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl">
                  AT
                </div>
                <div>
                  <div className="text-white font-bold text-lg">{profile.name}</div>
                  <div className="text-gray-500 text-xs">{profile.role}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-xs font-medium mb-2 block">Full Name</label>
                  <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="bg-white/5 border-cyan-500/20 text-white h-10" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-medium mb-2 block">Email</label>
                  <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="bg-white/5 border-cyan-500/20 text-white h-10" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-medium mb-2 block">Organization</label>
                  <Input value={profile.organization} onChange={(e) => setProfile({ ...profile, organization: e.target.value })} className="bg-white/5 border-cyan-500/20 text-white h-10" />
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="glass-card border-cyan-500/20 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Bell size={18} className="text-cyan-400" />
                <h3 className="text-white font-bold text-base">Notification Preferences</h3>
              </div>
              <div className="space-y-3">
                {[
                  { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive alerts via email' },
                  { key: 'pushAlerts', label: 'Push Notifications', desc: 'Browser push notifications' },
                  { key: 'criticalOnly', label: 'Critical Only', desc: 'Only critical alerts' },
                  { key: 'weeklyReport', label: 'Weekly Report', desc: 'Weekly summary email' },
                  { key: 'driftAlerts', label: 'Drift Alerts', desc: 'Model drift notifications' },
                  { key: 'securityAlerts', label: 'Security Alerts', desc: 'Security incidents' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-cyan-500/10">
                    <div>
                      <div className="text-white text-sm font-medium">{item.label}</div>
                      <div className="text-gray-500 text-xs">{item.desc}</div>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                      className={`relative w-11 h-6 rounded-full transition-colors ${notifications[item.key as keyof typeof notifications] ? 'bg-cyan-500' : 'bg-gray-600'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${notifications[item.key as keyof typeof notifications] ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="glass-card border-cyan-500/20 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Shield size={18} className="text-cyan-400" />
                <h3 className="text-white font-bold text-base">Security Settings</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-cyan-500/10">
                  <div>
                    <div className="text-white text-sm font-medium">Two-Factor Authentication</div>
                    <div className="text-gray-500 text-xs">Add extra security layer</div>
                  </div>
                  <button
                    onClick={() => setSecurity({ ...security, twoFactor: !security.twoFactor })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${security.twoFactor ? 'bg-green-500' : 'bg-gray-600'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${security.twoFactor ? 'translate-x-5' : ''}`} />
                  </button>
                </div>

                <div className="p-4 rounded-lg bg-black/20 border border-cyan-500/10">
                  <label className="text-gray-400 text-xs font-medium mb-2 block">Session Timeout (minutes)</label>
                  <Input type="number" value={security.sessionTimeout} onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })} className="bg-white/5 border-cyan-500/20 text-white h-10" />
                </div>

                <div className="p-4 rounded-lg bg-black/20 border border-cyan-500/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Key size={14} className="text-yellow-400" />
                    <span className="text-white text-sm font-medium">API Endpoint</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input value="http://localhost:8000" readOnly className="bg-white/5 border-cyan-500/20 text-gray-400 h-10 font-mono text-xs" />
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/40 text-xs">
                      {systemInfo.health?.status || 'offline'}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-black/20 border border-cyan-500/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Hash size={14} className="text-cyan-400" />
                    <span className="text-white text-sm font-medium">Blockchain Status</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-gray-500 text-[10px] uppercase">Total Blocks</div>
                      <div className="text-white text-sm font-bold">{systemInfo.blocks}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-[10px] uppercase">Chain Status</div>
                      <div className="text-green-400 text-sm font-bold">Valid</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'data' && (
            <Card className="glass-card border-cyan-500/20 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Database size={18} className="text-cyan-400" />
                <h3 className="text-white font-bold text-base">System Information</h3>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Backend API', value: 'http://localhost:8000', status: systemInfo.health?.status === 'healthy' ? 'Online' : 'Offline' },
                  { label: 'Frontend', value: 'http://localhost:5173', status: 'Running' },
                  { label: 'Blockchain Blocks', value: `${systemInfo.blocks} blocks`, status: 'Valid' },
                  { label: 'Total Wallets', value: `${systemInfo.wallets} wallets`, status: 'Active' },
                  { label: 'Datasets Loaded', value: `${systemInfo.datasets} datasets`, status: 'Verified' },
                  { label: 'Models Loaded', value: `${systemInfo.models} models`, status: 'Deployed' },
                  { label: 'Attack Simulations', value: `${systemInfo.attacks} attacks`, status: 'Available' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-cyan-500/10">
                    <div>
                      <div className="text-white text-sm font-medium">{item.label}</div>
                      <div className="text-gray-500 text-xs font-mono">{item.value}</div>
                    </div>
                    <Badge className="text-[10px] py-0.5 px-2 bg-green-500/20 text-green-400 border-green-500/40">
                      ● {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card className="glass-card border-cyan-500/20 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Palette size={18} className="text-cyan-400" />
                <h3 className="text-white font-bold text-base">Appearance</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {['dark', 'light', 'system'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setTheme(option)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === option ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-cyan-500/10 hover:border-cyan-500/30'
                    }`}
                  >
                    <div className={`text-sm font-medium capitalize ${theme === option ? 'text-cyan-400' : 'text-gray-400'}`}>
                      {option}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
