import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Send, Mic, MicOff, Volume2, VolumeX,
  Bot, Sparkles, ArrowRight, Loader2, User,
  Briefcase, Phone, Mail, FileText
} from 'lucide-react'
import { sendChatMessage, submitContact } from '../api/api'

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface ChatMessage {
  id: string
  role: 'bot' | 'user'
  text: string
}

interface LeadData {
  name: string
  email: string
  phone: string
  service: string
  message: string
}

type LeadStep = 'idle' | 'name' | 'email' | 'phone' | 'service' | 'details' | 'confirm' | 'done'

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════ */

const QUICK_REPLIES = [
  { label: 'Our Services', icon: Briefcase },
  { label: 'Contact Details', icon: Phone },
  { label: 'Start a Project', icon: ArrowRight },
  { label: 'View Projects', icon: FileText },
]

const SERVICES_LIST = [
  'AI & ML Solutions', 'Web Development', 'Mobile App Development',
  'Healthcare IT', 'RCM Automation', 'AI Voice Agents',
  'Customer Support AI', 'Automation & Integration', 'Other',
]

const LEAD_TRIGGERS = [
  'start project', 'start a project', 'get a quote', 'get quote', 'want a quote',
  'need a quote', 'contact me', 'hire', 'order', 'need this service',
  'want to order', 'want this', 'build me', 'build for me', 'i need',
  'get started', 'free consultation', 'book a call',
]

const uid = () => Math.random().toString(36).slice(2, 10)

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uid(),
      role: 'bot',
      text: "Hey there! 👋 I'm **Techlution Bot**, your AI assistant.\n\nI can help you with our services, projects, pricing, or start a new project. What can I do for you?",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(true)

  // Voice
  const [listening, setListening] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null)

  // Lead capture
  const [leadStep, setLeadStep] = useState<LeadStep>('idle')
  const [leadData, setLeadData] = useState<LeadData>({ name: '', email: '', phone: '', service: '', message: '' })

  // Scroll
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Unread badge
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [open])

  /* ─── Helpers ─────────────────────────────────────────────────────────── */

  const addMessage = useCallback((role: 'bot' | 'user', text: string) => {
    const msg: ChatMessage = { id: uid(), role, text }
    setMessages(prev => [...prev, msg])
    if (!open && role === 'bot') setUnread(prev => prev + 1)
    return msg
  }, [open])

  const speakText = useCallback((text: string) => {
    if (!voiceEnabled || !synthRef.current) return
    synthRef.current.cancel()
    const clean = text.replace(/\*\*/g, '').replace(/[#_~`]/g, '')
    const utterance = new SpeechSynthesisUtterance(clean)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 0.7
    const voices = synthRef.current.getVoices()
    const preferred = voices.find(v =>
      v.name.includes('Google') && v.lang.startsWith('en')
    ) || voices.find(v => v.lang.startsWith('en'))
    if (preferred) utterance.voice = preferred
    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    synthRef.current.speak(utterance)
  }, [voiceEnabled])

  /* ─── Detect if text is a question/query rather than lead data ────────── */

  const isQuestion = (text: string): boolean => {
    const t = text.toLowerCase().trim()
    // Obvious question patterns
    if (/^(what|how|why|when|where|who|which|can|do|does|is|are|tell|explain|show|describe)\b/.test(t)) return true
    if (t.endsWith('?')) return true
    // Phrases that indicate inquiry, not data entry
    if (/\b(about|services|company|pricing|cost|project|offer|help|work|build|provide)\b/.test(t) && t.split(/\s+/).length > 2) return true
    return false
  }

  const LEAD_STEP_PROMPTS: Record<string, string> = {
    name: "Now, to get your project started — what's your **full name**?",
    email: "To continue with your project — what's your **email address**?",
    phone: "Great! What's your **phone number**?",
    service: "Which **service** are you interested in?\n\n" + SERVICES_LIST.map((s, i) => `${i + 1}. ${s}`).join('\n'),
    details: "Tell me briefly about your **project requirements**.",
    confirm: "Would you like me to **submit** your project request? (**Yes** / **No**)",
  }

  /* ─── Lead Capture Flow ───────────────────────────────────────────────── */

  const isLeadTrigger = (text: string) => {
    const lower = text.toLowerCase()
    return LEAD_TRIGGERS.some(t => lower.includes(t))
  }

  const handleLeadStep = async (text: string) => {
    switch (leadStep) {
      case 'name': {
        setLeadData(d => ({ ...d, name: text }))
        setLeadStep('email')
        const reply = `Great, **${text}**! 📧 What's your email address?`
        addMessage('bot', reply)
        speakText(`Great, ${text}! What's your email address?`)
        return true
      }
      case 'email': {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
          const reply = "That doesn't look like a valid email. Could you try again?"
          addMessage('bot', reply)
          speakText(reply)
          return true
        }
        setLeadData(d => ({ ...d, email: text }))
        setLeadStep('phone')
        const reply = "📱 What's your phone number?"
        addMessage('bot', reply)
        speakText("What's your phone number?")
        return true
      }
      case 'phone': {
        setLeadData(d => ({ ...d, phone: text }))
        setLeadStep('service')
        const reply = '🛠️ Which service are you interested in?\n\n' +
          SERVICES_LIST.map((s, i) => `${i + 1}. ${s}`).join('\n')
        addMessage('bot', reply)
        speakText('Which service are you interested in?')
        return true
      }
      case 'service': {
        const matched = SERVICES_LIST.find(s =>
          s.toLowerCase().includes(text.toLowerCase())
        ) || text
        setLeadData(d => ({ ...d, service: matched }))
        setLeadStep('details')
        const reply = '📝 Tell me briefly about your project requirements.'
        addMessage('bot', reply)
        speakText(reply)
        return true
      }
      case 'details': {
        const finalLead = { ...leadData, message: text }
        setLeadData(finalLead)
        setLeadStep('confirm')

        const summary = `Here's what I have:\n\n` +
          `👤 **Name:** ${finalLead.name}\n` +
          `📧 **Email:** ${finalLead.email}\n` +
          `📱 **Phone:** ${finalLead.phone}\n` +
          `🛠️ **Service:** ${finalLead.service}\n` +
          `📝 **Details:** ${text}\n\n` +
          `Should I submit this? (**Yes** / **No**)`
        addMessage('bot', summary)
        speakText('Here is your project summary. Should I submit this?')
        return true
      }
      case 'confirm': {
        const lower = text.toLowerCase()
        if (lower.includes('yes') || lower.includes('submit') || lower.includes('confirm') || lower.includes('sure')) {
          setLeadStep('done')
          try {
            await submitContact({
              name: leadData.name,
              email: leadData.email,
              phone: leadData.phone,
              service: leadData.service,
              message: `[Chatbot Lead] ${leadData.message}`,
            })
            const reply = '✅ **Submitted successfully!** Our team will reach out within 24 hours.\n\n📧 raleem811811@gmail.com\n📞 +92 315 1664843\n\nAnything else I can help with?'
            addMessage('bot', reply)
            speakText('Submitted successfully! Our team will reach out within 24 hours.')
          } catch {
            const reply = "Sorry, I couldn't submit right now. Please email us at **raleem811811@gmail.com** or call **+92 315 1664843**."
            addMessage('bot', reply)
            speakText(reply)
          }
          setLeadStep('idle')
          setLeadData({ name: '', email: '', phone: '', service: '', message: '' })
          return true
        } else {
          setLeadStep('idle')
          setLeadData({ name: '', email: '', phone: '', service: '', message: '' })
          const reply = 'No problem! Let me know if you need anything else.'
          addMessage('bot', reply)
          speakText(reply)
          return true
        }
      }
      default:
        return false
    }
  }

  /* ─── Send Message ────────────────────────────────────────────────────── */

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return

    addMessage('user', msg)
    setInput('')
    setShowQuickReplies(false)

    // Check if we're in lead capture flow
    if (leadStep !== 'idle') {
      // If user asks a question instead of providing lead data, answer it first
      if (isQuestion(msg)) {
        setLoading(true)
        try {
          const res = await sendChatMessage(msg)
          const aiReply = res.data.data?.reply ?? res.data.reply ?? ''
          const nudge = LEAD_STEP_PROMPTS[leadStep] ?? ''
          const fullReply = aiReply
            ? `${aiReply}\n\n---\n\n${nudge}`
            : nudge
          addMessage('bot', fullReply)
          speakText(aiReply || nudge)
        } catch {
          const nudge = LEAD_STEP_PROMPTS[leadStep] ?? ''
          addMessage('bot', `I couldn't fetch that right now, but feel free to ask again later.\n\n${nudge}`)
        }
        setLoading(false)
        return
      }
      await handleLeadStep(msg)
      return
    }

    // Check for lead triggers
    if (isLeadTrigger(msg)) {
      setLeadStep('name')
      const reply = "Awesome! Let's get your project started 🚀\n\nFirst, what's your **full name**?"
      addMessage('bot', reply)
      speakText("Awesome! Let's get your project started. First, what's your full name?")
      return
    }

    // Normal AI chat
    setLoading(true)
    try {
      const res = await sendChatMessage(msg)
      const reply = res.data.data?.reply ?? res.data.reply ?? 'Sorry, I could not generate a response.'
      addMessage('bot', reply)
      speakText(reply)
    } catch {
      const reply = "Sorry, I couldn't connect right now. Please try again or contact us at **raleem811811@gmail.com**."
      addMessage('bot', reply)
      speakText(reply)
    }
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  /* ─── Voice Input ─────────────────────────────────────────────────────── */

  const toggleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return

    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    const recognition = new SR()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false
    recognitionRef.current = recognition

    recognition.onstart = () => setListening(true)
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      setInput(transcript)
      setListening(false)
      // Auto-send after voice input
      setTimeout(() => { sendMessage(transcript) }, 300)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    recognition.start()
  }

  /* ─── Format Message (bold **text**) ──────────────────────────────────── */

  const formatText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>
      }
      return <span key={i}>{part}</span>
    })
  }

  /* ─── Render ──────────────────────────────────────────────────────────── */

  return (
    <>
      {/* ── Floating Toggle Button ── */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-[90] group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Chat with Techlution Bot"
      >
        {/* Animated glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 via-violet-500 to-orange-500 opacity-60 blur-lg group-hover:opacity-80 transition-opacity animate-spin-slow" />

        {/* Button body */}
        <div className="relative w-[60px] h-[60px] rounded-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10 flex items-center justify-center shadow-2xl shadow-cyan-500/20">
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <X size={22} className="text-white" />
              </motion.div>
            ) : (
              <motion.div key="open" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 300 }}>
                <Bot size={24} className="text-cyan-400" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unread badge */}
          {!open && unread > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-slate-900"
            >
              {unread > 9 ? '9+' : unread}
            </motion.span>
          )}
        </div>
      </motion.button>

      {/* ── Chat Window ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.92 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-4 sm:right-6 z-[90] w-[calc(100vw-2rem)] sm:w-[400px] flex flex-col rounded-2xl overflow-hidden"
            style={{ maxHeight: 'min(600px, calc(100vh - 8rem))' }}
          >
            {/* Animated gradient border glow */}
            <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-cyan-500/40 via-violet-500/20 to-orange-500/40 pointer-events-none" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/5 pointer-events-none" />

            {/* Glass container */}
            <div className="relative flex flex-col rounded-2xl bg-slate-950/[0.98] md:bg-slate-950/[0.97] md:backdrop-blur-2xl border border-white/[0.06] shadow-2xl shadow-black/50 overflow-hidden" style={{ maxHeight: 'min(580px, calc(100vh - 9rem))' }}>

              {/* ── Header ── */}
              <div className="relative px-4 py-3.5 border-b border-white/[0.06] bg-gradient-to-r from-slate-900/80 to-slate-950/80 flex-shrink-0">
                {/* Background glow */}
                <div className="absolute top-0 left-1/4 w-32 h-16 bg-cyan-500/8 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center gap-3">
                  {/* 3D Orb Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/30 to-violet-500/30 blur-md" />
                    <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center shadow-lg overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-violet-500/10" />
                      <Bot size={20} className="text-cyan-400 relative z-10" />
                      {/* Floating sparkle */}
                      <motion.div
                        animate={{ y: [0, -3, 0], opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute top-1 right-1"
                      >
                        <Sparkles size={8} className="text-violet-400" />
                      </motion.div>
                    </div>
                    {/* Online dot */}
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-lg shadow-emerald-400/50" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-sm tracking-tight">Techlution Bot</h3>
                    <div className="flex items-center gap-1.5">
                      {speaking ? (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-violet-400 font-medium flex items-center gap-1">
                          <Volume2 size={10} className="animate-pulse" /> Speaking…
                        </motion.span>
                      ) : listening ? (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-cyan-400 font-medium flex items-center gap-1">
                          <Mic size={10} className="animate-pulse" /> Listening…
                        </motion.span>
                      ) : loading ? (
                        <span className="text-[10px] text-orange-400 font-medium">Typing…</span>
                      ) : (
                        <span className="text-[10px] text-emerald-400 font-medium">Online • AI-Powered</span>
                      )}
                    </div>
                  </div>

                  {/* Voice toggle */}
                  <button
                    onClick={() => {
                      if (speaking) synthRef.current?.cancel()
                      setVoiceEnabled(v => !v)
                      setSpeaking(false)
                    }}
                    className={`w-9 h-9 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all ${
                      voiceEnabled
                        ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400'
                        : 'bg-white/5 border border-white/8 text-slate-500'
                    }`}
                    title={voiceEnabled ? 'Disable voice responses' : 'Enable voice responses'}
                  >
                    {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  </button>

                  {/* Close */}
                  <button
                    onClick={() => setOpen(false)}
                    className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* ── Messages ── */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
                style={{ minHeight: '280px' }}
              >
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Bot avatar */}
                    {m.role === 'bot' && (
                      <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/15 to-violet-500/15 border border-white/[0.06] flex items-center justify-center mt-0.5">
                        <Bot size={13} className="text-cyan-400" />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] text-[13px] leading-relaxed px-3.5 py-2.5 whitespace-pre-wrap ${
                        m.role === 'user'
                          ? 'bg-gradient-to-br from-cyan-600 to-violet-600 text-white rounded-2xl rounded-br-md shadow-lg shadow-cyan-500/10'
                          : 'bg-white/[0.05] text-slate-300 rounded-2xl rounded-bl-md border border-white/[0.04]'
                      }`}
                    >
                      {m.role === 'bot' ? formatText(m.text) : m.text}
                    </div>

                    {/* User avatar */}
                    {m.role === 'user' && (
                      <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-white/[0.06] flex items-center justify-center mt-0.5">
                        <User size={13} className="text-orange-400" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Typing indicator */}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2 items-start"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/15 to-violet-500/15 border border-white/[0.06] flex items-center justify-center">
                      <Bot size={13} className="text-cyan-400" />
                    </div>
                    <div className="bg-white/[0.05] border border-white/[0.04] rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    </div>
                  </motion.div>
                )}

                {/* Quick Replies */}
                {showQuickReplies && messages.length <= 2 && !loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap gap-2 pt-2"
                  >
                    {QUICK_REPLIES.map((qr) => (
                      <motion.button
                        key={qr.label}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => sendMessage(qr.label)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-3 sm:py-1.5 rounded-xl text-xs sm:text-[11px] font-medium bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08] hover:border-cyan-500/20 transition-all"
                      >
                        <qr.icon size={12} className="text-cyan-400" />
                        {qr.label}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* ── Input Area ── */}
              <div className="relative px-3 py-3 border-t border-white/[0.06] bg-slate-950/50 flex-shrink-0">
                {/* Lead capture progress */}
                {leadStep !== 'idle' && leadStep !== 'done' && (
                  <div className="flex items-center gap-1.5 px-1 pb-2">
                    {(['name', 'email', 'phone', 'service', 'details', 'confirm'] as LeadStep[]).map((step, i) => (
                      <div key={step} className="flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          step === leadStep ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50' :
                          i < ['name', 'email', 'phone', 'service', 'details', 'confirm'].indexOf(leadStep) ? 'bg-emerald-400' :
                          'bg-white/10'
                        }`} />
                      </div>
                    ))}
                    <span className="text-[9px] text-slate-600 ml-1">Lead capture</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      listening ? 'Listening…' :
                      leadStep === 'name' ? 'Enter your name…' :
                      leadStep === 'email' ? 'Enter your email…' :
                      leadStep === 'phone' ? 'Enter your phone…' :
                      leadStep === 'service' ? 'Select or type a service…' :
                      leadStep === 'details' ? 'Describe your project…' :
                      leadStep === 'confirm' ? 'Yes / No' :
                      'Ask anything…'
                    }
                    disabled={loading}
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] text-white text-sm rounded-xl px-3.5 py-3 sm:py-2.5 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/10 focus:bg-white/[0.06] transition-all disabled:opacity-50"
                  />

                  {/* Mic button */}
                  <motion.button
                    onClick={toggleVoice}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative w-10 h-10 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all ${
                      listening
                        ? 'bg-red-500/15 border border-red-500/30 text-red-400'
                        : 'bg-white/[0.04] border border-white/[0.08] text-slate-500 hover:text-cyan-400 hover:border-cyan-500/20'
                    }`}
                    title={listening ? 'Stop listening' : 'Voice input'}
                  >
                    {listening && (
                      <motion.div
                        animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-0 rounded-xl border-2 border-red-400/40"
                      />
                    )}
                    {listening ? <MicOff size={15} /> : <Mic size={15} />}
                  </motion.button>

                  {/* Send button */}
                  <motion.button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 disabled:opacity-30 disabled:shadow-none transition-all"
                  >
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  </motion.button>
                </div>

                {/* Powered by */}
                <p className="text-center text-[9px] text-slate-700 mt-2 select-none">
                  Powered by <span className="text-slate-500">Techlution AI</span> • Innovate · Automate · Elevate
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Custom CSS for slow spin ── */}
      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        .animate-spin-slow { animation: spin-slow 6s linear infinite; }
      `}</style>
    </>
  )
}
