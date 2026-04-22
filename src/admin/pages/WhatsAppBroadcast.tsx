import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Megaphone, Send, Users, Tag, Filter, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { getWhatsAppContacts, broadcastWhatsApp, getWhatsAppLogs } from '../../api/adminApi'

const ALL_TAGS = ['LEAD', 'CLIENT', 'HOT', 'COLD', 'VIP']

export default function WhatsAppBroadcast() {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [mode, setMode] = useState<'tags' | 'manual'>('tags')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [tab, setTab] = useState<'compose' | 'logs'>('compose')

  const fetchContacts = useCallback(async () => {
    try {
      const res = await getWhatsAppContacts({ limit: '200' })
      setContacts(res.data?.data || [])
    } catch { /* */ }
  }, [])

  const fetchLogs = useCallback(async () => {
    try {
      const res = await getWhatsAppLogs({ limit: '50' })
      setLogs(res.data?.data || [])
    } catch { /* */ }
  }, [])

  useEffect(() => { fetchContacts(); fetchLogs() }, [fetchContacts, fetchLogs])

  const handleSend = async () => {
    if (!message.trim()) return
    setSending(true)
    setResult(null)
    try {
      const payload: any = { subject, message }
      if (mode === 'tags' && selectedTags.length) payload.tags = selectedTags
      if (mode === 'manual' && selectedIds.length) payload.contactIds = selectedIds
      const res = await broadcastWhatsApp(payload)
      setResult(res.data)
      fetchLogs()
    } catch { /* */ }
    setSending(false)
  }

  const filteredContacts = mode === 'tags' && selectedTags.length
    ? contacts.filter(c => (c.tags || []).some((t: string) => selectedTags.includes(t)))
    : contacts

  const toggleId = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Megaphone className="w-7 h-7 text-emerald-400" /> WhatsApp Broadcast
        </h1>
        <p className="text-slate-400 text-sm mt-1">Send messages to multiple contacts at once</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['compose', 'logs'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
              tab === t
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.06]'
            }`}
          >
            {t === 'compose' ? '✏️ Compose' : '📋 Sent Logs'}
          </button>
        ))}
      </div>

      {tab === 'compose' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Compose */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/[0.06] bg-slate-900/50 p-5">
              <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <Send size={14} className="text-emerald-400" /> Message
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Subject (optional)</label>
                  <input
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g., Monthly Update"
                    className="w-full bg-slate-800/50 border border-white/[0.06] text-white text-sm rounded-xl px-4 py-2.5 placeholder-slate-500 focus:outline-none focus:border-emerald-500/30"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Message *</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Type your broadcast message…"
                    rows={5}
                    className="w-full bg-slate-800/50 border border-white/[0.06] text-white text-sm rounded-xl px-4 py-2.5 placeholder-slate-500 focus:outline-none focus:border-emerald-500/30 resize-none"
                  />
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setMode('tags')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    mode === 'tags' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-white/[0.03] text-slate-400 border-white/[0.06]'
                  }`}
                >
                  <Filter size={11} /> By Tags
                </button>
                <button
                  onClick={() => setMode('manual')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    mode === 'manual' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-white/[0.03] text-slate-400 border-white/[0.06]'
                  }`}
                >
                  <Users size={11} /> Select Contacts
                </button>
              </div>

              {/* Tag Selector */}
              {mode === 'tags' && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {ALL_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                        selectedTags.includes(tag)
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-white/[0.03] text-slate-400 border-white/[0.06]'
                      }`}
                    >
                      <Tag size={10} className="inline mr-1" />{tag}
                    </button>
                  ))}
                </div>
              )}

              {/* Recipients count */}
              <div className="mt-4 p-3 rounded-xl bg-slate-800/30 border border-white/[0.04]">
                <p className="text-xs text-slate-400">
                  <Users size={12} className="inline mr-1" />
                  {mode === 'manual' ? selectedIds.length : filteredContacts.length} recipient(s) selected
                </p>
              </div>

              {/* Send Button */}
              <motion.button
                onClick={handleSend}
                disabled={sending || !message.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Megaphone size={14} />
                {sending ? 'Broadcasting…' : 'Send Broadcast'}
              </motion.button>

              {/* Result */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] text-xs"
                >
                  <p className="text-emerald-400 font-semibold">
                    ✅ Sent: {result.sent} | ❌ Failed: {result.failed} | Total: {result.total}
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right: Contact Selection (manual mode) */}
          <div className="rounded-2xl border border-white/[0.06] bg-slate-900/50 p-5 max-h-[70vh] overflow-y-auto">
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <Users size={14} className="text-cyan-400" />
              {mode === 'manual' ? 'Select Recipients' : 'Preview Recipients'}
              <span className="text-[10px] text-slate-500 ml-auto">{filteredContacts.length} contacts</span>
            </h3>

            <div className="space-y-1">
              {filteredContacts.map(c => {
                const isSelected = selectedIds.includes(c.id)
                return (
                  <button
                    key={c.id}
                    onClick={() => mode === 'manual' && toggleId(c.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                      mode === 'manual' && isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/20'
                        : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]'
                    } ${mode === 'tags' ? 'cursor-default' : ''}`}
                  >
                    {mode === 'manual' && (
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'
                      }`}>
                        {isSelected && <CheckCircle2 size={10} className="text-white" />}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-white font-medium">{c.name || 'Unknown'}</span>
                      <span className="text-[10px] text-slate-500 ml-2">{c.phone}</span>
                    </div>
                    <div className="flex gap-1">
                      {(c.tags || []).map((t: string) => (
                        <span key={t} className="text-[8px] px-1 py-0.5 rounded bg-white/[0.05] text-slate-400">{t}</span>
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Logs Tab */
        <div className="rounded-2xl border border-white/[0.06] bg-slate-900/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] text-slate-500">
                  <th className="text-left px-4 py-3 font-medium">To</th>
                  <th className="text-left px-4 py-3 font-medium">Message</th>
                  <th className="text-left px-4 py-3 font-medium">Trigger</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white font-mono">{log.to}</td>
                    <td className="px-4 py-3 text-slate-300 max-w-xs truncate">{log.body}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {log.trigger || 'manual'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {log.status === 'SENT' || log.status === 'DELIVERED' ? (
                        <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 size={11} /> {log.status}</span>
                      ) : log.status === 'FAILED' ? (
                        <span className="text-red-400 flex items-center gap-1"><AlertCircle size={11} /> Failed</span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1"><Clock size={11} /> {log.status}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No logs yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
