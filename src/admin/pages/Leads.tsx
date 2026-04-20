import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Eye, Check, MessageSquare, Mail, Phone } from 'lucide-react'

type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Closed'

interface Lead {
  id: number
  name: string
  email: string
  phone: string
  service: string
  message: string
  timestamp: string
  status: LeadStatus
  source: string
}

const mockLeads: Lead[] = [
  { id: 1, name: 'Ahmed Hassan', email: 'ahmed@corp.com', phone: '+971 50 123 4567', service: 'AI & ML Solutions', message: 'Need a custom NLP model for Arabic text classification', timestamp: '2026-04-20 14:30', status: 'New', source: 'Chatbot' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@healthco.com', phone: '+1 555 234 5678', service: 'Healthcare IT', message: 'Looking for EHR integration with our existing system', timestamp: '2026-04-20 12:15', status: 'New', source: 'Contact Form' },
  { id: 3, name: 'Li Wei', email: 'liwei@techfirm.cn', phone: '+86 138 0013 8000', service: 'Automation', message: 'Want to automate our customer onboarding workflow', timestamp: '2026-04-19 18:45', status: 'Contacted', source: 'Chatbot' },
  { id: 4, name: 'David Miller', email: 'david@startup.io', phone: '+1 555 345 6789', service: 'DevOps & Cloud', message: 'Need help migrating from AWS to Azure', timestamp: '2026-04-19 10:00', status: 'Qualified', source: 'Email' },
  { id: 5, name: 'Fatima Ali', email: 'fatima@medsys.pk', phone: '+92 300 123 4567', service: 'RCM Automation', message: 'Medical billing automation for 50+ providers', timestamp: '2026-04-18 16:30', status: 'Converted', source: 'Contact Form' },
  { id: 6, name: 'James Brown', email: 'james@retailmax.com', phone: '+44 20 7946 0958', service: 'Data Pipelines', message: 'ETL pipeline for our e-commerce analytics', timestamp: '2026-04-17 09:20', status: 'Closed', source: 'Chatbot' },
  { id: 7, name: 'Priya Sharma', email: 'priya@innov8.in', phone: '+91 98765 43210', service: 'AI Voice Agents', message: 'Voice AI for restaurant reservations and orders', timestamp: '2026-04-16 14:00', status: 'Contacted', source: 'Start Project' },
  { id: 8, name: 'Omar Khalid', email: 'omar@gulftech.ae', phone: '+971 55 987 6543', service: 'Computer Vision', message: 'Need OCR for Arabic + English document scanning', timestamp: '2026-04-15 11:00', status: 'New', source: 'Contact Form' },
]

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
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const filtered = mockLeads.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.service.toLowerCase().includes(search.toLowerCase()) ||
      l.message.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || l.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Leads & Inquiries</h1>
        <p className="text-slate-400 text-sm mt-1">Track all website form submissions and chatbot leads</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {ALL_STATUSES.map(s => (
          <motion.div
            key={s}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] p-3 text-center"
          >
            <p className="text-lg font-bold text-white">{mockLeads.filter(l => l.status === s).length}</p>
            <p className="text-[11px] text-slate-500">{s}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search leads…"
            className="w-full bg-white/[0.04] border border-white/[0.06] text-white text-sm rounded-xl pl-10 pr-4 py-2 placeholder-slate-600 focus:outline-none focus:border-cyan-500/30 transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
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
                {['Lead', 'Service', 'Source', 'Status', 'Timestamp', 'Actions'].map(h => (
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
                    <td className="px-4 py-3 text-slate-300 text-xs">{lead.service}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.06] text-slate-400">
                        {lead.source}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[lead.status]}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{lead.timestamp}</td>
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
                            <span className="flex items-center gap-1"><Phone size={12} /> {lead.phone}</span>
                          </div>
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
