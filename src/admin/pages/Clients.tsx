import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Eye, MoreHorizontal } from 'lucide-react'

type Status = 'New' | 'In Progress' | 'Completed' | 'Rejected'

interface Client {
  id: number
  name: string
  email: string
  phone: string
  service: string
  status: Status
  date: string
  assigned: string
  notes: string
  followUp: string
}

const mockClients: Client[] = [
  { id: 1, name: 'Ahmed Hassan', email: 'ahmed@corp.com', phone: '+971 50 123 4567', service: 'AI & ML Solutions', status: 'In Progress', date: '2026-04-18', assigned: 'Aleem', notes: 'Custom NLP model needed', followUp: 'Scheduled call' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@healthco.com', phone: '+1 555 234 5678', service: 'Healthcare IT', status: 'New', date: '2026-04-19', assigned: 'Unassigned', notes: 'EHR integration project', followUp: 'Pending' },
  { id: 3, name: 'Li Wei', email: 'liwei@techfirm.cn', phone: '+86 138 0013 8000', service: 'Automation', status: 'Completed', date: '2026-03-15', assigned: 'Danish', notes: 'n8n workflow done', followUp: 'Completed' },
  { id: 4, name: 'David Miller', email: 'david@startup.io', phone: '+1 555 345 6789', service: 'DevOps & Cloud', status: 'In Progress', date: '2026-04-10', assigned: 'Aleem', notes: 'Azure migration', followUp: 'In progress' },
  { id: 5, name: 'Fatima Ali', email: 'fatima@medsys.pk', phone: '+92 300 123 4567', service: 'RCM Automation', status: 'New', date: '2026-04-20', assigned: 'Unassigned', notes: 'Medical billing automation', followUp: 'Pending' },
  { id: 6, name: 'James Brown', email: 'james@retailmax.com', phone: '+44 20 7946 0958', service: 'Data Pipelines', status: 'Rejected', date: '2026-02-28', assigned: '-', notes: 'Budget mismatch', followUp: 'Closed' },
  { id: 7, name: 'Priya Sharma', email: 'priya@innov8.in', phone: '+91 98765 43210', service: 'AI Voice Agents', status: 'In Progress', date: '2026-04-05', assigned: 'Danish', notes: 'Restaurant voice agent', followUp: 'Demo scheduled' },
  { id: 8, name: 'Michael Chen', email: 'mchen@globex.com', phone: '+1 555 456 7890', service: 'Computer Vision', status: 'Completed', date: '2026-01-20', assigned: 'Aleem', notes: 'OCR system delivered', followUp: 'Completed' },
]

const STATUS_COLORS: Record<Status, string> = {
  New: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'In Progress': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
}

const STATUSES: Status[] = ['New', 'In Progress', 'Completed', 'Rejected']

export default function Clients() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All')

  const filtered = mockClients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.service.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Client Tracker</h1>
        <p className="text-slate-400 text-sm mt-1">Manage and track all client interactions</p>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        {(['All', ...STATUSES] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
              statusFilter === s
                ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.06]'
            }`}
          >
            {s} {s !== 'All' && <span className="ml-1 opacity-60">({mockClients.filter(c => c.status === s).length})</span>}
          </button>
        ))}
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] overflow-hidden"
      >
        <div className="p-4 border-b border-white/[0.06] flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search clients…"
              className="w-full bg-white/[0.04] border border-white/[0.06] text-white text-sm rounded-xl pl-10 pr-4 py-2 placeholder-slate-600 focus:outline-none focus:border-cyan-500/30 transition-all"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-slate-400 text-xs hover:bg-white/[0.08] transition-all">
            <Filter size={12} /> Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Client', 'Contact', 'Service', 'Status', 'Date', 'Assigned', 'Follow-up', ''].map(h => (
                  <th key={h} className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {c.name[0]}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{c.name}</p>
                        <p className="text-[11px] text-slate-500">{c.notes}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-300 text-xs">{c.email}</p>
                    <p className="text-slate-500 text-xs">{c.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{c.service}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[c.status]}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{c.date}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{c.assigned}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{c.followUp}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-cyan-400 transition-colors">
                        <Eye size={13} />
                      </button>
                      <button className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-white transition-colors">
                        <MoreHorizontal size={13} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
