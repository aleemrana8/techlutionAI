import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Clock, CheckCircle2, AlertCircle, Circle } from 'lucide-react'

type ProjectStatus = 'Planning' | 'In Progress' | 'Review' | 'Completed' | 'On Hold'

interface Project {
  id: number
  title: string
  client: string
  category: string
  progress: number
  deadline: string
  team: string[]
  status: ProjectStatus
  notes: string
}

const mockProjects: Project[] = [
  { id: 1, title: 'Hospital Management System v2', client: 'MedCare Corp', category: 'Healthcare IT', progress: 72, deadline: '2026-05-15', team: ['RA', 'DA', 'HA'], status: 'In Progress', notes: 'Phase 2 development' },
  { id: 2, title: 'AI Voice Agent - Restaurant', client: 'FoodHub Inc', category: 'AI & ML', progress: 45, deadline: '2026-06-01', team: ['DA', 'MG'], status: 'In Progress', notes: 'Training voice model' },
  { id: 3, title: 'RCM Automation Platform', client: 'HealthBridge', category: 'Healthcare IT', progress: 90, deadline: '2026-04-25', team: ['RA', 'UT'], status: 'Review', notes: 'Final testing phase' },
  { id: 4, title: 'E-Commerce Dashboard', client: 'RetailMax', category: 'Web Development', progress: 100, deadline: '2026-03-30', team: ['AK', 'UT'], status: 'Completed', notes: 'Delivered and live' },
  { id: 5, title: 'Azure Migration', client: 'TechStart Inc', category: 'DevOps & Cloud', progress: 55, deadline: '2026-05-20', team: ['HA', 'OF'], status: 'In Progress', notes: 'Migrating services' },
  { id: 6, title: 'OCR Document Scanner', client: 'LegalDocs Co', category: 'Computer Vision', progress: 20, deadline: '2026-07-01', team: ['DA'], status: 'Planning', notes: 'Requirements gathering' },
  { id: 7, title: 'Customer Support Chatbot', client: 'HotelLux', category: 'AI & ML', progress: 0, deadline: '2026-08-01', team: ['RA', 'DA'], status: 'On Hold', notes: 'Waiting for client approval' },
  { id: 8, title: 'Data Pipeline ETL System', client: 'DataFlow Analytics', category: 'Data Pipelines', progress: 65, deadline: '2026-05-10', team: ['OF', 'UT'], status: 'In Progress', notes: 'ETL pipeline development' },
]

const statusConfig: Record<ProjectStatus, { icon: typeof Circle; color: string; bg: string }> = {
  Planning: { icon: Circle, color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' },
  'In Progress': { icon: Clock, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  Review: { icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  Completed: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  'On Hold': { icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
}

const ALL_STATUSES: ProjectStatus[] = ['Planning', 'In Progress', 'Review', 'Completed', 'On Hold']

export default function ProjectsBoard() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ProjectStatus | 'All'>('All')

  const filtered = mockProjects.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || p.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Project Management</h1>
          <p className="text-slate-400 text-sm mt-1">Track and manage all active projects</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-sm font-medium shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all">
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects…"
            className="w-full bg-white/[0.04] border border-white/[0.06] text-white text-sm rounded-xl pl-10 pr-4 py-2 placeholder-slate-600 focus:outline-none focus:border-cyan-500/30 transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(['All', ...ALL_STATUSES] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                filter === s
                  ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                  : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.06]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((project, i) => {
          const sc = statusConfig[project.status]
          const StatusIcon = sc.icon
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -3 }}
              className="rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] p-5 hover:border-cyan-500/20 transition-all group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm truncate group-hover:text-cyan-400 transition-colors">{project.title}</h3>
                  <p className="text-slate-500 text-xs mt-0.5">{project.client}</p>
                </div>
                <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color}`}>
                  <StatusIcon size={10} />
                  {project.status}
                </span>
              </div>

              {/* Category badge */}
              <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-3">
                {project.category}
              </span>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-500">Progress</span>
                  <span className="text-xs text-white font-medium">{project.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: project.progress + '%' }}
                    transition={{ delay: 0.3 + i * 0.05, duration: 0.8 }}
                    className={`h-full rounded-full ${
                      project.progress >= 80 ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' :
                      project.progress >= 50 ? 'bg-gradient-to-r from-cyan-500 to-violet-500' :
                      project.progress >= 20 ? 'bg-gradient-to-r from-orange-500 to-amber-500' :
                      'bg-slate-600'
                    }`}
                  />
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-slate-500">
                  <Clock size={11} />
                  <span>{project.deadline}</span>
                </div>
                <div className="flex -space-x-1.5">
                  {project.team.map(t => (
                    <div key={t} className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500/30 to-violet-500/30 border border-slate-900 flex items-center justify-center text-[9px] text-white font-bold">
                      {t}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <p className="text-[11px] text-slate-500 mt-2 truncate">{project.notes}</p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
