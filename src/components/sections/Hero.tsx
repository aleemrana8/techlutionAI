import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useScroll, useSpring } from 'framer-motion'
import { ArrowRight, Bot, Sparkles, Cloud, Cpu, Zap, Shield, BarChart3, Brain, Workflow, Globe, Database, Code2, Cog, Network, Layers, Terminal, GitBranch, Radar, MessageCircle, Rocket } from 'lucide-react'

const heroIsMobile = typeof window !== 'undefined' && window.innerWidth < 768

/* ── Data ─────────────────────────────────────────────────────── */

const CYCLING_WORDS = ['Businesses', 'Enterprises', 'Industries', 'Companies', 'Operations']

const features = [
  { icon: Cpu,      title: 'AI Agents & Automation',    desc: 'Smart bots that automate tasks, cut costs, and work 24/7' },
  { icon: Sparkles, title: 'Custom AI & ML Solutions',   desc: 'Predictive analytics, NLP, computer vision & more' },
  { icon: Cloud,    title: 'Cloud & DevOps',             desc: 'AWS, Azure, GCP with CI/CD and auto-scaling' },
  { icon: Globe,    title: 'Web & Mobile Apps',          desc: 'React, Next.js, Flutter — fast, responsive, beautiful' },
  { icon: Shield,   title: 'Healthcare IT & RCM',        desc: 'EHR, billing automation, medical coding AI systems' },
  { icon: Zap,      title: 'Cybersecurity & Consulting', desc: 'Penetration testing, audits, and digital strategy' },
]

/* ── Animations ───────────────────────────────────────────────── */

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
})

/* ── Animated sphere component ────────────────────────────────── */

function AISphere() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-200, 200], [8, -8])
  const rotateY = useTransform(mouseX, [-200, 200], [-8, 8])

  /* Large floating logo badges around the sphere */
  const floatingLogos = [
    { Icon: Brain,     label: 'AI',       pos: '-top-4 right-4',       color: 'text-violet-400',  glow: 'shadow-violet-500/40',  border: 'border-violet-500/30', bg: 'bg-violet-500/10' },
    { Icon: Zap,       label: 'Auto',     pos: 'top-1/4 -right-10',   color: 'text-amber-400',   glow: 'shadow-amber-500/40',   border: 'border-amber-500/30',  bg: 'bg-amber-500/10' },
    { Icon: Cloud,     label: 'Cloud',    pos: '-top-6 left-1/4',     color: 'text-cyan-400',    glow: 'shadow-cyan-500/40',    border: 'border-cyan-500/30',   bg: 'bg-cyan-500/10' },
    { Icon: Shield,    label: 'Secure',   pos: 'bottom-4 -left-4',    color: 'text-emerald-400', glow: 'shadow-emerald-500/40', border: 'border-emerald-500/30',bg: 'bg-emerald-500/10' },
    { Icon: Database,  label: 'Data',     pos: '-bottom-6 left-1/3',  color: 'text-pink-400',    glow: 'shadow-pink-500/40',    border: 'border-pink-500/30',   bg: 'bg-pink-500/10' },
    { Icon: Globe,     label: 'Web',      pos: 'top-0 -left-6',       color: 'text-teal-400',    glow: 'shadow-teal-500/40',    border: 'border-teal-500/30',   bg: 'bg-teal-500/10' },
    { Icon: Code2,     label: 'Dev',      pos: 'bottom-1/4 -left-8',  color: 'text-indigo-400',  glow: 'shadow-indigo-500/40',  border: 'border-indigo-500/30', bg: 'bg-indigo-500/10' },
    { Icon: BarChart3, label: 'BI',       pos: 'top-1/4 -left-10',    color: 'text-blue-400',    glow: 'shadow-blue-500/40',    border: 'border-blue-500/30',   bg: 'bg-blue-500/10' },
    { Icon: Cog,       label: 'DevOps',   pos: 'top-1/2 -right-8',    color: 'text-orange-400',  glow: 'shadow-orange-500/40',  border: 'border-orange-500/30', bg: 'bg-orange-500/10' },
    { Icon: Network,   label: 'API',      pos: '-top-4 right-1/4',    color: 'text-sky-400',     glow: 'shadow-sky-500/40',     border: 'border-sky-500/30',    bg: 'bg-sky-500/10' },
    { Icon: Workflow,  label: 'ML',       pos: 'bottom-8 -right-6',   color: 'text-cyan-300',    glow: 'shadow-cyan-400/40',    border: 'border-cyan-400/30',   bg: 'bg-cyan-400/10' },
    { Icon: Cpu,       label: 'GPU',      pos: '-bottom-2 right-1/4', color: 'text-rose-400',    glow: 'shadow-rose-500/40',    border: 'border-rose-500/30',   bg: 'bg-rose-500/10' },
  ]

  /* Orbiting micro-icons on the rings */
  const orbitIcons = [
    { Icon: Layers,    radius: 155, speed: 22, delay: 0,   color: 'text-cyan-300',    glow: 'shadow-cyan-500/30' },
    { Icon: Terminal,  radius: 155, speed: 22, delay: 5.5, color: 'text-violet-300',  glow: 'shadow-violet-500/30' },
    { Icon: GitBranch, radius: 155, speed: 22, delay: 11,  color: 'text-emerald-300', glow: 'shadow-emerald-500/30' },
    { Icon: Radar,     radius: 155, speed: 22, delay: 16.5,color: 'text-amber-300',   glow: 'shadow-amber-500/30' },
    { Icon: Bot,       radius: 125, speed: 28, delay: 3,   color: 'text-blue-300',    glow: 'shadow-blue-500/30' },
    { Icon: Sparkles,  radius: 125, speed: 28, delay: 14,  color: 'text-pink-300',    glow: 'shadow-pink-500/30' },
  ]

  return (
    <motion.div
      className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-[440px] md:h-[440px]"
      style={{ rotateX, rotateY, perspective: 800 }}
      onMouseMove={(e) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect()
        mouseX.set(e.clientX - rect.left - rect.width / 2)
        mouseY.set(e.clientY - rect.top - rect.height / 2)
      }}
    >
      {/* Outermost glow ring */}
      <motion.div
        className="absolute -inset-10 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Outermost dashed ring */}
      <motion.div
        className="absolute -inset-8 rounded-full border border-dashed border-white/[0.05]"
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
      />

      {/* Outer ring with gradient */}
      <motion.div
        className="absolute -inset-2 rounded-full"
        style={{ background: 'conic-gradient(from 0deg, rgba(6,182,212,0.15), rgba(139,92,246,0.15), rgba(6,182,212,0.15))' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute inset-[1px] rounded-full bg-[#020817]" />
      </motion.div>

      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full border border-cyan-500/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />

      {/* Mid ring */}
      <motion.div
        className="absolute inset-8 rounded-full border border-violet-500/15"
        animate={{ rotate: -360 }}
        transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
      />

      {/* Inner ring */}
      <motion.div
        className="absolute inset-14 rounded-full border border-cyan-400/12"
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      />

      {/* Core glow layers */}
      <div className="absolute inset-[18%] rounded-full bg-gradient-to-br from-cyan-500/15 via-violet-500/10 to-blue-500/10 md:backdrop-blur-sm" />
      <div className="absolute inset-[22%] rounded-full bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-500/10" />

      {/* Center orb with intense pulse */}
      <motion.div
        className="absolute inset-[26%] rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500"
        animate={{
          scale: [1, 1.08, 1],
          boxShadow: [
            '0 0 40px rgba(6,182,212,0.3), 0 0 80px rgba(6,182,212,0.15)',
            '0 0 60px rgba(6,182,212,0.5), 0 0 120px rgba(139,92,246,0.2)',
            '0 0 40px rgba(6,182,212,0.3), 0 0 80px rgba(6,182,212,0.15)',
          ],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Inner white glow ring */}
      <motion.div
        className="absolute inset-[28%] rounded-full border-2 border-white/20"
        animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0.15, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* Center "AI" label */}
      <motion.div
        className="absolute inset-[30%] rounded-full flex items-center justify-center z-10"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="text-white font-black text-2xl md:text-3xl tracking-wider drop-shadow-lg select-none">AI</span>
      </motion.div>

      {/* Orbiting particles with trails */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <motion.div
          key={`dot-${i}`}
          className={`absolute rounded-full ${i % 3 === 0 ? 'w-2.5 h-2.5 bg-cyan-400/80' : i % 3 === 1 ? 'w-2 h-2 bg-violet-400/70' : 'w-1.5 h-1.5 bg-amber-400/60'}`}
          style={{ top: '50%', left: '50%', boxShadow: i % 3 === 0 ? '0 0 8px rgba(6,182,212,0.6)' : i % 3 === 1 ? '0 0 8px rgba(139,92,246,0.5)' : '0 0 6px rgba(245,158,11,0.4)' }}
          animate={{
            x: [
              Math.cos((i * Math.PI) / 4) * (110 + i * 10),
              Math.cos((i * Math.PI) / 4 + Math.PI) * (110 + i * 10),
              Math.cos((i * Math.PI) / 4) * (110 + i * 10),
            ],
            y: [
              Math.sin((i * Math.PI) / 4) * (110 + i * 10),
              Math.sin((i * Math.PI) / 4 + Math.PI) * (110 + i * 10),
              Math.sin((i * Math.PI) / 4) * (110 + i * 10),
            ],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{ duration: 5 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
        />
      ))}

      {/* Orbiting icon badges — larger with glow */}
      {orbitIcons.map(({ Icon, radius, speed, delay, color, glow }, i) => (
        <motion.div
          key={`orbit-${i}`}
          className={`absolute w-8 h-8 rounded-lg bg-slate-900/90 border border-white/10 md:backdrop-blur-md flex items-center justify-center shadow-lg ${glow}`}
          style={{ top: '50%', left: '50%', marginTop: -16, marginLeft: -16 }}
          animate={{
            x: [
              Math.cos((delay * Math.PI) / 10) * radius,
              Math.cos((delay * Math.PI) / 10 + (2 * Math.PI) / 3) * radius,
              Math.cos((delay * Math.PI) / 10 + (4 * Math.PI) / 3) * radius,
              Math.cos((delay * Math.PI) / 10) * radius,
            ],
            y: [
              Math.sin((delay * Math.PI) / 10) * radius,
              Math.sin((delay * Math.PI) / 10 + (2 * Math.PI) / 3) * radius,
              Math.sin((delay * Math.PI) / 10 + (4 * Math.PI) / 3) * radius,
              Math.sin((delay * Math.PI) / 10) * radius,
            ],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
        >
          <Icon size={14} className={color} />
        </motion.div>
      ))}

      {/* Prominent floating logo badges — large with labels + glow */}
      {floatingLogos.map(({ Icon, label, pos, color, glow, border, bg }, i) => (
        <motion.div
          key={`logo-${i}`}
          className={`absolute ${pos} z-10`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
          transition={{
            opacity: { delay: 0.3 + i * 0.12, duration: 0.5 },
            scale: { delay: 0.3 + i * 0.12, duration: 0.5, type: 'spring', stiffness: 200 },
            y: { duration: 3 + (i % 4) * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 },
          }}
        >
          <motion.div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl ${bg} border ${border} md:backdrop-blur-md shadow-lg ${glow}`}
            whileHover={{ scale: 1.15, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
              <Icon size={16} className={color} />
            </div>
            <span className={`text-[11px] font-bold ${color} tracking-wide uppercase`}>{label}</span>
          </motion.div>
        </motion.div>
      ))}

      {/* Connecting data-flow lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
        {[
          { x2: 12, y2: 18, color: 'rgba(6,182,212,0.15)', delay: 0 },
          { x2: 88, y2: 22, color: 'rgba(139,92,246,0.15)', delay: 0.5 },
          { x2: 15, y2: 82, color: 'rgba(16,185,129,0.15)', delay: 1 },
          { x2: 85, y2: 78, color: 'rgba(249,115,22,0.15)', delay: 1.5 },
          { x2: 8,  y2: 50, color: 'rgba(99,102,241,0.12)',  delay: 2 },
          { x2: 92, y2: 50, color: 'rgba(236,72,153,0.12)',  delay: 2.5 },
        ].map((line, i) => (
          <motion.line
            key={`line-${i}`}
            x1="50" y1="50" x2={line.x2} y2={line.y2}
            stroke={line.color} strokeWidth="0.4"
            animate={{ opacity: [0.05, 0.4, 0.05], strokeWidth: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, delay: line.delay }}
          />
        ))}
      </svg>
    </motion.div>
  )
}

/* ── Live Stats Dashboard ─────────────────────────────────────── */

const statsData = [
  { label: 'Projects Delivered', value: 100, suffix: '+', color: 'from-cyan-400 to-blue-500' },
  { label: 'Success Rate', value: 100, suffix: '%', color: 'from-emerald-400 to-teal-500' },
  { label: 'Services Offered', value: 50, suffix: '+', color: 'from-violet-400 to-purple-500' },
  { label: 'Years in Industry', value: 5, suffix: '+', color: 'from-orange-400 to-amber-500' },
]

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const duration = 2000
    const step = Math.ceil(target / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target])

  return <span>{count}{suffix}</span>
}

function StatsDashboard() {
  return (
    <motion.div
      {...fadeUp(0.6)}
      className="hidden lg:flex flex-col gap-5 w-full max-w-sm"
    >
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {statsData.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + i * 0.12, duration: 0.5 }}
            whileHover={{ y: -4, transition: { duration: 0.25 } }}
            className="relative group p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] md:backdrop-blur-sm overflow-hidden"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.06), transparent 70%)' }}
            />
            <div className={`text-2xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
            </div>
            <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-[0.15em]">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Client trust badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="flex items-center gap-3 px-1"
      >
        <div className="flex -space-x-2">
          {['bg-cyan-500','bg-violet-500','bg-amber-500','bg-emerald-500'].map((bg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5 + i * 0.1, duration: 0.3 }}
              className={`w-7 h-7 rounded-full ${bg} border-2 border-slate-950 flex items-center justify-center text-[9px] font-bold text-white`}
            >
              {['R','A','S','M'][i]}
            </motion.div>
          ))}
        </div>
        <div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-3 h-3 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            ))}
            <span className="text-[10px] text-slate-400 ml-1">5.0</span>
          </div>
          <span className="text-[10px] text-slate-500">Innovate · Automate · Elevate — Techlution AI</span>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   HERO COMPONENT
   ══════════════════════════════════════════════════════════════════ */

export default function Hero({ onStartProject, onContactUs }: { onStartProject?: () => void; onContactUs?: () => void }) {
  const [wordIdx, setWordIdx] = useState(0)
  const heroRef = useRef<HTMLElement>(null)

  /* ── Scroll-linked parallax ── */
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const textY = useSpring(useTransform(scrollYProgress, [0, 1], [0, isMobile ? 0 : -80]), { stiffness: 100, damping: 30 })
  const sphereY = useSpring(useTransform(scrollYProgress, [0, 1], [0, isMobile ? 0 : -40]), { stiffness: 100, damping: 30 })
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15])
  const bgOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  useEffect(() => {
    const id = setInterval(() => setWordIdx((i) => (i + 1) % CYCLING_WORDS.length), 2600)
    return () => clearInterval(id)
  }, [])

  return (
    <section ref={heroRef} className="relative min-h-screen flex flex-col bg-transparent overflow-hidden">

      {/* ── Background layers ─────────────────────────────────── */}

      {/* Grid */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          scale: bgScale,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Soft glow — top-right cyan */}
      <motion.div
        className="absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 65%)' }}
        animate={{ scale: [1, 1.15, 1], x: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Soft glow — bottom-left violet */}
      <motion.div
        className="absolute -bottom-32 -left-32 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 65%)' }}
        animate={{ scale: [1, 1.2, 1], y: [0, -25, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />

      {/* Soft glow — mid orange */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 60%)' }}
      />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />

      {/* ── Main content ──────────────────────────────────────── */}

      <motion.div style={{ opacity: bgOpacity }} className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-4 md:px-8 pt-28 pb-20">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── LEFT COLUMN ── */}
          <motion.div style={{ y: textY }}>

            {/* Tag */}
            <motion.div
              {...fadeUp(0.1)}
              className="flex items-center gap-3 mb-8"
            >
              <div className="w-10 h-px bg-gradient-to-r from-cyan-500 to-violet-500" />
              <span className="text-cyan-400 text-xs sm:text-[11px] tracking-[0.28em] uppercase font-semibold">
                Innovate · Automate · Elevate
              </span>
            </motion.div>

            {/* ── Headline ── */}
            <div className="mb-6">
              <motion.h1
                {...fadeUp(0.25)}
                className="font-black leading-[0.95] tracking-tight text-white"
                style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.5rem)' }}
              >
                We Provide{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500 bg-clip-text text-transparent">
                  AI-Powered IT Solutions
                </span>{' '}
                <span className="inline-flex flex-wrap items-baseline gap-x-[0.3em]">
                  <span>That Elevate</span>{' '}

                  {/* Cycling word */}
                  <span className="inline-block relative overflow-hidden align-bottom" style={{ height: '1.05em', verticalAlign: 'baseline' }}>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={wordIdx}
                        initial={{ y: '110%', opacity: 0 }}
                        animate={{ y: '0%', opacity: 1 }}
                        exit={{ y: '-110%', opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="block bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent"
                      >
                        {CYCLING_WORDS[wordIdx]}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                </span>
              </motion.h1>
            </div>

            {/* ── Subheading ── */}
            <motion.p
              {...fadeUp(0.45)}
              className="text-slate-400 text-base md:text-lg leading-relaxed max-w-lg mb-8"
            >
              Smart solutions, minimum cost, maximum impact — we build intelligent software,
              automation systems, web & mobile apps, and cloud infrastructure that make work faster and life easier.
            </motion.p>

            {/* ── CTA Buttons ── */}
            <motion.div {...fadeUp(0.6)} className="flex flex-wrap gap-3 mb-10">
              {/* Primary: Explore Services */}
              <motion.a
                href="#services"
                whileHover={{ scale: 1.06, y: -3, boxShadow: '0 0 30px rgba(6,182,212,0.4), 0 0 60px rgba(139,92,246,0.2)' }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold px-6 sm:px-7 py-4 sm:py-3.5 rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow text-sm relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                Get Started <ArrowRight size={16} />
              </motion.a>
              {/* Secondary: View Projects */}
              <motion.a
                href="#projects"
                whileHover={{ scale: 1.06, y: -3, borderColor: 'rgba(255,255,255,0.5)' }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="inline-flex items-center gap-2 border border-white/20 text-white font-semibold px-6 sm:px-7 py-4 sm:py-3.5 rounded-xl hover:bg-white/5 hover:border-white/35 transition-all text-sm"
              >
                View Projects
              </motion.a>
            </motion.div>
          </motion.div>

          {/* ── RIGHT COLUMN — visuals ── */}
          <motion.div
            {...fadeUp(0.5)}
            style={{ y: sphereY }}
            className="flex flex-col items-center lg:items-end gap-8"
          >
            {/* AI Sphere */}
            <AISphere />

            {/* Stats Dashboard */}
            <StatsDashboard />
          </motion.div>
        </div>

        {/* ── Feature highlights ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-20 pt-10 border-t border-white/5"
        >
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 18, ...(heroIsMobile ? {} : { filter: 'blur(4px)' }) }}
                animate={{ opacity: 1, y: 0, ...(heroIsMobile ? {} : { filter: 'blur(0px)' }) }}
                transition={{ delay: 1.1 + i * 0.12, duration: 0.55 }}
                whileHover={{ y: -6, scale: 1.02, boxShadow: '0 12px 30px rgba(0,0,0,0.3)', transition: { duration: 0.25, type: 'spring', stiffness: 300 } }}
                className="group flex items-start gap-4 p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all cursor-default"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/15 to-violet-500/15 border border-white/8 flex items-center justify-center flex-shrink-0 group-hover:from-cyan-500/25 group-hover:to-violet-500/25 transition-all">
                  <Icon size={18} className="text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm mb-1">{f.title}</h4>
                  <p className="text-slate-500 text-xs sm:text-[13px] leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </motion.div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        className="absolute bottom-8 left-8 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.2 }}
          style={{ originY: 0 }}
          className="w-px h-14 bg-gradient-to-b from-cyan-500/70 to-transparent"
        />
        <span className="text-[10px] text-slate-600 uppercase tracking-[0.3em]">Scroll</span>
      </motion.div>
    </section>
  )
}
