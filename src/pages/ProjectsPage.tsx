import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Tag, Loader2, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Chatbot from '../components/Chatbot'
import { getProjects } from '../api/api'

interface Project {
  id: string
  title: string
  slug: string
  shortDescription: string
  category: string
  features: string[]
  status: string
  tags: string[]
  techStack: string[]
  images: string[]
  createdAt: string
}

const categoryColors: Record<string, { text: string; border: string; bg: string }> = {
  HEALTHCARE:      { text: 'text-red-400',     border: 'border-red-500/20',     bg: 'bg-red-500/8' },
  AI_ML:           { text: 'text-blue-400',    border: 'border-blue-500/20',    bg: 'bg-blue-500/8' },
  AUTOMATION:      { text: 'text-orange-400',  border: 'border-orange-500/20',  bg: 'bg-orange-500/8' },
  COMPUTER_VISION: { text: 'text-purple-400',  border: 'border-purple-500/20',  bg: 'bg-purple-500/8' },
  DEVOPS_CLOUD:    { text: 'text-cyan-400',    border: 'border-cyan-500/20',    bg: 'bg-cyan-500/8' },
  DATA_PIPELINES:  { text: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/8' },
  WEB_BACKEND:     { text: 'text-amber-400',   border: 'border-amber-500/20',   bg: 'bg-amber-500/8' },
  OTHER:           { text: 'text-slate-400',   border: 'border-slate-500/20',   bg: 'bg-slate-500/8' },
}

const categories = ['All', 'HEALTHCARE', 'AI_ML', 'AUTOMATION', 'COMPUTER_VISION', 'DEVOPS_CLOUD', 'DATA_PIPELINES']

function categoryLabel(cat: string): string {
  return cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  useEffect(() => {
    const params: Record<string, string> = {}
    if (activeFilter !== 'All') params.category = activeFilter
    if (search) params.search = search

    setLoading(true)
    getProjects(params)
      .then((res) => setProjects(res.data.data ?? []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }, [activeFilter, search])

  return (
    <>
      <Header />
      <main className="pt-24 pb-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 md:px-8">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="mb-12"
          >
            <span className="flex items-center gap-3 text-orange-400 text-[11px] tracking-[0.28em] uppercase font-semibold mb-4">
              <div className="w-8 h-px bg-orange-500" />
              All Projects
            </span>
            <h1
              className="font-black leading-[0.92] tracking-tight text-white mb-8"
              style={{ fontSize: 'clamp(2.2rem,6vw,4.5rem)' }}
            >
              Our <span className="gradient-text">Projects</span>
            </h1>

            {/* Search */}
            <div className="relative max-w-md mb-6">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="w-full bg-slate-900 border border-white/8 text-white rounded-xl pl-11 pr-4 py-3 text-sm placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/15 transition-all"
              />
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`text-xs px-4 py-2 rounded-full border transition-all duration-200 font-medium ${
                    activeFilter === cat
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'border-white/10 text-slate-400 hover:border-white/25 hover:text-white'
                  }`}
                >
                  {cat === 'All' ? 'All' : categoryLabel(cat)}
                </button>
              ))}
            </div>
          </motion.div>

          <div className="h-px bg-white/5" />

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-orange-400" />
            </div>
          )}

          {/* Empty */}
          {!loading && projects.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-500 text-lg">No projects found.</p>
            </div>
          )}

          {/* List */}
          {!loading && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFilter + search}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {projects.map((project, i) => {
                  const colors = categoryColors[project.category] ?? categoryColors.OTHER
                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: i * 0.05 }}
                      onMouseEnter={() => setHoveredIdx(i)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      className="group"
                    >
                      <motion.div
                        animate={{ x: hoveredIdx === i ? 8 : 0 }}
                        transition={{ duration: 0.25 }}
                        className="py-6 flex items-start gap-5"
                      >
                        <span className="text-[11px] text-slate-600 font-mono pt-1.5 w-9 flex-shrink-0 group-hover:text-orange-500 transition-colors">
                          {String(i + 1).padStart(3, '0')}
                        </span>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <Link
                              to={`/projects/${project.slug || project.id}`}
                              className={`font-bold text-lg md:text-xl leading-tight transition-colors duration-200 hover:text-orange-400 ${
                                hoveredIdx === i ? 'text-orange-400' : 'text-white'
                              }`}
                            >
                              {project.title}
                            </Link>
                            <span className={`text-[11px] font-semibold px-3 py-1 rounded-full border flex-shrink-0 ${colors.text} ${colors.border} ${colors.bg}`}>
                              {categoryLabel(project.category)}
                            </span>
                          </div>

                          <AnimatePresence>
                            {hoveredIdx === i && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                className="overflow-hidden"
                              >
                                <p className="text-slate-400 text-sm leading-relaxed mt-2 mb-3">
                                  {project.shortDescription}
                                </p>
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {project.features?.slice(0, 6).map((f: string) => (
                                    <span
                                      key={f}
                                      className="flex items-center gap-1 text-[11px] text-slate-400 bg-white/5 border border-white/8 rounded-full px-3 py-1"
                                    >
                                      <Tag size={10} className="text-orange-400" />
                                      {f}
                                    </span>
                                  ))}
                                </div>
                                <Link
                                  to={`/projects/${project.slug || project.id}`}
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
                                >
                                  View Details <ArrowRight size={12} />
                                </Link>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                      <div className="h-px bg-white/5" />
                    </motion.div>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>
      <Footer />
      <Chatbot />
    </>
  )
}
