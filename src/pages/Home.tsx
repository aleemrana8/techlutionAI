import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Hero from '../components/sections/Hero'
import MarqueeTicker from '../components/sections/Marquee'
import Services from '../components/sections/Services'
import Projects from '../components/sections/Projects'
import Chatbot from '../components/Chatbot'
import StartProjectModal from '../components/StartProjectModal'
import ContactUsModal from '../components/ContactUsModal'
import Toast from '../components/common/Toast'
import { useSectionReveal } from '../hooks/useScrollAnimations'

/* ── Scroll-animated section wrapper ── */
function ScrollSection({ children }: { children: React.ReactNode }) {
  const { ref, opacity, scale, blurValue } = useSectionReveal()

  return (
    <motion.div
      ref={ref}
      style={{
        opacity,
        scale,
        filter: typeof blurValue === 'number' ? 'none' : blurValue as any,
      }}
    >
      {children}
    </motion.div>
  )
}

export default function Home() {
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [toast, setToast] = useState({ show: false, title: '', message: '' })
  const openModal = () => setProjectModalOpen(true)
  const openContactModal = () => setContactModalOpen(true)
  const closeToast = useCallback(() => setToast(t => ({ ...t, show: false })), [])

  return (
    <>
      <Header onStartProject={openModal} />
      <main>
        <ScrollSection>
          <Hero onStartProject={openModal} onContactUs={openContactModal} />
        </ScrollSection>
        <MarqueeTicker />
        <ScrollSection>
          <Services onStartProject={openModal} onContactUs={openContactModal} />
        </ScrollSection>
        <MarqueeTicker />
        <ScrollSection>
          <Projects onContactUs={openContactModal} onStartProject={openModal} />
        </ScrollSection>
      </main>
      <ScrollSection>
        <Footer />
      </ScrollSection>
      <Chatbot />
      <StartProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSuccess={() => setToast({ show: true, title: 'Project Request Sent! 🚀', message: 'Thank you for reaching out to Techlution AI. Our team will review your requirements and respond within 24 hours with tailored solutions.' })}
      />
      <ContactUsModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        onSuccess={() => setToast({ show: true, title: 'Message Sent Successfully! ✉️', message: 'Thank you for contacting Techlution AI. Our experts will respond within 24 hours with next steps.' })}
      />
      <Toast show={toast.show} title={toast.title} message={toast.message} onClose={closeToast} />
    </>
  )
}
