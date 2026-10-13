import { useEffect, useState } from 'react'
import React from 'react'
import { motion } from 'framer-motion'
import {
  Shield, Check, X, Plus, ArrowLeft, Loader2, Lock
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  getAllRoles, updateRolePermission, createRole,
  PERMISSIONS, CATEGORY_LABELS, type Role
} from '@/lib/rbac'

export function Permissions() {
  const navigate = useNavigate()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newRole, setNewRole] = useState({ name: '', description: '', color: '#5E5CE6' })
  const [toast, setToast] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setTimeout(() => {
      setRoles(getAllRoles())
      setLoading(false)
    }, 200)
  }

  useEffect(() => { load() }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const handleToggle = (roleId: string, permId: string, current: boolean) => {
    updateRolePermission(roleId, permId, !current)
    load()
    showToast('Permission updated')
  }

  const handleCreateRole = () => {
    if (!newRole.name.trim()) {
      showToast('Please enter a role name')
      return
    }
    createRole(newRole.name, newRole.description, newRole.color)
    setShowCreateModal(false)
    setNewRole({ name: '', description: '', color: '#5E5CE6' })
    load()
    showToast('Role created')
  }

  const grouped = PERMISSIONS.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = []
    acc[p.category].push(p)
    return acc
  }, {} as Record<string, typeof PERMISSIONS>)

  return (
    <div className="min-h-screen bg-[#FBFBFD] p-6" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>
      <div className="mx-auto max-w-[1200px]">

        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-[#1D1D1F] text-white text-[13px] font-medium shadow-xl"
          >
            {toast}
          </motion.div>
        )}

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
              Roles & Permissions
            </h1>
            <p className="mt-2 text-[15px] text-[#6E6E73]">
              Define what each role can access and manage
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex h-10 items-center gap-2 rounded-xl bg-[#1D1D1F] px-4 text-[13px] font-semibold text-white hover:bg-black transition-colors"
          >
            <Plus size={14} strokeWidth={2.4} />
            New Role
          </button>
        </div>

        <div className="mb-8">
          <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#86868B] mb-3">
            Roles ({roles.length})
          </div>
          <div className="flex flex-wrap gap-3">
            {roles.map(role => (
              <div
                key={role.id}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-black/[0.06] shadow-sm"
              >
                <div className="w-3 h-3 rounded-full" style={{ background: role.color, boxShadow: `0 0 8px ${role.color}80` }} />
                <div>
                  <div className="text-[13px] font-semibold text-[#1D1D1F]">{role.name}</div>
                  <div className="text-[10px] text-[#86868B]">{role.permissions.length} permissions</div>
                </div>
                {role.system && (
                  <Lock size={11} className="text-[#AEAEB2]" strokeWidth={2.4} />
                )}
              </div>
            ))}
          </div>
        </div>

        {loading && roles.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-20 text-[13px] text-[#86868B]">
            <Loader2 size={16} className="animate-spin" />
            Loading permissions...
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-black/[0.04] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#F0F0F2] bg-[#FBFBFD]">
                    <th className="text-left px-5 py-4 text-[11px] font-bold tracking-[0.14em] uppercase text-[#86868B] sticky left-0 bg-[#FBFBFD] z-10 min-w-[260px]">
                      Permission
                    </th>
                    {roles.map(role => (
                      <th key={role.id} className="px-4 py-4 text-center min-w-[120px]">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-3 h-3 rounded-full" style={{ background: role.color }} />
                          <div className="text-[12px] font-semibold text-[#1D1D1F]">{role.name}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(grouped).map(([category, perms]) => (
                    <React.Fragment key={category}>
                      <tr className="bg-[#FBFBFD] border-b border-[#F0F0F2]">
                        <td colSpan={roles.length + 1} className="px-5 py-2 text-[10px] font-bold tracking-[0.16em] uppercase text-[#AEAEB2]">
                          {CATEGORY_LABELS[category] || category}
                        </td>
                      </tr>
                      {perms.map((perm) => (
                        <tr key={perm.id} className="border-b border-[#F0F0F2] last:border-0 hover:bg-[#FBFBFD]">
                          <td className="px-5 py-3.5 sticky left-0 bg-white hover:bg-[#FBFBFD]">
                            <div className="text-[13px] font-medium text-[#1D1D1F]">{perm.label}</div>
                            <div className="text-[11px] text-[#86868B] mt-0.5">{perm.description}</div>
                          </td>
                          {roles.map(role => {
                            const has = role.permissions.includes(perm.id)
                            return (
                              <td key={role.id} className="px-4 py-3.5 text-center">
                                <button
                                  onClick={() => handleToggle(role.id, perm.id, has)}
                                  className={`inline-flex items-center justify-center w-6 h-6 rounded-md transition-all ${
                                    has
                                      ? 'bg-[#0071E3] hover:bg-[#0077ED]'
                                      : 'bg-[#F5F5F7] hover:bg-[#E5E5EA]'
                                  }`}
                                >
                                  {has ? (
                                    <Check size={13} className="text-white" strokeWidth={3} />
                                  ) : (
                                    <X size={13} className="text-[#AEAEB2]" strokeWidth={2.4} />
                                  )}
                                </button>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-6 text-[12px] text-[#6E6E73]">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-[#0071E3] flex items-center justify-center">
              <Check size={10} className="text-white" strokeWidth={3} />
            </div>
            <span>Permission granted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-[#F5F5F7] flex items-center justify-center">
              <X size={10} className="text-[#AEAEB2]" strokeWidth={2.4} />
            </div>
            <span>Permission denied</span>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-6">
              <div className="text-[20px] font-semibold tracking-[-0.02em] text-[#1D1D1F] mb-1">
                Create New Role
              </div>
              <div className="text-[13px] text-[#6E6E73]">
                Add a custom role with specific permissions
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#86868B] mb-2 block">
                  Role Name
                </label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="e.g., Data Scientist"
                  className="w-full rounded-xl border border-[#E5E5EA] bg-[#FBFBFD] px-4 py-3 text-[14px] text-[#1D1D1F] outline-none placeholder:text-[#AEAEB2] focus:border-[#0071E3]/40 focus:bg-white focus:ring-4 focus:ring-[#0071E3]/10 transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#86868B] mb-2 block">
                  Description
                </label>
                <input
                  type="text"
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  placeholder="What can this role do?"
                  className="w-full rounded-xl border border-[#E5E5EA] bg-[#FBFBFD] px-4 py-3 text-[14px] text-[#1D1D1F] outline-none placeholder:text-[#AEAEB2] focus:border-[#0071E3]/40 focus:bg-white focus:ring-4 focus:ring-[#0071E3]/10 transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#86868B] mb-2 block">
                  Color
                </label>
                <div className="flex gap-2">
                  {['#FF453A', '#FF9F0A', '#30D158', '#0071E3', '#5E5CE6', '#AF52DE', '#2DD4BF', '#FF6B9D'].map(c => (
                    <button
                      key={c}
                      onClick={() => setNewRole({ ...newRole, color: c })}
                      className={`w-9 h-9 rounded-xl transition-all ${
                        newRole.color === c ? 'ring-2 ring-offset-2 ring-[#1D1D1F] scale-110' : ''
                      }`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 rounded-xl border border-[#E5E5EA] hover:bg-[#F5F5F7] py-3 text-[13px] font-medium text-[#1D1D1F] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRole}
                disabled={!newRole.name.trim()}
                className="flex-1 rounded-xl bg-[#1D1D1F] hover:bg-black disabled:opacity-40 py-3 text-[13px] font-semibold text-white transition-colors"
              >
                Create Role
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Permissions
