import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, TrendingUp, TrendingDown, CreditCard, FileText, ArrowUpRight, ArrowDownRight, X, FolderKanban, Users, Clock } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { getFinanceSummary, getFinanceRecords, updateFinanceRecord, getProjectFinance, getEmployees, getEmployeeAssignments } from '../../api/adminApi'
import { useDashboardSocket } from '../hooks/useSocket'

const pieColors = ['#06b6d4', '#8b5cf6', '#f97316', '#10b981', '#64748b', '#f43f5e']

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

const statusColors: Record<string, string> = {
  Paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Pending: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Overdue: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  INCOME: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  EXPENSE: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
}

export default function FinanceDashboard() {
  const [summary, setSummary] = useState<any>(null)
  const [records, setRecords] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [selectedProjectFinance, setSelectedProjectFinance] = useState<any>(null)
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [memberAssignments, setMemberAssignments] = useState<any[]>([])
  const [loadingMember, setLoadingMember] = useState(false)

  const fetchData = useCallback(() => {
    Promise.all([
      getFinanceSummary().then(r => setSummary(r.data.data)),
      getFinanceRecords().then(r => setRecords(r.data.data || [])),
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/projects?limit=100`).then(r => r.json()).then(d => setProjects(d.data?.projects || d.data || [])),
      getEmployees({ limit: '100' }).then(r => setEmployees(r.data?.data || [])),
    ]).catch(err => console.error('Failed to load finance data:', err))
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  useDashboardSocket((event) => {
    if (event === 'finance:new' || event === 'finance:update') fetchData()
  })

  const totalIncome = summary?.totalIncome ?? 0
  const totalExpenses = summary?.totalExpenses ?? 0
  const profit = summary?.profit ?? 0
  const pendingIncome = summary?.pendingIncome ?? 0

  const kpis = [
    { label: 'Received Income', value: `$${totalIncome.toLocaleString()}`, change: '', up: true, icon: DollarSign, color: 'cyan' },
    { label: 'Pending Income', value: `$${pendingIncome.toLocaleString()}`, change: '', up: false, icon: Clock, color: 'amber' },
    { label: 'Total Expenses', value: `$${totalExpenses.toLocaleString()}`, change: '', up: true, icon: TrendingDown, color: 'rose' },
    { label: 'Net Profit', value: `$${profit.toLocaleString()}`, change: '', up: profit >= 0, icon: TrendingUp, color: 'emerald' },
  ]

  // Group by category for pie chart
  const categoryMap = records.reduce((acc: Record<string, number>, r: any) => {
    const cat = r.category || 'Other'
    acc[cat] = (acc[cat] || 0) + Number(r.amount || 0)
    return acc
  }, {} as Record<string, number>)
  const pieData = Object.entries(categoryMap).map(([name, value], i) => ({ name, value, color: pieColors[i % pieColors.length] }))

  // Build chart data from records grouped by month
  const monthMap = records.reduce((acc: Record<string, { revenue: number; expenses: number }>, r: any) => {
    const d = new Date(r.date || r.createdAt)
    const key = d.toLocaleString('default', { month: 'short' })
    if (!acc[key]) acc[key] = { revenue: 0, expenses: 0 }
    if (r.type === 'INCOME') acc[key].revenue += Number(r.amount || 0)
    else acc[key].expenses += Number(r.amount || 0)
    return acc
  }, {} as Record<string, { revenue: number; expenses: number }>)
  const revenueData = Object.entries(monthMap).map(([month, vals]) => ({ month, ...vals }))
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Finance Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Revenue, expenses, and financial performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-${kpi.color}-500/15 border border-white/[0.06] flex items-center justify-center`}>
                <kpi.icon size={18} className={`text-${kpi.color}-400`} />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${kpi.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                {kpi.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {kpi.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{kpi.value}</p>
            <p className="text-xs text-slate-500 mt-1">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue vs Expenses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] p-5"
        >
          <h3 className="text-white font-semibold text-sm mb-4">Revenue vs Expenses</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" stroke="#475569" fontSize={12} />
              <YAxis stroke="#475569" fontSize={12} tickFormatter={v => '$' + v / 1000 + 'k'} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: 12 }} formatter={(v: any) => ['$' + Number(v || 0).toLocaleString()]} />
              <Area type="monotone" dataKey="revenue" stroke="#06b6d4" fill="url(#colorRev)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" stroke="#f43f5e" fill="url(#colorExp)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue by Service */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] p-5"
        >
          <h3 className="text-white font-semibold text-sm mb-4">Revenue by Service</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: 12 }} formatter={(v: any) => [v + '%']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-slate-400">{d.name}</span>
                </div>
                <span className="text-white font-medium">{d.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Invoice Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] overflow-hidden"
      >
        <div className="p-4 border-b border-white/[0.06] flex items-center gap-2">
          <FileText size={16} className="text-slate-400" />
          <h3 className="text-white font-semibold text-sm">Recent Invoices</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['#', 'Description', 'Category', 'Amount', 'Type', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.slice(0, 10).map((rec: any, i: number) => (
                <motion.tr
                  key={rec.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + i * 0.03 }}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3 text-slate-500 text-xs">{rec.id}</td>
                  <td className="px-4 py-3 text-white">{rec.description || '-'}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{rec.category || '-'}</td>
                  <td className="px-4 py-3 text-white font-semibold">${Number(rec.amount || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border ${statusColors[rec.type] || ''}`}>
                      {rec.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={async () => { try { await updateFinanceRecord(rec.id, { received: !rec.received }); fetchData() } catch {} }} className="cursor-pointer transition-all hover:scale-105">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${rec.received === false ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                        {rec.received === false ? 'Pending' : 'Received'}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{rec.date ? new Date(rec.date).toLocaleDateString() : '-'}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Project Finance Breakdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] overflow-hidden">
        <div className="p-4 border-b border-white/[0.06] flex items-center gap-2">
          <FolderKanban size={16} className="text-cyan-400" />
          <h3 className="text-white font-semibold text-sm">Project Finance</h3>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {projects.length === 0 ? <p className="text-sm text-slate-500 text-center py-6">No projects</p> : projects.map((p: any) => (
            <div key={p.id} onClick={async () => {
              try { const { data } = await getProjectFinance(p.id); setSelectedProjectFinance({ ...data?.data, projectTitle: p.title }) } catch { setSelectedProjectFinance({ projectTitle: p.title, notFound: true }) }
            }} className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] cursor-pointer transition-colors">
              <div>
                <p className="text-sm text-white font-medium">{p.title}</p>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] text-slate-500">{(p.category || '').replace(/_/g, ' ')} &bull; {p.status}</p>
                  {(() => { const dl = getDeadlineInfo(p.deadline); return dl ? <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${dl.color}`}>{dl.label}</span> : null })()}
                </div>
              </div>
              <div className="text-right flex items-center gap-2">
                {p.deadline && <span className="text-[10px] text-slate-500">{new Date(p.deadline).toLocaleDateString()}</span>}
                <span className="text-xs text-slate-400">{p.status === 'COMPLETED' ? '✅' : p.status === 'ACTIVE' ? '🔄' : '📋'}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Member Earnings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] overflow-hidden">
        <div className="p-4 border-b border-white/[0.06] flex items-center gap-2">
          <Users size={16} className="text-violet-400" />
          <h3 className="text-white font-semibold text-sm">Member Earnings</h3>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {employees.length === 0 ? <p className="text-sm text-slate-500 text-center py-6">No members</p> : employees.map((m: any) => (
            <div key={m.id} onClick={async () => {
              setSelectedMember(m); setLoadingMember(true)
              try { const { data } = await getEmployeeAssignments(m.id); setMemberAssignments(data?.data || []) } catch { setMemberAssignments([]) }
              setLoadingMember(false)
            }} className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center text-cyan-400 font-bold text-xs">{(m.name || '?')[0]}</div>
                <div>
                  <p className="text-sm text-white font-medium">{m.name}{m.isFounder && <span className="ml-1.5 text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded-full">Founder</span>}</p>
                  <p className="text-[10px] text-slate-500">{m.role} &bull; {m.department}</p>
                </div>
              </div>
              <span className="text-xs text-slate-400">{m.status}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Project Finance Detail Modal */}
      <AnimatePresence>
        {selectedProjectFinance && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedProjectFinance(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-slate-900 border border-white/[0.06] rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2"><DollarSign size={18} className="text-emerald-400" />{selectedProjectFinance.projectTitle}</h2>
                <button onClick={() => setSelectedProjectFinance(null)} className="text-slate-500 hover:text-white"><X size={18} /></button>
              </div>
              {selectedProjectFinance.notFound ? <p className="text-sm text-slate-500 text-center py-8">No finance data for this project. Configure cost sharing first.</p> : (
                <div className="space-y-4">
                  {(() => {
                    const f = selectedProjectFinance
                    const c = f.currency || 'USD'
                    const sym = c === 'PKR' ? '₨' : c === 'EUR' ? '€' : c === 'GBP' ? '£' : '$'
                    return (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: 'Total Budget', value: `${sym}${(f.totalAmount || 0).toLocaleString()}`, color: 'text-cyan-400' },
                            { label: 'Net Amount', value: `${sym}${(f.netAmount || 0).toLocaleString()}`, color: 'text-emerald-400' },
                            { label: 'Total Members', value: f.totalMembers || 0, color: 'text-violet-400' },
                            { label: 'Share/Person', value: `${sym}${(f.sharePerPerson || 0).toLocaleString()}`, color: 'text-orange-400' },
                          ].map(k => (
                            <div key={k.label} className="bg-slate-800/50 border border-white/[0.06] rounded-xl p-3 text-center">
                              <p className="text-[10px] text-slate-500 uppercase">{k.label}</p>
                              <p className={`text-lg font-bold mt-1 ${k.color}`}>{k.value}</p>
                            </div>
                          ))}
                        </div>
                        <div className="bg-slate-800/30 border border-white/[0.06] rounded-xl p-4 space-y-2 text-sm">
                          <p className="text-xs text-slate-500 font-medium uppercase mb-2">Deductions</p>
                          {f.fiverrFeePercent > 0 && <div className="flex justify-between"><span className="text-slate-400">Fiverr Fee ({f.fiverrFeePercent}%)</span><span className="text-red-400">-{sym}{((f.totalAmount * f.fiverrFeePercent / 100) || 0).toLocaleString()}</span></div>}
                          {f.zakatEnabled && <div className="flex justify-between"><span className="text-slate-400">Zakat ({f.zakatPercent}%)</span><span className="text-red-400">-{sym}{((f.totalAmount * f.zakatPercent / 100) || 0).toLocaleString()}</span></div>}
                          {(f.otherCosts || []).filter((c: any) => c.amount > 0).map((c: any, i: number) => (
                            <div key={i} className="flex justify-between"><span className="text-slate-400">{c.name}</span><span className="text-red-400">-{sym}{c.amount.toLocaleString()}</span></div>
                          ))}
                        </div>
                        {f.shares?.length > 0 && (
                          <div>
                            <p className="text-xs text-slate-500 font-medium uppercase mb-2">Individual Shares</p>
                            <div className="space-y-2">
                              {f.shares.map((s: any) => (
                                <div key={s.id} className="flex items-center justify-between bg-slate-800/30 border border-white/[0.06] rounded-xl p-3">
                                  <span className="text-sm text-white">{s.employee?.name}{s.employee?.isFounder && <span className="ml-1 text-[9px] text-amber-400">⭐</span>}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-emerald-400">{sym}{s.shareAmount?.toLocaleString()}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{s.paymentStatus}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Member Finance Detail Modal */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedMember(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-slate-900 border border-white/[0.06] rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2"><Users size={18} className="text-violet-400" />{selectedMember.name}</h2>
                <button onClick={() => setSelectedMember(null)} className="text-slate-500 hover:text-white"><X size={18} /></button>
              </div>
              {loadingMember ? <div className="text-center py-8"><div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" /></div> : (
                <div className="space-y-4">
                  {(() => {
                    const withShare = memberAssignments.filter((a: any) => a.shareAmount)
                    const totalEarnings = withShare.reduce((s: number, a: any) => s + (a.shareAmount || 0), 0)
                    const paid = withShare.filter((a: any) => a.paymentStatus === 'PAID').reduce((s: number, a: any) => s + (a.shareAmount || 0), 0)
                    return (
                      <>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-slate-800/50 border border-white/[0.06] rounded-xl p-3 text-center"><p className="text-[10px] text-slate-500 uppercase">Total</p><p className="text-lg font-bold text-emerald-400 mt-1">${totalEarnings.toLocaleString()}</p></div>
                          <div className="bg-slate-800/50 border border-white/[0.06] rounded-xl p-3 text-center"><p className="text-[10px] text-slate-500 uppercase">Paid</p><p className="text-lg font-bold text-cyan-400 mt-1">${paid.toLocaleString()}</p></div>
                          <div className="bg-slate-800/50 border border-white/[0.06] rounded-xl p-3 text-center"><p className="text-[10px] text-slate-500 uppercase">Pending</p><p className="text-lg font-bold text-amber-400 mt-1">${(totalEarnings - paid).toLocaleString()}</p></div>
                        </div>
                        <p className="text-xs text-slate-500 font-medium uppercase">Projects ({memberAssignments.length})</p>
                        {memberAssignments.length === 0 ? <p className="text-sm text-slate-500 text-center py-4">No assignments</p> : memberAssignments.map((a: any) => (
                          <div key={a.id} className="flex items-center justify-between bg-slate-800/30 border border-white/[0.06] rounded-xl p-3">
                            <div>
                              <p className="text-sm text-white font-medium">{a.project?.title || a.projectRef}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-[10px] text-slate-500">{a.roleInProject || 'Member'}{a.project?.status ? ` • ${a.project.status}` : ''}</p>
                                {(() => { const dl = getDeadlineInfo(a.project?.deadline); return dl ? <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${dl.color}`}>{dl.label}</span> : null })()}
                              </div>
                            </div>
                            {a.shareAmount != null && (
                              <div className="text-right">
                                <p className="text-sm font-bold text-emerald-400">${a.shareAmount?.toLocaleString()}</p>
                                <span className={`text-[10px] ${a.paymentStatus === 'PAID' ? 'text-emerald-400' : 'text-amber-400'}`}>{a.paymentStatus || 'PENDING'}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </>
                    )
                  })()}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
