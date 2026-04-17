import { motion } from 'framer-motion'
import { Brain, Eye, Zap, Heart, Cloud, Database } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const techIsMobile = typeof window !== 'undefined' && window.innerWidth < 768

// â”€â”€â”€ Per-category animated background components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function NeuralBg() {
  const pts: [number, number][] = [
    [18, 20], [52, 10], [84, 22],
    [8, 50], [38, 48], [68, 42], [92, 58],
    [28, 80], [62, 75],
  ]
  const edges = [[0,1],[1,2],[0,3],[1,4],[2,5],[3,4],[4,5],[5,6],[3,7],[4,7],[5,8],[6,8]]
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      {edges.map(([a, b], i) => (
        <motion.line
          key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]}
          stroke="#3b82f6" strokeWidth="0.5"
          animate={{ opacity: [0.05, 0.5, 0.05] }}
          transition={{ duration: 2.5 + i * 0.22, delay: i * 0.16, repeat: Infinity }}
        />
      ))}
      {pts.map(([x, y], i) => (
        <motion.circle
          key={i} cx={x} cy={y} r="2" fill="#60a5fa"
          animate={{ r: [1.2, 3.2, 1.2], opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: 2 + i * 0.18, delay: i * 0.24, repeat: Infinity }}
        />
      ))}
    </svg>
  )
}

function ScannerBg() {
  const dots: [number, number][] = []
  for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) dots.push([c * 14 + 7, r * 22 + 6])
  return (
    <>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="0.9" fill="rgba(167,139,250,0.28)" />)}
      </svg>
      <motion.div
        className="absolute inset-x-0 h-[2px] bg-purple-400/80"
        style={{ boxShadow: '0 0 12px 4px rgba(167,139,250,0.55)' }}
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute inset-x-0"
        style={{ height: 44, background: 'linear-gradient(to bottom, rgba(167,139,250,0.09), transparent)' }}
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
      />
    </>
  )
}

function FlowBg() {
  const nodes: [number, number][] = [[15, 50], [38, 28], [38, 72], [62, 50], [84, 50]]
  const edges: [number, number, number, number][] = [
    [15, 50, 38, 28], [15, 50, 38, 72],
    [38, 28, 62, 50], [38, 72, 62, 50],
    [62, 50, 84, 50],
  ]
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      {edges.map(([x1, y1, x2, y2], i) => (
        <motion.line
          key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="rgba(251,146,60,0.5)" strokeWidth="1" strokeDasharray="4 3"
          animate={{ strokeDashoffset: [7, 0] }}
          transition={{ duration: 0.85, delay: i * 0.2, repeat: Infinity, ease: 'linear' }}
        />
      ))}
      {nodes.map(([cx, cy], i) => (
        <motion.circle
          key={i} cx={cx} cy={cy} r="5.5" fill="none"
          stroke="rgba(251,146,60,0.55)" strokeWidth="1.3"
          animate={{ r: [4.5, 7.5, 4.5], opacity: [0.35, 0.85, 0.35] }}
          transition={{ duration: 2.2, delay: i * 0.35, repeat: Infinity }}
        />
      ))}
    </svg>
  )
}

function EcgBg() {
  const d = 'M0,50 L8,50 L12,34 L16,66 L20,50 L28,50 L32,18 L36,82 L40,50 L48,50 L52,34 L56,66 L60,50 L68,50 L72,18 L76,82 L80,50 L100,50'
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      <motion.path
        d={d} fill="none" stroke="rgba(248,113,113,0.75)" strokeWidth="1.6"
        strokeDasharray="320"
        animate={{ strokeDashoffset: [320, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'linear', repeatDelay: 0.4 }}
      />
    </svg>
  )
}

function OrbitBg() {
  const rings = [
    { size: 52, dur: 8, dir: 1 },
    { size: 76, dur: 14, dir: -1 },
    { size: 102, dur: 20, dir: 1 },
  ]
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {rings.map((r, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-cyan-400/20"
          style={{ width: r.size, height: r.size }}
          animate={{ rotate: r.dir * 360 }}
          transition={{ duration: r.dur, repeat: Infinity, ease: 'linear' }}
        >
          <div
            className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-cyan-400/65"
            style={{ boxShadow: '0 0 8px 3px rgba(34,211,238,0.45)' }}
          />
        </motion.div>
      ))}
      <motion.div
        className="absolute w-5 h-5 rounded-full bg-cyan-400/25 border border-cyan-400/50"
        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />
    </div>
  )
}

function StreamBg() {
  const cols = [6, 17, 28, 39, 50, 61, 72, 83, 94]
  return (
    <>
      {cols.map((left, i) => (
        <motion.div
          key={i}
          className="absolute top-0 w-[1px]"
          style={{
            left: `${left}%`, height: '40%',
            background: 'linear-gradient(to bottom, transparent, rgba(52,211,153,0.65), transparent)',
          }}
          animate={{ y: ['-40%', '140%'] }}
          transition={{ duration: 1.7 + i * 0.26, delay: i * 0.2, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </>
  )
}

// â”€â”€â”€ Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface Tool { name: string; color: string; bg: string }
interface Category {
  id: string; title: string; desc: string
  icon: LucideIcon; gradient: string; border: string; glow: string
  iconGradient: string; Bg: React.FC; tools: Tool[]
}

const categories: Category[] = [
  {
    id: 'ai-ml', title: 'AI & ML',
    desc: 'Custom ML models, LLMs, AI agents, RAG systems, prompt engineering',
    icon: Brain, glow: 'rgba(59,130,246,0.08)',
    gradient: 'from-blue-950/60 to-indigo-950/40', border: 'border-blue-500/15',
    iconGradient: 'from-blue-500 to-indigo-600', Bg: NeuralBg,
    tools: [
      { name: 'OpenAI / GPT-4', color: '#d1d5db', bg: 'rgba(255,255,255,0.06)' },
      { name: 'Python',         color: '#60a5fa', bg: 'rgba(59,130,246,0.09)' },
      { name: 'LangChain',      color: '#34d399', bg: 'rgba(52,211,153,0.08)' },
      { name: 'HuggingFace',    color: '#fbbf24', bg: 'rgba(251,191,36,0.08)' },
      { name: 'TensorFlow',     color: '#fb923c', bg: 'rgba(249,115,22,0.08)' },
      { name: 'RAG Systems',    color: '#a78bfa', bg: 'rgba(139,92,246,0.08)' },
      { name: 'Llama / Mistral',color: '#f472b6', bg: 'rgba(236,72,153,0.08)' },
      { name: 'FastAPI',        color: '#2dd4bf', bg: 'rgba(45,212,191,0.08)' },
      { name: 'FAISS / Pinecone', color: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
    ],
  },
  {
    id: 'cv', title: 'Computer Vision',
    desc: 'Medical imaging, OCR, object & facial recognition systems',
    icon: Eye, glow: 'rgba(139,92,246,0.08)',
    gradient: 'from-purple-950/60 to-violet-950/40', border: 'border-purple-500/15',
    iconGradient: 'from-purple-500 to-violet-600', Bg: ScannerBg,
    tools: [
      { name: 'OpenCV',       color: '#60a5fa', bg: 'rgba(59,130,246,0.09)' },
      { name: 'PyTorch',      color: '#f87171', bg: 'rgba(239,68,68,0.08)' },
      { name: 'YOLOv8',       color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
      { name: 'Tesseract OCR',color: '#818cf8', bg: 'rgba(129,140,248,0.08)' },
      { name: 'MediaPipe',    color: '#4ade80', bg: 'rgba(74,222,128,0.08)' },
      { name: 'EasyOCR',      color: '#c084fc', bg: 'rgba(192,132,252,0.08)' },
      { name: 'FaceNet',      color: '#f472b6', bg: 'rgba(244,114,182,0.08)' },
      { name: 'scikit-image', color: '#38bdf8', bg: 'rgba(56,189,248,0.08)' },
    ],
  },
  {
    id: 'automation', title: 'Automation & Integration',
    desc: 'n8n workflows, APIs, webhooks, real-time event-driven systems',
    icon: Zap, glow: 'rgba(249,115,22,0.08)',
    gradient: 'from-orange-950/60 to-amber-950/40', border: 'border-orange-500/15',
    iconGradient: 'from-orange-500 to-amber-500', Bg: FlowBg,
    tools: [
      { name: 'n8n',              color: '#fb923c', bg: 'rgba(249,115,22,0.10)' },
      { name: 'Make (Integromat)',color: '#a78bfa', bg: 'rgba(139,92,246,0.08)' },
      { name: 'REST APIs',        color: '#34d399', bg: 'rgba(52,211,153,0.08)' },
      { name: 'Webhooks',         color: '#60a5fa', bg: 'rgba(59,130,246,0.08)' },
      { name: 'Zapier',           color: '#fb923c', bg: 'rgba(249,115,22,0.08)' },
      { name: 'Playwright',       color: '#4ade80', bg: 'rgba(74,222,128,0.08)' },
      { name: 'Selenium',         color: '#fbbf24', bg: 'rgba(251,191,36,0.08)' },
      { name: 'Apache Kafka',     color: '#f87171', bg: 'rgba(239,68,68,0.08)' },
    ],
  },
  {
    id: 'healthcare', title: 'Healthcare AI',
    desc: 'Medical billing automation, clinical workflows, secure compliant systems',
    icon: Heart, glow: 'rgba(239,68,68,0.08)',
    gradient: 'from-red-950/60 to-rose-950/40', border: 'border-red-500/15',
    iconGradient: 'from-red-500 to-rose-600', Bg: EcgBg,
    tools: [
      { name: 'HL7 / FHIR',      color: '#f87171', bg: 'rgba(239,68,68,0.08)' },
      { name: 'HIPAA Compliant',  color: '#60a5fa', bg: 'rgba(59,130,246,0.08)' },
      { name: 'Epic API',         color: '#818cf8', bg: 'rgba(129,140,248,0.08)' },
      { name: 'ICD-10 / CPT',    color: '#4ade80', bg: 'rgba(74,222,128,0.08)' },
      { name: 'EDI 837P',         color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
      { name: 'RCM Automation',   color: '#fb923c', bg: 'rgba(249,115,22,0.08)' },
      { name: 'EHR / EMR',        color: '#34d399', bg: 'rgba(52,211,153,0.08)' },
      { name: 'ClinicalNLP',      color: '#c084fc', bg: 'rgba(192,132,252,0.08)' },
    ],
  },
  {
    id: 'devops', title: 'DevOps & Cloud',
    desc: 'Azure, Docker, Terraform, Kubernetes, CI/CD pipelines',
    icon: Cloud, glow: 'rgba(34,211,238,0.07)',
    gradient: 'from-cyan-950/60 to-teal-950/40', border: 'border-cyan-500/15',
    iconGradient: 'from-cyan-500 to-teal-600', Bg: OrbitBg,
    tools: [
      { name: 'Microsoft Azure', color: '#38bdf8', bg: 'rgba(56,189,248,0.08)' },
      { name: 'Docker',          color: '#38bdf8', bg: 'rgba(36,150,237,0.10)' },
      { name: 'Terraform',       color: '#c084fc', bg: 'rgba(123,66,188,0.10)' },
      { name: 'Kubernetes',      color: '#60a5fa', bg: 'rgba(50,108,229,0.10)' },
      { name: 'GitHub Actions',  color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
      { name: 'CI/CD Pipelines', color: '#4ade80', bg: 'rgba(74,222,128,0.08)' },
      { name: 'AWS',             color: '#fb923c', bg: 'rgba(255,153,0,0.10)' },
      { name: 'Linux / Bash',    color: '#fbbf24', bg: 'rgba(251,191,36,0.08)' },
    ],
  },
  {
    id: 'data', title: 'Data Pipelines & Scraping',
    desc: 'Structured extraction, ETL processing, real-time data streams',
    icon: Database, glow: 'rgba(52,211,153,0.07)',
    gradient: 'from-emerald-950/60 to-green-950/40', border: 'border-emerald-500/15',
    iconGradient: 'from-emerald-500 to-green-600', Bg: StreamBg,
    tools: [
      { name: 'Apache Airflow', color: '#34d399', bg: 'rgba(52,211,153,0.08)' },
      { name: 'Pandas / NumPy', color: '#818cf8', bg: 'rgba(129,140,248,0.08)' },
      { name: 'Scrapy',         color: '#4ade80', bg: 'rgba(74,222,128,0.08)' },
      { name: 'BeautifulSoup',  color: '#34d399', bg: 'rgba(52,211,153,0.07)' },
      { name: 'PostgreSQL',     color: '#60a5fa', bg: 'rgba(51,103,145,0.10)' },
      { name: 'MongoDB',        color: '#4ade80', bg: 'rgba(71,162,72,0.10)' },
      { name: 'Redis',          color: '#f87171', bg: 'rgba(220,38,38,0.10)' },
      { name: 'Apache Spark',   color: '#fb923c', bg: 'rgba(249,115,22,0.08)' },
    ],
  },
]

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function Technologies() {
  return (
    <section className="py-20 md:py-32 bg-slate-950/90">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24, ...(techIsMobile ? {} : { filter: 'blur(6px)' }) }}
          whileInView={{ opacity: 1, y: 0, ...(techIsMobile ? {} : { filter: 'blur(0px)' }) }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
        >
          <span className="flex items-center gap-3 text-orange-400 text-xs sm:text-[11px] tracking-[0.28em] uppercase font-semibold mb-4">
            <div className="w-8 h-px bg-orange-500" />
            Tech Stack
          </span>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2
              className="font-black leading-[0.92] tracking-tight text-white"
              style={{ fontSize: 'clamp(2.2rem,6vw,5rem)' }}
            >
              Technologies We{' '}
              <span className="gradient-text">Master</span>
            </h2>
            <p className="text-slate-400 max-w-xs text-base leading-relaxed">
              Cutting-edge tools powering every project we build.
            </p>
          </div>
        </motion.div>

        {/* Card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat, i) => {
            const Icon = cat.icon
            const BgComp = cat.Bg
            const doubled = [...cat.tools, ...cat.tools]

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 32, ...(techIsMobile ? {} : { filter: 'blur(4px)' }) }}
                whileInView={{ opacity: 1, y: 0, ...(techIsMobile ? {} : { filter: 'blur(0px)' }) }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.55, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -8, scale: 1.02, boxShadow: `0 20px 40px rgba(0,0,0,0.3), 0 0 40px ${cat.glow}`, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                className={`relative overflow-hidden rounded-2xl border ${cat.border} bg-gradient-to-br ${cat.gradient} md:backdrop-blur-md group cursor-default`}
                style={{ boxShadow: `0 0 40px 0 ${cat.glow}` }}
              >
                {/* â”€â”€ Animated illustration â”€â”€ */}
                <div className="relative h-40 overflow-hidden">
                  <BgComp />
                  {/* Bottom gradient fade */}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/85 to-transparent pointer-events-none" />
                </div>

                {/* â”€â”€ Content â”€â”€ */}
                <div className="px-5 pb-5 -mt-3 relative z-10">

                  {/* Icon + title */}
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.iconGradient} flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform duration-200`}
                    >
                      <Icon size={19} className="text-white" />
                    </div>
                    <h3 className="font-bold text-white text-[15px] leading-tight">{cat.title}</h3>
                  </div>

                  <p className="text-slate-400 text-[13px] leading-relaxed mb-4">{cat.desc}</p>

                  {/* â”€â”€ Scrolling tool badges â”€â”€ */}
                  <div className="overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)' }}>
                    <div className="ticker flex gap-2 py-0.5">
                      {doubled.map((t, j) => (
                        <span
                          key={j}
                          className="flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs sm:text-[11px] font-semibold whitespace-nowrap border border-white/8"
                          style={{ color: t.color, background: t.bg }}
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
