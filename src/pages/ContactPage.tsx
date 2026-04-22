import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Chatbot from '../components/Chatbot'
import PhoneInput from '../components/common/PhoneInput'
import { submitContact } from '../api/api'

const contactInfo = [
  { icon: Phone, label: 'Call us', value: '+92 315 1664843', href: 'tel:+923151664843' },
  { icon: Mail, label: 'Email us', value: 'raleem811811@gmail.com', href: 'mailto:raleem811811@gmail.com' },
  { icon: MapPin, label: 'Location', value: 'Hostel Park Road, Islamabad', href: 'https://www.google.com/maps/search/Hostel+City+Park+Road+Islamabad' },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', countryCode: '+92', service: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      await submitContact({ ...formData, phone: `${formData.countryCode}${formData.phone}` })
      setStatus('sent')
      setFormData({ name: '', email: '', phone: '', countryCode: '+92', service: '', message: '' })
      setTimeout(() => setStatus('idle'), 5000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  return (
    <>
      <Header />
      <main className="pt-24 pb-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 md:px-8">

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="mb-16 text-center"
          >
            <span className="inline-flex items-center gap-3 text-orange-400 text-[11px] tracking-[0.28em] uppercase font-semibold mb-4">
              <div className="w-8 h-px bg-orange-500" />
              Contact Us
              <div className="w-8 h-px bg-orange-500" />
            </span>
            <h1
              className="font-black leading-[0.92] tracking-tight text-white mb-4"
              style={{ fontSize: 'clamp(2.2rem,6vw,4.5rem)' }}
            >
              Let's <span className="gradient-text">Talk</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Ready to transform your business? Get in touch — free consultation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            {/* Left: info */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="font-bold text-white text-2xl mb-8">Get in Touch</h3>

              <div className="space-y-6 mb-12">
                {contactInfo.map((info, i) => {
                  const Icon = info.icon
                  return (
                    <motion.a
                      key={i}
                      href={info.href}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
                      whileHover={{ x: 6 }}
                      className="flex items-start gap-4 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500/20 transition-colors mt-0.5">
                        <Icon size={18} className="text-orange-400" />
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-widest text-slate-500 mb-0.5">{info.label}</div>
                        <div className="text-white font-semibold group-hover:text-orange-400 transition-colors">{info.value}</div>
                      </div>
                    </motion.a>
                  )
                })}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="p-6 rounded-2xl bg-slate-900 border border-white/5"
              >
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Pakistan — HQ</div>
                <div className="text-white font-bold">Rana Muhammad Aleem Akhtar</div>
                <div className="text-slate-400 text-sm mt-1"><a href="https://www.google.com/maps/search/Hostel+City+Park+Road+Islamabad" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">Hostel Park Road, Islamabad</a></div>
                <div className="text-[11px] text-slate-600 mt-3">Quick response · Usually within 24 h</div>
              </motion.div>
            </motion.div>

            {/* Right: form */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-2">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="John Smith"
                      className="w-full bg-slate-900 border border-white/8 text-white rounded-xl px-4 py-3.5 text-sm placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/15 transition-all" />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-2">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@company.com"
                      className="w-full bg-slate-900 border border-white/8 text-white rounded-xl px-4 py-3.5 text-sm placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/15 transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-2">Phone</label>
                    <PhoneInput
                      countryCode={formData.countryCode}
                      phone={formData.phone}
                      onCountryCodeChange={v => setFormData(prev => ({ ...prev, countryCode: v }))}
                      onPhoneChange={v => setFormData(prev => ({ ...prev, phone: v }))}
                      placeholder="315 1664843"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-2">Service Needed</label>
                    <select name="service" value={formData.service} onChange={handleChange}
                      className="w-full bg-slate-900 border border-white/8 text-slate-300 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/15 transition-all">
                      <option value="">Select a service...</option>
                      <option value="ai-ml">AI &amp; Machine Learning</option>
                      <option value="computer-vision">Computer Vision</option>
                      <option value="automation">Automation &amp; Integration</option>
                      <option value="healthcare">Healthcare AI</option>
                      <option value="devops">DevOps &amp; Cloud</option>
                      <option value="data">Data Pipelines</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-2">Project Details</label>
                  <textarea name="message" value={formData.message} onChange={handleChange} required rows={5}
                    placeholder="Tell us about your project, goals, and timeline..."
                    className="w-full bg-slate-900 border border-white/8 text-white rounded-xl px-4 py-3.5 text-sm placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/15 transition-all resize-none" />
                </div>

                <motion.button
                  type="submit"
                  disabled={status === 'sending'}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn-primary py-4 text-base justify-center disabled:opacity-60"
                >
                  {status === 'sending' ? 'Sending...' :
                   status === 'sent' ? <><CheckCircle size={16} /> Message Sent!</> :
                   status === 'error' ? <><AlertCircle size={16} /> Failed — Try Again</> :
                   <><Send size={16} /> Send Message</>}
                </motion.button>

                <p className="text-center text-[11px] text-slate-600">
                  🔒 100% Confidential · ⚡ Reply Within 24 Hours · 🚀 100+ Projects Delivered
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
      <Chatbot />
    </>
  )
}
