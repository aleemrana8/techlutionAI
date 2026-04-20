import { useRef, useMemo } from 'react'
import { useScroll, useTransform, useSpring, useReducedMotion, MotionValue } from 'framer-motion'

/* ── Shared spring config ── */
const SPRING = { stiffness: 100, damping: 30, restDelta: 0.001 }

/* ── Check mobile once ── */
const getIsMobile = () => typeof window !== 'undefined' && window.innerWidth < 768

/* ── Parallax hook: moves element at different speed than scroll ── */
export function useParallax(speed = 0.3) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const effectiveSpeed = prefersReduced || getIsMobile() ? 0 : speed
  const raw = useTransform(scrollYProgress, [0, 1], [-60 * effectiveSpeed, 60 * effectiveSpeed])
  const y = useSpring(raw, SPRING)

  return { ref, y }
}

/* ── Section fade + scale on scroll ── */
export function useSectionReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const isMobile = getIsMobile()

  // Opacity: fade-in only, stays fully visible (no fade-out on scroll away)
  const rawOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1])
  const opacity = prefersReduced ? (1 as unknown as MotionValue<number>) : rawOpacity

  // Slight scale in (no scale-out)
  const rawScale = useTransform(
    scrollYProgress,
    [0, 0.2],
    isMobile ? [1, 1] : [0.96, 1]
  )
  const scale = useSpring(rawScale, SPRING)

  // No blur on entry — always clear
  const blurValue = 0

  return { ref, opacity, scale, blurValue }
}

/* ── Text reveal: staggered word animation ── */
export function useTextReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.9', 'start 0.4'],
  })

  return { ref, progress: scrollYProgress }
}

/* ── Horizontal translate on scroll (for cards, etc) ── */
export function useScrollX(range = 100) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const effectiveRange = getIsMobile() ? 0 : range
  const raw = useTransform(scrollYProgress, [0, 1], [effectiveRange, -effectiveRange])
  const x = useSpring(raw, SPRING)

  return { ref, x }
}

/* ── Optimized variants for staggered children ── */
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

export const fadeUpItem = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

export const scaleInItem = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

/* ── useMemo'd viewport config ── */
export function useViewportOnce(margin = '-80px') {
  return useMemo(() => ({ once: true, margin }), [margin])
}
