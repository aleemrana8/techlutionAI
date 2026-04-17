import { useEffect, useRef, memo } from 'react'

// Tech pill badges spawn from behind cursor and fly outward
function ThreeBackground() {
  var canvasRef = useRef(null as HTMLCanvasElement | null)

  useEffect(function () {
    // Skip heavy canvas animation on mobile for scroll performance
    if (window.innerWidth < 768) return

    var canvas = canvasRef.current
    if (!canvas) return
    var c = canvas.getContext('2d')
    if (!c) return
    var cvs = canvas

    var w = window.innerWidth
    var h = window.innerHeight
    cvs.width = w
    cvs.height = h

    var isMobile = w < 768
    var raf = 0
    var time = 0
    var paused = false

    // Mouse position in pixels — start at center
    var mouseX = w / 2
    var mouseY = h / 2

    // ── Technology pill badges ──
    var TECHS = [
      { label: 'CLOUD', icon: '☁', color: [59,130,246] },
      { label: 'API', icon: '⟨⟩', color: [34,211,238] },
      { label: 'AI', icon: '✦', color: [139,92,246] },
      { label: 'WEB', icon: '⊕', color: [97,218,251] },
      { label: 'AUTO', icon: '⚡', color: [249,196,0] },
      { label: 'DEVOPS', icon: '⚙', color: [249,115,22] },
      { label: 'ML', icon: '🔗', color: [34,211,238] },
      { label: 'DEV', icon: '</>', color: [104,159,56] },
      { label: 'SECURE', icon: '🛡', color: [16,185,129] },
      { label: 'DATA', icon: '▤', color: [220,59,80] },
      { label: 'GPU', icon: '⬡', color: [220,59,80] },
      { label: 'BI', icon: '📊', color: [100,116,139] },
      { label: 'React', icon: '⚛', color: [97,218,251] },
      { label: 'Node', icon: '⬢', color: [104,159,56] },
      { label: 'Python', icon: '🐍', color: [55,118,171] },
      { label: 'Docker', icon: '🐳', color: [36,150,237] },
      { label: 'K8s', icon: '☸', color: [50,108,229] },
      { label: 'GPT', icon: '💬', color: [16,163,127] },
    ]

    var BADGE_COUNT = isMobile ? 10 : 18
    var spawnInterval = isMobile ? 18 : 10 // frames between spawns
    var nextSpawn = 0
    var spawnIdx = 0
    var badges = []

    function spawnBadge() {
      var t = TECHS[spawnIdx % TECHS.length]
      spawnIdx++
      var angle = Math.random() * Math.PI * 2
      var speed = 1.5 + Math.random() * 2.5
      badges.push({
        x: mouseX,
        y: mouseY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 180 + Math.random() * 120,
        label: t.label,
        icon: t.icon,
        rgb: t.color,
        scale: 0.15,
      })
    }

    function roundRect(x, y, rw, rh, rad) {
      c.beginPath()
      c.moveTo(x + rad, y)
      c.lineTo(x + rw - rad, y)
      c.quadraticCurveTo(x + rw, y, x + rw, y + rad)
      c.lineTo(x + rw, y + rh - rad)
      c.quadraticCurveTo(x + rw, y + rh, x + rw - rad, y + rh)
      c.lineTo(x + rad, y + rh)
      c.quadraticCurveTo(x, y + rh, x, y + rh - rad)
      c.lineTo(x, y + rad)
      c.quadraticCurveTo(x, y, x + rad, y)
      c.closePath()
    }

    function drawBadges() {
      var alive = []
      for (var i = 0; i < badges.length; i++) {
        var b = badges[i]
        b.life++

        // Accelerate outward
        b.vx *= 1.008
        b.vy *= 1.008
        b.x += b.vx
        b.y += b.vy

        // Scale up quickly then hold
        if (b.scale < 1) b.scale += (1 - b.scale) * 0.06

        // Fade: appear quickly, stay visible, then fade at end of life
        var lifeRatio = b.life / b.maxLife
        var alpha
        if (lifeRatio < 0.08) {
          alpha = (lifeRatio / 0.08) * 0.8
        } else if (lifeRatio < 0.7) {
          alpha = 0.8
        } else {
          alpha = 0.8 * (1 - (lifeRatio - 0.7) / 0.3)
        }

        // Kill if off screen or life ended
        if (b.life > b.maxLife || b.x < -200 || b.x > w + 200 || b.y < -200 || b.y > h + 200) {
          continue
        }
        alive.push(b)

        if (alpha < 0.02) continue

        var r = b.rgb[0]
        var g = b.rgb[1]
        var bl = b.rgb[2]
        var sc = b.scale

        // Measure pill
        c.font = 'bold ' + Math.round(16 * sc) + 'px Inter, system-ui, sans-serif'
        var textW = c.measureText(b.label).width
        var iconSize = Math.round(20 * sc)
        var pillW = iconSize + textW + 24 * sc
        var pillH = 38 * sc
        var pillX = b.x - pillW / 2
        var pillY = b.y - pillH / 2
        var rad = pillH / 2

        c.save()

        // Glow
        c.shadowBlur = 30
        c.shadowColor = 'rgba(' + r + ',' + g + ',' + bl + ',' + (alpha * 0.7) + ')'

        // Pill background
        roundRect(pillX, pillY, pillW, pillH, rad)
        c.fillStyle = 'rgba(' + r + ',' + g + ',' + bl + ',' + (alpha * 0.2) + ')'
        c.fill()

        // Pill border
        roundRect(pillX, pillY, pillW, pillH, rad)
        c.strokeStyle = 'rgba(' + r + ',' + g + ',' + bl + ',' + (alpha * 0.6) + ')'
        c.lineWidth = 1.8
        c.stroke()

        c.shadowBlur = 0

        // Icon
        c.font = iconSize + 'px "Segoe UI Emoji", "Apple Color Emoji", sans-serif'
        c.textAlign = 'left'
        c.textBaseline = 'middle'
        c.fillStyle = 'rgba(' + r + ',' + g + ',' + bl + ',' + (alpha * 1.5) + ')'
        c.fillText(b.icon, pillX + 8 * sc, b.y + 1)

        // Label
        c.font = 'bold ' + Math.round(16 * sc) + 'px Inter, system-ui, sans-serif'
        c.fillStyle = 'rgba(' + r + ',' + g + ',' + bl + ',' + (alpha * 1.4) + ')'
        c.fillText(b.label, pillX + iconSize + 14 * sc, b.y + 1)

        c.restore()
      }
      badges = alive
    }

    function animate() {
      if (paused) { raf = requestAnimationFrame(animate); return }
      time++
      c.clearRect(0, 0, w, h)

      // Spawn new badges at interval (cap max on screen)
      nextSpawn--
      if (nextSpawn <= 0 && badges.length < BADGE_COUNT) {
        spawnBadge()
        nextSpawn = spawnInterval
      }

      drawBadges()

      raf = requestAnimationFrame(animate)
    }

    raf = requestAnimationFrame(animate)

    function onResize() {
      w = window.innerWidth
      h = window.innerHeight
      cvs.width = w
      cvs.height = h
    }

    function onMouse(e) {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    function onVisChange() { paused = document.hidden }

    window.addEventListener('resize', onResize)
    if (!isMobile) {
      document.addEventListener('mousemove', onMouse, { passive: true })
    }
    document.addEventListener('visibilitychange', onVisChange)

    return function () {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('mousemove', onMouse)
      document.removeEventListener('visibilitychange', onVisChange)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -3, opacity: 0.5 }}
      aria-hidden="true"
    />
  )
}

export default memo(ThreeBackground)
