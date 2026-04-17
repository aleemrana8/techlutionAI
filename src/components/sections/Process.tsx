import { motion } from 'framer-motion'
import {
  FileText,
  Lightbulb,
  Zap,
  Code,
  Stethoscope,
  CheckCircle,
  Rocket,
  LifeBuoy,
} from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Requirement Analysis',
    description:
      'Deep dive into your business needs and objectives. We listen, map workflows, and define the exact scope before a single line of code is written.',
    icon: FileText,
    color: 'from-blue-500 to-blue-600',
  },
  {
    number: '02',
    title: 'Solution Design',
    description:
      'Create comprehensive technical architecture, data-flow diagrams, wireframes, and UI/UX designs — aligning every stakeholder before development begins.',
    icon: Lightbulb,
    color: 'from-purple-500 to-purple-600',
  },
  {
    number: '03',
    title: 'AI & Automation Dev',
    description:
      'Build intelligent workflows, fine-tune language models, craft RAG pipelines, and wire automation nodes that replace manual effort at scale.',
    icon: Zap,
    color: 'from-orange-500 to-amber-500',
  },
  {
    number: '04',
    title: 'Core Development',
    description:
      'Develop robust, scalable applications with clean, maintainable code following SOLID principles and modern framework best practices.',
    icon: Code,
    color: 'from-cyan-500 to-teal-500',
  },
  {
    number: '05',
    title: 'Healthcare Integration',
    description:
      'Integrate with HL7, FHIR, EHR APIs, and healthcare compliance frameworks — every touchpoint meets HIPAA standards.',
    icon: Stethoscope,
    color: 'from-red-500 to-rose-500',
  },
  {
    number: '06',
    title: 'Testing & QA',
    description:
      'Comprehensive automated testing, security audits, performance benchmarking, and quality assurance cycles before any release.',
    icon: CheckCircle,
    color: 'from-emerald-500 to-green-500',
  },
  {
    number: '07',
    title: 'Deployment',
    description:
      'Seamless deployment to production using CI/CD pipelines, containerisation, and blue-green strategies for zero-downtime rollouts.',
    icon: Rocket,
    color: 'from-indigo-500 to-blue-500',
  },
  {
    number: '08',
    title: 'Support & Scaling',
    description:
      'Ongoing maintenance, 24/7 monitoring, infrastructure scaling, and iterative feature delivery as your business grows.',
    icon: LifeBuoy,
    color: 'from-pink-500 to-rose-500',
  },
]

export default function Process() {
  return (
    <section id="process" className="py-20 md:py-32 bg-slate-950/90">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="mb-16"
        >
          <span className="flex items-center gap-3 text-orange-400 text-[11px] tracking-[0.28em] uppercase font-semibold mb-4">
            <div className="w-8 h-px bg-orange-500" />
            Our Methodology
          </span>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2
              className="font-black leading-[0.92] tracking-tight text-white"
              style={{ fontSize: 'clamp(2.2rem,6vw,5rem)' }}
            >
              How We{' '}
              <span className="gradient-text">Work</span>
            </h2>
            <p className="text-slate-400 max-w-xs text-base leading-relaxed">
              An 8-step proven process — from discovery to ongoing support.
            </p>
          </div>
        </motion.div>

        {/* Vertical timeline */}
        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute left-[2.6rem] top-0 bottom-0 w-px bg-gradient-to-b from-orange-500/30 via-white/5 to-transparent hidden md:block" />

          <div className="space-y-0">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.55, delay: i * 0.07 }}
                  className="group relative flex gap-6 md:gap-10 pb-10"
                >
                  {/* Left: step node */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    {/* Icon circle — sits on the timeline line */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`relative z-10 w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg flex-shrink-0 mt-1`}
                    >
                      <Icon size={20} className="text-white" />
                    </motion.div>
                  </div>

                  {/* Right: content */}
                  <div className="flex-1 pt-1.5 pb-2">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[11px] text-slate-600 font-mono">{step.number}</span>
                      <div className="h-px flex-1 bg-white/5 group-hover:bg-orange-500/20 transition-colors" />
                    </div>

                    <h4 className="text-base md:text-lg font-bold text-white mb-1.5 group-hover:text-orange-300 transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                      {step.description}
                    </p>
                  </div>

                  {/* Ghost number — decorative */}
                  <div className="hidden lg:block absolute right-0 top-0 text-[5rem] font-black leading-none text-white/[0.025] select-none pointer-events-none group-hover:text-orange-500/5 transition-colors">
                    {step.number}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
