import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Clock, CheckCircle2, AlertCircle, Circle, X, DollarSign, Trash2, FolderKanban, Users, UserPlus, UserMinus, ListTodo, Plus, CalendarDays, Check } from 'lucide-react'
import { getProjectFinance, calculateProjectSharing, notifyProjectTeam, markSharePaid, getEmployees, createEmployee, assignMemberToProject, removeMemberFromProject, getProjectTasks, createTask, updateTask, deleteTask } from '../../api/adminApi'
import { useDashboardSocket } from '../hooks/useSocket'
import ConfirmModal from '../components/ConfirmModal'

type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'

interface Project {
  id: string; title: string; slug: string; shortDescription: string; category: string; status: ProjectStatus; tags: string[]; techStack: string[]; durationWeeks: number | null; deadline: string | null; createdAt: string
  assignments?: { id: string; roleInProject: string; employee: { id: string; name: string; email: string; role: string; department: string; isFounder: boolean; phone?: string } }[]
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Confirmation Modal (inline for nested usage)                             */
/* ═══════════════════════════════════════════════════════════════════════════ */

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

const statusConfig: Record<ProjectStatus, { icon: any; label: string; color: string; bg: string }> = {
  DRAFT: { icon: Circle, label: 'Planning', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' },
  ACTIVE: { icon: Clock, label: 'In Progress', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  COMPLETED: { icon: CheckCircle2, label: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  ARCHIVED: { icon: AlertCircle, label: 'Archived', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
}
const ALL_STATUSES: ProjectStatus[] = ['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED']

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Cost Sharing Modal                                                       */
/* ═══════════════════════════════════════════════════════════════════════════ */

function CostSharingModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const [finance, setFinance] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    totalAmount: '', currency: 'USD', fiverrFeePercent: '20', zakatEnabled: false, zakatPercent: '2.5',
    otherCosts: [] as { name: string; amount: number }[], teamMemberIds: [] as string[],
  })
  const [employees, setEmployees] = useState<any[]>([])
  const [calculating, setCalculating] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ type: 'notify' | 'markPaid'; notifyType?: string; shareId?: string } | null>(null)

  useEffect(() => { loadData() }, [project.id])

  async function loadData() {
    try {
      const [finRes, empRes] = await Promise.all([
        getProjectFinance(project.id).catch(() => null),
        getEmployees({ limit: '100' }),
      ])
      if (finRes?.data?.data) {
        const f = finRes.data.data
        setFinance(f)
        setForm({ totalAmount: f.totalAmount.toString(), currency: f.currency || 'USD', fiverrFeePercent: f.fiverrFeePercent.toString(), zakatEnabled: f.zakatEnabled, zakatPercent: f.zakatPercent.toString(), otherCosts: (f.otherCosts as any[]) || [], teamMemberIds: f.shares?.map((s: any) => s.employeeId) || [] })
      }
      setEmployees(empRes.data?.data || [])
    } catch { /* */ }
    setLoading(false)
  }

  async function handleCalculate() {
    setCalculating(true)
    try {
      const res = await calculateProjectSharing({
        projectRef: project.id, totalAmount: form.totalAmount, currency: form.currency, fiverrFeePercent: form.fiverrFeePercent,
        zakatEnabled: form.zakatEnabled, zakatPercent: form.zakatPercent, otherCosts: form.otherCosts,
        founderIncluded: true, teamMemberIds: form.teamMemberIds,
      })
      setFinance(res.data?.data?.projectFinance)
      await loadData()
    } catch { /* */ }
    setCalculating(false)
  }

  async function handleNotify(type: 'assignment' | 'update' | 'completion') {
    try {
      await notifyProjectTeam({ projectRef: project.id, projectTitle: project.title, type })
      alert(`✅ ${type === 'completion' ? 'Completion' : type === 'assignment' ? 'Assignment' : 'Update'} notifications sent successfully!`)
    } catch {
      alert('❌ Failed to send notifications. Please try again.')
    }
  }

  async function handleMarkPaid(shareId: string) {
    await markSharePaid(shareId)
    alert('✅ Share marked as paid!')
    await loadData()
  }

  const executeConfirm = () => {
    if (!confirmAction) return
    if (confirmAction.type === 'notify') handleNotify(confirmAction.notifyType as any)
    else if (confirmAction.type === 'markPaid' && confirmAction.shareId) handleMarkPaid(confirmAction.shareId)
    setConfirmAction(null)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border bg-slate-900 border-white/[0.06] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><DollarSign size={18} className="text-emerald-400" /> Cost Sharing — {project.title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        {loading ? <div className="text-center py-10 text-slate-500">Loading...</div> : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1"><label className="text-xs text-slate-500 mb-1 block">Total Amount</label><input type="number" value={form.totalAmount} onChange={e => setForm({ ...form, totalAmount: e.target.value })} className="w-full bg-slate-800/50 border border-white/[0.06] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500/30" placeholder="5000" /></div>
              <div className="col-span-1"><label className="text-xs text-slate-500 mb-1 block">Currency</label>
                <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className="w-full bg-slate-800/50 border border-white/[0.06] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500/30">
                  <option value="USD">USD ($)</option><option value="PKR">PKR (₨)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div className="col-span-1"><label className="text-xs text-slate-500 mb-1 block">Fiverr Fee (%)</label><input type="number" value={form.fiverrFeePercent} onChange={e => setForm({ ...form, fiverrFeePercent: e.target.value })} className="w-full bg-slate-800/50 border border-white/[0.06] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500/30" /></div>
            </div>

            {/* Other Costs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-slate-500">Other Deductions</label>
                <button type="button" onClick={() => setForm({ ...form, otherCosts: [...form.otherCosts, { name: '', amount: 0 }] })} className="text-xs text-cyan-400 hover:text-cyan-300">+ Add</button>
              </div>
              {form.otherCosts.map((c, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input value={c.name} onChange={e => { const updated = [...form.otherCosts]; updated[i] = { ...c, name: e.target.value }; setForm({ ...form, otherCosts: updated }) }} placeholder="Label" className="flex-1 bg-slate-800/50 border border-white/[0.06] text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-500/30" />
                  <input type="number" value={c.amount} onChange={e => { const updated = [...form.otherCosts]; updated[i] = { ...c, amount: +e.target.value }; setForm({ ...form, otherCosts: updated }) }} placeholder="Amount" className="w-28 bg-slate-800/50 border border-white/[0.06] text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-500/30" />
                  <button onClick={() => setForm({ ...form, otherCosts: form.otherCosts.filter((_, idx) => idx !== i) })} className="text-red-400 hover:text-red-300 px-2"><X size={14} /></button>
                </div>
              ))}
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
              <input type="checkbox" checked={form.zakatEnabled} onChange={e => setForm({ ...form, zakatEnabled: e.target.checked })} className="accent-emerald-500 w-4 h-4" /> Enable Zakat ({form.zakatPercent}%)
            </label>

            <div>
              <label className="text-xs text-slate-500 mb-2 block">Assign Team (Founder auto-included)</label>
              <div className="flex flex-wrap gap-2">
                {employees.map((emp: any) => (
                  <button key={emp.id} onClick={() => setForm({ ...form, teamMemberIds: form.teamMemberIds.includes(emp.id) ? form.teamMemberIds.filter(id => id !== emp.id) : [...form.teamMemberIds, emp.id] })}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${form.teamMemberIds.includes(emp.id) ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' : 'bg-white/[0.03] text-slate-400 border-white/[0.06]'}`}>
                    {emp.name}{emp.isFounder ? ' ⭐' : ''}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleCalculate} disabled={calculating || !form.totalAmount} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-sm font-semibold disabled:opacity-50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all">
              {calculating ? 'Calculating…' : 'Calculate Shares'}
            </button>

            {finance && (
              <div className="rounded-xl border bg-slate-950/50 border-white/[0.06] p-4 space-y-3">
                <h3 className="text-sm font-semibold text-white">Cost Breakdown</h3>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                  {(() => {
                    const cur = finance.currency || form.currency || 'USD'
                    const sym = cur === 'PKR' ? '₨' : cur === 'EUR' ? '€' : cur === 'GBP' ? '£' : '$'
                    return [
                      ['Total Amount', `${sym}${finance.totalAmount?.toLocaleString()}`, ''],
                      [`Fiverr Fee (${finance.fiverrFeePercent}%)`, `-${sym}${((finance.totalAmount * finance.fiverrFeePercent / 100) || 0).toLocaleString()}`, 'text-rose-400'],
                      ...(finance.zakatEnabled ? [[`Zakat (${finance.zakatPercent}%)`, `-${sym}${((finance.totalAmount * finance.zakatPercent / 100) || 0).toLocaleString()}`, 'text-amber-400']] : []),
                      ...((finance.otherCosts as any[] || []).filter((c: any) => c.amount > 0).map((c: any) => [c.name || 'Other', `-${sym}${c.amount.toLocaleString()}`, 'text-orange-400'])),
                      ['Net Amount', `${sym}${finance.netAmount?.toLocaleString()}`, 'text-emerald-400'],
                      ['Total Members', String(finance.totalMembers), ''],
                      ['Share / Person', `${sym}${finance.sharePerPerson?.toLocaleString()}`, 'text-orange-400 font-bold'],
                    ]
                  })().map(([label, value, cls], idx) => (
                    <div key={idx} className="flex justify-between col-span-1"><span className="text-slate-500">{label}</span><span className={`font-medium ${cls}`}>{value}</span></div>
                  ))}
                </div>

                {finance.shares?.length > 0 && (
                  <div className="pt-3 border-t border-white/[0.04]">
                    <h4 className="text-xs text-slate-500 mb-2">Individual Shares</h4>
                    {finance.shares.map((s: any) => (
                      <div key={s.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{s.employee?.name}</span>
                          {s.employee?.isFounder && <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">Founder</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-emerald-400">{(finance.currency || form.currency || 'USD') === 'PKR' ? '₨' : '$'}{s.shareAmount?.toLocaleString()}</span>
                          {s.paymentStatus === 'PAID'
                            ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Paid</span>
                            : <button onClick={() => setConfirmAction({ type: 'markPaid', shareId: s.id })} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors">Mark Paid</button>
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button onClick={() => setConfirmAction({ type: 'notify', notifyType: 'assignment' })} className="flex-1 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-medium border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors">Notify Team</button>
                  <button onClick={() => setConfirmAction({ type: 'notify', notifyType: 'completion' })} className="flex-1 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">Send Completion</button>
                </div>
              </div>
            )}
          </div>
        )}

        <ConfirmModal
          open={!!confirmAction}
          title={confirmAction?.type === 'markPaid' ? 'Mark as Paid' : 'Send Notification'}
          message={confirmAction?.type === 'markPaid'
            ? 'Are you sure you want to mark this share as paid?'
            : confirmAction?.notifyType === 'assignment' ? 'Notify all team members about their assignment?'
            : confirmAction?.notifyType === 'completion' ? 'Send project completion notification to all team members?'
            : 'Send share update to all team members?'}
          confirmText={confirmAction?.type === 'markPaid' ? 'Mark Paid' : 'Send'}
          variant={confirmAction?.type === 'markPaid' ? 'info' : 'info'}
          onConfirm={executeConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Member Management Modal                                                  */
/* ═══════════════════════════════════════════════════════════════════════════ */

function MemberManageModal({ project, onClose, onUpdate }: { project: Project; onClose: () => void; onUpdate: () => void }) {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ type: 'assign' | 'remove'; empId: string; empName: string; role?: string } | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({})

  const assignedIds = (project.assignments || []).map(a => a.employee.id)

  useEffect(() => { getEmployees({ limit: '100' }).then(r => setEmployees(r.data?.data || [])).catch(() => {}).finally(() => setLoading(false)) }, [])

  const handleAssign = async (empId: string, role?: string) => {
    setAssigning(empId)
    try { await assignMemberToProject(project.id, empId, role || 'Developer'); onUpdate() } catch { /* */ }
    setAssigning(null)
  }

  const handleRemove = async (empId: string) => {
    setRemoving(empId)
    try { await removeMemberFromProject(project.id, empId); onUpdate() } catch { /* */ }
    setRemoving(null)
  }

  const executeConfirm = () => {
    if (!confirmAction) return
    if (confirmAction.type === 'assign') handleAssign(confirmAction.empId, confirmAction.role)
    else handleRemove(confirmAction.empId)
    setConfirmAction(null)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border bg-slate-900 border-white/[0.06] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><Users size={18} className="text-cyan-400" /> Team — {project.title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        {/* Current Members */}
        {(project.assignments || []).length > 0 && (
          <div className="mb-5">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Assigned Members ({project.assignments!.length})</h3>
            <div className="space-y-2">
              {project.assignments!.map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center text-cyan-400 font-bold text-xs">
                      {a.employee.name[0]}
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">
                        {a.employee.name}
                        {a.employee.isFounder && <span className="text-[9px] ml-1.5 bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded-full">Founder</span>}
                      </p>
                      <p className="text-[10px] text-slate-500">{a.employee.role} · {a.employee.email}</p>
                    </div>
                  </div>
                  <button onClick={() => setConfirmAction({ type: 'remove', empId: a.employee.id, empName: a.employee.name })} disabled={removing === a.employee.id}
                    className="p-1.5 text-slate-600 hover:text-red-400 transition-colors disabled:opacity-50" title="Remove from project">
                    {removing === a.employee.id ? <span className="text-[10px]">...</span> : <UserMinus size={14} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Members */}
        <div>
          <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Available Members</h3>
          {loading ? <p className="text-xs text-slate-600">Loading...</p> : (
            <div className="space-y-2">
              {employees.filter(e => !assignedIds.includes(e.id)).length === 0 ? (
                <p className="text-xs text-slate-600 text-center py-4">All team members are already assigned</p>
              ) : employees.filter(e => !assignedIds.includes(e.id)).map(emp => (
                <div key={emp.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-white/[0.04] hover:border-cyan-500/15 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/[0.06] flex items-center justify-center text-slate-400 font-bold text-xs">
                      {(emp.name || '?')[0]}
                    </div>
                    <div>
                      <p className="text-sm text-slate-300 font-medium">
                        {emp.name}
                        {emp.isFounder && <span className="text-[9px] ml-1.5 bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded-full">Founder</span>}
                      </p>
                      <p className="text-[10px] text-slate-500">{emp.role} · {emp.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={selectedRoles[emp.id] || 'Developer'} onChange={e => setSelectedRoles(prev => ({ ...prev, [emp.id]: e.target.value }))}
                      className="text-[11px] bg-slate-800 border border-white/[0.08] rounded-lg px-2 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-500/30 cursor-pointer">
                      <option value="Developer">Developer</option>
                      <option value="Member">Member</option>
                      <option value="Designer">Designer</option>
                      <option value="Lead">Lead</option>
                      <option value="QA">QA</option>
                      <option value="PM">PM</option>
                    </select>
                    <button onClick={() => setConfirmAction({ type: 'assign', empId: emp.id, empName: emp.name, role: selectedRoles[emp.id] || 'Developer' })} disabled={assigning === emp.id}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/20 transition-colors disabled:opacity-50">
                      {assigning === emp.id ? '...' : <><UserPlus size={12} /> Assign</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <ConfirmModal
          open={!!confirmAction}
          title={confirmAction?.type === 'remove' ? 'Remove Member' : 'Assign Member'}
          message={confirmAction?.type === 'remove'
            ? `Are you sure you want to remove "${confirmAction?.empName}" from this project?`
            : `Assign "${confirmAction?.empName}" as ${confirmAction?.role || 'Developer'} to this project?`}
          confirmText={confirmAction?.type === 'remove' ? 'Remove' : 'Assign'}
          variant={confirmAction?.type === 'remove' ? 'danger' : 'info'}
          onConfirm={executeConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      </motion.div>
    </motion.div>
  )
}

function ProjectDetailModal({ project, onClose, onUpdate }: { project: Project; onClose: () => void; onUpdate: () => void }) {
  const [tab, setTab] = useState<'info' | 'tasks' | 'team'>('info')
  const [tasks, setTasks] = useState<any[]>([])
  const [loadingTasks, setLoadingTasks] = useState(true)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'MEDIUM', assigneeId: '', dueDate: '' })
  const [saving, setSaving] = useState(false)
  const [editingTask, setEditingTask] = useState<any>(null)
  const [confirmAction, setConfirmAction] = useState<{ type: 'deleteTask' | 'taskStatus'; id: string; title: string; status?: string } | null>(null)
  const [showAddMember, setShowAddMember] = useState(false)
  const [availableEmps, setAvailableEmps] = useState<any[]>([])
  const [loadingEmps, setLoadingEmps] = useState(false)
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [memberRoles, setMemberRoles] = useState<Record<string, string>>({})
  const [showNewMemberForm, setShowNewMemberForm] = useState(false)
  const [newMemberForm, setNewMemberForm] = useState({ name: '', email: '', phone: '', role: 'Developer' })
  const [savingNewMember, setSavingNewMember] = useState(false)

  const members = project.assignments || []
  const assignedIds = members.map(a => a.employee.id)

  useEffect(() => { loadTasks() }, [project.id])

  const loadAvailableEmps = async () => {
    setLoadingEmps(true)
    try { const { data } = await getEmployees({ limit: '100' }); setAvailableEmps(data?.data || []) } catch { /* */ }
    setLoadingEmps(false)
  }

  const handleAssignMember = async (empId: string) => {
    setAssigningId(empId)
    try {
      await assignMemberToProject(project.id, empId, memberRoles[empId] || 'Developer')
      onUpdate()
    } catch { /* */ }
    setAssigningId(null)
  }

  const handleCreateAndAssign = async () => {
    if (!newMemberForm.name.trim() || !newMemberForm.email.trim()) { alert('Please fill Name & Email'); return }
    setSavingNewMember(true)
    try {
      const { data } = await createEmployee({ name: newMemberForm.name, email: newMemberForm.email, phone: newMemberForm.phone || null, role: newMemberForm.role, department: 'Engineering', skills: [] })
      const empId = data?.data?.id || data?.id
      if (empId) {
        await assignMemberToProject(project.id, empId, newMemberForm.role)
        onUpdate()
        setNewMemberForm({ name: '', email: '', phone: '', role: 'Developer' })
        setShowNewMemberForm(false)
        loadAvailableEmps()
      }
    } catch (err: any) { alert(err?.response?.data?.error || 'Failed to create member') }
    setSavingNewMember(false)
  }

  async function loadTasks() {
    try { const { data } = await getProjectTasks(project.id); setTasks(data?.data || []) } catch { /* */ } finally { setLoadingTasks(false) }
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      if (editingTask) { await updateTask(editingTask.id, taskForm) }
      else { await createTask(project.id, taskForm) }
      setShowTaskForm(false); setEditingTask(null); setTaskForm({ title: '', description: '', priority: 'MEDIUM', assigneeId: '', dueDate: '' })
      await loadTasks()
    } catch { /* */ } finally { setSaving(false) }
  }

  async function handleDeleteTask(id: string) {
    try { await deleteTask(id); await loadTasks() } catch { /* */ }
  }

  async function handleTaskStatus(task: any, status: string) {
    try { await updateTask(task.id, { status }); await loadTasks() } catch { /* */ }
  }

  const executeConfirm = () => {
    if (!confirmAction) return
    if (confirmAction.type === 'deleteTask') handleDeleteTask(confirmAction.id)
    else if (confirmAction.type === 'taskStatus' && confirmAction.status) handleTaskStatus({ id: confirmAction.id }, confirmAction.status)
    setConfirmAction(null)
  }

  const statusColors: Record<string, string> = { TODO: 'text-slate-400 bg-slate-500/10', IN_PROGRESS: 'text-cyan-400 bg-cyan-500/10', IN_REVIEW: 'text-amber-400 bg-amber-500/10', DONE: 'text-emerald-400 bg-emerald-500/10' }
  const priorityColors: Record<string, string> = { LOW: 'text-slate-400', MEDIUM: 'text-cyan-400', HIGH: 'text-amber-400', URGENT: 'text-red-400' }

  const sc = statusConfig[project.status] || statusConfig.DRAFT

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-slate-900 border border-white/[0.06] rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.06]">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-white">{project.title}</h2>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color}`}>{sc.label}</span>
              </div>
              <p className="text-sm text-slate-400">{project.category?.replace(/_/g, ' ')}{project.durationWeeks ? ` • ${project.durationWeeks} weeks` : ''}{(() => { const dl = getDeadlineInfo(project.deadline); return dl ? '' : '' })()}</p>
              {(() => { const dl = getDeadlineInfo(project.deadline); return dl ? <div className="mt-1.5 flex items-center gap-2"><span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${dl.color}`}>⏰ {dl.label}</span>{project.deadline && <span className="text-xs text-slate-500">Due: {new Date(project.deadline).toLocaleDateString()}</span>}</div> : null })()}
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18} /></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.06] px-5">
          {([
            { key: 'info', label: 'Info', icon: FolderKanban },
            { key: 'tasks', label: `Tasks (${tasks.length})`, icon: ListTodo },
            { key: 'team', label: `Team (${members.length})`, icon: Users },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'text-cyan-400 border-cyan-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>
              <t.icon size={14} />{t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'info' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-300">{project.shortDescription}</p>
              {project.techStack?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">Tech Stack</p>
                  <div className="flex flex-wrap gap-1.5">{project.techStack.map(t => <span key={t} className="text-xs px-2.5 py-1 bg-violet-500/10 text-violet-400 rounded-full border border-violet-500/20">{t}</span>)}</div>
                </div>
              )}
              {project.tags?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1.5">{project.tags.map(t => <span key={t} className="text-xs px-2.5 py-1 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20">{t}</span>)}</div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-800/30 rounded-xl p-3"><span className="text-slate-500">Created:</span> <span className="text-white">{new Date(project.createdAt).toLocaleDateString()}</span></div>
                {project.durationWeeks && <div className="bg-slate-800/30 rounded-xl p-3"><span className="text-slate-500">Duration:</span> <span className="text-white">{project.durationWeeks} weeks</span></div>}
                {project.deadline && <div className="bg-slate-800/30 rounded-xl p-3"><span className="text-slate-500">Deadline:</span> <span className="text-white">{new Date(project.deadline).toLocaleDateString()}</span></div>}
                {(() => { const dl = getDeadlineInfo(project.deadline); return dl ? <div className={`rounded-xl p-3 border ${dl.color}`}><span className="text-slate-500">Time Left:</span> <span className="font-semibold"> {dl.label}</span></div> : null })()}
              </div>
            </div>
          )}

          {tab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-400">{tasks.filter(t => t.status === 'DONE').length}/{tasks.length} completed</p>
                <button onClick={() => { setEditingTask(null); setTaskForm({ title: '', description: '', priority: 'MEDIUM', assigneeId: '', dueDate: '' }); setShowTaskForm(true) }} className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg text-xs font-medium hover:bg-cyan-500/20">
                  <Plus size={12} /> New Task
                </button>
              </div>

              {/* Task Form */}
              <AnimatePresence>
                {showTaskForm && (
                  <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden" onSubmit={handleCreateTask}>
                    <div className="bg-slate-800/30 border border-white/[0.06] rounded-xl p-4 space-y-3">
                      <input required value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Task title" className="w-full bg-slate-900/50 border border-white/[0.06] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500/30" />
                      <textarea value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="Description (optional)" rows={2} className="w-full bg-slate-900/50 border border-white/[0.06] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500/30 resize-none" />
                      <div className="grid grid-cols-3 gap-3">
                        <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })} className="bg-slate-900/50 border border-white/[0.06] text-white rounded-lg px-3 py-2 text-sm focus:outline-none">
                          <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option>
                        </select>
                        <select value={taskForm.assigneeId} onChange={e => setTaskForm({ ...taskForm, assigneeId: e.target.value })} className="bg-slate-900/50 border border-white/[0.06] text-white rounded-lg px-3 py-2 text-sm focus:outline-none">
                          <option value="">Assign to...</option>
                          {members.map(a => <option key={a.employee.id} value={a.employee.id}>{a.employee.name}</option>)}
                        </select>
                        <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} className="bg-slate-900/50 border border-white/[0.06] text-white rounded-lg px-3 py-2 text-sm focus:outline-none" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => { setShowTaskForm(false); setEditingTask(null) }} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white">Cancel</button>
                        <button type="submit" disabled={saving} className="px-4 py-1.5 bg-cyan-500 text-white rounded-lg text-xs font-medium disabled:opacity-50">{saving ? 'Saving...' : editingTask ? 'Update' : 'Create Task'}</button>
                      </div>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Tasks List */}
              {loadingTasks ? <div className="text-center py-8"><div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" /></div> : tasks.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No tasks yet. Create one to get started.</p>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task: any) => (
                    <div key={task.id} className="bg-slate-800/30 border border-white/[0.06] rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-white">{task.title}</h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[task.status]} border border-white/[0.06]`}>{task.status?.replace('_', ' ')}</span>
                            <span className={`text-[10px] ${priorityColors[task.priority]}`}>{task.priority}</span>
                          </div>
                          {task.description && <p className="text-xs text-slate-400">{task.description}</p>}
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setEditingTask(task); setTaskForm({ title: task.title, description: task.description || '', priority: task.priority, assigneeId: task.assigneeId || '', dueDate: task.dueDate ? task.dueDate.split('T')[0] : '' }); setShowTaskForm(true) }} className="p-1 text-slate-500 hover:text-cyan-400"><ListTodo size={12} /></button>
                          <button onClick={() => setConfirmAction({ type: 'deleteTask', id: task.id, title: task.title })} className="p-1 text-slate-500 hover:text-red-400"><Trash2 size={12} /></button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[10px] text-slate-500">
                          {task.assignee && <span>👤 {task.assignee.name}</span>}
                          {task.dueDate && <span className="flex items-center gap-0.5"><CalendarDays size={10} />{new Date(task.dueDate).toLocaleDateString()}</span>}
                        </div>
                        <div className="flex gap-1">
                          {['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].filter(s => s !== task.status).map(s => (
                            <button key={s} onClick={() => setConfirmAction({ type: 'taskStatus', id: task.id, title: task.title, status: s })} className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.03] text-slate-500 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white">
                              {s.replace('_', ' ')}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'team' && (
            <div className="space-y-4">
              {/* Existing Members */}
              <div className="space-y-3">
                {members.length === 0 ? <p className="text-sm text-slate-500 text-center py-4">No team members assigned</p> : members.map(a => (
                  <div key={a.id} className="flex items-center justify-between bg-slate-800/30 border border-white/[0.06] rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center font-bold text-sm ${a.employee.isFounder ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400' : 'bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-cyan-400'}`}>{a.employee.name[0]}</div>
                      <div>
                        <p className="text-sm font-medium text-white">{a.employee.name}{a.employee.isFounder && <span className="ml-1.5 text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-500/20">Founder</span>}</p>
                        <p className="text-xs text-slate-500">{a.employee.role} &bull; {a.employee.department}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <p className="text-slate-400">{a.roleInProject || 'Member'}</p>
                      <p className="text-slate-500">{a.employee.email}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Member Button / Section */}
              <div className="border-t border-white/[0.06] pt-4">
                {!showAddMember ? (
                  <div className="flex gap-2">
                    <button onClick={() => { setShowAddMember(true); loadAvailableEmps() }} className="flex items-center gap-2 px-4 py-2.5 text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-xl hover:bg-cyan-500/20 transition-colors flex-1 justify-center">
                      <UserPlus size={14} /> Add Existing Member
                    </button>
                    <button onClick={() => { setShowNewMemberForm(true); setShowAddMember(false) }} className="flex items-center gap-2 px-4 py-2.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-colors flex-1 justify-center">
                      <Plus size={14} /> Add New Member
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Available Members</h4>
                      <button onClick={() => setShowAddMember(false)} className="text-slate-500 hover:text-white transition-colors"><X size={14} /></button>
                    </div>
                    {loadingEmps ? <p className="text-xs text-slate-600 text-center py-4">Loading...</p> : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {availableEmps.filter(e => !assignedIds.includes(e.id)).length === 0 ? (
                          <p className="text-xs text-slate-600 text-center py-4">All team members are already assigned</p>
                        ) : availableEmps.filter(e => !assignedIds.includes(e.id)).map(emp => (
                          <div key={emp.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-white/[0.04] hover:border-cyan-500/15 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/[0.06] flex items-center justify-center text-slate-400 font-bold text-xs">{(emp.name || '?')[0]}</div>
                              <div>
                                <p className="text-sm text-slate-300 font-medium">{emp.name}{emp.isFounder && <span className="text-[9px] ml-1.5 bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded-full">Founder</span>}</p>
                                <p className="text-[10px] text-slate-500">{emp.role} · {emp.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <select value={memberRoles[emp.id] || 'Developer'} onChange={e => setMemberRoles(prev => ({ ...prev, [emp.id]: e.target.value }))}
                                className="text-[11px] bg-slate-800 border border-white/[0.08] rounded-lg px-2 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-500/30">
                                <option value="Developer">Developer</option><option value="AI Engineer">AI Engineer</option><option value="Team Lead">Team Lead</option>
                                <option value="Designer">Designer</option><option value="QA">QA</option><option value="PM">PM</option>
                                <option value="DevOps">DevOps</option><option value="Full Stack">Full Stack</option><option value="Backend">Backend</option><option value="Frontend">Frontend</option>
                              </select>
                              <button onClick={() => handleAssignMember(emp.id)} disabled={assigningId === emp.id}
                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/20 transition-colors disabled:opacity-50">
                                {assigningId === emp.id ? '...' : <><UserPlus size={12} /> Add</>}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* New Member Form */}
              <AnimatePresence>
                {showNewMemberForm && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="bg-emerald-500/[0.03] border border-emerald-500/15 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Create & Assign New Member</h4>
                        <button onClick={() => setShowNewMemberForm(false)} className="text-slate-500 hover:text-white transition-colors"><X size={14} /></button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input value={newMemberForm.name} onChange={e => setNewMemberForm(p => ({ ...p, name: e.target.value }))} placeholder="Full Name *" className="bg-slate-900/50 border border-white/[0.08] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/30 placeholder:text-slate-600" />
                        <input value={newMemberForm.email} onChange={e => setNewMemberForm(p => ({ ...p, email: e.target.value }))} placeholder="Email *" type="email" className="bg-slate-900/50 border border-white/[0.08] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/30 placeholder:text-slate-600" />
                        <input value={newMemberForm.phone} onChange={e => setNewMemberForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone (optional)" className="bg-slate-900/50 border border-white/[0.08] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/30 placeholder:text-slate-600" />
                        <select value={newMemberForm.role} onChange={e => setNewMemberForm(p => ({ ...p, role: e.target.value }))} className="bg-slate-900/50 border border-white/[0.08] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/30">
                          <option value="Developer">Developer</option><option value="AI Engineer">AI Engineer</option><option value="Team Lead">Team Lead</option>
                          <option value="Designer">Designer</option><option value="QA">QA</option><option value="PM">PM</option>
                          <option value="DevOps">DevOps</option><option value="Full Stack">Full Stack</option><option value="Backend">Backend</option><option value="Frontend">Frontend</option>
                        </select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setShowNewMemberForm(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white">Cancel</button>
                        <button onClick={handleCreateAndAssign} disabled={savingNewMember} className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50">
                          {savingNewMember ? 'Creating...' : <><Check size={12} /> Create & Assign</>}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <ConfirmModal
          open={!!confirmAction}
          title={confirmAction?.type === 'deleteTask' ? 'Delete Task' : 'Change Task Status'}
          message={confirmAction?.type === 'deleteTask'
            ? `Are you sure you want to delete task "${confirmAction?.title}"?`
            : `Change task "${confirmAction?.title}" status to ${confirmAction?.status?.replace('_', ' ')}?`}
          confirmText={confirmAction?.type === 'deleteTask' ? 'Delete' : 'Change'}
          variant={confirmAction?.type === 'deleteTask' ? 'danger' : 'info'}
          onConfirm={executeConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Projects Board (Main)                                                    */
/* ═══════════════════════════════════════════════════════════════════════════ */

export default function ProjectsBoard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ProjectStatus | 'All'>('All')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [memberProject, setMemberProject] = useState<Project | null>(null)
  const [detailProject, setDetailProject] = useState<Project | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ type: 'delete' | 'status'; id: string; title: string; status?: ProjectStatus } | null>(null)

  const fetchProjects = useCallback(async () => {
    try {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const res = await fetch(`${base}/api/projects?limit=100`)
      const data = await res.json()
      setProjects(data.data?.projects || data.data || [])
    } catch { /* */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchProjects() }, [fetchProjects])
  useDashboardSocket(() => fetchProjects())

  const handleDelete = async (id: string) => {
    try {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const token = localStorage.getItem('admin_token')
      await fetch(`${base}/api/admin/projects/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      fetchProjects()
    } catch { /* */ }
  }

  const handleStatusChange = async (id: string, status: ProjectStatus) => {
    try {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const token = localStorage.getItem('admin_token')
      await fetch(`${base}/api/admin/projects/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      })
      fetchProjects()
    } catch { /* */ }
  }

  const executeConfirm = () => {
    if (!confirmAction) return
    if (confirmAction.type === 'delete') handleDelete(confirmAction.id)
    else if (confirmAction.type === 'status' && confirmAction.status) handleStatusChange(confirmAction.id, confirmAction.status)
    setConfirmAction(null)
  }

  const filtered = projects.filter(p => {
    const matchSearch = (p.title || '').toLowerCase().includes(search.toLowerCase()) || (p.category || '').toLowerCase().includes(search.toLowerCase()) || (p.shortDescription || '').toLowerCase().includes(search.toLowerCase())
    return (filter === 'All' || p.status === filter) && matchSearch
  })

  const counts = { total: projects.length, active: projects.filter(p => p.status === 'ACTIVE').length, completed: projects.filter(p => p.status === 'COMPLETED').length, draft: projects.filter(p => p.status === 'DRAFT').length }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><FolderKanban className="w-7 h-7 text-cyan-400" /> Projects</h1>
          <p className="text-slate-400 text-sm mt-1">Manage projects, assign teams & divide costs</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: counts.total, color: 'cyan' },
          { label: 'Active', value: counts.active, color: 'violet' },
          { label: 'Completed', value: counts.completed, color: 'emerald' },
          { label: 'Drafts', value: counts.draft, color: 'slate' },
        ].map(s => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/50 border border-white/[0.06] rounded-2xl p-4">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold text-${s.color}-400`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects…" className="w-full bg-slate-900/50 border border-white/[0.06] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 placeholder-slate-500 focus:outline-none focus:border-cyan-500/30" />
        </div>
        <div className="flex flex-wrap gap-2">
          {(['All', ...ALL_STATUSES] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${filter === s ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.06]'}`}>
              {s === 'All' ? 'All' : statusConfig[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="rounded-2xl border bg-slate-900/50 border-white/[0.06] p-5 animate-pulse"><div className="h-4 rounded w-3/4 mb-3 bg-white/[0.06]" /><div className="h-3 rounded w-1/2 bg-white/[0.04]" /></div>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500"><FolderKanban className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No projects found</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project, i) => {
            const sc = statusConfig[project.status] || statusConfig.DRAFT
            const StatusIcon = sc.icon
            return (
              <motion.div key={project.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -3 }}
                className="rounded-2xl backdrop-blur-sm border bg-slate-900/50 border-white/[0.06] hover:border-cyan-500/20 p-5 transition-all group cursor-pointer" onClick={() => setDetailProject(project)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-white truncate group-hover:text-cyan-400 transition-colors">{project.title}</h3>
                    <p className="text-slate-500 text-xs mt-0.5">{(project.category || '').replace(/_/g, ' ')}</p>
                  </div>
                  <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${sc.bg} ${sc.color}`}>
                    <StatusIcon size={10} />{sc.label}
                  </span>
                </div>

                <p className="text-xs mb-3 text-slate-400 line-clamp-2">{project.shortDescription}</p>

                {project.techStack?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.techStack.slice(0, 4).map(t => <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">{t}</span>)}
                    {project.techStack.length > 4 && <span className="text-[9px] text-slate-500">+{project.techStack.length - 4}</span>}
                  </div>
                )}

                {/* Status Quick Change */}
                <div className="flex items-center gap-1.5 mb-3">
                  {ALL_STATUSES.filter(s => s !== project.status).map(s => (
                    <button key={s} onClick={(e) => { e.stopPropagation(); setConfirmAction({ type: 'status', id: project.id, title: project.title, status: s }) }} className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.03] text-slate-500 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white transition-all">
                      → {statusConfig[s].label}
                    </button>
                  ))}
                </div>

                {/* Team Members */}
                {project.assignments && project.assignments.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex -space-x-2">
                      {project.assignments.slice(0, 5).map(a => (
                        <div key={a.id} title={`${a.employee.name} (${a.employee.role})`}
                          className={`w-7 h-7 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold ${a.employee.isFounder ? 'bg-gradient-to-br from-amber-500/30 to-orange-500/30 text-amber-400' : 'bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-cyan-400'}`}>
                          {a.employee.name[0]}
                        </div>
                      ))}
                      {project.assignments.length > 5 && (
                        <div className="w-7 h-7 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[9px] text-slate-400">+{project.assignments.length - 5}</div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500">{project.assignments.length} member{project.assignments.length !== 1 ? 's' : ''}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    {project.durationWeeks && <div className="flex items-center gap-1 text-xs text-slate-500"><Clock size={11} />{project.durationWeeks}w</div>}
                    {(() => { const dl = getDeadlineInfo(project.deadline); return dl ? <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${dl.color}`}>{dl.label}</span> : null })()}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={(e) => { e.stopPropagation(); setMemberProject(project) }} className="flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300 px-2 py-1 rounded-lg hover:bg-violet-500/10 transition-all">
                      <Users size={11} /> Members
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setSelectedProject(project) }} className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded-lg hover:bg-cyan-500/10 transition-all">
                      <DollarSign size={11} /> Shares
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setConfirmAction({ type: 'delete', id: project.id, title: project.title }) }} className="p-1.5 text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {selectedProject && <CostSharingModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {detailProject && <ProjectDetailModal project={detailProject} onClose={() => setDetailProject(null)} onUpdate={fetchProjects} />}
      </AnimatePresence>

      <AnimatePresence>
        {memberProject && <MemberManageModal project={memberProject} onClose={() => setMemberProject(null)} onUpdate={async () => {
          await fetchProjects()
          // Re-fetch updated project with assignments
          const base = import.meta.env.VITE_API_URL || 'http://localhost:5000'
          try {
            const res = await fetch(`${base}/api/projects/${memberProject.id}`)
            const data = await res.json()
            if (data.data) setMemberProject(data.data)
          } catch { /* */ }
        }} />}
      </AnimatePresence>

      {confirmAction && (
        <ConfirmModal
          open={!!confirmAction}
          title={confirmAction?.type === 'delete' ? 'Delete Project' : 'Change Status'}
          message={confirmAction?.type === 'delete'
            ? `Are you sure you want to permanently delete "${confirmAction?.title}"? This action cannot be undone.`
            : `Change "${confirmAction?.title}" status to ${statusConfig[confirmAction?.status!]?.label || confirmAction?.status}?`}
          confirmText={confirmAction?.type === 'delete' ? 'Delete' : 'Change Status'}
          variant={confirmAction?.type === 'delete' ? 'danger' : 'info'}
          onConfirm={executeConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  )
}
