import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, Eye, Check, MessageSquare, Mail, Phone, FileText, Rocket, DollarSign, Clock } from 'lucide-react'
import { getLeads } from '../../api/adminApi'
import { useDashboardSocket } from '../hooks/useSocket'

type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Closed'
type LeadTypeFilter = 'All' | 'INQUIRY' | 'PROPOSAL'

const STATUS_COLORS: Record<LeadStatus, string> = {
  New: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Contacted: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  Qualified: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Converted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Closed: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
}

const ALL_STATUSES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Converted', 'Closed']

export default function Leads() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'All'>('All')
  const [typeFilter, setTypeFilter] = useState<LeadTypeFilter>('All')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [leads, setLeads] = useState<any[]>([])

  const fetchLeads = useCallback(() => {
    getLeads()
      .then(r => setLeads(r.data.data || []))
      .catch(() => {})
  }, [])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  useDashboardSocket((event) => {
    if (event === 'lead:new' || event === 'lead:update') fetchLeads()
  })

  const filtered = leads.filter((l: any) => {
    const matchSearch = (l.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.service || l.subject || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.message || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || (l.status || 'New') === statusFilter
    const matchType = typeFilter === 'All' || (l.type || 'INQUIRY') === typeFilter
    return matchSearch && matchStatus && matchType
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Client Inquiries & Project Proposals</h1>
        <p className="text-slate-400 text-sm mt-1">Track all client inquiries, project proposals, and contact submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] p-3 text-center">
          <p className="text-lg font-bold text-white">{leads.length}</p>
          <p className="text-[11px] text-slate-500">Total</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-xl bg-slate-900/60 backdrop-blur-sm border border-cyan-500/10 p-3 text-center">
          <p className="text-lg font-bold text-cyan-400">{leads.filter((l: any) => (l.type || 'INQUIRY') === 'INQUIRY').length}</p>
          <p className="text-[11px] text-slate-500">Inquiries</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl bg-slate-900/60 backdrop-blur-sm border border-violet-500/10 p-3 text-center">
          <p className="text-lg font-bold text-violet-400">{leads.filter((l: any) => l.type === 'PROPOSAL').length}</p>
          <p className="text-[11px] text-slate-500">Proposals</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-xl bg-slate-900/60 backdrop-blur-sm border border-emerald-500/10 p-3 text-center">
          <p className="text-lg font-bold text-emerald-400">{leads.filter((l: any) => (l.status || 'New') === 'New').length}</p>
          <p className="text-[11px] text-slate-500">New</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search inquiries…"
            className="w-full bg-white/[0.04] border border-white/[0.06] text-white text-sm rounded-xl pl-10 pr-4 py-2 placeholder-slate-600 focus:outline-none focus:border-cyan-500/30 transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(['All', 'INQUIRY', 'PROPOSAL'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                typeFilter === t
                  ? t === 'INQUIRY' ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                    : t === 'PROPOSAL' ? 'bg-violet-500/15 text-violet-400 border-violet-500/30'
                    : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                  : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.06]'
              }`}
            >
              {t === 'INQUIRY' && <FileText size={11} />}
              {t === 'PROPOSAL' && <Rocket size={11} />}
              {t === 'All' ? 'All Types' : t === 'INQUIRY' ? 'Inquiries' : 'Proposals'}
            </button>
          ))}
          <div className="w-px bg-white/[0.06] mx-1" />
          {(['All', ...ALL_STATUSES] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                statusFilter === s
                  ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                  : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.06]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Client', 'Service', 'Type', 'Status', 'Timestamp', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, i) => (
                <>
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {lead.name[0]}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{lead.name}</p>
                          <p className="text-[11px] text-slate-500">{lead.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs">{lead.service || lead.subject || '-'}</td>
                    <td className="px-4 py-3">
                      {(lead.type || 'INQUIRY') === 'PROPOSAL' ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center gap-1 w-fit">
                          <Rocket size={10} /> Proposal
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center gap-1 w-fit">
                          <FileText size={10} /> Inquiry
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[(lead.status || 'New') as LeadStatus] || STATUS_COLORS.New}`}>
                        {lead.status || 'New'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{new Date(lead.createdAt || lead.timestamp).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-cyan-400 transition-colors" title="View details">
                          <Eye size={13} />
                        </button>
                        <button className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-emerald-400 transition-colors" title="Mark contacted">
                          <Check size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>

                  {/* Expanded detail row */}
                  {expandedId === lead.id && (
                    <tr key={lead.id + '-detail'}>
                      <td colSpan={6} className="px-4 py-4 bg-slate-900/40 border-b border-white/[0.03]">
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-2"
                        >
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span className="flex items-center gap-1"><Mail size={12} /> {lead.email}</span>
                            {lead.phone && <span className="flex items-center gap-1"><Phone size={12} /> {lead.phone}</span>}
                            {lead.company && <span className="flex items-center gap-1">🏢 {lead.company}</span>}
                          </div>
                          {(lead.type === 'PROPOSAL') && (
                            <div className="flex items-center gap-4 text-xs">
                              {lead.budget && <span className="flex items-center gap-1 text-emerald-400"><DollarSign size={12} /> Budget: {lead.budget}</span>}
                              {lead.timeline && <span className="flex items-center gap-1 text-amber-400"><Clock size={12} /> Timeline: {lead.timeline}</span>}
                            </div>
                          )}
                          <div className="flex items-start gap-1.5">
                            <MessageSquare size={12} className="text-slate-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-slate-300">{lead.message}</p>
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
