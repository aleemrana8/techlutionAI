import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, TrendingDown, CreditCard, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { getFinanceSummary, getFinanceRecords } from '../../api/adminApi'

const pieColors = ['#06b6d4', '#8b5cf6', '#f97316', '#10b981', '#64748b', '#f43f5e']

const statusColors: Record<string, string> = {
  Paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Pending: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Overdue: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  INCOME: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  EXPENSE: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
}

export default function FinanceDashboard() {
  const [summary, setSummary] = useState<any>(null)
  const [records, setRecords] = useState<any[]>([])
  useEffect(() => {
    Promise.all([
      getFinanceSummary().then(r => setSummary(r.data.data)),
      getFinanceRecords().then(r => setRecords(r.data.data || [])),
    ]).catch(() => {})
  }, [])

  const totalIncome = summary?.totalIncome ?? 0
  const totalExpenses = summary?.totalExpenses ?? 0
  const profit = summary?.profit ?? 0

  const kpis = [
    { label: 'Total Income', value: `$${totalIncome.toLocaleString()}`, change: '', up: true, icon: DollarSign, color: 'cyan' },
    { label: 'Total Expenses', value: `$${totalExpenses.toLocaleString()}`, change: '', up: true, icon: TrendingDown, color: 'rose' },
    { label: 'Net Profit', value: `$${profit.toLocaleString()}`, change: '', up: profit >= 0, icon: TrendingUp, color: 'emerald' },
    { label: 'Transactions', value: records.length.toString(), change: '', up: true, icon: CreditCard, color: 'orange' },
  ]

  // Group by category for pie chart
  const categoryMap = records.reduce((acc: Record<string, number>, r: any) => {
    const cat = r.category || 'Other'
    acc[cat] = (acc[cat] || 0) + Number(r.amount || 0)
    return acc
  }, {} as Record<string, number>)
  const pieData = Object.entries(categoryMap).map(([name, value], i) => ({ name, value, color: pieColors[i % pieColors.length] }))

  // Build chart data from records grouped by month
  const monthMap = records.reduce((acc: Record<string, { revenue: number; expenses: number }>, r: any) => {
    const d = new Date(r.date || r.createdAt)
    const key = d.toLocaleString('default', { month: 'short' })
    if (!acc[key]) acc[key] = { revenue: 0, expenses: 0 }
    if (r.type === 'INCOME') acc[key].revenue += Number(r.amount || 0)
    else acc[key].expenses += Number(r.amount || 0)
    return acc
  }, {} as Record<string, { revenue: number; expenses: number }>)
  const revenueData = Object.entries(monthMap).map(([month, vals]) => ({ month, ...vals }))
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Finance Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Revenue, expenses, and financial performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-${kpi.color}-500/15 border border-white/[0.06] flex items-center justify-center`}>
                <kpi.icon size={18} className={`text-${kpi.color}-400`} />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${kpi.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                {kpi.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {kpi.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{kpi.value}</p>
            <p className="text-xs text-slate-500 mt-1">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue vs Expenses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] p-5"
        >
          <h3 className="text-white font-semibold text-sm mb-4">Revenue vs Expenses</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" stroke="#475569" fontSize={12} />
              <YAxis stroke="#475569" fontSize={12} tickFormatter={v => '$' + v / 1000 + 'k'} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: 12 }} formatter={(v: any) => ['$' + Number(v || 0).toLocaleString()]} />
              <Area type="monotone" dataKey="revenue" stroke="#06b6d4" fill="url(#colorRev)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" stroke="#f43f5e" fill="url(#colorExp)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue by Service */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] p-5"
        >
          <h3 className="text-white font-semibold text-sm mb-4">Revenue by Service</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: 12 }} formatter={(v: any) => [v + '%']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-slate-400">{d.name}</span>
                </div>
                <span className="text-white font-medium">{d.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Invoice Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] overflow-hidden"
      >
        <div className="p-4 border-b border-white/[0.06] flex items-center gap-2">
          <FileText size={16} className="text-slate-400" />
          <h3 className="text-white font-semibold text-sm">Recent Invoices</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['#', 'Description', 'Category', 'Amount', 'Type', 'Date'].map(h => (
                  <th key={h} className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.slice(0, 10).map((rec: any, i: number) => (
                <motion.tr
                  key={rec.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + i * 0.03 }}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3 text-slate-500 text-xs">{rec.id}</td>
                  <td className="px-4 py-3 text-white">{rec.description || '-'}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{rec.category || '-'}</td>
                  <td className="px-4 py-3 text-white font-semibold">${Number(rec.amount || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border ${statusColors[rec.type] || ''}`}>
                      {rec.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{rec.date ? new Date(rec.date).toLocaleDateString() : '-'}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
