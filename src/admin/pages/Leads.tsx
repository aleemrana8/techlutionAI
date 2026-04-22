import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MessageSquare, Mail, Phone, Send, XCircle, Clock, CheckCircle2, ChevronDown, Trash2, RotateCcw } from 'lucide-react'
import { getInquiries, respondToInquiry, ignoreInquiry, unignoreInquiry, deleteInquiry } from '../../api/adminApi'
import { useDashboardSocket } from '../hooks/useSocket'
import ConfirmModal from '../components/ConfirmModal'

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  New: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  CONTACTED: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  Contacted: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  RESPONDED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  IGNORED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  QUALIFIED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Qualified: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CONVERTED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Converted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CLOSED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Closed: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
}

export default function Leads() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [respondingId, setRespondingId] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ type: 'ignore' | 'unignore' | 'delete'; id: string; name?: string } | null>(null)

  const fetchLeads = useCallback(async () => {
    try {
      const { data } = await getInquiries({ type: 'INQUIRY', limit: '100' })
      setLeads(data?.data || [])
    } catch { /* */ } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchLeads() }, [fetchLeads])
  const skipSocketRef = useRef(false)
  useDashboardSocket((event) => {
    if ((event === 'inquiry:new' || event === 'inquiry:update') && !skipSocketRef.current) fetchLeads()
  })

  const handleRespond = async (id: string) => {
    if (!responseText.trim()) return
    setSending(true)
    skipSocketRef.current = true
    try {
      await respondToInquiry(id, responseText)
      setRespondingId(null)
      setResponseText('')
      setToast({ type: 'success', message: 'Response sent successfully! Email delivered to the client.' })
      setTimeout(() => setToast(null), 4000)
      fetchLeads()
    } catch {
      setToast({ type: 'error', message: 'Failed to send response. Please try again.' })
      setTimeout(() => setToast(null), 4000)
    } finally {
      setSending(false)
      setTimeout(() => { skipSocketRef.current = false }, 2000)
    }
  }

  const handleIgnore = async (id: string) => {
    skipSocketRef.current = true
    await ignoreInquiry(id)
    fetchLeads()
    setTimeout(() => { skipSocketRef.current = false }, 2000)
  }

  const handleUnignore = async (id: string) => {
    skipSocketRef.current = true
    await unignoreInquiry(id)
    fetchLeads()
    setTimeout(() => { skipSocketRef.current = false }, 2000)
  }

  const handleDelete = async (id: string) => {
    skipSocketRef.current = true
    await deleteInquiry(id)
    fetchLeads()
    setTimeout(() => { skipSocketRef.current = false }, 2000)
  }

  const executeConfirm = () => {
    if (!confirmAction) return
    if (confirmAction.type === 'ignore') handleIgnore(confirmAction.id)
    else if (confirmAction.type === 'unignore') handleUnignore(confirmAction.id)
    else if (confirmAction.type === 'delete') handleDelete(confirmAction.id)
    setConfirmAction(null)
  }

  const filtered = leads.filter(l => {
    const matchSearch = (l.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.message || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.service || l.subject || '').toLowerCase().includes(search.toLowerCase())
    const status = (l.status || 'NEW').toUpperCase()
    const matchStatus = statusFilter === 'All' || status === statusFilter
    return matchSearch && matchStatus
  })

  const newCount = leads.filter(l => !l.status || l.status === 'New' || l.status === 'NEW').length
  const respondedCount = leads.filter(l => l.status === 'RESPONDED').length
  const ignoredCount = leads.filter(l => l.status === 'IGNORED').length

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-6 left-1/2 z-50 px-5 py-3 rounded-xl border backdrop-blur-sm shadow-2xl flex items-center gap-3 ${
              toast.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            <span className="text-sm font-medium">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">&times;</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><MessageSquare className="w-7 h-7 text-violet-400" /> Inquiries</h1>
        <p className="text-slate-400 text-sm mt-1">Respond to client inquiries or mark as ignored — responses are emailed automatically</p>
      </div>

      {/* Stats (clickable filters) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: leads.length, color: 'cyan', filter: 'All' },
          { label: 'Pending', value: newCount, color: 'violet', filter: 'NEW' },
          { label: 'Responded', value: respondedCount, color: 'emerald', filter: 'RESPONDED' },
          { label: 'Ignored', value: ignoredCount, color: 'slate', filter: 'IGNORED' },
        ].map(s => {
          const active = statusFilter === s.filter
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setStatusFilter(s.filter)}
              className={`bg-slate-900/50 border rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] ${active ? `border-${s.color}-500/40 ring-1 ring-${s.color}-500/20` : 'border-white/[0.06]'}`}
            >
              <p className={`text-xs mb-1 ${active ? `text-${s.color}-400` : 'text-slate-500'}`}>{s.label}</p>
              <p className={`text-2xl font-bold text-${s.color}-400`}>{s.value}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search inquiries..." className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/[0.06] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/30" />
        </div>
      </div>

      {/* Inquiries List */}
      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-900/50 rounded-2xl animate-pulse border border-white/[0.06]" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500"><MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No inquiries found</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead, i) => {
            const isExpanded = expandedId === lead.id
            const isResponding = respondingId === lead.id
            const status = lead.status || 'New'
            const isActionable = !['RESPONDED', 'IGNORED', 'Converted', 'CONVERTED'].includes(status)

            return (
              <motion.div key={lead.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-slate-900/50 backdrop-blur border border-white/[0.06] rounded-2xl overflow-hidden hover:border-violet-500/15 transition-all">
                {/* Main row */}
                <div className="p-4 sm:p-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : lead.id)}>
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center text-violet-400 font-bold text-sm flex-shrink-0">
                        {(lead.name || '?')[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-white font-semibold text-sm">{lead.name}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[status] || STATUS_COLORS.New}`}>{status}</span>
                        </div>
                        <p className="text-slate-500 text-xs mt-0.5 truncate">{lead.service || lead.subject || lead.message?.slice(0, 60)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[11px] text-slate-600">{new Date(lead.createdAt || lead.timestamp).toLocaleDateString()}</span>
                      <ChevronDown size={14} className={`text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-white/[0.06]">
                      <div className="p-4 sm:p-5 bg-slate-950/30 space-y-3">
                        {/* Contact info */}
                        <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1.5"><Mail size={12} className="text-slate-600" />{lead.email}</span>
                          {lead.phone && <span className="flex items-center gap-1.5"><Phone size={12} className="text-slate-600" />{lead.phone}</span>}
                          {lead.company && <span>🏢 {lead.company}</span>}
                          {lead.budget && <span className="text-emerald-400">💰 {lead.budget}</span>}
                          {lead.timeline && <span className="text-amber-400"><Clock size={12} className="inline" /> {lead.timeline}</span>}
                        </div>

                        {/* Message */}
                        <div className="bg-slate-900/50 border border-white/[0.06] rounded-xl p-3">
                          <p className="text-xs text-slate-500 mb-1 font-medium">Message</p>
                          <p className="text-sm text-slate-300 leading-relaxed">{lead.message}</p>
                        </div>

                        {/* Previous response if any */}
                        {lead.response && (
                          <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3">
                            <p className="text-xs text-emerald-500 mb-1 font-medium">Your Response</p>
                            <p className="text-sm text-emerald-300/80 leading-relaxed">{lead.response}</p>
                          </div>
                        )}

                        {/* Respond textarea */}
                        {isResponding && (
                          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                            <textarea value={responseText} onChange={e => setResponseText(e.target.value)} rows={3} placeholder="Type your response... This will be emailed to the client." className="w-full px-3 py-2.5 bg-slate-800/50 border border-violet-500/20 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/40 resize-none" autoFocus />
                            <div className="flex gap-2">
                              <button onClick={() => handleRespond(lead.id)} disabled={sending || !responseText.trim()} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-xl text-xs font-medium disabled:opacity-50">
                                <Send size={12} />{sending ? 'Sending...' : 'Send Response'}
                              </button>
                              <button onClick={() => { setRespondingId(null); setResponseText('') }} className="px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors">Cancel</button>
                            </div>
                          </motion.div>
                        )}

                        {/* Actions */}
                        {!isResponding && (
                          <div className="flex items-center gap-2 pt-1">
                            {isActionable && (
                              <>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setRespondingId(lead.id); setResponseText('') }}
                                  className="flex items-center gap-1.5 px-3 py-2 bg-violet-500/10 text-violet-400 rounded-xl text-xs font-medium border border-violet-500/20 hover:bg-violet-500/20 transition-colors">
                                  <Send size={12} /> Respond
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setConfirmAction({ type: 'ignore', id: lead.id, name: lead.name })}
                                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-500/10 text-slate-400 rounded-xl text-xs font-medium border border-slate-500/20 hover:bg-slate-500/20 transition-colors">
                                  <XCircle size={12} /> Ignore
                                </motion.button>
                              </>
                            )}
                            {status === 'RESPONDED' && (
                              <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle2 size={12} /> Responded</span>
                            )}
                            {status === 'IGNORED' && (
                              <>
                                <span className="flex items-center gap-1 text-xs text-slate-500"><XCircle size={12} /> Ignored</span>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setConfirmAction({ type: 'unignore', id: lead.id, name: lead.name })}
                                  className="flex items-center gap-1.5 px-3 py-2 bg-cyan-500/10 text-cyan-400 rounded-xl text-xs font-medium border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors">
                                  <RotateCcw size={12} /> Restore
                                </motion.button>
                              </>
                            )}
                            <div className="flex-1" />
                            <button onClick={() => setConfirmAction({ type: 'delete', id: lead.id, name: lead.name })} className="p-1.5 text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}

      <ConfirmModal
        open={!!confirmAction}
        title={confirmAction?.type === 'delete' ? 'Delete Inquiry' : confirmAction?.type === 'unignore' ? 'Restore Inquiry' : 'Ignore Inquiry'}
        message={confirmAction?.type === 'delete'
          ? `Are you sure you want to delete the inquiry from "${confirmAction?.name || 'this contact'}"? This cannot be undone.`
          : confirmAction?.type === 'unignore'
          ? `Restore the inquiry from "${confirmAction?.name || 'this contact'}" back to New status?`
          : `Are you sure you want to ignore the inquiry from "${confirmAction?.name || 'this contact'}"`}
        confirmText={confirmAction?.type === 'delete' ? 'Delete' : confirmAction?.type === 'unignore' ? 'Restore' : 'Ignore'}
        variant={confirmAction?.type === 'unignore' ? 'info' : 'danger'}
        onConfirm={executeConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  )
}
