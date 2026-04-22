import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, Search, Send, Phone, User, Tag, X, MoreVertical,
  UserPlus, Trash2, CheckCircle2, Clock, Eye, AlertCircle, MessageCircle,
} from 'lucide-react'
import {
  getWhatsAppContacts, getWhatsAppConversation, sendWhatsAppMessage,
  updateWhatsAppContact, deleteWhatsAppContact, convertContactToClient,
  closeWhatsAppConversation, getWhatsAppStats,
} from '../../api/adminApi'
import { useDashboardSocket } from '../hooks/useSocket'
import ConfirmModal from '../components/ConfirmModal'

const TAG_COLORS: Record<string, string> = {
  LEAD: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CLIENT: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  HOT: 'bg-red-500/10 text-red-400 border-red-500/20',
  COLD: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  VIP: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
}

const STATUS_ICON: Record<string, any> = {
  SENT: { icon: CheckCircle2, color: 'text-slate-500' },
  DELIVERED: { icon: CheckCircle2, color: 'text-cyan-400' },
  READ: { icon: Eye, color: 'text-emerald-400' },
  FAILED: { icon: AlertCircle, color: 'text-red-400' },
  QUEUED: { icon: Clock, color: 'text-slate-500' },
}

export default function WhatsAppChat() {
  const [contacts, setContacts] = useState<any[]>([])
  const [selectedContact, setSelectedContact] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [msgInput, setMsgInput] = useState('')
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [showActions, setShowActions] = useState(false)
  const [convertModal, setConvertModal] = useState(false)
  const [convertEmail, setConvertEmail] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchContacts = useCallback(async () => {
    try {
      const params: Record<string, string> = {}
      if (search) params.search = search
      if (tagFilter) params.tag = tagFilter
      const res = await getWhatsAppContacts(params)
      setContacts(res.data?.data || [])
    } catch { /* */ }
    setLoading(false)
  }, [search, tagFilter])

  const fetchStats = useCallback(async () => {
    try {
      const res = await getWhatsAppStats()
      setStats(res.data?.data)
    } catch { /* */ }
  }, [])

  const fetchMessages = useCallback(async (contactId: string) => {
    try {
      const res = await getWhatsAppConversation(contactId, { limit: '100' })
      setMessages(res.data?.data || [])
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch { /* */ }
  }, [])

  useEffect(() => { fetchContacts(); fetchStats() }, [fetchContacts, fetchStats])
  useDashboardSocket(() => { fetchContacts(); if (selectedContact) fetchMessages(selectedContact.id) })

  useEffect(() => {
    if (selectedContact) fetchMessages(selectedContact.id)
  }, [selectedContact, fetchMessages])

  const handleSend = async () => {
    if (!msgInput.trim() || !selectedContact) return
    setSending(true)
    try {
      await sendWhatsAppMessage({ contactId: selectedContact.id, body: msgInput.trim() })
      setMsgInput('')
      await fetchMessages(selectedContact.id)
    } catch { /* */ }
    setSending(false)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteWhatsAppContact(id)
      setSelectedContact(null)
      setMessages([])
      fetchContacts()
    } catch { /* */ }
  }

  const handleTagToggle = async (contactId: string, tag: string, currentTags: string[]) => {
    const newTags = currentTags.includes(tag) ? currentTags.filter(t => t !== tag) : [...currentTags, tag]
    try {
      await updateWhatsAppContact(contactId, { tags: newTags })
      fetchContacts()
      if (selectedContact?.id === contactId) setSelectedContact({ ...selectedContact, tags: newTags })
    } catch { /* */ }
  }

  const handleConvert = async () => {
    if (!convertEmail || !selectedContact) return
    try {
      await convertContactToClient(selectedContact.id, { email: convertEmail })
      setConvertModal(false)
      setConvertEmail('')
      fetchContacts()
    } catch { /* */ }
  }

  const handleCloseConvo = async () => {
    if (!selectedContact) return
    try {
      const convoRes = await getWhatsAppConversation(selectedContact.id, { limit: '1' })
      // We need conversation ID — fetch from contact
      // For now just close all open convos via backend
      setShowActions(false)
    } catch { /* */ }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 flex-shrink-0">
          {[
            { label: 'Contacts', value: stats.totalContacts, color: 'cyan' },
            { label: 'Messages', value: stats.totalMessages, color: 'violet' },
            { label: 'Open Chats', value: stats.openConversations, color: 'emerald' },
            { label: 'Sent Today', value: stats.sentToday, color: 'amber' },
          ].map(s => (
            <div key={s.label} className="bg-slate-900/50 border border-white/[0.06] rounded-xl p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</p>
              <p className={`text-xl font-bold text-${s.color}-400`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Main Chat Layout */}
      <div className="flex flex-1 min-h-0 rounded-2xl border border-white/[0.06] bg-slate-900/30 overflow-hidden">
        {/* Left: Contacts */}
        <div className="w-80 flex-shrink-0 border-r border-white/[0.06] flex flex-col">
          {/* Search */}
          <div className="p-3 border-b border-white/[0.06]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search contacts…"
                className="w-full bg-slate-800/50 border border-white/[0.06] text-white text-xs rounded-lg pl-9 pr-3 py-2 placeholder-slate-500 focus:outline-none focus:border-cyan-500/30"
              />
            </div>
            {/* Tag Filter */}
            <div className="flex gap-1 mt-2 flex-wrap">
              {['', 'LEAD', 'CLIENT', 'HOT', 'VIP'].map(t => (
                <button
                  key={t}
                  onClick={() => setTagFilter(t)}
                  className={`text-[9px] px-2 py-0.5 rounded-full border transition-all ${
                    tagFilter === t
                      ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                      : 'bg-white/[0.03] text-slate-500 border-white/[0.06]'
                  }`}
                >
                  {t || 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-slate-500 text-xs">Loading…</div>
            ) : contacts.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-10 h-10 mx-auto mb-2 text-slate-700" />
                <p className="text-slate-500 text-xs">No contacts yet</p>
              </div>
            ) : (
              contacts.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedContact(c); setShowActions(false) }}
                  className={`w-full text-left px-3 py-3 border-b border-white/[0.04] hover:bg-white/[0.03] transition-all ${
                    selectedContact?.id === c.id ? 'bg-cyan-500/[0.06] border-l-2 border-l-cyan-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <User size={14} className="text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-xs font-semibold truncate">{c.name || c.phone}</span>
                        {c._count?.messages > 0 && (
                          <span className="text-[9px] text-slate-500">{c._count.messages} msgs</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{c.phone}</p>
                      <div className="flex gap-1 mt-1">
                        {(c.tags || []).map((tag: string) => (
                          <span key={tag} className={`text-[8px] px-1.5 py-0.5 rounded border ${TAG_COLORS[tag] || 'bg-white/5 text-slate-400 border-white/10'}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Chat Window */}
        <div className="flex-1 flex flex-col">
          {!selectedContact ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-700" />
                <h3 className="text-slate-400 font-semibold mb-1">WhatsApp CRM</h3>
                <p className="text-slate-500 text-sm">Select a contact to start chatting</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center">
                    <Phone size={16} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">{selectedContact.name || selectedContact.phone}</h3>
                    <p className="text-slate-500 text-[11px]">{selectedContact.phone}</p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    {(selectedContact.tags || []).map((tag: string) => (
                      <span key={tag} className={`text-[8px] px-1.5 py-0.5 rounded border ${TAG_COLORS[tag] || ''}`}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <button onClick={() => setShowActions(!showActions)} className="p-2 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors">
                    <MoreVertical size={16} />
                  </button>
                  <AnimatePresence>
                    {showActions && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 top-10 w-48 rounded-xl border border-white/[0.08] bg-slate-900 shadow-2xl z-20 py-1"
                      >
                        {/* Tag toggles */}
                        {['LEAD', 'CLIENT', 'HOT', 'COLD', 'VIP'].map(tag => (
                          <button
                            key={tag}
                            onClick={() => handleTagToggle(selectedContact.id, tag, selectedContact.tags || [])}
                            className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-white/[0.06] flex items-center gap-2"
                          >
                            <Tag size={11} />
                            {(selectedContact.tags || []).includes(tag) ? `Remove ${tag}` : `Add ${tag}`}
                          </button>
                        ))}
                        <div className="border-t border-white/[0.06] my-1" />
                        {!selectedContact.linkedClientId && (
                          <button
                            onClick={() => { setConvertModal(true); setShowActions(false) }}
                            className="w-full text-left px-3 py-2 text-xs text-emerald-400 hover:bg-white/[0.06] flex items-center gap-2"
                          >
                            <UserPlus size={11} /> Convert to Client
                          </button>
                        )}
                        <button
                          onClick={() => { setConfirmDeleteId(selectedContact.id); setShowActions(false) }}
                          className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-white/[0.06] flex items-center gap-2"
                        >
                          <Trash2 size={11} /> Delete Contact
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">No messages yet</div>
                ) : (
                  messages.map(msg => {
                    const isOut = msg.direction === 'OUTGOING'
                    const st = STATUS_ICON[msg.status] || STATUS_ICON.SENT
                    const StIcon = st.icon
                    return (
                      <div key={msg.id} className={`flex ${isOut ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                          isOut
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-100'
                            : 'bg-slate-800/60 border border-white/[0.06] text-slate-200'
                        }`}>
                          <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                          <div className={`flex items-center gap-1 mt-1 ${isOut ? 'justify-end' : ''}`}>
                            <span className="text-[9px] text-slate-500">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isOut && <StIcon size={10} className={st.color} />}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-white/[0.06] flex-shrink-0">
                <div className="flex gap-2">
                  <input
                    value={msgInput}
                    onChange={e => setMsgInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Type a message…"
                    className="flex-1 bg-slate-800/50 border border-white/[0.06] text-white text-sm rounded-xl px-4 py-2.5 placeholder-slate-500 focus:outline-none focus:border-emerald-500/30"
                  />
                  <motion.button
                    onClick={handleSend}
                    disabled={sending || !msgInput.trim()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold disabled:opacity-40 flex items-center gap-2 text-sm"
                  >
                    <Send size={14} />
                    {sending ? '…' : 'Send'}
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Convert to Client Modal */}
      <AnimatePresence>
        {convertModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setConvertModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-slate-900 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold flex items-center gap-2"><UserPlus size={16} className="text-emerald-400" /> Convert to Client</h3>
                <button onClick={() => setConvertModal(false)} className="p-1 rounded-lg hover:bg-white/[0.06] text-slate-400"><X size={16} /></button>
              </div>
              <p className="text-slate-400 text-xs mb-4">Creating client for <strong className="text-white">{selectedContact?.name || selectedContact?.phone}</strong></p>
              <label className="text-xs text-slate-500 mb-1 block">Email Address *</label>
              <input
                value={convertEmail}
                onChange={e => setConvertEmail(e.target.value)}
                placeholder="client@example.com"
                className="w-full bg-slate-800/50 border border-white/[0.06] text-white text-sm rounded-xl px-4 py-2.5 mb-4 placeholder-slate-500 focus:outline-none focus:border-emerald-500/30"
              />
              <button
                onClick={handleConvert}
                disabled={!convertEmail}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold text-sm disabled:opacity-40"
              >
                Create Client
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={!!confirmDeleteId}
        title="Delete Contact"
        message="Are you sure you want to delete this contact and all messages? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        onConfirm={() => { if (confirmDeleteId) handleDelete(confirmDeleteId); setConfirmDeleteId(null) }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  )
}
