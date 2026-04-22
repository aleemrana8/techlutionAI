import { useEffect, useState, useCallback, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { playVoiceIntro } from './voiceIntro'

const ParticleNetwork = lazy(() => import('./ParticleNetwork'))
const AISphere = lazy(() => import('./AISphere'))

const DURATION_MS = 5000 // total time before exit starts

interface Props {
  onFinish: () => void
}

export default function WelcomeScreen({ onFinish }: Props) {
  const [phase, setPhase] = useState<'intro' | 'exit' | 'done'>('intro')
  const [voiceMuted, setVoiceMuted] = useState(false)
  const [cancelVoice, setCancelVoice] = useState<(() => void) | null>(null)

  // Start voice after 1s
  useEffect(() => {
    if (voiceMuted) return
    const timer = setTimeout(() => {
      const cancel = playVoiceIntro()
      setCancelVoice(() => cancel)
    }, 1000)
    return () => {
      clearTimeout(timer)
      cancelVoice?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceMuted])

  // Auto-exit timer
  useEffect(() => {
    const t = setTimeout(() => setPhase('exit'), DURATION_MS)
    return () => clearTimeout(t)
  }, [])

  const handleExitComplete = useCallback(() => {
    cancelVoice?.()
    onFinish()
  }, [cancelVoice, onFinish])

  const toggleMute = () => {
    setVoiceMuted((m) => {
      if (!m) cancelVoice?.()
      return !m
    })
  }

  if (phase === 'done') return null

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {phase !== 'done' && (
        <motion.div
          key="welcome-overlay"
          className="welcome-overlay"
          initial={{ opacity: 1 }}
          animate={phase === 'exit' ? { opacity: 0, scale: 1.08, filter: 'blur(12px)' } : { opacity: 1 }}
          transition={phase === 'exit' ? { duration: 0.7, ease: 'easeInOut' } : {}}
          onAnimationComplete={() => { if (phase === 'exit') setPhase('done') }}
        >
          {/* AI neural-network background */}
          <Suspense fallback={null}>
            <ParticleNetwork />
          </Suspense>

          {/* Dark vignette overlay */}
          <div className="welcome-vignette" />

          {/* Center content */}
          <div className="welcome-content">
            {/* 3D AI Sphere */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <Suspense fallback={null}>
                <AISphere />
              </Suspense>
            </motion.div>

            {/* Logo */}
            <motion.img
              src="/images/logo.png"
              alt="Techlution AI"
              className="welcome-logo"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* Heading */}
            <motion.h1
              className="welcome-heading"
              initial={{ opacity: 0, y: 30, letterSpacing: '-0.02em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.05em' }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
            >
              Welcome to{' '}
              <span className="welcome-heading-accent">Techlution AI</span>{' '}
              World
            </motion.h1>

            {/* Animated glow bar */}
            <motion.div
              className="welcome-glow-bar"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
            />

            {/* Tagline */}
            <motion.p
              className="welcome-tagline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ duration: 1, delay: 1.2 }}
            >
              End-to-End AI-Powered IT Solutions
            </motion.p>
          </div>

          {/* Mute toggle */}
          <button
            onClick={toggleMute}
            className="welcome-mute-btn"
            aria-label={voiceMuted ? 'Unmute voice' : 'Mute voice'}
          >
            {voiceMuted ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            )}
          </button>

          {/* Skip button */}
          <motion.button
            onClick={() => setPhase('exit')}
            className="welcome-skip-btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            whileHover={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            Skip →
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
