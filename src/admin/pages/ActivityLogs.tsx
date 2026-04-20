import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ClipboardList, Search } from 'lucide-react'
import { getActivityLogs } from '../../api/adminApi'

export default function ActivityLogs() {
  const [logs, setLogs] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 25

  useEffect(() => {
    getActivityLogs({ page: String(page), limit: String(limit) })
      .then(r => {
        setLogs(r.data.data?.logs || [])
        setTotal(r.data.data?.total || 0)
      })
      .catch(() => {})
  }, [page])

  const filtered = logs.filter(l =>
    (l.action || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.entity || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.adminUser?.username || '').toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Activity Logs</h1>
        <p className="text-slate-400 text-sm mt-1">Track all admin actions and system events</p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by action, entity, or user…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.06] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 placeholder-slate-600 focus:outline-none focus:border-cyan-500/30"
          />
        </div>
      </div>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-slate-400">
                <th className="text-left py-3 px-4 font-medium">Time</th>
                <th className="text-left py-3 px-4 font-medium">User</th>
                <th className="text-left py-3 px-4 font-medium">Action</th>
                <th className="text-left py-3 px-4 font-medium">Entity</th>
                <th className="text-left py-3 px-4 font-medium">Details</th>
                <th className="text-left py-3 px-4 font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No activity logs found
                  </td>
                </tr>
              ) : (
                filtered.map((log, i) => (
                  <tr key={log.id || i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-white text-xs">{log.adminUser?.username || log.adminUserId || '-'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        log.action?.includes('CREATE') ? 'bg-emerald-500/10 text-emerald-400' :
                        log.action?.includes('DELETE') ? 'bg-red-500/10 text-red-400' :
                        log.action?.includes('UPDATE') ? 'bg-amber-500/10 text-amber-400' :
                        log.action?.includes('LOGIN') ? 'bg-cyan-500/10 text-cyan-400' :
                        'bg-slate-500/10 text-slate-400'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-xs">{log.entity || '-'}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs max-w-[200px] truncate">
                      {typeof log.details === 'string' ? log.details : log.details ? JSON.stringify(log.details) : '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{log.ipAddress || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
            <span className="text-xs text-slate-500">
              Page {page} of {totalPages} ({total} total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-xs rounded-lg bg-white/[0.04] text-slate-400 hover:text-white disabled:opacity-30 transition-all"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-xs rounded-lg bg-white/[0.04] text-slate-400 hover:text-white disabled:opacity-30 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
