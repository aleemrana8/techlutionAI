import { useEffect, useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Users, UserCheck, FolderKanban, MessageSquare,
  DollarSign, TrendingUp, Activity, Briefcase,
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getDashboard, getDashboardTrends } from '../../api/adminApi'
import { useDashboardSocket } from '../hooks/useSocket'
import { useTheme } from '../context/ThemeContext'
import AIInsights from '../components/AIInsights'
import Recommendations from '../components/Recommendations'

/* ─── Animated Counter ─────────────────────────────────────────────────────── */

function AnimatedCounter({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<number>(0)

  useEffect(() => {
    const start = ref.current
    const diff = value - start
    const startTime = performance.now()
    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(start + diff * eased)
      setCount(current)
      if (progress < 1) requestAnimationFrame(step)
      else ref.current = value
    }
    requestAnimationFrame(step)
  }, [value, duration])

  return <>{count.toLocaleString()}</>
}

/* ─── Fallback chart data ──────────────────────────────────────────────────── */

const fallbackChartData = [
  { name: 'Jan', visitors: 0, leads: 0 },
  { name: 'Feb', visitors: 0, leads: 0 },
  { name: 'Mar', visitors: 0, leads: 0 },
  { name: 'Apr', visitors: 0, leads: 0 },
  { name: 'May', visitors: 0, leads: 0 },
  { name: 'Jun', visitors: 0, leads: 0 },
  { name: 'Jul', visitors: 0, leads: 0 },
]

const recentInquiries = [
  { name: 'Ahmed Hassan', service: 'AI & ML', time: '2 min ago', status: 'new' },
  { name: 'Sarah Johnson', service: 'Healthcare IT', time: '15 min ago', status: 'new' },
  { name: 'Li Wei', service: 'Automation', time: '1 hour ago', status: 'contacted' },
  { name: 'David Miller', service: 'DevOps', time: '3 hours ago', status: 'contacted' },
  { name: 'Fatima Ali', service: 'RCM', time: '5 hours ago', status: 'in-progress' },
]

/* ─── Dashboard Cards Config ───────────────────────────────────────────────── */

const CARDS = [
  { label: 'Total Visitors', value: 28430, icon: Users, color: 'cyan', change: '+12.5%' },
  { label: 'Total Inquiries', value: 1284, icon: MessageSquare, color: 'violet', change: '+8.3%' },
  { label: 'Active Clients', value: 64, icon: UserCheck, color: 'emerald', change: '+3.1%' },
  { label: 'Active Projects', value: 18, icon: FolderKanban, color: 'orange', change: '+5.0%' },
  { label: 'Pending Tasks', value: 42, icon: Activity, color: 'rose', change: '-2.1%' },
  { label: 'Revenue (USD)', value: 128500, icon: DollarSign, color: 'cyan', change: '+18.7%' },
  { label: 'Team Online', value: 12, icon: Briefcase, color: 'violet', change: '' },
  { label: 'Growth Rate', value: 23, icon: TrendingUp, color: 'emerald', change: '+4.2%' },
]

const colorMap: Record<string, { bg: string; text: string; glow: string }> = {
  cyan: { bg: 'from-cyan-500/15 to-cyan-500/5', text: 'text-cyan-400', glow: 'shadow-cyan-500/10' },
  violet: { bg: 'from-violet-500/15 to-violet-500/5', text: 'text-violet-400', glow: 'shadow-violet-500/10' },
  emerald: { bg: 'from-emerald-500/15 to-emerald-500/5', text: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
  orange: { bg: 'from-orange-500/15 to-orange-500/5', text: 'text-orange-400', glow: 'shadow-orange-500/10' },
  rose: { bg: 'from-rose-500/15 to-rose-500/5', text: 'text-rose-400', glow: 'shadow-rose-500/10' },
}

const statusColors: Record<string, string> = {
  new: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  contacted: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  'in-progress': 'bg-orange-500/15 text-orange-400 border-orange-500/20',
}

/* ─── Component ────────────────────────────────────────────────────────────── */

export default function Dashboard() {
  const [data, setData] = useState<any>(null)
  const [chartData, setChartData] = useState<any[]>(fallbackChartData)
  const { isDark } = useTheme()

  const fetchData = useCallback(() => {
    getDashboard()
      .then((res) => setData(res.data.data))
      .catch(err => console.error('Failed to load dashboard:', err))
    getDashboardTrends()
      .then((res) => {
        const trends = res.data.data
        if (Array.isArray(trends) && trends.length > 0) setChartData(trends)
      })
      .catch(err => console.error('Failed to load dashboard trends:', err))
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Real-time: refetch dashboard on any socket event
  useDashboardSocket(() => { fetchData() })

  const cards = data
    ? [
        { label: 'Total Visitors', value: data.visitors?.total ?? 0, icon: Users, color: 'cyan', change: '' },
        { label: 'Total Inquiries', value: data.leads?.total ?? 0, icon: MessageSquare, color: 'violet', change: '' },
        { label: 'Active Clients', value: data.clients?.active ?? 0, icon: UserCheck, color: 'emerald', change: '' },
        { label: 'Active Projects', value: data.projects?.total ?? 0, icon: FolderKanban, color: 'orange', change: '' },
        { label: 'Today Visitors', value: data.visitors?.today ?? 0, icon: Activity, color: 'rose', change: '' },
        { label: 'Revenue (USD)', value: data.finance?.income ?? 0, icon: DollarSign, color: 'cyan', change: '' },
        { label: 'Employees', value: data.employees?.total ?? 0, icon: Briefcase, color: 'violet', change: '' },
        { label: 'Profit (USD)', value: data.finance?.profit ?? 0, icon: TrendingUp, color: 'emerald', change: '' },
      ]
    : CARDS

  const leads = data?.recentLeads?.length ? data.recentLeads.map((l: any) => ({
    name: l.name, service: l.service || l.subject || '-', time: new Date(l.createdAt).toLocaleDateString(), status: (l.status || 'new').toLowerCase(),
  })) : recentInquiries
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-white dark:text-white text-slate-900">Dashboard</h1>
        <p className="text-slate-400 dark:text-slate-400 text-slate-500 text-sm mt-1">Welcome back — here's your business overview</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const c = colorMap[card.color] ?? colorMap.cyan
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`relative rounded-xl bg-slate-900/60 dark:bg-slate-900/60 bg-white backdrop-blur-sm border border-white/[0.06] dark:border-white/[0.06] border-slate-200 p-5 shadow-lg ${c.glow} overflow-hidden group transition-colors duration-300`}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br ${c.bg} blur-2xl opacity-50 group-hover:opacity-80 transition-opacity -translate-y-8 translate-x-8`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.bg} border border-white/[0.06] dark:border-white/[0.06] border-slate-200 flex items-center justify-center`}>
                    <card.icon size={18} className={c.text} />
                  </div>
                  {card.change && (
                    <span className={`text-xs font-medium ${card.change.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {card.change}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-white dark:text-white text-slate-900">
                  {card.label.includes('USD') && '$'}
                  <AnimatedCounter value={card.value} />
                  {card.label === 'Growth Rate' && '%'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 text-slate-400 mt-1">{card.label}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Visitors Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 rounded-xl bg-slate-900/60 dark:bg-slate-900/60 bg-white backdrop-blur-sm border border-white/[0.06] dark:border-white/[0.06] border-slate-200 p-5 transition-colors duration-300"
        >
          <h3 className="text-white dark:text-white text-slate-900 font-semibold text-sm mb-4">Visitor & Inquiry Trends</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'} />
              <XAxis dataKey="name" stroke={isDark ? '#475569' : '#94a3b8'} fontSize={12} />
              <YAxis stroke={isDark ? '#475569' : '#94a3b8'} fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: isDark ? '#0f172a' : '#ffffff',
                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '12px',
                  fontSize: 12,
                  color: isDark ? '#e2e8f0' : '#1e293b',
                }}
                labelStyle={{ color: isDark ? '#e2e8f0' : '#1e293b' }}
              />
              <Area type="monotone" dataKey="visitors" stroke="#06b6d4" fill="url(#colorVisitors)" strokeWidth={2} />
              <Area type="monotone" dataKey="leads" stroke="#8b5cf6" fill="url(#colorLeads)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* AI Insights */}
        <AIInsights />

        {/* AI Recommendations */}
        <Recommendations />

        {/* Recent Leads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl bg-slate-900/60 dark:bg-slate-900/60 bg-white backdrop-blur-sm border border-white/[0.06] dark:border-white/[0.06] border-slate-200 p-5 transition-colors duration-300"
        >
          <h3 className="text-white dark:text-white text-slate-900 font-semibold text-sm mb-4">Recent Inquiries</h3>
          <div className="space-y-3">
            {leads.map((lead: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] dark:hover:bg-white/[0.03] hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center text-white dark:text-white text-cyan-700 text-xs font-bold flex-shrink-0">
                  {lead.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white dark:text-white text-slate-900 font-medium truncate">{lead.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-500 text-slate-400">{lead.service} • {lead.time}</p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusColors[lead.status]}`}>
                  {lead.status}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
