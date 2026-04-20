import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Bell, Palette, Globe, Save, Loader2, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function SettingsPage() {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 800)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your admin panel preferences</p>
      </div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <Shield size={18} className="text-cyan-400" />
          <h2 className="text-white font-semibold text-sm">Profile</h2>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold">
            {(user?.name?.[0] ?? 'A').toUpperCase()}
          </div>
          <div>
            <p className="text-white font-semibold">{user?.name ?? 'Administrator'}</p>
            <p className="text-slate-400 text-sm">Super Admin</p>
            <p className="text-slate-500 text-xs mt-0.5">Last login: {new Date().toLocaleString()}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Display Name</label>
            <input
              type="text"
              defaultValue={user?.name ?? 'Administrator'}
              className="w-full bg-white/[0.04] border border-white/[0.06] text-white text-sm rounded-xl px-4 py-2.5 placeholder-slate-600 focus:outline-none focus:border-cyan-500/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
            <input
              type="email"
              defaultValue="raleem811811@gmail.com"
              className="w-full bg-white/[0.04] border border-white/[0.06] text-white text-sm rounded-xl px-4 py-2.5 placeholder-slate-600 focus:outline-none focus:border-cyan-500/30 transition-all"
            />
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <Bell size={18} className="text-violet-400" />
          <h2 className="text-white font-semibold text-sm">Notifications</h2>
        </div>
        <div className="space-y-4">
          {[
            { label: 'New lead notifications', desc: 'Get notified when a new lead is submitted', default: true },
            { label: 'Project updates', desc: 'Notifications for project status changes', default: true },
            { label: 'Payment alerts', desc: 'Alert on incoming payments and overdue invoices', default: false },
            { label: 'Team activity', desc: 'Notify when team members come online', default: false },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm">{item.label}</p>
                <p className="text-slate-500 text-xs">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                <div className="w-10 h-5 bg-white/[0.08] rounded-full peer peer-checked:bg-cyan-500/30 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5 after:shadow-sm" />
              </label>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <Palette size={18} className="text-orange-400" />
          <h2 className="text-white font-semibold text-sm">Appearance</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Theme</label>
            <select className="w-full bg-white/[0.04] border border-white/[0.06] text-slate-300 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-500/30 transition-all cursor-pointer appearance-none">
              <option className="bg-slate-900">Dark (Default)</option>
              <option className="bg-slate-900">System</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Accent Color</label>
            <div className="flex gap-2 mt-1">
              {['#06b6d4', '#8b5cf6', '#f97316', '#10b981', '#f43f5e'].map(c => (
                <button key={c} className="w-8 h-8 rounded-lg border-2 border-transparent hover:border-white/30 transition-all" style={{ background: c }} />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Regional */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <Globe size={18} className="text-emerald-400" />
          <h2 className="text-white font-semibold text-sm">Regional</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Timezone</label>
            <select className="w-full bg-white/[0.04] border border-white/[0.06] text-slate-300 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-500/30 transition-all cursor-pointer appearance-none">
              <option className="bg-slate-900">Asia/Karachi (PKT)</option>
              <option className="bg-slate-900">UTC</option>
              <option className="bg-slate-900">America/New_York (EST)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Currency</label>
            <select className="w-full bg-white/[0.04] border border-white/[0.06] text-slate-300 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-500/30 transition-all cursor-pointer appearance-none">
              <option className="bg-slate-900">USD ($)</option>
              <option className="bg-slate-900">PKR (₨)</option>
              <option className="bg-slate-900">EUR (€)</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Save */}
      <motion.button
        onClick={handleSave}
        disabled={saving}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 disabled:opacity-60 transition-all"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
        {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Settings'}
      </motion.button>
    </div>
  )
}
