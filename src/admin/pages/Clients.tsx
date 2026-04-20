import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Eye, MoreHorizontal } from 'lucide-react'
import { getClients } from '../../api/adminApi'
import { useDashboardSocket } from '../hooks/useSocket'

type Status = 'ACTIVE' | 'INACTIVE' | 'PROSPECT' | 'CHURNED'

const STATUS_LABELS: Record<Status, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  PROSPECT: 'Prospect',
  CHURNED: 'Churned',
}

const STATUS_COLORS: Record<Status, string> = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  INACTIVE: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  PROSPECT: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  CHURNED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
}

const STATUSES: Status[] = ['ACTIVE', 'INACTIVE', 'PROSPECT', 'CHURNED']

export default function Clients() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All')
  const [clients, setClients] = useState<any[]>([])

  const fetchClients = useCallback(() => {
    getClients()
      .then(r => setClients(r.data.data || []))
      .catch(() => {})
  }, [])

  useEffect(() => { fetchClients() }, [fetchClients])

  useDashboardSocket((event) => {
    if (event === 'client:new' || event === 'client:update') fetchClients()
  })

  const filtered = clients.filter((c: any) => {
    const matchSearch = (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.company || '').toLowerCase().includes(search.toLowerCase())
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
            {s} {s !== 'All' && <span className="ml-1 opacity-60">({clients.filter((c: any) => c.status === s).length})</span>}
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
                {['Client', 'Contact', 'Company', 'Status', 'Industry', 'Revenue', ''].map(h => (
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
                        {(c.name || '?')[0]}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{c.name}</p>
                        <p className="text-[11px] text-slate-500">{c.notes || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-300 text-xs">{c.email}</p>
                    <p className="text-slate-500 text-xs">{c.phone || '-'}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{c.company || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[c.status as Status] || STATUS_COLORS.PROSPECT}`}>
                      {STATUS_LABELS[c.status as Status] || c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{c.industry || '-'}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{c.revenue ? `$${Number(c.revenue).toLocaleString()}` : '-'}</td>
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
