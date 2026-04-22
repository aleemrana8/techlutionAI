import { useEffect, useRef, memo, useCallback } from 'react'
import * as THREE from 'three'

function AISphere() {
  const mountRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  const onMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2
    mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2
  }, [])

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const isMobile = window.innerWidth < 768
    const w = el.clientWidth || 300
    const h = el.clientHeight || 300

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    // Scene + Camera
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 50)
    camera.position.z = 4

    // Main sphere – wireframe
    const sphereGeo = new THREE.IcosahedronGeometry(1.2, isMobile ? 2 : 3)
    const sphereWire = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    })
    const sphere = new THREE.Mesh(sphereGeo, sphereWire)
    scene.add(sphere)

    // Inner glow sphere
    const innerGeo = new THREE.SphereGeometry(0.85, 32, 32)
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x6a00ff,
      emissive: 0x6a00ff,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.25,
      metalness: 1,
      roughness: 0.1,
    })
    const innerSphere = new THREE.Mesh(innerGeo, innerMat)
    scene.add(innerSphere)

    // Outer ring
    const ringGeo = new THREE.TorusGeometry(1.6, 0.015, 16, 100)
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.4 })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = Math.PI / 2.5
    scene.add(ring)

    // Second ring
    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(1.9, 0.01, 16, 100),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.2 })
    )
    ring2.rotation.x = Math.PI / 1.8
    ring2.rotation.y = 0.5
    scene.add(ring2)

    // Lights
    const light1 = new THREE.PointLight(0x22d3ee, 3, 20)
    light1.position.set(3, 3, 3)
    scene.add(light1)

    const light2 = new THREE.PointLight(0x8b5cf6, 2, 20)
    light2.position.set(-3, -2, 2)
    scene.add(light2)

    const ambient = new THREE.AmbientLight(0x111827, 0.5)
    scene.add(ambient)

    if (!isMobile) window.addEventListener('mousemove', onMouseMove)

    let paused = false
    const onVis = () => { paused = document.hidden }
    document.addEventListener('visibilitychange', onVis)

    let raf = 0
    let time = 0
    const animate = () => {
      raf = requestAnimationFrame(animate)
      if (paused) return
      time += 0.01

      // Rotation
      sphere.rotation.y += 0.004
      sphere.rotation.x += 0.002
      ring.rotation.z += 0.003
      ring2.rotation.z -= 0.002

      // Pulsing
      const pulse = 1 + Math.sin(time * 2) * 0.06
      innerSphere.scale.setScalar(pulse)
      innerMat.emissiveIntensity = 0.4 + Math.sin(time * 3) * 0.25

      // Mouse interaction
      if (!isMobile) {
        const mx = mouseRef.current.x
        const my = mouseRef.current.y
        sphere.rotation.x += my * 0.002
        sphere.rotation.y += mx * 0.002
        camera.position.x += (mx * 0.3 - camera.position.x) * 0.03
        camera.position.y += (-my * 0.2 - camera.position.y) * 0.03
        camera.lookAt(0, 0, 0)
      }

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('visibilitychange', onVis)
      sphereGeo.dispose()
      sphereWire.dispose()
      innerGeo.dispose()
      innerMat.dispose()
      ringGeo.dispose()
      ringMat.dispose()
      ring2.geometry.dispose()
      ;(ring2.material as THREE.Material).dispose()
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [onMouseMove])

  return (
    <div
      ref={mountRef}
      className="relative w-[280px] h-[280px] md:w-[340px] md:h-[340px]"
    />
  )
}

export default memo(AISphere)
