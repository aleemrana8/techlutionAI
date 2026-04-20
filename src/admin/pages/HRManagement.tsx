import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Users, Briefcase, Clock, Star, ChevronDown } from 'lucide-react'

interface Employee {
  id: number
  name: string
  role: string
  department: string
  status: 'Online' | 'Away' | 'Offline'
  tasks: number
  workload: 'Low' | 'Medium' | 'High'
  performance: number
  avatar: string
}

const mockEmployees: Employee[] = [
  { id: 1, name: 'Rana Muhammad Aleem', role: 'CEO & Full Stack Dev', department: 'Engineering', status: 'Online', tasks: 8, workload: 'High', performance: 98, avatar: 'RA' },
  { id: 2, name: 'Danish Ahmed', role: 'AI/ML Engineer', department: 'Engineering', status: 'Online', tasks: 5, workload: 'Medium', performance: 92, avatar: 'DA' },
  { id: 3, name: 'Ayesha Khan', role: 'UI/UX Designer', department: 'Design', status: 'Online', tasks: 4, workload: 'Medium', performance: 88, avatar: 'AK' },
  { id: 4, name: 'Hassan Ali', role: 'DevOps Engineer', department: 'Engineering', status: 'Away', tasks: 6, workload: 'High', performance: 90, avatar: 'HA' },
  { id: 5, name: 'Sana Malik', role: 'Project Manager', department: 'Operations', status: 'Online', tasks: 3, workload: 'Low', performance: 94, avatar: 'SM' },
  { id: 6, name: 'Usman Tariq', role: 'Backend Developer', department: 'Engineering', status: 'Offline', tasks: 7, workload: 'High', performance: 86, avatar: 'UT' },
  { id: 7, name: 'Maria Gonzalez', role: 'QA Engineer', department: 'Quality', status: 'Online', tasks: 4, workload: 'Medium', performance: 91, avatar: 'MG' },
  { id: 8, name: 'Omar Farooq', role: 'Data Engineer', department: 'Engineering', status: 'Away', tasks: 5, workload: 'Medium', performance: 87, avatar: 'OF' },
]

const statusColors = {
  Online: 'bg-emerald-400',
  Away: 'bg-amber-400',
  Offline: 'bg-slate-500',
}

const workloadColors = {
  Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Medium: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  High: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
}

const departments = ['All', 'Engineering', 'Design', 'Operations', 'Quality']

export default function HRManagement() {
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('All')

  const filtered = mockEmployees.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.role.toLowerCase().includes(search.toLowerCase())
    const matchDept = dept === 'All' || e.department === dept
    return matchSearch && matchDept
  })

  const online = mockEmployees.filter(e => e.status === 'Online').length
  const totalTasks = mockEmployees.reduce((s, e) => s + e.tasks, 0)
  const avgPerf = Math.round(mockEmployees.reduce((s, e) => s + e.performance, 0) / mockEmployees.length)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">HR & Resource Management</h1>
        <p className="text-slate-400 text-sm mt-1">Team overview, workload, and performance</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Team Size', value: mockEmployees.length, icon: Users, color: 'cyan' },
          { label: 'Online Now', value: online, icon: Clock, color: 'emerald' },
          { label: 'Active Tasks', value: totalTasks, icon: Briefcase, color: 'orange' },
          { label: 'Avg Performance', value: avgPerf + '%', icon: Star, color: 'violet' },
        ].map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] p-4 flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-xl bg-${c.color}-500/15 border border-white/[0.06] flex items-center justify-center`}>
              <c.icon size={18} className={`text-${c.color}-400`} />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{c.value}</p>
              <p className="text-[11px] text-slate-500">{c.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search team members…"
            className="w-full bg-white/[0.04] border border-white/[0.06] text-white text-sm rounded-xl pl-10 pr-4 py-2 placeholder-slate-600 focus:outline-none focus:border-cyan-500/30 transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={dept}
            onChange={e => setDept(e.target.value)}
            className="appearance-none bg-white/[0.04] border border-white/[0.06] text-slate-300 text-sm rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:border-cyan-500/30 transition-all cursor-pointer"
          >
            {departments.map(d => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((emp, i) => (
          <motion.div
            key={emp.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -3 }}
            className="rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] p-5 group hover:border-cyan-500/20 transition-all"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center text-white font-bold text-sm">
                  {emp.avatar}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${statusColors[emp.status]} border-2 border-slate-900`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{emp.name}</p>
                <p className="text-slate-400 text-xs">{emp.role}</p>
                <p className="text-slate-500 text-[11px]">{emp.department}</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Workload */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Workload</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${workloadColors[emp.workload]}`}>
                  {emp.workload}
                </span>
              </div>

              {/* Tasks */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Active Tasks</span>
                <span className="text-xs text-white font-medium">{emp.tasks}</span>
              </div>

              {/* Performance bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-500">Performance</span>
                  <span className="text-xs text-white font-medium">{emp.performance}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: emp.performance + '%' }}
                    transition={{ delay: 0.3 + i * 0.05, duration: 0.8 }}
                    className={`h-full rounded-full ${
                      emp.performance >= 90 ? 'bg-gradient-to-r from-cyan-500 to-emerald-500' :
                      emp.performance >= 80 ? 'bg-gradient-to-r from-cyan-500 to-violet-500' :
                      'bg-gradient-to-r from-orange-500 to-rose-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
