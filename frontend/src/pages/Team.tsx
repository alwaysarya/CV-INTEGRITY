import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Users, Search, Mail, Loader2, RefreshCw, AlertCircle, Crown, Code, Activity, Shield, Award, Scale, Check } from 'lucide-react'
import apiClient from '@/lib/api'

interface Member {
  id: number
  name: string
  role: string
  wallet: string
  balance: number
  transactions: number
  status: string
  avatar: string
}

const roleColors: Record<string, any> = {
  Admin: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.4)', icon: Crown },
  Contributor: { bg: 'rgba(139, 92, 246, 0.15)', text: '#8B5CF6', border: 'rgba(139, 92, 246, 0.4)', icon: Activity },
  Reviewer: { bg: 'rgba(56, 189, 248, 0.15)', text: '#38BDF8', border: 'rgba(56, 189, 248, 0.4)', icon: Code },
}

export function Team() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadTeam()
  }, [])

  const loadTeam = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.getWallets()
      const data = res.data
      const wallets = data.wallets || {}

      const list: Member[] = Object.entries(wallets).map(([key, val]: [string, any], idx) => {
        let role = 'Contributor'
        const nameLower = key.toLowerCase()
        if (nameLower.includes('arya') || nameLower.includes('admin')) role = 'Admin'
        else if (nameLower.includes('review') || nameLower.includes('verif')) role = 'Reviewer'
        else if (nameLower.includes('contrib') || nameLower.includes('training')) role = 'Contributor'

        return {
          id: idx + 1,
          name: val.owner || key,
          role,
          wallet: val.address || '',
          balance: val.balance || 0,
          transactions: (val.transactions || []).length,
          status: 'Active',
          avatar: (val.owner || key).substring(0, 2).toUpperCase(),
        }
      })

      setMembers(list)
    } catch (err: any) {
      console.error('Failed:', err)
      setError(err?.message || 'Backend connect nahi ho raha')
    } finally {
      setLoading(false)
    }
  }

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: members.length,
    admins: members.filter((m) => m.role === 'Admin').length,
    contributors: members.filter((m) => m.role === 'Contributor').length,
    totalTx: members.reduce((s, m) => s + m.transactions, 0),
  }

  const teamMembers = [
    { name: 'Platform Administrator', handle: '@admin', role: 'SUPER ADMIN', email: 'admin@cv-integrity.ai', joined: '01/01/2025', status: 'ACTIVE', permissions: ['ALL ACCESS'], color: '#EF4444', icon: Crown },
    { name: 'Alice Chen', handle: '@alice', role: 'ML ENGINEER', email: 'alice@cv-integrity.ai', joined: '15/02/2025', status: 'ACTIVE', permissions: ['model:read', 'model:write', 'dataset:read', 'trust:read'], color: '#8B5CF6', icon: Code },
    { name: 'Bob Watkins', handle: '@bob', role: 'SECURITY ANALYST', email: 'bob@cv-integrity.ai', joined: '10/03/2025', status: 'ACTIVE', permissions: ['audit:read', 'cyber:execute', 'blockchain:read'], color: '#F59E0B', icon: Shield },
    { name: 'Charlie Davis', handle: '@charlie', role: 'GOVERNANCE OFFICER', email: 'charlie@cv-integrity.ai', joined: '01/04/2025', status: 'ACTIVE', permissions: ['contracts:execute', 'multisig:sign', 'reports:download'], color: '#10B981', icon: Scale },
  ]

  const rbacModules = [
    { module: 'Models', admin: true, alice: true, bob: false, charlie: false },
    { module: 'Datasets', admin: true, alice: true, bob: false, charlie: false },
    { module: 'Blockchain', admin: true, alice: true, bob: true, charlie: false },
    { module: 'Smart Contracts', admin: true, alice: false, bob: false, charlie: true },
    { module: 'Multisig Wallets', admin: true, alice: false, bob: false, charlie: true },
    { module: 'Cyber Attack', admin: true, alice: false, bob: true, charlie: false },
    { module: 'Audit Trail', admin: true, alice: false, bob: true, charlie: false },
    { module: 'Reports', admin: true, alice: true, bob: true, charlie: true },
    { module: 'Settings', admin: true, alice: false, bob: false, charlie: false },
  ]

  return (
    <div className="space-y-6 p-6" style={{ background: '#F5F5F0', minHeight: 'calc(100vh - 72px)' }}>
      {/* NEW SECTION */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-[#1A1A14] mb-1">Team & Access Control</h1>
          <p className="text-[#6B6B60] text-sm">
            Role-based access management — defines who can sign, deploy, or quarantine AI models in the CV-INTEGRITY platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {teamMembers.map((member, i) => {
            const Icon = member.icon
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="rounded-3xl p-5 ">
                  <div className="flex flex-col items-center mb-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: `${member.color}20`, border: `1px solid ${member.color}40` }}>
                      <Icon size={22} style={{ color: member.color }} />
                    </div>
                    <div className="text-[#1A1A14] font-bold text-sm text-center">{member.name}</div>
                    <div className="text-[#8B8B80] text-[10px] mb-2">{member.handle}</div>
                    <Badge className="text-[9px] py-0.5 px-2" style={{ backgroundColor: `${member.color}20`, color: member.color, border: `1px solid ${member.color}40` }}>
                      {member.role}
                    </Badge>
                  </div>
                  <div className="space-y-1.5 mb-3 pt-3 border-t border-cyan-500/10">
                    <div className="flex items-center gap-2 text-[10px] text-[#6B6B60]"><Mail size={10} /> {member.email}</div>
                    <div className="flex items-center gap-2 text-[10px] text-[#6B6B60]"><Award size={10} /> {member.joined}</div>
                    <div className="flex items-center gap-2 text-[10px] text-green-400"><Check size={10} /> {member.status}</div>
                  </div>
                  <div className="pt-3 border-t border-cyan-500/10">
                    <div className="text-[#8B8B80] text-[9px] uppercase tracking-wider mb-2">Permissions</div>
                    <div className="flex flex-wrap gap-1">
                      {member.permissions.map((p, j) => (
                        <Badge key={j} className="text-[8px] py-0.5 px-1.5 bg-[#F5F5F0] border border-cyan-500/20 text-[#1A1A14]">{p}</Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <Card className="rounded-3xl p-6 mb-6">
          <div className="mb-4">
            <h3 className="text-[#1A1A14] font-bold text-sm">RBAC Access Matrix</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-500/10">
                  <th className="text-left text-[#8B8B80] text-[10px] font-bold tracking-wider uppercase pb-3">Module</th>
                  <th className="text-center text-[#8B8B80] text-[10px] font-bold tracking-wider uppercase pb-3">Admin</th>
                  <th className="text-center text-[#8B8B80] text-[10px] font-bold tracking-wider uppercase pb-3">Alice</th>
                  <th className="text-center text-[#8B8B80] text-[10px] font-bold tracking-wider uppercase pb-3">Bob</th>
                  <th className="text-center text-[#8B8B80] text-[10px] font-bold tracking-wider uppercase pb-3">Charlie</th>
                </tr>
              </thead>
              <tbody>
                {rbacModules.map((row, i) => (
                  <tr key={i} className="border-b border-cyan-500/5">
                    <td className="py-3"><span className="text-[#1A1A14] text-xs font-medium">{row.module}</span></td>
                    <td className="py-3 text-center">{row.admin ? <Check size={14} className="text-green-400 inline" /> : <span className="text-[#8B8B80]">—</span>}</td>
                    <td className="py-3 text-center">{row.alice ? <Check size={14} className="text-green-400 inline" /> : <span className="text-[#8B8B80]">—</span>}</td>
                    <td className="py-3 text-center">{row.bob ? <Check size={14} className="text-green-400 inline" /> : <span className="text-[#8B8B80]">—</span>}</td>
                    <td className="py-3 text-center">{row.charlie ? <Check size={14} className="text-green-400 inline" /> : <span className="text-[#8B8B80]">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* OLD CONTENT */}
      <div className="border-t border-cyan-500/20 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1A1A14] mb-1">Team</h2>
            <p className="text-[#6B6B60] text-sm">
              {loading ? 'Loading from backend...' : `${members.length} team members from blockchain`}
            </p>
          </div>
          <button onClick={loadTeam} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-sm font-medium">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {error && (
          <Card className="rounded-3xl p-4 mb-6" style={{ border: '1px solid rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.05)' }}>
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-400" size={20} />
              <div>
                <div className="text-red-400 font-medium text-sm">Backend Error</div>
                <div className="text-[#6B6B60] text-xs">{error}</div>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Members', value: stats.total, color: '#38BDF8', icon: Users },
            { label: 'Admins', value: stats.admins, color: '#EF4444', icon: Crown },
            { label: 'Contributors', value: stats.contributors, color: '#8B5CF6', icon: Activity },
            { label: 'Total Transactions', value: stats.totalTx, color: '#F59E0B', icon: Code },
          ].map((stat, i) => {
            const Icon = stat.icon
            return (
              <Card key={i} className="rounded-3xl p-5 border-cyan-500/20">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${stat.color}20`, border: `1px solid ${stat.color}40` }}>
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <div className="text-[#1A1A14] text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-[#6B6B60] text-xs">{stat.label}</div>
              </Card>
            )
          })}
        </div>

        <Card className="rounded-3xl border-cyan-500/20 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8B80]" size={16} />
            <Input placeholder="Search team members..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-[#F5F5F0] border-cyan-500/20 text-[#1A1A14] placeholder:text-[#8B8B80] h-10" />
          </div>
        </Card>

        {loading ? (
          <Card className="rounded-3xl border-cyan-500/20 p-12">
            <div className="flex items-center justify-center">
              <Loader2 className="animate-spin text-cyan-400" size={32} />
              <span className="ml-3 text-[#6B6B60]">Loading team...</span>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((member) => {
              const rColors = roleColors[member.role] || roleColors.Contributor
              const RoleIcon = rColors.icon
              return (
                <Card key={member.id} className="rounded-3xl border-cyan-500/20 p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[#1A1A14] font-bold text-sm">{member.avatar}</div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-green-400" />
                      </div>
                      <div>
                        <div className="text-[#1A1A14] font-bold text-sm">{member.name}</div>
                        <div className="text-[#8B8B80] text-xs flex items-center gap-1"><Mail size={10} />{member.wallet.substring(0, 14)}...</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: rColors.bg, color: rColors.text, border: `1px solid ${rColors.border}` }}>
                      <RoleIcon size={9} className="inline mr-0.5" />{member.role}
                    </Badge>
                    <Badge className="text-[10px] py-0.5 px-2 bg-green-500/20 text-green-400 border-green-500/40">● {member.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-cyan-500/10">
                    <div>
                      <div className="text-[#8B8B80] text-[10px] uppercase">Balance</div>
                      <div className="text-[#1A1A14] text-sm font-bold">{member.balance} CVIT</div>
                    </div>
                    <div>
                      <div className="text-[#8B8B80] text-[10px] uppercase">Transactions</div>
                      <div className="text-[#1A1A14] text-xs">{member.transactions}</div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
