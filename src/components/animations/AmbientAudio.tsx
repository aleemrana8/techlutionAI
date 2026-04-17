import { useEffect, useRef, useState, useCallback, memo } from 'react'

// Procedural ambient AI sound using Web Audio API — no file needed
function AmbientAudio() {
  var audioCtxRef = useRef(null as AudioContext | null)
  var gainRef = useRef(null as GainNode | null)
  var startedRef = useRef(false)
  var [muted, setMuted] = useState(true)
  var [ready, setReady] = useState(false)
  var TARGET_VOLUME = 0.08

  var initAudio = useCallback(function () {
    if (startedRef.current) return
    startedRef.current = true

    var ac = new (window.AudioContext || (window as any).webkitAudioContext)()
    audioCtxRef.current = ac

    var master = ac.createGain()
    master.gain.value = 0
    master.connect(ac.destination)
    gainRef.current = master

    // Layer 1: Deep warm drone (low frequency)
    var osc1 = ac.createOscillator()
    osc1.type = 'sine'
    osc1.frequency.value = 65
    var g1 = ac.createGain()
    g1.gain.value = 0.3
    osc1.connect(g1)
    g1.connect(master)
    osc1.start()

    // Layer 2: Mid ethereal tone
    var osc2 = ac.createOscillator()
    osc2.type = 'sine'
    osc2.frequency.value = 174
    var g2 = ac.createGain()
    g2.gain.value = 0.12
    osc2.connect(g2)
    g2.connect(master)
    osc2.start()

    // Layer 3: High shimmer
    var osc3 = ac.createOscillator()
    osc3.type = 'sine'
    osc3.frequency.value = 396
    var g3 = ac.createGain()
    g3.gain.value = 0.05
    osc3.connect(g3)
    g3.connect(master)
    osc3.start()

    // Slow LFO to modulate volume for breathing effect
    var lfo = ac.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.08
    var lfoGain = ac.createGain()
    lfoGain.gain.value = 0.02
    lfo.connect(lfoGain)
    lfoGain.connect(master.gain)
    lfo.start()

    // Slow pitch drift on layer 2
    var lfo2 = ac.createOscillator()
    lfo2.type = 'sine'
    lfo2.frequency.value = 0.05
    var lfo2Gain = ac.createGain()
    lfo2Gain.gain.value = 3
    lfo2.connect(lfo2Gain)
    lfo2Gain.connect(osc2.frequency)
    lfo2.start()

    // Fade in
    master.gain.setValueAtTime(0, ac.currentTime)
    master.gain.linearRampToValueAtTime(TARGET_VOLUME, ac.currentTime + 2)

    setMuted(false)
    setReady(true)
  }, [])

  // Start on first user interaction
  useEffect(function () {
    function onInteraction() {
      initAudio()
      document.removeEventListener('click', onInteraction)
      document.removeEventListener('scroll', onInteraction)
      document.removeEventListener('touchstart', onInteraction)
    }

    document.addEventListener('click', onInteraction, { once: true })
    document.addEventListener('scroll', onInteraction, { once: true, passive: true })
    document.addEventListener('touchstart', onInteraction, { once: true, passive: true })

    return function () {
      document.removeEventListener('click', onInteraction)
      document.removeEventListener('scroll', onInteraction)
      document.removeEventListener('touchstart', onInteraction)
      if (audioCtxRef.current) {
        audioCtxRef.current.close()
      }
    }
  }, [initAudio])

  function toggleMute() {
    var gain = gainRef.current
    var ac = audioCtxRef.current
    if (!gain || !ac) {
      // Not started yet, try to init
      initAudio()
      return
    }

    if (muted) {
      // Unmute: fade in
      if (ac.state === 'suspended') ac.resume()
      gain.gain.cancelScheduledValues(ac.currentTime)
      gain.gain.setValueAtTime(gain.gain.value, ac.currentTime)
      gain.gain.linearRampToValueAtTime(TARGET_VOLUME, ac.currentTime + 1)
      setMuted(false)
    } else {
      // Mute: fade out
      gain.gain.cancelScheduledValues(ac.currentTime)
      gain.gain.setValueAtTime(gain.gain.value, ac.currentTime)
      gain.gain.linearRampToValueAtTime(0, ac.currentTime + 0.8)
      setMuted(true)
    }
  }

  return (
    <button
      onClick={toggleMute}
      className="fixed bottom-6 left-6 z-50 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border"
      style={{
        background: muted
          ? 'rgba(15, 23, 42, 0.7)'
          : 'rgba(249, 115, 22, 0.15)',
        borderColor: muted
          ? 'rgba(255,255,255,0.08)'
          : 'rgba(249, 115, 22, 0.3)',
        backdropFilter: 'blur(12px)',
      }}
      title={muted ? 'Enable ambient sound' : 'Mute ambient sound'}
      aria-label={muted ? 'Enable ambient sound' : 'Mute ambient sound'}
    >
      {muted ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )}
      {!muted && ready && (
        <span
          className="absolute inset-0 rounded-full animate-ping"
          style={{ background: 'rgba(249, 115, 22, 0.15)', animationDuration: '3s' }}
        />
      )}
    </button>
  )
}

export default memo(AmbientAudio)
