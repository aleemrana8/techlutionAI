import { useEffect, useRef, memo } from 'react'
import * as THREE from 'three'

const DESKTOP_NODES = 180
const MOBILE_NODES = 60
const CONNECTION_DIST = 2.8
const PULSE_SPEED = 0.6

interface Node {
  mesh: THREE.Mesh
  vx: number
  vy: number
  vz: number
}

interface Pulse {
  mesh: THREE.Mesh
  from: THREE.Vector3
  to: THREE.Vector3
  t: number
  speed: number
}

function ParticleNetwork({ onReady }: { onReady?: () => void }) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const isMobile = window.innerWidth < 768
    const NODE_COUNT = isMobile ? MOBILE_NODES : DESKTOP_NODES
    const w = window.innerWidth
    const h = window.innerHeight

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    // Scene & Camera
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100)
    camera.position.z = 8

    // Mouse tracking for parallax
    let mouseX = 0
    let mouseY = 0
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / w - 0.5) * 2
      mouseY = (e.clientY / h - 0.5) * 2
    }
    if (!isMobile) window.addEventListener('mousemove', onMouseMove)

    // Node material
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.7 })
    const nodeGeo = new THREE.SphereGeometry(0.035, 8, 8)

    // Create nodes
    const nodes: Node[] = []
    const spread = isMobile ? 6 : 10
    for (let i = 0; i < NODE_COUNT; i++) {
      const mesh = new THREE.Mesh(nodeGeo, nodeMat.clone())
      mesh.position.set(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread * (h / w),
        (Math.random() - 0.5) * 4
      )
      scene.add(mesh)
      nodes.push({
        mesh,
        vx: (Math.random() - 0.5) * 0.003,
        vy: (Math.random() - 0.5) * 0.003,
        vz: (Math.random() - 0.5) * 0.001,
      })
    }

    // Lines
    const linesMat = new THREE.LineBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.15 })
    const linesGeo = new THREE.BufferGeometry()
    const maxLines = NODE_COUNT * 6
    const linePositions = new Float32Array(maxLines * 6)
    linesGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
    const linesMesh = new THREE.LineSegments(linesGeo, linesMat)
    scene.add(linesMesh)

    // Pulse particles traveling along lines
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.9 })
    const pulseGeo = new THREE.SphereGeometry(0.05, 6, 6)
    const pulses: Pulse[] = []

    function spawnPulse() {
      if (pulses.length > (isMobile ? 5 : 15)) return
      const a = nodes[Math.floor(Math.random() * nodes.length)]
      const b = nodes[Math.floor(Math.random() * nodes.length)]
      if (a === b) return
      const dist = a.mesh.position.distanceTo(b.mesh.position)
      if (dist > CONNECTION_DIST) return
      const mesh = new THREE.Mesh(pulseGeo, pulseMat)
      scene.add(mesh)
      pulses.push({
        mesh,
        from: a.mesh.position.clone(),
        to: b.mesh.position.clone(),
        t: 0,
        speed: PULSE_SPEED + Math.random() * 0.3,
      })
    }

    // Visibility handling
    let paused = false
    const onVisChange = () => { paused = document.hidden }
    document.addEventListener('visibilitychange', onVisChange)

    let raf = 0
    let frame = 0
    const animate = () => {
      raf = requestAnimationFrame(animate)
      if (paused) return
      frame++

      // Move nodes
      for (const n of nodes) {
        n.mesh.position.x += n.vx
        n.mesh.position.y += n.vy
        n.mesh.position.z += n.vz

        // Bounce
        const halfSpread = spread * 0.5
        if (Math.abs(n.mesh.position.x) > halfSpread) n.vx *= -1
        if (Math.abs(n.mesh.position.y) > halfSpread * (h / w)) n.vy *= -1
        if (Math.abs(n.mesh.position.z) > 2) n.vz *= -1
      }

      // Update lines
      let lineIdx = 0
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (lineIdx >= maxLines) break
          const d = nodes[i].mesh.position.distanceTo(nodes[j].mesh.position)
          if (d < CONNECTION_DIST) {
            const p = nodes[i].mesh.position
            const q = nodes[j].mesh.position
            linePositions[lineIdx * 6] = p.x
            linePositions[lineIdx * 6 + 1] = p.y
            linePositions[lineIdx * 6 + 2] = p.z
            linePositions[lineIdx * 6 + 3] = q.x
            linePositions[lineIdx * 6 + 4] = q.y
            linePositions[lineIdx * 6 + 5] = q.z
            lineIdx++
          }
        }
      }
      // Zero out remaining
      for (let i = lineIdx * 6; i < maxLines * 6; i++) linePositions[i] = 0
      linesGeo.attributes.position.needsUpdate = true
      linesGeo.setDrawRange(0, lineIdx * 2)

      // Spawn pulses periodically
      if (frame % 20 === 0) spawnPulse()

      // Animate pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i]
        p.t += 0.02 * p.speed
        if (p.t >= 1) {
          scene.remove(p.mesh)
          pulses.splice(i, 1)
          continue
        }
        p.mesh.position.lerpVectors(p.from, p.to, p.t)
      }

      // Camera parallax
      camera.position.x += (mouseX * 0.4 - camera.position.x) * 0.02
      camera.position.y += (-mouseY * 0.3 - camera.position.y) * 0.02
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }

    animate()
    onReady?.()

    // Resize
    const onResize = () => {
      const nw = window.innerWidth
      const nh = window.innerHeight
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('visibilitychange', onVisChange)
      // Cleanup Three
      for (const n of nodes) { scene.remove(n.mesh); n.mesh.geometry.dispose() }
      for (const p of pulses) { scene.remove(p.mesh) }
      scene.remove(linesMesh)
      linesGeo.dispose()
      linesMat.dispose()
      nodeMat.dispose()
      nodeGeo.dispose()
      pulseMat.dispose()
      pulseGeo.dispose()
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [onReady])

  return <div ref={mountRef} className="absolute inset-0" />
}

export default memo(ParticleNetwork)
