import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Tag, CheckCircle, Loader2, Layers } from 'lucide-react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Chatbot from '../components/Chatbot'
import { getProjectById } from '../api/api'

interface WorkflowStep {
  step: number
  title: string
  description: string
}

interface Project {
  id: string
  title: string
  slug: string
  shortDescription: string
  fullDescription: string
  category: string
  features: string[]
  workflowSteps: WorkflowStep[]
  benefits: string[]
  images: string[]
  status: string
  tags: string[]
  techStack: string[]
  durationWeeks: number | null
  createdBy: { name: string }
  createdAt: string
}

const categoryColors: Record<string, string> = {
  HEALTHCARE: 'from-red-500/20 to-red-900/10',
  AI_ML: 'from-blue-500/20 to-blue-900/10',
  AUTOMATION: 'from-orange-500/20 to-orange-900/10',
  COMPUTER_VISION: 'from-purple-500/20 to-purple-900/10',
  DEVOPS_CLOUD: 'from-cyan-500/20 to-cyan-900/10',
  DATA_PIPELINES: 'from-emerald-500/20 to-emerald-900/10',
}

function categoryLabel(cat: string): string {
  return cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getProjectById(id)
      .then((res) => setProject(res.data.data))
      .catch(() => setError('Project not found'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 size={32} className="animate-spin text-orange-400" />
        </div>
      </>
    )
  }

  if (error || !project) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <p className="text-slate-400 text-lg">{error || 'Project not found'}</p>
          <Link to="/projects" className="text-orange-400 hover:text-orange-300 text-sm font-semibold flex items-center gap-1">
            <ArrowLeft size={14} /> Back to Projects
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  const gradient = categoryColors[project.category] ?? 'from-slate-500/20 to-slate-900/10'

  return (
    <>
      <Header />
      <main className="pt-24 pb-20 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 md:px-8">

          {/* Back link */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-orange-400 transition-colors mb-8">
              <ArrowLeft size={14} /> All Projects
            </Link>
          </motion.div>

          {/* Hero banner */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`rounded-2xl bg-gradient-to-br ${gradient} border border-white/5 p-8 md:p-12 mb-12`}
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-400 mb-3 block">
              {categoryLabel(project.category)}
            </span>
            <h1 className="font-black text-white leading-tight mb-4" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)' }}>
              {project.title}
            </h1>
            <p className="text-slate-300 text-base leading-relaxed max-w-3xl">
              {project.shortDescription}
            </p>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 mt-6">
              {project.status && (
                <span className="text-[11px] font-medium px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {project.status}
                </span>
              )}
              {project.durationWeeks && (
                <span className="text-[11px] font-medium px-3 py-1 rounded-full bg-white/5 text-slate-400 border border-white/8">
                  {project.durationWeeks} weeks
                </span>
              )}
            </div>
          </motion.div>

          {/* Full description */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-16"
          >
            <h2 className="text-xl font-bold text-white mb-4">About This Project</h2>
            <p className="text-slate-400 leading-relaxed whitespace-pre-line">{project.fullDescription}</p>
          </motion.section>

          {/* Features */}
          {project.features?.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mb-16"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <CheckCircle size={20} className="text-orange-400" /> Features
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.features.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5"
                  >
                    <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{f}</span>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Workflow Steps */}
          {project.workflowSteps?.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-16"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Layers size={20} className="text-orange-400" /> Workflow
              </h2>
              <div className="space-y-4">
                {project.workflowSteps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.06 }}
                    className="flex gap-4 p-4 rounded-xl bg-slate-900/50 border border-white/5"
                  >
                    <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-400 text-sm font-bold">{step.step}</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm mb-1">{step.title}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Benefits */}
          {project.benefits?.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mb-16"
            >
              <h2 className="text-xl font-bold text-white mb-6">Benefits</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.benefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{b}</span>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Tech Stack */}
          {project.techStack?.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-16"
            >
              <h2 className="text-xl font-bold text-white mb-4">Tech Stack</h2>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-slate-300 border border-white/8">
                    {tech}
                  </span>
                ))}
              </div>
            </motion.section>
          )}

          {/* Tags */}
          {project.tags?.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mb-16"
            >
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, i) => (
                  <span key={i} className="flex items-center gap-1 text-[11px] text-slate-400 bg-white/3 border border-white/5 rounded-full px-3 py-1">
                    <Tag size={10} className="text-orange-400" />
                    {tag}
                  </span>
                ))}
              </div>
            </motion.section>
          )}

          {/* Images */}
          {project.images?.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-16"
            >
              <h2 className="text-xl font-bold text-white mb-6">Gallery</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.images.map((img, i) => (
                  <img key={i} src={img} alt={`${project.title} - ${i + 1}`} className="rounded-xl border border-white/5 w-full object-cover" />
                ))}
              </div>
            </motion.section>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="text-center p-8 rounded-2xl bg-slate-900/50 border border-white/5"
          >
            <h3 className="text-lg font-bold text-white mb-2">Interested in a similar project?</h3>
            <p className="text-slate-400 text-sm mb-4">Let's discuss how we can build something great together.</p>
            <Link
              to="/contact"
              className="btn-primary inline-flex text-sm"
            >
              Start a Project <ArrowLeft size={14} className="rotate-180" />
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
      <Chatbot />
    </>
  )
}
