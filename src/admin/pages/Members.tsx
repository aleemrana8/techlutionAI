import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, Search, X, Mail, Phone, Code, FolderKanban, Trash2, Edit3, ChevronDown, DollarSign, CheckCircle2, Clock, AlertCircle, BarChart3 } from 'lucide-react'
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, getEmployeeAssignments, getEmployeeTasks } from '../../api/adminApi'
import PhoneInput from '../../components/common/PhoneInput'
import ConfirmModal from '../components/ConfirmModal'

interface Member {
  id: string; name: string; email: string; phone?: string; role: string; department: string; skills: string[]; status: string; workload: number; salary?: number; isFounder: boolean; joinDate: string; notes?: string; createdAt: string
}

function getDeadlineInfo(deadline: string | null | undefined) {
  if (!deadline) return null
  const now = new Date(); now.setHours(0, 0, 0, 0)
  const dl = new Date(deadline); dl.setHours(0, 0, 0, 0)
  const diff = Math.ceil((dl.getTime() - now.getTime()) / 86400000)
  if (diff < 0) return { days: Math.abs(diff), label: `${Math.abs(diff)}d overdue`, color: 'text-red-400 bg-red-500/10 border-red-500/20' }
  if (diff === 0) return { days: 0, label: 'Due today', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' }
  if (diff <= 3) return { days: diff, label: `${diff}d left`, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' }
  if (diff <= 7) return { days: diff, label: `${diff}d left`, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' }
  return { days: diff, label: `${diff}d left`, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
}

export default function Members() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Member | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [assignments, setAssignments] = useState<Record<string, any[]>>({})
  const [detailMember, setDetailMember] = useState<Member | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null)

  const fetchMembers = useCallback(async () => {
    try {
      const params: Record<string, string> = {}
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      const { data } = await getEmployees(params)
      setMembers(data?.data || [])
    } catch { /* */ } finally { setLoading(false) }
  }, [search, statusFilter])

  useEffect(() => { fetchMembers() }, [fetchMembers])

  const handleDelete = async (id: string) => {
    await deleteEmployee(id)
    fetchMembers()
  }

  const toggleExpand = async (id: string) => {
    if (expandedId === id) { setExpandedId(null); return }
    setExpandedId(id)
    if (!assignments[id]) {
      try {
        const { data } = await getEmployeeAssignments(id)
        setAssignments(prev => ({ ...prev, [id]: data?.data || [] }))
      } catch { setAssignments(prev => ({ ...prev, [id]: [] })) }
    }
  }

  const statusColors: Record<string, string> = { ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', ON_LEAVE: 'bg-amber-500/10 text-amber-400 border-amber-500/20', TERMINATED: 'bg-red-500/10 text-red-400 border-red-500/20' }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Users className="w-7 h-7 text-cyan-400" /> Team Members</h1>
          <p className="text-slate-400 text-sm mt-1">{members.length} members — assign to projects, track skills & workload</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setEditing(null); setShowModal(true) }} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-500 text-white rounded-xl font-medium text-sm">
          <Plus size={16} /> Add Member
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..." className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/[0.06] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/30" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-slate-900/50 border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none">
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_LEAVE">On Leave</option>
          <option value="TERMINATED">Terminated</option>
        </select>
      </div>

      {/* Members List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-slate-900/50 rounded-2xl animate-pulse border border-white/[0.06]" />)}
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-20 text-slate-500"><Users className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No members found</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {members.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-slate-900/50 backdrop-blur border border-white/[0.06] rounded-2xl overflow-hidden hover:border-cyan-500/20 transition-all">
              <div className="p-5 cursor-pointer" onClick={() => setDetailMember(m)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center text-cyan-400 font-bold text-sm">{m.name.charAt(0)}</div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">{m.name}{m.isFounder && <span className="ml-1.5 text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-500/20">Founder</span>}</h3>
                      <p className="text-slate-500 text-xs">{m.role} • {m.department}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusColors[m.status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>{m.status}</span>
                </div>

                <div className="space-y-2 text-xs text-slate-400">
                  {m.email && <div className="flex items-center gap-2"><Mail size={12} className="text-slate-600" />{m.email}</div>}
                  {m.phone && <div className="flex items-center gap-2"><Phone size={12} className="text-slate-600" />{m.phone}</div>}
                </div>

                {m.skills && m.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {m.skills.slice(0, 4).map(s => <span key={s} className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20">{s}</span>)}
                    {m.skills.length > 4 && <span className="text-[10px] text-slate-500">+{m.skills.length - 4}</span>}
                  </div>
                )}

                {/* Workload bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] mb-1"><span className="text-slate-500">Workload</span><span className={m.workload > 80 ? 'text-red-400' : m.workload > 50 ? 'text-amber-400' : 'text-emerald-400'}>{m.workload}%</span></div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${m.workload}%` }} className={`h-full rounded-full ${m.workload > 80 ? 'bg-red-500' : m.workload > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.06]">
                  <button onClick={(e) => { e.stopPropagation(); toggleExpand(m.id) }} className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                    <FolderKanban size={12} /> Projects <ChevronDown size={12} className={`transition-transform ${expandedId === m.id ? 'rotate-180' : ''}`} />
                  </button>
                  <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setEditing(m); setShowModal(true) }} className="p-1.5 text-slate-500 hover:text-cyan-400 transition-colors"><Edit3 size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setConfirmDelete({ id: m.id, name: m.name }) }} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>

              {/* Expanded projects */}
              <AnimatePresence>
                {expandedId === m.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-white/[0.06]">
                    <div className="p-4 bg-slate-950/50">
                      {(assignments[m.id] || []).length === 0 ? (
                        <p className="text-xs text-slate-600">No project assignments yet</p>
                      ) : (
                        <div className="space-y-2">
                          {assignments[m.id].map((a: any) => (
                            <div key={a.id} className="flex items-center justify-between text-xs bg-slate-900/50 rounded-lg px-3 py-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-slate-300 font-medium">{a.project?.title || a.projectRef}</span>
                                {a.project?.status && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{a.project.status}</span>}
                                {(() => { const dl = getDeadlineInfo(a.project?.deadline); return dl ? <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${dl.color}`}>{dl.label}</span> : null })()}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-slate-500">{a.roleInProject || 'Member'}</span>
                                {a.shareAmount != null && <span className="text-emerald-400 font-medium">${a.shareAmount?.toLocaleString()}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && <MemberModal member={editing} onClose={() => { setShowModal(false); setEditing(null) }} onSave={fetchMembers} />}
      </AnimatePresence>

      {/* Member Detail Modal */}
      <AnimatePresence>
        {detailMember && <MemberDetailModal member={detailMember} onClose={() => setDetailMember(null)} />}
      </AnimatePresence>

      <ConfirmModal
        open={!!confirmDelete}
        title="Delete Member"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        onConfirm={() => { if (confirmDelete) handleDelete(confirmDelete.id); setConfirmDelete(null) }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}

function MemberDetailModal({ member, onClose }: { member: Member; onClose: () => void }) {
  const [tab, setTab] = useState<'overview' | 'projects' | 'tasks' | 'finance'>('overview')
  const [assignments, setAssignments] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, tRes] = await Promise.all([getEmployeeAssignments(member.id), getEmployeeTasks(member.id)])
        setAssignments(aRes.data?.data || [])
        setTasks(tRes.data?.data || [])
      } catch { /* */ } finally { setLoading(false) }
    }
    load()
  }, [member.id])

  const totalEarnings = assignments.reduce((sum: number, a: any) => sum + (a.shareAmount || 0), 0)
  const paidEarnings = assignments.filter((a: any) => a.paymentStatus === 'PAID').reduce((sum: number, a: any) => sum + (a.shareAmount || 0), 0)
  const completedTasks = tasks.filter((t: any) => t.status === 'DONE').length
  const taskCompletion = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'projects', label: 'Projects', icon: FolderKanban },
    { key: 'tasks', label: 'Tasks', icon: CheckCircle2 },
    { key: 'finance', label: 'Finance', icon: DollarSign },
  ] as const

  const statusColors: Record<string, string> = { TODO: 'text-slate-400 bg-slate-500/10', IN_PROGRESS: 'text-cyan-400 bg-cyan-500/10', IN_REVIEW: 'text-amber-400 bg-amber-500/10', DONE: 'text-emerald-400 bg-emerald-500/10' }
  const priorityColors: Record<string, string> = { LOW: 'text-slate-400', MEDIUM: 'text-cyan-400', HIGH: 'text-amber-400', URGENT: 'text-red-400' }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-slate-900 border border-white/[0.06] rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center text-cyan-400 font-bold text-lg">{member.name.charAt(0)}</div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">{member.name}{member.isFounder && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-500/20">Founder</span>}</h2>
              <p className="text-slate-500 text-sm">{member.role} &bull; {member.department}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.06] px-5">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'text-cyan-400 border-cyan-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>
              <t.icon size={14} />{t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div> : (
            <>
              {tab === 'overview' && (
                <div className="space-y-5">
                  {/* KPIs */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Projects', value: assignments.length, color: 'text-cyan-400' },
                      { label: 'Tasks', value: tasks.length, color: 'text-violet-400' },
                      { label: 'Completion', value: `${taskCompletion}%`, color: taskCompletion > 70 ? 'text-emerald-400' : 'text-amber-400' },
                      { label: 'Earnings', value: `$${totalEarnings.toLocaleString()}`, color: 'text-emerald-400' },
                    ].map(k => (
                      <div key={k.label} className="bg-slate-800/50 border border-white/[0.06] rounded-xl p-4 text-center">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{k.label}</p>
                        <p className={`text-xl font-bold mt-1 ${k.color}`}>{k.value}</p>
                      </div>
                    ))}
                  </div>
                  {/* Info */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-800/30 rounded-xl p-3"><span className="text-slate-500">Email:</span> <span className="text-white">{member.email}</span></div>
                    {member.phone && <div className="bg-slate-800/30 rounded-xl p-3"><span className="text-slate-500">Phone:</span> <span className="text-white">{member.phone}</span></div>}
                    <div className="bg-slate-800/30 rounded-xl p-3"><span className="text-slate-500">Status:</span> <span className="text-white">{member.status}</span></div>
                    <div className="bg-slate-800/30 rounded-xl p-3"><span className="text-slate-500">Workload:</span> <span className={member.workload > 80 ? 'text-red-400' : 'text-emerald-400'}>{member.workload}%</span></div>
                    <div className="bg-slate-800/30 rounded-xl p-3"><span className="text-slate-500">Joined:</span> <span className="text-white">{new Date(member.joinDate || member.createdAt).toLocaleDateString()}</span></div>
                    {member.salary ? <div className="bg-slate-800/30 rounded-xl p-3"><span className="text-slate-500">Salary:</span> <span className="text-white">${member.salary.toLocaleString()}</span></div> : null}
                  </div>
                  {member.skills?.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-1.5">{member.skills.map(s => <span key={s} className="text-xs px-2.5 py-1 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20">{s}</span>)}</div>
                    </div>
                  )}
                  {/* Task status breakdown */}
                  {tasks.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-2">Task Status</p>
                      <div className="flex gap-3">
                        {['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].map(s => {
                          const count = tasks.filter((t: any) => t.status === s).length
                          return count > 0 ? <div key={s} className={`text-xs px-3 py-1.5 rounded-full ${statusColors[s]} border border-white/[0.06]`}>{s.replace('_', ' ')} ({count})</div> : null
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tab === 'projects' && (
                <div className="space-y-3">
                  {assignments.length === 0 ? <p className="text-sm text-slate-500 text-center py-8">No project assignments</p> : assignments.map((a: any) => (
                    <div key={a.id} className="bg-slate-800/30 border border-white/[0.06] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-white">{a.project?.title || a.projectRef}</h4>
                        <div className="flex items-center gap-2">
                          {a.project?.status && <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{a.project.status}</span>}
                          <span className="text-xs text-slate-500">{a.roleInProject || 'Member'}</span>
                        </div>
                      </div>
                      {a.project?.shortDescription && <p className="text-xs text-slate-400 mb-2">{a.project.shortDescription}</p>}
                      <div className="flex items-center gap-2 flex-wrap">
                        {a.project?.category && <span className="text-[10px] px-2 py-0.5 bg-violet-500/10 text-violet-400 rounded-full border border-violet-500/20">{a.project.category}</span>}
                        {(() => { const dl = getDeadlineInfo(a.project?.deadline); return dl ? <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${dl.color}`}>⏰ {dl.label}</span> : null })()}
                        {a.project?.deadline && <span className="text-[10px] text-slate-500">Due: {new Date(a.project.deadline).toLocaleDateString()}</span>}
                      </div>
                      {a.shareAmount != null && (
                        <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                          <span className="text-slate-500">Share: <span className="text-emerald-400 font-semibold">${a.shareAmount?.toLocaleString()}</span></span>
                          <span className={a.paymentStatus === 'PAID' ? 'text-emerald-400' : 'text-amber-400'}>{a.paymentStatus || 'PENDING'}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {tab === 'tasks' && (
                <div className="space-y-3">
                  {tasks.length === 0 ? <p className="text-sm text-slate-500 text-center py-8">No tasks assigned</p> : tasks.map((t: any) => (
                    <div key={t.id} className="bg-slate-800/30 border border-white/[0.06] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-white">{t.title}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[t.status]} border border-white/[0.06]`}>{t.status?.replace('_', ' ')}</span>
                      </div>
                      {t.description && <p className="text-xs text-slate-400 mb-2">{t.description}</p>}
                      <div className="flex items-center gap-3 text-[10px] text-slate-500">
                        <span className={priorityColors[t.priority]}>{t.priority}</span>
                        {t.project && <span>📋 {t.project.title}</span>}
                        {t.dueDate && <span>📅 {new Date(t.dueDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'finance' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-800/50 border border-white/[0.06] rounded-xl p-4 text-center">
                      <p className="text-[10px] text-slate-500 uppercase">Total Earnings</p>
                      <p className="text-xl font-bold text-emerald-400 mt-1">${totalEarnings.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-800/50 border border-white/[0.06] rounded-xl p-4 text-center">
                      <p className="text-[10px] text-slate-500 uppercase">Paid</p>
                      <p className="text-xl font-bold text-cyan-400 mt-1">${paidEarnings.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-800/50 border border-white/[0.06] rounded-xl p-4 text-center">
                      <p className="text-[10px] text-slate-500 uppercase">Pending</p>
                      <p className="text-xl font-bold text-amber-400 mt-1">${(totalEarnings - paidEarnings).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 font-medium">Earnings by Project</p>
                    {assignments.filter((a: any) => a.shareAmount).length === 0 ? <p className="text-sm text-slate-500 text-center py-4">No finance records</p> : assignments.filter((a: any) => a.shareAmount).map((a: any) => (
                      <div key={a.id} className="flex items-center justify-between bg-slate-800/30 border border-white/[0.06] rounded-xl p-3 text-sm">
                        <div>
                          <span className="text-white font-medium">{a.project?.title || a.projectRef}</span>
                          {a.totalAmount && <span className="ml-2 text-xs text-slate-500">(Budget: ${a.totalAmount?.toLocaleString()})</span>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-400 font-semibold">${a.shareAmount?.toLocaleString()}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${a.paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{a.paymentStatus || 'PENDING'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

function MemberModal({ member, onClose, onSave }: { member: Member | null; onClose: () => void; onSave: () => void }) {
  // Extract country code from existing phone if present
  const existingPhone = member?.phone || ''
  const ccMatch = existingPhone.match(/^(\+\d{1,3})(.*)$/)
  const initCC = ccMatch ? ccMatch[1] : '+92'
  const initPhone = ccMatch ? ccMatch[2] : existingPhone

  const [form, setForm] = useState({
    name: member?.name || '', email: member?.email || '', countryCode: initCC, phone: initPhone, role: member?.role || '',
    department: member?.department || '', skills: member?.skills?.join(', ') || '', status: member?.status || 'ACTIVE',
    workload: member?.workload || 0, salary: member?.salary || 0, isFounder: member?.isFounder || false, notes: member?.notes || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = { ...form, phone: `${form.countryCode}${form.phone}`, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean), salary: Number(form.salary), workload: Number(form.workload) }
      const { countryCode: _cc, ...submitData } = data
      if (member) await updateEmployee(member.id, submitData)
      else await createEmployee(submitData)
      onSave()
      onClose()
    } catch { /* */ } finally { setSaving(false) }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-slate-900 border border-white/[0.06] rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <h2 className="text-lg font-bold text-white">{member ? 'Edit Member' : 'Add Member'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-slate-500 mb-1 block">Name *</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2.5 bg-slate-800/50 border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/30" /></div>
            <div><label className="text-xs text-slate-500 mb-1 block">Email *</label><input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-3 py-2.5 bg-slate-800/50 border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/30" /></div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Phone</label>
              <PhoneInput
                countryCode={form.countryCode}
                phone={form.phone}
                onCountryCodeChange={v => setForm({...form, countryCode: v})}
                onPhoneChange={v => setForm({...form, phone: v})}
                accent="cyan"
                size="sm"
              />
            </div>
            <div><label className="text-xs text-slate-500 mb-1 block">Role *</label><input required value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full px-3 py-2.5 bg-slate-800/50 border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/30" placeholder="Developer, Designer..." /></div>
            <div><label className="text-xs text-slate-500 mb-1 block">Department *</label><input required value={form.department} onChange={e => setForm({...form, department: e.target.value})} className="w-full px-3 py-2.5 bg-slate-800/50 border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/30" placeholder="Engineering, Design..." /></div>
            <div><label className="text-xs text-slate-500 mb-1 block">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-3 py-2.5 bg-slate-800/50 border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none"><option value="ACTIVE">Active</option><option value="ON_LEAVE">On Leave</option><option value="TERMINATED">Terminated</option></select></div>
          </div>
          <div><label className="text-xs text-slate-500 mb-1 block">Skills (comma separated)</label><input value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} className="w-full px-3 py-2.5 bg-slate-800/50 border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/30" placeholder="React, Node.js, Python..." /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-slate-500 mb-1 block">Workload %</label><input type="number" min={0} max={100} value={form.workload} onChange={e => setForm({...form, workload: +e.target.value})} className="w-full px-3 py-2.5 bg-slate-800/50 border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/30" /></div>
            <div><label className="text-xs text-slate-500 mb-1 block">Salary</label><input type="number" value={form.salary} onChange={e => setForm({...form, salary: +e.target.value})} className="w-full px-3 py-2.5 bg-slate-800/50 border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/30" /></div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input type="checkbox" checked={form.isFounder} onChange={e => setForm({...form, isFounder: e.target.checked})} className="rounded border-slate-600" /> Founder
          </label>
          <div><label className="text-xs text-slate-500 mb-1 block">Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} className="w-full px-3 py-2.5 bg-slate-800/50 border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/30 resize-none" /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-500 text-white rounded-xl text-sm font-medium disabled:opacity-50">{saving ? 'Saving...' : member ? 'Update' : 'Add Member'}</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
