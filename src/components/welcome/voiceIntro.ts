const VOICE_TEXT =
  'Welcome to Techlution AI. We make your work faster, smarter, and more profitable with AI-powered solutions.'

/** Speaks the welcome message once using the Web Speech API.
 *  Returns a cleanup function to cancel if the component unmounts. */
export function playVoiceIntro(): () => void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return () => {}

  const synth = window.speechSynthesis
  const utter = new SpeechSynthesisUtterance(VOICE_TEXT)
  utter.volume = 0.3
  utter.rate = 1.0
  utter.pitch = 1.4 // higher pitch for a cute feminine tone

  // Pick a female English voice — prefer soft/natural-sounding ones
  const FEMALE_HINTS = ['female', 'woman', 'girl', 'zira', 'samantha', 'karen', 'moira', 'fiona', 'tessa', 'veena', 'victoria', 'susan', 'hazel', 'libby', 'jenny', 'aria', 'sonia', 'natasha']
  const pickVoice = () => {
    const voices = synth.getVoices()
    const enVoices = voices.filter((v) => v.lang.startsWith('en'))

    // 1. Try a known female voice by name
    const female = enVoices.find((v) => {
      const n = v.name.toLowerCase()
      return FEMALE_HINTS.some((h) => n.includes(h))
    })

    // 2. Try Google UK English Female or similar
    const googleFemale = enVoices.find((v) =>
      v.name.toLowerCase().includes('google') && v.name.toLowerCase().includes('female')
    )

    utter.voice = female || googleFemale || enVoices[0] || null
    synth.speak(utter)
  }

  if (synth.getVoices().length) {
    pickVoice()
  } else {
    synth.addEventListener('voiceschanged', pickVoice, { once: true })
  }

  return () => {
    synth.cancel()
  }
}
