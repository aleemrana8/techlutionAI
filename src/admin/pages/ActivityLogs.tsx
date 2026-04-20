import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { getActivityLogs } from '../../api/adminApi'

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  UPDATE: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  DELETE: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  LOGIN: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const pageSize = 20

  useEffect(() => {
    const params: Record<string, string> = {
      page: String(page),
      limit: String(pageSize),
    }
    if (search) params.action = search
    getActivityLogs(params)
      .then(r => {
        setLogs(r.data.data?.logs || r.data.data || [])
        setTotal(r.data.data?.total || 0)
      })
      .catch(err => console.error('Failed to load activity logs:', err))
  }, [page, search])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Activity Logs</h1>
        <p className="text-slate-400 text-sm mt-1">Track all admin actions and system events</p>
      </div>

      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Filter by action (CREATE, UPDATE...)"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="w-full bg-white/[0.03] border border-white/[0.06] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 placeholder-slate-600 focus:outline-none focus:border-cyan-500/30 transition-all"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-slate-500 font-medium px-5 py-3">Time</th>
                <th className="text-left text-slate-500 font-medium px-5 py-3">Admin</th>
                <th className="text-left text-slate-500 font-medium px-5 py-3">Action</th>
                <th className="text-left text-slate-500 font-medium px-5 py-3">Entity</th>
                <th className="text-left text-slate-500 font-medium px-5 py-3">Details</th>
                <th className="text-left text-slate-500 font-medium px-5 py-3">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No activity logs found
                  </td>
                </tr>
              ) : logs.map((log: any, i: number) => (
                <motion.tr
                  key={log.id || i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-3 text-slate-400 whitespace-nowrap">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}
                  </td>
                  <td className="px-5 py-3 text-white">
                    {log.adminUser?.username || log.adminUserId || '-'}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${ACTION_COLORS[log.action] || ACTION_COLORS.UPDATE}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-300">
                    {log.entity}{log.entityId ? ` #${log.entityId}` : ''}
                  </td>
                  <td className="px-5 py-3 text-slate-500 max-w-[200px] truncate" title={log.details}>
                    {log.details || '-'}
                  </td>
                  <td className="px-5 py-3 text-slate-500 font-mono text-xs">
                    {log.ipAddress || '-'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
            <span className="text-xs text-slate-500">{total} total logs</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-white disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs text-slate-400">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-white disabled:opacity-30 transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
