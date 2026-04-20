import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Mail, RefreshCw, Clock, CheckCircle2, XCircle, Filter } from 'lucide-react'
import { downloadReport, emailReport, getEmailLogs } from '../../api/adminApi'
import { useTheme } from '../context/ThemeContext'

interface EmailLogEntry {
  id: string
  to: string
  subject: string
  type: string
  status: string
  error?: string
  createdAt: string
}

export default function Reports() {
  const { isDark } = useTheme()
  const [downloading, setDownloading] = useState(false)
  const [emailing, setEmailing] = useState(false)
  const [emailLogs, setEmailLogs] = useState<EmailLogEntry[]>([])
  const [loadingLogs, setLoadingLogs] = useState(true)
  const [logFilter, setLogFilter] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => { fetchLogs() }, [])

  async function fetchLogs() {
    setLoadingLogs(true)
    try {
      const res = await getEmailLogs(logFilter ? { type: logFilter } : undefined)
      setEmailLogs(res.data?.data || [])
    } catch { /* ignore */ }
    setLoadingLogs(false)
  }

  async function handleDownload() {
    setDownloading(true)
    try {
      const res = await downloadReport()
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `techlution-report-${new Date().toISOString().slice(0, 10)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      showToast('Report downloaded!')
    } catch { showToast('Download failed') }
    setDownloading(false)
  }

  async function handleEmail() {
    setEmailing(true)
    try {
      await emailReport()
      showToast('Report emailed successfully!')
      fetchLogs()
    } catch { showToast('Email failed') }
    setEmailing(false)
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const cardClass = isDark
    ? 'bg-slate-900/60 backdrop-blur-sm border-white/[0.06]'
    : 'bg-white border-slate-200 shadow-sm'
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500'

  const logTypes = ['', 'weekly_report', 'share_assignment', 'share_update', 'share_completion', 'contact_admin', 'contact_confirmation']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${textPrimary}`}>Reports & Email Logs</h1>
        <p className={`text-sm mt-1 ${textSecondary}`}>Generate PDF reports and track all outgoing emails</p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Download Report */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl border p-6 ${cardClass}`}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/[0.06] flex items-center justify-center mb-4">
            <Download size={22} className="text-cyan-400" />
          </div>
          <h3 className={`font-semibold mb-1 ${textPrimary}`}>Download Report</h3>
          <p className={`text-xs mb-4 ${textSecondary}`}>Generate and download a weekly business report as PDF</p>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {downloading ? <RefreshCw size={14} className="animate-spin" /> : <FileText size={14} />}
            {downloading ? 'Generating…' : 'Download PDF'}
          </button>
        </motion.div>

        {/* Email Report */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className={`rounded-xl border p-6 ${cardClass}`}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-white/[0.06] flex items-center justify-center mb-4">
            <Mail size={22} className="text-violet-400" />
          </div>
          <h3 className={`font-semibold mb-1 ${textPrimary}`}>Email Report</h3>
          <p className={`text-xs mb-4 ${textSecondary}`}>Send weekly report to admin email (auto-sent every Monday 8AM)</p>
          <button
            onClick={handleEmail}
            disabled={emailing}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 text-white text-sm font-medium shadow-lg hover:shadow-violet-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {emailing ? <RefreshCw size={14} className="animate-spin" /> : <Mail size={14} />}
            {emailing ? 'Sending…' : 'Email Now'}
          </button>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className={`rounded-xl border p-6 ${cardClass}`}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-white/[0.06] flex items-center justify-center mb-4">
            <Clock size={22} className="text-emerald-400" />
          </div>
          <h3 className={`font-semibold mb-1 ${textPrimary}`}>Auto Reports</h3>
          <p className={`text-xs mb-4 ${textSecondary}`}>Weekly reports generated automatically every Monday at 8:00 AM</p>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className={textSecondary}>Total Emails Sent</span>
              <span className={`font-medium ${textPrimary}`}>{emailLogs.length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className={textSecondary}>Failed</span>
              <span className="font-medium text-rose-400">{emailLogs.filter(l => l.status === 'FAILED').length}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Email Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className={`rounded-xl border ${cardClass} p-5`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-semibold ${textPrimary}`}>Email History</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Filter size={12} className={textSecondary} />
              <select
                value={logFilter}
                onChange={e => { setLogFilter(e.target.value); setTimeout(fetchLogs, 0) }}
                className={`text-xs ${isDark ? 'bg-white/[0.04] border-white/[0.06] text-white' : 'bg-slate-50 border-slate-200 text-slate-700'} border rounded-lg px-2 py-1 focus:outline-none`}
              >
                <option value="">All Types</option>
                {logTypes.filter(Boolean).map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <button onClick={fetchLogs} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-slate-100'} transition-colors`}>
              <RefreshCw size={13} className={textSecondary} />
            </button>
          </div>
        </div>

        {loadingLogs ? (
          <div className="space-y-2">
            {[1,2,3,4].map(i => (
              <div key={i} className={`h-10 rounded-lg animate-pulse ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`} />
            ))}
          </div>
        ) : emailLogs.length === 0 ? (
          <p className={`text-sm text-center py-8 ${textSecondary}`}>No email logs yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className={`border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
                  <th className={`text-left py-2 px-2 font-medium ${textSecondary}`}>To</th>
                  <th className={`text-left py-2 px-2 font-medium ${textSecondary}`}>Subject</th>
                  <th className={`text-left py-2 px-2 font-medium ${textSecondary}`}>Type</th>
                  <th className={`text-left py-2 px-2 font-medium ${textSecondary}`}>Status</th>
                  <th className={`text-left py-2 px-2 font-medium ${textSecondary}`}>Date</th>
                </tr>
              </thead>
              <tbody>
                {emailLogs.map(log => (
                  <tr key={log.id} className={`border-b last:border-0 ${isDark ? 'border-white/[0.04]' : 'border-slate-100'}`}>
                    <td className={`py-2.5 px-2 ${textPrimary}`}>{log.to}</td>
                    <td className={`py-2.5 px-2 ${textSecondary} max-w-[200px] truncate`}>{log.subject}</td>
                    <td className="py-2.5 px-2">
                      <span className="px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[10px]">
                        {log.type?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-2">
                      {log.status === 'SENT'
                        ? <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 size={11} /> Sent</span>
                        : <span className="flex items-center gap-1 text-rose-400"><XCircle size={11} /> Failed</span>
                      }
                    </td>
                    <td className={`py-2.5 px-2 ${textSecondary}`}>{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="fixed bottom-6 right-6 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium shadow-lg shadow-emerald-500/30 z-50"
        >
          {toast}
        </motion.div>
      )}
    </div>
  )
}
