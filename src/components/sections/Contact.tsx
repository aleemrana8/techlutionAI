import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, ArrowRight, Send } from 'lucide-react'

const contactInfo = [
  {
    icon: Phone,
    label: 'Call us',
    value: '+92 315 1664843',
    href: 'tel:+923151664843',
  },
  {
    icon: Mail,
    label: 'Email us',
    value: 'raleem811811@gmail.com',
    href: 'mailto:raleem811811@gmail.com',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Hostel Park Road, Islamabad',
    href: 'https://www.google.com/maps/search/Hostel+City+Park+Road+Islamabad',
  },
]

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: '',
    message: '',
  })
  const [sent, setSent] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    setFormData({ name: '', email: '', service: '', message: '' })
    setSent(true)
    setTimeout(() => setSent(false), 4000)
  }

  return (
    <section id="contact" className="bg-slate-950/90 overflow-hidden">

      {/* ── Large CTA block ── */}
      <div className="py-24 md:py-36 px-4 md:px-8 border-b border-white/5">
        <div className="max-w-7xl mx-auto">

          {/* Label */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="flex items-center gap-3 mb-10"
          >
            <div className="w-8 h-px bg-orange-500" />
            <span className="text-orange-400 text-[11px] tracking-[0.28em] uppercase font-semibold">
              Start a project
            </span>
          </motion.div>

          {/* Headline — massive word-by-word */}
          <div className="mb-12 overflow-hidden">
            {[
              { words: ["Let's", 'build', 'your'], dim: false },
              { words: ['AI', 'solution'], dim: false, gradient: true },
              { words: ['together'], dim: true },
            ].map((line, li) => (
              <motion.div
                key={li}
                initial={{ y: 80, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.75, delay: li * 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-wrap gap-x-[0.22em] leading-[0.9] overflow-hidden"
              >
                {line.words.map((w, wi) => (
                  <span
                    key={wi}
                    className={`font-black tracking-tight ${
                      line.gradient
                        ? 'gradient-text'
                        : line.dim
                        ? 'text-white/15'
                        : 'text-white'
                    }`}
                    style={{ fontSize: 'clamp(2.8rem, 9vw, 7.5rem)' }}
                  >
                    {w}
                  </span>
                ))}
              </motion.div>
            ))}
          </div>

          {/* Description + CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between"
          >
            <p className="text-slate-400 text-lg max-w-sm leading-relaxed">
              Ready to transform your business with AI-driven solutions? Talk to our experts —
              free consultation.
            </p>
            <motion.a
              href="mailto:raleem811811@gmail.com"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary text-base flex-shrink-0"
            >
              raleem811811@gmail.com <ArrowRight size={16} />
            </motion.a>
          </motion.div>
        </div>
      </div>

      {/* ── Contact form + info ── */}
      <div className="py-20 md:py-28 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Left: contact details */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3
              className="font-black text-white leading-tight mb-8"
              style={{ fontSize: 'clamp(1.6rem,3.5vw,2.8rem)' }}
            >
              Get in touch
            </h3>

            <div className="space-y-6 mb-12">
              {contactInfo.map((info, i) => {
                const Icon = info.icon
                return (
                  <motion.a
                    key={i}
                    href={info.href}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
                    whileHover={{ x: 6 }}
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500/20 transition-colors mt-0.5">
                      <Icon size={18} className="text-orange-400" />
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-widest text-slate-500 mb-0.5">
                        {info.label}
                      </div>
                      <div className="text-white font-semibold group-hover:text-orange-400 transition-colors">
                        {info.value}
                      </div>
                    </div>
                  </motion.a>
                )
              })}
            </div>

            {/* HQ card */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="p-6 rounded-2xl bg-slate-900 border border-white/5"
            >
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">
                Pakistan — HQ
              </div>
              <div className="text-white font-bold">Rana Muhammad Aleem Akhtar</div>
              <div className="text-slate-400 text-sm mt-1">
                <a href="https://www.google.com/maps/search/Hostel+City+Park+Road+Islamabad" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">Hostel Park Road, Islamabad</a>
              </div>
              <div className="text-[11px] text-slate-600 mt-3">
                Quick response · Usually within 24 h
              </div>
            </motion.div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Smith"
                    className="w-full bg-slate-900 border border-white/8 text-white rounded-xl px-4 py-3.5 text-sm placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/15 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@company.com"
                    className="w-full bg-slate-900 border border-white/8 text-white rounded-xl px-4 py-3.5 text-sm placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/15 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-2">
                  Service Needed
                </label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-white/8 text-slate-300 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/15 transition-all"
                >
                  <option value="">Select a service...</option>
                  <option value="ai-ml">AI &amp; Machine Learning</option>
                  <option value="computer-vision">Computer Vision</option>
                  <option value="automation">Automation &amp; Integration</option>
                  <option value="healthcare">Healthcare AI</option>
                  <option value="devops">DevOps &amp; Cloud</option>
                  <option value="data">Data Pipelines</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-2">
                  Project Details
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Tell us about your project, goals, and timeline..."
                  className="w-full bg-slate-900 border border-white/8 text-white rounded-xl px-4 py-3.5 text-sm placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/15 transition-all resize-none"
                />
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-primary py-4 text-base justify-center"
              >
                {sent ? 'Message Sent!' : (
                  <>Send Message <Send size={16} /></>
                )}
              </motion.button>

              <p className="text-center text-[11px] text-slate-600">
                🔒 100% Confidential · ⚡ Reply Within 24 Hours · 🚀 100+ Projects Delivered
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
