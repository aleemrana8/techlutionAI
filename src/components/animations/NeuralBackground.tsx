import { useEffect, useRef, memo } from 'react'

// Enhanced neural network / AI data-flow animated background with mouse interaction
function NeuralBackground() {
  var canvasRef = useRef(null as HTMLCanvasElement | null)

  useEffect(function () {
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
    var NODE_COUNT = isMobile ? 15 : 50
    var CONNECT_DIST = isMobile ? 180 : 260
    var MOUSE_RADIUS = 200
    var nodes = []
    var pulses = []
    var raf = 0
    var time = 0
    var paused = false
    var mx = -9999
    var my = -9999

    for (var i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        ox: 0,
        oy: 0,
        vx: (Math.random() - 0.5) * 0.12 + 0.03,
        vy: (Math.random() - 0.5) * 0.12,
        size: Math.random() * 2 + 0.8,
        pulse: Math.random() * Math.PI * 2,
        layer: Math.floor(Math.random() * 3),
      })
    }

    var layerColors = [
      [59, 130, 246],
      [139, 92, 246],
      [34, 211, 238],
    ]

    function spawnPulse() {
      if (nodes.length < 2) return
      var fromIdx = Math.floor(Math.random() * nodes.length)
      var toIdx = Math.floor(Math.random() * nodes.length)
      if (fromIdx === toIdx) return
      var from = nodes[fromIdx]
      var to = nodes[toIdx]
      var dx = to.x - from.x
      var dy = to.y - from.y
      var dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > CONNECT_DIST) return
      pulses.push({
        fromX: from.x, fromY: from.y,
        toX: to.x, toY: to.y,
        progress: 0,
        speed: 0.005 + Math.random() * 0.01,
        color: from.layer,
      })
    }

    function drawGrid() {
      var spacing = isMobile ? 80 : 60
      c.strokeStyle = 'rgba(59, 130, 246, 0.018)'
      c.lineWidth = 0.5
      for (var gx = 0; gx < w; gx += spacing) {
        c.beginPath()
        c.moveTo(gx, 0)
        c.lineTo(gx, h)
        c.stroke()
      }
      for (var gy = 0; gy < h; gy += spacing) {
        c.beginPath()
        c.moveTo(0, gy)
        c.lineTo(w, gy)
        c.stroke()
      }
    }

    function animate() {
      if (paused) { raf = requestAnimationFrame(animate); return }
      time++
      c.clearRect(0, 0, w, h)

      drawGrid()

      if (time % 18 === 0) spawnPulse()
      if (time % 40 === 0) spawnPulse()

      // Global glow pulse
      var glowPulse = 0.7 + Math.sin(time * 0.008) * 0.3

      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i]
        n.x += n.vx
        n.y += n.vy
        n.pulse += 0.02

        // Mouse repulsion (soft push away)
        if (!isMobile) {
          var mdx = n.x - mx
          var mdy = n.y - my
          var mdist = Math.sqrt(mdx * mdx + mdy * mdy)
          if (mdist < MOUSE_RADIUS && mdist > 0) {
            var force = (1 - mdist / MOUSE_RADIUS) * 1.2
            n.ox += (mdx / mdist) * force
            n.oy += (mdy / mdist) * force
          }
          // Ease offset back to 0
          n.ox *= 0.92
          n.oy *= 0.92
        }

        var nx = n.x + n.ox
        var ny = n.y + n.oy

        // Wrap edges
        if (n.x > w + 20) n.x = -20
        if (n.x < -20) n.x = w + 20
        if (n.y > h + 20) n.y = -20
        if (n.y < -20) n.y = h + 20

        var lc = layerColors[n.layer]

        // Connections
        for (var j = i + 1; j < nodes.length; j++) {
          var m = nodes[j]
          var mmx = m.x + m.ox
          var mmy = m.y + m.oy
          var dx = nx - mmx
          var dy = ny - mmy
          var dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECT_DIST) {
            var alpha = (1 - dist / CONNECT_DIST) * 0.07 * glowPulse
            c.strokeStyle = 'rgba(' + lc[0] + ',' + lc[1] + ',' + lc[2] + ',' + alpha + ')'
            c.lineWidth = 0.6
            c.beginPath()
            c.moveTo(nx, ny)
            c.lineTo(mmx, mmy)
            c.stroke()
          }
        }

        // Mouse proximity: draw extra bright connections to cursor
        if (!isMobile && mx > 0) {
          var cdx = nx - mx
          var cdy = ny - my
          var cdist = Math.sqrt(cdx * cdx + cdy * cdy)
          if (cdist < MOUSE_RADIUS * 0.8) {
            var ca = (1 - cdist / (MOUSE_RADIUS * 0.8)) * 0.12 * glowPulse
            c.strokeStyle = 'rgba(249, 115, 22, ' + ca + ')'
            c.lineWidth = 0.8
            c.beginPath()
            c.moveTo(nx, ny)
            c.lineTo(mx, my)
            c.stroke()
          }
        }

        // Node glow with shadowBlur
        var nodeAlpha = (0.12 + Math.sin(n.pulse) * 0.08) * glowPulse
        c.shadowBlur = 12
        c.shadowColor = 'rgba(' + lc[0] + ',' + lc[1] + ',' + lc[2] + ',0.3)'

        var nodeGrad = c.createRadialGradient(nx, ny, 0, nx, ny, n.size * 7)
        nodeGrad.addColorStop(0, 'rgba(' + lc[0] + ',' + lc[1] + ',' + lc[2] + ',' + (nodeAlpha * 0.7) + ')')
        nodeGrad.addColorStop(1, 'transparent')
        c.fillStyle = nodeGrad
        c.beginPath()
        c.arc(nx, ny, n.size * 7, 0, Math.PI * 2)
        c.fill()

        c.shadowBlur = 0

        // Node core
        c.beginPath()
        c.arc(nx, ny, n.size, 0, Math.PI * 2)
        c.fillStyle = 'rgba(' + lc[0] + ',' + lc[1] + ',' + lc[2] + ',' + (nodeAlpha * 1.8) + ')'
        c.fill()
      }

      // Data pulses
      var activePulses = []
      for (var p = 0; p < pulses.length; p++) {
        var pulse = pulses[p]
        pulse.progress += pulse.speed
        if (pulse.progress >= 1) continue
        activePulses.push(pulse)

        var px = pulse.fromX + (pulse.toX - pulse.fromX) * pulse.progress
        var py = pulse.fromY + (pulse.toY - pulse.fromY) * pulse.progress
        var pulseAlpha = Math.sin(pulse.progress * Math.PI) * 0.45 * glowPulse
        var pc = layerColors[pulse.color]

        c.shadowBlur = 8
        c.shadowColor = 'rgba(' + pc[0] + ',' + pc[1] + ',' + pc[2] + ',0.4)'

        var pGrad = c.createRadialGradient(px, py, 0, px, py, 10)
        pGrad.addColorStop(0, 'rgba(' + pc[0] + ',' + pc[1] + ',' + pc[2] + ',' + pulseAlpha + ')')
        pGrad.addColorStop(1, 'transparent')
        c.fillStyle = pGrad
        c.beginPath()
        c.arc(px, py, 10, 0, Math.PI * 2)
        c.fill()

        c.shadowBlur = 0

        c.beginPath()
        c.arc(px, py, 2, 0, Math.PI * 2)
        c.fillStyle = 'rgba(255, 255, 255, ' + (pulseAlpha * 0.6) + ')'
        c.fill()
      }
      pulses = activePulses

      // Horizontal data-flow streaks
      for (var s = 0; s < 3; s++) {
        var sy = (h * (s + 1)) / 4
        var sx = ((time * (0.3 + s * 0.15)) % (w + 200)) - 100
        var streakAlpha = (0.03 + Math.sin(time * 0.01 + s) * 0.015) * glowPulse
        var sGrad = c.createLinearGradient(sx - 80, sy, sx + 80, sy)
        sGrad.addColorStop(0, 'transparent')
        sGrad.addColorStop(0.5, 'rgba(34, 211, 238, ' + streakAlpha + ')')
        sGrad.addColorStop(1, 'transparent')
        c.fillStyle = sGrad
        c.fillRect(sx - 80, sy - 1, 160, 2)
      }

      raf = requestAnimationFrame(animate)
    }

    raf = requestAnimationFrame(animate)

    function onResize() {
      w = window.innerWidth
      h = window.innerHeight
      cvs.width = w
      cvs.height = h
    }

    function onMouse(e) { mx = e.clientX; my = e.clientY }
    function onMouseLeave() { mx = -9999; my = -9999 }
    function onVisChange() { paused = document.hidden }

    window.addEventListener('resize', onResize)
    if (!isMobile) {
      document.addEventListener('mousemove', onMouse, { passive: true })
      document.addEventListener('mouseleave', onMouseLeave)
    }
    document.addEventListener('visibilitychange', onVisChange)

    return function () {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('mousemove', onMouse)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('visibilitychange', onVisChange)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -2, opacity: 0.4 }}
      aria-hidden="true"
    />
  )
}

export default memo(NeuralBackground)
