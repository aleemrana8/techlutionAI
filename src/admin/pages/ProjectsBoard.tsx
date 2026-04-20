import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Clock, CheckCircle2, AlertCircle, Circle, X, DollarSign } from 'lucide-react'
import { getProjectFinance, calculateProjectSharing, notifyProjectTeam, markSharePaid } from '../../api/adminApi'
import AdminAPI from '../../api/adminApi'
import { useDashboardSocket } from '../hooks/useSocket'
import { useTheme } from '../context/ThemeContext'

type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'

interface Project {
  id: string
  title: string
  slug: string
  shortDescription: string
  category: string
  status: ProjectStatus
  tags: string[]
  techStack: string[]
  durationWeeks: number | null
  createdAt: string
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
  const { isDark } = useTheme()
  const [finance, setFinance] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    totalAmount: '',
    fiverrFeePercent: '20',
    zakatEnabled: false,
    zakatPercent: '2.5',
    otherCosts: [] as { name: string; amount: number }[],
    teamMemberIds: [] as string[],
  })
  const [employees, setEmployees] = useState<any[]>([])
  const [calculating, setCalculating] = useState(false)

  useEffect(() => { loadData() }, [project.id])

  async function loadData() {
    try {
      const [finRes, empRes] = await Promise.all([
        getProjectFinance(project.id).catch(() => null),
        AdminAPI.get('/employees?limit=100'),
      ])
      if (finRes?.data?.data) {
        const f = finRes.data.data
        setFinance(f)
        setForm({
          totalAmount: f.totalAmount.toString(),
          fiverrFeePercent: f.fiverrFeePercent.toString(),
          zakatEnabled: f.zakatEnabled,
          zakatPercent: f.zakatPercent.toString(),
          otherCosts: (f.otherCosts as any[]) || [],
          teamMemberIds: f.shares?.map((s: any) => s.employeeId) || [],
        })
      }
      setEmployees(empRes.data?.data || [])
    } catch { /* ignore */ }
    setLoading(false)
  }

  async function handleCalculate() {
    setCalculating(true)
    try {
      const res = await calculateProjectSharing({
        projectRef: project.id,
        totalAmount: form.totalAmount,
        fiverrFeePercent: form.fiverrFeePercent,
        zakatEnabled: form.zakatEnabled,
        zakatPercent: form.zakatPercent,
        otherCosts: form.otherCosts,
        founderIncluded: true,
        teamMemberIds: form.teamMemberIds,
      })
      setFinance(res.data?.data?.projectFinance)
      await loadData()
    } catch { /* ignore */ }
    setCalculating(false)
  }

  async function handleNotify(type: 'assignment' | 'update' | 'completion') {
    await notifyProjectTeam({ projectRef: project.id, projectTitle: project.title, type })
  }

  async function handleMarkPaid(shareId: string) {
    await markSharePaid(shareId)
    await loadData()
  }

  const card = isDark ? 'bg-slate-900/95 border-white/[0.06] text-white' : 'bg-white border-slate-200 text-slate-900'
  const inp  = isDark ? 'bg-white/[0.04] border-white/[0.06] text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className={`w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border ${card} p-6 shadow-2xl`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold flex items-center gap-2"><DollarSign size={18} className="text-emerald-400" /> Cost Sharing — {project.title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors"><X size={18} /></button>
        </div>

        {loading ? <div className="text-center py-10 text-slate-500">Loading...</div> : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Total Amount ($)</label>
                <input type="number" value={form.totalAmount} onChange={e => setForm({ ...form, totalAmount: e.target.value })} className={`w-full ${inp} border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500/40`} placeholder="5000" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Fiverr Fee (%)</label>
                <input type="number" value={form.fiverrFeePercent} onChange={e => setForm({ ...form, fiverrFeePercent: e.target.value })} className={`w-full ${inp} border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500/40`} />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.zakatEnabled} onChange={e => setForm({ ...form, zakatEnabled: e.target.checked })} className="accent-emerald-500 w-4 h-4" />
              Enable Zakat ({form.zakatPercent}%)
            </label>

            {/* Team Selection */}
            <div>
              <label className="text-xs text-slate-500 mb-2 block">Assign Team (Founder auto-included)</label>
              <div className="flex flex-wrap gap-2">
                {employees.map((emp: any) => (
                  <button
                    key={emp.id}
                    onClick={() => setForm({
                      ...form,
                      teamMemberIds: form.teamMemberIds.includes(emp.id)
                        ? form.teamMemberIds.filter(id => id !== emp.id)
                        : [...form.teamMemberIds, emp.id],
                    })}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      form.teamMemberIds.includes(emp.id)
                        ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                        : isDark ? 'bg-white/[0.03] text-slate-400 border-white/[0.06]' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {emp.name}{emp.isFounder ? ' ⭐' : ''}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleCalculate} disabled={calculating || !form.totalAmount} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-sm font-semibold shadow-lg disabled:opacity-50 hover:shadow-cyan-500/20 transition-all">
              {calculating ? 'Calculating…' : 'Calculate Shares'}
            </button>

            {/* ── Breakdown ────────────────────────────────────────── */}
            {finance && (
              <div className={`rounded-xl border p-4 space-y-3 ${isDark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
                <h3 className="text-sm font-semibold">Cost Breakdown</h3>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                  {[
                    ['Total Amount', `$${finance.totalAmount?.toLocaleString()}`, ''],
                    [`Fiverr Fee (${finance.fiverrFeePercent}%)`, `-$${((finance.totalAmount * finance.fiverrFeePercent / 100) || 0).toLocaleString()}`, 'text-rose-400'],
                    ...(finance.zakatEnabled ? [[`Zakat (${finance.zakatPercent}%)`, `-$${((finance.totalAmount * finance.zakatPercent / 100) || 0).toLocaleString()}`, 'text-amber-400']] : []),
                    ['Net Amount', `$${finance.netAmount?.toLocaleString()}`, 'text-emerald-400'],
                    ['Total Members', String(finance.totalMembers), ''],
                    ['Share / Person', `$${finance.sharePerPerson?.toLocaleString()}`, 'text-orange-400 font-bold'],
                  ].map(([label, value, cls], idx) => (
                    <div key={idx} className="flex justify-between col-span-1">
                      <span className="text-slate-500">{label}</span>
                      <span className={`font-medium ${cls}`}>{value}</span>
                    </div>
                  ))}
                </div>

                {/* Individual Shares */}
                {finance.shares?.length > 0 && (
                  <div className="pt-3 border-t border-white/[0.04] dark:border-white/[0.04] border-slate-100">
                    <h4 className="text-xs text-slate-500 mb-2">Individual Shares</h4>
                    {finance.shares.map((s: any) => (
                      <div key={s.id} className={`flex items-center justify-between py-2 border-b last:border-0 ${isDark ? 'border-white/[0.04]' : 'border-slate-100'}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{s.employee?.name}</span>
                          {s.employee?.isFounder && <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">Founder</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-emerald-400">${s.shareAmount?.toLocaleString()}</span>
                          {s.paymentStatus === 'PAID'
                            ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Paid</span>
                            : <button onClick={() => handleMarkPaid(s.id)} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors">Mark Paid</button>
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button onClick={() => handleNotify('assignment')} className="flex-1 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-medium border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors">Notify Team</button>
                  <button onClick={() => handleNotify('completion')} className="flex-1 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">Send Completion</button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Projects Board (Main)                                                    */
/* ═══════════════════════════════════════════════════════════════════════════ */

export default function ProjectsBoard() {
  const { isDark } = useTheme()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ProjectStatus | 'All'>('All')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const fetchProjects = useCallback(async () => {
    try {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const res = await fetch(`${base}/api/projects?limit=100`)
      const data = await res.json()
      setProjects(data.data?.projects || data.data || [])
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchProjects() }, [fetchProjects])
  useDashboardSocket(() => fetchProjects())

  const filtered = projects.filter(p => {
    const matchSearch = (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.shortDescription || '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || p.status === filter
    return matchSearch && matchFilter
  })

  const cardBg = isDark ? 'bg-slate-900/60 border-white/[0.06] hover:border-cyan-500/20' : 'bg-white border-slate-200 hover:border-cyan-500/30 shadow-sm'
  const inp = isDark ? 'bg-white/[0.04] border-white/[0.06] text-white placeholder-slate-600' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Project Management</h1>
          <p className="text-slate-400 text-sm mt-1">Track projects and manage cost sharing</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects…"
            className={`w-full ${inp} border text-sm rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-cyan-500/30 transition-all`} />
        </div>
        <div className="flex flex-wrap gap-2">
          {(['All', ...ALL_STATUSES] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                filter === s ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                  : isDark ? 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.06]' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
              }`}>
              {s === 'All' ? 'All' : statusConfig[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className={`rounded-xl border p-5 animate-pulse ${isDark ? 'bg-slate-900/60 border-white/[0.06]' : 'bg-white border-slate-200'}`}>
              <div className={`h-4 rounded w-3/4 mb-3 ${isDark ? 'bg-white/[0.06]' : 'bg-slate-100'}`} />
              <div className={`h-3 rounded w-1/2 mb-4 ${isDark ? 'bg-white/[0.04]' : 'bg-slate-50'}`} />
              <div className={`h-3 rounded w-full ${isDark ? 'bg-white/[0.04]' : 'bg-slate-50'}`} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16"><p className="text-slate-500">No projects found</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project, i) => {
            const sc = statusConfig[project.status] || statusConfig.DRAFT
            const StatusIcon = sc.icon
            return (
              <motion.div key={project.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -3 }}
                className={`rounded-xl backdrop-blur-sm border p-5 transition-all group cursor-pointer ${cardBg}`}
                onClick={() => setSelectedProject(project)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-sm truncate group-hover:text-cyan-400 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>{project.title}</h3>
                    <p className="text-slate-500 text-xs mt-0.5">{(project.category || '').replace(/_/g, ' ')}</p>
                  </div>
                  <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${sc.bg} ${sc.color}`}>
                    <StatusIcon size={10} />{sc.label}
                  </span>
                </div>

                <p className={`text-xs mb-3 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{project.shortDescription}</p>

                {project.techStack?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.techStack.slice(0, 4).map(t => (
                      <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">{t}</span>
                    ))}
                    {project.techStack.length > 4 && <span className="text-[9px] text-slate-500">+{project.techStack.length - 4}</span>}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs">
                  {project.durationWeeks && (
                    <div className="flex items-center gap-1 text-slate-500"><Clock size={11} /><span>{project.durationWeeks}w</span></div>
                  )}
                  <button onClick={e => { e.stopPropagation(); setSelectedProject(project) }}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-[11px] ml-auto">
                    <DollarSign size={11} /> Cost Sharing
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {selectedProject && <CostSharingModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
      </AnimatePresence>
    </div>
  )
}
