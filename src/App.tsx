import { motion, useScroll, useSpring } from 'framer-motion'
import { lazy, Suspense, useEffect, useState, useCallback } from 'react'
import AppRoutes from './routes/AppRoutes'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { useVisitorTracking } from './hooks/useVisitorTracking'

const ParticlesBackground = lazy(() => import('./components/animations/ParticlesBackground'))
const CursorGlow = lazy(() => import('./components/animations/CursorGlow'))
const NeuralBackground = lazy(() => import('./components/animations/NeuralBackground'))
const ThreeBackground = lazy(() => import('./components/animations/ThreeBackground'))
const WelcomeScreen = lazy(() => import('./components/welcome/WelcomeScreen'))

function App() {
  /* ── Welcome screen: show on every fresh visit, skip only on F5 refresh ── */
  const [showWelcome, setShowWelcome] = useState(() => {
    // Already shown this session (e.g. returning from admin panel) → skip
    if (sessionStorage.getItem('welcomeShown')) return false
    // Detect refresh (F5) — skip welcome on reload only
    const nav = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
    if (nav.length > 0 && nav[0].type === 'reload') return false
    // Fresh visit / back-forward / new tab / reopened tab → show welcome
    return true
  })

  // Handle bfcache restoration (tab closed then reopened via Ctrl+Shift+T)
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setShowWelcome(true)
    }
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

  const handleWelcomeFinish = useCallback(() => {
    sessionStorage.setItem('welcomeShown', '1')
    setShowWelcome(false)
  }, [])

  /* ── Lenis smooth scroll ── */
  useSmoothScroll()

  /* ── Visitor tracking ── */
  useVisitorTracking()

  /* ── Mobile detection ── */
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  /* ── Scroll progress bar ── */
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  return (
    <div className="relative min-h-screen">

      {/* ── Welcome Screen (one-time per session) ── */}
      {showWelcome && (
        <Suspense fallback={null}>
          <WelcomeScreen onFinish={handleWelcomeFinish} />
        </Suspense>
      )}

      {/* ── Scroll progress indicator ── */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-violet-500 to-orange-500 origin-left z-[9999]"
        style={{ scaleX }}
      />

      {/* ── Fixed cinematic background canvas ── */}
      <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">

        {/* Base deep-navy */}
        <div className="absolute inset-0 bg-[#020817]" />

        {/* Mesh gradient layer */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 90% 55% at 10% 0%, rgba(59,130,246,0.20) 0%, transparent 60%),' +
              'radial-gradient(ellipse 70% 60% at 90% 15%, rgba(139,92,246,0.15) 0%, transparent 60%),' +
              'radial-gradient(ellipse 65% 55% at 50% 95%, rgba(249,115,22,0.10) 0%, transparent 60%)',
          }}
        />

        {/* Perspective grid */}
        <div className="site-grid absolute inset-0" />

        {/* Ambient orb — top-left blue */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: isMobile ? 350 : 700, height: isMobile ? 350 : 700, top: '-8%', left: '-5%',
            background: `radial-gradient(circle, rgba(59,130,246,${isMobile ? 0.08 : 0.14}) 0%, transparent 70%)`,
          }}
          animate={isMobile ? {} : { scale: [1, 1.18, 1], x: [0, 45, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Ambient orb — right purple */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: isMobile ? 300 : 600, height: isMobile ? 300 : 600, top: '25%', right: '-8%',
            background: `radial-gradient(circle, rgba(139,92,246,${isMobile ? 0.06 : 0.11}) 0%, transparent 70%)`,
          }}
          animate={isMobile ? {} : { scale: [1, 1.22, 1], x: [0, -35, 0], y: [0, 40, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />

        {/* Ambient orb — bottom orange */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: isMobile ? 400 : 800, height: isMobile ? 400 : 800, bottom: '-10%', left: '20%',
            background: `radial-gradient(circle, rgba(249,115,22,${isMobile ? 0.04 : 0.08}) 0%, transparent 70%)`,
          }}
          animate={isMobile ? {} : { scale: [1, 1.12, 1], x: [0, 25, 0], y: [0, -25, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut', delay: 8 }}
        />

        {/* Ambient orb — mid cyan */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: isMobile ? 200 : 400, height: isMobile ? 200 : 400, top: '55%', left: '45%',
            background: `radial-gradient(circle, rgba(34,211,238,${isMobile ? 0.04 : 0.07}) 0%, transparent 70%)`,
          }}
          animate={isMobile ? {} : { scale: [1, 1.3, 1], x: [0, -20, 0], y: [0, -40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      {/* ── Global readability overlay ── */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{ background: isMobile
          ? 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.28) 100%)'
          : 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.30) 50%, rgba(0,0,0,0.48) 100%)'
        }}
      />

      {/* ── Site content with routing ── */}
      <div className="relative z-10">
        <AppRoutes />
      </div>

      {/* ── Background Effects (lazy loaded) ── */}
      <Suspense fallback={null}>
        <ThreeBackground />
        <NeuralBackground />
        <ParticlesBackground />
        <CursorGlow />
      </Suspense>
    </div>
  )
}

export default App
