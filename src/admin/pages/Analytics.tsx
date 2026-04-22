import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Users, DollarSign, FolderKanban, Briefcase } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  getAnalyticsOverview, getInquiryAnalytics, getVisitorAnalytics,
  getFinanceAnalytics, getProjectAnalytics, getHRAnalytics,
} from '../../api/adminApi'

const COLORS = ['#06b6d4', '#8b5cf6', '#f97316', '#10b981', '#f43f5e', '#64748b', '#eab308']

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'inquiries', label: 'Inquiries', icon: TrendingUp },
  { id: 'visitors', label: 'Visitors', icon: Users },
  { id: 'finance', label: 'Finance', icon: DollarSign },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'hr', label: 'HR', icon: Briefcase },
] as const

type Tab = typeof tabs[number]['id']

export default function Analytics() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const fetchers: Record<Tab, () => Promise<any>> = {
      overview: () => getAnalyticsOverview().then(r => r.data.data),
      inquiries: () => getInquiryAnalytics().then(r => r.data.data),
      visitors: () => getVisitorAnalytics().then(r => r.data.data),
      finance: () => getFinanceAnalytics().then(r => r.data.data),
      projects: () => getProjectAnalytics().then(r => r.data.data),
      hr: () => getHRAnalytics().then(r => r.data.data),
    }
    fetchers[activeTab]()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [activeTab])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Insights and charts across all business areas</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
              activeTab === tab.id
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      ) : !data ? (
        <div className="h-64 flex items-center justify-center text-slate-500">No data available</div>
      ) : (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {activeTab === 'overview' && <OverviewPanel data={data} />}
          {activeTab === 'inquiries' && <InquiriesPanel data={data} />}
          {activeTab === 'visitors' && <VisitorsPanel data={data} />}
          {activeTab === 'finance' && <FinancePanel data={data} />}
          {activeTab === 'projects' && <ProjectsPanel data={data} />}
          {activeTab === 'hr' && <HRPanel data={data} />}
        </motion.div>
      )}
    </div>
  )
}

/* ─── Sub-panels ─────────────────────────────────────────────────────────────── */

function ChartCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] p-5 ${className}`}>
      <h3 className="text-white font-semibold text-sm mb-4">{title}</h3>
      {children}
    </div>
  )
}

function KPICard({ label, value, color = 'cyan' }: { label: string; value: string | number; color?: string }) {
  const colors: Record<string, string> = {
    cyan: 'from-cyan-500/15 to-cyan-500/5 text-cyan-400',
    violet: 'from-violet-500/15 to-violet-500/5 text-violet-400',
    emerald: 'from-emerald-500/15 to-emerald-500/5 text-emerald-400',
    orange: 'from-orange-500/15 to-orange-500/5 text-orange-400',
  }
  return (
    <div className="rounded-xl bg-slate-900/60 border border-white/[0.06] p-4">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-xl font-bold bg-gradient-to-r ${colors[color] || colors.cyan} bg-clip-text text-transparent`}>{value}</p>
    </div>
  )
}

function OverviewPanel({ data }: { data: any }) {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Inquiries" value={data.inquiries?.total ?? 0} color="cyan" />
        <KPICard label="Total Clients" value={data.totalClients ?? 0} color="violet" />
        <KPICard label="Total Visitors" value={data.totalVisitors ?? 0} color="emerald" />
        <KPICard label="Conversion Rate" value={`${data.conversionRate ?? 0}%`} color="orange" />
      </div>
    </>
  )
}

function InquiriesPanel({ data }: { data: any }) {
  const statusData = data.byStatus ? Object.entries(data.byStatus).map(([k, v]) => ({ name: k, value: v })) : []
  const dailyData = data.dailyTrend || []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ChartCard title="Inquiries by Status">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
              {statusData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Daily Inquiry Trend">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" stroke="#475569" fontSize={11} />
            <YAxis stroke="#475569" fontSize={11} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }} />
            <Area type="monotone" dataKey="count" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

function VisitorsPanel({ data }: { data: any }) {
  const deviceData = data.byDevice ? Object.entries(data.byDevice).map(([k, v]) => ({ name: k, value: v })) : []
  const dailyData = data.dailyTrend || []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ChartCard title="Visitors by Device">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
              {deviceData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Daily Visitors">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" stroke="#475569" fontSize={11} />
            <YAxis stroke="#475569" fontSize={11} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }} />
            <Area type="monotone" dataKey="count" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

function FinancePanel({ data }: { data: any }) {
  const categoryData = data.byCategory ? Object.entries(data.byCategory).map(([k, v]) => ({ name: k, value: v })) : []
  const monthlyData = data.monthlyTrend || []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ChartCard title="Revenue by Category">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
              {categoryData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Monthly Revenue Trend">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" stroke="#475569" fontSize={11} />
            <YAxis stroke="#475569" fontSize={11} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }} />
            <Bar dataKey="income" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

function ProjectsPanel({ data }: { data: any }) {
  const statusData = data.byStatus ? Object.entries(data.byStatus).map(([k, v]) => ({ name: k, value: v })) : []

  return (
    <ChartCard title="Projects by Status">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={statusData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="name" stroke="#475569" fontSize={11} />
          <YAxis stroke="#475569" fontSize={11} />
          <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }} />
          <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

function HRPanel({ data }: { data: any }) {
  const deptData = data.byDepartment ? Object.entries(data.byDepartment).map(([k, v]) => ({ name: k, value: v })) : []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ChartCard title="Employees by Department">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={deptData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
              {deptData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
      <div className="space-y-4">
        <KPICard label="Average Salary" value={`$${(data.avgSalary ?? 0).toLocaleString()}`} color="emerald" />
        <KPICard label="Total Employees" value={deptData.reduce((s: number, d: any) => s + (d.value || 0), 0)} color="cyan" />
      </div>
    </div>
  )
}
