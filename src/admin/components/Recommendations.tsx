import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, AlertTriangle, TrendingUp, DollarSign, Users, BarChart3, FolderKanban, RefreshCw, ArrowRight } from 'lucide-react'
import { getRecommendations } from '../../api/adminApi'
import { useDashboardSocket } from '../hooks/useSocket'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

interface Recommendation {
  priority: 'high' | 'medium' | 'low'
  type: string
  message: string
  action?: string
  route?: string
}

const PRIORITY_STYLES = {
  high: { color: 'text-rose-400', bg: 'from-rose-500/10 to-rose-500/5', border: 'border-rose-500/20', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  medium: { color: 'text-amber-400', bg: 'from-amber-500/10 to-amber-500/5', border: 'border-amber-500/20', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  low: { color: 'text-cyan-400', bg: 'from-cyan-500/10 to-cyan-500/5', border: 'border-cyan-500/20', badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
}

const TYPE_ICONS: Record<string, any> = {
  inquiries: Lightbulb,
  workload: Users,
  finance: DollarSign,
  payouts: DollarSign,
  conversion: BarChart3,
  projects: FolderKanban,
  info: Lightbulb,
}

export default function Recommendations() {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [recs, setRecs] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchRecs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const res = await getRecommendations()
      setRecs(res.data?.data?.recommendations ?? [])
    } catch { /* ignore */ }
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { fetchRecs() }, [fetchRecs])
  useDashboardSocket(() => { fetchRecs(true) })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className={`rounded-xl backdrop-blur-sm border p-5 transition-colors duration-300 ${
        isDark ? 'bg-slate-900/60 border-white/[0.06]' : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-rose-500/20 border flex items-center justify-center ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
            <AlertTriangle size={16} className="text-amber-400" />
          </div>
          <div>
            <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>AI Recommendations</h3>
            <p className="text-[10px] text-slate-500">Smart actions for your business</p>
          </div>
        </div>
        <button
          onClick={() => fetchRecs(true)}
          disabled={refreshing}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 ${
            isDark ? 'bg-white/[0.04] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.08]' : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-200'
          } border`}
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-14 rounded-lg animate-pulse ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`} />
          ))}
        </div>
      ) : recs.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">All clear — no actions needed</p>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence>
            {recs.map((rec, i) => {
              const style = PRIORITY_STYLES[rec.priority] || PRIORITY_STYLES.low
              const Icon = TYPE_ICONS[rec.type] || Lightbulb
              return (
                <motion.div
                  key={rec.message}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  className={`flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r ${style.bg} border ${style.border} transition-colors duration-300`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <Icon size={15} className={style.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${style.badge}`}>{rec.priority}</span>
                    </div>
                    <p className={`text-[13px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{rec.message}</p>
                  </div>
                  {rec.route && rec.action && (
                    <button
                      onClick={() => navigate(rec.route!)}
                      className={`flex-shrink-0 flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg transition-colors ${
                        isDark ? 'text-cyan-400 hover:bg-white/[0.04]' : 'text-cyan-600 hover:bg-cyan-50'
                      }`}
                    >
                      {rec.action} <ArrowRight size={10} />
                    </button>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}
