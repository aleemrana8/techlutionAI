import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Info, RefreshCw, Brain } from 'lucide-react'
import { getAIInsights } from '../../api/adminApi'
import { useDashboardSocket } from '../hooks/useSocket'

interface Insight {
  text: string
  type: 'growth' | 'warning' | 'info' | 'suggestion'
}

const ICON_MAP = {
  growth: TrendingUp,
  warning: AlertTriangle,
  info: Info,
  suggestion: Lightbulb,
}

const STYLE_MAP = {
  growth: {
    icon: 'text-emerald-400',
    bg: 'from-emerald-500/10 to-emerald-500/5',
    border: 'border-emerald-500/20',
    glow: 'shadow-emerald-500/5',
  },
  warning: {
    icon: 'text-amber-400',
    bg: 'from-amber-500/10 to-amber-500/5',
    border: 'border-amber-500/20',
    glow: 'shadow-amber-500/5',
  },
  info: {
    icon: 'text-cyan-400',
    bg: 'from-cyan-500/10 to-cyan-500/5',
    border: 'border-cyan-500/20',
    glow: 'shadow-cyan-500/5',
  },
  suggestion: {
    icon: 'text-violet-400',
    bg: 'from-violet-500/10 to-violet-500/5',
    border: 'border-violet-500/20',
    glow: 'shadow-violet-500/5',
  },
}

export default function AIInsights() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchInsights = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const res = await getAIInsights()
      setInsights(res.data.data?.insights ?? [])
    } catch {
      // silently fail — insights are non-critical
    }
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { fetchInsights() }, [fetchInsights])

  // Refresh on real-time events
  useDashboardSocket(() => { fetchInsights(true) })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="rounded-xl bg-slate-900/60 dark:bg-slate-900/60 bg-white backdrop-blur-sm border border-white/[0.06] dark:border-white/[0.06] border-slate-200 p-5 transition-colors duration-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/[0.06] dark:border-white/[0.06] border-slate-200 flex items-center justify-center">
            <Brain size={16} className="text-violet-400" />
          </div>
          <div>
            <h3 className="text-white dark:text-white text-slate-900 font-semibold text-sm">AI Insights</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-500 text-slate-400">Auto-generated analytics</p>
          </div>
        </div>
        <button
          onClick={() => fetchInsights(true)}
          disabled={refreshing}
          className="w-7 h-7 rounded-lg bg-white/[0.04] dark:bg-white/[0.04] bg-slate-100 border border-white/[0.06] dark:border-white/[0.06] border-slate-200 flex items-center justify-center text-slate-400 hover:text-white dark:hover:text-white hover:text-slate-900 hover:bg-white/[0.08] dark:hover:bg-white/[0.08] hover:bg-slate-200 transition-all disabled:opacity-50"
          title="Refresh insights"
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 rounded-lg bg-white/[0.03] dark:bg-white/[0.03] bg-slate-50 animate-pulse" />
          ))}
        </div>
      ) : insights.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">No insights yet — data is still building up</p>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence>
            {insights.map((insight, i) => {
              const Icon = ICON_MAP[insight.type] || Info
              const style = STYLE_MAP[insight.type] || STYLE_MAP.info
              return (
                <motion.div
                  key={insight.text}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  className={`flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r ${style.bg} border ${style.border} shadow-md ${style.glow} transition-colors duration-300`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <Icon size={15} className={style.icon} />
                  </div>
                  <p className="text-[13px] text-slate-300 dark:text-slate-300 text-slate-700 leading-relaxed">
                    {insight.text}
                  </p>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}
