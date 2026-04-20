import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ScrollText, Search } from 'lucide-react'
import AdminAPI from '../../api/adminApi'

const ACTION_COLORS: Record<string, string> = {
  LOGIN_SUCCESS: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  LOGIN_FAILED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  LEAD_CREATED: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  CLIENT_CREATED: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  EMPLOYEE_CREATED: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  FINANCE_CREATED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  ADMIN_USER_CREATED: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  ADMIN_USER_UPDATED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  ADMIN_USER_DELETED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState<any>({})

  useEffect(() => {
    AdminAPI.get('/logs', { params: { page, limit: 30, action: search || undefined } })
      .then(r => {
        setLogs(r.data.data || [])
        setMeta(r.data.meta || {})
      })
      .catch(() => {})
  }, [page, search])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Activity Logs</h1>
        <p className="text-slate-400 text-sm mt-1">Audit trail of all admin actions</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Filter by action…"
            className="w-full bg-white/[0.04] border border-white/[0.06] text-white text-sm rounded-xl pl-10 pr-4 py-2 placeholder-slate-600 focus:outline-none focus:border-cyan-500/30 transition-all"
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Action', 'User', 'Entity', 'Details', 'IP', 'Time'].map(h => (
                  <th key={h} className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any, i: number) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border ${ACTION_COLORS[log.action] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-xs">
                    {log.adminUser?.name || log.adminUserId || '-'}
                    {log.adminUser?.role && (
                      <span className="text-slate-500 ml-1">({log.adminUser.role})</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-cyan-400 font-mono text-xs">{log.entity || '-'}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs max-w-xs truncate">{log.details || '-'}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs font-mono">{log.ipAddress || '-'}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </motion.tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    <ScrollText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No activity logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {(meta.totalPages ?? 0) > 1 && (
          <div className="p-3 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Page {meta.page} of {meta.totalPages} ({meta.total} total)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-slate-400 disabled:opacity-30 hover:bg-white/[0.08] transition-all"
              >
                Previous
              </button>
              <button
                disabled={page >= (meta.totalPages ?? 1)}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-slate-400 disabled:opacity-30 hover:bg-white/[0.08] transition-all"
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
