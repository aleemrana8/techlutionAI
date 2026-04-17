import { useEffect, useRef, memo } from 'react'

function ParticlesBackground() {
  var canvasRef = useRef(null as HTMLCanvasElement | null)

  useEffect(function () {
    // Skip heavy canvas animation on mobile for scroll performance
    if (window.innerWidth < 768) return

    var canvas = canvasRef.current
    if (!canvas) return

    var ctx = canvas.getContext('2d')
    if (!ctx) return

    // Store in vars that won't be narrowed away
    var c = ctx
    var cvs = canvas
    var raf = 0
    var w = 0
    var h = 0

    var baseColors = [
      [249, 115, 22],
      [59, 130, 246],
      [139, 92, 246],
      [34, 211, 238],
      [255, 255, 255],
    ]

    function toRgba(rgb, a) {
      return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + a + ')'
    }

    var particles = []

    function makeParticle() {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 0.5,
        rgb: baseColors[Math.floor(Math.random() * baseColors.length)],
        a: Math.random() * 0.5 + 0.1,
        ad: (Math.random() - 0.5) * 0.005,
      }
    }

    function resizeCanvas() {
      w = window.innerWidth
      h = window.innerHeight
      cvs.width = w
      cvs.height = h
    }

    function init() {
      resizeCanvas()
      var count = w < 768 ? 20 : 50
      particles = []
      for (var k = 0; k < count; k++) {
        particles.push(makeParticle())
      }
    }

    function animate() {
      c.clearRect(0, 0, w, h)

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i]

        p.x += p.vx
        p.y += p.vy
        p.a += p.ad
        if (p.a <= 0.05 || p.a >= 0.6) p.ad *= -1
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10
        if (p.y > h + 10) p.y = -10

        // Glow
        var grad = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4)
        grad.addColorStop(0, toRgba(p.rgb, p.a))
        grad.addColorStop(1, 'transparent')
        c.fillStyle = grad
        c.beginPath()
        c.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2)
        c.fill()

        // Core dot
        c.fillStyle = toRgba(p.rgb, p.a * 1.5)
        c.beginPath()
        c.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        c.fill()

        // Connection lines
        for (var j = i + 1; j < particles.length; j++) {
          var q = particles[j]
          var dx = p.x - q.x
          var dy = p.y - q.y
          var dist = dx * dx + dy * dy
          if (dist < 18000) {
            var lineA = (1 - dist / 18000) * 0.08
            c.strokeStyle = toRgba([249, 115, 22], lineA)
            c.lineWidth = 0.5
            c.beginPath()
            c.moveTo(p.x, p.y)
            c.lineTo(q.x, q.y)
            c.stroke()
          }
        }
      }

      raf = requestAnimationFrame(animate)
    }

    init()
    raf = requestAnimationFrame(animate)

    function onResize() {
      resizeCanvas()
      for (var k = 0; k < particles.length; k++) {
        if (particles[k].x > w) particles[k].x = Math.random() * w
        if (particles[k].y > h) particles[k].y = Math.random() * h
      }
    }

    window.addEventListener('resize', onResize)

    return function () {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
      aria-hidden="true"
    />
  )
}

export default memo(ParticlesBackground)
