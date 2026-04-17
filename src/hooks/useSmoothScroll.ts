import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

let lenisInstance: Lenis | null = null

export function useSmoothScroll() {
  const rafId = useRef<number>(0)

  useEffect(() => {
    // Skip on mobile for performance
    const isMobile = window.innerWidth < 768
    if (isMobile) return

    lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
      infinite: false,
    })

    function raf(time: number) {
      lenisInstance?.raf(time)
      rafId.current = requestAnimationFrame(raf)
    }
    rafId.current = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId.current)
      lenisInstance?.destroy()
      lenisInstance = null
    }
  }, [])

  return lenisInstance
}

export function getLenis() {
  return lenisInstance
}
