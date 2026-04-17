import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Header({ onStartProject }: { onStartProject?: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30)
      
      // Active section detection
      const sections = ['services', 'projects', 'contact']
      let current = ''
      for (const id of sections) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 150) current = id
      }
      setActiveSection(current)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation = [
    { name: 'Services', href: '#services' },
    { name: 'Projects', href: '#projects' },
    { name: 'Contact', href: '#contact' },
  ]

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-950/95 md:backdrop-blur-xl backdrop-blur-sm border-b border-white/5 shadow-xl shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.a href="/" whileHover={{ scale: 1.02 }} className="flex items-center gap-2.5">
          <img src="/images/logo.png" alt="Techlution AI" className="h-10 w-auto" />
          <span className="text-xl font-bold text-white">
            Techlution<span className="text-orange-400"> AI</span>
          </span>
        </motion.a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 animated-underline ${
                activeSection === item.href.slice(1)
                  ? 'text-orange-400 bg-orange-500/10'
                  : 'text-slate-300 hover:text-orange-400 hover:bg-white/5'
              }`}
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="hidden md:flex items-center">
          <motion.button
            onClick={onStartProject}
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary text-sm"
          >
            Start a Project <ChevronRight size={16} />
          </motion.button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2.5 text-white rounded-lg hover:bg-white/10 transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-slate-950/98 backdrop-blur-sm border-b border-white/10"
          >
            <div className="px-4 py-4 space-y-1">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-3.5 text-base font-medium text-slate-300 hover:text-orange-400 hover:bg-white/5 rounded-lg transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-3 pb-1">
                <button
                  className="btn-primary w-full justify-center text-sm"
                  onClick={() => { setIsOpen(false); onStartProject?.() }}
                >
                  Start a Project <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

