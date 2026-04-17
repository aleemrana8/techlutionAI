import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react'

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

export default function Footer() {
  const services = [
    'AI & Machine Learning',
    'Healthcare AI Solutions',
    'Automation & Integration',
    'Web & App Development',
    'Custom Software',
    'DevOps & Cloud',
    'E-Commerce Solutions',
    'Cybersecurity Solutions',
  ]

  const technologies = [
    'Python & FastAPI',
    'React & Next.js',
    'Node.js & Express',
    'LangChain & OpenAI',
    'Azure & AWS',
    'Docker & Kubernetes',
    'PostgreSQL & MongoDB',
  ]

  const quickLinks = [
    { name: 'Services', href: '#services' },
    { name: 'Projects', href: '#projects' },
    { name: 'Contact Us', href: '#contact' },
  ]

  return (
    <footer className="bg-slate-950/95 border-t border-white/5 md:backdrop-blur-sm">

      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20, ...(isMobile ? {} : { filter: 'blur(4px)' }) }}
            whileInView={{ opacity: 1, y: 0, ...(isMobile ? {} : { filter: 'blur(0px)' }) }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-2.5 mb-5">
              <img src="/images/logo.png" alt="Techlution AI" className="h-10 w-auto" />
              <span className="text-xl font-bold text-white">
                Techlution<span className="text-orange-400"> AI</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              End-to-end AI-powered IT solutions that minimize workforce, automate operations,
              and make business easier — from idea to deployment.
            </p>
            <div className="space-y-2.5">
              <a
                href="tel:+923151664843"
                className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-orange-400 transition-colors py-1"
              >
                <Phone size={16} />
                <span>+92 315 1664843</span>
              </a>
              <a
                href="mailto:raleem811811@gmail.com"
                className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-orange-400 transition-colors py-1"
              >
                <Mail size={16} />
                <span>raleem811811@gmail.com</span>
              </a>
              <a
                href="https://www.google.com/maps/search/Hostel+City+Park+Road+Islamabad"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 text-sm text-slate-400 hover:text-orange-400 transition-colors py-1"
              >
                <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                <span>Hostel Park Road, Islamabad</span>
              </a>
            </div>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20, ...(isMobile ? {} : { filter: 'blur(4px)' }) }}
            whileInView={{ opacity: 1, y: 0, ...(isMobile ? {} : { filter: 'blur(0px)' }) }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <h4 className="text-white font-semibold mb-5 uppercase text-xs tracking-widest">
              Services
            </h4>
            <ul className="space-y-3 md:space-y-2.5">
              {services.map((s) => (
                <li key={s}>
                  <a
                    href="#services"
                    className="flex items-center gap-1.5 text-slate-400 text-sm hover:text-orange-400 transition-colors group py-0.5"
                  >
                    <ArrowRight
                      size={12}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-orange-400 flex-shrink-0"
                    />
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Technologies */}
          <motion.div
            initial={{ opacity: 0, y: 20, ...(isMobile ? {} : { filter: 'blur(4px)' }) }}
            whileInView={{ opacity: 1, y: 0, ...(isMobile ? {} : { filter: 'blur(0px)' }) }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <h4 className="text-white font-semibold mb-5 uppercase text-xs tracking-widest">
              Technologies
            </h4>
            <ul className="space-y-3 md:space-y-2.5">
              {technologies.map((t) => (
                <li key={t}>
                  <span className="text-slate-400 text-sm">{t}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Quick Links + CTA mini */}
          <motion.div
            initial={{ opacity: 0, y: 20, ...(isMobile ? {} : { filter: 'blur(4px)' }) }}
            whileInView={{ opacity: 1, y: 0, ...(isMobile ? {} : { filter: 'blur(0px)' }) }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <h4 className="text-white font-semibold mb-5 uppercase text-xs tracking-widest">
              Quick Links
            </h4>
            <ul className="space-y-3 md:space-y-2.5 mb-8">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-slate-400 text-sm hover:text-orange-400 transition-colors py-0.5 inline-block"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Bottom copyright bar */}
      <div className="border-t border-white/5 py-6 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm md:text-xs text-slate-500">
          <span>
            © 2024–2026 Techlution AI — Founded by Rana Muhammad Aleem Akhtar. All rights reserved.
          </span>
          <span>Innovate · Automate · Elevate — Smart Solutions, Minimum Cost, Maximum Impact</span>
        </div>
      </div>
    </footer>
  )
}
