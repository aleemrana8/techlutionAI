import { useEffect, useRef, memo } from 'react'

// Premium blurred ball cursor — additive visual layer, keeps default cursor visible
function CursorGlow() {
  var ballRef = useRef(null as HTMLDivElement | null)

  useEffect(function () {
    if (window.innerWidth < 768) return

    var ball = ballRef.current
    if (!ball) return

    var mx = -200
    var my = -200
    var bx = -200
    var by = -200
    var hovered = false
    var clicking = false
    var raf = 0

    function onMove(e) {
      mx = e.clientX
      my = e.clientY
    }

    function onLeave() {
      mx = -200
      my = -200
    }

    function onOver(e) {
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' ||
          e.target.closest('a, button, [role="button"], .cursor-hover')) {
        hovered = true
      }
    }

    function onOut() {
      hovered = false
    }

    function onDown() {
      clicking = true
      // Reset click pulse after animation
      setTimeout(function () { clicking = false }, 250)
    }

    function animate() {
      // Smooth lerp follow — slight delay for premium feel
      bx += (mx - bx) * 0.1
      by += (my - by) * 0.1

      var scale = 1
      if (clicking) scale = 1.4
      else if (hovered) scale = 1.25

      // Blinking / pulsing glow
      var pulse = 0.55 + Math.sin(Date.now() * 0.004) * 0.2
      var baseOpacity = hovered ? 0.75 : pulse

      ball.style.transform = 'translate3d(' + bx + 'px,' + by + 'px, 0) translate(-50%,-50%) scale(' + scale + ')'
      ball.style.opacity = (mx < -100) ? '0' : String(baseOpacity)

      raf = requestAnimationFrame(animate)
    }

    document.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseover', onOver, { passive: true })
    document.addEventListener('mouseout', onOut, { passive: true })
    document.addEventListener('mousedown', onDown)
    raf = requestAnimationFrame(animate)

    return function () {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      document.removeEventListener('mousedown', onDown)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={ballRef}
      className="fixed top-0 left-0 pointer-events-none hidden md:block"
      style={{
        width: 160,
        height: 160,
        borderRadius: '50%',
        zIndex: 9998,
        opacity: 0,
        background: 'radial-gradient(circle at 40% 40%, rgba(34,211,238,0.65), rgba(139,92,246,0.5) 45%, rgba(59,130,246,0.25) 75%, transparent 100%)',
        filter: 'blur(10px)',
        boxShadow: '0 0 40px 12px rgba(34,211,238,0.2), 0 0 80px 25px rgba(139,92,246,0.12)',
        willChange: 'transform, opacity',
        transition: 'opacity 0.35s ease, filter 0.3s ease, box-shadow 0.3s ease',
        mixBlendMode: 'screen',
      }}
      aria-hidden="true"
    />
  )
}

export default memo(CursorGlow)
