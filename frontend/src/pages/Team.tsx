import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Users, Search, Mail, Plus, Activity, Shield, Crown, Code } from 'lucide-react'

interface Member {
  id: number
  name: string
  email: string
  role: 'Admin' | 'Researcher' | 'Developer' | 'Viewer'
  status: 'Online' | 'Away' | 'Offline'
  lastActive: string
  tasks: number
  avatar: string
}

const staticMembers: Member[] = [
  { id: 1, name: 'Aryan Thakur', email: 'aryan@cv-integrity.ai', role: 'Admin', status: 'Online', lastActive: 'now', tasks: 24, avatar: 'AT' },
  { id: 2, name: 'Priya Sharma', email: 'priya@cv-integrity.ai', role: 'Researcher', status: 'Online', lastActive: '2 min ago', tasks: 18, avatar: 'PS' },
  { id: 3, name: 'Rohan Mehta', email: 'rohan@cv-integrity.ai', role: 'Developer', status: 'Online', lastActive: '5 min ago', tasks: 15, avatar: 'RM' },
  { id: 4, name: 'Sneha Kapoor', email: 'sneha@cv-integrity.ai', role: 'Researcher', status: 'Away', lastActive: '25 min ago', tasks: 22, avatar: 'SK' },
  { id: 5, name: 'Vikram Singh', email: 'vikram@cv-integrity.ai', role: 'Developer', status: 'Offline', lastActive: '2 hr ago', tasks: 8, avatar: 'VS' },
  { id: 6, name: 'Ananya Rao', email: 'ananya@cv-integrity.ai', role: 'Viewer', status: 'Online', lastActive: '1 min ago', tasks: 3, avatar: 'AR' },
]

const roleColors = {
  Admin: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.4)', icon: Crown },
  Researcher: { bg: 'rgba(139, 92, 246, 0.15)', text: '#8B5CF6', border: 'rgba(139, 92, 246, 0.4)', icon: Activity },
  Developer: { bg: 'rgba(56, 189, 248, 0.15)', text: '#38BDF8', border: 'rgba(56, 189, 248, 0.4)', icon: Code },
  Viewer: { bg: 'rgba(107, 114, 128, 0.15)', text: '#9CA3AF', border: 'rgba(107, 114, 128, 0.4)', icon: Users },
}

const statusColors = {
  Online: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.4)' },
  Away: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' },
  Offline: { bg: 'rgba(107, 114, 128, 0.15)', text: '#9CA3AF', border: 'rgba(107, 114, 128, 0.4)' },
}

export function Team() {
  const [members] = useState<Member[]>(staticMembers)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')

  const filtered = members.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || m.role === filter
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: members.length,
    online: members.filter((m) => m.status === 'Online').length,
    admins: members.filter((m) => m.role === 'Admin').length,
    totalTasks: members.reduce((sum, m) => sum + m.tasks, 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Team</h1>
          <p className="text-gray-400 text-sm">Manage team members and permissions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all">
          <Plus size={16} />
          Invite Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Members', value: stats.total, color: '#38BDF8', icon: Users },
          { label: 'Online Now', value: stats.online, color: '#10B981', icon: Activity },
          { label: 'Admins', value: stats.admins, color: '#EF4444', icon: Crown },
          { label: 'Total Tasks', value: stats.totalTasks, color: '#8B5CF6', icon: Shield },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="glass-card p-5 border-cyan-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}20`, border: `1px solid ${stat.color}40` }}>
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
              </div>
              <div className="text-white text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-gray-400 text-xs">{stat.label}</div>
            </Card>
          )
        })}
      </div>

      <Card className="glass-card border-cyan-500/20 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <Input
              placeholder="Search team members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-cyan-500/20 text-white placeholder:text-gray-500 h-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'Admin', 'Researcher', 'Developer', 'Viewer'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  filter === f
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'text-gray-500 hover:text-gray-300 border border-cyan-500/10'
                }`}
              >
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((member) => {
          const rColors = roleColors[member.role]
          const sColors = statusColors[member.status]
          const RoleIcon = rColors.icon
          return (
            <Card key={member.id} className="glass-card border-cyan-500/20 p-5 hover:border-cyan-500/40 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                      {member.avatar}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0A0E1A]" style={{ backgroundColor: sColors.text }} />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">{member.name}</div>
                    <div className="text-gray-500 text-xs flex items-center gap-1">
                      <Mail size={10} />
                      {member.email}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: rColors.bg, color: rColors.text, border: `1px solid ${rColors.border}` }}>
                  <RoleIcon size={9} className="inline mr-0.5" />
                  {member.role}
                </Badge>
                <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: sColors.bg, color: sColors.text, border: `1px solid ${sColors.border}` }}>
                  ● {member.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-cyan-500/10">
                <div>
                  <div className="text-gray-500 text-[10px] uppercase tracking-wider">Tasks</div>
                  <div className="text-white text-sm font-bold">{member.tasks}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-[10px] uppercase tracking-wider">Last Active</div>
                  <div className="text-gray-300 text-xs">{member.lastActive}</div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
