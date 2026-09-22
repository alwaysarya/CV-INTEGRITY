import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Settings as SettingsIcon, User, Bell, Shield, Database, Palette, Save, Check, Key, Globe, Moon, Sun, Monitor } from 'lucide-react'

type TabType = 'profile' | 'notifications' | 'security' | 'data' | 'appearance'

export function Settings() {
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [saved, setSaved] = useState(false)
  const [theme, setTheme] = useState('dark')

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

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
    { id: 'security' as TabType, label: 'Security', icon: Shield },
    { id: 'data' as TabType, label: 'Data', icon: Database },
    { id: 'appearance' as TabType, label: 'Appearance', icon: Palette },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Settings</h1>
          <p className="text-gray-400 text-sm">Manage your account and platform preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
        >
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
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
                  <button className="text-cyan-400 text-xs mt-1 hover:text-cyan-300">Change Avatar</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-xs font-medium mb-2 block">Full Name</label>
                  <Input
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="bg-white/5 border-cyan-500/20 text-white h-10"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-medium mb-2 block">Email</label>
                  <Input
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="bg-white/5 border-cyan-500/20 text-white h-10"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-medium mb-2 block">Role</label>
                  <Input
                    value={profile.role}
                    disabled
                    className="bg-white/5 border-cyan-500/20 text-gray-500 h-10"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-medium mb-2 block">Organization</label>
                  <Input
                    value={profile.organization}
                    onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                    className="bg-white/5 border-cyan-500/20 text-white h-10"
                  />
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
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        notifications[item.key as keyof typeof notifications] ? 'bg-cyan-500' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                          notifications[item.key as keyof typeof notifications] ? 'translate-x-5' : ''
                        }`}
                      />
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
                    <div className="text-gray-500 text-xs">Add an extra layer of security</div>
                  </div>
                  <button
                    onClick={() => setSecurity({ ...security, twoFactor: !security.twoFactor })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      security.twoFactor ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                        security.twoFactor ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 rounded-lg bg-black/20 border border-cyan-500/10">
                  <label className="text-gray-400 text-xs font-medium mb-2 block">Session Timeout (minutes)</label>
                  <Input
                    type="number"
                    value={security.sessionTimeout}
                    onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
                    className="bg-white/5 border-cyan-500/20 text-white h-10"
                  />
                </div>

                <div className="p-4 rounded-lg bg-black/20 border border-cyan-500/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Key size={14} className="text-yellow-400" />
                    <span className="text-white text-sm font-medium">API Keys</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value="cv_live_7a3f9b2c4e1d..."
                      readOnly
                      className="bg-white/5 border-cyan-500/20 text-gray-400 h-10 font-mono text-xs"
                    />
                    <button className="px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-xs font-medium hover:bg-cyan-500/30 transition-all">
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'data' && (
            <Card className="glass-card border-cyan-500/20 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Database size={18} className="text-cyan-400" />
                <h3 className="text-white font-bold text-base">Data Management</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-cyan-500/10">
                  <div>
                    <div className="text-white text-sm font-medium">Export All Data</div>
                    <div className="text-gray-500 text-xs">Download all your data as ZIP</div>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-xs font-medium hover:bg-cyan-500/30 transition-all">
                    Export
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-cyan-500/10">
                  <div>
                    <div className="text-white text-sm font-medium">Clear Cache</div>
                    <div className="text-gray-500 text-xs">Free up storage space</div>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-xs font-medium hover:bg-cyan-500/30 transition-all">
                    Clear
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                  <div>
                    <div className="text-red-400 text-sm font-medium">Delete Account</div>
                    <div className="text-gray-500 text-xs">Permanently delete account and data</div>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-medium hover:bg-red-500/30 transition-all">
                    Delete
                  </button>
                </div>
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
                {[
                  { id: 'light', label: 'Light', icon: Sun },
                  { id: 'dark', label: 'Dark', icon: Moon },
                  { id: 'system', label: 'System', icon: Monitor },
                ].map((option) => {
                  const Icon = option.icon
                  const active = theme === option.id
                  return (
                    <button
                      key={option.id}
                      onClick={() => setTheme(option.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        active
                          ? 'border-cyan-500/50 bg-cyan-500/10'
                          : 'border-cyan-500/10 hover:border-cyan-500/30'
                      }`}
                    >
                      <Icon size={24} className={`mx-auto mb-2 ${active ? 'text-cyan-400' : 'text-gray-500'}`} />
                      <div className={`text-sm font-medium ${active ? 'text-cyan-400' : 'text-gray-400'}`}>
                        {option.label}
                      </div>
                    </button>
                  )
                })}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
