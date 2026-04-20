import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Users, Briefcase, Clock, Star, ChevronDown } from 'lucide-react'
import { getEmployees } from '../../api/adminApi'

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-emerald-400',
  ON_LEAVE: 'bg-amber-400',
  TERMINATED: 'bg-slate-500',
}

const workloadColors: Record<string, string> = {
  LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  MEDIUM: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  HIGH: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
}

function getWorkloadLabel(w: number): string {
  if (w <= 33) return 'LOW'
  if (w <= 66) return 'MEDIUM'
  return 'HIGH'
}

const departments = ['All', 'Engineering', 'Design', 'Operations', 'Quality', 'Marketing', 'Sales']

export default function HRManagement() {
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('All')
  const [employees, setEmployees] = useState<any[]>([])
  useEffect(() => {
    getEmployees()
      .then(r => setEmployees(r.data.data || []))
      .catch(() => {})
  }, [])

  const filtered = employees.filter((e: any) => {
    const matchSearch = (e.name || '').toLowerCase().includes(search.toLowerCase()) || (e.role || '').toLowerCase().includes(search.toLowerCase())
    const matchDept = dept === 'All' || e.department === dept
    return matchSearch && matchDept
  })

  const active = employees.filter((e: any) => e.status === 'ACTIVE').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">HR & Resource Management</h1>
        <p className="text-slate-400 text-sm mt-1">Team overview, workload, and performance</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Team Size', value: employees.length, icon: Users, color: 'cyan' },
          { label: 'Active', value: active, icon: Clock, color: 'emerald' },
          { label: 'Departments', value: [...new Set(employees.map((e: any) => e.department))].length, icon: Briefcase, color: 'orange' },
          { label: 'On Leave', value: employees.filter((e: any) => e.status === 'ON_LEAVE').length, icon: Star, color: 'violet' },
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
                  {(emp.name || '??').split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${statusColors[emp.status] || 'bg-slate-500'} border-2 border-slate-900`} />
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
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${workloadColors[getWorkloadLabel(emp.workload ?? 0)]}`}>
                  {getWorkloadLabel(emp.workload ?? 0)}
                </span>
              </div>

              {/* Salary */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Salary</span>
                <span className="text-xs text-white font-medium">{emp.salary ? `$${Number(emp.salary).toLocaleString()}` : '-'}</span>
              </div>

              {/* Join date */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Joined</span>
                <span className="text-xs text-slate-400">{emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : '-'}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
