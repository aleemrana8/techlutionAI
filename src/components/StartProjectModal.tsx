import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Send, User, Phone, Mail, Briefcase, MessageSquare,
  DollarSign, Clock, CheckCircle2, MapPin, PhoneCall, ArrowRight, Sparkles,
  Paperclip, FileText, Image, Film, Trash2
} from 'lucide-react'
import { submitProject } from '../api/api'

const COUNTRY_CODES = [
  { code: '+92',  flag: '🇵🇰', label: 'PK' },
  { code: '+1',   flag: '🇺🇸', label: 'US' },
  { code: '+44',  flag: '🇬🇧', label: 'UK' },
  { code: '+971', flag: '🇦🇪', label: 'AE' },
  { code: '+966', flag: '🇸🇦', label: 'SA' },
  { code: '+91',  flag: '🇮🇳', label: 'IN' },
  { code: '+61',  flag: '🇦🇺', label: 'AU' },
  { code: '+49',  flag: '🇩🇪', label: 'DE' },
  { code: '+33',  flag: '🇫🇷', label: 'FR' },
  { code: '+86',  flag: '🇨🇳', label: 'CN' },
]

const SERVICES = [
  'AI & ML Solutions',
  'Automation & Integration',
  'Web Development',
  'Mobile App Development',
  'Healthcare Systems',
  'Revenue Cycle Management',
  'AI Voice Agents',
  'Customer Support AI',
  'DevOps & Cloud',
  'UI/UX Design',
  'E-Commerce Solutions',
  'Other',
]

const BUDGETS = ['$500 – $1K', '$1K – $5K', '$5K – $10K', '$10K+']

const TIMELINES = [
  'Urgent (1–2 weeks)',
  '1 Month',
  '2–3 Months',
  '3+ Months',
]

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function StartProjectModal({ isOpen, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    name: '',
    countryCode: '+92',
    phone: '',
    email: '',
    service: '',
    budget: '',
    timeline: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }))

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const newFiles = Array.from(files)
    setAttachments(prev => {
      const combined = [...prev, ...newFiles]
      return combined.slice(0, 5) // max 5 files
    })
  }

  const removeFile = (index: number) =>
    setAttachments(prev => prev.filter((_, i) => i !== index))

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image
    if (type.startsWith('video/')) return Film
    return FileText
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) return setError('Please enter your name.')
    if (!form.phone.trim()) return setError('Please enter your phone number.')
    if (!/^\d{7,15}$/.test(form.phone.replace(/[\s\-]/g, '')))
      return setError('Please enter a valid phone number (7–15 digits).')
    if (!form.service) return setError('Please select a service.')
    if (!form.message.trim() || form.message.length < 10)
      return setError('Please describe your project (at least 10 characters).')

    setLoading(true)
    try {
      await submitProject({
        name: form.name,
        email: form.email || undefined,
        phone: `${form.countryCode} ${form.phone}`,
        service: form.service,
        budget: form.budget || undefined,
        timeline: form.timeline || undefined,
        message: form.message,
        attachments: attachments.length ? attachments : undefined,
      })
      setSent(true)
      onSuccess?.()
    } catch {
      setError('Failed to send. Please try again or email raleem811811@gmail.com')
    }
    setLoading(false)
  }

  const handleClose = () => {
    onClose()
    // Reset after animation
    setTimeout(() => {
      setForm({ name: '', countryCode: '+92', phone: '', email: '', service: '', budget: '', timeline: '', message: '' })
      setSent(false)
      setError('')
      setAttachments([])
    }, 300)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-2xl shadow-cyan-500/5"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Glow accents */}
            <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={18} />
            </button>

            <div className="p-6 sm:p-8">
              {/* Success state */}
              {sent ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center text-center py-6"
                >
                  {/* Logo */}
                  <motion.img
                    src="/images/logo.png"
                    alt="Techlution AI"
                    className="h-12 w-auto mb-6"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  />

                  {/* Success icon with glow */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="relative mb-5"
                  >
                    <div className="absolute inset-0 w-20 h-20 rounded-full bg-emerald-500/20 blur-xl" />
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 flex items-center justify-center">
                      <CheckCircle2 size={36} className="text-emerald-400" />
                    </div>
                  </motion.div>

                  {/* Greeting */}
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl sm:text-3xl font-black text-white mb-2"
                  >
                    Thank You, {form.name.split(' ')[0]}! 👋
                  </motion.h3>

                  {/* Subtext */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="max-w-md space-y-3 mb-5"
                  >
                    <p className="text-slate-400 text-sm leading-relaxed">
                      We've successfully received your project request, and our team at <span className="text-white font-semibold">Techlution AI</span> is already reviewing your requirements.
                    </p>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      You can expect a response from our experts within the next{' '}
                      <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent font-bold">24 hours</span>{' '}
                      with tailored solutions and next steps.
                    </p>
                  </motion.div>

                  {/* Divider */}
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-5" />

                  {/* Value statement */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-start gap-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] mb-5 text-left max-w-md"
                  >
                    <Sparkles size={18} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-500 text-xs leading-relaxed">
                      At <span className="text-slate-300 font-medium">Techlution AI</span>, we specialize in delivering intelligent AI-powered solutions that automate workflows, optimize operations, and help businesses scale efficiently.
                    </p>
                  </motion.div>

                  {/* Engagement */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-slate-500 text-xs mb-5 max-w-sm"
                  >
                    In the meantime, feel free to explore our services, case studies, and innovative solutions designed for modern businesses.
                  </motion.p>

                  {/* Contact info */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65 }}
                    className="flex flex-wrap justify-center gap-4 mb-6 text-[10px] text-slate-500"
                  >
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-cyan-400" />
                      <span>City Park Road, Islamabad</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <PhoneCall size={12} className="text-cyan-400" />
                      <span>+92 315 1664843</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail size={12} className="text-cyan-400" />
                      <a href="mailto:raleem811811@gmail.com" className="hover:text-cyan-400 transition-colors">raleem811811@gmail.com</a>
                    </div>
                  </motion.div>

                  {/* CTA buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.75 }}
                    className="flex flex-wrap items-center justify-center gap-3"
                  >
                    <a
                      href="#services"
                      onClick={handleClose}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 text-sm hover:shadow-cyan-500/30 transition-shadow"
                    >
                      Explore Services <ArrowRight size={14} />
                    </a>
                    <a
                      href="#projects"
                      onClick={handleClose}
                      className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] text-slate-300 font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-white/[0.06] hover:border-white/20 transition-all"
                    >
                      View Projects <ArrowRight size={14} />
                    </a>
                  </motion.div>
                </motion.div>
              ) : (
                <>
                  {/* Header */}
                  <div className="mb-7 pr-8">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-px bg-gradient-to-r from-cyan-500 to-violet-500" />
                      <span className="text-cyan-400 text-[10px] tracking-[0.28em] uppercase font-semibold">
                        New Project
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                      Start Your{' '}
                      <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
                        Project
                      </span>
                    </h2>
                    <p className="text-slate-500 text-sm mt-2">
                      Tell us about your idea — free consultation.
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Row 1: Name + Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 mb-1.5 font-medium">
                          Full Name <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                          <input
                            type="text"
                            value={form.name}
                            onChange={(e) => update('name', e.target.value)}
                            placeholder="Your name"
                            className="w-full bg-white/[0.03] border border-white/10 text-white rounded-xl pl-10 pr-4 py-3 text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 focus:bg-white/[0.05] transition-all"
                          />
                        </div>
                      </div>

                      {/* Phone with Country Code */}
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 mb-1.5 font-medium">
                          Phone Number <span className="text-red-400">*</span>
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={form.countryCode}
                            onChange={(e) => update('countryCode', e.target.value)}
                            className="w-24 bg-slate-900 border border-white/10 text-slate-300 rounded-xl px-2 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                          >
                            {COUNTRY_CODES.map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.flag} {c.code}
                              </option>
                            ))}
                          </select>
                          <div className="relative flex-1">
                            <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                            <input
                              type="tel"
                              value={form.phone}
                              onChange={(e) => update('phone', e.target.value)}
                              placeholder="315 1664843"
                              className="w-full bg-white/[0.03] border border-white/10 text-white rounded-xl pl-10 pr-4 py-3 text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 focus:bg-white/[0.05] transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Email */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 mb-1.5 font-medium">
                        Email Address <span className="text-slate-700">(optional)</span>
                      </label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => update('email', e.target.value)}
                          placeholder="you@company.com"
                          className="w-full bg-white/[0.03] border border-white/10 text-white rounded-xl pl-10 pr-4 py-3 text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 focus:bg-white/[0.05] transition-all"
                        />
                      </div>
                    </div>

                    {/* Row 3: Service */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 mb-1.5 font-medium">
                        Service Needed <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Briefcase size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                        <select
                          value={form.service}
                          onChange={(e) => update('service', e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 text-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all appearance-none"
                        >
                          <option value="">Select a service...</option>
                          {SERVICES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Row 4: Budget + Timeline */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 mb-1.5 font-medium">
                          Budget Range
                        </label>
                        <div className="relative">
                          <DollarSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                          <select
                            value={form.budget}
                            onChange={(e) => update('budget', e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 text-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all appearance-none"
                          >
                            <option value="">Select budget...</option>
                            {BUDGETS.map((b) => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 mb-1.5 font-medium">
                          Timeline
                        </label>
                        <div className="relative">
                          <Clock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                          <select
                            value={form.timeline}
                            onChange={(e) => update('timeline', e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 text-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all appearance-none"
                          >
                            <option value="">Select timeline...</option>
                            {TIMELINES.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Row 5: Message */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 mb-1.5 font-medium">
                        Project Details <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <MessageSquare size={15} className="absolute left-3.5 top-3.5 text-slate-600" />
                        <textarea
                          value={form.message}
                          onChange={(e) => update('message', e.target.value)}
                          rows={4}
                          placeholder="Tell us about your project, goals, timeline, and budget..."
                          className="w-full bg-white/[0.03] border border-white/10 text-white rounded-xl pl-10 pr-4 py-3 text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 focus:bg-white/[0.05] transition-all resize-none"
                        />
                      </div>
                    </div>

                    {/* Attachments */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 mb-1.5 font-medium">
                        Attachments <span className="text-slate-600">(optional — images, docs, videos)</span>
                      </label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
                        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleFiles(e.dataTransfer.files) }}
                        className="flex items-center gap-3 px-4 py-3 bg-white/[0.02] border border-dashed border-white/10 rounded-xl cursor-pointer hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all group"
                      >
                        <Paperclip size={16} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                        <span className="text-slate-500 text-sm group-hover:text-slate-400 transition-colors">
                          Click or drag files here (max 5, 25MB each)
                        </span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                          onChange={(e) => handleFiles(e.target.files)}
                          className="hidden"
                        />
                      </div>
                      {attachments.length > 0 && (
                        <div className="mt-2 space-y-1.5">
                          {attachments.map((file, i) => {
                            const Icon = getFileIcon(file.type)
                            return (
                              <div key={i} className="flex items-center gap-2.5 px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg group/file">
                                <Icon size={14} className="text-cyan-400 flex-shrink-0" />
                                <span className="text-slate-400 text-xs truncate flex-1">{file.name}</span>
                                <span className="text-slate-600 text-[10px]">{(file.size / 1024 / 1024).toFixed(1)}MB</span>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                                  className="text-slate-600 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Error */}
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-xs"
                      >
                        {error}
                      </motion.p>
                    )}

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -1 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-shadow text-sm disabled:opacity-50"
                    >
                      <Send size={15} />
                      {loading ? 'Submitting...' : 'Start Project'}
                    </motion.button>

                    <p className="text-center text-[10px] text-slate-600">
                      🔒 100% Confidential · ⚡ Guaranteed response within 24 hours
                    </p>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
