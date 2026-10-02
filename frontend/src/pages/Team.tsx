import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Users, Search, Mail, Loader2, RefreshCw, AlertCircle, Crown, Code, Activity, Shield, Award, Check } from 'lucide-react'
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

const rolePermissions: Record<string, string[]> = {
  Admin: ['models:write', 'datasets:write', 'blockchain:write', 'contracts:execute', 'multisig:sign', 'settings:write'],
  Contributor: ['models:read', 'datasets:read', 'datasets:write', 'trust:read'],
  Reviewer: ['audit:read', 'reports:read', 'blockchain:read', 'verification:write'],
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

  // Real RBAC matrix — generated from actual members
  const rbacModules = [
    'Models', 'Datasets', 'Blockchain', 'Smart Contracts',
    'Multisig Wallets', 'Cyber Attack', 'Audit Trail', 'Reports', 'Settings'
  ]

  const hasAccess = (role: string, module: string): boolean => {
    if (role === 'Admin') return true
    if (role === 'Contributor') return ['Models', 'Datasets', 'Reports'].includes(module)
    if (role === 'Reviewer') return ['Blockchain', 'Cyber Attack', 'Audit Trail', 'Reports'].includes(module)
    return false
  }

  return (
    <div className="space-y-6 p-6" style={{ background: '#0A0F14', minHeight: 'calc(100vh - 72px)' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-[#E5F5F0] mb-1">Team & Access Control</h1>
            <p className="text-[#8AA4A0] text-sm">
              Role-based access management — defines who can sign, deploy, or quarantine AI models in the CV-INTEGRITY platform.
            </p>
          </div>
          <button
            onClick={loadTeam}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs hover:bg-cyan-500/20 transition"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {error && (
          <Card className="rounded-2xl p-4 mb-6 border border-red-500/40 bg-red-500/5">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-400" size={20} />
              <div>
                <div className="text-red-400 font-medium text-sm">Backend Error</div>
                <div className="text-[#8AA4A0] text-xs">{error}</div>
              </div>
            </div>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Members', value: stats.total, color: '#38BDF8', icon: Users },
            { label: 'Admins', value: stats.admins, color: '#EF4444', icon: Crown },
            { label: 'Contributors', value: stats.contributors, color: '#8B5CF6', icon: Activity },
            { label: 'Total Transactions', value: stats.totalTx, color: '#F59E0B', icon: Code },
          ].map((stat, i) => {
            const Icon = stat.icon
            return (
              <Card key={i} className="rounded-2xl p-5 bg-[#0F1419] border border-cyan-500/20">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${stat.color}20`, border: `1px solid ${stat.color}40` }}>
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <div className="text-[#E5F5F0] text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-[#8AA4A0] text-xs">{stat.label}</div>
              </Card>
            )
          })}
        </div>

        {/* Member Cards — LIVE from API */}
        {loading ? (
          <div className="flex items-center justify-center py-16 bg-[#0F1419] rounded-2xl border border-cyan-500/20">
            <Loader2 className="animate-spin text-cyan-400" size={28} />
            <span className="ml-3 text-[#8AA4A0]">Loading team from backend...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {filtered.map((member, i) => {
                const rColors = roleColors[member.role] || roleColors.Contributor
                const RoleIcon = rColors.icon
                return (
                  <motion.div key={member.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <Card className="rounded-2xl p-5 bg-[#0F1419] border border-cyan-500/20">
                      <div className="flex flex-col items-center mb-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: `${rColors.text}20`, border: `1px solid ${rColors.text}40` }}>
                          <RoleIcon size={22} style={{ color: rColors.text }} />
                        </div>
                        <div className="text-[#E5F5F0] font-bold text-sm text-center">{member.name}</div>
                        <div className="text-[#5EEAD4] text-[10px] mb-2 font-mono">{member.wallet.slice(0, 10)}...</div>
                        <Badge className="text-[9px] py-0.5 px-2" style={{ backgroundColor: rColors.bg, color: rColors.text, border: `1px solid ${rColors.border}` }}>
                          {member.role.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="space-y-1.5 mb-3 pt-3 border-t border-cyan-500/10">
                        <div className="flex items-center justify-between text-[10px] text-[#8AA4A0]">
                          <span>Balance</span>
                          <span className="text-green-400 font-bold">{member.balance} CVIT</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-[#8AA4A0]">
                          <span>Transactions</span>
                          <span className="text-[#E5F5F0] font-bold">{member.transactions}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-green-400">
                          <Check size={10} /> {member.status}
                        </div>
                      </div>
                      <div className="pt-3 border-t border-cyan-500/10">
                        <div className="text-[#5EEAD4] text-[9px] uppercase tracking-wider mb-2">Permissions</div>
                        <div className="flex flex-wrap gap-1">
                          {(rolePermissions[member.role] || []).map((p, j) => (
                            <Badge key={j} className="text-[8px] py-0.5 px-1.5 bg-[#0A0F14] border border-cyan-500/20 text-[#8AA4A0]">{p}</Badge>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            {/* RBAC Matrix — Real members */}
            <Card className="rounded-2xl p-6 bg-[#0F1419] border border-cyan-500/20 mb-6">
              <div className="mb-4">
                <h3 className="text-[#E5F5F0] font-bold text-sm">RBAC Access Matrix</h3>
                <p className="text-[#8AA4A0] text-xs mt-1">Role-based permissions across modules</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cyan-500/20">
                      <th className="text-left text-[#5EEAD4] text-[10px] font-bold tracking-wider uppercase pb-3">Module</th>
                      {members.slice(0, 4).map((m) => (
                        <th key={m.id} className="text-center text-[#5EEAD4] text-[10px] font-bold tracking-wider uppercase pb-3">
                          {m.name.length > 10 ? m.name.slice(0, 10) + '...' : m.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rbacModules.map((module, i) => (
                      <tr key={i} className="border-b border-cyan-500/5">
                        <td className="py-3">
                          <span className="text-[#E5F5F0] text-xs font-medium">{module}</span>
                        </td>
                        {members.slice(0, 4).map((m) => (
                          <td key={m.id} className="py-3 text-center">
                            {hasAccess(m.role, module) ? (
                              <Check size={14} className="text-green-400 inline" />
                            ) : (
                              <span className="text-[#5EEAD4]/30">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Search */}
            <Card className="rounded-2xl bg-[#0F1419] border border-cyan-500/20 p-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5EEAD4] opacity-60" size={16} />
                <Input
                  placeholder="Search team members..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-[#0A0F14] border-cyan-500/30 text-[#E5F5F0] placeholder:text-[#5EEAD4]/30 h-10"
                />
              </div>
            </Card>

            {/* Full member list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((member) => {
                const rColors = roleColors[member.role] || roleColors.Contributor
                const RoleIcon = rColors.icon
                return (
                  <Card key={member.id} className="rounded-2xl bg-[#0F1419] border border-cyan-500/20 p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-[#0A0F14] font-bold text-sm">
                            {member.avatar}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0F1419] bg-green-400" />
                        </div>
                        <div>
                          <div className="text-[#E5F5F0] font-bold text-sm">{member.name}</div>
                          <div className="text-[#5EEAD4] text-xs flex items-center gap-1 font-mono">
                            <Mail size={10} />{member.wallet.substring(0, 14)}...
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: rColors.bg, color: rColors.text, border: `1px solid ${rColors.border}` }}>
                        <RoleIcon size={9} className="inline mr-0.5" />{member.role}
                      </Badge>
                      <Badge className="text-[10px] py-0.5 px-2 bg-green-500/20 text-green-400 border-green-500/40">
                        ● {member.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-cyan-500/10">
                      <div>
                        <div className="text-[#5EEAD4] text-[10px] uppercase tracking-wider">Balance</div>
                        <div className="text-[#E5F5F0] text-sm font-bold">{member.balance} CVIT</div>
                      </div>
                      <div>
                        <div className="text-[#5EEAD4] text-[10px] uppercase tracking-wider">Transactions</div>
                        <div className="text-[#E5F5F0] text-xs">{member.transactions}</div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
