import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Users, Search, Mail, Loader2, RefreshCw, AlertCircle, Crown, Code, Activity } from 'lucide-react'
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
        // Determine role from name
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Team</h1>
          <p className="text-gray-400 text-sm">
            {loading ? 'Loading from backend...' : `${members.length} team members from blockchain`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadTeam} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-sm font-medium">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <Card className="glass-card p-4" style={{ border: '1px solid rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-400" size={20} />
            <div>
              <div className="text-red-400 font-medium text-sm">Backend Error</div>
              <div className="text-gray-400 text-xs">{error}</div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Members', value: stats.total, color: '#38BDF8', icon: Users },
          { label: 'Admins', value: stats.admins, color: '#EF4444', icon: Crown },
          { label: 'Contributors', value: stats.contributors, color: '#8B5CF6', icon: Activity },
          { label: 'Total Transactions', value: stats.totalTx, color: '#F59E0B', icon: Code },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="glass-card p-5 border-cyan-500/20">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${stat.color}20`, border: `1px solid ${stat.color}40` }}>
                <Icon size={20} style={{ color: stat.color }} />
              </div>
              <div className="text-white text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-gray-400 text-xs">{stat.label}</div>
            </Card>
          )
        })}
      </div>

      <Card className="glass-card border-cyan-500/20 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <Input
            placeholder="Search team members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-cyan-500/20 text-white placeholder:text-gray-500 h-10"
          />
        </div>
      </Card>

      {loading ? (
        <Card className="glass-card border-cyan-500/20 p-12">
          <div className="flex items-center justify-center">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
            <span className="ml-3 text-gray-400">Loading team...</span>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((member) => {
            const rColors = roleColors[member.role] || roleColors.Contributor
            const RoleIcon = rColors.icon
            return (
              <Card key={member.id} className="glass-card border-cyan-500/20 p-5 hover:border-cyan-500/40 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        {member.avatar}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0A0E1A] bg-green-400" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">{member.name}</div>
                      <div className="text-gray-500 text-xs flex items-center gap-1">
                        <Mail size={10} />
                        {member.wallet.substring(0, 14)}...
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: rColors.bg, color: rColors.text, border: `1px solid ${rColors.border}` }}>
                    <RoleIcon size={9} className="inline mr-0.5" />
                    {member.role}
                  </Badge>
                  <Badge className="text-[10px] py-0.5 px-2 bg-green-500/20 text-green-400 border-green-500/40">
                    ● {member.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-cyan-500/10">
                  <div>
                    <div className="text-gray-500 text-[10px] uppercase">Balance</div>
                    <div className="text-white text-sm font-bold">{member.balance} CVIT</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-[10px] uppercase">Transactions</div>
                    <div className="text-gray-300 text-xs">{member.transactions}</div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <Card className="glass-card border-cyan-500/20 p-12">
          <div className="text-center">
            <Users size={48} className="text-gray-600 mx-auto mb-3" />
            <div className="text-gray-400 text-sm">No team members found</div>
          </div>
        </Card>
      )}
    </div>
  )
}
