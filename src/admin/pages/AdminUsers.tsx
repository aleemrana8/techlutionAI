import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserCog, Plus, Pencil, Trash2, X, Shield } from 'lucide-react'
import { getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser } from '../../api/adminApi'
import ConfirmModal from '../components/ConfirmModal'

const ROLES = ['SUPER_ADMIN', 'ADMIN', 'HR', 'FINANCE', 'MANAGER', 'SUPPORT'] as const

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  ADMIN: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  HR: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  FINANCE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  MANAGER: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  SUPPORT: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
}

interface AdminUser {
  id: string
  username: string
  email: string
  name: string
  role: string
  isActive: boolean
  lastLoginAt?: string
  createdAt?: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [form, setForm] = useState({ username: '', email: '', name: '', password: '', role: 'SUPPORT' })
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null)

  const fetchUsers = () => {
    getAdminUsers()
      .then(r => setUsers(r.data.data || []))
      .catch(err => console.error('Failed to fetch admin users:', err))
  }

  useEffect(() => { fetchUsers() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ username: '', email: '', name: '', password: '', role: 'SUPPORT' })
    setShowModal(true)
  }

  const openEdit = (u: AdminUser) => {
    setEditing(u)
    setForm({ username: u.username, email: u.email, name: u.name, password: '', role: u.role })
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editing) {
        const payload: any = { ...form }
        if (!payload.password) delete payload.password
        await updateAdminUser(editing.id, payload)
      } else {
        await createAdminUser(form)
      }
      setShowModal(false)
      fetchUsers()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (u: AdminUser) => {
    try {
      await deleteAdminUser(u.id)
      fetchUsers()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Users</h1>
          <p className="text-slate-400 text-sm mt-1">Manage admin accounts and roles</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {users.map((u, i) => (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] p-5 hover:border-white/[0.12] transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/[0.06] flex items-center justify-center">
                  <Shield size={18} className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{u.name || u.username}</p>
                  <p className="text-slate-500 text-xs">@{u.username}</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-all">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setConfirmDelete(u)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-3">{u.email}</p>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border ${ROLE_COLORS[u.role] || ROLE_COLORS.SUPPORT}`}>
                {u.role.replace('_', ' ')}
              </span>
              <span className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-emerald-400' : 'bg-slate-600'}`} title={u.isActive ? 'Active' : 'Inactive'} />
            </div>
            {u.lastLoginAt && (
              <p className="text-[10px] text-slate-600 mt-3">
                Last login: {new Date(u.lastLoginAt).toLocaleString()}
              </p>
            )}
          </motion.div>
        ))}

        {users.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-500">
            <UserCog className="w-10 h-10 mb-3 opacity-30" />
            <p>No admin users yet</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-slate-900 border border-white/[0.08] rounded-2xl shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
                <h2 className="text-white font-semibold">{editing ? 'Edit User' : 'Create Admin User'}</h2>
                <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-white/[0.06] text-slate-400">
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                {[
                  { label: 'Username', key: 'username', type: 'text' },
                  { label: 'Email', key: 'email', type: 'email' },
                  { label: 'Name', key: 'name', type: 'text' },
                  { label: editing ? 'New Password (optional)' : 'Password', key: 'password', type: 'password' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs text-slate-400 mb-1 block">{f.label}</label>
                    <input
                      type={f.type}
                      value={(form as any)[f.key]}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full bg-white/[0.03] border border-white/[0.08] text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-500/30 transition-all"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Role</label>
                  <select
                    value={form.role}
                    onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full bg-slate-800 border border-white/[0.08] text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-500/30 transition-all"
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>{r.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="p-5 border-t border-white/[0.06] flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={!!confirmDelete}
        title="Delete Admin User"
        message={`Are you sure you want to delete admin user "${confirmDelete?.username}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        onConfirm={() => { if (confirmDelete) handleDelete(confirmDelete); setConfirmDelete(null) }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
