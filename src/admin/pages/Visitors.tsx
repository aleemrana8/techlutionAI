import { useState } from 'react'
import { motion } from 'framer-motion'
import { Monitor, Smartphone, Globe, Clock, Search, ArrowUpDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const mockVisitors = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  page: ['/', '/projects', '/contact', '/#services', '/#about', '/projects/1'][Math.floor(Math.random() * 6)],
  date: new Date(Date.now() - Math.random() * 7 * 86400000).toLocaleDateString(),
  time: new Date(Date.now() - Math.random() * 86400000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  device: ['Desktop', 'Mobile', 'Tablet'][Math.floor(Math.random() * 3)],
  country: ['Pakistan', 'USA', 'UK', 'UAE', 'Germany', 'Canada', 'India'][Math.floor(Math.random() * 7)],
  duration: Math.floor(Math.random() * 300 + 10) + 's',
  type: Math.random() > 0.4 ? 'New' : 'Returning',
}))

const dailyData = [
  { day: 'Mon', visits: 420 }, { day: 'Tue', visits: 580 }, { day: 'Wed', visits: 650 },
  { day: 'Thu', visits: 510 }, { day: 'Fri', visits: 720 }, { day: 'Sat', visits: 380 }, { day: 'Sun', visits: 290 },
]

const statCards = [
  { label: 'Today', value: '1,284', icon: Globe, color: 'cyan' },
  { label: 'Desktop', value: '68%', icon: Monitor, color: 'violet' },
  { label: 'Mobile', value: '28%', icon: Smartphone, color: 'orange' },
  { label: 'Avg Duration', value: '2m 34s', icon: Clock, color: 'emerald' },
]

export default function Visitors() {
  const [search, setSearch] = useState('')

  const filtered = mockVisitors.filter(v =>
    v.page.toLowerCase().includes(search.toLowerCase()) ||
    v.country.toLowerCase().includes(search.toLowerCase()) ||
    v.device.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Visitor Tracking</h1>
        <p className="text-slate-400 text-sm mt-1">Monitor website traffic and user behavior</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-${card.color}-500/15 border border-white/[0.06] flex items-center justify-center`}>
                <card.icon size={16} className={`text-${card.color}-400`} />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{card.value}</p>
                <p className="text-[11px] text-slate-500">{card.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] p-5"
      >
        <h3 className="text-white font-semibold text-sm mb-4">Daily Visits (This Week)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="day" stroke="#475569" fontSize={12} />
            <YAxis stroke="#475569" fontSize={12} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: 12 }} />
            <Bar dataKey="visits" fill="#06b6d4" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] overflow-hidden"
      >
        <div className="p-4 border-b border-white/[0.06] flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search visitors…"
              className="w-full bg-white/[0.04] border border-white/[0.06] text-white text-sm rounded-xl pl-10 pr-4 py-2 placeholder-slate-600 focus:outline-none focus:border-cyan-500/30 transition-all"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-slate-400 text-xs hover:bg-white/[0.08] transition-all">
            <ArrowUpDown size={12} /> Sort
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['#', 'Page', 'Date', 'Time', 'Device', 'Country', 'Duration', 'Type'].map(h => (
                  <th key={h} className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((v, i) => (
                <motion.tr
                  key={v.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3 text-slate-500">{v.id}</td>
                  <td className="px-4 py-3 text-cyan-400 font-mono text-xs">{v.page}</td>
                  <td className="px-4 py-3 text-slate-300">{v.date}</td>
                  <td className="px-4 py-3 text-slate-400">{v.time}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      v.device === 'Desktop' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                      v.device === 'Mobile' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                      'bg-violet-500/10 text-violet-400 border-violet-500/20'
                    }`}>
                      {v.device}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{v.country}</td>
                  <td className="px-4 py-3 text-slate-400">{v.duration}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      v.type === 'New' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {v.type}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
