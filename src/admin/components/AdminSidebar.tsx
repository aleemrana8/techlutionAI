import { useState, useMemo } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, UserCheck, Briefcase, DollarSign,
  FolderKanban, MessageSquare, Settings, LogOut, ChevronLeft,
  ChevronRight, Shield, ExternalLink, BarChart3, Activity, UserCog, FileText, FileSignature,
  MessageCircle, Megaphone,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true, permission: 'dashboard' as const },
  { to: '/admin/visitors', icon: Users, label: 'Visitors', permission: 'visitors' as const },
  { to: '/admin/inquiries', icon: MessageSquare, label: 'Inquiries', permission: 'inquiries' as const },
  { to: '/admin/proposals', icon: FileSignature, label: 'Proposals', permission: 'inquiries' as const },
  { to: '/admin/members', icon: Briefcase, label: 'Members', permission: 'employees' as const },
  { to: '/admin/finance', icon: DollarSign, label: 'Finance', permission: 'finance' as const },
  { to: '/admin/projects', icon: FolderKanban, label: 'Projects', permission: 'projects' as const },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics', permission: 'analytics' as const },
  { to: '/admin/logs', icon: Activity, label: 'Activity Logs', permission: 'logs' as const },
  { to: '/admin/users', icon: UserCog, label: 'Admin Users', permission: 'adminUsers' as const },
  { to: '/admin/reports', icon: FileText, label: 'Reports', permission: 'analytics' as const },
  { to: '/admin/whatsapp', icon: MessageCircle, label: 'WhatsApp Chat', permission: 'inquiries' as const },
  { to: '/admin/whatsapp-broadcast', icon: Megaphone, label: 'Broadcast', permission: 'inquiries' as const },
  { to: '/admin/settings', icon: Settings, label: 'Settings', permission: 'settings' as const },
]

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { logout, hasPermission } = useAuth()
  const navigate = useNavigate()

  const filteredItems = useMemo(
    () => NAV_ITEMS.filter(item => hasPermission(item.permission, 'read')),
    [hasPermission]
  )

  const handleLogout = () => {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="h-screen sticky top-0 bg-slate-950/80 dark:bg-slate-950/80 bg-white/90 backdrop-blur-xl border-r border-white/[0.06] dark:border-white/[0.06] border-slate-200 flex flex-col z-40 flex-shrink-0 transition-colors duration-300"
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-white/[0.06] dark:border-white/[0.06] border-slate-200 h-16">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/10 dark:border-white/10 border-cyan-500/20 flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-cyan-400 dark:text-cyan-400 text-cyan-600" />
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
              <span className="text-white dark:text-white text-slate-900 font-bold text-sm">Techlution</span>
              <span className="text-orange-400 dark:text-orange-400 text-orange-600 font-bold text-sm"> AI</span>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 text-slate-400 leading-none">Admin Portal</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin">
        {filteredItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 dark:text-cyan-400 text-cyan-600 border border-cyan-500/20'
                  : 'text-slate-400 dark:text-slate-400 text-slate-600 hover:text-white dark:hover:text-white hover:text-slate-900 hover:bg-white/[0.04] dark:hover:bg-white/[0.04] hover:bg-slate-100 border border-transparent'
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
      <div className="p-3 border-t border-white/[0.06] dark:border-white/[0.06] border-slate-200 space-y-1">
        <a
          href="/"
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-cyan-400 dark:text-cyan-400 text-cyan-600 hover:bg-cyan-500/10 hover:border-cyan-500/20 border border-transparent transition-all"
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
