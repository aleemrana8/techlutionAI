import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, UserCheck, Briefcase, DollarSign,
  FolderKanban, MessageSquare, Settings, LogOut, ChevronLeft,
  ChevronRight, Shield, ExternalLink, ClipboardList,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true, perm: 'dashboard' },
  { to: '/admin/visitors', icon: Users, label: 'Visitors', perm: 'visitors' },
  { to: '/admin/clients', icon: UserCheck, label: 'Clients', perm: 'clients' },
  { to: '/admin/hr', icon: Briefcase, label: 'HR', perm: 'employees' },
  { to: '/admin/finance', icon: DollarSign, label: 'Finance', perm: 'finance' },
  { to: '/admin/projects', icon: FolderKanban, label: 'Projects', perm: 'projects' },
  { to: '/admin/leads', icon: MessageSquare, label: 'Leads', perm: 'leads' },
  { to: '/admin/logs', icon: ClipboardList, label: 'Activity Logs', perm: 'logs' },
  { to: '/admin/settings', icon: Settings, label: 'Settings', perm: 'settings' },
]

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { logout, hasPermission } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login', { replace: true })
  }

  const visibleItems = NAV_ITEMS.filter(item => hasPermission(item.perm))

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="h-screen sticky top-0 bg-slate-950/80 backdrop-blur-xl border-r border-white/[0.06] flex flex-col z-40 flex-shrink-0"
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-white/[0.06] h-16">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-cyan-400" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <span className="text-white font-bold text-sm">Techlution</span>
              <span className="text-orange-400 font-bold text-sm"> AI</span>
              <p className="text-[10px] text-slate-500 leading-none">Admin Portal</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin">
        {visibleItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-cyan-500/10 border border-cyan-500/20"
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  />
                )}
                <item.icon size={18} className="flex-shrink-0 relative z-10" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative z-10"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom controls */}
      <div className="p-3 border-t border-white/[0.06] space-y-1">
        <a
          href="/"
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/20 border border-transparent transition-all"
        >
          <ExternalLink size={18} className="flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Back to Website
              </motion.span>
            )}
          </AnimatePresence>
        </a>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all"
        >
          <LogOut size={18} className="flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <button
          onClick={() => setCollapsed(c => !c)}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-all"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  )
}
