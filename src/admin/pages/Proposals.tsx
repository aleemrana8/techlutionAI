import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Plus, Search, X, Check, XCircle, Clock, DollarSign, TrendingUp, BarChart3, Trash2, Rocket, Users, UserPlus, Percent, Calculator, Mail, EyeOff, Send, ChevronDown, Phone, Inbox, FileSignature, RotateCcw } from 'lucide-react'
import { getProposals, createProposal, updateProposalStatus, deleteProposal, getProposalStats, getClients, getEmployees, startProjectFromProposal, getInquiries, respondToInquiry, ignoreInquiry, unignoreInquiry, deleteInquiry, startProjectFromInquiry } from '../../api/adminApi'
import { useDashboardSocket } from '../hooks/useSocket'
import PhoneInput from '../../components/common/PhoneInput'
import ConfirmModal from '../components/ConfirmModal'

// Calculate deadline from today + timeline weeks (working days only, skip weekends)
function calcDeadlineWithWeekends(weeks: number): string {
  const workingDays = weeks * 5 // 5 working days per week
  let date = new Date()
  let added = 0
  while (added < workingDays) {
    date.setDate(date.getDate() + 1)
    const day = date.getDay()
    if (day !== 0 && day !== 6) added++ // only count weekdays
  }
  return date.toISOString().split('T')[0]
}

interface Proposal {
  id: string; clientId: string; title: string; description: string; budget: number; status: string; projectRef?: string; currency?: string; timeline?: string; createdAt: string
  client?: { id: string; name: string; email: string; phone?: string; company?: string }
}

interface Stats { total: number; byStatus: Record<string, number> }

const LEAD_STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  CONTACTED: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  RESPONDED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  IGNORED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  QUALIFIED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CONVERTED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CLOSED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
}

export default function Proposals() {
  const [activeView, setActiveView] = useState<'incoming' | 'proposals'>('incoming')
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [startProjectProposal, setStartProjectProposal] = useState<Proposal | null>(null)

  // ── Incoming website proposals (Leads type=PROPOSAL) ──
  const [incomingLeads, setIncomingLeads] = useState<any[]>([])
  const [incomingLoading, setIncomingLoading] = useState(true)
  const [incomingSearch, setIncomingSearch] = useState('')
  const [incomingStatusFilter, setIncomingStatusFilter] = useState('All')
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null)
  const [respondingLeadId, setRespondingLeadId] = useState<string | null>(null)
  const [leadResponseText, setLeadResponseText] = useState('')
  const [leadSending, setLeadSending] = useState(false)
  const [startProjectLead, setStartProjectLead] = useState<any>(null)
  const [confirmAction, setConfirmAction] = useState<{ type: 'leadIgnore' | 'leadUnignore' | 'leadDelete' | 'proposalStatus' | 'proposalDelete'; id: string; name?: string; status?: string } | null>(null)

  const fetchIncoming = useCallback(async () => {
    try {
      const { data } = await getInquiries({ type: 'PROPOSAL' })
      setIncomingLeads(data?.data || [])
    } catch { /* */ } finally { setIncomingLoading(false) }
  }, [])

  const fetchData = useCallback(async () => {
    try {
      const params: Record<string, string> = {}
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      const [propRes, statsRes] = await Promise.all([getProposals(params), getProposalStats()])
      setProposals(propRes.data?.data || [])
      setStats(statsRes.data?.data || null)
    } catch { /* */ } finally { setLoading(false) }
  }, [search, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { fetchIncoming() }, [fetchIncoming])
  useDashboardSocket((event) => { if (event === 'inquiry:new' || event === 'inquiry:update') fetchIncoming() })

  // ── Incoming lead actions ──
  const handleLeadRespond = async (id: string) => {
    if (!leadResponseText.trim()) return
    setLeadSending(true)
    try {
      await respondToInquiry(id, leadResponseText)
      setRespondingLeadId(null)
      setLeadResponseText('')
      fetchIncoming()
    } catch { /* */ } finally { setLeadSending(false) }
  }

  const handleLeadIgnore = async (id: string) => {
    await ignoreInquiry(id)
    fetchIncoming()
  }

  const handleLeadUnignore = async (id: string) => {
    await unignoreInquiry(id)
    fetchIncoming()
  }

  const handleLeadDelete = async (id: string) => {
    await deleteInquiry(id)
    fetchIncoming()
  }

  // ── Admin proposal actions ──
  const handleStatusChange = async (id: string, status: string) => {
    await updateProposalStatus(id, status)
    fetchData()
  }

  const handleDelete = async (id: string) => {
    await deleteProposal(id)
    fetchData()
  }

  const executeConfirm = () => {
    if (!confirmAction) return
    if (confirmAction.type === 'leadIgnore') handleLeadIgnore(confirmAction.id)
    else if (confirmAction.type === 'leadUnignore') handleLeadUnignore(confirmAction.id)
    else if (confirmAction.type === 'leadDelete') handleLeadDelete(confirmAction.id)
    else if (confirmAction.type === 'proposalStatus') handleStatusChange(confirmAction.id, confirmAction.status!)
    else if (confirmAction.type === 'proposalDelete') handleDelete(confirmAction.id)
    setConfirmAction(null)
  }

  // ── Filtered incoming leads ──
  const filteredIncoming = incomingLeads.filter(l => {
    const matchSearch = (l.name || '').toLowerCase().includes(incomingSearch.toLowerCase()) ||
      (l.email || '').toLowerCase().includes(incomingSearch.toLowerCase()) ||
      (l.message || '').toLowerCase().includes(incomingSearch.toLowerCase()) ||
      (l.service || '').toLowerCase().includes(incomingSearch.toLowerCase())
    const matchStatus = incomingStatusFilter === 'All' || (l.status || 'NEW') === incomingStatusFilter
    return matchSearch && matchStatus
  })

  const incomingNewCount = incomingLeads.filter(l => !l.status || l.status === 'NEW').length
  const incomingRespondedCount = incomingLeads.filter(l => l.status === 'RESPONDED').length
  const incomingIgnoredCount = incomingLeads.filter(l => l.status === 'IGNORED').length
  const incomingFilterOptions = ['All', ...new Set(incomingLeads.map(l => l.status || 'NEW'))]

  const statusConfig: Record<string, { icon: any; color: string; bg: string; border: string }> = {
    PENDING: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    ACCEPTED: { icon: Check, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    STARTED: { icon: Rocket, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    REJECTED: { icon: EyeOff, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><FileText className="w-7 h-7 text-orange-400" /> Proposals</h1>
          <p className="text-slate-400 text-sm mt-1">Incoming project requests & client proposals</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-medium text-sm">
          <Plus size={16} /> New Proposal
        </motion.button>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 p-1 bg-slate-900/50 border border-white/[0.06] rounded-xl w-fit">
        <button onClick={() => setActiveView('incoming')} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeView === 'incoming' ? 'bg-gradient-to-r from-orange-500/20 to-rose-500/20 text-orange-400 border border-orange-500/20' : 'text-slate-500 hover:text-slate-300'}`}>
          <Inbox size={14} /> Incoming Requests
          {incomingNewCount > 0 && <span className="bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full text-[10px] font-bold">{incomingNewCount}</span>}
        </button>
        <button onClick={() => setActiveView('proposals')} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeView === 'proposals' ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-400 border border-cyan-500/20' : 'text-slate-500 hover:text-slate-300'}`}>
          <FileSignature size={14} /> Client Proposals
          {stats && stats.byStatus?.PENDING > 0 && <span className="bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full text-[10px] font-bold">{stats.byStatus.PENDING}</span>}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════
         INCOMING REQUESTS (Website "Start a Project" submissions)
         ═══════════════════════════════════════════════════════════ */}
      {activeView === 'incoming' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total', value: incomingLeads.length, color: 'orange' },
              { label: 'New', value: incomingNewCount, color: 'cyan' },
              { label: 'Responded', value: incomingRespondedCount, color: 'emerald' },
              { label: 'Ignored', value: incomingIgnoredCount, color: 'slate' },
            ].map(s => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/50 border border-white/[0.06] rounded-2xl p-4">
                <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                <p className={`text-2xl font-bold text-${s.color}-400`}>{s.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input value={incomingSearch} onChange={e => setIncomingSearch(e.target.value)} placeholder="Search project requests..." className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/[0.06] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/30" />
            </div>
            <div className="flex flex-wrap gap-2">
              {incomingFilterOptions.map(s => (
                <button key={s} onClick={() => setIncomingStatusFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${incomingStatusFilter === s ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.06]'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Incoming List */}
          {incomingLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-slate-900/50 rounded-2xl animate-pulse border border-white/[0.06]" />)}</div>
          ) : filteredIncoming.length === 0 ? (
            <div className="text-center py-20 text-slate-500"><Inbox className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No project requests found</p></div>
          ) : (
            <div className="space-y-3">
              {filteredIncoming.map((lead, i) => {
                const isExpanded = expandedLeadId === lead.id
                const isResponding = respondingLeadId === lead.id
                const status = lead.status || 'NEW'
                const isActionable = !['RESPONDED', 'IGNORED', 'QUALIFIED', 'CLOSED'].includes(status)

                return (
                  <motion.div key={lead.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="bg-slate-900/50 backdrop-blur border border-white/[0.06] rounded-2xl overflow-hidden hover:border-orange-500/15 transition-all">
                    {/* Main row */}
                    <div className="p-4 sm:p-5 cursor-pointer" onClick={() => setExpandedLeadId(isExpanded ? null : lead.id)}>
                      <div className="flex items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 border border-white/10 flex items-center justify-center text-orange-400 font-bold text-sm flex-shrink-0">
                            {(lead.name || '?')[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-white font-semibold text-sm">{lead.name}</h3>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${LEAD_STATUS_COLORS[status] || LEAD_STATUS_COLORS.NEW}`}>{status}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">Start a Project</span>
                            </div>
                            <p className="text-slate-500 text-xs mt-0.5 truncate">{lead.service || lead.message?.slice(0, 60)}</p>
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
                              {lead.service && <span className="text-orange-400">🔧 {lead.service}</span>}
                            </div>

                            {/* Message */}
                            <div className="bg-slate-900/50 border border-white/[0.06] rounded-xl p-3">
                              <p className="text-xs text-slate-500 mb-1 font-medium">Project Description</p>
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
                                <textarea value={leadResponseText} onChange={e => setLeadResponseText(e.target.value)} rows={3} placeholder="Type your response... This will be emailed to the client." className="w-full px-3 py-2.5 bg-slate-800/50 border border-orange-500/20 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/40 resize-none" autoFocus />
                                <div className="flex gap-2">
                                  <button onClick={() => handleLeadRespond(lead.id)} disabled={leadSending || !leadResponseText.trim()} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl text-xs font-medium disabled:opacity-50">
                                    <Send size={12} />{leadSending ? 'Sending...' : 'Send Response'}
                                  </button>
                                  <button onClick={() => { setRespondingLeadId(null); setLeadResponseText('') }} className="px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors">Cancel</button>
                                </div>
                              </motion.div>
                            )}

                            {/* Actions */}
                            {!isResponding && (
                              <div className="flex items-center gap-2 pt-1">
                                {isActionable && (
                                  <>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setRespondingLeadId(lead.id); setLeadResponseText('') }}
                                      className="flex items-center gap-1.5 px-3 py-2 bg-orange-500/10 text-orange-400 rounded-xl text-xs font-medium border border-orange-500/20 hover:bg-orange-500/20 transition-colors">
                                      <Send size={12} /> Respond
                                    </motion.button>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setConfirmAction({ type: 'leadIgnore', id: lead.id, name: lead.name })}
                                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-500/10 text-slate-400 rounded-xl text-xs font-medium border border-slate-500/20 hover:bg-slate-500/20 transition-colors">
                                      <XCircle size={12} /> Ignore
                                    </motion.button>
                                  </>
                                )}
                                {status === 'RESPONDED' && (
                                  <span className="flex items-center gap-1 text-xs text-emerald-400"><Check size={12} /> Responded</span>
                                )}
                                {status === 'IGNORED' && (
                                  <>
                                    <span className="flex items-center gap-1 text-xs text-slate-500"><XCircle size={12} /> Ignored</span>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setConfirmAction({ type: 'leadUnignore', id: lead.id, name: lead.name })}
                                      className="flex items-center gap-1.5 px-3 py-2 bg-cyan-500/10 text-cyan-400 rounded-xl text-xs font-medium border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors">
                                      <RotateCcw size={12} /> Restore
                                    </motion.button>
                                  </>
                                )}
                                {!['QUALIFIED', 'CLOSED'].includes(status) && (
                                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setStartProjectLead(lead)}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs font-medium border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                                    <Rocket size={12} /> Start a Project
                                  </motion.button>
                                )}
                                <div className="flex-1" />
                                <button onClick={() => setConfirmAction({ type: 'leadDelete', id: lead.id, name: lead.name })} className="p-1.5 text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
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
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════
         CLIENT PROPOSALS (Admin-created proposals)
         ═══════════════════════════════════════════════════════════ */}
      {activeView === 'proposals' && (
        <>
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total', value: stats.total, icon: BarChart3, color: 'cyan' },
                { label: 'Pending', value: stats.byStatus?.PENDING || 0, icon: Clock, color: 'amber' },
                { label: 'Started', value: stats.byStatus?.STARTED || 0, icon: Rocket, color: 'violet' },
                { label: 'Ignored', value: stats.byStatus?.REJECTED || 0, icon: EyeOff, color: 'slate' },
              ].map(s => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`bg-slate-900/50 border border-white/[0.06] rounded-2xl p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <s.icon size={14} className={`text-${s.color}-400`} />
                    <span className="text-xs text-slate-500">{s.label}</span>
                  </div>
                  <p className={`text-2xl font-bold text-${s.color}-400`}>{s.value}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search proposals..." className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/[0.06] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/30" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-slate-900/50 border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none">
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Responded</option>
              <option value="STARTED">Started</option>
              <option value="REJECTED">Ignored</option>
            </select>
          </div>

          {/* Proposals List */}
          {loading ? (
            <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-slate-900/50 rounded-2xl animate-pulse border border-white/[0.06]" />)}</div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-20 text-slate-500"><FileText className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No proposals found</p></div>
          ) : (
            <div className="space-y-3">
              {proposals.map((p, i) => {
                const sc = statusConfig[p.status] || statusConfig.PENDING
                return (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="bg-slate-900/50 backdrop-blur border border-white/[0.06] rounded-2xl p-5 hover:border-orange-500/20 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold text-sm truncate">{p.title}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${sc.bg} ${sc.color} ${sc.border} flex items-center gap-1`}>
                            <sc.icon size={10} />{p.status}
                          </span>
                        </div>
                        <p className="text-slate-500 text-xs line-clamp-2 mb-2">{p.description}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><DollarSign size={12} className="text-emerald-400" />${p.budget?.toLocaleString()}</span>
                          {p.client && <span>Client: <span className="text-white">{p.client.name}</span>{p.client.company && ` (${p.client.company})`}</span>}
                          {p.projectRef && <span>Project: <span className="text-cyan-400">{p.projectRef}</span></span>}
                          <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {p.status === 'PENDING' && (
                          <>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setConfirmAction({ type: 'proposalStatus', id: p.id, name: p.title, status: 'ACCEPTED' })} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs font-medium border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                              <Mail size={12} /> Respond
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setConfirmAction({ type: 'proposalStatus', id: p.id, name: p.title, status: 'REJECTED' })} className="flex items-center gap-1.5 px-3 py-2 bg-slate-500/10 text-slate-400 rounded-xl text-xs font-medium border border-slate-500/20 hover:bg-slate-500/20 transition-colors">
                              <EyeOff size={12} /> Ignore
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setStartProjectProposal(p)} className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-400 rounded-xl text-xs font-medium border border-cyan-500/20 hover:from-cyan-500/30 hover:to-violet-500/30 transition-colors">
                              <Rocket size={12} /> Start Project
                            </motion.button>
                          </>
                        )}
                        {p.status === 'ACCEPTED' && (
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setStartProjectProposal(p)} className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-400 rounded-xl text-xs font-medium border border-cyan-500/20 hover:from-cyan-500/30 hover:to-violet-500/30 transition-colors">
                            <Rocket size={12} /> Start Project
                          </motion.button>
                        )}
                        {p.status === 'STARTED' && p.projectRef && (
                          <span className="flex items-center gap-1.5 px-3 py-2 bg-cyan-500/10 text-cyan-400 rounded-xl text-xs font-medium border border-cyan-500/20">
                            <Rocket size={12} /> In Projects
                          </span>
                        )}
                        {p.status === 'REJECTED' && (
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setConfirmAction({ type: 'proposalStatus', id: p.id, name: p.title, status: 'PENDING' })}
                            className="flex items-center gap-1.5 px-3 py-2 bg-cyan-500/10 text-cyan-400 rounded-xl text-xs font-medium border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors">
                            <RotateCcw size={12} /> Restore
                          </motion.button>
                        )}
                        <button onClick={() => setConfirmAction({ type: 'proposalDelete', id: p.id, name: p.title })} className="p-2 text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && <ProposalModal onClose={() => setShowModal(false)} onSave={fetchData} />}
      </AnimatePresence>

      {/* Start Project Modal */}
      <AnimatePresence>
        {startProjectProposal && <StartProjectModal proposal={startProjectProposal} onClose={() => setStartProjectProposal(null)} onSave={fetchData} />}
      </AnimatePresence>

      {/* Start Project from Lead Modal */}
      <AnimatePresence>
        {startProjectLead && <StartProjectFromInquiryModal lead={startProjectLead} onClose={() => setStartProjectLead(null)} onSave={() => { fetchIncoming(); fetchData() }} />}
      </AnimatePresence>

      <ConfirmModal
        open={!!confirmAction}
        title={confirmAction?.type === 'leadDelete' || confirmAction?.type === 'proposalDelete' ? 'Delete' : confirmAction?.type === 'leadIgnore' ? 'Ignore Request' : confirmAction?.type === 'leadUnignore' ? 'Restore Request' : confirmAction?.status === 'ACCEPTED' ? 'Accept Proposal' : confirmAction?.status === 'PENDING' ? 'Restore Proposal' : 'Reject Proposal'}
        message={
          confirmAction?.type === 'leadDelete' ? `Are you sure you want to delete the request from "${confirmAction?.name || 'this contact'}"? This cannot be undone.`
          : confirmAction?.type === 'proposalDelete' ? `Are you sure you want to delete proposal "${confirmAction?.name}"? This cannot be undone.`
          : confirmAction?.type === 'leadIgnore' ? `Are you sure you want to ignore the request from "${confirmAction?.name || 'this contact'}"?`
          : confirmAction?.type === 'leadUnignore' ? `Restore the request from "${confirmAction?.name || 'this contact'}" back to New status?`
          : confirmAction?.status === 'ACCEPTED' ? `Respond to and accept proposal "${confirmAction?.name}"?`
          : confirmAction?.status === 'PENDING' ? `Restore proposal "${confirmAction?.name}" back to Pending status?`
          : `Ignore/reject proposal "${confirmAction?.name}"?`
        }
        confirmText={confirmAction?.type?.includes('Delete') ? 'Delete' : confirmAction?.type === 'leadIgnore' ? 'Ignore' : confirmAction?.type === 'leadUnignore' || confirmAction?.status === 'PENDING' ? 'Restore' : confirmAction?.status === 'ACCEPTED' ? 'Accept' : 'Reject'}
        variant={confirmAction?.type?.includes('Delete') || confirmAction?.type === 'leadIgnore' || confirmAction?.status === 'REJECTED' ? 'danger' : 'info'}
        onConfirm={executeConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  )
}

function ProposalModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ clientId: '', clientName: '', title: '', description: '', budget: 0, currency: 'USD', timeline: '', projectRef: '' })
  const [clients, setClients] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => { getClients().then(r => setClients(r.data?.data || [])).catch(() => {}) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createProposal({ ...form, budget: Number(form.budget) })
      onSave()
      onClose()
    } catch { /* */ } finally { setSaving(false) }
  }

  const inputCls = "w-full px-3 py-2.5 bg-slate-800/50 border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-orange-500/30"
  const labelCls = "text-xs text-slate-500 mb-1 block"

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-slate-900 border border-white/[0.06] rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <h2 className="text-lg font-bold text-white">New Proposal</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div><label className={labelCls}>Title *</label><input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={inputCls} placeholder="E.g., AI Dashboard Development" /></div>
          <div><label className={labelCls}>Description *</label><textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className={`${inputCls} resize-none`} placeholder="Describe the scope of work..." /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className={labelCls}>Budget *</label><input required type="number" min={0} value={form.budget} onChange={e => setForm({...form, budget: +e.target.value})} className={inputCls} /></div>
            <div>
              <label className={labelCls}>Currency</label>
              <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className={inputCls}>
                <option value="USD">USD ($)</option><option value="PKR">PKR (₨)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div><label className={labelCls}>Timeline (weeks)</label><input type="number" min={0} value={form.timeline} onChange={e => setForm({...form, timeline: e.target.value})} className={inputCls} placeholder="e.g. 4" /></div>
          </div>
          <div><label className={labelCls}>Project Ref (optional)</label><input value={form.projectRef} onChange={e => setForm({...form, projectRef: e.target.value})} className={inputCls} placeholder="PROJ-001" /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl text-sm font-medium disabled:opacity-50">{saving ? 'Sending...' : 'Send Proposal'}</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ─── Start Project Modal ─────────────────────────────────────────────────────

interface NewMember { name: string; email: string; countryCode: string; phone: string; role: string; confirmed?: boolean }

const ROLE_OPTIONS = [
  'Developer', 'AI Engineer', 'Team Lead', 'Software Engineer',
  'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
  'DevOps Engineer', 'QA Engineer', 'UI/UX Designer', 'Data Scientist',
  'Project Manager', 'Business Analyst', 'ML Engineer', 'Cloud Architect',
]

const COST_CURRENCIES = ['USD', 'PKR', 'EUR', 'GBP', 'AED', 'SAR', 'INR', 'AUD', 'CAD', 'CNY']

function useExchangeRates() {
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 })
  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(r => r.json())
      .then(data => { if (data?.rates) setRates(data.rates) })
      .catch(() => {})
  }, [])
  const toUSD = (amount: number, currency: string) => {
    if (currency === 'USD' || !rates[currency]) return amount
    return amount / rates[currency]
  }
  return { rates, toUSD }
}

function StartProjectModal({ proposal, onClose, onSave }: { proposal: Proposal; onClose: () => void; onSave: () => void }) {
  const initTimeline = proposal.timeline || ''
  const { rates, toUSD } = useExchangeRates()
  const [form, setForm] = useState({
    title: proposal.title, description: proposal.description, budget: proposal.budget,
    currency: proposal.currency || 'USD', timeline: initTimeline, deadline: initTimeline ? calcDeadlineWithWeekends(parseInt(initTimeline)) : '',
    fiverrEnabled: true, fiverrFeePercent: 20, zakatEnabled: true, zakatPercent: 2.5, otherCosts: [] as { label: string; amount: number; currency: string; enabled: boolean }[],
    amountReceived: true,
  })
  const [memberIds, setMemberIds] = useState<string[]>([])
  const [memberRoles, setMemberRoles] = useState<Record<string, string>>({})  
  const [newMembers, setNewMembers] = useState<NewMember[]>([])
  const [confirmedNew, setConfirmedNew] = useState<NewMember[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'details' | 'members' | 'finance'>('details')
  const [financeVisited, setFinanceVisited] = useState(false)
  useEffect(() => {
    getEmployees().then(r => {
      const emps = r.data?.data || []
      setEmployees(emps)
      const founder = emps.find((e: any) => e.isFounder || e.email === 'raleem811811@gmail.com')
      if (founder) {
        setMemberIds(prev => prev.includes(founder.id) ? prev : [...prev, founder.id])
        setMemberRoles(prev => ({ ...prev, [founder.id]: 'Team Lead' }))
      }
    }).catch(() => {})
  }, [])

  const fiverrDed = form.fiverrEnabled ? form.budget * (form.fiverrFeePercent / 100) : 0
  const zakatDed = form.zakatEnabled ? form.budget * (form.zakatPercent / 100) : 0
  const otherTotal = form.otherCosts.reduce((s, c) => s + (c.enabled ? toUSD(c.amount || 0, c.currency || 'USD') : 0), 0)
  const totalDeductions = fiverrDed + zakatDed + otherTotal
  const netAmount = form.budget - totalDeductions
  const totalMembers = memberIds.length + newMembers.filter(m => m.confirmed).length + confirmedNew.length
  const sharePerPerson = totalMembers > 0 ? netAmount / totalMembers : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const missing = missingSteps()
    if (missing.length > 0) { alert(`Please complete: ${missing.join(' & ')} before starting the project.`); setTab(totalMembers === 0 ? 'members' : 'finance'); return }
    setSaving(true)
    try {
      const allNew = [...confirmedNew, ...newMembers.filter(m => m.confirmed)].map(m => ({ ...m, phone: `${m.countryCode}${m.phone}` }))
      await startProjectFromProposal(proposal.id, { ...form, memberIds, memberRoles, newMembers: allNew })
      onSave()
      onClose()
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to start project')
    } finally { setSaving(false) }
  }

  const missingSteps = () => {
    const missing: string[] = []
    if (totalMembers === 0) missing.push('Members')
    if (!financeVisited) missing.push('Finance')
    return missing
  }

  const toggleMember = (id: string) => {
    setMemberIds(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id])
    if (!memberRoles[id]) setMemberRoles(prev => ({ ...prev, [id]: 'Developer' }))
  }
  const setMemberRole = (id: string, role: string) => setMemberRoles(prev => ({ ...prev, [id]: role }))
  const addNewMember = () => setNewMembers(prev => [...prev, { name: '', email: '', countryCode: '+92', phone: '', role: 'Developer' }])
  const updateNewMember = (i: number, field: keyof NewMember, value: string) => setNewMembers(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m))
  const removeNewMember = (i: number) => setNewMembers(prev => prev.filter((_, idx) => idx !== i))
  const confirmNewMember = (i: number) => {
    const m = newMembers[i]
    if (!m) return
    const missing: string[] = []
    if (!m.name.trim()) missing.push('Name')
    if (!m.email.trim()) missing.push('Email')
    if (missing.length > 0) { alert(`Please fill: ${missing.join(' & ')}`); return }
    setConfirmedNew(prev => [...prev, { ...m, confirmed: true }])
    setNewMembers(prev => prev.filter((_, idx) => idx !== i))
  }
  const removeConfirmedNew = (i: number) => setConfirmedNew(prev => prev.filter((_, idx) => idx !== i))
  const addOtherCost = () => setForm(f => ({ ...f, otherCosts: [...f.otherCosts, { label: '', amount: 0, currency: 'USD', enabled: false }] }))
  const updateOtherCost = (i: number, field: 'label' | 'amount' | 'currency', value: string | number) => setForm(f => ({ ...f, otherCosts: f.otherCosts.map((c, idx) => idx === i ? { ...c, [field]: value } : c) }))
  const removeOtherCost = (i: number) => setForm(f => ({ ...f, otherCosts: f.otherCosts.filter((_, idx) => idx !== i) }))
  const toggleOtherCost = (i: number) => setForm(f => ({ ...f, otherCosts: f.otherCosts.map((c, idx) => idx === i ? { ...c, enabled: !c.enabled } : c) }))

  const inputCls = 'w-full px-3 py-2.5 bg-slate-800/50 border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/30'
  const labelCls = 'text-xs text-slate-500 mb-1 block'
  const tabCls = (t: string) => `px-4 py-2 text-xs font-medium rounded-xl transition-all ${tab === t ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20' : 'text-slate-500 hover:text-white'}`

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-slate-900 border border-white/[0.06] rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06] flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Rocket size={18} className="text-cyan-400" /> Start Project</h2>
            <p className="text-xs text-slate-500 mt-0.5">From proposal: {proposal.title} · Client: {proposal.client?.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-5 pt-4 flex-shrink-0">
          <button onClick={() => setTab('details')} className={tabCls('details')}>Details</button>
          <button onClick={() => setTab('members')} className={tabCls('members')}>
            <span className="flex items-center gap-1.5"><Users size={12} /> Members {totalMembers > 0 ? <span className="bg-cyan-500/20 text-cyan-400 px-1.5 rounded-full text-[10px]">{totalMembers}</span> : <span className="bg-red-500/20 text-red-400 px-1.5 rounded-full text-[10px]">!</span>}</span>
          </button>
          <button onClick={() => { setTab('finance'); setFinanceVisited(true) }} className={tabCls('finance')}>
            <span className="flex items-center gap-1.5"><Calculator size={12} /> Finance {financeVisited ? <span className="text-emerald-400"><Check size={10} /></span> : <span className="bg-red-500/20 text-red-400 px-1.5 rounded-full text-[10px]">!</span>}</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
          {tab === 'details' && (
            <>
              <div><label className={labelCls}>Project Title *</label><input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls} /></div>
              <div><label className={labelCls}>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className={`${inputCls} resize-none`} /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className={labelCls}>Budget *</label><input required type="number" min={0} value={form.budget} onChange={e => setForm({ ...form, budget: +e.target.value })} className={inputCls} /></div>
                <div>
                  <label className={labelCls}>Currency</label>
                  <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className={inputCls}>
                    <option value="USD">USD ($)</option>
                    <option value="PKR">PKR (₨)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div><label className={labelCls}>Timeline (weeks)</label><input type="number" min={0} value={form.timeline} onChange={e => {
                  const weeks = e.target.value
                  const deadline = weeks ? calcDeadlineWithWeekends(parseInt(weeks)) : form.deadline
                  setForm({ ...form, timeline: weeks, deadline })
                }} className={inputCls} placeholder="e.g. 4" /></div>
              </div>
              <div><label className={labelCls}>Deadline</label><input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className={inputCls} /></div>
            </>
          )}

          {tab === 'members' && (
            <>
              <div>
                <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Select Existing Members</h3>
                {employees.length === 0 && confirmedNew.length === 0 ? (
                  <p className="text-xs text-slate-600">No team members found.</p>
                ) : (
                  <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
                    {employees.map((emp: any) => {
                      const isF = emp.isFounder || emp.email === 'raleem811811@gmail.com'
                      const isSelected = memberIds.includes(emp.id)
                      return (
                        <div key={emp.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${isSelected ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-slate-800/30 border-white/[0.04] hover:border-white/[0.08]'}`}>
                          <input type="checkbox" checked={isSelected} onChange={() => !isF && toggleMember(emp.id)} disabled={isF} className="accent-cyan-500 shrink-0 cursor-pointer" />
                          <span className="text-sm text-white truncate flex-1">{emp.name}</span>
                          {isF && <span className="text-[9px] bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded-full shrink-0">Founder ⭐</span>}
                          {isSelected && (
                            <select value={memberRoles[emp.id] || 'Developer'} onChange={e => setMemberRole(emp.id, e.target.value)} onClick={e => e.stopPropagation()} className="px-2 py-1 bg-slate-800/80 border border-white/[0.08] rounded-lg text-[11px] text-cyan-400 focus:outline-none focus:border-cyan-500/30 shrink-0">
                              {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          )}
                          {!isSelected && <span className="text-[10px] text-slate-500 truncate shrink-0">{emp.role || 'Developer'}</span>}
                          <span className="text-[10px] text-slate-600 truncate shrink-0">{emp.email}</span>
                        </div>
                      )
                    })}
                    {confirmedNew.map((m, i) => (
                      <div key={`new-${i}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all bg-emerald-500/10 border-emerald-500/20">
                        <input type="checkbox" checked={true} onChange={() => removeConfirmedNew(i)} className="accent-emerald-500 shrink-0 cursor-pointer" />
                        <span className="text-sm text-white truncate flex-1">{m.name}</span>
                        <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded-full shrink-0">New ✓</span>
                        <span className="text-[10px] text-cyan-400 shrink-0">{m.role}</span>
                        <span className="text-[10px] text-slate-600 truncate shrink-0">{m.email}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Add New Members</h3>
                  <button type="button" onClick={addNewMember} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-xl hover:bg-cyan-500/20 transition-colors">
                    <UserPlus size={12} /> Add
                  </button>
                </div>
                {newMembers.map((m, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-center rounded-xl px-1 py-1 transition-all">
                    <input value={m.name} onChange={e => updateNewMember(i, 'name', e.target.value)} placeholder="Name" className={`${inputCls} col-span-2`} />
                    <input value={m.email} onChange={e => updateNewMember(i, 'email', e.target.value)} placeholder="Email" className={`${inputCls} col-span-3`} />
                    <div className="col-span-3 flex gap-1">
                      <select value={m.countryCode} onChange={e => updateNewMember(i, 'countryCode', e.target.value)} className="w-20 px-1 py-2.5 bg-slate-800/50 border border-white/[0.06] rounded-xl text-xs text-white focus:outline-none">
                        <option value="+92">🇵🇰+92</option><option value="+1">🇺🇸+1</option><option value="+44">🇬🇧+44</option><option value="+971">🇦🇪+971</option><option value="+966">🇸🇦+966</option><option value="+91">🇮🇳+91</option><option value="+61">🇦🇺+61</option><option value="+49">🇩🇪+49</option><option value="+33">🇫🇷+33</option><option value="+86">🇨🇳+86</option>
                      </select>
                      <input value={m.phone} onChange={e => updateNewMember(i, 'phone', e.target.value)} placeholder="3151664843" className={`${inputCls} flex-1`} />
                    </div>
                    <select value={m.role} onChange={e => updateNewMember(i, 'role', e.target.value)} className={`${inputCls} col-span-2`}>
                      {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <div className="col-span-2 flex items-center justify-center gap-1">
                      <button type="button" onClick={() => confirmNewMember(i)} className="p-1.5 rounded-lg transition-all text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10" title="Confirm & add to team">
                        <Check size={14} />
                      </button>
                      <button type="button" onClick={() => removeNewMember(i)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Remove">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'finance' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`${labelCls} flex items-center gap-2`}>
                    <input type="checkbox" checked={form.fiverrEnabled} onChange={e => setForm({ ...form, fiverrEnabled: e.target.checked })} className="accent-cyan-500" />
                    <Percent size={12} className="inline" /> Fiverr Fee ({form.fiverrFeePercent}%)
                  </label>
                  {form.fiverrEnabled && <input type="number" min={0} max={100} step={0.1} value={form.fiverrFeePercent} onChange={e => setForm({ ...form, fiverrFeePercent: +e.target.value })} className={inputCls} />}
                </div>
                <div>
                  <label className={`${labelCls} flex items-center gap-2`}>
                    <input type="checkbox" checked={form.zakatEnabled} onChange={e => setForm({ ...form, zakatEnabled: e.target.checked })} className="accent-emerald-500" />
                    Zakat ({form.zakatPercent}%)
                  </label>
                  {form.zakatEnabled && <input type="number" min={0} max={100} step={0.1} value={form.zakatPercent} onChange={e => setForm({ ...form, zakatPercent: +e.target.value })} className={inputCls} />}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelCls}>Other Deductions</label>
                  <button type="button" onClick={addOtherCost} className="text-xs text-cyan-400 hover:text-cyan-300">+ Add</button>
                </div>
                {form.otherCosts.map((c, i) => (
                  <div key={i} className={`grid grid-cols-12 gap-2 mb-2 items-center rounded-xl px-1 py-1 transition-all ${c.enabled ? 'bg-emerald-500/5 ring-1 ring-emerald-500/20' : ''}`}>
                    <input value={c.label} onChange={e => updateOtherCost(i, 'label', e.target.value)} placeholder="Expense detail" className={`${inputCls} col-span-4`} />
                    <select value={c.currency} onChange={e => updateOtherCost(i, 'currency', e.target.value)} className="col-span-1 px-1 py-2.5 bg-slate-800/50 border border-white/[0.06] rounded-xl text-xs text-white focus:outline-none">
                      {COST_CURRENCIES.map(cur => <option key={cur} value={cur}>{cur}</option>)}
                    </select>
                    <input type="number" value={c.amount} onChange={e => updateOtherCost(i, 'amount', +e.target.value)} placeholder="Amount" className={`${inputCls} col-span-3`} />
                    <div className="col-span-2 flex items-center justify-center">
                      {c.currency !== 'USD' && c.amount > 0 && (
                        <span className="text-[10px] text-slate-500 whitespace-nowrap">≈ ${toUSD(c.amount, c.currency).toFixed(2)}</span>
                      )}
                    </div>
                    <div className="col-span-2 flex items-center justify-center gap-1">
                      <button type="button" onClick={() => toggleOtherCost(i)} className={`p-1.5 rounded-lg transition-all ${c.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10'}`} title={c.enabled ? 'Included' : 'Click to include'}>
                        <Check size={14} />
                      </button>
                      <button type="button" onClick={() => removeOtherCost(i)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Remove">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="bg-slate-800/50 rounded-xl border border-white/[0.06] p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Total Budget</span><span className="text-white font-medium">{form.currency} {form.budget.toLocaleString()}</span></div>
                {form.fiverrEnabled && form.fiverrFeePercent > 0 && <div className="flex justify-between"><span className="text-slate-500">Fiverr Fee ({form.fiverrFeePercent}%)</span><span className="text-red-400">-{fiverrDed.toLocaleString()}</span></div>}
                {form.zakatEnabled && <div className="flex justify-between"><span className="text-slate-500">Zakat ({form.zakatPercent}%)</span><span className="text-red-400">-{zakatDed.toLocaleString()}</span></div>}
                {form.otherCosts.filter(c => c.enabled && c.amount > 0).map((c, i) => <div key={i} className="flex justify-between"><span className="text-slate-500">{c.label || 'Other'} {c.currency !== 'USD' ? `(${c.currency} ${c.amount.toLocaleString()})` : ''}</span><span className="text-red-400">-${toUSD(c.amount, c.currency).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>)}
                <div className="border-t border-white/[0.06] pt-2 flex justify-between"><span className="text-slate-400 font-medium">Net Amount</span><span className="text-emerald-400 font-bold">{form.currency} {netAmount.toLocaleString()}</span></div>
                {totalMembers > 0 && <div className="flex justify-between"><span className="text-slate-400">Share/person ({totalMembers} members)</span><span className="text-cyan-400 font-medium">{form.currency} {sharePerPerson.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>}
                <div className="border-t border-white/[0.06] pt-2 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={form.amountReceived} onChange={e => setForm(f => ({ ...f, amountReceived: e.target.checked }))} className="w-4 h-4 rounded border-white/20 bg-slate-800 text-emerald-500 focus:ring-0 accent-emerald-500" />
                    <span className="text-sm text-slate-400">Amount Received</span>
                  </label>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${form.amountReceived ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{form.amountReceived ? 'Received' : 'Pending'}</span>
                </div>
              </div>
            </>
          )}
        </form>

        {/* Footer */}
        <div className="flex justify-between items-center gap-3 p-5 border-t border-white/[0.06] flex-shrink-0">
          <div className="text-xs text-slate-500">
            {totalMembers > 0 && <span className="text-cyan-400">{totalMembers} members</span>}
            {totalMembers > 0 && netAmount > 0 && <span> · {form.currency} {sharePerPerson.toFixed(0)}/person</span>}
            {missingSteps().length > 0 && <span className="text-red-400 ml-2">Required: {missingSteps().join(', ')}</span>}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={saving || missingSteps().length > 0} className={`px-6 py-2.5 text-white rounded-xl text-sm font-medium disabled:opacity-40 flex items-center gap-2 transition-all ${missingSteps().length > 0 ? 'bg-slate-700 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-500 to-violet-500'}`}>
              {saving ? 'Starting...' : <><Rocket size={14} /> Start Project</>}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function StartProjectFromInquiryModal({ lead, onClose, onSave }: { lead: any; onClose: () => void; onSave: () => void }) {
  const parseBudget = (b: string | number | undefined) => { if (!b) return 0; const n = parseFloat(String(b).replace(/[^0-9.]/g, '')); return isNaN(n) ? 0 : n }
  const parseTimeline = (t: string | undefined) => { if (!t) return ''; const n = parseInt(String(t).replace(/[^0-9]/g, '')); return isNaN(n) ? '' : String(n) }

  const initTimeline = parseTimeline(lead.timeline)
  const { rates, toUSD } = useExchangeRates()
  const [form, setForm] = useState({
    title: lead.service || `Project for ${lead.name}`, description: lead.message || '', budget: parseBudget(lead.budget),
    currency: 'USD', timeline: initTimeline, deadline: initTimeline ? calcDeadlineWithWeekends(parseInt(initTimeline)) : '',
    fiverrEnabled: true, fiverrFeePercent: 20, zakatEnabled: true, zakatPercent: 2.5, otherCosts: [] as { label: string; amount: number; currency: string; enabled: boolean }[],
    amountReceived: true,
  })
  const [memberIds, setMemberIds] = useState<string[]>([])
  const [memberRoles, setMemberRoles] = useState<Record<string, string>>({})  
  const [newMembers, setNewMembers] = useState<NewMember[]>([])
  const [confirmedNew, setConfirmedNew] = useState<NewMember[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'details' | 'members' | 'finance'>('details')
  const [financeVisited, setFinanceVisited] = useState(false)
  useEffect(() => {
    getEmployees().then(r => {
      const emps = r.data?.data || []
      setEmployees(emps)
      const founder = emps.find((e: any) => e.isFounder || e.email === 'raleem811811@gmail.com')
      if (founder) {
        setMemberIds(prev => prev.includes(founder.id) ? prev : [...prev, founder.id])
        setMemberRoles(prev => ({ ...prev, [founder.id]: 'Team Lead' }))
      }
    }).catch(() => {})
  }, [])

  const fiverrDed = form.fiverrEnabled ? form.budget * (form.fiverrFeePercent / 100) : 0
  const zakatDed = form.zakatEnabled ? form.budget * (form.zakatPercent / 100) : 0
  const otherTotal = form.otherCosts.reduce((s, c) => s + (c.enabled ? toUSD(c.amount || 0, c.currency || 'USD') : 0), 0)
  const totalDeductions = fiverrDed + zakatDed + otherTotal
  const netAmount = form.budget - totalDeductions
  const totalMembers = memberIds.length + newMembers.filter(m => m.confirmed).length + confirmedNew.length
  const sharePerPerson = totalMembers > 0 ? netAmount / totalMembers : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const missing = missingSteps()
    if (missing.length > 0) { alert(`Please complete: ${missing.join(' & ')} before starting the project.`); setTab(totalMembers === 0 ? 'members' : 'finance'); return }
    setSaving(true)
    try {
      const allNew = [...confirmedNew, ...newMembers.filter(m => m.confirmed)].map(m => ({ ...m, phone: `${m.countryCode}${m.phone}` }))
      await startProjectFromInquiry(lead.id, { ...form, memberIds, memberRoles, newMembers: allNew })
      onSave()
      onClose()
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to start project')
    } finally { setSaving(false) }
  }

  const missingSteps = () => {
    const missing: string[] = []
    if (totalMembers === 0) missing.push('Members')
    if (!financeVisited) missing.push('Finance')
    return missing
  }

  const toggleMember = (id: string) => {
    setMemberIds(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id])
    if (!memberRoles[id]) setMemberRoles(prev => ({ ...prev, [id]: 'Developer' }))
  }
  const setMemberRole = (id: string, role: string) => setMemberRoles(prev => ({ ...prev, [id]: role }))
  const addNewMember = () => setNewMembers(prev => [...prev, { name: '', email: '', countryCode: '+92', phone: '', role: 'Developer' }])
  const updateNewMember = (i: number, field: keyof NewMember, value: string) => setNewMembers(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m))
  const removeNewMember = (i: number) => setNewMembers(prev => prev.filter((_, idx) => idx !== i))
  const confirmNewMember = (i: number) => {
    const m = newMembers[i]
    if (!m) return
    const missing: string[] = []
    if (!m.name.trim()) missing.push('Name')
    if (!m.email.trim()) missing.push('Email')
    if (missing.length > 0) { alert(`Please fill: ${missing.join(' & ')}`); return }
    setConfirmedNew(prev => [...prev, { ...m, confirmed: true }])
    setNewMembers(prev => prev.filter((_, idx) => idx !== i))
  }
  const removeConfirmedNew = (i: number) => setConfirmedNew(prev => prev.filter((_, idx) => idx !== i))
  const addOtherCost = () => setForm(f => ({ ...f, otherCosts: [...f.otherCosts, { label: '', amount: 0, currency: 'USD', enabled: false }] }))
  const updateOtherCost = (i: number, field: 'label' | 'amount' | 'currency', value: string | number) => setForm(f => ({ ...f, otherCosts: f.otherCosts.map((c, idx) => idx === i ? { ...c, [field]: value } : c) }))
  const removeOtherCost = (i: number) => setForm(f => ({ ...f, otherCosts: f.otherCosts.filter((_, idx) => idx !== i) }))
  const toggleOtherCost = (i: number) => setForm(f => ({ ...f, otherCosts: f.otherCosts.map((c, idx) => idx === i ? { ...c, enabled: !c.enabled } : c) }))

  const inputCls = 'w-full px-3 py-2.5 bg-slate-800/50 border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-orange-500/30'
  const labelCls = 'text-xs text-slate-500 mb-1 block'
  const tabCls = (t: string) => `px-4 py-2 text-xs font-medium rounded-xl transition-all ${tab === t ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20' : 'text-slate-500 hover:text-white'}`

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-slate-900 border border-white/[0.06] rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06] flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Rocket size={18} className="text-orange-400" /> Start Project</h2>
            <p className="text-xs text-slate-500 mt-0.5">From lead: {lead.name} · {lead.email}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-5 pt-4 flex-shrink-0">
          <button onClick={() => setTab('details')} className={tabCls('details')}>Details</button>
          <button onClick={() => setTab('members')} className={tabCls('members')}>
            <span className="flex items-center gap-1.5"><Users size={12} /> Members {totalMembers > 0 ? <span className="bg-orange-500/20 text-orange-400 px-1.5 rounded-full text-[10px]">{totalMembers}</span> : <span className="bg-red-500/20 text-red-400 px-1.5 rounded-full text-[10px]">!</span>}</span>
          </button>
          <button onClick={() => { setTab('finance'); setFinanceVisited(true) }} className={tabCls('finance')}>
            <span className="flex items-center gap-1.5"><Calculator size={12} /> Finance {financeVisited ? <span className="text-emerald-400"><Check size={10} /></span> : <span className="bg-red-500/20 text-red-400 px-1.5 rounded-full text-[10px]">!</span>}</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
          {tab === 'details' && (
            <>
              <div><label className={labelCls}>Project Title *</label><input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls} /></div>
              <div><label className={labelCls}>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className={`${inputCls} resize-none`} /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className={labelCls}>Budget *</label><input required type="number" min={0} value={form.budget} onChange={e => setForm({ ...form, budget: +e.target.value })} className={inputCls} /></div>
                <div>
                  <label className={labelCls}>Currency</label>
                  <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className={inputCls}>
                    <option value="USD">USD ($)</option><option value="PKR">PKR (₨)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div><label className={labelCls}>Timeline (weeks)</label><input type="number" min={0} value={form.timeline} onChange={e => {
                  const weeks = e.target.value
                  const deadline = weeks ? calcDeadlineWithWeekends(parseInt(weeks)) : form.deadline
                  setForm({ ...form, timeline: weeks, deadline })
                }} className={inputCls} placeholder="e.g. 4" /></div>
              </div>
              <div><label className={labelCls}>Deadline</label><input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className={inputCls} /></div>
            </>
          )}

          {tab === 'members' && (
            <>
              <div>
                <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Select Existing Members</h3>
                {employees.length === 0 && confirmedNew.length === 0 ? (
                  <p className="text-xs text-slate-600">No team members found.</p>
                ) : (
                  <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
                    {employees.map((emp: any) => {
                      const isF = emp.isFounder || emp.email === 'raleem811811@gmail.com'
                      const isSelected = memberIds.includes(emp.id)
                      return (
                        <div key={emp.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${isSelected ? 'bg-orange-500/10 border-orange-500/20' : 'bg-slate-800/30 border-white/[0.04] hover:border-white/[0.08]'}`}>
                          <input type="checkbox" checked={isSelected} onChange={() => !isF && toggleMember(emp.id)} disabled={isF} className="accent-orange-500 shrink-0 cursor-pointer" />
                          <span className="text-sm text-white truncate flex-1">{emp.name}</span>
                          {isF && <span className="text-[9px] bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded-full shrink-0">Founder ⭐</span>}
                          {isSelected && (
                            <select value={memberRoles[emp.id] || 'Developer'} onChange={e => setMemberRole(emp.id, e.target.value)} onClick={e => e.stopPropagation()} className="px-2 py-1 bg-slate-800/80 border border-white/[0.08] rounded-lg text-[11px] text-orange-400 focus:outline-none focus:border-orange-500/30 shrink-0">
                              {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          )}
                          {!isSelected && <span className="text-[10px] text-slate-500 truncate shrink-0">{emp.role || 'Developer'}</span>}
                          <span className="text-[10px] text-slate-600 truncate shrink-0">{emp.email}</span>
                        </div>
                      )
                    })}
                    {confirmedNew.map((m, i) => (
                      <div key={`new-${i}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all bg-emerald-500/10 border-emerald-500/20">
                        <input type="checkbox" checked={true} onChange={() => removeConfirmedNew(i)} className="accent-emerald-500 shrink-0 cursor-pointer" />
                        <span className="text-sm text-white truncate flex-1">{m.name}</span>
                        <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded-full shrink-0">New ✓</span>
                        <span className="text-[10px] text-orange-400 shrink-0">{m.role}</span>
                        <span className="text-[10px] text-slate-600 truncate shrink-0">{m.email}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Add New Members</h3>
                  <button type="button" onClick={addNewMember} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-xl hover:bg-orange-500/20 transition-colors">
                    <UserPlus size={12} /> Add
                  </button>
                </div>
                {newMembers.map((m, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-center rounded-xl px-1 py-1 transition-all">
                    <input value={m.name} onChange={e => updateNewMember(i, 'name', e.target.value)} placeholder="Name" className={`${inputCls} col-span-2`} />
                    <input value={m.email} onChange={e => updateNewMember(i, 'email', e.target.value)} placeholder="Email" className={`${inputCls} col-span-3`} />
                    <div className="col-span-3 flex gap-1">
                      <select value={m.countryCode} onChange={e => updateNewMember(i, 'countryCode', e.target.value)} className="w-20 px-1 py-2.5 bg-slate-800/50 border border-white/[0.06] rounded-xl text-xs text-white focus:outline-none">
                        <option value="+92">🇵🇰+92</option><option value="+1">🇺🇸+1</option><option value="+44">🇬🇧+44</option><option value="+971">🇦🇪+971</option><option value="+966">🇸🇦+966</option><option value="+91">🇮🇳+91</option><option value="+61">🇦🇺+61</option><option value="+49">🇩🇪+49</option><option value="+33">🇫🇷+33</option><option value="+86">🇨🇳+86</option>
                      </select>
                      <input value={m.phone} onChange={e => updateNewMember(i, 'phone', e.target.value)} placeholder="3151664843" className={`${inputCls} flex-1`} />
                    </div>
                    <select value={m.role} onChange={e => updateNewMember(i, 'role', e.target.value)} className={`${inputCls} col-span-2`}>
                      {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <div className="col-span-2 flex items-center justify-center gap-1">
                      <button type="button" onClick={() => confirmNewMember(i)} className="p-1.5 rounded-lg transition-all text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10" title="Confirm & add to team">
                        <Check size={14} />
                      </button>
                      <button type="button" onClick={() => removeNewMember(i)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Remove">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'finance' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`${labelCls} flex items-center gap-2`}>
                    <input type="checkbox" checked={form.fiverrEnabled} onChange={e => setForm({ ...form, fiverrEnabled: e.target.checked })} className="accent-orange-500" />
                    <Percent size={12} className="inline" /> Fiverr Fee ({form.fiverrFeePercent}%)
                  </label>
                  {form.fiverrEnabled && <input type="number" min={0} max={100} step={0.1} value={form.fiverrFeePercent} onChange={e => setForm({ ...form, fiverrFeePercent: +e.target.value })} className={inputCls} />}
                </div>
                <div>
                  <label className={`${labelCls} flex items-center gap-2`}>
                    <input type="checkbox" checked={form.zakatEnabled} onChange={e => setForm({ ...form, zakatEnabled: e.target.checked })} className="accent-emerald-500" />
                    Zakat ({form.zakatPercent}%)
                  </label>
                  {form.zakatEnabled && <input type="number" min={0} max={100} step={0.1} value={form.zakatPercent} onChange={e => setForm({ ...form, zakatPercent: +e.target.value })} className={inputCls} />}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelCls}>Other Deductions</label>
                  <button type="button" onClick={addOtherCost} className="text-xs text-orange-400 hover:text-orange-300">+ Add</button>
                </div>
                {form.otherCosts.map((c, i) => (
                  <div key={i} className={`grid grid-cols-12 gap-2 mb-2 items-center rounded-xl px-1 py-1 transition-all ${c.enabled ? 'bg-emerald-500/5 ring-1 ring-emerald-500/20' : ''}`}>
                    <input value={c.label} onChange={e => updateOtherCost(i, 'label', e.target.value)} placeholder="Expense detail" className={`${inputCls} col-span-4`} />
                    <select value={c.currency} onChange={e => updateOtherCost(i, 'currency', e.target.value)} className="col-span-1 px-1 py-2.5 bg-slate-800/50 border border-white/[0.06] rounded-xl text-xs text-white focus:outline-none">
                      {COST_CURRENCIES.map(cur => <option key={cur} value={cur}>{cur}</option>)}
                    </select>
                    <input type="number" value={c.amount} onChange={e => updateOtherCost(i, 'amount', +e.target.value)} placeholder="Amount" className={`${inputCls} col-span-3`} />
                    <div className="col-span-2 flex items-center justify-center">
                      {c.currency !== 'USD' && c.amount > 0 && (
                        <span className="text-[10px] text-slate-500 whitespace-nowrap">≈ ${toUSD(c.amount, c.currency).toFixed(2)}</span>
                      )}
                    </div>
                    <div className="col-span-2 flex items-center justify-center gap-1">
                      <button type="button" onClick={() => toggleOtherCost(i)} className={`p-1.5 rounded-lg transition-all ${c.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10'}`} title={c.enabled ? 'Included' : 'Click to include'}>
                        <Check size={14} />
                      </button>
                      <button type="button" onClick={() => removeOtherCost(i)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Remove">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Summary */}
              <div className="bg-slate-800/50 rounded-xl border border-white/[0.06] p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Total Budget</span><span className="text-white font-medium">{form.currency} {form.budget.toLocaleString()}</span></div>
                {form.fiverrEnabled && form.fiverrFeePercent > 0 && <div className="flex justify-between"><span className="text-slate-500">Fiverr Fee ({form.fiverrFeePercent}%)</span><span className="text-red-400">-{fiverrDed.toLocaleString()}</span></div>}
                {form.zakatEnabled && <div className="flex justify-between"><span className="text-slate-500">Zakat ({form.zakatPercent}%)</span><span className="text-red-400">-{zakatDed.toLocaleString()}</span></div>}
                {form.otherCosts.filter(c => c.enabled && c.amount > 0).map((c, i) => <div key={i} className="flex justify-between"><span className="text-slate-500">{c.label || 'Other'} {c.currency !== 'USD' ? `(${c.currency} ${c.amount.toLocaleString()})` : ''}</span><span className="text-red-400">-${toUSD(c.amount, c.currency).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>)}
                <div className="border-t border-white/[0.06] pt-2 flex justify-between"><span className="text-slate-400 font-medium">Net Amount</span><span className="text-emerald-400 font-bold">{form.currency} {netAmount.toLocaleString()}</span></div>
                {totalMembers > 0 && <div className="flex justify-between"><span className="text-slate-400">Share/person ({totalMembers} members)</span><span className="text-orange-400 font-medium">{form.currency} {sharePerPerson.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>}
                <div className="border-t border-white/[0.06] pt-2 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={form.amountReceived} onChange={e => setForm(f => ({ ...f, amountReceived: e.target.checked }))} className="w-4 h-4 rounded border-white/20 bg-slate-800 text-emerald-500 focus:ring-0 accent-emerald-500" />
                    <span className="text-sm text-slate-400">Amount Received</span>
                  </label>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${form.amountReceived ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{form.amountReceived ? 'Received' : 'Pending'}</span>
                </div>
              </div>
            </>
          )}
        </form>

        {/* Footer */}
        <div className="flex justify-between items-center gap-3 p-5 border-t border-white/[0.06] flex-shrink-0">
          <div className="text-xs text-slate-500">
            {totalMembers > 0 && <span className="text-orange-400">{totalMembers} members</span>}
            {totalMembers > 0 && netAmount > 0 && <span> · {form.currency} {sharePerPerson.toFixed(0)}/person</span>}
            {missingSteps().length > 0 && <span className="text-red-400 ml-2">Required: {missingSteps().join(', ')}</span>}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={saving || missingSteps().length > 0} className={`px-6 py-2.5 text-white rounded-xl text-sm font-medium disabled:opacity-40 flex items-center gap-2 transition-all ${missingSteps().length > 0 ? 'bg-slate-700 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-rose-500'}`}>
              {saving ? 'Starting...' : <><Rocket size={14} /> Start Project</>}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
